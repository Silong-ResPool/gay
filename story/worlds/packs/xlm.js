/* 世界：仙门卧底 / 修仙 · 宗门权谋 · 双男主 */
window.SL_PACK = {
  id: 'xlm', title: '仙门卧底', subtitle: '修仙 · 宗门权谋 · 双修试炼',
  kicker: 'IMMORTAL · UNDERCOVER', theme: 'xianxia', layout: 'dashboard', modeLabel: '宗门修行', mode: 'cultivation',
  accent: '#67e8f9', accent2: '#eab308', bg: '#050b0a', bg2: '#0b1816',
  cover: 'https://aka.doubaocdn.com/s/k7wpRcAVFX', turnsPerDay: 4, eventChance: 0.42,
  freePlaceholder: '自由行动：打坐 / 炼丹 / 画符 / 喂妖宠 / 去剑坪 / 找谢无咎 / 调查魔气',
  bgm: [
    { id: 'cloud', name: '云间早课', mood: 'daily', tempo: 68, scale: 'major', lead: 'guqin', pad: 'cloud' },
    { id: 'demon', name: '魔气入山', mood: 'horror', tempo: 54, scale: 'phrygian', lead: 'dizi', pad: 'dark' },
    { id: 'ascend', name: '剑光照夜', mood: 'tense', tempo: 104, scale: 'minor', lead: 'pipa', pad: 'pulse' }
  ],
  stats: [
    { key: 'cultivation', label: '修为', init: 12, max: 100 },
    { key: 'spirit', label: '灵力', init: 48, max: 100 },
    { key: 'suspicion', label: '宗门疑心', init: 10, max: 100, danger: true },
    { key: 'heart', label: '道心', init: 55, max: 100 },
    { key: 'herbs', label: '灵草', init: 3, max: 99 }
  ],
  relations: [
    { key: 'xie', name: '谢无咎', role: '剑尊 · 冷面道侣', init: 18, max: 100 },
    { key: 'pei', name: '裴照', role: '魔道旧识 · 妖宠之主', init: 8, max: 100 },
    { key: 'yu', name: '虞长老', role: '戒律堂 · 疑心最重', init: 0, max: 100 }
  ],
  items: {
    sword: { name: '断水剑', desc: '谢无咎赠你的入门剑，剑穗是他亲手系的', tags: ['武器', '信物'], icon: '剑' },
    pill: { name: '洗髓丹', desc: '宗门每月只发一枚，苦得舌根发麻', tags: ['丹药'], icon: '丹' },
    talisman: { name: '匿气符', desc: '能遮住魔气三个时辰，画得歪歪扭扭', tags: ['符箓', '消耗'], icon: '符' },
    herbs: { name: '凝露草', desc: '长在剑坪背阴处，炼丹的主药', tags: ['灵草'], icon: '草' },
    egg: { name: '黑羽蛋', desc: '裴照塞给你的妖宠蛋，壳上有金色裂纹', tags: ['妖宠', '未知'], icon: '蛋' },
    letter: { name: '魔道密信', desc: '只有半页，落款被烧掉了', tags: ['证据', '危险'], icon: '信' }
  },
  startItems: [{ id: 'sword', qty: 1 }, { id: 'pill', qty: 1 }, { id: 'herbs', qty: 3 }],
  skills: [{ id: 'breath', name: '吐纳诀' }, { id: 'seal', name: '基础符箓' }],
  rules: [
    { text: '剑坪的剑鸣每天只响三次，第四次响，说明有人闯山。', code: 'X-01' },
    { text: '戒律堂的灯亮着，不要御剑。', code: 'X-02' },
    { text: '双修不是采补；道心不稳的人，会把彼此拖进魔障。', code: 'X-03' },
    { text: '妖宠认主之前，先认气味。', code: 'X-04' },
    { text: '宗门里最危险的不是魔气，是站在你身后的人。', code: 'X-05' }
  ],
  places: [
    { name: '外门弟子院', desc: '你住的偏房，窗外就是剑坪', unlocked: true },
    { name: '剑坪', desc: '谢无咎每日卯时练剑', unlocked: true },
    { name: '丹房', desc: '炼丹、炼器与符纸', unlocked: true },
    { name: '后山灵田', desc: '凝露草与妖宠蛋', unlocked: true },
    { name: '戒律堂', desc: '虞长老审问犯戒弟子', unlocked: false },
    { name: '秘境入口', desc: '十年一开的试炼之地', unlocked: false }
  ],
  freeActions: [
    { keys: ['打坐', '吐纳', '修炼'], text: '你在剑坪背风处打坐。谢无咎从你身后经过，把一件外袍搭在你肩上。', eff: { stats: { cultivation: 6, spirit: 4 }, rel: { xie: 4 } } },
    { keys: ['炼丹', '丹房', '炼'], text: '你把凝露草投进丹炉。火候差了一点，炸出一股苦香。谢无咎伸手替你挡了火星。', eff: { stats: { herbs: -1, cultivation: 5 }, rel: { xie: 6 }, flags: { alchemy: true } } },
    { keys: ['画符', '符纸', '符箓'], text: '你照着残卷画匿气符，最后一笔总是歪。裴照在窗外笑：“歪一点才像你。”', eff: { addItems: [{ id: 'talisman', qty: 1 }], rel: { pei: 5 }, flags: { talismanMade: true } } },
    { keys: ['妖宠', '喂', '蛋'], text: '黑羽蛋裂开一道缝。里面那只小东西先闻了闻你的手指，才肯出来。', eff: { stats: { spirit: 5 }, rel: { pei: 8 }, flags: { petHatched: true } } },
    { keys: ['剑坪', '练剑', '谢无咎'], text: '谢无咎握住你的手腕纠正剑势。他的掌心很冷，呼吸却落在你耳后。', eff: { rel: { xie: 8 }, stats: { cultivation: 4 } } },
    { keys: ['灵田', '采药', '凝露草'], text: '你在后山采到一株双生凝露草。根须缠在一起，分不开。', eff: { stats: { herbs: 2 }, flags: { twinHerb: true } } },
    { keys: ['调查', '魔气', '密信'], text: '你在剑坪石缝里发现一缕黑气。它不往山里飘，反而往戒律堂去。', eff: { stats: { suspicion: 4 }, flags: { demonClue: true } } }
  ],
  start: 'outer',
  scenes: {
    outer: {
      chapter: '第 1 日 · 外门', place: '外门弟子院', title: '剑坪的第四次剑鸣',
      text: '你是三个月前被带上山的。\n宗门说你根骨寻常，只配在外门扫地。可你记得自己醒来时，掌心有一道魔气留下的黑纹。\n卯时，剑坪的剑鸣响了三次。\n第四次响时，整座山的云都停了。\n谢无咎站在剑坪中央，剑尖指着你：“你昨晚去了后山。”',
      choices: [
        { label: '承认去了后山，但不说魔气的事', hint: '谢无咎 +8，疑心 +4', eff: { rel: { xie: 8 }, stats: { suspicion: 4 }, flags: { secretKept: true } }, next: 'sword' },
        { label: '反问谢无咎，他为什么守着后山', hint: '线索 +1，谢无咎 +6', eff: { rel: { xie: 6 }, flags: { xieWatch: true } }, next: 'sword' },
        { label: '把黑纹亮给他看，赌一次信任', hint: '谢无咎 +14，疑心 +8', eff: { rel: { xie: 14 }, stats: { suspicion: 8 }, flags: { showedMark: true } }, next: 'sword' }
      ]
    },
    sword: {
      chapter: '第 2 日 · 剑坪', place: '剑坪', title: '断水剑',
      text: '谢无咎把一柄旧剑扔给你。\n剑名断水，剑穗是新的，系法却很旧。\n“从今天起，你跟我练剑。”他说，“宗门里有人要你的命，别死得太早。”\n剑坪下的弟子们都在看。虞长老站在戒律堂门口，手里的拂尘一动不动。',
      choices: [
        { label: '接剑，问他为什么帮你', hint: '谢无咎 +12，线索 +1', eff: { rel: { xie: 12 }, flags: { whyHelp: true } }, next: 'dan' },
        { label: '当着众人拔剑，立威', hint: '修为 +10，疑心 +6', eff: { stats: { cultivation: 10, suspicion: 6 }, rel: { xie: 6 } }, next: 'dan' },
        { label: '把剑穗拆开，看里面藏了什么', hint: '线索 +2，谢无咎 +4', eff: { rel: { xie: 4 }, flags: { tasselClue: true } }, next: 'dan' }
      ]
    },
    dan: {
      chapter: '第 3 日 · 丹房', place: '丹房', title: '双生凝露草',
      text: '丹房的炉火烧了整夜。\n你把双生凝露草投进去，药液却分成两色，一青一黑。\n裴照从梁上倒挂下来，伸手蘸了一点黑色药液：“这不是丹，是锁。”\n他笑得很好看，指尖却带着魔气：“有人想把你炼成钥匙。”',
      choices: [
        { label: '抓住裴照的手，问锁什么', hint: '裴照 +14，线索 +1', eff: { rel: { pei: 14 }, flags: { keyLock: true } }, next: 'pet' },
        { label: '把药液泼进炉里，先毁掉', hint: '疑心 -4，修为 +6', eff: { stats: { suspicion: -4, cultivation: 6 }, flags: { destroyedPill: true } }, next: 'pet' },
        { label: '留一点药液，偷偷去找谢无咎', hint: '谢无咎 +10，疑心 +4', eff: { rel: { xie: 10 }, stats: { suspicion: 4 }, flags: { xieKnowsPill: true } }, next: 'pet' }
      ]
    },
    pet: {
      chapter: '第 4 日 · 后山', place: '后山灵田', title: '妖宠破壳',
      text: '黑羽蛋在灵田里滚了半圈，壳裂开。\n一只通体漆黑的小鸟钻出来，第一眼看见的是你。它歪着头，叫了一声，像在确认什么。\n裴照蹲在旁边，罕见地没有笑：“它认你为主了。”\n“那意味着什么？”\n“意味着你身上有它熟悉的东西。”',
      choices: [
        { label: '把小鸟捧起来，给它取名字', hint: '裴照 +12，妖宠 +1', eff: { rel: { pei: 12 }, stats: { spirit: 6 }, flags: { petNamed: true } }, next: 'trial' },
        { label: '让裴照解释“熟悉的东西”', hint: '线索 +2，疑心 +4', eff: { stats: { suspicion: 4 }, flags: { petTruth: true } }, next: 'trial' },
        { label: '带鸟去剑坪，试探谢无咎', hint: '谢无咎 +10，疑心 +6', eff: { rel: { xie: 10 }, stats: { suspicion: 6 }, flags: { showedPet: true } }, next: 'trial' }
      ]
    },
    trial: {
      chapter: '第 5 日 · 戒律堂', place: '戒律堂', title: '审问',
      text: '戒律堂的灯亮了一夜。\n虞长老坐在高座上，面前摆着你的魔道密信、双生凝露草和一根黑色羽毛。\n“外门弟子，私通魔道，私炼禁丹。”他敲了敲木案，“你还有什么话说？”\n谢无咎站在堂下，手按在剑柄上。裴照没有来。',
      choices: [
        { label: '承认密信是自己的，但说出锁的真相', hint: '疑心 -6，谢无咎 +14', eff: { rel: { xie: 14 }, stats: { suspicion: -6 }, flags: { confessedTruth: true } }, next: 'secret' },
        { label: '反咬虞长老，指出黑气来自戒律堂', hint: '疑心 +10，线索 +2', eff: { stats: { suspicion: 10 }, flags: { accusedYu: true } }, next: 'secret' },
        { label: '什么也不说，等谢无咎开口', hint: '谢无咎 +18，危险', eff: { rel: { xie: 18 }, stats: { suspicion: 6 }, flags: { trustedXie: true } }, next: 'secret' }
      ]
    },
    secret: {
      chapter: '第 6 日 · 秘境', place: '秘境入口', title: '十年一开的门',
      text: '秘境入口在剑坪下方，十年开一次。\n这一次，门提前开了。\n谢无咎站在门前，剑穗被风吹得笔直：“里面有一件东西，能证明你不是魔道的人。”\n裴照从阴影里走出来，手里托着那只黑羽鸟：“也能证明你是。”\n两个人同时看向你。',
      choices: [
        { label: '跟谢无咎进去，找证明', hint: '谢无咎 +18，修为 +10', eff: { rel: { xie: 18 }, stats: { cultivation: 10 }, flags: { enteredWithXie: true } }, next: 'finale' },
        { label: '跟裴照走，先弄清魔气来源', hint: '裴照 +18，线索 +2', eff: { rel: { pei: 18 }, flags: { enteredWithPei: true } }, next: 'finale' },
        { label: '一个人进去，谁也不信', hint: '修为 +14，疑心 +8', eff: { stats: { cultivation: 14, suspicion: 8 }, flags: { soloTrial: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 剑坪', place: '剑坪', title: '剑光照夜',
      text: '秘境深处，锁开了。\n被锁在里面的不是魔，是一段被宗门删掉的旧事：虞长老才是把魔气引进山的人。\n你带着证据回到剑坪时，整座山的剑都在响。\n谢无咎拔剑，裴照站在他对面，黑羽鸟落在你的肩上。\n“选一边。”虞长老说。',
      choices: [
        { label: '站到谢无咎身边，清理宗门', hint: '宗门结局', eff: { rel: { xie: 25 }, flags: { standXie: true } }, next: 'end' },
        { label: '站到裴照身边，带魔道离开', hint: '魔道结局', eff: { rel: { pei: 25 }, flags: { standPei: true } }, next: 'end' },
        { label: '谁都不站，把证据交给所有弟子', hint: '改革结局', eff: { stats: { suspicion: 15 }, flags: { publicTruth: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '剑坪', title: '云开', text: '剑鸣停了。', choices: [] }
  },
  events: [
    { id: 'sword_4', title: '第四次剑鸣', if: function (s) { return s.day >= 1; }, text: '剑坪的剑鸣多了一声。谢无咎抬头看向后山，眉头第一次皱起来。', eff: { stats: { suspicion: 3 }, flags: { fourthSword: true } } },
    { id: 'yu_visit', title: '虞长老的拂尘', if: function (s) { return s.stats.suspicion >= 20; }, text: '虞长老在你的窗外站了很久。拂尘上的白丝沾了一点黑。', eff: { stats: { suspicion: 5 }, flags: { yuSuspect: true } } },
    { id: 'pei_wound', title: '裴照的旧伤', if: function (s) { return s.rel.pei >= 30; }, text: '裴照替你挡了一道雷劫，手臂上多了一条焦黑的纹。他说不疼，手却在抖。', eff: { rel: { pei: 8 }, stats: { heart: 3 } } },
    { id: 'xie_night', title: '谢无咎夜访', if: function (s) { return s.rel.xie >= 40; }, text: '谢无咎站在你窗外，没有进来。他只放下一瓶伤药，瓶底压着一张字条：别信虞。', eff: { rel: { xie: 8 }, addItems: [{ id: 'pill', qty: 1 }] } },
    { id: 'pet_grow', title: '黑羽鸟长大了一圈', if: function (s) { return s.flags.petHatched; }, text: '黑羽鸟开始学你说话。它学会的第一句是谢无咎的名字。', eff: { stats: { spirit: 6 }, rel: { xie: 5 } } },
    { id: 'demon_wave', title: '后山魔气涨潮', if: function (s) { return s.day >= 4; }, text: '后山的灵田一夜枯了一半。黑气顺着石缝往戒律堂爬。', eff: { stats: { suspicion: 5, spirit: -4 } } }
  ],
  endings: [
    { id: 'sect', title: '剑尊的道侣', if: function (s) { return s.flags.standXie; }, text: '虞长老被押下戒律堂。谢无咎在剑坪上把断水剑折成两截，一截给你，一截留给自己。\n“双修不是采补。”他把额头抵在你额上，“是两个人一起活。”\n那天的云开了很久。' },
    { id: 'demon', title: '魔道同归', if: function (s) { return s.flags.standPei; }, text: '你跟着裴照离开山门。黑羽鸟在肩头叫了一声，整座山的剑都追到云外。\n裴照把魔气收进掌心，回头笑：“后悔吗？”\n“你都问了第三遍了。”\n他把手伸过来，你握住了。' },
    { id: 'truth', title: '云开见日', if: function (s) { return s.flags.publicTruth; }, text: '你把证据投进剑坪的传影阵。所有弟子都看见了虞长老的黑气。\n宗门没有倒，规矩却换了一遍。\n谢无咎和裴照站在人群两端，都没有先走。\n你站在中间，黑羽鸟落在剑穗上。' },
    { id: 'fallen', title: '山门雪', if: function (s) { return s.stats.suspicion >= 95 || s.stats.heart <= 10; }, text: '戒律堂的灯灭了。你的名字被刻在犯戒碑上，和魔道并列。\n很多年后，剑坪的雪里还会埋着半截断水剑。\n剑穗上的结，没有人再拆开。' }
  ],
  nexusLinks: [
    { label: '法则：灵气守恒与道心', kind: '宇宙法则', target: 'law' },
    { label: '物品：丹药 / 符箓 / 妖宠', kind: '物品', target: 'items' },
    { label: '学习：炼丹炼器与符纸', kind: '学习', target: 'learn' }
  ]
};
