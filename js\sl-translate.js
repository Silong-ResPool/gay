/* 巳泷资源库 · 全页翻译引擎（v9.9.2）
   组合模式：Google 免费接口 → MyMemory → 本地离线词库兜底。
   默认自动：仅对非中文页面翻译；替换文本节点，不改动页面结构。 */
(function () {
  'use strict';
  if (window.SL_TRANSLATE) return;

  var SKIP = {
    SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1,
    CODE: 1, PRE: 1, KBD: 1, SAMP: 1, SVG: 1, CANVAS: 1, IFRAME: 1, VIDEO: 1,
    AUDIO: 1, OBJECT: 1, EMBED: 1, HEAD: 1, META: 1, LINK: 1
  };
  var CACHE_KEY = 'sl_tr_cache_v1';
  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) { cache = {}; }

  var dict = null;
  var dictLoading = false;
  var translated = [];
  var running = false;
  var badgeEl = null;
  var moTimer = 0;

  function hash(s) {
    var h = 5381, i;
    for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'h' + h;
  }

  function fetchText(url, timeout) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; reject(new Error('timeout')); }
      }, timeout || 8000);
      try {
        fetch(url, { cache: 'no-store' }).then(function (r) {
          if (!r.ok) throw new Error('http ' + r.status);
          return r.text();
        }).then(function (t) {
          if (!done) { done = true; clearTimeout(timer); resolve(t); }
        }).catch(function (e) {
          if (!done) { done = true; clearTimeout(timer); reject(e); }
        });
      } catch (e) {
        if (!done) { done = true; clearTimeout(timer); reject(e); }
      }
    });
  }

  function detectPair() {
    var sample = '';
    try { sample = (document.body && document.body.innerText || '').slice(0, 600); } catch (e) {}
    if (/[\u3040-\u30ff]/.test(sample)) return 'ja|zh-CN';
    if (/[\uac00-\ud7af]/.test(sample)) return 'ko|zh-CN';
    if (/[\u0400-\u04ff]/.test(sample)) return 'ru|zh-CN';
    if (/[\u0600-\u06ff]/.test(sample)) return 'ar|zh-CN';
    if (/[\u0e00-\u0e7f]/.test(sample)) return 'th|zh-CN';
    if (/[\u0100-\u024f]/.test(sample)) return 'fr|zh-CN';
    return 'en|zh-CN';
  }

  function googleTranslate(text, pair) {
    var sl = pair.split('|')[0];
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + encodeURIComponent(sl) +
      '&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
    return fetchText(url, 4000).then(function (t) {
      var j = JSON.parse(t);
      if (j && j[0]) {
        var out = '';
        for (var i = 0; i < j[0].length; i++) out += (j[0][i] && j[0][i][0]) || '';
        if (out) return out;
      }
      throw new Error('google empty');
    });
  }

  function myMemoryTranslate(text, pair) {
    var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) +
      '&langpair=' + encodeURIComponent(pair);
    return fetchText(url, 9000).then(function (t) {
      var j = JSON.parse(t);
      var tr = j && j.responseData && j.responseData.translatedText;
      if (tr && !/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(tr)) return tr;
      throw new Error('mymemory limit');
    });
  }

  function apiTranslate(text, pair) {
    var key = hash(text + '|' + pair);
    if (cache[key]) return Promise.resolve(cache[key]);
    return googleTranslate(text, pair).catch(function () {
      return myMemoryTranslate(text, pair);
    }).then(function (tr) {
      if (tr) cache[key] = tr;
      return tr;
    });
  }

  function loadDict(cb) {
    if (dict) { cb(); return; }
    if (dictLoading) { setTimeout(function () { loadDict(cb); }, 250); return; }
    dictLoading = true;
    var url = window.__slDictUrl;
    if (!url) { dict = {}; cb(); return; }
    fetchText(url, 9000).then(function (t) {
      try { dict = JSON.parse(t); } catch (e) { dict = {}; }
      cb();
    }).catch(function () { dict = {}; cb(); });
  }

  function offlineTranslate(text) {
    if (!dict || !text) return null;
    var words = text.match(/[A-Za-z][A-Za-z'-]+/g) || [];
    if (!words.length) return null;
    var out = text, hit = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], k = w.toLowerCase();
      if (dict[k]) {
        try {
          out = out.replace(new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), dict[k]);
          hit++;
        } catch (e) {}
      }
    }
    return hit > 0 ? out : null;
  }

  function isMostlyChinese() {
    var lang = String(document.documentElement.lang || '').toLowerCase();
    if (lang.indexOf('zh') === 0) return true;
    var txt = '';
    try { txt = (document.body && document.body.innerText || '').slice(0, 1400); } catch (e) {}
    var total = txt.replace(/\s/g, '').length;
    if (total < 30) return true;
    var cn = (txt.match(/[\u4e00-\u9fff]/g) || []).length;
    return cn / total > 0.18;
  }

  function skipNode(node) {
    var p = node.parentNode;
    if (!p) return true;
    var name = p.nodeName;
    if (SKIP[name]) return true;
    if (p.closest && p.closest('code,pre,script,style,.sl-no-translate,[translate="no"]')) return true;
    var t = node.nodeValue;
    if (!t || !t.trim() || t.trim().length < 2) return true;
    if (!/[A-Za-z\u00c0-\u024f\u0400-\u04ff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff\u0e00-\u0e7f]/.test(t)) return true;
    var cn = (t.match(/[\u4e00-\u9fff]/g) || []).length;
    if (cn && cn / t.replace(/\s/g, '').length > 0.3) return true;
    return false;
  }

  function scanNodes(root, limit) {
    var arr = [];
    if (!root) return arr;
    var walker;
    try {
      walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) { return skipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
      }, false);
    } catch (e) { return arr; }
    var n;
    while ((n = walker.nextNode())) {
      if (n.__slTr) continue;
      arr.push(n);
      if (limit && arr.length >= limit) break;
    }
    return arr;
  }

  function replaceNode(node, text) {
    if (!node || !node.parentNode || node.__slTr) return;
    node.__slTr = 1;
    translated.push({ node: node, old: node.nodeValue });
    node.nodeValue = text;
  }

  function restore() {
    for (var i = 0; i < translated.length; i++) {
      try { if (translated[i].node) translated[i].node.nodeValue = translated[i].old; } catch (e) {}
    }
    translated = [];
  }

  function badge(text, done) {
    try {
      if (!badgeEl) {
        badgeEl = document.createElement('div');
        badgeEl.id = 'sl-tr-badge';
        badgeEl.style.cssText = 'position:fixed;right:10px;bottom:12px;z-index:2147483647;' +
          'background:rgb(20,12,36,.94);color:#ffffff;border:1px solid rgb(139,92,246,.55);border-radius:14px;' +
          'padding:8px 12px;font-size:11px;line-height:1.5;box-shadow:0 6px 20px rgb(0,0,0,.45);cursor:pointer;max-width:72vw;';
        badgeEl.title = '点击恢复原文';
        badgeEl.onclick = function () {
          restore();
          badgeEl.textContent = '已恢复原文';
          setTimeout(function () {
            try { if (badgeEl && badgeEl.parentNode) badgeEl.parentNode.removeChild(badgeEl); } catch (e) {}
            badgeEl = null;
          }, 900);
        };
        (document.body || document.documentElement).appendChild(badgeEl);
      }
      badgeEl.textContent = text;
      badgeEl.style.opacity = '1';
      if (done) setTimeout(function () { try { if (badgeEl) badgeEl.style.opacity = '0.55'; } catch (e) {} }, 3200);
    } catch (e) {}
  }

  function translateTexts(texts, pair) {
    var joined = texts.join('\n');
    if (joined.length <= 430) {
      return apiTranslate(joined, pair).then(function (tr) {
        var parts = String(tr || '').split('\n');
        if (parts.length === texts.length) return parts;
        throw new Error('split mismatch');
      }).catch(function () {
        var out = [], i = 0;
        function step() {
          if (i >= texts.length) return Promise.resolve(out);
          var t = texts[i++];
          return apiTranslate(t, pair).then(function (r) { out.push(r || null); return step(); })
            .catch(function () { out.push(null); return step(); });
        }
        return step();
      });
    }
    var groups = [], cur = [], len = 0;
    for (var i = 0; i < texts.length; i++) {
      if (len + texts[i].length > 420 && cur.length) { groups.push(cur); cur = []; len = 0; }
      cur.push(texts[i]); len += texts[i].length + 1;
    }
    if (cur.length) groups.push(cur);
    return Promise.all(groups.map(function (g) { return translateTexts(g, pair); })).then(function (arr) {
      var out = [];
      for (var j = 0; j < arr.length; j++) out = out.concat(arr[j]);
      return out;
    });
  }

  function translatePage() {
    if (running) return;
    if (isMostlyChinese()) { badge('页面已是中文，无需翻译', true); return; }
    running = true;
    badge('正在翻译为中文…', false);
    var nodes = scanNodes(document.body, 500);
    if (!nodes.length) { running = false; badge('没有可翻译的文本', true); return; }
    loadDict(function () {
      var pair = window.__slTargetPair || detectPair();
      var queue = nodes.slice(0);
      var idx = 0, ok = 0, fail = 0;

      function worker() {
        if (idx >= queue.length) return Promise.resolve();
        var batch = [], total = 0;
        while (idx < queue.length && total < 380) {
          var nd = queue[idx++];
          var t = String(nd.nodeValue || '').trim();
          if (!t) continue;
          batch.push({ node: nd, text: t });
          total += t.length + 1;
        }
        if (!batch.length) return worker();
        var texts = batch.map(function (b) { return b.text; });
        return translateTexts(texts, pair).then(function (results) {
          for (var i = 0; i < batch.length; i++) {
            var tr = results[i] || '';
            if (tr && tr !== batch[i].text) {
              replaceNode(batch[i].node, tr);
              ok++;
            } else {
              var off = offlineTranslate(batch[i].text);
              if (off && off !== batch[i].text) { replaceNode(batch[i].node, off); ok++; }
              else fail++;
            }
          }
        }).catch(function () { fail += batch.length; }).then(function () { return worker(); });
      }

      var ps = [];
      for (var i = 0; i < 3; i++) ps.push(worker());
      Promise.all(ps).then(function () {
        running = false;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
        badge('已翻译 ' + ok + ' 段' + (fail ? ('，' + fail + ' 段保留原文') : ''), true);
      });
    });
  }

  function autoStart() {
    var auto = '1';
    try { auto = localStorage.getItem('sl_auto_translate') || '1'; } catch (e) {}
    if (auto === '1') setTimeout(translatePage, 1400);
  }

  window.SL_TRANSLATE = {
    page: translatePage,
    restore: restore,
    setAuto: function (on) {
      try { localStorage.setItem('sl_auto_translate', on ? '1' : '0'); } catch (e) {}
      if (on) translatePage();
    },
    autoOn: function () {
      try { return localStorage.getItem('sl_auto_translate') !== '0'; } catch (e) { return true; }
    }
  };

  try {
    var mo = new MutationObserver(function (muts) {
      if (running) return;
      var has = false;
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) { has = true; break; }
      }
      if (!has) return;
      clearTimeout(moTimer);
      moTimer = setTimeout(function () { if (!running) translatePage(); }, 2600);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoStart);
  else autoStart();
})();
