/* 导入世界卡：把用户导出的 .slcard.json 转成统一引擎世界包 */
(function () {
  'use strict';
  function qs(k) {
    var m = new RegExp('[?&]' + k + '=([^&]*)', 'i').exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }
  var id = qs('id'), arr = [];
  try { arr = JSON.parse(localStorage.getItem('sl_story_cards_v1') || '[]') || []; } catch (e) { arr = []; }
  var card = null;
  for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) { card = arr[i]; break; }
  if (!card) {
    document.body.innerHTML = '<div style="padding:32px;color:#fff;font-family:sans-serif;line-height:1.8">找不到这张导入卡。请回到书架重新导入，或检查本地存档是否被清除。<br><a style="color:#a78bfa" href="../index.html">回书架</a></div>';
    window.SL_PACK = null;
    return;
  }
  if (card.pack && typeof card.pack === 'object') {
    window.SL_PACK = card.pack;
    return;
  }
  var chars = card.chars || (card.snapshot && card.snapshot.chars) || [];
  var items = card.items || (card.snapshot && card.snapshot.items) || [];
  var places = card.places || (card.snapshot && card.snapshot.places) || [];
  var factions = card.factions || (card.snapshot && card.snapshot.factions) || [];
  var events = card.events || (card.snapshot && card.snapshot.events) || [];
  var relations = chars.filter(function (c) { return !c.gender || c.gender === '男'; }).slice(0, 5).map(function (c, i) {
    return { key: 'c' + i, name: c.name || ('角色 ' + (i + 1)), role: [c.role, c.race].filter(Boolean).join(' · ') || '可攻略角色', init: i === 0 ? 16 : 10, max: 100 };
  });
  var itemMap = {};
  items.forEach(function (x, i) {
    var id2 = x.id || ('i' + i);
    itemMap[id2] = { name: x.name || ('物品 ' + (i + 1)), desc: [x.type, x.effect, x.desc].filter(Boolean).join(' · '), tags: x.tags || [x.type || '物品'], icon: String(x.name || '物').slice(0, 1) };
  });
  var choices = (card.choices && card.choices.length ? card.choices : ['先观察四周', '找个人谈谈', '跟随直觉行动']).slice(0, 4);
  function choiceList() {
    return choices.map(function (label, i) {
      return {
        label: label,
        hint: i === 0 ? '观察 · 心念 +2' : (i === 1 ? '交谈 · 羁绊 +4' : '行动 · 线索 +1'),
        eff: i === 0 ? { stats: { resolve: 2 } } : (i === 1 ? { rel: relations[0] ? (function(){var o={};o[relations[0].key]=4;return o})() : {}, stats: { bond: 3 } } : { stats: { clues: 1 } }),
        next: 'loop'
      };
    });
  }
  var baseText = (card.opening || card.world || card.desc || '故事从这里开始。');
  var worldText = (card.world || (card.snapshot && card.snapshot.desc) || card.desc || '');
  var pack = {
    id: 'imported_' + card.id, title: card.title || '导入世界卡', subtitle: card.subtitle || '本地导入 · 统一引擎',
    kicker: 'IMPORTED · WORLD CARD', theme: 'dashboard', layout: 'dashboard', modeLabel: '导入世界', mode: 'imported',
    accent: (card.accent && card.accent[0]) || '#a78bfa', accent2: (card.accent && card.accent[1]) || '#22d3ee',
    bg: '#070512', bg2: '#110b22', cover: card.cover || 'https://aka.doubaocdn.com/s/86vIuO1odF',
    turnsPerDay: 4, eventChance: 0.32,
    freePlaceholder: '自由行动：观察 / 交谈 / 探索 / 调查 / 休息 / 继续剧情',
    bgm: [
      { id: 'daily', name: '日常', mood: 'daily', tempo: 66, scale: 'minor', lead: 'piano', pad: 'soft' },
      { id: 'tense', name: '紧张', mood: 'tense', tempo: 96, scale: 'phrygian', lead: 'lowStrings', pad: 'pulse' },
      { id: 'hope', name: '希望', mood: 'hope', tempo: 74, scale: 'major', lead: 'strings', pad: 'warm' }
    ],
    stats: [
      { key: 'resolve', label: '心念', init: 64, max: 100 },
      { key: 'bond', label: '羁绊', init: 10, max: 100 },
      { key: 'clues', label: '线索', init: 0, max: 20 },
      { key: 'danger', label: '危险', init: 12, max: 100, danger: true }
    ],
    relations: relations,
    items: itemMap,
    startItems: Object.keys(itemMap).slice(0, 2).map(function (k) { return { id: k, qty: 1 }; }),
    skills: [{ id: 'observe', name: '观察' }, { id: 'talk', name: '交谈' }],
    rules: (card.snapshot && card.snapshot.rules) || [],
    places: places.slice(0, 8).map(function (p, i) { return { name: p.name || ('地点 ' + (i + 1)), desc: [p.type, p.desc].filter(Boolean).join(' · '), unlocked: i < 4 }; }),
    freeActions: [
      { keys: ['观察', '看', '四周'], text: '你停下来观察四周，空气里有某种说不清的变化。', eff: { stats: { resolve: 2, clues: 1 } } },
      { keys: ['交谈', '聊', '找'], text: relations[0] ? ('你找到' + relations[0].name + '，他看你的眼神比昨天多停了一会儿。') : '你想找个人谈谈，但四周只有回声。', eff: relations[0] ? { rel: (function(){var o={};o[relations[0].key]=6;return o})(), stats: { bond: 2 } } : { stats: { resolve: -2 } } },
      { keys: ['探索', '走', '向前'], text: '你沿着故事留下的痕迹向前，发现一处此前没有注意到的细节。', eff: { stats: { clues: 2, danger: 2 } } },
      { keys: ['调查', '查', '线索'], text: '你把已知的线索摊开，串联出一个新的可能。', eff: { stats: { resolve: 3, clues: 1 } } },
      { keys: ['休息', '睡', '等待'], text: '你闭上眼睛，听见远处有人在叫你的名字。', eff: { stats: { resolve: 4, danger: 2 } } }
    ],
    start: 'start',
    scenes: {
      start: {
        chapter: (card.snapshot && card.snapshot.era) || '第 1 幕', place: places[0] ? (places[0].name || '起始地点') : '起始地点',
        title: card.title || '故事开始',
        text: baseText + (worldText && worldText !== baseText ? '\n\n' + worldText.slice(0, 420) : ''),
        choices: choiceList()
      },
      loop: {
        chapter: '持续推进', place: '世界之中', title: '接下来',
        text: '你的选择让世界向前走了一步。\n' + (card.snapshot && card.snapshot.desc ? card.snapshot.desc : '新的细节正在浮现。'),
        choices: choiceList()
      },
      end: { chapter: '终章', place: '故事尽头', title: '落幕', text: '这一段故事停在这里。', choices: [] }
    },
    events: [
      { id: 'e1', title: '环境变化', if: function (s) { return s.turn >= 2; }, text: '周围的环境忽然变了，像有人翻过一页。', eff: { stats: { danger: 2, resolve: -1 } } },
      { id: 'e2', title: '某人的注视', if: function (s) { return s.stats.bond >= 12; }, text: '你感觉到有人在看你。回头时，只看见一个熟悉的背影。', eff: relations[0] ? { rel: (function(){var o={};o[relations[0].key]=5;return o})() } : { stats: { bond: 2 } } },
      { id: 'e3', title: '隐藏的线索', if: function (s) { return s.turn >= 5; }, text: '你在不起眼的角落找到了一条此前被忽略的线索。', eff: { stats: { clues: 2, resolve: 1 } } }
    ],
    endings: [
      { id: 'bond_end', title: '与他的结局', if: function (s) { return s.stats.bond >= 30; }, text: '你走到了这段关系的深处。世界没有结束，故事还可以继续。' },
      { id: 'truth_end', title: '真相之后', if: function (s) { return s.stats.clues >= 8; }, text: '你把线索拼成了完整的图。真相不一定温柔，但你终于看清了它。' },
      { id: 'free_end', title: '自由落点', if: function (s) { return s.turn >= 16; }, text: '你没有走向任何预设的终点，而是把这个世界留在了自己的手里。' },
      { id: 'danger_end', title: '危险吞没', if: function (s) { return s.stats.danger >= 90 || s.stats.resolve <= 5; }, text: '危险从四面八方涌来，故事在最后一页合上。' }
    ],
    nexusLinks: [{ label: '世界卡：' + (card.title || ''), kind: '导入卡', target: 'items' }]
  };
  window.SL_PACK = pack;
})();
