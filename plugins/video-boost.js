/* 巳泷内置插件 · 视频增强
   记忆音量 / 倍速，双击视频全屏，不改动网站播放器本身。 */
(function () {
  if (window.__slPluginVideoBoost) return;
  window.__slPluginVideoBoost = true;

  function storeKey() { return 'slgmv_' + (location.hostname || 'site'); }

  document.addEventListener('loadedmetadata', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO') return;
    try {
      var saved = JSON.parse(localStorage.getItem(storeKey()) || '{}');
      if (saved && typeof saved.volume === 'number' && isFinite(saved.volume)) v.volume = Math.max(0, Math.min(1, saved.volume));
      if (saved && typeof saved.rate === 'number' && isFinite(saved.rate)) v.playbackRate = Math.max(0.25, Math.min(4, saved.rate));
    } catch (err) {}
  }, true);

  document.addEventListener('volumechange', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO') return;
    try {
      localStorage.setItem(storeKey(), JSON.stringify({ volume: v.volume, rate: v.playbackRate }));
    } catch (err) {}
  }, true);

  document.addEventListener('dblclick', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO') return;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
      } else {
        (v.requestFullscreen || v.webkitRequestFullscreen || function () {}).call(v);
      }
    } catch (err) {}
  }, true);
})();
