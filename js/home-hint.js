/* v8.0.4 小窗气泡提示：在页面停留过久或滑到很底部仍没找到内容时，
   提示可切换黑夜模式解锁更多成人资源（仅日间模式触发）。 */
(function () {
  var fired = false;

  function isNight() {
    try { return (Number(localStorage.getItem('sl_cycle') || 0)) === 1; } catch (e) { return false; }
  }
  function dockOpen() {
    return document.body.classList.contains('dock-open');
  }
  function showHint() {
    if (fired || isNight() || !dockOpen()) return;
    var bb = document.getElementById('slBubble');
    var tx = document.getElementById('bbTxt');
    if (!bb || !tx) return;
    fired = true;
    try {
      var k = 'sl_night_hint_' + new Date().toISOString().slice(0, 10);
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, '1');
    } catch (e) {}
    tx.textContent = '亲爱的主人，这里还有很多隐藏资源哦～ 切换为黑夜模式，就能解锁更多成人内容。';
    bb.classList.add('on');
    bb.style.cursor = 'pointer';
    bb.onclick = function () {
      try {
        if (window.SLMODE && SLMODE.setNight) SLMODE.setNight(true);
        else { localStorage.setItem('sl_cycle', '1'); }
        location.reload();
      } catch (e) { localStorage.setItem('sl_cycle', '1'); location.reload(); }
    };
    setTimeout(function () { bb.classList.remove('on'); bb.style.cursor = ''; }, 10000);
  }

  /* 停留 75 秒 */
  setTimeout(showHint, 75000);

  /* 滑到接近底部 120px 且停留 12 秒 */
  var bottomTimer = null;
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var near = (h.scrollTop + h.clientHeight) >= (h.scrollHeight - 120);
    if (near && !fired) {
      if (!bottomTimer) bottomTimer = setTimeout(showHint, 12000);
    } else if (bottomTimer) {
      clearTimeout(bottomTimer);
      bottomTimer = null;
    }
  }, { passive: true });
})();
