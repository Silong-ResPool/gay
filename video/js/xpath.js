/* ==========================================================================
   影视乐园 · xpath.js（Kazumi 式 XPath 规则引擎，已吞并 Kazumi 源规则体系）
   --------------------------------------------------------------------------
   规则格式（与 Kazumi plugins 完全一致）：
   {
     name:  '源名',  type: 'anime',
     baseURL: 'https://dmbus.cc/',
     searchURL: 'https://dmbus.cc/s----------.html?wd=@keyword',   // @keyword 占位符
     searchList:   '//div/div[3]/ul/li',    // 搜索结果列表节点
     searchName:   '//div/a[2]',            // 条目名称（在 searchList 节点内求值）
     searchResult: '//div/a[2]',            // 条目链接（href，在 searchList 节点内求值）
     chapterRoads: '//div/div[4]/div/ul',   // 播放线路容器（在详情页 document 求值）
     chapterResult: '//li/a',               // 单集链接（在 road 节点内求值）
     muliSources: true, usePost: false, useWebview: true, userAgent: ''
   }
   · 与 Kazumi 逻辑一致：searchName/searchResult 在 searchList 节点上下文求值，
     chapterResult 在 chapterRoads 节点上下文求值，链接取 href 并基于 baseURL 归一化。
   · 抓取：Android 端（file:// + allowUniversalAccess）直连 fetch；
     PC 测试版走本地代理 /proxy?url=…（由 server.ps1 提供），统一环境差异。
   ========================================================================== */

(function (w) {
  'use strict';

  var XP = {};

  var BROWSER_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

  /* ---------------------------------------------------------------- 抓取 */
  // 抓一段 HTML 文本（带 UA；失败返回空串，由调用方判断）
  XP.fetchHtml = function (url, ms) {
    var timeout = ms || 15000;
    return new Promise(function (resolve) {
      var done = false;
      var ctrl = null;
      var timer = setTimeout(function () { if (!done) { done = true; resolve(''); } }, timeout);
      var opts = {
        method: 'GET', cache: 'no-store',
        headers: { 'User-Agent': BROWSER_UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }
      };
      try {
        if (typeof AbortController !== 'undefined') { ctrl = new AbortController(); opts.signal = ctrl.signal; }
      } catch (e) {}

      // 代理检测：页面自身跑在 http(s) 上，且目标跨域 → 走本地代理转发（PC 测试版）
      var viaProxy = /^https?:/i.test(location.protocol) && !sameHost(url);
      var target = viaProxy ? '/proxy?url=' + encodeURIComponent(url) : url;

      fetch(target, opts).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      }).then(function (txt) {
        if (!done) { done = true; clearTimeout(timer); resolve(String(txt || '')); }
      }).catch(function (e) {
        if (!done) { done = true; clearTimeout(timer); resolve(''); }
      });
    });
  };

  function sameHost(u) {
    try {
      var a = new URL(String(u || ''), location.href);
      return a.host === location.host;
    } catch (e) { return false; }
  }
  w.xpSameHost = sameHost;

  /* ------------------------------------------------------ 链接归一化 */
  // 基于 baseURL 把相对/绝对地址拼成完整 URL（与 Kazumi normalizeEpisodeUrl 一致）
  XP.normalize = function (base, src) {
    try {
      var s = String(src || '').trim();
      if (!s) return '';
      if (/^https?:/i.test(s)) return s;
      if (/^\/\//i.test(s)) return (base.indexOf('https:') === 0 ? 'https:' : 'http:') + s;
      var b = String(base || '').trim();
      if (!/^https?:/i.test(b)) b = 'https://' + b;
      if (s.charAt(0) === '/') {
        var m = b.match(/^(https?:\/\/[^/]+)/i);
        return (m ? m[1] : b) + s;
      }
      if (!/\/$/.test(b) && b.indexOf('/') >= 0) { b = b.replace(/\/[^/]*$/, '/'); }
      return b + s;
    } catch (e) { return ''; }
  };

  /* ------------------------------------------------------ XPath 求值 */
  // 解析 HTML 为 document，返回根元素；失败返回 null
  function toDoc(html) {
    try {
      var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
      return doc;
    } catch (e) { return null; }
  }

  // 在 context（Element 或 Document）上求值 XPath，返回节点数组
  // 兼容 Kazumi XPath 库的相对语义：表达式以 "//" 开头时，若 context 是元素节点
  // 则自动改为 ".//"（从当前节点开始找后代），避免浏览器标准里 "//" 永远从文档根算
  XP.nodes = function (context, expr) {
    try {
      var list = [];
      if (!context || !expr || !String(expr).trim()) return list;
      var e = String(expr).trim();
      var isElement = (context.nodeType === 1);
      if (isElement && e.charAt(0) === '/' && e.charAt(1) === '/') e = '.' + e;
      var r = document.evaluate(e, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i = 0; i < r.snapshotLength; i++) list.push(r.snapshotItem(i));
      return list;
    } catch (e) { return []; }
  };

  function firstNode(context, expr) {
    var n = XP.nodes(context, expr);
    return n.length ? n[0] : null;
  }

  function nodeText(node) {
    if (!node) return '';
    try { return (node.textContent || '').trim(); } catch (e) { return ''; }
  }

  function nodeHref(node) {
    if (!node) return '';
    try { return String(node.getAttribute('href') || '').trim(); } catch (e) { return ''; }
  }

  /* ------------------------------------------------------ 搜索 */
  // 返回 [{name, src}] ；失败返回 []
  XP.search = function (rule, keyword) {
    if (!rule || !rule.searchURL || !rule.searchList) return Promise.resolve([]);
    var q = String(keyword || '');
    if (!q) return Promise.resolve([]);
    var url = String(rule.searchURL).replace(/@keyword/g, encodeURIComponent(q));
    return XP.fetchHtml(url).then(function (html) {
      if (!html) return [];
      var doc = toDoc(html);
      if (!doc) return [];
      var root = doc.documentElement;
      var listNodes = XP.nodes(root, rule.searchList);
      var out = [];
      for (var i = 0; i < listNodes.length; i++) {
        var node = listNodes[i];
        try {
          var nameEl = rule.searchName ? firstNode(node, rule.searchName) : null;
          var srcEl = rule.searchResult ? firstNode(node, rule.searchResult) : null;
          var name = nodeText(nameEl);
          var src = nodeHref(srcEl);
          if (!name && srcEl) name = nodeText(srcEl);
          if (!name || !src) continue;
          out.push({ name: name, src: XP.normalize(rule.baseURL, src) });
        } catch (e) {}
      }
      return out;
    });
  };

  /* ------------------------------------------------------ 详情（线路+集数） */
  // 返回 [{from, eps:[{name,url}]}] ；失败返回 []
  XP.chapters = function (rule, detailUrl) {
    if (!rule || !detailUrl) return Promise.resolve([]);
    return XP.fetchHtml(detailUrl).then(function (html) {
      if (!html) return [];
      var doc = toDoc(html);
      if (!doc) return [];
      var root = doc.documentElement;
      if (!rule.chapterRoads || !rule.chapterResult) return [];
      var roadNodes = XP.nodes(root, rule.chapterRoads);
      var out = [];
      for (var r = 0; r < roadNodes.length; r++) {
        var road = roadNodes[r];
        try {
          var eps = [];
          var epNodes = XP.nodes(road, rule.chapterResult);
          for (var k = 0; k < epNodes.length; k++) {
            try {
              var src = nodeHref(epNodes[k]);
              if (!src) continue;
              var nm = String(epNodes[k].textContent || '').replace(/\s+/g, '');
              if (!nm) nm = '第' + (k + 1) + '集';
              eps.push({ name: nm, url: XP.normalize(rule.baseURL, src) });
            } catch (e) {}
          }
          if (!eps.length) continue;
          out.push({ from: '播放线路' + (out.length + 1), eps: eps });
        } catch (e) {}
      }
      return out;
    });
  };

  /* ------------------------------------------------------ 嗅探页内视频地址
     有些源的集数页是播放器页（非直连 m3u8），需在页面 HTML/脚本里找真实视频地址。
     返回首个匹配的 m3u8/mp4 直连地址；找不到返回 ''。 */
  XP.sniffInHtml = function (html, baseURL) {
    try {
      var h = String(html || '');
      if (!h) return '';
      // 常见形态：var url = "xxx.m3u8" / video src= / player_aaaa = "..."
      var m = h.match(/https?[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
      if (m) return m[0];
      m = h.match(/(?:src|url|link|playurl)\s*[:=]\s*["']([^"']+\.m3u8[^"']*)["']/i);
      if (m) return XP.normalize(baseURL, m[1]);
      m = h.match(/https?[^"'\s<>]+\.mp4[^"'\s<>]*/i);
      if (m) return m[0];
      return '';
    } catch (e) { return ''; }
  };
  w.xpSniffHtml = XP.sniffInHtml;

  /* ------------------------------------------------------ 规则校验 */
  XP.checkRule = function (rule) {
    var missing = [];
    if (!rule || typeof rule !== 'object') return '规则不是对象';
    if (!rule.baseURL) missing.push('baseURL');
    if (!rule.searchURL) missing.push('searchURL');
    if (!rule.searchList) missing.push('searchList');
    if (!rule.searchName) missing.push('searchName');
    if (!rule.searchResult) missing.push('searchResult');
    if (!rule.chapterRoads) missing.push('chapterRoads');
    if (!rule.chapterResult) missing.push('chapterResult');
    return missing.length ? ('缺少字段：' + missing.join(' / ')) : '';
  };

  /* ------------------------------------------------------ 规则解析（文本 → 规则对象）
     支持：① 直接 JSON 对象  ② {rules:{...}} 包裹  ③ Kazumi 插件 JSON（含 api/type 字段） */
  XP.parseRuleText = function (text) {
    try {
      var j = JSON.parse(String(text || ''));
      if (!j || typeof j !== 'object') return { ok: false, msg: '不是合法的规则 JSON' };
      var rule = (j.rules && typeof j.rules === 'object' && (j.rules.searchURL || j.rules.baseURL)) ? j.rules : j;
      var nm = String(rule.name || j.name || '').trim();
      var err = XP.checkRule(rule);
      if (err) return { ok: false, msg: err };
      return { ok: true, rule: rule, name: nm };
    } catch (e) { return { ok: false, msg: 'JSON 解析失败：' + e.message }; }
  };

  w.XP = XP;

})(window);
