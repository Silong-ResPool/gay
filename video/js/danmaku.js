/* ==========================================================================
   影视乐园 · danmaku.js
   弹幕：① 本地弹幕（自己发、按片名+集数保存，永不失效）
        ② 可选对接「弹弹play」开放接口（在设置里填 AppId / AppSecret 后自动可用）
           搜索：/api/v2/search/episodes?anime=片名
           弹幕：/api/v2/comment/{episodeId}?withRelated=true
           签名：X-Signature = base64(sha1(AppId + Timestamp + Path + AppSecret))
   ========================================================================== */

(function (w) {
  'use strict';

  /* ------------------------------------------------------------ SHA-1 / Base64
     file:// 下 crypto.subtle 不可用（非安全上下文），所以这里自带一份纯 JS 实现 */
  function sha1Bytes(str) {
    function utf8(s) {
      var out = [], i, c;
      for (i = 0; i < s.length; i++) {
        c = s.charCodeAt(i);
        if (c < 0x80) out.push(c);
        else if (c < 0x800) { out.push(0xC0 | (c >> 6), 0x80 | (c & 63)); }
        else if (c >= 0xD800 && c < 0xDC00) {
          var c2 = s.charCodeAt(++i);
          c = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00);
          out.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        } else out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      }
      return out;
    }
    var msg = utf8(str), len = msg.length;
    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);
    var bits = len * 8;
    msg.push(0, 0, 0, 0, (bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);

    var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
    var wv = new Array(80);
    for (var i2 = 0; i2 < msg.length; i2 += 64) {
      var j;
      for (j = 0; j < 16; j++) {
        wv[j] = (msg[i2 + j * 4] << 24) | (msg[i2 + j * 4 + 1] << 16) | (msg[i2 + j * 4 + 2] << 8) | (msg[i2 + j * 4 + 3]);
      }
      for (j = 16; j < 80; j++) {
        var n = wv[j - 3] ^ wv[j - 8] ^ wv[j - 14] ^ wv[j - 16];
        wv[j] = (n << 1) | (n >>> 31);
      }
      var a = h0, b = h1, c3 = h2, d = h3, e = h4;
      for (j = 0; j < 80; j++) {
        var f, k;
        if (j < 20) { f = (b & c3) | ((~b) & d); k = 0x5A827999; }
        else if (j < 40) { f = b ^ c3 ^ d; k = 0x6ED9EBA1; }
        else if (j < 60) { f = (b & c3) | (b & d) | (c3 & d); k = 0x8F1BBCDC; }
        else { f = b ^ c3 ^ d; k = 0xCA62C1D6; }
        var t = (((a << 5) | (a >>> 27)) + f + e + k + wv[j]) | 0;
        e = d; d = c3; c3 = ((b << 30) | (b >>> 2)) | 0; b = a; a = t | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c3) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    var out2 = [];
    [h0, h1, h2, h3, h4].forEach(function (h) {
      out2.push((h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255);
    });
    return out2;
  }

  var B64C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function toBase64(bytes) {
    var out = '', i;
    for (i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
      out += B64C.charAt(b0 >> 2);
      out += B64C.charAt(((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4));
      out += (b1 === undefined) ? '=' : B64C.charAt(((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6));
      out += (b2 === undefined) ? '=' : B64C.charAt(b2 & 63);
    }
    return out;
  }

  var DM = w.DM = {};

  /* ---------------------------------------------------------------- 配置 */
  DM.cfg = { on: true, opacity: 0.9, speed: 1, size: 14, area: 55, block: '' };

  DM.loadCfg = function () {
    try {
      var v = JSON.parse(localStorage.getItem('video_dm_cfg') || 'null');
      if (v && typeof v === 'object') {
        DM.cfg.on = v.on !== false;
        DM.cfg.opacity = (v.opacity >= 0.2 && v.opacity <= 1) ? v.opacity : 0.9;
        DM.cfg.speed = (v.speed >= 0.5 && v.speed <= 2.5) ? v.speed : 1;
        DM.cfg.size = (v.size >= 10 && v.size <= 28) ? v.size : 14;
        DM.cfg.area = (v.area >= 25 && v.area <= 100) ? v.area : 55;
        DM.cfg.block = String(v.block || '');
      }
    } catch (e) {}
    return DM.cfg;
  };
  DM.saveCfg = function () { try { localStorage.setItem('video_dm_cfg', JSON.stringify(DM.cfg)); } catch (e) {} };

  DM.ddp = { appId: '', appSecret: '' };
  DM.loadDdp = function () {
    try {
      var v = JSON.parse(localStorage.getItem('video_ddp') || 'null');
      if (v) { DM.ddp.appId = String(v.appId || ''); DM.ddp.appSecret = String(v.appSecret || ''); }
    } catch (e) {}
    return DM.ddp;
  };
  DM.saveDdp = function () { try { localStorage.setItem('video_ddp', JSON.stringify(DM.ddp)); } catch (e) {} };
  DM.ddpReady = function () { return !!(DM.ddp.appId && DM.ddp.appSecret); };

  /* ---------------------------------------------------------------- 本地弹幕 */
  function keyOf(name, ep) { return 'video_dm_' + encodeURIComponent(String(name || '') + '|' + String(ep || '')); }

  DM.localList = function (name, ep) {
    try {
      var v = JSON.parse(localStorage.getItem(keyOf(name, ep)) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  };

  DM.addLocal = function (name, ep, text, color, timeSec) {
    try {
      var list = DM.localList(name, ep);
      list.push({ t: Math.max(0, Number(timeSec) || 0), text: String(text).slice(0, 60), color: color || '#FFFFFF' });
      if (list.length > 800) list = list.slice(-800);
      localStorage.setItem(keyOf(name, ep), JSON.stringify(list));
      return true;
    } catch (e) { return false; }
  };

  DM.searchLocal = function (kw) {
    var out = [];
    kw = String(kw || '').trim();
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('video_dm_') !== 0) continue;
        var list = null;
        try { list = JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { continue; }
        if (!Array.isArray(list)) continue;
        var title = decodeURIComponent(k.substring('video_dm_'.length)).split('|')[0];
        if (kw && title.indexOf(kw) < 0) continue;
        for (var j = 0; j < list.length; j++) {
          if (list[j] && list[j].text && (!kw || list[j].text.indexOf(kw) >= 0)) {
            out.push({ title: title, text: list[j].text, t: list[j].t, color: list[j].color });
          }
        }
      }
    } catch (e) {}
    return out.slice(0, 300);
  };

  /* ==========================================================================
     巳泷 v9.1.0：内置弹幕池 —— 不填任何 API 也有浏览弹幕可选（按片名做简单 hash 使同一片同一批弹幕）；
     若用户配置了自定义弹幕 API（视频弹幕中转服务 / 弹弹play），则自动用 API 的弹幕替换内置弹幕
     ========================================================================== */
  var DM_BUILTIN_POOL = [
    ['前方高能预警！', '#FF6B6B'], ['来了来了', '#FFD93D'], ['名场面名场面', '#6BCB77'],
    ['哈哈哈哈哈哈', '#4D96FF'], ['泪目了', '#96C7FF'], ['太强了吧', '#FF9F43'],
    ['经典永流传', '#C084FC'], ['打卡留念', '#7DE3C8'], ['这画质爱了', '#FFB3C1'],
    ['细节拉满', '#FFE3A3'], ['必须二刷', '#B0F3AB'], ['导演加鸡腿', '#FFC6D9'],
    ['弹幕护体！', '#AEFFFF'], ['已收藏慢慢看', '#FFF9C4'], ['谁懂啊这段', '#D8C7FF'],
    ['好看不火没天理', '#FFB4A2'], ['教科书级操作', '#B8E4FF'], ['这节奏舒服', '#D7FFB8'],
    ['弹幕高能区域', '#FFE07A'], ['路过膜拜', '#C1FFD7'], ['回头再看一遍', '#F7C8E0'],
    ['高燃片段++', '#FFE066'], ['收藏夹+1', '#A9DEF9'], ['这段值得反复看', '#EAD7FF']
  ];
  function dmHash(str) {
    var h = 5381;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h;
  }
  // 内置浏览弹幕：按视频实际时长均布 30~50 条，保证有东西可看且与画面对应
  DM.builtinList = function (name, ep, duration) {
    try {
      var seed = dmHash(String(name || '') + '|' + String(ep || ''));
      var count = 30 + (seed % 21);                      // 30~50 条（巳泷 v9.3.0：弹幕量提升）
      var span = Math.max(120, Number(duration) || 600); // 有真实时长用真实时长，否则按 10 分钟
      var out = [];
      for (var i = 0; i < count; i++) {
        var p = DM_BUILTIN_POOL[(seed + i * 7) % DM_BUILTIN_POOL.length];
        var tt = ((seed * 31 + i * 97) % Math.floor(span * 0.95)) + 1;
        out.push({ t: tt, text: p[0], color: p[1] });
      }
      out.sort(function (a, b) { return a.t - b.t; });
      return out;
    } catch (e) { return []; }
  };
  // 自定义弹幕 API（用户填写的 弹幕中转服务/自建接口；没有则用内置）
  DM.custom = { api: '' };
  DM.loadCustom = function () {
    try { DM.custom.api = String(localStorage.getItem('video_dm_custom_api') || ''); } catch (e) { DM.custom.api = ''; }
    return DM.custom.api;
  };
  DM.saveCustom = function (url) { try { localStorage.setItem('video_dm_custom_api', String(url || '')); } catch (e) {} };
  // 尝试用自定义 API 拉弹幕；失败返回 null（调用方回退内置）
  DM.fetchCustom = function (name, ep, duration) {
    var api = DM.loadCustom();
    if (!api) return Promise.resolve(null);
    var url = String(api);
    try {
      var has = /{[^}]*}/.test(url);
      if (has) url = url.replace(/\{name\}/g, encodeURIComponent(String(name || '')))
                       .replace(/\{ep\}/g, encodeURIComponent(String(ep || '')))
                       .replace(/\{episodeId\}/g, encodeURIComponent(String(ep || '')))
                       .replace(/\{cid\}/g, encodeURIComponent(String(ep || '')));
      else if (url.indexOf('?') < 0) url += '?name=' + encodeURIComponent(String(name || ''));
    } catch (e) {}
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) {
      // 兼容：danmaku-proxy 标准返回 {code:0, data:[{time,text,color,type}]}，或裸数组 / {data:[...]}
      var arr = Array.isArray(j) ? j : ((j && j.data) && Array.isArray(j.data) ? j.data : (j && Array.isArray(j.list) ? j.list : []));
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (!c || c.text == null) continue;
        var t = parseFloat(c.time == null ? c.t : c.time);
        if (!isFinite(t)) continue;
        var col = c.color == null ? '#FFFFFF' : (String(c.color).charAt(0) === '#' ? String(c.color) : ('#' + Number(c.color).toString(16).padStart(6, '0')));
        out.push({ t: t, text: String(c.text).slice(0, 60), color: col });
      }
      out.sort(function (a, b) { return a.t - b.t; });
      return out.length ? out : null;
    }).catch(function () { return null; });
  };

  /* ------------------------------------------------------------ 弹弹play 接口 */
  function sign(path, ts) { return toBase64(sha1Bytes(DM.ddp.appId + ts + path + DM.ddp.appSecret)); }

  function ddpGet(path, query) {
    var ts = Math.floor(Date.now() / 1000);
    var url = 'https://api.dandanplay.net' + path + (query ? ('?' + query) : '');
    return fetch(url, {
      cache: 'no-store',
      headers: {
        'X-AppId': DM.ddp.appId,
        'X-Timestamp': String(ts),
        'X-Signature': sign(path, ts),
        'Accept': 'application/json'
      }
    }).then(function (res) {
      if (res.status === 401) throw new Error('弹弹play 认证失败（AppId/AppSecret 不对，或未在开放平台开通权限）');
      if (!res.ok) throw new Error('弹弹play HTTP ' + res.status);
      return res.json();
    });
  }

  // 搜索剧集（返回 [{episodeId, animeTitle, episodeTitle, type}]）
  DM.searchEpisodes = function (anime) {
    if (!DM.ddpReady()) return Promise.reject(new Error('还没配置弹弹play AppId/AppSecret（设置 → 弹幕）'));
    return ddpGet('/api/v2/search/episodes', 'anime=' + encodeURIComponent(anime)).then(function (j) {
      var out = [];
      var arr = (j && j.animes) || [];
      for (var i = 0; i < arr.length; i++) {
        var a = arr[i] || {};
        var eps = a.episodes || [];
        if (!eps.length) out.push({ episodeId: 0, animeTitle: a.animeTitle || '', episodeTitle: '', type: a.typeDescription || '', animes: 1 });
        for (var k = 0; k < eps.length; k++) {
          out.push({
            episodeId: eps[k].episodeId,
            animeTitle: a.animeTitle || '',
            episodeTitle: eps[k].episodeTitle || '',
            type: a.typeDescription || ''
          });
        }
      }
      return out;
    });
  };

  // 拉取某集弹幕，返回 [{t, text, color}]
  DM.fetchComments = function (episodeId) {
    if (!DM.ddpReady()) return Promise.reject(new Error('还没配置弹弹play AppId/AppSecret'));
    return ddpGet('/api/v2/comment/' + encodeURIComponent(episodeId), 'withRelated=true').then(function (j) {
      var out = [];
      var arr = (j && j.comments) || [];
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i] || {};
        var p = String(c.p || '').split(',');
        var t = parseFloat(p[0]);
        if (!isFinite(t)) continue;
        var mode = parseInt(p[1], 10);
        if (mode === 4 || mode === 5) continue;              // 底部/顶部弹幕先忽略，保持滚动弹幕简洁
        var col = parseInt(p[2], 10);
        out.push({
          t: t,
          text: String(c.m || ''),
          color: (isFinite(col) ? '#' + ('000000' + col.toString(16)).slice(-6) : '#FFFFFF')
        });
      }
      out.sort(function (a, b) { return a.t - b.t; });
      return out;
    });
  };

  /* ==========================================================================
     弹幕引擎：视频上方滚动弹幕（不依赖任何库）
     ========================================================================== */
  DM.engine = {
    layer: null, video: null,
    list: [], idx: 0, lastPos: 0,
    lanes: [], laneCount: 12, bulletSeq: 0,
    active: {},   // 正在飞的弹幕

    attach: function (videoEl, layerEl) {
      this.video = videoEl;
      this.layer = layerEl;
      this.applyCfg();
      this.relayout();
      this.renderAll();
    },

    applyCfg: function () {
      var l = this.layer;
      if (!l) return;
      l.style.opacity = String(DM.cfg.on ? DM.cfg.opacity : 0);
      l.style.fontSize = DM.cfg.size + 'px';
      l.style.height = DM.cfg.area + '%';
      l.style.display = DM.cfg.on ? 'block' : 'none';
    },

    relayout: function () {
      var l = this.layer;
      if (!l) return;
      var h = l.clientHeight || 200;
      var per = Math.max(18, Math.round(DM.cfg.size * 1.75));
      this.laneCount = Math.max(3, Math.floor(h / per));
      this.lanes = [];
      for (var i = 0; i < this.laneCount; i++) this.lanes.push(0);
    },

    blocked: function (text) {
      var b = String(DM.cfg.block || '').trim();
      if (!b) return false;
      var words = b.split(/[,，\s]+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) if (text.indexOf(words[i]) >= 0) return true;
      return false;
    },

    setList: function (list) {
      this.list = (list || []).slice(0).sort(function (a, b) { return a.t - b.t; });
      this.idx = 0;
      this.lastPos = 0;
      this.clearScreen();
    },

    // 本地 + 在线合并
    merge: function (local, online) {
      var out = [];
      var seen = {};
      (local || []).concat(online || []).forEach(function (c) {
        if (!c) return;
        var k = Math.round(c.t * 10) + '|' + c.text;
        if (seen[k]) return;
        seen[k] = 1;
        out.push(c);
      });
      this.setList(out);
      return out.length;
    },

    spawn: function (c) {
      var l = this.layer;
      if (!l || !DM.cfg.on) return;
      if (this.blocked(c.text)) return;
      var lane = -1, best = Infinity, now = Date.now();
      for (var i = 0; i < this.lanes.length; i++) {
        if (this.lanes[i] < best) { best = this.lanes[i]; lane = i; }
      }
      if (lane < 0) lane = 0;
      var per = Math.max(18, Math.round(DM.cfg.size * 1.75));
      this.lanes[lane] = now + 900 / Math.max(0.5, DM.cfg.speed);

      var d = document.createElement('div');
      d.className = 'dm-item';
      d.textContent = c.text;
      if (c.color && c.color !== '#FFFFFF') d.style.color = c.color;
      d.style.top = (lane * per + 2) + 'px';
      l.appendChild(d);

      var W = l.clientWidth || 320;
      var tw = d.offsetWidth || (c.text.length * DM.cfg.size);
      var dur = ((W + tw) / (140 * Math.max(0.5, DM.cfg.speed)));
      d.style.animationDuration = dur.toFixed(2) + 's';
      d.style.setProperty('--dm-from', W + 'px');
      d.style.setProperty('--dm-to', (-tw - 4) + 'px');
      try { d.style.animationPlayState = this.video && this.video.paused ? 'paused' : 'running'; } catch (e) {}

      var self = this;
      var key = 'b' + (++this.bulletSeq);
      this.active[key] = d;
      setTimeout(function () {
        try { if (d.parentNode) d.parentNode.removeChild(d); } catch (e) {}
        delete self.active[key];
      }, Math.ceil(dur * 1000) + 600);
    },

    clearScreen: function () {
      var l = this.layer;
      if (!l) return;
      var items = l.querySelectorAll('.dm-item');
      for (var i = 0; i < items.length; i++) { try { items[i].parentNode.removeChild(items[i]); } catch (e) {} }
      this.active = {};
    },

    // 暂停/继续：冻结正在飞的弹幕
    pause: function (on) {
      var l = this.layer;
      if (!l) return;
      var items = l.querySelectorAll('.dm-item');
      for (var i = 0; i < items.length; i++) {
        try { items[i].style.animationPlayState = on ? 'paused' : 'running'; } catch (e) {}
      }
    },

    // 由播放器 timeupdate 驱动 —— 巳泷 v9.3.0：收紧时间窗口，确保弹幕与画面对应
    onTime: function (pos) {
      if (!DM.cfg.on) return;
      var list = this.list;
      if (!list.length) return;
      // 往回拖 → 重来
      if (pos < this.lastPos - 1.5) {
        this.idx = 0;
        this.clearScreen();
      }
      // 定位到 pos 附近（跳过已过期超过 0.5s 的）
      while (this.idx < list.length && list[this.idx].t < pos - 0.5) this.idx++;
      var guard = 0;
      while (this.idx < list.length && list[this.idx].t <= pos + 0.1 && guard < 60) {
        var c = list[this.idx++];
        if (c.t >= pos - 0.5) this.spawn(c);
        guard++;
      }
      this.lastPos = pos;
    },

    renderAll: function () { this.applyCfg(); this.relayout(); }
  };

})(window);