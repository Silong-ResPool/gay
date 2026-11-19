/* 世界：零下七十 / 极寒末世 · 异能刷怪 · 双男主 */
window.SL_PACK = {
  id: 'lxqs', title: '零下七十', subtitle: '极寒末世 · 异能觉醒',
  kicker: 'FROSTFALL · SURVIVAL', theme: 'survival', layout: 'dashboard', modeLabel: '生存刷怪', mode: 'survival',
  accent: '#ddd6fe', accent2: '#a78bfa', bg: '#0f0314', bg2: '#110a1f',
  cover: 'https://aka.doubaocdn.com/s/XyAU4AjY6e', turnsPerDay: 4, eventChance: 0.45,
  bgm: [
    { id: 'daily', name: '风雪营地', mood: 'daily', tempo: 50, scale: 'minor', lead: 'guitar', pad: 'wind' },
    { id: 'tense', name: '尸潮逼近', mood: 'tense', tempo: 100, scale: 'phrygian', lead: 'taiko', pad: 'pulse' },
    { id: 'hope', name: '火堆旁', mood: 'hope', tempo: 64, scale: 'major', lead: 'piano', pad: 'warm' }
,
    { id: 'horror', name: '雪地里的脚步', mood: 'horror', tempo: 62, scale: 'minor', lead: 'bell', pad: 'wind' }
  ],
  freePlaceholder: '自由行动：搜刮 / 生火 / 休息 / 吸收晶核 / 刷怪 / 和秦焰交谈',
  stats: [
    { key: 'warmth', label: '体温', init: 58, max: 100, danger: true },
    { key: 'hp', label: '生命', init: 82, max: 100, danger: true },
    { key: 'energy', label: '异能', init: 26, max: 100 },
    { key: 'kills', label: '击杀', init: 0, max: 50 },
    { key: 'threat', label: '尸潮威胁', init: 8, max: 100, danger: true }
  ],
  relations: [
    { key: 'yan', name: '秦焰', role: '前救援队员 · 火焰异能', init: 20, max: 100 },
    { key: 'chen', name: '陆沉', role: '冰层下的神秘幸存者', init: 5, max: 100 }
  ],
  items: {
    coat: { name: '极地防寒服', desc: '内衬还留着秦焰的体温', tags: ['装备', '保暖'], icon: '衣' },
    food: { name: '压缩口粮', desc: '够撑过一场暴风雪', tags: ['食物'], icon: '粮' },
    core: { name: '冰晶核', desc: '从冰尸颅内取出，握久了会灼手', tags: ['异能', '危险'], icon: '核' },
    flare: { name: '信号弹', desc: '可以照亮一小片天空', tags: ['工具', '求救'], icon: '弹' },
    med: { name: '冻伤药剂', desc: '喝下去像吞了一口火', tags: ['药品'], icon: '药' }
  },
  startItems: [{ id: 'coat', qty: 1 }, { id: 'food', qty: 2 }, { id: 'core', qty: 1 }],
  skills: [{ id: 'ice', name: '冰晶感知（初醒）' }, { id: 'fire', name: '热能牵引（未觉醒）' }],
  rules: [
    { text: '体温低于 30 时，任何异能都会反噬。', code: 'F-01' },
    { text: '冰尸的晶核可以吸收，但每吸收一枚，尸潮会记住你的气味。', code: 'F-02' },
    { text: '暴风雪里不要相信第二个脚步声。', code: 'F-03' },
    { text: '秦焰的火焰能救人，也能把整条街点燃。', code: 'F-04' },
    { text: '南边信号塔每晚会亮一次；灯灭之前必须离开冰原。', code: 'F-05' }
  ],
  places: [
    { name: '地下避难所', desc: '你与秦焰的临时据点', unlocked: true },
    { name: '冰封便利店', desc: '食物与药品', unlocked: true },
    { name: '地铁隧道', desc: '尸群聚集地', unlocked: true },
    { name: '市医院', desc: '异能实验记录', unlocked: false },
    { name: '南边信号塔', desc: '唯一的出路', unlocked: false }
  ],
  freeActions: [
    { keys: ['搜刮', '搜', '找'], text: '你撬开一个冻住的柜子，找到一点物资。', eff: { stats: { warmth: -4, kills: 0 }, addItems: [{ id: 'food', qty: 1 }] } },
    { keys: ['生火', '点火'], text: '秦焰把手掌贴在铁桶上，火焰腾起，避难所终于有了暖意。', eff: { stats: { warmth: 12, energy: -3 }, rel: { yan: 4 } } },
    { keys: ['休息', '睡'], text: '你缩在睡袋里，听着冰层在头顶开裂。', eff: { stats: { warmth: 5, hp: 6, threat: 2 } } },
    { keys: ['吸收', '晶核'], text: '你捏碎一枚晶核，冰冷的能量顺着手臂爬上来。', eff: { stats: { energy: 14, warmth: -8, threat: 6, kills: 1 } } },
    { keys: ['刷怪', '打怪', '冰尸'], text: '你和秦焰背靠背迎上冰尸，火焰与冰晶在黑暗里炸开。', eff: { stats: { kills: 2, energy: -10, hp: -8, threat: 8 }, rel: { yan: 6 }, addItems: [{ id: 'core', qty: 1 }] } },
    { keys: ['秦焰', '交谈', '聊'], text: '秦焰把护目镜推上去，露出一双被冻得发红的眼睛：“别死在我前面。”', eff: { rel: { yan: 7 }, stats: { warmth: 3 } } },
    { keys: ['陆沉', '冰层'], text: '你敲开冰层，听见下面有人用指节回敲。', eff: { stats: { threat: 4, energy: 4 }, rel: { chen: 8 } } }
  ],
  start: 'shelter',
  scenes: {
    shelter: {
      chapter: '第 1 日 · 避难所', place: '地下避难所', title: '世界只剩零下七十',
      text: '末日后第 47 天，地表温度降到零下七十。\n你在地下停车场改成的避难所醒来，呼吸在睡袋口结成一圈白霜。\n秦焰蹲在铁桶边，指尖跳着一簇火。他听见你起身，没回头：“南边信号塔昨晚亮了一次。再不去，冰原就把我们埋了。”\n你掌心里，一枚冰晶核正轻轻震动。',
      choices: [
        { label: '先吸收晶核，把异能稳定下来', hint: '异能 +12，体温 -6，威胁 +4', eff: { stats: { energy: 12, warmth: -6, threat: 4 }, flags: { awakened: true } }, next: 'power' },
        { label: '和秦焰检查补给，规划路线', hint: '关系 +8，物资 +1', eff: { rel: { yan: 8 }, addItems: [{ id: 'food', qty: 1 }] }, next: 'store' },
        { label: '独自去地铁隧道刷怪升级', hint: '击杀 +3，危险', eff: { stats: { kills: 3, hp: -12, threat: 8 }, addItems: [{ id: 'core', qty: 1 }] }, next: 'tunnel' }
      ]
    },
    power: {
      chapter: '第 2 日 · 觉醒', place: '地下避难所', title: '冰晶在血管里开花',
      text: '晶核碎成粉末，顺着你的掌纹钻进去。\n你看见空气里的温度线条，像一张透明的网。每一具冰尸都在网上留下冷白的点。\n秦焰猛地掐住你的手腕：“呼吸。别让冰把你接管。”\n他的掌心很烫，烫得你几乎叫出声。',
      choices: [
        { label: '抓住秦焰的手，把异能压回去', hint: '关系 +12，异能 +6', eff: { rel: { yan: 12 }, stats: { energy: 6, warmth: 4 }, addSkills: ['ice'], flags: { iceAwake: true } }, next: 'store' },
        { label: '放任冰晶扩张，看看极限', hint: '异能 +18，体温 -10，威胁 +8', eff: { stats: { energy: 18, warmth: -10, threat: 8 }, addSkills: ['ice'], flags: { iceAwake: true, iceHunger: true } }, next: 'store' },
        { label: '问秦焰，他的火焰是怎么来的', hint: '关系 +8，线索 +1', eff: { rel: { yan: 8 }, stats: { energy: 4 }, flags: { fireStory: true } }, next: 'store' }
      ]
    },
    store: {
      chapter: '第 3 日 · 冰封便利店', place: '冰封便利店', title: '货架后面有人',
      text: '便利店被冰封成一座透明的盒子。秦焰用火焰化开卷帘门，热气在门口凝成白雾。\n你们在货架后找到一具蜷缩的冰尸，怀里抱着一箱压缩口粮。\n冰尸的颅骨里，晶核亮得像一颗小太阳。\n秦焰没有动。他看向你：“吸收它，还是留给陆沉？”',
      choices: [
        { label: '吸收晶核，先活下去', hint: '异能 +14，威胁 +6', eff: { stats: { energy: 14, threat: 6 }, addItems: [{ id: 'core', qty: 1 }] }, next: 'tunnel' },
        { label: '把晶核留给陆沉，继续搜寻', hint: '陆沉关系 +10，物资 +2', eff: { rel: { chen: 10 }, addItems: [{ id: 'food', qty: 2 }, { id: 'med', qty: 1 }] }, next: 'hospital' },
        { label: '先问秦焰，为什么他知道陆沉', hint: '关系 +6，线索 +1', eff: { rel: { yan: 6 }, stats: { kills: 0 }, flags: { knowsChen: true } }, next: 'tunnel' }
      ]
    },
    tunnel: {
      chapter: '第 4 日 · 地铁隧道', place: '地铁隧道', title: '尸潮在黑暗里呼吸',
      text: '隧道深处传来指甲刮擦铁皮的声音。\n秦焰把最后一枚燃烧弹塞给你：“我数三下，你往通风井跑。”\n你的冰晶感知同时亮起——不止一具。黑暗里有二十七个冷白点，正沿着轨道慢慢围过来。\n其中一具冰尸穿着救援队制服，胸口别着秦焰以前的编号。',
      choices: [
        { label: '和秦焰并肩打穿尸群', hint: '击杀 +4，关系 +14，重伤', eff: { stats: { kills: 4, hp: -18, energy: -12, threat: 10 }, rel: { yan: 14 }, addItems: [{ id: 'core', qty: 2 }] }, next: 'nest' },
        { label: '拉秦焰进通风井，绕开尸群', hint: '体温 -8，威胁 +4，线索 +1', eff: { stats: { warmth: -8, threat: 4 }, rel: { yan: 8 }, flags: { vent: true } }, next: 'hospital' },
        { label: '用冰异能冻住轨道，制造路障', hint: '异能 -10，击杀 +2', eff: { stats: { energy: -10, kills: 2, threat: 5 } }, next: 'nest' }
      ]
    },
    hospital: {
      chapter: '第 5 日 · 市医院', place: '市医院', title: '异能不是天赐',
      text: '医院七楼冻着一条长长的走廊。每一间病房里都有人形冰雕，姿势停在逃跑的前一秒。\n医生办公室的录音笔还在闪：\n“第 13 批实验体出现共生反应……冰晶不是能源，是某种正在学习人类的东西。”\n秦焰站在门口，脸色比冰还白。他手腕上的旧伤，和录音里的实验编号一模一样。',
      choices: [
        { label: '把录音听完，带走实验资料', hint: '线索 +2，异能 +8', eff: { stats: { energy: 8 }, addItems: [{ id: 'med', qty: 2 }], flags: { truth: true } }, next: 'radio' },
        { label: '先问秦焰，他是不是实验体', hint: '关系 +16，真相', eff: { rel: { yan: 16 }, flags: { yanExperiment: true } }, next: 'radio' },
        { label: '不碰资料，去信号塔', hint: '威胁 -2，体温 -4', eff: { stats: { threat: -2, warmth: -4 }, flags: { skipTruth: true } }, next: 'radio' }
      ]
    },
    nest: {
      chapter: '第 6 日 · 冰巢', place: '地铁隧道', title: '冰层下面有东西在学你',
      text: '尸群退开后，隧道尽头露出一座由冰和钢筋垒成的巢。\n巢中央躺着一个男人。他被冰封在透明的茧里，眉眼清晰，胸口还有微弱起伏。\n秦焰认得他：“陆沉。三年前失踪的冰原勘探员。”\n冰茧上写着你的名字，笔迹和你自己一模一样。',
      choices: [
        { label: '敲开冰茧，把陆沉救出来', hint: '陆沉关系 +20，威胁 +10', eff: { rel: { chen: 20 }, stats: { warmth: -8, threat: 10 }, flags: { savedChen: true } }, next: 'radio' },
        { label: '先检查冰茧上的字，找线索', hint: '线索 +2，异能 +10', eff: { stats: { energy: 10 }, flags: { nestMark: true } }, next: 'radio' },
        { label: '让秦焰烧掉冰巢，不碰陆沉', hint: '关系 -10，击杀 +2，威胁 -6', eff: { rel: { yan: -10, chen: -15 }, stats: { kills: 2, threat: -6 }, flags: { burnedNest: true } }, next: 'radio' }
      ]
    },
    radio: {
      chapter: '第 7 日 · 信号塔', place: '南边信号塔', title: '灯亮之前',
      text: '信号塔在冰原尽头，像一根插进天空的针。\n塔顶的灯每隔十秒亮一次，照出塔下密密麻麻的冰尸。它们不进攻，只抬头看灯。\n秦焰把信号弹递给你：“灯灭之前，要么发信号，要么把它们全引开。”\n陆沉如果还活着，正在塔底的维修间里敲摩斯码。',
      choices: [
        { label: '发射信号弹，呼叫南边救援', hint: '逃生 +2，威胁 +8', eff: { stats: { threat: 8 }, flags: { signal: true } }, next: 'finale' },
        { label: '和秦焰引开尸潮，让陆沉修塔', hint: '关系 +18，击杀 +3', eff: { rel: { yan: 18, chen: 8 }, stats: { kills: 3, hp: -15, threat: 12 }, flags: { bait: true } }, next: 'finale' },
        { label: '吸收塔顶晶核，强行开启异能', hint: '异能 +20，体温 -12', eff: { stats: { energy: 20, warmth: -12, threat: 6 }, flags: { towerCore: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 南边', place: '南边信号塔', title: '零下七十的日出',
      text: '灯灭了。冰原陷入真正的黑暗。\n你听见秦焰在风里喊你的名字，声音被吹得七零八落。\n陆沉从维修间冲出来，怀里抱着一块还在发热的电池。\n南边的天际线上，救援机的探照灯正慢慢扫过来。',
      choices: [
        { label: '抓住秦焰和陆沉，一起冲向探照灯', hint: '三人一起离开', eff: { rel: { yan: 20, chen: 20 }, flags: { escaped: true } }, next: 'end' },
        { label: '让秦焰带陆沉先走，自己留下断后', hint: '牺牲线', eff: { rel: { yan: 15, chen: 15 }, stats: { kills: 2 }, flags: { lastStand: true } }, next: 'end' },
        { label: '把塔顶晶核全部吸收，冻住整片尸潮', hint: '冰王线', eff: { stats: { energy: 30, warmth: -20 }, flags: { iceKing: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '南边信号塔', title: '雪停之后', text: '风终于停了。', choices: [] }
  },
  events: [
    { id: 'storm', title: '暴风雪压塌了出口', if: function (s) { return s.day >= 1; }, text: '积雪把避难所出口堵死。秦焰用火焰化开一条缝，你的体温又掉了一截。', eff: { stats: { warmth: -8, threat: 4 }, rel: { yan: 3 } } },
    { id: 'icebite', title: '冰尸在门外学你呼吸', if: function (s) { return s.stats.threat >= 20; }, text: '门外传来与你同频的呼吸声。它学得太像了，连你自己都差点应答。', eff: { stats: { hp: -8, threat: 6, energy: 4 } } },
    { id: 'yan_wound', title: '秦焰的旧伤裂开', if: function (s) { return s.rel.yan >= 30; }, text: '秦焰的袖口被血浸透，他却先问你有没有受伤。你把最后一支冻伤药剂塞给他。', eff: { rel: { yan: 10 }, stats: { hp: -4 }, addItems: [{ id: 'med', qty: 1 }] } },
    { id: 'chen_signal', title: '冰层下的摩斯码', if: function (s) { return s.flags.knowsChen || s.day >= 3; }, text: '你听见冰层下传来三短三长三短的敲击。陆沉还活着。', eff: { rel: { chen: 8 }, stats: { energy: 3 } } },
    { id: 'core_dream', title: '晶核在梦里叫你名字', if: function (s) { return s.stats.energy >= 50; }, text: '你梦见自己站在冰原中央，所有冰尸都朝你跪下。醒来时，掌心多了一道冰纹。', eff: { stats: { energy: 8, warmth: -6, threat: 5 } } },
    { id: 'rescue_light', title: '南边亮了一下', if: function (s) { return s.day >= 4; }, text: '信号塔的灯穿过暴风雪，亮了三秒。秦焰盯着那点光，很久没说话。', eff: { stats: { warmth: 3 }, flags: { sawLight: true } } }
  ],
  endings: [
    { id: 'iceking', title: '冰原的新主人', if: function (s) { return s.flags.iceKing; }, text: '你把整片尸潮冻成一座白色森林。秦焰在冰外喊你，你听得见，却再也走不出去。\n很多年后，南边的人说，冰原深处坐着一个由冰晶组成的王，怀里抱着一簇永远不会灭的火。' },
    { id: 'last', title: '最后一道火光', if: function (s) { return s.flags.lastStand; }, text: '你留在塔下，把尸潮引向自己。秦焰背着陆沉跑进探照灯，回头时只看见一道冲天的冰蓝色光柱。\n春天来得很晚，但南边的人记得，那年的雪是咸的。' },
    { id: 'escape', title: '零下七十的日出', if: function (s) { return s.flags.escaped; }, text: '救援机把你们拉上云层。秦焰的手还攥着你的手腕，陆沉靠在舱壁上笑。\n舷窗外，冰原在日出里碎成一片金色的海。' },
    { id: 'threat', title: '尸潮吞城', if: function (s) { return s.stats.threat >= 85; }, text: '你没能跑过尸潮。冰层从脚底漫上来，最后看见的是秦焰转身冲回来的身影。\n避难所的灯亮了很久，直到再也没有人添柴。' }
  ],
  nexusLinks: [
    { label: '法则：热力学与异能守恒', kind: '宇宙法则', target: 'law' },
    { label: '食材：冰原苔与晶核毒性', kind: '食材', target: 'food' },
    { label: '物品：冰晶核 / 冻伤药剂', kind: '物品', target: 'items' }
  ]
};
