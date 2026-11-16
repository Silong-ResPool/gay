/* 巳泷内置插件 · 清爽广告拦截
   目标：横幅、悬浮、广告位、联盟 iframe、成人视频站定向广告全部清掉，页面保持干净。
   兼容旧 WebView（ES5）。 */
(function () {
  if (window.__slPluginCleanAds) return;
  window.__slPluginCleanAds = true;

  var CSS = [
    '.adsbygoogle', 'ins.adsbygoogle', '[id^="google_ads"]', '[id*="google_ads"]', '[class*="adsbygoogle"]',
    'iframe[src*="googlesyndication"]', 'iframe[src*="doubleclick"]', 'iframe[src*="googleadservices"]',
    'iframe[src*="adservice"]', 'iframe[src*="popads"]', 'iframe[src*="propellerads"]',
    'iframe[src*="exoclick"]', 'iframe[src*="juicyads"]', 'iframe[src*="trafficjunky"]',
    'iframe[src*="adnium"]', 'iframe[src*="tsyndicate"]', 'iframe[src*="adsterra"]',
    'iframe[src*="hilltopads"]', 'iframe[src*="clickadu"]', 'iframe[src*="popcash"]',
    '[class*="advert"]', '[id*="advert"]', '[class*="popunder"]', '[id*="popunder"]',
    '[class*="popads"]', '[id*="popads"]', '[class*="ad-slot"]', '[class*="ad_slot"]',
    '[class*="ad-container"]', '[class*="ad-wrapper"]', '[class*="ad-banner"]',
    '[id^="div-gpt-ad"]', '[data-ad-slot]', '[data-ad-client]', '[data-adunit]',
    '[class*="sponsor"]', '[id*="sponsor"]'
  ].join(',') + '{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important;pointer-events:none!important;}';

  var HOST = (location.hostname || '').toLowerCase();
  var SITE_CSS = '';
  if (/(^|\.)(boyfriendtv|bfv)\./.test(HOST)) {
    SITE_CSS = '#ad,#ads,.ad,.ads,.advertisement,.ad-container,.ad-wrapper,.banner,' +
      '.popup,.popup-overlay,.video-ad,.player-ad,.overlay-ad,[id^="ad_"],.sidebar-ad,.right-column .banner' +
      '{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important;}';
  } else if (/boyfriendtv|gayporn|gaytube|porn/.test(HOST)) {
    SITE_CSS = '.ad,.ads,.advertisement,.popunder,.banner-ad,.video-ad,.player-ad,' +
      '[class^="ad-"],[id^="ad-"]{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important;}';
  }

  function addStyle(css, id) {
    try {
      if (id && document.getElementById(id)) return;
      var s = document.createElement('style');
      if (id) s.id = id;
      s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }
  addStyle(CSS, 'sl-plugin-clean-ads');
  if (SITE_CSS) addStyle(SITE_CSS, 'sl-plugin-clean-ads-site');

  var BAD = /(^|[\s_\-])(ads?|advert|advertisement|advertising|banner|popunder|popads|sponsor|promo)([\s_\-]|$)/i;
  var SAFE = /(addthis|address|admin|adult|adapter|advance|gradient|shadow|loading)/i;

  function badEl(el) {
    if (!el || el.nodeType !== 1) return false;
    var tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'HTML' || tag === 'BODY' || tag === 'VIDEO') return false;
    var cls = typeof el.className === 'string' ? el.className : '';
    var s = (el.id || '') + ' ' + cls;
    if (!BAD.test(s)) return false;
    if (SAFE.test(s)) return false;
    return true;
  }

  function killFrames() {
    try {
      var fs = document.querySelectorAll('iframe');
      for (var i = 0; i < fs.length; i++) {
        var src = String(fs[i].src || '').toLowerCase();
        if (/doubleclick|googlesyndication|googleadservices|adservice|popads|propellerads|exoclick|juicyads|trafficjunky|adnium|tsyndicate|adsterra|hilltopads|clickadu|popcash/.test(src)) {
          try { fs[i].parentNode.removeChild(fs[i]); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function sweep(root) {
    try {
      var list = (root && root.querySelectorAll) ? root.querySelectorAll('div,iframe,ins,aside,section,a,img,span') : [];
      for (var i = 0; i < list.length; i++) {
        if (badEl(list[i])) { try { list[i].parentNode.removeChild(list[i]); } catch (e) {} }
      }
    } catch (e) {}
    // 固定/粘性广告条：贴边、窄高、含广告特征
    try {
      var bars = document.querySelectorAll('div,section,aside');
      for (var j = 0; j < bars.length; j++) {
        var el = bars[j];
        if (!el || !el.offsetParent) continue;
        var cs;
        try { cs = window.getComputedStyle(el); } catch (e) { continue; }
        if (!cs || (cs.position !== 'fixed' && cs.position !== 'sticky')) continue;
        var h = el.offsetHeight, w = el.offsetWidth;
        if (h > 140 || w < window.innerWidth * 0.5) continue;
        var cls = ((el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '')).toLowerCase();
        if (BAD.test(cls) || /download|telegram|t\.me|打开\s*app|安装\s*app|成人|约炮|直播/.test(String(el.textContent || '').toLowerCase())) {
          try { el.parentNode.removeChild(el); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function run() {
    sweep(document);
    killFrames();
  }

  run();
  setTimeout(run, 1200);
  setTimeout(run, 4000);

  try {
    var timer = 0;
    var mo = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(run, 600);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
