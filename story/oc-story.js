/* ==========================================================================
   巳泷文游 · 创世工坊剧情编排（2026-11-12）
   章 → 话 → 场景节点：旁白 / 对白 / 选项 / 效果 / 跳转 / 结局
   ========================================================================== */
(function () {
  'use strict';
  var C = window.SLOC;
  if (!C) return;
  var esc = C.esc, toast = C.toast, uid = C.uid;
  var T = { worldId: '', chapId: '', epId: '', sub: 'chapters' };

  function ensure(w) {
    if (!Array.isArray(w.chapters)) w.chapters = [];
    w.chapters.forEach(function (ch) {
      if (!ch.id) ch.id = uid('ch');
      if (!Array.isArray(ch.episodes)) ch.episodes = [];
      ch.episodes.forEach(function (ep) {
        if (!ep.id) ep.id = uid('ep');
        if (!Array.isArray(ep.nodes)) ep.nodes = [];
        ep.nodes.forEach(function (n) {
          if (!n.id) n.id = uid('nd');
          if (!n.type) n.type = 'narr';
          if (n.type === 'choice' && !Array.isArray(n.opts)) n.opts = [];
        });
      });
    });
    return w;
  }
  function chap(w, id) { for (var i = 0; i < w.chapters.length; i++) if (String(w.chapters[i].id) === String(id)) return w.chapters[i]; return null; }
  function ep(ch, id) { for (var i = 0; i < (ch.episodes || []).length; i++) if (String(ch.episodes[i].id) === String(id)) return ch.episodes[i]; return null; }
  function node(epx, id) { for (var i = 0; i < (epx.nodes || []).length; i++) if (String(epx.nodes[i].id) === String(id)) return epx.nodes[i]; return null; }
  function nodeCount(ch) { var n = 0; (ch.episodes || []).forEach(function (e) { n += (e.nodes || []).length; }); return n; }
  function nodeStats(epx) { return (epx.nodes || []).length; }

  var TYPE = {
    narr: { icon: '📖', label: '旁白' }, say: { icon: '💬', label: '对白' },
    choice: { icon: '🔀', label: '选项' }, effect: { icon: '✨', label: '效果' },
    jump: { icon: '➡️', label: '跳转' }, end: { icon: '🏁', label: '结局' }
  };

  /* ---------------- 主视图 ---------------- */
  function storyView(w) {
    ensure(w);
    if (T.worldId !== w.id) { T = { worldId: w.id, chapId: '', epId: '', sub: 'chapters' }; }
    var stats = { ch: w.chapters.length, ep: 0, nd: 0 };
    w.chapters.forEach(function (ch) { stats.ep += (ch.episodes || []).length; stats.nd += nodeCount(ch); });
    var h = '<div class="bar"><h2>剧情编排</h2><span class="cnt">' + stats.ch + ' 章 · ' + stats.ep + ' 话 · ' + stats.nd + ' 节点</span><div class="sp"></div>' +
      '<button class="btn gho" data-a="aiOutline">✨ AI 生成大纲</button>' +
      '<button class="btn pri" data-a="saveNovel" data-mode="script">💾 保存为互动小说</button></div>';
    h += '<div class="chips">' +
      '<button class="chip' + (T.sub === 'chapters' ? ' on' : '') + '" data-a="storySub" data-sub="chapters">章节编排</button>' +
      '<button class="chip' + (T.sub === 'stories' ? ' on' : '') + '" data-a="storySub" data-sub="stories">剧情线与故事集</button>' +
      '</div>';
    if (T.sub === 'stories') return h + C.listView(w, 'stories');
    if (T.chapId && chap(w, T.chapId)) {
      var ch = chap(w, T.chapId);
      if (T.epId && ep(ch, T.epId)) return h + episodeView(w, ch, ep(ch, T.epId));
      return h + chapterView(w, ch);
    }
    return h + chapterList(w);
  }
  function chapterList(w) {
    var h = '<div class="bar"><h2>章节</h2><span class="cnt">' + w.chapters.length + ' 章</span><div class="sp"></div>' +
      '<button class="btn pri" data-a="chapNew">＋ 新建章</button></div>';
    if (!w.chapters.length) {
      return h + '<div class="empty"><b>还没有章节</b>先建一章，再建「话」，把旁白、对白和选项写进去。<br>保存为互动小说后，玩家会按你写的路线与选项游玩。</div>';
    }
    h += '<div class="chap-list">' + w.chapters.map(function (ch, i) {
      return '<div class="chap-card" data-a="chapOpen" data-id="' + esc(ch.id) + '">' +
        '<div class="chap-no">第 ' + (i + 1) + ' 章</div>' +
        '<div class="chap-body"><h4>' + esc(ch.title || '未命名章节') + '</h4>' +
        '<p>' + esc(ch.summary || ((ch.episodes || []).length + ' 话 · ' + nodeCount(ch) + ' 个节点')) + '</p></div>' +
        '<div class="chap-acts">' +
        '<button class="mini" data-a="chapEdit" data-id="' + esc(ch.id) + '">编辑</button>' +
        '<button class="mini" data-a="chapUp" data-id="' + esc(ch.id) + '">↑</button>' +
        '<button class="mini" data-a="chapDown" data-id="' + esc(ch.id) + '">↓</button>' +
        '<button class="mini danger" data-a="chapDel" data-id="' + esc(ch.id) + '">删</button></div></div>';
    }).join('') + '</div>';
    return h;
  }
  function chapterView(w, ch) {
    var h = '<div class="playtop"><button class="mini" data-a="chapBack">← 章节</button>' +
      '<h2>' + esc(ch.title || '未命名章节') + '</h2><span class="meta">' + (ch.episodes || []).length + ' 话 · ' + nodeCount(ch) + ' 节点</span>' +
      '<span class="spacer" style="flex:1"></span>' +
      '<button class="mini" data-a="chapEdit" data-id="' + esc(ch.id) + '">编辑章</button>' +
      '<button class="btn pri" data-a="epNew" data-id="' + esc(ch.id) + '">＋ 新建话</button></div>';
    if (ch.summary) h += '<div class="chap-summary">' + esc(ch.summary) + '</div>';
    if (!(ch.episodes || []).length) return h + '<div class="empty"><b>这一章还没有「话」</b>点右上角新建第一话，开始写场景节点。</div>';
    h += '<div class="chap-list">' + ch.episodes.map(function (e, i) {
      return '<div class="chap-card" data-a="epOpen" data-id="' + esc(e.id) + '">' +
        '<div class="chap-no">第 ' + (i + 1) + ' 话</div>' +
        '<div class="chap-body"><h4>' + esc(e.title || '未命名话') + '</h4>' +
        '<p>' + esc(e.summary || (nodeStats(e) + ' 个节点')) + '</p></div>' +
        '<div class="chap-acts">' +
        '<button class="mini" data-a="epEdit" data-id="' + esc(e.id) + '">编辑</button>' +
        '<button class="mini" data-a="epUp" data-id="' + esc(e.id) + '">↑</button>' +
        '<button class="mini" data-a="epDown" data-id="' + esc(e.id) + '">↓</button>' +
        '<button class="mini danger" data-a="epDel" data-id="' + esc(e.id) + '">删</button></div></div>';
    }).join('') + '</div>';
    return h;
  }
  function episodeView(w, ch, e) {
    var h = '<div class="playtop"><button class="mini" data-a="epBack">← 本话列表</button>' +
      '<h2>' + esc(e.title || '未命名话') + '</h2><span class="meta">' + nodeStats(e) + ' 个节点</span>' +
      '<span class="spacer" style="flex:1"></span>' +
      '<button class="mini" data-a="epEdit" data-id="' + esc(e.id) + '">编辑话</button></div>';
    if (e.summary) h += '<div class="chap-summary">' + esc(e.summary) + '</div>';
    h += '<div class="node-tools">' + Object.keys(TYPE).map(function (k) {
      return '<button class="btn gho mini" data-a="nodeNew" data-kind="' + k + '">＋ ' + TYPE[k].label + '</button>';
    }).join('') + '</div>';
    if (!(e.nodes || []).length) return h + '<div class="empty"><b>这一话还没有内容</b>从上方选择「旁白 / 对白 / 选项」，搭出第一幕。</div>';
    h += '<div class="node-list">' + e.nodes.map(function (n, i) {
      var tp = TYPE[n.type] || TYPE.narr;
      var preview = n.text || '';
      if (n.type === 'choice') preview = (n.text || '选择') + '（' + (n.opts || []).length + ' 个选项）';
      if (n.type === 'jump') preview = '跳转到：' + (epLabel(ch, n.next) || '未设置');
      if (n.type === 'effect') preview = [n.text, n.grant ? '获得物品：' + itemName(w, n.grant) : '', n.flag ? '标记：' + n.flag : ''].filter(Boolean).join(' · ');
      return '<div class="node-card n-' + n.type + '">' +
        '<div class="node-head"><span class="node-ic">' + tp.icon + '</span><b>' + tp.label + '</b>' +
        (n.type === 'say' && n.who ? '<span class="node-who">' + esc(n.who) + '</span>' : '') +
        '<span class="spacer" style="flex:1"></span>' +
        '<button class="mini" data-a="nodeEdit" data-id="' + esc(n.id) + '">编辑</button>' +
        '<button class="mini" data-a="nodeUp" data-id="' + esc(n.id) + '">↑</button>' +
        '<button class="mini" data-a="nodeDown" data-id="' + esc(n.id) + '">↓</button>' +
        '<button class="mini danger" data-a="nodeDel" data-id="' + esc(n.id) + '">删</button></div>' +
        '<p class="node-text">' + esc(preview) + '</p></div>';
    }).join('') + '</div>';
    return h;
  }
  function epLabel(ch, id) {
    if (!id || id === 'continue') return '继续下一节点';
    for (var i = 0; i < (ch.episodes || []).length; i++) if (String(ch.episodes[i].id) === String(id)) return '第 ' + (i + 1) + ' 话 · ' + (ch.episodes[i].title || '未命名');
    return '';
  }
  function itemName(w, id) {
    var arr = w.items || [];
    for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) return arr[i].name;
    return id || '';
  }

  /* ---------------- 章 / 话 编辑 ---------------- */
  function chapForm(id) {
    var w = C.cur(); if (!w) return;
    var ch = id ? chap(w, id) : { title: '', summary: '' };
    var h = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>' + (id ? '编辑章' : '新建章') + '</h3>' +
      '<div class="field"><label>章标题</label><input id="chTitle" value="' + esc(ch.title || '') + '" placeholder="例如：第一章 · 风起白霜城"></div>' +
      '<div class="field"><label>章梗概</label><textarea id="chSummary" placeholder="这一章发生什么">' + esc(ch.summary || '') + '</textarea></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button>' +
      '<button class="btn pri" data-a="chapSave" data-id="' + (id || '') + '">保存</button></div></div></div>';
    C.modal.innerHTML = h;
  }
  function chapSave(id) {
    var w = C.cur(); if (!w) return;
    var title = (document.getElementById('chTitle').value || '').trim();
    var summary = (document.getElementById('chSummary').value || '').trim();
    if (!title) { toast('先写章标题'); return; }
    if (id) { var ch = chap(w, id); if (ch) { ch.title = title; ch.summary = summary; } }
    else { w.chapters.push({ id: uid('ch'), title: title, summary: summary, episodes: [] }); }
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('已保存');
  }
  function epForm(id) {
    var w = C.cur(); if (!w) return;
    var ch = chap(w, T.chapId); if (!ch) return;
    var e = id ? ep(ch, id) : { title: '', summary: '' };
    var h = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>' + (id ? '编辑话' : '新建话') + '</h3>' +
      '<div class="field"><label>话标题</label><input id="epTitle" value="' + esc(e.title || '') + '" placeholder="例如：第一话 · 雪夜来客"></div>' +
      '<div class="field"><label>话梗概</label><textarea id="epSummary" placeholder="这一幕的核心冲突">' + esc(e.summary || '') + '</textarea></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button>' +
      '<button class="btn pri" data-a="epSave" data-id="' + (id || '') + '">保存</button></div></div></div>';
    C.modal.innerHTML = h;
  }
  function epSave(id) {
    var w = C.cur(); if (!w) return;
    var ch = chap(w, T.chapId); if (!ch) return;
    var title = (document.getElementById('epTitle').value || '').trim();
    var summary = (document.getElementById('epSummary').value || '').trim();
    if (!title) { toast('先写话标题'); return; }
    if (id) { var e = ep(ch, id); if (e) { e.title = title; e.summary = summary; } }
    else { var ne = { id: uid('ep'), title: title, summary: summary, nodes: [] }; ch.episodes.push(ne); T.epId = ne.id; }
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('已保存');
  }

  /* ---------------- 节点编辑 ---------------- */
  function nodeForm(kind, id) {
    var w = C.cur(); if (!w) return;
    var ch = chap(w, T.chapId), e = ep(ch, T.epId); if (!e) return;
    var n = id ? node(e, id) : { type: kind, text: '', opts: [] };
    var h = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>' + (TYPE[n.type] || TYPE.narr).label + (id ? ' · 编辑节点' : ' · 新建节点') + '</h3>';
    if (n.type === 'say') {
      h += '<div class="row2"><div class="field"><label>说话角色</label><select id="nWhoSel">' +
        '<option value="">自由填写</option>' + (w.chars || []).map(function (c) { return '<option value="' + esc(c.name) + '"' + (n.who === c.name ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
        '</select></div><div class="field"><label>角色名</label><input id="nWho" value="' + esc(n.who || '') + '" placeholder="对白显示的名字"></div></div>';
    }
    if (n.type === 'choice') {
      h += '<div class="field"><label>选项提示 / 问题</label><textarea id="nText" placeholder="例如：你要如何回应？">' + esc(n.text || '') + '</textarea></div>';
      h += '<div class="field"><label>对话选项</label><div id="optWrap">';
      (n.opts || []).forEach(function (o) { h += optRow(w, ch, o); });
      h += '</div><button type="button" class="btn gho mini" id="optAdd">＋ 添加选项</button></div>';
      h += '<div class="hint">选项可以是「继续下一节点」，也可以跳转到本话中的某一话；还能设置获得物品、需要物品与标记。</div>';
    } else if (n.type === 'jump') {
      h += '<div class="field"><label>跳转到</label><select id="nNext">' + epOptions(ch, n.next) + '</select></div>';
    } else if (n.type === 'effect') {
      h += '<div class="field"><label>提示文字</label><textarea id="nText">' + esc(n.text || '') + '</textarea></div>';
      h += '<div class="row2"><div class="field"><label>获得物品</label><select id="nGrant">' + itemOptions(w, n.grant) + '</select></div>' +
        '<div class="field"><label>设置标记</label><input id="nFlag" value="' + esc(n.flag || '') + '" placeholder="例如：见过白狐"></div></div>';
    } else {
      h += '<div class="field"><label>' + (n.type === 'end' ? '结局文字' : '旁白内容') + '</label><textarea id="nText" style="min-height:110px">' + esc(n.text || '') + '</textarea></div>';
      if (n.type === 'narr') {
        h += '<div class="hint">支持引用：在文字里写 [[c:角色ID]]、[[p:地点ID]]、[[i:物品ID]]，播放时会自动替换成名字。也可以直接写名字。</div>';
      }
    }
    h += '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button>' +
      '<button class="btn pri" data-a="nodeSave" data-id="' + (id || '') + '">保存</button></div></div></div>';
    C.modal.innerHTML = h;
    var sel = document.getElementById('nWhoSel');
    if (sel) sel.onchange = function () { var v = sel.value; if (v) document.getElementById('nWho').value = v; };
    var add = document.getElementById('optAdd');
    if (add) add.onclick = function () {
      var wrap = document.getElementById('optWrap');
      var d = document.createElement('div'); d.className = 'opt-row';
      d.innerHTML = optRowInner(w, ch, {});
      wrap.appendChild(d);
    };
  }
  function epOptions(ch, val) {
    return '<option value="continue"' + (!val || val === 'continue' ? ' selected' : '') + '>继续下一节点</option>' +
      (ch.episodes || []).map(function (e, i) {
        return '<option value="' + esc(e.id) + '"' + (String(val) === String(e.id) ? ' selected' : '') + '>第 ' + (i + 1) + ' 话 · ' + esc(e.title || '未命名') + '</option>';
      }).join('');
  }
  function itemOptions(w, val) {
    return '<option value="">不设置</option>' + (w.items || []).map(function (it) {
      return '<option value="' + esc(it.id) + '"' + (String(val) === String(it.id) ? ' selected' : '') + '>' + esc(it.name) + '</option>';
    }).join('');
  }
  function optRowInner(w, ch, o) {
    return '<div class="opt-fields">' +
      '<input class="o-text" placeholder="选项文字" value="' + esc(o.text || '') + '">' +
      '<select class="o-next">' + epOptions(ch, o.next) + '</select>' +
      '<select class="o-grant">' + itemOptions(w, o.grant).replace('<option value="">不设置</option>', '<option value="">获得物品：不设置</option>') + '</select>' +
      '<select class="o-req">' + itemOptions(w, o.require).replace('<option value="">不设置</option>', '<option value="">需要物品：无</option>') + '</select>' +
      '<input class="o-flag" placeholder="设置标记（可空）" value="' + esc(o.flag || '') + '">' +
      '</div><button type="button" class="cf-del opt-del">✕</button>';
  }
  function optRow(w, ch, o) {
    return '<div class="opt-row">' + optRowInner(w, ch, o) + '</div>';
  }
  function nodeSave(id) {
    var w = C.cur(); if (!w) return;
    var ch = chap(w, T.chapId), e = ep(ch, T.epId); if (!e) return;
    var n = id ? node(e, id) : null;
    if (!n) { n = { id: uid('nd'), type: 'narr' }; e.nodes.push(n); }
    var text = document.getElementById('nText');
    if (text) n.text = text.value.trim();
    if (n.type === 'say') {
      var who = document.getElementById('nWho');
      n.who = who ? who.value.trim() : '';
    }
    if (n.type === 'jump') { var nx = document.getElementById('nNext'); n.next = nx ? nx.value : 'continue'; }
    if (n.type === 'effect') {
      var g = document.getElementById('nGrant'), f = document.getElementById('nFlag');
      n.grant = g ? g.value : ''; n.flag = f ? f.value.trim() : '';
    }
    if (n.type === 'choice') {
      n.opts = [];
      var rows = C.modal.querySelectorAll('.opt-row');
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var t = r.querySelector('.o-text').value.trim();
        if (!t) continue;
        n.opts.push({
          text: t,
          next: r.querySelector('.o-next').value,
          grant: r.querySelector('.o-grant').value,
          require: r.querySelector('.o-req').value,
          flag: r.querySelector('.o-flag').value.trim()
        });
      }
      if (n.opts.length < 2) { toast('至少写两个选项'); return; }
    }
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('节点已保存');
  }

  /* ---------------- AI 大纲 ---------------- */
  function aiOutline() {
    var w = C.cur(); if (!w) return;
    if (!w.desc && !w.chars.length) { toast('先补一些世界设定和角色'); return; }
    var cover = confirm('AI 会生成 1 章 · 2 话的剧情骨架，消耗一次 API 请求。\n确定 = 覆盖现有剧情，取消 = 追加到现有章节后。');
    var btn = C.view.querySelector('[data-a="aiOutline"]');
    if (btn) { btn.disabled = true; btn.textContent = 'AI 构思中…'; }
    var sys = '你是互动小说编剧。只输出严格 JSON，不要解释、不要 Markdown。';
    var user = '世界设定：\n' + C.buildWorldText(w) +
      '\n\n请写一段可玩的互动剧情骨架：1 章，2 话，每话 3-5 个节点。节点类型只能是 narr（旁白）、say（对白，带 who 和 text）、choice（选项，带 text 和 opts 数组，每个 opt 有 text 与 next），最后用 end 结束。' +
      '\n引用角色名、地点名和物品名时必须来自上面的设定。' +
      '\n只输出 JSON：{"chapters":[{"title":"第一章 · 标题","summary":"梗概","episodes":[{"title":"第一话 · 标题","summary":"梗概","nodes":[{"type":"narr","text":"旁白"},{"type":"say","who":"角色名","text":"对白"},{"type":"choice","text":"你要怎么做？","opts":[{"text":"选项一","next":"continue"},{"text":"选项二","next":"continue"}]},{"type":"end","text":"本话结束"}]}]}]}';
    C.chat([{ role: 'system', content: sys }, { role: 'user', content: user }], { temp: 0.9, max: 3200 }).then(function (txt) {
      var j = C.parseJson(txt); if (!j || !j.chapters) throw new Error('AI 返回格式不对，再试一次');
      var chs = [];
      (j.chapters || []).slice(0, 3).forEach(function (ch) {
        var c = { id: uid('ch'), title: String(ch.title || '未命名章节'), summary: String(ch.summary || ''), episodes: [] };
        (ch.episodes || []).slice(0, 5).forEach(function (e) {
          var ee = { id: uid('ep'), title: String(e.title || '未命名话'), summary: String(e.summary || ''), nodes: [] };
          (e.nodes || []).slice(0, 12).forEach(function (n) {
            var nd = { id: uid('nd'), type: n.type || 'narr', text: String(n.text || '') };
            if (nd.type === 'say') nd.who = String(n.who || '');
            if (nd.type === 'choice') {
              nd.opts = (n.opts || []).slice(0, 5).map(function (o) { return { text: String(o.text || '继续'), next: o.next || 'continue', grant: '', require: '', flag: '' }; });
              if (nd.opts.length < 2) nd.opts = [{ text: '继续', next: 'continue' }, { text: '再想想', next: 'continue' }];
            }
            if (nd.type === 'jump') nd.next = n.next || 'continue';
            if (nd.type === 'effect') { nd.grant = ''; nd.flag = ''; }
            ee.nodes.push(nd);
          });
          if (!ee.nodes.length) ee.nodes.push({ id: uid('nd'), type: 'narr', text: e.summary || '故事继续。' });
          c.episodes.push(ee);
        });
        if (!c.episodes.length) c.episodes.push({ id: uid('ep'), title: '第一话', summary: '', nodes: [{ id: uid('nd'), type: 'narr', text: ch.summary || '故事开始了。' }] });
        chs.push(c);
      });
      if (!chs.length) throw new Error('AI 没有生成章节');
      if (cover) w.chapters = chs; else w.chapters = w.chapters.concat(chs);
      C.touch(); T.chapId = ''; T.epId = ''; C.renderEditor(); toast('剧情大纲已生成');
    }).catch(function (e) {
      toast(e.message || 'AI 生成失败');
      if (btn) { btn.disabled = false; btn.textContent = '✨ AI 生成大纲'; }
    });
  }

  /* ---------------- 事件 ---------------- */
  function move(arr, id, dir) {
    for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) {
      var j = i + dir; if (j < 0 || j >= arr.length) return;
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t; return;
    }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-a]') : null;
    if (!t) return;
    var a = t.getAttribute('data-a'), id = t.getAttribute('data-id'), kind = t.getAttribute('data-kind');
    var w = C.cur(); if (!w) return;
    if (a === 'storySub') { T.sub = t.getAttribute('data-sub'); C.renderEditor(); return; }
    if (a === 'chapNew') { chapForm(''); return; }
    if (a === 'chapOpen') { T.chapId = id; T.epId = ''; C.renderEditor(); return; }
    if (a === 'chapBack') { T.chapId = ''; T.epId = ''; C.renderEditor(); return; }
    if (a === 'chapEdit') { e.stopPropagation(); chapForm(id); return; }
    if (a === 'chapSave') { chapSave(id); return; }
    if (a === 'chapDel') { e.stopPropagation(); if (confirm('删除这一章？')) { w.chapters = w.chapters.filter(function (c) { return String(c.id) !== String(id); }); C.touch(); C.renderEditor(); } return; }
    if (a === 'chapUp') { e.stopPropagation(); move(w.chapters, id, -1); C.touch(); C.renderEditor(); return; }
    if (a === 'chapDown') { e.stopPropagation(); move(w.chapters, id, 1); C.touch(); C.renderEditor(); return; }
    if (a === 'epNew') { T.chapId = id; epForm(''); return; }
    if (a === 'epOpen') { T.epId = id; C.renderEditor(); return; }
    if (a === 'epBack') { T.epId = ''; C.renderEditor(); return; }
    if (a === 'epEdit') { e.stopPropagation(); epForm(id); return; }
    if (a === 'epSave') { epSave(id); return; }
    if (a === 'epDel') {
      e.stopPropagation();
      var ch = chap(w, T.chapId); if (!ch) return;
      if (confirm('删除这一话？')) { ch.episodes = ch.episodes.filter(function (x) { return String(x.id) !== String(id); }); C.touch(); C.renderEditor(); }
      return;
    }
    if (a === 'epUp') { e.stopPropagation(); var c1 = chap(w, T.chapId); if (c1) { move(c1.episodes, id, -1); C.touch(); C.renderEditor(); } return; }
    if (a === 'epDown') { e.stopPropagation(); var c2 = chap(w, T.chapId); if (c2) { move(c2.episodes, id, 1); C.touch(); C.renderEditor(); } return; }
    if (a === 'nodeNew') { nodeForm(kind, ''); return; }
    if (a === 'nodeEdit') { nodeForm('', id); return; }
    if (a === 'nodeSave') { nodeSave(id); return; }
    if (a === 'nodeDel') {
      var ch3 = chap(w, T.chapId), e3 = ch3 && ep(ch3, T.epId);
      if (!e3) return;
      if (confirm('删除这个节点？')) { e3.nodes = e3.nodes.filter(function (x) { return String(x.id) !== String(id); }); C.touch(); C.renderEditor(); }
      return;
    }
    if (a === 'nodeUp' || a === 'nodeDown') {
      var ch4 = chap(w, T.chapId), e4 = ch4 && ep(ch4, T.epId);
      if (e4) { move(e4.nodes, id, a === 'nodeUp' ? -1 : 1); C.touch(); C.renderEditor(); }
      return;
    }
    if (a === 'aiOutline') { aiOutline(); return; }
  });
  document.addEventListener('click', function (e) {
    var d = e.target.closest ? e.target.closest('.opt-del') : null;
    if (d) { var row = d.closest('.opt-row'); if (row) row.parentNode.removeChild(row); }
  });

  C.storyView = storyView;
  C.storyReset = function () { T = { worldId: '', chapId: '', epId: '', sub: 'chapters' }; };
})();
