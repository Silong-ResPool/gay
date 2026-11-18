/* 巳泷中枢 · 通用 AI 生成 / 润词层
   规则：空字段→生成；已有内容→保留原意润词补全。结果本地永久缓存。 */
(function () {
  'use strict';
  var CACHE = 'sl_nexus_ai_cache_v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DEC = function (v) { try { return decodeURIComponent(escape(atob(String(v || '')))); } catch (e) { try { return atob(String(v || '')); } catch (e2) { return ''; } } };
  function toast(t) {
    var el = $('#nxToast'); if (!el) { alert(t); return; }
    el.textContent = t; el.classList.add('on');
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.classList.remove('on'); }, 4200);
  }
  function cfg() {
    var c = { base: '', key: '', model: '', temp: .85, custom: false };
    try {
      var A = window.SL_API || window.SL_API_NV;
      if (A) { c.base = DEC(A.b); c.key = DEC((A.k && A.k[0]) || ''); c.model = DEC(A.m); }
    } catch (e) {}
    try {
      var u = JSON.parse(localStorage.getItem('sl_story_cfg_v1') || '{}') || {};
      if (u.base) c.base = u.base; if (u.key) c.key = u.key; if (u.model) c.model = u.model; if (u.temp) c.temp = u.temp;
      c.custom = !!(u.key && String(u.key).trim());
    } catch (e) {}
    return c;
  }
  function apiUrl(base) {
    var b = String(base || '').replace(/\/+$/, '');
    if (!/\/v\d+$/.test(b)) b += '/v1';
    return b + '/chat/completions';
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function cacheGet(k) { try { var o = JSON.parse(localStorage.getItem(CACHE) || '{}'); return o[k] || null; } catch (e) { return null; } }
  function cachePut(k, v) {
    try {
      var o = JSON.parse(localStorage.getItem(CACHE) || '{}'); o[k] = { v: v, at: Date.now() };
      var ks = Object.keys(o); if (ks.length > 200) ks.slice(0, ks.length - 200).forEach(function (x) { delete o[x]; });
      localStorage.setItem(CACHE, JSON.stringify(o));
    } catch (e) {}
  }
  function parse(txt) {
    var t = String(txt || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    var a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) t = t.slice(a, b + 1);
    try { return JSON.parse(t); } catch (e) { return null; }
  }
  function call(user, max) {
    var c = cfg();
    if (!c.base || !c.key) {
      return Promise.reject(new Error('未配置 AI API。请到资源管家「API 与模型」注册免费 API，或在文游书架右上角填写自己的 Key。'));
    }
    if (!c.custom && window.SL_AI_LIMIT && !window.SL_DEV) {
      var q = SL_AI_LIMIT.take();
      if (!q.ok) return Promise.reject(new Error('内置 API 额度已用完（5 分钟最多 20 次/设备）。可更换 API，或到资源管家注册免费 API；自填 Key 不受限制。冷却约 ' + Math.ceil((q.resetIn || 0) / 1000) + ' 秒。'));
    }
    var sys = String(window.SL_INJECTION || '').trim() || '你是巳泷世界观中枢的设定编辑，严格服从已有世界规则，不写露骨内容。';
    return fetch(apiUrl(c.base), {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.key },
      body: JSON.stringify({ model: c.model || 'agnes-3.0-flash', messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], temperature: c.temp || .85, max_tokens: max || 1200, stream: false })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status === 429 ? 'API 请求过于频繁或额度用尽（内置 5 分钟最多 20 次）' : 'API 调用失败：HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      var raw = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!raw) throw new Error('API 返回空内容');
      return raw;
    });
  }
  function sectionName(form) {
    var sec = form.closest('.nx-section'); var h = sec && sec.querySelector('h2');
    return h ? h.textContent.trim() : '中枢条目';
  }
  function fields(form) {
    return $$('input,select,textarea', form).filter(function (el) {
      return el.type !== 'file' && el.type !== 'hidden' && el.name && el.name !== 'file';
    });
  }
  function snapshot(form) {
    var o = {};
    fields(form).forEach(function (el) {
      if (el.tagName === 'SELECT') o[el.name] = el.value;
      else if (el.type === 'checkbox') o[el.name] = el.checked;
      else o[el.name] = String(el.value || '').trim();
    });
    return o;
  }
  function prompt(form, data) {
    var empty = Object.keys(data).every(function (k) { return !data[k]; });
    var names = fields(form).map(function (el) {
      var label = el.closest('.nx-field');
      var l = label && label.querySelector('label');
      return el.name + (l ? '（' + l.textContent.trim() + '）' : '');
    });
    return '当前板块：' + sectionName(form) + '\n字段：' + names.join('，') +
      '\n现有内容：' + JSON.stringify(data) +
      '\n任务：' + (empty ? '根据板块主题生成一条完整、可直接使用的设定。' : '保留现有内容的核心意思，润色并补全空缺，不要删掉已有专有名词。') +
      '\n只输出一个 JSON 对象，键必须与字段名完全一致；值为字符串。不要解释，不要 Markdown。';
  }
  function apply(form, obj) {
    var n = 0;
    fields(form).forEach(function (el) {
      if (!(el.name in obj)) return;
      var v = obj[el.name];
      if (typeof v === 'object') v = JSON.stringify(v);
      if (el.tagName === 'SELECT') {
        var ok = $$('option', el).some(function (o) { return o.value === String(v) || o.textContent.trim() === String(v); });
        if (ok) { el.value = String(v); n++; }
        else {
          var op = document.createElement('option'); op.value = String(v); op.textContent = String(v); el.appendChild(op); el.value = String(v); n++;
        }
      } else if (el.type === 'checkbox') { el.checked = !!v; n++; }
      else { el.value = String(v == null ? '' : v); n++; }
    });
    return n;
  }
  function attach(form) {
    if (form.__nxAi) return; form.__nxAi = true;
    var bar = form.querySelector('.bar') || form;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'nx-btn ai-gen'; btn.textContent = 'AI 生成 / 润词';
    btn.title = '为空时生成，已有内容时润词补全；结果永久缓存在本机';
    btn.addEventListener('click', function () {
      var data = snapshot(form);
      var key = 'nx_' + hash(sectionName(form) + JSON.stringify(data));
      var hit = cacheGet(key);
      if (hit && hit.v) {
        var n0 = apply(form, hit.v);
        toast('已从本地缓存填入 ' + n0 + ' 项，不消耗 AI 额度。'); return;
      }
      var old = btn.textContent; btn.disabled = true; btn.textContent = 'AI 思考中…';
      call(prompt(form, data), 1200).then(function (raw) {
        var obj = parse(raw);
        if (!obj) throw new Error('AI 返回格式不正确，请重试');
        cachePut(key, obj);
        var n = apply(form, obj);
        toast('AI 已' + (Object.keys(data).every(function (k) { return !data[k]; }) ? '生成' : '润词') + '并填入 ' + n + ' 项；已永久缓存。');
      }).catch(function (e) {
        var m = String(e && e.message || e);
        toast(m + (/未配置|额度|API/.test(m) ? '' : ' 请检查网络或更换 API。'));
      }).then(function () { btn.disabled = false; btn.textContent = old; });
    });
    if (bar.classList && bar.classList.contains('bar')) bar.insertBefore(btn, bar.firstChild);
    else form.appendChild(btn);
  }
  function addConfigBar() {
    var head = $('.nx-head');
    if (!head || $('.nx-ai-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'nx-ai-bar';
    bar.innerHTML = '<span>AI 全程读取统一注入指令，结果永久缓存在本机。</span><a href="../butler/index.html#settings" target="_blank" rel="noopener">注册 / 填写 API</a>';
    head.parentNode.insertBefore(bar, head.nextSibling);
  }
  function init() {
    $$('.nx-form').forEach(attach);
    addConfigBar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SL_NEXUS_AI = { call: call, cacheGet: cacheGet, clearCache: function () { localStorage.removeItem(CACHE); toast('中枢 AI 缓存已清空。'); } };
})();
