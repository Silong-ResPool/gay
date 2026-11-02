/* 巳泷 v9.0.9：源自动分类路由器
   当用户在 漫画/小说/音乐 任一界面粘贴 JSON 源时，自动识别该源属于哪一类：
   - 小说（novel）→ 存到小说区
   - 漫画（comic）→ 存到漫画区
   - 广播剧 / 听书 / 音频（radio）→ 存到音乐区
   - 歌曲 / 播放列表（music）→ 存到音乐区
   各界面读取共享区，把属于自己分类的源加载进来。
   识别依据：URL 域名/路径关键词 + JSON 内容字段（name/title/cat/type/url）。 */
window.SLROUTER = (function () {
  var KEY = 'sl_sources_shared_v1';

  function load() {
    try { var s = localStorage.getItem(KEY); var o = s ? JSON.parse(s) : {}; return { novel: [], comic: [], radio: [], music: [] }; } catch (e) { return { novel: [], comic: [], radio: [], music: [] }; }
  }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  /* 分类关键词（命中即判定对应类别） */
  var RULES = [
    { key: 'novel', names: ['小说', '书源', 'book', 'novel', 'legado', 'read', 'wenku', 'bilinovel', 'syosetu', 'pixiv小说', 'linpx', 'aoaostar'] },
    { key: 'comic', names: ['漫画', 'comic', 'manga', 'eviewer', 'ehviewer', 'aidoku', 'nhentai', 'hentai', 'wholesome'] },
    { key: 'radio', names: ['广播剧', '听书', '漫播', '喜马拉雅', 'ximalaya', 'manbo', 'xbs', 'radio', 'podcast', 'audio'] },
    { key: 'music', names: ['歌单', '音乐', 'music', 'playlist', 'spotify', 'audiomack', 'archive.org', 'listennotes'] }
  ];

  // 从一段 JSON/URL 文本里猜测分类；返回 'novel'|'comic'|'radio'|'music'，未知返回 ''
  function classify(text) {
    var t = String(text || '').toLowerCase();
    var hits = {};
    for (var i = 0; i < RULES.length; i++) {
      for (var j = 0; j < RULES[i].names.length; j++) {
        if (t.indexOf(RULES[i].names[j].toLowerCase()) >= 0) { hits[RULES[i].key] = (hits[RULES[i].key] || 0) + 1; }
      }
    }
    if (!Object.keys(hits).length) return '';
    var best = '', bestN = 0;
    for (var k in hits) { if (hits[k] > bestN) { best = k; bestN = hits[k]; } }
    return best;
  }

  // 添加一个源到指定分类
  function add(cat, src) {
    if (!src || !src.name) return false;
    var o = load();
    var arr = o[cat] || (o[cat] = []);
    for (var i = 0; i < arr.length; i++) if (arr[i].name === src.name) return false;
    arr.push(src);
    save(o);
    return true;
  }

  // 读取指定分类的共享源
  function get(cat) {
    var o = load();
    return (o[cat] || []).slice();
  }

  // 尝试将一段文本解析出的源放入合适分类；返回 {cat:'', added:boolean} 或 {redirect:true, cat}
  function route(text, fallbackCat) {
    var cat = classify(fallbackCat || '') || classify(text);
    if (!cat) return { added: false, cat: '' };
    var src = { name: '共享源 ' + Date.now().toString(36), raw: String(text || '').slice(0, 4000), shared: true, ts: Date.now() };
    try {
      var j = JSON.parse(String(text || ''));
      if (j) {
        var nm = j.bookSourceName || j.name || j.sourceName || j.title || '共享源';
        src.name = nm;
        src.api = j.api || j.url || j.json || '';
        src.url = j.url || j.json || '';
        src.sourceName = j.bookSourceName || j.name || '';
      }
    } catch (e) {}
    var ok = add(cat, src);
    return { added: ok, cat: cat };
  }

  return { classify: classify, add: add, get: get, route: route, KEY: KEY };
})();