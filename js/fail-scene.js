/* 巳泷资源库 · 资源加载与「归来」场景
   页面打开先纯黑 + 白字；本地资源全部失效时播放隐藏场景。
   手动预览：在任意页面地址后加 ?sl_fail=1 */
(function () {
  'use strict';
  if (window.__SL_FAIL_SCENE__) return;
  window.__SL_FAIL_SCENE__ = true;
  var BASE = (document.currentScript && document.currentScript.src)
    ? document.currentScript.src.replace(/fail-scene\.js.*$/, '') : '../js/';

  var params = new URLSearchParams(location.search);
  var force = params.get('sl_fail') === '1';
  var errCount = 0;
  var started = false;

  var style = document.createElement('style');
  style.textContent =
    '#slFailMask{position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;align-items:center;justify-content:center;' +
    'opacity:1;transition:opacity .7s ease;overflow:hidden}' +
    '#slFailMask.out{opacity:0;pointer-events:none}' +
    '#slFailMask .sl-load{color:#fff;font-size:14px;letter-spacing:2px;opacity:.92;transition:opacity .5s}' +
    '#slFailMask .sl-blood{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#c4000a;' +
    'font-family:"STKaiti","KaiTi","Songti SC",serif;font-size:clamp(26px,9vw,54px);letter-spacing:6px;font-weight:700;' +
    'text-shadow:0 0 18px rgba(196,0,10,.75),0 0 46px rgba(120,0,4,.6);opacity:0;transition:opacity 2.6s ease;white-space:nowrap}' +
    '#slFailMask .sl-blood.on{opacity:1}' +
    '#slFailMask .sl-photo{position:absolute;inset:0;margin:auto;max-width:86vw;max-height:86vh;object-fit:contain;' +
    'opacity:0;transform:scale(.9);transition:opacity 4s ease,transform 9s ease;filter:saturate(.85) contrast(1.05)}' +
    '#slFailMask .sl-photo.on{opacity:.9;transform:scale(1.06)}' +
    '#slFailMask .sl-vignette{position:absolute;inset:0;pointer-events:none;' +
    'background:radial-gradient(ellipse at center,transparent 38%,rgba(0,0,0,.86) 100%)}';
  document.head.appendChild(style);

  var mask = document.createElement('div');
  mask.id = 'slFailMask';
  mask.innerHTML = '<div class="sl-load">正在加载资源中，请稍后</div><div class="sl-vignette"></div>';
  var boot = function () {
    if (!document.body) { setTimeout(boot, 20); return; }
    document.body.appendChild(mask);
    window.addEventListener('error', function (e) {
      if (e && e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) errCount++;
    }, true);
    setTimeout(function () {
      if (started) return;
      var txt = (document.body.innerText || '').trim();
      if (force || errCount >= 4 || (errCount >= 2 && txt.length < 30)) {
        playRestoreScene();
      } else {
        hideLoader();
      }
    }, force ? 350 : 900);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  function hideLoader() {
    var ld = mask.querySelector('.sl-load');
    if (ld) ld.style.opacity = '0';
    mask.classList.add('out');
    setTimeout(function () { if (mask.parentNode) mask.parentNode.removeChild(mask); }, 800);
  }

  function playRestoreScene() {
    if (started) return;
    started = true;
    ensureAssets(function () { runScene(); });
  }

  /* 资源只在真正触发场景时加载，正常浏览不背 10MB 的内存 */
  function ensureAssets(cb) {
    if (window.SL_FAIL_IMAGE || window.SL_FAIL_AUDIO) { cb(); return; }
    var s = document.createElement('script');
    s.src = BASE + 'fail-assets.js';
    var done = false;
    var fire = function () { if (!done) { done = true; cb(); } };
    s.onload = fire;
    s.onerror = fire;
    document.head.appendChild(s);
    setTimeout(fire, 2500);
  }

  function runScene() {
    var ld = mask.querySelector('.sl-load');
    if (ld) ld.style.opacity = '0';

    var blood = document.createElement('div');
    blood.className = 'sl-blood';
    blood.textContent = '亲爱的，你终于回来了';
    mask.appendChild(blood);
    setTimeout(function () { blood.classList.add('on'); }, 120);

    setTimeout(function () {
      blood.classList.remove('on');
      setTimeout(function () { blood.style.display = 'none'; }, 1800);
      var img = document.createElement('img');
      img.className = 'sl-photo';
      img.alt = '';
      img.src = window.SL_FAIL_IMAGE || '';
      mask.appendChild(img);
      requestAnimationFrame(function () { img.classList.add('on'); });
      startAudio();
    }, 4300);
  }

  function startAudio() {
    var b64 = window.SL_FAIL_AUDIO || '';
    var ctx;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var stopped = false;
    /* 自动播放被浏览器拦截时，轻触黑屏即可恢复声音 */
    if (ctx.state === 'suspended') {
      var resume = function () { try { ctx.resume(); } catch (e) {} };
      mask.addEventListener('click', resume);
      mask.addEventListener('touchstart', resume, { passive: true });
    }

    /* 深夜电台底噪 */
    var noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.035;
    var noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1800;
    var noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.6;
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuf; noise.loop = true;
    noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
    noise.start();

    /* 电台主播（系统中文语音） */
    try {
      if (window.speechSynthesis) {
        var u = new SpeechSynthesisUtterance('亲爱的，你终于回来了。这些年，我一直在等你。今晚，让我的声音陪着你。');
        u.lang = 'zh-CN'; u.rate = 0.82; u.pitch = 0.72; u.volume = 0.9;
        speechSynthesis.speak(u);
      }
    } catch (e) {}

    function finish() {
      if (stopped) return;
      stopped = true;
      try { noise.stop(); } catch (e) {}
      try { speechSynthesis.cancel(); } catch (e) {}
      var photo = mask.querySelector('.sl-photo');
      if (photo) photo.style.opacity = '0';
      setTimeout(function () {
        mask.style.background = '#000';
        mask.classList.add('out');
        setTimeout(function () { if (mask.parentNode) mask.parentNode.removeChild(mask); }, 1200);
      }, 1800);
    }

    if (!b64) { setTimeout(finish, 9000); return; }
    var raw = atob(b64);
    var bytes = new Uint8Array(raw.length);
    for (var k = 0; k < raw.length; k++) bytes[k] = raw.charCodeAt(k);
    ctx.decodeAudioData(bytes.buffer).then(function (buf) {
      var src = ctx.createBufferSource();
      src.buffer = buf;
      /* 同款变声链：失真 → 带通（老收音机）→ 低频增强 */
      var shaper = ctx.createWaveShaper();
      var curve = new Float32Array(1024);
      for (var j = 0; j < 1024; j++) {
        var x = j * 2 / 1024 - 1;
        curve[j] = Math.tanh(x * 2.6);
      }
      shaper.curve = curve;
      var band = ctx.createBiquadFilter();
      band.type = 'bandpass'; band.frequency.value = 1400; band.Q.value = 0.7;
      var low = ctx.createBiquadFilter();
      low.type = 'lowshelf'; low.frequency.value = 220; low.gain.value = 5;
      var g = ctx.createGain(); g.gain.value = 0.92;
      src.connect(shaper); shaper.connect(band); band.connect(low); low.connect(g); g.connect(ctx.destination);
      src.onended = finish;
      src.start();
      /* 防止异常长音频：最多播放 6 分钟后自动收尾 */
      setTimeout(finish, 6 * 60 * 1000);
    }).catch(function () { setTimeout(finish, 9000); });
  }

  window.SL_PLAY_RESTORE = playRestoreScene;
})();
