/* 巳泷世界引擎 · 状态驱动、事件联动、可手动/自动推演
   每个世界只提供 SL_PACK 数据，引擎负责渲染、结算、随机事件、存档。 */
(function () {
  'use strict';
  var P = window.SL_PACK;
  if (!P) { document.body.innerHTML = '<p style="padding:30px;color:#fff">世界包未加载。</p>'; return; }
  var LS = 'sl_world_' + P.id + '_v1';
  var NEXUS = 'sl_nexus_v1';
  var CN = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五'];
  var S = null;
  var $ = function (id) { return document.getElementById(id); };
  var BGM = { ctx: null, gain: null, timer: null, track: null, mood: '', muted: false, started: false };
  var BGM_DEFAULT = [
    { id: 'daily', name: '日常', mood: 'daily', tempo: 66, scale: 'minor', lead: 'piano', pad: 'soft' },
    { id: 'tense', name: '紧张', mood: 'tense', tempo: 96, scale: 'phrygian', lead: 'lowStrings', pad: 'pulse' },
    { id: 'hope', name: '希望', mood: 'hope', tempo: 74, scale: 'major', lead: 'strings', pad: 'warm' }
  ];
  var SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    pentatonic: [0, 2, 4, 7, 9]
  };
  var INSTRUMENTS = {
    piano: { type: 'triangle', gain: .18, decay: .32 },
    guitar: { type: 'triangle', gain: .14, decay: .42 },
    cello: { type: 'sawtooth', gain: .12, decay: .7 },
    strings: { type: 'sawtooth', gain: .1, decay: .85 },
    lowStrings: { type: 'sawtooth', gain: .1, decay: .65 },
    guqin: { type: 'triangle', gain: .14, decay: .9 },
    dizi: { type: 'sine', gain: .12, decay: .55 },
    pipa: { type: 'triangle', gain: .12, decay: .3 },
    synth: { type: 'square', gain: .08, decay: .3 },
    pulse: { type: 'sawtooth', gain: .07, decay: .2 },
    flute: { type: 'sine', gain: .11, decay: .6 },
    erhu: { type: 'sawtooth', gain: .1, decay: .72 },
    violin: { type: 'sawtooth', gain: .1, decay: .8 },
    harp: { type: 'sine', gain: .12, decay: .9 },
    bell: { type: 'sine', gain: .09, decay: .95 },
    choir: { type: 'sine', gain: .07, decay: 1.1 },
    sitar: { type: 'sawtooth', gain: .11, decay: .52 },
    oud: { type: 'triangle', gain: .12, decay: .62 },
    koto: { type: 'triangle', gain: .12, decay: .4 },
    suona: { type: 'sawtooth', gain: .1, decay: .48 },
    organ: { type: 'sine', gain: .07, decay: .9 },
    taiko: { type: 'triangle', gain: .1, decay: .22 },
    tabla: { type: 'triangle', gain: .09, decay: .18 },
    kalimba: { type: 'sine', gain: .1, decay: .55 },
    theremin: { type: 'sine', gain: .08, decay: .8 },
    gamelan: { type: 'triangle', gain: .1, decay: .7 },
    marimba: { type: 'triangle', gain: .12, decay: .35 }
  };
  function bgmList() { return (P.bgm && P.bgm.length ? P.bgm : BGM_DEFAULT); }
  function trackFor(mood) {
    var list = bgmList();
    var hit = list.filter(function (t) { return t.mood === mood; })[0];
    if (!hit) hit = list.filter(function (t) { return t.mood === 'daily'; })[0] || list[0];
    return hit;
  }
  function audioCtx() {
    if (BGM.ctx) return BGM.ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      BGM.ctx = new AC();
      BGM.gain = BGM.ctx.createGain();
      BGM.gain.gain.value = BGM.muted ? 0 : 0.16;
      BGM.gain.connect(BGM.ctx.destination);
    } catch (e) { return null; }
    return BGM.ctx;
  }
  function note(freq, dur, opt) {
    var ctx = audioCtx(); if (!ctx) return;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = opt.type; o.frequency.value = freq;
    var t = ctx.currentTime;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(opt.gain, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(BGM.gain);
    o.start(t); o.stop(t + dur + .03);
  }
  function noisePad() {
    var ctx = audioCtx(); if (!ctx) return;
    var len = ctx.sampleRate * 1.6, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * .12;
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = 'lowpass'; f.frequency.value = 520; g.gain.value = .02;
    src.connect(f); f.connect(g); g.connect(BGM.gain); src.start(); src.stop(ctx.currentTime + 1.6);
  }
  function tick() {
    if (!BGM.ctx || BGM.muted || !BGM.track) return;
    var t = BGM.track, scale = SCALES[t.scale] || SCALES.minor, root = 196;
    var step = Math.floor((Date.now() / 1000) / (60 / (t.tempo || 72)) ) % 8;
    var inst = INSTRUMENTS[t.lead] || INSTRUMENTS.piano;
    var degree = scale[step % scale.length];
    var freq = root * Math.pow(2, degree / 12 + (step === 5 ? 12 : 0) / 12);
    note(freq, inst.decay, inst);
    if (step === 0 || step === 4) note(root / 2, .9, { type: 'sine', gain: .05 });
    if (step === 2 && (t.mood === 'tense' || t.mood === 'horror')) note(root * 1.06, .28, { type: 'sawtooth', gain: .04 });
    if (step === 0 && (t.pad === 'waves' || t.pad === 'rain' || t.pad === 'space' || t.pad === 'storm' || t.pad === 'wind' || t.pad === 'dark')) noisePad();
  }
  function setBgm(mood, force) {
    mood = mood || 'daily';
    if (!force && BGM.mood === mood && BGM.timer) return;
    BGM.mood = mood;
    BGM.track = trackFor(mood);
    clearInterval(BGM.timer); BGM.timer = null;
    if (BGM.muted) { updateBgmBtn(); return; }
    var ctx = audioCtx();
    if (!ctx) { updateBgmBtn(); return; }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    BGM.timer = setInterval(tick, Math.max(180, (60 / (BGM.track.tempo || 72)) * 1000 / 2));
    tick();
    updateBgmBtn();
  }
  function toggleBgm() {
    BGM.muted = !BGM.muted;
    try { localStorage.setItem('sl_bgm_muted', BGM.muted ? '1' : '0'); } catch (e) {}
    if (BGM.gain) BGM.gain.gain.value = BGM.muted ? 0 : .16;
    if (!BGM.muted) setBgm(BGM.mood || 'daily', true); else clearInterval(BGM.timer);
    updateBgmBtn();
    toast(BGM.muted ? '背景音乐已关闭。' : '背景音乐已开启：' + (BGM.track ? BGM.track.name : ''));
  }
  function updateBgmBtn() {
    var b = $('wgBgmBtn');
    if (!b) return;
    b.classList.toggle('on', !BGM.muted && !!BGM.timer);
    var n = b.querySelector('span');
    if (n) n.textContent = BGM.muted ? '音乐' : (BGM.track ? BGM.track.name : '音乐');
    b.title = BGM.track ? 'BGM：' + BGM.track.name : '背景音乐';
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function resolve(v, s) { return typeof v === 'function' ? v(s || S) : v; }
  function clamp(n, a, b) { n = Number(n); if (!isFinite(n)) n = a; return Math.max(a, Math.min(b, n)); }
  function defStat(key) {
    var a = (P.stats || []).filter(function (x) { return x.key === key; })[0] || {};
    return a;
  }
  function defRel(key) {
    var a = (P.relations || []).filter(function (x) { return x.key === key; })[0] || {};
    return a;
  }
  function nexus() {
    try { var n = JSON.parse(localStorage.getItem(NEXUS) || '{}'); return n && typeof n === 'object' ? n : {}; }
    catch (e) { return {}; }
  }
  function itemDef(id) {
    var d = (P.items || {})[id];
    if (d) { var a = {}; for (var k in d) a[k] = d[k]; a.id = id; return a; }
    var n = nexus();
    if (n.items) {
      var hit = n.items.filter(function (x) { return x.id === id; })[0];
      if (hit) { var b = {}; for (var k2 in hit) b[k2] = hit[k2]; return b; }
    }
    return { id: id, name: id, desc: '未归档物品', tags: [] };
  }
  function defaultState() {
    var st = { v: 1, id: P.id, day: 1, turn: 0, scene: P.start, place: '', stats: {}, rel: {}, flags: {}, items: [], skills: [], visited: {}, eventsDone: {}, log: [], lastEvent: null, ended: null, entered: '' };
    (P.stats || []).forEach(function (x) { st.stats[x.key] = (x.init == null ? 0 : x.init); });
    (P.relations || []).forEach(function (x) { st.rel[x.key] = (x.init == null ? 0 : x.init); });
    (P.startItems || []).forEach(function (x) { addItem(st, x.id, x.qty || 1); });
    st.skills = (P.skills || []).map(function (x) { return x.id || x; });
    return st;
  }
  function addItem(st, id, qty) {
    qty = Number(qty || 1); if (!qty) qty = 1;
    var ex = st.items.filter(function (x) { return x.id === id; })[0];
    if (ex) { ex.qty += qty; return; }
    st.items.push({ id: id, qty: qty });
  }
  function removeItem(st, id, qty) {
    qty = Number(qty || 1);
    var ex = st.items.filter(function (x) { return x.id === id; })[0];
    if (!ex) return;
    ex.qty -= qty;
    if (ex.qty <= 0) st.items = st.items.filter(function (x) { return x.id !== id; });
  }
  function load() {
    try { var x = JSON.parse(localStorage.getItem(LS) || 'null'); if (x && x.v === 1 && x.id === P.id) return x; } catch (e) {}
    return null;
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
  function log(text, kind) {
    if (!text) return;
    S.log.push({ t: S.day, text: String(text), kind: kind || '' });
    if (S.log.length > 80) S.log = S.log.slice(-80);
  }
  function toast(text) {
    var el = $('wgToast'); if (!el) return;
    el.textContent = text; el.classList.add('on');
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 3000);
  }

  function apply(eff) {
    if (!eff) return;
    eff = resolve(eff, S) || {};
    if (eff.if && !resolve(eff.if, S)) return;
    if (eff.stats) for (var sk in eff.stats) {
      var d = defStat(sk), v = resolve(eff.stats[sk], S);
      var min = d.min == null ? -9999 : d.min, max = d.max == null ? 100 : d.max;
      S.stats[sk] = clamp((Number(S.stats[sk]) || 0) + Number(v || 0), min, max);
    }
    if (eff.rel) for (var rk in eff.rel) {
      var rd = defRel(rk), rv = resolve(eff.rel[rk], S);
      S.rel[rk] = clamp((Number(S.rel[rk]) || 0) + Number(rv || 0), 0, rd.max || 100);
    }
    if (eff.flags) for (var fk in eff.flags) S.flags[fk] = resolve(eff.flags[fk], S);
    if (eff.addItems) eff.addItems.forEach(function (x) { addItem(S, x.id || x, x.qty || 1); });
    if (eff.removeItems) eff.removeItems.forEach(function (x) { removeItem(S, x.id || x, x.qty || 1); });
    if (eff.addSkills) eff.addSkills.forEach(function (x) { if (S.skills.indexOf(x) < 0) S.skills.push(x); });
    if (eff.set) for (var k in eff.set) S[k] = resolve(eff.set[k], S);
    if (eff.log) log(resolve(eff.log, S));
  }
  function availableChoices() {
    var sc = P.scenes[S.scene] || {};
    var list = resolve(sc.choices, S) || [];
    return list.filter(function (c) { return !c.if || resolve(c.if, S); });
  }
  function enterScene(id) {
    if (id == null) return;
    if (!P.scenes[id]) return;
    S.scene = id;
    var sc = P.scenes[id];
    if (sc.place) S.place = resolve(sc.place, S);
    if (sc.onEnter && S.entered !== id) {
      S.entered = id;
      apply(sc.onEnter);
    }
    if (sc.bgm || sc.mood) setBgm(sc.bgm || sc.mood);
    if (!S.visited[id]) S.visited[id] = 1;
  }
  function go(next) {
    if (next == null) return;
    var id = resolve(next, S);
    if (id && P.scenes[id]) enterScene(id);
  }
  function decay() {
    if (!P.decayEvery) P.decayEvery = 1;
    if (S.turn % P.decayEvery !== 0) return;
    (P.decay || []).forEach(function (x) {
      var d = defStat(x.stat), v = Number(x.value == null ? -1 : x.value);
      var min = d.min == null ? -9999 : d.min, max = d.max == null ? 100 : d.max;
      S.stats[x.stat] = clamp((Number(S.stats[x.stat]) || 0) + v, min, max);
    });
  }
  function randomEvent() {
    if (S.ended) return;
    var chance = P.eventChance == null ? 0.34 : P.eventChance;
    if (Math.random() > chance) return;
    var pool = (P.events || []).filter(function (e) { return !S.eventsDone[e.id] && (!e.if || resolve(e.if, S)); });
    if (!pool.length) {
      if (P.idleEvent) {
        var idle = P.idleEvent[Math.floor(Math.random() * P.idleEvent.length)];
        S.lastEvent = { title: idle.title || '环境变化', text: resolve(idle.text, S) };
        if (idle.eff) apply(idle.eff);
        log('事件：' + (idle.title || '环境变化'));
      }
      return;
    }
    var e = pool[Math.floor(Math.random() * pool.length)];
    S.eventsDone[e.id] = 1;
    if (e.eff) apply(e.eff);
    S.lastEvent = { title: e.title || '突发事件', text: resolve(e.text, S) };
    setBgm(e.bgm || e.mood || 'tense');
    log('事件：' + (e.title || '突发事件'), 'event');
  }
  function checkEnding() {
    if (S.ended) return;
    var arr = P.endings || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].if && resolve(arr[i].if, S)) {
        S.ended = arr[i].id;
        setBgm(arr[i].bgm || 'hope');
        log('结局：' + arr[i].title, 'ending');
        return;
      }
    }
  }
  function stepTime() {
    S.turn++;
    var turns = P.turnsPerDay || 6;
    var day = Math.floor((S.turn - 1) / turns) + 1;
    if (day !== S.day) { S.day = day; log('第 ' + day + ' 天。'); }
    decay();
    randomEvent();
    checkEnding();
  }
  function doChoice(c, silent) {
    if (!c) return;
    if (c.eff) apply(c.eff);
    log('选择：' + resolve(c.label, S));
    if (c.next) go(c.next);
    else if (!c.stay) {
      var sc = P.scenes[S.scene] || {};
      if (sc.next) go(sc.next);
    }
    stepTime();
    if (!silent) { save(); render(); }
  }
  function actAuto(n) {
    n = Number(n) || 10;
    var startTurn = S.turn;
    for (var i = 0; i < n; i++) {
      if (S.ended) break;
      var cs = availableChoices();
      if (!cs.length) {
        var sc = P.scenes[S.scene] || {};
        if (sc.next) { go(sc.next); stepTime(); continue; }
        break;
      }
      var c = cs[Math.floor(Math.random() * cs.length)];
      doChoice(c, true);
    }
    save(); render();
    toast('自动推演 ' + (S.turn - startTurn) + ' 回合，状态与关系已更新。');
  }
  function freeAct(text) {
    text = String(text || '').trim();
    if (!text) return;
    var hit = null, pool = P.freeActions || [];
    for (var i = 0; i < pool.length; i++) {
      var a = pool[i];
      if ((a.keys || []).some(function (k) { return text.indexOf(k) >= 0; })) { hit = a; break; }
    }
    if (hit) {
      apply(hit.eff);
      log('行动：' + text);
      if (hit.text) log(resolve(hit.text, S));
      if (hit.next) go(hit.next);
      stepTime();
    } else {
      apply(P.defaultAction || { stats: { sanity: -1 }, log: '你在世界里试着做了一件小事，环境没有明显变化。' });
      log('行动：' + text);
      stepTime();
    }
    save(); render();
    toast('行动已结算，时间推进。');
  }
  function restart(silent) {
    if (!silent && !confirm('重开这个世界？当前存档会被覆盖。')) return;
    S = defaultState();
    enterScene(S.scene);
    save(); render();
    if (!silent) toast('世界已重开。');
  }
  function render() {
    renderSide();
    renderStory();
  }
  function statBar(key) {
    var d = defStat(key), v = Number(S.stats[key]) || 0;
    var min = d.min == null ? 0 : d.min, max = d.max == null ? 100 : d.max;
    var pct = max === min ? 0 : ((v - min) / (max - min)) * 100;
    pct = clamp(pct, 0, 100);
    var danger = d.danger || (key === 'sanity' || key === 'health' || key === 'warmth' || key === 'oxygen');
    return '<div class="wg-stat ' + (danger ? 'danger' : '') + '"><div class="lab"><span>' + esc(d.label || key) + '</span><b>' + v + (d.unit || '') + '</b></div><div class="wg-bar"><i style="width:' + pct + '%"></i></div></div>';
  }
  function renderSide() {
    var cover = $('wgCover');
    if (cover) {
      cover.style.backgroundImage = 'url("' + P.cover + '")';
      cover.innerHTML = '<div class="cap"><b>' + esc(P.title) + '</b><em>' + esc(P.subtitle || '') + '</em></div>';
    }
    var stats = $('wgStats');
    if (stats) stats.innerHTML = (P.stats || []).filter(function (x) { return x.hidden !== true; }).map(function (x) { return statBar(x.key); }).join('');
    var rels = $('wgRel');
    if (rels) {
      var R = P.relations || [];
      rels.innerHTML = R.length ? R.map(function (x) {
        var v = clamp(Number(S.rel[x.key]) || 0, 0, x.max || 100);
        var n = Math.round((v / (x.max || 100)) * 5);
        var hearts = '';
        for (var i = 0; i < 5; i++) hearts += i < n ? '♥' : '♡';
        return '<div class="wg-rel-row"><div class="wg-avatar">' + esc((x.name || x.key).slice(0, 1)) + '</div><div class="nm">' + esc(x.name || x.key) + '<em>' + esc(x.role || '') + '</em></div><div class="wg-hearts" title="' + v + '/' + (x.max || 100) + '">' + hearts + '</div></div>';
      }).join('') : '<div class="wg-empty">这个世界没有登记可攻略角色。</div>';
    }
    var inv = $('wgInv');
    if (inv) {
      inv.innerHTML = S.items.length ? S.items.map(function (x) {
        var d = itemDef(x.id);
        var im = d.image ? '<img src="' + esc(d.image) + '" alt="">' : '<div class="ic">' + esc((d.name || '?').slice(0, 1)) + '</div>';
        var tags = (d.tags || []).slice(0, 3).map(function (t) { return '<span class="wg-tag ' + (String(t).indexOf('毒') >= 0 || String(t).indexOf('危险') >= 0 ? 'danger' : '') + '">' + esc(t) + '</span>'; }).join('');
        return '<div class="wg-item">' + im + '<div class="nm">' + esc(d.name || x.id) + (d.desc ? '<em>' + esc(d.desc) + '</em>' : '') + (tags ? '<div class="wg-tags">' + tags + '</div>' : '') + '</div><span class="qty">×' + x.qty + '</span></div>';
      }).join('') : '<div class="wg-empty">背包还是空的。去场景里搜一搜。</div>';
    }
    var sk = $('wgSkills');
    if (sk) sk.innerHTML = S.skills.length ? S.skills.map(function (x) { var d = (P.skills || []).filter(function (s) { return (s.id || s) === x; })[0] || {}; return '<div class="wg-skill"><i></i><span>' + esc(d.name || x) + '</span></div>'; }).join('') : '<div class="wg-empty">尚未掌握技能。</div>';
    var rules = $('wgRules');
    if (rules) {
      var base = (P.rules || []).map(function (r) { return typeof r === 'string' ? { text: r } : r; });
      var n = nexus(), custom = (n.rules || []).filter(function (r) {
        if (!P.useNexusRules) return false;
        var w = String(r.world || '');
        return !w || w.indexOf(P.title) >= 0;
      }).map(function (r) { return { text: r.name + '：' + (r.effect || r.trigger || ''), code: r.code || 'RULE', custom: true }; });
      var all = base.concat(custom);
      rules.innerHTML = all.length ? all.map(function (r) {
        return '<div class="wg-rule">' + esc(r.text || '') + (r.code ? '<span class="code">' + esc(r.code) + '</span>' : '') + '</div>';
      }).join('') : '<div class="wg-empty">这个世界没有公开规则。</div>';
    }
    var map = $('wgMap');
    if (map) {
      if (P.places && P.places.length) {
        map.innerHTML = P.places.map(function (p) { return '<div class="wg-room ' + (S.place === p.name ? 'cur' : (p.unlocked !== false ? 'unlocked' : '')) + '" title="' + esc(p.desc || '') + '">' + esc(p.name) + '</div>'; }).join('');
      } else if (P.mapNote) {
        map.innerHTML = '<div class="wg-empty">' + esc(P.mapNote) + '</div>';
      } else {
        var wrap = map.closest('.wg-panel'); if (wrap) wrap.style.display = 'none';
      }
    }
    var nx = $('wgNexus');
    if (nx) {
      var links = P.nexusLinks || [];
      nx.innerHTML = links.length ? links.map(function (x) {
        return '<a class="wg-nexus-link" href="../nexus.html#' + encodeURIComponent(x.target || '') + '"><span>' + esc(x.label || x) + '</span><em>' + esc(x.kind || '关联') + '</em></a>';
      }).join('') : '<div class="wg-empty">未登记中枢关联。</div>';
    }
    var idbox = $('wgIdentity');
    if (idbox) idbox.innerHTML = '<span class="wg-tag acc">第 ' + S.day + ' 天</span> <span class="wg-tag">第 ' + (S.turn + 1) + ' 回合</span> <span class="wg-tag">' + esc(P.modeLabel || P.mode || '推演') + '</span>';
  }
  function renderStory() {
    var box = $('wgStory');
    if (!box) return;
    if (S.ended) {
      var end = (P.endings || []).filter(function (x) { return x.id === S.ended; })[0] || {};
      box.innerHTML = '<div class="wg-ending"><div class="seal">✦</div><div class="wg-kicker">ENDING · ' + esc(S.ended) + '</div><h2>' + esc(end.title || '故事落幕') + '</h2><p>' + esc(resolve(end.text || '', S)) + '</p><div class="acts"><button class="pri" data-wg="restart">重新开始</button><button data-wg="auto" data-n="10">再看 10 回合</button><a href="../index.html" style="display:inline-flex;align-items:center;padding:0 15px;height:36px;border-radius:9px;border:1px solid var(--w-line);color:var(--w-sub);text-decoration:none">回世界书架</a></div></div>';
      renderLog(); return;
    }
    var sc = P.scenes[S.scene] || {};
    var choices = availableChoices();
    var title = resolve(sc.title || P.title, S);
    var chapter = sc.chapter || P.chapter || '序章';
    var mode = resolve(sc.mode || P.modeLabel || '推演', S);
    var place = resolve(sc.place || S.place || '', S);
    var body = '<div class="wg-story-head"><span class="mode">' + esc(mode) + '</span><span>' + esc(chapter) + '</span><span class="place">' + esc(place) + '</span></div><div class="wg-story-body">';
    body += '<div class="wg-kicker">' + esc(P.kicker || 'SHENGLONG · WORLD') + '</div>';
    body += '<h1 class="wg-h1">' + title + '</h1>';
    if (S.lastEvent) body += '<div class="wg-event"><b>' + esc(S.lastEvent.title) + '</b>' + esc(S.lastEvent.text) + '</div>';
    body += '<div class="wg-text">' + esc(resolve(sc.text || '', S)) + '</div>';
    if (choices.length) {
      body += '<div class="wg-choices">' + choices.map(function (c, i) {
        return '<button class="wg-choice" data-wg="choice" data-i="' + i + '"><span class="no">' + (i + 1) + '</span><span class="tx"><b>' + esc(resolve(c.label, S)) + '</b>' + (c.hint ? '<em>' + esc(resolve(c.hint, S)) + '</em>' : '') + '</span></button>';
      }).join('') + '</div>';
    } else {
      body += '<div class="wg-toolbar" style="margin-top:16px"><button data-wg="continue">继续</button></div>';
    }
    if (P.free !== false) {
      body += '<form class="wg-free" id="wgFreeForm"><input id="wgFreeInput" placeholder="' + esc(P.freePlaceholder || '自由行动：搜索 / 休息 / 交谈 / 修炼 / 制作 / 地图') + '" autocomplete="off"><button type="submit">执行</button></form>';
    }
    body += '<div class="wg-toolbar"><button data-wg="auto" data-n="10">自动推演 10 回合</button><button data-wg="auto" data-n="30">自动 30 回合</button><button data-wg="save">保存</button><button data-wg="restart">重开</button></div>';
    body += '</div>';
    box.innerHTML = body;
    renderLog();
  }
  function renderLog() {
    var el = $('wgLog');
    if (!el) return;
    el.innerHTML = S.log.slice(-8).reverse().map(function (x) { return '<div class="wg-log-row"><b>D' + x.t + '</b> ' + esc(x.text) + '</div>'; }).join('') || '<div class="wg-empty">还没有记录。你的选择会写进这里。</div>';
  }
  function shell() {
    document.body.dataset.theme = P.theme || 'dashboard';
    document.body.dataset.layout = P.layout || 'dashboard';
    document.body.style.setProperty('--w-accent', P.accent || '#67e8f9');
    document.body.style.setProperty('--w-accent2', P.accent2 || '#8b7dff');
    document.body.style.setProperty('--w-bg', P.bg || '#05070d');
    document.body.style.setProperty('--w-bg2', P.bg2 || '#0a0e18');
    document.body.style.setProperty('--w-cover', 'url("' + P.cover + '")');
    var root = document.createElement('div'); root.className = 'wg-root';
    root.innerHTML =
      '<header class="wg-top">' +
        '<button class="wg-back wg-mobile-toggle" data-wg="side" title="状态面板"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
        '<a class="wg-back" href="../index.html"><svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7"/></svg><span>书架</span></a>' +
        '<div class="wg-brand"><b>' + esc(P.title) + '</b><em>' + esc(P.subtitle || '') + '</em></div>' +
        '<div class="wg-spacer"></div>' +
        '<div class="wg-actions">' +
          '<a href="../nexus.html" title="世界观中枢"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/></svg><span>中枢</span></a>' +
          '<button id="wgBgmBtn" data-wg="bgm" title="背景音乐"><svg viewBox="0 0 24 24"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg><span>音乐</span></button>' +
          '<button data-wg="save" title="保存"><svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v6h8M8 20v-6h8"/></svg><span>保存</span></button>' +
          '<button data-wg="restart" title="重开"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/></svg><span>重开</span></button>' +
        '</div>' +
      '</header>' +
      '<div class="wg-body">' +
        '<aside class="wg-side" id="wgSide">' +
          '<div class="wg-cover" id="wgCover"></div>' +
          '<div class="wg-panel"><div class="wg-panel-h"><b>此刻</b><span class="dot"></span></div><div class="wg-panel-b" id="wgIdentity"></div></div>' +
          '<div class="wg-panel"><div class="wg-panel-h"><b>状态</b><span class="dot"></span></div><div class="wg-panel-b" id="wgStats"></div></div>' +
          '<div class="wg-panel"><div class="wg-panel-h"><b>关系</b><span class="dot"></span></div><div class="wg-panel-b" id="wgRel"></div></div>' +
          '<div class="wg-panel"><div class="wg-panel-h"><b>物品</b><span class="dot"></span></div><div class="wg-panel-b" id="wgInv"></div></div>' +
          '<div class="wg-panel"><div class="wg-panel-h"><b>技能</b><span class="dot"></span></div><div class="wg-panel-b" id="wgSkills"></div></div>' +
          '<div class="wg-panel" id="wgRulesPanel"><div class="wg-panel-h"><b>规则 / 法则</b><span class="dot"></span></div><div class="wg-panel-b"><div class="wg-rules" id="wgRules"></div></div></div>' +
          '<div class="wg-panel" id="wgMapPanel"><div class="wg-panel-h"><b>地点</b><span class="dot"></span></div><div class="wg-panel-b"><div class="wg-map" id="wgMap"></div></div></div>' +
          '<div class="wg-panel" id="wgNexusPanel"><div class="wg-panel-h"><b>中枢关联</b><span class="dot"></span></div><div class="wg-panel-b"><div class="wg-nexus" id="wgNexus"></div></div></div>' +
        '</aside>' +
        '<main class="wg-main">' +
          '<section class="wg-story" id="wgStory"></section>' +
          '<section class="wg-panel wg-log"><div class="wg-panel-h"><b>事件记录</b><span class="dot"></span></div><div class="wg-panel-b"><div class="wg-log-list" id="wgLog"></div></div></section>' +
        '</main>' +
      '</div>' +
      '<div class="wg-toast" id="wgToast"></div>';
    document.body.appendChild(root);
  }
  function bind() {
    document.addEventListener('pointerdown', function () {
      if (BGM.ctx && BGM.ctx.state === 'suspended') { try { BGM.ctx.resume(); } catch (e) {} }
      if (!BGM.muted && BGM.ctx && !BGM.timer) setBgm(BGM.mood || 'daily', true);
    }, { once: true });
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-wg]');
      if (!t) return;
      var a = t.getAttribute('data-wg');
      if (a === 'choice') {
        var cs = availableChoices();
        doChoice(cs[Number(t.getAttribute('data-i'))]);
      } else if (a === 'auto') {
        actAuto(Number(t.getAttribute('data-n')) || 10);
      } else if (a === 'save') { save(); toast('已保存到本机。'); }
      else if (a === 'bgm') { toggleBgm(); }
      else if (a === 'restart') restart();
      else if (a === 'side') {
        var side = $('wgSide'); if (side) side.classList.toggle('open');
      } else if (a === 'continue') {
        var sc = P.scenes[S.scene] || {};
        if (sc.next) { go(sc.next); stepTime(); save(); render(); }
        else toast('这个场景还没有写下一步。');
      }
      if (t.closest('.wg-side')) { var s = $('wgSide'); if (s && window.innerWidth <= 900) s.classList.remove('open'); }
    });
    document.addEventListener('submit', function (e) {
      if (e.target && e.target.id === 'wgFreeForm') {
        e.preventDefault();
        var input = $('wgFreeInput');
        freeAct(input ? input.value : '');
      }
    });
  }
  function start() {
    S = load() || defaultState();
    try { BGM.muted = localStorage.getItem('sl_bgm_muted') === '1'; } catch (e) { BGM.muted = false; }
    if (!S.scene || !P.scenes[S.scene]) S.scene = P.start;
    enterScene(S.scene);
    shell();
    bind();
    render();
    save();
    if (!BGM.muted) setBgm('daily');
    updateBgmBtn();
    window.SL_W = { pack: P, state: function () { return S; }, render: render, act: actAuto, free: freeAct, reset: restart, bgm: setBgm, clear: function () { restart(true); } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
