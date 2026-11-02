import { log }                          from './logger.js';
import { processZipFile }               from './importzip.js';
import { CONFIG, DOM, state }           from './config.js';
import { updateUI, updateLoadingState } from './ui.js';

// ===========================================================================
// Model selection & ordering
// ===========================================================================

// Moves a model to the top of the PIXI stage and to the end of state.models.
export const bringModelToFront = (model) => {
  if (!model || !state.app?.stage) return;

  const stage = state.app.stage;
  stage.setChildIndex(model, stage.children.length - 1);

  if (state.selectionOutline) {
    stage.setChildIndex(state.selectionOutline, stage.children.length - 1);
  }

  const idx = state.models.indexOf(model);
  if (idx > -1) {
    state.models.splice(idx, 1);
    state.models.push(model);
  }
};

export const setSelectedModel = (model) => {
  // Detach the hit-area overlay from the previously selected model.
  state.hitAreaFrames?.parent?.removeChild(state.hitAreaFrames);
  state.selectedModel = model;

  if (model) {
    log('MODEL', `Selected model ID: ${model.appModelId}`);

    if (PIXI.live2d.HitAreaFrames) {
      if (!state.hitAreaFrames || state.hitAreaFrames.destroyed) {
        state.hitAreaFrames = new PIXI.live2d.HitAreaFrames();
      }
      try {
        model.addChild(state.hitAreaFrames);
      } catch {
        log('WARN', 'Failed to reuse hitAreaFrames; creating new instance.');
        state.hitAreaFrames = new PIXI.live2d.HitAreaFrames();
        model.addChild(state.hitAreaFrames);
      }
      state.hitAreaFrames.visible = DOM.hitareasToggle.checked;
    }

    bringModelToFront(model);
    state.selectionOutline.visible = true;
  } else {
    log('MODEL', 'Deselected all models.');
    state.selectionOutline.visible = false;
  }

  updateUI();
};

export const deleteSelectedModel = () => {
  if (!state.selectedModel) return;

  const target = state.selectedModel;
  const idx    = state.models.findIndex((model) => model.appModelId === target.appModelId);
  if (idx > -1) state.models.splice(idx, 1);

  if (target.parent) {
    if (state.hitAreaFrames?.parent === target) target.removeChild(state.hitAreaFrames);
    target.parent.removeChild(target);
  }

  // Only destroy textures not shared with another loaded model.
  const hasSharedTexture = state.models.some((model) =>
    model.textures.some((tex) => target.textures.includes(tex))
  );

  target.destroy({ children: true, texture: !hasSharedTexture, baseTexture: !hasSharedTexture });
  log('MODEL', `Model ${target.appModelId} deleted. Texture destroyed: ${!hasSharedTexture}`);

  setSelectedModel(state.models.at(-1) ?? null);
};

// ===========================================================================
// Model fitting
// ===========================================================================

// Scales and centers a newly loaded model to fill CONFIG.MODEL_FIT_PADDING of the canvas.
const fitModelToView = (model) => {
  if (!model || !state.app?.renderer) return;

  const dpr    = window.devicePixelRatio || 1;
  const view   = state.app.renderer.view;
  const screen = state.app.screen || state.app.renderer.screen;
  const viewW  = (screen && screen.width)  || (view.width  / dpr);
  const viewH  = (screen && screen.height) || (view.height / dpr);

  model.updateTransform();
  const modelW = model.width  / model.scale.x;
  const modelH = model.height / model.scale.y;

  if (modelW > 0 && modelH > 0) {
    const scale = Math.min(
      (viewW * CONFIG.MODEL_FIT_PADDING) / modelW,
      (viewH * CONFIG.MODEL_FIT_PADDING) / modelH,
    );
    model.scale.set(scale);
  } else {
    log('WARN', 'fitModelToView: Invalid model dimensions; using default scale.');
    model.scale.set(0.1);
  }

  model.anchor.set(0.5, 0.5);
  model.position.set(viewW / 2, viewH / 2);
  log('MODEL', `Fitted model ${model.appModelId} to view.`);
};

// ===========================================================================
// Model loading
// ===========================================================================

export const loadModel = async (source) => {
  if (!state.app?.stage) {
    log('ERROR', 'PIXI Application not ready.');
    // 巳泷 v9.0.3：不再弹原生 alert，改为页面内友好提示
    try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型引擎初始化中，请稍候再试…'); } catch (e) {}
    return;
  }

  if (!source) return;

  // 巳泷 v9.0.3：中文/日文/全角模型路径必须编码（本地服务器已做 URLDecoder，不编码会 404 → 纹理/模型加载失败 → 只剩阴影）
  try {
    if (!source.startsWith('data:') && !source.startsWith('blob:')
        && !/^[\x00-\x7F]*$/.test(source)) {
      const encoded = source.replace(/[^\x00-\x7F]/g, (ch) => encodeURIComponent(ch));
      if (encoded !== source) {
        log('MODEL', `URL 已自动编码：${source} → ${encoded}`);
        source = encoded;
      }
    }
  } catch (e) { log('WARN', 'URL 编码处理失败', e); }

  // 巳泷 v9.8：自动内核识别 —— Cubism2 模型自动切到「星标最高」轻量内核。
  try {
    if (window.SL_L2D && typeof window.SL_L2D.autoIntercept === 'function') {
      const switched = await window.SL_L2D.autoIntercept(source);
      if (switched) return;
    }
  } catch (e) {
    log('WARN', '自动内核识别失败', e);
  }

  // Handle ZIP files by extracting and converting assets to data URIs.
  if (source.endsWith('.zip')) {
    const zipName = source.split('/').pop();
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const buffer   = await response.arrayBuffer();
      const modelUrl = await processZipFile(buffer);

      if (!modelUrl) throw new Error('Failed to parse ZIP file.');
      await loadModel(modelUrl);
    } catch (error) {
      log('ERROR', `Error loading ZIP from ${source}:`, error);
      try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('ZIP 解析失败：' + (error.message ?? error)); } catch (e) {}
      updateLoadingState(false);
    }
    return;
  }

  // 巳泷 v9.2.1：原生桥回传的内置演示模型（data:application/zip;base64,……）也走 ZIP 解包流程
  if (source.startsWith('data:application/zip')) {
    try {
      const comma = source.indexOf(',');
      if (comma < 0) throw new Error('bad data url');
      const b64 = source.slice(comma + 1);
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let bi = 0; bi < bin.length; bi++) bytes[bi] = bin.charCodeAt(bi);
      const modelUrl = await processZipFile(bytes.buffer);
      if (!modelUrl) throw new Error('Failed to parse ZIP data.');
      await loadModel(modelUrl);
    } catch (error) {
      log('ERROR', `Error loading ZIP data:`, error);
      try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('内置模型解析失败：' + (error.message ?? error)); } catch (e) {}
      updateLoadingState(false);
    }
    return;
  }

  const modelName = source.startsWith('data:') ? 'model' : source.split('/').pop();
  log('MODEL', `Loading model from: ${source}`);
  updateLoadingState(true, `Loading ${modelName}…`);
  let newModel = null;

  try {
    newModel = await PIXI.live2d.Live2DModel.from(source);

    newModel.appModelId = state.modelIdCounter++;
    state.app.stage.addChild(newModel);
    state.models.push(newModel);

    // Brief delay lets PIXI finish layout before reading dimensions for fitting.
    await new Promise((resolve) => setTimeout(resolve, 125));

    fitModelToView(newModel);
    newModel.cursor = 'grab';
    setSelectedModel(newModel);
    try { window.__SL_L2D_STATE = state; } catch (e) {}

    log('MODEL', `Model loaded: ${newModel.internalModel?.settings?.name ?? `Model ${newModel.appModelId}`}`, newModel);
  } catch (error) {
    log('ERROR', `Error loading model from ${source}:`, error);
    try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型加载失败：' + (error.message ?? error)); } catch (e) {}

    if (newModel) {
      newModel.parent?.removeChild(newModel);
      const idx = state.models.findIndex((model) => model.appModelId === newModel.appModelId);
      if (idx > -1) state.models.splice(idx, 1);
      newModel.destroy({ children: true, texture: false, baseTexture: false });
    }

    if (state.selectedModel === newModel) {
      setSelectedModel(state.models.at(-1) ?? null);
    }
  } finally {
    updateLoadingState(false);
  }
};

// Expose globally so non-module scripts can call it.
window.loadLive2DModel = loadModel;