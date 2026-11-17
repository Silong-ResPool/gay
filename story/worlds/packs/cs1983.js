/* 世界：重生1983 / 年代系统 · 发家致富 · 三位男性攻略对象 */
window.SL_PACK = {
  id: 'cs1983', title: '重生1983', subtitle: '八十年代 · 系统发家',
  kicker: 'REBORN 1983 · BUSINESS', theme: 'business', layout: 'ledger', modeLabel: '年代经营', mode: 'business',
  accent: '#f97316', accent2: '#facc15', bg: '#120b06', bg2: '#1e140b', cover: 'https://aka.doubaocdn.com/s/oFSUZXUSIe',
  turnsPerDay: 6, eventChance: 0.38, freePlaceholder: '自由行动：摆摊 / 做工 / 听广播 / 找人 / 进货 / 去知青点',
  bgm: [
    { id: 'daily', name: '旧城晨雾', mood: 'daily', tempo: 62, scale: 'major', lead: 'piano', pad: 'soft' },
    { id: 'tense', name: '厂区夜班', mood: 'tense', tempo: 88, scale: 'minor', lead: 'guitar', pad: 'pulse' },
    { id: 'hope', name: '第一桶金', mood: 'hope', tempo: 74, scale: 'major', lead: 'piano', pad: 'warm' },
    { id: 'horror', name: '广播里的杂音', mood: 'horror', tempo: 66, scale: 'minor', lead: 'theremin', pad: 'dark' }
  ],
  stats: [
    { key: 'money', label: '现金', init: 18, max: 1000, unit: '元' },
    { key: 'rep', label: '声望', init: 8, max: 100 },
    { key: 'sys', label: '系统等级', init: 1, max: 10 },
    { key: 'risk', label: '风险', init: 4, max: 100, danger: true },
    { key: 'luck', label: '运气', init: 52, max: 100 }
  ],
  relations: [
    { key: 'wei', name: '顾卫东', role: '知青点大哥 · 稳重会算账', init: 18, max: 100 },
    { key: 'zhou', name: '陆行舟', role: '劳改农场“二哥” · 会修机器', init: 6, max: 100 },
    { key: 'man', name: '阿满', role: '镇上小裁缝 · 可爱小弟', init: 12, max: 100 }
  ],
  items: {
    ticket: { name: '工业票', desc: '能换一台缝纫机', tags: ['票证', '关键'], icon: '票' },
    radio: { name: '红灯牌收音机', desc: '能收到南边的新政策', tags: ['信息', '电器'], icon: '收' },
    ginseng: { name: '长白山人参', desc: '用红布包着，能卖大价钱', tags: ['货物', '贵重'], icon: '参' },
    contract: { name: '承包合同', desc: '第一批个体户营业执照', tags: ['商业', '关键'], icon: '合' },
    cloth: { name: '的确良布票', desc: '阿满偷偷塞给你的', tags: ['布料', '关系'], icon: '布' }
  },
  startItems: [{ id: 'radio', qty: 1 }, { id: 'ticket', qty: 1 }],
  skills: [{ id: 'bargain', name: '系统：议价术' }, { id: 'forecast', name: '系统：政策预判（未解锁）' }],
  rules: [
    { text: '1983 年，投机倒把罪还在；摆摊要挂在“自产自销”名下。', code: 'B-01' },
    { text: '系统只提示，不替你动手。每次使用都会增加一点风险。', code: 'B-02' },
    { text: '知青点的工分不能欠；欠一次，顾卫东会记你一辈子。', code: 'B-03' },
    { text: '劳改农场的人情比钱贵，陆行舟只帮真把他当人的人。', code: 'B-04' },
    { text: '阿满的裁缝铺是镇上消息最灵的地方。', code: 'B-05' }
  ],
  places: [
    { name: '知青点', desc: '顾卫东与一屋子旧书', unlocked: true },
    { name: '镇集市', desc: '摆摊与票证交易', unlocked: true },
    { name: '劳改农场', desc: '陆行舟的修理棚', unlocked: false },
    { name: '阿满裁缝铺', desc: '布料与八卦', unlocked: true },
    { name: '县百货大楼', desc: '第一台电视机', unlocked: false }
  ],
  freeActions: [
    { keys: ['摆摊', '卖', '生意'], text: '你把从南边带来的电子表铺在蛇皮袋上，一上午卖了七块。', eff: { stats: { money: 12, risk: 4, rep: 2 } } },
    { keys: ['做工', '工分', '干活'], text: '你在知青点帮着修拖拉机，顾卫东给你记了满分。', eff: { stats: { money: 4, rep: 3 }, rel: { wei: 5 } } },
    { keys: ['广播', '听'], text: '收音机里说，允许农民进城办服务业了。系统亮起一行小字：机会。', eff: { stats: { luck: 4, sys: 1 } } },
    { keys: ['进货', '货'], text: '你托南边的朋友带了一批尼龙袜，藏在自行车后座。', eff: { stats: { money: -8, risk: 5 }, addItems: [{ id: 'ginseng', qty: 1 }] } },
    { keys: ['顾卫东', '大哥', '知青'], text: '顾卫东把眼镜摘下来擦，问你：“你真要干个体户？被人戳脊梁骨也不怕？”', eff: { rel: { wei: 8 }, stats: { rep: 2 } } },
    { keys: ['陆行舟', '二哥', '农场'], text: '陆行舟从修理棚底下钻出来，一手机油，递给你一只修好的收音机。', eff: { rel: { zhou: 8 }, stats: { risk: 2 } } },
    { keys: ['阿满', '小弟', '裁缝'], text: '阿满踩缝纫机踩得飞快，耳朵红着说：“哥，这件衬衫给你做的，不要钱。”', eff: { rel: { man: 8 }, addItems: [{ id: 'cloth', qty: 1 }] } }
  ],
  start: 'arrive',
  scenes: {
    arrive: {
      chapter: '1983 年 · 春', place: '知青点', title: '你带着记忆回来了',
      text: '你在一张硬板床上醒来，头顶是 1983 年的日历。\n窗外广播正念“允许个体户雇工”，屋里几个知青围着一台红灯牌收音机。\n一个高个子男人回头看你，眼镜片反着光：“醒了？我叫顾卫东，这儿的大哥。”\n你脑海里浮出一行字：\n【年代致富系统已绑定。新手任务：七天内赚到 100 元。】',
      choices: [
        { label: '先跟顾卫东去镇上摸行情', hint: '顾卫东 +10，系统 +1', eff: { rel: { wei: 10 }, stats: { sys: 1, luck: 3 }, flags: { knowWei: true } }, next: 'market' },
        { label: '借口去邮局，独自找商机', hint: '现金 +8，风险 +3', eff: { stats: { money: 8, risk: 3 } }, next: 'market' },
        { label: '先去阿满裁缝铺做一身“体面衣服”', hint: '阿满 +12，声望 +2', eff: { rel: { man: 12 }, stats: { rep: 2 }, flags: { metMan: true } }, next: 'market' }
      ]
    },
    market: {
      chapter: '第一周 · 集市', place: '镇集市', title: '第一桶金',
      text: '镇集市上，粮票、布票、电子表混在一起卖。\n顾卫东帮你借了一张折叠桌，阿满拿来一块白布当招牌。\n系统提示：\n【今日风口：电子表。进货价 8 元，售价 18 元。风险：中。】\n你口袋里只有十八块。',
      choices: [
        { label: '全押电子表，赌一把', hint: '现金 +30，风险 +8', eff: { stats: { money: 30, risk: 8, sys: 1 }, rel: { wei: 4 } }, next: 'farm' },
        { label: '卖阿满做的衬衫，稳一点', hint: '现金 +12，阿满 +12', eff: { stats: { money: 12, rep: 2 }, rel: { man: 12 } }, next: 'farm' },
        { label: '先不卖，观察三天行情', hint: '运气 +8，系统 +1', eff: { stats: { luck: 8, sys: 1 }, flags: { watched: true } }, next: 'farm' }
      ]
    },
    farm: {
      chapter: '第二周 · 农场', place: '劳改农场', title: '会修机器的人',
      text: '你托人弄到一张通行条，去劳改农场拉一批便宜零件。\n修理棚里，一个剃短发的男人正用废铜线绕电机。他叫陆行舟，别人都叫他“二哥”。\n他抬头看你，手上全是机油：“外面的人现在敢进来了？”\n系统提示：\n【隐藏人物：陆行舟。技能：机械维修。好感达标后可解锁“乡镇工厂”路线。】',
      choices: [
        { label: '递烟，蹲下帮他绕电机', hint: '陆行舟 +15，系统 +1', eff: { rel: { zhou: 15 }, stats: { sys: 1, risk: 2 }, flags: { knowZhou: true } }, next: 'shop' },
        { label: '直接谈零件生意', hint: '现金 +20，陆行舟 +4', eff: { stats: { money: 20, risk: 4 }, rel: { zhou: 4 } }, next: 'shop' },
        { label: '问他为什么被关进来', hint: '线索 +1，陆行舟 -3', eff: { rel: { zhou: -3 }, stats: { rep: 1 }, flags: { zhouStory: true } }, next: 'shop' }
      ]
    },
    shop: {
      chapter: '第三周 · 裁缝铺', place: '阿满裁缝铺', title: '缝纫机下的秘密',
      text: '阿满的裁缝铺只有半间门面，缝纫机却擦得发亮。\n他一边踩踏板一边说：“哥，县百货大楼下个月进电视机，要票。你有路子吗？”\n你看见他桌下压着一封信，信封上是南边特区的地址。\n系统提示：\n【支线：阿满的哥哥。选择是否追问。】',
      choices: [
        { label: '问阿满，信是谁寄的', hint: '阿满 +10，线索 +1', eff: { rel: { man: 10 }, stats: { luck: 3 }, flags: { letter: true } }, next: 'flood' },
        { label: '不问，先帮他改进裁缝铺', hint: '阿满 +15，现金 -10，声望 +4', eff: { rel: { man: 15 }, stats: { money: -10, rep: 4 }, flags: { shopUpgrade: true } }, next: 'flood' },
        { label: '拿信去问顾卫东', hint: '顾卫东 +6，阿满 -8', eff: { rel: { wei: 6, man: -8 }, flags: { weiKnows: true } }, next: 'flood' }
      ]
    },
    flood: {
      chapter: '第四周 · 洪水', place: '镇集市', title: '河堤决口那夜',
      text: '连下三天暴雨，河堤决口。镇上的仓库全泡在水里。\n顾卫东组织知青扛沙袋，陆行舟从农场跑出来修抽水机，阿满把布料顶在头上往高处搬。\n系统提示：\n【灾难事件：救人 or 救货？选择将决定声望与三位关系。】',
      choices: [
        { label: '先救顾卫东，他被水冲倒了', hint: '顾卫东 +25，货物 -5', eff: { rel: { wei: 25 }, stats: { rep: 6, money: -8 }, flags: { savedWei: true } }, next: 'factory' },
        { label: '先拉陆行舟的抽水机，保住全镇', hint: '陆行舟 +25，声望 +10', eff: { rel: { zhou: 25 }, stats: { rep: 10, money: -4 }, flags: { savedPump: true } }, next: 'factory' },
        { label: '先帮阿满抢布料，他快被水冲走', hint: '阿满 +25，现金 -6', eff: { rel: { man: 25 }, stats: { money: -6, rep: 3 }, flags: { savedMan: true } }, next: 'factory' }
      ]
    },
    factory: {
      chapter: '第五周 · 乡镇工厂', place: '县百货大楼', title: '第一份承包合同',
      text: '洪水退后，镇办工厂倒闭了一半。\n陆行舟把一台修好的电机推到你面前：“你出钱，我出技术，咱们把厂子承包下来。”\n顾卫东拿来一份合同，条款密密麻麻。阿满把新做的工装抖开，胸口绣着厂名。\n系统提示：\n【终局前置：选择合伙人。资金需 200 元。】',
      choices: [
        { label: '和陆行舟签技术承包，办机械厂', hint: '陆行舟 +20，系统 +2', eff: { rel: { zhou: 20 }, stats: { sys: 2, money: -40, rep: 5 }, flags: { factory: true, partnerZhou: true } }, next: 'finale' },
        { label: '和顾卫东签集体承包，稳扎稳打', hint: '顾卫东 +20，声望 +10', eff: { rel: { wei: 20 }, stats: { rep: 10, money: -30 }, flags: { factory: true, partnerWei: true } }, next: 'finale' },
        { label: '和阿满开服装厂，做南边订单', hint: '阿满 +20，现金 +10', eff: { rel: { man: 20 }, stats: { money: 10, rep: 4 }, flags: { factory: true, partnerMan: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 1985', place: '县百货大楼', title: '第一批万元户',
      text: '两年后，你的厂子成了县里第一个万元户。\n顾卫东在账本上写下最后一笔，陆行舟把新电机装上车，阿满在门口放了一挂鞭炮。\n系统最后一次亮起：\n【主线完成。奖励：选择一个人，陪你把日子过下去。】',
      choices: [
        { label: '握住顾卫东的手，把账本交给他', hint: '顾卫东结局', eff: { rel: { wei: 30 }, flags: { endWei: true } }, next: 'end' },
        { label: '和陆行舟去南边开分厂', hint: '陆行舟结局', eff: { rel: { zhou: 30 }, flags: { endZhou: true } }, next: 'end' },
        { label: '把阿满的裁缝铺做成品牌', hint: '阿满结局', eff: { rel: { man: 30 }, flags: { endMan: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '县城', title: '日子还长', text: '鞭炮声停了。', choices: [] }
  },
  events: [
    { id: 'policy', title: '广播里又出新政策', if: function (s) { return s.day >= 2; }, text: '收音机说，个体户可以带徒弟了。系统提示：可扩张。', eff: { stats: { sys: 1, luck: 4 } } },
    { id: 'redhat', title: '戴红袖章的来了', if: function (s) { return s.stats.risk >= 10; }, text: '市管会的人站在摊前，翻了翻你的营业执照。顾卫东替你递了根烟。', eff: { stats: { risk: -4, rep: 2 }, rel: { wei: 4 } } },
    { id: 'zhou_visit', title: '陆行舟翻墙来找你', if: function (s) { return s.rel.zhou >= 30; }, text: '陆行舟翻墙进来，裤脚全是泥，手里提着一台修好的录音机：“给你听个新鲜。”', eff: { rel: { zhou: 8 }, addItems: [{ id: 'radio', qty: 1 }] } },
    { id: 'man_fever', title: '阿满发烧了', if: function (s) { return s.rel.man >= 30; }, text: '阿满趴在缝纫机上睡着，额头滚烫，手里还攥着给你的衬衫。', eff: { rel: { man: 8 }, stats: { money: -5 } } },
    { id: 'wei_letter', title: '顾卫东收到回城通知', if: function (s) { return s.rel.wei >= 40; }, text: '顾卫东把回城通知压在书下，没提。你看见他半夜一个人坐在院子里抽烟。', eff: { rel: { wei: 5 }, stats: { luck: -2 } } },
    { id: 'system_hack', title: '系统出现乱码', if: function (s) { return s.stats.sys >= 5; }, text: '系统面板闪了几下，浮出一行不属于 1983 年的字：“别忘了你从哪来。”', eff: { stats: { sys: 1, risk: 3 } } }
  ],
  endings: [
    { id: 'wei', title: '账本上的两个人', if: function (s) { return s.flags.endWei; }, text: '你和顾卫东把厂子交给镇里，自己开了家会计事务所。\n他打算盘，你泡茶。每年春天，他都会把那副旧眼镜擦一遍，说：“当年你胆子真大。”' },
    { id: 'zhou', title: '南下的火车', if: function (s) { return s.flags.endZhou; }, text: '你和陆行舟坐上南下的绿皮火车。他把装着全部家当的帆布包垫在你腰后。\n车窗外，1985 年的田野一片金黄。' },
    { id: 'man', title: '裁缝铺的灯', if: function (s) { return s.flags.endMan; }, text: '阿满的裁缝铺变成县城第一家服装店。\n他给你做了这辈子第一套西装，袖口绣着两个人的名字。\n他说，哥，以后不让你再摆摊了。' },
    { id: 'risk', title: '没收清单', if: function (s) { return s.stats.risk >= 90; }, text: '仓库被贴了封条。你站在门口，看着一箱箱电子表被搬上车。\n顾卫东、陆行舟、阿满都来了，谁都没说话。\n系统在眼前闪了一下：本局结束。' }
  ],
  nexusLinks: [
    { label: '学习：个体户经营与政策', kind: '学习', target: 'learn' },
    { label: '物品：1983 年票证与商品', kind: '物品', target: 'items' },
    { label: '人物：顾卫东 / 陆行舟 / 阿满', kind: '人物档案', target: 'species' }
  ]
};
