/* ==========================================================================
   影视乐园 · sources_update.js
   多源 + 每日远程清单
   · 本地清单：sources_manifest.js（VIDEO_SOURCE_MANIFEST）
   · 远程清单：设置里可填 URL（JSON 数组 / TVBox 配置 / 多仓子配置），保存到 localStorage
   · 启动时检查上次更新时间，超过 24 小时自动拉取 → 解析 → 合并去重 → 写入缓存
   · 远程失败 / 离线 / file:// 下静默回退本地清单，不白屏、不报错
   ========================================================================== */

(function (w) {
  'use strict';

  var LS = {
    url: 'video_remote_manifest_url',
    lastCheck: 'video_manifest_last_check',
    lastOk: 'video_manifest_last_ok',
    cache: 'video_remote_sources'
  };
  var GAP = 24 * 3600 * 1000;       // 24 小时
  var MAX_REMOTE = 120;             // 远程源最多收录 120 个，避免拖慢检测
  var TIMEOUT = 8000;               // 单个地址 8 秒超时

  var ADULT_RE = /(成人|18\+|18禁|av资源|av片|麻豆|色情|涩涩|色播|骚|福利|里番|无码|自拍|偷拍|sex|porn|91md)/i;
  var ANIME_RE = /(动漫|动画|anime|番剧|追番)/i;
  var EDU_RE = /(教育|课堂|少儿|儿童|学习)/i;
  var DRAMA_RE = /(短剧|爽剧|微短剧)/i;
  var ZY_RE = /(综艺)/i;

  function read(k, def) {
    try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
  }
  function write(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }

  /* 接口地址归一化（用于去重）：去掉查询串、结尾斜杠、大小写差异 */
  function norm(u) {
    return String(u || '').trim().split('?')[0].replace(/\/+$/, '').toLowerCase();
  }

  function validApi(u) {
    if (!/^https?:\/\//i.test(u)) return '';
    if (/\.(jar|js|py)(\?|;|$)/i.test(u)) return '';    // 需要爬虫文件的源，网页版不可用
    return u.replace(/\s+/g, '');
  }

  function chooseCat(given, name) {
    var nm = String(name || '');
    if (ADULT_RE.test(nm)) return '成人（18+）';        // 明显成人源只进成人分类
    var cats = w.VIDEO_CATS || [];
    if (given && cats.indexOf(given) >= 0 && given !== (w.VIDEO_DEAD_CAT || '失效区')) return given;
    if (ANIME_RE.test(nm)) return '动漫';
    if (EDU_RE.test(nm)) return '教育';
    if (DRAMA_RE.test(nm)) return '短剧';
    if (ZY_RE.test(nm)) return '综艺';
    return '综合影视';
  }

  /* 合并进内置源数组（就地修改，app.js 启动时读取的就是合并后的数组） */
  function applyList(list, from) {
    var arr = w.VIDEO_SOURCES = w.VIDEO_SOURCES || [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var a0 = arr[i] && (arr[i].a || arr[i].api);
      if (a0) seen[norm(a0)] = 1;
    }
    var added = 0;
    for (var k = 0; k < list.length && added < MAX_REMOTE; k++) {
      var it = list[k];
      if (!it) continue;
      var api = validApi(it.a || it.api);
      if (!api) continue;
      var key = norm(api);
      if (!key || seen[key]) continue;
      seen[key] = 1;
      var name = String(it.n || it.name || api.replace(/^https?:\/\//, '').split('/')[0]).trim();
      var cat = chooseCat(it.c || it.cat, name);
      var obj = { n: name, a: api, c: cat, v: 1 };
      if (from) obj.src = from;
      arr.push(obj);
      added++;
    }
    return added;
  }

  /* 解析任意清单文本 → { list: [{n,a,c}], multi: [{name,url}] } */
  function parseText(text, depth) {
    var out = { list: [], multi: [] };
    var j = null;
    try { j = JSON.parse(String(text || '')); } catch (e) { j = null; }

    if (j) {
      if (Array.isArray(j)) {
        for (var i = 0; i < j.length; i++) {
          var it = j[i];
          if (!it) continue;
          if (typeof it === 'string') { out.list.push({ a: it }); continue; }
          if (it.n && it.a) { out.list.push(it); continue; }
          if (it.name && it.api) { out.list.push(it); continue; }
          if (Array.isArray(it.sites)) {
            for (var s = 0; s < it.sites.length; s++) out.list.push(it.sites[s]);
          }
        }
      } else if (Array.isArray(j.sites)) {
        out.list = j.sites;
      } else if (Array.isArray(j.sources)) {
        for (var q = 0; q < j.sources.length; q++) out.list.push(j.sources[q]);
      } else if (Array.isArray(j.urls)) {
        for (var m = 0; m < j.urls.length; m++) {
          if (j.urls[m] && j.urls[m].url) out.multi.push({ name: j.urls[m].name || '', api: j.urls[m].url });
        }
      } else if (j.api || (j.n && j.a)) {
        out.list.push(j);
      }
    }

    // 解析出的 site 对象统一转成 {n,a,c}
    var list = [];
    for (var z = 0; z < out.list.length; z++) {
      var so = out.list[z];
      if (!so) continue;
      var api = so.a || so.api;
      if (!api) continue;
      if (so.type !== undefined && so.type !== null && String(so.type) !== '' && Number(so.type) !== 1) continue;
      list.push({ n: so.n || so.name || so.key || '', a: api, c: so.c || so.cat || '' });
    }
    out.list = list;

    // 非 JSON：退回 sources.js 的通用解析（纯文本一行一个地址 / TVBox）
    if (!j && w.parseSourceJson) {
      var r = w.parseSourceJson(text);
      if (r && r.ok && r.list) {
        for (var p = 0; p < r.list.length; p++) out.list.push({ n: r.list[p].name, a: r.list[p].api, c: '' });
      }
    }
    return out;
  }

  function fetchText(url) {
    return new Promise(function (resolve, reject) {
      var xhr = null;
      try { xhr = new XMLHttpRequest(); } catch (e) { reject(e); return; }
      try {
        xhr.open('GET', url, true);
        xhr.timeout = TIMEOUT;
        xhr.setRequestHeader('Accept', 'application/json,text/plain,*/*');
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;
          var code = 0;
          try { code = xhr.status; } catch (e) { code = 0; }
          var txt = '';
          try { txt = xhr.responseText || ''; } catch (e) { txt = ''; }
          if ((code >= 200 && code < 300) || (code === 0 && txt)) resolve(txt);
          else reject(new Error('HTTP ' + code));
        };
        xhr.ontimeout = function () { reject(new Error('timeout')); };
        xhr.onerror = function () { reject(new Error('network')); };
        xhr.send();
      } catch (e) { reject(e); }
    });
  }

  /* 取一份清单：多仓配置时只展开第一层第一个子配置 */
  function loadOne(url, depth) {
    return fetchText(url).then(function (txt) {
      var r = parseText(txt, depth || 0);
      if (r.list && r.list.length) return { url: url, list: r.list };
      if (r.multi && r.multi.length && (depth || 0) < 1) {
        return loadOne(r.multi[0].api, (depth || 0) + 1);
      }
      return { url: url, list: [] };
    });
  }

  /* 依次尝试多个地址，直到拿到有效清单 */
  function loadAny(urls) {
    var queue = urls.slice(0);
    var firstErr = null;
    function step() {
      if (!queue.length) return Promise.reject(firstErr || new Error('empty'));
      var u = queue.shift();
      return loadOne(u).then(function (r) {
        if (r.list && r.list.length) return r;
        return step();
      }).catch(function (e) {
        firstErr = firstErr || e;
        return step();
      });
    }
    return step();
  }

  function getUserUrl() {
    var u = read(LS.url, '');
    return (typeof u === 'string' && /^https?:\/\//i.test(u)) ? u : '';
  }

  function defaultUrls() {
    var list = [];
    var d = w.VIDEO_REMOTE_MANIFESTS || [];
    for (var i = 0; i < d.length; i++) if (/^https?:\/\//i.test(d[i])) list.push(d[i]);
    return list;
  }

  function urlsToTry() {
    var out = [];
    var u = getUserUrl();
    if (u) out.push(u);
    var d = defaultUrls();
    for (var i = 0; i < d.length; i++) if (out.indexOf(d[i]) < 0) out.push(d[i]);
    return out;
  }

  function saveCache(at, url, list) {
    write(LS.cache, { at: at, url: url, items: list });
  }

  function applyCache() {
    var c = read(LS.cache, null);
    if (c && c.items && c.items.length) return applyList(c.items, 'cache');
    return 0;
  }

  function lastOk() { return Number(read(LS.lastOk, 0)) || 0; }
  function lastCheck() { return Number(read(LS.lastCheck, 0)) || 0; }

  function statusText() {
    var at = lastOk();
    var c = read(LS.cache, null);
    var n = c && c.items ? c.items.length : 0;
    if (!at) return '远程清单：未更新（正在使用本地清单）';
    return '远程清单：' + n + ' 个候选 · 上次更新 ' + new Date(at).toLocaleString();
  }

  function updateNow(manual) {
    var urls = urlsToTry();
    write(LS.lastCheck, Date.now());
    if (!urls.length) {
      if (manual && w.vToast) w.vToast('没有可用的远程清单地址');
      return Promise.resolve(0);
    }
    return loadAny(urls).then(function (r) {
      var added = applyList(r.list, 'remote');
      saveCache(Date.now(), r.url, r.list.slice(0, MAX_REMOTE));
      write(LS.lastOk, Date.now());
      try { if (w.vSourcesUpdated) w.vSourcesUpdated(); } catch (e) {}
      if (manual && w.vToast) w.vToast('远程清单已更新：新增 ' + added + ' 个源（' + r.url.split('/').pop() + '）', 3200);
      return added;
    }).catch(function () {
      if (manual && w.vToast) w.vToast('远程清单暂时无法访问，已回退本地清单', 3000);
      return 0;
    });
  }

  function checkDaily() {
    if (Date.now() - lastCheck() < GAP) return;
    updateNow(false);
  }

  function removeRemote() {
    var arr = w.VIDEO_SOURCES || [];
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] && arr[i].src) arr.splice(i, 1);
    }
    try { localStorage.removeItem(LS.cache); localStorage.removeItem(LS.lastOk); } catch (e) {}
    try { if (w.vSourcesUpdated) w.vSourcesUpdated(); } catch (e) {}
  }

  /* ---------------- 启动即合并：本地清单 + 上次远程缓存（同步，赶在 app.js boot 前） ---------------- */
  try {
    var man = w.VIDEO_SOURCE_MANIFEST;
    if (man && man.items && man.items.length) applyList(man.items, 'local');
  } catch (e) {}
  try { applyCache(); } catch (e) {}

  w.SRCUPD = {
    getUrl: getUserUrl,
    setUrl: function (u) {
      u = String(u || '').trim();
      if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
      if (u) write(LS.url, u); else { try { localStorage.removeItem(LS.url); } catch (e) {} }
      return u;
    },
    updateNow: function () { return updateNow(true); },
    checkDaily: checkDaily,
    status: statusText,
    meta: function () { return { at: lastOk(), check: lastCheck(), cache: read(LS.cache, null) }; },
    defaults: defaultUrls,
    clear: removeRemote
  };

})(window);
