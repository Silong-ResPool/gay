/* ============================================================
   巳泷影视 · 全源影院逻辑（v8.3.0）
   全部内置源默认启用；支持全源搜索、按源分类浏览、详情与播放。
   ============================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function enc(s) { return encodeURIComponent(String(s == null ? '' : s)); }
  function toast(t) {
    var el = $('toast'); if (!el) return;
    el.textContent = t; el.classList.add('on');
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  function stripTags(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+\n/g, '\n').trim(); }
  function normTitle(s) {
    return String(s || '').toLowerCase()
      .replace(/[\s\-_:：·.,，。!！?？\[\]【】()（）'"“”‘’]/g, '')
      .replace(/(19|20)\d{2}/g, '');
  }
  function hostOf(u) { try { return new URL(u).host; } catch (e) { return String(u || '').slice(0, 24); } }

  var LS_ENABLED = 'sl_video_enabled_v2';
  var CAT_ORDER = ['综合影视', '动漫', '成人（18+）', '其他源（待验证）', '未分类'];

  /* ---------------- 源整理 ---------------- */
  var SOURCES = (function () {
    var arr = window.VIDEO_SOURCES || [], out = [], seen = {};
    arr.forEach(function (s, i) {
      if (!s || !s.n) return;
      var type = '', api = '', rule = null;
      if (s.t === 'x' && s.r) { type = 'xpath'; rule = s.r; }
      else if (/^gayagg/i.test(s.a || '')) { type = 'gayagg'; }
      else if (s.a && !/^xpath:|^gae:/i.test(s.a)) { type = 'maccms'; api = String(s.a).replace(/\/+$/, ''); }
      else return;
      var key = type === 'maccms' ? ('m:' + api) : (type + ':' + s.n);
      if (seen[key]) return;
      seen[key] = 1;
      out.push({ key: key, name: s.n, type: type, api: api, rule: rule, cat: s.c || '未分类', adult: /成人/.test(s.c || ''), verified: !!s.v, index: i });
    });
    return out;
  })();

  var state = {
    enabled: new Set(), view: 'search', groups: new Map(), groupList: [],
    searching: false, searchAbort: null, found: 0, lastQuery: '', engineMode: 'site',
    browseSrc: '', browseCats: [], browseType: '', browsePage: 1, browsePageCount: 1,
    browseItems: [], browseLoading: false, detail: null, detailRoad: 0, detailGroup: null,
    homeItems: [], homeSrc: null, homePage: 1, homePageCount: 1, homeLoading: false
  };

  function allKeys() { return SOURCES.map(function (s) { return s.key; }); }
  function loadEnabled() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(LS_ENABLED) || 'null'); } catch (e) {}
    if (!Array.isArray(saved)) return new Set(allKeys());
    var valid = {}; SOURCES.forEach(function (s) { valid[s.key] = 1; });
    return new Set(saved.filter(function (k) { return valid[k]; }));
  }
  function saveEnabled() {
    try { localStorage.setItem(LS_ENABLED, JSON.stringify(Array.from(state.enabled))); } catch (e) {}
  }
  function maccmsSources() { return SOURCES.filter(function (s) { return s.type === 'maccms' && state.enabled.has(s.key); }); }
  function cats() { var m = {}; SOURCES.forEach(function (s) { m[s.cat] = 1; }); return Object.keys(m); }
  function catOrder() {
    var m = cats();
    return CAT_ORDER.filter(function (c) { return m.indexOf(c) >= 0; })
      .concat(m.filter(function (c) { return CAT_ORDER.indexOf(c) < 0; }));
  }

  /* ---------------- 顶部统计 / 热词 ---------------- */
  function renderStats() {
    $('srcCount').textContent = state.enabled.size;
    $('stSources').textContent = SOURCES.length;
    $('stEnabled').textContent = state.enabled.size;
    $('stCats').textContent = cats().length;
  }
  function renderHot() {
    var words = ['电影', '电视剧', '综艺', '动漫', '科幻', '悬疑', '爱情', '喜剧', '动作', '纪录片', '男同专区'];
    $('hotChips').innerHTML = words.map(function (w) {
      return '<button data-hot="' + esc(w) + '">' + esc(w) + '</button>';
    }).join('');
  }

  /* ---------------- 源面板 ---------------- */
  function renderSourcePanel() {
    var kw = String(($('spSearch') && $('spSearch').value) || '').toLowerCase();
    var groups = {};
    SOURCES.forEach(function (s) {
      if (kw && (s.name + ' ' + s.api + ' ' + s.cat).toLowerCase().indexOf(kw) < 0) return;
      (groups[s.cat] = groups[s.cat] || []).push(s);
    });
    var h = '';
    catOrder().forEach(function (cat) {
      var arr = groups[cat]; if (!arr || !arr.length) return;
      h += '<div class="sp-group"><h4>' + esc(cat) + ' <em>' + arr.length + ' 源</em></h4>' + arr.map(function (s) {
        var tags = (s.adult ? '<span class="tag18">18+</span>' : '') +
          (s.type === 'xpath' ? '<span class="tagx">规则源</span>' : '') +
          (s.type === 'gayagg' ? '<span class="tagx">快捷</span>' : '');
        return '<label class="src-row">' +
          '<input type="checkbox" data-key="' + esc(s.key) + '"' + (state.enabled.has(s.key) ? ' checked' : '') + '>' +
          '<span class="nm">' + esc(s.name) + '</span>' +
          '<span class="host">' + esc(s.type === 'maccms' ? hostOf(s.api) : s.type === 'xpath' ? 'XPath 规则' : '男同关键词') + '</span>' +
          tags +
          '<button type="button" class="go" data-browse-key="' + esc(s.key) + '" title="按此源浏览">↗</button>' +
          '</label>';
      }).join('') + '</div>';
    });
    $('spBody').innerHTML = h || '<div class="empty">没有匹配的源</div>';
  }
  function toggleSource(key, on) {
    if (on) state.enabled.add(key); else state.enabled.delete(key);
    saveEnabled(); renderStats();
    if (state.view === 'browse') renderBrowseSources();
    renderSourcePanel();
  }
  function bulkSources(mode) {
    if (mode === 'all') state.enabled = new Set(allKeys());
    else if (mode === 'none') state.enabled = new Set();
    else if (mode === 'maccms') state.enabled = new Set(SOURCES.filter(function (s) { return s.type === 'maccms'; }).map(function (s) { return s.key; }));
    else state.enabled = new Set(allKeys());
    saveEnabled(); renderStats(); renderSourcePanel(); renderBrowseSources();
    if (state.view === 'browse') initBrowse();
    toast(mode === 'none' ? '已停用全部源' : mode === 'maccms' ? '只保留采集源' : '已启用全部源');
  }
  function openPanel() { $('srcPanel').hidden = false; $('overlay').hidden = false; renderSourcePanel(); }
  function closePanel() { $('srcPanel').hidden = true; $('overlay').hidden = true; }

  /* ---------------- 浏览 ---------------- */
  function renderBrowseSources() {
    var arr = maccmsSources();
    if (!arr.length) { $('browseSrc').innerHTML = '<option value="">没有启用的采集源</option>'; return; }
    var groups = {};
    arr.forEach(function (s) { (groups[s.cat] = groups[s.cat] || []).push(s); });
    var html = '';
    catOrder().forEach(function (cat) {
      if (!groups[cat]) return;
      html += '<optgroup label="' + esc(cat) + '">' + groups[cat].map(function (s) {
        return '<option value="' + esc(s.key) + '">' + esc(s.name) + '</option>';
      }).join('') + '</optgroup>';
    });
    $('browseSrc').innerHTML = html;
    var keys = arr.map(function (s) { return s.key; });
    if (keys.indexOf(state.browseSrc) < 0) state.browseSrc = keys[0];
    $('browseSrc').value = state.browseSrc;
  }
  function findSource(key) { for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].key === key) return SOURCES[i]; return null; }
  function initBrowse() {
    renderBrowseSources();
    var s = findSource(state.browseSrc);
    if (!s) {
      $('browseCats').innerHTML = '';
      $('browseGrid').innerHTML = '<div class="empty">没有启用的采集源，请打开右上角「源」勾选。</div>';
      $('browseMeta').textContent = '没有可用源';
      return;
    }
    loadBrowseCats(s);
  }
  function loadBrowseCats(src) {
    state.browseCats = []; state.browseType = ''; state.browseItems = []; state.browsePage = 1;
    $('browseMeta').textContent = '正在读取「' + src.name + '」的分类…';
    $('browseCats').innerHTML = '';
    $('browseGrid').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>';
    fetch('/api/cat?customApi=' + enc(src.api)).then(function (r) { return r.json(); }).then(function (j) {
      var map = {}, list = [];
      (j.list || []).forEach(function (it) {
        var id = it.type_id, name = it.type_name;
        if (id == null || !name || map[id + '|' + name]) return;
        map[id + '|' + name] = 1; list.push({ id: id, name: name });
      });
      state.browseCats = list;
      renderBrowseCats();
      loadBrowseList(1);
    }).catch(function () {
      state.browseCats = [];
      renderBrowseCats();
      loadBrowseList(1);
    });
  }
  function renderBrowseCats() {
    var h = '<button class="' + (!state.browseType ? 'on' : '') + '" data-cat="">全部</button>';
    h += state.browseCats.slice(0, 80).map(function (c) {
      return '<button class="' + (String(state.browseType) === String(c.id) ? 'on' : '') + '" data-cat="' + esc(c.id) + '">' + esc(c.name) + '</button>';
    }).join('');
    $('browseCats').innerHTML = h;
  }
  function loadBrowseList(page) {
    var src = findSource(state.browseSrc);
    if (!src || state.browseLoading) return;
    state.browseLoading = true;
    $('moreBtn').hidden = true;
    if (page === 1) {
      $('browseGrid').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>';
      state.browseItems = [];
    }
    var qs = '/api/list?customApi=' + enc(src.api) + '&pg=' + page + (state.browseType ? '&t=' + enc(state.browseType) : '');
    fetch(qs).then(function (r) { return r.json(); }).then(function (j) {
      var items = (j.list || []).map(function (it) { return mapMaccms(it, src); });
      state.browsePage = parseInt(j.page, 10) || page;
      state.browsePageCount = parseInt(j.pagecount, 10) || 1;
      if (page === 1) {
        state.browseItems = items;
        renderGrid($('browseGrid'), state.browseItems, 'item');
      } else {
        var before = state.browseItems.length;
        state.browseItems = state.browseItems.concat(items);
        appendGrid($('browseGrid'), items, 'item', before);
      }
      var catName = '全部';
      state.browseCats.forEach(function (c) { if (String(c.id) === String(state.browseType)) catName = c.name; });
      $('browseMeta').textContent = src.name + ' · ' + catName + ' · 第 ' + state.browsePage + ' / ' + state.browsePageCount + ' 页 · 共 ' + (j.total || state.browseItems.length) + ' 条';
      $('moreBtn').hidden = state.browsePage >= state.browsePageCount;
    }).catch(function () {
      if (page === 1) {
        state.browseItems = [];
        $('browseGrid').innerHTML = '<div class="empty">这个源暂时无法读取列表，换一个源或稍后再试。</div>';
      }
      $('browseMeta').textContent = '读取失败：' + src.name;
    }).finally(function () {
      state.browseLoading = false;
      setTimeout(maybeAutoMore, 160);
    });
  }

  /* ---------------- 卡片 ---------------- */
  function mapMaccms(it, src) {
    return {
      id: it.vod_id, name: it.vod_name || '未命名', pic: it.vod_pic || it.vod_pic_slide || it.vod_pic_thumb || it.pic || it.poster || '',
      remarks: it.vod_remarks || '', typeName: it.type_name || it.vod_class || '',
      year: it.vod_year || '', area: it.vod_area || '', time: it.vod_time || '',
      sourceName: src.name, sourceKey: src.key, api: src.api, type: 'maccms', raw: it
    };
  }
  function mapXpath(it, src) {
    return {
      id: it.src, name: it.name || '未命名', pic: it.pic || '', remarks: '规则源',
      typeName: '动漫', year: '', area: '', time: '',
      sourceName: src.name, sourceKey: src.key, rule: src.rule, detailUrl: it.src, type: 'xpath'
    };
  }
  /* V10：海报兜底 —— 不删 img、http 自动升级 https、失败后保留首字底图 */
  function posterKind(name) {
    var t = String(name || '');
    if (/动漫|动画|番|漫画/.test(t)) return 'anime';
    if (/综艺|真人秀|脱口秀/.test(t)) return 'variety';
    if (/纪录|纪实/.test(t)) return 'doc';
    if (/短剧|微短剧/.test(t)) return 'short';
    if (/电视剧|连续剧|剧/.test(t)) return 'tv';
    return 'movie';
  }
  window.slPicFallback = function (img) {
    try {
      var s = img.getAttribute('src') || '';
      var tries = parseInt(img.getAttribute('data-sl-try') || '0', 10);
      if (s.indexOf('http://') === 0 && tries === 0) {
        img.setAttribute('data-sl-try', '1');
        img.setAttribute('src', 'https://' + s.slice(7)); return;
      }
      if (s && tries < 2) {
        img.setAttribute('data-sl-try', String(tries ? 3 : 2));
        img.setAttribute('src', 'https://images.weserv.nl/?url=' + encodeURIComponent(s.replace(/^https?:\/\//, '')) + '&w=420&h=620&fit=cover');
        return;
      }
      var fb = img.getAttribute('data-fb') || 'movie';
      if (tries < 4) {
        img.setAttribute('data-sl-try', '4');
        img.onerror = null;
        img.style.display = 'block';
        img.setAttribute('src', 'assets/posters/' + fb + '.svg');
        var box0 = img.parentNode; if (box0) { box0.classList.remove('noimg'); box0.classList.add('localposter'); }
        return;
      }
      img.style.display = 'none';
      var box = img.parentNode;
      if (box) box.classList.add('noimg');
    } catch (e) {}
  };
  function posterHtml(pic, title, badge, count, idx) {
    var t = String(title || '?');
    var src = String(pic || '').trim();
    if (src && src.indexOf('//') === 0) src = 'https:' + src;
    var eager = typeof idx === 'number' ? idx < 8 : true;
    return '<div class="poster">' +
      '<div class="fallback"><span>' + esc(t.slice(0, 2)) + '</span><em>' + esc(t.length > 8 ? t.slice(0, 8) + '…' : t) + '</em></div>' +
      '<img loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async" referrerpolicy="no-referrer" src="' + esc(src || ('assets/posters/' + posterKind(badge || t) + '.svg')) + '" data-fb="' + posterKind(badge || t) + '" onerror="' + (src ? 'slPicFallback(this)' : 'this.onerror=null') + '" alt="' + esc(t) + '">' +
      '<div class="shade"></div>' +
      (badge ? '<span class="srcbadge">' + esc(badge) + '</span>' : '') +
      (count ? '<span class="countbadge">' + esc(count) + '</span>' : '') +
      '</div>';
  }
  function itemCard(it, idx) {
    var sub = it.sourceName ? ('来源 · ' + it.sourceName) : (it.remarks || '');
    return '<div class="card" data-idx="' + idx + '">' +
      posterHtml(it.pic, it.name, it.sourceName, '', idx) +
      '<div class="card-body"><h3>' + esc(it.name) + '</h3><div class="sub">' + esc(sub) + '</div></div></div>';
  }
  function groupCard(g, idx) {
    var first = g.items[0] || {};
    var sub = (g.items.length || 1) + ' 个来源 · 点击查看详情';
    return '<div class="card" data-group-idx="' + idx + '">' +
      posterHtml(g.pic, g.title, g.items.length + ' 源', '', idx) +
      '<div class="card-body"><h3>' + esc(g.title) + '</h3><div class="sub">' + esc(sub) + '</div></div></div>';
  }
  function renderGrid(el, items, kind) {
    el.__items = items; el.__kind = kind;
    el.innerHTML = items.length ? items.map(function (it, i) { return kind === 'group' ? groupCard(it, i) : itemCard(it, i); }).join('')
      : '<div class="empty">暂无内容。</div>';
  }
  function appendGrid(el, items, kind, start) {
    if (!items.length) return;
    var empty = el.querySelector('.empty'); if (empty) el.innerHTML = '';
    el.insertAdjacentHTML('beforeend', items.map(function (it, i) { return kind === 'group' ? groupCard(it, start + i) : itemCard(it, start + i); }).join(''));
    el.__items = state.browseItems; el.__kind = kind;
  }
  var _moreTick = 0;
  function maybeAutoMore() {
    if (state.view !== 'browse' || state.browseLoading) return;
    var btn = $('moreBtn'); if (!btn || btn.hidden) return;
    var r = btn.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    if (r.top < vh + 520 || r.bottom < vh + 520) loadBrowseList(state.browsePage + 1);
  }

  /* ---------------- 搜索 ---------------- */
  function fetchWithTimeout(url, ms, outerSignal) {
    var ctl = new AbortController();
    var onAbort = function () { try { ctl.abort(); } catch (e) {} };
    if (outerSignal) outerSignal.addEventListener('abort', onAbort, { once: true });
    var timer = setTimeout(onAbort, ms || 9000);
    return fetch(url, { signal: ctl.signal }).finally(function () {
      clearTimeout(timer);
      if (outerSignal) outerSignal.removeEventListener('abort', onAbort);
    });
  }
  function searchSource(src, q, signal) {
    if (src.type === 'maccms') {
      return fetchWithTimeout('/api/search?wd=' + enc(q) + '&source=custom&customApi=' + enc(src.api), 8000, signal)
        .then(function (r) { return r.json(); })
        .then(function (j) { return (j.list || []).slice(0, 24).map(function (it) { return mapMaccms(it, src); }); })
        .catch(function () { return []; });
    }
    if (src.type === 'xpath' && window.XP) {
      return Promise.race([
        XP.search(src.rule, q).then(function (arr) { return (arr || []).slice(0, 24).map(function (it) { return mapXpath(it, src); }); }),
        new Promise(function (resolve) { setTimeout(function () { resolve([]); }, 12000); })
      ]).catch(function () { return []; });
    }
    return Promise.resolve([]);
  }
  function addGroups(items) {
    items.forEach(function (it) {
      var k = normTitle(it.name);
      if (!k) return;
      var g = state.groups.get(k);
      if (!g) { g = { key: k, title: it.name, pic: it.pic || '', items: [] }; state.groups.set(k, g); }
      if (!g.pic && it.pic) g.pic = it.pic;
      var dup = g.items.some(function (x) { return x.sourceKey === it.sourceKey && String(x.id) === String(it.id); });
      if (!dup) g.items.push(it);
    });
    state.found = 0;
    state.groups.forEach(function (g) { state.found += g.items.length; });
    $('stFound').textContent = state.found;
  }
  var renderTimer = 0;
  /* V10：谁先回来谁先上屏 —— 16ms 合帧，只追加新卡片，不整表重建 */
  function scheduleRender() {
    if (renderTimer) return;
    renderTimer = setTimeout(function () { renderTimer = 0; renderSearchResults(); }, 16);
  }
  function renderSearchResults() {
    var grid = $('resultGrid');
    if (!grid) return;
    var q = state.lastQuery || '';
    var arr = Array.from(state.groups.values());
    state.groupList = arr;
    if (!arr.length) {
      $('resultTitle').textContent = '搜索结果 · ' + q;
      $('resultMeta').textContent = '正在向 ' + (state.enabled ? state.enabled.size : 0) + ' 个源聚合…';
      return;
    }
    if (grid.getAttribute('data-q') !== q) {
      grid.innerHTML = '';
      grid.setAttribute('data-q', q);
      state._painted = {};
      state._firstPaint = false;
    }
    var known = state._painted || (state._painted = {});
    var add = [];
    for (var i = 0; i < arr.length; i++) {
      if (known[arr[i].key]) continue;
      known[arr[i].key] = 1;
      add.push(arr[i]);
    }
    if (add.length) {
      if (!state._firstPaint) { grid.innerHTML = ''; state._firstPaint = true; }
      var html = '';
      for (var j = 0; j < add.length; j++) {
        var idx = arr.indexOf(add[j]);
        html += groupCard(add[j], idx);
      }
      grid.insertAdjacentHTML('beforeend', html);
    }
    grid.__items = arr; grid.__kind = 'group';
    $('resultTitle').textContent = '搜索结果 · ' + q;
    $('resultMeta').textContent = arr.length + ' 部 · ' + state.found + ' 条源结果';
    $('resultEmpty').hidden = !!arr.length;
  }
  function setProgress(done, total, found) {
    var pct = total ? Math.round(done / total * 100) : 0;
    $('pgBar').style.width = pct + '%';
    $('pgNum').textContent = pct + '%';
    $('pgText').textContent = '已搜索 ' + done + ' / ' + total + ' 源 · 找到 ' + found + ' 条';
  }
  function doSearch(q) {
    q = String(q || '').trim();
    if (!q) { toast('输入关键词再搜索'); return; }
    if (state.searching && state.searchAbort) state.searchAbort.abort();
    state.lastQuery = q; state.groups = new Map(); state.groupList = []; state.found = 0;
    state.searching = true; state.searchAbort = new AbortController();
    $('homeSec').hidden = true; $('resultSec').hidden = false;
    $('resultGrid').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>';
    state._painted = {}; state._firstPaint = false;
    try { $('resultGrid').setAttribute('data-q', ''); } catch (e) {}
    $('resultMeta').textContent = state.engineMode === 'all' ? '正在向全网全部源发起搜索…' : '正在向站内已启用源发起搜索…';
    $('searchProg').hidden = false;
    var list = SOURCES.filter(function (s) {
      if (s.type === 'gayagg') return false;
      return state.engineMode === 'all' || state.enabled.has(s.key);
    })
      .sort(function (a, b) { return (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || a.index - b.index; });
    if (!list.length) {
      state.searching = false; $('searchProg').hidden = true;
      $('resultGrid').innerHTML = '<div class="empty">站内还没有启用任何源。切到「全部」可直接搜索全网，或打开右上角「源」勾选站内源。</div>';
      return;
    }
    var total = list.length, done = 0, idx = 0;
    setProgress(0, total, 0);
    async function worker() {
      while (idx < list.length) {
        var src = list[idx++];
        try {
          var items = await searchSource(src, q, state.searchAbort.signal);
          if (items.length) addGroups(items);
        } catch (e) {}
        done++;
        setProgress(done, total, state.found);
        scheduleRender();
      }
    }
    var workers = [];
    for (var i = 0; i < Math.min(14, total); i++) workers.push(worker());
    Promise.all(workers).then(function () {
      state.searching = false;
      renderSearchResults();
      $('pgText').textContent = '搜索完成：' + total + ' 个源 · 找到 ' + state.found + ' 条';
      setTimeout(function () { $('searchProg').hidden = true; }, 1800);
      if (!state.found) toast('没有找到结果，换关键词试试');
    });
  }

  /* ---------------- 首页热门 ---------------- */
  function loadHome() {
    var prefer = ['360资源', '量子资源', '非凡资源', '暴风资源', '最大资源', '无尽资源', '极速资源'];
    var cands = maccmsSources().slice().sort(function (a, b) {
      var ia = prefer.indexOf(a.name), ib = prefer.indexOf(b.name);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    }).slice(0, 6);
    if (!cands.length) {
      $('homeGrid').innerHTML = '<div class="empty">还没有启用的采集源，请打开右上角「源」勾选。</div>';
      $('homeSrc').textContent = '无可用源';
      return;
    }
    function tryNext(i) {
      if (i >= cands.length) {
        $('homeGrid').innerHTML = '<div class="empty">热门推荐暂时无法加载，直接用上方搜索，或到「浏览」按源翻。</div>';
        $('homeSrc').textContent = '暂时不可用';
        return;
      }
      var src = cands[i];
      $('homeSrc').textContent = '正在连接 ' + src.name + '…';
      fetch('/api/list?customApi=' + enc(src.api) + '&pg=1').then(function (r) { return r.json(); }).then(function (j) {
        var items = (j.list || []).map(function (it) { return mapMaccms(it, src); });
        if (!items.length) return tryNext(i + 1);
        state.homeSrc = src; state.homePage = parseInt(j.page, 10) || 1; state.homePageCount = parseInt(j.pagecount, 10) || 1;
        state.homeItems = items;
        renderGrid($('homeGrid'), items, 'item');
        $('homeSrc').textContent = '来自 ' + src.name + ' · 默认全源已启用 · 第 ' + state.homePage + ' / ' + state.homePageCount + ' 页';
        $('homeMoreWrap').hidden = state.homePage >= state.homePageCount;
      }).catch(function () { tryNext(i + 1); });
    }
    tryNext(0);
  }

  function appendHomeGrid(items) {
    if (!items.length) return;
    var el = $('homeGrid'); if (!el) return;
    var start = state.homeItems.length;
    el.insertAdjacentHTML('beforeend', items.map(function (it, i) { return itemCard(it, start + i); }).join(''));
    state.homeItems = state.homeItems.concat(items);
  }
  function loadHomeMore() {
    if (state.view !== 'search' || state.homeLoading || !state.homeSrc) return;
    if (state.homePage >= state.homePageCount) { $('homeMoreWrap').hidden = true; return; }
    state.homeLoading = true;
    $('homeMore').textContent = '正在加载…';
    var src = state.homeSrc, page = state.homePage + 1;
    fetch('/api/list?customApi=' + enc(src.api) + '&pg=' + page).then(function (r) { return r.json(); }).then(function (j) {
      var items = (j.list || []).map(function (it) { return mapMaccms(it, src); });
      state.homePage = parseInt(j.page, 10) || page;
      state.homePageCount = parseInt(j.pagecount, 10) || state.homePageCount;
      appendHomeGrid(items);
      $('homeSrc').textContent = '来自 ' + src.name + ' · 默认全源已启用 · 第 ' + state.homePage + ' / ' + state.homePageCount + ' 页';
      $('homeMoreWrap').hidden = state.homePage >= state.homePageCount;
      $('homeMore').textContent = '继续加载（向下滚动会自动加载）';
    }).catch(function () {
      $('homeMore').textContent = '继续加载（向下滚动会自动加载）';
      toast('下一页加载失败，稍后重试。');
    }).finally(function () { state.homeLoading = false; setTimeout(maybeAutoHomeMore, 160); });
  }
  function maybeAutoHomeMore() {
    if (state.view !== 'search' || state.homeLoading) return;
    var wrap = $('homeMoreWrap'); if (!wrap || wrap.hidden) return;
    var r = wrap.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    if (r.top < vh + 520 || r.bottom < vh + 520) loadHomeMore();
  }

  /* ---------------- 详情 ---------------- */
  function showDetail(html) {
    $('detailCard').innerHTML = html;
    $('detail').hidden = false;
  }
  function closeDetail() { $('detail').hidden = true; state.detail = null; state.detailGroup = null; }
  function openGroup(g) {
    state.detailGroup = g;
    var h = '<button class="dt-close" data-close>✕</button>' +
      '<div class="dt-hero"><div class="dt-poster">' +
      (g.pic ? '<img src="' + esc(g.pic) + '" referrerpolicy="no-referrer-when-downgrade" onerror="this.remove()">' : '') +
      '</div><div class="dt-info"><h2>' + esc(g.title) + '</h2>' +
      '<div class="dt-meta"><span>' + g.items.length + ' 个播放源</span>' +
      (g.items[0] && g.items[0].typeName ? '<span>' + esc(g.items[0].typeName) + '</span>' : '') +
      '</div><p class="dt-desc">选择一个源查看线路与集数。不同源的清晰度、更新速度和线路可能不同。</p></div></div>' +
      '<div class="dt-body"><div class="dt-sources">' + g.items.map(function (it, i) {
        return '<div class="dt-src" data-si="' + i + '"><span class="nm">' + esc(it.sourceName) + '</span><span class="rm">' + esc(it.remarks || it.typeName || '') + '</span><span>›</span></div>';
      }).join('') + '</div></div>';
    showDetail(h);
  }
  function openDetail(item) {
    showDetail('<div class="dt-loading">正在读取详情…</div>');
    if (item.type === 'maccms') {
      fetch('/api/detail?id=' + enc(item.id) + '&source=custom&customApi=' + enc(item.api))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var d = j.list && j.list[0];
          if (!d && j.videoInfo) {
            var vi = j.videoInfo;
            var raw = j.raw || {};
            d = {
              vod_name: vi.title || item.name, vod_pic: vi.cover || item.pic,
              vod_content: vi.desc || '', vod_year: vi.year || '', vod_area: vi.area || '',
              type_name: vi.type || item.typeName, vod_remarks: vi.remarks || '',
              vod_actor: vi.actor || '', vod_director: vi.director || '',
              vod_play_from: raw.vod_play_from || '播放线路',
              vod_play_url: raw.vod_play_url || (j.episodes || []).map(function (u, i) { return '第' + (i + 1) + '集$' + u; }).join('#')
            };
          }
          if (!d) throw new Error('详情为空');
          renderDetail(d, item);
        }).catch(function () { showDetail('<div class="dt-loading">详情读取失败，换一个源试试。</div>'); });
    } else if (item.type === 'xpath' && window.XP) {
      XP.chapters(item.rule, item.detailUrl).then(function (roads) {
        renderXpathDetail(item, roads || []);
      }).catch(function () { showDetail('<div class="dt-loading">规则源详情读取失败。</div>'); });
    }
  }
  function parseRoads(d) {
    var froms = String(d.vod_play_from || '').split('$$$');
    var urls = String(d.vod_play_url || '').split('$$$');
    var roads = [];
    urls.forEach(function (seg, i) {
      var eps = [];
      String(seg || '').split('#').forEach(function (pair, idx) {
        pair = String(pair || '').trim(); if (!pair) return;
        var k = pair.lastIndexOf('$');
        var name = k >= 0 ? pair.slice(0, k) : ('第' + (idx + 1) + '集');
        var url = k >= 0 ? pair.slice(k + 1) : pair;
        if (url) eps.push({ name: name || ('第' + (idx + 1) + '集'), url: url });
      });
      if (eps.length) roads.push({ name: froms[i] || ('线路' + (i + 1)), eps: eps });
    });
    if (!roads.length) {
      var m = String(d.vod_content || '').match(/https?:\/\/[^"'\s<>]+?\.(?:m3u8|mp4)[^"'\s<>]*/g) || [];
      if (m.length) roads.push({ name: '页面线路', eps: m.map(function (u, i) { return { name: '第' + (i + 1) + '集', url: u }; }) });
    }
    return roads;
  }
  function renderDetail(d, item) {
    var roads = parseRoads(d);
    state.detail = { d: d, item: item, roads: roads, road: 0 };
    renderDetailCard();
  }
  function renderDetailCard() {
    var st = state.detail; if (!st) return;
    var d = st.d, item = st.item, roads = st.roads;
    var pic = d.vod_pic || item.pic || '';
    var meta = [d.vod_year, d.vod_area, d.type_name, d.vod_remarks, d.vod_score && d.vod_score !== '0.0' ? '评分 ' + d.vod_score : ''].filter(Boolean);
    var desc = stripTags(d.vod_content || d.vod_blurb || '暂无简介');
    var h = '<button class="dt-close" data-close>✕</button>' +
      '<div class="dt-hero"><div class="dt-poster">' + (pic ? '<img src="' + esc(pic) + '" referrerpolicy="no-referrer-when-downgrade" onerror="this.remove()">' : '') + '</div>' +
      '<div class="dt-info"><h2>' + esc(d.vod_name || item.name) + '</h2>' +
      '<div class="dt-meta">' + meta.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') +
      '<span>' + esc(item.sourceName) + '</span></div>' +
      '<p class="dt-desc">' + esc(desc) + '</p>' +
      '<div class="dt-actions"><button class="btn" data-play-first>▶ 播放第一集</button>' +
      '<button class="btn ghost" data-close>返回</button></div></div></div>' +
      '<div class="dt-body">';
    if (!roads.length) {
      h += '<div class="empty">这个源没有返回可播放线路，换一个源试试。</div>';
    } else {
      h += '<div class="road-tabs">' + roads.map(function (r, i) {
        return '<button class="' + (i === st.road ? 'on' : '') + '" data-road="' + i + '">' + esc(r.name) + '</button>';
      }).join('') + '</div>';
      h += '<div class="eps">' + (roads[st.road] ? roads[st.road].eps.map(function (e, i) {
        return '<button data-ep="' + i + '" title="' + esc(e.name) + '">' + esc(e.name) + '</button>';
      }).join('') : '') + '</div>';
    }
    h += '</div>';
    showDetail(h);
    if (roads.length) playFirst.road = st.road;
  }
  function renderXpathDetail(item, roads) {
    var d = { vod_name: item.name, vod_pic: '', vod_content: '规则源解析结果。点集数后会自动嗅探页面里的 m3u8 / mp4 地址。' };
    state.detail = { d: d, item: item, roads: roads, road: 0 };
    renderDetailCard();
  }
  function playTo(url, title) {
    if (!url) { toast('没有播放地址'); return; }
    location.href = 'player.html?url=' + enc(url) + '&title=' + enc(title || '') + '&returnUrl=' + enc(location.href);
  }
  function playEpisode(index) {
    var st = state.detail; if (!st || !st.roads[st.road]) return;
    var ep = st.roads[st.road].eps[index]; if (!ep) return;
    var title = (st.d.vod_name || st.item.name || '') + ' · ' + ep.name;
    if (/\.(m3u8|mp4)(\?|$)/i.test(ep.url)) { playTo(ep.url, title); return; }
    toast('正在解析播放地址…');
    if (window.XP) {
      XP.fetchHtml(ep.url, 12000).then(function (html) {
        var real = XP.sniffInHtml(html, ep.url);
        if (real) playTo(real, title);
        else window.open(ep.url, '_blank');
      });
    } else window.open(ep.url, '_blank');
  }
  var playFirst = { road: 0 };

  /* ---------------- 视图 ---------------- */
  function switchView(v) {
    state.view = v;
    document.querySelectorAll('.seg button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-view') === v); });
    $('viewSearch').hidden = v !== 'search';
    $('viewBrowse').hidden = v !== 'browse';
    if (v === 'browse' && !state.browseSrc) initBrowse();
    if (v === 'browse' && state.browseSrc && !state.browseItems.length) initBrowse();
    if (v === 'browse') setTimeout(maybeAutoMore, 220);
  }

  /* ---------------- 事件 ---------------- */
  function bind() {
    $('btnBack').onclick = function () { location.href = '../index.html'; };
    $('srcBtn').onclick = openPanel;
    $('spClose').onclick = closePanel;
    $('overlay').onclick = closePanel;
    $('spSearch').addEventListener('input', renderSourcePanel);
    $('spBody').addEventListener('change', function (e) {
      var cb = e.target.closest('input[data-key]'); if (!cb) return;
      toggleSource(cb.getAttribute('data-key'), cb.checked);
    });
    $('spBody').addEventListener('click', function (e) {
      var b = e.target.closest('[data-browse-key]'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      var key = b.getAttribute('data-browse-key');
      var src = findSource(key);
      if (!src || src.type !== 'maccms') { toast('规则源请在搜索里使用'); return; }
      state.browseSrc = key; closePanel(); switchView('browse'); initBrowse();
    });
    document.querySelectorAll('.sp-btns button').forEach(function (b) {
      b.onclick = function () { bulkSources(b.getAttribute('data-src')); };
    });
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.onclick = function () { switchView(b.getAttribute('data-view')); };
    });
    $('searchForm').addEventListener('submit', function (e) { e.preventDefault(); doSearch($('q').value); });
    var modeSel = $('engineMode');
    if (modeSel) {
      modeSel.addEventListener('change', function () {
        state.engineMode = this.value === 'all' ? 'all' : 'site';
        $('searchBtn').textContent = state.engineMode === 'all' ? '全部搜索' : '站内搜索';
        if (state.lastQuery && !state.searching) doSearch(state.lastQuery);
      });
    }
    $('hotChips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-hot]'); if (!b) return;
      var w = b.getAttribute('data-hot');
      $('q').value = w === '男同专区' ? '男同' : w;
      doSearch($('q').value);
    });
    $('browseSrc').addEventListener('change', function () {
      state.browseSrc = this.value; state.browseItems = []; state.browsePage = 1; state.browseType = '';
      initBrowse();
    });
    $('browseCats').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      state.browseType = b.getAttribute('data-cat'); state.browsePage = 1; state.browseItems = [];
      renderBrowseCats(); loadBrowseList(1);
    });
    $('moreBtn').onclick = function () { loadBrowseList(state.browsePage + 1); };
    if ($('homeMore')) $('homeMore').onclick = function () { loadHomeMore(); };
    window.addEventListener('scroll', function () {
      if (_moreTick) return;
      _moreTick = setTimeout(function () { _moreTick = 0; maybeAutoMore(); maybeAutoHomeMore(); }, 140);
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (_moreTick) return;
      _moreTick = setTimeout(function () { _moreTick = 0; maybeAutoMore(); maybeAutoHomeMore(); }, 160);
    });
    document.addEventListener('click', function (e) {
      var card = e.target.closest('.card');
      if (card) {
        var grid = card.parentNode, items = grid.__items || [], kind = grid.__kind;
        var gi = card.getAttribute('data-group-idx'), ii = card.getAttribute('data-idx');
        if (gi != null && items[+gi]) { openGroup(items[+gi]); return; }
        if (ii != null && items[+ii]) { openDetail(items[+ii]); return; }
      }
      var srcItem = e.target.closest('[data-si]');
      if (srcItem && state.detailGroup) {
        var si = +srcItem.getAttribute('data-si');
        var it = state.detailGroup.items[si];
        if (it) openDetail(it);
        return;
      }
      if (e.target.closest('[data-close]')) { closeDetail(); return; }
      var road = e.target.closest('[data-road]');
      if (road) {
        state.detail.road = +road.getAttribute('data-road');
        renderDetailCard(); return;
      }
      var ep = e.target.closest('[data-ep]');
      if (ep) { playEpisode(+ep.getAttribute('data-ep')); return; }
      if (e.target.closest('[data-play-first]') && state.detail && state.detail.roads.length) {
        playEpisode(0); return;
      }
    });
    $('detail').addEventListener('click', function (e) { if (e.target === $('detail')) closeDetail(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDetail(); closePanel(); }
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    /* 本地预览时让 XPath 规则源也走 /api 代理，APP/网页端保持原有逻辑 */
    try {
      if (window.XP && XP.fetchHtml && /^(localhost|127\.0\.0\.1)$/i.test(location.hostname)) {
        XP.fetchHtml = function (url, ms) {
          var ctl = new AbortController();
          var timer = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, ms || 15000);
          return fetch('/api?url=' + encodeURIComponent(url), { signal: ctl.signal })
            .then(function (r) { return r.ok ? r.text() : ''; })
            .catch(function () { return ''; })
            .finally(function () { clearTimeout(timer); });
        };
      }
    } catch (e) {}
    state.enabled = loadEnabled();
    renderStats(); renderHot(); renderSourcePanel(); renderBrowseSources();
    bind();
    loadHome();
    switchView('search');
  }
  boot();
})();
