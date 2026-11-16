/* ==========================================================================
   巳泷文游 · 创世工坊核心（2026-11-12 织网融合版）
   本地优先：全部资料存 localStorage（sl_oc_worlds_v1），图片压缩后内嵌，
   可整体导出/导入 JSON。剧情编排见 oc-story.js，高级地图见 oc-map.js。
   ========================================================================== */
(function () {
  'use strict';
  var LS = 'sl_oc_worlds_v1';
  var S = { worlds: [], cur: null, tab: 'hub', sub: '', sel: null, kw: '', busy: false };
  var $ = function (id) { return document.getElementById(id); };
  var view = $('view'), modal = $('modal');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toast(t) {
    var el = $('toast'); if (!el) return;
    el.textContent = t; el.classList.add('on');
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  function uid(p) { return (p || 'e') + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function now() { return Date.now(); }
  function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }
  function firstChar(s) { return String(s || '?').slice(0, 1); }

  var LISTS = ['chars', 'rels', 'factions', 'places', 'events', 'lore', 'worldbook',
    'species', 'flora', 'foods', 'items', 'economy', 'faith', 'society', 'tech',
    'careers', 'powers', 'langs', 'audio', 'stories', 'chapters', 'drafts', 'comms',
    'cards', 'materials', 'notes', 'deriv', 'merch', 'plans', 'conflicts', 'infos', 'logistics',
    /* V10 宇宙 / 文明 / 法则 三层扩展 */
    'cosmos', 'celestial', 'rules', 'timeline', 'regions', 'climate', 'ecosystem',
    'law', 'military', 'education', 'arts', 'lineage', 'titles', 'divinity', 'curse',
    'quests', 'secrets', 'disasters'];

  function blankWorld(name) {
    var w = {
      id: uid('w'), name: name || '未命名世界', tagline: '', desc: '', genre: '幻想',
      accent: ['#7c3aed', '#22d3ee'], cover: '', calendar: '', era: '',
      created: now(), updated: now()
    };
    LISTS.forEach(function (k) { w[k] = []; });
    w.map = { theme: 'paper', bg: '', view: { z: 1, x: 0, y: 0 }, markers: [], links: [], regions: [] };
    w.run = { pop: 0, morale: 60, deaths: 0, celebs: 0, food: 50, water: 50, wood: 50, iron: 50, gold: 50, log: [] };
    w.graphPos = {};
    return w;
  }

  function ensureWorld(w) {
    if (!w || typeof w !== 'object') return blankWorld('');
    LISTS.forEach(function (k) { if (!Array.isArray(w[k])) w[k] = []; });
    if (!Array.isArray(w.rels)) w.rels = [];
    if (!w.map || typeof w.map !== 'object') w.map = {};
    if (!Array.isArray(w.map.markers)) w.map.markers = [];
    if (!Array.isArray(w.map.links)) w.map.links = [];
    if (!Array.isArray(w.map.regions)) w.map.regions = [];
    if (!w.map.view) w.map.view = { z: 1, x: 0, y: 0 };
    if (!w.map.theme) w.map.theme = 'paper';
    if (!w.run || typeof w.run !== 'object') w.run = {};
    ['pop', 'deaths', 'celebs'].forEach(function (k) { if (typeof w.run[k] !== 'number') w.run[k] = typeof w[k] === 'number' ? w[k] : 0; });
    if (typeof w.run.morale !== 'number') w.run.morale = typeof w.morale === 'number' ? w.morale : 60;
    ['food', 'water', 'wood', 'iron', 'gold'].forEach(function (k) { if (typeof w.run[k] !== 'number') w.run[k] = 50; });
    if (!Array.isArray(w.run.log)) w.run.log = Array.isArray(w.log) ? w.log : [];
    // 旧版兼容
    if (!w.items.length && Array.isArray(w.gear)) {
      w.items = w.gear.map(function (g) { return { id: g.id || uid('i'), name: g.name || '', type: g.type || '', desc: g.desc || '', img: g.img || '' }; });
    }
    if (!w.careers.length && Array.isArray(w.career)) {
      w.careers = w.career.map(function (g) { return { id: g.id || uid('c'), name: g.name || '', desc: g.desc || '', img: g.img || '' }; });
    }
    if (!w.graphPos || typeof w.graphPos !== 'object') w.graphPos = {};
    if (!w.tags) w.tags = [];
    try { if (window.SL_SIM && SL_SIM.ensure) SL_SIM.ensure(w); } catch (e) {}
    return w;
  }

  function load() {
    try { S.worlds = JSON.parse(localStorage.getItem(LS) || '[]') || []; } catch (e) { S.worlds = []; }
    if (!Array.isArray(S.worlds)) S.worlds = [];
    S.worlds.forEach(ensureWorld);
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(S.worlds)); }
    catch (e) { toast('保存失败：本地空间不足，请先导出备份或压缩图片'); }
  }
  function findWorld(id) {
    for (var i = 0; i < S.worlds.length; i++) if (String(S.worlds[i].id) === String(id)) return S.worlds[i];
    return null;
  }
  function cur() { return S.cur; }
  function touch() { if (S.cur) { S.cur.updated = now(); save(); } }

  /* ---------------- 图片压缩上传 ---------------- */
  var formImg = '';
  function pickImg(cb, max) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      readImg(f, max || 720, cb);
    };
    inp.click();
  }
  function readImg(file, max, cb) {
    if (!/^image\//.test(file.type || '')) { toast('请选择图片文件'); return; }
    if (file.size > 18 * 1024 * 1024) { toast('图片太大，请先压缩到 18MB 以内'); return; }
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.width || 1, h = img.height || 1;
          var sc = Math.min(1, (max || 720) / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
          var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
          var ctx = cv.getContext('2d');
          ctx.fillStyle = '#120c20'; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          cb(cv.toDataURL('image/jpeg', 0.78));
        } catch (e) { toast('图片处理失败，换一张试试'); }
      };
      img.onerror = function () { toast('图片读取失败'); };
      img.src = String(r.result || '');
    };
    r.onerror = function () { toast('图片读取失败'); };
    r.readAsDataURL(file);
  }
  function imgUrl(u) { return String(u || '').replace(/"/g, '&quot;'); }

  /* ---------------- AI（与主页共用内置 API） ---------------- */
  function getCfg() {
    var d = { base: '', key: '', model: '', temp: 0.9 };
    try {
      var A = window.SL_API || window.SL_API_NV;
      if (A) { d.base = SL_D(A.b || ''); d.key = SL_D((A.k && A.k[0]) || ''); d.model = SL_D(A.m || ''); }
    } catch (e) {}
    try { var s = JSON.parse(localStorage.getItem('sl_story_cfg_v1') || '{}'); for (var k in s) { if (s[k]) d[k] = s[k]; } } catch (e) {}
    return d;
  }
  function apiUrl(base) {
    var b = String(base || '').replace(/\/+$/, '');
    if (!/\/v\d+$/.test(b)) b += '/v1';
    return b + '/chat/completions';
  }
  function chat(messages, opt) {
    opt = opt || {};
    var c = getCfg();
    if (!c.base || !c.key) return Promise.reject(new Error('还没有配置 API'));
    var custom = false;
    try { var __cc = JSON.parse(localStorage.getItem('sl_story_cfg_v1') || '{}'); custom = !!__cc.key; } catch (e) {}
    if (!custom && window.SL_AI_LIMIT && !window.SL_DEV) {
      var __q = SL_AI_LIMIT.take();
      if (!__q.ok) return Promise.reject(new Error('内置 API 请求已达上限，请等待冷却或填写自己的 Key'));
    }
    var body = JSON.stringify({
      model: c.model || 'agnes-3.0-flash', messages: messages,
      temperature: opt.temp != null ? opt.temp : (parseFloat(c.temp) || 0.9),
      max_tokens: opt.max || 1800, stream: false
    });
    var url = apiUrl(c.base), tries = [];
    if (/^https?:$/.test(location.protocol) && /^(localhost|127\.0\.0\.1)$/i.test(location.hostname)) tries.push('/api?url=' + encodeURIComponent(url));
    tries.push(url);
    var idx = 0;
    function attempt() {
      if (idx >= tries.length) return Promise.reject(new Error('网络请求失败，请检查 API 或网络'));
      var u = tries[idx++], ctl = new AbortController();
      var timer = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 90000);
      return fetch(u, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.key },
        body: body, signal: ctl.signal
      }).then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) {
        var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (!t) throw new Error('API 返回空内容');
        return t;
      }).catch(function (e) { clearTimeout(timer); return attempt(); });
    }
    return attempt();
  }
  function parseJson(txt) {
    var s = String(txt || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    var a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try { return JSON.parse(s.slice(a, b + 1)); } catch (e) {}
      try { return JSON.parse(s.slice(a, b + 1).replace(/,\s*([}\]])/g, '$1')); } catch (e) {}
    }
    return null;
  }

  /* ---------------- 世界列表 ---------------- */
  function accent(c) { return c && c.length === 2 ? c : ['#7c3aed', '#22d3ee']; }
  function renderWorlds() {
    document.body.setAttribute('data-view', 'worlds');
    $('tabs').hidden = true;
    var h = '<div class="bar"><h2>我的创世世界</h2><span class="cnt">' + S.worlds.length + ' 个</span><div class="sp"></div>' +
      '<button class="btn pri" data-a="newWorld">＋ 新建世界</button></div>';
    if (!S.worlds.length) {
      h += '<div class="empty"><b>把你的角色、关系与世界观，织成一张网</b>角色、势力、地点、地图、剧情、图鉴与互动小说，全部收在一个世界里。<br><br>' +
        '<button class="btn pri" data-a="newWorld">创建第一个世界</button></div>';
    } else {
      h += '<div class="worlds">' + S.worlds.slice().sort(function (a, b) { return b.updated - a.updated; }).map(function (w) {
        var c = accent(w.accent);
        var chs = (w.chapters || []).length, eps = 0;
        (w.chapters || []).forEach(function (ch) { eps += (ch.episodes || []).length; });
        return '<div class="wcard">' +
          '<div class="cv' + (w.cover ? ' hasimg' : '') + '" style="--c1:' + c[0] + ';--c2:' + c[1] + (w.cover ? ';background-image:url(' + imgUrl(w.cover) + ')' : '') + '">' +
          '<b>' + esc(firstChar(w.name)) + '</b></div>' +
          '<div class="bd"><h3>' + esc(w.name) + '</h3>' +
          '<p>' + esc(w.tagline || w.desc || '一个等待被写下去的世界。') + '</p>' +
          '<div class="wtags"><span>' + (w.chars || []).length + ' 角色</span><span>' + (w.factions || []).length + ' 势力</span><span>' + chs + ' 章</span><span>' + eps + ' 话</span></div>' +
          '<div class="ft"><button data-a="open" data-id="' + esc(w.id) + '">进入工坊</button>' +
          '<button class="gh" data-a="exportWorld" data-id="' + esc(w.id) + '">导出</button>' +
          '<button class="gh" data-a="delWorld" data-id="' + esc(w.id) + '">删除</button></div></div></div>';
      }).join('') + '</div>';
    }
    view.innerHTML = h;
  }

  /* ---------------- 编辑器外壳 ---------------- */
  var TABS = [
    { id: 'hub', name: '中枢' }, { id: 'cosmos', name: '宇宙' }, { id: 'world', name: '世界' },
    { id: 'society', name: '文明' }, { id: 'laws', name: '法则' }, { id: 'codex', name: '图鉴' },
    { id: 'chars', name: '角色' }, { id: 'rels', name: '关系' }, { id: 'story', name: '剧情' },
    { id: 'sim', name: '推演' }, { id: 'run', name: '运行' }, { id: 'map', name: '地图' },
    { id: 'items', name: '物品' }, { id: 'create', name: '创作' }, { id: 'events', name: '事件' },
    { id: 'lore', name: '百科' }, { id: 'stats', name: '统计' }
  ];
  function renderEditor() {
    if (window.SL_SIM && SL_SIM.stopTimer) SL_SIM.stopTimer();
    document.body.setAttribute('data-view', 'editor');
    $('tabs').hidden = false;
    $('tabs').innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (S.tab === t.id ? ' on' : '') + '" data-tab="' + t.id + '">' + t.name + '</button>';
    }).join('');
    var w = cur();
    if (!w) return renderWorlds();
    var h = '';
    if (S.tab === 'hub') h = hubView(w);
    else if (S.tab === 'story' && window.SLOC && SLOC.storyView) h = SLOC.storyView(w);
    else if (S.tab === 'sim' && window.SL_SIM && SL_SIM.view) h = SL_SIM.view(w);
    else if (S.tab === 'map' && window.SLOC && SLOC.mapView) h = SLOC.mapView(w);
    else if (S.tab === 'run') h = runView(w);
    else if (S.tab === 'chars') h = charsView(w);
    else if (S.tab === 'rels') h = relsView(w);
    else if (S.tab === 'world') h = worldView(w);
    else if (S.tab === 'codex') h = codexView(w);
    else if (S.tab === 'cosmos') h = cosmosView(w);
    else if (S.tab === 'society') h = societyView(w);
    else if (S.tab === 'laws') h = lawsView(w);
    else if (S.tab === 'items') h = itemsView(w);
    else if (S.tab === 'create') h = createView(w);
    else if (S.tab === 'events') h = eventsView(w);
    else if (S.tab === 'lore') h = loreView(w);
    else if (S.tab === 'stats') h = statsView(w);
    else h = hubView(w);
    view.innerHTML = h;
    if (S.tab === 'rels') setTimeout(function () { drawGraph(w); }, 30);
  }

  var HUB = [
    { group: '宇宙与法则', items: [
      { label: '宇宙与位面', icon: '🌌', tab: 'cosmos', sub: 'cosmos' },
      { label: '天体与星象', icon: '🪐', tab: 'cosmos', sub: 'celestial' },
      { label: '世界法则', icon: '📐', tab: 'laws', sub: 'rules' },
      { label: '纪元年表', icon: '⏳', tab: 'laws', sub: 'timeline' },
      { label: '灾变与天灾', icon: '🌋', tab: 'laws', sub: 'disasters' },
      { label: '任务与委托', icon: '📜', tab: 'laws', sub: 'quests' },
      { label: '隐秘与真相', icon: '🕯', tab: 'laws', sub: 'secrets' }
    ]},
    { group: '角色与关系', items: [
      { label: '角色库', icon: '👤', tab: 'chars' }, { label: '形象档案', icon: '🎭', tab: 'chars' },
      { label: '关系网络', icon: '🔗', tab: 'rels' }, { label: '羁绊恩怨', icon: '💞', tab: 'rels' },
      { label: '角色历程', icon: '🧭', tab: 'events' }, { label: '角色通讯', icon: '📱', tab: 'create', sub: 'comms' }
    ]},
    { group: '世界建设', items: [
      { label: '组织势力', icon: '🏛', tab: 'world', sub: 'factions' }, { label: '地点城邦', icon: '📍', tab: 'world', sub: 'places' },
      { label: '地理环境', icon: '🌍', tab: 'world', sub: 'places' }, { label: '世界地图', icon: '🗺', tab: 'map' },
      { label: '世界运行', icon: '⚙️', tab: 'run' }, { label: '世界推演', icon: '🧬', tab: 'sim' },
      { label: '世界总纲', icon: '📜', tab: 'lore', sub: 'lore' }, { label: '世界百科', icon: '📖', tab: 'lore', sub: 'lore' }, { label: '世界书', icon: '📚', tab: 'lore', sub: 'worldbook' },
      { label: '思维导图', icon: '🕸', tab: 'rels' },
      { label: '大区与地形', icon: '⛰', tab: 'cosmos', sub: 'regions' },
      { label: '气候与季风', icon: '🌦', tab: 'cosmos', sub: 'climate' },
      { label: '生态链', icon: '🔗', tab: 'cosmos', sub: 'ecosystem' },
      { label: '血脉与家族', icon: '🩸', tab: 'society', sub: 'lineage' },
      { label: '称号与爵位', icon: '🎖', tab: 'society', sub: 'titles' },
      { label: '律法与制度', icon: '⚖️', tab: 'society', sub: 'law' },
      { label: '军备与战争', icon: '🛡', tab: 'society', sub: 'military' },
      { label: '教育与学派', icon: '🎓', tab: 'society', sub: 'education' },
      { label: '艺术与娱乐', icon: '🎨', tab: 'society', sub: 'arts' },
      { label: '神格与神系', icon: '✨', tab: 'laws', sub: 'divinity' },
      { label: '诅咒与禁忌', icon: '🚫', tab: 'laws', sub: 'curse' }
    ]},
    { group: '设定体系', items: [
      { label: '能力体系', icon: '⚡', tab: 'codex', sub: 'powers' }, { label: '自然与物种', icon: '🌿', tab: 'codex', sub: 'species' },
      { label: '草药植物', icon: '🌱', tab: 'codex', sub: 'flora' }, { label: '食物饮品', icon: '🍵', tab: 'codex', sub: 'foods' },
      { label: '经济与货币', icon: '💰', tab: 'items', sub: 'economy' }, { label: '意识与信仰', icon: '🔮', tab: 'codex', sub: 'faith' },
      { label: '社会与文明', icon: '👥', tab: 'codex', sub: 'society' }, { label: '科技与知识', icon: '🔬', tab: 'codex', sub: 'tech' },
      { label: '职业与生涯', icon: '💼', tab: 'codex', sub: 'careers' }, { label: '文字与语言', icon: '🈶', tab: 'codex', sub: 'langs' }
    ]},
    { group: '物品与创作', items: [
      { label: '装备与收藏', icon: '🎒', tab: 'items', sub: 'items' }, { label: '道具信物', icon: '🗝', tab: 'items', sub: 'items' },
      { label: '剧情线', icon: '🧵', tab: 'story', sub: 'stories' }, { label: '故事集', icon: '📕', tab: 'story', sub: 'stories' },
      { label: '章节编排', icon: '🎬', tab: 'story', sub: 'chapters' }, { label: '稿件库', icon: '🗂', tab: 'create', sub: 'drafts' },
      { label: '素材库', icon: '🗃', tab: 'create', sub: 'materials' }, { label: '自由手记', icon: '✏️', tab: 'create', sub: 'notes' },
      { label: '衍生创作', icon: '✂️', tab: 'create', sub: 'deriv' }, { label: '周边收藏', icon: '🎁', tab: 'create', sub: 'merch' },
      { label: '创作计划', icon: '📅', tab: 'create', sub: 'plans' }, { label: '创作问题卡', icon: '💡', tab: 'create', sub: 'cards' },
      { label: '声音与音乐', icon: '🎵', tab: 'create', sub: 'audio' }
    ]},
    { group: '工具与检视', items: [
      { label: '事件日历', icon: '📆', tab: 'events' }, { label: '关系图谱', icon: '🪢', tab: 'rels' },
      { label: '冲突记录', icon: '⚔️', tab: 'run', sub: 'conflicts' }, { label: '信息传播', icon: '📡', tab: 'run', sub: 'infos' },
      { label: '物流网络', icon: '🚚', tab: 'run', sub: 'logistics' },
      { label: '档案补全', icon: '✅', tab: 'stats', sub: 'audit' }, { label: '世界统计', icon: '📊', tab: 'stats', sub: 'stats' }
    ]}
  ];

  function countOf(w, type) {
    if (type === 'chars') return (w.chars || []).length;
    if (type === 'rels') return (w.rels || []).length;
    if (type === 'story') { var n = 0; (w.chapters || []).forEach(function (c) { n += (c.episodes || []).length; }); return n; }
    return (w[type] || []).length;
  }
  function hubView(w) {
    var cMap = {};
    (w.chars || []).forEach(function (c) { cMap[c.id] = c.name; });
    var eps = 0, nodes = 0;
    (w.chapters || []).forEach(function (ch) { (ch.episodes || []).forEach(function (ep) { eps++; nodes += (ep.nodes || []).length; }); });
    var h = '<section class="hub-hero' + (w.cover ? ' hasimg' : '') + '" style="' + (w.cover ? 'background-image:url(' + imgUrl(w.cover) + ')' : '') + '">' +
      '<div class="hh-in"><div class="hh-kicker">WORLD BUILDER</div><h1>' + esc(w.name) + '</h1>' +
      '<p>' + esc(w.tagline || w.desc || '这个世界还在等待第一笔。') + '</p>' +
      '<div class="hh-stats"><span><b>' + (w.chars || []).length + '</b>角色</span><span><b>' + (w.places || []).length + '</b>地点</span>' +
      '<span><b>' + (w.chapters || []).length + '</b>章</span><span><b>' + eps + '</b>话</span><span><b>' + nodes + '</b>剧情节点</span></div>' +
      '<div class="hh-acts"><button class="btn pri" data-a="saveNovel" data-mode="script">💾 保存为互动小说</button>' +
      '<button class="btn gho" data-a="saveNovel" data-mode="ai">✨ 保存为 AI 互动小说</button>' +
      '<button class="btn gho" data-a="playScript">▶ 按剧情开局</button>' +
      '<button class="btn gho" data-a="playAI">🤖 AI 开局</button>' +
      '<button class="btn wiz" data-a="wizard">🌌 创世向导 · 一键生成整个世界</button></div></div></section>';
    if (w.map && w.map.bg) h += '';
    h += '<div class="hub">';
    HUB.forEach(function (g) {
      h += '<div class="hub-group"><h3>' + esc(g.group) + '</h3><div class="hub-grid">';
      g.items.forEach(function (m) {
        var n = '';
        if (m.tab === 'chars') n = countOf(w, 'chars');
        else if (m.tab === 'rels') n = countOf(w, 'rels');
        else if (m.sub === 'species') n = countOf(w, 'species');
        else if (m.sub === 'flora') n = countOf(w, 'flora');
        else if (m.sub === 'foods') n = countOf(w, 'foods');
        else if (m.sub === 'items') n = countOf(w, 'items');
        else if (m.sub === 'chapters') n = (w.chapters || []).length;
        else if (m.tab === 'map') n = (w.map && w.map.markers || []).length;
        h += '<button class="mcard" data-a="go" data-tab="' + m.tab + '"' + (m.sub ? ' data-sub="' + m.sub + '"' : '') + '>' +
          '<span class="mi">' + m.icon + '</span><span class="ml">' + esc(m.label) + '</span>' +
          (n !== '' ? '<span class="mn">' + n + '</span>' : '') + '</button>';
      });
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }
  function goModule(tab, sub) { S.tab = tab; S.sub = sub || ''; renderEditor(); }

  /* ---------------- 字段与视图 ---------------- */
  function F(k, l, o) { var f = { k: k, l: l }; if (o) for (var x in o) f[x] = o[x]; return f; }
  var TYPES = {
    faction: ['国家', '宗门', '家族', '教团', '公会', '军队', '商会', '帮派', '其他'],
    place: ['城邦', '村庄', '森林', '山脉', '水域', '遗迹', '秘境', '建筑', '其他'],
    species: ['走兽', '飞禽', '水族', '虫豸', '植物', '灵体', '异种', '神兽'],
    flora: ['草药', '花卉', '树木', '菌类', '藤蔓', '作物', '其他'],
    food: ['主食', '菜肴', '甜点', '饮品', '酒', '食材', '其他'],
    item: ['武器', '防具', '饰品', '法器', '消耗品', '信物', '材料', '载具', '其他']
  };
  var SCHEMA = {
    cosmos: { title: '宇宙与位面', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['主宇宙', '平行宇宙', '位面', '维度', '星界', '虚空', '梦境', '其他'] }),
      F('scale', '尺度'), F('law', '法则差异'), F('ruler', '主宰 / 神明'), F('access', '抵达方式'),
      F('img', '星图 / 图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    celestial: { title: '天体与星象', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['恒星', '行星', '卫星', '星云', '彗星', '黑洞', '星座', '其他'] }),
      F('orbit', '轨道 / 方位'), F('period', '周期'), F('influence', '对世界的影响'),
      F('img', '星图', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    rules: { title: '世界法则', fields: [
      F('name', '法则名', { req: 1 }), F('type', '类型', { select: ['物理', '魔法', '生死', '时间', '因果', '契约', '禁忌', '其他'] }),
      F('scope', '适用范围'), F('cost', '代价'), F('break', '违背后果'), F('desc', '细则', { area: 1 })
    ]},
    timeline: { title: '纪元年表', fields: [
      F('era', '纪元', { req: 1 }), F('span', '时间跨度'), F('ruler', '主导者'),
      F('event', '标志性事件', { area: 1 }), F('desc', '说明', { area: 1 })
    ]},
    regions: { title: '大区与地形', fields: [
      F('name', '名称', { req: 1 }), F('type', '地形', { select: ['平原', '高原', '山脉', '盆地', '沙漠', '森林', '冻原', '群岛', '深渊', '其他'] }),
      F('area', '面积'), F('climate', '气候'), F('resource', '主要资源'),
      F('danger', '危险度', { select: ['安全', '一般', '危险', '禁区'] }), F('img', '地图', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    climate: { title: '气候与季风', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['季风', '雨季', '旱季', '极寒', '酷热', '风暴', '雾季', '其他'] }),
      F('month', '月份 / 周期'), F('effect', '对生活的影响'), F('desc', '描述', { area: 1 })
    ]},
    ecosystem: { title: '生态链', fields: [
      F('name', '名称', { req: 1 }), F('type', '层级', { select: ['生产', '初级消费', '次级消费', '顶级掠食', '分解', '共生', '其他'] }),
      F('member', '代表物种'), F('balance', '平衡点'), F('desc', '描述', { area: 1 })
    ]},
    law: { title: '律法与制度', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['法典', '王令', '教规', '乡约', '军法', '契约', '其他'] }),
      F('maker', '制定者'), F('scope', '适用对象'), F('penalty', '惩罚'), F('desc', '条文', { area: 1 })
    ]},
    military: { title: '军备与战争', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['兵种', '军团', '要塞', '武器', '战术', '战役', '其他'] }),
      F('owner', '归属'), F('strength', '兵力 / 威力'), F('weak', '弱点'), F('desc', '描述', { area: 1 })
    ]},
    education: { title: '教育与学派', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['学院', '书院', '学派', '师门', '图书馆', '其他'] }),
      F('master', '主持者'), F('teach', '传授内容'), F('desc', '描述', { area: 1 })
    ]},
    arts: { title: '艺术与娱乐', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['绘画', '音乐', '戏曲', '舞蹈', '文学', '竞技', '节庆', '其他'] }),
      F('style', '风格'), F('master', '代表人物'), F('desc', '描述', { area: 1 })
    ]},
    lineage: { title: '血脉与家族', fields: [
      F('name', '姓氏 / 家族', { req: 1 }), F('type', '类型', { select: ['王族', '贵族', '宗门世家', '商贾', '平民', '异族', '其他'] }),
      F('origin', '起源'), F('trait', '血脉天赋'), F('member', '代表人物'), F('desc', '家谱与恩怨', { area: 1 })
    ]},
    titles: { title: '称号与爵位', fields: [
      F('name', '称号', { req: 1 }), F('type', '类型', { select: ['爵位', '官职', '学衔', '武勋', '神职', '绰号', '其他'] }),
      F('rank', '等级'), F('owner', '持有者'), F('desc', '授予条件与特权', { area: 1 })
    ]},
    divinity: { title: '神格与神系', fields: [
      F('name', '神名', { req: 1 }), F('type', '类型', { select: ['主神', '从神', '古神', '邪神', '半神', '图腾', '其他'] }),
      F('domain', '神职 / 领域'), F('rank', '神力阶位'), F('followers', '信徒规模'),
      F('img', '圣像', { img: 1 }), F('desc', '教义与神迹', { area: 1 })
    ]},
    curse: { title: '诅咒与禁忌', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['血咒', '器物咒', '地名禁忌', '血脉禁忌', '契约反噬', '其他'] }),
      F('trigger', '触发条件'), F('effect', '效果'), F('lift', '解除方式'), F('desc', '描述', { area: 1 })
    ]},
    quests: { title: '任务与委托', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['主线', '支线', '委托', '悬赏', '试炼', '其他'] }),
      F('giver', '发布者'), F('target', '目标'), F('reward', '奖励'),
      F('status', '状态', { select: ['未开始', '进行中', '已完成', '失败'] }), F('desc', '详情', { area: 1 })
    ]},
    secrets: { title: '隐秘与真相', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['身世', '阴谋', '禁闻', '预言', '遗物', '其他'] }),
      F('holder', '知情者'), F('reveal', '揭露条件'), F('desc', '真相内容', { area: 1 })
    ]},
    disasters: { title: '灾变与天灾', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['天灾', '瘟疫', '战争', '崩塌', '异变', '其他'] }),
      F('date', '时间'), F('scope', '波及范围'), F('loss', '损失'), F('desc', '经过', { area: 1 })
    ]},
    factions: { title: '组织与势力', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: TYPES.faction }), F('leader', '领袖'), F('members', '核心成员'),
      F('territory', '领地'), F('goal', '目标', { area: 1 }), F('creed', '信条 / 规则', { area: 1 }),
      F('conflict', '敌对 / 冲突'), F('img', '徽记 / 图片', { img: 1 }), F('desc', '详细描述', { area: 1 })
    ]},
    places: { title: '地点与地理', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: TYPES.place }), F('region', '所属区域'),
      F('climate', '气候'), F('population', '人口 / 规模'), F('resources', '资源物产'),
      F('factionId', '所属势力', { ref: 'factions' }), F('img', '风景 / 图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    events: { title: '事件与时间线', fields: [
      F('era', '纪元 / 年代'), F('time', '时间点'), F('title', '事件标题', { req: 1 }),
      F('cat', '类别', { select: ['战争', '政治', '灾变', '发现', '庆典', '人物', '其他'] }),
      F('placeId', '发生地点', { ref: 'places' }), F('charIds', '相关角色（逗号分隔姓名）'), F('desc', '事件内容', { area: 1 })
    ]},
    lore: { title: '世界百科', fields: [
      F('cat', '分类', { select: ['总纲', '文明', '职业', '力量体系', '信仰', '经济', '生态', '历史', '地理', '其他'] }),
      F('title', '条目名', { req: 1 }), F('content', '内容', { area: 1 })
    ]},
    worldbook: { title: '世界书', fields: [
      F('keys', '关键词（逗号分隔）', { req: 1 }), F('content', '设定内容（会注入 AI 上下文）', { area: 1 })
    ]},
    species: { title: '自然与物种', fields: [
      F('name', '名称', { req: 1 }), F('type', '类别', { select: TYPES.species }), F('habitat', '栖息地'),
      F('danger', '危险度', { select: ['无害', '温和', '警戒', '危险', '致命'] }), F('traits', '特征 / 能力'),
      F('img', '图鉴图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    flora: { title: '草药与植物', fields: [
      F('name', '名称', { req: 1 }), F('type', '类别', { select: TYPES.flora }), F('habitat', '生长环境'),
      F('rarity', '稀有度', { select: ['常见', '少见', '稀有', '珍稀', '传说'] }), F('effect', '药效 / 用途'),
      F('img', '图鉴图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    foods: { title: '食物与饮品', fields: [
      F('name', '名称', { req: 1 }), F('type', '类别', { select: TYPES.food }), F('taste', '风味'),
      F('effect', '效果 / 恢复'), F('origin', '产地 / 来源'), F('img', '图鉴图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    items: { title: '物品与装备', fields: [
      F('name', '名称', { req: 1 }), F('type', '类别', { select: TYPES.item }), F('rarity', '稀有度', { select: ['普通', '精良', '稀有', '史诗', '传说'] }),
      F('effect', '效果 / 属性'), F('owner', '持有者'), F('placeId', '存放地点', { ref: 'places' }),
      F('img', '物品图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    economy: { title: '经济与货币', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['货币', '资源', '贸易', '产业', '税制', '其他'] }),
      F('value', '价值 / 汇率'), F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    faith: { title: '意识与信仰', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['宗教', '神祇', '教义', '仪式', '禁忌', '哲学', '其他'] }),
      F('deity', '神祇 / 核心'), F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    society: { title: '社会与文明', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['制度', '律法', '礼俗', '族群', '阶层', '组织', '其他'] }),
      F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    tech: { title: '科技与知识', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['科技', '学术', '技艺', '发明', '理论', '其他'] }),
      F('level', '水平 / 阶段'), F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    careers: { title: '职业与生涯', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['职业', '头衔', '职位', '组织', '其他'] }),
      F('duty', '职责'), F('income', '收入 / 报酬'), F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    powers: { title: '能力体系', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['体系', '功法', '能力', '血脉', '法术', '其他'] }),
      F('level', '等级 / 阶段'), F('cost', '代价'), F('effect', '效果'), F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    langs: { title: '文字与语言', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['语言', '文字', '方言', '暗语', '符号', '其他'] }),
      F('speakers', '使用族群'), F('sample', '示例'), F('img', '图片', { img: 1 }), F('desc', '描述', { area: 1 })
    ]},
    audio: { title: '声音与音乐', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['主题曲', '场景音乐', '角色主题', '音效', '语音', '其他'] }),
      F('url', '链接 / 文件名'), F('scene', '适用场景'), F('desc', '说明', { area: 1 })
    ]},
    stories: { title: '剧情线与故事集', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['主线', '支线', '番外', '故事集', '片段', '其他'] }),
      F('status', '状态', { select: ['构思', '进行中', '已完成', '搁置'] }), F('desc', '梗概', { area: 1 })
    ]},
    drafts: { title: '稿件库', fields: [
      F('name', '标题', { req: 1 }), F('type', '类型', { select: ['正文', '大纲', '片段', '设定', '其他'] }),
      F('status', '状态', { select: ['草稿', '修订', '完成'] }), F('desc', '内容 / 摘要', { area: 1 })
    ]},
    comms: { title: '角色通讯', fields: [
      F('name', '对象 / 标题', { req: 1 }), F('charId', '关联角色', { ref: 'chars' }),
      F('type', '类型', { select: ['私信', '书信', '通话', '留言', '群聊'] }), F('desc', '内容', { area: 1 })
    ]},
    cards: { title: '创作问题卡', fields: [
      F('name', '问题', { req: 1 }), F('type', '分类', { select: ['角色', '剧情', '世界', '逻辑', '灵感', '其他'] }),
      F('desc', '回答 / 思考', { area: 1 })
    ]},
    materials: { title: '素材库', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['图片', '文字', '链接', '参考', '其他'] }),
      F('url', '链接'), F('img', '图片', { img: 1 }), F('desc', '说明', { area: 1 })
    ]},
    notes: { title: '自由手记', fields: [F('name', '标题', { req: 1 }), F('desc', '正文', { area: 1 })] },
    deriv: { title: '衍生创作', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['同人', '改编', '插画', '音频', '其他'] }),
      F('img', '图片', { img: 1 }), F('desc', '说明', { area: 1 })
    ]},
    merch: { title: '周边收藏', fields: [
      F('name', '名称', { req: 1 }), F('type', '类型', { select: ['徽章', '立牌', '挂件', '画集', '服饰', '其他'] }),
      F('status', '状态', { select: ['想要', '已购', '已拥有'] }), F('img', '图片', { img: 1 }), F('desc', '备注', { area: 1 })
    ]},
    plans: { title: '创作计划', fields: [
      F('name', '计划', { req: 1 }), F('date', '日期'), F('status', '状态', { select: ['待办', '进行中', '完成'] }),
      F('desc', '备注', { area: 1 })
    ]},
    conflicts: { title: '冲突记录', fields: [
      F('name', '冲突名称', { req: 1 }), F('type', '类型', { select: ['战争', '争端', '阴谋', '资源', '信仰', '其他'] }),
      F('parties', '双方 / 多方'), F('status', '状态', { select: ['酝酿', '爆发', '僵持', '平息'] }), F('desc', '经过 / 影响', { area: 1 })
    ]},
    infos: { title: '信息传播', fields: [
      F('name', '信息 / 传闻', { req: 1 }), F('type', '类型', { select: ['传闻', '密报', '公告', '谣言', '知识'] }),
      F('speed', '传播速度', { select: ['缓慢', '普通', '迅速', '瞬间'] }), F('desc', '内容 / 影响', { area: 1 })
    ]},
    logistics: { title: '物流与补给', fields: [
      F('name', '线路 / 物资', { req: 1 }), F('type', '类型', { select: ['商路', '粮道', '航路', '驿道', '补给线', '其他'] }),
      F('from', '起点'), F('to', '终点'), F('capacity', '运力 / 储量'), F('desc', '说明', { area: 1 })
    ]},
    statusPanels: { title: '状态面板', fields: [
      F('name', '面板名称', { req: 1 }), F('nick', '状态昵称'),
      F('color', '进度条颜色', { select: ['#7c3aed', '#22d3ee', '#dc2626', '#16a34a', '#f59e0b', '#f472b6', '#64748b'] }),
      F('max', '最大值'), F('value', '当前值'),
      F('rule', '增减规则', { area: 1 }),
      F('code', '本地代码规则（可选，变量 p / text）', { area: 1 }),
      F('ai', 'AI 驱动', { select: ['开', '关'] })
    ]}
  };
  function schemaOf(type) { return type === 'chars' ? null : SCHEMA[type]; }
  function refName(w, ref, id) {
    var arr = w[ref] || [];
    for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) return arr[i].name || arr[i].title || '';
    return '';
  }
  function typeLabel(type) { var sc = SCHEMA[type]; return sc ? sc.title : ''; }

  function listCard(w, type, it) {
    var title = it.name || it.title || it.keys || '未命名';
    var sub = [it.type, it.cat, it.time, it.era, it.rarity, it.status].filter(Boolean).join(' · ');
    var desc = it.desc || it.content || it.goal || it.effect || '';
    var img = it.img || '';
    return '<div class="ecard' + (img ? ' hasimg' : '') + '" data-a="edit" data-type="' + type + '" data-id="' + esc(it.id) + '" data-name="' + esc(String(title) + ' ' + sub + ' ' + desc) + '">' +
      '<button class="del" data-a="delEnt" data-type="' + type + '" data-id="' + esc(it.id) + '">✕</button>' +
      (img ? '<div class="pic" style="background-image:url(' + imgUrl(img) + ')"></div>' : '') +
      '<div class="ec-body"><h4>' + esc(title) + '</h4>' +
      (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') +
      '<p>' + esc(desc) + '</p></div></div>';
  }
  function listView(w, type) {
    var sc = SCHEMA[type]; if (!sc) return '';
    var arr = w[type] || [];
    var h = '<div class="bar"><h2>' + esc(sc.title) + '</h2><span class="cnt">' + arr.length + ' 条</span><div class="sp"></div>' +
      '<input class="lsearch" id="listKw" placeholder="筛选…" oninput="SLOC.filterList(this.value)">' +
      '<button class="btn pri" data-a="add" data-type="' + type + '">＋ 新建</button></div>';
    if (!arr.length) {
      h += '<div class="empty"><b>还没有内容</b>' + (type === 'worldbook' ? '世界书用来给 AI 补设定：写一个关键词，再写它对应的世界规则。' : '点「新建」开始整理，所有图片都会保存在本机。') + '</div>';
      return h;
    }
    if (type === 'lore') {
      h += '<div class="lore">' + arr.map(function (it) {
        return '<div class="lcard" data-a="edit" data-type="lore" data-id="' + esc(it.id) + '" data-name="' + esc(it.title + ' ' + it.cat + ' ' + it.content) + '">' +
          '<div class="cat">' + esc(it.cat || '其他') + '</div><h4>' + esc(it.title) + '</h4><p>' + esc(it.content) + '</p></div>';
      }).join('') + '</div>';
      return h;
    }
    if (type === 'worldbook') {
      h += '<div class="wb">' + arr.map(function (it) {
        return '<div class="wb-item" data-a="edit" data-type="worldbook" data-id="' + esc(it.id) + '" data-name="' + esc(it.keys + ' ' + it.content) + '">' +
          '<div class="k">' + esc(it.keys) + '</div><div class="v">' + esc(it.content) + '</div></div>';
      }).join('') + '</div>';
      return h;
    }
    h += '<div class="cards">' + arr.map(function (it) { return listCard(w, type, it); }).join('') + '</div>';
    return h;
  }
  function filterList(q) {
    q = String(q || '').toLowerCase();
    var els = view.querySelectorAll('[data-name]');
    for (var i = 0; i < els.length; i++) {
      var n = (els[i].getAttribute('data-name') || '').toLowerCase();
      els[i].style.display = !q || n.indexOf(q) >= 0 ? '' : 'none';
    }
  }

  function charsView(w) {
    var arr = w.chars || [];
    var h = '<div class="bar"><h2>角色档案</h2><span class="cnt">' + arr.length + ' 位</span><div class="sp"></div>' +
      '<input class="lsearch" id="listKw" placeholder="筛选…" oninput="SLOC.filterList(this.value)">' +
      '<button class="btn pri" data-a="add" data-type="chars">＋ 新建角色</button></div>';
    if (!arr.length) return h + '<div class="empty"><b>还没有角色</b>先建一个主角，再补上 TA 的立绘、身世、性格与能力。<br>关系网会自动把角色连起来。</div>';
    h += '<div class="cards chars">' + arr.map(function (c) {
      var sub = [c.alias, c.gender, c.age, c.race, c.role].filter(Boolean).join(' · ');
      return '<div class="ecard char' + (c.img ? ' hasimg' : '') + '" data-a="edit" data-type="chars" data-id="' + esc(c.id) + '" data-name="' + esc((c.name || '') + ' ' + sub + ' ' + (c.persona || '') + ' ' + (c.background || '')) + '">' +
        '<button class="del" data-a="delEnt" data-type="chars" data-id="' + esc(c.id) + '">✕</button>' +
        (c.img ? '<div class="portrait" style="background-image:url(' + imgUrl(c.img) + ')"></div>' : '<div class="av">' + esc(firstChar(c.name)) + '</div>') +
        '<div class="ec-body"><h4>' + esc(c.name || '未命名') + '</h4>' +
        (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') +
        '<p>' + esc(c.persona || c.background || c.look || '点开补充 TA 的故事。') + '</p></div></div>';
    }).join('') + '</div>';
    return h;
  }

  function relsView(w) {
    var h = '<div class="bar"><h2>关系网</h2><span class="cnt">' + (w.rels || []).length + ' 条关系</span><div class="sp"></div>' +
      '<button class="btn pri" data-a="addRel">＋ 新增关系</button></div>';
    if ((w.chars || []).length < 2) return h + '<div class="empty"><b>至少需要两个角色</b>先去「角色」里建好人物，再回来看关系网。</div>';
    h += '<div class="graph-wrap"><svg id="graph"></svg><div class="graph-tip">拖动节点调整位置 · 点击节点查看档案</div></div>';
    h += '<div class="legend">' + REL_TYPES.map(function (t) {
      return '<span><i style="background:' + (REL_COLOR[t] || '#94a3b8') + '"></i>' + t + '</span>';
    }).join('') + '</div>';
    var list = (w.rels || []).map(function (r) {
      var a = (w.chars || []).filter(function (c) { return c.id === r.a; })[0];
      var b = (w.chars || []).filter(function (c) { return c.id === r.b; })[0];
      if (!a || !b) return '';
      return '<div class="wb-item" data-a="editRel" data-id="' + esc(r.id) + '" style="margin-top:8px">' +
        '<div class="k" style="color:' + (REL_COLOR[r.type] || '#a78bfa') + '">' + esc(r.type || '关系') + (r.intensity ? ' · ' + r.intensity : '') + '</div>' +
        '<div class="v">' + esc(a.name) + ' ↔ ' + esc(b.name) + (r.note ? '：' + esc(r.note) : '') + '</div></div>';
    }).join('');
    if (list) h += '<div class="wb">' + list + '</div>';
    return h;
  }
  var REL_TYPES = ['亲属', '恋人', '挚友', '敌对', '师徒', '主仆', '上下级', '同盟', '其他'];
  var REL_COLOR = { '亲属': '#22d3ee', '恋人': '#f472b6', '挚友': '#34d399', '敌对': '#f87171', '师徒': '#fbbf24', '主仆': '#a78bfa', '上下级': '#60a5fa', '同盟': '#2dd4bf', '其他': '#94a3b8' };

  /* ---------------- 子模块视图 ---------------- */
  function subChips(tab, list) {
    return '<div class="chips">' + list.map(function (x) {
      return '<button class="chip' + (S.sub === x[0] ? ' on' : '') + '" data-sub="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div>';
  }
  function ensureSub(list, def) {
    var ok = false; (list || []).forEach(function (x) { if (x[0] === S.sub) ok = true; });
    if (!ok) S.sub = def;
  }
  function worldView(w) {
    ensureSub([['factions', '组织势力'], ['places', '地点城邦']], 'factions');
    return subChips('world', [['factions', '组织势力'], ['places', '地点城邦']]) + listView(w, S.sub);
  }
  function codexView(w) {
    ensureSub([['species', '自然与物种'], ['flora', '草药植物'], ['foods', '食物饮品'], ['faith', '意识与信仰'], ['society', '社会与文明'], ['tech', '科技与知识'], ['careers', '职业与生涯'], ['powers', '能力体系'], ['langs', '文字与语言']], 'species');
    return subChips('codex', [['species', '自然与物种'], ['flora', '草药植物'], ['foods', '食物饮品'], ['faith', '意识与信仰'], ['society', '社会与文明'], ['tech', '科技与知识'], ['careers', '职业与生涯'], ['powers', '能力体系'], ['langs', '文字与语言']]) + listView(w, S.sub);
  }
  function cosmosView(w) {
    var SUBS = [['cosmos', '宇宙与位面'], ['celestial', '天体与星象'], ['regions', '大区与地形'], ['climate', '气候与季风'], ['ecosystem', '生态链']];
    ensureSub(SUBS, 'cosmos');
    return subChips('cosmos', SUBS) + listView(w, S.sub);
  }
  function societyView(w) {
    var SUBS = [['law', '律法与制度'], ['military', '军备与战争'], ['education', '教育与学派'], ['arts', '艺术与娱乐'], ['lineage', '血脉与家族'], ['titles', '称号与爵位']];
    ensureSub(SUBS, 'law');
    return subChips('society', SUBS) + listView(w, S.sub);
  }
  function lawsView(w) {
    var SUBS = [['rules', '世界法则'], ['divinity', '神格与神系'], ['curse', '诅咒与禁忌'], ['secrets', '隐秘与真相'], ['disasters', '灾变与天灾'], ['quests', '任务与委托'], ['timeline', '纪元年表']];
    ensureSub(SUBS, 'rules');
    return subChips('laws', SUBS) + listView(w, S.sub);
  }

  /* ============ V10 创世向导：一次生成完整世界骨架 ============ */
  var WZ_SCHEMA = {
    cosmos: ['name', 'type', 'scale', 'law', 'ruler', 'access', 'desc'],
    celestial: ['name', 'type', 'orbit', 'period', 'influence', 'desc'],
    rules: ['name', 'type', 'scope', 'cost', 'break', 'desc'],
    timeline: ['era', 'span', 'ruler', 'event', 'desc'],
    regions: ['name', 'type', 'climate', 'resource', 'danger', 'desc'],
    climate: ['name', 'type', 'month', 'effect', 'desc'],
    ecosystem: ['name', 'type', 'member', 'balance', 'desc'],
    factions: ['name', 'type', 'leader', 'territory', 'goal', 'creed', 'desc'],
    places: ['name', 'type', 'region', 'climate', 'resources', 'desc'],
    society: ['name', 'type', 'desc'],
    law: ['name', 'type', 'maker', 'penalty', 'desc'],
    military: ['name', 'type', 'owner', 'strength', 'weak', 'desc'],
    lineage: ['name', 'type', 'trait', 'desc'],
    titles: ['name', 'type', 'rank', 'desc'],
    divinity: ['name', 'type', 'domain', 'desc'],
    curse: ['name', 'type', 'effect', 'lift', 'desc'],
    powers: ['name', 'type', 'level', 'cost', 'effect', 'desc'],
    species: ['name', 'type', 'habitat', 'traits', 'desc'],
    flora: ['name', 'type', 'habitat', 'effect', 'desc'],
    events: ['era', 'time', 'title', 'cat', 'desc'],
    quests: ['name', 'type', 'target', 'reward', 'status', 'desc'],
    secrets: ['name', 'type', 'holder', 'reveal', 'desc'],
    disasters: ['name', 'type', 'date', 'scope', 'desc'],
    chars: ['name', 'alias', 'gender', 'age', 'race', 'role', 'persona', 'background'],
    lore: ['cat', 'title', 'content']
  };

  function wzPrompt(idea, genre) {
    return '你是世界构建引擎。基于用户设定，生成一个要素完整、逻辑自洽的世界骨架。' +
      '用户设定：' + idea + '\n类型：' + genre + '\n' +
      '必须覆盖：宇宙与位面、天体星象、世界法则、纪元年表、大区地形、气候、生态链、组织势力、地点城邦、社会文明、律法、军备、血脉家族、称号、神系、诅咒禁忌、能力体系、物种、植物、历史事件、任务、隐秘、灾变、角色、百科。\n' +
      '输出严格 JSON（不要 markdown、不要解释），键为：name, tagline, desc, calendar, era, ' +
      Object.keys(WZ_SCHEMA).join(', ') + '。每个数组 2-4 条，字段名严格使用：' +
      Object.keys(WZ_SCHEMA).map(function (k) { return k + '=[' + WZ_SCHEMA[k].join('/') + ']'; }).join('；');
  }

  function runWizard() {
    var w = cur();
    if (!w) { toast('先打开一个世界'); return; }
    var idea = prompt('用一句话描述你想创建的世界（例：被永夜笼罩的大陆，光源由十二座星塔维持）', w.tagline || '');
    if (!idea) return;
    var cfg = getCfg ? getCfg() : null;
    if (!cfg || !cfg.key) { toast('请先在设置里填写 API Key'); return; }
    toast('创世引擎启动，正在生成完整世界…');
    var genre = (w.genre || '幻想');
    chat([{ role: 'user', content: wzPrompt(idea, genre) }], { temp: 0.8 })
      .then(function (txt) {
        var j = parseJson(txt);
        if (!j) { toast('生成结果解析失败，请重试'); return; }
        if (j.name) w.name = String(j.name).slice(0, 40);
        if (j.tagline) w.tagline = String(j.tagline).slice(0, 120);
        if (j.desc) w.desc = String(j.desc);
        if (j.calendar) w.calendar = String(j.calendar);
        if (j.era) w.era = String(j.era);
        Object.keys(WZ_SCHEMA).forEach(function (type) {
          var arr = j[type];
          if (!Array.isArray(arr)) return;
          arr.slice(0, 6).forEach(function (raw) {
            var it = {};
            it.id = uid(type.slice(0, 2));
            WZ_SCHEMA[type].forEach(function (k) {
              if (raw[k] != null) it[k] = typeof raw[k] === 'string' ? raw[k] : String(raw[k]);
            });
            if (type === 'events') { if (!it.title && it.name) it.title = it.name; }
            if (!it.name && it.title) it.name = it.title;
            if (it.name || it.title || it.content) w[type].push(it);
          });
        });
        w.updated = now();
        ensureWorld(w);
        save();
        toast('创世完成：宇宙 / 地理 / 社会 / 法则 / 历史 / 角色 已全部就位');
        goModule('hub');
      })
      .catch(function (e) { toast('生成失败：' + ((e && e.message) || e)); });
  }

  function itemsView(w) {
    ensureSub([['items', '装备与收藏'], ['economy', '经济与货币'], ['materials', '素材库']], 'items');
    return subChips('items', [['items', '装备与收藏'], ['economy', '经济与货币'], ['materials', '素材库']]) + listView(w, S.sub);
  }
  function createView(w) {
    ensureSub([['stories', '剧情线与故事集'], ['drafts', '稿件库'], ['comms', '角色通讯'], ['cards', '创作问题卡'], ['materials', '素材库'], ['notes', '自由手记'], ['deriv', '衍生创作'], ['merch', '周边收藏'], ['plans', '创作计划'], ['audio', '声音与音乐']], 'drafts');
    return subChips('create', [['stories', '剧情线与故事集'], ['drafts', '稿件库'], ['comms', '角色通讯'], ['cards', '创作问题卡'], ['materials', '素材库'], ['notes', '自由手记'], ['deriv', '衍生创作'], ['merch', '周边收藏'], ['plans', '创作计划'], ['audio', '声音与音乐']]) + listView(w, S.sub);
  }
  function loreView(w) {
    ensureSub([['lore', '世界百科 / 总纲'], ['worldbook', '世界书']], 'lore');
    return subChips('lore', [['lore', '世界百科 / 总纲'], ['worldbook', '世界书']]) + listView(w, S.sub);
  }
  function eventsView(w) {
    var arr = (w.events || []).slice().sort(function (a, b) { return String(a.time || '').localeCompare(String(b.time || '')); });
    var h = '<div class="bar"><h2>事件与时间线</h2><span class="cnt">' + arr.length + ' 个事件</span><div class="sp"></div>' +
      '<button class="btn pri" data-a="add" data-type="events">＋ 新增事件</button></div>';
    if (!arr.length) return h + '<div class="empty"><b>还没有事件</b>把世界史上的关键节点写下来，AI 续写时会参考它们。</div>';
    h += '<div class="timeline">' + arr.map(function (it) {
      return '<div class="ti" data-a="edit" data-type="events" data-id="' + esc(it.id) + '">' +
        '<div class="tm">' + esc([it.era, it.time].filter(Boolean).join(' · ') || '未标注时间') + '</div>' +
        '<h4>' + esc(it.title) + '</h4><p>' + esc(it.desc) + '</p></div>';
    }).join('') + '</div>';
    return h;
  }

  /* ---------------- 运行 ---------------- */
  function runView(w) {
    var RUN_SUBS = [['run', '世界状态'], ['statusPanels', '状态面板'], ['conflicts', '冲突记录'], ['infos', '信息传播'], ['logistics', '物流与补给']];
    ensureSub(RUN_SUBS, 'run');
    if (S.sub === 'statusPanels') return subChips('run', RUN_SUBS) + listView(w, 'statusPanels');
    if (S.sub === 'conflicts') return subChips('run', RUN_SUBS) + listView(w, 'conflicts');
    if (S.sub === 'infos') return subChips('run', RUN_SUBS) + listView(w, 'infos');
    if (S.sub === 'logistics') return subChips('run', RUN_SUBS) + listView(w, 'logistics');
    var r = w.run || {};
    function meter(label, val, cls, max) {
      return '<div class="meter"><span>' + label + '</span><div class="bar-track"><i class="' + (cls || '') + '" style="width:' + Math.max(0, Math.min(100, (val || 0) / (max || 100) * 100)) + '%"></i></div><b>' + (val || 0) + '</b></div>';
    }
    var h = '<div class="run-grid"><div class="run-card"><h3>世界状态</h3>' +
      meter('士气', r.morale, '', 100) + meter('人口', r.pop, 'pop', 500) +
      meter('食物', r.food, 'pop', 100) + meter('水', r.water, 'pop', 100) +
      meter('木材', r.wood, 'pop', 100) + meter('铁矿', r.iron, 'pop', 100) + meter('金币', r.gold, 'pop', 100) +
      '</div><div class="run-card"><h3>上帝之手</h3><div class="run-acts">' +
      '<button class="btn pri" data-a="ev" data-kind="celebration">🎉 降下庆典</button>' +
      '<button class="btn" data-a="ev" data-kind="boon">✨ 赐福世界</button>' +
      '<button class="btn" data-a="ev" data-kind="curse">🌩 降下灾祸</button>' +
      '<button class="btn" data-a="ev" data-kind="war">⚔️ 触发战争</button>' +
      '<button class="btn gho" data-a="ev" data-kind="migration">🚶 部族迁徙</button>' +
      '<button class="btn gho" data-a="ev" data-kind="random">🎲 随机事件</button>' +
      '<button class="btn gho" data-a="resAdj">⚖️ 调整资源</button>' +
      '</div></div></div>' +
      subChips('run', [['run', '世界状态'], ['statusPanels', '状态面板'], ['conflicts', '冲突记录'], ['infos', '信息传播'], ['logistics', '物流与补给']]) +
      '<div class="log-feed"><h3>世界纪事</h3>' + logFeed(w) + '</div>';
    return h;
  }
  function logFeed(w) {
    var log = (w.run && w.run.log) || [];
    if (!log.length) return '<div class="empty">世界还没有发生大事。点上方按钮降下一个事件，或在事件页记录你的设定。</div>';
    return log.slice().reverse().map(function (e) {
      return '<div class="log-item ' + e.type + '"><span class="li-ic">' + (LOG_ICON[e.type] || '•') + '</span><div class="li-body"><b>' + esc(e.title) + '</b><p>' + esc(e.desc || '') + '</p></div><span class="li-t">' + fmtTime(e.t) + '</span></div>';
    }).join('');
  }
  var LOG_ICON = { celebration: '🎉', boon: '✨', curse: '🌩', war: '⚔️', migration: '🚶' };
  var EVENT_POOLS = {
    celebration: { kind: 'celebration', title: '盛大庆典', desc: '万民载歌载舞，举国同庆，灯火彻夜不息。', pop: 8, morale: 12, celeb: 1, food: -4, gold: -6, cue: 'cheer' },
    boon: { kind: 'boon', title: '天赐福泽', desc: '风调雨顺，五谷丰登，人们心怀感恩。', pop: 5, morale: 8, food: 15, water: 10, cue: 'chime' },
    curse: { kind: 'curse', title: '灾祸降临', desc: '一场灾难席卷大地，哀鸿遍野，哭声遍野。', pop: -6, morale: -10, deaths: 1, food: -10, water: -8, cue: 'wail' },
    war: { kind: 'war', title: '战火燃起', desc: '城邦之间兵戎相见，硝烟弥漫，生灵涂炭。', pop: -8, morale: -6, deaths: 2, iron: -12, gold: -10, cue: 'wail' },
    migration: { kind: 'migration', title: '部族迁徙', desc: '一支部族翻山越岭，抵达新的家园。', pop: 3, morale: 2, food: -3, cue: 'chime' }
  };
  function fireEvent(kind) {
    var w = cur(); if (!w) return;
    var r = w.run;
    var ev = EVENT_POOLS[kind];
    if (kind === 'random') { var keys = ['celebration', 'boon', 'curse', 'war', 'migration']; ev = EVENT_POOLS[keys[Math.floor(Math.random() * keys.length)]]; }
    if (!ev) return;
    r.pop = Math.max(0, (r.pop || 0) + (ev.pop || 0));
    r.morale = Math.max(0, Math.min(100, (r.morale || 60) + (ev.morale || 0)));
    r.deaths = (r.deaths || 0) + (ev.deaths || 0);
    r.celebs = (r.celebs || 0) + (ev.celeb || 0);
    ['food', 'water', 'wood', 'iron', 'gold'].forEach(function (k) { r[k] = Math.max(0, Math.min(100, (r[k] || 0) + (ev[k] || 0))); });
    r.log.unshift({ t: now(), type: ev.kind, title: ev.title, desc: ev.desc });
    if (r.log.length > 160) r.log.length = 160;
    playCue(ev.cue);
    touch(); renderEditor(); toast(ev.title);
  }
  function fmtTime(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  var AC = null;
  function audioCtx() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; }
  function playCue(kind) {
    var ctx = audioCtx(); if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      function tone(f, type, dur, vol, slide) {
        var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
      }
      if (kind === 'cheer') { [523.25, 659.25, 783.99].forEach(function (f) { tone(f, 'triangle', 0.9, 0.1); }); }
      else if (kind === 'wail') { [392, 311.13, 233.08].forEach(function (f) { tone(f, 'sawtooth', 1.2, 0.06, 0.8); }); }
      else { tone(880, 'sine', 0.7, 0.08); tone(1174.66, 'sine', 0.6, 0.05); }
    } catch (e) {}
  }
  function resAdj() {
    var w = cur(); if (!w) return;
    var r = w.run;
    var h = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>调整资源</h3>';
    [['pop', '人口'], ['morale', '士气'], ['food', '食物'], ['water', '水'], ['wood', '木材'], ['iron', '铁矿'], ['gold', '金币']].forEach(function (x) {
      h += '<div class="field"><label>' + x[1] + '</label><input data-k="' + x[0] + '" type="number" value="' + (r[x[0]] || 0) + '"></div>';
    });
    h += '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="saveRes">保存</button></div></div></div>';
    modal.innerHTML = h;
  }
  function saveRes() {
    var w = cur(); if (!w) return;
    modal.querySelectorAll('[data-k]').forEach(function (el) {
      var k = el.getAttribute('data-k'), v = parseFloat(el.value) || 0;
      w.run[k] = k === 'morale' ? Math.max(0, Math.min(100, v)) : Math.max(0, v);
    });
    touch(); modal.innerHTML = ''; renderEditor(); toast('资源已更新');
  }

  /* ---------------- 统计 / 补档案 ---------------- */
  function statsView(w) {
    ensureSub([['stats', '世界统计'], ['audit', '档案补全']], 'stats');
    var chips = subChips('stats', [['stats', '世界统计'], ['audit', '档案补全']]);
    if (S.sub === 'audit') return chips + auditView(w);
    var rows = [['角色', w.chars.length], ['关系', w.rels.length], ['势力', w.factions.length], ['地点', w.places.length],
      ['事件', w.events.length], ['百科', w.lore.length], ['世界书', w.worldbook.length], ['物种', w.species.length],
      ['草药', w.flora.length], ['食物', w.foods.length], ['物品', w.items.length], ['能力', w.powers.length],
      ['章节', w.chapters.length], ['剧情线', w.stories.length], ['稿件', w.drafts.length], ['手记', w.notes.length],
      ['冲突', (w.conflicts || []).length], ['信息', (w.infos || []).length], ['物流', (w.logistics || []).length]];
    var eps = 0, nodes = 0, words = 0;
    (w.chapters || []).forEach(function (ch) {
      (ch.episodes || []).forEach(function (ep) {
        eps++; (ep.nodes || []).forEach(function (n) { nodes++; words += String(n.text || '').length; });
      });
    });
    var filled = w.chars.filter(function (c) { return c.persona && c.background && c.look; }).length;
    var h = chips + '<div class="stats-grid">' + rows.map(function (c) { return '<div class="stat"><b>' + c[1] + '</b><span>' + c[0] + '</span></div>'; }).join('') +
      '<div class="stat"><b>' + eps + '</b><span>话</span></div><div class="stat"><b>' + nodes + '</b><span>节点</span></div><div class="stat"><b>' + words + '</b><span>剧情字数</span></div></div>';
    h += '<div class="run-card"><h3>档案完整度</h3><div class="meter"><span>已补全角色</span><div class="bar-track"><i style="width:' + (w.chars.length ? Math.round(filled / w.chars.length * 100) : 0) + '%"></i></div><b>' + (w.chars.length ? Math.round(filled / w.chars.length * 100) : 0) + '%</b></div></div>';
    h += '<div class="log-feed"><h3>最近纪事</h3>' + logFeed(w) + '</div>';
    return h;
  }
  function auditView(w) {
    var issues = [];
    function add(icon, title, desc, tab, sub) { issues.push({ icon: icon, title: title, desc: desc, tab: tab, sub: sub || '' }); }
    if (!w.chars.length) add('👤', '还没有角色', '先建立至少一位角色，剧情与 AI 开局才有可用人物。', 'chars');
    var ids = {};
    (w.chars || []).forEach(function (c) { ids[c.id] = 1; });
    var badRels = (w.rels || []).filter(function (r) { return !ids[r.a] || !ids[r.b]; });
    if (badRels.length) add('🔗', '关系引用缺失', badRels.length + ' 条关系指向已删除或不存在的角色。', 'rels');
    var noFaction = (w.chars || []).filter(function (c) { return !c.factionId; }).length;
    if (noFaction) add('🏛', '角色未归属势力', noFaction + ' 位角色还没有选择所属势力。', 'chars');
    var noPlace = (w.chars || []).filter(function (c) { return !c.placeId; }).length;
    if (noPlace) add('📍', '角色未登记常驻地点', noPlace + ' 位角色还没有常驻地点。', 'chars');
    var markers = (w.map && w.map.markers) || [];
    var noMap = (w.places || []).filter(function (p) {
      return !markers.some(function (m) { return m.type === 'place' && String(m.refId) === String(p.id); });
    }).length;
    if (noMap) add('🗺', '地点未上地图', noMap + ' 个地点还没有在地图上标注。', 'map');
    var noTime = (w.events || []).filter(function (e) { return !e.time; }).length;
    if (noTime) add('📆', '事件缺少时间', noTime + ' 个事件没有填写时间点，时间线会不完整。', 'events');
    var noChoice = 0, noEnd = 0, totalEp = 0;
    (w.chapters || []).forEach(function (ch) {
      (ch.episodes || []).forEach(function (ep) {
        totalEp++;
        var hasChoice = false, hasEnd = false;
        (ep.nodes || []).forEach(function (n) { if (n.type === 'choice') hasChoice = true; if (n.type === 'end') hasEnd = true; });
        if (!hasChoice) noChoice++;
        if (!hasEnd) noEnd++;
      });
    });
    if (!totalEp) add('🎬', '还没有可播放剧情', '至少写一话剧情节点，才能保存为剧情互动小说。', 'story');
    else {
      if (noChoice) add('🔀', '话内没有选项', noChoice + ' 话没有设置对话选项，玩家只能连续阅读。', 'story');
      if (noEnd) add('🏁', '话内没有结局节点', noEnd + ' 话没有结局节点，播放时会直接进入下一话。', 'story');
    }
    var noOwner = (w.items || []).filter(function (it) { return !it.owner && !it.placeId; }).length;
    if (noOwner) add('🎒', '物品缺少归属', noOwner + ' 件物品没有持有者或存放地点。', 'items');
    var noImg = [].concat(w.species || [], w.flora || [], w.foods || []).filter(function (x) { return !x.img; }).length;
    if (noImg) add('🌿', '图鉴待配图', noImg + ' 条物种 / 草药 / 食物还没有上传图片。', 'codex');
    if (!(w.worldbook || []).length) add('📚', '世界书为空', '世界书会直接注入 AI 上下文，建议写几条关键词设定。', 'lore', 'worldbook');
    if (!(w.lore || []).length) add('📜', '世界百科为空', '补一条世界总纲或规则，AI 续写会更稳定。', 'lore');
    var h = '<div class="empty"><b>档案补全</b>先看世界一致性检查，再逐位补全角色资料。点击问题可直接跳转。</div>';
    h += '<div class="run-card"><h3>世界一致性检查</h3>';
    if (!issues.length) h += '<p>没有发现明显缺口，这个世界已经相当完整。</p>';
    else h += issues.map(function (it) {
      return '<div class="log-item" data-a="go" data-tab="' + it.tab + '"' + (it.sub ? ' data-sub="' + it.sub + '"' : '') + '>' +
        '<span class="li-ic">' + it.icon + '</span><div class="li-body"><b>' + esc(it.title) + '</b><p>' + esc(it.desc) + '</p></div><span class="li-t">去处理</span></div>';
    }).join('');
    h += '</div>';
    h += '<div class="bar" style="margin-top:14px"><h2>角色档案完整度</h2><span class="cnt">' + w.chars.length + ' 位</span></div>';
    if (!w.chars.length) return h + '<div class="empty">还没有角色，先去角色库创建。</div>';
    h += '<div class="cards">' + w.chars.map(function (c) {
      var miss = []; if (!c.img) miss.push('立绘'); if (!c.alias) miss.push('别名'); if (!c.gender) miss.push('性别'); if (!c.age) miss.push('年龄'); if (!c.race) miss.push('种族'); if (!c.look) miss.push('外貌'); if (!c.persona) miss.push('性格'); if (!c.background) miss.push('身世'); if (!c.ability) miss.push('能力');
      return '<div class="ecard' + (c.img ? ' hasimg' : '') + '" data-a="edit" data-type="chars" data-id="' + esc(c.id) + '">' +
        (c.img ? '<div class="portrait" style="background-image:url(' + imgUrl(c.img) + ')"></div>' : '<div class="av">' + esc(firstChar(c.name)) + '</div>') +
        '<div class="ec-body"><h4>' + esc(c.name) + '</h4><p>' + (miss.length ? '待补：' + miss.join('、') : '资料完整') + '</p></div></div>';
    }).join('') + '</div>';
    return h;
  }

  /* ---------------- 关系图 ---------------- */
  function drawGraph(w) {
    var svg = $('graph'); if (!svg) return;
    var box = svg.parentNode.getBoundingClientRect();
    var W = Math.max(280, box.width), H = Math.max(300, box.height || 420);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.32;
    var n = w.chars.length;
    if (!w.graphPos) w.graphPos = {};
    w.chars.forEach(function (c, i) {
      if (!w.graphPos[c.id]) {
        var ang = (Math.PI * 2 * i / Math.max(1, n)) - Math.PI / 2;
        w.graphPos[c.id] = { x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R };
      }
    });
    var html = '<defs><filter id="glow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    (w.rels || []).forEach(function (r) {
      var a = w.graphPos[r.a], b = w.graphPos[r.b];
      if (!a || !b) return;
      var col = REL_COLOR[r.type] || '#94a3b8';
      html += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + col + '" stroke-opacity=".45" stroke-width="' + (1 + (r.intensity || 2) * 0.4) + '"/>';
      html += '<text x="' + ((a.x + b.x) / 2) + '" y="' + (((a.y + b.y) / 2) - 4) + '" fill="' + col + '" font-size="9" text-anchor="middle" opacity=".85">' + esc(r.type || '') + '</text>';
    });
    w.chars.forEach(function (c) {
      var p = w.graphPos[c.id];
      var sel = S.sel === c.id;
      html += '<g data-node="' + esc(c.id) + '" style="cursor:grab">' +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (sel ? 21 : 18) + '" fill="rgba(124,58,237,.26)" stroke="' + (sel ? '#22d3ee' : '#8b5cf6') + '" stroke-width="' + (sel ? 2.4 : 1.4) + '" filter="url(#glow)"/>' +
        '<text x="' + p.x + '" y="' + (p.y + 4) + '" fill="#fff" font-size="11" text-anchor="middle" font-weight="700">' + esc(String(c.name || '?').slice(0, 2)) + '</text>' +
        '<text x="' + p.x + '" y="' + (p.y + 34) + '" fill="#c9bfe2" font-size="9.5" text-anchor="middle">' + esc(c.name || '') + '</text></g>';
    });
    svg.innerHTML = html;
    var drag = null, moved = false;
    svg.onpointerdown = function (e) {
      var t = e.target.closest ? e.target.closest('[data-node]') : null;
      if (!t) return;
      var id = t.getAttribute('data-node'), p = w.graphPos[id];
      var pt = svgPoint(svg, e);
      drag = { id: id, dx: p.x - pt.x, dy: p.y - pt.y, sx: e.clientX, sy: e.clientY };
      moved = false;
      try { svg.setPointerCapture(e.pointerId); } catch (x) {}
    };
    svg.onpointermove = function (e) {
      if (!drag) return;
      if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) moved = true;
      var pt = svgPoint(svg, e), p = w.graphPos[drag.id];
      p.x = Math.max(24, Math.min(W - 24, pt.x + drag.dx));
      p.y = Math.max(24, Math.min(H - 30, pt.y + drag.dy));
      drawGraph(w);
    };
    svg.onpointerup = function () {
      if (!drag) return;
      var id = drag.id; drag = null;
      if (moved) { touch(); }
      else { S.sel = id; openForm('chars', id); }
    };
  }
  function svgPoint(svg, e) {
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return { x: (e.clientX - r.left) * (vb.width / r.width), y: (e.clientY - r.top) * (vb.height / r.height) };
  }

  /* ---------------- 表单 ---------------- */
  function fieldControl(w, f, v) {
    if (f.img) {
      return '<div class="imgbox' + (formImg ? ' has' : '') + '" id="imgBox" style="' + (formImg ? 'background-image:url(' + imgUrl(formImg) + ')' : '') + '">' +
        '<span>' + (formImg ? '点击更换图片' : '点击上传图片') + '</span></div>' +
        '<div class="imgacts"><button type="button" class="btn gho mini" id="imgPick">上传图片</button>' +
        '<button type="button" class="btn gho mini" id="imgClear">清除</button></div>';
    }
    if (f.ref) {
      var arr = w[f.ref] || [];
      return '<select data-k="' + f.k + '"><option value="">未选择</option>' + arr.map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (String(v) === String(x.id) ? ' selected' : '') + '>' + esc(x.name || x.title || '未命名') + '</option>';
      }).join('') + '</select>';
    }
    if (f.select) {
      return '<select data-k="' + f.k + '">' + f.select.map(function (o) {
        return '<option' + (String(v) === o ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('') + '</select>';
    }
    if (f.area) return '<textarea data-k="' + f.k + '">' + esc(v) + '</textarea>';
    return '<input data-k="' + f.k + '" value="' + esc(v) + '">';
  }
  function charFields() {
    return [
      F('name', '姓名', { req: 1 }), F('alias', '别名 / 称号'), F('gender', '性别'), F('age', '年龄'),
      F('race', '种族 / 身份'), F('role', '定位 / 身份'), F('factionId', '所属势力', { ref: 'factions' }),
      F('placeId', '常驻地点', { ref: 'places' }), F('img', '角色立绘', { img: 1 }),
      F('look', '外貌', { area: 1 }), F('persona', '性格', { area: 1 }), F('background', '身世', { area: 1 }),
      F('ability', '能力', { area: 1 }), F('like', '喜好'), F('habit', '口癖 / 习惯'), F('taboo', '禁忌'),
      F('weakness', '弱点'), F('goal', '目标'), F('secret', '秘密'), F('desc', '简介', { area: 1 })
    ];
  }
  function openForm(type, id) {
    var w = cur(); if (!w) return;
    var conf = type === 'chars' ? { title: id ? '编辑角色档案' : '新建角色档案', fields: charFields() } : SCHEMA[type];
    if (!conf) return;
    var item = {};
    if (id) {
      var arr = w[type] || [];
      for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) item = arr[i];
    }
    formImg = item.img || '';
    var h = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<button class="ibtn close" data-a="closeMask">✕</button><h3>' + esc(conf.title) + '</h3>';
    conf.fields.forEach(function (f) {
      var v = item[f.k] == null ? '' : item[f.k];
      h += '<div class="field"><label>' + esc(f.l) + (f.req ? ' *' : '') + '</label>' + fieldControl(w, f, v) + '</div>';
    });
    h += '<div class="field"><label>自定义字段</label><div id="cfWrap">';
    (item.fields || []).forEach(function (cf) {
      h += '<div class="cf-row"><input class="cf-k" placeholder="字段名" value="' + esc(cf.k) + '"><input class="cf-v" placeholder="内容" value="' + esc(cf.v) + '"><button type="button" class="cf-del" data-a="cfDel">✕</button></div>';
    });
    h += '</div><button type="button" class="btn gho mini" id="cfAdd">＋ 添加字段</button></div>';
    if (type === 'chars' && id) h += '<div class="hint">提示：立绘会显示在角色档案与互动小说的档案面板中。</div>';
    h += '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button>' +
      (type === 'chars' ? '<button class="btn gho" data-a="aiChar">AI 补全空白</button>' : '') +
      '<button class="btn pri" data-a="saveEnt" data-type="' + type + '" data-id="' + (id || '') + '">保存</button></div>' +
      '</div></div>';
    modal.innerHTML = h;
    var box = $('imgBox');
    if (box) {
      box.onclick = function () { pickImg(function (u) { formImg = u; box.style.backgroundImage = 'url(' + u + ')'; box.classList.add('has'); }, type === 'chars' ? 640 : 560); };
      var bp = $('imgPick'); if (bp) bp.onclick = function () { box.onclick(); };
      var bc = $('imgClear'); if (bc) bc.onclick = function () { formImg = ''; box.style.backgroundImage = ''; box.classList.remove('has'); };
    }
    var add = $('cfAdd');
    if (add) add.onclick = function () {
      var wrap = $('cfWrap'); var d = document.createElement('div'); d.className = 'cf-row';
      d.innerHTML = '<input class="cf-k" placeholder="字段名"><input class="cf-v" placeholder="内容"><button type="button" class="cf-del" data-a="cfDel">✕</button>';
      wrap.appendChild(d);
    };
  }
  function saveEntity(type, id) {
    var w = cur(); if (!w) return;
    var sheet = modal.querySelector('.sheet'); if (!sheet) return;
    var data = {};
    sheet.querySelectorAll('[data-k]').forEach(function (el) { data[el.getAttribute('data-k')] = el.value.trim(); });
    var cf = [];
    sheet.querySelectorAll('.cf-row').forEach(function (row) {
      var k = row.querySelector('.cf-k').value.trim(), v = row.querySelector('.cf-v').value.trim();
      if (k) cf.push({ k: k, v: v });
    });
    data.fields = cf;
    if (type !== 'chars') data.img = formImg || data.img || '';
    else data.img = formImg || '';
    if (!w[type]) w[type] = [];
    if (id) {
      for (var i = 0; i < w[type].length; i++) if (String(w[type][i].id) === String(id)) {
        for (var k in data) w[type][i][k] = data[k];
      }
      toast('已保存');
    } else {
      data.id = uid(type === 'chars' ? 'c' : 'e');
      w[type].push(data);
      if (type === 'chars' && w.graphPos) delete w.graphPos[data.id];
      toast('已新增');
    }
    touch(); modal.innerHTML = ''; renderEditor();
  }
  function delEntity(type, id) {
    var w = cur(); if (!w) return;
    if (!confirm('删除这条内容？')) return;
    w[type] = (w[type] || []).filter(function (x) { return String(x.id) !== String(id); });
    if (type === 'chars') {
      w.rels = (w.rels || []).filter(function (r) { return r.a !== id && r.b !== id; });
      if (w.graphPos) delete w.graphPos[id];
    }
    if (w.map && w.map.markers) w.map.markers = w.map.markers.filter(function (m) { return String(m.refId) !== String(id); });
    touch(); renderEditor(); toast('已删除');
  }

  function openRelForm(id) {
    var w = cur(); if (!w || w.chars.length < 2) { toast('至少需要两个角色'); return; }
    var item = {};
    if (id) (w.rels || []).forEach(function (r) { if (r.id === id) item = r; });
    var h = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>' + (id ? '编辑关系' : '新增关系') + '</h3>' +
      '<div class="row2"><div class="field"><label>角色 A</label><select data-k="a">' +
      w.chars.map(function (c) { return '<option value="' + esc(c.id) + '"' + (item.a === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
      '</select></div><div class="field"><label>角色 B</label><select data-k="b">' +
      w.chars.map(function (c) { return '<option value="' + esc(c.id) + '"' + (item.b === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
      '</select></div></div>' +
      '<div class="row2"><div class="field"><label>关系类型</label><select data-k="type">' +
      REL_TYPES.map(function (t) { return '<option' + (item.type === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
      '</select></div><div class="field"><label>强度 / 羁绊（1-10）</label><input data-k="intensity" type="number" min="1" max="10" value="' + esc(item.intensity || 5) + '"></div></div>' +
      '<div class="field"><label>备注</label><textarea data-k="note">' + esc(item.note || '') + '</textarea></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="saveRel" data-id="' + (id || '') + '">保存</button></div></div></div>';
    modal.innerHTML = h;
  }
  function saveRel(id) {
    var w = cur(); if (!w) return;
    var sheet = modal.querySelector('.sheet'), data = {};
    sheet.querySelectorAll('[data-k]').forEach(function (el) { data[el.getAttribute('data-k')] = el.value; });
    if (data.a === data.b) { toast('不能和自己建立关系'); return; }
    data.intensity = parseInt(data.intensity, 10) || 5;
    if (id) {
      w.rels.forEach(function (r) { if (r.id === id) for (var k in data) r[k] = data[k]; });
    } else { data.id = uid('r'); w.rels.push(data); }
    touch(); modal.innerHTML = ''; renderEditor(); toast('关系已保存');
  }

  function openWorldForm(id) {
    var w = id ? findWorld(id) : null;
    var item = w || blankWorld('');
    formImg = item.cover || '';
    var h = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<button class="ibtn close" data-a="closeMask">✕</button><h3>' + (w ? '世界设置' : '新建创世世界') + '</h3>' +
      '<div class="field"><label>世界封面</label>' + fieldControl(w || blankWorld(''), { img: 1 }, '') + '</div>' +
      '<div class="field"><label>世界名称 *</label><input data-k="name" value="' + esc(item.name === '未命名世界' ? '' : item.name) + '"></div>' +
      '<div class="row2"><div class="field"><label>类型</label><input data-k="genre" value="' + esc(item.genre || '幻想') + '"></div>' +
      '<div class="field"><label>一句话标语</label><input data-k="tagline" value="' + esc(item.tagline || '') + '"></div></div>' +
      '<div class="row2"><div class="field"><label>历法</label><input data-k="calendar" value="' + esc(item.calendar || '') + '"></div>' +
      '<div class="field"><label>当前纪元</label><input data-k="era" value="' + esc(item.era || '') + '"></div></div>' +
      '<div class="field"><label>世界简介</label><textarea data-k="desc">' + esc(item.desc || '') + '</textarea></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button>' +
      '<button class="btn pri" data-a="saveWorld" data-id="' + (w ? esc(w.id) : '') + '">' + (w ? '保存' : '创建') + '</button></div></div></div>';
    modal.innerHTML = h;
    var box = $('imgBox');
    if (box) {
      box.onclick = function () { pickImg(function (u) { formImg = u; box.style.backgroundImage = 'url(' + u + ')'; box.classList.add('has'); }, 1100); };
      var bp = $('imgPick'); if (bp) bp.onclick = function () { box.onclick(); };
      var bc = $('imgClear'); if (bc) bc.onclick = function () { formImg = ''; box.style.backgroundImage = ''; box.classList.remove('has'); };
    }
  }
  function saveWorld(id) {
    var sheet = modal.querySelector('.sheet'), data = {};
    sheet.querySelectorAll('[data-k]').forEach(function (el) { data[el.getAttribute('data-k')] = el.value.trim(); });
    if (!data.name) { toast('先给世界起个名字'); return; }
    var acc = ['#7c3aed', '#22d3ee'];   // v9.9.2：固定紫罗兰封面，不再提供封面色选择
    if (id) {
      var w = findWorld(id);
      if (w) {
        w.name = data.name; w.genre = data.genre; w.tagline = data.tagline; w.desc = data.desc;
        w.calendar = data.calendar || ''; w.era = data.era || '';
        w.accent = acc; w.cover = formImg || ''; w.updated = now();
      }
    } else {
      var nw = blankWorld(data.name);
      nw.genre = data.genre; nw.tagline = data.tagline; nw.desc = data.desc;
      nw.calendar = data.calendar || ''; nw.era = data.era || '';
      nw.accent = acc; nw.cover = formImg || '';
      S.worlds.push(nw); id = nw.id;
    }
    save(); modal.innerHTML = '';
    if (S.cur && String(S.cur.id) === String(id)) renderEditor(); else openWorld(id);
    toast('已保存');
  }

  /* ---------------- AI 补全角色 ---------------- */
  function collectForm() {
    var sheet = modal.querySelector('.sheet'); if (!sheet) return null;
    var d = {};
    sheet.querySelectorAll('[data-k]').forEach(function (el) { d[el.getAttribute('data-k')] = el.value.trim(); });
    return d;
  }
  function aiChar() {
    var w = cur(); if (!w) return;
    var d = collectForm(); if (!d || !d.name) { toast('先写角色姓名'); return; }
    var btn = modal.querySelector('[data-a="aiChar"]'); if (btn) { btn.disabled = true; btn.textContent = 'AI 补全中…'; }
    var sys = '你是 OC 角色设定师。只输出严格 JSON，不要解释。';
    var user = '世界：' + w.name + '。' + (w.desc || '') + '\n已有角色：' + w.chars.map(function (c) { return c.name; }).join('、') +
      '\n请为角色「' + d.name + '」补齐以下空白字段（已有内容不要改）：' + JSON.stringify(d) +
      '\n只输出 JSON：{"alias":"","gender":"","age":"","race":"","role":"","look":"","persona":"","background":"","ability":"","like":"","habit":"","taboo":"","weakness":"","goal":"","secret":"","desc":""}';
    chat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temp: 0.8, max: 900 }).then(function (txt) {
      var j = parseJson(txt); if (!j) throw new Error('AI 返回格式不对');
      var sheet = modal.querySelector('.sheet');
      sheet.querySelectorAll('[data-k]').forEach(function (el) {
        var k = el.getAttribute('data-k');
        if (!el.value && j[k]) el.value = j[k];
      });
      toast('已补全空白字段');
      if (btn) { btn.disabled = false; btn.textContent = 'AI 补全空白'; }
    }).catch(function (e) {
      toast(e.message || 'AI 补全失败');
      if (btn) { btn.disabled = false; btn.textContent = 'AI 补全空白'; }
    });
  }

  /* ---------------- 世界上下文 / 保存互动小说 ---------------- */
  function buildWorldText(w) {
    var out = [];
    function line(label, arr, fn) {
      if (!arr || !arr.length) return;
      out.push(label + '：' + arr.slice(0, 40).map(fn).join('；'));
    }
    if (w.desc) out.push('世界：' + w.desc);
    if (w.tagline) out.push('标语：' + w.tagline);
    if (w.calendar || w.era) out.push('历法/纪元：' + [w.calendar, w.era].filter(Boolean).join(' · '));
    line('势力', w.factions, function (f) { return f.name + '（' + (f.type || '') + '）目标：' + (f.goal || f.desc || ''); });
    line('地点', w.places, function (p) { return p.name + '（' + (p.type || '') + '）：' + (p.desc || ''); });
    line('角色', w.chars, function (c) { return c.name + '（' + [c.race, c.role, c.alias].filter(Boolean).join('/') + '）：' + [c.persona, c.background, c.ability, c.look].filter(Boolean).join('；'); });
    line('关系', w.rels, function (r) {
      var a = refName(w, 'chars', r.a), b = refName(w, 'chars', r.b);
      return a + '与' + b + '是' + (r.type || '') + (r.note ? '（' + r.note + '）' : '');
    });
    line('历史', w.events, function (e) { return [e.era, e.time, e.title].filter(Boolean).join(' ') + '：' + (e.desc || ''); });
    line('百科', w.lore, function (l) { return (l.cat || '') + '·' + l.title + '：' + (l.content || ''); });
    line('世界书', w.worldbook, function (b) { return b.keys + '：' + b.content; });
    line('物种', w.species, function (s) { return s.name + '（' + (s.type || '') + '）：' + (s.desc || ''); });
    line('草药', w.flora, function (s) { return s.name + '（' + (s.type || '') + '）：' + [s.effect, s.desc].filter(Boolean).join('；'); });
    line('食物', w.foods, function (s) { return s.name + '：' + [s.taste, s.effect, s.desc].filter(Boolean).join('；'); });
    line('物品', w.items, function (s) { return s.name + '（' + (s.type || '') + '）：' + [s.effect, s.desc].filter(Boolean).join('；'); });
    line('经济', w.economy, function (s) { return s.name + '：' + (s.desc || ''); });
    line('信仰', w.faith, function (s) { return s.name + '：' + (s.desc || ''); });
    line('社会', w.society, function (s) { return s.name + '：' + (s.desc || ''); });
    line('科技', w.tech, function (s) { return s.name + '：' + (s.desc || ''); });
    line('职业', w.careers, function (s) { return s.name + '：' + (s.desc || ''); });
    line('能力', w.powers, function (s) { return s.name + '（' + (s.type || '') + '）：' + [s.effect, s.desc].filter(Boolean).join('；'); });
    line('冲突', w.conflicts, function (s) { return s.name + '（' + (s.status || '') + '）：' + [s.parties, s.desc].filter(Boolean).join('；'); });
    line('物流', w.logistics, function (s) { return s.name + '（' + (s.type || '') + '）：' + [s.from, s.to, s.desc].filter(Boolean).join('；'); });
    line('信息', w.infos, function (s) { return s.name + '：' + [s.speed, s.desc].filter(Boolean).join('；'); });
    line('语言', w.langs, function (s) { return s.name + '：' + (s.desc || s.sample || ''); });
    line('剧情线', w.stories, function (s) { return s.name + '：' + (s.desc || ''); });
    line('手记', w.notes, function (s) { return s.name + '：' + (s.desc || ''); });
    if (w.run) out.push('运行状态：人口 ' + (w.run.pop || 0) + '，士气 ' + (w.run.morale || 0) + '，食物 ' + (w.run.food || 0) + '，水 ' + (w.run.water || 0) + '，木材 ' + (w.run.wood || 0) + '，铁矿 ' + (w.run.iron || 0) + '，金币 ' + (w.run.gold || 0));
    if ((w.chapters || []).length) {
      var outline = [];
      w.chapters.forEach(function (ch) {
        outline.push('第' + (ch.title || '') + '：' + (ch.summary || ''));
      });
      out.push('剧情大纲：' + outline.join('；'));
    }
    return out.join('\n').slice(0, 5200);
  }
  function storyStats(w) {
    var eps = 0, nodes = 0;
    (w.chapters || []).forEach(function (ch) { (ch.episodes || []).forEach(function (ep) { eps++; nodes += (ep.nodes || []).length; }); });
    return { eps: eps, nodes: nodes };
  }
  function makeCard(w, mode) {
    var snap = clone(w);
    var st = storyStats(w);
    var card = {
      id: uid('n'), kind: 'novel', mode: mode, ocId: w.id,
      title: w.name, subtitle: w.tagline || (mode === 'script' ? '剧情互动小说' : 'AI 互动小说'),
      tags: [w.genre || '幻想', mode === 'script' ? '剧情互动' : 'AI 互动', '创世世界'],
      desc: w.desc || (w.name + ' · 由创世工坊生成的可玩世界'),
      mark: firstChar(w.name), accent: accent(w.accent), cover: w.cover || '',
      world: buildWorldText(w), chars: snap.chars || [], items: snap.items || [], places: snap.places || [],
      factions: snap.factions || [], rels: snap.rels || [],
      chapters: mode === 'script' ? (snap.chapters || []) : [],
      snapshot: snap, log: [], choices: [], state: null, turn: 0,
      created: now(), updated: now()
    };
    if (mode === 'script') {
      card.log = [{ type: 'sys', text: '《' + w.name + '》互动小说' }];
    } else {
      card.log = [{ type: 'narr', text: w.desc || ('故事在「' + w.name + '」开始。') }];
      card.choices = ['先观察四周', '找个人谈谈', '跟随直觉行动'];
    }
    return card;
  }
  function readMine() {
    try { var a = JSON.parse(localStorage.getItem('sl_story_worlds_v1') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function writeMine(arr) {
    try { localStorage.setItem('sl_story_worlds_v1', JSON.stringify(arr)); return true; }
    catch (e) { toast('书架空间不足，请先导出旧存档'); return false; }
  }
  function saveNovel(mode) {
    var w = cur(); if (!w) return;
    if (mode === 'script') {
      var st = storyStats(w);
      if (!st.nodes) { toast('还没有剧情节点，请先在「剧情」里写章节和选项'); S.tab = 'story'; renderEditor(); return; }
    }
    var mine = readMine();
    var found = null;
    for (var i = 0; i < mine.length; i++) if (mine[i] && String(mine[i].ocId) === String(w.id) && (mine[i].mode || 'ai') === mode) found = mine[i];
    var card;
    if (found) {
      card = makeCard(w, mode); card.id = found.id; card.created = found.created || now();
      for (var k = 0; k < mine.length; k++) if (mine[k].id === found.id) mine[k] = card;
    } else {
      card = makeCard(w, mode); mine.unshift(card);
    }
    if (!writeMine(mine)) return;
    toast(mode === 'script' ? '已保存为剧情互动小说' : '已保存为 AI 互动小说');
    modal.innerHTML = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>已加入书架</h3>' +
      '<p class="sdesc">《' + esc(w.name) + '》已保存为' + (mode === 'script' ? '剧情互动小说' : 'AI 互动小说') + '，会在主页正常排列，点开即可游玩。</p>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">留在工坊</button>' +
      '<button class="btn pri" data-a="goShelf">去书架看看</button></div></div></div>';
  }
  function goShelf() { location.href = 'index.html'; }
  function playWith(mode) {
    var w = cur(); if (!w) return;
    if (mode === 'script') {
      var st = storyStats(w);
      if (!st.nodes) { toast('还没有剧情节点'); S.tab = 'story'; renderEditor(); return; }
    }
    location.href = 'index.html?oc=' + encodeURIComponent(w.id) + '&play=1&mode=' + mode;
  }

  /* ---------------- 导入导出 ---------------- */
  function exportWorld(id) {
    var w = id ? findWorld(id) : cur(); if (!w) return;
    var b = new Blob([JSON.stringify(w, null, 2)], { type: 'application/json;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = w.name + '_创世世界.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function importWorld() {
    var f = document.createElement('input');
    f.type = 'file'; f.accept = '.json,application/json';
    f.onchange = function () {
      var file = f.files && f.files[0]; if (!file) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var j = JSON.parse(String(r.result || ''));
          if (!j || !j.name) throw new Error('bad');
          j.id = uid('w'); j.created = now(); j.updated = now(); ensureWorld(j);
          S.worlds.push(j); save(); renderWorlds(); toast('已导入：' + j.name);
        } catch (e) { toast('不是有效的创世世界 JSON'); }
      };
      r.readAsText(file, 'utf-8');
    };
    f.click();
  }
  function openWorld(id) {
    var w = findWorld(id); if (!w) return renderWorlds();
    ensureWorld(w);
    S.cur = w; S.tab = S.tab || 'hub'; S.sub = S.sub || ''; S.sel = null;
    try { localStorage.setItem('sl_oc_last', id); } catch (e) {}
    renderEditor();
  }

  /* ---------------- 事件 ---------------- */
  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-a]') : null;
      if (t) {
        var a = t.getAttribute('data-a'), id = t.getAttribute('data-id'), type = t.getAttribute('data-type');
        if (a === 'newWorld') { formImg = ''; openWorldForm(''); return; }
        else if (a === 'open') { openWorld(id); return; }
        else if (a === 'delWorld') { if (confirm('删除这个世界？所有角色与设定都会一起删除。')) { S.worlds = S.worlds.filter(function (x) { return String(x.id) !== String(id); }); save(); renderWorlds(); toast('已删除'); } return; }
        else if (a === 'exportWorld') { exportWorld(id); return; }
        else if (a === 'add') { formImg = ''; openForm(type, ''); return; }
        else if (a === 'edit') { openForm(type, id); return; }
        else if (a === 'delEnt') { e.stopPropagation(); delEntity(type, id); return; }
        else if (a === 'saveEnt') { saveEntity(type, id); return; }
        else if (a === 'addRel') { openRelForm(''); return; }
        else if (a === 'editRel') { openRelForm(id); return; }
        else if (a === 'saveRel') { saveRel(id); return; }
        else if (a === 'saveWorld') { saveWorld(id); return; }
        else if (a === 'closeMask') { if (e.target === t || t.classList.contains('close')) modal.innerHTML = ''; return; }
        else if (a === 'export') { exportWorld(); return; }
        else if (a === 'import') { importWorld(); return; }
        else if (a === 'back') { if (S.cur) { S.cur = null; renderWorlds(); } else location.href = 'index.html'; return; }
        else if (a === 'editWorld') { openWorldForm(cur() && cur().id); return; }
        else if (a === 'go') { goModule(t.getAttribute('data-tab'), t.getAttribute('data-sub')); return; }
        else if (a === 'goShelf') { goShelf(); return; }
        else if (a === 'ev') { fireEvent(t.getAttribute('data-kind')); return; }
        else if (a === 'resAdj') { resAdj(); return; }
        else if (a === 'saveRes') { saveRes(); return; }
        else if (a === 'aiChar') { aiChar(); return; }
        else if (a === 'saveNovel') { saveNovel(t.getAttribute('data-mode') || 'script'); return; }
        else if (a === 'playScript') { playWith('script'); return; }
        else if (a === 'playAI') { playWith('ai'); return; }
        else if (a === 'wizard') { runWizard(); return; }
        else if (a === 'cfDel') { var row = t.closest('.cf-row'); if (row) row.parentNode.removeChild(row); return; }
      }
      var tab = e.target.closest ? e.target.closest('[data-tab]') : null;
      if (tab && !tab.getAttribute('data-a')) { S.tab = tab.getAttribute('data-tab'); S.sub = ''; renderEditor(); return; }
      var sub = e.target.closest ? e.target.closest('[data-sub]') : null;
      if (sub) { S.sub = sub.getAttribute('data-sub'); renderEditor(); }
    });
  }

  function boot() {
    load(); bind();
    var q = new URLSearchParams(location.search);
    var id = q.get('id') || '';
    if (!id) { try { id = localStorage.getItem('sl_oc_last') || ''; } catch (e) {} }
    if (id && findWorld(id)) openWorld(id); else renderWorlds();
  }

  window.SLOC = {
    LS: LS, S: S, $: $, view: view, modal: modal,
    esc: esc, toast: toast, uid: uid, now: now, clone: clone, firstChar: firstChar,
    load: load, save: save, ensureWorld: ensureWorld, blankWorld: blankWorld, findWorld: findWorld,
    cur: cur, touch: touch, renderEditor: renderEditor, renderWorlds: renderWorlds, openWorld: openWorld,
    hubView: hubView, goModule: goModule, countOf: countOf,
    SCHEMA: SCHEMA, listView: listView, filterList: filterList, refName: refName,
    charsView: charsView, relsView: relsView, eventsView: eventsView, statsView: statsView,
    auditView: auditView, runView: runView, worldView: worldView, codexView: codexView,
    itemsView: itemsView, createView: createView, loreView: loreView,
    cosmosView: cosmosView, societyView: societyView, lawsView: lawsView, runWizard: runWizard,
    LISTS: LISTS, TABS: TABS, HUB: HUB,
    openForm: openForm, saveEntity: saveEntity, delEntity: delEntity,
    openRelForm: openRelForm, saveRel: saveRel, openWorldForm: openWorldForm, saveWorld: saveWorld,
    pickImg: pickImg, readImg: readImg, imgUrl: imgUrl,
    getCfg: getCfg, chat: chat, parseJson: parseJson, buildWorldText: buildWorldText,
    saveNovel: saveNovel, playWith: playWith, makeCard: makeCard,
    formImgSet: function (v) { formImg = v; }, formImgGet: function () { return formImg; },
    boot: boot
  };
})();
