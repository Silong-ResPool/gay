/* 巳泷内置插件 · 阅读模式
   右下角「阅读」按钮：一键提取正文，去除侧栏、广告与杂乱排版。 */
(function () {
  if (window.__slPluginReader) return;
  window.__slPluginReader = true;
  if (window.top !== window) return;

  var box = null;

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function pick() {
    var cands = [];
    try { cands = document.querySelectorAll('article,main,[class*="article"],[class*="content"],[class*="post"],[id*="content"]'); } catch (e) {}
    var best = null, bestLen = 0, i;
    for (i = 0; i < cands.length; i++) {
      var t = (cands[i].innerText || '').length;
      if (t > bestLen) { bestLen = t; best = cands[i]; }
    }
    if (!best || bestLen < 300) {
      var divs = document.querySelectorAll('div');
      for (i = 0; i < divs.length; i++) {
        var t2 = (divs[i].innerText || '').length;
        if (t2 > bestLen) { bestLen = t2; best = divs[i]; }
      }
    }
    return bestLen >= 200 ? best : null;
  }

  function exit() {
    try { if (box && box.parentNode) box.parentNode.removeChild(box); } catch (e) {}
    box = null;
  }

  function enter() {
    try {
      var src = pick();
      if (!src) { alert('没有找到可阅读的正文'); return; }
      exit();
      box = document.createElement('div');
      box.id = 'sl-plugin-reader-box';
      box.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;' +
        'background:#faf7f2;color:#2a2438;overflow:auto;padding:24px 18px 90px;' +
        'font:17px/1.9 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;';
      var text = src.innerText || '';
      var parts = text.split(/\n{2,}/);
      var html = '<div style="font-weight:800;font-size:20px;line-height:1.5;margin:0 0 16px">' + esc(document.title || '') + '</div>';
      for (var i = 0; i < parts.length; i++) {
        var p = String(parts[i] || '').trim();
        if (p) html += '<p style="margin:0 0 14px">' + esc(p) + '</p>';
      }
      html += '<button id="sl-plugin-reader-exit" style="position:fixed;right:14px;bottom:18px;z-index:2147483647;' +
        'border:0;border-radius:22px;padding:11px 18px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;' +
        'box-shadow:0 6px 18px rgb(124,58,237,.4)">退出阅读</button>';
      box.innerHTML = html;
      (document.body || document.documentElement).appendChild(box);
      var btn = box.querySelector('#sl-plugin-reader-exit');
      if (btn) btn.onclick = exit;
    } catch (e) {}
  }

  try {
    var fab = document.createElement('div');
    fab.id = 'sl-plugin-reader-btn';
    fab.title = '阅读模式';
    fab.textContent = '阅读';
    fab.style.cssText = 'position:fixed;right:12px;bottom:120px;z-index:2147483000;' +
      'padding:9px 12px;border-radius:20px;background:rgb(124,58,237,.92);color:#ffffff;' +
      'font-size:12px;font-weight:700;letter-spacing:1px;box-shadow:0 4px 14px rgb(0,0,0,.35);cursor:pointer;';
    fab.onclick = function () { if (box) exit(); else enter(); };
    (document.body || document.documentElement).appendChild(fab);
  } catch (e) {}
})();
