/* 巳泷世界观中枢 · 数据与交互层 */
(function () {
  'use strict';

  var KEY = 'sl_nexus_v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var uid = function (p) { return (p || 'nx') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var nl = function (v) { return esc(v).replace(/\n/g, '<br>'); };
  var split = function (v) { return String(v || '').split(/[,，、;；\s]+/).filter(Boolean); };
  var toast = function (text) {
    var el = $('#nxToast'); if (!el) return;
    el.textContent = text; el.classList.add('on');
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 2600);
  };
  var download = function (name, text, type) {
    var blob = new Blob([text], { type: type || 'application/json;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
  };

  function empty() {
    return { law: [], rules: [], study: { ancient: [], magic: [] }, items: [], foods: [], species: [], glyphs: [], music: [], audio: [] };
  }
  function seed() {
    return {
      law: [
        { id: 'seed_law_1', name: '以太潮汐常数', type: '世界法则', value: '0.873', unit: '灵质/立方', note: '所有修仙世界的灵气密度基准；低于 0.3 时法术失效，高于 1.2 时妖物躁动。' },
        { id: 'seed_law_2', name: '灵质守恒方程', type: '数学方程', value: 'E = m · c² · ψ', unit: '无量纲', note: 'ψ 为世界意志系数。修仙者燃烧灵质时，差额会转成天劫或妖气，不会凭空消失。' },
        { id: 'seed_law_3', name: '寒铁矿活性', type: '化学性质', value: 'Ⅲ级', unit: '活性等级', note: '极寒世界的铁会吸收体温；接触超过 9 秒造成冻伤，可用于制作冰晶核容器。' }
      ],
      rules: [
        { id: 'seed_rule_1', code: 'C-06', name: '第四下敲门', trigger: '23:00 后，查寝老师敲完三下后的一分钟内出现第四下', effect: '第四下不是老师。不要开门、不要应答、不要从猫眼看；闭眼默数到六十，等走廊灯自己熄灭。', severity: '致命', world: '午夜自习 / 槐阴公寓', law: '以太潮汐常数' },
        { id: 'seed_rule_2', code: 'S-06', name: '罪值重审', trigger: '魂体在第一层乐园停留超过七天', effect: '判官会重新读取生前最后一幕；若罪值仍为 0，可申请转世或留任。申诉期间不得喝孟婆汤。', severity: '世界法则', world: '罪乐园', law: '灵质守恒方程' },
        { id: 'seed_rule_3', code: 'W-06', name: '粮饷三日', trigger: '镇北军粮饷低于三日用量', effect: '军心每日下降 5；士兵可合法拒绝出城作战。解决方式：商会借粮、革命军谈判或裁军。', severity: '危险', world: '烽烟照胆', law: '寒铁矿活性' }
      ],
      study: {
        ancient: [
          { id: 'seed_study_1', type: '功法', name: '云墟双修诀', rank: '筑基 — 金丹', materials: '灵草、妖丹、双修阵盘', steps: '引气入丹田，以双修阵共振；每日子时行功一周天，不可中断超过三日。', effect: '双人修为同步增长；一方受伤，另一方分担三成伤势。', refs: '云墟双修' },
          { id: 'seed_study_2', type: '丹方', name: '九转回温丹', rank: '二品', materials: '冰原苔、赤焰草、妖丹', steps: '冰原苔先去毒，赤焰草取花蕊；文火三转，武火一转，丹成时呈淡金色。', effect: '恢复体温 20，清除一层冻伤；过量服用会灼伤经脉。', refs: '冰晶核' }
        ],
        magic: [
          { id: 'seed_study_3', type: '药品', name: '银月镇静剂', rank: '学徒', materials: '银月草、龙涎、蒸馏水', steps: '银月草冷浸三日，龙涎最后加入；禁止加热，否则产生致幻气体。', effect: '压制魔力暴走，稳定情绪；副作用是短暂失去痛觉。', refs: '龙堡银月' },
          { id: 'seed_study_4', type: '魔法书', name: '《龙语低阶》', rank: '一阶', materials: '龙皮纸、银墨、龙鳞粉', steps: '以龙语吟唱，每个词尾必须落在龙鳞粉划出的圆内；写错一个词会反噬。', effect: '可听懂幼龙情绪；与恶龙谈判时好感 +10。', refs: '龙堡银月' }
        ]
      },
      items: [
        { id: 'seed_item_1', name: '引魂灯', category: '工具', tags: '关键、地府、照明', materials: '白蜡烛、纸灯罩、引魂香', world: '罪乐园', steps: '纸灯罩手绘引路符，蜡烛点燃后不可用嘴吹灭。', desc: '照出活人看不见的路；在第十八层会变成黑色。', image: '' },
        { id: 'seed_item_2', name: '冰晶核', category: '药品', tags: '异能、危险、刷怪', materials: '冰尸颅内结晶', world: '零下七十', steps: '从冰尸颅内取出后立即封入寒铁盒，接触皮肤超过九秒会冻伤。', desc: '吸收后异能 +14、体温 -8；是极寒世界唯一的升级材料。', image: '' }
      ],
      foods: [
        { id: 'seed_food_1', name: '冰原苔', kind: '食材', traits: '寒性、微毒、可入药', steps: '刮去表层冰壳，用雪水浸泡三次，每次一刻钟；不可生吃。', conflicts: '与赤焰草同食会生成剧毒冰焰；孕妇禁食。', toxicity: 2, code: '#TOXIC-2', refs: '冰原苔' },
        { id: 'seed_food_2', name: '孟婆汤', kind: '饮品', traits: '忘忧、记忆、地府', steps: '孟婆以忘川水熬煮，喝一口忘一件事；不可与引魂灯同用。', conflicts: '与引魂灯同用会看见被忘掉的记忆；连续喝三口会失去自我。', toxicity: 1, code: '#MEMORY-1', refs: '孟婆' }
      ],
      species: [
        { id: 'seed_species_1', name: '秦焰', kind: '人物', world: '零下七十', traits: '火系异能、前军人、可靠', lore: '极寒末世里少数还能点起火的人。护目镜下有一双被冻红却不肯闭上的眼睛；他记得每一个被他带出冰原的人。', image: '' },
        { id: 'seed_species_2', name: '段峥', kind: '人物', world: '烽烟照胆', traits: '镇北军少帅、冷面、重信义', lore: '1927 年困守孤城的少帅，怀表停在他父亲死的那天。他不擅长说喜欢，只擅长把军令压在棋盘下。', image: '' }
      ],
      glyphs: [],
      music: [
        { id: 'seed_music_1', name: '中式恐怖 · 楼道风声', mood: 'mystic', scale: 'penta', tempo: 72, duration: 12, tag: '中式恐怖 / 规则怪谈', instruments: ['guzheng', 'bell', 'strings', 'choir'] }
      ],
      audio: []
    };
  }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!raw || typeof raw !== 'object') return empty();
      var d = empty();
      ['law', 'rules', 'items', 'foods', 'species', 'glyphs', 'music', 'audio'].forEach(function (k) { if (Array.isArray(raw[k])) d[k] = raw[k]; });
      if (raw.study && typeof raw.study === 'object') {
        d.study.ancient = Array.isArray(raw.study.ancient) ? raw.study.ancient : [];
        d.study.magic = Array.isArray(raw.study.magic) ? raw.study.magic : [];
      }
      return d;
    } catch (e) { return empty(); }
  }
  var hadStored = !!localStorage.getItem(KEY);
  var DB = load();
  if (!hadStored) DB = seed();
  var filterState = { law: '', rules: '', study: '', items: '', foods: '', species: '' };
  var activeTab = 'home';
  var activeStudy = 'ancient';
  var glyphStrokes = [], glyphCurrent = null, glyphDrawing = false, activeGlyph = null;
  var audioCtx = null;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(DB)); }
    catch (e) { toast('本机存储已满，请先导出并清理部分图片或音频。'); }
  }
  function countAll() {
    var study = DB.study.ancient.length + DB.study.magic.length;
    var map = {
      statLaw: DB.law.length, statRule: DB.rules.length,
      statItem: DB.items.length + DB.foods.length, statGlyph: DB.glyphs.length,
      cLaw: DB.law.length, cRule: DB.rules.length, cStudy: study,
      cItem: DB.items.length, cFood: DB.foods.length, cSpecies: DB.species.length,
      cGlyph: DB.glyphs.length, cMusic: DB.music.length + DB.audio.length
    };
    Object.keys(map).forEach(function (k) { var el = document.getElementById(k); if (el) el.textContent = map[k]; });
    var lawCount = $('#lawCount'); if (lawCount) lawCount.textContent = DB.law.length + ' 条';
    var ruleCount = $('#ruleCount'); if (ruleCount) ruleCount.textContent = DB.rules.length + ' 条';
    var studyCount = $('#studyCount'); if (studyCount) studyCount.textContent = study + ' 条';
    var itemCount = $('#itemCount'); if (itemCount) itemCount.textContent = DB.items.length + ' 件';
    var foodCount = $('#foodCount'); if (foodCount) foodCount.textContent = DB.foods.length + ' 条';
    var speciesCount = $('#speciesCount'); if (speciesCount) speciesCount.textContent = DB.species.length + ' 条';
    var glyphCount = $('#glyphCount'); if (glyphCount) glyphCount.textContent = DB.glyphs.length + ' 个字形';
    var musicCount = $('#musicCount'); if (musicCount) musicCount.textContent = DB.music.length + ' 段配置 · ' + DB.audio.length + ' 段音频';
  }

  function card(title, sub, body, chips, del, img) {
    var tags = (chips || []).map(function (c) {
      var cls = c.cls ? ' ' + c.cls : '';
      return '<span class="nx-chip' + cls + '">' + esc(c.text || c) + '</span>';
    }).join('');
    return '<article class="nx-card" data-text="' + esc((title + ' ' + sub + ' ' + (body || '') + ' ' + (chips || []).map(function (c) { return c.text || c; }).join(' ')).toLowerCase()) + '">' +
      '<button class="nx-del" data-del="' + esc(del) + '">删除</button>' +
      (img ? '<img class="nx-thumb" src="' + esc(img) + '" alt="">' : '') +
      '<div class="sub">' + esc(sub || '') + '</div><h4>' + esc(title) + '</h4>' +
      (body || '') + (tags ? '<div class="meta">' + tags + '</div>' : '') +
      '</article>';
  }
  function field(name, label, value, ph, type) {
    return '<div class="nx-field"><label>' + esc(label) + '</label><input name="' + esc(name) + '" type="' + (type || 'text') + '" placeholder="' + esc(ph || '') + '" value="' + esc(value == null ? '' : value) + '"></div>';
  }

  function renderLaw() {
    var el = $('#lawList'); if (!el) return;
    el.innerHTML = DB.law.length ? DB.law.slice().reverse().map(function (x) {
      var value = [x.value, x.unit].filter(Boolean).join(' ');
      return card(x.name, x.type || '宇宙法则',
        (value ? '<p><b>数值：</b>' + nl(value) + '</p>' : '') + (x.note ? '<p>' + nl(x.note) + '</p>' : ''),
        [{ text: x.type || '法则', cls: 'acc' }], 'law:' + x.id);
    }).join('') : '<div class="nx-empty">还没有法则。先写一条重力、元素活性或世界方程。</div>';
    applyFilter('law');
  }
  function renderRules() {
    var el = $('#ruleList'); if (!el) return;
    el.innerHTML = DB.rules.length ? DB.rules.slice().reverse().map(function (x) {
      return card(x.name, (x.code || 'RULE') + ' · ' + (x.severity || '提示'),
        (x.trigger ? '<p><b>触发：</b>' + nl(x.trigger) + '</p>' : '') + (x.effect ? '<p><b>后果：</b>' + nl(x.effect) + '</p>' : '') + (x.world ? '<p><b>世界：</b>' + nl(x.world) + '</p>' : ''),
        [{ text: x.code || 'RULE', cls: 'code' }, { text: x.severity || '提示' }, { text: x.world || '通用' }], 'rules:' + x.id);
    }).join('') : '<div class="nx-empty">规则库是空的。写一条「不要回应第四下敲门」试试。</div>';
    applyFilter('rules');
  }
  function renderStudy() {
    var el = $('#studyList'); if (!el) return;
    var arr = DB.study[activeStudy] || [];
    el.innerHTML = arr.length ? arr.slice().reverse().map(function (x) {
      var branch = activeStudy === 'ancient' ? '古风 · 修仙' : '魔法 · 药剂';
      return card(x.name, branch + ' · ' + (x.type || ''), 
        (x.rank ? '<p><b>境界 / 等级：</b>' + nl(x.rank) + '</p>' : '') +
        (x.materials ? '<p><b>材料：</b>' + nl(x.materials) + '</p>' : '') +
        (x.steps ? '<p><b>步骤：</b>' + nl(x.steps) + '</p>' : '') +
        (x.effect ? '<p><b>效果 / 代价：</b>' + nl(x.effect) + '</p>' : ''),
        [{ text: branch, cls: 'acc' }, { text: x.type || '条目' }, { text: x.refs || '无关联物品' }],
        'study:' + activeStudy + ':' + x.id);
    }).join('') : '<div class="nx-empty">这个分支还没有条目。古风可写丹方，魔法可写镇静剂。</div>';
    applyFilter('study');
  }
  function renderItems() {
    var el = $('#craftList'); if (!el) return;
    el.innerHTML = DB.items.length ? DB.items.slice().reverse().map(function (x) {
      return card(x.name, (x.category || '物品') + ' · ' + (x.world || '通用'),
        (x.desc ? '<p>' + nl(x.desc) + '</p>' : '') +
        (x.materials ? '<p><b>材料：</b>' + nl(x.materials) + '</p>' : '') +
        (x.steps ? '<p><b>制作：</b>' + nl(x.steps) + '</p>' : ''),
        [{ text: x.category || '物品' }, { text: x.world || '通用', cls: 'acc' }].concat(split(x.tags).map(function (t) { return { text: t }; })),
        'items:' + x.id, x.image);
    }).join('') : '<div class="nx-empty">还没有物品。做一盏引魂灯，或一把能开机关的金钥匙。</div>';
    applyFilter('items');
  }
  function renderFoods() {
    var el = $('#foodList'); if (!el) return;
    el.innerHTML = DB.foods.length ? DB.foods.slice().reverse().map(function (x) {
      var tox = Number(x.toxicity || 0);
      return card(x.name, (x.kind || '食材') + ' · 毒性 ' + tox,
        (x.traits ? '<p><b>特性：</b>' + nl(x.traits) + '</p>' : '') +
        (x.steps ? '<p><b>处理：</b>' + nl(x.steps) + '</p>' : '') +
        (x.conflicts ? '<p><b>相冲：</b>' + nl(x.conflicts) + '</p>' : ''),
        [{ text: x.kind || '食材' }, { text: '毒性 ' + tox, cls: tox > 0 ? 'danger' : '' }].concat(x.code ? [{ text: x.code, cls: 'code' }] : []).concat(split(x.refs).map(function (t) { return { text: '关联 ' + t }; })),
        'foods:' + x.id);
    }).join('') : '<div class="nx-empty">食材库是空的。毒蘑菇、冰原苔、孟婆汤都可以进来。</div>';
    applyFilter('foods');
  }
  function renderSpecies() {
    var el = $('#speciesList'); if (!el) return;
    el.innerHTML = DB.species.length ? DB.species.slice().reverse().map(function (x) {
      return card(x.name, (x.kind || '物种') + ' · ' + (x.world || '通用'),
        (x.traits ? '<p><b>特性：</b>' + nl(x.traits) + '</p>' : '') + (x.lore ? '<p>' + nl(x.lore) + '</p>' : ''),
        [{ text: x.kind || '物种', cls: 'acc' }, { text: x.world || '通用' }].concat(split(x.traits).slice(0, 3).map(function (t) { return { text: t }; })),
        'species:' + x.id, x.image);
    }).join('') : '<div class="nx-empty">还没有档案。人物、妖宠、作物、鬼怪都能建卡，并上传图片。</div>';
    applyFilter('species');
  }

  function applyFilter(key) {
    var q = String(filterState[key] || '').toLowerCase();
    var ids = { law: 'lawList', rules: 'ruleList', study: 'studyList', items: 'craftList', foods: 'foodList', species: 'speciesList' };
    var el = document.getElementById(ids[key]); if (!el) return;
    $$('.nx-card', el).forEach(function (c) {
      var hit = !q || String(c.getAttribute('data-text') || '').indexOf(q) >= 0;
      c.style.display = hit ? '' : 'none';
    });
    var empty = $('.nx-empty', el);
    if (empty) empty.style.display = '';
  }
  function renderAll() { renderLaw(); renderRules(); renderStudy(); renderItems(); renderFoods(); renderSpecies(); renderGlyphs(); renderMusic(); renderAudio(); countAll(); }

  function switchTab(tab) {
    activeTab = tab;
    $$('.nx-tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === tab); });
    $$('.nx-section').forEach(function (s) { s.classList.toggle('on', s.id === 'tab-' + tab); });
    var target = $('#tab-' + tab); if (target && tab !== 'home') target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.hash.slice(1) !== tab) history.replaceState(null, '', '#' + tab);
  }

  /* ---------- 图片 ---------- */
  function imageToData(file, maxSide, cb) {
    if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height, scale = Math.min(1, (maxSide || 640) / Math.max(w, h));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = function () { toast('图片读取失败。'); };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function bindImage(inputName, hiddenId, previewId) {
    var input = $('input[name="' + inputName + '"]'); if (!input) return;
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; if (!f) return;
      imageToData(f, 640, function (data) {
        var hid = document.getElementById(hiddenId); if (hid) hid.value = data;
        var prev = document.getElementById(previewId);
        if (prev) prev.innerHTML = '<img src="' + data + '" alt="">';
        toast('图片已压缩并放进本地档案。');
      });
    });
  }

  /* ---------- 语言 ---------- */
  var cv = $('#glyphCanvas'), gctx = cv ? cv.getContext('2d') : null;
  function drawGlyph() {
    if (!gctx) return;
    gctx.clearRect(0, 0, cv.width, cv.height);
    gctx.lineWidth = 4; gctx.lineCap = 'round'; gctx.lineJoin = 'round'; gctx.strokeStyle = '#d8b36a';
    var all = glyphStrokes.slice(); if (glyphCurrent) all = all.concat([glyphCurrent]);
    all.forEach(function (stroke) {
      if (!stroke || stroke.length < 2) return;
      gctx.beginPath();
      gctx.moveTo(stroke[0].x * cv.width, stroke[0].y * cv.height);
      for (var i = 1; i < stroke.length; i++) gctx.lineTo(stroke[i].x * cv.width, stroke[i].y * cv.height);
      gctx.stroke();
    });
  }
  function canvasPos(e) {
    var r = cv.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) };
  }
  if (cv) {
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      glyphDrawing = true; glyphCurrent = [canvasPos(e)]; drawGlyph();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!glyphDrawing || !glyphCurrent) return;
      glyphCurrent.push(canvasPos(e)); drawGlyph();
    });
    var end = function () {
      if (!glyphDrawing) return;
      glyphDrawing = false;
      if (glyphCurrent && glyphCurrent.length > 1) glyphStrokes.push(glyphCurrent);
      glyphCurrent = null; drawGlyph();
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', function (e) { if (glyphDrawing) end(); });
  }
  function glyphThumb(strokes) {
    var c = document.createElement('canvas'); c.width = 220; c.height = 130;
    var g = c.getContext('2d'); g.fillStyle = '#070a10'; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = '#d8b36a'; g.lineWidth = 2.4; g.lineCap = 'round';
    (strokes || []).forEach(function (s) {
      if (!s || s.length < 2) return;
      g.beginPath(); g.moveTo(s[0].x * c.width, s[0].y * c.height);
      for (var i = 1; i < s.length; i++) g.lineTo(s[i].x * c.width, s[i].y * c.height);
      g.stroke();
    });
    return c.toDataURL('image/png');
  }
  function renderGlyphs() {
    var el = $('#glyphList'); if (!el) return;
    el.innerHTML = DB.glyphs.length ? DB.glyphs.slice().reverse().map(function (g) {
      return '<div class="nx-glyph" data-glyph="' + esc(g.id) + '"><canvas data-glyph-canvas="' + esc(g.id) + '" width="220" height="130"></canvas><b>' + esc(g.name) + '</b><em>' + esc(g.meaning || '未写含义') + '</em></div>';
    }).join('') : '<div class="nx-empty" style="grid-column:1/-1">还没有字形。画一笔，给它一个含义。</div>';
    $$('[data-glyph-canvas]').forEach(function (c) {
      var g = DB.glyphs.filter(function (x) { return x.id === c.getAttribute('data-glyph-canvas'); })[0];
      if (!g) return;
      var ctx2 = c.getContext('2d'); ctx2.fillStyle = '#070a10'; ctx2.fillRect(0, 0, c.width, c.height);
      ctx2.strokeStyle = '#d8b36a'; ctx2.lineWidth = 2.4; ctx2.lineCap = 'round';
      (g.strokes || []).forEach(function (s) {
        if (!s || s.length < 2) return;
        ctx2.beginPath(); ctx2.moveTo(s[0].x * c.width, s[0].y * c.height);
        for (var i = 1; i < s.length; i++) ctx2.lineTo(s[i].x * c.width, s[i].y * c.height);
        ctx2.stroke();
      });
    });
  }
  function loadGlyph(id) {
    var g = DB.glyphs.filter(function (x) { return x.id === id; })[0];
    if (!g) return;
    activeGlyph = id;
    glyphStrokes = JSON.parse(JSON.stringify(g.strokes || []));
    $('#glyphName').value = g.name || '';
    $('#glyphMeaning').value = g.meaning || '';
    $('#glyphCombine').value = g.combine || '';
    drawGlyph();
    toast('已载入字形「' + g.name + '」，保存会更新它。');
  }

  /* ---------- 音乐 ---------- */
  var SCALES = {
    penta: [0, 2, 4, 7, 9], major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10], whole: [0, 2, 4, 6, 8, 10]
  };
  var MOODS = {
    joy: { label: '欢乐', prog: [0, 4, 2, 5], octave: 1, gain: 0.11 },
    bleak: { label: '悲观荒凉', prog: [0, 5, 3, 4], octave: 0, gain: 0.09 },
    war: { label: '战争振奋', prog: [0, 3, 4, 2], octave: 0, gain: 0.1 },
    chill: { label: '休闲', prog: [0, 3, 2, 4], octave: 1, gain: 0.09 },
    romance: { label: '温柔言情', prog: [0, 4, 5, 3], octave: 1, gain: 0.09 },
    mystic: { label: '神秘怪谈', prog: [0, 2, 5, 3], octave: 0, gain: 0.08 }
  };
  var BASE = 261.63;
  function freqOf(semi) { return BASE * Math.pow(2, semi / 12); }
  function readMusic() {
    return {
      mood: ($('#musicMood') || {}).value || 'chill',
      scale: ($('#musicScale') || {}).value || 'penta',
      tempo: Number(($('#musicTempo') || {}).value || 96),
      duration: Number(($('#musicDuration') || {}).value || 12),
      tag: ($('#musicTag') || {}).value || '',
      instruments: $$('#instList input:checked').map(function (x) { return x.value; })
    };
  }
  function tone(ctx, type, freq, at, dur, gain, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(dest || ctx.destination);
    o.start(at); o.stop(at + dur + 0.06);
  }
  function noise(ctx, at, dur, gain, dest) {
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g = ctx.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(dest || ctx.destination); src.start(at);
  }
  function scheduleMusic(ctx, cfg, when) {
    var scale = SCALES[cfg.scale] || SCALES.penta;
    var mood = MOODS[cfg.mood] || MOODS.chill;
    var beat = 60 / Math.max(40, Math.min(180, cfg.tempo));
    var bars = Math.max(2, Math.round(cfg.duration / (beat * 4)));
    var dest = ctx.destination;
    for (var bar = 0; bar < bars; bar++) {
      var t0 = when + bar * beat * 4;
      var deg = mood.prog[bar % mood.prog.length] || 0;
      var root = freqOf(deg + 12 * mood.octave);
      var chord = [root, freqOf(deg + 4 + 12 * mood.octave), freqOf(deg + 7 + 12 * mood.octave)];
      if (cfg.instruments.indexOf('piano') >= 0) {
        chord.forEach(function (f, i) { tone(ctx, 'triangle', f, t0 + i * 0.05, Math.max(0.5, beat * 1.2), mood.gain * 0.7, dest); });
      }
      if (cfg.instruments.indexOf('strings') >= 0) {
        chord.forEach(function (f) { tone(ctx, 'sawtooth', f / 2, t0, beat * 3.8, mood.gain * 0.5, dest); });
      }
      if (cfg.instruments.indexOf('synth') >= 0) {
        tone(ctx, 'square', root / 2, t0, beat * 3.6, mood.gain * 0.5, dest);
        tone(ctx, 'square', root * 1.5, t0 + beat * 2, beat * 1.6, mood.gain * 0.3, dest);
      }
      if (cfg.instruments.indexOf('bass') >= 0) {
        tone(ctx, 'triangle', root / 4, t0, beat * 3.9, mood.gain * 0.9, dest);
      }
      if (cfg.instruments.indexOf('guzheng') >= 0) {
        [0, 2, 4, 7].forEach(function (step, i) { tone(ctx, 'triangle', freqOf(deg + step + 12), t0 + i * beat * 0.5, beat * 0.55, mood.gain * 0.65, dest); });
      }
      if (cfg.instruments.indexOf('erhu') >= 0) {
        var e = ctx.createOscillator(), eg = ctx.createGain();
        e.type = 'sawtooth'; e.frequency.setValueAtTime(root, t0); e.frequency.linearRampToValueAtTime(root * 1.08, t0 + beat * 2);
        eg.gain.setValueAtTime(0.0001, t0); eg.gain.exponentialRampToValueAtTime(mood.gain * 0.55, t0 + 0.08); eg.gain.exponentialRampToValueAtTime(0.0001, t0 + beat * 3.4);
        e.connect(eg); eg.connect(dest); e.start(t0); e.stop(t0 + beat * 3.6);
      }
      if (cfg.instruments.indexOf('flute') >= 0) {
        for (var b = 0; b < 4; b++) tone(ctx, 'sine', freqOf(scale[(bar * 3 + b) % scale.length] + 12), t0 + b * beat, beat * 0.7, mood.gain * 0.55, dest);
      }
      if (cfg.instruments.indexOf('drums') >= 0) {
        noise(ctx, t0, 0.16, mood.gain * 0.75, dest);
        noise(ctx, t0 + beat * 2, 0.12, mood.gain * 0.5, dest);
      }
      if (cfg.instruments.indexOf('bell') >= 0) {
        tone(ctx, 'sine', root * 2, t0 + beat, beat * 2.6, mood.gain * 0.55, dest);
      }
      if (cfg.instruments.indexOf('choir') >= 0) {
        tone(ctx, 'sine', root * 1.25, t0, beat * 3.8, mood.gain * 0.4, dest);
        tone(ctx, 'sine', root * 1.25 * 1.01, t0, beat * 3.8, mood.gain * 0.3, dest);
      }
      var TIMBRES = {
        guitar: ['triangle', 1, 1.4], harp: ['sine', 1.6, 1.8], trumpet: ['sawtooth', 1.8, 1.3], sax: ['square', 1.4, 1.6],
        organ: ['sine', 0.7, 3.6], koto: ['triangle', 1.3, 1.2], cello: ['sawtooth', 0.4, 3.5], violin: ['sawtooth', 2, 3.4],
        accordion: ['square', 0.8, 2.6], suona: ['sawtooth', 2.4, 1.5], pipa: ['triangle', 1.8, 1.1], dizi: ['sine', 1.9, 1.5],
        qin: ['triangle', 0.5, 2.4], harmonica: ['sine', 1.2, 1.7]
      };
      Object.keys(TIMBRES).forEach(function (name) {
        if (cfg.instruments.indexOf(name) < 0) return;
        var t = TIMBRES[name];
        tone(ctx, t[0], root * t[1], t0 + (name === 'harp' || name === 'pipa' ? beat * 0.25 : 0), beat * t[2], mood.gain * 0.42, dest);
      });
    }
  }
  function playConfig(cfg) {
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} }
    clearTimeout(window.__nxAudioTimer);
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
    scheduleMusic(audioCtx, cfg, audioCtx.currentTime + 0.15);
    var res = $('#musicResult'); if (res) res.innerHTML = '正在播放：<b>' + esc(MOODS[cfg.mood].label) + '</b> · ' + esc(cfg.scale) + ' · ' + cfg.tempo + ' BPM · ' + cfg.instruments.length + ' 件乐器。';
    window.__nxAudioTimer = setTimeout(function () { try { audioCtx && audioCtx.close(); audioCtx = null; } catch (e) {} }, (cfg.duration + 1) * 1000);
  }
  function encodeWav(buffer) {
    var ch = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length;
    var bytes = 44 + len * ch * 2, ab = new ArrayBuffer(bytes), view = new DataView(ab);
    var write = function (off, str) { for (var i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
    write(0, 'RIFF'); view.setUint32(4, bytes - 8, true); write(8, 'WAVE'); write(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true); view.setUint32(24, sr, true); view.setUint32(28, sr * ch * 2, true); view.setUint16(32, ch * 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, len * ch * 2, true);
    var off = 44;
    for (var i = 0; i < len; i++) for (var c = 0; c < ch; c++) { var s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i])); view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2; }
    return new Blob([ab], { type: 'audio/wav' });
  }
  function exportWav(cfg) {
    var sr = 44100, oac = new OfflineAudioContext(2, Math.floor(sr * Math.max(6, cfg.duration)), sr);
    scheduleMusic(oac, cfg, 0.05);
    var res = $('#musicResult'); if (res) res.textContent = '正在离线渲染 WAV…';
    oac.startRendering().then(function (buffer) {
      var blob = encodeWav(buffer), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'silong_' + cfg.mood + '_' + Date.now() + '.wav'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1200);
      if (res) res.textContent = 'WAV 已导出。';
    }).catch(function () { if (res) res.textContent = 'WAV 渲染失败，请换一个浏览器再试。'; });
  }
  function renderMusic() {
    var el = $('#musicList'); if (!el) return;
    el.innerHTML = DB.music.length ? DB.music.slice().reverse().map(function (m) {
      var body = '<p><b>乐器：</b>' + nl((m.instruments || []).join('、') || '未选') + '</p>' + (m.tag ? '<p><b>世界标签：</b>' + nl(m.tag) + '</p>' : '') +
        '<div class="bar" style="justify-content:flex-start"><button class="nx-btn" data-playmusic="' + esc(m.id) + '">播放</button><button class="nx-btn" data-wavmusic="' + esc(m.id) + '">导出 WAV</button></div>';
      return card(m.name || '未命名配置', (MOODS[m.mood] || {}).label + ' · ' + m.scale + ' · ' + m.tempo + ' BPM', body,
        [{ text: '配置', cls: 'acc' }, { text: m.tag || '通用' }], 'music:' + m.id);
    }).join('') : '<div class="nx-empty">还没有保存的音乐配置。合成一段后点「保存配置」。</div>';
  }
  function renderAudio() {
    var el = $('#audioList'); if (!el) return;
    el.innerHTML = DB.audio.length ? DB.audio.slice().reverse().map(function (a) {
      return '<div class="nx-card"><button class="nx-del" data-del="audio:' + esc(a.id) + '">删除</button><div class="sub">LOCAL AUDIO</div><h4>' + esc(a.name) + '</h4><audio controls src="' + esc(a.data) + '"></audio></div>';
    }).join('') : '<div class="nx-empty">还没有上传音频。风声、雨声、戏班锣鼓都可以放进来。</div>';
  }

  /* ---------- 自动组合 ---------- */
  function autoMusic() {
    var tag = (($('#musicTag') || {}).value || '').toLowerCase();
    var mood = 'chill', scale = 'penta', insts = ['piano', 'strings', 'flute'];
    if (/恐怖|怪谈|校园|地府|罪|规则/.test(tag)) { mood = 'mystic'; scale = 'penta'; insts = ['guzheng', 'bell', 'strings', 'choir']; }
    else if (/末世|战争|军阀|极寒|刷怪/.test(tag)) { mood = 'war'; scale = 'minor'; insts = ['drums', 'bass', 'strings', 'synth']; }
    else if (/修仙|古风|仙|秘境|丹/.test(tag)) { mood = 'mystic'; scale = 'penta'; insts = ['guzheng', 'flute', 'bell', 'strings']; }
    else if (/魔法|龙|异世界|药剂/.test(tag)) { mood = 'mystic'; scale = 'dorian'; insts = ['synth', 'choir', 'bell', 'harp']; }
    else if (/年代|经营|1983|县城/.test(tag)) { mood = 'joy'; scale = 'major'; insts = ['piano', 'guzheng', 'bass']; }
    else if (/都市|言情|BL|心动|雨夜/.test(tag)) { mood = 'romance'; scale = 'major'; insts = ['piano', 'strings', 'flute']; }
    else if (/海岛|生存|潮汐/.test(tag)) { mood = 'chill'; scale = 'penta'; insts = ['flute', 'guzheng', 'strings']; }
    $('#musicMood').value = mood; $('#musicScale').value = scale;
    $$('#instList input').forEach(function (x) { x.checked = insts.indexOf(x.value) >= 0; });
    playConfig(readMusic());
    toast('已按「' + (tag || '通用') + '」组合：' + (MOODS[mood] || {}).label + '。');
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', function (e) {
    var tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) { switchTab(tabBtn.getAttribute('data-tab')); return; }
    var subBtn = e.target.closest('[data-study]');
    if (subBtn) {
      activeStudy = subBtn.getAttribute('data-study');
      $$('.nx-subtab').forEach(function (b) { b.classList.toggle('on', b === subBtn); });
      $('#studyFormTitle').textContent = activeStudy === 'ancient' ? '新增古风功法 / 配方' : '新增魔法药品 / 魔法书';
      $('#studyType').placeholder = activeStudy === 'ancient' ? '功法 / 丹方 / 器方 / 符箓' : '药品 / 魔法书';
      renderStudy(); return;
    }
    var glyph = e.target.closest('[data-glyph]');
    if (glyph) { loadGlyph(glyph.getAttribute('data-glyph')); return; }
    var playM = e.target.closest('[data-playmusic]');
    if (playM) {
      var m = DB.music.filter(function (x) { return x.id === playM.getAttribute('data-playmusic'); })[0];
      if (m) playConfig(m); return;
    }
    var wavM = e.target.closest('[data-wavmusic]');
    if (wavM) {
      var mw = DB.music.filter(function (x) { return x.id === wavM.getAttribute('data-wavmusic'); })[0];
      if (mw) exportWav(mw); return;
    }
    var del = e.target.closest('[data-del]');
    if (del) {
      var parts = del.getAttribute('data-del').split(':');
      var type = parts[0], id = parts[parts.length - 1];
      if (!confirm('删除这条记录？')) return;
      if (type === 'study') { var branch = parts[1]; DB.study[branch] = DB.study[branch].filter(function (x) { return x.id !== id; }); }
      else if (DB[type]) DB[type] = DB[type].filter(function (x) { return x.id !== id; });
      save(); renderAll(); toast('已删除。');
    }
  });
  $$('[data-filter]').forEach(function (inp) {
    inp.addEventListener('input', function () { filterState[inp.getAttribute('data-filter')] = inp.value; applyFilter(inp.getAttribute('data-filter')); });
  });

  $('#lawForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    DB.law.push({ id: uid('law'), name: f.name.value.trim(), type: f.type.value, value: f.value.value.trim(), unit: f.unit.value.trim(), note: f.note.value.trim() });
    save(); f.reset(); renderAll(); toast('法则已写入。');
  });
  $('#ruleForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    DB.rules.push({ id: uid('rule'), code: f.code.value.trim(), name: f.name.value.trim(), trigger: f.trigger.value.trim(), effect: f.effect.value.trim(), severity: f.severity.value, world: f.world.value.trim(), law: f.law.value.trim() });
    save(); f.reset(); renderAll(); toast('规则已写入。');
  });
  $('#studyForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target, branch = f.branch.value;
    DB.study[branch].push({ id: uid('study'), type: f.type.value.trim(), name: f.name.value.trim(), rank: f.rank.value.trim(), materials: f.materials.value.trim(), steps: f.steps.value.trim(), effect: f.effect.value.trim(), refs: f.refs.value.trim() });
    save(); f.reset(); activeStudy = branch; $$('.nx-subtab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-study') === branch); }); renderAll(); toast('学习条目已写入。');
  });
  $('#craftForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    DB.items.push({ id: uid('item'), name: f.name.value.trim(), category: f.category.value, tags: f.tags.value.trim(), materials: f.materials.value.trim(), world: f.world.value.trim(), steps: f.steps.value.trim(), desc: f.desc.value.trim(), image: f.image.value });
    save(); f.reset(); $('#craftImage').value = ''; $('#craftPreview').textContent = '未上传图片'; renderAll(); toast('物品已写入背包与制作库。');
  });
  $('#foodForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    DB.foods.push({ id: uid('food'), name: f.name.value.trim(), kind: f.kind.value, traits: f.traits.value.trim(), steps: f.steps.value.trim(), conflicts: f.conflicts.value.trim(), toxicity: Number(f.toxicity.value || 0), code: f.code.value.trim(), refs: f.refs.value.trim() });
    save(); f.reset(); renderAll(); toast('食材与毒性标记已写入。');
  });
  $('#speciesForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    DB.species.push({ id: uid('species'), name: f.name.value.trim(), kind: f.kind.value, world: f.world.value.trim(), traits: f.traits.value.trim(), lore: f.lore.value.trim(), image: f.image.value });
    save(); f.reset(); $('#speciesImage').value = ''; $('#speciesPreview').textContent = '未上传图片'; renderAll(); toast('档案已写入。');
  });

  $('#glyphForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!glyphStrokes.length) { toast('先在画布上写至少一笔。'); return; }
    var name = $('#glyphName').value.trim(); if (!name) { toast('给字形起个名字。'); return; }
    var data = { id: activeGlyph || uid('glyph'), name: name, meaning: $('#glyphMeaning').value.trim(), combine: $('#glyphCombine').value.trim(), strokes: JSON.parse(JSON.stringify(glyphStrokes)), created: Date.now() };
    if (activeGlyph) {
      DB.glyphs = DB.glyphs.map(function (g) { return g.id === activeGlyph ? data : g; });
    } else DB.glyphs.push(data);
    activeGlyph = data.id; save(); renderGlyphs(); countAll(); toast('字形已保存，笔顺与坐标已持久化。');
  });
  $('#glyphUndo').addEventListener('click', function () { glyphStrokes.pop(); drawGlyph(); });
  $('#glyphClear').addEventListener('click', function () { glyphStrokes = []; glyphCurrent = null; activeGlyph = null; drawGlyph(); $('#glyphName').value = ''; $('#glyphMeaning').value = ''; $('#glyphCombine').value = ''; });
  $('#glyphExport').addEventListener('click', function () { download('silong_language_' + Date.now() + '.json', JSON.stringify({ app: 'silong-nexus', type: 'language', version: 1, exportedAt: new Date().toISOString(), glyphs: DB.glyphs }, null, 2)); toast('字形 JSON 已导出。'); });
  $('#glyphImport').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var fr = new FileReader(); fr.onload = function () {
      try {
        var data = JSON.parse(fr.result), list = Array.isArray(data) ? data : (data.glyphs || []);
        var ok = list.filter(function (g) { return g && g.name && Array.isArray(g.strokes); }).map(function (g) { return { id: g.id || uid('glyph'), name: String(g.name), meaning: String(g.meaning || ''), combine: String(g.combine || ''), strokes: g.strokes, created: g.created || Date.now() }; });
        if (!ok.length) throw new Error('bad');
        DB.glyphs = DB.glyphs.concat(ok); save(); renderGlyphs(); countAll(); toast('导入 ' + ok.length + ' 个字形。');
      } catch (err) { toast('字形 JSON 解析失败。'); }
    }; fr.readAsText(f);
  });

  $('#musicPlay').addEventListener('click', function () { playConfig(readMusic()); });
  $('#musicWav').addEventListener('click', function () { exportWav(readMusic()); });
  $('#musicAuto').addEventListener('click', autoMusic);
  $('#musicForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var cfg = readMusic();
    DB.music.push(Object.assign({ id: uid('music'), name: (cfg.tag || MOODS[cfg.mood].label) + ' · ' + MOODS[cfg.mood].label, created: Date.now() }, cfg));
    save(); renderMusic(); countAll(); toast('音乐配置已保存。');
  });
  $('#audioForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, file = f.file.files && f.file.files[0];
    if (!file) { toast('先选一个音频文件。'); return; }
    if (file.size > 8 * 1024 * 1024) { toast('音频超过 8MB，建议先压缩。'); return; }
    var fr = new FileReader();
    fr.onload = function () { DB.audio.push({ id: uid('audio'), name: f.name.value.trim(), data: fr.result, created: Date.now() }); save(); f.reset(); renderAudio(); countAll(); toast('音频已存到本机。'); };
    fr.readAsDataURL(file);
  });

  $('#exportAll').addEventListener('click', function () { download('silong_nexus_' + Date.now() + '.json', JSON.stringify(DB, null, 2)); toast('中枢数据已导出。'); });
  $('#importAll').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var fr = new FileReader(); fr.onload = function () {
      try {
        var raw = JSON.parse(fr.result); var d = empty();
        ['law', 'rules', 'items', 'foods', 'species', 'glyphs', 'music', 'audio'].forEach(function (k) { if (Array.isArray(raw[k])) d[k] = raw[k]; });
        if (raw.study) { d.study.ancient = Array.isArray(raw.study.ancient) ? raw.study.ancient : []; d.study.magic = Array.isArray(raw.study.magic) ? raw.study.magic : []; }
        DB = d; save(); renderAll(); toast('中枢数据已导入。');
      } catch (err) { toast('导入失败：不是合法 JSON。'); }
    }; fr.readAsText(f);
  });

  $('#modalClose').addEventListener('click', function () { $('#nxModal').classList.remove('on'); });
  $('#nxModal').addEventListener('click', function (e) { if (e.target.id === 'nxModal') e.target.classList.remove('on'); });

  /* ---------- 初始化 ---------- */
  $$('input[name="imageFile"]').forEach(function (inp) {
    var form = inp.closest('form'), hidden = form && form.querySelector('input[name="image"]'), prev = form && form.querySelector('.nx-imgprev');
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      imageToData(f, 640, function (data) { if (hidden) hidden.value = data; if (prev) prev.innerHTML = '<img src="' + data + '" alt="">'; toast('图片已压缩并放进本地档案。'); });
    });
  });
  if (!hadStored) save();
  renderAll();
  if (location.hash && $('#tab-' + location.hash.slice(1))) switchTab(location.hash.slice(1));
  else switchTab('home');
})();
