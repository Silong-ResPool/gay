/* 世界：罪乐园 / 地府十八层 · 双男主 · 罪值分配 */
window.SL_PACK = {
  id: 'zly', title: '罪乐园', subtitle: '地府 · 十八层罪值乐园',
  kicker: 'SIN PARADISE · AFTERLIFE', theme: 'sin', layout: 'vertical', modeLabel: '罪值审判', mode: 'judgment',
  accent: '#c084fc', accent2: '#fbbf24', bg: '#07050c', bg2: '#120a1a', cover: '../../assets/ui/world_zly.jpg?v=3',
  turnsPerDay: 6, eventChance: 0.36, freePlaceholder: '自由行动：查看罪碑 / 逛乐园 / 乘电梯下潜 / 和祁宴交谈 / 申诉',
  useNexusRules: true,
  stats: [
    { key: 'sin', label: '罪值', init: 0, max: 180, danger: true },
    { key: 'merit', label: '功德', init: 18, max: 100 },
    { key: 'layer', label: '当前层', init: 1, max: 18 },
    { key: 'freedom', label: '自由', init: 0, max: 100 },
    { key: 'soul', label: '魂体', init: 88, max: 100, danger: true }
  ],
  relations: [
    { key: 'qi', name: '祁宴', role: '零罪乐园的常住客 · 你的引路人', init: 22, max: 100 },
    { key: 'cui', name: '崔珏', role: '地府判官 · 罪值系统的维护者', init: 8, max: 100 }
  ],
  items: {
    bracelet: { name: '乐园手环', desc: '显示罪值与可进入的层数', tags: ['地府', '身份'], icon: '环' },
    stele: { name: '罪碑拓片', desc: '记录你生前最后一刻的罪', tags: ['线索', '关键'], icon: '碑' },
    soup: { name: '孟婆汤小样', desc: '喝一口忘一件事', tags: ['药品', '危险'], icon: '汤' },
    lantern: { name: '引魂灯', desc: '照出活人看不见的路', tags: ['工具'], icon: '灯' },
    card: { name: '白无常名片', desc: '背面写着“有事找我，别找阎王”', tags: ['关系', '关键'], icon: '片' }
  },
  startItems: [{ id: 'bracelet', qty: 1 }, { id: 'stele', qty: 1 }],
  skills: [{ id: 'readsin', name: '罪碑解读' }, { id: 'walk', name: '阴路行走（未掌握）' }],
  rules: [
    { text: '第一层是零罪乐园，只有罪值 0 的魂可以进入。', code: 'S-01' },
    { text: '第二层收 1—10 罪值，第三层 11—20，依次到第十八层 161—170。', code: 'S-02' },
    { text: '乐园里可以随意幻化风景，但不可改变他人的罪碑。', code: 'S-03' },
    { text: '判官的笔只写事实，不写同情。', code: 'S-04' },
    { text: '喝孟婆汤可以忘掉一件事；忘掉的事，罪值也会跟着消失。', code: 'S-05' }
  ],
  places: [
    { name: '第一层 · 零罪乐园', desc: '无重力花园与男侍', unlocked: true },
    { name: '第二层 · 1—10 罪', desc: '重复生前的日常', unlocked: true },
    { name: '第三层 · 11—20 罪', desc: '争吵的回音', unlocked: false },
    { name: '判官殿', desc: '罪值审计', unlocked: false },
    { name: '第十八层 · 161—170 罪', desc: '无光之井', unlocked: false }
  ],
  freeActions: [
    { keys: ['罪碑', '查看', '罪值'], text: '手环亮起，罪碑上浮出你生前最后一幕：天台上，你被推下去时抓住了谁的手。', eff: { stats: { sin: 2, freedom: 2 }, flags: { sawFall: true } } },
    { keys: ['乐园', '逛', '幻化'], text: '你在零罪乐园里把天空改成极光，祁宴躺在云上，朝你伸手。', eff: { rel: { qi: 8 }, stats: { merit: 2, freedom: 3 } } },
    { keys: ['电梯', '下潜', '层'], text: '电梯只有向下的按钮。每下一层，空气里就多一种你熟悉的味道。', eff: { stats: { layer: 1, soul: -3 }, rel: { qi: 2 } } },
    { keys: ['祁宴', '交谈', '引路人'], text: '祁宴把手环摘下来给你看，他的罪值是 0，却从不进乐园最深处。', eff: { rel: { qi: 8 }, stats: { freedom: 2 } } },
    { keys: ['判官', '申诉', '崔珏'], text: '你敲开判官殿的门。崔珏没抬头，笔尖在罪碑上停了一滴墨。', eff: { rel: { cui: 6 }, stats: { sin: -2, freedom: 2 } } },
    { keys: ['孟婆汤', '喝', '忘'], text: '你抿了一口孟婆汤，舌尖先甜后苦，脑海里少了一段走廊。', eff: { stats: { sin: -4, soul: -5 }, flags: { forgot: true } } }
  ],
  start: 'gate',
  scenes: {
    gate: {
      chapter: '序章 · 黄泉入口', place: '第一层 · 零罪乐园', title: '你死在第 13 级台阶',
      text: '你记得自己是从学校天台被推下去的。醒来时，脚下没有血，只有一片软得像云的地。\n面前是一座没有门牌的乐园：极光、温泉、男侍、永远不会天黑的花园。\n一个穿白衬衫的男人坐在喷泉边，朝你晃了晃手环：“新来的？罪值 0，恭喜，第一层。”\n他叫祁宴，在这里住了很久。',
      choices: [
        { label: '问他，我为什么会死', hint: '祁宴 +10，线索 +1', eff: { rel: { qi: 10 }, stats: { freedom: 3 }, flags: { askDeath: true } }, next: 'layer1' },
        { label: '先逛乐园，既来之则安之', hint: '功德 +6，祁宴 +8', eff: { rel: { qi: 8 }, stats: { merit: 6, freedom: 4 } }, next: 'layer1' },
        { label: '要求见判官，查自己的罪碑', hint: '崔珏 +6，罪值 +2', eff: { rel: { cui: 6 }, stats: { sin: 2 }, flags: { demandJudge: true } }, next: 'court' }
      ]
    },
    layer1: {
      chapter: '第一层 · 零罪乐园', place: '第一层 · 零罪乐园', title: '这里什么都有，除了真相',
      text: '祁宴带你穿过乐园：有人在海边办婚礼，有人在雪山上吃火锅，有人变成二十岁的模样在球场奔跑。\n“零罪的人可以一直住在这里。”他说，“也可以选择投胎。”\n你看见乐园中央立着一块黑碑，上面没有名字。\n祁宴停在碑前，第一次没有笑。',
      choices: [
        { label: '把手贴在黑碑上，读里面的记忆', hint: '线索 +2，罪值 +4', eff: { stats: { sin: 4, freedom: 2 }, flags: { blackStele: true } }, next: 'layer2' },
        { label: '问祁宴，他为什么不去投胎', hint: '祁宴 +15，真相', eff: { rel: { qi: 15 }, stats: { freedom: 3 }, flags: { qiStory: true } }, next: 'layer2' },
        { label: '去乐园深处找白无常', hint: '获得名片，线索 +1', eff: { addItems: [{ id: 'card', qty: 1 }], stats: { freedom: 4 } }, next: 'layer2' }
      ]
    },
    layer2: {
      chapter: '第二层 · 1—10 罪', place: '第二层 · 1—10 罪', title: '重复生前的走廊',
      text: '电梯停在第二层。门打开，是你高中教学楼的三楼走廊。\n那些推过你、笑过你、拍过你视频的人，正一遍一遍重复当天的动作。\n他们的罪值在 1 到 10 之间，每个人头顶都有一条细细的红线。\n祁宴跟在你身后，声音很轻：“你也可以选择报复。他们现在没有还手之力。”',
      choices: [
        { label: '走过去，把当年被撕碎的作业本捡起来', hint: '功德 +10，罪值 -3', eff: { stats: { merit: 10, sin: -3 }, flags: { noRevenge: true } }, next: 'court' },
        { label: '让带头的人重演一次被推下天台', hint: '罪值 +10，魂体 +5', eff: { stats: { sin: 10, soul: 5 }, rel: { qi: -4 }, flags: { revenge: true } }, next: 'court' },
        { label: '问祁宴，他的罪值为什么是 0', hint: '祁宴 +12，线索 +1', eff: { rel: { qi: 12 }, stats: { freedom: 3 }, flags: { qiZero: true } }, next: 'court' }
      ]
    },
    court: {
      chapter: '判官殿 · 审计', place: '判官殿', title: '判官的笔不写同情',
      text: '判官殿没有桌椅，只有一面巨大的罪碑墙。\n崔珏站在墙前，用一支黑笔在每块碑上添字。他看见你，笔尖没停：“你阳寿未尽，死因是他人推搡。按律，凶手入层，你入乐园。”\n“可你的乐园，是用我们的罪建的。”你说。\n崔珏终于抬头。',
      choices: [
        { label: '要求重审所有校园霸凌的罪碑', hint: '功德 +15，崔珏 +10', eff: { stats: { merit: 15 }, rel: { cui: 10 }, flags: { retrial: true } }, next: 'layer18' },
        { label: '和崔珏做交易，换祁宴自由', hint: '祁宴 +20，罪值 +8', eff: { rel: { qi: 20 }, stats: { sin: 8 }, flags: { tradeQi: true } }, next: 'layer18' },
        { label: '偷偷拓下罪碑墙的底层名单', hint: '线索 +2，罪值 +5', eff: { stats: { sin: 5 }, addItems: [{ id: 'stele', qty: 1 }], flags: { stoleList: true } }, next: 'layer18' }
      ]
    },
    layer18: {
      chapter: '第十八层 · 161—170 罪', place: '第十八层 · 161—170 罪', title: '无光之井',
      text: '电梯一路向下，数字跳过十七层，停在 18。\n门打开，没有光，只有一口井。井底传来无数人的呼吸声，像一整座城市在睡。\n祁宴第一次露出恐惧：“我死前，把一个人推下了这口井。”\n你终于明白，他的罪值是 0——因为他的罪，被这口井吃掉了。',
      choices: [
        { label: '握住祁宴的手，一起面对井底', hint: '祁宴 +25，真相', eff: { rel: { qi: 25 }, stats: { freedom: 5 }, flags: { qiTruth: true } }, next: 'rebel' },
        { label: '把罪碑拓片扔进井里，唤醒所有罪魂', hint: '功德 +20，罪值 +10', eff: { stats: { merit: 20, sin: 10, freedom: 8 }, flags: { awaken: true } }, next: 'rebel' },
        { label: '转身回电梯，就当没看见', hint: '罪值 -2，祁宴 -10', eff: { rel: { qi: -10 }, stats: { freedom: -2 }, flags: { ignore: true } }, next: 'rebel' }
      ]
    },
    rebel: {
      chapter: '终章前夜 · 乐园底层', place: '第一层 · 零罪乐园', title: '把乐园翻过来',
      text: '你带着祁宴回到第一层。乐园还是那么美，极光、温泉、永不天黑。\n可你看见每一座花园下面都压着一层罪碑，每一口温泉都连着第十八层的井。\n白无常站在喷泉边，递给你一支判官的笔：“改吧。改完，乐园就会塌。”\n祁宴站在你身后，没有拦你。',
      choices: [
        { label: '改写自己的罪碑，留在乐园', hint: '乐园线', eff: { stats: { freedom: 10, merit: 5 }, flags: { stayParadise: true } }, next: 'finale' },
        { label: '把罪碑墙全部推倒，让地府重排', hint: '革命线', eff: { stats: { merit: 25, sin: 5 }, flags: { overturn: true } }, next: 'finale' },
        { label: '把笔交给祁宴，让他改自己的罪', hint: '祁宴线', eff: { rel: { qi: 25 }, flags: { qiRewrite: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 乐园落日', place: '第一层 · 零罪乐园', title: '第一层第一次天黑',
      text: '你落笔的瞬间，乐园第一次有了黄昏。\n极光熄灭，温泉冷却，男侍们停在原地，像一群终于想起自己是谁的人。\n崔珏站在判官殿屋顶，没有阻止。\n祁宴问你：“你要投胎，还是留下来？”',
      choices: [
        { label: '和祁宴一起投胎，去同一个城市', hint: '转世线', eff: { rel: { qi: 20 }, flags: { reincarnate: true } }, next: 'end' },
        { label: '留下来，做新的判官', hint: '判官线', eff: { stats: { merit: 20, freedom: 10 }, flags: { newJudge: true } }, next: 'end' },
        { label: '留在乐园，把这里改成真正的零罪之地', hint: '乐园线', eff: { rel: { qi: 15 }, stats: { freedom: 15 }, flags: { rebuild: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '地府', title: '乐园之后', text: '天黑了。', choices: [] }
  },
  events: [
    { id: 'memory', title: '你想起推你的人', if: function (s) { return s.day >= 1; }, text: '手环自动播放一段记忆：天台上，推你的那只手，戴着和你一样的校徽。', eff: { stats: { sin: 2, soul: -3 }, flags: { memory: true } } },
    { id: 'qi_gift', title: '祁宴给你留了位置', if: function (s) { return s.rel.qi >= 30; }, text: '祁宴在乐园最好的位置留了一把躺椅，旁边刻着你的名字。', eff: { rel: { qi: 6 }, stats: { freedom: 2 } } },
    { id: 'cui_note', title: '判官给你一张纸条', if: function (s) { return s.rel.cui >= 20; }, text: '纸条上写着：第 18 层的井，不是地狱，是回收站。', eff: { stats: { sin: 3, freedom: 3 }, flags: { cuiNote: true } } },
    { id: 'soup', title: '孟婆汤洒了一地', if: function (s) { return s.flags.forgot; }, text: '汤洒在地上，长出一片白色的花。花心里全是你忘掉的走廊。', eff: { stats: { soul: -4, sin: 2 } } },
    { id: 'bully', title: '第二层的回音', if: function (s) { return s.stats.layer >= 2; }, text: '你听见当年的笑声从每一条走廊里传出来，像一群不肯散的影子。', eff: { stats: { soul: -5, sin: 3 } } },
    { id: 'white', title: '白无常来收名片', if: function (s) { return s.items.some(function (x) { return x.id === 'card'; }); }, text: '白无常从喷泉里冒出来，收回名片，换成一张黑卡：“以后找我，别找阎王。”', eff: { stats: { freedom: 4, merit: 3 } } }
  ],
  endings: [
    { id: 'reincarnate', title: '同一个城市', if: function (s) { return s.flags.reincarnate; }, text: '你和祁宴一起走进轮回门。\n很多年后，你在新学校的天台抽烟，一个穿白衬衫的男生走过来，借了个火。\n他说他叫祁宴。你说你好像在哪见过他。' },
    { id: 'judge', title: '新判官', if: function (s) { return s.flags.newJudge; }, text: '你接过崔珏的笔，把第一条规则改成：零罪不是特权，是所有人都有机会抵达的地方。\n祁宴站在判官殿门口，等你下班。\n地府的黄昏第一次有了晚风。' },
    { id: 'rebuild', title: '真正的乐园', if: function (s) { return s.flags.rebuild; }, text: '你把第一层改造成所有魂都能来的地方：没有罪值门槛，没有男侍，只有一片可以自己幻化的天空。\n祁宴躺在云上，把极光调成你喜欢的颜色。\n崔珏偶尔来检查，每次都只写一个字：好。' },
    { id: 'stay', title: '乐园的第十三个住客', if: function (s) { return s.flags.stayParadise; }, text: '你改写了自己的罪碑，留在乐园。\n极光永远不灭，温泉永远温热，祁宴永远在喷泉边等你。\n只是每个新来的魂都会发现，乐园最深处有一块黑碑，上面写着你的名字。' }
  ],
  nexusLinks: [
    { label: '规则：十八层罪值分配', kind: '规则系', target: 'rules' },
    { label: '物品：乐园手环 / 引魂灯', kind: '物品', target: 'items' },
    { label: '人物：祁宴 / 崔珏', kind: '人物档案', target: 'species' }
  ]
};
