/* ==========================================================================
   影视乐园 · sources.js
   内置视频源的结构定义与源解析工具
   · 内置源数据在 sources_data.js 里（VIDEO_SOURCES：{n:名称, a:接口, c:分类}）
   · 支持用户自己添加源：三框添加（分类 / 名称 / 链接），也支持整份 JSON / TVBox 配置 / 多仓
   ========================================================================== */

(function (w) {
  'use strict';

  // 内置源的分类顺序（源管理里按这个顺序分块展示）
  w.VIDEO_CATS = ['综合影视', '动漫', '剧集', '短剧', '综艺', '成人（18+）', '教育', '其他源（待验证）', '失效区', '自定义'];
  // 主页（首页）分类 Tab：仓库分类 / 综合资源接口 / 成人 / 动漫 / 自定义
  w.VIDEO_HOME_CATS = ['仓库分类', '综合资源接口', '成人', '动漫', '自定义'];
  // 「其他源（待验证）」默认不参与全局搜索（源太多、且多数已失效），可在全局搜索里临时打开
  w.VIDEO_PENDING_CAT = '其他源（待验证）';
  // 自动检测判为失效的源统一归到这里
  w.VIDEO_DEAD_CAT = '失效区';

  /* 读取一个 URL 的文本内容（仓库展开 / 多接口自动识别共用） */
  w.fetchText = function (url) {
    return fetch(String(url || ''), { cache: 'no-store' }).then(function (res) { return res.text(); });
  };

  /* 解析一段配置文本，返回可用接口列表 [{name, api}]（空数组 = 没有） */
  w.interfacesOf = function (text) {
    var r = w.parseSourceJson(String(text || ''));
    return (r && r.ok && r.list) ? r.list : [];
  };

  /* 解析一段配置文本里的接口数量 */
  w.countInterfaces = function (text) {
    return w.interfacesOf(text).length;
  };

  w.VIDEO_SOURCES = w.VIDEO_SOURCES || [];

  /* ---------------------------------------------------------------- 源解析
     支持格式：
     ① 单个源：              {"name":"某某资源","api":"https://xxx/api.php/provide/vod/"}
     ② 源数组：              [{"name":..,"api":..}, ...]
     ③ TVBox 配置：          {"sites":[{"key":..,"name":..,"type":1,"api":..}, ...]}
     ④ TVBox 多仓/子配置：    {"urls":[{"name":..,"url":..}]}  → 提示用户填子配置地址
     返回：{ ok:true, list:[{name, api}], tip:'' } */
  w.parseSourceJson = function (text) {
    var out = [], tip = '';
    var j = null;
    try { j = JSON.parse(String(text || '')); } catch (e) { return { ok: false, msg: '不是合法的 JSON：' + e.message }; }

    var push = function (name, api) {
      if (!api || typeof api !== 'string') return;
      if (!/^https?:\/\//i.test(api)) return;
      if (/\.(jar|js|py)(\?|;|$)/i.test(api)) return;      // 需要爬虫文件的源，网页版用不了
      var nm = (name && String(name).trim()) || api.replace(/^https?:\/\//, '').split('/')[0];
      var base = api.replace(/\s+$/, '');
      for (var i = 0; i < out.length; i++) if (out[i].api === base) return;
      out.push({ name: nm, api: base });
    };

    var fromSite = function (s) {
      if (!s || typeof s !== 'object') return;
      var api = s.api || s.ext || '';
      // type=1 才是 JSON 采集接口；其他类型（3=需要 jar 的爬虫）跳过
      if (s.type !== undefined && s.type !== null && String(s.type) !== '' && Number(s.type) !== 1) return;
      push(s.name || s.key, api);
    };

    if (Array.isArray(j)) { for (var i = 0; i < j.length; i++) fromSite(j[i]); }
    else if (j && Array.isArray(j.sites)) { for (var k = 0; k < j.sites.length; k++) fromSite(j.sites[k]); }
    else if (j && Array.isArray(j.urls)) { tip = '这是「多仓」配置，请打开其中一个子配置地址，把子配置里的 JSON 粘进来（或直接填该 JSON 地址）。'; }
    else if (j && (j.api || j.url)) { fromSite(j); }
    else tip = '没识别到可用的源（需要 name + api 字段，或 TVBox 的 sites 数组）。';

    // 纯文本（一行一个采集接口地址，常见于 xxx多线.txt）
    if (!out.length) {
      var lines = String(text || '').split(/[\r\n]+/);
      var n = 0;
      for (var li = 0; li < lines.length && n < 300; li++) {
        var s2 = lines[li].trim();
        if (!/^https?:\/\//i.test(s2)) continue;
        if (/\.(txt|json)$/i.test(s2)) continue;      // 子配置地址交给「仓库展开」处理
        push(s2.replace(/^https?:\/\//, '').split('/')[0], s2);
        n++;
      }
      if (out.length) return { ok: true, list: out, tip: '来自纯文本列表' };
    }

    if (!out.length) return { ok: false, msg: tip || '没有解析到 type=1（JSON 接口）的源。' };
    return { ok: true, list: out, tip: tip };
  };

  /* 三框添加源时的链接校验：把常见写法补全成标准接口地址 */
  w.normalizeSourceApi = function (api) {
    var s = String(api || '').trim();
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    s = s.replace(/\s+/g, '');
    // 只填了域名/目录 → 补上苹果CMS 标准路径
    if (!/\.php|\.json|\.txt|\?/i.test(s)) {
      s = s.replace(/\/+$/, '') + '/api.php/provide/vod/';
    }
    // 去掉结尾多余的 ? 或 ?ac=xxx（本应用会自己拼参数）
    s = s.replace(/[?&]+$/, '');
    s = s.replace(/\?(ac=list|ac=class|ac=detail.*)$/i, '');
    return s;
  };

})(window);