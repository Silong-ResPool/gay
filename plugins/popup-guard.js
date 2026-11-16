/* 巳泷内置插件 · 弹窗与跳转拦截
   拦截无用户手势的 window.open、自动弹层、伪装遮罩、强制跳转。 */
(function () {
  if (window.__slPluginPopupGuard) return;
  window.__slPluginPopupGuard = true;

  var lastGesture = 0;
  function markGesture() { lastGesture = Date.now(); }
  var gestureEvents = ['mousedown', 'pointerdown', 'touchstart', 'touchend', 'keydown', 'click'];
  for (var i = 0; i < gestureEvents.length; i++) {
    try { document.addEventListener(gestureEvents[i], markGesture, true); } catch (e) {}
  }

  var nativeOpen = window.open;
  window.open = function (url, name, features) {
    try {
      var u = String(url || '').toLowerCase();
      var isAdUrl = /doubleclick|googlesyndication|adservice|popads|propellerads|exoclick|juicyads|trafficjunky|adsterra|hilltopads|clickadu|popcash|bit\.ly|t\.me\/|telegram/.test(u);
      var noGesture = Date.now() - lastGesture > 900;
      if (noGesture || isAdUrl) {
        try { console.log('[巳泷插件] 已拦截弹窗：', url); } catch (e) {}
        return null;
      }
    } catch (e) {}
    try { return nativeOpen.apply(window, arguments); } catch (e) { return null; }
  };

  function killOverlays() {
    try {
      if (window.__slAdAggressive !== true) return;   // 标准档：只拦弹窗/跳转，不动页面内正常弹层
      if (Date.now() - lastGesture < 2200) return;
      var els = document.querySelectorAll('div,section,aside');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!el || !el.offsetParent) continue;
        var cs;
        try { cs = window.getComputedStyle(el); } catch (e) { continue; }
        if (!cs) continue;
        if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
        var z = parseInt(cs.zIndex, 10) || 0;
        if (z < 2000) continue;
        var w = el.offsetWidth, h = el.offsetHeight;
        if (w < window.innerWidth * 0.62 || h < window.innerHeight * 0.42) continue;
        var txt = String(el.textContent || '').toLowerCase();
        var looksAd = /(广告|sponsor|advertis|telegram|t\.me|下载|安装|打开\s*app|跳转|继续访问|点击关闭|进入网站|18\+)/.test(txt);
        var hasFrame = false;
        try { hasFrame = !!el.querySelector('iframe'); } catch (e) {}
        if (looksAd || hasFrame) {
          try { el.parentNode.removeChild(el); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  setTimeout(killOverlays, 1600);
  setTimeout(killOverlays, 4200);
  try { setInterval(killOverlays, 5000); } catch (e) {}
})();
