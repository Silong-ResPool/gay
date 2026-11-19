/* 巳泷内置插件 · 夜间护眼
   叠加柔和暖色滤镜，不影响图片与视频本身的色彩。 */
(function () {
  if (window.__slPluginNightEye) return;
  window.__slPluginNightEye = true;
  try {
    if (document.getElementById('sl-plugin-night-eye')) return;
    var d = document.createElement('div');
    d.id = 'sl-plugin-night-eye';
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483600;' +
      'pointer-events:none;background:rgb(255,176,80,0.10);';
    (document.body || document.documentElement).appendChild(d);
  } catch (e) {}
})();
