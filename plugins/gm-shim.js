/* 巳泷资源库 · 油猴兼容层（GM_* API）
   在内置插件与用户脚本执行前注入，让 GreasyFork / SleazyFork 的脚本可以直接运行。 */
(function () {
  if (window.__slGMReady) return;
  window.__slGMReady = true;

  var PREFIX = 'slgm_';

  function safeParse(v, d) {
    try { return v == null ? d : JSON.parse(v); } catch (e) { return d; }
  }

  window.GM_addStyle = function (css) {
    try {
      var s = document.createElement('style');
      s.textContent = String(css || '');
      (document.head || document.documentElement).appendChild(s);
      return s;
    } catch (e) { return null; }
  };
  window.GM_addElement = function (parent, tag, attrs) {
    try {
      var el = document.createElement(tag || 'div');
      if (attrs) for (var k in attrs) { if (k === 'textContent') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
      (typeof parent === 'string' ? document.querySelector(parent) : parent || document.body).appendChild(el);
      return el;
    } catch (e) { return null; }
  };
  window.GM_setValue = function (k, v) {
    try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) {}
  };
  window.GM_getValue = function (k, d) {
    try { return safeParse(localStorage.getItem(PREFIX + k), d); } catch (e) { return d; }
  };
  window.GM_deleteValue = function (k) {
    try { localStorage.removeItem(PREFIX + k); } catch (e) {}
  };
  window.GM_listValues = function () {
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) out.push(k.substring(PREFIX.length));
      }
    } catch (e) {}
    return out;
  };
  window.GM_log = function () {
    try { console.log.apply(console, ['[GM]'].concat([].slice.call(arguments))); } catch (e) {}
  };
  window.GM_notification = function (text) {
    try {
      if (window.Android && typeof window.Android.showToast === 'function') window.Android.showToast(String(text || ''));
      else console.log('[GM notice]', text);
    } catch (e) {}
  };
  window.GM_openInTab = function (url) {
    try { window.open(String(url), '_blank', 'noopener'); } catch (e) {}
    return null;
  };
  window.GM_info = {
    script: { name: '巳泷插件', version: '1.0', handler: 'silong' },
    scriptHandler: 'silong-webview',
    version: '1.0'
  };
  /* GM_xmlhttpRequest：用 fetch 模拟常用字段，支持 GET/POST 与 headers。 */
  window.GM_xmlhttpRequest = function (o) {
    o = o || {};
    var opt = { method: (o.method || 'GET').toUpperCase(), headers: o.headers || {} };
    if (o.data != null && opt.method !== 'GET') opt.body = o.data;
    if (o.responseType === 'arraybuffer' || o.responseType === 'blob') opt.responseType = 'arraybuffer';
    fetch(o.url, opt).then(function (r) {
      var ct = o.responseType === 'arraybuffer' ? r.arrayBuffer() : r.text();
      return ct.then(function (body) {
        var res = {
          status: r.status, statusText: r.statusText, readyState: 4,
          responseHeaders: '', finalUrl: r.url, response: body, responseText: typeof body === 'string' ? body : ''
        };
        if (o.onload) o.onload(res);
      });
    }).catch(function (err) {
      if (o.onerror) o.onerror({ error: String(err) });
    });
  };

  try { window.unsafeWindow = window; } catch (e) {}
})();
