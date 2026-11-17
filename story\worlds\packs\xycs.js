/* 世界：校草协议 / 校园 BL · 假情侣 · 学生会权谋 */
window.SL_PACK = {
  id: 'xycs', title: '校草协议', subtitle: '校园 BL · 假情侣合约',
  kicker: 'CAMPUS · CONTRACT', theme: 'campus', layout: 'dashboard', modeLabel: '校园经营', mode: 'campus',
  accent: '#a78bfa', accent2: '#f472b6', bg: '#080612', bg2: '#150b24',
  cover: 'https://aka.doubaocdn.com/s/1znNqWtOVx', turnsPerDay: 4, eventChance: 0.4,
  freePlaceholder: '自由行动：去图书馆 / 球场 / 天台 / 拉票 / 和江屿说话 / 找周野',
  bgm: [
    { id: 'bell', name: '下课铃', mood: 'daily', tempo: 88, scale: 'major', lead: 'piano', pad: 'soft' },
    { id: 'rooftop', name: '天台的风', mood: 'romance', tempo: 72, scale: 'minor', lead: 'guitar', pad: 'air' },
    { id: 'sports', name: '球场边线', mood: 'joy', tempo: 118, scale: 'major', lead: 'synth', pad: 'beat' },
    { id: 'horror', name: '空教室', mood: 'horror', tempo: 68, scale: 'minor', lead: 'bell', pad: 'dark' }
  ],
  stats: [
    { key: 'popularity', label: '人气', init: 18, max: 100 },
    { key: 'study', label: '学业', init: 62, max: 100 },
    { key: 'heart', label: '心动', init: 5, max: 100 },
    { key: 'crisis', label: '舆论危机', init: 8, max: 100, danger: true },
    { key: 'money', label: '零花钱', init: 300, max: 9999, unit: '元' }
  ],
  relations: [
    { key: 'jiang', name: '江屿', role: '学生会会长 · 清冷学霸', init: 15, max: 100 },
    { key: 'zhou', name: '周野', role: '篮球队长 · 直球小狗', init: 20, max: 100 },
    { key: 'lin', name: '林知夏', role: '广播站站长 · 情报商', init: 5, max: 100 }
  ],
  items: {
    contract: { name: '恋爱协议', desc: '甲方江屿，乙方你，期限三十天', tags: ['关键', '感情'], icon: '约' },
    note: { name: '匿名便利贴', desc: '上面写着“离江屿远一点”', tags: ['线索', '危险'], icon: '贴' },
    ticket: { name: '篮球赛门票', desc: '周野塞给你的，座位在第一排', tags: ['信物'], icon: '票' },
    key: { name: '天台钥匙', desc: '学生会长的备用钥匙，齿痕被磨得很亮', tags: ['道具'], icon: '钥' },
    milk: { name: '草莓牛奶', desc: '江屿每天放在你桌角的那一盒', tags: ['日常', '感情'], icon: '奶' },
    mic: { name: '广播站麦克风', desc: '全校都能听见你的声音', tags: ['工具'], icon: '麦' }
  },
  startItems: [{ id: 'contract', qty: 1 }, { id: 'milk', qty: 1 }],
  skills: [{ id: 'talk', name: '场面话' }, { id: 'ball', name: '三步上篮' }],
  rules: [
    { text: '这所学校的流言比考试排名传播得更快。', code: 'C-01' },
    { text: '学生会长的“无所谓”，通常意味着很在意。', code: 'C-02' },
    { text: '恋爱协议第一条：不可以在天台以外的地方牵手。', code: 'C-03' },
    { text: '篮球赛输了可以再来，广播站的话说错了不能收回。', code: 'C-04' },
    { text: '周野看起来什么都不懂，其实每次都在等你先开口。', code: 'C-05' }
  ],
  places: [
    { name: '高三（7）班', desc: '你的座位靠窗，桌角每天有一盒牛奶', unlocked: true },
    { name: '学生会办公室', desc: '江屿的地盘，钥匙只有两把', unlocked: true },
    { name: '篮球场', desc: '周野的主场', unlocked: true },
    { name: '天台', desc: '协议里唯一允许牵手的地方', unlocked: true },
    { name: '广播站', desc: '能把一句话传遍全校', unlocked: false },
    { name: '旧礼堂', desc: '校庆彩排与秘密交易', unlocked: false }
  ],
  freeActions: [
    { keys: ['图书馆', '自习', '学习'], text: '你在图书馆靠窗的位置坐下。江屿把一本笔记本推过来，页脚写着“重点，别抄错”。', eff: { stats: { study: 8 }, rel: { jiang: 5 } } },
    { keys: ['球场', '篮球', '周野'], text: '周野把球传给你，自己退到三分线外：“投啊，输了算我的。”', eff: { stats: { popularity: 4, heart: 3 }, rel: { zhou: 7 } } },
    { keys: ['天台', '吹风', '散步'], text: '天台的风把你的校服吹起来。江屿伸手按住你的衣角，很久没有松。', eff: { rel: { jiang: 8 }, stats: { heart: 4 } } },
    { keys: ['拉票', '学生会', '竞选'], text: '你抱着一摞海报跑遍三层楼。周野在每一张海报旁边都画了一个小小的篮球。', eff: { stats: { popularity: 10, crisis: 3 }, rel: { zhou: 5 } } },
    { keys: ['江屿', '交谈', '聊'], text: '江屿把协议翻到背面：“这一条没写。你要不要补上？”他指的是“可以喜欢甲方”。', eff: { rel: { jiang: 10 }, stats: { heart: 6 } } },
    { keys: ['林知夏', '广播', '情报'], text: '林知夏把耳机分你一半，广播里正放着某个人点给你的歌。', eff: { stats: { popularity: 5, crisis: 2 }, rel: { lin: 6 } } },
    { keys: ['牛奶', '桌角', '草莓'], text: '你拿起桌角的草莓牛奶，盒底用马克笔写着“今天也别熬夜”。', eff: { rel: { jiang: 5 }, stats: { heart: 3 } } }
  ],
  start: 'classroom',
  scenes: {
    classroom: {
      chapter: '第 1 日 · 早自习', place: '高三（7）班', title: '桌角的草莓牛奶',
      text: '早自习的铃声还没响，你的桌角已经放了一盒草莓牛奶。\n盒底写着：今天也别熬夜。\n前排的江屿正在收作业，袖口挽到小臂，侧脸被晨光切得很干净。\n后门忽然被人推开，周野抱着一颗篮球探头进来，冲你扬了扬下巴：“放学球场见。”\n同一天，广播站传出匿名点歌：\"送给高三七班的某个人。\"',
      choices: [
        { label: '把牛奶推回江屿桌上，问他什么意思', hint: '江屿 +10，心动 +4', eff: { rel: { jiang: 10 }, stats: { heart: 4 }, flags: { askedMilk: true } }, next: 'office' },
        { label: '收下牛奶，放学去球场找周野', hint: '周野 +12，人气 +4', eff: { rel: { zhou: 12 }, stats: { popularity: 4 }, flags: { choseBall: true } }, next: 'court' },
        { label: '两边都不回应，先去广播站查点歌人', hint: '线索 +1，危机 +2', eff: { stats: { crisis: 2, study: 2 }, flags: { radioClue: true } }, next: 'broadcast' }
      ]
    },
    office: {
      chapter: '第 2 日 · 学生会', place: '学生会办公室', title: '恋爱协议',
      text: '江屿把一份打印好的协议推到你面前。\n“校庆要拍宣传片，学生会需要一对‘校园情侣’。”他推了推眼镜，语气像在布置作业，“三十天。到期自动解除。”\n协议第一条：不可以在天台以外的地方牵手。\n第二条：不可以假戏真做。\n他顿了顿，把笔递给你：“签不签？”',
      choices: [
        { label: '签，但把第二条划掉', hint: '江屿 +14，心动 +8', eff: { rel: { jiang: 14 }, stats: { heart: 8 }, flags: { crossedRule: true, signed: true } }, next: 'rooftop' },
        { label: '签，按他的规则来', hint: '江屿 +8，学业 +4', eff: { rel: { jiang: 8 }, stats: { study: 4 }, flags: { signed: true } }, next: 'rooftop' },
        { label: '不签，问宣传片为什么非你不可', hint: '江屿 +6，线索 +1', eff: { rel: { jiang: 6 }, flags: { refused: true } }, next: 'rooftop' }
      ]
    },
    court: {
      chapter: '第 2 日 · 篮球场', place: '篮球场', title: '第一排的票',
      text: '周野把一颗球砸进你怀里。\n“明天校际赛，第一排给你留了位置。”他抹了把汗，笑得毫无防备，“赢了的话，你得答应我一件事。”\n看台另一边，江屿抱着记分板站着。他没有过来，只在你看向他时，把视线移开。\n球场的灯亮起来，把两个人的影子拉得很长。',
      choices: [
        { label: '答应周野，问他赢了想要什么', hint: '周野 +15，心动 +5', eff: { rel: { zhou: 15 }, stats: { heart: 5 }, addItems: [{ id: 'ticket', qty: 1 }], flags: { zhouDeal: true } }, next: 'rooftop' },
        { label: '把票收下，但说要看江屿的安排', hint: '周野 +6，江屿 +8', eff: { rel: { zhou: 6, jiang: 8 }, flags: { torn: true } }, next: 'rooftop' },
        { label: '把球传回去，先赢一场再说', hint: '人气 +8，学业 +2', eff: { stats: { popularity: 8, study: 2 }, addSkills: ['ball'], rel: { zhou: 8 } }, next: 'rooftop' }
      ]
    },
    broadcast: {
      chapter: '第 3 日 · 广播站', place: '广播站', title: '匿名点歌',
      text: '广播站的隔音门没有关严。\n林知夏坐在调音台前，耳机挂在脖子上。她看见你，直接把一张点歌单推过来。\n点歌人那一栏是空的，只留下一行字：\"离江屿远一点。\"\n“这已经是本周第三次了。”她说，“有人在盯着你。”',
      choices: [
        { label: '把点歌单收起来，自己查监控', hint: '线索 +2，危机 +4', eff: { stats: { crisis: 4 }, flags: { checkedCamera: true } }, next: 'rooftop' },
        { label: '问林知夏，她是不是知道点歌人', hint: '林知夏 +12，线索 +1', eff: { rel: { lin: 12 }, flags: { linKnows: true } }, next: 'rooftop' },
        { label: '直接在广播里回应，让全校都听见', hint: '人气 +12，危机 +8', eff: { stats: { popularity: 12, crisis: 8 }, addItems: [{ id: 'mic', qty: 1 }], flags: { publicReply: true } }, next: 'rooftop' }
      ]
    },
    rooftop: {
      chapter: '第 4 日 · 天台', place: '天台', title: '协议里允许的地方',
      text: '天台的风很大。\n江屿靠在栏杆边，校服外套被吹得鼓起来。他把钥匙放在你掌心：“这是学生会备用钥匙。以后想上来，不用翻墙。”\n“协议第一条，”他忽然说，“这里可以牵手。”\n他没有看你，只把手垂在两人之间，指尖离你很近。',
      choices: [
        { label: '牵住他的手，问他是不是认真的', hint: '江屿 +20，心动 +12', eff: { rel: { jiang: 20 }, stats: { heart: 12 }, flags: { heldHand: true } }, next: 'festival' },
        { label: '把钥匙收下，先谈宣传片拍摄', hint: '学业 +6，江屿 +8', eff: { stats: { study: 6 }, rel: { jiang: 8 }, flags: { businesslike: true } }, next: 'festival' },
        { label: '问他，周野的票是不是他故意放的', hint: '江屿 +6，线索 +1', eff: { rel: { jiang: 6 }, flags: { jealous: true } }, next: 'festival' }
      ]
    },
    festival: {
      chapter: '第 5 日 · 校庆彩排', place: '旧礼堂', title: '宣传片',
      text: '旧礼堂的舞台上，宣传片正在彩排。\n导演要你们重现“校园情侣”的初见：江屿站在光里，你从侧幕走向他。\n你走到一半，周野忽然从观众席站起来，手里举着一束用篮球袜包住的花。\n全场安静。江屿在光里看着你，眼神比任何时候都安静。',
      choices: [
        { label: '继续走向江屿，把这场戏演完', hint: '江屿 +18，危机 +4', eff: { rel: { jiang: 18 }, stats: { crisis: 4 }, flags: { choseJiang: true } }, next: 'exam' },
        { label: '转身走向周野，把花接过来', hint: '周野 +20，危机 +10', eff: { rel: { zhou: 20 }, stats: { crisis: 10 }, flags: { choseZhou: true } }, next: 'exam' },
        { label: '停在原地，说这场戏不演了', hint: '人气 +4，两人 +6', eff: { rel: { jiang: 6, zhou: 6 }, stats: { popularity: 4 }, flags: { stopped: true } }, next: 'exam' }
      ]
    },
    exam: {
      chapter: '第 6 日 · 月考', place: '高三（7）班', title: '成绩单与流言',
      text: '月考成绩贴出来时，你的名字被红笔圈了三次。\n有人在你耳边说：靠学生会的人上位；也有人说：广播站的点歌单是江屿写的。\n江屿站在成绩榜前，手指停在你名字旁边。\n“流言我来处理。”他说，“你只要告诉我，协议还算不算数。”',
      choices: [
        { label: '算数，但加一条“可以真的喜欢”', hint: '江屿 +16，心动 +10', eff: { rel: { jiang: 16 }, stats: { heart: 10 }, flags: { realLove: true } }, next: 'finale' },
        { label: '不算了，先把自己摘干净', hint: '危机 -8，江屿 -6', eff: { stats: { crisis: -8 }, rel: { jiang: -6 }, flags: { endedContract: true } }, next: 'finale' },
        { label: '把点歌单交给江屿，先查谁在造谣', hint: '线索 +2，危机 +2', eff: { stats: { crisis: 2 }, flags: { exposeRumor: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 校庆夜', place: '旧礼堂', title: '灯亮之后',
      text: '校庆夜的舞台灯全部亮起。\n宣传片在大屏幕上播放，最后定格在一个没有剪进正片的镜头：天台栏杆边，两个人没有牵手，只隔着很近的距离。\n台下有人起哄，有人尖叫。\n江屿站在侧幕，周野坐在第一排。你把麦克风拿起来，全校都在等你说一句话。',
      choices: [
        { label: '说：协议到期了，但我想续约', hint: '江屿结局', eff: { rel: { jiang: 25 }, flags: { publicJiang: true } }, next: 'end' },
        { label: '说：第一排的票，我还留着', hint: '周野结局', eff: { rel: { zhou: 25 }, flags: { publicZhou: true } }, next: 'end' },
        { label: '说：谢谢大家，我要去念书了', hint: '独立结局', eff: { stats: { study: 20 }, flags: { solo: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '旧礼堂', title: '放学以后', text: '铃声终于响了。', choices: [] }
  },
  events: [
    { id: 'note_locker', title: '储物柜里的便利贴', if: function (s) { return s.day >= 1; }, text: '你打开储物柜，一张匿名便利贴掉出来：“离江屿远一点。”', eff: { stats: { crisis: 3 }, addItems: [{ id: 'note', qty: 1 }] } },
    { id: 'rain_umbrella', title: '校门口的伞', if: function (s) { return s.rel.jiang >= 20 || s.rel.zhou >= 20; }, text: '雨下得很大。两把伞同时递到你面前，一把黑，一把透明。', eff: { stats: { heart: 5 }, flags: { umbrella: true } } },
    { id: 'ball_wound', title: '周野的脚踝', if: function (s) { return s.rel.zhou >= 30; }, text: '周野在球场上崴了脚，还嘴硬说没事。你蹲下去替他系鞋带，他忽然不说话了。', eff: { rel: { zhou: 8 }, stats: { heart: 4 } } },
    { id: 'jiang_fever', title: '江屿发烧了', if: function (s) { return s.rel.jiang >= 30; }, text: '江屿在学生会办公室趴在桌上睡着了，额头很烫。你替他盖上外套，他在梦里抓住你的手腕。', eff: { rel: { jiang: 8 }, stats: { heart: 4 } } },
    { id: 'broadcast_attack', title: '广播站被匿名点歌', if: function (s) { return s.stats.crisis >= 25; }, text: '午休广播又响了。这次点歌人写的是你的名字，歌名却是《备胎》。', eff: { stats: { crisis: 6, popularity: -3 } } },
    { id: 'confession_wall', title: '表白墙', if: function (s) { return s.day >= 4; }, text: '学校表白墙更新了。有人匿名写：\"高三七班那个谁，同时吊着两个人。\"', eff: { stats: { crisis: 5 } } }
  ],
  endings: [
    { id: 'jiang', title: '协议续约', if: function (s) { return s.flags.publicJiang; }, text: '江屿在全校的注视下走上台。他没有拿麦克风，只把那份旧协议递给你，背面多了一行手写：\n“期限改为长期。甲方：江屿。乙方：你。”\n天台的风从礼堂门缝里吹进来，他终于牵住你的手。' },
    { id: 'zhou', title: '第一排永远留给你', if: function (s) { return s.flags.publicZhou; }, text: '周野从第一排站起来，手里的花已经蔫了。\n“我不太会说话。”他挠了挠头，“但下一场球，我还想让你坐第一排。”\n你走下台，他把花塞给你，耳尖比花还红。' },
    { id: 'solo', title: '毕业之后', if: function (s) { return s.flags.solo; }, text: '你把协议、便利贴和篮球票一起夹进毕业纪念册。\n很多年后，你在一座陌生城市看见天台，还是会想起那个下午。\n没有谁赢，也没有谁输。你只是终于学会了先选自己。' },
    { id: 'scandal', title: '流言吞人', if: function (s) { return s.stats.crisis >= 90; }, text: '广播站的点歌单被贴满全校。学生会撤了你的宣传片，周野被教练禁赛。\n你转学那天，江屿站在校门口，隔着雨看你。\n谁都没有开口。' }
  ],
  nexusLinks: [
    { label: '规则：校园恋爱协议', kind: '规则系', target: 'rules' },
    { label: '人物：江屿 / 周野 / 林知夏', kind: '人物', target: 'chars' },
    { label: '音乐：下课铃 / 天台的风', kind: '音乐', target: 'music' }
  ]
};
