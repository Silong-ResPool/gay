/* ==========================================================================
   影视乐园 · ui.js
   界面渲染：首页（分类+子分类+海报墙）/ 全局搜索（跨源折叠）/ 详情（名片+简介+线路+选集）
             播放（自定义控制条+弹幕）/ 收藏 / 最近观看 / 源管理 / 设置
   ========================================================================== */

(function (w) {
  'use strict';

  var UI = {};

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  UI.esc = esc;

  function curSourceName() {
    var V = w.V;
    return (V && V.sources && V.sources[V.cur]) ? (V.sources[V.cur].name || '') : '';
  }

  function card(it, i, srcLabel) {
    var pic = it.pic
      ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">')
      : '<span class="ph">暂无海报</span>';
    var rm = it.remarks ? ('<i class="rmk">' + esc(it.remarks) + '</i>') : '';
    var meta = [it.year, it.typeName].filter(Boolean).join(' · ');
    var sc = it.score ? ('<i class="score">' + esc(it.score) + '</i>') : '';
    var sb = srcLabel ? ('<i class="srcbdg">' + esc(srcLabel) + '</i>') : '';
    var blurb = it.blurb ? ('<div class="blurb">' + esc(it.blurb) + '</div>') : '';
    return '<div class="card" data-act="open" data-id="' + esc(it.id) + '" data-i="' + i + '">' +
      '<div class="pic">' + pic + rm + sc + sb + '</div>' +
      '<div class="nm">' + esc(it.name) + '</div>' +
      (meta ? ('<div class="meta">' + esc(meta) + '</div>') : '') +
      blurb +
      '</div>';
  }

  UI.renderGrid = function (items, emptyTip, srcLabel) {
    if (!items || !items.length) return '<div class="empty">' + esc(emptyTip || '没有内容（换个分类或换个源试试）') + '</div>';
    var cols = (w.V.cols >= 3 && w.V.cols <= 5) ? w.V.cols : 3;
    var pcCols = Math.min(10, Math.max(4, cols * 2));
    var h = '<div class="grid" style="--cols:' + cols + ';--pc-cols:' + pcCols + '">';
    for (var i = 0; i < items.length; i++) h += card(items[i], i, srcLabel);
    return h + '</div>';
  };

  /* ---------------------------------------------------------------- 首页 */
  UI.renderHome = function () {
    var V = w.V;
    if (V.quickView) return UI.renderQuick();

    var h = '';
    if (V.loading && V.level === 'cls') {
      return '<div class="loading"><div class="spinner"></div><p>' + esc(V.loadingTxt || '正在加载…') + '</p></div>';
    }

    // 主页层（Level 1）：分类 Tab（仓库分类 / 综合资源接口 / 成人 / 动漫 / 自定义）
    if (V.level === 'wh') {
      h += '<div class="quick-row2">';
      h += '<button class="mini' + (V.quickView === 'fav' ? ' on' : '') + '" data-act="viewfav">★ 我的收藏（' + (V.fav || []).length + '）</button>';
      h += '<button class="mini" data-act="viewhist">🕘 最近观看（' + (V.hist || []).length + '）</button>';
      h += '<button class="mini" data-act="tocols">列数 ' + ((V.cols >= 3 && V.cols <= 5) ? V.cols : 3) + ' 列</button>';
      h += '</div>';
      var tab = V.homeTab || '综合资源接口';
      if (tab === '仓库分类') return h + UI.homeRepos();
      if (tab === '成人') return h + UI.homeCatList('成人（18+）');
      if (tab === '动漫') return h + UI.homeCatList('动漫');
      if (tab === '自定义') return h + UI.homeCustom();
      return h + UI.homeAll();
    }

    // 源列表层（Level 2）：当前仓库下的源；自定义仓库 = 该仓库组的接口
    if (V.level === 'src') {
      var dead = w.VIDEO_DEAD_CAT || '失效区';
      if (V.curWh === dead) return UI.renderDeadZone();
      h += '<div class="sec-title">' + (V.curWh === '自定义' ? ('自定义 › ' + (V.customFocus ? esc(V.customFocus) : '全部')) : ('仓库：' + esc(V.curWh))) + '（点「进入」展开视频标签分类）</div>';
      var rows = '';
      for (var s = 0; s < V.sources.length; s++) {
        var so = V.sources[s];
        if (V.curWh === '自定义') {
          if ((so.cat || '') !== '自定义') continue;
          if (V.customFocus && so.cg !== V.customFocus) continue;
        } else if ((so.cat || '综合影视') !== V.curWh) continue;
        var ok = w.vIsOk ? w.vIsOk(so.api) : null;
        var st = ok === true ? '<span class="sc-st ok">✔ 可用</span>' : (ok === false ? '<span class="sc-st bad">✘ 失效</span>' : '<span class="sc-st">待检测</span>');
        rows += '<div class="src-card' + (s === V.cur ? ' on' : '') + '">' +
          '<div class="sc-main"><div class="sc-nm">' + esc(so.name) + ' <i class="tiny">' + (so.builtin ? '内置' : '自定义') + '</i></div>' +
          '<div class="sc-api">' + esc(so.api) + '</div></div>' +
          st +
          '<div class="sc-btns">' +
          '<button class="mini" data-act="enterwhsrc" data-i="' + s + '">进入</button>' +
          '<button class="mini" data-act="test src" data-i="' + s + '">测速</button>' +
          '<button class="mini" data-act="copysrc" data-i="' + s + '">复制</button>' +
          '</div></div>';
      }
      if (!rows) rows = '<div class="empty">这里还没有接口（去「源管理」添加，或打开一个仓库选择源）</div>';
      return h + rows;
    }

    // 分类层（Level 3/4）：分类列表 + 该分类下的内容
    h += '<div class="quick-row2">';
    h += '<button class="mini" data-act="viewfav">★ 收藏（' + (V.fav || []).length + '）</button>';
    h += '<button class="mini" data-act="viewhist">🕘 最近（' + (V.hist || []).length + '）</button>';
    h += '<button class="mini" data-act="tocols">' + ((V.cols >= 3 && V.cols <= 5) ? V.cols : 3) + ' 列</button>';
    h += '</div>';

    // 加载失败：明确提示 + 一键重试
    if (V.clsErr) {
      h += '<div class="warn">' + esc(V.clsErr) + '</div>';
      h += '<div class="row2"><button class="wide-btn" data-act="retry">↺ 重试加载分类</button></div>';
      return h;
    }
    if (V.listErr) {
      h += '<div class="warn">' + esc(V.listErr) + '</div>';
      h += '<div class="row2"><button class="wide-btn" data-act="retry">↺ 重试加载内容</button></div>';
    }

    // 一级分类在顶部仓库条内水平滑动（srcBar），内容区只放子分类 + 海报墙（消除冗余遮挡）
    if (V.subs.length) {
      h += '<div class="row-scroll sub"><button class="chip' + (!V.curSub ? ' on' : '') + '" data-act="sub" data-id="">全部</button>';
      for (var k = 0; k < V.subs.length; k++) {
        var s2 = V.subs[k];
        h += '<button class="chip' + (V.curSub === s2.id ? ' on' : '') + '" data-act="sub" data-id="' + esc(s2.id) + '">' + esc(s2.name) + '</button>';
      }
      h += '</div>';
    }

    h += UI.renderGrid(V.items, V.listErr ? '加载失败，点上方「重试」' : '这个分类没有内容，换一个分类或换个源试试', curSourceName());
    h += UI.autoLoadHint();
    h += '<div class="more-wrap"><button class="wide-btn ghost" data-act="top">↑ 回到顶部</button></div>';
    return h;
  };

  /* 主页「综合资源接口」：全部内置接口分块展示（点接口直接进入内容）
     （仓库已归到「仓库分类」Tab，这里不再重复展示） */
  UI.homeAll = function () {
    var V = w.V;
    var h = '<div class="sec-title">综合资源接口（点接口直接进入分类浏览）</div>';
    var order = w.VIDEO_CATS || ['综合影视'];
    var dead = w.VIDEO_DEAD_CAT || '失效区';
    var hide = { '成人（18+）': 1, '动漫': 1 };
    hide[dead] = 1;
    var shown = false;
    for (var c = 0; c < order.length; c++) {
      var ct = order[c];
      if (hide[ct]) continue;
      var idxs = [];
      for (var i = 0; i < V.sources.length; i++) {
        var s = V.sources[i];
        if (s.builtin && (s.cat || '综合影视') === ct) idxs.push(i);
      }
      if (!idxs.length) continue;
      shown = true;
      h += '<div class="sec-title">' + UI.esc(ct) + '（' + idxs.length + '）</div>';
      h += '<div class="row-scroll">';
      for (var k = 0; k < idxs.length; k++) {
        var so = V.sources[idxs[k]];
        var st = w.vIsOk ? w.vIsOk(so.api) : null;
        var tag = st === true ? '<i class="cnt ok">✔</i>' : (st === false ? '<i class="cnt bad">✘</i>' : '');
        h += '<button class="chip" data-act="enterwhsrc" data-i="' + idxs[k] + '">' + UI.esc(so.name) + tag + '</button>';
      }
      h += '</div>';
    }
    if (!shown) h += '<div class="empty">没有可用的内置接口（去「源管理」添加，或在「仓库分类」页查看失效区）</div>';
    return h;
  };

  /* 主页「仓库分类」：仓库卡片 */
  UI.homeRepos = function () {
    return UI.homeReposInner('仓库分类（点击仓库 → 展开子分类选源）');
  };

  UI.homeReposInner = function (title) {
    var V = w.V;
    var dead = w.VIDEO_DEAD_CAT || '失效区';
    var h = '<div class="sec-title">' + UI.esc(title || '仓库') + '</div>';
    h += '<div class="wh-grid">';
    var n = 0;
    for (var r = 0; r < (V.repos || []).length; r++) {
      var ro = V.repos[r];
      h += '<div class="wh-card repo" data-act="homerepo" data-api="' + UI.esc(ro.api) + '" data-name="' + UI.esc(ro.name) + '">' +
        '<span class="wh-tag">仓库</span><span class="wh-ic">🗂️</span>' +
        '<span class="wh-nm">' + UI.esc(ro.name) + '</span>' +
        '<span class="wh-cnt">点开选择源</span></div>';
      n++;
    }
    var custom = [];
    try { custom = JSON.parse(localStorage.getItem('video_sources_custom') || '[]'); } catch (e) {}
    for (var k = 0; k < custom.length; k++) {
      var ck = custom[k];
      if (!ck || ck.kind !== 'repo' || !ck.api) continue;
      var cnt = (ck.children && ck.children.length) ? ck.children.length : 0;
      h += '<div class="wh-card repo" data-act="customrepo" data-name="' + UI.esc(ck.name) + '">' +
        '<span class="wh-tag">自定义</span><span class="wh-ic">📦</span>' +
        '<span class="wh-nm">' + UI.esc(ck.name) + '</span>' +
        '<span class="wh-cnt">自动识别 ' + cnt + ' 个接口</span></div>';
      n++;
    }
    h += '</div>';
    if (!n) h += '<div class="empty">还没有仓库（内置仓库在「综合资源接口」页下方，或到「源管理」添加多接口仓库）</div>';
    // 失效区入口：失效源会暂时归到这里，可点开重测恢复
    var deadN = 0;
    for (var dq = 0; dq < V.sources.length; dq++) if ((V.sources[dq].cat || '') === dead) deadN++;
    if (deadN > 0) {
      h += '<div class="sec-title">失效区（' + deadN + ' 个源 · 网络不通时自动归入，可重测恢复）</div>';
      h += '<div class="wh-grid">';
      h += '<div class="wh-card repo" data-act="deadzone"><span class="wh-tag dead">失效</span><span class="wh-ic">⚠️</span>' +
        '<span class="wh-nm">失效区（' + deadN + '）</span><span class="wh-cnt">点开重测 / 恢复</span></div>';
      h += '</div>';
    }
    return h;
  };

  /* 主页「成人 / 动漫」：该分类的内置接口卡片 */
  UI.homeCatList = function (catName) {
    var V = w.V;
    var h = '<div class="sec-title">' + UI.esc(catName) + '（点接口直接进入分类浏览）</div>';
    var rows = '';
    for (var s = 0; s < V.sources.length; s++) {
      var so = V.sources[s];
      if (!so.builtin || (so.cat || '') !== catName) continue;
      var ok = w.vIsOk ? w.vIsOk(so.api) : null;
      var st = ok === true ? '<span class="sc-st ok">✔ 可用</span>' : (ok === false ? '<span class="sc-st bad">✘ 失效</span>' : '<span class="sc-st">待检测</span>');
      rows += '<div class="src-card">' +
        '<div class="sc-main"><div class="sc-nm">' + UI.esc(so.name) + ' <i class="tiny">内置</i></div>' +
        '<div class="sc-api">' + UI.esc(so.api) + '</div></div>' +
        st +
        '<div class="sc-btns">' +
        '<button class="mini" data-act="enterwhsrc" data-i="' + s + '">进入</button>' +
        '<button class="mini" data-act="test src" data-i="' + s + '">测速</button>' +
        '<button class="mini" data-act="copysrc" data-i="' + s + '">复制</button>' +
        '</div></div>';
    }
    if (!rows) rows = '<div class="empty">这个分类下还没有接口</div>';
    return h + rows;
  };

  /* 主页「自定义」：用户添加的子分类（单个接口标接口名 / 仓库标仓库名） */
  UI.homeCustom = function () {
    var V = w.V;
    var custom = [];
    try { custom = JSON.parse(localStorage.getItem('video_sources_custom') || '[]'); } catch (e) {}
    var h = '<div class="sec-title">自定义（你添加的接口 / 仓库 · 点仓库再选源）</div>';
    if (!custom.length) {
      return h + '<div class="empty">还没有自定义内容：去「源管理」添加单个接口，或选「多接口（仓库）」粘贴仓库链接（自动识别接口数）。</div>';
    }
    h += '<div class="wh-grid">';
    var n = 0;
    for (var k = 0; k < custom.length; k++) {
      var ck = custom[k];
      if (!ck || !ck.api) continue;
      if (ck.kind === 'repo') {
        var cnt = (ck.children && ck.children.length) ? ck.children.length : 0;
        h += '<div class="wh-card repo" data-act="customrepo" data-name="' + UI.esc(ck.name) + '">' +
          '<span class="wh-tag">仓库</span><span class="wh-ic">📦</span>' +
          '<span class="wh-nm">' + UI.esc(ck.name) + '</span>' +
          '<span class="wh-cnt">' + cnt + ' 个接口 · 点开选源</span></div>';
      } else {
        var idx = -1;
        for (var m = 0; m < V.sources.length; m++) if (V.sources[m].api === ck.api) { idx = m; break; }
        if (idx < 0) continue;   // 已被移除/失效的接口不再展示
        h += '<div class="wh-card" data-act="customsingle" data-i="' + idx + '">' +
          '<span class="wh-tag">接口</span><span class="wh-ic">🔌</span>' +
          '<span class="wh-nm">' + UI.esc(ck.name || ck.api) + '</span>' +
          '<span class="wh-cnt">单个接口 · 点开浏览</span></div>';
      }
      n++;
    }
    h += '</div>';
    return h;
  };

  /* 内置仓库「选源」浮层 */
  UI.renderRepoSheet = function (rs) {
    var h = '<div class="repo-sheet-mask" data-act="closereposheet"></div>';
    h += '<div class="repo-sheet">';
    h += '<div class="repo-sheet-head"><span>' + UI.esc((rs && rs.name) || '仓库') + '</span><button class="mini" data-act="closereposheet">✕</button></div>';
    if (!rs) return h + '</div>';
    if (rs.loading) h += '<div class="loading"><div class="spinner sm"></div><p>正在读取仓库，自动识别接口数量…</p></div>';
    else if (rs.err) h += '<div class="warn">' + UI.esc(rs.err) + '</div>';
    else if (rs.children && rs.children.length) {
      h += '<p class="tip">识别出 ' + rs.children.length + ' 个接口：点一个「源」进入，它会再展开视频标签分类。</p>';
      h += '<div class="src-list">';
      for (var i = 0; i < rs.children.length; i++) {
        var kid = rs.children[i];
        h += '<div class="src-row"><div class="src-nm">' + UI.esc(kid.name) + '<i class="tiny">源</i><br><span class="tiny2">' + UI.esc(kid.api) + '</span></div>' +
          '<button class="mini" data-act="pickchild" data-i="' + i + '">进入</button></div>';
      }
      h += '</div>';
    } else h += '<div class="empty">没有识别到接口</div>';
    h += '</div>';
    return h;
  };

  /* 失效区仓库：分「链接失效 / 网络异常波动」两类，内置接口不可移除 */
  UI.renderDeadZone = function () {
    var V = w.V;
    var dead = w.VIDEO_DEAD_CAT || '失效区';
    var all = {};
    try { all = JSON.parse(localStorage.getItem('video_src_health') || '{}'); } catch (e) { all = {}; }
    var groups = { link: [], net: [] };
    for (var i = 0; i < V.sources.length; i++) {
      var s = V.sources[i];
      if ((s.cat || '') !== dead) continue;
      var hh = all[s.api];
      (hh && hh.kind === 'net' ? groups.net : groups.link).push(i);
    }
    var h = '<div class="sec-title">失效区：自动检测不通的源（分两类）</div>';
    h += '<p class="tip">链接失效 = 接口已停用/返回错误；网络异常波动 = 超时/断网导致，可能过一会就恢复。内置接口不可移除，可点「测速」重测；自定义源可「移除」。</p>';
    [['link', '链接失效', groups.link], ['net', '网络异常波动', groups.net]].forEach(function (g) {
      var gid = g[0], gnm = g[1], gidx = g[2];
      if (!gidx.length) return;
      h += '<div class="dead-grp' + (gid === 'net' ? ' net' : '') + '">' + gnm + '（' + gidx.length + ' 个）<i class="cnt"></i></div>';
      for (var k = 0; k < gidx.length; k++) {
        var s2 = V.sources[gidx[k]];
        h += '<div class="src-card">' +
          '<div class="sc-main"><div class="sc-nm">' + esc(s2.name) + ' <i class="tiny">' + (s2.builtin ? '内置' : '自定义') + '</i></div>' +
          '<div class="sc-api">' + esc(s2.api) + '</div></div>' +
          '<div class="sc-btns">' +
          '<button class="mini" data-act="test src" data-i="' + gidx[k] + '">测速</button>' +
          '<button class="mini" data-act="copysrc" data-i="' + gidx[k] + '">复制</button>' +
          (s2.builtin ? '<button class="mini" disabled style="opacity:.45">内置不可移除</button>' : '<button class="mini danger" data-act="dropsrc" data-i="' + gidx[k] + '">移除</button>') +
          '</div></div>';
      }
    });
    if (!groups.link.length && !groups.net.length) h += '<div class="empty">失效区是空的（所有源都正常）</div>';
    h += '<div class="row2"><button class="wide-btn" data-act="checkall">立即重新检测全部源</button></div>';
    return h;
  };

  /* 自动加载哨兵：滑到这里会自动请求下一页 */
  UI.autoLoadHint = function () {
    var V = w.V;
    if (V.page < V.pagecount) {
      return '<div id="autoLoad" class="autoload">' +
        '<div class="spinner sm"></div>' +
        '<p>继续往下滑，自动加载更多（第 ' + V.page + ' / ' + V.pagecount + ' 页）</p>' +
        '</div>';
    }
    return '<div class="autoload end">— 已经到底了（共 ' + (V.items ? V.items.length : 0) + ' 条）—</div>';
  };

  UI.renderQuick = function () {
    var V = w.V;
    var list = (V.quickView === 'fav') ? (V.fav || []) : (V.hist || []);
    var h = '<div class="sec-title">' + (V.quickView === 'fav' ? '我的收藏' : '最近观看') + '</div>';
    h += '<div class="row-chips"><button class="chip" data-act="viewhome">← 返回首页</button>' +
      (V.quickView === 'fav' ? '<button class="chip" data-act="clearfav">清空收藏</button>' : '<button class="chip" data-act="clearhist">清空记录</button>') + '</div>';
    if (!list.length) return h + '<div class="empty">还没有内容（' + (V.quickView === 'fav' ? '在详情页点「☆ 收藏」' : '播放过的片会自动出现在这里') + '）</div>';
    h += '<div class="grid" style="--cols:' + ((V.cols >= 3 && V.cols <= 5) ? V.cols : 3) + '">';
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var pic = it.pic ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">') : '<span class="ph">暂无海报</span>';
      h += '<div class="card" data-act="openq" data-i="' + i + '">' +
        '<div class="pic">' + pic + (it.remarks ? ('<i class="rmk">' + esc(it.remarks) + '</i>') : '') + '</div>' +
        '<div class="nm">' + esc(it.name) + '</div>' +
        '<div class="meta">' + esc([it.year, it.typeName, it.srcName].filter(Boolean).join(' · ')) + '</div>' +
        (it.ep ? ('<div class="blurb">看到：' + esc(it.ep) + '</div>') : '') +
        '</div>';
    }
    h += '</div>';
    return h;
  };

  /* ================================================================
     底部导航板块渲染（推荐 / 时间表 / 追番 / 我的）
     ================================================================ */
  UI.renderSection = function (tab) {
    var V = w.V;
    var h = '';
    if (tab === 'rec') return renderRec(V);
    if (tab === 'time') return renderTime(V);
    if (tab === 'fav') return renderFav(V);
    if (tab === 'mine') return renderMine(V);
    return '<div class="empty">未知板块</div>';
  };

  // 推荐：Bangumi 热门（失败自动降级本地源最新）
  function renderRec(V) {
    var st = (V.bgState && V.bgState.rec) || {};
    var h = '<div class="sec-title">🔥 热门推荐' + (st.fallback ? '（Bangumi 不可用，已切换到本地源最新）' : '') + '</div>';
    if (st.loading) return h + '<div class="loading"><div class="spinner"></div><p>正在加载热门推荐…</p></div>';
    var list = st.data || [];
    if (!list.length) {
      return h + '<div class="empty">' + esc(st.error || '暂时没有推荐内容') + '</div>' +
        '<div class="row2"><button class="wide-btn" data-act="bgretry">↺ 重试加载</button></div>';
    }
    var cols = (V.cols >= 3 && V.cols <= 5) ? V.cols : 3;
    var out = '<div class="grid" style="--cols:' + cols + '">';
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var pic = it.pic ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">')
                       : ('<span class="ph-bg"><i>🎬</i><span class="ph-tx">' + esc(it.name) + '</span></span>');
      out += '<div class="card" data-act="bgopen" data-name="' + esc(it.name) + '">' +
        '<div class="pic">' + pic + (it.score ? ('<i class="score">' + esc(it.score) + '</i>') : '') + '</div>' +
        '<div class="nm">' + esc(it.name) + '</div>' +
        '<div class="meta">' + esc([it.year, it.id].filter(Boolean).join(' · ')) + '</div>' +
        '</div>';
    }
    out += '</div>';
    out += '<p class="tip">点卡片自动在全部视频源里搜索这部片并直接播放，找不到再进入分类搜索结果</p>';
    return h + out;
  }

  // 时间表：Bangumi 周历（周一~周日）
  function renderTime(V) {
    var st = (V.bgState && V.bgState.time) || {};
    var h = '<div class="sec-title">📅 番剧时间表（Bangumi · 每日放送）</div>';
    if (st.loading) return h + '<div class="loading"><div class="spinner"></div><p>正在加载时间表…</p></div>';
    var days = st.data || [];
    if (!days.length) {
      return h + '<div class="empty">' + esc(st.error || '暂时没有时间表数据') + '</div>' +
        '<div class="row2"><button class="wide-btn" data-act="bgretry">↺ 重试加载</button></div>';
    }
    var names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var out = '';
    for (var d = 0; d < days.length && d < 7; d++) {
      var list = days[d] || [];
      out += '<div class="sec-title sub-t">' + names[d] + ' <i class="cnt">' + list.length + ' 部</i></div>';
      if (!list.length) { out += '<div class="empty sm">当天暂无放送</div>'; continue; }
      // 当天横向滚动海报条
      out += '<div class="row-scroll tl-row">';
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        var pic = it.pic ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">')
                         : ('<span class="ph-bg"><i>🎬</i><span class="ph-tx">' + esc(it.name) + '</span></span>');
        out += '<div class="tl-card" data-act="bgopen" data-name="' + esc(it.name) + '">' +
          '<div class="pic">' + pic + (it.score ? ('<i class="score">' + esc(it.score) + '</i>') : '') + '</div>' +
          '<div class="nm">' + esc(it.name) + '</div>' +
          '</div>';
      }
      out += '</div>';
    }
    out += '<p class="tip">点卡片自动在全部视频源里搜索这部番并直接播放（找不到再进入分类结果）</p>';
    return h + out;
  }

  // 追番：本地收藏
  function renderFav(V) {
    var list = V.fav || [];
    var h = '<div class="sec-title">★ 我的追番（' + list.length + '）</div>';
    h += '<div class="row-chips"><button class="chip" data-act="clearfav">清空追番</button>' +
      '<button class="chip" data-act="gotocat">去分类浏览</button></div>';
    if (!list.length) return h + '<div class="empty">还没有追番（在详情页点「☆ 收藏」即可加入，播放过的片也会出现在「我的」）</div>';
    h += '<div class="grid" style="--cols:' + ((V.cols >= 3 && V.cols <= 5) ? V.cols : 3) + '">';
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var pic = it.pic ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">') : '<span class="ph">暂无海报</span>';
      h += '<div class="card" data-act="openq" data-ctx="fav" data-i="' + i + '">' +
        '<div class="pic">' + pic + (it.remarks ? ('<i class="rmk">' + esc(it.remarks) + '</i>') : '') + '</div>' +
        '<div class="nm">' + esc(it.name) + '</div>' +
        '<div class="meta">' + esc([it.year, it.typeName].filter(Boolean).join(' · ')) + '</div>' +
        '</div>';
    }
    h += '</div>';
    return h;
  }

  // 我的：历史 + 常用入口
  function renderMine(V) {
    var hist = V.hist || [];
    var h = '<div class="sec-title"><i class="fa-solid fa-user"></i> 我的</div>';
    h += '<div class="quick-row2">' +
      '<button class="mini" data-act="viewhist"><i class="fa-regular fa-clock"></i> 最近观看（' + hist.length + '）</button>' +
      '<button class="mini" data-act="toviewsources"><i class="fa-solid fa-list"></i> 源管理</button>' +
      '<button class="mini" data-act="toviewsettings"><i class="fa-solid fa-gear"></i> 设置</button>' +
      '</div>';
    if (hist.length) {
      h += '<div class="sec-title sub-t">最近观看（' + hist.length + '）</div>';
      h += '<div class="grid" style="--cols:' + ((V.cols >= 3 && V.cols <= 5) ? V.cols : 3) + '">';
      for (var i = 0; i < hist.length; i++) {
        var it = hist[i];
        var pic = it.pic ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">') : '<span class="ph">暂无海报</span>';
        h += '<div class="card" data-act="openq" data-ctx="hist" data-i="' + i + '">' +
          '<div class="pic">' + pic + '</div>' +
          '<div class="nm">' + esc(it.name) + '</div>' +
          '<div class="meta">' + esc([it.ep, it.srcName].filter(Boolean).join(' · ')) + '</div>' +
          '</div>';
      }
      h += '</div>';
      h += '<div class="row2"><button class="wide-btn ghost" data-act="clearhist">清空观看记录</button></div>';
    } else {
      h += '<div class="empty">还没有观看记录（播放过的片会自动出现在这里）</div>';
    }
    h += '<div class="sec-title sub-t">板块说明</div>';
    h += '<p class="tip">「推荐 / 时间表」数据来自 Bangumi（自动降级本地源）；「追番」= 你的收藏；「分类」= 全部视频源分类浏览与搜索。播放页支持网页地址嗅探直连视频源。</p>';
    return h;
  }

  /* ---------------------------------------------------------------- 搜索 */
  /* 搜索入口匹配：关键词命中 仓库 / 视频源 / 源下分类标签 → 点结果直接跳转 */
  UI.searchEntriesBlock = function () {
    var V = w.V;
    var e = V.searchEntries;
    if (!e) return '';
    var h = '';
    if ((e.repos && e.repos.length) || (e.sources && e.sources.length) || (e.classes && e.classes.length)) {
      h += '<div class="sec-title">相关入口（关键词命中仓库 / 视频源 / 分类标签）</div>';
      if (e.repos && e.repos.length) {
        h += '<div class="block-label">仓库（' + e.repos.length + '）</div><div class="row-chips">';
        for (var r = 0; r < e.repos.length; r++) {
          var ro = e.repos[r];
          if (ro.custom) h += '<button class="chip" data-act="customrepojump" data-name="' + esc(ro.name) + '">📦 ' + esc(ro.name) + '</button>';
          else h += '<button class="chip" data-act="srcrepojump" data-api="' + esc(ro.api) + '" data-name="' + esc(ro.name) + '">🗂️ ' + esc(ro.name) + '</button>';
        }
        h += '</div>';
      }
      if (e.sources && e.sources.length) {
        h += '<div class="block-label">视频源（' + e.sources.length + '）</div><div class="row-chips">';
        for (var s = 0; s < e.sources.length; s++) {
          var so = e.sources[s];
          h += '<button class="chip" data-act="srcjump" data-i="' + so.i + '">' + esc(so.name) + '<i class="cnt">' + esc(so.cat || '') + '</i></button>';
        }
        h += '</div>';
      }
      if (e.classes && e.classes.length) {
        h += '<div class="block-label">分类标签（' + e.classes.length + ' · 源：' + esc((e.classes[0] || {}).src || '') + '）</div><div class="row-chips">';
        for (var c = 0; c < e.classes.length; c++) {
          var ce = e.classes[c];
          h += '<button class="chip" data-act="classjump" data-s="' + ce.srcI + '" data-p="' + esc(ce.id) + '">' + esc(ce.name) + '</button>';
        }
        h += '</div>';
      }
    }
    return h;
  };

  UI.renderSearch = function () {
    var V = w.V;
    if (V.searchMode === 'global') return UI.renderGlobalSearch();
    var h = UI.searchEntriesBlock();
    h += '<div class="sec-title">搜索：' + esc(V.keyword) + '（当前源：' + esc(V.sources[V.cur] ? V.sources[V.cur].name : '') + '）</div>';
    if (V.loading) return h + '<div class="loading"><div class="spinner"></div><p>正在搜索…</p></div>';
    h += UI.renderGrid(V.items, '没有搜到结果，换个关键词、换个源，或打开「全局搜索」', curSourceName());
    h += UI.autoLoadHint();
    return h;
  };

  /* 全局搜索：默认全量检索所有仓库所有分类；结果 3 列海报墙；筛选按钮手动精准筛选；
     点卡片弹出「选择视频源」浮层（每个源独立，互不串门） */
  UI.renderGlobalSearch = function () {
    var V = w.V;
    var h = UI.searchEntriesBlock();
    h += '<div class="sec-title">全局搜索：' + esc(V.keyword) + '</div>';
    h += '<div class="row-scroll">' +
      '<button class="chip' + (V.gsFilterOpen ? ' filter-on' : '') + '" data-act="gsfilter">' + (V.gsFilterOpen ? '筛选 <i class="fa-solid fa-caret-up"></i>' : '筛选 <i class="fa-solid fa-caret-down"></i>') + '</button>' +
      '<button class="chip' + (V.gsOnlyMulti ? ' on' : '') + '" data-act="gsmulti">只看多源合并</button>' +
      '<button class="chip' + (!V.gsOnlyMulti ? ' on' : '') + '" data-act="gsall">显示全部结果</button>' +
      '<button class="chip' + (V.gsPending ? ' on' : '') + '" data-act="gspending">' + (V.gsPending ? '含待验证源' : '不含待验证源') + '</button>' +
      '</div>';

    // 手动筛选：接口（源分类）+ 标签 + 模糊/精确
    if (V.gsFilterOpen) {
      h += '<div class="gs-filter-box">';
      h += '<div class="row-scroll">' +
        '<button class="chip' + (V.gsExact ? ' on' : '') + '" data-act="gsexact">' + (V.gsExact ? '精确搜索' : '模糊搜索') + '</button>' +
        '<button class="chip' + (!V.gsCatsOn ? ' on' : '') + '" data-act="gscat" data-all="1">全部接口</button>';
      for (var cq = 0; cq < V.cats.length; cq++) {
        var cnm = V.cats[cq];
        var con = !V.gsCatsOn || V.gsCatsOn[cnm];
        h += '<button class="chip' + (con ? ' on' : '') + '" data-act="gscat" data-c="' + esc(cnm) + '">' + esc(cnm) + '</button>';
      }
      h += '</div>';
      var tags = {}, tagArr = [];
      for (var gt = 0; gt < V.groups.length; gt++) {
        for (var it2 = 0; it2 < V.groups[gt].items.length; it2++) {
          var tn = V.groups[gt].items[it2].typeName || V.groups[gt].typeName;
          if (tn && !tags[tn]) { tags[tn] = 1; tagArr.push(tn); }
        }
      }
      tagArr = tagArr.slice(0, 26);
      if (tagArr.length) {
        h += '<div class="row-scroll">';
        if (V.gsTags.length) h += '<button class="chip" data-act="gstagclear">清除标签 ×' + V.gsTags.length + '</button>';
        for (var ti = 0; ti < tagArr.length; ti++) {
          h += '<button class="chip' + (V.gsTags.indexOf(tagArr[ti]) >= 0 ? ' on' : '') + '" data-act="gstag" data-t="' + esc(tagArr[ti]) + '">' + esc(tagArr[ti]) + '</button>';
        }
        h += '</div>';
      }
      h += '</div>';
    }

    h += '<div class="gs-status">已扫描 ' + V.gsDone + ' / ' + V.gsTotal + ' 个源' +
      (V.gsHit ? ('，命中 ' + V.gsHit + ' 个源') : '') + '｜模式：' + (V.gsExact ? '精确（片名需含关键词）' : '模糊') +
      '｜同名片已折叠（每个源只显示一条），点卡片选源打开</div>';

    var list = [];
    for (var q = 0; q < V.groups.length; q++) {
      if (V.gsOnlyMulti && V.groups[q].items.length < 2) continue;
      var g0 = V.groups[q];
      if (V.gsTags.length) {
        var hitTag = false;
        for (var kk = 0; kk < g0.items.length; kk++) if (V.gsTags.indexOf(g0.items[kk].typeName) >= 0) { hitTag = true; break; }
        if (!hitTag && V.gsTags.indexOf(g0.typeName) < 0) continue;
      }
      list.push({ g: g0, idx: q });
    }

    if (!list.length) {
      if (V.gsDone < V.gsTotal) return h + '<div class="loading"><div class="spinner"></div><p>正在并行搜索所有视频源…</p></div>';
      if (!V.groups.length) return h + '<div class="empty">所有源都没有搜到「' + esc(V.keyword) + '」，换个关键词试试</div>';
      return h + '<div class="empty">没有「多源合并」的结果（点上面「显示全部结果」看单源结果）</div>';
    }

    // 3 列海报墙（列数与设置联动）
    var cols = (V.cols >= 3 && V.cols <= 5) ? V.cols : 3;
    h += '<div class="grid" style="--cols:' + cols + '">';
    for (var li = 0; li < list.length; li++) {
      var g = list[li].g;
      var i = list[li].idx;
      var pic = g.pic ? ('<img loading="lazy" referrerpolicy="no-referrer" src="' + esc(g.pic) + '" alt="">') : '<span class="ph">暂无海报</span>';
      h += '<div class="card" data-act="gsopen" data-i="' + i + '">' +
        '<div class="pic">' + pic + '<i class="rmk">' + g.items.length + ' 源</i></div>' +
        '<div class="nm">' + esc(g.name) + '</div>' +
        '<div class="meta">' + esc([g.year, g.typeName].filter(Boolean).join(' · ')) + '</div>' +
        '</div>';
    }
    h += '</div>';

    // 源选择浮层
    if (V.gsSheet !== null && V.gsSheet !== undefined && V.groups[V.gsSheet]) {
      var gs = V.groups[V.gsSheet];
      h += '<div class="gs-sheet">';
      h += '<div class="gs-sh-head">选择视频源 · ' + esc(gs.name) + '<button class="mini" data-act="gsclose">关闭</button></div>';
      h += '<div class="gs-sh-pic">' +
        (gs.pic ? ('<img referrerpolicy="no-referrer" src="' + esc(gs.pic) + '" alt="">') : '<span class="ph">无图</span>') +
        '<div class="gs-sh-meta">' + esc([gs.year, gs.typeName].filter(Boolean).join(' · ')) + (gs.remarks ? ('<br>状态：' + esc(gs.remarks)) : '') + '</div></div>';
      for (var s = 0; s < gs.items.length; s++) {
        var it3 = gs.items[s];
        h += '<div class="fold-row">' +
          '<div class="fr-src">' + esc(it3.srcName) + '</div>' +
          '<div class="fr-meta">' + esc([it3.year, it3.typeName, it3.remarks].filter(Boolean).join(' · ')) + '</div>' +
          '<button class="mini" data-act="usepick" data-i="' + V.gsSheet + '" data-j="' + s + '">用这个源打开</button>' +
          '</div>';
      }
      h += '</div>';
    }
    return h;
  };

  /* 播放地址类型：hls(m3u8) / mp4 / page(网页地址，不能直连播放) */
  UI.urlKind = function (u) {
    var s = String(u || '');
    if (/\.m3u8(\?|$)/i.test(s)) return 'hls';
    if (/\.mp4(\?|$)/i.test(s)) return 'mp4';
    return 'page';
  };
  UI.kindBadge = function (u) {
    var k = UI.urlKind(u);
    if (k === 'hls') return '<i class="ok">✔ 直连</i>';
    if (k === 'mp4') return '<i class="ok">✔ MP4</i>';
    return '<i class="bad">⚠ 网页地址</i>';
  };

  /* ---------------------------------------------------------------- 详情 */
  UI.renderDetail = function () {
    var V = w.V, d = V.detail;
    if (!d) return '<div class="empty">没有详情</div>';
    var it = d.item;
    var isFav = (V.fav || []).some(function (x) { return x.name === it.name; });

    var h = '<div class="detail"><div class="d-top">';
    h += '<div class="d-pic">' + (it.pic ? '<img referrerpolicy="no-referrer" src="' + esc(it.pic) + '" alt="">' : '<span class="ph">暂无海报</span>') + '</div>';
    h += '<div class="d-info"><h2>' + esc(it.name) + '</h2>';
    h += '<p class="d-meta">' + esc([it.year, it.area, it.typeName].filter(Boolean).join(' · ')) + '</p>';
    h += '<p class="d-meta">' + (it.remarks ? ('状态：' + esc(it.remarks) + '　') : '') + (it.score ? ('评分：' + esc(it.score)) : '') + '</p>';
    h += '<p class="d-src">视频源：' + esc(V.sources[V.cur] ? V.sources[V.cur].name : '') + '</p>';
    h += '<div class="row-chips" style="margin-top:8px">';
    h += '<button class="chip' + (isFav ? ' on' : '') + '" data-act="fav">' + (isFav ? '★ 已收藏' : '☆ 收藏') + '</button>';
    h += '<button class="chip" data-act="copynametip">复制片名</button>';
    // 巳泷 v9.1.0：详情/缩略图界面也有关闭弹幕的按钮
    h += '<button class="chip" data-act="dmtoggle">' + ((w.DM && w.DM.cfg && w.DM.cfg.on) ? '弹幕开' : '弹幕关') + '</button>';
    h += '</div></div></div>';

    h += '<div class="sec-title">简介</div>';
    h += '<p class="d-cnt' + (V.cntOpen ? '' : ' clip') + '">' + esc(it.content || '（该源没有提供简介，换个源打开通常会有）') + '</p>';
    if (it.content && it.content.length > 90) {
      h += '<button class="mini" data-act="cntmore">' + (V.cntOpen ? '收起简介' : '展开完整简介') + '</button>';
    }

    if (!d.groups || !d.groups.length) {
      h += '<div class="empty">该源没有返回可播放地址（可返回换一个源再打开）</div>';
    } else {
      h += '<div class="sec-title">播放线路（已把直连线路排在前面）</div><div class="row-chips">';
      for (var g = 0; g < d.groups.length; g++) {
        var firstUrl = (d.groups[g].eps[0] || {}).url || '';
        h += '<button class="chip' + (d.curFrom === g ? ' on' : '') + '" data-act="from" data-g="' + g + '">' +
          esc(d.groups[g].from) + '（' + d.groups[g].eps.length + ' 集） ' + UI.kindBadge(firstUrl) + '</button>';
      }
      h += '</div>';

      // 当前线路不是直连视频 → 明确提示并给「自动换源播放」一键方案
      var curFirst = (d.groups[d.curFrom] && d.groups[d.curFrom].eps[0] || {}).url || '';
      if (curFirst && UI.urlKind(curFirst) === 'page') {
        h += '<div class="warn">该源这一集给的是「网页地址」而不是直连视频（这类源需要站点自己的播放器），网页里可能放不出来。可以点下面的「自动换源播放」去其它源找一个直连地址。</div>';
        h += '<div class="row2"><button class="wide-btn" data-act="autosrc">自动换源播放（同名找直连源）</button>' +
          '<button class="wide-btn" data-act="ext">用外部播放器打开</button></div>';
      }
      var eps = d.groups[d.curFrom] ? d.groups[d.curFrom].eps : [];
      var hasProg = false;
      h += '<div class="sec-title">选集（共 ' + eps.length + ' 集）</div><div class="eps">';
      for (var e = 0; e < eps.length; e++) {
        var watched = false;
        try {
          var pk = 'video_pos_' + encodeURIComponent(it.name + '|' + eps[e].name);
          watched = (parseFloat(localStorage.getItem(pk) || '0') > 5);
        } catch (x) {}
        if (watched) hasProg = true;
        h += '<button class="ep' + (watched ? ' watched' : '') + '" data-act="ep" data-e="' + e + '">' + esc(eps[e].name) + '</button>';
      }
      h += '</div>';
      if (hasProg) h += '<p class="tip">带下划线的集数 = 看过（会自动从上次位置继续播放）</p>';
    }
    h += '</div>';
    return h;
  };

  /* ---------------------------------------------------------------- 播放 */
  // 全屏暂停面板内容：音量 + 明暗度 + 自动快进（仅全屏暂停时显示，见 CSS）
  UI.tuneRowHtml = function () {
    var plVol = '100', plBright = '1';
    try { plVol = localStorage.getItem('video_pl_vol') || '100'; } catch (e) {}
    try { plBright = localStorage.getItem('video_pl_bright') || '1'; } catch (e) {}
    var sk = (w.PL && w.PL.skipCfg) ? w.PL.skipCfg() : { on: false, sec: 0 };
    var is25 = sk.on && sk.sec === 25, is10 = sk.on && sk.sec === 10, isCus = sk.on && !is25 && !is10;
    var h = '<div class="pl-tune pl-ctl" id="plTuneRow">';
    h += '<div class="tune-row"><span class="tune-lab">音量</span><input type="range" id="plVol" min="0" max="100" value="' + plVol + '" step="1"><b id="vPlVol" class="tune-val">' + plVol + '%</b></div>';
    h += '<div class="tune-row"><span class="tune-lab">明暗</span><input type="range" id="plBright" min="30" max="150" value="' + Math.round(parseFloat(plBright) * 100) + '" step="5"><b id="vPlBright" class="tune-val">' + plBright + '</b></div>';
    h += '<div class="tune-row"><span class="tune-lab">自动快进</span>' +
      '<button class="mini' + (!sk.on ? ' on' : '') + '" data-act="skipset" data-v="off">关</button>' +
      '<button class="mini' + (is25 ? ' on' : '') + '" data-act="skipset" data-v="25">25秒</button>' +
      '<button class="mini' + (is10 ? ' on' : '') + '" data-act="skipset" data-v="10">10秒</button>' +
      '<button class="mini' + (isCus ? ' on' : '') + '" data-act="skipset" data-v="custom">自定义</button>' +
      '<input type="number" id="plSkipN" class="tune-num" min="1" max="3600" value="' + (sk.on && sk.sec ? sk.sec : '') + '" placeholder="秒">' +
      '<button class="mini" data-act="skipgo">确定</button></div>';
    h += '<div class="tune-row"><span class="tune-lab">弹幕</span>' +
      '<button class="mini" id="plTuneDmBtn" data-act="dmtoggle">' + ((w.DM && w.DM.cfg && w.DM.cfg.on) ? '开' : '关') + '弹幕</button></div>';
    h += '<div class="tune-tip">音量/明暗只在全屏暂停时显示；开启自动快进后，下次打开任何视频都会自动跳过对应秒数（默认关闭）。</div>';
    h += '</div>';
    return h;
  };

  UI.renderPlayer = function () {
    var V = w.V, d = V.detail;
    if (!d || !d.playing) return '<div class="empty">没有播放信息</div>';
    var g = d.groups[d.curFrom] || { eps: [] };
    var ep = g.eps[d.playing.e] || { name: '' };
    var coreTxt = (V.playerCore === 'hls') ? 'hls.js' : (V.playerCore === 'native' ? '系统播放器' : '自动');
    // 巳泷 v9.1.0：弹幕始终可用（内置弹幕池兜底，可选自定义弹幕 API / 弹弹play）
    var dmReady = !!(w.DM && w.DM.engine);

    var h = '<div class="pl-wrap" id="plWrap">';
    h += '<div class="p-title">' + esc(d.item.name) + ' · ' + esc(ep.name) + '</div>';
    h += '<div class="pl-stage" id="plStage">';
    h += '<div class="crop-wrap" id="cropWrap">';
    h += '<video id="vPlayer" playsinline webkit-playsinline preload="metadata"></video>';
    h += '</div>';
    if (dmReady) h += '<div class="dm-layer" id="dmLayer"></div>';
    h += '<div class="pl-center" id="plCenter"><i class="fa-solid fa-play"></i></div>';
    h += '<button class="pl-fs pl-ctl" id="plFs" data-act="fs"><i class="fa-solid fa-maximize"></i></button>';
    h += '<div class="fs-opts" id="fsOpts" hidden>';
    h += '<div class="fs-tip">选择全屏方向（自动检测未开启）</div>';
    h += '<button class="mini" data-act="fsp" data-m="landscape"><i class="fa-solid fa-maximize"></i> 横向全屏（16:9 电影）</button>';
    h += '<button class="mini" data-act="fsp" data-m="portrait"><i class="fa-solid fa-maximize"></i> 竖向全屏（9:16 短视频）</button>';
    h += '<label class="chk big" style="justify-content:center"><input type="checkbox" id="fsRemember"> <span>不再提醒（以后自动按视频比例全屏）</span></label>';
    h += '<button class="mini" data-act="fscancel">取消</button>';
    h += '</div>';
    h += '</div>';

    // 控制条
    h += '<div class="pl-bar pl-ctl">';
    h += '<span id="plTime" class="pl-time">00:00 / --:--</span>';
    h += '<input type="range" id="plSeek" class="pl-seek" min="0" max="1000" value="0" step="1">';
    h += '</div>';
    // 巳泷 v9.2.2：左侧边栏垂直滚动容器 —— 全部参数面板（快进退/倍速/画质/弹幕/尺寸/裁剪/选集/上下集等）收纳于此，
    // 全屏时固定在左侧可垂直滑动，暂停时可在不退出全屏的情况下调整后继续播放
    h += '<div class="pl-leftpanel pl-ctl">';
    // 快进退档位：10 / 5 / 1 秒三档，长按任意档位可自定义秒数（记忆）；「帧 ▾」展开帧级微调
    h += '<div class="pl-bar2 pl-ctl">';
    h += '<button class="mini" data-act="pp">播放/暂停</button>';
    h += '<button class="mini" data-act="seek" data-dir="back" data-lvl="10">' + w.PL.secLabel('back', 10) + '</button>';
    h += '<button class="mini" data-act="seek" data-dir="back" data-lvl="5">' + w.PL.secLabel('back', 5) + '</button>';
    h += '<button class="mini" data-act="seek" data-dir="back" data-lvl="1">' + w.PL.secLabel('back', 1) + '</button>';
    h += '<button class="mini" data-act="frames" title="展开/收起帧级微调">帧 ▾</button>';
    h += '<button class="mini" data-act="seek" data-dir="fwd" data-lvl="1">' + w.PL.secLabel('fwd', 1) + '</button>';
    h += '<button class="mini" data-act="seek" data-dir="fwd" data-lvl="5">' + w.PL.secLabel('fwd', 5) + '</button>';
    h += '<button class="mini" data-act="seek" data-dir="fwd" data-lvl="10">' + w.PL.secLabel('fwd', 10) + '</button>';
    h += '<select id="plRate" class="pl-sel">' +
      ['0.1', '0.25', '0.5', '0.75', '1', '1.25', '1.5', '2', '2.5', '3', '4', '5', '6', '8', '10'].map(function (r) { return '<option value="' + r + '"' + (r === '1' ? ' selected' : '') + '>' + r + 'x</option>'; }).join('') +
      '</select>';
    h += '<select id="plLevel" class="pl-sel"><option value="-1">画质：自动</option></select>';
    if (dmReady) h += '<button class="mini" id="plDmBtn" data-act="dmtoggle">弹幕 ' + (w.DM && w.DM.cfg.on ? '开' : '关') + '</button>';
    h += '<button class="mini" data-act="core">内核：' + coreTxt + '</button>';
    h += '<button class="mini" data-act="ext">外部打开</button>';
    h += '</div>';
    // 帧级微调（点「帧 ▾」展开，精确到一帧约 1/25 秒）
    h += '<div class="pl-frames pl-ctl">';
    h += '<button class="mini" data-act="backframe">« 退1帧</button>';
    h += '<button class="mini" data-act="fwdframe">进1帧 »</button>';
    h += '<span class="frame-tip">帧级微调（约 1/25 秒），适合精确对齐画面</span>';
    h += '</div>';

    // 巳泷 v9.1.0：发弹幕（内置可用）+ 弹幕 API 设置入口
    if (dmReady) {
      h += '<div class="dm-send pl-ctl">';
      h += '<input type="text" id="dmText" placeholder="发一条弹幕…">';
      h += '<button class="mini" data-act="dmsend">发送</button>';
      h += '<button class="mini" data-act="dmsearch">弹幕搜索</button>';
      h += '<button class="mini" data-act="dmsetapi" title="弹幕API设置">弹幕API</button>';
      h += '</div>';
    }
    // 视频尺寸（原始 / 铺满 / 拉伸）+ 分辨率与画质档位
    var curFit = 'contain';
    try { curFit = JSON.parse(localStorage.getItem('video_pl_fit') || '"contain"'); } catch (e) {}
    h += '<div class="pl-fit pl-ctl">' +
      '<span class="block-label" style="margin:0">画面尺寸</span>' +
      [['contain', '原始比例'], ['cover', '铺满（裁剪）'], ['fill', '拉伸铺满']].map(function (f) {
        return '<button class="mini' + (curFit === f[0] ? ' on' : '') + '" data-act="fit" data-v="' + f[0] + '">' + f[1] + '</button>';
      }).join('') +
      '</div>';
    // 画面裁剪（预设 9:16 / 16:9 + 自定义，解决黑边）
    var curCrop = 'off';
    try { curCrop = JSON.parse(localStorage.getItem('video_pl_crop') || '"off"'); } catch (e) {}
    h += '<div class="pl-crop pl-ctl">' +
      '<span class="block-label" style="margin:0">画面裁剪</span>' +
      [['off', '原始'], ['169', '16:9'], ['916', '9:16'], ['43', '4:3'], ['custom', '自定义'], ['reset', '重置']].map(function (f) {
        return '<button class="mini' + (curCrop === f[0] ? ' on' : '') + '" data-act="crop" data-v="' + f[0] + '">' + f[1] + '</button>';
      }).join('') +
      '</div>';
    h += '<p class="tip pl-ctl">裁剪：预设按比例裁剪掉黑边；「自定义」模式下双指缩放整体、单指滑动调整边缘。</p>';
    h += '<div class="pl-res pl-ctl" id="plRes">分辨率：读取中…</div>';

    // 全屏暂停面板：音量 + 画面明暗度（实时调节）+ 自动快进（默认关闭；预设 25/10 秒 + 自定义）
    h += UI.tuneRowHtml();

    h += '<div id="dmPanel" class="dm-panel" hidden></div>';

    h += '<div class="pl-info" id="plInfo">准备中…</div>';

    h += '<div class="pl-nav pl-ctl">';
    h += '<button class="mini" data-act="epopen">选集 ▾（' + g.eps.length + ' 集）</button>';
    h += '<button class="mini" data-act="prevep">‹ 上一集</button>';
    h += '<button class="mini" data-act="nextep">下一集 ›</button>';
    h += '<button class="mini" data-act="autosrc">自动换源</button>';
    h += '<button class="mini" data-act="back">返回详情</button>';
    h += '</div>';
    h += '</div>';  // 巳泷 v9.2.2：关闭 pl-leftpanel 垂直滚动容器

    // 选集右栏：垂直滑动，从左上角按集数顺序排列
    h += '<div class="pl-ep-mask" id="plEpMask" data-act="epclose" hidden></div>';
    h += '<div class="pl-ep-panel" id="plEpPanel" hidden>';
    h += '<div class="pl-ep-head"><span>选集（' + g.eps.length + ' 集 · 当前：' + esc(ep.name) + '）</span><button class="mini" data-act="epclose"><i class="fa-solid fa-xmark"></i></button></div>';
    h += '<div class="pl-ep-list">';
    for (var e2 = 0; e2 < g.eps.length; e2++) {
      h += '<button class="ep' + (d.playing.e === e2 ? ' on' : '') + '" data-act="ep" data-e="' + e2 + '">' + esc(g.eps[e2].name) + '</button>';
    }
    h += '</div></div>';

    var curUrl = (g.eps[d.playing.e] || {}).url || '';
    if (curUrl && UI.urlKind(curUrl) === 'page') {
      h += '<div class="warn">这一集给的是「网页地址」而不是直连视频，很可能放不出来：点「自动换源」找直连源，或点「外部打开」用手机播放器试试。</div>';
    }

    h += '<div class="sec-title">线路</div><div class="row-chips">';
    for (var gi = 0; gi < d.groups.length; gi++) {
      h += '<button class="chip' + (d.curFrom === gi ? ' on' : '') + '" data-act="from" data-g="' + gi + '">' + esc(d.groups[gi].from) + '</button>';
    }
    h += '</div>';

    h += '<div class="sec-title">选集</div><div class="eps">';
    for (var e = 0; e < g.eps.length; e++) {
      h += '<button class="ep' + (d.playing.e === e ? ' on' : '') + '" data-act="ep" data-e="' + e + '">' + esc(g.eps[e].name) + '</button>';
    }
    h += '</div></div>';
    return h;
  };

  /* -------------------------------------------------------------- 源管理 */
  UI.renderSources = function () {
    var V = w.V;
    var h = '';

    // ===== 添加源：类型（单接口 / 多接口仓库 / XPath 规则源）· 名称 · 链接 =====
    h += '<div class="sec-title">添加自己的源</div>';
    h += '<div class="form">';
    h += '<div class="frow"><span class="flab">类型</span><select id="fKind" class="inp sel">' +
      '<option value="single">单个接口（自定义子分类标接口名）</option>' +
      '<option value="multi">多接口 / 仓库（自动识别接口数量）</option>' +
      '<option value="xpath">XPath 规则源（Kazumi 格式）</option>' +
      '</select></div>';
    h += '<div class="frow"><span class="flab">名称</span><input id="fName" class="inp" type="text" placeholder="例如：我的影视源 / 我的仓库 / 我的动漫源"></div>';
    h += '<div class="frow"><span class="flab">链接</span><input id="fApi" class="inp" type="text" placeholder="https://xxx.com/api.php/provide/vod/ 或仓库配置地址"></div>';
    h += '<div class="frow" id="fRuleRow" style="display:none"><span class="flab">规则</span>' +
      '<textarea id="fRule" class="ta" style="min-height:150px" placeholder=\'{"name":"我的动漫源","baseURL":"https://xxx.com/","searchURL":"https://xxx.com/search.html?wd=@keyword","searchList":"//ul/li","searchName":"//a","searchResult":"//a","chapterRoads":"//div/div[4]/div/ul","chapterResult":"//li/a"}\'></textarea></div>';
    h += '</div>';
    h += '<div class="row2"><button class="wide-btn" data-act="add3">＋ 添加</button><button class="wide-btn" data-act="testnew">先测一下能不能用</button></div>';
    h += '<p class="tip"><b>单个接口</b>：贴一个采集接口地址；如果检测到它是多接口/仓库链接，会提示「请尝试更换接口数」，改选「多接口」即可。<br>' +
      '<b>多接口 / 仓库</b>：贴仓库配置地址，添加时<b>自动识别接口数量</b>，不用手输；点开仓库后先选「源」，源再展开视频标签分类。<br>' +
      '<b>XPath 规则源</b>：选此类型后在「规则」框粘贴 Kazumi 格式的规则 JSON（含 baseURL / searchURL / searchList / searchName / searchResult / chapterRoads / chapterResult）。</p>';

    // ===== 上传 JSON 文件 / 批量导入 =====
    h += '<div class="sec-title">批量导入</div>';
    h += '<input type="file" id="srcFile" accept=".json,.txt,application/json,text/plain" class="file">';
    h += '<div class="row2"><button class="wide-btn" data-act="srcfile">📂 上传 JSON / TXT 文件</button>' +
      '<button class="wide-btn" data-act="addsrcurl">从 JSON 地址导入</button></div>';
    h += '<details class="adv"><summary>直接粘贴 JSON / TVBox 配置（点开）</summary>';
    h += '<p class="tip">支持：单个源 JSON、源数组、TVBox 配置（sites 数组，只取 type=1）；多仓地址（urls）也可以。</p>';
    h += '<textarea id="srcText" class="ta" placeholder=\'例如：{"name":"我的源","api":"https://xxx/api.php/provide/vod/"}\'></textarea>';
    h += '<button class="wide-btn" data-act="addsrc">添加粘贴的内容</button>';
    h += '</details>';

    // ===== 仓库入口（多仓 / JSON 配置，点一下就能展开导入） =====
    if (V.repos && V.repos.length) {
      h += '<div class="sec-title">内置接口仓库（点「选源」展开子分类 → 选源 → 展开视频标签）</div>';
      h += '<div class="src-list">';
      for (var rp = 0; rp < V.repos.length; rp++) {
        var ro = V.repos[rp];
        h += '<div class="src-row">' +
          '<div class="src-nm">' + esc(ro.name) + '<i class="tiny">仓库</i><br><span class="tiny2">' + esc(ro.api) + '</span></div>' +
          '<button class="mini" data-act="expandrepo" data-api="' + esc(ro.api) + '" data-name="' + esc(ro.name) + '">选源</button>' +
          '<button class="mini" data-act="copyrepo" data-api="' + esc(ro.api) + '">复制</button>' +
          '</div>';
      }
      h += '</div>';
    }

    // ===== 健康检测状态 =====
    h += '<div class="sec-title">源自动检测 · 测速排序</div>';
    h += '<div class="row-chips"><button class="chip" data-act="checkall">立即测速并重排</button>' +
      '<button class="chip" data-act="healthsort" data-clear="1">清除测速结果重测</button></div>';
    h += '<div class="gs-status">' + esc(V.healthTxt || '还没检测过') + '</div>';
    h += '<p class="tip">测速结果会按「可用 → 延迟低」自动排序：可用且响应快的源排在前面，失效源自动归入「' +
      esc(w.VIDEO_DEAD_CAT || '失效区') + '」。右侧「源筛选」栏里也能随时点「测速 / 重排」。</p>';

    // ===== 已移除的源（可恢复） =====
    if (V.removedList && V.removedList.length) {
      h += '<div class="sec-title">已移除的源（' + V.removedList.length + ' 个，可恢复）</div><div class="src-list">';
      for (var rr = 0; rr < V.removedList.length; rr++) {
        h += '<div class="src-row"><div class="src-nm">' + esc(V.removedList[rr].name) +
          '<br><span class="tiny2">' + esc(V.removedList[rr].api) + '</span></div>' +
          '<button class="mini" data-act="restoresrc" data-api="' + esc(V.removedList[rr].api) + '">恢复</button></div>';
      }
      h += '</div>';
    }

    // ===== 全部源，按分类分块 =====
    h += '<div class="sec-title">源列表（共 ' + V.sources.length + ' 个，按分类分块）</div>';
    for (var k = 0; k < V.cats.length; k++) {
      var catName = V.cats[k];
      var rows = '';
      for (var i = 0; i < V.sources.length; i++) {
        var s = V.sources[i];
        if ((s.cat || '综合影视') !== catName) continue;
        var okTag = '<i class="tiny">' + (s.builtin ? '内置' : '自定义') + '</i>';
        var hh = null;
        try { hh = JSON.parse(localStorage.getItem('video_src_health') || '{}')[s.api]; } catch (e) { hh = null; }
        if (hh) okTag += '<i class="tiny ' + (hh.ok ? 'ok' : 'bad') + '">' + (hh.ok ? '✔ 可用' + (hh.ms ? (' ' + Math.round(hh.ms / 1000) + 's') : '') : '✘ 失效') + '</i>';
        var isDeadBuiltin = s.builtin && catName === (w.VIDEO_DEAD_CAT || '失效区');
        rows += '<div class="src-row' + (i === V.cur ? ' on' : '') + '">' +
          '<div class="src-nm">' + esc(s.name) + okTag + '<br><span class="tiny2">' + esc(s.api) + '</span></div>' +
          '<button class="mini" data-act="usesrc" data-i="' + i + '">使用</button>' +
          '<button class="mini" data-act="test src" data-i="' + i + '">测速</button>' +
          '<button class="mini" data-act="copysrc" data-i="' + i + '">复制</button>' +
          (isDeadBuiltin
            ? '<button class="mini" disabled style="opacity:.45">内置不可移除</button>'
            : '<button class="mini danger" data-act="dropsrc" data-i="' + i + '">移除</button>') +
          '</div>';
      }
      h += '<div class="cat-head" data-act="cat" data-c="' + esc(catName) + '">' + esc(catName) + '<i class="cnt">' +
        (rows.match(/src-row/g) || []).length + ' 个源</i></div>';
      h += '<div class="src-list">' + rows + '</div>';
    }
    h += '<p class="tip">内置源来自公开采集接口（可能随时失效）：点「测速」看是否还能用；失效时换一个源，或用上面的三框添加自己的源。全局搜索默认全量检索所有仓库所有分类，支持接口/标签精准筛选。「失效区」里的内置接口不可移除。</p>';
    return h;
  };

  /* ---------------------------------------------------------------- 设置 */
  UI.renderSettings = function () {
    var V = w.V;
    var h = '';

    h += '<div class="sec-title">布局</div>';
    h += '<div class="block-label">海报墙列数（默认 3，最高 5）</div><div class="row-chips">';
    [3, 4, 5].forEach(function (c) {
      h += '<button class="chip' + (V.cols === c ? ' on' : '') + '" data-act="cols" data-i="' + c + '">' + c + ' 列</button>';
    });
    h += '</div>';

    h += '<div class="sec-title">缓存（默认开启）</div>';
    h += '<div class="block-label">接口与列表缓存策略：下次打开直接秒显，不用重新加载</div><div class="row-chips">';
    [['7d','7 天后清除'],['30d','30 天后清除'],['never','从不缓存'],['forever','永远缓存']].forEach(function(m){
      h += '<button class="chip' + (V.cacheMode === m[0] ? ' on' : '') + '" data-act="cachemode" data-v="' + m[0] + '">' + m[1] + '</button>';
    });
    h += '</div><button class="wide-btn" data-act="clearcache">立即清空视频缓存</button>';

    h += '<div class="sec-title">播放</div>';
    h += '<div class="block-label">播放内核（自动 = 先 hls.js，失败自动切系统播放器）</div><div class="row-chips">';
    [['auto', '自动（推荐）'], ['hls', 'hls.js'], ['native', '系统播放器']].forEach(function (p) {
      h += '<button class="chip' + (V.playerCore === p[0] ? ' on' : '') + '" data-act="core2" data-v="' + p[0] + '">' + p[1] + '</button>';
    });
    h += '</div>';
    h += '<label class="chk big"><input type="checkbox" id="autoOri"' + (V.autoOri ? ' checked' : '') + '> <span>全屏自动检测比例（勾选=按 16:9/9:16 自动横竖全屏；取消=每次手动二选一）</span></label>';
    h += '<p class="tip">播放页支持：点击画面暂停/播放、拖动进度条（拖动实时预览画面变化）、倍速 0.1~10x、音量条、画面明暗度、画质切换（hls 多档时）、全屏、画面尺寸、画面裁剪、分辨率读取、选集右栏（点「选集 ▾」弹出）、上下集、记忆进度；两条内核都不行时可用「外部打开」交给手机播放器。</p>';

    h += '<div class="sec-title">弹幕（弹弹play 开放接口 · 免费）</div>';
    h += '<label class="chk big"><input type="checkbox" id="dmOn"' + (w.DM.cfg.on ? ' checked' : '') + '> <span>显示弹幕</span></label>';
    h += '<div class="block-label">透明度：<b id="vDmOp">' + Math.round(w.DM.cfg.opacity * 100) + '%</b></div>';
    h += '<input type="range" id="dmOp" min="20" max="100" value="' + Math.round(w.DM.cfg.opacity * 100) + '">';
    h += '<div class="block-label">速度：<b id="vDmSp">' + w.DM.cfg.speed + 'x</b></div>';
    h += '<input type="range" id="dmSp" min="5" max="25" value="' + Math.round(w.DM.cfg.speed * 10) + '">';
    h += '<div class="block-label">字号：<b id="vDmSz">' + w.DM.cfg.size + 'px</b></div>';
    h += '<input type="range" id="dmSz" min="10" max="28" value="' + w.DM.cfg.size + '">';
    h += '<div class="block-label">显示区域：<b id="vDmAr">' + w.DM.cfg.area + '%</b>（屏幕上方比例）</div>';
    h += '<input type="range" id="dmAr" min="25" max="100" value="' + w.DM.cfg.area + '">';
    h += '<div class="block-label">屏蔽词（逗号分隔）</div>';
    h += '<input type="text" id="dmBlock" class="ta mini-ta" value="' + esc(w.DM.cfg.block) + '" placeholder="例如：剧透,广告">';
    h += '<div class="block-label">弹弹play 开放接口密钥（免费注册，填了就能搜全网弹幕）</div>';
    h += '<input type="text" id="ddpId" class="ta mini-ta" value="' + esc(w.DM.ddp.appId) + '" placeholder="AppId">';
    h += '<input type="text" id="ddpSec" class="ta mini-ta" value="' + esc(w.DM.ddp.appSecret) + '" placeholder="AppSecret">';
    h += '<div class="row2"><button class="wide-btn" data-act="saveddp">保存弹弹play密钥</button><button class="wide-btn" data-act="dmsearch2">本地弹幕搜索</button></div>';
    h += '<p class="tip">免费注册：打开 dandanplay.com/open.html → 点「开发者中心/开放平台」→ 注册账号（免费，无付费）→ 创建应用 → 审核通过后拿到 AppId / AppSecret → 填到上面保存即可。填好后播放页自动显示弹幕开关；没填时不显示弹幕功能。</p>';

    h += '<div class="sec-title">主题与背景</div>';
    h += '<div class="row-chips">';
    var presets = [
      { n: '巳泷梦幻紫（默认）', m: '#9B4DE8', m2: '#22D3EE', g: '#F472B6', bg: '#0A0418' },
      { n: '霓虹蓝紫', m: '#4F46E5', m2: '#22D3EE', g: '#F472B6', bg: '#0B1026' },
      { n: '午夜樱紫', m: '#9333EA', m2: '#F472B6', g: '#FDE68A', bg: '#1B0A22' },
      { n: '翡翠夜', m: '#10B981', m2: '#34D399', g: '#FBBF24', bg: '#04180F' },
      { n: '暗金', m: '#B45309', m2: '#F59E0B', g: '#FDE68A', bg: '#140F06' }
    ];
    for (var i = 0; i < presets.length; i++) h += '<button class="chip" data-act="preset" data-i="' + i + '">' + esc(presets[i].n) + '</button>';
    h += '</div>';
    h += '<div class="theme-rows">';
    h += '<label>主色 <input type="color" id="cMain" value="' + esc(V.theme.main) + '" data-k="main"></label>';
    h += '<label>辅色 <input type="color" id="cMain2" value="' + esc(V.theme.main2) + '" data-k="main2"></label>';
    h += '<label>点缀 <input type="color" id="cGold" value="' + esc(V.theme.gold) + '" data-k="gold"></label>';
    h += '<label>背景 <input type="color" id="cBg" value="' + esc(V.theme.bg) + '" data-k="bg"></label>';
    h += '</div>';
    h += '<input type="file" id="bgFile" accept="image/*" class="file">';
    h += '<div class="row2"><button class="wide-btn" data-act="bgpick">上传背景图</button><button class="wide-btn" data-act="bgclear">清除背景图</button></div>';
    h += '<div class="block-label">背景浓度：<b id="vBgOp">' + Math.round((V.bgOpacity || 0.35) * 100) + '%</b></div>';
    h += '<input type="range" id="bgOp" min="5" max="90" value="' + Math.round((V.bgOpacity || 0.35) * 100) + '">';

    h += '<div class="sec-title">每日自动更新（来源接口库）</div>';
    var remoteUrl = (w.SRCUPD && w.SRCUPD.getUrl) ? w.SRCUPD.getUrl() : '';
    var remoteDef = (w.SRCUPD && w.SRCUPD.defaults && w.SRCUPD.defaults()[0]) || '';
    h += '<div class="block-label">远程清单 URL（JSON 数组 / TVBox 配置 / 多仓子配置；留空则用内置默认合集）</div>';
    h += '<input id="remoteUrl" class="ta mini-ta" type="text" value="' + esc(remoteUrl) + '" placeholder="' + esc(remoteDef) + '">';
    h += '<div class="row2"><button class="wide-btn" data-act="remoteurlsave">保存地址</button>' +
      '<button class="wide-btn" data-act="remoteupdate">立即更新</button></div>';
    h += '<div class="gs-status" id="remoteStatus">' + esc((w.SRCUPD && w.SRCUPD.status) ? w.SRCUPD.status() : '远程清单不可用') + '</div>';
    h += '<button class="wide-btn ghost" data-act="remoteclear">清除远程缓存（恢复本地清单）</button>';
    h += '<p class="tip">启动时检查上次更新时间：超过 24 小时会自动拉取远程清单 → 解析（数组 / TVBox sites / 多仓 urls）→ 与内置源合并去重；拉取失败、离线或 file:// 环境下会被静默跳过并回退本地清单，不依赖任何密钥服务。<br>内置接口全部保留，远程新增只做补充。</p>';

    h += '<div class="sec-title">视频源</div>';
    h += '<button class="wide-btn" data-act="sources">打开源管理（' + V.sources.length + ' 个源）</button>';
    h += '<p class="tip">当前源：' + esc(V.sources[V.cur] ? V.sources[V.cur].name : '无') + '</p>';
    return h;
  };

  w.UI = UI;

})(window);