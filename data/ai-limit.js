/* ============================================================
   巳泷资源库 · 内置 AI 全局共享限流（v8.4.0 网页版）
   规则：内置 API 每 5 分钟最多 20 次，所有页面 / 所有功能板块共享。
   仅安卓开发专属版（Android.isDevEdition() 返回 true）不限制；
   网页版没有原生桥，始终按正式版限流，localStorage 不可绕过。
   自填 API Key 的功能由各页面自行跳过本限流。
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'sl_ai_quota_v1';
  var DEV_KEY = 'sl_dev_edition';
  var MAX = 20;
  var WINDOW = 5 * 60 * 1000;
  var timer = 0;

  function isDev() {
    try {
      if (window.Android && typeof window.Android.isDevEdition === 'function') {
        var d = !!window.Android.isDevEdition();
        try { localStorage.setItem(DEV_KEY, d ? '1' : '0'); } catch (e) {}
        window.SL_DEV = d;
        return d;
      }
    } catch (e) {}
    /* 网页版：没有原生桥即按正式版运行，忽略 localStorage 开发标记 */
    window.SL_DEV = false;
    return false;
  }
  function read() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function prune(now) {
    var a = read().filter(function (t) { return typeof t === 'number' && now - t < WINDOW && now - t >= 0; });
    save(a);
    return a;
  }
  function status() {
    if (isDev()) return { ok: true, dev: true, used: 0, max: MAX, remaining: 9999, resetIn: 0 };
    var now = Date.now(), a = prune(now);
    var resetIn = a.length ? Math.max(0, WINDOW - (now - a[0])) : 0;
    return { ok: a.length < MAX, dev: false, used: a.length, max: MAX, remaining: Math.max(0, MAX - a.length), resetIn: resetIn };
  }
  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function css() {
    if (document.getElementById('slAiCss')) return;
    var st = document.createElement('style'); st.id = 'slAiCss';
    st.textContent =
      '#slAiMask{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;' +
      'padding:22px;background:rgba(4,2,10,.72);backdrop-filter:blur(14px) saturate(150%);' +
      '-webkit-backdrop-filter:blur(14px) saturate(150%);animation:slAiFade .18s ease}' +
      '#slAiMask.on{display:flex}' +
      '@keyframes slAiFade{from{opacity:0}to{opacity:1}}' +
      '.slAiCard{width:min(410px,94vw);padding:22px 22px 18px;border-radius:22px;position:relative;' +
      'background:linear-gradient(168deg,rgba(34,21,58,.99),rgba(14,8,28,.99));' +
      'border:1px solid rgba(139,92,246,.46);box-shadow:0 28px 80px rgba(0,0,0,.68),0 0 50px rgba(124,58,237,.20);' +
      'color:#f6f3ff;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;animation:slAiUp .2s cubic-bezier(.2,.9,.3,1.2)}' +
      '@keyframes slAiUp{from{transform:translateY(14px) scale(.97);opacity:.6}to{transform:none;opacity:1}}' +
      '.slAiBadge{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;' +
      'font-size:18px;font-weight:900;color:#fff;background:linear-gradient(135deg,#6d28d9,#8b5cf6 55%,#22d3ee);' +
      'box-shadow:0 8px 22px rgba(124,58,237,.45);margin-bottom:12px}' +
      '.slAiCard h3{margin:0 0 8px;font-size:17px;letter-spacing:.3px;' +
      'background:linear-gradient(90deg,#fff,#c4b5fd 55%,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '.slAiCard p{margin:0 0 9px;font-size:12.5px;line-height:1.8;color:#c9bfe2}' +
      '.slAiCard p b{color:#a5f3fc;font-size:15px}' +
      '.slAiCard .slAiSub{font-size:11px;color:#8f83ab;line-height:1.8}' +
      '.slAiActs{display:flex;gap:9px;justify-content:flex-end;margin-top:17px;flex-wrap:wrap}' +
      '.slAiActs button{border-radius:11px;padding:10px 16px;font-size:12px;font-weight:700;cursor:pointer;' +
      'border:1px solid rgba(139,92,246,.34);background:rgba(139,92,246,.12);color:#ddd6fe;transition:.16s}' +
      '.slAiActs button:hover{background:rgba(139,92,246,.24);color:#fff}' +
      '.slAiActs button.ok{background:linear-gradient(135deg,#6d28d9,#8b5cf6);border-color:transparent;color:#fff;' +
      'box-shadow:0 8px 22px rgba(124,58,237,.38)}' +
      '.slAiClose{position:absolute;right:14px;top:13px;width:28px;height:28px;border-radius:50%;' +
      'border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#c9bfe2;font-size:12px;cursor:pointer}';
    document.head.appendChild(st);
  }
  function show(st) {
    if (isDev()) return;
    css();
    st = st || status();
    var mask = document.getElementById('slAiMask');
    if (!mask) {
      mask = document.createElement('div'); mask.id = 'slAiMask';
      mask.innerHTML =
        '<div class="slAiCard" onclick="event.stopPropagation()">' +
        '<button class="slAiClose" id="slAiClose">✕</button>' +
        '<div class="slAiBadge">AI</div>' +
        '<h3>内置 API 请求已达上限</h3>' +
        '<p>内置 API 由所有主人共享，限制为 <b>每 5 分钟最多 20 次</b>，聊天、文游、代码助手、群聊等所有功能板块共用同一份额度。</p>' +
        '<p>当前冷却剩余：<b id="slAiCd">--</b></p>' +
        '<p class="slAiSub">想不限次数使用，可在主页右上角「设置 → API 与模型」填写自己的 Key；自己的 Key 不占这份共享额度。</p>' +
        '<div class="slAiActs"><button id="slAiOwn">去设置</button><button class="ok" id="slAiKnow">知道了</button></div>' +
        '</div>';
      document.body.appendChild(mask);
      mask.querySelector('#slAiClose').onclick = function () { hide(); };
      mask.querySelector('#slAiKnow').onclick = function () { hide(); };
      mask.querySelector('#slAiOwn').onclick = function () {
        hide();
        var p = location.pathname;
        if (/\/butler\/|\/story\/|\/music\/|\/codeeditor\/|\/games\/|\/video\//.test(p)) location.href = '../index.html';
        else location.href = 'index.html';
      };
      mask.onclick = function (e) { if (e.target === mask) hide(); };
    }
    mask.classList.add('on');
    var cd = document.getElementById('slAiCd');
    function tick() {
      var s = status();
      if (s.ok) { if (cd) cd.textContent = '已恢复'; clearInterval(timer); timer = 0; return; }
      if (cd) cd.textContent = fmt(s.resetIn);
    }
    clearInterval(timer); timer = setInterval(tick, 1000); tick();
  }
  function hide() {
    var mask = document.getElementById('slAiMask');
    if (mask) mask.classList.remove('on');
    clearInterval(timer); timer = 0;
  }
  function take() {
    if (isDev()) return { ok: true, dev: true, remaining: 9999, used: 0, resetIn: 0 };
    var now = Date.now(), a = prune(now);
    if (a.length >= MAX) {
      var s = status(); show(s); return s;
    }
    a.push(now); save(a);
    return { ok: true, dev: false, remaining: Math.max(0, MAX - a.length), used: a.length, resetIn: 0 };
  }
  function guard() { return take().ok; }
  function reset() { save([]); hide(); }

  window.SL_AI_LIMIT = {
    take: take, guard: guard, status: status, show: show, hide: hide, reset: reset,
    isDev: isDev, MAX: MAX, WINDOW: WINDOW
  };
  // 页面启动时同步一次开发版标记
  try { isDev(); } catch (e) {}
})();
