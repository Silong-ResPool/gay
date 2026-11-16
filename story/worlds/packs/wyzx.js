/* 世界：午夜自习 / 校园怪谈 · 双男主 */
window.SL_PACK = {
  id: 'wyzx', title: '午夜自习', subtitle: '校园怪谈 · 第十三节课',
  kicker: 'MIDNIGHT STUDY · CAMPUS HORROR', theme: 'school', layout: 'dashboard', modeLabel: '校园怪谈', mode: 'rule',
  accent: '#4ade80', accent2: '#60a5fa', bg: '#050a08', bg2: '#0b1410', cover: '../../assets/ui/world_wyzx.jpg?v=3',
  turnsPerDay: 5, eventChance: 0.42, freePlaceholder: '自由行动：翻书 / 照手电 / 查课表 / 去走廊 / 和陆星交谈',
  useNexusRules: true,
  stats: [
    { key: 'sanity', label: '理智', init: 70, max: 100, danger: true },
    { key: 'curfew', label: '宵禁倒计时', init: 9, max: 12, danger: true },
    { key: 'clue', label: '线索', init: 0, max: 12 },
    { key: 'bond', label: '同频', init: 18, max: 100 }
  ],
  relations: [
    { key: 'lu', name: '陆星', role: '同桌 · 校广播站站长', init: 20, max: 100 },
    { key: 'zhou', name: '周默', role: '夜班保安 · 前届学长', init: 6, max: 100 }
  ],
  items: {
    idcard: { name: '学生证', desc: '照片上的你闭着眼', tags: ['身份', '关键'], icon: '证' },
    flashlight: { name: '手电', desc: '电量只够照三间教室', tags: ['工具'], icon: '电' },
    redpen: { name: '红笔', desc: '老师批作业用的，笔帽有牙印', tags: ['线索', '危险'], icon: '笔' },
    tape: { name: '广播磁带', desc: '标签写着“第 13 节自习”', tags: ['关键', '怪谈'], icon: '带' },
    badge: { name: '旧校徽', desc: '1998 届，别针生锈', tags: ['线索'], icon: '徽' }
  },
  startItems: [{ id: 'idcard', qty: 1 }, { id: 'flashlight', qty: 1 }],
  skills: [{ id: 'listen', name: '听广播辨真假' }, { id: 'run', name: '走廊冲刺' }],
  rules: [
    { text: '23:00 后，教学楼只许进，不许出。', code: 'C-01' },
    { text: '走廊第 13 级台阶，不要数第二遍。', code: 'C-02' },
    { text: '广播站如果放起眼保健操，立刻闭眼，不要跟着做。', code: 'C-03' },
    { text: '图书馆闭馆后，借书证会被换成另一种。', code: 'C-04' },
    { text: '查寝老师敲门三下；敲四下的是别的东西。', code: 'C-05' }
  ],
  places: [
    { name: '男生宿舍', desc: '你的 307 寝室', unlocked: true },
    { name: '高三教学楼', desc: '第 13 节自习', unlocked: true },
    { name: '图书馆', desc: '闭馆后的书架', unlocked: true },
    { name: '广播站', desc: '陆星的地盘', unlocked: false },
    { name: '旧钟楼', desc: '停摆的校钟', unlocked: false }
  ],
  freeActions: [
    { keys: ['翻书', '书', '课表'], text: '你翻开课表，发现第 13 节没有老师，只有一行手写小字：点名。', eff: { stats: { clue: 1, sanity: -2 } } },
    { keys: ['手电', '照'], text: '手电扫过走廊，光束里浮着一层粉笔灰，像有人刚擦过黑板。', eff: { stats: { clue: 1, curfew: -1 } } },
    { keys: ['走廊', '数台阶'], text: '你数到第 13 级，再数一遍，变成了 14 级。', eff: { stats: { sanity: -6, clue: 1, curfew: -1 } } },
    { keys: ['广播', '听'], text: '广播里有人念你的名字，声音和陆星一模一样。', eff: { stats: { sanity: -4, bond: 3 }, rel: { lu: 3 } } },
    { keys: ['陆星', '同桌', '交谈'], text: '陆星把耳机分你一半，磁带里是上一届学长的求救录音。', eff: { rel: { lu: 8 }, stats: { clue: 1 } } },
    { keys: ['周默', '保安', '学长'], text: '周默用手电照你的学生证，看了很久：“你不是这一届的。”', eff: { rel: { zhou: 8 }, stats: { sanity: -3, clue: 1 } } },
    { keys: ['闭眼', '眼保健操'], text: '你闭上眼，听见广播里的节拍停了，教室里有人在你耳边呼吸。', eff: { stats: { sanity: -5, clue: 1 } } }
  ],
  start: 'dorm',
  scenes: {
    dorm: {
      chapter: '第一夜 · 307', place: '男生宿舍', title: '查寝老师敲了四下',
      text: '23:07，宿舍熄灯。\n你躺在床上刷手机，走廊里传来查寝老师的脚步声。\n门被敲了三下。\n你刚要应，隔壁床的陆星突然捂住你的嘴。他压低声音：“听。”\n第四下敲门声，落在一分钟之后。',
      choices: [
        { label: '听陆星的，不出声', hint: '陆星 +12，理智 +3', eff: { rel: { lu: 12 }, stats: { sanity: 3 }, flags: { quiet: true } }, next: 'classroom' },
        { label: '从猫眼看出去', hint: '线索 +1，理智 -5', eff: { stats: { clue: 1, sanity: -5 }, flags: { sawTeacher: true } }, next: 'classroom' },
        { label: '开门，问是谁', hint: '危险，线索 +2', eff: { stats: { sanity: -10, clue: 2, curfew: -1 }, flags: { opened: true } }, next: 'classroom' }
      ]
    },
    classroom: {
      chapter: '第二夜 · 第 13 节', place: '高三教学楼', title: '课表上多了一节课',
      text: '凌晨 0:00，教学楼所有灯同时亮起。\n你和陆星被广播叫到高三（7）班。黑板上写着：第 13 节自习，点名。\n教室里坐满了人，每个人都低着头，校服背后写着不同的年份。\n讲台上没有老师，只有一台录音机。\n陆星攥住你的袖子：“别答应点名。”',
      choices: [
        { label: '和陆星坐在最后一排，不回应', hint: '陆星 +10，线索 +1', eff: { rel: { lu: 10 }, stats: { clue: 1, sanity: -3 } }, next: 'library' },
        { label: '看黑板上的名单，找自己的名字', hint: '线索 +2，理智 -4', eff: { stats: { clue: 2, sanity: -4 }, flags: { nameList: true } }, next: 'library' },
        { label: '站起来，问讲台是谁', hint: '危险，触发“老师”', eff: { stats: { sanity: -12, clue: 1, curfew: -1 }, flags: { askedTeacher: true } }, next: 'library' }
      ]
    },
    library: {
      chapter: '第三夜 · 图书馆', place: '图书馆', title: '借书证上的另一个人',
      text: '图书馆闭馆后，书架自己移动，留出一条通向地下的路。\n你在旧报刊区找到 1998 年的校报：一名学生深夜死在钟楼，死因写着“自习过度”。\n照片上的人，和陆星长得一模一样。\n陆星站在书架后，脸色比纸还白：“那是我哥。”',
      choices: [
        { label: '把校报给陆星看，问他真相', hint: '陆星 +18，线索 +2', eff: { rel: { lu: 18 }, stats: { clue: 2, sanity: -4 }, flags: { brother: true } }, next: 'broadcast' },
        { label: '偷偷把校报收进书包', hint: '线索 +1，获得旧校徽', eff: { stats: { clue: 1 }, addItems: [{ id: 'badge', qty: 1 }], flags: { oldPaper: true } }, next: 'broadcast' },
        { label: '去广播站查当年的磁带', hint: '线索 +2，陆星 +8', eff: { rel: { lu: 8 }, stats: { clue: 2, curfew: -1 } }, next: 'broadcast' }
      ]
    },
    broadcast: {
      chapter: '第四夜 · 广播站', place: '广播站', title: '磁带里有两个声音',
      text: '广播站的磁带柜里，所有磁带标签都写着同一个日期：1998.12.13。\n陆星把磁带放进去，喇叭里先传出他哥哥的声音，然后是另一个人的声音——和你一模一样。\n“第 13 节自习，点名。”\n录音里的你答了一声“到”。\n陆星猛地按下停止键。',
      choices: [
        { label: '把磁带倒回去，再听一遍', hint: '线索 +2，理智 -6', eff: { stats: { clue: 2, sanity: -6 }, flags: { heardSelf: true } }, next: 'bathroom' },
        { label: '砸掉磁带，带陆星离开', hint: '陆星 +15，理智 +3', eff: { rel: { lu: 15 }, stats: { sanity: 3 }, flags: { brokeTape: true } }, next: 'bathroom' },
        { label: '查广播站的值班表，找周默的名字', hint: '周默 +8，线索 +1', eff: { rel: { zhou: 8 }, stats: { clue: 1 } }, next: 'bathroom' }
      ]
    },
    bathroom: {
      chapter: '第五夜 · 镜子', place: '高三教学楼', title: '镜子里的你闭着眼',
      text: '凌晨 2:00，你走进教学楼厕所。\n镜子里，你闭着眼。现实中的你明明睁着。\n水龙头自己拧开，流出的水是红的。\n陆星在门外敲门：“别照镜子。你学生证上的照片，也是闭眼的。”\n你低头看学生证，照片上的你，正在慢慢睁眼。',
      choices: [
        { label: '把学生证扔进水槽', hint: '理智 +5，线索 +1', eff: { stats: { sanity: 5, clue: 1 }, flags: { threwCard: true } }, next: 'clock' },
        { label: '用红笔在镜子上写“我不是”', hint: '理智 -8，线索 +2', eff: { stats: { sanity: -8, clue: 2 }, flags: { wroteMirror: true } }, next: 'clock' },
        { label: '打开门，把陆星拉进来一起面对', hint: '陆星 +20，危险', eff: { rel: { lu: 20 }, stats: { sanity: -5, curfew: -1 }, flags: { togetherMirror: true } }, next: 'clock' }
      ]
    },
    clock: {
      chapter: '第六夜 · 旧钟楼', place: '旧钟楼', title: '钟停在 23:13',
      text: '旧钟楼的钟停在 23:13。\n周默坐在钟下，保安服上别着 1998 届的校徽。\n“每年都要有一个人留在第 13 节。”他说，“今年轮到你。”\n陆星挡在你前面：“我哥已经留了二十年。”\n周默抬头，脸在钟影里分成两半：“你哥自愿的。”',
      choices: [
        { label: '问周默，怎么结束这场自习', hint: '线索 +2，周默 +10', eff: { rel: { zhou: 10 }, stats: { clue: 2 }, flags: { howEnd: true } }, next: 'rooftop' },
        { label: '让陆星别再提他哥，先走', hint: '陆星 +8，理智 +3', eff: { rel: { lu: 8 }, stats: { sanity: 3 }, flags: { protectLu: true } }, next: 'rooftop' },
        { label: '敲响校钟，把所有人叫醒', hint: '线索 +1，危险', eff: { stats: { clue: 1, sanity: -8, curfew: -2 }, flags: { rangBell: true } }, next: 'rooftop' }
      ]
    },
    rooftop: {
      chapter: '第七夜 · 天台', place: '旧钟楼', title: '天台上还有一个人',
      text: '钟声把整栋楼震醒。教学楼每一扇窗都亮起，窗后站着一个低头的学生。\n你数了数，正好 13 个。\n陆星站在你身边，声音发抖：“第 13 个，是你。”\n天台上，另一个你正背对你们，走向边缘。\n广播里开始放眼保健操。',
      choices: [
        { label: '冲过去抓住另一个自己', hint: '理智 -10，线索 +2', eff: { stats: { sanity: -10, clue: 2 }, flags: { grabbedSelf: true } }, next: 'finale' },
        { label: '先让陆星闭眼，自己跟着广播做', hint: '陆星 +15，危险', eff: { rel: { lu: 15 }, stats: { sanity: -8, curfew: -1 }, flags: { didExercise: true } }, next: 'finale' },
        { label: '把红笔折断，划掉黑板上的名单', hint: '线索 +2，理智 +4', eff: { stats: { clue: 2, sanity: 4 }, flags: { crossedList: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 23:13', place: '旧钟楼', title: '第 13 节下课',
      text: '钟楼的指针开始倒转。\n13 个窗口里的人同时抬头。\n陆星握住你的手，掌心全是汗：“这次，我们一起下课。”\n广播里的眼保健操停了，换成一个很轻的声音：\n“第 13 节，下课。”',
      choices: [
        { label: '和陆星一起走下钟楼，离开学校', hint: '逃生线', eff: { rel: { lu: 25 }, stats: { sanity: 10 }, flags: { escape: true } }, next: 'end' },
        { label: '留下来，替下一个学生关掉广播', hint: '守夜线', eff: { stats: { sanity: -5, clue: 3 }, flags: { stay: true } }, next: 'end' },
        { label: '把周默的校徽放进钟里，让时间继续走', hint: '解救线', eff: { rel: { zhou: 20, lu: 10 }, flags: { free: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '校园', title: '天亮', text: '早读铃响了。', choices: [] }
  },
  events: [
    { id: 'knock4', title: '查寝敲了四下', if: function (s) { return s.day >= 1; }, text: '门外又响起四声敲门。陆星把被子拉过头顶，你听见他心跳得比敲门声还响。', eff: { stats: { sanity: -4, curfew: -1 }, rel: { lu: 4 } } },
    { id: 'broadcast_name', title: '广播念到你的名字', if: function (s) { return s.stats.clue >= 2; }, text: '校园广播突然念出你的名字，停顿两秒，又念了一遍。', eff: { stats: { sanity: -5, clue: 1 } } },
    { id: 'lu_hand', title: '陆星握住你的手', if: function (s) { return s.rel.lu >= 40; }, text: '走廊灯灭的一瞬，陆星抓住你的手。他说：“别松。”', eff: { rel: { lu: 8 }, stats: { sanity: 3 } } },
    { id: 'zhou_flash', title: '周默的手电照过来', if: function (s) { return s.rel.zhou >= 20; }, text: '周默用手电照了照你的影子，确认它还在，才转身走开。', eff: { rel: { zhou: 6 }, stats: { sanity: 2 } } },
    { id: 'desk', title: '课桌里有人写字', if: function (s) { return s.day >= 3; }, text: '你的课桌里传来粉笔写字的声音。抽屉里只有一句话：“别答应。”', eff: { stats: { clue: 1, sanity: -3 } } },
    { id: 'bell', title: '钟楼自己敲了一下', if: function (s) { return s.stats.curfew <= 4; }, text: '旧钟楼无风自鸣。整栋教学楼的灯同时闪了一下。', eff: { stats: { sanity: -4, curfew: -1 } } }
  ],
  endings: [
    { id: 'escape', title: '早读铃', if: function (s) { return s.flags.escape; }, text: '你和陆星跑出校门时，早读铃正好响起。\n回头看，教学楼每一扇窗都空着。\n陆星把耳机塞进你耳朵，里面是正常的早间新闻。' },
    { id: 'stay', title: '新的广播站站长', if: function (s) { return s.flags.stay; }, text: '你留了下来，接替周默。每年 12 月 13 日，你都会在广播里念一遍名单，然后关掉机器。\n陆星每年都来，坐在最后一排，陪你到下课。' },
    { id: 'free', title: '钟声继续走', if: function (s) { return s.flags.free; }, text: '周默的校徽落进钟摆，指针重新走动。\n1998 届的学生一个个抬头，像终于睡醒。\n陆星的哥哥站在走廊尽头，朝你们摆了摆手，转身走进晨光。' },
    { id: 'loop', title: '第 13 节，点名', if: function (s) { return s.stats.sanity <= 10; }, text: '你听见自己答了一声“到”。\n第二天，新的转学生住进 307。\n你站在讲台上，低头看着名单，念出下一个名字。' }
  ],
  nexusLinks: [
    { label: '规则：校园宵禁 5 条', kind: '规则系', target: 'rules' },
    { label: '物品：广播磁带 / 学生证', kind: '物品', target: 'items' },
    { label: '音乐：校园怪谈低频氛围', kind: '音乐合成', target: 'music' }
  ]
};
