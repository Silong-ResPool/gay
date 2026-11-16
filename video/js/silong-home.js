/* ============================================================
   巳泷影视 · 首页增强（2026-11-11）
   顶部导航 + 热门推荐 + 结果卡片海报化
   ============================================================ */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  window.slHistory = function (e) { try { toggleHistory(e); } catch (x) {} };
  window.slSettings = function (e) { try { toggleSettings(e); } catch (x) {} };

  function loadRec() {
    var box = $('slRecList');
    if (!box) return;
    var keys = (window.DEFAULT_API_KEYS || []).filter(function (k) {
      return API_SITES[k] && !API_SITES[k].adult;
    });
    if (!keys.length) {
      box.innerHTML = '<div class="sl-rec-empty">暂无可用推荐源。</div>';
      return;
    }
    var key = keys[0], src = API_SITES[key];
    var url = src.api.replace(/\/+$/, '') + '/api.php/provide/vod/?ac=detail&pg=1';
    box.innerHTML = new Array(7).join('<div class="sl-rec-skel"></div>');
    fetch(proxyUrl(url), { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var list = (j && j.list || []).slice(0, 14);
        if (!list.length) throw new Error('empty');
        box.innerHTML = list.map(function (it) {
          var id = String(it.vod_id || '').replace(/[^\w-]/g, '');
          var nm = esc(it.vod_name || '');
          var nmJs = String(it.vod_name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          var pic = String(it.vod_pic || '');
          var rmk = esc(it.vod_remarks || '');
          return '<div class="sl-rec-card" onclick="showDetails(\'' + id + '\',\'' + nmJs + '\',\'' + key + '\')">' +
            '<div class="sl-rec-pic">' +
            (pic ? '<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(pic) + '" onerror="this.style.display=\'none\'">' : '') +
            '<span class="sl-rec-rmk">' + rmk + '</span></div>' +
            '<div class="sl-rec-nm">' + nm + '</div></div>';
        }).join('');
      })
      .catch(function () {
        box.innerHTML = '<div class="sl-rec-empty">推荐加载失败，直接搜索试试。</div>';
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(loadRec, 400);
    var kw = $('searchInput');
    if (kw) {
      kw.setAttribute('placeholder', '搜索电影 / 剧集 / 动漫 / 短剧…');
    }
  });
})();
