/* 世界：潮汐孤岛 / 海岛生存 · 双男主 */
window.SL_PACK = {
  id: 'cxgd', title: '潮汐孤岛', subtitle: '海岛生存 · 潮汐历',
  kicker: 'TIDAL ISLE · SURVIVAL', theme: 'island', layout: 'dashboard', modeLabel: '生存建造', mode: 'survival',
  accent: '#2dd4bf', accent2: '#fbbf24', bg: '#031014', bg2: '#082026', cover: '../../assets/ui/world_cxgd.jpg?v=3',
  turnsPerDay: 5, eventChance: 0.4, freePlaceholder: '自由行动：取水 / 捕鱼 / 搭建庇护所 / 探索 / 和同伴交谈',
  stats: [
    { key: 'water', label: '淡水', init: 2, max: 10, danger: true },
    { key: 'food', label: '食物', init: 3, max: 10, danger: true },
    { key: 'shelter', label: '庇护所', init: 0, max: 6 },
    { key: 'signal', label: '求救信号', init: 0, max: 8 },
    { key: 'hp', label: '生命', init: 82, max: 100, danger: true },
    { key: 'sanity', label: '理智', init: 78, max: 100, danger: true }
  ],
  relations: [
    { key: 'zhou', name: '周屿', role: '失事货轮大副 · 你的同伴', init: 22, max: 100 },
    { key: 'hai', name: '海生', role: '岛上失忆的潜水员', init: 10, max: 100 }
  ],
  items: {
    coconut: { name: '青椰', desc: '能补水，也能做碗', tags: ['食物', '水源'], icon: '椰' },
    water: { name: '淡水竹筒', desc: '用棕榈叶封口，省着喝', tags: ['水源'], icon: '水' },
    mirror: { name: '信号镜', desc: '从救生艇里拆下来的', tags: ['工具', '求救'], icon: '镜' },
    spear: { name: '鱼叉', desc: '周屿用船钉磨的', tags: ['武器', '捕鱼'], icon: '叉' },
    bottle: { name: '漂流瓶', desc: '瓶塞里藏着半张海图', tags: ['线索'], icon: '瓶' }
  },
  startItems: [{ id: 'mirror', qty: 1 }, { id: 'coconut', qty: 2 }],
  skills: [{ id: 'fish', name: '潮汐捕鱼' }, { id: 'shelter', name: '棕榈搭棚' }],
  rules: [
    { text: '每天涨潮前必须回到高处，礁石之间的水道会吃人。', code: 'T-01' },
    { text: '岛上没有鸟叫的林子，不要进去。', code: 'T-02' },
    { text: '信号镜只能在晴天使用；对着船队闪三下，停两秒，再闪三下。', code: 'T-03' },
    { text: '海生不记得自己的名字，但记得沉船的航线。', code: 'T-04' },
    { text: '月圆夜，岛会往海里退一步。', code: 'T-05' }
  ],
  places: [
    { name: '白沙滩', desc: '救生艇残骸', unlocked: true },
    { name: '棕榈林', desc: '椰子与淡水', unlocked: true },
    { name: '沉船湾', desc: '货轮残骸', unlocked: true },
    { name: '海蚀洞', desc: '退潮时才出现', unlocked: false },
    { name: '灯塔遗址', desc: '整座岛最高处', unlocked: false }
  ],
  freeActions: [
    { keys: ['取水', '淡水', '水'], text: '你在棕榈叶上收集露水，装满一小筒。', eff: { stats: { water: 1, hp: -1 } } },
    { keys: ['捕鱼', '鱼', '叉'], text: '周屿教你用鱼叉在礁石缝里扎鱼，海水冷得刺骨。', eff: { stats: { food: 1, hp: -2 }, rel: { zhou: 5 } } },
    { keys: ['庇护所', '搭', '建'], text: '你用棕榈叶和船板搭起一层顶棚，夜里终于不漏风。', eff: { stats: { shelter: 1, sanity: 3 } } },
    { keys: ['探索', '找', '搜'], text: '你在潮线以上找到一只冲上岸的木箱。', eff: { stats: { signal: 1 }, addItems: [{ id: 'bottle', qty: 1 }] } },
    { keys: ['周屿', '交谈', '聊'], text: '周屿把烤好的鱼分给你，自己啃鱼头：“我欠你一条命，记着。”', eff: { rel: { zhou: 7 }, stats: { food: 1 } } },
    { keys: ['海生', '潜水员'], text: '海生盯着你看了很久，忽然说：“我见过你。在那条船上。”', eff: { rel: { hai: 8 }, stats: { sanity: -3 } } },
    { keys: ['信号', '求救'], text: '你爬上礁石，用信号镜对着海平线闪了三下。', eff: { stats: { signal: 1, sanity: 2 } } }
  ],
  start: 'beach',
  scenes: {
    beach: {
      chapter: '第 1 日 · 白沙滩', place: '白沙滩', title: '潮水把你送上岸',
      text: '你醒来时，半边脸埋在沙里。救生艇只剩一块焦黑的橡皮，货轮“潮汐号”的残骸横在远处礁石上。\n一个高个子男人正把另一名昏迷者从浪里拖上来。他叫周屿，是大副。\n被救的人醒来后只记得自己叫海生，其余的像被海水洗掉了。\n岛上没有信号，只有潮声。',
      choices: [
        { label: '先跟周屿清点救生艇物资', hint: '食物 +1，关系 +8', eff: { rel: { zhou: 8 }, stats: { food: 1, shelter: 1 }, addItems: [{ id: 'spear', qty: 1 }] }, next: 'palm' },
        { label: '照顾海生，问他记得什么', hint: '海生关系 +10，线索 +1', eff: { rel: { hai: 10 }, stats: { sanity: -2 }, flags: { haiDream: true } }, next: 'wreck' },
        { label: '沿礁石找更高处', hint: '发现灯塔方向', eff: { stats: { signal: 1, hp: -4 } }, next: 'cliff' }
      ]
    },
    palm: {
      chapter: '第 2 日 · 棕榈林', place: '棕榈林', title: '岛上有过别人',
      text: '棕榈林深处有一圈被火烤黑的石头，旁边堆着削好的鱼骨。\n周屿蹲下摸了摸灰：“火灭不超过三天。”\n你抬头，看见树干上刻着一行字：\n“别相信海生。他不是第一次上岛。”',
      choices: [
        { label: '把字迹指给周屿看', hint: '关系 +10，线索 +1', eff: { rel: { zhou: 10 }, stats: { sanity: -3 }, flags: { warning: true } }, next: 'wreck' },
        { label: '先不声张，观察海生', hint: '理智 +3，海生关系 -2', eff: { stats: { sanity: 3 }, rel: { hai: -2 }, flags: { watchHai: true } }, next: 'wreck' },
        { label: '砍下刻字树皮带走', hint: '获得线索物', eff: { addItems: [{ id: 'bottle', qty: 1 }], stats: { signal: 1 } }, next: 'cave' }
      ]
    },
    wreck: {
      chapter: '第 3 日 · 沉船湾', place: '沉船湾', title: '货轮还在呼吸',
      text: '退潮后，沉船露出半截船身。舱门里传来金属碰撞声，像有人还在里面敲。\n海生突然停下，脸色惨白：“这艘船……我开过。”\n周屿握紧鱼叉：“潮汐号三个月前就失踪了。”\n舱门上的航海日志被海水泡烂，只有一页还能读：\n“第 9 天，淡水见底。有人开始吃不该吃的东西。”',
      choices: [
        { label: '进舱搜物资和航海日志', hint: '食物 +2，线索 +2', eff: { stats: { food: 2 }, addItems: [{ id: 'water', qty: 2 }], flags: { log: true } }, next: 'cave' },
        { label: '让海生带路，找船长室', hint: '海生关系 +12，真相', eff: { rel: { hai: 12 }, stats: { sanity: -4 }, flags: { captainRoom: true } }, next: 'cave' },
        { label: '先回沙滩加固庇护所', hint: '庇护所 +2，理智 +4', eff: { stats: { shelter: 2, sanity: 4 } }, next: 'storm' }
      ]
    },
    cave: {
      chapter: '第 4 日 · 海蚀洞', place: '海蚀洞', title: '退潮后的门',
      text: '月圆夜，海水退到从未见过的低位，露出海蚀洞的入口。\n洞里有人用贝壳摆出一个箭头，指向深处。墙上刻满日期，最后一天是今天。\n海生站在洞口，声音发抖：“我每次都不记得自己怎么活下来的。”\n周屿把火把递给你：“进去，还是回灯塔？”',
      choices: [
        { label: '三个人一起进洞', hint: '关系 +10，线索 +2', eff: { rel: { zhou: 10, hai: 10 }, stats: { sanity: -5 }, flags: { caveTruth: true } }, next: 'cliff' },
        { label: '让周屿守洞口，你和海生进去', hint: '海生关系 +15，危险', eff: { rel: { hai: 15 }, stats: { hp: -8, sanity: -4 }, flags: { caveHai: true } }, next: 'cliff' },
        { label: '不进洞，去灯塔发信号', hint: '信号 +2，理智 +3', eff: { stats: { signal: 2, sanity: 3 } }, next: 'cliff' }
      ]
    },
    cliff: {
      chapter: '第 5 日 · 灯塔遗址', place: '灯塔遗址', title: '整座岛是一艘船',
      text: '灯塔只剩半截石塔，但塔顶还亮着一盏太阳能灯。\n你从塔基的锈牌上读出：这里曾是潮汐观测站，后来被改成“海难实验场”。\n海生的记忆突然回来——他是实验场的潜水员，负责把幸存者带上岛，再观察他们能活几天。\n周屿听完，鱼叉没有放下。他先看你。',
      choices: [
        { label: '把灯塔灯拆下来做信号灯', hint: '信号 +3，庇护所 -1', eff: { stats: { signal: 3, shelter: -1 }, flags: { beacon: true } }, next: 'signal' },
        { label: '让海生继续讲实验场', hint: '海生关系 +12，线索 +2', eff: { rel: { hai: 12 }, stats: { sanity: -4 }, flags: { experiment: true } }, next: 'signal' },
        { label: '先安抚周屿，承诺一起离开', hint: '周屿关系 +15', eff: { rel: { zhou: 15 }, stats: { sanity: 4 }, flags: { promise: true } }, next: 'signal' }
      ]
    },
    signal: {
      chapter: '第 6 日 · 信号', place: '灯塔遗址', title: '海平线上的船影',
      text: '信号镜闪到第三轮，海平线上终于出现一个黑点。\n周屿把最后一点淡水留给你，海生却突然抓住你的手腕：“别发。那艘船是实验场的回收船。”\n黑点越来越近。船头没有旗，只有一排白色集装箱。\n灯塔灯只剩最后一格电。',
      choices: [
        { label: '继续发信号，赌一次', hint: '逃生 +2，危险', eff: { stats: { signal: 2, sanity: -6 }, flags: { rescue: true } }, next: 'storm' },
        { label: '熄灯，带两人躲进海蚀洞', hint: '关系 +12，生存 +1', eff: { rel: { zhou: 8, hai: 12 }, stats: { sanity: 5 }, flags: { hide: true } }, next: 'storm' },
        { label: '把实验场的事写在漂流瓶里，扔进海', hint: '线索 +2，信号 +1', eff: { stats: { signal: 1 }, flags: { bottleTruth: true } }, next: 'storm' }
      ]
    },
    storm: {
      chapter: '终章前夜 · 风暴', place: '白沙滩', title: '最后一场潮',
      text: '台风在夜里登陆。海水漫过白沙滩，庇护所的棕榈叶被掀上天。\n周屿用绳子把三个人绑在灯塔基座上。海生在浪里大喊：“岛要沉了！”\n灯塔灯最后一闪，熄灭了。\n远处那艘白色回收船的探照灯，正穿过雨幕扫过来。',
      choices: [
        { label: '割断绳子，让周屿和海生先上船', hint: '牺牲/拯救', eff: { flags: { selfless: true }, rel: { zhou: 20, hai: 20 } }, next: 'end' },
        { label: '三个人一起游向回收船', hint: '逃生线', eff: { stats: { signal: 3, sanity: 5 }, flags: { together: true } }, next: 'end' },
        { label: '把灯塔灯绑在冲浪板上，制造假信号引开船', hint: '计谋线', eff: { stats: { signal: 2, sanity: -5 }, flags: { decoy: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '潮汐孤岛', title: '潮水退去', text: '天亮了。', choices: [] }
  },
  events: [
    { id: 'tide', title: '潮水提前上涨', if: function (s) { return s.day >= 1; }, text: '海水突然漫过膝盖，你丢了一半椰子才跑回高处。', eff: { stats: { food: -1, hp: -4 } } },
    { id: 'rain', title: '暴雨', if: function (s) { return s.stats.shelter <= 2; }, text: '庇护所漏得像筛子。周屿把外套盖在你头上，自己坐在雨里。', eff: { stats: { sanity: -3, hp: -3 }, rel: { zhou: 6 } } },
    { id: 'hai_memory', title: '海生又想起一个名字', if: function (s) { return s.flags.haiDream || s.rel.hai >= 30; }, text: '海生拿树枝在沙上写下一个名字，又立刻抹掉：“不是你的。”', eff: { rel: { hai: 6 }, stats: { sanity: -2 } } },
    { id: 'ship_light', title: '海上有一盏灯', if: function (s) { return s.day >= 3; }, text: '夜里海平线亮起一盏灯，停了三分钟又消失。周屿说那是回收船。', eff: { stats: { signal: 1, sanity: -2 } } },
    { id: 'fish', title: '礁石缝里有鱼', if: function (s) { return s.stats.food <= 2; }, text: '你和周屿在礁石缝里摸到一条石斑，手被划得全是血。', eff: { stats: { food: 1, hp: -3 }, rel: { zhou: 4 } } },
    { id: 'bottle', title: '漂流瓶回来了', if: function (s) { return s.day >= 4; }, text: '你扔出去的漂流瓶被浪打回脚边，瓶塞里多了一张纸条：“第三次了。”', eff: { stats: { sanity: -5 }, flags: { thirdTime: true } } }
  ],
  endings: [
    { id: 'together', title: '三个人和一艘船', if: function (s) { return s.flags.together; }, text: '你们游到回收船边，才发现船上没有实验员，只有一群同样被海难困住的人。\n周屿把最后半筒淡水传给每个人，海生负责掌舵。\n潮汐孤岛在身后沉下去，像一块被海水收走的拼图。' },
    { id: 'selfless', title: '留在灯塔的人', if: function (s) { return s.flags.selfless; }, text: '你割断自己的绳子，把周屿和海生推向救生圈。\n他们被拉上船时，灯塔基座已经被浪吞没。\n后来每个经过这片海域的船员，都会看见灯塔的位置亮一下，三短，两长。' },
    { id: 'decoy', title: '假灯塔', if: function (s) { return s.flags.decoy; }, text: '回收船追着冲浪板上的灯驶向礁石区，触礁搁浅。\n你们从另一侧划走，天亮时看见那艘白船半沉在浅滩。\n周屿说，这座岛终于吃了一次人。' },
    { id: 'madness', title: '岛的第 13 个住客', if: function (s) { return s.stats.sanity <= 10; }, text: '你开始在树干上刻日期，刻完又忘了。\n海生说，每个人上岛后都会变成第 13 个住客。\n你抬头，看见沙滩上站着另一个自己，正朝海里走去。' }
  ],
  nexusLinks: [
    { label: '食材：海藻与贝类毒性', kind: '食材', target: 'food' },
    { label: '物品：信号镜制作', kind: '物品', target: 'items' },
    { label: '规则：潮汐禁忌', kind: '规则系', target: 'rules' }
  ]
};
