/* 世界：战国·妖神录 / 霜见京 · 原人物与世界观恢复版 */
window.SL_PACK = {
  id: 'zgysl', title: '战国·妖神录', subtitle: '昭元三年 · 霜见京',
  kicker: 'SENGOKU · YOKAI', theme: 'xianxia', layout: 'cinema', modeLabel: '守棠人 · 妖神录', mode: 'yokai',
  accent: '#e0b15a', accent2: '#9f1239', bg: '#0b0805', bg2: '#1a1210',
  cover: '../../assets/ui/world_zgysl.jpg', turnsPerDay: 5, eventChance: 0.38,
  freePlaceholder: '自由行动：回府 / 去议事厅 / 巡西坊 / 找燎 / 问长明 / 下归墟 / 看封印',
  bgm: [
    { id: 'snow', name: '霜见京的雨', mood: 'daily', tempo: 62, scale: 'pentatonic', lead: 'guqin', pad: 'warm' },
    { id: 'banquet', name: '妖市夜宴', mood: 'tense', tempo: 92, scale: 'minor', lead: 'pipa', pad: 'dark' },
    { id: 'tree', name: '棠树之下', mood: 'romance', tempo: 70, scale: 'dorian', lead: 'dizi', pad: 'soft' },
    { id: 'seal', name: '九千丈封印', mood: 'horror', tempo: 56, scale: 'phrygian', lead: 'lowStrings', pad: 'dark' }
  ],
  stats: [
    { key: 'hp', label: '气血', init: 100, max: 100, danger: true },
    { key: 'xin', label: '心念', init: 40, max: 100 },
    { key: 'feng', label: '锋刃', init: 20, max: 100 },
    { key: 'yao', label: '妖力', init: 5, max: 100, danger: true }
  ],
  relations: [
    { key: 'liao', name: '神乐·燎', role: '神乐家次子 · 掌妖兵', init: 10, max: 100 },
    { key: 'chomei', name: '长明', role: '青铜灯器灵 · 等你回家', init: 24, max: 100 },
    { key: 'nagi', name: '奈岐', role: '天外古蛇神 · 镇缝者', init: 8, max: 100 },
    { key: 'shirai', name: '白芨', role: '灰狼妖 · 青婆婆赎出', init: 14, max: 100 },
    { key: 'aoi', name: '青婆婆', role: '八百年槐妖 · 归墟守夜人', init: 6, max: 100 }
  ],
  items: {
    zhaoye: { name: '照夜', desc: '父亲留下的佩剑。剑鞘内侧刻着“守棠人”三个字。', tags: ['武器', '信物', '关键'], icon: '剑' },
    jingshi: { name: '斩妖令', desc: '神乐家的令牌，见令如见城守。对妖物有压制。', tags: ['权力', '关键'], icon: '令' },
    doupeng: { name: '旧斗篷', desc: '从霜见京带回来的斗篷，领口还沾着三年未散的药味。', tags: ['防具', '旧物'], icon: '篷' },
    huaizhi: { name: '青婆婆的槐枝', desc: '一枝还活着的槐，断口会渗出温热的汁。', tags: ['妖物', '信物'], icon: '枝' },
    linpian: { name: '奈岐的鳞片', desc: '一片温凉的蛇鳞，贴近皮肤时能听见很远的水声。', tags: ['神物', '关键'], icon: '鳞' },
    deng: { name: '长明的青铜灯', desc: '灯芯不需要油，照的是骨头里的东西。', tags: ['照明', '器灵'], icon: '灯' }
  },
  startItems: [{ id: 'zhaoye', qty: 1 }, { id: 'jingshi', qty: 1 }, { id: 'doupeng', qty: 1 }],
  skills: [{ id: 'sword', name: '照夜剑式' }, { id: 'seal', name: '守棠印' }, { id: 'yokai', name: '听妖' }],
  rules: [
    { text: '守棠人不得在棠树下说谎；树会替你说出真话。', code: 'S-01' },
    { text: '九千丈封印每十九年松一次，必须用守棠人的血喂它。', code: 'S-02' },
    { text: '斩妖令只对“有名之妖”有效；没有名字的东西，令会失效。', code: 'S-03' },
    { text: '归墟的灯灭时，不要回头；回头的人会被当作祭品。', code: 'S-04' },
    { text: '神乐家的次子掌妖兵，但妖兵只认血，不认姓。', code: 'S-05' }
  ],
  places: [
    { name: '落星谷', desc: '你从霜见京回来的地方', unlocked: true },
    { name: '神乐府', desc: '父亲、燎与雨宫澪所在', unlocked: true },
    { name: '议事厅', desc: '裁军与粮饷的争论', unlocked: true },
    { name: '西坊', desc: '妖物与人的混居街', unlocked: true },
    { name: '归墟', desc: '九千丈封印的裂口', unlocked: false },
    { name: '白霜城头', desc: '妖兵与序使的战场', unlocked: false }
  ],
  freeActions: [
    { keys: ['回府', '神乐府', '父亲'], text: '你回到神乐府，父亲的书房门虚掩着。案上摊着斩妖令，旁边是一封没有署名的信。', eff: { stats: { xin: 4 }, flags: { sawLetter: true } } },
    { keys: ['议事厅', '裁军', '粮饷'], text: '议事厅里有人提“裁掉三成守棠人”。你没有说话，只把照夜放在案上，厅里静了一瞬。', eff: { stats: { feng: 6 }, flags: { councilSilenced: true } } },
    { keys: ['西坊', '巡', '妖物'], text: '西坊的墙根下躺着半具妖骨。长明替你照亮，青色的火照出骨头里还卡着一枚神乐家的箭头。', eff: { rel: { chomei: 8 }, flags: { westClue: true } } },
    { keys: ['燎', '次子', '妖兵'], text: '燎在城西兵营里数妖兵。他看见你，手里的名册合上了一半：“大哥，你来抢我的兵？”', eff: { rel: { liao: 8 }, stats: { yao: 2 } } },
    { keys: ['长明', '灯', '交谈'], text: '长明贴着你的耳边说：“那不是妖，是神。你父亲的斩妖令，压不住它。”', eff: { rel: { chomei: 10 }, flags: { chomeiTruth: true } } },
    { keys: ['青婆婆', '槐枝', '归墟'], text: '青婆婆从黑暗里递出一枝槐：“你母亲十九岁那年，也站在这棵树下。”', eff: { rel: { aoi: 8 }, addItems: [{ id: 'huaizhi', qty: 1 }] } },
    { keys: ['奈岐', '蛇神', '封印'], text: '奈岐坐在棠树下，像坐了一万年。他抬眼：“你身上有守棠人的血。过来。”', eff: { rel: { nagi: 10 }, stats: { yao: 3 } } },
    { keys: ['白芨', '灰狼', '妖市'], text: '白芨从屋顶跳下来，右耳缺了一块。他闻了闻你的袖口：“你身上有笼子的味道。”', eff: { rel: { shirai: 8 }, flags: { wolfTrust: true } } }
  ],
  start: 'return',
  scenes: {
    return: {
      chapter: '卷一 · 归乡', place: '落星谷', title: '霜见京的雨',
      text: '你二十二岁，从霜见京养了三年病回来。\n落星谷的雨把山路泡得发亮，照夜在你腰上，斩妖令在袖里。\n府门前的棠树比记忆里高了一截，树下的石阶上坐着一个人。\n他穿青铜色的旧袍，手里提着一盏没有火的灯，抬头看你：“你终于回来了。”\n他是长明，神乐家守了三十年的灯灵。',
      choices: [
        { label: '先问长明，父亲的斩妖令为何在书房', hint: '长明 +10，线索', eff: { rel: { chomei: 10 }, flags: { askFather: true } }, next: 'hall' },
        { label: '把照夜解下来，让他看看剑鞘里的字', hint: '锋刃 +5，长明 +8', eff: { stats: { feng: 5 }, rel: { chomei: 8 }, flags: { showedSword: true } }, next: 'hall' },
        { label: '不进门，先去西坊看妖物的动静', hint: '妖力 +4，危险', eff: { stats: { yao: 4 }, flags: { wentWest: true } }, next: 'hall' }
      ]
    },
    hall: {
      chapter: '卷二 · 议事厅', place: '议事厅', title: '裁掉三成',
      text: '议事厅里坐满了人。\n父亲不在。雨宫·澪坐在侧席，眉眼柔和，替你倒了一杯茶。\n“白霜城养不起这么多守棠人。”她说，“裁掉三成，妖兵就能多发三个月粮。”\n燎站在她身后，个子已经比你高半头。他看着你，像在等你先开口。\n你想起三年前，他也是这样站在门外，端着一碗凉掉的参汤。',
      choices: [
        { label: '把斩妖令放在案上，反对裁人', hint: '威信 +8，雨宫澪 -6', eff: { stats: { xin: 8 }, rel: { liao: 4 }, flags: { againstCut: true } }, next: 'west' },
        { label: '支持裁人，但要妖兵先交出兵器', hint: '锋刃 +4，燎 +8', eff: { stats: { feng: 4 }, rel: { liao: 8 }, flags: { disarmedYokai: true } }, next: 'west' },
        { label: '不表态，先问九千丈封印的裂缝', hint: '真相，青婆婆 +6', eff: { stats: { xin: 4 }, rel: { aoi: 6 }, flags: { askedSeal: true } }, next: 'west' }
      ]
    },
    west: {
      chapter: '卷三 · 西坊', place: '西坊', title: '墙下的妖骨',
      text: '西坊的雨比落星谷更脏。\n墙根下堆着半具妖骨，骨缝里卡着一枚神乐家的箭头。\n白芨蹲在屋顶，右耳缺了一块，冲你低吼：“别碰。那是你父亲的人射的。”\n长明把灯举高，青色的火照出骨头上密密麻麻的名字——全是这三年里失踪的守棠人。\n巷子深处，燎的妖兵正在换防。',
      choices: [
        { label: '把箭头拔出来，带回议事厅', hint: '证据，危险 +4', eff: { stats: { feng: 5, xin: 4 }, flags: { arrowEvidence: true } }, next: 'market' },
        { label: '让白芨带路，去见青婆婆', hint: '白芨 +10，青婆婆 +6', eff: { rel: { shirai: 10, aoi: 6 }, flags: { metAoi: true } }, next: 'market' },
        { label: '直接去妖市找燎，问他知不知情', hint: '燎 +10，妖力 +3', eff: { rel: { liao: 10 }, stats: { yao: 3 }, flags: { askedLiao: true } }, next: 'market' }
      ]
    },
    market: {
      chapter: '卷四 · 妖市', place: '妖市', title: '长明照骨',
      text: '妖市在夜里才开。\n灯笼挂在没有门的铺子上，卖的是记忆、名字和一小截寿命。\n长明把灯放在你脚边，青色的火照过每一个摊主的脸——没有一张是人的脸。\n“你父亲的斩妖令，在这里只能买一杯酒。”长明说。\n燎站在街尾，手里提着妖兵的名册，名册上第一个名字是你的。',
      choices: [
        { label: '当众翻开名册，问燎为什么写你的名字', hint: '燎 +12，威信 +4', eff: { rel: { liao: 12 }, stats: { xin: 4 }, flags: { readRoster: true } }, next: 'seal' },
        { label: '不动声色，跟长明去查名册的来处', hint: '线索，长明 +8', eff: { rel: { chomei: 8 }, flags: { rosterClue: true } }, next: 'seal' },
        { label: '买下一段“守棠人的记忆”', hint: '真相，理智 -4', eff: { stats: { xin: -4, yao: 4 }, flags: { boughtMemory: true } }, next: 'seal' }
      ]
    },
    seal: {
      chapter: '卷五 · 归墟', place: '归墟', title: '九千丈之下',
      text: '归墟的入口在棠树底下。\n你顺着根须往下走了九千丈，直到脚底踩到一片会呼吸的黑暗。\n青婆婆坐在封印的裂口上，根须扎进每一道缝。她的掌心不是手纹，是一圈一圈的树轮。\n“你母亲十九岁那年，也来过这里。”她说，“她没下去。你父亲下去了，带上来一把剑。”\n封印下面，奈岐睁开眼。',
      choices: [
        { label: '把手贴在封印上，替青婆婆撑住', hint: '青婆婆 +14，妖力 +5', eff: { rel: { aoi: 14 }, stats: { yao: 5, hp: -4 }, flags: { heldSeal: true } }, next: 'tree' },
        { label: '问奈岐，下面压的到底是什么', hint: '奈岐 +12，真相', eff: { rel: { nagi: 12 }, flags: { nagiTruth: true } }, next: 'tree' },
        { label: '拔出照夜，先斩断第一根松动的锁链', hint: '锋刃 +8，危险 +8', eff: { stats: { feng: 8, yao: 4 }, flags: { cutChain: true } }, next: 'tree' }
      ]
    },
    tree: {
      chapter: '卷六 · 棠树', place: '神乐府', title: '树下的人',
      text: '你从归墟上来时，棠树开花了。\n花是白的，落在石阶上像一层薄雪。\n长明在树下等你，灯芯终于有了火。燎站在他身后，手里没有名册，只有一只旧铜盒。\n“母亲让我把这个给你。”燎说，“她说，守棠人的血，总要有一个人先流。”\n奈岐的影子落在树根上，像一条很长的河。',
      choices: [
        { label: '接过铜盒，先问燎愿不愿意一起守', hint: '燎 +16，共同线', eff: { rel: { liao: 16 }, stats: { xin: 6 }, flags: { together: true } }, next: 'finale' },
        { label: '把铜盒还给燎，让他自己选', hint: '燎 +12，尊重线', eff: { rel: { liao: 12 }, flags: { liaoChoice: true } }, next: 'finale' },
        { label: '打开铜盒，里面是母亲留下的守棠印', hint: '真相，妖力 +8', eff: { stats: { yao: 8, xin: 4 }, flags: { motherSeal: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 白霜城头', place: '白霜城头', title: '序使叩关',
      text: '白霜城头点起九盏灯。\n城外的雾里站着序使，它们没有脸，只有一个接一个的名字。\n燎带着三百妖兵站在你左侧，白芨伏在城垛上，长明的灯照出每一根从雾里伸出来的手指。\n奈岐从地底升起，蛇身盘住城墙。\n“这一次，”他说，“你还要一个人下去吗？”',
      choices: [
        { label: '握住燎的手，一起把妖兵压上城头', hint: '结局 · 双守棠人', eff: { rel: { liao: 20 }, stats: { feng: 10 }, flags: { defendTogether: true } }, next: 'end' },
        { label: '让奈岐封住裂缝，你带人撤进归墟', hint: '结局 · 归墟守夜', eff: { rel: { nagi: 18, aoi: 10 }, flags: { retreat: true } }, next: 'end' },
        { label: '把守棠印交给燎，自己提灯出城', hint: '结局 · 长明不灭', eff: { rel: { chomei: 18, liao: 8 }, flags: { lampOut: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '白霜城头', title: '霜后见春', text: '城头的灯一盏一盏亮起来。', choices: [] }
  },
  events: [
    { id: 'rain', title: '落星谷的雨', if: function (s) { return s.day >= 2; }, text: '雨把落星谷的路冲出一条新沟。沟底露出半截旧剑鞘，刻着神乐家的棠纹。', eff: { stats: { xin: 4 }, flags: { oldSheath: true } } },
    { id: 'liao_drink', title: '燎端来的参汤', if: function (s) { return s.rel.liao >= 25; }, text: '燎端着一碗参汤站在门外。汤是热的，他却像三年前一样，不敢敲门。', eff: { rel: { liao: 8 }, stats: { hp: 4 } } },
    { id: 'chomei_memory', title: '长明的旧火', if: function (s) { return s.rel.chomei >= 30; }, text: '长明的灯芯忽然爆了一下。他低声说：“三十年前，我也这样等过一个人。”', eff: { rel: { chomei: 8 }, stats: { xin: 3 } } },
    { id: 'seal_loose', title: '封印又松了一寸', if: function (s) { return s.day >= 4; }, text: '棠树底下的根须断了一根。青婆婆没有说，但她的树轮少了一圈。', eff: { stats: { yao: 4, hp: -3 }, flags: { sealLoose: true } } },
    { id: 'wolf', title: '白芨的耳朵', if: function (s) { return s.rel.shirai >= 25; }, text: '白芨把缺了一块的右耳贴在你手背上：“以后有人欺负你，我能先听见。”', eff: { rel: { shirai: 8 } } }
  ],
  endings: [
    { id: 'together', title: '双守棠人', if: function (s) { return s.flags.defendTogether; }, text: '你和燎并肩站在白霜城头。妖兵与守棠人的血混在一起，把城墙染成深色。\n序使退去时，燎把名册扔进火里：“以后我的兵，也听你的。”\n长明在城下举灯，照见两个人的影子叠在一起。' },
    { id: 'retreat', title: '归墟守夜', if: function (s) { return s.flags.retreat; }, text: '你带人退进归墟。奈岐的蛇身封住入口，青婆婆的根须从黑暗里垂下来，替你们挡住第一波序使。\n燎坐在你身边，把刀横在膝上。\n“这一次，”他说，“我跟你一起守。”' },
    { id: 'lamp', title: '长明不灭', if: function (s) { return s.flags.lampOut; }, text: '你提着长明走出城门。灯油是你的血，火是你的名字。\n燎在城头喊你，你没有回头。\n后来白霜城改名叫霜见，取“霜后见春”的意思。\n城门口多了一盏永远不灭的灯，和一个每年春天都来添油的人。' },
    { id: 'fall', title: '九千丈下', if: function (s) { return s.stats.hp <= 15 || s.stats.yao >= 95; }, text: '封印裂开时，你被根须拖进九千丈之下。\n奈岐用蛇身压住裂口，青婆婆把最后一圈树轮给了你。\n霜见京的雨下了七天。\n第八天，棠树下多了一枝新槐。' }
  ],
  nexusLinks: [
    { label: '法则：守棠人的血', kind: '宇宙法则', target: 'law' },
    { label: '规则：霜见京守则', kind: '规则系', target: 'rules' },
    { label: '人物：神乐·朔 / 燎 / 奈岐', kind: '人物', target: 'chars' }
  ]
};
