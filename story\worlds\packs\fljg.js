/* 世界：法老金棺 / 埃及探险 · 双男主 */
window.SL_PACK = {
  id: 'fljg', title: '法老金棺', subtitle: '埃及探险 · 诅咒与机关',
  kicker: 'TOMB OF GOLD · EXPEDITION', theme: 'dungeon', layout: 'cinema', modeLabel: '解谜探险', mode: 'adventure',
  accent: '#fbbf24', accent2: '#38bdf8', bg: '#0d0903', bg2: '#1a1207', cover: 'https://aka.doubaocdn.com/s/4xfz6DQ7w9',
  turnsPerDay: 6, eventChance: 0.4, freePlaceholder: '自由行动：点火 / 探路 / 破译 / 搜刮 / 和纳赛尔交谈',
  bgm: [
    { id: 'daily', name: '沙海低吟', mood: 'daily', tempo: 56, scale: 'minor', lead: 'oud', pad: 'wind' },
    { id: 'tense', name: '墓道机关', mood: 'tense', tempo: 86, scale: 'phrygian', lead: 'lowStrings', pad: 'dark' },
    { id: 'hope', name: '金棺之外', mood: 'hope', tempo: 68, scale: 'major', lead: 'harp', pad: 'warm' },
    { id: 'horror', name: '干尸复活', mood: 'horror', tempo: 72, scale: 'phrygian', lead: 'bell', pad: 'dark' }
  ],
  stats: [
    { key: 'torch', label: '火把', init: 6, max: 10, danger: true },
    { key: 'treasure', label: '宝藏', init: 0, max: 12 },
    { key: 'curse', label: '诅咒', init: 12, max: 100, danger: true },
    { key: 'clue', label: '线索', init: 0, max: 10 },
    { key: 'hp', label: '生命', init: 88, max: 100, danger: true }
  ],
  relations: [
    { key: 'nas', name: '纳赛尔', role: '埃及考古学家 · 你的向导', init: 18, max: 100 },
    { key: 'chen', name: '陈野', role: '雇佣兵 · 只为黄金而来', init: 8, max: 100 }
  ],
  items: {
    torch: { name: '铜制火把', desc: '烧的是没药与旧布', tags: ['工具', '照明'], icon: '火' },
    map: { name: '墓室草图', desc: '纳赛尔画的，缺了三处', tags: ['线索'], icon: '图' },
    scarab: { name: '圣甲虫护符', desc: '背面刻着倒过来的名字', tags: ['护身', '诅咒'], icon: '虫' },
    gold: { name: '黄金面具碎片', desc: '沉得像一块小型墓碑', tags: ['宝藏', '危险'], icon: '金' },
    water: { name: '水囊', desc: '沙漠里比黄金值钱', tags: ['水源'], icon: '水' }
  },
  startItems: [{ id: 'torch', qty: 1 }, { id: 'map', qty: 1 }, { id: 'water', qty: 1 }],
  skills: [{ id: 'read', name: '古埃及圣书体初读' }, { id: 'trap', name: '机关听风' }],
  rules: [
    { text: '火把熄灭时不要移动；黑暗里的东西靠声音找路。', code: 'E-01' },
    { text: '每拿走一件陪葬品，就在原地放一枚铜币。', code: 'E-02' },
    { text: '金棺打开后，不要直视法老的脸。', code: 'E-03' },
    { text: '圣甲虫往谁身上爬，谁就不能碰第二件金器。', code: 'E-04' },
    { text: '日出前必须离开墓道，沙暴会封死入口。', code: 'E-05' }
  ],
  places: [
    { name: '墓道入口', desc: '被沙半掩的石门', unlocked: true },
    { name: '陪葬厅', desc: '黄金与陶罐', unlocked: true },
    { name: '机关廊', desc: '压力板与箭孔', unlocked: true },
    { name: '金棺室', desc: '法老长眠之地', unlocked: false },
    { name: '逃生竖井', desc: '纳赛尔标记的最后出口', unlocked: false }
  ],
  freeActions: [
    { keys: ['点火', '火把'], text: '你给火把换了一团浸油的布，火苗稳住了。', eff: { stats: { torch: 2, hp: -1 } } },
    { keys: ['探路', '搜索', '找'], text: '你贴着墙走，在砖缝里摸到一枚刻着荷鲁斯之眼的铜片。', eff: { stats: { clue: 1, torch: -1 } } },
    { keys: ['破译', '读'], text: '纳赛尔教你辨认圣书体，一段咒文慢慢拼了出来。', eff: { rel: { nas: 6 }, stats: { clue: 1, curse: 3 } } },
    { keys: ['搜刮', '宝藏', '金'], text: '你从陶罐里倒出一把金箔，陈野的眼睛亮了。', eff: { stats: { treasure: 1, curse: 4 }, rel: { chen: 4 } } },
    { keys: ['休息', '水'], text: '你靠墙坐下喝了一口水，沙粒在牙缝里响。', eff: { stats: { hp: 4, torch: -1 } } },
    { keys: ['纳赛尔', '交谈'], text: '纳赛尔把草图摊在膝上，指尖停在一处没画的空白：“这里，我父亲死在里面。”', eff: { rel: { nas: 8 }, stats: { clue: 1 } } },
    { keys: ['陈野', '雇佣兵'], text: '陈野把刀横在膝上：“黄金分我一半，我保你活着出去。”', eff: { rel: { chen: 8 }, stats: { curse: 2 } } }
  ],
  start: 'entry',
  scenes: {
    entry: {
      chapter: '第一日 · 入口', place: '墓道入口', title: '沙下有一张脸',
      text: '帝王谷以西，沙暴掀开了一座没有被记载的墓。\n石门上刻着法老的脸，眼睛却被凿掉了。纳赛尔说，这是“被抹名的法老”，谁打开谁就得替他把名字找回来。\n陈野用撬棍顶住门缝，回头看你：“进不进？我只认黄金。”\n火把的光在门缝里照出一条向下的路。',
      choices: [
        { label: '跟纳赛尔先读门上的咒文', hint: '线索 +1，诅咒 +3', eff: { rel: { nas: 8 }, stats: { clue: 1, curse: 3 }, flags: { readDoor: true } }, next: 'hall' },
        { label: '让陈野直接撬门', hint: '火把 -1，诅咒 +8，快速进入', eff: { rel: { chen: 8 }, stats: { torch: -1, curse: 8 }, flags: { brokeDoor: true } }, next: 'hall' },
        { label: '先在门口埋一枚铜币', hint: '诅咒 -3，理智 +2', eff: { stats: { curse: -3, clue: 1 }, flags: { coin: true } }, next: 'hall' }
      ]
    },
    hall: {
      chapter: '第二日 · 陪葬厅', place: '陪葬厅', title: '黄金在呼吸',
      text: '陪葬厅里堆满陶罐、金箔和成排的猫木乃伊。\n火把照到墙上的一瞬间，所有猫的眼睛同时反光。\n纳赛尔低声说：“别碰金器。先找出口。”\n陈野已经蹲在一只金碗前，手指伸了过去。',
      choices: [
        { label: '按住陈野的手，先找机关', hint: '陈野关系 -4，诅咒 -2，线索 +1', eff: { rel: { chen: -4 }, stats: { curse: -2, clue: 1 }, flags: { stoppedChen: true } }, next: 'trap' },
        { label: '让陈野拿，自己负责放铜币', hint: '宝藏 +2，诅咒 +6', eff: { rel: { chen: 8 }, stats: { treasure: 2, curse: 6 } }, next: 'trap' },
        { label: '和纳赛尔找墙上的圣书体', hint: '线索 +2，纳赛尔关系 +10', eff: { rel: { nas: 10 }, stats: { clue: 2, torch: -1 } }, next: 'trap' }
      ]
    },
    trap: {
      chapter: '第三日 · 机关廊', place: '机关廊', title: '脚下的砖会数数',
      text: '机关廊的地砖每一块都刻着数字，从 1 到 13。\n纳赛尔说，只能踩质数，否则墙上的箭孔会醒。\n陈野不信，一脚踩上 9。\n墙里传来齿轮咬合的声音。',
      choices: [
        { label: '扑倒陈野，滚过机关区', hint: '生命 -10，陈野关系 +15', eff: { stats: { hp: -10, torch: -1 }, rel: { chen: 15 }, flags: { savedChen: true } }, next: 'coffin' },
        { label: '用火把烧断弩弦', hint: '火把 -2，机关解除，线索 +1', eff: { stats: { torch: -2, clue: 1 }, flags: { disarm: true } }, next: 'coffin' },
        { label: '让纳赛尔带路，按质数走', hint: '纳赛尔关系 +12，安全通过', eff: { rel: { nas: 12 }, stats: { clue: 1 }, flags: { primePath: true } }, next: 'coffin' }
      ]
    },
    coffin: {
      chapter: '第四日 · 金棺室', place: '金棺室', title: '法老在棺材里翻身',
      text: '金棺室里没有空气流动，火把却自己往一个方向偏。\n金棺上刻着 13 道锁，每一道都需要一个名字。\n纳赛尔翻开草图，声音很轻：“被抹名的法老，真名不在任何史书里。”\n棺材里传来指甲刮金箔的声音。一下，两下，三下。',
      choices: [
        { label: '按草图上的残缺名字试开锁', hint: '线索 +2，诅咒 +10', eff: { stats: { clue: 2, curse: 10 }, flags: { tryName: true } }, next: 'mummy' },
        { label: '让陈野用蛮力撬开金棺', hint: '宝藏 +3，诅咒 +15，惊醒干尸', eff: { rel: { chen: 6 }, stats: { treasure: 3, curse: 15 }, flags: { forceOpen: true } }, next: 'mummy' },
        { label: '把圣甲虫护符放在棺盖上', hint: '诅咒 -6，得到真名线索', eff: { stats: { curse: -6, clue: 2 }, addItems: [{ id: 'scarab', qty: 1 }], flags: { scarabName: true } }, next: 'mummy' }
      ]
    },
    mummy: {
      chapter: '第五日 · 复活', place: '金棺室', title: '干尸站起来了',
      text: '金棺盖被掀开，一具缠满金箔的干尸坐了起来。\n它的脸和门上的法老一模一样，只是眼睛还在。\n纳赛尔拽着你后退：“别看它的脸！它要找一个名字住进去！”\n陈野举起火把，火光照出干尸身后那条通往竖井的裂缝。',
      choices: [
        { label: '把铜币撒向干尸，趁它低头捡', hint: '火把 -1，逃生 +1', eff: { stats: { torch: -1, curse: 4 }, flags: { coinDistract: true } }, next: 'escape' },
        { label: '让纳赛尔念咒，你和陈野挡住它', hint: '关系 +20，生命 -15', eff: { rel: { nas: 20, chen: 15 }, stats: { hp: -15, curse: 8 }, flags: { holdMummy: true } }, next: 'escape' },
        { label: '把黄金面具碎片戴在自己脸上', hint: '宝藏 +4，诅咒 +20，危险', eff: { stats: { treasure: 4, curse: 20, hp: -10 }, flags: { woreMask: true } }, next: 'escape' }
      ]
    },
    escape: {
      chapter: '第六日 · 竖井', place: '逃生竖井', title: '沙暴要来了',
      text: '竖井的梯子断了一半，井口外面是正在合拢的沙暴。\n纳赛尔的腿在刚才被干尸抓伤，血把绷带浸透了。\n陈野背着黄金袋，站在梯子下没有动。\n“两个人能上去，三个人都得死。”他说。',
      choices: [
        { label: '把黄金袋扔了，背纳赛尔上去', hint: '纳赛尔 +20，宝藏 -3', eff: { rel: { nas: 20 }, stats: { treasure: -3 }, flags: { savedNas: true } }, next: 'finale' },
        { label: '让陈野先上，自己拖纳赛尔', hint: '陈野 +10，纳赛尔 +15，生命 -10', eff: { rel: { chen: 10, nas: 15 }, stats: { hp: -10 }, flags: { lastUp: true } }, next: 'finale' },
        { label: '把圣甲虫护符塞进干尸嘴里，封住墓门', hint: '诅咒 -10，宝藏 +2', eff: { stats: { curse: -10, treasure: 2 }, flags: { sealedTomb: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 井口', place: '逃生竖井', title: '日出之前',
      text: '你爬上最后一级梯子，沙暴已经封住半个井口。\n纳赛尔在下面喊你的名字，陈野在井口伸出手。\n远处的帝王谷被风沙抹成一条模糊的金线。\n金棺室里，干尸的脚步声还在追。',
      choices: [
        { label: '抓住陈野的手，三个人一起滚出井口', hint: '三人线', eff: { rel: { chen: 15, nas: 15 }, flags: { allOut: true } }, next: 'end' },
        { label: '转身回井里，把纳赛尔扛上来', hint: '牺牲线', eff: { rel: { nas: 25 }, flags: { hero: true } }, next: 'end' },
        { label: '把黄金面具扔回井里，封死诅咒', hint: '封印线', eff: { stats: { curse: -15, treasure: -2 }, flags: { sealed: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '帝王谷', title: '沙暴之后', text: '风停了。', choices: [] }
  },
  events: [
    { id: 'sand', title: '沙暴堵住入口', if: function (s) { return s.day >= 2; }, text: '风声像有人在门外拖铁链。你们必须在沙暴前找到竖井。', eff: { stats: { torch: -1, hp: -2 } } },
    { id: 'cat', title: '猫木乃伊少了一只', if: function (s) { return s.stats.treasure >= 1; }, text: '墙上的猫木乃伊少了一只，地上多了一串小小的爪印。', eff: { stats: { curse: 6, sanity: -3 } } },
    { id: 'nas_wound', title: '纳赛尔的旧伤', if: function (s) { return s.rel.nas >= 30; }, text: '纳赛尔卷起裤腿，小腿上有一道和门上的凿痕一样的疤。', eff: { rel: { nas: 8 }, stats: { clue: 1 } } },
    { id: 'chen_gold', title: '陈野在数黄金', if: function (s) { return s.rel.chen >= 25; }, text: '陈野把金箔铺在膝上，忽然问你：“出去以后，你想去哪？”', eff: { rel: { chen: 8 }, stats: { curse: 2 } } },
    { id: 'whisper', title: '棺材里有人叫你', if: function (s) { return s.stats.curse >= 40; }, text: '金棺里传来你的名字，发音很生硬，像刚学会。', eff: { stats: { curse: 5, hp: -5 } } },
    { id: 'scarab', title: '圣甲虫爬过脚背', if: function (s) { return s.flags.scarabName; }, text: '一只金甲虫从你鞋面爬过，背上的名字和你草图上的残缺名对上了。', eff: { stats: { clue: 1, curse: 3 } } }
  ],
  endings: [
    { id: 'sealed', title: '把名字还给法老', if: function (s) { return s.flags.sealed; }, text: '你把黄金面具放回金棺，干尸慢慢躺下。\n纳赛尔说，它终于不需要借别人的名字了。\n你们空手走出帝王谷，身后沙暴合拢，像一本合上的书。' },
    { id: 'hero', title: '井底的人', if: function (s) { return s.flags.hero; }, text: '你把纳赛尔扛上梯子，自己却被沙暴埋回井底。\n陈野在井口喊了你一夜。\n很多年后，帝王谷的导游会说，那座无名墓里有两个法老，一个戴金面具，一个没有脸。' },
    { id: 'all', title: '三个人和一口袋黄金', if: function (s) { return s.flags.allOut; }, text: '你们滚出井口时，沙暴刚好停了。\n陈野把黄金倒在车后座，纳赛尔用草图折了一只纸船。\n谁都没提金棺里的脚步声。' },
    { id: 'curse', title: '第 14 道锁', if: function (s) { return s.stats.curse >= 90; }, text: '你在开罗的旅馆里醒来，镜子里的人戴着黄金面具。\n你张嘴，发出的却是古埃及语。\n金棺室里，第 14 道锁“咔”地一声，自己开了。' }
  ],
  nexusLinks: [
    { label: '规则：墓室 13 条禁忌', kind: '规则系', target: 'rules' },
    { label: '物品：圣甲虫护符制作', kind: '物品', target: 'items' },
    { label: '物种：猫木乃伊与诅咒', kind: '物种档案', target: 'species' }
  ]
};
