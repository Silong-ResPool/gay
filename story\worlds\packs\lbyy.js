/* 世界：龙堡银月 / 异世界魔法 · 双男主 · 药品调配 */
window.SL_PACK = {
  id: 'lbyy', title: '龙堡银月', subtitle: '异世界 · 魔法与恶龙',
  kicker: 'SILVERMOON · FANTASY', theme: 'magic', layout: 'dashboard', modeLabel: '魔法冒险', mode: 'magic',
  accent: '#a78bfa', accent2: '#5eead4', bg: '#080514', bg2: '#120b22', cover: 'https://aka.doubaocdn.com/s/nLEKS1XOLc',
  turnsPerDay: 6, eventChance: 0.4, freePlaceholder: '自由行动：冥想 / 阅读魔法书 / 调配药剂 / 去龙塔 / 和奥雷交谈',
  bgm: [
    { id: 'daily', name: '银月城堡', mood: 'daily', tempo: 64, scale: 'major', lead: 'harp', pad: 'soft' },
    { id: 'tense', name: '龙翼掠过', mood: 'tense', tempo: 96, scale: 'minor', lead: 'lowStrings', pad: 'storm' },
    { id: 'hope', name: '月下誓言', mood: 'hope', tempo: 70, scale: 'major', lead: 'strings', pad: 'warm' },
    { id: 'horror', name: '龙息', mood: 'horror', tempo: 76, scale: 'phrygian', lead: 'lowStrings', pad: 'storm' }
  ],
  stats: [
    { key: 'mana', label: '魔力', init: 40, max: 120 },
    { key: 'talent', label: '天赋', init: 2, max: 10 },
    { key: 'potion', label: '药剂', init: 2, max: 10 },
    { key: 'dragon', label: '龙之好感', init: 0, max: 100, danger: true },
    { key: 'hp', label: '生命', init: 86, max: 100, danger: true }
  ],
  relations: [
    { key: 'aure', name: '奥雷', role: '银月骑士 · 龙裔', init: 20, max: 100 },
    { key: 'luci', name: '卢西安', role: '宫廷法师 · 药剂师', init: 16, max: 100 }
  ],
  items: {
    book: { name: '《银月元素论》', desc: '书页会自己翻到你需要的那一章', tags: ['魔法书', '学习'], icon: '书' },
    vial: { name: '空药剂瓶', desc: '瓶底有银月纹', tags: ['制作', '药品'], icon: '瓶' },
    herb: { name: '月光草', desc: '只在双月同天时发光', tags: ['食材', '药材'], icon: '草' },
    scale: { name: '银龙鳞', desc: '摸上去像一块温热的铁', tags: ['龙', '关键'], icon: '鳞' },
    wand: { name: '卢西安的旧魔杖', desc: '杖尖裂了，但还能用', tags: ['法器'], icon: '杖' }
  },
  startItems: [{ id: 'book', qty: 1 }, { id: 'vial', qty: 2 }, { id: 'herb', qty: 2 }],
  skills: [{ id: 'potion', name: '月光药剂调配' }, { id: 'rune', name: '银月符文（入门）' }],
  rules: [
    { text: '药剂三沸三停，少一沸则无效，多一沸则有毒。', code: 'M-01' },
    { text: '龙塔的钟声响起时，不要直视银月。', code: 'M-02' },
    { text: '龙裔的血能治伤，也能让喝下的人忘记自己是谁。', code: 'M-03' },
    { text: '宫廷法师的袍子越白，欠龙的债越多。', code: 'M-04' },
    { text: '银月双悬之夜，恶龙会满足一个愿望，代价由许愿者承担。', code: 'M-05' }
  ],
  places: [
    { name: '银月城堡', desc: '你的临时住处', unlocked: true },
    { name: '魔法图书馆', desc: '会咬人的书', unlocked: true },
    { name: '药剂工坊', desc: '卢西安的地盘', unlocked: true },
    { name: '龙塔', desc: '恶龙被封印的地方', unlocked: false },
    { name: '黑森林', desc: '月光草与龙的旧巢', unlocked: false }
  ],
  freeActions: [
    { keys: ['冥想', '魔力'], text: '你坐在银月纹阵里冥想，魔力像潮水一样涨落。', eff: { stats: { mana: 10, talent: 1 } } },
    { keys: ['读书', '魔法书', '学习'], text: '你翻开《银月元素论》，书页自己停在一段关于龙焰的批注。', eff: { stats: { talent: 1, mana: -2 }, rel: { luci: 4 } } },
    { keys: ['调配', '药剂', '药'], text: '月光草三沸三停，药剂在瓶里变成一层银色的雾。', eff: { stats: { potion: 1, mana: -4, talent: 1 } } },
    { keys: ['龙塔', '龙'], text: '你走到龙塔下，听见铁链后面有呼吸声，像一整座山在睡。', eff: { stats: { dragon: 4, hp: -3 } } },
    { keys: ['奥雷', '骑士', '交谈'], text: '奥雷用龙鳞磨剑，火星落在你脚边。他问你：“你怕龙，还是怕我？”', eff: { rel: { aure: 8 }, stats: { dragon: 2 } } },
    { keys: ['卢西安', '法师'], text: '卢西安把一支旧魔杖推给你：“别告诉别人，我当年也想过屠龙。”', eff: { rel: { luci: 8 }, addItems: [{ id: 'wand', qty: 1 }] } },
    { keys: ['黑森林', '月光草'], text: '你在黑森林边缘采到一株月光草，草叶里有一只闭着的龙眼。', eff: { stats: { mana: 4, dragon: 3 }, addItems: [{ id: 'herb', qty: 2 }] } }
  ],
  start: 'castle',
  scenes: {
    castle: {
      chapter: '第一夜 · 城堡', place: '银月城堡', title: '恶龙每年娶一个王子',
      text: '你被一阵钟声吵醒。银月城堡的钟楼敲了十三下，窗外双月同悬。\n管家告诉你，城堡的主人是一条银龙，每年银月之夜都要从邻近王国选一位王子送上龙塔。\n今年，被选中的是奥雷——银月骑士，也是把你从边境捡回来的人。\n他站在大厅尽头，铠甲没卸，手里却拿着一束婚礼用的白花。',
      choices: [
        { label: '走过去，问奥雷需不需要帮忙', hint: '奥雷 +12，进入龙塔线', eff: { rel: { aure: 12 }, stats: { dragon: 3 }, flags: { helpAure: true } }, next: 'library' },
        { label: '先去找宫廷法师卢西安打听', hint: '卢西安 +10，魔法书线索', eff: { rel: { luci: 10 }, stats: { talent: 1, mana: 4 }, flags: { askLuci: true } }, next: 'library' },
        { label: '趁乱逃离城堡', hint: '理智 +4，龙之好感 -2', eff: { stats: { hp: 4, dragon: -2 }, flags: { triedLeave: true } }, next: 'forest' }
      ]
    },
    library: {
      chapter: '第二夜 · 图书馆', place: '魔法图书馆', title: '书页里夹着一片龙鳞',
      text: '图书馆的书会自己换位置。你抽出《银月元素论》，书脊里掉出一片银龙鳞。\n鳞片上刻着一行小字：\n“龙不是要娶王子。它在找一个人，替它把名字从塔底念出来。”\n卢西安站在书架后，白袍下摆沾着药渍：“你捡到了不该捡的东西。”',
      choices: [
        { label: '把龙鳞交给卢西安，问清楚', hint: '卢西安 +12，线索 +1', eff: { rel: { luci: 12 }, stats: { talent: 1 }, flags: { luciTruth: true } }, next: 'lab' },
        { label: '藏起龙鳞，自己去龙塔', hint: '龙之好感 +8，危险', eff: { stats: { dragon: 8, hp: -4 }, addItems: [{ id: 'scale', qty: 1 }], flags: { hideScale: true } }, next: 'tower' },
        { label: '用龙鳞做一瓶“龙语药剂”', hint: '药剂 +2，天赋 +1', eff: { stats: { potion: 2, talent: 1, mana: -6 }, flags: { dragonPotion: true } }, next: 'lab' }
      ]
    },
    lab: {
      chapter: '第三夜 · 药剂工坊', place: '药剂工坊', title: '三沸三停',
      text: '卢西安的工坊像一间被倒空的教堂，天花板上吊满药瓶。\n他让你把手伸进第一口坩埚：“月光草一沸会变蓝，二沸会变白，三沸会唱歌。”\n坩埚里的液体真的唱了起来，声音像奥雷在很远的地方喊你。\n卢西安低声说：“别分心。药剂会记住熬药人的心事。”',
      choices: [
        { label: '熬一壶“龙焰抗性”药剂', hint: '药剂 +2，奥雷 +8', eff: { stats: { potion: 2, mana: -8 }, rel: { aure: 8 }, flags: { fireResist: true } }, next: 'tower' },
        { label: '熬一壶“真名显露”药剂', hint: '天赋 +1，线索 +1', eff: { stats: { talent: 1, mana: -6 }, flags: { trueName: true } }, next: 'tower' },
        { label: '故意熬错，看看会怎样', hint: '药剂 -1，卢西安 -5，变异', eff: { stats: { potion: -1, dragon: 8 }, rel: { luci: -5 }, flags: { failedPotion: true } }, next: 'tower' }
      ]
    },
    tower: {
      chapter: '第四夜 · 龙塔', place: '龙塔', title: '铁链后面是一双眼睛',
      text: '龙塔内部比城堡还高。铁链从穹顶垂下来，末端锁着一条银龙。\n它比传说中小得多，只比一匹马大一点，鳞片缺了三块，眼睛却是人的眼睛。\n奥雷站在塔门边，白花还拿在手里：“它不是恶龙。它是上一任宫廷法师。”\n银龙开口，声音像卢西安：“你们谁来替我念名字？”',
      choices: [
        { label: '念出龙鳞上的名字', hint: '龙之好感 +20，真相', eff: { stats: { dragon: 20 }, flags: { readName: true } }, next: 'forest' },
        { label: '让奥雷先退后，自己靠近铁链', hint: '奥雷 +15，危险', eff: { rel: { aure: 15 }, stats: { hp: -10, dragon: 6 }, flags: { nearDragon: true } }, next: 'forest' },
        { label: '用“真名显露”药剂泼向银龙', hint: '天赋 +2，龙之好感 +10', eff: { stats: { talent: 2, dragon: 10, potion: -1 }, flags: { potionName: true } }, next: 'forest' }
      ]
    },
    forest: {
      chapter: '第五夜 · 黑森林', place: '黑森林', title: '龙巢里的摇篮',
      text: '黑森林深处有一座用龙骨搭成的巢，巢里铺着王子的披风。\n你终于看清：银龙不是在娶王子，它在把被王宫丢弃的王子藏起来。\n奥雷就是最后一个。他小时候被送到龙塔，是银龙把他养大。\n卢西安站在树下，白袍被月光照得发蓝：“现在你知道了。要救他，还是救城堡？”',
      choices: [
        { label: '帮奥雷和银龙一起离开', hint: '奥雷 +20，龙 +15', eff: { rel: { aure: 20 }, stats: { dragon: 15 }, flags: { freeDragon: true } }, next: 'throne' },
        { label: '帮卢西安把银龙重新封印', hint: '卢西安 +20，龙 -20', eff: { rel: { luci: 20 }, stats: { dragon: -20, talent: 2 }, flags: { sealDragon: true } }, next: 'throne' },
        { label: '用龙鳞和药剂与银龙谈条件', hint: '龙 +10，药剂 +1', eff: { stats: { dragon: 10, potion: 1 }, flags: { bargain: true } }, next: 'throne' }
      ]
    },
    throne: {
      chapter: '第六夜 · 王座', place: '银月城堡', title: '王座上的空位',
      text: '城堡大厅里，王座空着。银月照在扶手上，像一层薄霜。\n卢西安摘下白袍，里面是宫廷法师的旧制服；奥雷把白花放在王座上。\n银龙在窗外盘旋，影子把整座大厅切成两半。\n“银月双悬还有一刻钟。”卢西安说，“许愿吧。”',
      choices: [
        { label: '许愿：让奥雷和银龙都自由', hint: '奥雷 +25，龙 +20', eff: { rel: { aure: 25 }, stats: { dragon: 20 }, flags: { wishFreedom: true } }, next: 'finale' },
        { label: '许愿：让城堡不再需要献祭', hint: '卢西安 +20，龙 +10', eff: { rel: { luci: 20 }, stats: { dragon: 10 }, flags: { wishPeace: true } }, next: 'finale' },
        { label: '不许愿，把王座让给奥雷', hint: '奥雷 +15，政治线', eff: { rel: { aure: 15 }, flags: { giveThrone: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 银月落下', place: '银月城堡', title: '最后一瓶药剂',
      text: '双月开始重叠。银龙的鳞片一片片亮起来，整座城堡像被放进一盏灯里。\n奥雷握住你的手，掌心里全是龙鳞磨出的血。\n卢西安把最后一瓶药剂递给你：“喝下去，你能听懂龙语。也可能再也听不懂人话。”\n钟楼敲响第十四下。',
      choices: [
        { label: '喝下药剂，替银龙念出真名', hint: '魔法线，龙 +25', eff: { stats: { dragon: 25, talent: 3 }, flags: { trueNameEnd: true } }, next: 'end' },
        { label: '把药剂给奥雷，让他自己选', hint: '奥雷 +20', eff: { rel: { aure: 20 }, flags: { aureChoice: true } }, next: 'end' },
        { label: '打碎药剂，三个人一起冲进龙塔', hint: '三人线', eff: { rel: { aure: 15, luci: 15 }, stats: { hp: -8 }, flags: { together: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '银月城堡', title: '银月之后', text: '双月分开，天亮了。', choices: [] }
  },
  events: [
    { id: 'bell13', title: '钟楼敲了十三下', if: function (s) { return s.day >= 1; }, text: '城堡的钟无风自响。管家说，那是龙在数还有几个夜晚。', eff: { stats: { dragon: 3, hp: -2 } } },
    { id: 'book_bite', title: '书咬了你一口', if: function (s) { return s.stats.talent >= 3; }, text: '一本没有封面的书从架上跳下来，咬住你的袖口，书页里全是龙语。', eff: { stats: { mana: 4, hp: -3, talent: 1 } } },
    { id: 'luci_cough', title: '卢西安咳出银色血', if: function (s) { return s.rel.luci >= 30; }, text: '卢西安用手帕捂住嘴，帕子上是银色的。他笑着说只是药剂副作用。', eff: { rel: { luci: 6 }, stats: { potion: 1 } } },
    { id: 'aure_flower', title: '奥雷在擦白花', if: function (s) { return s.rel.aure >= 35; }, text: '奥雷坐在龙塔台阶上，把白花一片一片擦干净，像在擦一把剑。', eff: { rel: { aure: 8 }, stats: { dragon: 2 } } },
    { id: 'dragon_dream', title: '你梦见自己长出鳞片', if: function (s) { return s.stats.dragon >= 40; }, text: '梦里你站在龙塔顶，双月从你眼睛里升起。醒来时，手背多了一片银鳞。', eff: { stats: { dragon: 6, hp: -4 } } },
    { id: 'potion_voice', title: '药剂在瓶里唱歌', if: function (s) { return s.stats.potion >= 3; }, text: '所有药瓶同时唱起同一支歌，歌词是你小时候的名字。', eff: { stats: { talent: 1, mana: 5 } } }
  ],
  endings: [
    { id: 'truename', title: '把名字还给你', if: function (s) { return s.flags.trueNameEnd; }, text: '你念出银龙的真名。铁链一节节断开，龙鳞落成一地月光。\n银龙变回一个年轻男人，卢西安跪下去叫他老师。\n奥雷站在你身后，把白花别在你衣领上：“现在，城堡没有恶龙了。”' },
    { id: 'together', title: '三个人的龙塔', if: function (s) { return s.flags.together; }, text: '你们冲进龙塔时，双月正好重叠。\n奥雷用剑劈开铁链，卢西安把药剂倒进锁孔，你负责念名字。\n银龙载着三个人飞出城堡，王座在身后碎成一地玻璃。' },
    { id: 'seal', title: '新的宫廷法师', if: function (s) { return s.flags.sealDragon; }, text: '卢西安重新封印银龙，白袍落回肩上。\n他让你接任宫廷法师，自己走进龙塔，替龙守住名字。\n每个银月夜，你都能听见塔里有人教你新的药剂配方。' },
    { id: 'burn', title: '龙焰焚城', if: function (s) { return s.stats.dragon >= 90 && !s.flags.trueNameEnd; }, text: '银龙挣断最后一条铁链。龙焰从塔顶灌下来，把整座城堡烧成一只发光的杯子。\n你在火里听见奥雷喊你，声音和钟声混在一起。' }
  ],
  nexusLinks: [
    { label: '学习：魔法书与药剂学', kind: '学习', target: 'learn' },
    { label: '食材：月光草与龙血毒性', kind: '食材', target: 'food' },
    { label: '物种：银龙 / 龙裔档案', kind: '物种档案', target: 'species' }
  ]
};
