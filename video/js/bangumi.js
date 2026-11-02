/* ==========================================================================
   影视乐园 · bangumi.js（已吞并 Kazumi 的 Bangumi 板块）
   · 推荐（热门趋势）：next.bgm.tv /p1/trending/subjects
   · 时间表（每日放送）：next.bgm.tv /p1/calendar → {1..7: [subject…]}
   · 均带超时；失败时上层降级到本地源的「最新/排行」数据（稳定版兜底）
   ========================================================================== */

(function (w) {
  'use strict';

  var BG = {};

  var TREND = 'https://next.bgm.tv/p1/trending/subjects';
  var CAL = 'https://next.bgm.tv/p1/calendar';
  var MIRROR = 'https://api.kazumi.fyi';
  var MIRROR_POP = '/kazumi/v1/popular/subjects';
  var MIRROR_CAL = '/kazumi/v1/calendar/season';
  var TIMEOUT = 12000;

  // 当前季度起止日期（用于镜像时间表接口）
  function seasonRange() {
    try {
      var now = new Date();
      var y = now.getFullYear();
      var m = now.getMonth() + 1;
      var qs = Math.floor((m - 1) / 3) * 3 + 1;
      var start = new Date(y, qs - 1, 1);
      var end = new Date(y, qs + 2, 1);
      var pad = function (d) { return d < 10 ? '0' + d : '' + d; };
      return { start: y + '-' + pad(qs) + '-01', end: y + '-' + pad(qs + 2) + '-01' };
    } catch (e) { return { start: '2026-10-01', end: '2027-01-01' }; }
  }

  function fetchJson(url) {
    // 走 XP.fetchHtml（同源直连 / 跨域自动经本地 /proxy 代理），避免浏览器 CORS 拦截
    return new Promise(function (resolve, reject) {
      var done = false;
      (w.XP ? w.XP.fetchHtml(url, TIMEOUT) : Promise.resolve('')).then(function (txt) {
        if (done) return;
        done = true;
        if (!txt) { reject(new Error('请求超时或失败')); return; }
        try { resolve(JSON.parse(txt)); }
        catch (e) { reject(new Error('返回不是 JSON')); }
      }).catch(function (e) {
        if (done) return;
        done = true;
        reject(e);
      });
      // 兜底超时
      setTimeout(function () { if (!done) { done = true; reject(new Error('请求超时')); } }, TIMEOUT + 3000);
    });
  }

  // 规整一条 Bangumi 条目 → {name, pic, score, year, id}
  // 兼容两套结构：官方 search/calendar 的 subject 包裹(name_cn) / 镜像 popular 的平铺(nameCN)
  function norm(s) {
    s = s || {};
    var images = s.images || {};
    var name = String(s.name_cn || s.nameCN || s.name || '未命名');
    var rating = (s.rating && typeof s.rating === 'object') ? (s.rating.score != null ? s.rating.score : (s.rating.rating || 0)) : 0;
    return {
      name: name,
      pic: String(images.medium || images.large || images.common || ''),
      score: String(rating || ''),
      year: String(s.air_date || s.date || '').substring(0, 4),
      id: String(s.id != null ? s.id : '')
    };
  }

  /* 热门推荐：镜像优先，官方兜底。返回 [{name,pic,score,year,id}] */
  BG.trending = function (limit) {
    var n = limit || 24;
    var mirror = MIRROR + MIRROR_POP + '?limit=' + n + '&offset=0';
    return fetchJson(mirror).then(function (j) {
      // 镜像 popular：平铺条目（无 subject 包裹）
      var arr = (j && j.data) || [];
      if (!Array.isArray(arr)) arr = [];
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        var it = norm(arr[i]);
        if (it.name && it.name !== '未命名') out.push(it);
      }
      return out;
    }).catch(function () {
      // 官方趋势接口兜底（subject 包裹）
      return fetchJson(TREND + '?type=2&limit=' + n + '&offset=0').then(function (j) {
        var arr = (j && j.data) || [];
        var out = [];
        for (var i = 0; i < arr.length; i++) {
          var it = norm(arr[i] && arr[i].subject);
          if (it.name && it.name !== '未命名') out.push(it);
        }
        return out;
      });
    });
  };

  /* 时间表：镜像季度日历优先，官方每日放送兜底。
     返回 [ [周一..周日的条目数组] ×7 ]，每天 [{name,pic,score,id}] */
  BG.calendar = function () {
    var r = seasonRange();
    var mirror = MIRROR + MIRROR_CAL + '?start=' + r.start + '&end=' + r.end;
    return fetchJson(mirror).then(function (j) {
      return pickDays(j);
    }).catch(function () {
      return fetchJson(CAL).then(function (j) {
        return pickDays(j);
      });
    });
  };

  function pickDays(j) {
    var days = [];
    for (var d = 1; d <= 7; d++) {
      var list = (j && (j['' + d] || j[d])) || [];
      if (!Array.isArray(list)) list = [];
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var s = (list[i] && list[i].subject) || list[i];
        var it = norm(s);
        if (it.name) out.push(it);
      }
      days.push(out);
    }
    return days;
  }

  /* 稳定版兜底：Bangumi 失败时，用本地当前源的最新/排行列表填充推荐 */
  BG.fallback = function (limit) {
    try {
      var V = w.V;
      if (!V || !V.sources || !V.sources.length) return Promise.resolve([]);
      var list = [], apis = [];
      var seen = {};
      for (var i = 0; i < V.sources.length && apis.length < 4; i++) {
        var s = V.sources[i];
        if (s.xpath) continue;                     // XPath 源没有列表接口
        if (s.cat === (w.VIDEO_DEAD_CAT || '失效区')) continue;
        if (seen[s.api]) continue; seen[s.api] = 1;
        apis.push(s.api);
      }
      if (!apis.length) return Promise.resolve([]);
      // 逐源拉第 1 页，取前 limit 条去重
      var jobs = apis.map(function (api) {
        return (w.API ? w.API.list(api, { page: 1 }) : Promise.resolve({ items: [] }))
          .then(function (r) { return r.items || []; })
          .catch(function () { return []; });
      });
      return Promise.all(jobs).then(function (res) {
        var out = [], keyed = {};
        for (var a = 0; a < res.length && out.length < limit; a++) {
          var items = res[a];
          for (var k = 0; k < items.length && out.length < limit; k++) {
            var it = w.API ? w.API.item(items[k]) : null;
            if (!it) continue;
            var key = it.name;
            if (keyed[key]) continue; keyed[key] = 1;
            out.push(it);
          }
        }
        return out;
      });
    } catch (e) { return Promise.resolve([]); }
  };

  w.BG = BG;

})(window);
