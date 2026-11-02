/* ==========================================================================
 * 巳泷 Live2D · 「星标最高」轻量内核适配器（仅 Cubism 2）
 * --------------------------------------------------------------------------
 * 渲染内核：stevenjoezhang/live2d-widget v0.9.2 的 live2d.min.js
 *   https://github.com/stevenjoezhang/live2d-widget
 * 该 SDK 只暴露 window.loadlive2d(canvasId, modelJsonUrl, scale)。
 * 本适配器负责：
 *   1. 离线解析 ZIP / LPK / WPK，把引用资源内联成 data URI；
 *   2. 把模型 JSON 编码成 data:,……（无 MIME，避免 SDK 误判模型目录）；
 *   3. Cubism3/4/5 拦截提示与一键切换推荐内核；
 *   4. 以 CSS transform 实现拖动 / 滚轮缩放，保留全屏等既有 UI。
 * ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('live2d-canvas');
  if (!canvas) return;

  var SL = window.SL_L2D || {};
  var MODE = SL.mode || 'starred';
  var ENGINE = 'starred';
  var currentJsonUrl = null;
  var currentLabel = '';
  var loading = false;

  var panX = 0;
  var panY = 0;
  var zoom = 1;

  var MIME_TYPES = {
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    moc: 'application/octet-stream',
    moc3: 'application/octet-stream',
    mtn: 'application/octet-stream',
    physics: 'application/json'
  };

  function byId(id) { return document.getElementById(id); }

  function toast(message) {
    if (!message) return;
    try {
      if (typeof window.SL_L2D_TOAST === 'function') { window.SL_L2D_TOAST(message); return; }
      if (typeof window.L2DToast === 'function') { window.L2DToast(message); return; }
    } catch (e) {}
    var el = byId('toast');
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
      clearTimeout(el._slWidgetTimer);
      el._slWidgetTimer = setTimeout(function () { el.style.display = 'none'; }, 2600);
    }
  }

  function setLoading(on, text) {
    loading = !!on;
    var overlay = byId('loading-overlay');
    if (!overlay) return;
    overlay.hidden = !on;
    if (on) {
      var label = overlay.querySelector('.loading-text');
      if (label) label.textContent = text || '正在加载模型…';
    }
  }

  function setEmpty(on, message) {
    var empty = byId('empty-message');
    if (!empty) return;
    empty.hidden = !on;
    if (on && message) {
      empty.innerHTML = '<i class="fas fa-circle-user" aria-hidden="true"></i><p>' + message + '</p>';
    }
  }

  function updateLabel(name) {
    if (!name) return;
    currentLabel = name;
    var label = byId('model-label');
    var shortName = name.length > 25 ? name.slice(0, 25) + '...' : name;
    if (label) {
      label.textContent = '文件：' + shortName;
      label.hidden = false;
    }
    var fsLabel = byId('l2d-fs-model-label');
    if (fsLabel) fsLabel.textContent = label ? label.textContent : '文件：' + shortName;
  }

  function applyTransform() {
    canvas.style.transformOrigin = '50% 50%';
    canvas.style.transform = 'translate3d(' + panX + 'px,' + panY + 'px,0) scale(' + zoom + ')';
  }

  function resetView() {
    panX = 0;
    panY = 0;
    zoom = 1;
    applyTransform();
  }

  function sizeCanvas() {
    var host = canvas.parentElement || document.body;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = Math.max(2, Math.round((host.clientWidth || window.innerWidth || 800) * dpr));
    var height = Math.max(2, Math.round((host.clientHeight || window.innerHeight || 600) * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function mimeFor(path) {
    var ext = String(path || '').toLowerCase().split('.').pop();
    return MIME_TYPES[ext] || 'application/octet-stream';
  }

  function filenameOf(source) {
    if (typeof source !== 'string') return 'model';
    if (source.indexOf('data:') === 0) return 'model';
    var clean = source.split('?')[0].split('#')[0];
    var name = clean.split('/').pop();
    return name || 'model';
  }

  /* ------------------------------------------------------------------------
   * 资源解析（ZIP / LPK / WPK / data JSON）
   * ------------------------------------------------------------------------ */

  function resolvePath(pathStr, dirPath) {
    if (!pathStr || typeof pathStr !== 'string') return null;
    if (pathStr.indexOf('data:') === 0 || /^https?:\/\//i.test(pathStr)) return null;
    try {
      var resolved = new URL(pathStr, 'http://dummy/' + dirPath).pathname.substring(1);
      return [decodeURIComponent(resolved), pathStr];
    } catch (e) {
      return null;
    }
  }

  function walkJSON(obj, callback) {
    function traverse(node) {
      if (!node || typeof node !== 'object') return;
      Object.keys(node).forEach(function (key) {
        var value = node[key];
        if (typeof value === 'string') callback(node, key, value);
        else if (value && typeof value === 'object') traverse(value);
      });
    }
    traverse(obj);
  }

  function collectPaths(obj, dirPath) {
    var refs = {};
    walkJSON(obj, function (_, __, value) {
      var resolved = resolvePath(value, dirPath);
      if (resolved) {
        refs[resolved[0]] = true;
        refs[resolved[1]] = true;
      } else if (value && value.indexOf('data:') !== 0 && !/^https?:\/\//i.test(value)) {
        refs[value] = true;
      }
    });
    return refs;
  }

  function substituteDataURIs(obj, dirPath, uriMap) {
    walkJSON(obj, function (node, key, value) {
      var resolved = resolvePath(value, dirPath);
      if (resolved) {
        var uri = uriMap[resolved[0]] || uriMap[resolved[1]];
        if (uri) node[key] = uri;
      } else if (uriMap[value]) {
        node[key] = uriMap[value];
      }
    });
  }

  function findModelEntry(zip) {
    var best = null;
    zip.forEach(function (path, entry) {
      if (entry.dir) return;
      if (!/model3?[-\w]*\.json$/i.test(path)) return;
      if (!best || /model3\.json$/i.test(path)) best = { path: path, entry: entry };
    });
    return best;
  }

  function cubism345Error() {
    var error = new Error('cubism345');
    error.code = 'cubism345';
    return error;
  }

  function processArchive(buffer, label) {
    if (typeof JSZip === 'undefined') {
      return Promise.reject(new Error('JSZip 未加载'));
    }
    return JSZip.loadAsync(buffer).then(function (zip) {
      var found = findModelEntry(zip);
      if (!found) throw new Error('压缩包内未找到 model.json / model3.json');

      return found.entry.async('text').then(function (text) {
        var json;
        try { json = JSON.parse(text); }
        catch (e) { throw new Error('模型 JSON 解析失败：' + e.message); }

        var type = (SL.typeFromJson ? SL.typeFromJson(json) : 'unknown');
        if (!type && /model3\.json$/i.test(found.path)) type = 'cubism345';
        if (type === 'cubism345' || /model3\.json$/i.test(found.path)) throw cubism345Error();

        var dirPath = found.path.indexOf('/') >= 0
          ? found.path.slice(0, found.path.lastIndexOf('/') + 1)
          : '';
        var refs = collectPaths(json, dirPath);
        var uriMap = {};
        var jobs = [];

        zip.forEach(function (relPath, entry) {
          if (entry.dir || !refs[relPath]) return;
          jobs.push(entry.async('base64').then(function (base64) {
            var uri = 'data:' + mimeFor(relPath) + ';base64,' + base64;
            uriMap[relPath] = uri;
            uriMap[decodeURIComponent(relPath)] = uri;
          }));
        });

        return Promise.all(jobs).then(function () {
          substituteDataURIs(json, dirPath, uriMap);
          // data:, 的 MIME 段没有 "/"，SDK 推导出的 modelHomeDir 为空，
          // 因此内联的 data URI 不会被错误地拼接目录前缀。
          return 'data:,' + encodeURIComponent(JSON.stringify(json));
        });
      });
    }).then(function (jsonUrl) {
      return { jsonUrl: jsonUrl, label: label };
    });
  }

  function dataUrlToBuffer(source) {
    var comma = source.indexOf(',');
    if (comma < 0) throw new Error('数据格式错误');
    var meta = source.slice(0, comma);
    var body = source.slice(comma + 1);
    if (meta.indexOf(';base64') >= 0) {
      var binary = atob(body.replace(/\s+/g, ''));
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }
    var text = decodeURIComponent(body);
    var arr = new Uint8Array(text.length);
    for (var j = 0; j < text.length; j += 1) arr[j] = text.charCodeAt(j);
    return arr.buffer;
  }

  function bytesToText(bytes) {
    try {
      if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {}
    var text = '';
    for (var i = 0; i < bytes.length; i += 1) text += String.fromCharCode(bytes[i]);
    return text;
  }

  function jsonDataUrlToInline(source) {
    var comma = source.indexOf(',');
    var meta = source.slice(0, comma);
    var body = source.slice(comma + 1);
    var text = meta.indexOf(';base64') >= 0
      ? bytesToText(new Uint8Array(dataUrlToBuffer(source)))
      : decodeURIComponent(body);
    var json = JSON.parse(text);
    var type = SL.typeFromJson ? SL.typeFromJson(json) : 'unknown';
    if (type === 'cubism345') return Promise.reject(cubism345Error());
    return Promise.resolve('data:,' + encodeURIComponent(JSON.stringify(json)));
  }

  /* ------------------------------------------------------------------------
   * SDK 加载
   * ------------------------------------------------------------------------ */

  function loadViaSdk(jsonUrl, label) {
    if (typeof window.loadlive2d !== 'function') {
      toast('星标内核未加载，请刷新页面或切回推荐内核');
      setLoading(false);
      setEmpty(true, '星标内核未加载<br>请刷新页面，或切换到「推荐」内核');
      return;
    }

    currentJsonUrl = jsonUrl;
    setLoading(true, '星标内核 · 正在加载模型…');
    setEmpty(false);
    sizeCanvas();
    resetView();

    try {
      window.loadlive2d('live2d-canvas', jsonUrl, 0.5);
    } catch (e) {
      toast('模型加载失败：' + (e && e.message ? e.message : e));
      setLoading(false);
      setEmpty(true, '模型加载失败<br>请检查模型文件，或切换到「推荐」内核');
      return;
    }

    setTimeout(function () {
      setLoading(false);
      updateLabel(label || 'model');
    }, 1400);
  }

  function handleCubism345(source) {
    if (MODE === 'auto' && typeof SL.reloadWith === 'function') {
      var carry = source && source.indexOf('blob:') !== 0 && source.length <= 3000000;
      SL.reloadWith(
        'recommend',
        carry ? source : null,
        carry ? '自动识别为 Cubism3/4/5，已切换到「推荐」内核'
              : '自动识别为 Cubism3/4/5，已切换到「推荐」内核，请重新导入模型',
        true
      );
      return;
    }
    if (typeof SL.showUnsupported === 'function') {
      SL.showUnsupported(source, 'cubism345');
    } else {
      toast('该内核仅支持 Cubism2，请切换到「推荐」内核');
    }
  }

  function handleUnknown(source) {
    if (MODE === 'auto' && typeof SL.reloadWith === 'function') {
      SL.reloadWith('recommend', source, '自动识别失败，已回退「推荐」内核', true);
      return;
    }
    if (typeof SL.showUnsupported === 'function') {
      SL.showUnsupported(source, 'unknown');
    } else {
      toast('无法识别模型版本，请切换到「推荐」内核');
    }
  }

  /* ------------------------------------------------------------------------
   * 主加载入口
   * ------------------------------------------------------------------------ */

  function loadModel(source) {
    if (!source || typeof source !== 'string') return Promise.resolve();

    var label = filenameOf(source);

    if (location.protocol === 'file:' && !/^(data:|blob:)/i.test(source)) {
      toast('file:// 下无法直接读取本地模型，请用「导入模型」选择 ZIP/LPK/WPK');
      setLoading(false);
      setEmpty(true, '当前为 file:// 模式<br>请点「导入模型」选择 ZIP / LPK / WPK');
      return Promise.resolve();
    }

    var detect = SL.detectType ? SL.detectType(source) : Promise.resolve('unknown');
    return detect.then(function (type) {
      if (type === 'cubism345') { handleCubism345(source); return; }
      if (type === 'unknown') { handleUnknown(source); return; }
      return doLoad(source, label);
    }).catch(function (error) {
      if (error && error.code === 'cubism345') { handleCubism345(source); return; }
      toast('模型加载失败：' + (error && error.message ? error.message : error));
      setLoading(false);
    });
  }

  function doLoad(source, label) {
    if (source.indexOf('data:application/zip') === 0) {
      return processArchive(dataUrlToBuffer(source), label).then(function (result) {
        loadViaSdk(result.jsonUrl, result.label);
      });
    }

    if (/\.(zip|lpk|wpk)(?:[?#].*)?$/i.test(source)) {
      return fetch(source).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.arrayBuffer();
      }).then(function (buffer) {
        return processArchive(buffer, filenameOf(source));
      }).then(function (result) {
        loadViaSdk(result.jsonUrl, result.label);
      });
    }

    if (source.indexOf('data:application/json') === 0) {
      return jsonDataUrlToInline(source).then(function (jsonUrl) {
        loadViaSdk(jsonUrl, label);
      });
    }

    if (source.indexOf('data:,') === 0) {
      loadViaSdk(source, label);
      return Promise.resolve();
    }

    if (/\.json(?:[?#].*)?$/i.test(source)) {
      var encoded = source;
      try {
        if (!/^[\x00-\x7F]*$/.test(source)) {
          encoded = source.replace(/[^\x00-\x7F]/g, function (ch) {
            return encodeURIComponent(ch);
          });
        }
      } catch (e) {}
      loadViaSdk(encoded, label);
      return Promise.resolve();
    }

    handleUnknown(source);
    return Promise.resolve();
  }

  /* ------------------------------------------------------------------------
   * 本地导入 / 拖拽
   * ------------------------------------------------------------------------ */

  function readFileBuffer(file) {
    if (file && typeof file.arrayBuffer === 'function') return file.arrayBuffer();
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('读取文件失败')); };
      reader.readAsArrayBuffer(file);
    });
  }

  function importArchive(file) {
    if (!file) return;
    var name = file.name || 'model';
    var isJson = /\.json$/i.test(name);
    var isZip = /\.(zip|lpk|wpk)$/i.test(name);

    if (!isZip && !isJson) {
      toast('请选择 ZIP / LPK / WPK 模型包');
      return;
    }

    setLoading(true, '正在解析模型包…');
    var task = isZip
      ? readFileBuffer(file).then(function (buffer) { return processArchive(buffer, name); })
          .then(function (result) { loadViaSdk(result.jsonUrl, name); })
      : file.text().then(function (text) {
          var json;
          try { json = JSON.parse(text); }
          catch (e) { throw new Error('JSON 解析失败'); }
          var type = SL.typeFromJson ? SL.typeFromJson(json) : 'unknown';
          if (type === 'cubism345') throw cubism345Error();
          var jsonUrl = 'data:,' + encodeURIComponent(JSON.stringify(json));
          loadViaSdk(jsonUrl, name);
        });

    Promise.resolve(task).catch(function (error) {
      setLoading(false);
      if (error && error.code === 'cubism345') {
        handleCubism345(null);
        return;
      }
      toast('模型包解析失败：' + (error && error.message ? error.message : error));
      setEmpty(true, '模型包解析失败<br>请检查文件是否完整，或切换到「推荐」内核');
    });
  }

  function bindToolbar() {
    var urlInput = byId('model-url-input');
    var loadUrlBtn = byId('load-url-btn');
    if (loadUrlBtn) {
      loadUrlBtn.addEventListener('click', function () {
        var value = urlInput && urlInput.value.trim();
        if (value) loadModel(value);
      });
    }
    if (urlInput) {
      urlInput.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        var value = urlInput.value.trim();
        if (value) loadModel(value);
      });
    }
    var loadSelected = byId('load-selected-btn');
    if (loadSelected) {
      loadSelected.addEventListener('click', function () {
        var value = byId('dropdown-value');
        if (value && value.value) loadModel(value.value);
      });
    }
  }

  function bindImport() {
    var input = byId('zip-upload-input');
    if (input) {
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        importArchive(file);
        input.value = '';
      });
    }

    var wrapper = document.querySelector('.sl-canvaswrap') || canvas;
    ['dragenter', 'dragover'].forEach(function (type) {
      wrapper.addEventListener(type, function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
    });
    wrapper.addEventListener('drop', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      importArchive(file);
    });
  }

  /* ------------------------------------------------------------------------
   * 拖动 / 缩放 / 尺寸
   * ------------------------------------------------------------------------ */

  function bindViewGestures() {
    var drag = null;
    canvas.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        panX: panX,
        panY: panY
      };
      try { canvas.setPointerCapture(event.pointerId); } catch (e) {}
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!drag || drag.id !== event.pointerId) return;
      panX = drag.panX + (event.clientX - drag.x);
      panY = drag.panY + (event.clientY - drag.y);
      applyTransform();
    });
    function endDrag(event) {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      try { canvas.releasePointerCapture(event.pointerId); } catch (e) {}
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('wheel', function (event) {
      event.preventDefault();
      var factor = Math.exp(-event.deltaY * 0.0012);
      zoom = Math.max(0.4, Math.min(zoom * factor, 4));
      applyTransform();
    }, { passive: false });
  }

  function bindResize() {
    var timer = null;
    function relayout() {
      if (!currentJsonUrl) return;
      sizeCanvas();
      resetView();
      try { window.loadlive2d('live2d-canvas', currentJsonUrl, 0.5); } catch (e) {}
    }
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(relayout, 350);
    }
    window.addEventListener('resize', schedule);
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(schedule);
      if (canvas.parentElement) observer.observe(canvas.parentElement);
      var fs = byId('l2d-fullscreen');
      if (fs) observer.observe(fs);
    }
  }

  /* ------------------------------------------------------------------------
   * 面板文案（轻量内核无表情/动作列表 API）
   * ------------------------------------------------------------------------ */

  function fillPanels() {
    var expressions = byId('expressions-panel');
    var motions = byId('motions-panel');
    var hitareas = byId('hitareas-panel');
    if (expressions) expressions.innerHTML = '<p class="empty-msg">星标内核不支持表情列表</p>';
    if (motions) motions.innerHTML = '<p class="empty-msg">点击模型头部 / 身体可触发内置动作</p>';
    if (hitareas) hitareas.innerHTML = '<p class="empty-msg">星标内核不支持触发区列表</p>';
    var toggle = byId('hitareas-toggle');
    if (toggle) toggle.disabled = true;
    var del = byId('delete-model-btn');
    if (del) del.disabled = true;
  }

  /* ------------------------------------------------------------------------
   * 启动
   * ------------------------------------------------------------------------ */

  window.__SL_L2D_ENGINE_KIND = ENGINE;
  window.__SL_L2D_READY = true;
  window.__L2D_READY_FLAG = true;

  window.loadLive2DModel = loadModel;
  window.L2DWidgetKernel = {
    loadModel: loadModel,
    importArchive: importArchive,
    engine: ENGINE
  };

  bindViewGestures();
  bindToolbar();
  bindImport();
  bindResize();
  fillPanels();
  applyTransform();

  var pending = window.__sl_l2d_pending;
  if (pending) {
    window.__sl_l2d_pending = null;
    setTimeout(function () { loadModel(pending); }, 60);
  }
})();
