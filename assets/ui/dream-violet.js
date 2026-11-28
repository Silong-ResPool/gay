/* 巳泷资源库 · DREAM VIOLET 2026 · 轻量增强（仅滚动进度条，不改变任何业务逻辑） */
(function () {
  if (window.__dvProgressReady) return;
  window.__dvProgressReady = true;
  var bar = document.createElement('div');
  bar.id = 'dvProgress';
  document.body.appendChild(bar);
  var ticking = false;
  function update() {
    ticking = false;
    var doc = document.documentElement;
    var top = window.scrollY || doc.scrollTop || 0;
    var max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
    var pct = max > 0 ? Math.min(100, Math.max(0, (top / max) * 100)) : 0;
    bar.style.width = pct + '%';
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* 窄屏缩短搜索占位文案，避免被截断 */
(function () {
  function fit() {
    var inp = document.getElementById('slTopKw');
    if (!inp) return;
    var narrow = window.innerWidth <= 760;
    var ph = narrow ? '输入关键词，搜全网资源' : '输入关键词，一次搜索全网 26 个引擎…';
    if (inp.getAttribute('placeholder') !== ph) inp.setAttribute('placeholder', ph);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit);
  else fit();
  window.addEventListener('resize', fit);
})();