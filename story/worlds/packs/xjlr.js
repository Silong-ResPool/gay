/* 世界：星际旅人 / ARK·TALOS · 原人物与世界观恢复版 */
window.SL_PACK = {
  id: 'xjlr', title: '星际旅人', subtitle: 'ARK · TALOS · 深空记忆',
  kicker: 'ARK · TALOS', theme: 'space', layout: 'cinema', modeLabel: '深空探索', mode: 'space',
  accent: '#ddd6fe', accent2: '#a78bfa', bg: '#0d0412', bg2: '#130b28',
  cover: '../../assets/ui/world_xjlr.jpg', turnsPerDay: 5, eventChance: 0.36,
  freePlaceholder: '自由行动：检查舱室 / 修复舰体 / 找虺夜 / 问黎铭 / 去生态舱 / 听录音 / 看星图',
  bgm: [
    { id: 'deep', name: '深空漂流', mood: 'daily', tempo: 58, scale: 'minor', lead: 'synth', pad: 'space' },
    { id: 'warp', name: '曲率警报', mood: 'tense', tempo: 108, scale: 'phrygian', lead: 'lowStrings', pad: 'pulse' },
    { id: 'home', name: '地球旧日光', mood: 'hope', tempo: 70, scale: 'major', lead: 'piano', pad: 'warm' },
    { id: 'void', name: '塔洛斯暗面', mood: 'horror', tempo: 64, scale: 'minor', lead: 'choir', pad: 'dark' }
  ],
  stats: [
    { key: 'hp', label: '生命', init: 100, max: 100, danger: true },
    { key: 'sanity', label: '理智', init: 72, max: 100, danger: true },
    { key: 'bio', label: '生物质', init: 6, max: 100 },
    { key: 'trust', label: '舰员信任', init: 10, max: 100 }
  ],
  relations: [
    { key: 'huiye', name: '虺夜', role: '塔洛斯王子 · 暗影操控者', init: 18, max: 100 },
    { key: 'liming', name: '黎铭', role: '时空波动 · 能力复制', init: 12, max: 100 },
    { key: 'katz', name: '卡茨', role: '塔洛斯原住民 · 植物操控', init: 8, max: 100 },
    { key: 'gujingchuan', name: '顾景川', role: '地球幸存者 · 防御力场', init: 20, max: 100 }
  ],
  items: {
    sample: { name: '黎渊的生物样本', desc: '一管在零重力下缓慢分层的血，底层泛着不属于人类的蓝。', tags: ['研究', '身份'], icon: '样' },
    chart: { name: '塔洛斯星图碎片', desc: '边缘被烧掉一块，只剩通往地表的旧航线。', tags: ['导航', '关键'], icon: '图' },
    record: { name: '黎铭的录音', desc: '只有一句：“你第三次醒来时，别相信船上的日历。”', tags: ['线索'], icon: '录' },
    iris: { name: '虹膜密钥', desc: '能打开舰桥最下层那扇没有编号的门。', tags: ['权限', '危险'], icon: '钥' },
    seed: { name: '卡茨的种子', desc: '塔洛斯原生植物的休眠种，遇水会在一分钟内发芽。', tags: ['植物', '生命'], icon: '种' },
    coat: { name: '顾景川的旧外套', desc: '左肩有烧穿后缝补的痕迹，口袋里还装着地球的土壤。', tags: ['信物', '地球'], icon: '衣' }
  },
  startItems: [{ id: 'sample', qty: 1 }, { id: 'coat', qty: 1 }],
  skills: [{ id: 'shapeshift', name: '不朽变形' }, { id: 'bio', name: '生物解析' }, { id: 'calm', name: '零重力适应' }],
  rules: [
    { text: '舰上的日历不可信；如果你记得同一天两次，先去医务舱核对血样。', code: 'ARK-01' },
    { text: '不要在塔洛斯地表叫出真名，暗影会顺着名字找到你。', code: 'TALOS-02' },
    { text: '黎铭的复制能力只能维持七分钟；超过七分钟，他会开始复制你的痛觉。', code: 'ARK-03' },
    { text: '顾景川的力场挡不住自己人从背后开的枪。', code: 'ARK-04' },
    { text: '第三扇生态舱的门永远不要同时打开；里面不是同一个生态。', code: 'TALOS-05' }
  ],
  places: [
    { name: '苏醒舱', desc: '你第三次醒来的地方', unlocked: true },
    { name: '舰桥', desc: '星图与舰长权限', unlocked: true },
    { name: '生态舱', desc: '卡茨种下的塔洛斯植物', unlocked: true },
    { name: '暗影舱', desc: '虺夜被关押的底层', unlocked: false },
    { name: '记忆回廊', desc: '黎铭复制出来的旧日地球', unlocked: false },
    { name: '塔洛斯地表', desc: '九千丈深空下的原住民废墟', unlocked: false }
  ],
  freeActions: [
    { keys: ['检查', '舱室', '巡逻'], text: '你沿着环形走廊检查每一扇气密门。第三扇门内侧有新鲜爪痕，像是有人从里面想出来。', eff: { stats: { sanity: -3, trust: 4 } } },
    { keys: ['修复', '舰体', '维修'], text: '你钻进舰体夹层，用生物凝胶封住裂缝。船身安静下来，像一头终于停止抽搐的兽。', eff: { stats: { hp: 8, trust: 5 } } },
    { keys: ['虺夜', '暗影', '交谈'], text: '虺夜从暗处显形，指尖抵在你颈侧：“你身上有第三次醒来的味道。”他没有收手，也没有更进一步。', eff: { rel: { huiye: 8 }, stats: { sanity: -2 } } },
    { keys: ['黎铭', '录音', '记忆'], text: '黎铭把录音放完，盯着你的脸：“你信我吗？哪怕只信七分钟。”', eff: { rel: { liming: 8 }, flags: { trustLiming: true } } },
    { keys: ['生态舱', '卡茨', '植物'], text: '卡茨把一粒种子按进你掌心，藤蔓立刻缠上手腕，又温顺地退回去。', eff: { rel: { katz: 7 }, stats: { bio: 3 }, addItems: [{ id: 'seed', qty: 1 }] } },
    { keys: ['顾景川', '地球', '旧外套'], text: '顾景川替你披上外套，手掌在你后背停了一秒：“别死在这里。地球还有人等你。”', eff: { rel: { gujingchuan: 8 }, stats: { sanity: 4 } } }
  ],
  start: 'wake',
  scenes: {
    wake: {
      chapter: '第一记忆 · 苏醒', place: '苏醒舱', title: '第三次睁眼',
      text: '你在一阵低频震动里醒来。\n舷窗外是塔洛斯的紫色大气，像一只巨大的眼睛贴在玻璃上。\n舰载系统说这是你第一次醒。可你的手指记得如何打开床边那只锁——你已经开过两次。\n门被推开，顾景川站在逆光里，手里拿着你的旧外套。\n“黎渊，”他说，“你终于回来了。”',
      choices: [
        { label: '先问顾景川，船上过去了多久', hint: '理智 +4，顾景川 +8', eff: { stats: { sanity: 4 }, rel: { gujingchuan: 8 }, flags: { askedTime: true } }, next: 'bridge' },
        { label: '不回答，检查自己的生物样本', hint: '生物质 +3，发现异常', eff: { stats: { bio: 3 }, flags: { sampleAbnormal: true } }, next: 'bridge' },
        { label: '跟着记忆走向舰桥，先看星图', hint: '信任 +5，线索', eff: { stats: { trust: 5 }, flags: { sawChart: true } }, next: 'bridge' }
      ]
    },
    bridge: {
      chapter: '第二记忆 · 舰桥', place: '舰桥', title: '没有编号的门',
      text: '舰桥的主屏亮着一张被烧掉边角的星图。\n航线终点不是地球，是塔洛斯地表的一座旧城。\n黎铭坐在舵手位，手指在空气里敲出七下一组的节拍。他抬头看你，像在看一个不该出现的人。\n“你来得太早了。”他说，“或者说，太晚了。”\n舰桥最下层有一扇没有编号的门，虹膜锁亮着微光。',
      choices: [
        { label: '把虹膜密钥插进去，打开那扇门', hint: '危险 +8，进入暗影舱', eff: { stats: { sanity: -4 }, addItems: [{ id: 'iris', qty: 1 }], flags: { openedDoor: true } }, next: 'dark' },
        { label: '先让黎铭解释“太早”是什么意思', hint: '黎铭 +10，真相', eff: { rel: { liming: 10 }, flags: { limingTruth: true } }, next: 'eco' },
        { label: '召集舰员，公开星图终点', hint: '信任 +10，可能引发恐慌', eff: { stats: { trust: 10, sanity: -3 }, flags: { toldCrew: true } }, next: 'eco' }
      ]
    },
    eco: {
      chapter: '第三记忆 · 生态舱', place: '生态舱', title: '塔洛斯的根',
      text: '生态舱里下着不存在的雨。\n卡茨蹲在藤架下，手指插进泥土，整片植物随他的呼吸起伏。\n“它们记得你。”他说，“上一次你来的时候，带走了这里一半的根。”\n藤蔓从墙后探出来，缠住你的脚踝，不紧，却也不放。\n顾景川在门外敲了敲玻璃，示意你出来。',
      choices: [
        { label: '蹲下去，让卡茨教你听懂植物', hint: '卡茨 +12，生物质 +4', eff: { stats: { bio: 4 }, rel: { katz: 12 }, flags: { heardPlants: true } }, next: 'memory' },
        { label: '挣开藤蔓，跟顾景川离开', hint: '顾景川 +8，卡茨 -4', eff: { rel: { gujingchuan: 8, katz: -4 }, flags: { leftEco: true } }, next: 'memory' },
        { label: '摘下那粒休眠种，藏进衣袋', hint: '获得种子，危险 +4', eff: { addItems: [{ id: 'seed', qty: 1 }], stats: { sanity: -2 }, rel: { katz: 4 } }, next: 'memory' }
      ]
    },
    memory: {
      chapter: '第四记忆 · 记忆回廊', place: '记忆回廊', title: '黎铭的七分钟',
      text: '黎铭把你带进一条不在舰体图纸上的走廊。\n两侧的墙壁映出地球的旧日光：学校的走廊、雨后的操场、你第一次见到顾景川的医院。\n“这些是我复制出来的记忆。”黎铭说，“不是你的，是我的。”\n他抬起手，掌心浮着与你一模一样的指纹。\n“七分钟后，我会开始复制你的痛觉。你要在七分钟里决定，信不信我。”',
      choices: [
        { label: '握住他的手，让他复制你的记忆', hint: '黎铭 +16，理智 -6', eff: { rel: { liming: 16 }, stats: { sanity: -6 }, flags: { copied: true } }, next: 'dark' },
        { label: '问他，为什么船上的日历是假的', hint: '真相，黎铭 +10', eff: { rel: { liming: 10 }, flags: { calendarTruth: true } }, next: 'dark' },
        { label: '关掉回廊，带他去舰桥对峙', hint: '信任 +8，危险 +4', eff: { stats: { trust: 8, sanity: -3 }, rel: { liming: 4 }, flags: { confront: true } }, next: 'dark' }
      ]
    },
    dark: {
      chapter: '第五记忆 · 暗影舱', place: '暗影舱', title: '塔洛斯的王子',
      text: '暗影舱没有灯。\n虺夜坐在唯一一束光里，脚边盘着一团会呼吸的黑。\n他抬眼，暗影从墙上立起来，像一群安静的蛇。\n“你终于来见我了。”他说，“上一次，你把我留在这里，自己回了地球。”\n你听见自己的心跳。他笑了笑，指尖勾住你的衣领：“这次呢？还走吗？”',
      choices: [
        { label: '俯身替他解开锁链，留在暗影里', hint: '虺夜 +18，理智 -4', eff: { rel: { huiye: 18 }, stats: { sanity: -4, trust: -4 }, flags: { freedHuiye: true } }, next: 'surface' },
        { label: '先问他，地球的记忆是谁改的', hint: '真相，虺夜 +10', eff: { rel: { huiye: 10 }, flags: { huiyeTruth: true } }, next: 'surface' },
        { label: '把虹膜密钥交给他，换舰员安全', hint: '信任 +8，虺夜 +6', eff: { stats: { trust: 8 }, rel: { huiye: 6 }, flags: { tradedKey: true } }, next: 'surface' }
      ]
    },
    surface: {
      chapter: '第六记忆 · 塔洛斯地表', place: '塔洛斯地表', title: '旧城的门',
      text: '穿梭舱落在塔洛斯地表。\n旧城的门比舰体还高，门楣上刻着与虺夜颈侧一样的纹。\n卡茨的藤蔓从地底钻出，替你铺出一条没有机关的路。顾景川的力场在背后展开，挡住第一波暗影。\n黎铭站在门前，七分钟倒计时在他手背上跳动。\n“进去以后，”他说，“你会想起自己为什么第三次醒来。”',
      choices: [
        { label: '推开旧城门，带着所有人一起进去', hint: '终局 · 共同记忆', eff: { stats: { trust: 12 }, rel: { huiye: 8, liming: 8, katz: 8, gujingchuan: 8 }, flags: { enterCity: true } }, next: 'finale' },
        { label: '让顾景川留下守穿梭舱，你和虺夜进去', hint: '终局 · 暗影线', eff: { rel: { huiye: 16, gujingchuan: 4 }, flags: { shadowPath: true } }, next: 'finale' },
        { label: '用卡茨的种子唤醒旧城根系', hint: '终局 · 生命线', eff: { stats: { bio: 10 }, rel: { katz: 14 }, flags: { greenPath: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 深空', place: '塔洛斯地表', title: '第四次醒来',
      text: '旧城在你们身后缓缓睁开。\n不是眼睛，是一整片会发光的根。它们穿过街道、墙壁与你们脚下的尘土，把整座城托起来。\n虺夜的暗影伏在根须间，黎铭的倒计时停在 00:07，顾景川的力场像一层薄光罩住所有人。\n你终于想起：你不是第一次来这里。\n你是这座城用来记住地球的最后一个容器。',
      choices: [
        { label: '留在塔洛斯，和虺夜一起守住旧城', hint: '结局 · 暗面共治', eff: { rel: { huiye: 25 }, flags: { stayTalos: true } }, next: 'end' },
        { label: '带着所有人回地球，把记忆写下来', hint: '结局 · 归途', eff: { stats: { sanity: 10 }, rel: { gujingchuan: 15, liming: 8 }, flags: { returnEarth: true } }, next: 'end' },
        { label: '让卡茨的根覆盖旧城，自己进入第四次沉睡', hint: '结局 · 生物容器', eff: { stats: { bio: 20 }, rel: { katz: 15 }, flags: { sleepAgain: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '塔洛斯地表', title: '星海之间', text: '旧城的光从地表一直亮到深空。', choices: [] }
  },
  events: [
    { id: 'calendar', title: '日历跳过一天', if: function (s) { return s.day >= 2; }, text: '舰载日历从第 3 天直接跳到第 5 天。医务舱的血样却显示只过了一夜。', eff: { stats: { sanity: -5 }, flags: { calendarClue: true } } },
    { id: 'shadow', title: '暗影爬过舷窗', if: function (s) { return s.stats.sanity <= 65; }, text: '一群没有形状的黑从舷窗外爬过，在玻璃上留下像手指的水痕。虺夜站在你身后，没有出声。', eff: { stats: { sanity: -4 }, rel: { huiye: 5 } } },
    { id: 'liming7', title: '七分钟到了', if: function (s) { return s.rel.liming >= 30; }, text: '黎铭突然蹲下去，按住自己的手腕。七分钟到了，他开始替你疼。', eff: { stats: { hp: -4 }, rel: { liming: 10 } } },
    { id: 'garden', title: '生态舱开花', if: function (s) { return s.rel.katz >= 25; }, text: '卡茨种下的花在夜里开了。每一朵都朝着你的方向，像一群安静的眼睛。', eff: { stats: { bio: 5 }, rel: { katz: 6 } } },
    { id: 'earth', title: '地球频道', if: function (s) { return s.rel.gujingchuan >= 30; }, text: '废弃的地球频道忽然传来一段天气预报，播报员的声音像顾景川。', eff: { stats: { sanity: 4 }, rel: { gujingchuan: 6 } } }
  ],
  endings: [
    { id: 'talos', title: '塔洛斯共治', if: function (s) { return s.flags.stayTalos; }, text: '你留在了塔洛斯。旧城的根须穿过王座，虺夜坐在你身侧，暗影替他披上一件没有重量的王袍。\n地球的频道偶尔还会传来声音，但你已经不再需要回去。\n“这一次，”虺夜说，“你选了我。”' },
    { id: 'earth', title: '回到地球', if: function (s) { return s.flags.returnEarth; }, text: '穿梭舱穿过紫色大气时，顾景川把旧外套披在你肩上。\n黎铭在日志里写下最后一次记录：第四次醒来，目的地地球。\n卡茨的种子在舱里发芽，藤蔓绕住所有人的手腕，像一条回家的路。' },
    { id: 'sleep', title: '第五次沉睡', if: function (s) { return s.flags.sleepAgain; }, text: '你躺进旧城最深的根里，卡茨替你盖上植物织成的被。\n虺夜守在入口，黎铭把七分钟调成永久，顾景川在舱外等你。\n你闭上眼。塔洛斯的星图在你梦里重新亮起。' },
    { id: 'lost', title: '深空无名', if: function (s) { return s.stats.sanity <= 15 || s.stats.hp <= 15; }, text: '暗影爬满舰桥时，你听见自己的名字被拆成很多段。\n顾景川的力场最后闪了一下。\n塔洛斯的旧城多了一盏灯，没有人知道它为什么一直亮着。' }
  ],
  nexusLinks: [
    { label: '法则：深空记忆守恒', kind: '宇宙法则', target: 'law' },
    { label: '规则：ARK 舰上守则', kind: '规则系', target: 'rules' },
    { label: '人物：黎渊 / 虺夜 / 黎铭', kind: '人物', target: 'chars' }
  ]
};
