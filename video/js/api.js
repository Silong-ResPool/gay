/* ==========================================================================
   影视乐园 · api.js
   苹果CMS（MacCMS V10）JSON 接口封装：
   · 分类：?ac=class                    → { class:[{type_id,type_pid,type_name}] }
   · 列表：?ac=detail&pg=1&t=<分类>      → { list:[...], page, pagecount }
   · 搜索：?ac=detail&wd=<关键词>        → { list:[...] }
   · 详情：?ac=detail&ids=<vod_id>       → { list:[ 一条完整数据 ] }
   ========================================================================== */

(function (w) {
  'use strict';

  var API = {};

  /* v9.8.0：默认开启接口缓存（下次打开无需重新加载）；设置里可选 7 天 / 30 天 / 从不 / 永久 */
  var CACHE_KEY = 'video_api_cache_v1';
  function cacheMode(){ try { return (w.V && w.V.cacheMode) || '7d'; } catch (e) { return '7d'; } }
  function cacheTTL(){
    var m = cacheMode();
    if (m === 'never') return -1;
    if (m === 'forever') return 0;
    return (m === '30d' ? 30 : 7) * 24 * 3600 * 1000;
  }
  function readCache(url){
    try {
      var all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      var rec = all[url]; if (!rec) return null;
      var ttl = cacheTTL(); if (ttl < 0) return null;
      if (ttl > 0 && (Date.now() - rec.t) > ttl) { delete all[url]; localStorage.setItem(CACHE_KEY, JSON.stringify(all)); return null; }
      return rec.j;
    } catch (e) { return null; }
  }
  function writeCache(url, j){
    if (cacheTTL() < 0) return;
    try {
      var all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      all[url] = { t: Date.now(), j: j };
      var keys = Object.keys(all);
      if (keys.length > 1200) { keys.sort(function(a,b){return all[a].t-all[b].t}); keys.slice(0,200).forEach(function(k){delete all[k]}); }
      localStorage.setItem(CACHE_KEY, JSON.stringify(all));
    } catch (e) {}
  }
  API.clearCache = function(){ try { localStorage.removeItem(CACHE_KEY); } catch (e) {} };

  function join(api, qs) {
    var a = String(api || '');
    if (!a) return '';
    if (a.charAt(a.length - 1) !== '/' && a.indexOf('.php') < 0 && a.indexOf('?') < 0) a += '/';
    return a + (a.indexOf('?') >= 0 ? '&' : '?') + qs;
  }

  API.url = join;

  // 带超时与重试的 JSON 请求
  // 巳泷 v9.1：给请求加浏览器 UA / Accept —— 部分采集站（Cloudflare 等）会拦截无 UA 或
  // 非浏览器 UA 的请求（返回 503/403/418/521），带 UA 后可用性明显提高。
  var BROWSER_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
  API.fetchJson = function (url, ms, extraOpts) {
    var isPost = extraOpts && extraOpts.method && String(extraOpts.method).toUpperCase() !== 'GET';
    var cached = isPost ? null : readCache(url);
    if (cached) return Promise.resolve(cached);   /* 命中缓存：秒开，不重复爬取 */
    var timeout = ms || 15000;
    return new Promise(function (resolve, reject) {
      var done = false;
      var ctrl = null;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        try { if (ctrl) ctrl.abort(); } catch (e) {}
        reject(new Error('请求超时（' + Math.round(timeout / 1000) + ' 秒）：' + url));
      }, timeout);

      var opts = {
        method: 'GET', cache: 'no-store',
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept': 'application/json, text/plain, */*'
        }
      };
      // 巳泷 v9.2.1：支持 POST（AdultEmbed get-embed 等）
      if (extraOpts && extraOpts.method) opts.method = extraOpts.method;
      // 只有 http(s) 页面才带 Referer（file:// 页面发 file:// 的 Referer 反而会被反盗链拦截）
      try { if (/^https?:/i.test(location.protocol)) opts.headers['Referer'] = location.href; } catch (e) {}
      try {
        if (typeof AbortController !== 'undefined') { ctrl = new AbortController(); opts.signal = ctrl.signal; }
      } catch (e) {}

      var tryFetch = function (u, attempt) {
        return fetch(u, opts).then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        }).then(function (txt) {
          if (done) return;
          done = true; clearTimeout(timer);
          var j = parseJsonLoose(txt);
          if (!j) { reject(new Error('返回内容不是 JSON（该源可能已失效）')); return; }
          if(!isPost) writeCache(url, j);
          resolve(j);
        }).catch(function (err) {
          if (done) return;
          // 巳泷 v9.1：https 失败自动降级 http 重试一次（部分采集站只有 http 线路）
          if (attempt === 0 && /^https:/i.test(u)) {
            var alt = 'http:' + u.slice('https:'.length);
            tryFetch(alt, 1).catch(function (e2) { settleFail(err); });
            return;
          }
          settleFail(err);
        });
      };
      var settleFail = function (err) {
        if (done) return;
        done = true; clearTimeout(timer);
        reject(err && err.message ? err : new Error(String(err)));
      };
      tryFetch(url, 0);
    });
  };

  /* 宽松 JSON 解析：去 BOM / 前后空白 / 去掉 "at/json:" 前缀（个别源在 body 前带标记） */
  function parseJsonLoose(txt) {
    var s = String(txt || '');
    s = s.replace(/^\uFEFF/, '');
    // 去掉类似 at/json: 或 JSON: 的文本前缀
    s = s.replace(/^\s*(?:at\/json|json)\s*:\s*/i, '');
    s = s.trim();
    try { return JSON.parse(s); } catch (e) {}
    // 个别源在数组/对象前后有额外字符
    var m = s.match(/[\[{][\s\S]*[\]}]/);
    if (m) { try { return JSON.parse(m[0]); } catch (e2) {} }
    return null;
  }

  /* ---------------------------------------------------------------- 分类
     苹果CMS 的 ac=list / ac=class / ac=detail 都会返回 class 分类数组，
     这里依次尝试，取到就返回（兼容不同采集程序的实现差异）。 */
  function pickClasses(j) {
    var arr = (j && (j['class'] || j.classes || j.type || j.types)) || [];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i] || {};
      var id = String(c.type_id !== undefined ? c.type_id : (c.id !== undefined ? c.id : ''));
      if (!id) continue;
      out.push({
        id: id,
        pid: String(c.type_pid !== undefined ? c.type_pid : (c.pid !== undefined ? c.pid : '0')),
        name: String(c.type_name || c.name || ('分类' + id))
      });
    }
    return out;
  }

  /* 分类缓存（按接口地址，10 分钟有效）：切换/重进源时秒开，避免重复请求卡顿 */
  var classCache = {};

  API.classes = function (api) {
    var now = Date.now(), hit = classCache[api];
    if (hit && hit.list && (now - hit.at) < 10 * 60 * 1000) return Promise.resolve(hit.list);
    return API.fetchJson(join(api, 'ac=list&pg=1')).then(function (j) {
      var out = pickClasses(j);
      if (out.length) { classCache[api] = { at: Date.now(), list: out }; return out; }
      // 兜底：个别源只在 ac=class 下给分类
      return API.fetchJson(join(api, 'ac=class')).then(function (j2) {
        var out2 = pickClasses(j2);
        if (out2.length) { classCache[api] = { at: Date.now(), list: out2 }; return out2; }
        return API.fetchJson(join(api, 'ac=detail&pg=1')).then(function (j3) {
          var out3 = pickClasses(j3);
          classCache[api] = { at: Date.now(), list: out3 };
          return out3;
        });
      });
    });
  };

  /* ---------------------------------------------------------------- 列表 */
  API.list = function (api, opt) {
    opt = opt || {};
    var qs = 'ac=detail&pg=' + (opt.page || 1);
    if (opt.typeId) qs += '&t=' + encodeURIComponent(opt.typeId);
    if (opt.hours) qs += '&h=' + opt.hours;
    return API.fetchJson(join(api, qs)).then(function (j) {
      return {
        items: (j && j.list) || [],
        page: Number(j && j.page) || (opt.page || 1),
        pagecount: Number((j && (j.pagecount || j.page_count)) || 1),
        total: Number((j && j.total) || 0)
      };
    });
  };

  /* ---------------------------------------------------------------- 搜索 */
  API.search = function (api, wd, page) {
    var qs = 'ac=detail&wd=' + encodeURIComponent(wd) + '&pg=' + (page || 1);
    return API.fetchJson(join(api, qs)).then(function (j) {
      return {
        items: (j && j.list) || [],
        page: Number(j && j.page) || 1,
        pagecount: Number((j && (j.pagecount || j.page_count)) || 1)
      };
    }).catch(function (e) {
      // 少数源只支持 ac=list 搜索
      return API.fetchJson(join(api, 'ac=list&wd=' + encodeURIComponent(wd) + '&pg=' + (page || 1))).then(function (j) {
        return { items: (j && j.list) || [], page: Number(j && j.page) || 1, pagecount: Number((j && (j.pagecount || j.page_count)) || 1) };
      });
    });
  };

  /* ---------------------------------------------------------------- 详情 */
  API.detail = function (api, id) {
    return API.fetchJson(join(api, 'ac=detail&ids=' + encodeURIComponent(id))).then(function (j) {
      var list = (j && j.list) || [];
      return list.length ? list[0] : null;
    });
  };

  /* ------------------------------------------------------------ 数据规整 */
  API.item = function (raw) {
    var it = raw || {};
    return {
      id: String(it.vod_id !== undefined ? it.vod_id : (it.id || '')),
      name: String(it.vod_name || it.name || '未命名'),
      pic: String(it.vod_pic || it.pic || ''),
      remarks: String(it.vod_remarks || it.remarks || ''),
      year: String(it.vod_year || ''),
      area: String(it.vod_area || ''),
      typeName: String(it.type_name || ''),
      score: String(it.vod_score || ''),
      content: String(it.vod_content || it.vod_blurb || '').replace(/<[^>]+>/g, ''),
      raw: it
    };
  };

  /* 播放地址解析：
     vod_play_from: "线路1$$$线路2"  vod_play_url: "第1集$url#第2集$url$$$另一线路..." */
  API.play = function (raw) {
    var froms = String((raw && raw.vod_play_from) || '').split('$$$');
    var urls = String((raw && raw.vod_play_url) || '').split('$$$');
    var groups = [];
    for (var i = 0; i < urls.length; i++) {
      var seg = urls[i];
      if (!seg) continue;
      var eps = [];
      var parts = seg.split('#');
      for (var k = 0; k < parts.length; k++) {
        var s = String(parts[k] || '').trim();
        if (!s) continue;
        var cut = s.indexOf('$');
        var nm = (cut > 0) ? s.substring(0, cut) : ('第' + (k + 1) + '集');
        var u = (cut > 0) ? s.substring(cut + 1) : s;
        if (!/^https?:\/\//i.test(u)) continue;
        eps.push({ name: nm, url: u });
      }
      if (eps.length) groups.push({ from: froms[i] || ('线路' + (i + 1)), eps: eps });
    }
    return groups;
  };

  w.API = API;

  /* ==========================================================================
     Kazumi 式 XPath 规则源分流（已吞并 Kazumi 源规则体系）
     · 源的 api 字段以 "xpath:" 开头，其余为苹果CMS JSON 源
     · XP_RULES：api → 规则对象 映射（由 sources.js/app.js 在加载源时填充）
     · 搜索 / 详情 自动分流到 xpath.js 引擎
     ========================================================================== */
  w.XP_RULES = w.XP_RULES || {};

  function xpRule(api) {
    return w.XP_RULES[String(api || '')] || null;
  }
  API.isXpath = function (api) { return /^xpath:/i.test(String(api || '')); };

  // 搜索：XPath 源 → [{name, src}] → 包装成苹果CMS item 结构（id=详情页URL，raw.src=真实链接）
  function xpSearch(api, wd, page) {
    var rule = xpRule(api);
    var base = API.xpBase || '';
    if (!rule) return Promise.reject(new Error('XPath 规则缺失：' + api));
    return (w.XP ? w.XP.search(rule, wd) : Promise.resolve([])).then(function (list) {
      var items = [];
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        items.push({
          vod_id: 'xp_' + Math.abs(hashStr(it.src)),
          vod_name: it.name,
          vod_pic: '',
          vod_remarks: 'XPath源',
          vod_year: '',
          vod_area: '',
          vod_score: '',
          vod_content: '',
          type_name: '动漫',
          raw: { __xp: true, __src: it.src, __rule: rule }
        });
      }
      return { items: items, page: page || 1, pagecount: 1 };
    });
  }

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h;
  }

  // 详情：XPath 源 → 抓详情页 → 解析线路+集数 → 包装成 vod_play_from / vod_play_url
  function xpDetail(api, raw) {
    var rule = (raw && raw.__rule) || xpRule(api);
    var src = (raw && raw.__src) || '';
    if (!rule || !src) return Promise.reject(new Error('XPath 详情链接缺失'));
    return (w.XP ? w.XP.chapters(rule, src) : Promise.resolve([])).then(function (groups) {
      var froms = [], urls = [];
      for (var i = 0; i < groups.length; i++) {
        froms.push(groups[i].from);
        var eps = [];
        for (var k = 0; k < groups[i].eps.length; k++) {
          var ep = groups[i].eps[k];
          eps.push(ep.name + '$' + ep.url);
        }
        urls.push(eps.join('#'));
      }
      return {
        vod_id: (raw && raw.vod_id) || '',
        vod_name: (raw && raw.vod_name) || '',
        vod_pic: (raw && raw.vod_pic) || '',
        vod_content: (raw && raw.vod_content) || '',
        vod_play_from: froms.join('$$$'),
        vod_play_url: urls.join('$$$'),
        raw: raw || {}
      };
    });
  }

  // 覆盖：搜索
  var _origSearch = API.search;
  API.search = function (api, wd, page) {
    if (API.isXpath(api)) return xpSearch(api, wd, page);
    return _origSearch(api, wd, page);
  };

  // 覆盖：详情（openItem 会先按 it.raw 判断；这里兼容传 raw 的情况）
  var _origDetail = API.detail;
  API.detail = function (api, id) {
    if (API.isXpath(api)) {
      // id 可能是 "xp_xxx" 哈希，也可能是直接详情 URL；先尝试从当前上下文找 raw
      // 兼容两层结构：V.detail.item 是 API.item 包装后的对象，其 .raw 可能是苹果CMS item
      // （真正的 __src 在 .raw.raw.__src），也可能是 XPath 包装结构（.raw.__src 直接可用）
      var src = id, name = '', pic = '', content = '';
      if (/^xp_/.test(String(id))) {
        try {
          var d = w.V && w.V.detail && w.V.detail.item;
          var r = d && d.raw;
          if (r && r.__xp && r.__src) src = r.__src;
          else if (r && r.raw && r.raw.__xp && r.raw.__src) src = r.raw.__src;
          else if (r && r.raw && r.raw.__src) src = r.raw.__src;
          // 带出条目元数据，避免详情页名称显示「未命名」
          if (d) {
            name = String(d.name || (d.vod_name) || '');
            pic = String(d.pic || '');
            content = String(d.content || (d.vod_content || ''));
            if (!name && r) name = String(r.vod_name || r.name || '');
            if (!pic && r) pic = String(r.vod_pic || r.pic || '');
            if (!content && r) content = String(r.vod_content || '');
          }
        } catch (e) {}
      }
      var fakeRaw = { __xp: true, __src: src, __rule: xpRule(api), vod_name: name, vod_pic: pic, vod_content: content };
      return xpDetail(api, fakeRaw);
    }
    return _origDetail(api, id);
  };

  // 覆盖：列表/分类 —— XPath 源不支持分类浏览（只有搜索），返回空
  API.classes = (function (orig) {
    return function (api) {
      if (API.isXpath(api)) return Promise.resolve([]);
      return orig(api);
    };
  })(API.classes);

  API.list = (function (orig) {
    return function (api, opt) {
      if (API.isXpath(api)) return Promise.resolve({ items: [], page: 1, pagecount: 1, total: 0 });
      return orig(api, opt);
    };
  })(API.list);

  // 播放解析：兼容 XPath 包装结构（__xp 标记的 raw 直接走 vod_play_from/vod_play_url 字段）
  var _origPlay = API.play;
  API.play = function (raw) {
    if (raw && raw.__xp) {
      // XPath 源：从 detail 结果拿线路
      return _origPlay({ vod_play_from: (raw && raw.vod_play_from) || '', vod_play_url: (raw && raw.vod_play_url) || '' });
    }
    return _origPlay(raw || {});
  };

  /* ==========================================================================
     巳泷 v9.0.9：男同专区适配（api 前缀 gae:）
     源 api = "gae:https://adultembed.com"（无服务端，WebView 内允许跨域）。
     主源 AdultEmbed 数据库浏览接口（可达、约 3.4 万条、带封面/简介）；
     Eporner（gay=2）作为回退。
     ========================================================================== */
  function isGae(api) { return /^gae:/i.test(String(api || '')); }
  function gaeBase(api) { return String(api || '').replace(/^gae:/i, '').replace(/\/+$/, ''); }
  function gaeGet(url) { return API.fetchJson(url, 18000); }

  var GAE_CLASSES = [
    { id: 'gay', name: '男同精选', pid: '0' },
    { id: 'gay-latest', name: '男同最新', pid: '0' },
    { id: 'gay-4k', name: '高清4K', pid: '0' },
    { id: 'gay-amateur', name: '业余自拍', pid: '0' },
    { id: 'gay-threesome', name: '群P', pid: '0' },
    { id: 'gay-asian', name: '亚洲男同', pid: '0' },
    { id: 'gay-eu', name: '欧美男同', pid: '0' }
  ];

  // 男同视频 → 苹果CMS item 结构
  function gaeItem(v, idx) {
    var id = String(v.id != null ? v.id : ('g' + Date.now() + '_' + (idx || 0)));
    var title = String(v.title || v.vod_name || '未命名');
    var pic = String(v.thumbnail || v.default_thumb && v.default_thumb.src || v.vod_pic || '');
    var durTxt = '';
    if (v.duration_seconds) durTxt = Math.floor(Number(v.duration_seconds) / 60) + ' 分钟';
    else if (v.secs) durTxt = Math.floor(Number(v.secs) / 60) + ' 分钟';
    if (v.resolution) durTxt += (durTxt ? ' · ' : '') + v.resolution;
    if (v.view_count != null) durTxt += (durTxt ? ' · ' : '') + Number(v.view_count).toLocaleString() + ' 播放';
    var tags = [];
    if (v.categories) Array.prototype.forEach.call(v.categories, function (c) { if (c && c.name) tags.push(c.name); });
    if (v.tags) Array.prototype.forEach.call(v.tags, function (t) { if (t && (t.name || t.tag_name)) tags.push(t.name || t.tag_name); });
    if (!tags.length && v.vod_remarks) tags = [v.vod_remarks];
    var content = String(v.description || v.vod_content || '').replace(/<[^>]+>/g, '').slice(0, 300);
    return {
      vod_id: 'gae_' + id,
      vod_name: title,
      vod_pic: pic,
      vod_remarks: durTxt,
      vod_score: '',
      vod_content: content,
      type_name: '男同',
      raw: { __gae: true, __v: v }
    };
  }

  // 播放信息：从视频对象直接取直链（Eporner=mp4/hls 直链；AdultEmbed=观看页网页，播放器会嗅探）
  function gaePlay(raw) {
    var v = (raw && raw.__v) ? raw.__v : raw;
    var eps = [];
    var url = String(v.vod_play_url || v.url_embed || v.url || '');
    if (v.hls && v.hls.src) url = v.hls.src;
    else if (v.mp4) {
      ['1080p', '720p', '480p', '360p'].forEach(function (k) { if (v.mp4[k] && v.mp4[k].src && !url) url = v.mp4[k].src; });
    }
    // 巳泷 v9.2.0：AdultEmbed 类型条目无直链字段 → 用观看页地址（含 slug 更稳，走嗅探）
    if (!/^https?:\/\//i.test(url)) {
      var id = String(v.id != null ? v.id : (raw && raw.vod_id));
      var slug = String(v.slug || '');
      url = gaeWatchUrl(v, id, slug);
    }
    if (/^https?:\/\//i.test(url)) {
      if (v.hls && v.hls.src) eps.push({ name: '高清HLS', url: v.hls.src });
      if (v.mp4) {
        ['1080p', '720p', '480p', '360p'].forEach(function (k) {
          if (v.mp4[k] && v.mp4[k].src) eps.push({ name: k.toUpperCase(), url: v.mp4[k].src });
        });
      }
      if (!eps.length) eps.push({ name: '播放', url: url });
      var seen = [];
      eps = eps.filter(function (e) { if (seen.indexOf(e.url) >= 0) return false; seen.push(e.url); return true; });
    }
    return [{ from: '男同专区', eps: eps }];
  }
  function gaeWatchUrl(v, id, slug) {
    try {
      var base = String(gaeCurBase() || 'https://adultembed.com');
      if (v && v.url && /^https?:\/\//i.test(String(v.url))) return v.url;
      if (v && v.watch_url) return v.watch_url;
      // 巳泷 v9.2.0：优先带 slug 的观看页（服务端真实页面），?v=id 兜底
      if (slug) return base + '/?v=' + encodeURIComponent(id) + '&s=' + encodeURIComponent(slug);
      return base + '/?v=' + id;
    } catch (e) { return 'https://adultembed.com/?v=' + id; }
  }

  // 当前源 base（列表请求后记录，供详情用）
  var __gaeBase = '';
  function gaeCurBase() { return __gaeBase || 'https://adultembed.com'; }

  // 列表/搜索：巳泷 v9.2.0 —— AdultEmbed 优先（国内可达、3.4 万条同性内容、带封面/时长），
  // 其播放走观看页嗅探（视频在 Doodstream embed 内）；Eporner（gay=2，海外）作回退（国内常超时）
  function gaeList(api, opt) {
    opt = opt || {};
    var base = gaeBase(api);
    __gaeBase = base;
    var page = opt.page || 1;
    var kw = opt.keyword || '';
    var cls = opt.typeId || 'gay';
    var adultUrl = base + '/api/database/browse/?orientation=gay' +
      (kw ? '&search=' + encodeURIComponent(kw) : '') + '&page=' + page;
    return gaeGet(adultUrl).then(function (j) {
      var list = (j && j.results) || [];
      var items = list.map(function (v, i) { return gaeItem(v, i); });
      var total = Number((j && j.count) || 0);
      return { items: items, page: page, pagecount: Math.max(1, Math.ceil((total || 1000) / 20)), total: total || items.length };
    }).catch(function () {
      // 回退：Eporner（海外源，国内网络可能超时）
      var q = kw ? encodeURIComponent(kw) : gaeClassQuery(cls);
      var epoUrl = 'https://www.eporner.com/api/v2/video/search/?query=' + q + '&per_page=20&page=' + page + '&gay=2&format=json' +
        (cls === 'gay-4k' ? '&quality=hd' : '');
      return gaeGet(epoUrl).then(function (j2) {
        var list2 = (j2 && j2.videos) || [];
        var items2 = list2.map(function (v, i) { return gaeItem(v, i); });
        var total2 = Number((j2 && j2.total) || 0);
        return { items: items2, page: page, pagecount: Math.max(1, Math.ceil(total2 / 20)), total: total2 };
      });
    });
  }
  function gaeClassQuery(cls) {
    if (cls === 'gay-4k') return 'hd';
    if (cls === 'gay-amateur') return 'amateur gay';
    if (cls === 'gay-threesome') return 'threesome gay';
    if (cls === 'gay-asian') return 'asian gay';
    if (cls === 'gay-eu') return 'europe gay';
    if (cls === 'gay-latest') return 'gay';
    return 'gay';
  }

  // 分流：gae: 前缀源
  var _gaeOrigList = API.list;
  API.list = function (api, opt) {
    if (isGae(api)) return gaeList(api, opt);
    return _gaeOrigList(api, opt);
  };
  var _gaeOrigSearch = API.search;
  API.search = function (api, wd, page) {
    if (isGae(api)) return gaeList(api, { keyword: wd || 'gay', page: page || 1 });
    return _gaeOrigSearch(api, wd, page);
  };
  API.classes = (function (orig2) {
    return function (api) {
      if (isGae(api)) return Promise.resolve(GAE_CLASSES);
      return orig2(api);
    };
  })(API.classes);
  API.detail = (function (orig3) {
    return function (api, id) {
      if (isGae(api)) {
        // 巳泷 v9.2.1：详情 → 尝试 AdultEmbed get-embed 接口拿带签名直链播放器页（可真正播放），失败回退观看页
        var d = null;
        try {
          var det = w.V && w.V.detail && w.V.detail.item;
          if (det && det.raw && det.raw.__gae && det.raw.__v) d = det;
          else if (det && det.raw && det.raw.__v) d = det;
        } catch (e) {}
        if (!d) return Promise.resolve(null);
        var v = d.raw.__v || d.raw;
        var vid = String(v.id != null ? v.id : '');
        var groups = gaePlay(v);
        var build = function (groups2) {
          return {
            vod_id: String(d.id || d.vod_id || ''),
            vod_name: String(d.name || d.vod_name || ''),
            vod_pic: String(d.pic || (v.thumbnail) || ''),
            vod_content: String(d.content || v.description || ''),
            vod_play_from: groups2.length ? groups2.map(function (g) { return g.from; }).join('$$$') : '',
            vod_play_url: groups2.length ? groups2.map(function (g) { return g.eps.map(function (e) { return e.name + '$' + e.url; }).join('#'); }).join('$$$') : '',
            raw: { __gae: true, __v: v }
          };
        };
        if (!vid) return Promise.resolve(build(groups));
        // 调用 get-embed：player_url（带签名直链播放器页）作为首选，嗅探播放
        return API.fetchJson('https://adultembed.com/api/videos/' + vid + '/get-embed/', 12000, { method: 'POST' }).then(function (ej) {
          try {
            var pu = ej && ej.player_url;
            if (pu && /^https?:\/\//i.test(pu)) {
              var eps = [{ name: '直接播放', url: pu }];
              // 观看页作第二线路（嗅探/网页）
              var wg = gaePlay(v);
              if (wg.length && wg[0].eps.length) eps = eps.concat(wg[0].eps.filter(function (e2) { return e2.url !== pu; }));
              var seen2 = [];
              eps = eps.filter(function (e3) { if (seen2.indexOf(e3.url) >= 0) return false; seen2.push(e3.url); return true; });
              return build([{ from: '男同专区', eps: eps }]);
            }
          } catch (e) {}
          return build(groups);
        }).catch(function () { return build(groups); });
      }
      return orig3(api, id);
    };
  })(API.detail);

  // 播放解析：兼容 gae 源（__gae 标记）——点击详情即出线路
  var _origPlay2 = API.play;
  API.play = function (raw) {
    if (raw && raw.__gae) return gaePlay(raw.__v || raw);
    return _origPlay2(raw || {});
  };

  /* ==========================================================================
     巳泷 v9.3.0：男同专区 · 自动爬取聚合（api 前缀 gayagg:）
     进入「成人」分类默认进入本专区。自动遍历全部成人接口：
       ① 源名 / 仓库名命中关键词的源 → 整源拉取
       ② 各源下的分类标签命中关键词 → 直接读取该分类
       ③ 用关键词在各源搜索 → 命中 片名/标签/简介 的视频才收录
     关键词：男同 / 男同性恋 / gay / BL / yaoi / 耽美
     排除：男同学（"男同"后紧跟"学"字不算命中）
     ========================================================================== */
  function isGayAgg(api) { return /^gayagg:/i.test(String(api || '')); }

  // 命中判定：片名 / 分类名 / 视频自带标签（vod_class/type_name/vod_tag/vod_keywords/vod_content 等）
  function gayHitText() {
    var args = arguments;
    for (var i = 0; i < args.length; i++) {
      var t = String(args[i] == null ? '' : args[i]);
      if (!t) continue;
      if (t.indexOf('男同性恋') >= 0) return true;
      if (/男同(?!学)/.test(t)) return true;          // 明确的"男同"，排除"男同学"
      var low = t.toLowerCase();
      if (low.indexOf('gay') >= 0) return true;
      if (low.indexOf('yaoi') >= 0) return true;
      if (t.indexOf('耽美') >= 0) return true;
      if (/(?:^|[^a-z])bl(?:[^a-z]|$)/.test(low)) return true;   // 独立的 BL，避免误命中 blue 等
    }
    return false;
  }

  var GAY_CLASSES = [
    { id: 'all',    name: '男同·全部', pid: '0' },
    { id: 'nantong', name: '男同', pid: '0' },
    { id: 'gay',    name: 'Gay', pid: '0' },
    { id: 'bl',     name: 'BL', pid: '0' },
    { id: 'yaoi',   name: 'Yaoi', pid: '0' },
    { id: 'danmei', name: '耽美', pid: '0' }
  ];
  var GAY_KW = {
    all:      ['男同', '男同性恋', 'gay', 'BL', 'yaoi', '耽美'],
    nantong:  ['男同', '男同性恋'],
    gay:      ['gay'],
    bl:       ['BL'],
    yaoi:     ['yaoi'],
    danmei:   ['耽美']
  };
  var GAY_PAGE_SIZE = 100;

  // 取参与聚合的成人单线源（仓库 t:"m" 不在此直接参与，需要用户自行展开）
  function gaySources() {
    var out = [];
    var seen = {};
    var list = (w.VIDEO_SOURCES || []);
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || s.t || s.xpath) continue;                       // 跳过仓库入口 / XPath 源
      if ((s.c || '') !== '成人（18+）') continue;
      var api = s.a || s.api;
      if (!/^https?:\/\//i.test(api)) continue;
      if (seen[api]) continue;
      seen[api] = 1;
      out.push({ name: s.n || s.name || api, api: api, v: s.v });
    }
    // 已验证可用(v:1) 的排前面
    out.sort(function (a, b) { return (b.v ? 1 : 0) - (a.v ? 1 : 0); });
    return out;
  }

  // 判断一个源本身是否为男同主题（源名命中 → 整源内容都收录，不再逐条过滤）
  function gaySourceIsThemed(s) {
    return gayHitText(s.name);
  }

  function gayItemFields(raw) {
    try {
      return [
        raw.vod_name, raw.vod_class, raw.type_name, raw.vod_tag,
        raw.vod_keywords, raw.vod_actor, raw.vod_director, raw.vod_content, raw.vod_blurb,
        (raw.vod_type_name || ''), (raw.tags || '')
      ];
    } catch (e) { return [raw.vod_name]; }
  }

  // 限制并发的批量请求
  function gayPool(tasks, limit) {
    limit = limit || 6;
    return new Promise(function (resolve) {
      var i = 0, done = 0, results = new Array(tasks.length);
      if (!tasks.length) return resolve(results);
      var launch = function () {
        var idx = i++;
        if (idx >= tasks.length) return;
        Promise.resolve().then(function () { return tasks[idx](); })
          .then(function (r) { results[idx] = r; })
          .catch(function () { results[idx] = null; })
          .then(function () {
            done++;
            if (done >= tasks.length) resolve(results);
            else launch();
          });
      };
      for (var k = 0; k < Math.min(limit, tasks.length); k++) launch();
    });
  }

  // 聚合结果池：typeId → { items:[], page:1 }（一个分类会话内缓存，避免翻页重复请求）
  var gayPoolCache = {};

  // 单个关键词在单个源上搜索，返回命中的 raw 列表（已打 __gayApi 标记）
  function gaySearchOne(s, kw) {
    return API.fetchJson(join(s.api, 'ac=detail&wd=' + encodeURIComponent(kw) + '&pg=1'), 12000)
      .then(function (j) {
        var arr = (j && j.list) || [];
        var hit = [];
        for (var i = 0; i < arr.length; i++) {
          var raw = arr[i];
          if (!raw) continue;
          // 整源男同主题 → 全收；否则要求视频片名/标签命中
          if (gaySourceIsThemed(s) || gayHitText.apply(null, gayItemFields(raw))) {
            raw.__gayApi = s.api; raw.__gaySrc = s.name;
            hit.push(raw);
          }
        }
        return hit;
      })
      .catch(function () { return []; });
  }

  // 分类名命中 → 直接读该分类第 1 页（整页都属该男同分类，直接收录）
  function gayCategoryScan(s) {
    return API.classes(s.api).then(function (cls) {
      var hitIds = [];
      for (var i = 0; i < cls.length; i++) {
        if (gayHitText(cls[i].name)) hitIds.push(cls[i].id);
      }
      if (!hitIds.length) return [];
      var jobs = hitIds.slice(0, 3).map(function (tid) {
        return API.fetchJson(join(s.api, 'ac=detail&pg=1&t=' + encodeURIComponent(tid)), 12000)
          .then(function (j) {
            var arr = (j && j.list) || [];
            for (var k = 0; k < arr.length; k++) {
              if (arr[k]) { arr[k].__gayApi = s.api; arr[k].__gaySrc = s.name; }
            }
            return arr;
          })
          .catch(function () { return []; });
      });
      return Promise.all(jobs).then(function (groups) {
        var out = [];
        groups.forEach(function (g) { out = out.concat(g || []); });
        return out;
      });
    }).catch(function () { return []; });
  }

  // 拉取并聚合（核心）
  function gayFetch(typeId) {
    var srcs = gaySources();
    var kws = GAY_KW[typeId] || GAY_KW.all;
    // 源名命中关键词的源：直接整源拉取（只读首页列表）
    var themed = srcs.filter(gaySourceIsThemed);
    var normal = srcs.filter(function (s) { return !gaySourceIsThemed(s); });
    // 控制总量：普通源最多参与 14 个，关键词最多 3 个/源（全部分类时），避免请求爆炸
    normal = normal.slice(0, 14);
    var useKws = kws.slice(0, typeId === 'all' ? 4 : 2);

    var tasks = [];
    /* 快速兜底：155api 的「男同」关键词命中量大且接口稳定，先塞一组保证成人区不为空 */
    tasks.push(function () {
      var fkw = typeId === 'all' ? '男同' : kws[0];
      return API.fetchJson(join('https://155api.com/api.php/provide/vod', 'ac=detail&wd=' + encodeURIComponent(fkw) + '&pg=1'), 15000)
        .then(function (j) {
          var arr = (j && j.list) || [];
          for (var k = 0; k < arr.length; k++) {
            if (arr[k]) { arr[k].__gayApi = 'https://155api.com/api.php/provide/vod'; arr[k].__gaySrc = '男同专区'; }
          }
          return arr;
        }).catch(function () { return []; });
    });
    // ① 主题源整源拉取
    themed.slice(0, 10).forEach(function (s) {
      tasks.push(function () {
        return API.fetchJson(join(s.api, 'ac=detail&pg=1'), 12000)
          .then(function (j) {
            var arr = (j && j.list) || [];
            for (var k = 0; k < arr.length; k++) if (arr[k]) { arr[k].__gayApi = s.api; arr[k].__gaySrc = s.name; }
            return arr;
          }).catch(function () { return []; });
      });
    });
    // ② 分类名扫描（仅"全部"分类下执行一次，成本较高）
    if (typeId === 'all') {
      normal.slice(0, 8).forEach(function (s) {
        tasks.push(function () { return gayCategoryScan(s); });
      });
    }
    // ③ 关键词搜索
    normal.forEach(function (s) {
      useKws.forEach(function (kw) {
        tasks.push(function () { return gaySearchOne(s, kw); });
      });
    });

    return gayPool(tasks, 6).then(function (groups) {
      var seen = {}, out = [];
      groups.forEach(function (g) {
        if (!g || !g.length) return;
        for (var i = 0; i < g.length; i++) {
          var raw = g[i];
          var key = String(raw.vod_id || raw.id || '') + '|' + String(raw.vod_name || '');
          if (seen[key]) continue;
          seen[key] = 1;
          out.push(raw);
        }
      });
      return out;
    });
  }

  // 对外：classes / list 分流
  var _gayOrigClasses = API.classes;
  API.classes = function (api) {
    if (isGayAgg(api)) return Promise.resolve(GAY_CLASSES);
    return _gayOrigClasses(api);
  };

  var _gayOrigList = API.list;
  API.list = function (api, opt) {
    if (isGayAgg(api)) {
      opt = opt || {};
      var typeId = String(opt.typeId || 'all');
      if (GAY_KW[typeId] === undefined) typeId = 'all';
      var page = opt.page || 1;
      var cache = gayPoolCache[typeId];
      var buildResp = function (raws) {
        var start = (page - 1) * GAY_PAGE_SIZE;
        var slice = raws.slice(start, start + GAY_PAGE_SIZE);
        return {
          items: slice,
          page: page,
          pagecount: Math.max(1, Math.ceil(raws.length / GAY_PAGE_SIZE)),
          total: raws.length
        };
      };
      if (cache && cache.items) return Promise.resolve(buildResp(cache.items));
      return gayFetch(typeId).then(function (raws) {
        gayPoolCache[typeId] = { items: raws };
        return buildResp(raws);
      });
    }
    return _gayOrigList(api, opt);
  };

  var _gayOrigSearch = API.search;
  API.search = function (api, wd, page) {
    if (isGayAgg(api)) {
      // 专区内搜索：聚合各成人源搜索结果，仍只保留男同关键词命中（保持专区内容纯粹）
      var srcs = gaySources().slice(0, 12);
      var tasks = srcs.map(function (s) {
        return function () {
          return API.fetchJson(join(s.api, 'ac=detail&wd=' + encodeURIComponent(wd) + '&pg=' + (page || 1)), 12000)
            .then(function (j) {
              var arr = (j && j.list) || [];
              for (var k = 0; k < arr.length; k++) {
                if (arr[k] && (gaySourceIsThemed(s) || gayHitText.apply(null, gayItemFields(arr[k])))) {
                  arr[k].__gayApi = s.api; arr[k].__gaySrc = s.name;
                } else if (arr[k]) arr[k].__gaySkip = 1;
              }
              return arr.filter(function (r) { return r && !r.__gaySkip; });
            }).catch(function () { return []; });
        };
      });
      return gayPool(tasks, 6).then(function (groups) {
        var seen = {}, out = [];
        groups.forEach(function (g) {
          (g || []).forEach(function (raw) {
            var key = String(raw.vod_id || '') + '|' + String(raw.vod_name || '');
            if (seen[key]) return;
            seen[key] = 1; out.push(raw);
          });
        });
        return { items: out, page: page || 1, pagecount: 1 };
      });
    }
    return _gayOrigSearch(api, wd, page);
  };

  var _gayOrigDetail = API.detail;
  API.detail = function (api, id) {
    // 聚合条目详情：用条目自带的源接口回源补全（由 app.js 传入真实源地址；兜底扫描当前列表）
    if (isGayAgg(api)) {
      try {
        var hit = null;
        var findIn = function (arr) {
          for (var i = 0; i < (arr || []).length; i++) {
            if (String(arr[i].vod_id || arr[i].id) === String(id)) return arr[i];
          }
          return null;
        };
        if (w.V && w.V.items) {
          for (var j = 0; j < w.V.items.length; j++) {
            var it = w.V.items[j];
            if (String(it.id) === String(id) && it.raw && it.raw.__gayApi) { hit = it.raw; break; }
          }
        }
        if (hit && hit.__gayApi) {
          return _gayOrigDetail(hit.__gayApi, id).then(function (raw) {
            if (raw) { raw.__gayApi = hit.__gayApi; raw.__gaySrc = hit.__gaySrc; }
            return raw || hit;
          }).catch(function () { return hit; });
        }
      } catch (e) {}
      return Promise.resolve(null);
    }
    return _gayOrigDetail(api, id);
  };

  // 男同专区分类切换时清空聚合池（源更新后可重新拉取）
  API.gayClearPool = function () { gayPoolCache = {}; };

})(window);