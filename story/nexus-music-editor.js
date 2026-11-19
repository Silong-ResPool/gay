/* 巳泷中枢 · 音源时间线调音台
   乐器 / 环境声 / 音效与变声 / 录音上传 / 循环模板 / 效果链 / 节点参数 */
(function () {
  'use strict';
  var KEY = 'sl_nexus_tracks_v2';
  var OLD_KEY = 'sl_nexus_tracks_v1';
  var TOTAL = 30;
  var DB = 'sl_nexus_audio_v1';
  var tracks = [], selected = null, ctx = null, timers = [], record = null, chunks = [], playing = false;
  var activeCat = 'instrument';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function toast(t) { var el = $('#nxToast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 3200); }
  function uid(p) { return (p || 'te') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, Number(v) || 0)); }

  var LIB = {
    instrument: [
      { id: 'piano', name: '钢琴', wave: 'triangle', notes: [0, 4, 7, 12, 7, 4] },
      { id: 'violin', name: '小提琴', wave: 'sawtooth', notes: [0, 3, 7, 10, 7, 3] },
      { id: 'cello', name: '大提琴', wave: 'sawtooth', notes: [-7, -2, 0, 5, 0, -2] },
      { id: 'flute', name: '长笛', wave: 'sine', notes: [0, 5, 9, 12, 9, 5] },
      { id: 'drum', name: '低音鼓', wave: 'triangle', notes: [-12, -12, -7, -12] },
      { id: 'taiko', name: '太鼓', wave: 'triangle', notes: [-12, -10, -12, -7] },
      { id: 'bell', name: '风铃', wave: 'sine', notes: [12, 16, 19, 24] },
      { id: 'guqin', name: '古琴', wave: 'sine', notes: [0, 2, 5, 7, 4] },
      { id: 'morin', name: '马头琴', wave: 'sawtooth', notes: [-5, 0, 3, 7, 3] }
    ],
    ambient: [
      { id: 'rain', name: '雨声', noise: 'rain', filter: 1800 },
      { id: 'wind', name: '风声', noise: 'wind', filter: 700 },
      { id: 'sea', name: '海浪', noise: 'sea', filter: 1200 },
      { id: 'forest', name: '森林', noise: 'forest', filter: 1100 },
      { id: 'fire', name: '火焰', noise: 'fire', filter: 2400 },
      { id: 'thunder', name: '远雷', noise: 'thunder', filter: 420 },
      { id: 'night', name: '夜虫', noise: 'night', filter: 3200 }
    ],
    sfx: [
      { id: 'magic', name: '魔法闪光', wave: 'sine', notes: [12, 16, 19, 24, 19], effect: 'reverb', amount: .6 },
      { id: 'impact', name: '冲击', wave: 'square', notes: [-12, -12], effect: 'distortion', amount: .5 },
      { id: 'whoosh', name: '呼啸', wave: 'sine', notes: [3, 8, 15], effect: 'filter', amount: .4 },
      { id: 'door', name: '门扉', wave: 'triangle', notes: [-8, -3, 0], effect: 'delay', amount: .4 },
      { id: 'glass', name: '玻璃', wave: 'sine', notes: [18, 24, 30], effect: 'reverb', amount: .5 },
      { id: 'sigil', name: '咒印', wave: 'sine', notes: [0, 7, 12, 7], effect: 'chorus', amount: .5 }
    ],
    voice: [
      { id: 'robot', name: '机器人变声', effect: 'robot', amount: .7 },
      { id: 'deep', name: '低沉男声', effect: 'deep', amount: .5, rate: .78 },
      { id: 'whisper', name: '耳语', effect: 'whisper', amount: .6, rate: .95 },
      { id: 'sweet', name: '清亮人声', effect: 'filter', amount: .35, rate: 1.08 },
      { id: 'demon', name: '恶魔低语', effect: 'distortion', amount: .45, rate: .68 }
    ]
  };
  function findPreset(id) {
    var found = null;
    Object.keys(LIB).forEach(function (k) { LIB[k].forEach(function (p) { if (p.id === id) found = p; }); if (activeCat === 'audio') { tracks.forEach(function (t) { if (t.preset === id && !found) found = t; }); } });
    return found;
  }

  /* ---------- 本地持久化：元数据 localStorage，音频数据 IndexedDB ---------- */
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(tracks.map(function (t) { var o = Object.assign({}, t); delete o.data; return o; })));
    } catch (e) { toast('元数据保存失败，请清理浏览器存储空间。'); }
  }
  function normalize(t) {
    t.id = t.id || uid('te');
    t.kind = t.kind || 'instrument';
    t.name = t.name || '未命名音源';
    t.start = clamp(t.start, 0, TOTAL - .2);
    t.dur = clamp(t.dur, .2, TOTAL - t.start);
    t.gain = clamp(t.gain == null ? .35 : t.gain, 0, 1);
    t.pan = clamp(t.pan == null ? 0 : t.pan, -1, 1);
    t.rate = clamp(t.rate == null ? 1 : t.rate, .4, 2.2);
    t.effect = t.effect || 'none';
    t.amount = clamp(t.amount == null ? .5 : t.amount, 0, 1);
    t.loopMode = t.loopMode || (t.loop ? 'inf' : 'once');
    return t;
  }
  function load() {
    var raw = localStorage.getItem(KEY);
    if (!raw) raw = localStorage.getItem(OLD_KEY);
    try { tracks = JSON.parse(raw || '[]') || []; } catch (e) { tracks = []; }
    if (!Array.isArray(tracks)) tracks = [];
    tracks.forEach(normalize);
    // 旧版本把 data URL 直接塞进 localStorage，迁移到 IndexedDB，避免 5MB 上限
    tracks.forEach(function (t) {
      if (t.data) { putAudio(t.id, t.data); delete t.data; t.hasAudio = true; }
    });
    save();
  }
  function idbOpen() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('IndexedDB 不可用')); return; }
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { var db = r.result; if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio'); };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || new Error('IndexedDB 打开失败')); };
    });
  }
  function putAudio(id, data) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('audio', 'readwrite'); tx.objectStore('audio').put(data, id); tx.oncomplete = function () { resolve(true); }; tx.onerror = function () { reject(tx.error); };
      });
    }).catch(function () { return false; });
  }
  function getAudio(id) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('audio', 'readonly'), rq = tx.objectStore('audio').get(id);
        rq.onsuccess = function () { resolve(rq.result || ''); }; rq.onerror = function () { reject(rq.error); };
      });
    }).catch(function () { return ''; });
  }
  function delAudio(id) {
    return idbOpen().then(function (db) {
      var tx = db.transaction('audio', 'readwrite'); tx.objectStore('audio').delete(id); return true;
    }).catch(function () { return false; });
  }
  function clearAudio() {
    return idbOpen().then(function (db) { var tx = db.transaction('audio', 'readwrite'); tx.objectStore('audio').clear(); return true; }).catch(function () { return false; });
  }

  /* ---------- 音频引擎 ---------- */
  function audioCtx() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  function freq(v) { return 261.63 * Math.pow(2, v / 12); }
  function waveFor(t) {
    var p = findPreset(t.preset);
    if (p && p.wave) return p.wave;
    if (/鼓|太鼓|tabla|taiko/i.test(t.name)) return 'triangle';
    if (/弦|琴|violin|cello|马头/i.test(t.name)) return 'sawtooth';
    return 'triangle';
  }
  function notesFor(t) {
    var p = findPreset(t.preset);
    if (p && p.notes) return p.notes;
    if (/鼓|太鼓|tabla|taiko/i.test(t.name)) return [-12, -12, -7, -12];
    if (/铃|bell/i.test(t.name)) return [12, 16, 19, 24];
    return [0, 4, 7, 12, 7, 4];
  }
  function loopCount(t) {
    if (t.loopMode === 'inf') return Infinity;
    if (t.loopMode === '2') return 2;
    if (t.loopMode === '4') return 4;
    return 1;
  }
  function makeImpulse(c, seconds, decay) {
    var len = Math.floor(c.sampleRate * seconds), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay || 2);
    return buf;
  }
  function chain(c, t) {
    var input = c.createGain(), last = input;
    input.gain.value = 1;
    function add(node) { if (last === input) input.connect(node); else last.connect(node); last = node; }
    var amount = clamp(t.amount == null ? .5 : t.amount, 0, 1);
    if (t.effect === 'filter') {
      var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400 - amount * 1900; f.Q.value = .8 + amount * 3; add(f);
    } else if (t.effect === 'delay') {
      var d = c.createDelay(), fb = c.createGain();
      d.delayTime.value = .12 + .16 * amount; fb.gain.value = .12 + .28 * amount;
      input.connect(d); d.connect(fb); fb.connect(d); d.connect(c.destination);
    } else if (t.effect === 'distortion') {
      var ws = c.createWaveShaper(), curve = new Float32Array(256), k = 2 + amount * 55;
      for (var i = 0; i < 256; i++) { var x = i / 128 - 1; curve[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
      ws.curve = curve; ws.oversample = '2x'; add(ws);
    } else if (t.effect === 'chorus') {
      var ch = c.createDelay(), lfo = c.createOscillator(), lg = c.createGain();
      ch.delayTime.value = .018; lfo.frequency.value = .6 + amount * 1.8; lg.gain.value = .006 + .01 * amount;
      lfo.connect(lg); lg.connect(ch.delayTime); add(ch); lfo.start();
      timers.push(function () { try { lfo.stop(); } catch (e) {} });
    } else if (t.effect === 'reverb') {
      var cv = c.createConvolver(); cv.buffer = makeImpulse(c, .35 + amount * .5, 2); add(cv);
    } else if (t.effect === 'robot') {
      var ring = c.createGain(), ro = c.createOscillator();
      ring.gain.value = 0; ro.frequency.value = 24 + amount * 55; ro.connect(ring.gain); input.connect(ring); add(ring); ro.start();
      timers.push(function () { try { ro.stop(); } catch (e) {} });
    } else if (t.effect === 'whisper') {
      var hp = c.createBiquadFilter(), lp = c.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 1100 - amount * 500; lp.type = 'lowpass'; lp.frequency.value = 2000 + amount * 1200;
      add(hp); last.connect(lp); last = lp;
    } else if (t.effect === 'deep') {
      var lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 500 - amount * 260; add(lp2);
    }
    if (c.createStereoPanner) { var pan = c.createStereoPanner(); pan.pan.value = clamp(t.pan == null ? 0 : t.pan, -1, 1); last.connect(pan); pan.connect(c.destination); }
    else last.connect(c.destination);
    if (t.effect === 'delay') input.connect(c.destination);
    return input;
  }
  function tone(c, dest, at, dur, gain, wave, f) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = wave || 'triangle'; o.frequency.value = f || 440;
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(Math.max(.001, gain || .05), at + Math.min(.08, dur * .2));
    g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    o.connect(g); g.connect(dest); o.start(at); o.stop(at + dur + .06);
  }
  function noiseBuffer(c, kind) {
    var len = Math.floor(c.sampleRate * 2), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = last * (kind === 'wind' ? .96 : .82) + white * (kind === 'rain' ? .32 : .18);
      d[i] = last;
    }
    return buf;
  }
  function playNoise(c, dest, at, dur, kind, t) {
    var src = c.createBufferSource(), g = c.createGain(), bp = c.createBiquadFilter();
    src.buffer = noiseBuffer(c, kind); src.loop = true; g.gain.value = .035 * clamp(t.gain == null ? .35 : t.gain, 0, 1) / .35;
    bp.type = 'bandpass'; bp.frequency.value = (LIB.ambient.filter(function (x) { return x.id === t.preset; })[0] || {}).filter || 1200; bp.Q.value = .7;
    src.connect(bp); bp.connect(g); g.connect(dest); src.start(at); src.stop(at + dur + .1);
  }
  function playSynth(c, dest, t, at, len) {
    var wave = waveFor(t), notes = notesFor(t), count = loopCount(t), repeats = count === Infinity ? Math.max(1, Math.ceil(len / Math.max(.6, t.dur))) : count;
    var pattern = Math.max(.2, Number(t.dur) || 3) / Math.max(1, notes.length);
    var gain = .05 * (Number(t.gain == null ? .35 : t.gain) / .35);
    for (var r = 0; r < repeats; r++) {
      for (var i = 0; i < notes.length; i++) {
        var when = at + r * Math.max(.6, t.dur) + i * pattern;
        if (when > at + len) break;
        tone(c, dest, when, Math.min(pattern * .92, at + len - when), gain, wave, freq(notes[i] + (t.preset === 'bell' ? 7 : 0)));
      }
    }
  }
  function playTrack(t, base) {
    var c = audioCtx(), at = base + t.start, len = Math.min(TOTAL - t.start, Number(t.dur) || 3);
    if (t.kind === 'audio' || t.kind === 'voice') {
      if (t.kind === 'voice' && !t.data && !t.hasAudio) {
        var chainDest = chain(c, t);
        playSynth(c, chainDest, Object.assign({}, t, { dur: len, kind: 'instrument' }), at, len);
        return;
      }
      var resolve = t.data ? Promise.resolve(t.data) : getAudio(t.id);
      resolve.then(function (data) {
        if (!data) { toast('音频「' + t.name + '」没有可播放的数据。'); return; }
        return fetch(data).then(function (r) { return r.arrayBuffer(); });
      }).then(function (ab) {
        if (!ab) return null;
        return c.decodeAudioData(ab.slice(0));
      }).then(function (buf) {
        if (!buf) return;
        var src = c.createBufferSource(), dest = chain(c, t);
        src.buffer = buf; src.playbackRate.value = t.rate || 1; src.loop = !!loopCount(t);
        src.connect(dest);
        var count = loopCount(t), max = at + (count === Infinity ? len : Math.min(len, buf.duration * count / (t.rate || 1)));
        src.start(at); src.stop(Math.max(at + .05, max));
        if (count === Infinity) src.stop(at + len);
      }).catch(function () { toast('音频「' + t.name + '」解码失败，请换一个格式。'); });
      return;
    }
    var dest = chain(c, t);
    if (t.kind === 'ambient') { playNoise(c, dest, at, len, t.preset || 'rain', t); return; }
    if (t.kind === 'sfx') {
      playSynth(c, dest, t, at, Math.min(len, .55));
      playNoise(c, dest, at, Math.min(len, .4), 'fire', t);
      return;
    }
    playSynth(c, dest, Object.assign({}, t, { dur: len }), at, len);
  }
  function playAll() {
    stopAll(); playing = true;
    var base = audioCtx().currentTime + .12;
    tracks.forEach(function (t) { playTrack(t, base); });
    timers.push(setTimeout(function () { playing = false; toast('时间线播放结束。'); }, TOTAL * 1000));
    toast('正在播放：' + tracks.length + ' 个音源节点。');
  }
  function stopAll() {
    timers.forEach(function (t) { if (typeof t === 'function') try { t(); } catch (e) {} else clearTimeout(t); }); timers = [];
    playing = false;
    if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
  }

  /* ---------- 时间线绘制 ---------- */
  function laneOf(kind) { return ({ instrument: 'instrument', ambient: 'ambient', sfx: 'sfx', audio: 'audio', voice: 'audio' })[kind] || 'instrument'; }
  function draw() {
    var root = $('#teTimeline'); if (!root) return;
    $$('.te-lane', root).forEach(function (lane) {
      var kind = lane.getAttribute('data-kind'), box = lane.querySelector('.te-track');
      var list = tracks.filter(function (t) { return laneOf(t.kind) === kind; });
      box.innerHTML = list.length ? list.map(function (t) {
        var left = clamp(t.start / TOTAL * 100, 0, 100);
        var w = clamp((t.dur || 3) / TOTAL * 100, 1.5, 100 - left);
        return '<div class="te-node' + (selected === t.id ? ' sel' : '') + '" data-id="' + esc(t.id) + '" style="left:' + left + '%;width:' + w + '%" title="' + esc(t.name) + ' · ' + (t.loopMode === 'once' ? '单次' : t.loopMode === 'inf' ? '无限循环' : '循环 ' + t.loopMode + ' 次') + '"><b>' + esc(t.name || '音源') + '</b><em>' + (t.loopMode === 'once' ? '1×' : t.loopMode === 'inf' ? '∞' : t.loopMode + '×') + '</em><span class="te-resize"></span></div>';
      }).join('') : '<div class="te-empty">从上方音源库添加，或拖动节点调整位置</div>';
    });
    var info = $('#teInfo');
    if (info) info.textContent = tracks.length + ' 个音源 · 总长 ' + TOTAL + ' 秒 · 参数与音频自动保存在本机';
    if (selected) { var t = tracks.filter(function (x) { return x.id === selected; })[0]; if (t) fillInspector(t); else selected = null; }
  }
  function fillInspector(t) {
    var box = $('#teInspector'); if (!box) return;
    box.classList.add('on');
    var fields = { tiName: 'name', tiStart: 'start', tiDur: 'dur', tiGain: 'gain', tiPan: 'pan', tiRate: 'rate', tiAmount: 'amount' };
    Object.keys(fields).forEach(function (id) { var el = $('#' + id); if (el) el.value = t[fields[id]]; });
    if ($('#tiKind')) $('#tiKind').value = t.kind;
    if ($('#tiEffect')) $('#tiEffect').value = t.effect || 'none';
    if ($('#tiLoop')) $('#tiLoop').value = t.loopMode || 'once';
    if ($('#tiName2')) $('#tiName2').value = t.name;
    drawWave(t);
  }
  function drawWave(t) {
    var cv = $('#teWave'); if (!cv) return;
    var g = cv.getContext('2d'), w = cv.width, h = cv.height;
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(241,213,255,.08)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(216,180,254,.7)'; g.beginPath();
    var data = t.data || '';
    if (data) {
      fetch(data).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return audioCtx().decodeAudioData(ab); }).then(function (buf) {
        var ch = buf.getChannelData(0), step = Math.max(1, Math.floor(ch.length / w)), mid = h / 2;
        g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(241,213,255,.06)'; g.fillRect(0, 0, w, h); g.beginPath();
        for (var x = 0; x < w; x++) { var amp = 0; for (var i = 0; i < step; i++) { var sample = Math.abs(ch[x * step + i] || 0); amp = Math.max(amp, sample); } var py = mid - amp * mid * .9; g.moveTo(x, mid); g.lineTo(x, py); }
        g.strokeStyle = 'rgba(216,180,254,.75)'; g.stroke();
      }).catch(function () {});
    } else {
      g.moveTo(0, h / 2); for (var x2 = 0; x2 < w; x2++) g.lineTo(x2, h / 2 + Math.sin(x2 / 12) * 5); g.strokeStyle = 'rgba(216,180,254,.25)'; g.stroke();
    }
  }
  function beginDrag(e) {
    var node = e.target.closest('.te-node'); if (!node) { if (e.target.closest('.te-lane')) { selected = null; draw(); } return; }
    e.preventDefault();
    var id = node.getAttribute('data-id'), t = tracks.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    selected = id; draw();
    var box = node.parentElement.getBoundingClientRect(), sx = e.clientX, start0 = Number(t.start) || 0, dur0 = Number(t.dur) || 3, resizing = !!e.target.closest('.te-resize');
    var move = function (ev) {
      var sec = (ev.clientX - sx) / box.width * TOTAL;
      if (resizing) t.dur = clamp(dur0 + sec, .2, TOTAL - t.start);
      else t.start = clamp(start0 + sec, 0, TOTAL - .2);
      draw();
    };
    var up = function () { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); save(); toast('节点位置已更新。'); };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  }

  /* ---------- 音源库 ---------- */
  function buildTabs() {
    var tabs = $('#teTabs'); if (!tabs) return;
    $$('[data-cat]', tabs).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-cat') === activeCat); });
  }
  function buildLib() {
    var lib = $('#teLib'); if (!lib) return;
    buildTabs();
    if (activeCat === 'audio') {
      var audioTracks = tracks.filter(function (t) { return t.kind === 'audio' || t.kind === 'voice'; });
      lib.innerHTML = (audioTracks.length ? audioTracks.map(function (t) {
        return '<button type="button" class="te-chip" data-lib="' + esc(t.id) + '" data-audio="1"><b>' + esc(t.name) + '</b><small>' + (t.hasAudio || t.data ? '已保存在本机' : '待补充音频') + '</small></button>';
      }).join('') : '<div class="te-lib-empty">还没有自己的录音。用上方「录音」或「上传音频」添加，会永久保存在本机浏览器。</div>') + '<button type="button" class="te-chip te-chip-add" data-open="audio"><b>＋ 添加录音 / 上传音频</b><small>支持 mp3 / wav / m4a / webm</small></button>';
      return;
    }
    var voiceIds = LIB.voice.map(function (p) { return p.id; });
    var list = (LIB[activeCat] || []).concat(activeCat === 'sfx' ? LIB.voice : []);
    lib.innerHTML = list.map(function (p) {
      var kind = voiceIds.indexOf(p.id) >= 0 ? 'voice' : activeCat;
      return '<button type="button" class="te-chip" data-lib="' + esc(p.id) + '" data-kind="' + esc(kind) + '"><b>' + esc(p.name) + '</b><small>' + (kind === 'instrument' ? '乐器音色' : kind === 'ambient' ? '环境声' : kind === 'voice' ? '变声器' : '音效') + '</small></button>';
    }).join('');
  }
  function quickAdd(kind, name, preset, effect) {
    if (!name) return;
    addTrack({ kind: kind, name: name, preset: preset || '', effect: effect || 'none', amount: .5 }, true);
  }
  function addTrack(data, immediate) {
    var start = data && data.start != null ? data.start : Number($('#teStart').value) || 0;
    var dur = data && data.dur != null ? data.dur : Number($('#teDur').value) || 4;
    var t = normalize(Object.assign({
      id: uid('te'), kind: data && data.kind || $('#teKind').value,
      name: data && data.name || $('#teName').value.trim() || '未命名音源',
      start: start, dur: dur, gain: .35, pan: 0, rate: 1,
      loopMode: data && data.loopMode || $('#teLoopMode').value || 'once',
      effect: data && data.effect || 'none', amount: data && data.amount != null ? data.amount : .5,
      preset: data && data.preset || ''
    }, data || {}));
    if (t.kind === 'voice' || t.kind === 'audio') {
      if (t.data) { putAudio(t.id, t.data).then(function () { t.hasAudio = true; delete t.data; save(); }); }
      else if (t.srcId) { getAudio(t.srcId).then(function (d) { if (d) putAudio(t.id, d).then(function () { t.hasAudio = true; save(); }); }); }
    }
    tracks.push(t); selected = t.id; save(); draw(); buildLib();
    toast('已添加「' + t.name + '」，可在检视器里改参数。');
  }
  function updateSelected(prop, value) {
    var t = tracks.filter(function (x) { return x.id === selected; })[0]; if (!t) return;
    if (prop === 'start') t.start = clamp(value, 0, TOTAL - .2);
    else if (prop === 'dur') t.dur = clamp(value, .2, TOTAL - t.start);
    else if (prop === 'gain') t.gain = clamp(value, 0, 1);
    else if (prop === 'pan') t.pan = clamp(value, -1, 1);
    else if (prop === 'rate') t.rate = clamp(value, .4, 2.2);
    else if (prop === 'amount') t.amount = clamp(value, 0, 1);
    else if (prop === 'name') t.name = String(value).slice(0, 40) || '未命名音源';
    else t[prop] = value;
    save(); draw(); buildLib();
    if (prop === 'name' && $('#tiName2')) $('#tiName2').value = t.name;
  }
  function removeSelected() {
    if (!selected) { toast('先点选一个音源节点。'); return; }
    var t = tracks.filter(function (x) { return x.id === selected; })[0];
    if (t && (t.kind === 'audio' || t.kind === 'voice')) delAudio(t.id);
    tracks = tracks.filter(function (x) { return x.id !== selected; }); selected = null; save(); draw(); buildLib(); toast('音源已删除。');
  }
  function duplicateSelected() {
    var t = tracks.filter(function (x) { return x.id === selected; })[0]; if (!t) return;
    var n = Object.assign({}, t, { id: uid('te'), name: t.name + ' 副本', start: Math.min(TOTAL - .2, t.start + .8) });
    delete n.data;
    if (t.hasAudio) getAudio(t.id).then(function (d) { if (d) putAudio(n.id, d).then(function () { n.hasAudio = true; save(); }); });
    tracks.push(normalize(n)); selected = n.id; save(); draw(); buildLib(); toast('已复制节点。');
  }

  /* ---------- 录音 / 上传 ---------- */
  function attachAudioControls() {
    if ($('#teFile')) $('#teFile').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      if (f.size > 30 * 1024 * 1024) { toast('音频超过 30MB，请先压缩。'); e.target.value = ''; return; }
      var r = new FileReader(); r.onload = function () {
        var t = normalize({ id: uid('aud'), kind: 'audio', name: f.name.replace(/\.(mp3|wav|ogg|m4a|aac|webm|flac)$/i, ''), start: 0, dur: 4, gain: .35, pan: 0, rate: 1, loopMode: 'once', effect: 'none', amount: .5, hasAudio: true });
        putAudio(t.id, r.result).then(function () { t.data = null; tracks.push(t); selected = t.id; save(); draw(); buildLib(); toast('已上传「' + t.name + '」，音频保存在本机。'); });
        e.target.value = '';
      }; r.readAsDataURL(f);
    });
    if ($('#teRecord')) $('#teRecord').addEventListener('click', function () {
      if (record && record.state === 'recording') { record.stop(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast('当前浏览器不支持录音。'); return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        chunks = []; record = new MediaRecorder(stream);
        record.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        record.onstop = function () {
          var blob = new Blob(chunks, { type: chunks[0] ? chunks[0].type : 'audio/webm' }), fr = new FileReader();
          fr.onload = function () {
            var t = normalize({ id: uid('voc'), kind: 'voice', name: '我的录音 ' + new Date().toLocaleTimeString(), start: 0, dur: 4, gain: .35, pan: 0, rate: 1, loopMode: 'once', effect: 'none', amount: .5, hasAudio: true });
            putAudio(t.id, fr.result).then(function () { tracks.push(t); selected = t.id; save(); draw(); buildLib(); toast('录音已保存到本机，选择音源即可处理变声。'); });
          };
          fr.readAsDataURL(blob); stream.getTracks().forEach(function (x) { x.stop(); });
          var btn = $('#teRecord'); if (btn) btn.textContent = '录音';
        };
        record.start(); var btn = $('#teRecord'); if (btn) btn.textContent = '停止录音'; toast('正在录音，再点一次停止。');
      }).catch(function () { toast('麦克风权限被拒绝，无法录音。'); });
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (!$('#musicEditor')) return;
    load(); buildLib(); draw(); attachAudioControls();
    $('#teTimeline') && $('#teTimeline').addEventListener('pointerdown', beginDrag);
    $('#teTimeline') && $('#teTimeline').addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]'); if (del) removeSelected();
    });
    $('#teTabs') && $('#teTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return; activeCat = b.getAttribute('data-cat'); buildLib();
    });
    $('#teLib') && $('#teLib').addEventListener('click', function (e) {
      var b = e.target.closest('[data-lib]'); if (!b) return;
      if (b.getAttribute('data-open') === 'audio') { $('#teFile').click(); return; }
      if (b.getAttribute('data-audio')) {
        var src = tracks.filter(function (x) { return x.id === b.getAttribute('data-lib'); })[0];
        if (src) addTrack({ kind: src.kind, name: src.name + ' 副本', srcId: src.id, hasAudio: true, start: 0, dur: src.dur, loopMode: src.loopMode, effect: src.effect, amount: src.amount });
        return;
      }
      var p = findPreset(b.getAttribute('data-lib'));
      if (p) quickAdd(b.getAttribute('data-kind') || activeCat, p.name, p.id, p.effect || 'none', p);
    });
    $('#teKind') && $('#teKind').addEventListener('change', function () { activeCat = this.value === 'audio' ? 'audio' : this.value; buildLib(); });
    $('#teAdd') && $('#teAdd').addEventListener('click', function () { addTrack(); });
    $('#tePlay') && $('#tePlay').addEventListener('click', playAll);
    $('#teStop') && $('#teStop').addEventListener('click', function () { stopAll(); toast('已停止。'); });
    $('#teDel') && $('#teDel').addEventListener('click', removeSelected);
    $('#teClear') && $('#teClear').addEventListener('click', function () { if (!tracks.length) return; if (!confirm('清空所有音源节点？本机保存的音频也会删除。')) return; tracks = []; selected = null; save(); clearAudio(); draw(); buildLib(); });
    var fields = { tiName2: 'name', tiStart: 'start', tiDur: 'dur', tiGain: 'gain', tiPan: 'pan', tiRate: 'rate', tiAmount: 'amount' };
    Object.keys(fields).forEach(function (id) {
      var el = $('#' + id); if (!el) return;
      el.addEventListener('input', function () { updateSelected(fields[id], this.value); });
    });
    ['tiKind', 'tiEffect', 'tiLoop'].forEach(function (id) {
      var el = $('#' + id); if (!el) return;
      el.addEventListener('change', function () { updateSelected(id === 'tiKind' ? 'kind' : id === 'tiEffect' ? 'effect' : 'loopMode', this.value); });
    });
    $('#tiDup') && $('#tiDup').addEventListener('click', duplicateSelected);
    $('#tiDel') && $('#tiDel').addEventListener('click', removeSelected);
    window.SL_NEXUS_TRACKS = { get: function () { return tracks; }, play: playAll, stop: stopAll, add: addTrack, remove: removeSelected, presets: LIB };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
