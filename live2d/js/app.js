import { log }                                                        from './logger.js';
import { DOM, state }                                                 from './config.js';
import { initKeyboardShortcuts, initContextMenu }                     from './context.js';
import { loadModel, deleteSelectedModel, setSelectedModel }           from './model.js';
import { registerHitAreaPopulator, updateSelectionOutline, updateUI } from './ui.js';
import {
  simulateTapOnHitArea,
  toggleHitAreaVisibility,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleStageTap,
  handleCanvasZoom,
  handleModelLabelScroll,
} from './interaction.js';

// ===========================================================================
// Initialization
// ===========================================================================

const setupStageEvents = () => {
  state.app.stage.interactive = true;
  state.app.stage.hitArea     = state.app.screen;

  state.app.stage.on('pointerdown',      handlePointerDown);
  state.app.stage.on('pointermove',      handlePointerMove);
  state.app.stage.on('pointerup',        handlePointerUp);
  state.app.stage.on('pointerupoutside', handlePointerUp);
  state.app.stage.on('pointertap',       handleStageTap);

  DOM.canvas.addEventListener('wheel', handleCanvasZoom, { passive: false });
};

const initDropdown = () => {
  const { dropdown, dropdownLabel, dropdownList, dropdownValue } = DOM;
  if (!dropdown) return;

  const toggle = (forceOpen) => {
    const open = forceOpen ?? !dropdown.classList.contains('open');
    dropdown.setAttribute('aria-expanded', String(open));
    dropdown.classList.toggle('open', open);
  };

  dropdown.addEventListener('click', () => toggle());
  dropdown.addEventListener('keydown', (event) => event.key === 'Escape' && toggle(false));

  dropdownList.querySelectorAll('.dropdown-option').forEach((option) => {
    option.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdownLabel.textContent = option.textContent.trim();
      dropdownValue.value       = option.dataset.value ?? '';
      toggle(false);
    });
  });

  // Clicking outside closes the dropdown.
  document.addEventListener('click', (event) => !dropdown.contains(event.target) && toggle(false));
};

const setupUIEvents = () => {
  DOM.loadSelectedBtn.addEventListener('click', () => loadModel(DOM.dropdownValue.value));
  DOM.loadUrlBtn.addEventListener('click', () => loadModel(DOM.modelUrlInput.value.trim()));

  DOM.modelUrlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') loadModel(DOM.modelUrlInput.value.trim());
  });

  DOM.hitareasToggle.addEventListener('change', toggleHitAreaVisibility);
  DOM.deleteModelBtn.addEventListener('click', deleteSelectedModel);

  // Click on filename label copies it to the clipboard.
  DOM.modelLabel.addEventListener('click', () => {
    const text = DOM.modelLabel.textContent?.replace('File: ', '');
    if (text) navigator.clipboard.writeText(text);
  });

  DOM.modelLabel.addEventListener('wheel', handleModelLabelScroll, { passive: false });
};

const initSelectionOutline = () => {
  state.selectionOutline         = new PIXI.Graphics();
  state.selectionOutline.visible = false;
  state.app.stage.addChild(state.selectionOutline);
};

// Called every frame by the PIXI ticker.
const onTick = () => {
  if (state.selectedModel && state.selectionOutline.visible) {
    updateSelectionOutline(state.selectedModel);
    // Keep the outline on top of all models.
    state.app.stage.setChildIndex(
      state.selectionOutline,
      state.app.stage.children.length - 1,
    );
  }
};

// If a ?model= query parameter is present, load it immediately and clean up the URL.
const handleURLParams = () => {
  const params   = new URLSearchParams(window.location.search);
  const modelURL = params.get('model');

  if (modelURL) {
    log('SYSTEM', `Found 'model' URL parameter: ${modelURL}`);
    DOM.modelUrlInput.value = modelURL;
    loadModel(modelURL);
    window.history.replaceState({}, '', window.location.pathname);
  }
};

const printBanner = () => {
  const ascii = `
            ☆・゜・。。・゜゜・。。・゜★
★·.\`¯\`·.·★ L I V E 2 D   V I E W E R ★·.\`¯\`·.·★
             ★・。。・゜゜・。。・゜・☆

           ⭐ GH:   github.com/ImDuck42
           📨 Mail: imduck420@gmail.com
           💬 DC:   @hu7ao

★·.\`¯\`·.·★ ══════ Version 5.0 ══════ ★·.\`¯\`·.·★
`;
  console.log(
    '%c' + ascii,
    'font-family:Courier New,monospace;font-size:12px;line-height:1.4;font-weight:bold;' +
    'background:linear-gradient(135deg,#8c5eff,#ff67d7);-webkit-background-clip:text;' +
    '-webkit-text-fill-color:transparent;',
  );
};

const initApp = () => {
  if (!DOM.canvas) {
    log('ERROR', 'Fatal: canvas element not found.');
    window.__SL_L2D_FAIL = true;
    window.__SL_L2D_READY = false;
    return;
  }

  try {
    // 巳泷 v9.0.3：WebGL 可用性预检（真机 WebView 可能禁用 WebGL2/WebGL）
    let glTest = null;
    try { glTest = DOM.canvas.getContext('webgl') || DOM.canvas.getContext('experimental-webgl'); } catch (e) { glTest = null; }
    if (!glTest) {
      throw new Error('WebGL unavailable in this WebView');
    }

    state.app = new PIXI.Application({
      view:            DOM.canvas,
      resizeTo:        DOM.canvas.parentElement,
      backgroundColor: 0x1a1a2e,
      antialias:       true,
      autoStart:       true,
      resolution:      1,
      autoDensity:     true,
      // 巳泷 v9.0.3：尝试验证渲染器已就绪
    });
  } catch (error) {
    log('ERROR', 'Fatal: Failed to create PIXI Application.', error);
    window.__SL_L2D_FAIL = true;
    window.__SL_L2D_READY = false;
    try {
      window.SL_L2D_TOAST && window.SL_L2D_TOAST('3D 图形引擎初始化失败：' + (error.message || '').slice(0, 60));
    } catch (e) {}
    return;
  }

  window.__SL_L2D_READY = true;
  window.__SL_L2D_FAIL = false;
  // 巳泷 v9.1.0：置位就绪标记，触发首页模型库自动加载
  try { window.__L2D_READY_FLAG = true; } catch (e) {}
  // 巳泷 v9.6.4：引擎就绪前缓存的待载模型只消费一次；默认自动加载由 index 的 __sl_l2d_started 守卫保证不重复。
  try {
    if (window.__sl_l2d_pending) {
      const p = window.__sl_l2d_pending;
      window.__sl_l2d_pending = null;
      setTimeout(() => loadModel(p), 60);
    }
  } catch (e) {}

  registerHitAreaPopulator(simulateTapOnHitArea);
  initSelectionOutline();
  state.app.ticker.add(onTick);
  log('SYSTEM', 'Live2D Viewer Initialized.');

  setupUIEvents();
  setupStageEvents();
  initDropdown();
  initKeyboardShortcuts();
  initContextMenu();
  handleURLParams();
  updateUI();
};

printBanner();

// 巳泷 v9.0.3：立即初始化（bundle 为经典脚本，DOM 已就绪），并对 DOMContentLoaded 双保险
const __sl_l2d_boot = () => {
  try { initApp(); } catch (e) {
    log('ERROR', 'initApp failed async', e);
    window.__SL_L2D_FAIL = true;
    window.__SL_L2D_READY = false;
  }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __sl_l2d_boot);
  // 极端兜底：等待 DOM，2s 内强制初始化
  if (typeof document.readyState === 'string' && document.readyState === 'loading') {
    setTimeout(() => {
      if (document.readyState !== 'loading' && !window.__SL_L2D_READY && !window.__SL_L2D_FAIL) {
        __sl_l2d_boot();
      }
    }, 800);
  }
} else {
  __sl_l2d_boot();
}