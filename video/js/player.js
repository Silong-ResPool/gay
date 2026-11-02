/* ==========================================================================
   影视乐园 · player.js
   播放器：自动双内核（hls.js ⇄ WebView 系统播放器）+ 全屏 / 点击暂停 /
          拖动进度条快进 / 倍速 / 画质切换 / 线路切换 / 上一集下一集 /
          播放进度记忆 / 弹幕 / 外部播放器兜底
   ========================================================================== */

(function (w) {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var PL = w.PL = {
    v: null, stage: null, layer: null, wrap: null,
    hls: null, activeCore: '', tried: {}, watchdog: null,
    levels: [], saveAt: 0, onlineDm: [], pendingSeek: -1,
    ratio: { w: 0, h: 0, aspect: '' },   // 视频比例：portrait 竖屏 / landscape 横屏
    fit: 'contain',                       // 尺寸：contain 原始 / cover 铺满 / fill 拉伸
    ctlTimer: null, kind: '',

    /* ---------------------------------------------------------------- 打开 */
    open: function () {
      try {
        var V = w.V;
        var d = V.detail;
        if (!d || !d.playing) return;
        this.v = $('vPlayer');
        this.stage = $('plStage');
        this.layer = $('dmLayer');
        this.wrap = $('plWrap');
        this.cropWrap = $('cropWrap');
        if (!this.v) return;
        // 每次进入播放页重置控件显隐/裁剪，并恢复上次选的尺寸模式
        document.body.classList.remove('ctl-show', 'pl-full', 'pl-playing');
        var fso = $('fsOpts');
        if (fso) fso.hidden = true;
        try {
          var sf = JSON.parse(localStorage.getItem('video_pl_fit') || '"contain"');
          if (['contain', 'cover', 'fill'].indexOf(sf) >= 0) this.fit = sf;
        } catch (e) {}
        this.crop = { mode: 'off', z: 1, tx: 0, ty: 0 };
        try {
          var sc = JSON.parse(localStorage.getItem('video_pl_crop') || '"off"');
          if (['off', '169', '916', '43', 'custom'].indexOf(sc) >= 0) this.crop.mode = sc;
        } catch (e) {}
        this.autoOri = w.V.autoOri !== false;
        this.bind();
        var name = d.item.name, ep = this.epName();
        // 巳泷 v9.1.0：弹幕始终启用 —— 优先自定义弹幕 API（danmaku 中转服务），无 API 用内置弹幕池，不依赖弹弹play
        var dmReady = !!(w.DM && w.DM.engine);
        if (dmReady && this.layer) {
          var local = w.DM.localList(name, ep);
          var merged = local.slice();
          var self3 = this;
          var finish = function (list) {
            try {
              self3.onlineDm = list || [];
              var all = merged.concat(self3.onlineDm);
              w.DM.engine.attach(self3.v, self3.layer);
              var n = w.DM.engine.merge(all, w.DM.builtinList(name, ep, self3.v && self3.v.duration));
              self3.info('当前内核：' + (self3.activeCore || '准备中') + '｜弹幕 ' + n + ' 条');
            } catch (e) {}
          };
          // 自定义 API 优先（用户填了就用它），失败回退内置弹幕池
          w.DM.fetchCustom(name, ep, this.v && this.v.duration).then(function (list) {
            if (list) { finish(list); return; }
            // 用户填了 API 但没拉到 → 给提示但保留内置
            finish(local);
          });
        } else {
          this.info('当前内核：' + (this.activeCore || '准备中'));
        }
        this.load();
      } catch (e) { this.fail('播放器初始化失败：' + e.message); }
    },

    destroy: function () {
      try { if (this.v) { this.v.pause(); } } catch (e) {}
      this.killHls();
      if (this.watchdog) { clearTimeout(this.watchdog); this.watchdog = null; }
      try { w.DM.engine.clearScreen(); } catch (e) {}
      this.activeCore = '';
      this.tried = {};
      this.pendingSeek = -1;
      try {
        document.body.classList.remove('ctl-show', 'pl-full', 'pl-playing');
        var f2 = $('fsOpts'); if (f2) f2.hidden = true;
      } catch (e) {}
      this.crop = null;
    },

    /* ------------------------------------------------------------- 工具 */
    epName: function () {
      try {
        var d = w.V.detail;
        var g = d.groups[d.curFrom] || { eps: [] };
        var ep = g.eps[d.playing.e];
        return ep ? ep.name : '';
      } catch (e) { return ''; }
    },

    epUrl: function () {
      try {
        var d = w.V.detail;
        var g = d.groups[d.curFrom] || { eps: [] };
        var ep = g.eps[d.playing.e];
        return ep ? ep.url : '';
      } catch (e) { return ''; }
    },

    info: function (msg) { try { var el = $('plInfo'); if (el) el.textContent = msg; } catch (e) {} },

    fail: function (msg) {
      this.info('⚠ ' + msg);
      try { w.vToast(msg, 3200); } catch (e) {}
      try { console.error('[PLAYER] ' + msg); } catch (e) {}
    },

    killHls: function () { try { if (this.hls) { this.hls.destroy(); this.hls = null; } } catch (e) { this.hls = null; } },

    /* ------------------------- 快进退档位（10/5/1 秒 + 帧级 + 长按自定义） ------------------------- */
    secKey: function (dir, lvl) { return 'video_pl_sec_' + dir + '_' + lvl; },
    secVal: function (dir, lvl) {
      try { var v = parseFloat(localStorage.getItem(this.secKey(dir, lvl))); if (isFinite(v) && v > 0 && v <= 3600) return v; } catch (e) {}
      return lvl;
    },
    secLabel: function (dir, lvl) {
      var v = this.secVal(dir, lvl);
      return (dir === 'back' ? '« ' : '+') + (Math.floor(v) === v ? v : v.toFixed(1)) + 's' + (dir === 'back' ? '' : ' »');
    },
    setSec: function (dir, lvl, sec) {
      try { localStorage.setItem(this.secKey(dir, lvl), String(sec)); } catch (e) {}
    },

    /* ------------------------- 自动快进（默认关闭；25/10 秒预设 + 自定义，记忆） ------------------------- */
    skipCfg: function () {
      try {
        var c = JSON.parse(localStorage.getItem('video_pl_skip') || '{"on":false,"sec":0}');
        if (typeof c.on !== 'boolean') c.on = false;
        c.sec = parseFloat(c.sec);
        if (!isFinite(c.sec) || c.sec <= 0) { c.on = false; c.sec = 0; }
        return c;
      } catch (e) { return { on: false, sec: 0 }; }
    },
    setSkip: function (on, sec) {
      try { localStorage.setItem('video_pl_skip', JSON.stringify({ on: !!on, sec: parseFloat(sec) || 0 })); } catch (e) {}
    },

    /* 帧级微调：一帧 ≈ 1/25 秒 */
    FRAME: 1 / 25,
    seekFrame: function (dir) {
      try {
        var d = this.v.duration || 0;
        if (!(d > 0)) return;
        var st = (dir > 0 ? 1 : -1) * this.FRAME;
        this.v.currentTime = Math.max(0, Math.min(d - 0.05, (this.v.currentTime || 0) + st));
        this.info((dir > 0 ? '快进' : '快退') + '1帧 → ' + this.fmt(this.v.currentTime));
      } catch (e) {}
    },

    /* ------------------------------------------------------------- 加载 */
    load: function () {
      var url = this.epUrl();
      if (!url) { this.fail('这一集没有播放地址，返回换线路或换源'); return; }
      var mode = (w.V.playerCore || 'auto');       // auto | hls | native
      this.started = false;
      this.kind = /\.m3u8(\?|$)/i.test(url) ? 'hls' : (/\.mp4(\?|$)/i.test(url) ? 'mp4' : 'page');
      if (this.kind === 'page') {
        // 网页地址（非直连视频）：优先嗅探真实视频地址，找不到再提示换源/外部打开
        this.info('网页地址，正在嗅探真实视频源…');
        this.sniffAndPlay(url, mode);
        return;
      }
      this._loadDirect(url, mode);
    },

    // 嗅探网页里的真实视频地址（安卓原生隐藏 WebView / PC 代理抓页）
    sniffAndPlay: function (url, mode) {
      var self = this;
      var t0 = Date.now();
      var done = false;
      var finish = function (found) {
        if (done) return;
        done = true;
        if (self.watchdog) { clearTimeout(self.watchdog); self.watchdog = null; }
        if (found) {
          self.info('嗅探成功：' + String(found).slice(0, 90) + '（' + ((Date.now() - t0) / 1000).toFixed(1) + ' 秒）');
          self.kind = /\.m3u8(\?|$)/i.test(found) ? 'hls' : 'mp4';
          self._loadDirect(found, mode);
        } else {
          // 巳泷 v9.2.2：嗅探不到直链时，若 URL 是 https 网页（如 AdultEmbed 签名播放器页 / Doodstream），
          // 用 iframe 内嵌播放（网页自身播放器运行，用户仍可看），避免「海报能看却看不了」
          if (self.stage && !self.iframePlayer) {
            try {
              var ifr = document.createElement('iframe');
              ifr.className = 'pl-iframe-fallback';
              ifr.src = url;
              ifr.setAttribute('allowfullscreen', 'true');
              ifr.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
              self.iframePlayer = ifr;
              if (self.layer && self.layer.style) self.layer.style.display = 'none';
              self.stage.appendChild(ifr);
              self.info('已用网页播放器内嵌播放（无直链视频源）');
              return;
            } catch (e) {}
          }
          if (self.tried.native || self.tried.hls) self.fail('两种内核都没能播起来（线路可能已失效）：返回换线路 / 换源，或点「外部打开」用手机播放器试试');
          else self.fail('嗅探不到直连视频源（页面可能有反爬/加密播放器）：返回换线路 / 换源，或点「外部打开」');
        }
      };
      var sniff = this.sniffUrl(url);
      if (!sniff) { finish(''); return; }
      sniff.then(function (found) {
        finish(found || '');
      }).catch(function () { finish(''); });
      // 兜底：25 秒还没嗅探到就放弃
      this.watchdog = setTimeout(function () { finish(''); }, 25000);
    },

    // 获取网页里第一个直连视频地址；返回 Promise<string>；环境不支持返回 null
    sniffUrl: function (url) {
      try {
        if (w.VideoNative && w.VideoNative.sniffVideo) {
          return new Promise(function (resolve) {
            var cb = 'sniffCb' + Date.now();
            var timer = null;
            w[cb] = function (result) {
              try { if (timer) clearTimeout(timer); } catch (e) {}
              try { delete w[cb]; } catch (e) {}
              resolve(String(result || ''));
            };
            try { w.VideoNative.sniffVideo(String(url), cb); } catch (e) { try { delete w[cb]; } catch (e2) {} resolve(''); }
            // 原生桥无响应兜底（30 秒）
            timer = setTimeout(function () {
              try { delete w[cb]; } catch (e) {}
              resolve('');
            }, 30000);
          });
        }
        // PC 测试版 / 无原生桥：本地代理抓 HTML，在页面源码里找视频地址
        if (w.XP && w.XP.fetchHtml) {
          return w.XP.fetchHtml(url, 20000).then(function (html) {
            if (!html) return '';
            return w.XP.sniffInHtml(html, url);
          });
        }
        return null;
      } catch (e) { return null; }
    },

    _loadDirect: function (url, mode) {
      this.info('正在加载：' + url.slice(0, 90));
      try { this.v.removeAttribute('src'); this.v.load(); } catch (e) {}
      this.killHls();

      var useHls = (mode === 'hls') || (mode === 'auto' && this.kind === 'hls' && w.Hls && w.Hls.isSupported());
      if (useHls) this.startHls(url, mode);
      else this.startNative(url, mode);

      // 看门狗：自动模式下 12 秒还没播起来 → 换另一个内核再试
      var self = this;
      if (this.watchdog) clearTimeout(this.watchdog);
      this.watchdog = setTimeout(function () {
        self.watchdog = null;
        if (self.started) return;
        if (mode === 'auto') {
          if (self.activeCore === 'hls' && !self.tried.native) { self.info('hls.js 播放超时 → 自动切换系统播放器'); self.startNative(url, 'auto'); }
          else if (self.activeCore === 'native' && !self.tried.hls) { self.info('系统播放器超时 → 自动切换 hls.js'); self.startHls(url, 'auto'); }
          else self.fail('两种内核都没能播起来（线路可能已失效）：返回换线路 / 换源，或点「外部打开」用手机播放器试试');
        } else {
          self.fail('加载超时：可换成「自动」内核或换线路');
        }
      }, 12000);

      // 记忆进度
      this.pendingSeek = this.savedPos() || -1;
    },

    startHls: function (url, mode) {
      try {
        this.killHls();
        this.activeCore = 'hls'; this.tried.hls = true;
        this.info('内核：hls.js（网页解析）');
        var self = this;
        var hls = new w.Hls({ maxBufferLength: 30, manifestLoadingTimeOut: 15000, fragLoadingTimeOut: 20000 });
        this.hls = hls;
        hls.on(w.Hls.Events.MANIFEST_PARSED, function () {
          try {
            self.levels = (hls.levels || []).map(function (l, i) { return { i: i, label: (l.height ? (l.height + 'P') : ('线路 ' + (i + 1))) }; });
            self.renderLevels();
          } catch (e) {}
          self.tryPlay();
        });
        hls.on(w.Hls.Events.ERROR, function (ev, data) {
          if (!data || !data.fatal) return;
          var t = String(data.type || '');
          if (self.started) { self.fail('播放中断：' + t + '（' + (data.details || '') + '）'); return; }
          if (mode === 'auto' && !self.tried.native) {
            self.info('hls.js 错误(' + t + ') → 自动切换系统播放器');
            self.startNative(url, 'auto');
          } else {
            self.fail('hls.js 播放失败：' + t + ' / ' + (data.details || ''));
          }
        });
        hls.loadSource(url);
        hls.attachMedia(this.v);
      } catch (e) {
        if (mode === 'auto') this.startNative(url, 'auto');
        else this.fail('hls.js 启动失败：' + e.message);
      }
    },

    startNative: function (url, mode) {
      try {
        this.killHls();
        this.activeCore = 'native'; this.tried.native = true;
        this.info('内核：系统播放器（WebView 原生解码）');
        this.v.src = url;
        try { this.v.load(); } catch (e) {}
        this.tryPlay();
      } catch (e) { this.fail('系统播放器启动失败：' + e.message); }
    },

    tryPlay: function () {
      var self = this;
      try {
        var p = this.v.play();
        if (p && p.catch) p.catch(function (e) { self.info('等待手动播放（' + (e && e.name ? e.name : '') + '）：点一下画面即可播放'); });
      } catch (e) {}
    },

    /* ------------------------------------------------------------- 事件绑定 */
    bind: function () {
      var self = this, v = this.v;
      if (v.__bound) { /* 同一元素重复绑定保护 */ } else {
        v.__bound = true;

        v.addEventListener('loadedmetadata', function () {
          self.updateTime();
          self.detectRatio();          // 自动识别竖屏 / 横屏
          // ★ v9.8.0：全屏中才拿到分辨率时，立即按真实比例纠正屏幕方向
          try { if (self.isFull && self.isFull()) self.notifyFull(true, self.ratio.aspect === 'portrait' ? 'portrait' : 'landscape'); } catch (e2) {}
          self.applyCrop();            // 应用当前裁剪模式（预设/自定义）
          self.applyFit();             // 应用当前尺寸模式
          self.updateRes();            // 显示分辨率
          // 巳泷 v9.3.0：视频时长已知后，用真实时长重建内置弹幕，确保弹幕与画面对应
          try {
            if (w.DM && w.DM.engine && v.duration && isFinite(v.duration)) {
              var nm = w.V.detail.item.name, ep2 = self.epName();
              var loc2 = w.DM.localList(nm, ep2);
              var builtin2 = w.DM.builtinList(nm, ep2, v.duration);
              w.DM.engine.merge(loc2.concat(self.onlineDm || []), builtin2);
            }
          } catch (e) {}
          if (self.pendingSeek > 5 && self.pendingSeek < (v.duration || 0) - 10) {
            try { v.currentTime = self.pendingSeek; self.info('已从上次观看位置继续（' + self.fmt(self.pendingSeek) + '）'); } catch (e) {}
          }
          self.pendingSeek = -1;
          // 自动快进：开启后每次打开视频自动跳过对应秒数（在已恢复位置基础上再快进）
          var sk = self.skipCfg();
          if (sk.on && sk.sec > 0) {
            try {
              var cur2 = v.currentTime || 0;
              v.currentTime = Math.min(cur2 + sk.sec, (v.duration || 0) - 2);
              self.info('自动快进 ' + sk.sec + ' 秒（暂停界面可调整/关闭）');
            } catch (e) {}
          }
        });

        v.addEventListener('playing', function () {
          self.started = true;
          if (self.watchdog) { clearTimeout(self.watchdog); self.watchdog = null; }
          document.body.classList.add('pl-playing');
          document.body.classList.remove('pl-paused');
          self.showCtl(false);          // 播放中：全屏下进度条与参数控件隐藏（小窗预览始终显示）
          self.info('正在播放（内核：' + (self.activeCore === 'hls' ? 'hls.js' : '系统播放器') + '）' + (self.levels.length > 1 ? '｜可选画质 ' + self.levels.length + ' 档' : ''));
          self.centerIcon(false);
        });

        v.addEventListener('pause', function () {
          document.body.classList.remove('pl-playing');
          document.body.classList.add('pl-paused');
          w.DM.engine.pause(true);
          self.centerIcon(true);
          self.showCtl(true);           // 暂停时控件常显（含倍速/分辨率/全屏关闭按钮）
        });

        v.addEventListener('play', function () {
          w.DM.engine.pause(false);
          self.centerIcon(false);
          self.showCtl(false);          // 播放中全屏控件自动隐藏（小窗预览不隐藏）
        });

        v.addEventListener('timeupdate', function () {
          self.updateTime();
          try { w.DM.engine.onTime(v.currentTime); } catch (e) {}
          var now = Date.now();
          if (now - self.saveAt > 5000) { self.saveAt = now; self.savePos(v.currentTime); }
        });

        v.addEventListener('ended', function () {
          self.savePos(0);
          self.info('这一集播完了，可以点「下一集」继续');
        });

        v.addEventListener('error', function () {
          var code = v.error && v.error.code ? v.error.code : 0;
          var msg = v.error && v.error.message ? v.error.message : ('媒体错误码 ' + code);
          if (!self.started && self.kind === 'page') {
            // 网页地址本来就不是直连视频，不浪费时间去切内核
            self.info('这条线路是「网页地址」不是直连视频，网页里放不出来：点「自动换源」找直连源，或点「外部打开」用手机播放器');
            return;
          }
          if (!self.started && (w.V.playerCore || 'auto') === 'auto' && !self.tried.hls && w.Hls && w.Hls.isSupported()) {
            self.info('系统播放器报错（' + msg + '）→ 自动切换 hls.js');
            self.startHls(self.epUrl(), 'auto');
          } else if (!self.started) {
            self.fail('播放失败：' + msg + '（返回换线路/换源，或点「外部打开」）');
          }
        });
      }

      // 点击画面 = 播放/暂停（小窗预览控件常显；全屏下控件显隐由播放/暂停状态驱动）
      var stage = this.stage;
      this.bindCropGesture();
      this.bindFullscreenGestures();   // 巳泷 v9.1.0：全屏音量/亮度手势 + 长按锁定
      if (stage && !stage.__bound) {
        stage.__bound = true;
        stage.addEventListener('click', function (ev) {
          var t = ev.target;
          if (t && t.closest && t.closest('.pl-ctl')) return;    // 点控件不算
          if (t && t.closest && t.closest('.fs-opts')) return;   // 点全屏方向选择不算
          var fso = $('fsOpts');
          if (fso && !fso.hidden) { self.closeFsOpts(); return; }
          try {
            if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
            else v.pause();
          } catch (e) {}
        });
      }

      // 进度条
      var seek = $('plSeek');
      if (seek && !seek.__bound) {
        seek.__bound = true;
        var dragging = false;
        var wasPlaying = false;
        var apply = function () {
          var d = v.duration || 0;
          if (!(d > 0)) return;
          var t = (parseInt(seek.value, 10) / 1000) * d;
          try { v.currentTime = t; } catch (e) {}
          self.updateTime();
        };
        seek.addEventListener('input', function () {
          // 巳泷 v9.2.0：拖动实时跟手 —— 暂停播放并持续 seek（画面即时跟随进度条），松手后恢复播放
          if (!dragging) { wasPlaying = !v.paused; try { v.pause(); } catch (e) {} }
          dragging = true;
          apply();
        });
        seek.addEventListener('change', function () {
          apply(); dragging = false;
          try { w.DM.engine.idx = 0; w.DM.engine.lastPos = -10; w.DM.engine.clearScreen(); } catch (e) {}
          if (wasPlaying) { try { v.play(); } catch (e) {} }
          wasPlaying = false;
        });
        seek.addEventListener('pointerdown', function () {
          if (!dragging) { wasPlaying = !v.paused; try { v.pause(); } catch (e) {} }
          dragging = true;
        });
        seek.addEventListener('pointerup', function () {
          dragging = false;
          if (wasPlaying) { try { v.play(); } catch (e) {} }
          wasPlaying = false;
        });
        seek.__dragging = function () { return dragging; };
      }

      // 倍速 / 画质
      var rate = $('plRate');
      if (rate && !rate.__bound) {
        rate.__bound = true;
        rate.addEventListener('change', function () {
          try { v.playbackRate = parseFloat(rate.value) || 1; self.info('倍速：' + rate.value + 'x'); } catch (e) {}
        });
      }
      var lv = $('plLevel');
      if (lv && !lv.__bound) {
        lv.__bound = true;
        lv.addEventListener('change', function () {
          try {
            if (!self.hls) { self.info('系统播放器内核不支持手动选画质（由系统自动选择）'); return; }
            var idx = parseInt(lv.value, 10);
            self.hls.currentLevel = idx;         // -1 = 自动
            self.info('画质：' + (idx < 0 ? '自动' : (self.levels[idx] ? self.levels[idx].label : idx)));
          } catch (e) {}
        });
      }

      // 音量（实时 + 记忆）
      var vol = $('plVol');
      if (vol && !vol.__bound) {
        vol.__bound = true;
        var applyVol = function () {
          try {
            var p = parseInt(vol.value, 10);
            if (!(p >= 0)) p = 100;
            if (self.v) self.v.volume = p / 100;
            try { localStorage.setItem('video_pl_vol', String(p)); } catch (e) {}
            var lab = $('vPlVol'); if (lab) lab.textContent = p + '%';
          } catch (e) {}
        };
        vol.addEventListener('input', applyVol);
        vol.addEventListener('change', applyVol);
      }

      // 画面明暗度（实时 + 记忆）
      var br = $('plBright');
      if (br && !br.__bound) {
        br.__bound = true;
        var applyBr = function () {
          try {
            var p = parseInt(br.value, 10);
            if (!(p >= 0)) p = 100;
            var b = (p / 100).toFixed(2);
            if (self.v) self.v.style.filter = 'brightness(' + b + ')';
            try { localStorage.setItem('video_pl_bright', String(b)); } catch (e) {}
            var lab = $('vPlBright'); if (lab) lab.textContent = String(b);
          } catch (e) {}
        };
        br.addEventListener('input', applyBr);
        br.addEventListener('change', applyBr);
      }

      // 初始应用记忆的音量 / 明暗度
      try {
        var vv = parseFloat(localStorage.getItem('video_pl_vol') || '100');
        if (isFinite(vv) && vv >= 0 && vv <= 100 && this.v) this.v.volume = vv / 100;
      } catch (e) {}
      try {
        var bb = parseFloat(localStorage.getItem('video_pl_bright') || '1');
        if (isFinite(bb) && bb > 0 && bb <= 1.5 && this.v) this.v.style.filter = 'brightness(' + bb + ')';
      } catch (e) {}

      // 快进退档位按钮：单击快进/退进（交给 data-act=seek 委托）；长按(≥600ms)自定义该档位秒数（记忆）
      Array.prototype.forEach.call(document.querySelectorAll('[data-act="seek"]'), function (btn) {
        if (btn.__seekBound) return;
        btn.__seekBound = true;
        var t0 = 0, lpHit = false;
        btn.addEventListener('pointerdown', function () { t0 = Date.now(); lpHit = false; });
        btn.addEventListener('pointerup', function (ev) {
          if (Date.now() - t0 >= 600) {
            ev.stopPropagation();
            ev.preventDefault();
            lpHit = true;
            var dir = btn.getAttribute('data-dir'), lvl = parseInt(btn.getAttribute('data-lvl'), 10);
            if (w.askNum) {
              w.askNum('自定义「' + (dir === 'back' ? '快退' : '快进') + ' ' + lvl + ' 秒」档位（点击/长按生效）', String(self.secVal(dir, lvl)), function (val) {
                var n = parseFloat(val);
                if (!isFinite(n) || n <= 0 || n > 3600) { try { w.vToast('请输入 1~3600 之间的数字'); } catch (e2) {} return; }
                self.setSec(dir, lvl, n);
                try { w.vToast('「' + (dir === 'back' ? '快退' : '快进') + '」档已改为 ' + n + ' 秒（已记忆）'); } catch (e2) {}
                var q = document.querySelectorAll('[data-act="seek"][data-dir="' + dir + '"][data-lvl="' + lvl + '"]');
                for (var k = 0; k < q.length; k++) q[k].textContent = self.secLabel(dir, lvl);
              });
            }
          }
        });
        btn.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
        btn.addEventListener('click', function (ev) {
          if (lpHit) { ev.stopPropagation(); ev.preventDefault(); lpHit = false; }
        });
      });
    },

    renderLevels: function () {
      try {
        var lv = $('plLevel');
        if (!lv) return;
        if (!this.levels.length) {
          lv.innerHTML = '<option value="-1">画质：单一</option>';
          return;
        }
        var h = '<option value="-1">画质：自动</option>';
        for (var i = 0; i < this.levels.length; i++) h += '<option value="' + i + '">' + this.levels[i].label + '</option>';
        lv.innerHTML = h;
        lv.value = '-1';
      } catch (e) {}
    },

    centerIcon: function (show) {
      try {
        var c = $('plCenter');
        if (!c) return;
        if (this.started && !show) { c.style.display = 'none'; return; }
        c.style.display = 'flex';
        c.textContent = '';
        c.innerHTML = show ? '<i class="fa-solid fa-play"></i>' : '';
        if (!show) c.style.display = 'none';
      } catch (e) {}
    },

    /* ------------------------------------------------------------- 控制 */
    togglePlay: function () {
      try { if (this.v.paused) { var p = this.v.play(); if (p && p.catch) p.catch(function () {}); } else this.v.pause(); } catch (e) {}
    },

    seekBy: function (sec) {
      try {
        var d = this.v.duration || 0;
        if (!(d > 0)) return;
        this.v.currentTime = Math.max(0, Math.min(d - 1, (this.v.currentTime || 0) + sec));
        this.info('已快进到 ' + this.fmt(this.v.currentTime));
      } catch (e) {}
    },

    setRate: function (r) {
      try { this.v.playbackRate = r; var sel = $('plRate'); if (sel) sel.value = String(r); this.info('倍速：' + r + 'x'); } catch (e) {}
    },

    cycleCore: function () {
      var order = ['auto', 'hls', 'native'];
      var cur = w.V.playerCore || 'auto';
      var next = order[(order.indexOf(cur) + 1) % order.length];
      w.V.playerCore = next;
      try { localStorage.setItem('video_player_core', JSON.stringify(next)); } catch (e) {}
      this.tried = {};
      this.info('播放内核已切到：' + (next === 'auto' ? '自动（先 hls.js，失败切系统）' : (next === 'hls' ? 'hls.js' : '系统播放器')));
      this.load();
    },

    /* ---------------------------------------------- 比例 / 尺寸 / 分辨率 */
    detectRatio: function () {
      try {
        var v = this.v;
        var w = v.videoWidth || 0, h = v.videoHeight || 0;
        this.ratio = { w: w, h: h, aspect: (w > 0 && h > w) ? 'portrait' : (w > 0 ? 'landscape' : '') };
        this.updateRes();
      } catch (e) {}
    },

    updateRes: function () {
      try {
        var el = $('plRes');
        if (!el) return;
        var r = this.ratio, lv = this.levels.length;
        var t = '分辨率：' + (r.w ? (r.w + '×' + r.h + '（' + (r.aspect === 'portrait' ? '竖屏' : '横屏') + '）') : '读取中…');
        t += '　画质档位：' + (lv > 1 ? (lv + ' 档，可在上面切换') : '单一（该线路未提供多档）');
        t += '　尺寸：' + ({ contain: '原始比例', cover: '铺满裁剪', fill: '拉伸铺满' }[this.fit] || this.fit);
        t += '　裁剪：' + ({ off: '原始', '169': '16:9', '916': '9:16', '43': '4:3', custom: '自定义' + ((this.crop && this.crop.z) ? ('×' + Number((this.crop.z || 1).toFixed(1))) : '') }[(this.crop || {}).mode] || '原始');
        el.innerHTML = t;
      } catch (e) {}
    },

    setFit: function (mode) {
      if (['contain', 'cover', 'fill'].indexOf(mode) < 0) mode = 'contain';
      this.fit = mode;
      try { localStorage.setItem('video_pl_fit', JSON.stringify(mode)); } catch (e) {}
      this.applyFit();
      this.updateRes();
      var btns = document.querySelectorAll('[data-act="fit"]');
      for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('on', btns[i].getAttribute('data-v') === mode);
      this.info('视频尺寸：' + ({ contain: '原始比例（完整显示）', cover: '铺满（裁剪多余部分）', fill: '拉伸铺满（可能变形）' }[mode] || mode));
    },

    applyFit: function () {
      try {
        if (!this.v) return;
        if (this.crop && this.crop.mode !== 'off') { this.v.style.objectFit = 'contain'; return; }
        this.v.style.objectFit = (this.fit === 'fill') ? 'fill' : this.fit;
      } catch (e) {}
    },

    /* ---------------------------------------------- 画面裁剪（去黑边）
       · off      = 原始（跟随画面尺寸设置）
       · 169/916/43 = 预设比例：把有效画面按该比例裁满视口（cover）
       · custom   = 自定义：双指缩放整体、单指滑动调整边缘 */
    applyCrop: function () {
      try {
        var cw = this.cropWrap, v = this.v;
        if (!cw || !v) return;
        var stg = this.stage;
        if (!this.crop || this.crop.mode === 'off') {
          cw.style.left = '0'; cw.style.top = '0';
          cw.style.width = '100%'; cw.style.height = '100%';
          cw.style.overflow = 'hidden';
          v.style.transform = '';
          v.style.objectFit = (this.fit === 'fill') ? 'fill' : this.fit;
          v.style.objectPosition = '50% 50%';
          return;
        }
        var mode = this.crop.mode;
        v.style.objectFit = 'cover';
        if (mode === 'custom') {
          v.style.objectFit = 'contain';
          cw.style.left = '0'; cw.style.top = '0';
          cw.style.width = '100%'; cw.style.height = '100%';
          var z = this.crop.z || 1;
          v.style.transform = 'translate(' + (this.crop.tx || 0) + 'px,' + (this.crop.ty || 0) + 'px) scale(' + z + ')';
          return;
        }
        var ar = mode === '169' ? (16 / 9) : (mode === '916' ? (9 / 16) : (4 / 3));
        var sw = stg ? stg.clientWidth : 0, sh = stg ? stg.clientHeight : 0;
        var sar = (sw > 0 && sh > 0) ? (sw / sh) : (16 / 9);
        var vw = sw, vh = sh;
        if (ar >= sar) { vh = sw / ar; vw = sw; }
        else { vw = sh * ar; vh = sh; }
        cw.style.left = ((sw - vw) / 2) + 'px';
        cw.style.top = ((sh - vh) / 2) + 'px';
        cw.style.width = vw + 'px';
        cw.style.height = vh + 'px';
        cw.style.overflow = 'hidden';
        v.style.transform = '';
      } catch (e) {}
    },

    setCrop: function (mode) {
      if (['off', '169', '916', '43', 'custom'].indexOf(mode) < 0) mode = 'off';
      if (mode === 'reset') { this.crop = { mode: 'off', z: 1, tx: 0, ty: 0 }; mode = 'off'; }
      else {
        this.crop = this.crop || { mode: 'off', z: 1, tx: 0, ty: 0 };
        this.crop.mode = mode;
        if (mode === 'custom') { this.crop.z = this.crop.z || 1.2; this.crop.tx = this.crop.tx || 0; this.crop.ty = this.crop.ty || 0; }
      }
      try { localStorage.setItem('video_pl_crop', JSON.stringify(mode)); } catch (e) {}
      this.applyCrop();
      this.updateRes();
      var btns = document.querySelectorAll('[data-act="crop"]');
      for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('on', btns[i].getAttribute('data-v') === mode);
      this.info('画面裁剪：' + ({ off: '原始', '169': '16:9（去黑边）', '916': '9:16（去黑边）', '43': '4:3（去黑边）', custom: '自定义（双指缩放 / 单指滑动）' }[mode] || mode));
    },

    /* 自定义裁剪手势：双指缩放 + 单指平移 */
    bindCropGesture: function () {
      try {
        var self = this, stg = this.stage;
        if (!stg || stg.__cropBound) return;
        stg.__cropBound = true;
        var pts = {}, pinchD = 0, pinchZ = 1;
        stg.addEventListener('pointerdown', function (ev) {
          if (!self.crop || self.crop.mode !== 'custom') return;
          ev.preventDefault();
          pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
          if (Object.keys(pts).length === 2) {
            var ks = Object.keys(pts);
            pinchD = Math.hypot(pts[ks[0]].x - pts[ks[1]].x, pts[ks[0]].y - pts[ks[1]].y);
            pinchZ = self.crop.z || 1;
          }
        });
        stg.addEventListener('pointermove', function (ev) {
          if (!self.crop || self.crop.mode !== 'custom') return;
          if (!pts[ev.pointerId]) return;
          var prev = pts[ev.pointerId];
          var dx = ev.clientX - prev.x, dy = ev.clientY - prev.y;
          pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
          var ks = Object.keys(pts);
          if (ks.length === 2) {
            var a = pts[ks[0]], b = pts[ks[1]];
            var d = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchD > 0) {
              self.crop.z = Math.max(1, Math.min(6, pinchZ * (d / pinchD)));
              self.applyCrop();
            }
          } else {
            self.crop.tx = (self.crop.tx || 0) + dx;
            self.crop.ty = (self.crop.ty || 0) + dy;
            self.applyCrop();
          }
          try { ev.preventDefault(); } catch (e) {}
        });
        var end = function (ev) {
          if (self.crop && self.crop.mode === 'custom') self.updateRes();
          delete pts[ev.pointerId];
        };
        stg.addEventListener('pointerup', end);
        stg.addEventListener('pointercancel', end);
        stg.addEventListener('pointerleave', end);
      } catch (e) {}
    },

    /* 巳泷 v9.1.0：全屏手势 —— 右侧上/下滑 = 音量，左侧上/下滑 = 亮度；长按全屏画面 = 锁定/解锁（防误触弹出暂停） */
    bindFullscreenGestures: function () {
      try {
        var self = this, stg = this.stage;
        if (!stg || stg.__fsGestureBound) return;
        stg.__fsGestureBound = true;
        var t0 = null, axis = '', startX = 0, startY = 0, lastV = 0, lastB = 0, longHit = false, longTimer = null, startPos = 0;
        var D = 6;
        var getVol = function () {
          try { if (self.v) return self.v.volume * 100; return 100; } catch (e) { return 100; }
        };
        var getBr = function () {
          try { var b = parseFloat(localStorage.getItem('video_pl_bright') || '1'); return (b * 100).toFixed(0); } catch (e) { return '100'; }
        };
        var setVol = function (p) {
          try { p = Math.max(0, Math.min(100, p)); if (self.v) self.v.volume = p / 100; localStorage.setItem('video_pl_vol', String(p)); var lab = $('vPlVol'); if (lab) lab.textContent = p + '%'; } catch (e) {}
        };
        var setBr = function (p) {
          try { p = Math.max(10, Math.min(150, p)); var b = (p / 100).toFixed(2); if (self.v) self.v.style.filter = 'brightness(' + b + ')'; localStorage.setItem('video_pl_bright', String(b)); var lab = $('vPlBright'); if (lab) lab.textContent = b; } catch (e) {}
        };
        var tip = function (txt) { try { var el = $('plGestureTip'); if (el) { el.textContent = txt; el.classList.add('show'); } } catch (e) {} };
        var hideTip = function () { try { var el = $('plGestureTip'); if (el) el.classList.remove('show'); } catch (e) {} };

        stg.addEventListener('pointerdown', function (ev) {
          if (ev.pointerType === 'mouse') return;
          if (!document.body.classList.contains('pl-full')) { longHit = false; return; }
          // 巳泷 v9.3.0：锁定/解锁统一由长按触发；播放中才可手势（锁定状态下长按用于解锁）
          if (!self.v || self.v.paused) { longHit = false; return; }
          t0 = Date.now();
          startX = ev.clientX; startY = ev.clientY;
          try { startPos = (self.v && self.v.currentTime) || 0; } catch (e) { startPos = 0; }
          axis = ''; lastV = getVol(); lastB = getBr(); longHit = false;
          clearTimeout(longTimer);
          longTimer = setTimeout(function () {
            longHit = true;
            if (self.locked) {
              // 已锁定 → 本次长按 = 解锁（一次长按+松手只算一次操作，松手不再触发任何动作）
              self.locked = false;
              document.body.classList.remove('pl-locked');
              hideTip();
              tip('🔓 已解锁');
              try { if (self.v) self.v.play(); } catch (e) {}
              setTimeout(hideTip, 900);
            } else {
              // 未锁定 → 本次长按 = 锁定
              self.locked = true;
              document.body.classList.add('pl-locked');
              tip('🔒 已锁定（再次长按解锁）');
              try { if (self.v) self.v.pause(); } catch (e) {}
            }
          }, 700);
        });
        stg.addEventListener('pointermove', function (ev) {
          if (ev.pointerType === 'mouse') return;
          if (!t0 || !self.v || self.v.paused || self.locked) return;
          var dx = ev.clientX - startX, dy = ev.clientY - startY;
          if (axis === '' && (Math.abs(dx) > D || Math.abs(dy) > D)) {
            axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            clearTimeout(longTimer);
          }
          if (axis === 'y') {
            if (ev.clientX < window.innerWidth * 0.5) {  // 左半边 → 亮度
              var nb = lastB - (dy / window.innerHeight) * 80;
              setBr(parseInt(nb, 10)); tip('☀ 亮度 ' + getBr() + '%');
            } else {                                  // 右半边 → 音量
              var nv = lastV - (dy / window.innerHeight) * 80;
              setVol(parseInt(nv, 10)); tip('🔊 音量 ' + getVol() + '%');
            }
          } else if (axis === 'x') {
            // 巳泷 v9.2.0：播放中横向滑动 = 快进/退进（右滑快进，左滑退进，跟手实时）
            // 巳泷 v9.3.0：拖动时显示目标时间，让用户清楚知道拖到了哪里
            try {
              var dur = self.v.duration || 0;
              if (dur > 0) {
                var span = (dx / window.innerWidth) * 60;   // 全宽滑动 ≈ 60 秒
                var target = Math.max(0, Math.min(dur - 0.5, startPos + span));
                self.v.currentTime = target;
                self.updateTime();
                try { self.savePos(target); } catch (e2) {}
                tip((span >= 0 ? '⏩ 快进 +' : '⏪ 退进 ') + Math.abs(span).toFixed(0) + 's ｜ ' + self.fmt(target) + ' / ' + self.fmt(dur));
              }
            } catch (e) {}
          }
        });
        var end = function (ev) {
          if (ev.pointerType === 'mouse') return;
          clearTimeout(longTimer);
          var wasT0 = t0;
          t0 = null;
          // 巳泷 v9.3.0：长按已在按下时完成锁定/解锁，松手只做收尾，不重复触发（一次长按+松手算一次）
          if (longHit) { longHit = false; hideTip(); return; }
          if (self.locked) return;
          if (axis !== '') { hideTip(); axis = ''; return; }   // 手势滑动结束不触发播放/暂停
          if (wasT0 && Date.now() - wasT0 >= 700) return;       // 长按未达阈值、或其它
        };
        stg.addEventListener('pointerup', end);
        stg.addEventListener('pointercancel', end);
        // 锁定提示层（CSS 内建）
        var tEl = document.createElement('div');
        tEl.id = 'plGestureTip';
        tEl.className = 'pl-gesture-tip';
        stg.parentNode && stg.parentNode.appendChild(tEl);
      } catch (e) {}
    },

    /* ---------------------------------------------- 控件显隐 */
    showCtl: function (on) {
      try {
        document.body.classList.toggle('ctl-show', !!on);
      } catch (e) {}
    },

    /* 全屏二级选项：自动检测开 → 直接按比例全屏；关 → 弹出竖向/横向选择（可勾选不再提醒） */
    openFsOpts: function () {
      try {
        var fso = $('fsOpts');
        if (!fso) return;
        if (document.body.classList.contains('pl-full')) { this.closeFsOpts(); return; }
        var cb = $('fsRemember');
        if (cb) cb.checked = false;
        fso.hidden = false;
        this.showCtl(true);
      } catch (e) {}
    },

    closeFsOpts: function () {
      try {
        var fso = $('fsOpts');
        if (fso) fso.hidden = true;
        if (this.v && !this.v.paused) this.showCtl(false);
      } catch (e) {}
    },

    notifyFull: function (on, mode) {
      try {
        if (w.VideoNative && w.VideoNative.setFullscreen) {
          // 通知原生：隐藏底部导航栏 + 强制旋转（16:9→横屏 / 9:16→竖屏，无视设备锁定）
          w.VideoNative.setFullscreen(!!on, on ? (mode || 'landscape') : '');
        }
      } catch (e) {}
    },

    enterFull: function (mode) {
      try {
        var self = this;
        if (document.body.classList.contains('pl-full')) { this.exitFull(); return; }
        // 勾选了「不再提醒」→ 记住自动按比例
        var cb = $('fsRemember');
        if (cb && cb.checked) {
          this.autoOri = true;
          try { localStorage.setItem('video_pl_auto_ori', 'true'); } catch (e) {}
          if (w.V && w.V.autoOri !== undefined) w.V.autoOri = true;
        }
        this.closeFsOpts();
        /* ★ v9.8.0：每次进全屏都用视频真实分辨率重算横竖，避免 9:16 被判成横屏、16:9 被判成竖屏。
           宽度 > 高度 = 横屏；高度 > 宽度 = 竖屏。视频尺寸未知时按当前 ratio 兜底。 */
        this.detectRatio();
        var vw = (this.v && this.v.videoWidth) || 0, vh = (this.v && this.v.videoHeight) || 0;
        var asp = (vw > 0 && vh > 0) ? (vh > vw ? 'portrait' : 'landscape') : this.ratio.aspect;
        var target = mode || (asp === 'portrait' ? 'portrait' : 'landscape');
        document.body.classList.add('pl-full');
        var btn = $('plFs');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-minimize"></i>';
        try {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock(target === 'portrait' ? 'portrait' : 'landscape').catch(function () {});
          }
        } catch (e) {}
        this.notifyFull(true, target);    // 通知原生：隐藏底部导航栏 + 强制旋转（无视设备锁定）
        this.showCtl(!!this.v.paused);    // 进入全屏：暂停时显示控件，播放中保持隐藏
        this.info('全屏（' + (target === 'portrait' ? '竖向' : '横向') + '，按原始尺寸不拉伸）：点击画面播放/暂停，暂停后进度条与参数自动显示；返回键退出全屏');
        this.applyCrop();
        this.applyFit();
        try { w.DM.engine.relayout(); } catch (e) {}
      } catch (e) {}
    },

    exitFull: function () {
      try {
        document.body.classList.remove('pl-full');
        var btn = $('plFs');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-maximize"></i>';
        try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
        this.notifyFull(false);           // 恢复原生底部导航栏
        this.showCtl(false);
        try { w.DM.engine.relayout(); } catch (e) {}
      } catch (e) {}
    },

    toggleFull: function () {
      try {
        var self = this;
        if (document.body.classList.contains('pl-full')) { this.exitFull(); return; }
        // 自动检测开：直接按视频比例全屏；关：弹出竖向/横向二选一（含「不再提醒」勾选）
        if (this.autoOri === false) { this.openFsOpts(); return; }
        this.detectRatio();
        var vw = (this.v && this.v.videoWidth) || 0, vh = (this.v && this.v.videoHeight) || 0;
        var asp = (vw > 0 && vh > 0) ? (vh > vw ? 'portrait' : 'landscape') : this.ratio.aspect;
        this.enterFull(asp === 'portrait' ? 'portrait' : 'landscape');
      } catch (e) {}
    },

    isFull: function () { return document.body.classList.contains('pl-full'); },

    openExternal: function () {
      var url = this.epUrl();
      if (!url) { this.fail('没有可播放地址'); return; }
      try {
        if (w.VideoNative && w.VideoNative.openExternal) { w.VideoNative.openExternal(url); this.info('已交给手机播放器打开：' + url.slice(0, 70)); }
        else { this.info('网页环境不支持外部播放器：' + url.slice(0, 70)); }
      } catch (e) { this.fail('打开外部播放器失败：' + e.message); }
    },

    /* ------------------------------------------------------------- 弹幕 */
    toggleDm: function () {
      w.DM.cfg.on = !w.DM.cfg.on;
      w.DM.saveCfg();
      w.DM.engine.applyCfg();
      var b = $('plDmBtn');
      if (b) b.textContent = w.DM.cfg.on ? '弹幕 开' : '弹幕 关';
      // 巳泷 v9.1.0：同步更新详情页/暂停面板的弹幕开关
      var b2 = $('plTuneDmBtn');
      if (b2) b2.textContent = (w.DM.cfg.on ? '开' : '关') + '弹幕';
      var b3 = document.querySelector('.row-chips [data-act="dmtoggle"]');
      if (b3) b3.textContent = w.DM.cfg.on ? '弹幕开' : '弹幕关';
      this.info(w.DM.cfg.on ? '弹幕已打开' : '弹幕已关闭');
    },

    sendDm: function () {
      try {
        var inp = $('dmText');
        var txt = String((inp && inp.value) || '').trim();
        if (!txt) { this.info('请输入弹幕内容'); return; }
        if (!w.DM.cfg.on) { w.DM.cfg.on = true; w.DM.saveCfg(); w.DM.engine.applyCfg(); }
        var t = this.v ? (this.v.currentTime || 0) : 0;
        w.DM.addLocal(w.V.detail.item.name, this.epName(), txt, '#FFFFFF', t);
        w.DM.engine.list.push({ t: t, text: txt, color: '#FFFFFF' });
        w.DM.engine.list.sort(function (a, b) { return a.t - b.t; });
        w.DM.engine.spawn({ t: t, text: txt, color: '#FFFFFF' });
        if (inp) inp.value = '';
        this.info('弹幕已发送并保存在本机（' + this.fmt(t) + '）');
      } catch (e) { this.fail('发送弹幕失败：' + e.message); }
    },

    /* --------------------------------------------------------- 进度记录 */
    posKey: function () {
      try { return 'video_pos_' + encodeURIComponent(w.V.detail.item.name + '|' + this.epName()); } catch (e) { return ''; }
    },

    savedPos: function () {
      try {
        var v = parseFloat(localStorage.getItem(this.posKey()) || '0');
        return isFinite(v) && v > 5 ? v : 0;
      } catch (e) { return 0; }
    },

    savePos: function (t) {
      try {
        var k = this.posKey();
        if (!k) return;
        localStorage.setItem(k, String(Math.max(0, t || 0)));
      } catch (e) {}
      try { if (w.vRecordHist) w.vRecordHist(t); } catch (e) {}
    },

    fmt: function (s) {
      s = Math.max(0, Math.floor(s || 0));
      var m = Math.floor(s / 60), x = s % 60;
      return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x;
    },

    updateTime: function () {
      try {
        var v = this.v, d = v.duration || 0, t = v.currentTime || 0;
        var lab = $('plTime');
        if (lab) lab.textContent = this.fmt(t) + ' / ' + (d > 0 ? this.fmt(d) : '--:--');
        var seek = $('plSeek');
        if (seek && d > 0 && !(seek.__dragging && seek.__dragging())) seek.value = String(Math.round((t / d) * 1000));
      } catch (e) {}
    }
  };

})(window);