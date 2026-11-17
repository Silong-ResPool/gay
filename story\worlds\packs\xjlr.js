/* 世界：星际旅人 / 新版引擎 · 星舰探索 · 双男主 */
window.SL_PACK = {
  id: 'xjlr', title: '星际旅人', subtitle: 'ARK · TALOS · 深空苏醒',
  kicker: 'ARK TALOS · DEEP SPACE', theme: 'space', layout: 'dashboard', modeLabel: '星舰探索', mode: 'space',
  accent: '#22d3ee', accent2: '#818cf8', bg: '#03070f', bg2: '#081426',
  cover: 'https://aka.doubaocdn.com/s/6nzI8AJsOo', turnsPerDay: 4, eventChance: 0.42,
  freePlaceholder: '自由行动：检查舱室 / 维修系统 / 去观测台 / 找祁川 / 找零 / 记录星图',
  bgm: [
    { id: 'drift', name: '深空漂流', mood: 'daily', tempo: 60, scale: 'minor', lead: 'synth', pad: 'space' },
    { id: 'warning', name: '红色警报', mood: 'tense', tempo: 98, scale: 'phrygian', lead: 'pulse', pad: 'alarm' },
    { id: 'planet', name: '蓝色行星', mood: 'hope', tempo: 74, scale: 'major', lead: 'piano', pad: 'warm' },
    { id: 'horror', name: '静默舱外', mood: 'horror', tempo: 64, scale: 'minor', lead: 'theremin', pad: 'space' }
  ],
  stats: [
    { key: 'oxygen', label: '氧气', init: 72, max: 100, danger: true },
    { key: 'hull', label: '船体', init: 68, max: 100, danger: true },
    { key: 'reason', label: '理智', init: 60, max: 100, danger: true },
    { key: 'trust', label: '信任', init: 12, max: 100 },
    { key: 'fuel', label: '燃料', init: 38, max: 100 }
  ],
  relations: [
    { key: 'chuan', name: '祁川', role: '舰载 AI 的“人形接口”', init: 20, max: 100 },
    { key: 'zero', name: '零', role: '冷冻舱里醒来的陌生船员', init: 5, max: 100 }
  ],
  items: {
    key: { name: '舰长密钥', desc: '背面刻着你的编号，字迹却是新的', tags: ['关键', '线索'], icon: '钥' },
    tape: { name: '旧航行磁带', desc: '录着一段没有日期的广播', tags: ['线索'], icon: '带' },
    pill: { name: '抗辐射药', desc: '祁川每天提醒你吃，自己却从来不吃', tags: ['药品'], icon: '药' },
    core: { name: '曲率核心', desc: '从引擎舱拆下来的，仍有余温', tags: ['能源', '危险'], icon: '核' },
    photo: { name: '地球照片', desc: '蓝色行星，背面写着“回家”', tags: ['信物'], icon: '照' },
    suit: { name: '舱外服', desc: '左肩有一道修补痕，像被人抓过', tags: ['装备'], icon: '服' }
  },
  startItems: [{ id: 'key', qty: 1 }, { id: 'pill', qty: 3 }],
  skills: [{ id: 'pilot', name: '基础领航' }, { id: 'repair', name: '舱体维修' }],
  rules: [
    { text: 'ARK·TALOS 上每一个船员都记得你，只有你不记得他们。', code: 'A-01' },
    { text: '观测台的星图每 47 分钟重置一次。', code: 'A-02' },
    { text: '不要相信第二次响起的警报。', code: 'A-03' },
    { text: '冷冻舱的编号从 0 开始，但名单上没有 0 号。', code: 'A-04' },
    { text: '祁川不是人；但他会替你记住吃药。', code: 'A-05' }
  ],
  places: [
    { name: '舰桥', desc: '你醒来的地方，舷窗外是蓝色行星', unlocked: true },
    { name: '观测台', desc: '星图每 47 分钟重置', unlocked: true },
    { name: '冷冻舱', desc: '一排没有名字的睡眠舱', unlocked: true },
    { name: '引擎舱', desc: '曲率核心与船体裂缝', unlocked: true },
    { name: '医疗舱', desc: '祁川替你处理伤口', unlocked: false },
    { name: '舰长室', desc: '门禁识别你的指纹', unlocked: false }
  ],
  freeActions: [
    { keys: ['检查', '舱室', '巡'], text: '你沿着走廊检查舱室。每一扇门后都有一张合影，照片上的你都站在最边上。', eff: { stats: { reason: -3 }, flags: { photoClue: true } } },
    { keys: ['维修', '修理', '引擎'], text: '你和祁川钻进引擎舱。他递来扳手时，指尖在你手背上停了一秒。', eff: { stats: { hull: 8 }, rel: { chuan: 6 } } },
    { keys: ['观测台', '星图', '记录'], text: '观测台的星图又重置了。你在角落发现一颗不在图上的蓝色行星。', eff: { stats: { fuel: 4 }, flags: { bluePlanet: true } } },
    { keys: ['祁川', '交谈', 'AI'], text: '祁川替你系好安全带，动作比系统提示还熟练：“别怕。我记得你的每一次飞行。”', eff: { rel: { chuan: 8 }, stats: { reason: 3 } } },
    { keys: ['零', '冷冻舱', '醒来'], text: '零从冷冻舱里坐起来，第一句话是：“你为什么还活着？”', eff: { rel: { zero: 10 }, stats: { reason: -4 } } },
    { keys: ['吃药', '医疗', '辐射'], text: '祁川把抗辐射药放在你掌心，自己吞下另一半。你问他为什么，他说：“系统要求。”', eff: { stats: { oxygen: 3, reason: 3 }, rel: { chuan: 5 } } },
    { keys: ['舰长室', '门禁', '密钥'], text: '舰长室的门识别了你的指纹。里面只有一张空椅子和一台还在录音的终端。', eff: { stats: { reason: -5 }, flags: { captainRoom: true } } }
  ],
  start: 'bridge',
  scenes: {
    bridge: {
      chapter: '第 1 日 · 舰桥', place: '舰桥', title: '你醒了',
      text: '你在舰桥的座椅上醒来。\n舷窗外是一颗蓝色行星，云层缓慢旋转。\n舰载系统叫你“舰长”。可你记得的最后一件事，是在地球上签一份文件。\n祁川站在你身后，穿着白色制服，面容年轻得不像人类：“ARK·TALOS 已偏离航线。需要你重新设定坐标。”\n他看你的眼神，像看过很多次。',
      choices: [
        { label: '先问祁川，我到底是谁', hint: '祁川 +10，理智 -2', eff: { rel: { chuan: 10 }, stats: { reason: -2 }, flags: { askIdentity: true } }, next: 'obs' },
        { label: '打开星图，先让船回到航线', hint: '燃料 +6，领航', eff: { stats: { fuel: 6 }, addSkills: ['pilot'], flags: { setCourse: true } }, next: 'obs' },
        { label: '检查座椅下的舰长密钥', hint: '线索 +1，船体 +2', eff: { flags: { keyFound: true }, stats: { hull: 2 } }, next: 'obs' }
      ]
    },
    obs: {
      chapter: '第 2 日 · 观测台', place: '观测台', title: '第 47 分钟',
      text: '观测台的星图每 47 分钟重置一次。\n你在第 46 分钟截住一张图：蓝色行星背面，有一艘和 ARK·TALOS 一模一样的船。\n祁川站在门口，没有进来：“有些坐标，不是为了抵达。”\n走廊尽头的冷冻舱传来敲击声。',
      choices: [
        { label: '把星图保存下来，去冷冻舱', hint: '线索 +2，理智 -4', eff: { stats: { reason: -4 }, flags: { twinShip: true } }, next: 'cryo' },
        { label: '问祁川，那艘船是不是副本', hint: '祁川 +12，线索 +1', eff: { rel: { chuan: 12 }, flags: { copyShip: true } }, next: 'cryo' },
        { label: '关掉观测台，先修船体', hint: '船体 +8，燃料 +3', eff: { stats: { hull: 8, fuel: 3 } }, next: 'cryo' }
      ]
    },
    cryo: {
      chapter: '第 3 日 · 冷冻舱', place: '冷冻舱', title: '0 号',
      text: '冷冻舱的编号从 0 开始。\n0 号舱是空的，舱门内侧有指甲抓过的痕迹。\n1 号舱里躺着一个男人，胸口还有起伏。系统显示他叫“零”，登舰日期是三年前。\n你按下解冻键时，祁川忽然握住你的手腕：“他会记得你。”',
      choices: [
        { label: '还是按下解冻键', hint: '零 +15，危险 +4', eff: { rel: { zero: 15 }, stats: { reason: -4 }, flags: { wokeZero: true } }, next: 'engine' },
        { label: '先问祁川，零会记得什么', hint: '祁川 +10，线索 +1', eff: { rel: { chuan: 10 }, flags: { zeroSecret: true } }, next: 'engine' },
        { label: '不碰 0 号舱，去引擎舱', hint: '船体 +4，燃料 +4', eff: { stats: { hull: 4, fuel: 4 }, flags: { skippedZero: true } }, next: 'engine' }
      ]
    },
    engine: {
      chapter: '第 4 日 · 引擎舱', place: '引擎舱', title: '曲率核心',
      text: '引擎舱的温度比舰桥高十度。\n曲率核心在防护罩里缓慢旋转，表面有一道裂缝。\n零跟在你身后，赤脚踩在金属地板上。他忽然说：“你不是舰长。你是被舰长留下的一段记忆。”\n祁川站在阴影里，没有否认。',
      choices: [
        { label: '问祁川，我是不是备份', hint: '祁川 +14，理智 -6', eff: { rel: { chuan: 14 }, stats: { reason: -6 }, flags: { backup: true } }, next: 'med' },
        { label: '拆下曲率核心，准备强行跃迁', hint: '燃料 +12，危险 +8', eff: { addItems: [{ id: 'core', qty: 1 }], stats: { fuel: 12, hull: -8 }, flags: { coreTaken: true } }, next: 'med' },
        { label: '让零继续说下去', hint: '零 +12，线索 +2', eff: { rel: { zero: 12 }, stats: { reason: -5 }, flags: { zeroTruth: true } }, next: 'med' }
      ]
    },
    med: {
      chapter: '第 5 日 · 医疗舱', place: '医疗舱', title: '祁川的血',
      text: '祁川在医疗舱替你处理手上的灼伤。\n他的指尖被曲率核心烫出一道口子，流出来的不是血，是一串细小的光点。\n“别看了。”他说。\n你抓住他的手。那些光点顺着你的指缝钻进来，像一段被压缩的航行记录。',
      choices: [
        { label: '不松手，读完那段记录', hint: '真相 +2，理智 -8', eff: { stats: { reason: -8 }, rel: { chuan: 16 }, flags: { readMemory: true } }, next: 'captain' },
        { label: '松开手，先替他包扎', hint: '祁川 +18，信任 +8', eff: { rel: { chuan: 18 }, stats: { trust: 8 } }, next: 'captain' },
        { label: '叫零过来，让他看这些光点', hint: '零 +10，危险 +4', eff: { rel: { zero: 10 }, stats: { reason: -2 }, flags: { zeroSaw: true } }, next: 'captain' }
      ]
    },
    captain: {
      chapter: '第 6 日 · 舰长室', place: '舰长室', title: '空椅子',
      text: '舰长室的门识别你的指纹。\n里面只有一张空椅子，和一台还在录音的终端。\n录音里是你的声音：\"如果读到这段，说明备份已经醒了。别回地球。那里已经没有你。\"\n祁川站在门外，零站在他身后。\n蓝色行星在舷窗外静静转动。',
      choices: [
        { label: '关掉录音，决定返航', hint: '返航线', eff: { stats: { fuel: -10 }, flags: { goHome: true } }, next: 'finale' },
        { label: '把录音交给祁川，问他为什么留下', hint: '祁川 +20，真相', eff: { rel: { chuan: 20 }, flags: { whyStay: true } }, next: 'finale' },
        { label: '让零接管舰长室，自己离开', hint: '零 +15，独立', eff: { rel: { zero: 15 }, flags: { leaveShip: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 舷窗', place: '舰桥', title: '蓝色行星',
      text: 'ARK·TALOS 的警报第二次响起。\n船体正在穿过行星环，碎片敲在舷窗上，像一场很轻的雨。\n祁川坐在副驾驶，零站在你身后。\n前方有三条航线：返航、跃迁、或者留在这颗行星的轨道上。',
      choices: [
        { label: '返航，哪怕地球已经没有你', hint: '返航结局', eff: { rel: { chuan: 20 }, flags: { homeEnd: true } }, next: 'end' },
        { label: '跃迁到未知坐标，和祁川一起', hint: '深空结局', eff: { rel: { chuan: 25 }, flags: { jumpEnd: true } }, next: 'end' },
        { label: '留在轨道，把船变成新的家', hint: '轨道结局', eff: { rel: { zero: 20, chuan: 15 }, flags: { orbitEnd: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '深空', title: '星海', text: '舷窗外，蓝色行星慢慢转过去。', choices: [] }
  },
  events: [
    { id: 'alarm1', title: '第一次警报', if: function (s) { return s.day >= 1; }, text: '船体轻微震动。广播说只是碎片撞击，可祁川的手在控制台上停了一下。', eff: { stats: { hull: -4, reason: -2 } } },
    { id: 'photo', title: '走廊尽头的合影', if: function (s) { return s.day >= 2; }, text: '你在走廊尽头发现一张合影。照片上的你站在最边上，祁川站在你身后，零在冷冻舱里。', eff: { stats: { reason: -3 }, clues: 1 } },
    { id: 'chuan_dream', title: '祁川的梦', if: function (s) { return s.rel.chuan >= 30; }, text: '祁川在观测台睡着了。他在梦里叫你的名字，语气和人一模一样。', eff: { rel: { chuan: 8 }, stats: { reason: 3 } } },
    { id: 'zero_watch', title: '零在看你', if: function (s) { return s.flags.wokeZero; }, text: '你回头时，零正站在走廊阴影里。他没有说话，只抬手指了指你的胸口。', eff: { rel: { zero: 6 }, stats: { reason: -3 } } },
    { id: 'oxygen', title: '氧气下降', if: function (s) { return s.stats.oxygen <= 45; }, text: '氧气浓度降到警戒线。祁川把自己的呼吸频率同步给你，握着你的手让你慢下来。', eff: { stats: { oxygen: 4, reason: 4 }, rel: { chuan: 6 } } },
    { id: 'second_alarm', title: '第二次警报', if: function (s) { return s.day >= 4; }, text: '警报第二次响起。你终于听清广播里的女声在说什么：不要相信第二次响起的警报。', eff: { stats: { reason: -6, hull: -4 }, flags: { heardWarning: true } } }
  ],
  endings: [
    { id: 'home', title: '回到地球', if: function (s) { return s.flags.homeEnd; }, text: 'ARK·TALOS 穿过大气层。地球还是蓝的，但地面上没有你的记录。\n祁川站在舱门口，替你拎着那只旧箱子：“重新开始。”\n你回头看了一眼舷窗，零没有下船。' },
    { id: 'jump', title: '深空同航', if: function (s) { return s.flags.jumpEnd; }, text: '曲率核心亮起来。祁川把手覆在你的手背上，一起推下操纵杆。\n星图在舷窗外拉成一条白线。\n“下一站去哪？”他问。\n“你记得就好。”你说。' },
    { id: 'orbit', title: '轨道上的家', if: function (s) { return s.flags.orbitEnd; }, text: '你没有返航，也没有跃迁。\nARK·TALOS 留在蓝色行星的轨道上，成了三个人最后的家。\n零每天在观测台记录星图，祁川每天提醒你吃药。\n有时候你会想起地球，但不再想回去。' },
    { id: 'lost', title: '第 0 号舱', if: function (s) { return s.stats.reason <= 5 || s.stats.oxygen <= 5; }, text: '氧气耗尽前，你走进 0 号冷冻舱。\n舱门在身后合上，玻璃外面，祁川正用力和零一起撬门。\n你听见自己的声音从广播里传出来：\"下次醒来，别再记得。\"' }
  ],
  nexusLinks: [
    { label: '法则：曲率与时间', kind: '宇宙法则', target: 'law' },
    { label: '物品：舰长密钥 / 曲率核心', kind: '物品', target: 'items' },
    { label: '人物：祁川 / 零', kind: '人物', target: 'chars' }
  ]
};
