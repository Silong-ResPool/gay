/* 世界：顶流契约 / 娱乐圈 BL · 影帝与新星 */
window.SL_PACK = {
  id: 'ylq', title: '顶流契约', subtitle: '娱乐圈 BL · 影帝与新人',
  kicker: 'SPOTLIGHT · CONTRACT', theme: 'showbiz', layout: 'dashboard', modeLabel: '娱乐圈经营', mode: 'showbiz',
  accent: '#f472b6', accent2: '#fbbf24', bg: '#0a0610', bg2: '#180b1c',
  cover: 'https://aka.doubaocdn.com/s/1GRGG3WOHt', turnsPerDay: 4, eventChance: 0.4,
  freePlaceholder: '自由行动：试镜 / 练台词 / 上综艺 / 走红毯 / 找祁越 / 找江白 / 控评',
  bgm: [
    { id: 'backstage', name: '后台', mood: 'daily', tempo: 84, scale: 'minor', lead: 'piano', pad: 'soft' },
    { id: 'flash', name: '闪光灯', mood: 'tense', tempo: 110, scale: 'major', lead: 'synth', pad: 'beat' },
    { id: 'redcarpet', name: '红毯尽头', mood: 'romance', tempo: 72, scale: 'major', lead: 'strings', pad: 'warm' },
    { id: 'horror', name: '后台黑手', mood: 'horror', tempo: 74, scale: 'minor', lead: 'lowStrings', pad: 'dark' }
  ],
  stats: [
    { key: 'fame', label: '人气', init: 15, max: 100 },
    { key: 'acting', label: '演技', init: 42, max: 100 },
    { key: 'scandal', label: '舆论风险', init: 10, max: 100, danger: true },
    { key: 'heart', label: '心动', init: 5, max: 100 },
    { key: 'money', label: '片酬', init: 8000, max: 999999, unit: '元' }
  ],
  relations: [
    { key: 'qi', name: '祁越', role: '三届影帝 · 冷面前辈', init: 12, max: 100 },
    { key: 'jiang', name: '江白', role: '同期新人 · 对家', init: 18, max: 100 },
    { key: 'agent', name: '陈姐', role: '经纪人 · 只谈利益', init: 0, max: 100 }
  ],
  items: {
    script: { name: '《长夜》剧本', desc: '最后一页有祁越写的一句批注：别演，看着我', tags: ['剧本', '感情'], icon: '本' },
    pass: { name: '红毯通行证', desc: '背面写着江白的电话号码', tags: ['道具'], icon: '证' },
    phone: { name: '备用手机', desc: '里面有一段没发出去的录音', tags: ['线索', '危险'], icon: '机' },
    suit: { name: '借来的西装', desc: '袖口有一处不合身的褶皱', tags: ['装备'], icon: '衣' },
    coffee: { name: '祁越的咖啡', desc: '无糖，苦得清醒', tags: ['日常', '感情'], icon: '咖' },
    award: { name: '最佳新人奖杯', desc: '底座还没刻名字', tags: ['荣誉'], icon: '奖' }
  },
  startItems: [{ id: 'script', qty: 1 }, { id: 'coffee', qty: 1 }],
  skills: [{ id: 'cry', name: '三秒落泪' }, { id: 'improv', name: '即兴台词' }],
  rules: [
    { text: '镜头前的每一秒都有人截图；镜头后的每一句都可能上热搜。', code: 'E-01' },
    { text: '祁越从不带新人，除非剧本里有一场对手戏。', code: 'E-02' },
    { text: '江白的笑是给镜头的，不笑的时候才是给你看的。', code: 'E-03' },
    { text: '经纪人的“为你好”，通常意味着要你签什么。', code: 'E-04' },
    { text: '红毯上不能牵手，但可以并肩。', code: 'E-05' }
  ],
  places: [
    { name: '剧组化妆间', desc: '你和祁越共用一面镜子', unlocked: true },
    { name: '片场', desc: '《长夜》的主要布景', unlocked: true },
    { name: '综艺后台', desc: '江白的主场', unlocked: true },
    { name: '红毯入口', desc: '闪光灯与合约', unlocked: true },
    { name: '经纪公司', desc: '陈姐的办公室', unlocked: false },
    { name: '颁奖礼', desc: '最佳新人奖的舞台', unlocked: false }
  ],
  freeActions: [
    { keys: ['试镜', ' audition', '面试'], text: '你在试镜间演了一场雨夜告别。导演没说话，祁越先鼓了掌。', eff: { stats: { acting: 8, fame: 4 }, rel: { qi: 6 } } },
    { keys: ['台词', '练', '剧本'], text: '你对着镜子练台词，祁越从背后替你把剧本翻到下一页：“这句，看着我念。”', eff: { stats: { acting: 6 }, rel: { qi: 8 } } },
    { keys: ['综艺', '后台', '江白'], text: '江白在综艺后台把麦克风递给你：“等会儿不管我说什么，你别笑场。”', eff: { stats: { fame: 8, scandal: 3 }, rel: { jiang: 8 } } },
    { keys: ['红毯', '走', '闪光'], text: '红毯尽头的闪光灯连成一片。祁越在签名墙边等你，把手背在身后。', eff: { stats: { fame: 10, scandal: 4 }, rel: { qi: 8 }, flags: { redCarpet: true } } },
    { keys: ['祁越', '交谈', '影帝'], text: '祁越把咖啡递给你，杯壁贴着你的指节：“别紧张。你演得比我第一次好。”', eff: { rel: { qi: 10 }, stats: { heart: 4 } } },
    { keys: ['江白', '对家', '聊'], text: '江白把手机翻给你看：热搜上你们的名字并排挂着。他笑得像只狐狸：“要撤吗？”', eff: { stats: { fame: 5, scandal: 5 }, rel: { jiang: 6 } } },
    { keys: ['控评', '热搜', '公关'], text: '你用小号刷了半小时评论。有一条写着：他们看彼此的眼神不像演的。', eff: { stats: { scandal: -4, fame: 3 }, flags: { cpFan: true } } }
  ],
  start: 'makeup',
  scenes: {
    makeup: {
      chapter: '第 1 日 · 化妆间', place: '剧组化妆间', title: '镜子里的人',
      text: '化妆间的灯很亮。\n你坐在镜子前，化妆师正在遮你眼下的青。门被推开，祁越走进来，西装外套搭在手臂上。\n他是三届影帝，也是《长夜》的男主。\n“新人？”他从镜子里看你，“等会儿第一场，别演。看着我。”\n镜子里，你们的视线撞在一起。',
      choices: [
        { label: '点头，按他说的做', hint: '祁越 +10，演技 +4', eff: { rel: { qi: 10 }, stats: { acting: 4 }, flags: { trustQi: true } }, next: 'scene' },
        { label: '反问：不演，怎么叫演戏', hint: '祁越 +8，演技 +6', eff: { rel: { qi: 8 }, stats: { acting: 6 }, flags: { challenged: true } }, next: 'scene' },
        { label: '低头躲开视线，先看剧本', hint: '演技 +4，心动 +2', eff: { stats: { acting: 4, heart: 2 } }, next: 'scene' }
      ]
    },
    scene: {
      chapter: '第 2 日 · 片场', place: '片场', title: '雨夜对手戏',
      text: '第一场是雨夜告别。\n道具雨从头顶浇下来，祁越站在三步外，浑身湿透。\n剧本里，他应该转身走。可他没走。\n导演没有喊卡。\n他抬手替你擦掉脸上的雨水，声音低得只有你能听见：“看着我。”',
      choices: [
        { label: '抓住他的手，把台词说完', hint: '祁越 +15，心动 +8', eff: { rel: { qi: 15 }, stats: { heart: 8 }, flags: { heldRain: true } }, next: 'variety' },
        { label: '推开他，按剧本转身离开', hint: '演技 +10，祁越 -4', eff: { stats: { acting: 10 }, rel: { qi: -4 }, flags: { stayedInCharacter: true } }, next: 'variety' },
        { label: '即兴加一句“别走”', hint: '演技 +8，人气 +6', eff: { stats: { acting: 8, fame: 6 }, addSkills: ['improv'], flags: { improvised: true } }, next: 'variety' }
      ]
    },
    variety: {
      chapter: '第 3 日 · 综艺后台', place: '综艺后台', title: '对家',
      text: '综艺后台的走廊很窄。\n江白靠在墙上，手里转着麦克风。他是和你同期出道的新人，热搜上总和你绑在一起。\n“等会儿主持人问理想型。”他抬眼看你，“你猜我会说谁？”\n不远处，祁越的休息室门开着。',
      choices: [
        { label: '让江白别乱说，先对台本', hint: '江白 +10，舆论 -3', eff: { rel: { jiang: 10 }, stats: { scandal: -3 }, flags: { rehearsed: true } }, next: 'redcarpet' },
        { label: '反问江白，他到底想干什么', hint: '江白 +14，心动 +4', eff: { rel: { jiang: 14 }, stats: { heart: 4 }, flags: { jiangIntent: true } }, next: 'redcarpet' },
        { label: '走向祁越的休息室，把门关上', hint: '祁越 +16，舆论 +4', eff: { rel: { qi: 16 }, stats: { scandal: 4 }, flags: { closedDoor: true } }, next: 'redcarpet' }
      ]
    },
    redcarpet: {
      chapter: '第 4 日 · 红毯', place: '红毯入口', title: '并肩',
      text: '红毯尽头的闪光灯像一场没有停过的雨。\n祁越站在签名墙边，把手背在身后。\n按照合约，你们不能牵手，但可以并肩。\n江白从另一侧走来，西装领口别着一枚银色胸针。\n主持人把话筒递过来：“三位第一次同台，有什么想说的？”',
      choices: [
        { label: '站到祁越身边，替他把话筒接过来', hint: '祁越 +18，人气 +8', eff: { rel: { qi: 18 }, stats: { fame: 8, scandal: 4 }, flags: { sideBySide: true } }, next: 'company' },
        { label: '把江白拉到中间，三个人一起合影', hint: '江白 +14，舆论 +6', eff: { rel: { jiang: 14 }, stats: { fame: 6, scandal: 6 }, flags: { trioPhoto: true } }, next: 'company' },
        { label: '说一句“今晚只看作品”，然后退后', hint: '演技 +8，舆论 -4', eff: { stats: { acting: 8, scandal: -4 }, flags: { deflected: true } }, next: 'company' }
      ]
    },
    company: {
      chapter: '第 5 日 · 经纪公司', place: '经纪公司', title: '合约',
      text: '陈姐把一份合约推到你面前。\n“祁越的工作室要签你。”她说，“条件是，接下来一年，你不能有任何恋情传闻。”\n合约最后一页夹着一张便签，是祁越的字：签不签，你自己决定。\n窗外，江白的车停在楼下。',
      choices: [
        { label: '签，但要求加一条“私生活自主”', hint: '片酬 +20000，祁越 +12', eff: { stats: { money: 20000 }, rel: { qi: 12 }, flags: { smartContract: true } }, next: 'scandal' },
        { label: '不签，先问祁越为什么', hint: '祁越 +16，舆论 +6', eff: { rel: { qi: 16 }, stats: { scandal: 6 }, flags: { askedQi: true } }, next: 'scandal' },
        { label: '把合约拍照发给江白', hint: '江白 +12，舆论 +8', eff: { rel: { jiang: 12 }, stats: { scandal: 8 }, flags: { leakedContract: true } }, next: 'scandal' }
      ]
    },
    scandal: {
      chapter: '第 6 日 · 热搜', place: '剧组化妆间', title: '深夜热搜',
      text: '凌晨两点，热搜爆了。\n词条是“祁越 新人 深夜同车”。配图里，你和祁越坐在同一辆保姆车后座，他的外套盖在你腿上。\n陈姐的电话打进来，江白的消息也亮起来：\"要我帮忙压吗？\"\n祁越坐在你对面，卸了妆，眼下有一点青。',
      choices: [
        { label: '发声明，承认只是同事', hint: '舆论 -10，祁越 -6', eff: { stats: { scandal: -10 }, rel: { qi: -6 }, flags: { denied: true } }, next: 'finale' },
        { label: '不回应，等祁越先开口', hint: '祁越 +18，舆论 +4', eff: { rel: { qi: 18 }, stats: { scandal: 4 }, flags: { waitedQi: true } }, next: 'finale' },
        { label: '让江白帮忙，但欠他一个人情', hint: '江白 +16，舆论 -6', eff: { rel: { jiang: 16 }, stats: { scandal: -6 }, flags: { owedJiang: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 颁奖礼', place: '颁奖礼', title: '最佳新人',
      text: '颁奖礼的灯暗下去。\n主持人念出你的名字。\n你走上台，看见祁越坐在第一排，江白站在侧幕。\n奖杯底座还没有刻名字。\n话筒在你手里，台下所有人都在等你说一句话。',
      choices: [
        { label: '看向祁越：这个奖，有一半是你的', hint: '祁越结局', eff: { rel: { qi: 25 }, flags: { awardQi: true } }, next: 'end' },
        { label: '看向江白：下次，换你站上来', hint: '江白结局', eff: { rel: { jiang: 25 }, flags: { awardJiang: true } }, next: 'end' },
        { label: '谁都不看，只说：我想继续演戏', hint: '事业结局', eff: { stats: { acting: 20, fame: 10 }, flags: { soloCareer: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '颁奖礼', title: '灯亮之后', text: '掌声响了很久。', choices: [] }
  },
  events: [
    { id: 'gossip', title: '剧组八卦', if: function (s) { return s.day >= 1; }, text: '有人把祁越替你撑伞的照片发到群里。配文只有一句：新人运气真好。', eff: { stats: { scandal: 3 }, flags: { umbrellaPhoto: true } } },
    { id: 'fanletter', title: '粉丝的信', if: function (s) { return s.stats.fame >= 25; }, text: '你在化妆间收到一封信。信封里没有信纸，只有一张你和祁越的合照。', eff: { stats: { scandal: 4, heart: 3 } } },
    { id: 'qi_old_role', title: '祁越的旧角色', if: function (s) { return s.rel.qi >= 30; }, text: '祁越翻出十年前的角色录像。屏幕里的他也在雨里等人，等的是另一个人。', eff: { rel: { qi: 8 }, stats: { heart: 4 } } },
    { id: 'jiang_help', title: '江白替你挡镜头', if: function (s) { return s.rel.jiang >= 30; }, text: '狗仔堵在门口。江白忽然揽住你的肩，把你塞进自己的车里：“别回头。”', eff: { rel: { jiang: 8 }, stats: { scandal: -4 } } },
    { id: 'agent_pressure', title: '陈姐施压', if: function (s) { return s.stats.scandal >= 25; }, text: '陈姐把热搜截图拍在桌上：“再这样下去，你的角色会被换掉。”', eff: { stats: { scandal: 4, fame: -4 } } },
    { id: 'redcarpet_rain', title: '红毯下雨', if: function (s) { return s.day >= 4; }, text: '红毯那天下雨。祁越把伞递给助理，自己走进雨里，替你挡了一半。', eff: { rel: { qi: 8 }, stats: { heart: 4 } } }
  ],
  endings: [
    { id: 'qi', title: '影帝的对手戏', if: function (s) { return s.flags.awardQi; }, text: '颁奖礼后，祁越在后台等你。\n他把自己的奖杯放在你旁边：“下次，我们一起站上去。”\n你问他合约怎么办。\n“重新签。”他说，“甲方我，乙方你，期限不限。”' },
    { id: 'jiang', title: '对家变同路', if: function (s) { return s.flags.awardJiang; }, text: '江白从侧幕走上台，接过你的奖杯看了很久。\n“下次换我站上来。”他把奖杯还给你，又低声补了一句，“然后你坐第一排。”\n热搜爆了，你们谁都没让撤。' },
    { id: 'career', title: '长夜之后', if: function (s) { return s.flags.soloCareer; }, text: '你没有说任何人的名字。\n第二天，影评人写：这个新人终于学会了在镜头前只做自己。\n祁越和江白都没有再联系你。\n一年后，你接了下一部戏，男主还没定。' },
    { id: 'ruin', title: '热搜退潮', if: function (s) { return s.stats.scandal >= 90; }, text: '热搜挂了三天。角色被换，合约解约，祁越的工作室撤了你的名字。\n你从公司后门离开时，江白的车停在路边，没有开灯。\n你走过去，车窗降下一半。他说：“上来吧。”' }
  ],
  nexusLinks: [
    { label: '规则：娱乐圈合约', kind: '规则系', target: 'rules' },
    { label: '人物：祁越 / 江白', kind: '人物', target: 'chars' },
    { label: '音乐：后台 / 红毯尽头', kind: '音乐', target: 'music' }
  ]
};
