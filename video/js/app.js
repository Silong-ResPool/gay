/* ==========================================================================
   影视乐园 · app.js
   启动 / 路由 / 交互：分类浏览、全局搜索（跨源折叠）、详情、播放器、收藏、历史、
   源管理、设置（列数 / 内核 / 弹幕 / 主题与背景）
   ========================================================================== */

(function (w) {
  'use strict';

  var K = {
    theme: 'video_theme',
    bg: 'video_bg',
    bgOp: 'video_bg_op',
    custom: 'video_sources_custom',
    cur: 'video_cur_src',
    curApi: 'video_cur_api',
    cols: 'video_cols',
    core: 'video_player_core',
    fav: 'video_fav',
    hist: 'video_hist',
    gs: 'video_global_search',
    health: 'video_src_health',
    removed: 'video_src_removed',
    catsFold: 'video_cats_folded'
  };

  var V = w.V = {
    sources: [], cur: 0,
    classes: [], parents: [], childs: {}, subs: [],
    curParent: '', curSub: '',
    items: [], page: 1, pagecount: 1,
    view: 'home', keyword: '',
    detail: null, loading: false, loadingTxt: '',
    theme: { main: '#9B4DE8', main2: '#22D3EE', gold: '#F472B6', bg: '#0A0418' },
    bgImage: '', bgOpacity: 0.35,
    cols: 3, playerCore: 'auto',
    curCat: '综合影视', cats: [], loadingMore: false,
    repos: [], removedList: [],          // 仓库入口（多仓/JSON）/ 已移除的源
    checking: false, healthTxt: '', healthDone: 0, healthTotal: 0,
    catsFolded: false, catsMode: 'row',       // 顶部源分类区：row 水平滑动 / drawer 垂直抽屉
    gsCatsOn: null, gsTags: [], gsExact: false,   // 搜索筛选：源分类 / 标签 / 精确
    gsFilterOpen: true, gsPhase: 1, gsDeadTried: false, gsSheet: null,  // 筛选开关 / 失效源兜底检索 / 结果源选择浮层
    searchMode: 'single',        // single | global
    groups: [], gmap: {}, gsDone: 0, gsTotal: 0, gsHit: 0, gsOnlyMulti: true, gsPending: false,
    fav: [], hist: [], quickView: '',
    cntOpen: false, forceRender: false, autoSubTried: false,
    level: 'wh', curWh: '', whs: [],   // 四级层级：wh 仓库 → src 源 → cls 分类(含内容)
    homeTab: '综合资源接口',            // 主页分类 Tab：仓库分类 / 综合资源接口 / 成人 / 动漫 / 自定义
    categoryFocus: '',                 // 单接口分类浏览中：综合资源接口 / 成人 / 动漫（进入后自动选中第一源，顶部横向切源）
    customFocus: '',                   // 自定义仓库的子分类（正在浏览的仓库名，空 = 显示全部自定义）
    searchEntries: null,               // 搜索：本地入口匹配（仓库/源/源下分类标签）
    jumpParent: '',                    // 搜索跳转：加载分类后要自动选中的分类 id
    repoSheet: null,                   // 内置仓库「选源」浮层：{name, api, loading, children, err}
    autoOri: true,                     // 全屏自动检测比例（竖向/横向）
    cacheMode: ls('video_cache_mode', '7d'),   // v9.8.0：7d / 30d / never / forever，默认缓存 7 天
    clsSeq: 0, listSeq: 0, listErr: '', clsErr: '' // 请求过期序号（防竞态）/ 错误提示
    ,
    tab: 'wh',                         // 底部导航：wh 仓库 / time 时间表 / fav 追番 / mine 我的 / cat 分类
    dockCat: '',                       // 右侧源筛选栏当前分类
    bgState: {},                       // Bangumi 板块数据：{rec: [], time: [][7], loading: bool}
  };

  function $(id) { return document.getElementById(id); }
  function ls(k, def) { try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('本地保存失败（空间可能已满）'); } }

  var toastTimer = null;
  function toast(msg, ms) {
    try {
      var t = $('toast');
      t.textContent = String(msg);
      t.classList.add('on');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.classList.remove('on'); }, ms || 2200);
    } catch (e) {}
  }
  w.vToast = toast;

  function log(tag, msg) {
    try { console.log('[VIDEO-' + tag + '] ' + msg); } catch (e) {}
    try { if (w.VideoNative && VideoNative.logBoot) VideoNative.logBoot(tag + ' ' + msg); } catch (e) {}
  }
  function err(msg) {
    try { console.error(msg); } catch (e) {}
    try { if (w.VideoNative && VideoNative.logError) VideoNative.logError(String(msg)); } catch (e) {}
  }

  /* ---------------------------------------------------------------- 主题 */
  function applyTheme() {
    try {
      var r = document.documentElement.style;
      r.setProperty('--main', V.theme.main);
      r.setProperty('--main2', V.theme.main2);
      r.setProperty('--gold', V.theme.gold);
      r.setProperty('--bg', V.theme.bg);
      var bg = $('bgLayer');
      if (bg) {
        if (V.bgImage) { bg.style.backgroundImage = 'url("' + V.bgImage + '")'; bg.style.opacity = String(V.bgOpacity); }
        else { bg.style.backgroundImage = ''; bg.style.opacity = '0'; }
      }
    } catch (e) {}
  }
  w.vApplyTheme = applyTheme;

  /* ---------------------------------------------------------------- 源 */
  function loadSources() {
    var custom = ls(K.custom, []) || [];
    var removed = ls(K.removed, []) || [];
    var out = [], repos = [], b = w.VIDEO_SOURCES || [];
    var byApi = {};
    // XPath 规则源映射（api → 规则对象），api.js 的 API.isXpath 分流用
    w.XP_RULES = w.XP_RULES || {};
    for (var i = 0; i < b.length; i++) {
      var it = b[i];
      if (!it) continue;
      var api = it.a || it.api;
      var nm = it.n || it.name;
      if (it.t === 'm') { repos.push({ name: nm, api: api }); continue; }   // 仓库入口（多仓/JSON），需展开导入
      if (removed.indexOf(api) >= 0) continue;
      if (it.t === 'x' && it.r) {
        // Kazumi 式 XPath 规则源（内置）：api = "xpath:源名"
        var xapi = 'xpath:' + nm;
        w.XP_RULES[xapi] = it.r;
        out.push({ name: nm, api: xapi, cat: it.c || '动漫', cat0: it.c || '动漫', builtin: true, v: true, xpath: true, rule: it.r });
        byApi[xapi] = nm;
        continue;
      }
      out.push({ name: nm, api: api, cat: it.c || '综合影视', cat0: it.c || '综合影视', builtin: true, v: !!it.v });
      byApi[api] = nm;
    }
    for (var k = 0; k < custom.length; k++) {
      var ck = custom[k];
      if (!ck || !ck.api) continue;
      if (removed.indexOf(ck.api) >= 0) continue;
      if (ck.kind === 'xpath' && ck.rule) {
        // 用户自加的 XPath 规则源
        w.XP_RULES[ck.api] = ck.rule;
        out.push({ name: ck.name, api: ck.api, cat: '自定义', cat0: '自定义', builtin: false, cg: ck.name, xpath: true, rule: ck.rule });
        byApi[ck.api] = ck.name;
        continue;
      }
      if (ck.kind === 'repo' && ck.children && ck.children.length) {
        // 自定义仓库：每个子接口 = 一个源（同一仓库组 cg），点仓库展开选源
        for (var cj = 0; cj < ck.children.length; cj++) {
          var ch = ck.children[cj];
          if (!ch || !ch.api) continue;
          if (removed.indexOf(ch.api) >= 0) continue;
          out.push({ name: ch.name, api: ch.api, cat: '自定义', cat0: '自定义', builtin: false, cg: ck.name, cgApi: ck.api });
          byApi[ch.api] = ch.name;
        }
      } else {
        var cnm = ck.name || ('自定义源' + (k + 1));
        out.push({
          name: cnm, api: ck.api,
          cat: '自定义', cat0: '自定义',
          builtin: false, cg: cnm
        });
        byApi[ck.api] = cnm;
      }
    }
    // 已移除的源（可以恢复）
    var rmList = [];
    for (var r = 0; r < removed.length; r++) rmList.push({ api: removed[r], name: byApi[removed[r]] || removed[r] });
    V.removedList = rmList;
    V.repos = repos;
    for (var q = 0; q < out.length; q++) out[q].idx0 = q;
    V.sources = out;
    V.cats = catsOf();
    var pend = w.VIDEO_PENDING_CAT || '其他源（待验证）';
    // 按「接口地址」记忆当前源：内置源增删后下标会变，用下标会指到别的源（老版本的坑）
    var curApi = String(ls(K.curApi, '') || '');
    var idx = -1;
    if (curApi) {
      for (var m = 0; m < V.sources.length; m++) if (V.sources[m].api === curApi) { idx = m; break; }
    }
    if (idx < 0) {
      var oldIdx = parseInt(ls(K.cur, -1), 10);   // 兼容旧数据（只有 15 个内置源时的下标）
      if (isFinite(oldIdx) && oldIdx >= 0 && oldIdx < V.sources.length && (V.sources[oldIdx].cat || '') !== pend) idx = oldIdx;
    }
    if (idx < 0) idx = 0;
    if ((V.sources[idx].cat || '') === pend) {     // 不停在「待验证」分类里
      for (var q = 0; q < V.sources.length; q++) {
        if ((V.sources[q].cat || '') !== pend) { idx = q; break; }
      }
    }
    V.cur = idx;
    try { lset(K.curApi, V.sources[idx] ? V.sources[idx].api : ''); } catch (e) {}
    if (V.sources[V.cur]) V.curCat = V.sources[V.cur].cat || '综合影视';
    if (V.cats.indexOf(V.curCat) < 0) V.curCat = V.cats[0] || '综合影视';
    buildWhs();
    log('SRC', '共 ' + V.sources.length + ' 个源，分类：' + V.cats.join('/'));
  }

  // 分类顺序 + 每个分类的源数量
  function catsOf() {
    var order = w.VIDEO_CATS || ['综合影视'];
    var have = {};
    for (var i = 0; i < V.sources.length; i++) {
      var c = V.sources[i].cat || '综合影视';
      have[c] = (have[c] || 0) + 1;
    }
    var out = [];
    for (var k = 0; k < order.length; k++) if (have[order[k]]) out.push(order[k]);
    for (var nm in have) if (out.indexOf(nm) < 0) out.push(nm);
    return out;
  }

  function catCount(c) {
    var n = 0;
    for (var i = 0; i < V.sources.length; i++) if ((V.sources[i].cat || '综合影视') === c) n++;
    return n;
  }

  function firstIndexOfCat(c) {
    for (var i = 0; i < V.sources.length; i++) if ((V.sources[i].cat || '综合影视') === c) return i;
    return -1;
  }

  /* ------------------------------------------------ 四级层级：仓库列表
     主页 = 仓库（内置大分类=独立仓库 + 多仓/JSON 仓库入口 + 失效区 + 自定义）
     点击仓库 → 源列表 → 点击源 → 分类列表 + 内容。各仓库内容互不串门。 */
  function whOf(name) {
    for (var i = 0; i < (V.whs || []).length; i++) if (V.whs[i].name === name) return V.whs[i];
    return null;
  }

  function buildWhs() {
    try {
      var whs = [];
      var order = w.VIDEO_CATS || ['综合影视'];
      var dead = w.VIDEO_DEAD_CAT || '失效区';
      for (var i = 0; i < order.length; i++) {
        var c = order[i];
        if (c === dead) continue;                 // 失效区单独特殊仓库
        var n = catCount(c);
        if (n > 0) whs.push({ name: c, type: 'cat', count: n });
      }
      for (var r = 0; r < (V.repos || []).length; r++) {
        whs.push({ name: V.repos[r].name, type: 'repo', api: V.repos[r].api, count: 0 });
      }
      if (catCount(dead) > 0) whs.push({ name: dead, type: 'dead', count: catCount(dead) });
      V.whs = whs;
      if (V.curWh && !whOf(V.curWh)) V.curWh = '';
      if (!V.curWh && whs.length) V.curWh = whs[0].name;
    } catch (e) { err('构建仓库失败：' + e.message); }
  }

  /* 进入某仓库（仓库层 → 源列表层）；仓库入口（多仓/JSON）→ 直接展开导入 */
  function openWh(name) {
    var wh = whOf(name);
    if (!wh) { toast('仓库不存在'); return; }
    if (wh.type === 'repo') { openRepo(wh.api, wh.name); return; }
    V.curWh = name;
    V.level = 'src';
    if (wh.type === 'dead') {
      renderChips(); render();
      toast('失效区：这些源自动检测不通，已分「链接失效 / 网络异常波动」两类。可点「测速」重测；失效区内置接口不可移除', 4200);
      return;
    }
    renderChips(); render();
    toast('仓库：' + name + '（' + catCount(name) + ' 个源），点源进入分类浏览', 2600);
  }

  /* 层级返回：
     · 单接口分类内容层 → 直接回主页（保留当前 Tab）
     · 自定义源内容层 → 源列表 → 主页（自定义 Tab） */
  function upLevel() {
    if (V.level === 'cls') {
      if (V.categoryFocus) { V.level = 'wh'; V.categoryFocus = ''; V.curParent = ''; V.curSub = ''; renderChips(); render(); return; }
      V.level = 'src'; V.curParent = ''; V.curSub = ''; renderChips(); render();
    }
    else if (V.level === 'src') {
      V.level = 'wh'; V.curWh = ''; V.customFocus = ''; V.homeTab = '自定义';
      renderChips(); render();
    }
  }

  /* 主页 Tab 切换：
     · 单接口分类（综合资源接口 / 成人 / 动漫）：点进后自动选中第一个视频源，直接加载并展示内容
     · 仓库分类 / 自定义：停留在主页展示仓库卡片 / 自定义子分类 */
  function switchHomeTab(tab) {
    V.homeTab = tab || '综合资源接口';
    if (V.quickView) V.quickView = '';
    if (tab === '成人' || tab === '动漫') { enterCategoryFirst(tab === '成人' ? '成人（18+）' : '动漫'); return; }
    if (tab === '综合资源接口') { enterCategoryFirst('综合资源接口'); return; }
    // 仓库分类 / 自定义：主页展示
    V.categoryFocus = '';
    renderChips(); render();
  }

  /* 是否属于当前正在浏览的单接口分类 */
  function inCategoryFocus(s) {
    var f = V.categoryFocus;
    if (!f || !s) return false;
    if (!s.builtin) return false;
    var c = s.cat || '';
    if (f === '成人（18+）') return c === '成人（18+）';
    if (f === '动漫') return c === '动漫';
    return c !== '成人（18+）' && c !== '动漫' && c !== (w.VIDEO_DEAD_CAT || '失效区');
  }

  /* 进入单接口分类：自动选中第一个视频源 → 直接加载并展示该源全部内容；
     顶部横向源标签可左右滑动切换，切换即实时展示对应源的内容与分类标签 */
  function enterCategoryFirst(catName) {
    var idxs = [];
    for (var i = 0; i < V.sources.length; i++) {
      if (!V.sources[i].builtin) continue;
      var c = V.sources[i].cat || '';
      if (catName === '成人（18+）') { if (c === '成人（18+）') idxs.push(i); }
      else if (catName === '动漫') { if (c === '动漫') idxs.push(i); }
      else if (c !== '成人（18+）' && c !== '动漫' && c !== (w.VIDEO_DEAD_CAT || '失效区')) idxs.push(i);
    }
    if (!idxs.length) {
      V.categoryFocus = '';
      renderChips(); render();
      toast('这个分类下暂无可用的接口（失效源会在「仓库分类」页底部显示，可重测恢复）');
      return;
    }
    // 若当前记忆的源属于该分类，优先用它；否则用第一个源
    var pick = idxs.indexOf(V.cur);
    if (pick < 0) pick = 0;
    V.homeTab = catName === '成人（18+）' ? '成人' : (catName === '动漫' ? '动漫' : '综合资源接口');
    V.categoryFocus = catName;
    setCur(idxs[pick]);
    V.level = 'cls';
    renderChips();
    render();
    loadClasses(false);
  }

  /* 巳泷 v9.0.0：后台预载内置分类数据（不切换视图，首次进入始终停在仓库分类界面）。
     预载逻辑：遍历内置源中非失效区的首个源，把分类数据提前加载（缓存由 api.js 管理），
     用户切到该分类时秒开。 */
  function preloadHomeData() {
    try {
      var cats = ['综合资源接口', '动漫', '成人（18+）'];
      for (var ci = 0; ci < cats.length; ci++) {
        var catName = cats[ci];
        var idxs = [];
        for (var i = 0; i < V.sources.length; i++) {
          if (!V.sources[i].builtin) continue;
          var c = V.sources[i].cat || '';
          if (catName === '成人（18+）') { if (c === '成人（18+）') idxs.push(i); }
          else if (catName === '动漫') { if (c === '动漫') idxs.push(i); }
          else if (c !== '成人（18+）' && c !== '动漫' && c !== (w.VIDEO_DEAD_CAT || '失效区')) idxs.push(i);
        }
        if (!idxs.length) continue;
        var pre = V.sources[idxs[0]];
        if (pre && w.API) {
          (function (s) {
            w.API.classes(s.api).then(function () {}).catch(function () {});
          })(pre);
        }
      }
    } catch (e) {}
  }

  /* 单接口分类内：切换视频源（保持内容视图，实时展示对应源内容） */
  function switchSourceAt(i) {
    if (!(i >= 0 && i < V.sources.length)) return;
    if (i === V.cur) { render(); return; }
    setCur(i);
    V.level = 'cls';
    loadClasses(false);
  }

  /* ---------------------------------------------------- 搜索入口匹配
     关键词可命中：仓库名 / 视频源名（含分类名）/ 源下分类标签 */
  function buildSearchEntries(kw) {
    var out = { repos: [], sources: [], classes: [] };
    if (!kw) return out;
    var k = String(kw).toLowerCase();
    for (var r = 0; r < (V.repos || []).length; r++) {
      var ro = V.repos[r];
      if ((ro.name || '').toLowerCase().indexOf(k) >= 0) out.repos.push({ name: ro.name, api: ro.api });
    }
    var custom = [];
    try { custom = JSON.parse(localStorage.getItem('video_sources_custom') || '[]'); } catch (e) {}
    for (var c = 0; c < custom.length; c++) {
      var ck = custom[c];
      if (!ck || !ck.api) continue;
      if (ck.kind === 'repo') {
        if ((ck.name || '').toLowerCase().indexOf(k) >= 0) out.repos.push({ name: ck.name, api: ck.api, custom: true });
      } else {
        if ((ck.name || '').toLowerCase().indexOf(k) >= 0) {
          var idx = -1;
          for (var m = 0; m < V.sources.length; m++) if (V.sources[m].api === ck.api) { idx = m; break; }
          if (idx >= 0) out.sources.push({ i: idx, name: ck.name, cat: '自定义' });
        }
      }
    }
    for (var i = 0; i < V.sources.length; i++) {
      var s = V.sources[i];
      var nm = (s.name || '').toLowerCase(), cat = (s.cat || '').toLowerCase();
      if ((nm.indexOf(k) >= 0 || cat.indexOf(k) >= 0) && !s.builtin) continue;  // 自定义已在上面处理
      if (nm.indexOf(k) >= 0 || cat.indexOf(k) >= 0) out.sources.push({ i: i, name: s.name, cat: s.cat || '', builtin: !!s.builtin });
    }
    // 当前源已加载的源下分类标签
    for (var p = 0; p < (V.parents || []).length; p++) {
      var pc = V.parents[p];
      if ((pc.name || '').toLowerCase().indexOf(k) >= 0) out.classes.push({ src: curSource() ? curSource().name : '', srcI: V.cur, id: pc.id, name: pc.name });
    }
    for (var s2 = 0; s2 < (V.subs || []).length; s2++) {
      var sc = V.subs[s2];
      if ((sc.name || '').toLowerCase().indexOf(k) >= 0) out.classes.push({ src: curSource() ? curSource().name : '', srcI: V.cur, id: V.curParent, name: sc.name });
    }
    return out;
  }

  /* 跳到某个视频源（并可选自动选中其下分类标签） */
  function jumpToSource(i, parentId) {
    if (!(i >= 0 && i < V.sources.length)) return;
    V.jumpParent = parentId || '';
    V.categoryFocus = '';
    V.level = 'cls';
    setCur(i);
    loadClasses(false);
    toast('已进入视频源：' + curSource().name);
  }

  /* 跳到某个仓库（内置 → 选源浮层；自定义 → 源列表） */
  function jumpToRepo(api, name, custom) {
    if (custom) { openCustomRepo(name); }
    else openRepo(api, name);
  }

  /* 选集右栏：点开 / 收起（DOM 直接切换，不整页重绘以免打断播放） */
  function openEpPanel() {
    try {
      var pn = $('plEpPanel'), mk = $('plEpMask');
      if (pn) pn.hidden = false;
      if (mk) mk.hidden = false;
    } catch (e) {}
  }
  function closeEpPanel() {
    try {
      var pn = $('plEpPanel'), mk = $('plEpMask');
      if (pn) pn.hidden = true;
      if (mk) mk.hidden = true;
    } catch (e) {}
  }

  /* 自定义：点单个接口子分类 → 直接进入该源 */
  function openCustomSingle(i) {
    enterSource(parseInt(i, 10) || 0);
  }

  /* 自定义：点仓库子分类 → 展开它的接口（源列表层），在里面选择源 */
  function openCustomRepo(name) {
    if (!name) return;
    V.customFocus = name;
    V.curWh = '自定义';
    V.level = 'src';
    renderChips(); render();
    toast('仓库：' + name + '（' + countCustomGroup(name) + ' 个接口），点「进入」浏览该源的视频标签分类', 2800);
  }

  function countCustomGroup(name) {
    var n = 0;
    for (var i = 0; i < V.sources.length; i++) if (!V.sources[i].builtin && V.sources[i].cg === name) n++;
    return n;
  }

  /* 内置仓库：读取 → 浮层列出子分类（接口）→ 选择源 → 展开视频标签分类 */
  function openRepo(api, name) {
    if (!api) { toast('仓库地址为空'); return; }
    V.repoSheet = { name: name || '仓库', api: api, loading: true, children: [], err: '' };
    render();
    w.fetchText(api).then(function (txt) {
      var kids = w.interfacesOf(txt);
      if (!V.repoSheet || V.repoSheet.api !== api) return;
      if (!kids.length) {
        V.repoSheet.loading = false;
        V.repoSheet.err = '这个仓库里没有可用的 type=1 接口（可能失效，或需要 jar 的爬虫配置）';
        render(); return;
      }
      V.repoSheet.loading = false; V.repoSheet.children = kids; render();
    }).catch(function (e) {
      if (!V.repoSheet || V.repoSheet.api !== api) return;
      V.repoSheet.loading = false;
      V.repoSheet.err = '仓库读取失败：' + (e && e.message ? e.message : e);
      render();
    });
  }

  /* 浮层里选了一个源 → 直接进入（临时源，不写进自定义库） */
  function pickRepoChild(i) {
    var rs = V.repoSheet;
    if (!rs || !rs.children) return;
    var kid = rs.children[parseInt(i, 10) || 0];
    if (!kid || !kid.api) { toast('该接口无效'); return; }
    var idx = -1;
    for (var m = 0; m < V.sources.length; m++) if (V.sources[m].api === kid.api) { idx = m; break; }
    if (idx < 0) {
      V.sources.push({ name: kid.name, api: kid.api, cat: '自定义', cg: rs.name, builtin: false, temp: true });
      idx = V.sources.length - 1;
    }
    V.repoSheet = null;
    enterSource(idx);
  }

  function closeRepoSheet() {
    V.repoSheet = null;
    render();
  }

  function switchCat(c) {
    var dead = w.VIDEO_DEAD_CAT || '失效区';
    V.curCat = c;
    // 分类切换 = 进入对应仓库（失效区/自定义等也都有独立仓库）
    if (whOf(c)) { openWh(c); return; }
    renderChips();
    toast('分类：' + c + '（' + catCount(c) + ' 个源）');
  }

  /* 进入某个源（源列表层 → 分类层 + 加载分类） */
  function enterSource(idx) {
    if (!(idx >= 0 && idx < V.sources.length)) return;
    setCur(idx);
    V.curCat = V.sources[idx].cat || '综合影视';
    V.level = 'cls';
    V.failoverSet = {}; V.failoverLeft = 0;     /* v9.8.2：手动选源时重置自动容错计数 */
    renderChips();
    loadClasses(false);
    if (isOk(V.sources[idx].api) === false) toast('该源上次检测是「已失效」，可能拉不到内容（可重测）', 3400);
  }

  /* v9.8.2：源自动容错 —— 某个源没返回分类 / 读取失败时，自动在同分类里换下一个可用源，
     避免「综合资源」一打开就卡在死源上（用户反馈：不能正常加载、内容太少） */
  function tryNextSource(reason) {
    var s = curSource();
    if (!s) return false;
    if (!V.failoverSet) V.failoverSet = {};
    V.failoverSet[V.cur] = 1;
    if ((V.failoverLeft = (V.failoverLeft || 0) + 1) > 12) return false;
    var catNow = s.cat || '综合影视';
    var best = -1, bestRank = 1e9;
    for (var i = 0; i < V.sources.length; i++) {
      var t = V.sources[i];
      if (i === V.cur || V.failoverSet[i]) continue;
      if (t.t === 'm') continue;                 /* 仓库入口不是真源 */
      if (t.xpath) continue;
      if ((t.cat || '综合影视') !== catNow) continue;
      var ok = isOk(t.api);
      if (ok === false) continue;
      var r = (ok === true ? 0 : 100) + (rankSrc ? rankSrc(t) : 0);
      if (r < bestRank) { bestRank = r; best = i; }
    }
    if (best < 0) return false;
    V.cur = best; V.curCat = V.sources[best].cat || '综合影视';
    try { lset(K.cur, best); lset(K.curApi, V.sources[best].api); } catch (e) {}
    toast('「' + s.name + '」' + reason + '，已自动切到「' + V.sources[best].name + '」', 2600);
    loadClasses(false);
    return true;
  }

  function curSource() { return V.sources[V.cur] || V.sources[0] || null; }
  function srcName(i) { return (V.sources[i] && V.sources[i].name) || ('源' + (i + 1)); }

  // 切换当前源：同时记住接口地址（下标会随内置源增删而变，地址不会）
  function setCur(i) {
    if (!(i >= 0 && i < V.sources.length)) return;
    V.cur = i;
    lset(K.cur, i);
    try { lset(K.curApi, V.sources[i].api); } catch (e) {}
  }

  /* ==================================================== 源健康检测 / 失效区
     · 打开应用时自动检测（并发 8、9 秒超时），结果缓存 6 小时
     · 可用的源排前面；失效的源自动进入「失效区」分类，可一键移除（从本机移除） */
  function healthAll() { return ls(K.health, {}) || {}; }
  function healthOf(api) { var a = healthAll(); return a[api] || null; }
  function isOk(api) { var h = healthOf(api); return h ? !!h.ok : null; }

  function rankSrc(s) {
    var ok = isOk(s.api);
    if (ok === true) return 0;
    if (ok === null) return 1;
    return 2;
  }

  function sortSources() {
    try {
      var dead = w.VIDEO_DEAD_CAT || '失效区';
      var curApiKeep = (V.sources[V.cur] && V.sources[V.cur].api) || String(ls(K.curApi, '') || '');
      for (var i = 0; i < V.sources.length; i++) {
        var s = V.sources[i];
        if (!s.cat0) s.cat0 = s.cat;
        s.cat = (isOk(s.api) === false && s.cat0 !== dead) ? dead : s.cat0;
      }
      V.sources.sort(function (a, b) {
        var ra = rankSrc(a), rb = rankSrc(b);
        if (ra !== rb) return ra - rb;
        // 可用源：按测速延迟从低到高排；没有测速数据的排后面
        if (ra === 0) {
          var ha = healthOf(a.api), hb = healthOf(b.api);
          var ma = (ha && ha.ms) ? ha.ms : 999999;
          var mb = (hb && hb.ms) ? hb.ms : 999999;
          if (ma !== mb) return ma - mb;
        }
        return (a.idx0 || 0) - (b.idx0 || 0);
      });
      V.cats = catsOf();
      // 按接口地址恢复当前选中的源
      var ni = -1;
      for (var k = 0; k < V.sources.length; k++) if (V.sources[k].api === curApiKeep) { ni = k; break; }
      if (ni >= 0) V.cur = ni;
      else if (V.cur >= V.sources.length) V.cur = 0;
      if (V.sources[V.cur]) {
        V.curCat = V.sources[V.cur].cat || '综合影视';
        try { lset(K.cur, V.cur); } catch (e) {}
      }
      if (V.cats.indexOf(V.curCat) < 0) V.curCat = V.cats[0] || '综合影视';
      buildWhs();
    } catch (e) { err('排序源失败：' + e.message); }
  }

  function healthSummary() {
    var all = healthAll(), okN = 0, badN = 0, unN = 0;
    for (var i = 0; i < V.sources.length; i++) {
      var h = all[V.sources[i].api];
      if (!h) unN++;
      else if (h.ok) okN++;
      else badN++;
    }
    var last = 0;
    for (var k in all) if (all[k] && all[k].at > last) last = all[k].at;
    var t = last ? ('上次检测：' + new Date(last).toLocaleString()) : '还没检测过';
    V.healthTxt = '可用 ' + okN + '　失效 ' + badN + '　待检测 ' + unN + '　（' + t + '）';
  }

  /* 失效分类：链接失效（HTTP/解析错误） / 网络异常波动（超时/断网） */
  function kindOfErr(e) {
    var m = String((e && e.message) ? e.message : e || '');
    if (/超时|timeout|Failed to fetch|NetworkError|网络错误|net::/i.test(m)) return 'net';
    return 'link';
  }

  function startHealthCheck(force) {
    if (V.checking) return;
    var all = healthAll(), now = Date.now(), TTL = 3600 * 1000;   // 缓存 1 小时，每小时自动重测
    var need = [];
    for (var i = 0; i < V.sources.length; i++) {
      var s = V.sources[i];
      var h = all[s.api];
      if (force || !h || (now - (h.at || 0)) > TTL) need.push(s);
    }
    if (!need.length) { healthSummary(); sortSources(); renderChips(); return; }
    V.checking = true;
    V.healthDone = 0; V.healthTotal = need.length;
    V.healthTxt = '正在检测 0/' + need.length + ' …（可继续浏览，不影响使用）';
    if (V.view === 'sources') render(); else renderChips();
    log('HEALTH', '开始检测 ' + need.length + ' 个源');
    var queue = need.slice(0), running = 0, MAX = 8;
    var pump = function () {
      while (running < MAX && queue.length) {
        (function (s) {
          running++;
          var t0 = Date.now();
          API.classes(s.api).then(function (list) {
            all[s.api] = { ok: true, at: Date.now(), ms: Date.now() - t0, cls: list.length };
          }).catch(function (e) {
            all[s.api] = { ok: false, at: Date.now(), ms: Date.now() - t0, kind: kindOfErr(e) };
          }).then(function () {
            running--; V.healthDone++;
            V.healthTxt = '正在检测 ' + V.healthDone + '/' + V.healthTotal + ' …';
            if (V.healthDone % 4 === 0 || V.healthDone >= V.healthTotal) {
              try { lset(K.health, all); } catch (e) {}
              sortSources();
              buildWhs();
              renderChips();                 // 只刷新源条，不整页重绘（避免浏览/切换时卡顿）
              updateDock();
            }
            if (V.healthDone >= V.healthTotal) {
              V.checking = false;
              healthSummary();
              buildWhs();
              var okN = 0, badN = 0;
              for (var q = 0; q < V.sources.length; q++) { if (isOk(V.sources[q].api) === false) badN++; else okN++; }
              log('HEALTH', '检测完成：可用 ' + okN + '，失效 ' + badN);
              toast('源检测完成：可用 ' + okN + ' 个，失效 ' + badN + ' 个（已归入「失效区」）', 3400);
              renderChips();
              updateDock();
              if (V.view === 'sources' || (V.view === 'home' && V.level !== 'cls')) { try { render(); } catch (e) {} }
            }
            pump();
          });
        })(queue.shift());
      }
    };
    pump();
  }
  w.vHealthCheck = function (force) { startHealthCheck(force !== false); };

  /* 从本机移除 / 恢复某个源（失效区里的内置接口不可删除移除） */
  function dropSource(i) {
    var s = V.sources[i];
    if (!s) return;
    if (s.builtin && (s.cat === (w.VIDEO_DEAD_CAT || '失效区'))) {
      toast('「失效区」里的内置接口不可移除（可点「测速」重测，恢复后自动回原仓库）', 3400);
      return;
    }
    var removed = ls(K.removed, []) || [];
    if (removed.indexOf(s.api) < 0) removed.push(s.api);
    lset(K.removed, removed);
    loadSources();
    buildWhs();
    sortSources();
    renderChips(); render();
    toast('已从本机移除：' + s.name + '（可在「已移除的源」里恢复）');
  }

  function restoreSource(api) {
    var removed = ls(K.removed, []) || [];
    var k = removed.indexOf(api);
    if (k >= 0) removed.splice(k, 1);
    lset(K.removed, removed);
    loadSources();
    buildWhs();
    sortSources();
    renderChips(); render();
    toast('已恢复该源');
  }

  /* 复制接口地址 */
  function copyText(txt, tip) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      toast(ok ? (tip || '已复制') : '复制失败，可长按手动复制');
    } catch (e) { toast('复制失败：' + e.message); }
  }

  /* 展开仓库入口（多仓 / JSON 配置）：改为「浮层选源」——不再自动灌进自定义分类 */
  function expandRepo(api, name) { openRepo(api, name); }

  function saveCustom(extra) {
    var custom = ls(K.custom, []) || [];
    if (extra) custom.push(extra);
    lset(K.custom, custom);
  }

  function removeCustom(index) {
    var s = V.sources[index];
    if (!s || s.builtin) return;
    var custom = ls(K.custom, []) || [];
    for (var i = 0; i < custom.length; i++) if (custom[i].api === s.api) { custom.splice(i, 1); break; }
    lset(K.custom, custom);
    loadSources();
    setCur(Math.min(V.cur, V.sources.length - 1));
    renderChips(); render();
    toast('已删除：' + s.name);
  }

  function useSource(index, keepView) {
    if (!(index >= 0 && index < V.sources.length)) return;
    setCur(index);
    if (V.sources[index]) V.curCat = V.sources[index].cat || '综合影视';
    renderChips();
    if (!keepView) setView('home');
    if (isOk(V.sources[index].api) === false) toast('注意：这个源上次检测是「已失效」，可能拉不到内容（可点「测速」重测）', 3200);
    else toast('已切换视频源：' + curSource().name);
    if (!keepView) loadClasses(false);
    else render();
  }

  /* -------------------------------------------------------------- 分类树 */
  var SEMI_RULES = [
    { root: /^(电影|电影片)$/, child: /片$|电影|纪录|记录|预告/ },
    { root: /^(连续剧|电视剧|电视剧集)$/, child: /剧$/ },
    { root: /^(动漫|动漫片|动画)$/, child: /动漫|动画|漫剧/ },
    { root: /^(综艺|综艺片)$/, child: /综艺|演唱会/ },
    { root: /^(短剧|短剧大全)$/, child: /短剧|爽剧|爽文|言情|恋爱|穿越|重生|脑洞|仙侠|都市|总裁|闪婚|逆袭|民国|甜宠/ },
    { root: /^(体育赛事|体育)$/, child: /体育|足球|篮球|网球|斯诺克|赛事/ },
    { root: /^(资讯|新闻资讯)$/, child: /资讯|新闻|公告|头条|演员|预告|解说/ }
  ];

  function buildTree(list) {
    var ids = {};
    for (var i = 0; i < list.length; i++) ids[list[i].id] = 1;
    var hasPid = false;
    for (var k = 0; k < list.length; k++) {
      if (list[k].pid && list[k].pid !== '0' && ids[list[k].pid]) { hasPid = true; break; }
    }
    var parents = [], childs = {};
    if (hasPid) {
      for (var a = 0; a < list.length; a++) {
        var c = list[a];
        if (c.pid && c.pid !== '0' && ids[c.pid]) (childs[c.pid] = childs[c.pid] || []).push(c);
        else parents.push(c);
      }
      return { parents: parents, childs: childs };
    }
    var roots = [];
    for (var r = 0; r < list.length; r++) {
      for (var s = 0; s < SEMI_RULES.length; s++) {
        if (SEMI_RULES[s].root.test(list[r].name)) { roots.push({ c: list[r], rule: SEMI_RULES[s] }); break; }
      }
    }
    var used = {};
    for (var u = 0; u < roots.length; u++) used[roots[u].c.id] = 1;
    var rest = [];
    for (var x = 0; x < list.length; x++) {
      var cc = list[x];
      if (used[cc.id]) continue;
      var put = false;
      for (var y = 0; y < roots.length; y++) {
        if (roots[y].rule.child.test(cc.name)) { (childs[roots[y].c.id] = childs[roots[y].c.id] || []).push(cc); put = true; break; }
      }
      if (!put) rest.push(cc);
    }
    for (var z = 0; z < roots.length; z++) parents.push(roots[z].c);
    for (var w2 = 0; w2 < rest.length; w2++) parents.push(rest[w2]);
    return { parents: parents, childs: childs };
  }
  w.vBuildTree = buildTree;

  function loadClasses(keepSel) {
    var s = curSource();
    if (!s) { toast('没有可用视频源'); return; }
    // XPath 规则源没有分类树（只有搜索）：直接给空列表 + 顶部提示
    if (s.xpath) {
      V.loading = false;
      V.classes = []; V.parents = []; V.childs = {}; V.curParent = ''; V.curSub = '';
      V.items = []; V.page = 1; V.pagecount = 1; V.listErr = '';
      V.view = 'home'; V.quickView = ''; render();
      toast('「' + s.name + '」是 XPath 搜索源：没有分类列表，请在顶部搜索框直接搜片名', 3400);
      return;
    }
    var seq = ++V.clsSeq;
    V.loading = true; V.loadingTxt = '正在读取「' + s.name + '」的分类…';
    V.clsErr = ''; V.listErr = '';
    V.view = 'home'; V.quickView = ''; render();
    API.classes(s.api).then(function (list) {
      if (seq !== V.clsSeq) return;                 // 过期响应（期间又切了源/分类）→ 丢弃
      V.loading = false;
      V.classes = list || [];
      var tree = buildTree(V.classes);
      var childs = tree.childs, parents = tree.parents;
      V.parents = parents; V.childs = childs;
      if (!parents.length) {
        /* v9.8.2：这个源没有分类（多半已失效）→ 自动换下一个可用源 */
        V.loading = false;
        if (tryNextSource('没有返回分类')) return;
      }
      if (!keepSel || !V.curParent) {
        var pick = null;
        // 搜索跳转：优先选中目标分类标签
        if (V.jumpParent) {
          for (var pj = 0; pj < parents.length; pj++) if (parents[pj].id === V.jumpParent) { pick = parents[pj]; break; }
        }
        if (!pick) {
          var prefer = ['电影', '电视剧', '连续剧', '动漫', '综艺', '纪录片'];
          for (var p = 0; p < prefer.length && !pick; p++) {
            for (var q = 0; q < parents.length; q++) {
              if (parents[q].name.indexOf(prefer[p]) >= 0) { pick = parents[q]; break; }
            }
          }
        }
        if (!pick) pick = parents[0] || null;
        V.curParent = pick ? pick.id : '';
        V.jumpParent = '';
      }
      var parentIds = {};
      for (var pi = 0; pi < parents.length; pi++) parentIds[parents[pi].id] = 1;
      if (!parentIds[V.curParent] && parents.length) V.curParent = parents[0].id;
      V.curSub = '';
      V.autoSubTried = false;
      V.subs = V.childs[V.curParent] || [];
      log('CLASS', s.name + ' 一级=' + V.parents.length + ' 当前=' + V.curParent + ' 子类=' + V.subs.length);
      loadList(1);
    }).catch(function (e) {
      if (seq !== V.clsSeq) return;
      V.loading = false;
      if (tryNextSource('读取失败')) return;
      V.items = []; V.clsErr = '分类读取失败：' + (e && e.message ? e.message : e);
      render();
      toast('分类读取失败：' + (e && e.message ? e.message : e) + '（可点「重试」或换个源）');
      err('分类读取失败：' + (e && e.message ? e.message : e));
    });
  }
  w.vLoadClasses = loadClasses;

  /* v9.8.1：单次最多 100 条，滑到底部再加载下一批（避免一次拉几百条卡顿） */
  var PAGE_BATCH = 5;
  function loadList(page, more) {
    var s = curSource();
    if (!s) return;
    var seq = ++V.listSeq;
    var typeId = V.curSub || V.curParent;
    if (more) { V.loadingMore = true; }
    else { V.loading = true; V.loadingTxt = '正在加载内容…'; V.listErr = ''; render(); }
    var isGay = /^gayagg:/i.test(String(s.api || ''));
    var startPage = isGay ? page : ((Math.max(1, page) - 1) * PAGE_BATCH + 1);
    var jobs = [];
    if (isGay) jobs.push(API.list(s.api, { typeId: typeId, page: startPage }));
    else for (var bi = 0; bi < PAGE_BATCH; bi++) jobs.push(API.list(s.api, { typeId: typeId, page: startPage + bi }));
    Promise.all(jobs.map(function(p){ return p.catch(function(){ return null; }); })).then(function (rs) {
      if (seq !== V.listSeq) return;
      var r = rs.filter(Boolean)[0] || { items: [], page: page, pagecount: 1 };
      var merged = [], seen = {};
      rs.forEach(function (rr) {
        if (!rr) return;
        (rr.items || []).forEach(function (raw) {
          var it = API.item(raw);
          var key = (it && (it.id || it.url || it.name)) || '';
          if (key && seen[key]) return;
          if (key) seen[key] = 1;
          merged.push(it);
        });
      });
      var items = merged.slice(0, 100);          /* 单次最多 100 条 */
      V.loading = false;
      V.loadingMore = false;
      V.items = (page <= 1) ? items : V.items.concat(items);
      V.page = page;
      var rawPageCount = Math.max(1, r.pagecount || 1);
      V.pagecount = isGay ? rawPageCount : Math.max(1, Math.ceil(rawPageCount / PAGE_BATCH));
      if (page === 1 && !V.items.length && !V.curSub && (V.subs || []).length && !V.autoSubTried) {
        V.autoSubTried = true;
        V.curSub = V.subs[0].id;
        toast('该分类的内容在子分类里，已自动切到「' + V.subs[0].name + '」');
        loadList(1);
        return;
      }
      V.autoSubTried = false;
      /* v9.8.2：首页一条内容都没有且无子分类 → 自动换下一个可用源 */
      if (page === 1 && !V.items.length && !V.curSub && !(V.subs || []).length && tryNextSource('没有内容')) return;
      /* 2026-11 修复：综合资源接口下个别源的首个分类只有 4 条（内容太少）→ 自动换同分类下一个可用源 */
      if (page === 1 && V.categoryFocus === '综合资源接口' && V.items.length > 0 && V.items.length < 8 && tryNextSource('内容太少')) return;
      render();
      log('LIST', '第 ' + V.page + '/' + V.pagecount + ' 页，共 ' + V.items.length + ' 条');
    }).catch(function (e) {
      if (seq !== V.listSeq) return;
      V.loading = false; V.loadingMore = false;
      if (page === 1 && tryNextSource('列表读取失败')) return;
      V.listErr = '加载失败：' + (e && e.message ? e.message : e);
      render();
      toast('加载失败：' + (e && e.message ? e.message : e) + '（可点「重试」）');
    });
  }

  /* ------------------------------------------------ 滑到底部自动加载更多 */
  var autoIO = null;

  function setupAutoLoad() {
    try {
      if (autoIO) { try { autoIO.disconnect(); } catch (e) {} autoIO = null; }
      var sent = $('autoLoad');
      if (!sent) return;
      if (typeof IntersectionObserver === 'undefined') {
        sent.innerHTML = '<button class="wide-btn" data-act="more">加载更多（' + V.page + '/' + V.pagecount + '）</button>';
        return;
      }
      autoIO = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { maybeLoadMore(); break; }
        }
      }, { root: null, rootMargin: '400px 0px' });
      autoIO.observe(sent);
      bindScrollAuto();     // 再挂一层滚动兜底（部分环境 IntersectionObserver 不触发）
    } catch (e) {}
  }

  /* 源管理页：文件选择框绑定 + 添加源类型切换 */
  function bindSourcesInputs() {
    try {
      var kindSel = $('fKind');
      if (kindSel && !kindSel.__xpBound) {
        kindSel.__xpBound = true;
        var toggleRule = function () {
          var row = $('fRuleRow');
          var api = $('fApi');
          if (row) row.style.display = (kindSel.value === 'xpath') ? '' : 'none';
          if (api) api.disabled = (kindSel.value === 'xpath');
        };
        kindSel.addEventListener('change', toggleRule);
        toggleRule();
      }
      var f = $('srcFile');
      if (f && !f.__bound) {
        f.__bound = true;
        f.addEventListener('change', function () {
          if (f.files && f.files[0]) importSourceFile(f.files[0]);
          try { f.value = ''; } catch (e) {}
        });
      }
    } catch (e) {}
  }

  function bindScrollAuto() {
    try {
      var el = $('app');
      if (el && !el.__autoBound) {
        el.__autoBound = true;
        el.addEventListener('scroll', function () {
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 420) maybeLoadMore();
        }, { passive: true });
      }
      if (!window.__autoBound) {
        window.__autoBound = true;
        window.addEventListener('scroll', function () {
          if (window.innerHeight + window.scrollY >= (document.body.scrollHeight - 420)) maybeLoadMore();
        }, { passive: true });
      }
    } catch (e) {}
  }

  /* 顶部源分类区：未展开 = 水平左右滑动一行；展开 = 垂直滑动抽屉（固定下拉范围，不随数量拉伸） */
  function toggleCatsFold() {
    V.catsMode = (V.catsMode === 'drawer') ? 'row' : 'drawer';
    try { lset('video_cats_mode', V.catsMode); } catch (e) {}
    applyCatsFold();
    toast(V.catsMode === 'drawer' ? '已展开：分类/源变为垂直列表（固定高度内上下滑动）' : '已收起：分类/源恢复为水平左右滑动一行');
  }

  function applyCatsFold() {
    try {
      var bar = $('srcBar');
      if (!bar) return;
      bar.classList.toggle('drawer', V.catsMode === 'drawer');
      bar.classList.toggle('folded', false);
      var b = $('catsFold');
      if (b) b.innerHTML = (V.catsMode === 'drawer') ? '收起为一行 <i class="fa-solid fa-caret-up"></i>' : '展开下拉 <i class="fa-solid fa-caret-down"></i>';
    } catch (e) {}
  }

  function bindScrollHideCats() {
    try {
      var el = $('app');
      if (!el || el.__hideBound) return;
      el.__hideBound = true;
      var last = 0;
      el.addEventListener('scroll', function () {
        var bar = $('srcBar');
        if (!bar) return;
        var top = el.scrollTop;
        if (top > last + 12 && top > 90) bar.classList.add('hide');        // 上滑 → 隐藏
        else if (top < last - 12 || top <= 30) bar.classList.remove('hide'); // 下拉/回顶 → 显示
        last = top;
      }, { passive: true });
    } catch (e) {}
  }

  function maybeLoadMore() {
    if (V.loadingMore || V.loading) return;
    if (V.view !== 'home' && V.view !== 'search') return;
    if (V.searchMode === 'global' && V.view === 'search') return;   // 全局搜索是聚合结果，不分页
    if (!(V.page < V.pagecount)) return;
    loadList(V.page + 1, true);
  }

  /* ---------------------------------------------------------------- 搜索 */
  function normKey(name) {
    var s = String(name || '').toLowerCase();
    s = s.replace(/[\s\-_·・:：,，.。!！?？'"“”‘’()（）\[\]【】<>《》/|]/g, '');
    s = s.replace(/(19|20)\d{2}/g, '');
    s = s.replace(/第[一二三四五六七八九十0-9]+季/g, '');
    s = s.replace(/(国语|粤语|英语|日语|韩语|中字|双语|高清|超清|蓝光|hd|bd|4k|完整版|未删减|抢先版|预告片|合集|全\d+集|更新至\d+集?|tc|ts|hd国语|hdtc)/g, '');
    return s || String(name || '');
  }

  function mergeGroups(items, idx, name) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var key = normKey(it.name);
      var g = V.gmap[key];
      if (!g) {
        g = V.gmap[key] = {
          key: key, name: it.name, pic: it.pic, year: it.year, typeName: it.typeName,
          remarks: it.remarks, items: [], open: false
        };
        V.groups.push(g);
      }
      if (!g.pic && it.pic) g.pic = it.pic;
      if (!g.year && it.year) g.year = it.year;
      if (!g.typeName && it.typeName) g.typeName = it.typeName;
      if (it.content && (!g.content || it.content.length > g.content.length)) g.content = it.content;
      if (String(it.name).length < String(g.name).length) g.name = it.name;   // 取最干净的片名当标题

      var entry = {
        id: it.id, name: it.name, pic: it.pic || g.pic, year: it.year, typeName: it.typeName,
        remarks: it.remarks, content: it.content, raw: it.raw, srcIndex: idx, srcName: name
      };
      // 同一个源只保留一条（不同语言/版本视为同一部片，避免同一源刷屏）
      var replaced = false;
      for (var m = 0; m < g.items.length; m++) {
        if (g.items[m].srcIndex === idx) {
          if (String(entry.name).length < String(g.items[m].name).length) g.items[m] = entry;
          replaced = true;
          break;
        }
      }
      if (!replaced) g.items.push(entry);
    }
    V.groups.sort(function (a, b) { return b.items.length - a.items.length; });
  }

  /* 全局搜索（两阶段）：
     ① 只搜「正常源」；全部无结果 → 强制重测并检索失效源
     ② 仍无结果 → 弹「未找到该内容」 */
  function globalSearch(wd, includeDead) {
    V.keyword = wd;
    V.view = 'search'; V.searchMode = 'global';
    if (!includeDead) { V.groups = []; V.gmap = {}; V.gsHit = 0; V.gsPhase = 1; }
    else V.gsPhase = 2;
    V.gsDone = 0; V.gsDeadTried = V.gsDeadTried || false;
    V.loading = false;
    V.gsSheet = null;
    // 「其他源（待验证）」默认不参与（数量多且多数已失效），可手动打开
    var pending = w.VIDEO_PENDING_CAT || '其他源（待验证）';
    var dead = w.VIDEO_DEAD_CAT || '失效区';
    var useList = [];
    for (var si = 0; si < V.sources.length; si++) {
      var sm = V.sources[si];
      var sc = sm.cat || '';
      if (!V.gsPending && sc === pending) continue;
      if (sc === dead && !includeDead) continue;          // 失效源只在兜底阶段参与
      if (V.gsCatsOn) { if (!V.gsCatsOn[sc]) continue; } // 源筛选（分类多选）
      useList.push(si);
    }
    V.gsTotal = useList.length;
    V.wdKey = normKey(wd);
    render();
    log('GS', '全局搜索「' + wd + '」第' + V.gsPhase + '阶段 ' + V.gsTotal + ' 个源｜模式=' + (V.gsExact ? '精确' : '模糊'));
    if (!useList.length) {
      finishGlobalSearch();
      return;
    }
    // 并发上限 12，多的排队，避免上百个源同时请求把 WebView 拖死
    var queue = [];
    for (var qi = 0; qi < useList.length; qi++) queue.push({ s: V.sources[useList[qi]], idx: useList[qi] });
    var running = 0, MAX = 12;
    var pump = function () {
      while (running < MAX && queue.length) {
        (function (job) {
          running++;
          API.search(job.s.api, wd, 1).then(function (r) {
            var items = [], raw = r.items || [];
            for (var i = 0; i < raw.length; i++) {
              var it = API.item(raw[i]);
              if (V.gsExact && V.wdKey && normKey(it.name).indexOf(V.wdKey) < 0) continue;   // 精确模式：片名必须包含关键词
              items.push(it);
            }
            if (items.length) { V.gsHit++; mergeGroups(items, job.idx, job.s.name); }
          }).catch(function (e) {
            log('GS', job.s.name + ' 搜索失败：' + e.message);
          }).then(function () {
            running--;
            V.gsDone++;
            if (V.view === 'search' && V.searchMode === 'global') render();
            if (V.gsDone >= V.gsTotal) finishGlobalSearch();
            pump();
          });
        })(queue.shift());
      }
    };
    pump();
  }

  function deadSrcCount() {
    var dead = w.VIDEO_DEAD_CAT || '失效区', n = 0;
    for (var i = 0; i < V.sources.length; i++) if ((V.sources[i].cat || '') === dead) n++;
    return n;
  }

  /* 全局搜索收尾：正常源无结果 → 兜底检测失效源；全部无结果 → 弹提示 */
  function finishGlobalSearch() {
    try {
      if (V.gsPhase === 1 && V.gsHit === 0 && !V.gsDeadTried && deadSrcCount() > 0) {
        V.gsDeadTried = true;
        toast('正常源没有结果，正在重新检测并检索失效源…', 3200);
        startHealthCheck(true);                    // 每次搜索强制检测一次（含失效源）
        var self = this;
        setTimeout(function () {
          if (V.keyword && V.view === 'search' && V.searchMode === 'global') globalSearch(V.keyword, true);
        }, 3200);
        return;
      }
      if (V.gsHit === 0 && V.gsDone >= V.gsTotal) {
        toast('未找到该内容：所有源都没有搜到「' + V.keyword + '」', 3800);
      }
    } catch (e) { err('全局搜索收尾失败：' + e.message); }
  }

  function doSearch() {
    var inp = $('searchInput');
    var wd = String((inp && inp.value) || '').trim();
    if (!wd) { toast('请输入关键词'); return; }
    if (!V.sources.length) { toast('没有可用视频源'); return; }
    V.keyword = wd;
    V.searchEntries = buildSearchEntries(wd);          // 本地入口匹配（仓库/源/源下分类标签）
    V.gsDeadTried = false;
    V.gsSheet = null;
    startHealthCheck(true);                        // 每次搜索强制检测一次（后台进行，不阻塞）
    if (ls(K.gs, true) !== false) { globalSearch(wd); return; }
    var s = curSource();
    V.keyword = wd; V.view = 'search'; V.searchMode = 'single';
    V.loading = true; V.loadingTxt = '正在搜索…'; render();
    API.search(s.api, wd, 1).then(function (r) {
      V.loading = false;
      var items = [];
      for (var i = 0; i < (r.items || []).length; i++) items.push(API.item(r.items[i]));
      V.items = items; V.page = r.page || 1; V.pagecount = Math.max(1, r.pagecount || 1);
      render();
      if (!items.length) toast('没有搜到「' + wd + '」，可打开全局搜索跨源找');
    }).catch(function (e) {
      V.loading = false; render();
      toast('搜索失败：' + e.message);
    });
  }
  w.vDoSearch = doSearch;

  /* ---------------------------------------------------------------- 详情 */
  function openItem(it, srcIndex) {
    if (!it) { toast('找不到该内容'); return; }
    if (srcIndex !== undefined && srcIndex !== null && srcIndex !== V.cur) {
      setCur(srcIndex);
      renderChips();
    }
    var groups = [];
    try { groups = API.play(it.raw || {}); } catch (e) { groups = []; }
    // 直连（m3u8/mp4）的线路排前面，让用户一进来就是能播的那条
    try {
      groups.sort(function (a, b) {
        var ra = 0, rb = 0;
        var ua = (a.eps && a.eps[0] && a.eps[0].url) || '';
        var ub = (b.eps && b.eps[0] && b.eps[0].url) || '';
        if (/\.m3u8(\?|$)/i.test(ua)) ra = 3; else if (/\.mp4(\?|$)/i.test(ua)) ra = 2; else ra = 1;
        if (/\.m3u8(\?|$)/i.test(ub)) rb = 3; else if (/\.mp4(\?|$)/i.test(ub)) rb = 2; else rb = 1;
        return rb - ra;
      });
    } catch (e) {}
    V.detail = { item: it, groups: groups, curFrom: 0, playing: null };
    V.cntOpen = false;
    if (w.PL && w.PL.destroy) w.PL.destroy();
    // 记忆进入详情前的页面：播放后返回时逐层回退（搜索→详情→播放），不跨到主页
    if (V.view !== 'detail') V.prevView = V.view;
    setView('detail');
    var s = curSource();
    if (!s) return;
    API.detail(s.api, it.id).then(function (raw) {
      if (!raw) return;
      var full = API.item(raw);
      full.pic = full.pic || it.pic;
      if (V.detail && V.detail.item && String(V.detail.item.id) === String(it.id)) {
        V.detail.item = full;
        var g = API.play(raw);
        if (g && g.length) V.detail.groups = g;
        if (V.view === 'detail') render();
        log('DETAIL', full.name + ' 线路=' + V.detail.groups.length);
      }
    }).catch(function (e) { log('DETAIL', '详情补全失败：' + e.message); });
  }

  function openById(id) {
    for (var i = 0; i < V.items.length; i++) if (String(V.items[i].id) === String(id)) { openItem(V.items[i], V.cur); return; }
    toast('找不到该内容（可重新搜索）');
  }

  function switchFrom(g) {
    if (!V.detail) return;
    V.detail.curFrom = g;
    if (V.detail.playing) {
      var grp = V.detail.groups[g];
      V.detail.playing.e = Math.min(V.detail.playing.e, Math.max(0, (grp ? grp.eps.length : 1) - 1));
      if (V.view === 'player') { if (w.PL) w.PL.destroy(); V.forceRender = true; render(); return; }
    }
    render();
  }

  function playEp(e) {
    var d = V.detail;
    if (!d) return;
    var g = d.groups[d.curFrom];
    if (!g || !g.eps.length) { toast('这条线路没有可播放的集'); return; }
    e = Math.max(0, Math.min(g.eps.length - 1, e));
    if (!g.eps[e]) { toast('该集没有播放地址'); return; }
    d.playing = { e: e };
    if (V.view === 'player') { if (w.PL) w.PL.destroy(); V.forceRender = true; render(); }
    else setView('player');
  }

  /* ---------------------------------------------- 三框添加源（单接口 / 多接口仓库）
     · 单个接口：链接里识别出多个接口 → 提示「请尝试更换接口数（选多接口）」
     · 多接口：自动识别接口数量，不用手输 */
  function addSource3() {
    try {
      var nm = String(($('fName') && $('fName').value) || '').trim();
      var api = w.normalizeSourceApi(($('fApi') && $('fApi').value) || '');
      var kind = ($('fKind') && $('fKind').value) || 'single';
      if (kind === 'xpath') { addXpathSource(nm); return; }
      if (!api) { toast('请填写接口链接（第三栏）'); return; }
      if (!/^https?:\/\/.+\..+/i.test(api)) { toast('链接看起来不完整，例如 https://xxx.com/api.php/provide/vod/'); return; }
      if (!nm) nm = api.replace(/^https?:\/\//, '').split('/')[0];
      if (kind === 'multi') { addMultiRepo(nm, api); return; }
      // 单个接口：先探测链接类型，多接口配置直接提示换「多接口」
      toast('正在检测链接类型…', 2600);
      w.fetchText(api).then(function (txt) {
        var kids = w.interfacesOf(txt);
        if (kids.length > 1) {
          toast('检测到 ' + kids.length + ' 个接口：这是「多接口/仓库」链接，请尝试更换接口数（选「多接口」）', 4600);
          return;
        }
        pushCustomSingle(nm, api);
      }).catch(function () {
        pushCustomSingle(nm, api);   // 不是配置文本（直接是接口地址），按单个接口添加
      });
    } catch (e) { toast('添加失败：' + e.message); }
  }

  /* XPath 规则源添加（Kazumi 格式规则 JSON） */
  function addXpathSource(nm) {
    try {
      var ruleTxt = String(($('fRule') && $('fRule').value) || '').trim();
      if (!ruleTxt) { toast('请粘贴 XPath 规则 JSON（选「XPath 规则源」类型后填写规则框）'); return; }
      var parsed = (w.XP && w.XP.parseRuleText) ? w.XP.parseRuleText(ruleTxt) : null;
      if (!parsed || !parsed.ok) { toast('规则解析失败：' + ((parsed && parsed.msg) || '未知错误')); return; }
      var rule = parsed.rule;
      var name = nm || parsed.name || rule.name || rule.baseURL.replace(/^https?:\/\//, '').split('/')[0];
      if (!name) name = '我的XPath源';
      var xapi = 'xpath:' + name;
      var custom = ls(K.custom, []) || [];
      for (var i = 0; i < custom.length; i++) {
        if (custom[i].kind === 'xpath' && custom[i].api === xapi) { toast('这个 XPath 源已经添加过了：' + name); return; }
      }
      custom.push({ name: name, api: xapi, cat: '自定义', kind: 'xpath', rule: rule });
      lset(K.custom, custom);
      loadSources();
      renderChips(); render();
      toast('XPath 规则源已添加：' + name + '（进入后直接用顶部搜索）', 3200);
      log('SRC', '新增 XPath 规则源 ' + name);
    } catch (e) { toast('添加失败：' + e.message); }
  }

  function pushCustomSingle(nm, api) {
    var custom = ls(K.custom, []) || [];
    for (var i = 0; i < custom.length; i++) {
      if (custom[i].api === api) { toast('这个源已经添加过了：' + custom[i].name); return; }
    }
    custom.push({ name: nm, api: api, cat: '自定义', kind: 'single' });
    lset(K.custom, custom);
    loadSources();
    renderChips(); render();
    toast('已添加接口（自定义）：' + nm, 2800);
    log('SRC', '新增单接口 ' + nm + ' → ' + api);
  }

  function addMultiRepo(nm, api) {
    toast('正在自动识别接口数量…', 2600);
    w.fetchText(api).then(function (txt) {
      var kids = w.interfacesOf(txt);
      if (!kids.length) { toast('没有解析到可用的接口（链接可能失效，或需要 jar 的爬虫配置）', 3800); return; }
      var custom = ls(K.custom, []) || [];
      for (var i = 0; i < custom.length; i++) {
        if (custom[i].api === api) { toast('这个仓库已经添加过了：' + custom[i].name); return; }
      }
      custom.push({ name: nm, api: api, cat: '自定义', kind: 'repo', children: kids });
      lset(K.custom, custom);
      loadSources();
      renderChips(); render();
      toast('仓库已添加：' + nm + '（自动识别 ' + kids.length + ' 个接口）', 3200);
      log('SRC', '新增仓库 ' + nm + ' → ' + kids.length + ' 个接口 → ' + api);
    }).catch(function (e) {
      toast('读取失败：' + (e && e.message ? e.message : e), 3600);
    });
  }

  /* 上传 JSON / TXT 文件导入源 */
  function importSourceFile(file) {
    if (!file) return;
    try {
      var fr = new FileReader();
      fr.onload = function () {
        var txt = String(fr.result || '');
        addSourcesFromText(txt, true);
        toast('已解析文件：' + file.name, 2600);
      };
      fr.onerror = function () { toast('读取文件失败'); };
      fr.readAsText(file);
    } catch (e) { toast('读取文件失败：' + e.message); }
  }

  function pickSourceFile() {
    var f = $('srcFile');
    if (!f) { toast('没有找到文件选择框'); return; }
    f.click();
  }

  function testNewSource() {
    var api = w.normalizeSourceApi(($('fApi') && $('fApi').value) || '');
    if (!api) { toast('请先填链接'); return; }
    toast('正在测试：' + api.slice(0, 60) + ' …', 2600);
    var t0 = Date.now();
    API.classes(api).then(function (list) {
      toast('这个源可用：' + list.length + ' 个分类，用时 ' + ((Date.now() - t0) / 1000).toFixed(1) + ' 秒', 3400);
    }).catch(function (e) {
      toast('这个源用不了：' + e.message, 3600);
    });
  }

  /* 自动换源：去其它源里搜同一部片，挑一个「直连 m3u8/mp4」的源打开 */
  function autoSwitchSource() {
    var d = V.detail;
    if (!d) { toast('先打开一部片'); return; }
    var key = normKey(d.item.name), name = d.item.name;
    var list = [];
    for (var i = 0; i < V.sources.length; i++) if (i !== V.cur) list.push(i);
    if (!list.length) { toast('没有其它源可用'); return; }
    toast('正在其它源里找「' + name + '」的直连地址…', 3000);
    var jobs = list.map(function (idx) {
      return API.search(V.sources[idx].api, name, 1).then(function (r) {
        return { idx: idx, items: r.items || [] };
      }).catch(function () { return null; });
    });
    Promise.all(jobs).then(function (res) {
      var target = null;
      for (var a = 0; a < res.length && !target; a++) {
        var r = res[a];
        if (!r) continue;
        for (var k = 0; k < r.items.length && !target; k++) {
          var it = API.item(r.items[k]);
          if (normKey(it.name) !== key) continue;
          var gs = [];
          try { gs = API.play(it.raw || {}); } catch (e) { gs = []; }
          for (var gg = 0; gg < gs.length; gg++) {
            var u = (gs[gg].eps[0] || {}).url || '';
            if (/\.(m3u8|mp4)(\?|$)/i.test(u)) { target = { idx: r.idx, it: it }; break; }
          }
        }
      }
      if (!target) { toast('其它源也没找到直连地址：可用「外部打开」交给手机播放器，或换个关键词再搜', 3800); return; }
      toast('已自动换到直连源：' + srcName(target.idx));
      openItem(target.it, target.idx);
    }).catch(function (e) { toast('换源失败：' + e.message); });
  }

  function toggleFav() {
    try {
      var d = V.detail;
      if (!d) return;
      var it = d.item;
      var idx = -1;
      for (var i = 0; i < (V.fav || []).length; i++) if (V.fav[i].name === it.name) { idx = i; break; }
      if (idx >= 0) { V.fav.splice(idx, 1); toast('已取消收藏'); }
      else {
        V.fav.unshift({
          name: it.name, pic: it.pic, year: it.year, typeName: it.typeName, remarks: it.remarks,
          content: it.content, id: it.id, raw: it.raw, srcIndex: V.cur, srcName: srcName(V.cur)
        });
        V.fav = V.fav.slice(0, 120);
        toast('已收藏（首页「★ 我的收藏」可看）');
      }
      lset(K.fav, V.fav);
      render();
    } catch (e) { toast('收藏失败：' + e.message); }
  }

  // 播放器每 5 秒回调：记录观看进度与历史
  var lastHistKey = '';
  w.vRecordHist = function (pos) {
    try {
      var d = V.detail;
      if (!d) return;
      var it = d.item;
      var epName = (w.PL && w.PL.epName) ? w.PL.epName() : '';
      var rec = {
        name: it.name, pic: it.pic, year: it.year, typeName: it.typeName, remarks: it.remarks,
        content: it.content, id: it.id, raw: it.raw, srcIndex: V.cur, srcName: srcName(V.cur),
        ep: epName, t: pos || 0, at: Date.now()
      };
      var key = it.name + '|' + epName;
      var old = null, idx = -1;
      for (var i = 0; i < (V.hist || []).length; i++) if (V.hist[i].name === it.name) { old = V.hist[i]; idx = i; break; }
      if (old && old.ep === epName && Math.abs((old.t || 0) - (pos || 0)) < 20) return;   // 变化不大不重复写
      if (idx >= 0) V.hist.splice(idx, 1);
      V.hist.unshift(rec);
      V.hist = V.hist.slice(0, 60);
      lset(K.hist, V.hist);
      lastHistKey = key;
    } catch (e) {}
  };

  /* -------------------------------------------------------------- 弹幕搜索 */
  // 巳泷 v9.1.0：弹幕 API 设置弹窗（用户可填自定义弹幕中转服务；不填则用内置弹幕池）
  function dmSetApi() {
    try {
      var cur = (w.DM && w.DM.loadCustom) ? w.DM.loadCustom() : '';
      if (w.askNum) {
        w.askNum('弹幕 API 地址（可不填，留空使用内置弹幕；\n格式：https://你的服务/api?name={name}&cid={ep}）', cur, function (val) {
          try {
            if (w.DM && w.DM.saveCustom) { w.DM.saveCustom(String(val || '').trim()); }
            try { w.vToast(val ? '已保存弹幕 API' : '已改用内置弹幕'); } catch (e) {}
          } catch (e) {}
        });
        return;
      }
      var panel = $('dmPanel');
      if (!panel) return;
      var h = '<div class="dm-panel-head">弹幕 API 设置<button class="mini" data-act="dmclose">关闭</button></div>';
      h += '<div class="block-label">留空 = 使用内置弹幕池；填写后优先使用你的弹幕中转服务</div>';
      h += '<input type="text" id="dmApiInput" value="' + UI.esc(cur) + '" placeholder="https://…danmaku…api?name={name}&ep={ep}" style="width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid var(--line);background:rgba(12,5,24,.85);color:#fff;margin:6px 0;">';
      h += '<div class="btn-row"><button class="mini" data-act="dmsaveapi">保存</button></div>';
      h += '<p class="tip">接口返回格式：{code:0, data:[{time(秒), text, color(0xFFFFFF), type}]}，兼容 danmaku-proxy 弹幕中转服务。</p>';
      panel.innerHTML = h; panel.hidden = false;
    } catch (e) {}
  }
  function dmSearch() {
    var d = V.detail;
    var panel = $('dmPanel');
    if (!d || !panel) return;
    var name = d.item.name, epName = (w.PL && w.PL.epName) ? w.PL.epName() : '';
    var local = w.DM.localList(name, epName);
    var h = '<div class="dm-panel-head">弹幕搜索 · ' + UI.esc(name) + ' · ' + UI.esc(epName) +
      '<button class="mini" data-act="dmclose">关闭</button></div>';
    h += '<div class="block-label">本机弹幕：' + local.length + ' 条（自己发的都会存在本机）</div>';
    h += '<div class="dm-list">' + (local.length
      ? local.slice(-60).map(function (c) { return '<div class="dm-row">[' + (w.PL.fmt(c.t)) + '] ' + UI.esc(c.text) + '</div>'; }).join('')
      : '<div class="empty-msg">这一集还没有本机弹幕</div>') + '</div>';
    if (!w.DM.ddpReady()) {
      h += '<p class="tip">想搜全网弹幕：去「设置 → 弹幕」填弹弹play 的 AppId / AppSecret（在弹弹play 开放平台免费申请），填好后这里会列出可加载的弹幕库。</p>';
    } else {
      h += '<div class="block-label">弹弹play 弹幕库（点「加载」把该集弹幕并入播放）</div><div class="dm-list" id="dmOnline">正在搜索…</div>';
    }
    panel.hidden = false;
    panel.innerHTML = h;

    if (w.DM.ddpReady()) {
      w.DM.searchEpisodes(name).then(function (list) {
        var box = $('dmOnline');
        if (!box) return;
        if (!list.length) { box.innerHTML = '<div class="empty-msg">弹弹play 没搜到这部片（可换片名关键字）</div>'; return; }
        var hh = '';
        for (var i = 0; i < Math.min(40, list.length); i++) {
          var x = list[i];
          var label = (x.animeTitle || '') + (x.episodeTitle ? (' · ' + x.episodeTitle) : '');
          hh += '<div class="dm-row"><span class="dm-txt">' + UI.esc(label) + '</span>' +
            (x.episodeId ? ('<button class="mini" data-act="dmpick" data-eid="' + x.episodeId + '" data-name="' + UI.esc(label) + '">加载</button>') : '') +
            '</div>';
        }
        box.innerHTML = hh;
      }).catch(function (e) {
        var box = $('dmOnline');
        if (box) box.innerHTML = '<div class="empty-msg">' + UI.esc(e.message) + '</div>';
      });
    }
  }

  function pickOnlineDm(eid, label) {
    var panel = $('dmPanel');
    if (panel) panel.querySelector('.dm-panel-head').textContent = '正在加载弹幕：' + label + ' …';
    w.DM.fetchComments(eid).then(function (list) {
      if (w.PL && w.PL.v) w.PL.onlineDm = list;
      var n = w.DM.engine.merge(w.DM.localList(V.detail.item.name, w.PL.epName()), list);
      toast('已加载弹幕 ' + list.length + ' 条（合计 ' + n + ' 条）');
      if (panel) panel.hidden = true;
    }).catch(function (e) {
      toast('弹幕加载失败：' + e.message, 3000);
    });
  }

  /* ---------------------------------------------------------------- 路由 */
  function setView(name) {
    if (V.view === 'player' && name !== 'player') { if (w.PL) w.PL.destroy(); }
    V.view = name;
    if (name !== 'home') V.quickView = '';
    render();
  }
  w.vSetView = setView;

  function goBack() {
    try {
      try { window.__backHandled = true; } catch (e) {}
      if (w.PL && w.PL.isFull && w.PL.isFull()) { w.PL.toggleFull(); return; }
      // 播放页 → 详情页 → 来源页（搜索结果/分类列表，记录滚动位置）→ 主页，逐层回退不跨页
      if (V.view === 'player') { if (w.PL) w.PL.destroy(); setView('detail'); return; }
      if (V.view === 'detail') {
        V._restoreScroll = currentScroll();   // 巳泷 v9.0.5：记录列表滚动位置
        if (V.prevView && V.prevView !== 'home') { setView(V.prevView); return; }
        setView('home'); return;
      }
      if (V.view !== 'home') { setView('home'); return; }
      if (V.quickView) { V.quickView = ''; render(); return; }
      if (V.level !== 'wh') { upLevel(); return; }
      if (w.VideoNative && VideoNative.exit) { VideoNative.exit(); return; }
      toast('已经在首页了');
    } catch (e) {}
  }

  /* 巳泷 v9.0.5：列表滚动位置记录 / 恢复（详情页返回分类/搜索时定位到原位置） */
  function currentScroll() {
    try {
      var app = $('app');
      if (app && app.scrollTop > 0) return { el: 'app', top: app.scrollTop };
      return { el: 'win', top: window.pageYOffset || document.body.scrollTop || 0 };
    } catch (e) { return null; }
  }
  function restoreScroll(s) {
    try {
      if (!s) return;
      setTimeout(function () {
        try {
          if (s.el === 'app') { var a = $('app'); if (a) a.scrollTop = s.top; }
          else window.scrollTo(0, s.top);
        } catch (e) {}
      }, 40);
    } catch (e) {}
  }
  w.vRestoreScroll = restoreScroll;

  /* ---------------------------------------------------------------- 渲染 */
  function render() {
    try {
      var app = $('app');
      if (!app) return;
      if (V.view === 'player' && !V.forceRender && app.querySelector('#vPlayer')) {
        updateEpButtons();
        updateDock();
        return;                       // 播放中不整体重绘，避免打断播放
      }
      V.forceRender = false;
      var html = '';
      // 仓库/综合资源/源管理/设置/分类：走完整 view 分发（home/search/detail/player/sources/settings）
      // 追番：独立板块页
      if (V.tab === 'wh' || V.tab === 'com' || V.tab === 'cat' || V.tab === 'mgr' || V.tab === 'sett') {
        if (V.view === 'home') html = UI.renderHome();
        else if (V.view === 'search') html = UI.renderSearch();
        else if (V.view === 'detail') html = UI.renderDetail();
        else if (V.view === 'player') html = UI.renderPlayer();
        else if (V.view === 'sources') html = UI.renderSources();
        else if (V.view === 'settings') html = UI.renderSettings();
      } else {
        html = UI.renderSection(V.tab);
      }
      if (V.repoSheet) html += UI.renderRepoSheet(V.repoSheet);
      app.innerHTML = html;
      var bb = $('backBtn');
      // 巳泷 v9.0.1：仓库主页返回键显示（点击回主页面巳泷资源库 → VideoNative.exit）；其它层可见
      var backHidden = (V.view === 'home' && V.level === 'wh' && !V.quickView && V.homeTab !== '仓库分类');
      if (bb) bb.style.visibility = backHidden ? 'hidden' : 'visible';
      var bar = $('srcBar');
      var isHome = (V.view === 'home' && !V.quickView);
      var isRepoLike = (V.tab === 'cat' || V.tab === 'wh' || V.tab === 'com');
      if (bar) {
        bar.style.display = isRepoLike && isHome ? 'block' : 'none';
        if (isRepoLike && isHome) { bar.classList.remove('hide'); applyCatsFold(); bindScrollHideCats(); renderChips(); }
      }
      // 底部导航高亮
      var tabs = document.querySelectorAll('.v-tabs .vt');
      for (var ti = 0; ti < tabs.length; ti++) tabs[ti].classList.toggle('on', tabs[ti].getAttribute('data-tab') === V.tab);
      updateDock();
      if (V.view === 'player') { if (w.PL) w.PL.open(); }
      if (V.view === 'settings') bindSettingsInputs();
      if (V.view === 'sources') bindSourcesInputs();
      if ((V.tab === 'cat' || V.tab === 'wh' || V.tab === 'com') && (V.view === 'home' || (V.view === 'search' && V.searchMode !== 'global'))) setupAutoLoad();
      window.scrollTo(0, 0);
      // 巳泷 v9.0.5：从详情页返回列表时恢复滚动位置
      if (V._restoreScroll) { restoreScroll(V._restoreScroll); V._restoreScroll = null; }
    } catch (e) { err('渲染失败：' + e.message); }
  }

  function updateEpButtons() {
    try {
      var d = V.detail;
      if (!d || !d.playing) return;
      var btns = document.querySelectorAll('.eps .ep');
      for (var i = 0; i < btns.length; i++) {
        var e = parseInt(btns[i].getAttribute('data-e'), 10);
        btns[i].classList.toggle('on', e === d.playing.e);
      }
    } catch (e) {}
  }

  function renderChips() {
    try {
      var cats = $('srcCats');
      var box = $('srcChips');
      var crumb = $('srcCrumb');
      var dead = w.VIDEO_DEAD_CAT || '失效区';

      // 面包屑：层级递进时上一级隐藏，这里只显示当前层级
      if (crumb) {
        var cb = '<button class="crumb" data-act="uplevel">‹ 返回</button>';
        if (V.level === 'src') cb += '<span class="crumb-txt">' + UI.esc(V.curWh) + '</span>';
        else if (V.level === 'cls') {
          if (V.categoryFocus) {
            var cfLab = V.categoryFocus === '成人（18+）' ? '成人' : (V.categoryFocus === '动漫' ? '动漫' : '综合资源接口');
            cb += '<span class="crumb-txt">' + UI.esc(cfLab) + ' › ' + UI.esc(curSource() ? curSource().name : '') + '</span>';
          } else {
            cb += '<span class="crumb-txt">' + UI.esc(V.curWh) + ' › ' + UI.esc(curSource() ? curSource().name : '') + '</span>';
          }
        }
        crumb.innerHTML = cb;
      }
      var sbT = $('sbTitle');
      if (sbT) sbT.textContent = (V.level === 'wh') ? '主页分类（点 Tab 切换 · 仓库在主页下方展示）' : '当前层级';

      if (V.level === 'wh') {
        // 主页层：分类 Tab（仓库分类 / 综合资源接口 / 成人 / 动漫 / 自定义）
        if (cats) {
          var hc = '';
          var hcats = w.VIDEO_HOME_CATS || ['仓库分类', '综合资源接口', '成人', '动漫', '自定义'];
          for (var c = 0; c < hcats.length; c++) {
            var ct = hcats[c];
            hc += '<button class="chip sm wh-chip' + (V.homeTab === ct ? ' on' : '') + '" data-act="hometab" data-c="' + UI.esc(ct) + '">' + UI.esc(ct) + '</button>';
          }
          cats.innerHTML = hc;
        }
        if (box) box.innerHTML = '';
        return;
      }

      // 非仓库层：仓库标签隐藏，展示当前层内容
      if (cats) cats.innerHTML = '';
      if (V.level === 'src') {
        // 源列表层：当前仓库下的源（水平滑动）；自定义仓库 = 只显示该仓库组的接口
        if (box) {
          var h = '';
          for (var i = 0; i < V.sources.length; i++) {
            var s = V.sources[i];
            if (V.curWh === '自定义') {
              if ((s.cat || '') !== '自定义') continue;
              if (V.customFocus && s.cg !== V.customFocus) continue;
            } else if ((s.cat || '综合影视') !== V.curWh) continue;
            var ok = isOk(s.api);
            var tag = ok === true ? '<i class="cnt ok">✔</i>' : (ok === false ? '<i class="cnt bad">✘</i>' : '');
            h += '<button class="chip' + (i === V.cur ? ' on' : '') + '" data-act="srcsel" data-i="' + i + '">' + UI.esc(s.name) + tag + '</button>';
          }
          if (!h) h = '<span class="empty-msg">这里还没有接口（可在「源管理」添加）</span>';
          box.innerHTML = h;
        }
      } else if (V.level === 'cls') {
        // 单接口分类内容层：srcCats = 可左右滑动的视频源标签（切换实时展示对应源内容）
        if (V.categoryFocus) {
          if (cats) {
            var hsc = '';
            for (var q = 0; q < V.sources.length; q++) {
              var sq = V.sources[q];
              if (!inCategoryFocus(sq)) continue;
              var okt = isOk(sq.api);
              var tg = okt === true ? '<i class="cnt ok">✔</i>' : (okt === false ? '<i class="cnt bad">✘</i>' : '');
              hsc += '<button class="chip' + (q === V.cur ? ' on' : '') + '" data-act="srcswitch" data-i="' + q + '">' + UI.esc(sq.name) + tg + '</button>';
            }
            if (!hsc) hsc = '<span class="empty-msg">该分类下暂无可用接口</span>';
            cats.innerHTML = hsc;
          }
        } else if (cats) cats.innerHTML = '';
        // 分类层：一级分类横排（源下的视频标签分类）
        if (box) {
          var h2 = '';
          for (var p = 0; p < V.parents.length; p++) {
            h2 += '<button class="chip' + (V.curParent === V.parents[p].id ? ' on' : '') + '" data-act="class" data-id="' + UI.esc(V.parents[p].id) + '">' + UI.esc(V.parents[p].name) + '</button>';
          }
          if (!h2) h2 = '<span class="empty-msg">这个源没有返回分类</span>';
          box.innerHTML = h2;
        }
      } else {
        if (box) box.innerHTML = '';
      }
    } catch (e) {}
  }

  /* ------------------------------------------------ 右侧/底部「源筛选」栏
     PC 固定右侧、移动端底部折叠；分类筛选 + 按测速结果排序 + 点击切源 */
  function updateDock() {
    try {
      var dock = $('srcDock');
      if (!dock) return;
      var noDock = (V.view === 'player') || (document.body && document.body.classList.contains('pl-full'));
      if (dock.classList) dock.classList.toggle('no-dock', noDock);
      var wrap = dock.parentNode;
      if (wrap && wrap.classList) wrap.classList.toggle('no-dock', noDock);
      if (noDock) return;

      var catsBox = $('dockCats'), listBox = $('dockList'), st = $('dockStatus');
      var cats = (V.cats && V.cats.length) ? V.cats.slice(0) : ['综合影视'];
      if (!V.dockCat || cats.indexOf(V.dockCat) < 0) {
        V.dockCat = (V.curCat && cats.indexOf(V.curCat) >= 0) ? V.curCat : cats[0];
      }
      if (catsBox) {
        var hc = '';
        for (var c = 0; c < cats.length; c++) {
          hc += '<button class="chip' + (V.dockCat === cats[c] ? ' on' : '') + '" data-act="dockcat" data-c="' + UI.esc(cats[c]) + '">' +
            UI.esc(cats[c]) + '<i class="cnt">' + catCount(cats[c]) + '</i></button>';
        }
        catsBox.innerHTML = hc;
      }
      if (listBox) {
        var idxs = [];
        for (var i = 0; i < V.sources.length; i++) {
          if ((V.sources[i].cat || '综合影视') === V.dockCat) idxs.push(i);
        }
        idxs.sort(function (a, b) {
          var ra = rankSrc(V.sources[a]), rb = rankSrc(V.sources[b]);
          if (ra !== rb) return ra - rb;
          var ma = (healthOf(V.sources[a].api) && healthOf(V.sources[a].api).ms) || 999999;
          var mb = (healthOf(V.sources[b].api) && healthOf(V.sources[b].api).ms) || 999999;
          return ma - mb;
        });
        var hl = '';
        for (var k = 0; k < idxs.length && k < 40; k++) {
          var idx = idxs[k], so = V.sources[idx];
          var hh = healthOf(so.api);
          var dot = hh ? (hh.ok ? 'ok' : 'bad') : '';
          var ms = (hh && hh.ok && hh.ms) ? (Math.round(hh.ms) + 'ms') : (hh && !hh.ok ? '失效' : '待测');
          hl += '<div class="dock-src' + (idx === V.cur ? ' on' : '') + '" data-act="dockuse" data-i="' + idx + '">' +
            '<span class="ds-dot ' + dot + '"></span>' +
            '<span class="ds-nm">' + UI.esc(so.name) + '</span>' +
            '<span class="ds-ms">' + ms + '</span>' +
            '</div>';
        }
        if (!hl) hl = '<div class="empty-msg">这个分类下暂无源</div>';
        listBox.innerHTML = hl;
      }
      if (st) st.textContent = V.checking ? (V.healthTxt || '正在测速…') : (V.healthTxt || ('共 ' + V.sources.length + ' 源'));
    } catch (e) {}
  }
  w.vUpdateDock = updateDock;

  /* -------------------------------------------------- 设置页控件实时绑定 */
  function bindSettingsInputs() {
    try {
      // 主题颜色
      ['cMain', 'cMain2', 'cGold', 'cBg'].forEach(function (id) {
        var el = $(id);
        if (!el || el.__bound) return;
        el.__bound = true;
        el.addEventListener('input', function () {
          var k = el.getAttribute('data-k');
          V.theme[k] = el.value;
          lset(K.theme, V.theme);
          applyTheme();
        });
      });
      // 全屏自动检测比例
      var ao = $('autoOri');
      if (ao && !ao.__bound) {
        ao.__bound = true;
        ao.addEventListener('change', function () {
          V.autoOri = !!ao.checked;
          lset('video_pl_auto_ori', V.autoOri);
          toast(V.autoOri ? '全屏自动检测比例：开（按视频比例自动横/竖屏）' : '全屏自动检测比例：关（点全屏时手动二选一）');
        });
      }
      // 背景浓度
      var op = $('bgOp');
      if (op && !op.__bound) {
        op.__bound = true;
        op.addEventListener('input', function () {
          V.bgOpacity = Math.max(0.05, Math.min(0.9, (parseInt(op.value, 10) || 35) / 100));
          lset(K.bgOp, V.bgOpacity);
          var lab = $('vBgOp'); if (lab) lab.textContent = Math.round(V.bgOpacity * 100) + '%';
          applyTheme();
        });
      }
      var f = $('bgFile');
      if (f && !f.__bound) { f.__bound = true; f.addEventListener('change', function () { if (f.files && f.files[0]) readBgImage(f.files[0]); }); }

      // 远程清单 URL（失焦时静默保存到 localStorage）
      var rurl = $('remoteUrl');
      if (rurl && !rurl.__bound) {
        rurl.__bound = true;
        rurl.addEventListener('change', function () {
          if (!w.SRCUPD) return;
          w.SRCUPD.setUrl(rurl.value);
          var rs = $('remoteStatus');
          if (rs) rs.textContent = w.SRCUPD.status();
        });
      }

      // 弹幕设置
      var dmOn = $('dmOn');
      if (dmOn && !dmOn.__bound) {
        dmOn.__bound = true;
        dmOn.addEventListener('change', function () { w.DM.cfg.on = !!dmOn.checked; w.DM.saveCfg(); w.DM.engine.applyCfg(); });
      }
      var bindRange = function (id, key, labId, fmt, save) {
        var el = $(id);
        if (!el || el.__bound) return;
        el.__bound = true;
        el.addEventListener('input', function () {
          var v = parseInt(el.value, 10) || 0;
          var val = save(v);
          w.DM.cfg[key] = val;
          w.DM.saveCfg();
          var lab = $(labId); if (lab) lab.textContent = fmt(val);
          w.DM.engine.applyCfg();
          w.DM.engine.relayout();
        });
      };
      bindRange('dmOp', 'opacity', 'vDmOp', function (v) { return Math.round(v * 100) + '%'; }, function (v) { return Math.max(0.2, v / 100); });
      bindRange('dmSp', 'speed', 'vDmSp', function (v) { return v + 'x'; }, function (v) { return Math.max(0.5, v / 10); });
      bindRange('dmSz', 'size', 'vDmSz', function (v) { return v + 'px'; }, function (v) { return v; });
      bindRange('dmAr', 'area', 'vDmAr', function (v) { return v + '%'; }, function (v) { return v; });
      var blk = $('dmBlock');
      if (blk && !blk.__bound) {
        blk.__bound = true;
        blk.addEventListener('change', function () { w.DM.cfg.block = String(blk.value || ''); w.DM.saveCfg(); toast('屏蔽词已保存'); });
      }
      var did = $('ddpId'), dsec = $('ddpSec');
      if (did) did.__bound = true;
      if (dsec) dsec.__bound = true;
    } catch (e) { err('设置页绑定失败：' + e.message); }
  }

  /* 背景图：压缩到最大 1280 宽再存 */
  function readBgImage(file) {
    try {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          try {
            var maxW = 1280;
            var sc = Math.min(1, maxW / (img.width || maxW));
            var cw = Math.max(1, Math.round((img.width || maxW) * sc));
            var ch = Math.max(1, Math.round((img.height || maxW) * sc));
            var cv = document.createElement('canvas');
            cv.width = cw; cv.height = ch;
            cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
            var data = cv.toDataURL('image/jpeg', 0.82);
            V.bgImage = data;
            lset(K.bg, data);
            applyTheme();
            toast('背景图已设置（已自动压缩）');
          } catch (e) { toast('背景图处理失败：' + e.message); }
        };
        img.onerror = function () { toast('这张图片读不出来，换一张试试'); };
        img.src = String(fr.result || '');
      };
      fr.onerror = function () { toast('读取图片失败'); };
      fr.readAsDataURL(file);
    } catch (e) { toast('上传失败：' + e.message); }
  }

  function pickBgFile() { var f = $('bgFile'); if (f) f.click(); else toast('请先选择图片'); }
  function clearBg() { V.bgImage = ''; try { localStorage.removeItem(K.bg); } catch (e) {} applyTheme(); toast('已清除背景图'); }

  /* ---------------------------------------------------------- 添加自定义源 */
  function addSourcesFromText(text, fromUrl) {
    var r = w.parseSourceJson(text);
    if (!r.ok) {
      if (/^https?:\/\//i.test(String(text || '').trim()) && !fromUrl) {
        var u = String(text).trim();
        toast('正在读取源配置…');
        fetch(u, { cache: 'no-store' }).then(function (res) { return res.text(); }).then(function (t) { addSourcesFromText(t, true); })
          .catch(function (e) { toast('读取失败：' + e.message); });
        return;
      }
      toast(r.msg || '解析失败');
      return;
    }
    var custom = ls(K.custom, []) || [];
    var added = 0;
    for (var i = 0; i < r.list.length; i++) {
      var dup = false;
      for (var k = 0; k < custom.length; k++) if (custom[k].api === r.list[i].api) { dup = true; break; }
      if (!dup) { custom.push({ name: r.list[i].name, api: r.list[i].api, cat: '自定义', kind: 'single' }); added++; }
    }
    lset(K.custom, custom);
    loadSources();
    renderChips();
    render();
    toast(added ? ('已添加 ' + added + ' 个源' + (r.tip ? '（' + r.tip + '）' : '')) : '这些源已经存在了');
  }

  function addByUrl() {
    var url = window.prompt('输入源 JSON 地址', 'https://');
    if (!url) return;
    addSourcesFromText(url.trim(), false);
  }

  function addByText() {
    var t = $('srcText');
    var txt = String((t && t.value) || '').trim();
    if (!txt) { toast('先把源 JSON 粘贴到输入框'); return; }
    addSourcesFromText(txt, false);
  }

  function testSource(i) {
    var s = V.sources[i];
    if (!s) return;
    toast('正在测速：' + s.name + ' …');
    var t0 = Date.now();
    API.classes(s.api).then(function (list) {
      toast(s.name + ' 可用：' + list.length + ' 个分类，用时 ' + ((Date.now() - t0) / 1000).toFixed(1) + ' 秒', 3000);
    }).catch(function (e) {
      toast(s.name + ' 不可用：' + e.message, 3200);
    });
  }

  var THEME_PRESETS = [
    { main: '#9B4DE8', main2: '#22D3EE', gold: '#F472B6', bg: '#0A0418' },
    { main: '#4F46E5', main2: '#22D3EE', gold: '#F472B6', bg: '#0B1026' },
    { main: '#9333EA', main2: '#F472B6', gold: '#FDE68A', bg: '#1B0A22' },
    { main: '#10B981', main2: '#34D399', gold: '#FBBF24', bg: '#04180F' },
    { main: '#B45309', main2: '#F59E0B', gold: '#FDE68A', bg: '#140F06' }
  ];

  function applyPreset(i) {
    var t = THEME_PRESETS[i];
    if (!t) return;
    V.theme = { main: t.main, main2: t.main2, gold: t.gold, bg: t.bg };
    lset(K.theme, V.theme);
    applyTheme(); render();
    toast('已切换配色');
  }

  function setCols(c) {
    V.cols = Math.max(3, Math.min(5, c || 3));
    lset(K.cols, V.cols);
    render();
    toast('海报墙：' + V.cols + ' 列');
  }

  function setCore(v) {
    V.playerCore = (v === 'hls' || v === 'native') ? v : 'auto';
    lset(K.core, V.playerCore);
    render();
    toast('播放内核：' + (V.playerCore === 'auto' ? '自动（hls.js ⇄ 系统播放器）' : V.playerCore));
  }

  function copyName() {
    try {
      var name = V.detail ? V.detail.item.name : '';
      if (!name) return;
      var ta = document.createElement('textarea');
      ta.value = name;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('已复制片名：' + name);
    } catch (e) { toast('复制失败：' + e.message); }
  }

  /* ---------------------------------------------------------------- 事件 */
  /* ================================================================
     底部导航板块（推荐 / 时间表 / 追番 / 我的 / 分类）
     ================================================================ */
  function switchTab(tab) {
    try {
      if (tab === 'com') {
        // 综合资源（巳泷 v9.0.1）：直接进入「综合资源接口」内容层
        V.tab = 'com';
        if (V.view === 'player') { if (w.PL) w.PL.destroy(); }
        V.quickView = '';
        V.view = 'home'; V.homeTab = '综合资源接口';
        enterCategoryFirst('综合资源接口');
        return;
      }
      if (tab === 'mgr') {
        // 源管理（巳泷 v9.0.1）
        V.tab = 'mgr';
        if (V.view === 'player') { if (w.PL) w.PL.destroy(); }
        setView('sources');
        return;
      }
      if (tab === 'sett') {
        // 设置（巳泷 v9.0.1）
        V.tab = 'sett';
        if (V.view === 'player') { if (w.PL) w.PL.destroy(); }
        setView('settings');
        return;
      }
      if (tab === 'cat') {
        // 分类：回到分类浏览（home）
        V.tab = 'cat';
        if (V.view === 'player') { if (w.PL) w.PL.destroy(); }
        V.quickView = '';
        if (V.level !== 'wh' && V.level !== '') { /* 保留当前分类层级 */ }
        setView('home');
        return;
      }
      if (tab === 'wh') {
        // 仓库（巳泷 v9.0.0）：直接展示主页仓库分类界面
        V.tab = 'wh';
        if (V.view === 'player') { if (w.PL) w.PL.destroy(); }
        V.quickView = '';
        V.view = 'home'; V.level = 'wh'; V.curWh = ''; V.homeTab = '仓库分类';
        buildWhs();
        render();
        return;
      }
      V.tab = tab;
      if (V.view === 'player') { if (w.PL) w.PL.destroy(); }
      V.view = 'home';
      V.quickView = '';
      loadBangumiSection(tab);
    } catch (e) { err('切换板块失败：' + e.message); }
  }
  w.vSwitchTab = switchTab;

  // 板块数据加载（推荐/时间表走 Bangumi，失败降级本地源；追番/我的为本地数据）
  function loadBangumiSection(tab) {
    try {
      if (tab === 'fav' || tab === 'mine') { render(); return; }
      V.bgState = V.bgState || {};
      var st = V.bgState[tab] || (V.bgState[tab] = {});
      if (st.loading) { render(); return; }
      st.loading = true; st.error = ''; st.data = [];
      render();
      if (tab === 'rec') {
        (w.BG ? w.BG.trending(30) : Promise.reject(new Error('BG 不可用'))).then(function (list) {
          st.loading = false; st.data = list || []; st.ok = true;
          if (!list || !list.length) { (w.BG.fallbackFill || fallbackFillFn)(st, 30); return; }
          render();
        }).catch(function (e) {
          st.loading = false; st.error = 'Bangumi 推荐暂时不可用：' + (e && e.message ? e.message : e);
          (w.BG.fallbackFill || fallbackFillFn)(st, 30);
        });
      } else if (tab === 'time') {
        (w.BG ? w.BG.calendar() : Promise.reject(new Error('BG 不可用'))).then(function (days) {
          st.loading = false; st.data = days || []; st.ok = true;
          render();
        }).catch(function (e) {
          st.loading = false; st.error = 'Bangumi 时间表暂时不可用：' + (e && e.message ? e.message : e);
          render();
        });
      }
    } catch (e) { err('板块加载失败：' + e.message); }
  }

  // Bangumi 推荐失败 → 用本地源最新内容填充（稳定版兜底）
  var fallbackFillFn = function (st, limit) {
    try {
      (w.BG ? w.BG.fallback(limit || 30) : Promise.resolve([])).then(function (items) {
        st.loading = false; st.fallback = true;
        st.data = items || [];
        if (st.error) st.error = '';
        render();
      }).catch(function () { st.loading = false; render(); });
    } catch (e) { st.loading = false; render(); }
  };
  w.BG = w.BG || {};
  w.BG.fallbackFill = fallbackFillFn;
  BG = w.BG;

  // 点击 Bangumi 条目：用片名做全局搜索（同 Kazumi 行为：Bangumi 条目 → 源内搜索 → 播放）
  function bgOpen(name) {
    try {
      var wd = String(name || '').trim();
      if (!wd) { toast('该条目没有名称'); return; }
      V.tab = 'cat';            // 搜索结果展示在「分类」搜索视图里
      V.gsAutoPlay = true;      // 点开即看：搜到首个命中自动打开详情（进而可播）
      doSearchWith(wd);
    } catch (e) { err('打开条目失败：' + e.message); }
  }
  w.vBgOpen = bgOpen;

  // 点开即看：全局搜索首条命中到达后自动进入详情
  function startAutoPlayPoll() {
    if (!V.gsAutoPlay) return;
    if (V._gaPlayT) clearInterval(V._gaPlayT);
    var deadline = Date.now() + 20000;   // 最多等 20s
    V._gaPlayT = setInterval(function () {
      try {
        if (!V.gsAutoPlay) { clearInterval(V._gaPlayT); return; }
        if (Date.now() > deadline) { clearInterval(V._gaPlayT); V.gsAutoPlay = false; return; }
        var g = (V.groups || []).filter(function (x) { return x && x.items && x.items.length; })[0];
        if (g && g.items && g.items.length) {
          clearInterval(V._gaPlayT);
          V.gsAutoPlay = false;
          openItem(g.items[0], g.items[0].srcIndex);
        }
      } catch (e) { clearInterval(V._gaPlayT); V.gsAutoPlay = false; }
    }, 400);
  }

  function doSearchWith(wd) {
    try {
      var inp = $('searchInput');
      if (inp) inp.value = wd;
      if (!V.sources.length) { toast('没有可用视频源'); return; }
      V.keyword = wd;
      V.searchEntries = buildSearchEntries(wd);
      V.gsDeadTried = false;
      V.gsSheet = null;
      globalSearch(wd);
      startAutoPlayPoll();
    } catch (e) { err('搜索失败：' + e.message); }
  }

  function onClick(ev) {
    try {
      var el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (!el) return;
      var act = el.getAttribute('data-act');
      var i = parseInt(el.getAttribute('data-i'), 10);
      var g = parseInt(el.getAttribute('data-g'), 10);
      var e = parseInt(el.getAttribute('data-e'), 10);

      if (act === 'tab') { switchTab(el.getAttribute('data-tab') || 'rec'); return; }
      else if (act === 'bgopen') { bgOpen(el.getAttribute('data-name') || ''); return; }
      else if (act === 'bgretry') { loadBangumiSection(V.tab); return; }
      else if (act === 'src') useSource(i);
      else if (act === 'test src') testSource(i);
      else if (act === 'class') {
        V.curParent = el.getAttribute('data-id');
        V.curSub = ''; V.autoSubTried = false;
        V.subs = V.childs[V.curParent] || [];
        loadList(1);
      }
      else if (act === 'sub') { V.curSub = el.getAttribute('data-id') || ''; V.autoSubTried = false; loadList(1); }
      else if (act === 'more') loadList((V.page || 1) + 1, true);
      else if (act === 'retry') {
        // 加载失败重试：分类失败重读分类；列表失败重读当前页
        if (V.level === 'cls' && curSource()) loadClasses(true);
        else if (V.view === 'home') loadList(V.page || 1);
        else render();
      }
      else if (act === 'cat') switchCat(el.getAttribute('data-c') || '综合影视');
      else if (act === 'catsfold') toggleCatsFold();
      else if (act === 'copysrc') copyText((V.sources[i] || {}).api || '', '已复制接口地址：' + ((V.sources[i] || {}).name || ''));
      else if (act === 'dropsrc') {
        var ds = V.sources[i];
        if (ds) {
          var yes = true;
          try { yes = window.confirm('从本机移除「' + ds.name + '」？\n（内置源会从列表隐藏，可随时恢复）'); } catch (e) { yes = true; }
          if (yes) dropSource(i);
        }
      }
      else if (act === 'restoresrc') restoreSource(el.getAttribute('data-api') || '');
      else if (act === 'checkall') startHealthCheck(true);
      // ===== 源筛选侧栏 / 每日更新 =====
      else if (act === 'docktoggle') {
        var dk = $('srcDock');
        if (dk && dk.classList) dk.classList.toggle('open');
      }
      else if (act === 'dockcat') {
        V.dockCat = el.getAttribute('data-c') || '';
        updateDock();
      }
      else if (act === 'dockuse') {
        var dk2 = $('srcDock');
        if (dk2 && dk2.classList) dk2.classList.remove('open');
        useSource(i);
      }
      else if (act === 'docktest') {
        startHealthCheck(true);
        toast('正在测速：可用 / 低延迟的源会自动排到前面', 2600);
      }
      else if (act === 'docksort') {
        sortSources();
        renderChips();
        updateDock();
        if (V.view === 'home' || V.view === 'sources') render();
        toast('已按测速结果重排：可用 / 低延迟优先，失效源归入「' + (w.VIDEO_DEAD_CAT || '失效区') + '」', 3000);
      }
      else if (act === 'healthsort') {
        try { localStorage.removeItem(K.health); } catch (e) {}
        startHealthCheck(true);
        toast('已清除测速结果，正在重新测速排序…', 2600);
      }
      else if (act === 'remoteupdate') {
        if (!w.SRCUPD) { toast('远程清单模块未加载'); return; }
        toast('正在拉取远程清单…', 1600);
        w.SRCUPD.updateNow().then(function () {
          updateDock();
          var rs = $('remoteStatus');
          if (rs) rs.textContent = w.SRCUPD.status();
        });
      }
      else if (act === 'remoteurlsave') {
        if (!w.SRCUPD) { toast('远程清单模块未加载'); return; }
        var ru = $('remoteUrl');
        var saved = w.SRCUPD.setUrl(ru ? ru.value : '');
        toast(saved ? '已保存远程清单地址（24 小时内自动检查更新）' : '已清空地址，使用内置默认合集', 3000);
        var rs2 = $('remoteStatus');
        if (rs2) rs2.textContent = w.SRCUPD.status();
      }
      else if (act === 'remoteclear') {
        if (!w.SRCUPD) { toast('远程清单模块未加载'); return; }
        w.SRCUPD.clear();
        toast('已清除远程缓存，恢复本地清单', 2600);
        updateDock();
        var rs3 = $('remoteStatus');
        if (rs3) rs3.textContent = w.SRCUPD.status();
      }
      else if (act === 'expandrepo') expandRepo(el.getAttribute('data-api') || '', el.getAttribute('data-name') || '');
      else if (act === 'copyrepo') copyText(el.getAttribute('data-api') || '', '已复制仓库地址');
      else if (act === 'srcfile') pickSourceFile();
      else if (act === 'fit') w.PL.setFit(el.getAttribute('data-v') || 'contain');
      else if (act === 'gsexact') { V.gsExact = !V.gsExact; if (V.keyword) globalSearch(V.keyword); }
      else if (act === 'gscat') {
        var cname = el.getAttribute('data-c') || '';
        if (el.getAttribute('data-all') === '1') V.gsCatsOn = null;
        else {
          if (!V.gsCatsOn) { V.gsCatsOn = {}; for (var cc = 0; cc < V.cats.length; cc++) V.gsCatsOn[V.cats[cc]] = true; }
          V.gsCatsOn[cname] = !V.gsCatsOn[cname];
        }
        if (V.keyword) globalSearch(V.keyword);
      }
      else if (act === 'gstag') {
        var tg = el.getAttribute('data-t') || '';
        var k2 = V.gsTags.indexOf(tg);
        if (k2 >= 0) V.gsTags.splice(k2, 1); else V.gsTags.push(tg);
        render();
      }
      else if (act === 'gstagclear') { V.gsTags = []; render(); }
      else if (act === 'add3') addSource3();
      else if (act === 'testnew') testNewSource();
      else if (act === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (act === 'open') openById(el.getAttribute('data-id'));
      else if (act === 'openq') {
        var ctx = el.getAttribute('data-ctx') || V.quickView || 'hist';
        var list = (ctx === 'fav') ? V.fav : V.hist;
        var it = list[i];
        if (it) openItem(it, it.srcIndex);
      }
      else if (act === 'gsmulti') { V.gsOnlyMulti = true; render(); }
      else if (act === 'gsall') { V.gsOnlyMulti = false; render(); }
      else if (act === 'gspending') {
        V.gsPending = !V.gsPending;
        toast(V.gsPending ? '已包含「待验证源」（搜索结果会更慢）' : '已排除「待验证源」');
        if (V.keyword) globalSearch(V.keyword);
      }
      else if (act === 'autosrc') autoSwitchSource();
      else if (act === 'fold') {
        var gg = V.groups[i];
        if (gg) { gg.open = !gg.open; render(); }
      }
      else if (act === 'usepick') {
        var grp = V.groups[i];
        var j = parseInt(el.getAttribute('data-j'), 10);
        var pick = grp && grp.items[j];
        if (!pick) { toast('该源条目不存在（重新搜索试试）'); return; }
        toast('已选择目标源：' + pick.srcName + '，正在打开…');
        openItem(pick, pick.srcIndex);
      }
      else if (act === 'from') switchFrom(g);
      else if (act === 'ep') { closeEpPanel(); playEp(e); }
      else if (act === 'epopen') openEpPanel();
      else if (act === 'epclose') closeEpPanel();
      else if (act === 'srcrepojump') jumpToRepo(el.getAttribute('data-api') || '', el.getAttribute('data-name') || '', false);
      else if (act === 'customrepojump') jumpToRepo('', el.getAttribute('data-name') || '', true);
      else if (act === 'srcjump') jumpToSource(parseInt(el.getAttribute('data-i'), 10), el.getAttribute('data-p') || '');
      else if (act === 'classjump') jumpToSource(parseInt(el.getAttribute('data-s'), 10), el.getAttribute('data-p') || '');
      else if (act === 'fav') toggleFav();
      else if (act === 'copynametip') copyName();
      else if (act === 'cntmore') { V.cntOpen = !V.cntOpen; render(); }
      else if (act === 'viewfav') { V.tab = 'cat'; V.quickView = 'fav'; V.view = 'home'; render(); }
      else if (act === 'viewhist') { V.tab = 'cat'; V.quickView = 'hist'; V.view = 'home'; render(); }
      else if (act === 'viewhome') { V.quickView = ''; render(); }
      else if (act === 'clearfav') { V.fav = []; lset(K.fav, V.fav); render(); toast('已清空收藏'); }
      else if (act === 'clearhist') { V.hist = []; lset(K.hist, V.hist); render(); toast('已清空观看记录'); }
      else if (act === 'gotocat') { switchTab('cat'); }
      else if (act === 'toviewsources') { V.tab = 'cat'; setView('sources'); }
      else if (act === 'toviewsettings') { V.tab = 'cat'; setView('settings'); }
      else if (act === 'tocols') { V.tab = 'cat'; setView('settings'); toast('在「布局」里选择海报墙列数'); }
      else if (act === 'cols') setCols(i);
      else if (act === 'core2') setCore(el.getAttribute('data-v'));
      else if (act === 'back') goBack();
      else if (act === 'sources') setView('sources');
      else if (act === 'settings' || act === 'theme') setView('settings');
      else if (act === 'usesrc') useSource(i);
      else if (act === 'delsrc') removeCustom(i);
      // ===== 四级层级导航 =====
      else if (act === 'wh') openWh(el.getAttribute('data-wh') || '');
      else if (act === 'hometab') switchHomeTab(el.getAttribute('data-c') || '综合资源接口');
      else if (act === 'homerepo') openRepo(el.getAttribute('data-api') || '', el.getAttribute('data-name') || '');
      else if (act === 'customrepo') openCustomRepo(el.getAttribute('data-name') || '');
      else if (act === 'customsingle') openCustomSingle(el.getAttribute('data-i') || '0');
      else if (act === 'pickchild') pickRepoChild(el.getAttribute('data-i') || '0');
      else if (act === 'closereposheet') closeRepoSheet();
      else if (act === 'deadzone') openWh(w.VIDEO_DEAD_CAT || '失效区');
      else if (act === 'uplevel') upLevel();
      else if (act === 'srcsel') { enterSource(parseInt(el.getAttribute('data-i'), 10)); }
      else if (act === 'srcswitch') switchSourceAt(parseInt(el.getAttribute('data-i'), 10));
      else if (act === 'enterwhsrc') { enterSource(parseInt(el.getAttribute('data-i'), 10)); }
      // ===== 全局搜索筛选 =====
      else if (act === 'gsfilter') { V.gsFilterOpen = !V.gsFilterOpen; render(); }
      else if (act === 'gsopen') { V.gsSheet = parseInt(el.getAttribute('data-i'), 10); render(); }
      else if (act === 'gsclose') { V.gsSheet = null; render(); }
      // ===== 播放器：全屏方向 / 裁剪 =====
      else if (act === 'fsopts') w.PL.openFsOpts();
      else if (act === 'fsp') w.PL.enterFull(el.getAttribute('data-m') || 'landscape');
      else if (act === 'fscancel') w.PL.closeFsOpts();
      else if (act === 'crop') w.PL.setCrop(el.getAttribute('data-v') || 'off');
      else if (act === 'addsrc') addByText();
      else if (act === 'addsrcurl') addByUrl();
      else if (act === 'bgpick') pickBgFile();
      else if (act === 'bgclear') clearBg();
      else if (act === 'preset') applyPreset(i);
      else if (act === 'cachemode') {
        // v9.8.0：缓存四档。切换后立即生效，已有缓存按新策略判断过期。
        V.cacheMode = el.getAttribute('data-v') || '7d';
        try { localStorage.setItem('video_cache_mode', JSON.stringify(V.cacheMode)); } catch (e) {}
        toast('缓存策略：' + ({'7d':'7 天后清除','30d':'30 天后清除','never':'从不缓存','forever':'永远缓存'}[V.cacheMode] || V.cacheMode));
        render();
      }
      else if (act === 'clearcache') {
        try { if (w.API && w.API.clearCache) w.API.clearCache(); } catch (e) {}
        try { if (w.CACHE && w.CACHE.clear) w.CACHE.clear(); } catch (e) {}
        toast('视频接口缓存已清空');
      }
      else if (act === 'saveddp') saveDdp();
      else if (act === 'dmsearch2') { setView('home'); toast('弹幕搜索在播放页里用（点「弹幕搜索」）'); }
      // 播放器
      else if (act === 'pp') w.PL.togglePlay();
      else if (act === 'seek') {
        var sdr = el.getAttribute('data-dir'), slv = parseInt(el.getAttribute('data-lvl'), 10);
        if (w.PL && w.PL.secVal) w.PL.seekBy((sdr === 'back' ? -1 : 1) * w.PL.secVal(sdr, slv));
      }
      else if (act === 'frames') { document.body.classList.toggle('pl-frames-on'); }
      else if (act === 'backframe') { if (w.PL && w.PL.seekFrame) w.PL.seekFrame(-1); }
      else if (act === 'fwdframe') { if (w.PL && w.PL.seekFrame) w.PL.seekFrame(1); }
      else if (act === 'skipset') {
        var sv = el.getAttribute('data-v') || 'off';
        if (sv === 'off') { if (w.PL) w.PL.setSkip(false, 0); toast('自动快进已关闭'); }
        else if (sv === 'custom') { var ni2 = $('plSkipN'); if (ni2) ni2.focus(); toast('输入秒数后点「确定」'); return; }
        else { if (w.PL) w.PL.setSkip(true, parseFloat(sv) || 0); toast('自动快进：' + sv + ' 秒（下次打开视频生效）'); }
        refreshPlTune();
      }
      else if (act === 'skipgo') {
        var nv = parseFloat((function (x) { var e2 = $('plSkipN'); return e2 ? e2.value : ''; })());
        if (!isFinite(nv) || nv <= 0) { toast('请输入大于 0 的秒数'); return; }
        nv = Math.min(3600, nv);
        if (w.PL) w.PL.setSkip(true, nv);
        toast('自动快进：' + nv + ' 秒（下次打开视频生效）');
        refreshPlTune();
      }
      else if (act === 'fs') w.PL.toggleFull();
      else if (act === 'core') w.PL.cycleCore();
      else if (act === 'ext') w.PL.openExternal();
      else if (act === 'dmtoggle') w.PL.toggleDm();
      else if (act === 'dmsend') w.PL.sendDm();
      else if (act === 'dmsearch') dmSearch();
      else if (act === 'dmsetapi') dmSetApi();
      else if (act === 'dmclose') { var p = $('dmPanel'); if (p) p.hidden = true; }
      else if (act === 'dmsaveapi') {
        var inp = document.getElementById('dmApiInput');
        if (inp && w.DM && w.DM.saveCustom) { w.DM.saveCustom(inp.value.trim()); try { w.vToast('弹幕 API 已保存'); } catch (e) {} }
        var pp = $('dmPanel'); if (pp) pp.hidden = true;
      }
      else if (act === 'dmpick') pickOnlineDm(el.getAttribute('data-eid'), el.getAttribute('data-name') || '');
      else if (act === 'prevep') playEp((V.detail && V.detail.playing ? V.detail.playing.e : 0) - 1);
      else if (act === 'nextep') playEp((V.detail && V.detail.playing ? V.detail.playing.e : 0) + 1);
    } catch (ex) { err('点击处理失败：' + ex.message); }
  }

  /* 全屏暂停面板：仅刷新自动快进的选中态（不重建整行，避免音量/明暗绑定丢失） */
  function refreshPlTune() {
    try {
      var row = $('plTuneRow');
      if (!row) return;
      var sk = (w.PL && w.PL.skipCfg) ? w.PL.skipCfg() : { on: false, sec: 0 };
      var is25 = sk.on && sk.sec === 25, is10 = sk.on && sk.sec === 10, isCus = sk.on && !is25 && !is10;
      var chips = row.querySelectorAll('[data-act="skipset"]');
      for (var i = 0; i < chips.length; i++) {
        var v = chips[i].getAttribute('data-v');
        chips[i].classList.toggle('on', (v === 'off' && !sk.on) || (v === '25' && is25) || (v === '10' && is10) || (v === 'custom' && isCus));
      }
      var ni = row.querySelector('#plSkipN');
      if (ni && sk.on && sk.sec) ni.value = String(sk.sec);
    } catch (e) {}
  }

  /* 通用数字输入弹层：用于长按自定义快进退档位秒数等 */
  var plCfgBox = null;
  function askNum(title, cur, cb) {
    try {
      if (!plCfgBox) {
        plCfgBox = document.createElement('div');
        plCfgBox.className = 'pl-cfg-mask';
        plCfgBox.innerHTML = '<div class="pl-cfg-box">' +
          '<div class="pl-cfg-title"></div>' +
          '<input type="number" id="plCfgNum" class="tune-num" min="1" max="3600" value="" style="width:100%;box-sizing:border-box">' +
          '<div class="row2"><button class="wide-btn" data-act="plcfgyes">确定</button>' +
          '<button class="wide-btn" data-act="plcfgno">取消</button></div></div>';
        plCfgBox.addEventListener('click', function (ev) {
          try {
            var t = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
            if (!t) return;
            var a = t.getAttribute('data-act');
            if (a === 'plcfgyes') {
              var v = plCfgBox.querySelector('#plCfgNum').value;
              plCfgBox.style.display = 'none';
              var c = plCfgBox.__cb; plCfgBox.__cb = null;
              if (c) c(v);
            } else if (a === 'plcfgno') {
              plCfgBox.style.display = 'none'; plCfgBox.__cb = null;
            }
          } catch (e) {}
        });
        document.body.appendChild(plCfgBox);
      }
      plCfgBox.querySelector('.pl-cfg-title').textContent = title;
      plCfgBox.querySelector('#plCfgNum').value = cur;
      plCfgBox.__cb = cb;
      plCfgBox.style.display = 'flex';
    } catch (e) {}
  }
  w.askNum = askNum;

  function saveDdp() {
    var a = $('ddpId'), b = $('ddpSec');
    w.DM.ddp.appId = String((a && a.value) || '').trim();
    w.DM.ddp.appSecret = String((b && b.value) || '').trim();
    w.DM.saveDdp();
    toast(w.DM.ddpReady() ? '弹弹play 密钥已保存，播放页「弹幕搜索」现在可用' : '密钥已清空（只用本地弹幕）');
  }

  /* ---------------------------------------------------------------- 启动 */
  function boot() {
    try {
      V.theme = ls(K.theme, V.theme) || V.theme;
      V.bgImage = ls(K.bg, '') || '';
      V.bgOpacity = parseFloat(ls(K.bgOp, 0.35));
      if (!isFinite(V.bgOpacity)) V.bgOpacity = 0.35;
      V.cols = parseInt(ls(K.cols, 3), 10) || 3;
      V.cols = Math.max(3, Math.min(5, V.cols));
      V.playerCore = ls(K.core, 'auto') || 'auto';
      // 巳泷 v9.1.0：全屏默认「自动选择」（按视频比例自动横/竖屏）；用户可在设置里改回手动二选一
      V.autoOri = ls('video_pl_auto_ori', true) === true;
      V.fav = ls(K.fav, []) || [];
      V.hist = ls(K.hist, []) || [];
      w.DM.loadCfg();
      w.DM.loadDdp();
      applyTheme();

      loadSources();
      V.catsMode = (ls('video_cats_mode', 'row') === 'drawer') ? 'drawer' : 'row';
      sortSources();            // 先用上次检测结果排序：可用源在前，失效源归入「失效区」
      healthSummary();
      applyCatsFold();
      renderChips();
      log('BOOT', '影视乐园启动｜源=' + V.sources.length + '｜仓库=' + V.whs.length + '｜内核=' + V.playerCore + '｜列数=' + V.cols);

      var back = $('backBtn');
      if (back) back.addEventListener('click', function () { goBack(); });
      var si = $('searchInput');
      if (si) si.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.keyCode === 13) { ev.preventDefault(); doSearch(); } });
      var src = $('srcBtn');
      if (src) src.addEventListener('click', function () { switchTab('wh'); });
      var th = $('themeBtn');
      if (th) th.addEventListener('click', function () { setView('settings'); });

      document.addEventListener('click', onClick);
      var tabBar = $('vTabs');
      if (tabBar) tabBar.addEventListener('click', function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest('.vt') : null;
        if (!t) return;
        switchTab(t.getAttribute('data-tab') || 'rec');
      });
      window.addEventListener('error', function (ev) { err('页面错误：' + (ev && ev.message)); });
      window.addEventListener('unhandledrejection', function (ev) {
        var r = ev && ev.reason;
        err('未处理异常：' + ((r && r.message) ? r.message : r));
      });
      window.addEventListener('resize', function () { try { w.DM.engine.relayout(); } catch (e) {} });

      // 每次打开强制检测一次；之后每小时自动检测一次（实时持续，永不停止）
      setTimeout(function () { startHealthCheck(true); }, 800);
      setInterval(function () { startHealthCheck(true); }, 3600 * 1000);

      // 每日远程清单：启动后检查上次更新时间，超过 24 小时自动拉取（失败静默回退本地）
      setTimeout(function () {
        try { if (w.SRCUPD && w.SRCUPD.checkDaily) w.SRCUPD.checkDaily(); } catch (e) {}
        updateDock();
      }, 1600);

      // v9.9.0：默认直接进入「综合资源」海报墙；仓库改由右上角仓库按钮进入
      buildWhs();
      switchTab('com');
      // 后台预载其它分类内容（仅预载不切换视图）
      setTimeout(function () { preloadHomeData(); }, 1200);
    } catch (e) { err('启动失败：' + e.message); }
  }

  w.closePanels = function () { goBack(); };
  w.vIsOk = isOk;
  w.vSortSources = sortSources;
  // 远程清单更新后重载源列表（保持当前视图，不刷新页面）
  w.vSourcesUpdated = function () {
    try {
      loadSources();
      sortSources();
      healthSummary();
      renderChips();
      updateDock();
      if (V.view === 'home' || V.view === 'sources' || V.view === 'settings') render();
    } catch (e) { err('重载源失败：' + e.message); }
  };
  w.vBuildWhs = buildWhs;
  w.vOpenWh = openWh;
  w.vUpLevel = upLevel;
  w.vEnterSource = enterSource;
  w.vHealthCheck = startHealthCheck;
  // 返回模块主页：直接回仓库层（供底部导航「返回」弹窗调用）
  w.vGoHome = function () {
    try {
      V.level = 'wh'; V.curWh = ''; V.quickView = ''; V.gsSheet = null;
      if (w.PL && w.PL.isFull && w.PL.isFull()) { w.PL.exitFull(); }
      setView('home');
    } catch (e) {}
  };
  w.vRefresh = function () {
    try {
      if (V.view === 'home') {
        if (V.level === 'cls' && curSource()) loadClasses(true);
        else render();
      } else render();
    } catch (e) { render(); }
  };
  w.vOpenItem = openItem;      // 供调试/测试直接打开某条内容
  w.vAutoSwitchSource = autoSwitchSource;
  w.vMaybeLoadMore = maybeLoadMore;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window);