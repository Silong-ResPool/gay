/* 巳泷资源库 · 顶部搜索入口 / 历史与模式下拉 / 图片搜索 / 真实活跃统计
   独立模块：不修改原有网页结构与搜索逻辑，只通过现有 #kw / #mSwitch / #goSearch / #srTabs 触发。 */
(function () {
  if (window.__slSearchPlus) return;
  window.__slSearchPlus = true;

  var MODES = {
    web: { label: '全网 · Yandex', cat: 'all', desc: 'Yandex 优先聚合' },
    site: { label: '站内', cat: '', desc: '资源库内置站点' },
    image: { label: '图片', cat: 'image', desc: '图片结果' },
    video: { label: '视频', cat: 'video', desc: '视频结果' },
    magnet: { label: '磁力', cat: 'magnet', desc: '磁力结果' }
  };
  var HK = 'sl_search_hist_v3';
  var MK = 'sl_search_mode_v3';
  var statsAt = 0;
  var statsLast = null;
  var statsLoading = false;

  function $(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsPut(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function modeName(m) { return (MODES[m] && MODES[m].label) || '全网'; }

  function toast(msg) {
    var el = $('slMiniToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'slMiniToast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'on';
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.className = ''; }, 2600);
  }

  /* ---------- 顶部搜索按钮 ---------- */
  function mountNavButton() {
    var nav = document.querySelector('.nav');
    if (!nav || $('slNavSearch')) return;
    var b = document.createElement('button');
    b.id = 'slNavSearch';
    b.type = 'button';
    b.className = 'slNavSearch';
    b.title = '搜索资源库';
    b.setAttribute('aria-label', '搜索资源库');
    b.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      togglePop();
    };
    nav.appendChild(b);
  }

  /* ---------- 下拉面板 ---------- */
  function buildPop() {
    if ($('slSearchPop')) return;
    var pop = document.createElement('div');
    pop.id = 'slSearchPop';
    var cur = lsGet(MK, 'web');
    if (!MODES[cur]) cur = 'web';
    var modeHtml = '';
    Object.keys(MODES).forEach(function (k) {
      modeHtml += '<button type="button" data-m="' + k + '" class="' + (k === cur ? 'on' : '') + '">' + esc(MODES[k].label) + '</button>';
    });
    pop.innerHTML =
      '<div class="slSpHead">' +
        '<div class="slSpTitle"><b>搜索资源库</b><small>默认 Yandex · 不用询问资源管家</small></div>' +
        '<button type="button" class="slSpX" id="slSpClose" title="关闭">×</button>' +
      '</div>' +
      '<div class="slSpModes" id="slSpModes">' + modeHtml + '</div>' +
      '<div class="slSpSearch">' +
        '<input id="slSpKw" type="text" placeholder="输入关键词，回车搜索" autocomplete="off">' +
        '<button type="button" id="slSpGo">搜索</button>' +
      '</div>' +
      '<div class="slSpHistHd"><span>搜索记录</span><button type="button" id="slSpClear">清空</button></div>' +
      '<div class="slSpHist" id="slSpHist"></div>' +
      '<div class="slSpTools">' +
        '<button type="button" id="slSpUpload"><i class="fa-solid fa-image"></i> 上传图片搜索</button>' +
        '<button type="button" id="slSpImgUrlBtn"><i class="fa-solid fa-link"></i> 图片链接</button>' +
        '<input id="slSpFile" type="file" accept="image/*" style="display:none">' +
      '</div>' +
      '<div class="slSpImgUrl" id="slSpImgUrl"><input id="slSpImgInput" type="text" placeholder="粘贴图片链接 https://..."><button type="button" id="slSpImgGo">搜</button></div>' +
      '<div class="slSpNote">站内=资源库内置站点；全网=Yandex 优先聚合；图片搜索会上传到临时图床用于反向搜索。</div>';
    document.body.appendChild(pop);

    pop.addEventListener('click', function (e) { e.stopPropagation(); });
    $('slSpClose').onclick = closePop;
    $('slSpModes').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-m]') : null;
      if (!b) return;
      setModeUI(b.getAttribute('data-m'));
    });
    $('slSpGo').onclick = function () { runSearch($('slSpKw').value, currentMode()); };
    $('slSpKw').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); runSearch(this.value, currentMode()); }
    });
    $('slSpClear').onclick = function () { hsave([]); renderHist(); toast('搜索记录已清空'); };
    $('slSpHist').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-k]') : null;
      if (!b) return;
      runSearch(b.getAttribute('data-k'), b.getAttribute('data-m') || 'web');
    });
    $('slSpUpload').onclick = function () { $('slSpFile').click(); };
    $('slSpFile').onchange = function () {
      var f = this.files && this.files[0];
      this.value = '';
      if (!f) return;
      if (!/^image\//i.test(f.type || '')) { toast('请选择图片文件'); return; }
      toast('正在上传图片…');
      uploadImage(f, function (url) {
        toast('已上传，正在以图搜图…');
        reverseSearch(url);
      }, function (err) {
        toast('上传失败：' + (err && err.message ? err.message : err));
        showImageUrlInput();
      });
    };
    $('slSpImgUrlBtn').onclick = function () { showImageUrlInput(); };
    $('slSpImgGo').onclick = function () {
      var u = String($('slSpImgInput').value || '').trim();
      if (!/^https?:\/\//i.test(u)) { toast('请输入 http(s) 图片链接'); return; }
      closePop();
      reverseSearch(u);
    };
    $('slSpImgInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); $('slSpImgGo').click(); }
    });
  }

  function currentMode() {
    var m = lsGet(MK, 'web');
    return MODES[m] ? m : 'web';
  }
  function setModeUI(m) {
    if (!MODES[m]) m = 'web';
    lsPut(MK, m);
    var box = $('slSpModes');
    if (box) {
      [].forEach.call(box.children, function (b) { b.classList.toggle('on', b.getAttribute('data-m') === m); });
    }
  }
  function togglePop() {
    buildPop();
    var p = $('slSearchPop');
    if (!p) return;
    if (p.classList.contains('on')) { closePop(); return; }
    p.classList.add('on');
    setModeUI(currentMode());
    renderHist();
    setTimeout(function () { try { $('slSpKw').focus(); } catch (e) {} }, 80);
  }
  function closePop() { var p = $('slSearchPop'); if (p) p.classList.remove('on'); }

  /* ---------- 历史 ---------- */
  function hget() {
    try {
      var a = JSON.parse(localStorage.getItem(HK) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function hsave(a) {
    try { localStorage.setItem(HK, JSON.stringify((a || []).slice(0, 24))); } catch (e) {}
  }
  function hadd(k, m) {
    k = String(k || '').trim();
    if (!k) return;
    var a = hget().filter(function (x) { return !(x && x.k === k && x.m === m); });
    a.unshift({ k: k, m: m, t: Date.now() });
    hsave(a);
    /* v8.0.4：主页搜索记录同步到资源管家的「检索记录」 */
    try {
      var log = JSON.parse(localStorage.getItem('sl_main_search_log_v1') || '[]');
      if (!Array.isArray(log)) log = [];
      log = log.filter(function (x) { return !(x && x.k === k && x.m === m); });
      log.unshift({ k: k, m: m, t: Date.now() });
      localStorage.setItem('sl_main_search_log_v1', JSON.stringify(log.slice(0, 60)));
    } catch (e) {}
    try {
      var f = document.getElementById('butlerFrame');
      if (f && f.contentWindow && typeof f.contentWindow.kelivoAddMainSearch === 'function') {
        f.contentWindow.kelivoAddMainSearch(k, m, Date.now());
      }
    } catch (e) {}
    renderHist();
  }
  function renderHist() {
    var box = $('slSpHist');
    if (!box) return;
    var a = hget();
    if (!a.length) {
      box.innerHTML = '<div class="slSpEmpty">暂无搜索记录</div>';
      return;
    }
    box.innerHTML = a.map(function (x) {
      if (!x || !x.k) return '';
      var d = new Date(x.t || 0);
      var tm = (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
      return '<button type="button" class="slSpHistItem" data-k="' + esc(x.k) + '" data-m="' + esc(x.m || 'web') + '">' +
        '<span class="k">' + esc(x.k) + '</span><span class="m">' + esc(modeName(x.m)) + '</span><span class="t">' + tm + '</span></button>';
    }).join('');
  }

  /* ---------- 触发原有搜索 ---------- */
  function runSearch(kw, mode) {
    kw = String(kw || '').trim();
    if (!kw) { toast('请输入关键词'); return; }
    if (!MODES[mode]) mode = 'web';
    hadd(kw, mode);
    setModeUI(mode);
    closePop();
    var kwEl = $('kw');
    if (kwEl) kwEl.value = kw;
    var mBtn = qs('#mSwitch [data-m="' + (mode === 'site' ? 'site' : 'web') + '"]');
    if (mBtn) {
      mBtn.click();
    } else {
      var go = $('goSearch');
      if (go) go.click();
    }
    if (mode !== 'site') {
      var cat = MODES[mode].cat;
      setTimeout(function () {
        var tab = qs('#srTabs .sr-tab[data-c="' + cat + '"]');
        if (tab) tab.click();
      }, 90);
    }
  }

  /* ---------- 图片上传 + Yandex 以图搜图 ---------- */
  function fetchT(url, opt, ms) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; reject(new Error('timeout')); } }, ms || 20000);
      try {
        fetch(url, opt || {}).then(function (r) {
          if (done) return;
          done = true; clearTimeout(t); resolve(r);
        }, function (e) {
          if (done) return;
          done = true; clearTimeout(t); reject(e);
        });
      } catch (e) { done = true; clearTimeout(t); reject(e); }
    });
  }
  function upCatbox(file) {
    var fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('fileToUpload', file, file.name || 'image.jpg');
    return fetchT('https://catbox.moe/user/api.php', { method: 'POST', body: fd }, 25000)
      .then(function (r) { return r.text(); })
      .then(function (t) {
        t = String(t || '').trim();
        if (!/^https?:\/\//i.test(t)) throw new Error('catbox 拒绝上传');
        return t;
      });
  }
  function upTmpfiles(file) {
    var fd = new FormData();
    fd.append('file', file, file.name || 'image.jpg');
    return fetchT('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: fd }, 25000)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var u = j && j.data && j.data.url;
        if (!u) throw new Error('tmpfiles 拒绝上传');
        return String(u).replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
      });
  }
  function upUguu(file) {
    var fd = new FormData();
    fd.append('files[]', file, file.name || 'image.jpg');
    return fetchT('https://uguu.se/upload?output=text', { method: 'POST', body: fd }, 25000)
      .then(function (r) { return r.text(); })
      .then(function (t) {
        t = String(t || '').trim();
        if (!/^https?:\/\//i.test(t)) throw new Error('uguu 拒绝上传');
        return t;
      });
  }
  function uploadImage(file, ok, fail) {
    var hosts = [upCatbox, upTmpfiles, upUguu];
    var i = 0;
    function next(lastErr) {
      if (i >= hosts.length) { fail(lastErr || new Error('所有临时图床不可用')); return; }
      var fn = hosts[i++];
      fn(file).then(ok, function (e) { next(e); });
    }
    next();
  }
  function showImageUrlInput() {
    buildPop();
    var p = $('slSearchPop');
    if (p) p.classList.add('on');
    var box = $('slSpImgUrl');
    if (box) box.classList.add('on');
    var inp = $('slSpImgInput');
    if (inp) inp.focus();
  }

  function reverseSearch(imgUrl) {
    var ov = $('slImgRes');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'slImgRes';
      ov.innerHTML = '<div class="slImgHead"><b>Yandex 以图搜图</b><span id="slImgStat">正在解析…</span><button type="button" id="slImgClose">×</button></div>' +
        '<div class="slImgBody" id="slImgBody"><div class="slImgLoad"><span class="spin"></span> 正在请求 Yandex…</div></div>';
      document.body.appendChild(ov);
      $('slImgClose').onclick = function () { ov.classList.remove('on'); };
    }
    ov.classList.add('on');
    var stat = $('slImgStat');
    var body = $('slImgBody');
    if (stat) stat.textContent = '正在解析…';
    if (body) body.innerHTML = '<div class="slImgLoad"><span class="spin"></span> 正在请求 Yandex…</div>';

    var yurl = 'https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(imgUrl);
    var get = window.SL_SEARCH_TEXT;
    var p = (typeof get === 'function')
      ? get(yurl, 'https://yandex.com/', 15000)
      : fetchT(yurl, {}, 15000).then(function (r) { return r.text(); });

    p.then(function (html) {
      var imgs = parseYandexImages(html);
      if (imgs.length) {
        if (stat) stat.textContent = '找到 ' + imgs.length + ' 张相似图片';
        renderImgGrid(imgs, yurl);
      } else {
        if (stat) stat.textContent = '未解析到相似图片';
        renderImgFallback(yurl, 'Yandex 返回空结果或被拦截');
      }
    }).catch(function (e) {
      if (stat) stat.textContent = '解析失败';
      renderImgFallback(yurl, (e && e.message ? e.message : String(e)));
    });
  }
  function normUrl(u) {
    return String(u || '')
      .replace(/\\u002F/g, '/').replace(/\\\//g, '/')
      .replace(/&amp;/g, '&')
      .replace(/^\/\//, 'https://');
  }
  function parseYandexImages(html) {
    var out = [], seen = {};
    function add(u) {
      u = normUrl(u);
      if (!/^https?:\/\//i.test(u) || u.indexOf('yandex.') >= 0 || seen[u]) return;
      seen[u] = 1; out.push(u);
    }
    var re = /"origUrl":"([^"]+)"/g, m;
    while ((m = re.exec(html || '')) !== null) add(m[1]);
    re = /"preview"\s*:\s*\[\s*\{\s*"url"\s*:\s*"([^"]+)"/g;
    while ((m = re.exec(html || '')) !== null) add(m[1]);
    re = /(?:data-src|src)="(https:\/\/avatars\.mds\.yandex\.net\/[^"]+)"/g;
    while ((m = re.exec(html || '')) !== null) add(m[1]);
    return out.slice(0, 48);
  }
  function renderImgGrid(imgs, yurl) {
    var body = $('slImgBody');
    if (!body) return;
    body.innerHTML = '<div class="slImgHint">点击图片查看原图 · 来源 Yandex</div><div class="slImgGrid">' +
      imgs.map(function (u) {
        return '<a href="' + esc(u) + '" target="_blank" rel="noopener" class="slImgCell"><img loading="lazy" src="' + esc(u) + '" alt=""></a>';
      }).join('') + '</div>' +
      '<div class="slImgFallback"><a href="' + esc(yurl) + '" target="_blank" rel="noopener">在 Yandex 中打开完整结果页 →</a></div>';
  }
  function renderImgFallback(yurl, why) {
    var body = $('slImgBody');
    if (!body) return;
    body.innerHTML = '<div class="slImgEmpty">' + esc(why || '没有结果') + '<br><br>' +
      '<a href="' + esc(yurl) + '" target="_blank" rel="noopener">在 Yandex 中打开以图搜图结果 →</a></div>';
  }

  /* ---------- 真实活跃统计（Abacus 计数器 + IP 去重） ---------- */
  function dateKey() {
    var d = new Date(Date.now() + 8 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  }
  function hashStr(s) {
    s = String(s || '');
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  function deviceId() {
    var k = 'sl_dev_id_v1';
    try {
      var v = localStorage.getItem(k);
      if (!v) {
        v = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(k, v);
      }
      return v;
    } catch (e) { return 'temp-device'; }
  }
  function getIpInfo() {
    return fetchT('https://api.country.is/', { cache: 'no-store' }, 8000)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ip) return { ip: j.ip, country: String(j.country || '').toUpperCase() };
        throw new Error('no ip');
      })
      .catch(function () {
        return fetchT('https://ipwho.is/', { cache: 'no-store' }, 8000)
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j && j.success !== false && j.ip) return { ip: j.ip, country: String(j.country_code || '').toUpperCase() };
            throw new Error('no ip');
          });
      });
  }
  var AB = 'https://abacus.jasoncameron.dev';
  function abGet(key) {
    return fetchT(AB + '/get/silong-respool/' + encodeURIComponent(key), { cache: 'no-store' }, 8000)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && typeof j.value === 'number' ? j.value : 0; })
      .catch(function () { return null; });
  }
  function abStatus(key) {
    return fetchT(AB + '/get/silong-respool/' + encodeURIComponent(key), { cache: 'no-store' }, 8000)
      .then(function (r) { return r.status; })
      .catch(function () { return -1; });
  }
  function abHit(key) {
    return fetchT(AB + '/hit/silong-respool/' + encodeURIComponent(key), {}, 8000)
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }
  function ensureStatsCard() {
    var about = $('aboutSite');
    if (!about || $('slActiveCard')) return;
    var card = document.createElement('div');
    card.id = 'slActiveCard';
    card.className = 'slActiveStats';
    card.innerHTML =
      '<div class="slAsHd"><i class="fa-solid fa-signal"></i> 实时活跃 <span>真实统计 · 同一 IP 每日仅计 1 次</span></div>' +
      '<div class="slAsRow">' +
        '<div class="slAsItem"><b id="slDauCn">--</b><span>国内活跃</span></div>' +
        '<div class="slAsItem"><b id="slDauGl">--</b><span>全球活跃</span></div>' +
        '<div class="slAsItem"><b id="slDauAll">--</b><span>今日总计</span></div>' +
      '</div>' +
      '<div class="slAsNote" id="slDauNote">正在获取真实统计…</div>';
    about.appendChild(card);
    loadStats();
  }
  function renderStats(s) {
    var cn = $('slDauCn'), gl = $('slDauGl'), all = $('slDauAll'), note = $('slDauNote');
    if (!cn || !s) return;
    cn.textContent = s.cn;
    gl.textContent = s.gl;
    all.textContent = s.cn + s.gl;
    if (note) note.textContent = s.note + ' · ' + s.date + '（北京时间）';
  }
  function loadStats() {
    if (statsLoading) return;
    var now = Date.now();
    if (statsLast && now - statsAt < 60000) { renderStats(statsLast); return; }
    statsLoading = true;
    var note = $('slDauNote');
    if (note) note.textContent = '正在获取真实统计…';
    var date = dateKey();
    getIpInfo().then(function (info) {
      var cn = !info || info.country === 'CN' || !info.country;
      var key = info && info.ip ? ('ip-' + date + '-' + hashStr(info.ip)) : ('dev-' + date + '-' + hashStr(deviceId()));
      var noteBase = (!info ? '归属地获取失败，按国内计入' : (cn ? '按 IP 归属国内' : '按 IP 归属海外'));
      return abStatus(key).then(function (st) {
        if (st === 404) {
          return abHit(key).then(function () {
            return abHit((cn ? 'dau-cn-' : 'dau-global-') + date);
          }).then(function () { return { noteBase: noteBase, date: date, cn: cn }; });
        }
        if (st === 200) return { noteBase: noteBase, date: date, cn: cn };
        throw new Error('统计服务不可用');
      });
    }).then(function (r) {
      return Promise.all([abGet('dau-cn-' + date), abGet('dau-global-' + date)]).then(function (arr) {
        if (arr[0] == null || arr[1] == null) throw new Error('统计服务不可用');
        var s = {
          cn: arr[0] || 0, gl: arr[1] || 0,
          note: '同一 IP 每日 1 次 · ' + r.noteBase,
          date: date
        };
        statsLast = s; statsAt = Date.now();
        renderStats(s);
      });
    }).catch(function () {
      var n = $('slDauNote');
      if (n) n.textContent = '统计服务暂不可用（不显示虚构数字）';
    }).then(function () { statsLoading = false; });
  }

  function init() {
    mountNavButton();
    buildPop();
    ensureStatsCard();
    var content = $('content');
    if (content && typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(function () { ensureStatsCard(); });
      mo.observe(content, { childList: true, subtree: true });
    }
    setInterval(ensureStatsCard, 2500);
    document.addEventListener('click', function (e) {
      var p = $('slSearchPop');
      if (!p || !p.classList.contains('on')) return;
      if (e.target.closest && (e.target.closest('#slSearchPop') || e.target.closest('#slNavSearch'))) return;
      closePop();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closePop(); }
    });
  }

  window.SL_SEARCH_RUN = runSearch;
  window.SL_SEARCH_HGET = hget;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
