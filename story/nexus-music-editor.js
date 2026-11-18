/* 巳泷中枢 · 音源时间线编辑器（乐器 / 环境声 / 音效 / 变声 / 录音 / 上传） */
(function () {
  'use strict';
  var KEY = 'sl_nexus_tracks_v1';
  var TOTAL = 30;
  var tracks = [], selected = null, ctx = null, timers = [], record = null, chunks = [], playing = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function toast(t) { var el = $('#nxToast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 3200); }
  function uid(p) { return (p || 'te') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(tracks)); } catch (e) { toast('本机存储已满，音频节点可能未保存。'); } }
  function load() { try { tracks = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { tracks = []; } }
  function audioCtx() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  function freq(v) { return 261.63 * Math.pow(2, v / 12); }
  function tone(at, dur, gain, type, f) {
    var c = audioCtx(), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'triangle'; o.frequency.value = f || 440;
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(Math.max(.001, gain || .05), at + .04);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + dur + .06);
  }
  function noise(at, dur, gain, filter) {
    var c = audioCtx(), len = Math.max(1, Math.floor(c.sampleRate * dur)), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(), g = c.createGain(), bq = c.createBiquadFilter();
    src.buffer = buf; bq.type = 'lowpass'; bq.frequency.value = filter || 1200; g.gain.value = gain || .03;
    src.connect(bq); bq.connect(g); g.connect(c.destination); src.start(at);
  }
  function playTrack(t, base) {
    var c = audioCtx(), kind = t.kind || 'instrument';
    var at = base + Math.max(0, Number(t.start) || 0);
    var dur = Math.max(.2, Number(t.dur) || 3);
    var amp = Math.max(0, Math.min(1, Number(t.gain == null ? .35 : t.gain)));
    if (kind === 'audio' || kind === 'voice') {
      if (!t.data) return;
      fetch(t.data).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return c.decodeAudioData(ab); }).then(function (buf) {
        var src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = kind === 'voice' ? .72 : 1; src.loop = !!t.loop;
        var g = c.createGain(); g.gain.value = amp; src.connect(g); g.connect(c.destination);
        src.start(at); if (!t.loop) src.stop(at + Math.min(dur, buf.duration));
      }).catch(function () { toast('音频「' + t.name + '」解码失败'); });
      return;
    }
    if (kind === 'ambient') { noise(at, dur, .045 * amp, 900); return; }
    if (kind === 'sfx') { noise(at, Math.min(dur, .5), .11 * amp, 2600); tone(at, .35, .05 * amp, 'square', 880); return; }
    // 乐器：不同分类给不同音色
    var type = /鼓|太鼓|tabla|taiko/i.test(t.name) ? 'triangle' : /弦|琴|violin|cello/i.test(t.name) ? 'sawtooth' : 'triangle';
    var step = dur / 4;
    for (var i = 0; i < 4; i++) tone(at + i * step, Math.max(.3, step * .85), .055 * amp, type, freq((i % 4) * 3 + 4));
  }
  function playAll() {
    stopAll(); playing = true;
    var base = audioCtx().currentTime + .12;
    tracks.forEach(function (t) { playTrack(t, base); });
    var end = TOTAL;
    timers.push(setTimeout(function () { playing = false; toast('时间线播放结束。'); }, end * 1000));
  }
  function stopAll() {
    timers.forEach(function (t) { clearTimeout(t); }); timers = []; playing = false;
    if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
  }
  function laneOf(kind) { return ({ instrument: 'instrument', ambient: 'ambient', sfx: 'sfx', audio: 'audio', voice: 'audio' })[kind] || 'instrument'; }
  function draw() {
    var root = $('#teTimeline'); if (!root) return;
    var lanes = root.querySelectorAll('.te-lane');
    [].forEach.call(lanes, function (lane) {
      var kind = lane.getAttribute('data-kind'), box = lane.querySelector('.te-track');
      var list = tracks.filter(function (t) { return laneOf(t.kind) === kind; });
      box.innerHTML = list.length ? list.map(function (t) {
        var left = Math.max(0, Math.min(100, (Number(t.start) || 0) / TOTAL * 100));
        var w = Math.max(2, Math.min(100 - left, (Number(t.dur) || 3) / TOTAL * 100));
        return '<div class="te-node' + (selected === t.id ? ' sel' : '') + '" data-id="' + esc(t.id) + '" style="left:' + left + '%;width:' + w + '%" title="' + esc(t.name) + ' · ' + (t.loop ? '循环' : '单次') + '"><b>' + esc(t.name || '音源') + '</b><em>' + (t.loop ? '↻' : '1×') + '</em><span class="te-resize"></span></div>';
      }).join('') : '<div class="te-empty">拖动添加的音源节点，可左右调整开始时间</div>';
    });
    var info = $('#teInfo');
    if (info) info.textContent = tracks.length + ' 个音源 · 总长 ' + TOTAL + ' 秒 · 自动保存在本机';
  }
  function addTrack(data) {
    var start = Math.max(0, Math.min(TOTAL - .2, Number($('#teStart').value) || 0));
    var dur = Math.max(.2, Math.min(TOTAL - start, Number($('#teDur').value) || 3));
    var t = Object.assign({ id: uid('te'), kind: $('#teKind').value, name: $('#teName').value.trim() || '未命名音源', start: start, dur: dur, loop: $('#teLoop').checked, gain: .35 }, data || {});
    tracks.push(t); selected = t.id; save(); draw();
    toast('已添加「' + t.name + '」，可拖动节点调整位置。');
  }
  function attachDrag() {
    var root = $('#teTimeline'); if (!root) return;
    root.addEventListener('pointerdown', function (e) {
      var node = e.target.closest('.te-node'); if (!node) {
        if (e.target.closest('.te-lane')) { selected = null; draw(); }
        return;
      }
      e.preventDefault();
      var id = node.getAttribute('data-id'), t = tracks.filter(function (x) { return x.id === id; })[0]; if (!t) return;
      selected = id; draw();
      var box = node.parentElement.getBoundingClientRect();
      var sx = e.clientX, start0 = Number(t.start) || 0, resizing = !!e.target.closest('.te-resize');
      var dur0 = Number(t.dur) || 3;
      var move = function (ev) {
        var dx = ev.clientX - sx, sec = dx / box.width * TOTAL;
        if (resizing) t.dur = Math.max(.2, Math.min(TOTAL - t.start, dur0 + sec));
        else t.start = Math.max(0, Math.min(TOTAL - .2, start0 + sec));
        draw();
      };
      var up = function () { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); save(); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    });
    root.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]'); if (del) {
        tracks = tracks.filter(function (x) { return x.id !== del.getAttribute('data-del'); }); selected = null; save(); draw(); toast('音源已删除。');
      }
    });
  }
  function init() {
    if (!$('#musicEditor')) return;
    load(); draw(); attachDrag();
    $('#teAdd').addEventListener('click', function () { addTrack(); });
    $('#tePlay').addEventListener('click', playAll);
    $('#teStop').addEventListener('click', function () { stopAll(); toast('已停止。'); });
    $('#teClear').addEventListener('click', function () { if (!tracks.length) return; if (!confirm('清空所有音源节点？本机保存也会删除。')) return; tracks = []; selected = null; save(); draw(); });
    $('#teDel').addEventListener('click', function () { if (!selected) { toast('先点选一个音源节点。'); return; } tracks = tracks.filter(function (x) { return x.id !== selected; }); selected = null; save(); draw(); });
    $('#teFile').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      if (f.size > 12 * 1024 * 1024) { toast('音频超过 12MB，请先压缩。'); e.target.value = ''; return; }
      var r = new FileReader(); r.onload = function () { addTrack({ kind: 'audio', name: f.name.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, ''), data: r.result }); e.target.value = ''; }; r.readAsDataURL(f);
    });
    $('#teRecord').addEventListener('click', function () {
      if (record && record.state === 'recording') { record.stop(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast('当前浏览器不支持录音。'); return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        chunks = []; record = new MediaRecorder(stream); record.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        record.onstop = function () {
          var blob = new Blob(chunks, { type: chunks[0] ? chunks[0].type : 'audio/webm' }), fr = new FileReader();
          fr.onload = function () { addTrack({ kind: 'voice', name: '我的录音 ' + new Date().toLocaleTimeString(), data: fr.result }); };
          fr.readAsDataURL(blob); stream.getTracks().forEach(function (x) { x.stop(); });
          $('#teRecord').textContent = '录音';
        };
        record.start(); $('#teRecord').textContent = '停止录音';
        toast('正在录音，再点一次停止。');
      }).catch(function () { toast('麦克风权限被拒绝，无法录音。'); });
    });
    window.SL_NEXUS_TRACKS = { get: function () { return tracks; }, play: playAll, stop: stopAll };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
