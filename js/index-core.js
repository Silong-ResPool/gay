/* ==========================================================================
   巳泷资源库 · index-core.js（动态渲染引擎 v2.0）
   --------------------------------------------------------------------------
   功能：
   1. 板块化渲染：侧边栏分类 = 主界面板块，点击展开内容（懒加载）
   2. 懒加载：仅可见范围内的板块/链接才加载渲染（IntersectionObserver）
   3. 源码防窃取：分类数据独立于 data/*.js，URL hex 编码混淆；index.html 零链接
   4. CSS 门控：CSS 未加载完成前，板块显示加载占位，不渲染链接文字、不可点击
   5. 详情弹窗 16:9 预览框：图 → iframe 实时预览(禁交互, 5s 兜底) → 纯文本 三级展示
   6. 小卡片缩略：有图显图，无图显示文字（原样）
   7. 异常区：连通性探针（fetch no-cors + 超时）+ localStorage 永久缓存
   8. 搜索联动：全量数据检索，命中板块默认展开简介，垂直/水平可设
   9. 简介抽屉：点击板块 → 关闭侧边栏 → 展开简介 → 确认展开内容
   10. 快捷栏拦截：grid-btn 点击 → 打开详情弹窗
   11. 相对路径（GitHub Pages 仓库根）零调整部署
   ========================================================================== */

(function (w) {
  'use strict';

  var d = document;
  var LS_PREFIX = 'sl_res';
  var HEALTH_KEY = LS_PREFIX + '_health_v1';

  /* ---------------- 工具 ---------------- */
  function $(id) { return d.getElementById(id); }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function hex2s(hex) {
    try {
      if (!hex) return '';
      var out = '';
      for (var i = 0; i + 4 <= hex.length; i += 4) {
        out += String.fromCharCode(parseInt(hex.substr(i, 4), 16));
      }
      return out;
    } catch (e) { return ''; }
  }
  // 字符串 → 4 位十六进制（与 hex2s 互逆）
  function s2hex(str) {
    var out = '';
    str = String(str || '');
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i).toString(16);
      while (c.length < 4) c = '0' + c;
      out += c;
    }
    return out;
  }
  function lsGet(k, def) {
    try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  // 拼接相对路径（GitHub Pages 仓库根，无前导斜杠）
  function path(p) {
    var base = './';
    var href = w.location && w.location.href ? w.location.href : '';
    // 若页面在子目录（如 /gay/），base 取相对即可；GitHub Pages 根部署时 './data' 有效
    return base + String(p || '').replace(/^\.?\//, '');
  }

  /* ---------------- 全局状态 ---------------- */
  var SL = {
    index: null,           // SLINDEX
    loaded: {},            // sectionId -> data
    expanded: {},          // sectionId -> true（已展开）
    secMode: {},            // sectionId -> 'h'|'v'（展开方式记忆，兼容旧逻辑）
    cssOk: false,          // CSS 门控
    layout: 'v',           // 简介排版 v=垂直 h=水平（设置可改）
    globalMode: 'v',       // v9.0.5 顶部总开关：所有板块统一展开方向 h=水平 v=垂直
    health: {},            // url -> 'ok'|'bad'|'checking'（localStorage 缓存）
    abnormal: [],          // 异常站点 {t, u, c, desc...}
    rendered: false,
    _xqyMap: {},           // url -> 序号（xqyN.jpg 仓库图片路径）
    _xqyCount: 0
  };
  w.SL = SL;

  /* ---------------- 仓库预览图基础路径（巳泷 v9.2.0：用户指定的根路径格式 xqy1.jpg…xqyN.jpg） ----------------
     用户要求格式：https://silong-respool.github.io/xqy1.jpg（图片上传到仓库根或 xqy/ 目录均可，见 xqyUrlFor 兜底） */
  var XQY_BASE = 'https://silong-respool.github.io/';
  var XQY_ALTS = [
    'https://silong-respool.github.io/gay/xqy/',
    'https://silong-respool.github.io/xqy/',
    'https://silong-respool.github.io/gay/'
  ];

  /* ---------------- CSS 门控 ----------------
     在样式表完全加载前：#sl-sections 只显示「加载中」占位，不渲染任何板块。
     只有检测到 index.css（含 .sl-board 规则）生效后，才解除门控渲染板块。
     这样即便有人复制源码，在 CSS 就绪前也看不到链接文字，更无法点击跳转。 */
  function gateCss() {
    try {
      var sheets = d.styleSheets;
      var ready = false;
      for (var i = 0; i < sheets.length; i++) {
        var ss = sheets[i];
        // 找到 index.css（或包含 .sl-board 规则的同源表）→ 就绪
        var isIndex = /index\.css/i.test(ss.href || '');
        var hasSlRules = false;
        try {
          if (!ss.cssRules && ss.href) { /* 跨域表看不到规则，按 link 判定 */ hasSlRules = false; }
          else if (ss.cssRules) {
            for (var j = 0; j < ss.cssRules.length; j++) {
              if (/\.sl-board/.test(ss.cssRules[j].selectorText || '')) { hasSlRules = true; break; }
            }
          }
        } catch (e) {}
        if (isIndex && (hasSlRules || !ss.href)) { ready = true; break; }
        if (hasSlRules) { ready = true; break; }
      }
      if (ready) { completeGate(); return; }
      // 兜底：2.5s 后强制放行（避免极端网络导致永远不渲染）
      var bootT = (w.SL && w.SL._bootTime) || 0;
      if (Date.now() - bootT > 2500) completeGate();
      else setTimeout(gateCss, 120);
    } catch (e) { completeGate(); }
  }
  function completeGate() {
    if (SL.cssOk) return;
    SL.cssOk = true;
    d.body.classList.add('sl-css-ok');
    renderBoard();
  }

  /* ---------------- 数据加载 ---------------- */
  var loadedFiles = {};
  function loadScript(src, cb) {
    if (loadedFiles[src]) { if (cb) cb(); return; }
    var s = d.createElement('script');
    s.src = path(src);
    s.onload = function () { loadedFiles[src] = 1; if (cb) cb(); };
    s.onerror = function () { loadedFiles[src] = -1; if (cb) cb(); };
    (d.head || d.documentElement).appendChild(s);
  }
  function getData(id, cb) {
    if (SL.loaded[id]) { if (cb) cb(SL.loaded[id]); return; }
    loadScript('data/' + id + '.js', function () {
      SL.loaded[id] = (w.SLDATA && w.SLDATA[id]) || null;
      if (cb) cb(SL.loaded[id]);
      // 巳泷 v9.0.8：数据到达后刷新该板块的站点数量徽标
      if (SL.loaded[id]) { try { refreshBadge(id); } catch (e) {} }
      // 渲染该板块
      renderSectionContent(id);
    });
  }

  /* ---------------- 视觉观察（懒加载） ---------------- */
  function observeOnce(el, fn) {
    if (!('IntersectionObserver' in w)) { setTimeout(fn, 80); return; }
    var io = new IntersectionObserver(function (ents) {
      for (var i = 0; i < ents.length; i++) {
        if (ents[i].intersectionRatio > 0 || ents[i].isIntersecting) {
          io.disconnect();
          fn();
          return;
        }
      }
    }, { rootMargin: '200px' });
    io.observe(el);
  }

  /* ---------------- 连通性探针（异常区） ---------------- */
  function probeUrl(url, cb) {
    var key = normalizeUrl(url);
    var cached = SL.health[key];
    if (cached === 'ok' || cached === 'bad') { setImmediate(function () { cb(cached); }); return; }
    SL.health[key] = 'checking';
    var done = false;
    var finish = function (ok) {
      if (done) return; done = true;
      SL.health[key] = ok ? 'ok' : 'bad';
      lsSet(HEALTH_KEY, SL.health);
      cb(ok ? 'ok' : 'bad');
    };
    var t = setTimeout(function () { finish(false); }, 8000);
    try {
      // no-cors：能拿到 opaque 响应即视为网络可达（无法看真实状态码，但符合「能否访问」判定）
      fetch(key, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
        .then(function () { clearTimeout(t); finish(true); })
        .catch(function () { clearTimeout(t); finish(false); });
    } catch (e) { clearTimeout(t); finish(false); }
  }
  function normalizeUrl(u) {
    return String(u || '').replace(/\/+$/, '');
  }
  function known(url) {
    var k = normalizeUrl(url);
    var st = SL.health[k];
    return st === 'ok' || st === 'bad';
  }

  /* ---------------- v9.0.5：站点序号 → 仓库预览图路径（xqy1.jpg … xqyN.jpg） ----------------
     所有网站按「板块顺序 → 卡片顺序 → 站点顺序」统一编号（快捷直达、最近更新依次续编）。
     用户后续直接把 xqyN.jpg 上传到仓库 xqy/ 文件夹即可生效；无图时自动降级网页预览。 */
  function buildXqyMap() {
    SL._xqyMap = {};
    var n = 0;
    var order = (SL.index && SL.index.order) || [];
    var secIds = [];
    for (var i = 0; i < order.length; i++) if (order[i] && order[i].id) secIds.push(order[i].id);
    secIds.push('quick-links');
    secIds.push('recent-update');
    for (var k = 0; k < secIds.length; k++) {
      var id = secIds[k];
      if (id === 'quick-links') {
        var links = d.querySelectorAll('.grid-btn');
        for (var li = 0; li < links.length; li++) {
          var a = links[li];
          if (a.id === 'album-btn' || a.id === 'quick-expand-btn') continue;
          var href = a.getAttribute('href') || '';
          if (!href || href === '#') continue;
          n++; SL._xqyMap[normalizeUrl(href)] = n;
        }
        continue;
      }
      if (id === 'recent-update') {
        // 最近更新站点由 fetchRecent 动态追加到地图末尾
        continue;
      }
      var data = SL.loaded[id];
      if (!data || !data.cards) continue;
      for (var ci = 0; ci < data.cards.length; ci++) {
        var sites = (data.cards[ci] && data.cards[ci].sites) || [];
        for (var si = 0; si < sites.length; si++) {
          var url = hex2s(sites[si].u);
          if (!url) continue;
          n++; SL._xqyMap[normalizeUrl(url)] = n;
        }
      }
    }
    SL._xqyCount = n;
    return n;
  }
  function xqyUrlFor(url) {
    // 巳泷 v9.2.0：返回候选列表（用户指定根路径优先，其余路径兜底）
    try {
      var nn = SL._xqyMap[normalizeUrl(url)];
      if (nn) {
        var base = XQY_BASE + 'xqy' + nn + '.jpg';
        var alts = XQY_ALTS.map(function (p) { return p + 'xqy' + nn + '.jpg'; });
        alts.unshift(base);
        return alts;
      }
    } catch (e) {}
    return [];
  }

  /* ---------------- 渲染主画板 ---------------- */
  function renderBoard() {
    if (SL.rendered) return;
    SL.rendered = true;
    if (!SL.cssOk) return;             // CSS 未就绪不渲染（门控）
    var board = $('sl-board');
    if (!board) return;
    board.innerHTML = '';
    var loading = $('sl-sections-loading');
    if (loading) loading.style.display = 'none';

    showBoardSkeleton(board);          // 板块骨架（不含网站数据）
    renderQuickbarDetails();           // 快捷栏链接 → 详情弹窗
    autoExpandStored();                // 若用户开了「全部展开」记忆，自动全部展开
  }

  // 巳泷 v9.0.8：板块按点击次数动态排序（次数越多越靠前；并列保持原序）
  function clickCount(id) {
    try { return parseInt(localStorage.getItem(LS_PREFIX + '_clk_' + id), 10) || 0; } catch (e) { return 0; }
  }
  function bumpClick(id) {
    try { localStorage.setItem(LS_PREFIX + '_clk_' + id, String(clickCount(id) + 1)); } catch (e) {}
  }
  function sortByClicks(order) {
    var arr = order.slice();
    arr.sort(function (a, b) {
      var ca = clickCount(a.id), cb = clickCount(b.id);
      return cb - ca;
    });
    return arr;
  }

  // 板块骨架：田字格方形块（不含链接），点击方块弹窗选择「水平滑页 / 垂直列表」
  function showBoardSkeleton(board) {
    var idx = SL.index;
    var order = (idx && idx.order) || [];
    if (!idx || !order.length) {
      board.innerHTML = '<div class="sl-empty">板块数据加载失败，请刷新重试</div>';
      return;
    }
    // 巳泷 v9.0.8：按点击次数重排板块
    order = sortByClicks(order);
    var catCount = order.length + 2; // +「最近更新」+「异常区」两块固定板块（巳泷 v9.0.6：快捷直达已移除）
    var h = '<div class="sl-board-head">' +
      '<div class="sl-board-kicker"><i class="fas fa-satellite-dish"></i> SILONG <span>巳泷资源库</span></div>' +
      '<div class="sl-board-title"><i class="fas fa-layer-group"></i> 资源分类板块</div>' +
      '<div class="sl-board-stats">' +
      '<span class="sl-stat-chip"><i class="fas fa-boxes-stacked"></i> ' + catCount + ' 大板块</span>' +
      '<span class="sl-stat-chip"><i class="fas fa-hand-pointer"></i> 点方块即展开</span>' +
      '<span class="sl-stat-chip"><i class="fas fa-zap"></i> 懒加载加速</span>' +
      '</div>' +
      // 巳泷 v9.0.5：顶部展开方向总开关（一劳永逸，不再每次弹窗）
      '<div class="sl-board-mode">' +
      '<span class="sl-board-mode-label"><i class="fas fa-ruler-combined"></i> 展开方向</span>' +
      '<button class="sl-mode-btn" id="slModeH" data-mode="h" type="button"><i class="fas fa-arrows-alt-h"></i> 水平展开</button>' +
      '<button class="sl-mode-btn" id="slModeV" data-mode="v" type="button"><i class="fas fa-arrows-alt-v"></i> 垂直展开</button>' +
      '<span class="sl-board-mode-tip">顶部总开关：所有板块统一按此方向展开，无需每次选择</span>' +
      '</div>' +
      '<div class="sl-board-sub">点分类方块即展开 · 水平=单行横向滑动 · 垂直=区内上下滚动 · 顶部开关随时可切换</div>' +
      '<button class="sl-board-expandall" id="slExpandAll" type="button"><i class="fas fa-expand-arrows-alt"></i> 全部展开</button></div>';
    h += '<div class="sl-grid">';
    // 最近更新板块
    h += gridTileHtml({ id: 'recent-update', title: '最近更新' }, -1);
    // 异常区板块（巳泷 v9.0.6：异常区也是默认板块，点方块即展开，展开方式跟随顶部总开关）
    h += gridTileHtml({ id: 'abnormal', title: '异常区' }, -1);
    for (var i = 0; i < order.length; i++) {
      h += gridTileHtml(order[i], i);
    }
    h += '</div>';
    board.innerHTML = h;
    // 巳泷 v9.0.5：绑定顶部展开方向总开关
    bindExpandModeSwitch();
    // 全部展开按钮
    var ea = $('slExpandAll');
    if (ea) ea.addEventListener('click', function () { requestExpandAll(); });
    // 异常区方块事件 + 懒加载
    var at = $('sl-sec-abnormal');
    if (at) {
      at.addEventListener('click', function () { openSectionPicker('abnormal'); });
      observeOnce(at, function () { ensureSection('abnormal'); });
    }
    // 最近更新方块事件
    var ru = $('sl-sec-recent-update');
    if (ru) {
      ru.addEventListener('click', function () { openSectionPicker('recent-update'); });
      observeOnce(ru, function () { ensureSection('recent-update'); });
    }
    for (var k = 0; k < order.length; k++) {
      (function (sec) {
        var tile = $('sl-sec-' + sec.id);
        if (tile) {
          tile.addEventListener('click', function () { openSectionPicker(sec.id); });
        }
        // 懒加载：进入视口才真正请求该分类数据文件
        observeOnce(tile || board, function () { ensureSection(sec.id); });
      })(order[k]);
    }
  }

  // 田字格方块 HTML
  function gridTileHtml(sec, i) {
    var icons = {
      'search-section': 'fa-magnet', 'comprehensive-section': 'fa-globe',
      'comics-section': 'fa-book-open', 'novels-section': 'fa-book',
      'games-section': 'fa-gamepad', 'videos-section': 'fa-film',
      'cloud-section': 'fa-cloud', 'tools-section': 'fa-tools',
      'design-resources-section': 'fa-palette', 'ai-tools-section': 'fa-robot',
      'images-section': 'fa-images', 'furry-section': 'fa-paw',
      'life-section': 'fa-home', 'learning-section': 'fa-graduation-cap',
      'regular-update-section': 'fa-clock',
      'source-code-section': 'fa-code',
      'quick-links': 'fa-star',
      'recent-update': 'fa-history',
      'abnormal': 'fa-exclamation-triangle'
    };
    var ic = icons[sec.id] || 'fa-folder';
    var state = SL.expanded[sec.id] ? ' open' : '';
    // 巳泷 v9.0.8：badge 显示站点数量（数据加载后填充；懒加载前显示 …）
    var badgeTxt = '…';
    if (sec.id === 'recent-update') badgeTxt = '';
    if (sec.id === 'abnormal') badgeTxt = '';
    if (SL.loaded[sec.id] && sec.id !== 'recent-update' && sec.id !== 'abnormal') {
      var _d = SL.loaded[sec.id];
      var _t = 0;
      if (_d && _d.cards) { for (var _i = 0; _i < _d.cards.length; _i++) _t += (_d.cards[_i].sites || []).length; }
      badgeTxt = _t > 0 ? _t + ' 站' : '…';
    }
    // 巳泷 v9.0.3：方块入场逐个浮现（animation-delay 由 CSS 门控注入，不影响 hover/active 位移）
    var delayI = (i < 0 ? 0 : i) + 1;
    return '<div class="sl-grid-tile' + state + '" id="sl-sec-' + esc(sec.id) + '" data-sec="' + esc(sec.id) + '" style="animation-delay:' + (delayI * 55) + 'ms">' +
      '<span class="sl-tile-ic"><i class="fas ' + ic + '"></i></span>' +
      '<span class="sl-tile-name">' + esc(sec.title) + '</span>' +
      '<span class="sl-tile-badge" data-badge="' + esc(sec.id) + '">' + badgeTxt + '</span>' +
      '<span class="sl-tile-hint"><i class="fas fa-chevron-down"></i></span>' +
      '</div>';
  }

  // 巳泷 v9.0.8：板块数量徽标更新（数据加载完成后填充）
  function refreshBadge(id) {
    try {
      var data = SL.loaded[id];
      var total = 0;
      if (data && data.cards) { for (var i = 0; i < data.cards.length; i++) total += (data.cards[i].sites || []).length; }
      if (total > 0) {
        var bd = d.querySelector('[data-badge="' + id + '"]') || d.querySelector('[data-expbadge="' + id + '"]');
        if (bd) bd.textContent = total + ' 站';
      }
    } catch (e) {}
  }
  w.slRefreshBadge = refreshBadge;

  // 确保分类数据已请求（懒加载）
  function ensureSection(id) {
    if (id === 'quick-links' || id === 'recent-update' || id === 'abnormal') { renderSectionContent(id); return; }
    if (SL.loaded[id] === undefined) getData(id, function () {});
    else if (SL.expanded[id]) renderSectionContent(id);
  }

  // 巳泷 v9.0.5：顶部展开方向总开关
  function setGlobalExpandMode(mode) {
    SL.globalMode = mode === 'h' ? 'h' : 'v';
    try { lsSet(LS_PREFIX + '_expmode', SL.globalMode); } catch (e) {}
    // 已展开板块按新模式原地重建
    var ids = ['recent-update', 'abnormal'];
    var order = (SL.index && SL.index.order) || [];
    for (var i = 0; i < order.length; i++) if (order[i] && order[i].id) ids.push(order[i].id);
    for (var k = 0; k < ids.length; k++) {
      if (SL.expanded[ids[k]] && $('sl-expand-' + ids[k])) {
        try { closeSection(ids[k]); } catch (e) {}
        try { openSection(ids[k], SL.globalMode); } catch (e) {}
      }
    }
    paintModeSwitch();
  }
  function paintModeSwitch() {
    var hb = $('slModeH'), vb = $('slModeV');
    if (hb) hb.classList.toggle('on', SL.globalMode === 'h');
    if (vb) vb.classList.toggle('on', SL.globalMode !== 'h');
  }
  function bindExpandModeSwitch() {
    var hb = $('slModeH'), vb = $('slModeV');
    if (hb) hb.addEventListener('click', function () { setGlobalExpandMode('h'); });
    if (vb) vb.addEventListener('click', function () { setGlobalExpandMode('v'); });
    paintModeSwitch();
  }
  w.slSetExpandMode = setGlobalExpandMode;

  // 方块点击 → 若已展开则收起，否则按顶部总开关方向直接展开（v9.0.5 不再弹窗）
  // 巳泷 v9.3.0：点击次数排序前提 —— 完整展开一个板块之后再收起，才算一次点击（收起时才计次）
  function openSectionPicker(id) {
    var sb = $('sidebar');
    if (sb) sb.classList.remove('active');
    var tile = $('sl-sec-' + id);
    if (!tile) return;
    if (tile.classList.contains('open')) {
      // 已展开 → 收起：完整展开过再收起 → 记一次点击（热度排序依据）
      if (id && id !== 'recent-update' && id !== 'abnormal') {
        bumpClick(id);
        try { clearTimeout(SL._rerenderT); SL._rerenderT = setTimeout(rerenderOrdered, 80); } catch (e) {}
      }
      closeSection(id);
      return;
    }
    // 未展开 → 直接展开（本次不计点击，收起时才计入）
    openSection(id, SL.globalMode);
  }

  // 巳泷 v9.0.8：按最新点击热度重绘方块顺序（依次展开时用到）
  function rerenderOrdered() {
    try {
      var board = $('sl-board');
      if (!board || !SL.cssOk || SL.rendered !== true) return;
      showBoardSkeleton(board);
    } catch (e) {}
  }

  // 全部展开：按顶部总开关方向展开全部（记忆自动全部展开）；再次点击为关闭
  function requestExpandAll() {
    var sb = $('sidebar');
    if (sb) sb.classList.remove('active');
    // 已开启 → 再次点击为关闭（收起全部并清除记忆）
    var stored = '';
    try { stored = lsGet(LS_PREFIX + '_autoexpand', ''); } catch (e) {}
    if (stored === 'h' || stored === 'v') {
      try { lsSet(LS_PREFIX + '_autoexpand', ''); } catch (e) {}
      closeAllSections();
      var sub = d.querySelector('.sl-board-sub');
      if (sub) { sub.textContent = '已关闭「全部展开」，点按钮可重新开启'; setTimeout(function () { if (sub) sub.textContent = '点分类方块即展开 · 水平=单行横向滑动 · 垂直=区内上下滚动 · 顶部开关随时可切换'; }, 2500); }
      return;
    }
    doExpandAll(SL.globalMode);
  }

  // 收起所有已展开的板块
  function closeAllSections() {
    var ids = ['recent-update', 'abnormal'];
    var order = (SL.index && SL.index.order) || [];
    for (var i = 0; i < order.length; i++) if (order[i] && order[i].id) ids.push(order[i].id);
    for (var k = 0; k < ids.length; k++) {
      if ($('sl-expand-' + ids[k])) { try { closeSection(ids[k]); } catch (e) {} }
    }
  }

  // 展开全部（mode: h / v），并写入本地记忆
  function doExpandAll(mode) {
    try { lsSet(LS_PREFIX + '_autoexpand', mode); } catch (e) {}
    var ids = ['recent-update', 'abnormal'];
    var order = (SL.index && SL.index.order) || [];
    for (var i = 0; i < order.length; i++) if (order[i] && order[i].id) ids.push(order[i].id);
    SL._noScroll = true;
    for (var k = 0; k < ids.length; k++) {
      if (d.getElementById('sl-sec-' + ids[k])) {
        try { openSection(ids[k], mode); } catch (e) {}
      }
    }
    SL._noScroll = false;
    var bd = $('sl-sections');
    if (bd) try { bd.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }

  // 进入页面时按本地记忆自动全部展开
  function autoExpandStored() {
    try {
      var m = lsGet(LS_PREFIX + '_autoexpand', '');
      if (m !== 'h' && m !== 'v') return;
      doExpandAll(m);
    } catch (e) {}
  }

  // 弹窗选择展开方式（事件委托）
  function initPicker() {
    var pk = $('slPicker');
    if (!pk) return;
    pk.addEventListener('click', function (e) {
      if (e.target === pk) { pk.classList.remove('on'); return; }
      var opt = e.target.closest && e.target.closest('[data-pick]');
      if (!opt) return;
      var mode = opt.getAttribute('data-pick');
      if (mode === 'close') { pk.classList.remove('on'); return; }
      var id = SL._pickId;
      pk.classList.remove('on');
      if (mode === 'close') return;
      if (id === '__all__') {
        if (mode === 'h' || mode === 'v') doExpandAll(mode);
        return;
      }
      if (id && (mode === 'h' || mode === 'v')) openSection(id, mode);
    });
  }

  // 展开板块（mode: h=水平滑页 / v=垂直列表），固定高度展开区，就地展开在方块后方
  function openSection(id, mode) {
    SL.secMode[id] = mode;
    try { lsSet(LS_PREFIX + '_secmode_' + id, mode); } catch (e) {}
    var tile = $('sl-sec-' + id);
    if (!tile) return;
    tile.classList.add('open');
    SL.expanded[id] = true;
    var expand = $('sl-expand-' + id);
    if (!expand) {
      expand = d.createElement('div');
      expand.id = 'sl-expand-' + id;
      expand.innerHTML = '<div class="sl-sec-expand-head">' +
        '<span class="sl-sec-expand-name">' + esc(secTitle(id)) + '</span>' +
        '<span class="sl-sec-expand-badge" data-expbadge="' + esc(id) + '"></span>' +
        '<button class="sl-sec-expand-close" data-close-sec="' + esc(id) + '"><i class="fas fa-times"></i> 收起</button>' +
        '</div>' +
        '<div class="sl-sec-body-fixed" id="sl-body-' + esc(id) + '">' +
        '<div class="sl-sec-loading"><span class="sl-spin"></span>加载板块数据…</div>' +
        '</div>';
      // 就地展开：紧跟所在方块之后（上一个方块在上方、下一个在下方）
      if (tile.after) tile.after(expand);
      else tile.parentNode.insertBefore(expand, tile.nextSibling);
    }
    // 巳泷 v9.0.9：切换展开方向后，已存在的展开区同步更新模式（修复仓库拉取板块固定垂直问题）
    expand.className = 'sl-sec-expand sl-mode-' + (mode === 'h' ? 'h' : 'v');
    {
      var nm = expand.querySelector('.sl-sec-expand-name');
      if (nm) nm.textContent = secTitle(id);
      expand.classList.add('on');
    }
    // 巳泷 v9.0.9：切换展开方向后强制按新模式重新渲染（不命中 __rendered 缓存）
    if (SL.loaded[id]) SL.loaded[id].__rendered = false;
    if (id === 'recent-update') SL._recentRendered = false;
    if (id === 'quick-links') SL._quickRendered = false;
    ensureSection(id);
    renderSectionContent(id);
    // 滚动定位到展开区（自动全部展开时不逐个滚动）
    try { if (!SL._noScroll) expand.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }

  function secTitle(id) {
    if (id === 'recent-update') return '最近更新';
    if (id === 'quick-links') return '快捷直达';
    if (!SL.index) return '';
    var order = SL.index.order || [];
    for (var i = 0; i < order.length; i++) if (order[i].id === id) return order[i].title;
    return '';
  }

  function closeSection(id) {
    var tile = $('sl-sec-' + id);
    if (tile) tile.classList.remove('open');
    SL.expanded[id] = false;
    var expand = $('sl-expand-' + id);
    if (expand) { expand.classList.remove('on'); if (expand.parentNode) expand.parentNode.removeChild(expand); }
    // 允许重新展开时重新渲染（就地展开每次重建）
    var data = SL.loaded[id];
    if (data) data.__rendered = false;
  }

  // 切换展开 / 收起（搜索联动、侧边栏直接调用）
  function toggleSection(id) {
    var tile = $('sl-sec-' + id);
    if (!tile) return;
    if (tile.classList.contains('open')) { closeSection(id); return; }
    openSection(id, SL.globalMode);
  }

  /* ---------------- 渲染分类内容 ---------------- */
  function renderSectionContent(id) {
    if (id === 'quick-links') { renderQuickLinksContent(); return; }
    if (id === 'recent-update') { renderRecentContent(); return; }
    if (id === 'abnormal') { renderAbnormalSection(); return; }
    var data = SL.loaded[id];
    var body = $('sl-body-' + id);
    if (!body || !data || !SL.cssOk) return;
    if (data.__rendered) return;
    data.__rendered = true;

    // 简介 + 卡片
    var cards = data.cards || [];
    var total = 0;
    for (var i = 0; i < cards.length; i++) total += (cards[i].sites || []).length;
    var badge = d.querySelector('[data-expbadge="' + id + '"]') ||
                d.querySelector('[data-badge="' + id + '"]');
    if (badge) badge.textContent = total + ' 站';

    body.innerHTML = '';
    var descEl = d.createElement('div');
    descEl.className = 'sl-sec-desc';
    descEl.innerHTML = '<i class="fas fa-info-circle"></i> 本板块共 ' + cards.length + ' 组、' + total + ' 个网站。点击卡片查看详情与预览。';
    body.appendChild(descEl);

    var mode = SL.globalMode || SL.secMode[id] || 'v';
    var wrap = d.createElement('div');
    wrap.className = 'sl-cards ' + (mode === 'h' ? 'sl-layout-h' : 'sl-layout-v');
    for (var k = 0; k < cards.length; k++) {
      var card = cards[k];
      var cardEl = d.createElement('div');
      cardEl.className = 'sl-card';
      cardEl.innerHTML = cardHtml(card);
      bindCardEvents(cardEl, card, id);
      wrap.appendChild(cardEl);
    }
    body.appendChild(wrap);
    body.classList.add('sl-rendered');
  }

  // 巳泷 v9.0.6：异常区板块（点方块即展开，展开方式跟随顶部总开关）
  function renderAbnormalSection() {
    var id = 'abnormal';
    var body = $('sl-body-' + id);
    if (!body || !SL.cssOk) return;
    body.innerHTML = '';
    var descEl = d.createElement('div');
    descEl.className = 'sl-sec-desc';
    descEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 以下网站在检测时无法正常访问（可能需加速器或已失效），点击「重新检测」可重试';
    body.appendChild(descEl);
    var list = SL.abnormal || [];
    if (!list.length) {
      var empty = d.createElement('div');
      empty.className = 'sl-sec-desc';
      empty.innerHTML = '<i class="fas fa-check-circle"></i> 当前没有异常网站，刷新页面后会自动检测';
      body.appendChild(empty);
    } else {
      var mode = SL.globalMode || 'v';
      var wrap = d.createElement('div');
      wrap.className = 'sl-cards ' + (mode === 'h' ? 'sl-layout-h' : 'sl-layout-v');
      var card = { icon: 'fa-exclamation-triangle', title: '异常网站', sites: [] };
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        card.sites.push({ t: a.t || a.u, u: s2hex(a.u), d: a.d || '' });
      }
      var cardEl = d.createElement('div');
      cardEl.className = 'sl-card';
      cardEl.innerHTML = cardHtml(card);
      bindCardEvents(cardEl, card, id);
      wrap.appendChild(cardEl);
      body.appendChild(wrap);
    }
    var badge = d.querySelector('[data-expbadge="' + id + '"]');
    if (badge) badge.textContent = list.length + ' 站';
    body.classList.add('sl-rendered');
  }

  // 快捷直达板块：渲染顶部快捷栏（.grid-btn）链接，纳入分类体系
  function renderQuickLinksContent() {
    var id = 'quick-links';
    var body = $('sl-body-' + id);
    if (!body || !SL.cssOk) return;
    if (SL._quickRendered) return;
    SL._quickRendered = true;

    var links = d.querySelectorAll('.grid-btn');
    var sites = [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.id === 'album-btn' || a.id === 'quick-expand-btn') continue;
      var href = a.getAttribute('href') || '';
      if (!href || href === '#') continue;
      var txt = (a.textContent || '').trim() || '快捷链接';
      sites.push({ t: txt, u: s2hex(href), c: '#7B4F9D' });
    }
    var badge = d.querySelector('[data-expbadge="' + id + '"]');
    if (badge) badge.textContent = sites.length + ' 站';

    body.innerHTML = '';
    var descEl = d.createElement('div');
    descEl.className = 'sl-sec-desc';
    descEl.innerHTML = '<i class="fas fa-star"></i> 页面顶部快捷直达链接已收纳于此，共 ' + sites.length + ' 个。点击卡片查看详情。';
    body.appendChild(descEl);

    var mode = SL.globalMode || SL.secMode[id] || 'v';
    var wrap = d.createElement('div');
    wrap.className = 'sl-cards ' + (mode === 'h' ? 'sl-layout-h' : 'sl-layout-v');
    var card = { icon: 'fa-star', title: '快捷直达', sites: sites };
    var cardEl = d.createElement('div');
    cardEl.className = 'sl-card';
    cardEl.innerHTML = cardHtml(card);
    bindCardEvents(cardEl, card, id);
    wrap.appendChild(cardEl);
    body.appendChild(wrap);
    body.classList.add('sl-rendered');
  }

  // 最近更新板块：直接拉取仓库 zjgx.html 解析最新资源（不依赖页面其他区块，避免重复展示）
  var RECENT_URL = 'https://silong-respool.github.io/gay/zjgx.html';
  function renderRecentContent() {
    var id = 'recent-update';
    var body = $('sl-body-' + id);
    if (!body || !SL.cssOk) return;
    body.innerHTML = '';
    var descEl = d.createElement('div');
    descEl.className = 'sl-sec-desc';
    descEl.innerHTML = '<i class="fas fa-history"></i> 下方为仓库 AI 拉取的最新资源合集（来自 GitHub Pages 在线仓库）';
    body.appendChild(descEl);

    var loadEl = d.createElement('div');
    loadEl.className = 'sl-sec-desc';
    loadEl.innerHTML = '<i class="fas fa-sync-alt"></i> 最近更新拉取中，稍候自动加载…';
    body.appendChild(loadEl);

    fetchRecent(function (sites, err) {
      // 移走「拉取中」提示
      var loadEl2 = body.querySelector('.sl-sec-desc:last-child');
      if (loadEl2) loadEl2.remove();
      if (!body || !SL.expanded[id]) return;
      if (err) {
        var msgEl = d.createElement('div');
        msgEl.className = 'sl-sec-desc';
        msgEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> 连不上仓库，最近更新暂不可用，请刷新后重试';
        body.appendChild(msgEl);
        return;
      }
      repaintRecent(body, sites);
    });
  }

  // 拉取仓库网页并解析出最新站点（与旧「仓库爬取」区块同一数据源，现直接内嵌此处）
  function fetchRecent(cb) {
    try {
      fetch(RECENT_URL)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var rawItems = doc.querySelectorAll('a.website-item');
          var sites = [];
          Array.prototype.forEach.call(rawItems, function (wi) {
            var a = wi.tagName === 'A' ? wi : wi.querySelector('a');
            if (!a) return;
            var href = a.getAttribute('href') || a.getAttribute('data-url') || '';
            if (!href || href === '#' || href.indexOf('javascript:') === 0) return;
            var nm = (a.getAttribute('data-title') || a.getAttribute('title') || a.textContent || '').trim();
            if (!nm) return;
            var desc = a.getAttribute('data-desc') || '';
            var feats = a.getAttribute('data-features') || '';
            sites.push({ t: nm, u: s2hex(href), d: desc, f: feats, c: '#7B4F9D' });
          });
          // 去重
          var seen = {}, uniq = [];
          for (var i = 0; i < sites.length; i++) {
            var k = sites[i].u;
            if (seen[k]) continue; seen[k] = 1;
            uniq.push(sites[i]);
          }
          cb(uniq, false);
        })
        .catch(function () { cb([], true); });
    } catch (e) { cb([], true); }
  }

  function repaintRecent(body, sites) {
    var uniq = sites || [];
    var badge = d.querySelector('[data-expbadge="' + 'recent-update' + '"]');
    if (badge) badge.textContent = uniq.length + ' 站';
    if (!uniq.length) {
      var empty = d.createElement('div');
      empty.className = 'sl-sec-desc';
      empty.innerHTML = '<i class="fas fa-info-circle"></i> 暂时没有可展示的更新条目';
      body.appendChild(empty);
      return;
    }
    var mode = SL.globalMode || SL.secMode['recent-update'] || 'v';
    var wrap = d.createElement('div');
    wrap.className = 'sl-cards ' + (mode === 'h' ? 'sl-layout-h' : 'sl-layout-v');
    var card = { icon: 'fa-history', title: '最近更新', sites: uniq };
    var cardEl = d.createElement('div');
    cardEl.className = 'sl-card';
    cardEl.innerHTML = cardHtml(card);
    bindCardEvents(cardEl, card, 'recent-update');
    wrap.appendChild(cardEl);
    body.appendChild(wrap);
    body.classList.add('sl-rendered');
  }

  function cardHtml(card) {
    var h = '<div class="sl-card-head">' +
      '<span class="sl-card-ic"><i class="fas ' + esc(card.icon || 'fa-link') + '"></i></span>' +
      '<div class="sl-card-name">' + esc(card.title) + '</div>' +
      '<span class="sl-card-cnt">' + (card.sites || []).length + '</span></div>' +
      '<div class="sl-site-grid">';
    for (var i = 0; i < (card.sites || []).length; i++) {
      h += siteItemHtml(card.sites[i]);
    }
    h += '</div>';
    return h;
  }

  function siteItemHtml(s) {
    var url = hex2s(s.u);
    var name = s.t || '';
    var desc = s.desc || '';
    var color = s.c || '#7B4F9D';
    var imgText = s.it || name;
    var imgSrc = s.img || '';   // 预览图链接（相对 previews/ 或 https）；'#' = 暂无
    // 巳泷 v9.0.5：无站点自带图时优先使用仓库 xqyN.jpg（上传到仓库即可生效）
    if ((!imgSrc || imgSrc === '#') && SL._xqyCount > 0) imgSrc = xqyUrlFor(url);
    var showImg = imgSrc && imgSrc !== '#' && (typeof imgSrc === 'string' || imgSrc.length);
    var cls = 'sl-site';
    if (known(url) === 'bad') cls += ' sl-bad';
    var imgHtml = '<div class="sl-site-img' + (showImg ? ' has-img' : '') + '" style="background-color:' + esc(color) + ';">';
    if (showImg) {
      // 巳泷 v9.2.0：候选列表多路径兜底（用户指定根路径 → /gay/xqy/ → /xqy/ → /gay/）
      var cands = typeof imgSrc === 'string' ? [imgSrc] : imgSrc;
      var first = /^https?:\/\//i.test(cands[0]) || /^data:/i.test(cands[0]) ? cands[0] : path(cands[0]);
      imgHtml += '<img class="sl-site-thumb" src="' + esc(first) + '" alt="" loading="lazy" data-cands="' + esc(JSON.stringify(cands)) + '" onerror="var im=this,c=[];try{c=JSON.parse(im.getAttribute(\'data-cands\')||\'[]\');}catch(e){}c=c.filter(function(u){return u!==im.src;});if(c.length){im.src=c[0];}else{im.parentNode.classList.remove(\'has-img\');im.remove();}">';
    } else {
      imgHtml += '<span class="sl-site-img-txt">' + esc(imgText || name) + '</span>';
    }
    imgHtml += '</div>';
    return '<div class="' + cls + '" data-u="' + esc(url) + '" data-t="' + esc(JSON.stringify(s)) + '">' +
      imgHtml +
      '<div class="sl-site-name">' + esc(name) + '</div>' +
      (desc ? '<div class="sl-site-desc">' + esc(desc) + '</div>' : '') +
      '<div class="sl-site-tag">' + (known(url) === 'bad' ? '<i class="fas fa-exclamation-triangle"></i> 异常' : '<i class="fas fa-external-link-alt"></i> 查看') + '</div>' +
      '</div>';
  }

  function bindCardEvents(cardEl, card, secId) {
    var sites = cardEl.querySelectorAll('.sl-site');
    for (var i = 0; i < sites.length; i++) {
      (function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var item = safeParse(el.getAttribute('data-t'));
          if (!item) return;
          openDetail(item);
        });
        // 懒加载页内检测（进入视口才探针）
        observeOnce(el, function () {
          var url = el.getAttribute('data-u');
          if (url && !known(url)) {
            probeUrl(url, function (st) {
              if (st === 'bad') { el.classList.add('sl-bad'); collectAbnormal(el); }
              else renderHealthTag(el);
            });
          }
        });
      })(sites[i]);
    }
  }

  function safeParse(s) {
    try { return JSON.parse(s || '{}'); } catch (e) { return null; }
  }
  function renderHealthTag(el) {
    var url = el.getAttribute('data-u');
    var st = known(url);
    var tag = el.querySelector('.sl-site-tag');
    if (!tag) return;
    if (st === 'bad') tag.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 异常';
    else tag.innerHTML = '<i class="fas fa-external-link-alt"></i> 查看';
  }

  /* ---------------- 异常区 ---------------- */
  function collectAbnormal(el) {
    var url = el.getAttribute('data-u');
    if (!url) return;
    for (var i = 0; i < SL.abnormal.length; i++) if (SL.abnormal[i].u === url) return;
    var item = safeParse(el.getAttribute('data-t'));
    SL.abnormal.push({ t: (item && item.t) || '', u: url, d: (item && item.d) || '' });
    renderAbnormalZone();
  }
  function renderAbnormalZone() {
    var zone = $('sl-abnormal-zone');
    if (!zone) return;
    if (!SL.abnormal.length) { zone.style.display = 'none'; return; }
    zone.style.display = 'block';
    var list = $('sl-abnormal-list');
    if (!list) return;
    var h = '';
    for (var i = 0; i < SL.abnormal.length; i++) {
      var a = SL.abnormal[i];
      h += '<div class="sl-abn-item" data-u="' + esc(a.u) + '">' +
        '<span class="sl-abn-nm">' + esc(a.t || a.u) + '</span>' +
        '<span class="sl-abn-url">' + esc(a.u) + '</span>' +
        '<button class="sl-abn-goto" data-u2="' + esc(a.u) + '">重新检测</button>' +
        '</div>';
    }
    list.innerHTML = h;
  }

  /* ---------------- 详情弹窗（16:9 预览：图→iframe→文字） ---------------- */
  var detailModal = null, detailPreview = null, detailPreviewImg = null, detailPreviewFrame = null, detailTitleEl = null,
      detailUrlEl = null, detailDescEl = null, detailFeaturesEl = null, detailPwBox = null, detailPw = null,
      detailImgEl = null, curItem = null;

  function initDetailEls() {
    detailModal = $('detailModal');
    if (!detailModal) return true;
    detailTitleEl = $('detailTitle');
    detailUrlEl = $('detailUrl');
    detailDescEl = $('detailDesc');
    detailFeaturesEl = $('detailFeatures');
    detailPwBox = $('detailPasswordBox');
    detailPw = $('detailPassword');
    detailImgEl = $('detailImg');
    // 预览框：若原 DOM 无则注入（16:9），内嵌在弹窗文字介绍上方
    detailPreview = $('detailPreview');
    if (!detailPreview && detailModal) {
      try {
        // 巳泷 v9.0.0：弹窗为「固定高度壳 + 内部可滚动区」结构，预览框插入可滚动内容区内
        var content = detailModal.querySelector('div[style*="overflow-y: auto"]') || detailModal.querySelector('div[style*="max-width: 520px"]') || detailModal.firstElementChild;
        var box = d.createElement('div');
        box.id = 'detailPreview';
        box.className = 'sl-preview';
        box.innerHTML = '<div class="sl-preview-inner">' +
          '<img id="detailPreviewImg" class="sl-preview-img" alt="" style="display:none;">' +
          '<iframe id="detailPreviewFrame" class="sl-preview-frame" sandbox="allow-scripts" scrolling="no" style="display:none;"></iframe>' +
          '<div class="sl-preview-loading" id="detailPreviewLoading"><span class="sl-spin"></span>正在加载预览…</div>' +
          '<div class="sl-preview-fallback" id="detailPreviewFallback" style="display:none;">' +
          '<i class="fas fa-globe"></i><div>暂无法加载网页预览，将以文字方式展示</div></div>' +
          '</div>';
        // 找到文字介绍区（含 detailUrl 的容器），把 16:9 预览框插到标题正下方、简介上方
        var infoSec = null;
        var urlEl = content.querySelector && content.querySelector('[id="detailUrl"]');
        if (urlEl) infoSec = urlEl.closest && urlEl.closest('div[style*="padding: 16px"]');
        // 插入点可能是嵌套节点：统一插到其父容器内（若 refNode 是 content 直接子节点则直接插前面）
        var refNode = infoSec || content.children[2] || content.children[1] || content.firstChild;
        if (refNode && refNode.parentNode && refNode.parentNode !== content) {
          refNode.parentNode.insertBefore(box, refNode);
        } else {
          content.insertBefore(box, refNode);
        }
        detailPreview = box;
        detailPreviewImg = $('detailPreviewImg');
        detailPreviewFrame = $('detailPreviewFrame');
      } catch (e) {
        // 预览框注入失败不影响其它功能
        try { console.warn('[SL] detailPreview 注入失败:', e); } catch (e2) {}
      }
    } else {
      detailPreviewImg = $('detailPreviewImg');
      detailPreviewFrame = $('detailPreviewFrame');
    }
    return true;
  }

  // 打开详情：previewType: 'img' | 'frame' | 'text'
  function openDetail(item) {
    if (!item) return;
    curItem = item;
    initDetailEls();
    if (!detailModal) return;

    var url = hex2s(item.u);
    var name = item.t || '未知网站';
    var desc = item.d || '';
    var features = item.f || '';
    var pw = hex2s(item.pw);
    var color = item.c || '#7B4F9D';

    if (detailTitleEl) detailTitleEl.textContent = name;
    if (detailUrlEl) detailUrlEl.textContent = url || '无网址';
    if (detailDescEl) detailDescEl.textContent = desc || '暂无描述';
    if (detailFeaturesEl) detailFeaturesEl.textContent = (features || '').split('|').join(' · ') || '暂无特点';
    if (detailPwBox) detailPwBox.style.display = pw ? 'block' : 'none';
    if (detailPw) detailPw.textContent = pw || '';
    if (detailImgEl) { detailImgEl.style.backgroundColor = color; detailImgEl.textContent = (item.it || name).slice(0, 1); }

    // 预览框三级：图 → iframe → 文字
    renderPreview(item, url);

    detailModal.style.display = 'flex';
    detailModal.style.alignItems = 'center';
    detailModal.style.justifyContent = 'center';
    d.body.style.overflow = 'hidden';
    // 兼容旧"前往网站"
    var goBtn = $('detailGoBtn');
    if (goBtn) {
      goBtn.onclick = function () { if (url) w.open(url, '_blank', 'noopener,noreferrer'); };
    }
    // 兼容旧收藏
    updateDetailFavBtn(item);
    var closeBtn = $('detailCloseNewBtn') || $('detailModalClose');
    if (closeBtn) closeBtn.onclick = closeDetail;
  }

  // v9.0.5 详情预览三级降级：仓库图片(xqyN) → 站点自带图 → 网页快照(iframe) → 无法加载则隐藏展示框
  function renderPreview(item, url) {
    if (!detailPreview) return;
    var imgSrc = item.img || '';
    var loading = $('detailPreviewLoading');
    var fb = $('detailPreviewFallback');
    var imgEl = detailPreviewImg;
    var frameEl = detailPreviewFrame;
    if (!imgEl || !frameEl) return;
    // 复位
    imgEl.style.display = 'none';
    frameEl.style.display = 'none';
    frameEl.src = 'about:blank';
    detailPreview.style.display = 'block';
    if (loading) loading.style.display = 'flex';
    if (fb) fb.style.display = 'none';

    // 一级/二级：仓库 xqyN.jpg 优先，其次站点自带图；图可见 → 展示图，图不可见 → 降级网页快照
    var xqyCands = url ? xqyUrlFor(url) : [];
    var cand = (xqyCands.length && (!imgSrc || imgSrc === '#')) ? xqyCands[0] : (imgSrc && imgSrc !== '#' ? imgSrc : (xqyCands.length ? xqyCands[0] : ''));
    if (cand && (url || imgSrc)) {
      var full = /^https?:\/\//i.test(cand) || /^data:/i.test(cand) ? cand : path(cand);
      imgEl.onload = function () { if (loading) loading.style.display = 'none'; imgEl.style.display = 'block'; };
      // 巳泷 v9.2.0：xqy 图多路径兜底（根路径失败 → /gay/xqy/ → /xqy/ → /gay/）
      imgEl.onerror = function () {
        if (xqyCands.length > 1) {
          var next = xqyCands.slice(1).filter(function (u2) { return u2 !== imgEl.src; });
          if (next.length) { imgEl.src = next[0]; return; }
        }
        hidePreviewOnFail(loading, fb); if (url && /^https?:\/\//i.test(url)) { tryFramePreview(url, loading, fb, frameEl); }
      };
      imgEl.src = full;
      return;
    }
    // 三级：iframe 网页快照（禁交互，5s 兜底）
    if (url && /^https?:\/\//i.test(url)) {
      tryFramePreview(url, loading, fb, frameEl);
      return;
    }
    // 无法展示 → 隐藏展示框
    hidePreviewOnFail(loading, fb);
  }

  // 网页快照也加载不出来 → 直接隐藏整个展示框（不占位、不显示“文字兜底”）
  function hidePreviewOnFail(loading, fb) {
    try { if (detailPreview) detailPreview.style.display = 'none'; } catch (e) {}
    if (loading) loading.style.display = 'none';
    if (fb) fb.style.display = 'none';
  }

  function tryFramePreview(url, loading, fb, frameEl) {
    if (!frameEl) return;
    var t = setTimeout(function () {
      // iframe 加载超时或无法跨域 → 隐藏展示框（v9.0.5：内容加载不出就不展示）
      if (frameEl.style.display !== 'block') {
        hidePreviewOnFail(loading, fb);
        frameEl.style.display = 'none';
        frameEl.src = 'about:blank';
      }
    }, 2200);
    frameEl.onload = function () {
      try {
        clearTimeout(t);
        if (loading) loading.style.display = 'none';
        frameEl.style.display = 'block';
        if (fb) fb.style.display = 'none';
      } catch (e) {}
    };
    // pointer-events 禁交互，仅展示首屏快照（无法 JS 冻结跨域页，此为实时预览最佳近似）
    try { frameEl.src = url; } catch (e) { clearTimeout(t); hidePreviewOnFail(loading, fb); }
    // 稍后固定为静态画面（模拟截取）
    setTimeout(function () {
      try {
        frameEl.style.pointerEvents = 'none';
        frameEl.style.userSelect = 'none';
        frameEl.style.overflow = 'hidden';
      } catch (e) {}
    }, 2800);
  }

  function updateDetailFavBtn(item) {
    try {
      var favBtn = $('detailFavoriteBtn');
      if (!favBtn) return;
      var url = hex2s(item.u);
      var favs = lsGet('resource_favorites', []);
      var faved = false;
      for (var i = 0; i < favs.length; i++) if (favs[i] && favs[i].url === url) { faved = true; break; }
      favBtn.innerHTML = faved ? '<i class="fas fa-star"></i> 已收藏' : '<i class="far fa-star"></i> 收藏网站';
      favBtn.classList.toggle('favorited', faved);
      favBtn.onclick = function (e) {
        e.preventDefault(); e.stopPropagation();
        toggleFav(item, url, favBtn);
      };
    } catch (e) {}
  }
  function toggleFav(item, url, btn) {
    var favs = lsGet('resource_favorites', []);
    var idx = -1;
    for (var i = 0; i < favs.length; i++) if (favs[i] && favs[i].url === url) { idx = i; break; }
    if (idx >= 0) {
      favs.splice(idx, 1);
      btn.innerHTML = '<i class="far fa-star"></i> 收藏网站';
      btn.classList.remove('favorited');
    } else {
      favs.unshift({ title: item.t, url: url, desc: item.d, features: item.f, timestamp: Date.now() });
      btn.innerHTML = '<i class="fas fa-star"></i> 已收藏';
      btn.classList.add('favorited');
    }
    lsSet('resource_favorites', favs);
  }
  function closeDetail() {
    if (detailModal) detailModal.style.display = 'none';
    d.body.style.overflow = '';
    if (detailPreviewFrame) detailPreviewFrame.src = 'about:blank';
  }

  /* ---------------- 异常区重检按钮（事件委托） ---------------- */
  function bindGlobalEvents() {
    d.addEventListener('click', function (e) {
      var t = e.target;
      // 异常区「重新检测」
      var btn = t.closest && t.closest('[data-u2]');
      if (btn) {
        e.preventDefault();
        var u = btn.getAttribute('data-u2');
        if (u) {
          SL.health[u] = 'checking';
          lsSet(HEALTH_KEY, SL.health);
          probeUrl(u, function (st) {
            if (st === 'ok') {
              // 从异常区移除
              SL.abnormal = SL.abnormal.filter(function (a) { return a.u !== u; });
              renderAbnormalZone();
              // 原板块卡片恢复标记
              d.querySelectorAll('.sl-site[data-u="' + u + '"]').forEach(function (el) { el.classList.remove('sl-bad'); });
            } else {
              // 还是 bad：刷新该条目为重检按钮状态
              renderAbnormalZone();
            }
          });
        }
        return;
      }
      // 展开区「收起」按钮
      var closeSec = t.closest && t.closest('[data-close-sec]');
      if (closeSec) {
        e.preventDefault();
        closeSection(closeSec.getAttribute('data-close-sec'));
        return;
      }
      // 关闭详情弹窗（点背景）
      if (detailModal && t === detailModal) closeDetail();
    });
  }

  /* ---------------- 快捷栏链接 → 详情弹窗 ---------------- */
  function renderQuickbarDetails() {
    var links = d.querySelectorAll('.grid-btn');
    for (var i = 0; i < links.length; i++) {
      (function (a) {
        var href = a.getAttribute('href') || '';
        var txt = (a.textContent || '').trim() || '快捷链接';
        if (a.id === 'album-btn') return;              // 相册按钮保留原逻辑
        if (a.id === 'quick-expand-btn') return;        // 展开按钮保留
        a.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var item = { t: txt, d: '', f: '快捷直达', u: hex2hex(href), c: '#7B4F9D' };
          openDetail(item);
        });
      })(links[i]);
    }
  }

  function hex2hex(url) {
    // 快捷栏 URL 也存在 html 上（防窃取有限，但主数据已隐藏；此处保持简单）
    return url;
  }

  /* ---------------- 搜索联动（覆盖旧站内搜索为全量检索） ---------------- */
  w.slSiteSearch = function (query, secSel) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    var out = [];
    for (var id in SL.loaded) {
      var data = SL.loaded[id];
      if (!data || !data.cards) continue;
      if (secSel && secSel !== 'all' && id !== secSel) continue;
      for (var ci = 0; ci < data.cards.length; ci++) {
        var card = data.cards[ci];
        for (var si = 0; si < (card.sites || []).length; si++) {
          var s = card.sites[si];
          var name = String(s.t || '').toLowerCase();
          var desc = String(s.d || '').toLowerCase();
          var kw = String(s.k || '').toLowerCase();
          if (name.indexOf(q) >= 0 || desc.indexOf(q) >= 0 || kw.indexOf(q) >= 0) {
            out.push({ site: s, card: card, secId: id, secTitle: data.title });
          }
        }
      }
    }
    return out;
  };
  // 全量数据就绪后才可搜索；未加载板块自动补载
  w.slEnsureAll = function (cb) {
    var idx = SL.index;
    if (!idx) { if (cb) cb(); return; }
    var pending = (idx.order || []).slice();
    var step = function () {
      if (!pending.length) { if (cb) cb(); return; }
      var id = pending.shift();
      if (SL.loaded[id]) { step(); return; }
      getData(id, function () { step(); });
    };
    step();
  };

  /* ---------------- 侧边栏增强：快速平移到板块 + 打开简介 ---------------- */
  function enhanceSidebar() {
    var links = d.querySelectorAll('.sidebar .menu-main');
    for (var i = 0; i < links.length; i++) {
      (function (a) {
        var href = a.getAttribute('href') || '';
        var m = href && href.match(/^#([\w-]+)$/);
        if (!m) return;
        var targetId = m[1];
        a.addEventListener('click', function (e) {
          // 让原平滑滚动逻辑尝试后，再确保板块存在
          setTimeout(function () {
            openSectionPicker(targetId);
            var sb = $('sidebar');
            if (sb) sb.classList.remove('active');
          }, 60);
        });
      })(links[i]);
    }
  }

  /* ---------------- 后端实时数据（近期更新）保留 ---------------- */
  // 原 recent-update 拉取脚本仍在 index.html，无需处理

  /* ---------------- v9.0.6：主页预选主题色（默认赛博紫 + 黑/棕/粉/红/橙/黄/绿/青/蓝/紫 + 自定义） ---------------- */
  var THEME_KEY = LS_PREFIX + '_theme';
  var THEMES = ['default', 'black', 'brown', 'pink', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];
  var THEME_NAMES = {
    default: '梦幻紫', black: '极简黑', brown: '棕色系', pink: '霓虹粉',
    red: '赤焰红', orange: '活力橙', yellow: '柠檬黄', green: '翡翠绿',
    cyan: '冰晶青', blue: '深海蓝', purple: '赛博紫罗兰'
  };
  var THEME_DOTS = {
    default: '#a855f7', black: '#0c0a12', brown: '#a06a3a', pink: '#ff6ec7',
    red: '#ff4d4d', orange: '#ff9f43', yellow: '#ffd93d', green: '#2ed573',
    cyan: '#22d3ee', blue: '#3b82f6', purple: '#8b48eb'
  };
  function currentTheme() {
    var t = '';
    try { t = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (THEMES.indexOf(t) < 0) t = 'default';
    return t;
  }
  function applyTheme(t) {
    if (THEMES.indexOf(t) < 0) t = 'default';
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    d.documentElement.setAttribute('data-theme', t);
    paintThemeSwitcher(t);
  }
  function paintThemeSwitcher(t) {
    var sw = $('slThemeSwitcher');
    if (sw) {
      var chips = sw.querySelectorAll('[data-theme-sel]');
      for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('on', chips[i].getAttribute('data-theme-sel') === t);
    }
    var lb = $('slThemeName');
    if (lb) lb.textContent = THEME_NAMES[t] || '梦幻紫';
  }
  function themeChip(t) {
    var on = currentTheme() === t ? ' on' : '';
    return '<button class="sl-theme-chip' + on + '" data-theme-sel="' + t + '" type="button">' +
      '<span class="sl-theme-dot" style="background:' + (THEME_DOTS[t] || '#8b48eb') + ';"></span>' +
      '<span class="sl-theme-chip-name">' + (THEME_NAMES[t] || t) + '</span></button>';
  }
  // 巳泷 v9.0.6：主题颜色入口 → 侧边栏「功能设置」分类下面（名称：主题颜色，图标：房子；与「体验新版」交换位置）
  function injectThemeUI() {
    if ($('slThemeBtn')) return;
    var settingsNav = null;
    var titles = d.querySelectorAll('.sidebar .sidebar-title');
    for (var i = 0; i < titles.length; i++) {
      if ((titles[i].textContent || '').indexOf('功能设置') >= 0) {
        settingsNav = titles[i].nextElementSibling;
        break;
      }
    }
    if (!settingsNav) settingsNav = d.querySelector('.sidebar .sidebar-menu');
    if (!settingsNav) return;
    var group = d.createElement('div');
    group.className = 'menu-group';
    var a = d.createElement('a');
    a.className = 'menu-main';
    a.id = 'slThemeBtn';
    a.href = '#';
    a.setAttribute('style', 'display:flex;align-items:center;padding:12px 15px;color:var(--text-color);text-decoration:none;transition:all 0.3s ease;width:100%;box-sizing:border-box;border-left:3px solid transparent;font-size:0.95rem;gap:12px;opacity:0.7;');
    a.innerHTML = '<i class="fas fa-house" style="width:20px;text-align:center;font-size:1rem;color:inherit;opacity:0.7;"></i>' +
      '<span class="menu-text" style="flex:1;color:inherit;">主题颜色</span>';
    group.appendChild(a);
    // 插到「体验新版」之前（实现位置交换：主题颜色在体验新版上方）
    var exp = null;
    var mlinks = settingsNav.querySelectorAll('a.menu-main');
    for (var mi = 0; mi < mlinks.length; mi++) {
      if ((mlinks[mi].textContent || '').indexOf('体验新版') >= 0) { exp = mlinks[mi]; break; }
    }
    if (exp && exp.parentNode) settingsNav.insertBefore(group, exp.parentNode);
    else settingsNav.appendChild(group);

    var sw = d.createElement('div');
    sw.id = 'slThemeSwitcher';
    sw.className = 'sl-theme-switcher';
    sw.innerHTML = '<div class="sl-theme-head">' +
      '<span class="sl-theme-title"><i class="fas fa-palette"></i> 预选主题色</span>' +
      '<span id="slThemeName" class="sl-theme-cur">赛博紫罗兰</span>' +
      '<button type="button" id="slThemeClose" class="sl-theme-close"><i class="fas fa-times"></i></button></div>' +
      '<div class="sl-theme-grid">' +
      themeChip('default') + themeChip('black') + themeChip('brown') + themeChip('pink') +
      themeChip('red') + themeChip('orange') + themeChip('yellow') + themeChip('green') +
      themeChip('cyan') + themeChip('blue') + themeChip('purple') +
      '<button class="sl-theme-chip sl-theme-custom" id="slThemeCustom" type="button">' +
      '<span class="sl-theme-dot" style="background:conic-gradient(#ff6ec7,#ffd93d,#2ed573,#22d3ee,#a855f7,#ff6ec7);"></span>' +
      '<span class="sl-theme-chip-name">自定义</span></button>' +
      '</div>' +
      '<div class="sl-theme-tip">默认梦幻紫；黑/棕为极简风，其余为霓虹单色主题；最右「自定义」可任意调色并支持渐变</div>';
    d.body.appendChild(sw);
    a.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      sw.classList.toggle('on');
    });
    var close = $('slThemeClose');
    if (close) close.addEventListener('click', function () { sw.classList.remove('on'); });
    sw.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('[data-theme-sel]');
      if (chip) {
        applyTheme(chip.getAttribute('data-theme-sel'));
        sw.classList.remove('on');
        return;
      }
      // 巳泷 v9.0.6：最右「自定义」按钮 → 自定义调色编辑器
      if (e.target.closest && e.target.closest('#slThemeCustom')) {
        sw.classList.remove('on');
        openCustomThemeEditor();
      }
    });
    d.addEventListener('click', function (e) {
      if (sw.classList.contains('on') && e.target !== a && !sw.contains(e.target) && !a.contains(e.target)) sw.classList.remove('on');
    });
    applyTheme(currentTheme());
  }
  w.slSetTheme = applyTheme;
  w.slGetTheme = currentTheme;

  /* ===================================================================
     巳泷 v9.0.6：自定义主题编辑器
     界面主色（全色系色盘）与文字颜色 完全独立：
     各自可选 颜色1 + 颜色2 + 渐变模式（水平/垂直/对角）+ 强度 + 位置
     =================================================================== */
  var CUSTOM_KEY = LS_PREFIX + '_custom';
  function customDefault() {
    return { a1: '#ff6ec7', a2: '#a855f7', aMode: 'h', aPos: 50, aStr: 55,
             t1: '#ffffff', t2: '#ffe1f2', tMode: 'h', tPos: 50, tGrad: '1', tStr: 60 };
  }
  function customLoad() { var s = lsGet(CUSTOM_KEY, null); return s || customDefault(); }
  function customSave(s) { lsSet(CUSTOM_KEY, s); }
  function h2rgb(h) {
    try {
      var v = String(h || '').trim();
      if (v.charAt(0) === '#') {
        v = v.slice(1);
        if (v.length === 3) v = v.split('').map(function (c) { return c + c; }).join('');
        return { r: parseInt(v.substr(0, 2), 16), g: parseInt(v.substr(2, 2), 16), b: parseInt(v.substr(4, 2), 16) };
      }
      if (v.indexOf('rgb') === 0) {
        var m = v.match(/[\d.]+/g) || [];
        return { r: +m[0] || 0, g: +m[1] || 0, b: +m[2] || 0 };
      }
    } catch (e) {}
    return { r: 255, g: 110, b: 199 };
  }
  function h2s(h) { var c = h2rgb(h); return '#' + ('0' + c.r.toString(16)).slice(-2) + ('0' + c.g.toString(16)).slice(-2) + ('0' + c.b.toString(16)).slice(-2); }
  function rgba(h, a) { var c = h2rgb(h); return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
  function mixC(h1, h2, t) {
    var a = h2rgb(h1), b = h2rgb(h2); t = Math.max(0, Math.min(1, t));
    var r = Math.round(a.r + (b.r - a.r) * t), g = Math.round(a.g + (b.g - a.g) * t), bl = Math.round(a.b + (b.b - a.b) * t);
    return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + bl.toString(16)).slice(-2);
  }
  function gdeg(m) { return { h: '90deg', v: '180deg', d: '135deg' }[m] || '90deg'; }

  function applyCustomTheme(s) {
    s = s || customLoad();
    var a1 = h2s(s.a1), a2 = h2s(s.a2), aMode = s.aMode || 'h',
        aPos = Math.max(0, Math.min(100, parseInt(s.aPos, 10) || 50)),
        aStr = Math.max(0, Math.min(100, parseInt(s.aStr, 10) || 55)) / 100;
    var t1 = h2s(s.t1), t2 = h2s(s.t2), tMode = s.tMode || 'h',
        tPos = Math.max(0, Math.min(100, parseInt(s.tPos, 10) || 50)),
        tGrad = s.tGrad === '1', tStr = Math.max(0, Math.min(100, parseInt(s.tStr, 10) || 60)) / 100;
    var a3 = mixC(a1, a2, 0.5);
    var dg = gdeg(aMode), dgt = gdeg(tMode);
    var bg1 = mixC(a1, '#0a0418', 0.86), bg2 = mixC(a1, '#0a0418', 0.8), bg3 = mixC(a1, '#0a0418', 0.72);
    var card = mixC(a1, '#0a0418', 0.78), glass = mixC(a1, '#05001a', 0.55);
    var tx1 = t1, tx2 = mixC(t1, '#999999', 0.4), tx3 = mixC(t1, '#777777', 0.55);
    var titleGrad = tGrad ? ('linear-gradient(' + dgt + ', ' + t1 + ' ' + tPos + '%, ' + t2 + ')')
                          : ('linear-gradient(' + dgt + ', ' + t1 + ', ' + t1 + ')');
    var css =
      'html[data-theme="custom"]{' +
      '--sl-bg1:' + bg1 + ';' +
      '--sl-bg-grad:linear-gradient(170deg,' + bg3 + ' 0%,' + bg2 + ' 50%,' + bg1 + ' 100%),radial-gradient(ellipse 80% 50% at 50% -15%,' + rgba(a1, aStr * 0.5) + ' 0%,transparent 60%);' +
      '--sl-grid-op:.3;' +
      '--sl-glass:' + rgba(glass, 0.66) + ';' +
      '--sl-glass2:' + rgba(glass, 0.5) + ';' +
      '--sl-border:' + rgba(a1, Math.max(0.12, aStr * 0.55)) + ';' +
      '--sl-card:' + rgba(card, 0.7) + ';' +
      '--sl-site:rgba(255,255,255,.05);' +
      '--sl-tx1:' + tx1 + ';' +
      '--sl-tx2:' + tx2 + ';' +
      '--sl-tx3:' + tx3 + ';' +
      '--sl-a1:' + a1 + ';--sl-a2:' + a2 + ';--sl-a3:' + a3 + ';' +
      '--sl-a1a:' + rgba(a1, aStr * 0.5) + ';--sl-a2a:' + rgba(a2, aStr * 0.38) + ';--sl-a3a:' + rgba(a3, aStr * 0.3) + ';' +
      '--sl-navline:linear-gradient(90deg,transparent,' + a1 + ',' + a2 + ',transparent);' +
      '--sl-title-grad:' + titleGrad + ';' +
      '--sl-chip-bg:' + rgba(a1, aStr * 0.22) + ';' +
      '--sl-chip-on:linear-gradient(135deg,' + a1 + ',' + a2 + ');' +
      '--sl-ic-grad:linear-gradient(' + dg + ', ' + rgba(a1, 0.7) + ', ' + rgba(a2, 0.55) + ', ' + rgba(a3, 0.4) + ');' +
      '--sl-head-grad:linear-gradient(90deg, ' + rgba(a1, 0.2) + ', ' + rgba(a2, 0.16) + ', ' + rgba(a3, 0.1) + ');' +
      '--sl-tile-border-grad:linear-gradient(' + dg + ', ' + rgba(a1, 0.6) + ', ' + rgba(a2, 0.2) + ' 45%, ' + rgba(a3, 0.55) + ');' +
      '--sl-topbar-grad:linear-gradient(' + dg + ',' + a1 + ',' + a2 + ',' + a1 + ',' + a2 + ');' +
      '--sl-toast-bg:linear-gradient(135deg, ' + rgba(a1, 0.92) + ', ' + rgba(a2, 0.9) + ');' +
      '}';
    var st = $('slCustomStyle');
    if (!st) { st = d.createElement('style'); st.id = 'slCustomStyle'; (d.head || d.documentElement).appendChild(st); }
    st.textContent = css;
    customSave(s);
    applyTheme('custom');
  }

  function openCustomThemeEditor() {
    try {
      if ($('slCustomEditor')) { $('slCustomEditor').style.display = 'flex'; return; }
      var s = customLoad();
      var modal = d.createElement('div');
      modal.id = 'slCustomEditor';
      modal.className = 'sl-custom-editor';
      modal.innerHTML =
        '<div class="sl-custom-box">' +
        '<div class="sl-theme-head"><span class="sl-theme-title"><i class="fas fa-paintbrush"></i> 自定义主题</span>' +
        '<button type="button" id="slCustomClose" class="sl-theme-close"><i class="fas fa-times"></i></button></div>' +
        '<div class="sl-custom-sec"><div class="sl-custom-sec-t">界面主色（全色系色盘）</div>' +
        '<div class="sl-custom-row"><label>颜色1</label><input type="color" id="cA1" value="' + s.a1 + '"><label>颜色2</label><input type="color" id="cA2" value="' + s.a2 + '"></div>' +
        '<div class="sl-custom-row"><label>渐变模式</label><span class="sl-custom-modes" id="cAM">' +
        '<button data-m="h" type="button">水平</button><button data-m="v" type="button">垂直</button><button data-m="d" type="button">对角</button></span></div>' +
        '<div class="sl-custom-row"><label>强度</label><input type="range" id="cAS" min="0" max="100" value="' + s.aStr + '"><b id="cASv">' + s.aStr + '</b></div>' +
        '<div class="sl-custom-row"><label>位置</label><input type="range" id="cAP" min="0" max="100" value="' + s.aPos + '"><b id="cAPv">' + s.aPos + '</b></div></div>' +
        '<div class="sl-custom-sec"><div class="sl-custom-sec-t">文字颜色（独立设置）</div>' +
        '<div class="sl-custom-row"><label>启用渐变</label><input type="checkbox" id="cTG" ' + (s.tGrad === '1' ? 'checked' : '') + '></div>' +
        '<div class="sl-custom-row"><label>颜色1</label><input type="color" id="cT1" value="' + s.t1 + '"><label>颜色2</label><input type="color" id="cT2" value="' + s.t2 + '"></div>' +
        '<div class="sl-custom-row"><label>渐变模式</label><span class="sl-custom-modes" id="cTM">' +
        '<button data-m="h" type="button">水平</button><button data-m="v" type="button">垂直</button><button data-m="d" type="button">对角</button></span></div>' +
        '<div class="sl-custom-row"><label>位置</label><input type="range" id="cTP" min="0" max="100" value="' + s.tPos + '"><b id="cTPv">' + s.tPos + '</b></div></div>' +
        '<div class="sl-custom-acts">' +
        '<button type="button" id="slCustomReset">恢复默认</button>' +
        '<button type="button" id="slCustomApply">应用</button></div>' +
        '</div>';
      d.body.appendChild(modal);
      var paintModes = function (wrap, cur) {
        var bs = wrap.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-m') === cur);
      };
      paintModes($('cAM'), s.aMode); paintModes($('cTM'), s.tMode);
      var val = function (id, label) { var el = $(id); if (el) el.oninput = function () { $(label).textContent = el.value; }; };
      val('cAS', 'cASv'); val('cAP', 'cAPv'); val('cTP', 'cTPv');
      var mode = function (wrapId) {
        var wrap = $(wrapId);
        if (wrap) wrap.onclick = function (e) {
          var b = e.target.closest && e.target.closest('button[data-m]');
          if (!b) return;
          paintModes(wrap, b.getAttribute('data-m'));
        };
      };
      mode('cAM'); mode('cTM');
      $('slCustomClose').onclick = function () { modal.style.display = 'none'; };
      modal.onclick = function (e) { if (e.target === modal) modal.style.display = 'none'; };
      $('slCustomReset').onclick = function () {
        var dft = customDefault();
        $('cA1').value = dft.a1; $('cA2').value = dft.a2; $('cT1').value = dft.t1; $('cT2').value = dft.t2;
        $('cAS').value = dft.aStr; $('cAP').value = dft.aPos; $('cTP').value = dft.tPos; $('cTG').checked = true;
        $('cASv').textContent = dft.aStr; $('cAPv').textContent = dft.aPos; $('cTPv').textContent = dft.tPos;
        paintModes($('cAM'), dft.aMode); paintModes($('cTM'), dft.tMode);
      };
      $('slCustomApply').onclick = function () {
        var ns = {
          a1: $('cA1').value, a2: $('cA2').value,
          aMode: ($('cAM').querySelector('button.on') || {}).getAttribute ? $('cAM').querySelector('button.on').getAttribute('data-m') : 'h',
          aPos: parseInt($('cAP').value, 10), aStr: parseInt($('cAS').value, 10),
          t1: $('cT1').value, t2: $('cT2').value,
          tMode: ($('cTM').querySelector('button.on') || {}).getAttribute ? $('cTM').querySelector('button.on').getAttribute('data-m') : 'h',
          tPos: parseInt($('cTP').value, 10), tGrad: $('cTG').checked ? '1' : '0', tStr: 60
        };
        applyCustomTheme(ns);
        modal.style.display = 'none';
        try { if (w.slShowHitToast) w.slShowHitToast('已应用自定义主题', 1); } catch (e) {}
      };
    } catch (e) {}
  }
  // 已存在自定义主题时启动恢复
  w.slSetCustomTheme = applyCustomTheme;

  /* ---------------- 启动 ---------------- */
  function boot() {
    SL._bootTime = Date.now();
    loadScript('data/index.js', function () {
      SL.index = (w.SLINDEX && SLINDEX.order) ? SLINDEX : null;
      if (!SL.index) { console.error('SLINDEX 加载失败'); }
      var saved = lsGet(LS_PREFIX + '_layout', 'v');
      SL.layout = saved === 'h' ? 'h' : 'v';
      // v9.0.5：读取顶部展开方向总开关记忆
      SL.globalMode = lsGet(LS_PREFIX + '_expmode', 'v') === 'h' ? 'h' : 'v';
      // 读取健康缓存
      SL.health = lsGet(HEALTH_KEY, {}) || {};
      initDetailEls();
      initPicker();
      renderQuickbarDetails();
      enhanceSidebar();
      bindGlobalEvents();
      // v9.0.5：主题色预选（顶部导航调色盘）
      injectThemeUI();
      // 巳泷 v9.0.6：若上次用的是自定义主题，恢复自定义色盘
      if (currentTheme() === 'custom') applyCustomTheme(customLoad());
      gateCss();               // CSS 就绪后 renderBoard
      // 尾部异常区容器
      injectAbnormalZone();
      // 搜索框接管：全量检索
      wireSearch();
      // v9.0.5：预载各板块数据文件（本地 assets 体积小）→ 建立 xqy 序号地图（稳定编号）
      var order = (SL.index && SL.index.order) || [];
      var q = [];
      for (var i = 0; i < order.length; i++) if (order[i] && order[i].id) q.push(order[i].id);
      var stepQ = function () {
        if (!q.length) { buildXqyMap(); return; }
        var id = q.shift();
        getData(id, function () { stepQ(); });
      };
      stepQ();
    });
  }

  function injectAbnormalZone() {
    if ($('sl-abnormal-zone')) return;
    var zone = d.createElement('div');
    zone.id = 'sl-abnormal-zone';
    zone.className = 'sl-abnormal-zone';
    zone.style.display = 'none';
    zone.innerHTML = '<div class="sl-abn-head"><i class="fas fa-exclamation-triangle"></i> 异常区</div>' +
      '<div class="sl-abn-sub">以下网站在检测时无法正常访问（可能需加速器或已失效），点击「重新检测」可重试</div>' +
      '<div id="sl-abnormal-list" class="sl-abn-list"></div>';
    var board = $('sl-board');
    if (board) board.appendChild(zone);
  }

  function wireSearch() {
    // 复用原搜索抽屉的输入框与按钮：本站搜索改写为全量检索
    var kw = $('kw');
    var btn = $('doSearchBtn');
    var oldDo = w.doSearch || null;
    if (!kw || !btn) return;
    // 拦截 executeSearch 的 'site' 分支（原脚本已定义；此处覆盖全局函数）
    if (typeof w.executeSearch === 'function' && !w.__slSearchPatched) {
      w.__slSearchPatched = true;
      var orig = w.executeSearch;
      w.executeSearch = function (keyword, type) {
        if (type === 'site') {
          slDoSiteSearch(keyword);
          return;
        }
        return orig.apply(this, arguments);
      };
    }
  }

  function slDoSiteSearch(keyword) {
    var q = String(keyword || '').trim();
    if (!q) { return; }
    // 确保所有分类数据已加载后再搜
    w.slEnsureAll(function () {
      var results = w.slSiteSearch(q);
      // 展示：展开所有命中板块 + 高亮 + 滚动到第一个命中（默认下拉展开简介模式）
      var firstEl = null;
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (!$('sl-sec-' + r.secId)) continue;
        if (!$('sl-sec-' + r.secId).classList.contains('open')) toggleSection(r.secId);
        // 高亮站点卡片（卡片位于展开区内）
        var expand = $('sl-expand-' + r.secId);
        var cards = expand ? expand.querySelectorAll('.sl-site') : [];
        for (var k = 0; k < cards.length; k++) {
          var nm = cards[k].querySelector('.sl-site-name');
          if (nm && nm.textContent.toLowerCase().indexOf(q.toLowerCase()) >= 0) {
            cards[k].classList.add('sl-hit');
            if (!firstEl) firstEl = cards[k];
          }
        }
      }
      if (w.slShowHitToast) w.slShowHitToast(q, results.length);
      var closeBtn = $('closeSearchDrawer') || null;
      if (closeBtn) closeBtn.click();
      else { var sd = $('searchDrawer'); if (sd) sd.style.display = 'none'; }
      if (firstEl) {
        setTimeout(function () { try { firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }, 200);
      }
    });
  }

  // 搜索命中提示浮层
  (function () {
    var t = null;
    w.slShowHitToast = function (q, n) {
      var hp = $('sl-hit-toast');
      if (!hp) {
        hp = d.createElement('div');
        hp.id = 'sl-hit-toast';
        hp.className = 'sl-hit-toast';
        d.body.appendChild(hp);
      }
      hp.innerHTML = '<i class="fas fa-check-circle"></i> 找到 <b>' + n + '</b> 条与「' + esc(q) + '」相关的内容';
      hp.classList.add('on');
      if (t) clearTimeout(t);
      t = setTimeout(function () { hp.classList.remove('on'); }, 2600);
    };
  })();

  /* ---------------- 设置排版样式（垂直/水平） ---------------- */
  w.slSetLayout = function (mode) {
    SL.layout = mode === 'h' ? 'h' : 'v';
    lsSet(LS_PREFIX + '_layout', SL.layout);
    // 已渲染板块切换布局
    var boards = d.querySelectorAll('.sl-cards');
    for (var i = 0; i < boards.length; i++) {
      boards[i].classList.toggle('sl-layout-h', SL.layout === 'h');
      boards[i].classList.toggle('sl-layout-v', SL.layout !== 'h');
    }
  };
  w.slGetLayout = function () { return SL.layout; };

  // 外部暴露：刷新健康状态
  w.slRefreshAll = function () {
    for (var id in SL.loaded) { SL.loaded[id].__rendered = false; }
    if (SL.cssOk) renderBoard();
  };

  // DOM 就绪启动
  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);