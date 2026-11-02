/* v8.0.4 小人透明通道修复：把视频逐帧画到 canvas 并按亮度抠掉黑底，
   兼容不支持 alpha WebM 的浏览器（Safari / 部分国产内核），所有平台都显示透明背景。 */
(function () {
  function setup(v) {
    if (!v || v.__slKeyed) return;
    v.__slKeyed = true;
    var c = document.createElement('canvas');
    c.className = 'sl-char-alpha';
    c.style.cssText = 'position:fixed;pointer-events:none;left:0;top:0;width:0;height:0;display:none;' +
      'z-index:' + (parseInt(getComputedStyle(v).zIndex, 10) || 246) + ';';
    document.body.appendChild(c);
    var ctx = c.getContext('2d', { alpha: true });
    v.style.opacity = '0';

    function loop() {
      try {
        var r = v.getBoundingClientRect();
        if (!v.videoWidth || r.width < 2 || r.height < 2) {
          c.style.display = 'none';
        } else {
          c.style.display = 'block';
          c.style.left = r.left + 'px';
          c.style.top = r.top + 'px';
          c.style.width = r.width + 'px';
          c.style.height = r.height + 'px';
          var w = Math.round(r.width), h = Math.round(r.height);
          if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(v, 0, 0, w, h);
          var img = ctx.getImageData(0, 0, w, h);
          var d = img.data;
          for (var i = 0; i < d.length; i += 4) {
            var a = d[i] > d[i + 1] ? d[i] : d[i + 1];
            if (d[i + 2] > a) a = d[i + 2];
            d[i + 3] = a < 16 ? 0 : (a > 64 ? 255 : a * 4);
          }
          ctx.putImageData(img, 0, 0);
        }
      } catch (e) { }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  window.SLKeyChar = setup;
  function boot() {
    var ids = ['slChar', 'chatChar'];
    for (var i = 0; i < ids.length; i++) {
      var v = document.getElementById(ids[i]);
      if (v) setup(v);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 800);
})();
