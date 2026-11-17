/* 世界：孤海邮轮 / 现代悬疑 · 密室 · 双男主 */
window.SL_PACK = {
  id: 'hxy', title: '孤海邮轮', subtitle: '现代悬疑 · 无人生还的航线',
  kicker: 'GHOST LINER · AT SEA', theme: 'mystery', layout: 'dashboard', modeLabel: '悬疑解谜', mode: 'mystery',
  accent: '#38bdf8', accent2: '#c084fc', bg: '#04090f', bg2: '#0b1020',
  cover: 'https://aka.doubaocdn.com/s/FVOQh0yEe9', turnsPerDay: 4, eventChance: 0.46,
  freePlaceholder: '自由行动：查乘客名单 / 去甲板 / 搜房间 / 修电台 / 找顾言 / 找陆时',
  bgm: [
    { id: 'sea', name: '海面以下', mood: 'daily', tempo: 58, scale: 'minor', lead: 'piano', pad: 'waves' },
    { id: 'alarm', name: '第七声汽笛', mood: 'horror', tempo: 92, scale: 'phrygian', lead: 'lowStrings', pad: 'alarm' },
    { id: 'dawn', name: '靠岸之前', mood: 'hope', tempo: 76, scale: 'major', lead: 'strings', pad: 'warm' }
  ],
  stats: [
    { key: 'sanity', label: '理智', init: 68, max: 100, danger: true },
    { key: 'hp', label: '体力', init: 80, max: 100, danger: true },
    { key: 'clues', label: '线索', init: 0, max: 20 },
    { key: 'trust', label: '信任', init: 12, max: 100 },
    { key: 'water', label: '淡水', init: 5, max: 30 }
  ],
  relations: [
    { key: 'gu', name: '顾言', role: '头等舱乘客 · 失踪名单上的人', init: 10, max: 100 },
    { key: 'lu', name: '陆时', role: '邮轮保安 · 前海警', init: 18, max: 100 },
    { key: 'captain', name: '船长', role: '从未离开驾驶舱', init: 0, max: 100 }
  ],
  items: {
    manifest: { name: '乘客名单', desc: '第 47 号乘客的名字被划掉了三次', tags: ['线索', '关键'], icon: '单' },
    key: { name: '万能舱钥', desc: '陆时从保安室带出来的', tags: ['工具'], icon: '钥' },
    radio: { name: '损坏的电台', desc: '只能收到一段重复的求救录音', tags: ['工具', '线索'], icon: '台' },
    photo: { name: '湿透的合照', desc: '照片上有你、顾言和一个不该出现的人', tags: ['线索', '感情'], icon: '照' },
    pill: { name: '晕船药', desc: '顾言放在你口袋里，药片上有牙印', tags: ['药品'], icon: '药' },
    flare: { name: '救生信号枪', desc: '只有一发，打出去就再也藏不住', tags: ['工具', '危险'], icon: '枪' }
  },
  startItems: [{ id: 'manifest', qty: 1 }, { id: 'pill', qty: 2 }],
  skills: [{ id: 'observe', name: '观察' }, { id: 'swim', name: '海上求生' }],
  rules: [
    { text: '船上没有第 47 号乘客，但每天晚上都有人替他点餐。', code: 'S-01' },
    { text: '第七声汽笛响时，不要站在甲板边缘。', code: 'S-02' },
    { text: '驾驶舱的门从里面锁着，船长只在广播里说话。', code: 'S-03' },
    { text: '顾言记得你，但名单上你们从不相识。', code: 'S-04' },
    { text: '救生艇只有六艘，乘客有七百人。', code: 'S-05' }
  ],
  places: [
    { name: '内舱房', desc: '你的房间，门缝里每天多一张纸条', unlocked: true },
    { name: '甲板', desc: '海雾和第七声汽笛', unlocked: true },
    { name: '头等舱走廊', desc: '顾言住过的房间', unlocked: true },
    { name: '保安室', desc: '陆时的监控墙', unlocked: true },
    { name: '驾驶舱', desc: '从里面反锁', unlocked: false },
    { name: '救生艇甲板', desc: '六艘艇，少了一艘', unlocked: false }
  ],
  freeActions: [
    { keys: ['名单', '乘客', '查'], text: '你把乘客名单摊在床上。第 47 号被划掉三次，可墨迹一次比一次新。', eff: { stats: { clues: 1, sanity: -2 }, flags: { manifestDeep: true } } },
    { keys: ['甲板', '海', '吹风'], text: '甲板上的雾很重。陆时站在栏杆边，替你挡了风：“别靠太近。”', eff: { rel: { lu: 6 }, stats: { sanity: 4 } } },
    { keys: ['搜', '房间', '找'], text: '你在顾言的房间找到一张湿透的合照。照片背面写着：别让他看见。', eff: { addItems: [{ id: 'photo', qty: 1 }], stats: { clues: 1, sanity: -3 } } },
    { keys: ['电台', '修', '求救'], text: '电台修到一半，喇叭里忽然传出你自己的声音：“救救我。”', eff: { stats: { clues: 1, sanity: -5 }, flags: { radioVoice: true } } },
    { keys: ['顾言', '交谈', '47'], text: '顾言替你擦掉脸上的海水。他的手指很冷：“如果名单上没有我，你还会认得我吗？”', eff: { rel: { gu: 8 }, stats: { sanity: -2 } } },
    { keys: ['陆时', '保安', '监控'], text: '陆时把监控倒回三天前。画面里，你正和顾言一起走上这艘船。', eff: { rel: { lu: 6 }, stats: { clues: 2, sanity: -3 } } },
    { keys: ['救生艇', '逃生', '艇'], text: '救生艇的锁被人剪断了。六艘艇，只剩五艘。', eff: { stats: { clues: 1, sanity: -2 }, flags: { boatGone: true } } }
  ],
  start: 'cabin',
  scenes: {
    cabin: {
      chapter: '第 1 日 · 内舱房', place: '内舱房', title: '第 47 号乘客',
      text: '你醒来时，邮轮已经离港三天。\n手机没有信号，舷窗外只有黑海。\n门缝里塞着一张乘客名单，第 47 号被划掉三次。\n你翻到最后一页，看见自己的名字——在第 48 号。\n门外有人敲了三下：“早餐，先生。”那声音像顾言。',
      choices: [
        { label: '开门，问顾言为什么在这里', hint: '顾言 +12，线索 +1', eff: { rel: { gu: 12 }, flags: { guAtDoor: true } }, next: 'deck' },
        { label: '不开门，先从名单查第 47 号', hint: '线索 +2，理智 -2', eff: { stats: { clues: 2, sanity: -2 }, flags: { fortySeven: true } }, next: 'deck' },
        { label: '去找陆时，问船上出过什么事', hint: '陆时 +12，线索 +1', eff: { rel: { lu: 12 }, flags: { luAsked: true } }, next: 'deck' }
      ]
    },
    deck: {
      chapter: '第 2 日 · 甲板', place: '甲板', title: '第七声汽笛',
      text: '海雾从凌晨开始涨。\n广播说，第七声汽笛后全员回舱。\n你数到第六声时，甲板边缘出现一个穿白裙的乘客。她背对着海，脸却朝着你。\n顾言从雾里冲出来，一把把你拉回栏杆内。\n第七声汽笛响了。',
      choices: [
        { label: '抓住顾言的手，问他看见了什么', hint: '顾言 +15，理智 -4', eff: { rel: { gu: 15 }, stats: { sanity: -4 }, flags: { sawWoman: true } }, next: 'first' },
        { label: '甩开顾言，去追那个白裙乘客', hint: '线索 +2，危险', eff: { stats: { clues: 2, sanity: -8, hp: -5 }, flags: { chasedWoman: true } }, next: 'first' },
        { label: '拉响警报，让陆时封锁甲板', hint: '陆时 +10，线索 +1', eff: { rel: { lu: 10 }, stats: { clues: 1 }, flags: { alarmDeck: true } }, next: 'first' }
      ]
    },
    first: {
      chapter: '第 3 日 · 头等舱', place: '头等舱走廊', title: '湿透的合照',
      text: '顾言的房间在走廊尽头。\n门没锁，床铺得很整齐。桌上放着一张湿透的合照：你、顾言，还有一个背对镜头的男人。\n照片背面写着日期——三天前，也就是你“醒来”的那天。\n顾言站在门口，手里端着两杯水：“你都想起来了？”',
      choices: [
        { label: '承认自己什么都不记得', hint: '顾言 +12，理智 +4', eff: { rel: { gu: 12 }, stats: { sanity: 4 }, flags: { memoryLost: true } }, next: 'security' },
        { label: '把照片撕掉，逼他说真话', hint: '顾言 +6，线索 +2', eff: { rel: { gu: 6 }, stats: { clues: 2, sanity: -4 }, flags: { photoTorn: true } }, next: 'security' },
        { label: '问他，照片上背对镜头的人是谁', hint: '线索 +1，顾言 +8', eff: { rel: { gu: 8 }, flags: { thirdMan: true } }, next: 'security' }
      ]
    },
    security: {
      chapter: '第 4 日 · 保安室', place: '保安室', title: '监控里的你',
      text: '陆时把监控墙切到三天前。\n画面里，你和顾言一起走上舷梯。你穿着现在的衣服，顾言手里提着同一只箱子。\n时间戳跳了一下，画面里的你忽然回头，正对镜头。\n陆时把视频停住：“这个人，不是你。”',
      choices: [
        { label: '让陆时把视频倒回更早', hint: '线索 +2，理智 -4', eff: { stats: { clues: 2, sanity: -4 }, rel: { lu: 6 }, flags: { videoEarlier: true } }, next: 'engine' },
        { label: '问陆时，为什么他会在这艘船上', hint: '陆时 +12，线索 +1', eff: { rel: { lu: 12 }, flags: { luStory: true } }, next: 'engine' },
        { label: '拿走万能舱钥，自己去驾驶舱', hint: '获得钥匙，危险 +8', eff: { addItems: [{ id: 'key', qty: 1 }], stats: { clues: 1, sanity: -4 }, flags: { stoleKey: true } }, next: 'engine' }
      ]
    },
    engine: {
      chapter: '第 5 日 · 机舱', place: '驾驶舱', title: '船长不在',
      text: '驾驶舱的门从里面反锁。\n你用万能舱钥打开，里面没有人。\n舵轮自己缓慢转动，广播里传来船长的声音：“请所有乘客回到舱房。”\n控制台上放着一台损坏的电台，喇叭里重复着一段求救录音——是你自己的声音。\n海图上的航线，正朝着没有港口的方向。',
      choices: [
        { label: '修电台，向外界发出求救', hint: '线索 +1，危险 +6', eff: { stats: { clues: 1, sanity: -4 }, flags: { radioFixed: true } }, next: 'boat' },
        { label: '改航线，把船转向最近的岛', hint: '体力 -8，线索 +1', eff: { stats: { hp: -8, clues: 1 }, flags: { changedCourse: true } }, next: 'boat' },
        { label: '砸掉广播，逼船长出来', hint: '理智 -6，危险 +10', eff: { stats: { sanity: -6 }, flags: { brokeBroadcast: true } }, next: 'boat' }
      ]
    },
    boat: {
      chapter: '第 6 日 · 救生艇', place: '救生艇甲板', title: '六艘艇，五艘',
      text: '救生艇甲板的锁被剪断。\n六艘艇，只剩五艘。\n顾言站在艇边，手里拿着那张湿透的合照；陆时在另一头检查发动机。\n广播忽然响了：\"第 47 号乘客，请到救生艇甲板。\"\n你们两个同时抬头。',
      choices: [
        { label: '和顾言上同一艘艇', hint: '顾言 +18，危险 +8', eff: { rel: { gu: 18 }, stats: { sanity: -4 }, flags: { boatWithGu: true } }, next: 'truth' },
        { label: '让陆时先带顾言走，自己留下查真相', hint: '陆时 +14，线索 +2', eff: { rel: { lu: 14 }, stats: { clues: 2, hp: -6 }, flags: { stayTruth: true } }, next: 'truth' },
        { label: '打信号枪，把船和真相一起照亮', hint: '线索 +2，危险 +12', eff: { addItems: [{ id: 'flare', qty: 1 }], stats: { clues: 2, sanity: -6 }, flags: { firedFlare: true } }, next: 'truth' }
      ]
    },
    truth: {
      chapter: '第 7 日 · 海雾', place: '甲板', title: '名单最后一页',
      text: '你把乘客名单摊在甲板上。\n第 47 号不是乘客，是这艘船上一任保安的名字。三年前，他在这条航线上失踪。\n顾言蹲下来，把照片放在名单旁边：“他不是失踪。他发现了船长在运的东西。”\n陆时从雾里走出来，手里拿着船长的日志。\n“现在，我们都知道了。”',
      choices: [
        { label: '把日志交给顾言，一起靠岸', hint: '顾言结局', eff: { rel: { gu: 20 }, flags: { shoreTogether: true } }, next: 'end' },
        { label: '把日志交给陆时，先控制船长', hint: '陆时结局', eff: { rel: { lu: 20 }, flags: { shoreLu: true } }, next: 'end' },
        { label: '把日志扔进海里，让船自己漂', hint: '真相结局', eff: { stats: { sanity: -10 }, flags: { letSea: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '海面', title: '靠岸', text: '天亮了。', choices: [] }
  },
  events: [
    { id: 'knock', title: '门外的敲击', if: function (s) { return s.day >= 1; }, text: '凌晨三点，有人敲了三下门。你从猫眼往外看，走廊里没有人。', eff: { stats: { sanity: -4 }, clues: 1 } },
    { id: 'water', title: '淡水变咸', if: function (s) { return s.day >= 2; }, text: '你拧开水龙头，流出来的是海水。陆时把自己的水壶递给你，什么也没说。', eff: { stats: { water: -2, sanity: -2 }, rel: { lu: 5 } } },
    { id: 'gu_fever', title: '顾言发热', if: function (s) { return s.rel.gu >= 30; }, text: '顾言靠在舱壁上发热，嘴里反复念着你的名字。你把最后一片药塞进他嘴里。', eff: { rel: { gu: 10 }, stats: { hp: 3 } } },
    { id: 'lu_past', title: '陆时的旧证件', if: function (s) { return s.rel.lu >= 30; }, text: '陆时的钱包里有一张旧海警证。照片上的他比现在年轻，背后写着：第 47 号。', eff: { stats: { clues: 2, sanity: -3 }, flags: { lu47: true } } },
    { id: 'fog', title: '海雾进舱', if: function (s) { return s.day >= 4; }, text: '海雾从门缝里漫进来。雾里有人低声数数，从一数到四十七。', eff: { stats: { sanity: -6 } } },
    { id: 'engine_stop', title: '引擎停了', if: function (s) { return s.day >= 5; }, text: '整艘船忽然安静。广播里只剩电流声，随后传来一声很轻的笑。', eff: { stats: { sanity: -5, hp: -4 } } }
  ],
  endings: [
    { id: 'gu', title: '靠岸以后', if: function (s) { return s.flags.shoreTogether; }, text: '救援船靠过来时，顾言把外套披在你肩上。\n“下船以后，”他说，“别再装作不认识我。”\n你看着海面，点了点头。\n名单上的第 48 号，终于有了名字。' },
    { id: 'lu', title: '海警的证词', if: function (s) { return s.flags.shoreLu; }, text: '陆时把船长的日志交给海警。邮轮被拖回港口，新闻里只说是“机械故障”。\n他站在码头上，把旧证件扔进海里：“第 47 号，结案。”\n你问他接下来去哪。他说：“先送你回家。”' },
    { id: 'sea', title: '船继续漂', if: function (s) { return s.flags.letSea; }, text: '你把日志扔进海里。船没有靠岸，也没有沉。\n每天早上，广播都会说“早餐，先生”，门缝里都会有新的名单。\n你渐渐不再确定，自己是不是也已经在名单上。' },
    { id: 'drown', title: '无人生还', if: function (s) { return s.stats.sanity <= 5 || s.stats.hp <= 5; }, text: '海雾吞没了甲板。救生艇的灯一盏盏灭掉。\n最后一刻，你听见顾言在雾里叫你。\n你朝声音走过去，脚下却没有甲板。' }
  ],
  nexusLinks: [
    { label: '法则：潮汐与航线', kind: '宇宙法则', target: 'law' },
    { label: '规则：邮轮乘客守则', kind: '规则系', target: 'rules' },
    { label: '物品：乘客名单 / 信号枪', kind: '物品', target: 'items' }
  ]
};
