/* ==========================================================================
 * 巳泷 Live2D · 渲染内核调度（经典脚本，兼容 file://）
 * --------------------------------------------------------------------------
 * 三种模式：
 *   recommend  推荐：pixi-live2d-display 全量内核（Cubism 2/3/4/5）
 *   starred    星标最高：stevenjoezhang/live2d-widget v0.9.2 轻量内核（仅 Cubism 2）
 *   auto       自动：按模型 JSON 版本选择内核，切换时保留待加载模型
 *
 * 第三方文件来源（已离线放入 live2d/widget）：
 *   https://github.com/stevenjoezhang/live2d-widget
 *   https://raw.githubusercontent.com/stevenjoezhang/live2d-widget/v0.9.2/live2d.min.js
 *   https://raw.githubusercontent.com/stevenjoezhang/live2d-widget/v0.9.2/waifu-tips.js
 * ========================================================================== */
(function () {
  'use strict';

  var MODE_KEY       = 'sl_l2d_engine';
  var AUTO_ENGINE_KEY = 'sl_l2d_auto_engine';
  var PENDING_KEY    = 'sl_l2d_pending_src';
  var NOTICE_KEY     = 'sl_l2d_notice';
  var FALLBACK_KEY   = 'sl_l2d_kernel_fallback';
  var MAX_PENDING    = 3000000; // sessionStorage 安全上限（约 3MB）

  var MODE_LABEL = { recommend: '推荐', starred: '星标最高', auto: '自动' };
  var ENGINE_LABEL = { recommend: '推荐', starred: '星标最高' };

  function readMode() {
    try {
      var value = localStorage.getItem(MODE_KEY);
      if (value === 'starred' || value === 'auto') return value;
    } catch (e) {}
    return 'recommend';
  }

  function readAutoEngine() {
    try {
      if (sessionStorage.getItem(AUTO_ENGINE_KEY) === 'starred') return 'starred';
    } catch (e) {}
    return 'recommend';
  }

  var mode = readMode();
  var engine = mode === 'auto' ? readAutoEngine() : mode;
  var noticeShown = false;
  var warnedFallback = false;

  function toast(message) {
    if (!message) return;
    try {
      if (typeof window.SL_L2D_TOAST === 'function') { window.SL_L2D_TOAST(message); return; }
    } catch (e) {}
    try {
      if (typeof window.L2DToast === 'function') { window.L2DToast(message); return; }
    } catch (e) {}
    try {
      var el = document.getElementById('toast');
      if (!el) return;
      el.textContent = message;
      el.style.display = 'block';
      clearTimeout(el._slEngineTimer);
      el._slEngineTimer = setTimeout(function () { el.style.display = 'none'; }, 2600);
    } catch (e) {}
  }

  function removeSession(key) {
    try { sessionStorage.removeItem(key); } catch (e) {}
  }

  function storePending(source) {
    if (!source || typeof source !== 'string') return null;
    if (source.indexOf('blob:') === 0) return { ok: false, reason: 'blob' };
    if (source.length > MAX_PENDING) return { ok: false, reason: 'large' };
    try {
      sessionStorage.setItem(PENDING_KEY, source);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: 'storage' };
    }
  }

  /* ------------------------------------------------------------------------
   * 模型版本识别
   * ------------------------------------------------------------------------ */

  function typeFromJson(json) {
    if (!json || typeof json !== 'object') return 'unknown';
    if (json.model || json.moc) return 'cubism2';
    if (Array.isArray(json.textures) && !json.FileReferences) return 'cubism2';
    if (json.FileReferences || json.Version === 3) return 'cubism345';
    return 'unknown';
  }

  function decodeBase64(base64) {
    var binary = atob(String(base64).replace(/\s+/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function bytesToText(bytes) {
    try {
      if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8').decode(bytes);
      }
    } catch (e) {}
    var text = '';
    for (var i = 0; i < bytes.length; i += 1) text += String.fromCharCode(bytes[i]);
    return text;
  }

  function bytesFromDataUrl(source) {
    var comma = source.indexOf(',');
    if (comma < 0) throw new Error('bad data url');
    var meta = source.slice(0, comma);
    var body = source.slice(comma + 1);
    if (meta.indexOf(';base64') >= 0) return decodeBase64(body);
    var text = decodeURIComponent(body);
    var bytes = new Uint8Array(text.length);
    for (var i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i);
    return bytes;
  }

  function parseJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function findModelEntry(zip) {
    var best = null;
    zip.forEach(function (path, entry) {
      if (entry.dir) return;
      if (!/model3?[-\w]*\.json$/i.test(path)) return;
      if (!best || /model3\.json$/i.test(path)) best = entry;
    });
    return best;
  }

  function detectFromZip(buffer) {
    if (typeof JSZip === 'undefined') return Promise.resolve('unknown');
    return JSZip.loadAsync(buffer).then(function (zip) {
      var entry = findModelEntry(zip);
      if (!entry) return 'unknown';
      return entry.async('text').then(function (text) {
        return typeFromJson(parseJson(text));
      });
    }).catch(function () { return 'unknown'; });
  }

  function detectType(source) {
    if (!source || typeof source !== 'string') return Promise.resolve('unknown');

    if (source.indexOf('data:application/json;base64,') === 0) {
      try {
        var jsonB64 = parseJson(bytesToText(decodeBase64(source.slice(source.indexOf(',') + 1))));
        return Promise.resolve(typeFromJson(jsonB64));
      } catch (e) { return Promise.resolve('unknown'); }
    }

    if (source.indexOf('data:application/json,') === 0) {
      try {
        var jsonPlain = parseJson(decodeURIComponent(source.slice(source.indexOf(',') + 1)));
        return Promise.resolve(typeFromJson(jsonPlain));
      } catch (e) { return Promise.resolve('unknown'); }
    }

    if (source.indexOf('data:,') === 0) {
      try {
        var jsonEncoded = parseJson(decodeURIComponent(source.slice(6)));
        return Promise.resolve(typeFromJson(jsonEncoded));
      } catch (e) { return Promise.resolve('unknown'); }
    }

    if (source.indexOf('data:application/zip') === 0) {
      try { return detectFromZip(bytesFromDataUrl(source).buffer); }
      catch (e) { return Promise.resolve('unknown'); }
    }

    if (/\.(zip|lpk|wpk)(?:[?#].*)?$/i.test(source)) {
      return fetch(source).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.arrayBuffer();
      }).then(detectFromZip).catch(function () { return 'unknown'; });
    }

    if (/\.json(?:[?#].*)?$/i.test(source)) {
      if (/model3[-\w]*\.json/i.test(source)) return Promise.resolve('cubism345');
      return fetch(source).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      }).then(function (text) {
        var type = typeFromJson(parseJson(text));
        if (type !== 'unknown') return type;
        return /model\.json/i.test(source) ? 'cubism2' : 'unknown';
      }).catch(function () {
        return /model\.json/i.test(source) ? 'cubism2' : 'unknown';
      });
    }

    return Promise.resolve('unknown');
  }

  /* ------------------------------------------------------------------------
   * 内核切换（跨页面重载，保证两套内核互不污染）
   * ------------------------------------------------------------------------ */

  function reloadWith(target, source, notice, keepAuto) {
    var pending = source ? storePending(source) : null;
    if (pending && !pending.ok) return false; // 调用方改走“切换后重新导入”的提示

    try {
      if (keepAuto) {
        sessionStorage.setItem(AUTO_ENGINE_KEY, target);
      } else {
        localStorage.setItem(MODE_KEY, target);
        sessionStorage.removeItem(AUTO_ENGINE_KEY);
      }
      if (notice) sessionStorage.setItem(NOTICE_KEY, notice);
      location.reload();
      return true;
    } catch (e) {
      toast('切换内核失败：' + (e && e.message ? e.message : e));
      return false;
    }
  }

  /* 自动模式：推荐内核里检测到 Cubism2 → 切换到星标内核 */
  function autoIntercept(source) {
    if (mode !== 'auto' || engine !== 'recommend') return Promise.resolve(false);

    return detectType(source).then(function (type) {
      if (type === 'cubism2') {
        if (source.indexOf('blob:') !== 0 && source.length <= MAX_PENDING
            && reloadWith('starred', source, '', true)) {
          return true;
        }
        toast('自动识别为 Cubism2，但模型内容过大，已使用推荐内核渲染（同样支持 Cubism2）');
        return false;
      }
      if (type === 'unknown' && !warnedFallback) {
        warnedFallback = true;
        toast('自动识别失败，已回退「推荐」内核');
      }
      return false;
    }).catch(function () {
      if (!warnedFallback) {
        warnedFallback = true;
        toast('自动识别失败，已回退「推荐」内核');
      }
      return false;
    });
  }

  /* ------------------------------------------------------------------------
   * 星标内核遇到 Cubism3/4/5：提示 + 一键切换
   * ------------------------------------------------------------------------ */

  function showUnsupported(source, kind) {
    if (mode === 'auto' && kind !== 'unknown') {
      return reloadWith('recommend', source, '自动识别为 Cubism3/4/5，已切换到「推荐」内核', true);
    }
    if (mode === 'auto' && kind === 'unknown') {
      return reloadWith('recommend', source, '自动识别失败，已回退「推荐」内核', true);
    }

    var modal = document.getElementById('sl-kernel-warn');
    if (!modal) {
      toast('「星标最高」内核仅支持 Cubism2，请切换到「推荐」内核');
      return false;
    }
    var text = document.getElementById('sl-kwarn-text');
    if (text) {
      text.textContent = kind === 'unknown'
        ? '无法识别当前模型版本。「星标最高」内核仅支持 Cubism2（model.json），请切换到「推荐」内核后重新导入。'
        : '当前模型是 Cubism3/4/5（model3.json / moc3）。「星标最高」内核仅支持 Cubism2（model.json），请切换到「推荐」内核。';
    }
    try { modal.hidden = false; } catch (e) {}

    var switchBtn = document.getElementById('sl-kwarn-switch');
    if (switchBtn) {
      switchBtn.onclick = function () {
        modal.hidden = true;
        var carry = source && source.indexOf('blob:') !== 0 && source.length <= MAX_PENDING;
        reloadWith('recommend', carry ? source : null,
          carry ? '' : '已切换到「推荐」内核，请重新导入刚才的模型', false);
      };
    }
    var cancelBtn = document.getElementById('sl-kwarn-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = function () { modal.hidden = true; };
    }
    return false;
  }

  /* ------------------------------------------------------------------------
   * 内核 UI
   * ------------------------------------------------------------------------ */

  function updateEngineBar() {
    var bar = document.getElementById('sl-engine-bar');
    if (!bar) return;
    bar.querySelectorAll('[data-engine]').forEach(function (button) {
      var target = button.getAttribute('data-engine');
      button.classList.toggle('on', target === mode);
      button.setAttribute('aria-pressed', target === mode ? 'true' : 'false');
    });
    var note = document.getElementById('sl-engine-note');
    if (note) {
      if (mode === 'recommend') note.textContent = '全量内核 · Cubism 2/3/4/5 · 上传即玩';
      else if (mode === 'starred') note.textContent = '轻量内核 · 仅 Cubism 2';
      else note.textContent = '自动识别 · 当前：' + (engine === 'starred' ? '星标最高' : '推荐');
    }
  }

  function initEngineBar() {
    var bar = document.getElementById('sl-engine-bar');
    if (!bar) return;
    bar.querySelectorAll('[data-engine]').forEach(function (button) {
      button.onclick = function () {
        var target = button.getAttribute('data-engine');
        if (!target || target === mode) return;
        try { localStorage.setItem(MODE_KEY, target); } catch (e) {}
        removeSession(AUTO_ENGINE_KEY);
        location.reload();
      };
    });
    updateEngineBar();
  }

  function showPendingNotice() {
    if (noticeShown) return;
    noticeShown = true;
    try {
      var notice = sessionStorage.getItem(NOTICE_KEY);
      if (notice) {
        sessionStorage.removeItem(NOTICE_KEY);
        setTimeout(function () { toast(notice); }, 500);
      }
    } catch (e) {}
  }

  /* ------------------------------------------------------------------------
   * 脚本装载
   * ------------------------------------------------------------------------ */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('加载失败：' + src)); };
      document.head.appendChild(script);
    });
  }

  function loadModule(src) {
    try {
      var script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onerror = function () {
        console.warn('[巳泷] 模块加载失败（file:// 可能禁用 ES Module）：' + src);
      };
      document.head.appendChild(script);
    } catch (e) {}
  }

  function kernelLoadFailed(error) {
    console.error('[巳泷] 渲染内核加载失败：', error);
    var already = false;
    try { already = sessionStorage.getItem(FALLBACK_KEY) === '1'; } catch (e) {}
    if (engine === 'starred' && !already) {
      try {
        sessionStorage.setItem(FALLBACK_KEY, '1');
        localStorage.setItem(MODE_KEY, 'recommend');
        sessionStorage.removeItem(AUTO_ENGINE_KEY);
        sessionStorage.setItem(NOTICE_KEY, '星标内核加载失败，已自动切回「推荐」内核');
      } catch (e) {}
      setTimeout(function () { location.reload(); }, 300);
      return;
    }
    toast('渲染内核加载失败：' + (error && error.message ? error.message : error));
  }

  function bootScripts() {
    var classics = ['js/exclusions.js'];
    var modules = [];

    if (engine === 'starred') {
      classics.push('libs/jszip.min.js', 'widget/live2d.min.js', 'js/widget-kernel.js');
      modules.push('js/repoexplorer.js', 'js/newsmodal.js');
    } else {
      classics.push(
        'libs/pixi.min.js',
        'libs/live2dcubismcore-official.min.js',
        'libs/live2d.min.js',
        'libs/pixi-live2d-display.min.js',
        'libs/jszip.min.js',
        'libs/extra.js'
      );
      modules.push('js/app.js', 'js/repoexplorer.js', 'js/newsmodal.js');
    }

    var chain = Promise.resolve();
    classics.forEach(function (src) {
      chain = chain.then(function () { return loadScript(src); });
    });
    chain.then(function () {
      try { sessionStorage.removeItem(FALLBACK_KEY); } catch (e) {}
      modules.forEach(loadModule);
    }).catch(kernelLoadFailed);
  }

  /* ------------------------------------------------------------------------
   * 对外接口
   * ------------------------------------------------------------------------ */

  window.SL_L2D = {
    mode: mode,
    engine: engine,
    modeLabel: MODE_LABEL[mode],
    engineLabel: ENGINE_LABEL[engine],
    typeFromJson: typeFromJson,
    detectType: detectType,
    autoIntercept: autoIntercept,
    showUnsupported: showUnsupported,
    reloadWith: reloadWith,
    toast: toast,
    updateBar: updateEngineBar
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initEngineBar();
      showPendingNotice();
    });
  } else {
    initEngineBar();
    showPendingNotice();
  }

  bootScripts();
})();
