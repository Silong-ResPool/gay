/* 世界：云墟双修 / 国风修仙 · 双男主 · 炼丹炼器符箓 · 妖宠秘境 */
window.SL_PACK = {
  id: 'yxsx', title: '云墟双修', subtitle: '国风修仙 · 丹符器宠',
  kicker: 'CLOUD RUINS · CULTIVATION', theme: 'xianxia', layout: 'scroll', modeLabel: '修仙经营', mode: 'cultivation',
  accent: '#d4af37', accent2: '#ddd6fe', bg: '#080705', bg2: '#15120b', cover: 'https://aka.doubaocdn.com/s/aVqvXbYJ22',
  turnsPerDay: 7, eventChance: 0.35, freePlaceholder: '自由行动：打坐 / 采药 / 炼丹 / 炼器 / 画符 / 喂养赤璃 / 和墨渊双修',
  bgm: [
    { id: 'daily', name: '云海', mood: 'daily', tempo: 56, scale: 'pentatonic', lead: 'dizi', pad: 'soft' },
    { id: 'tense', name: '雷劫', mood: 'tense', tempo: 98, scale: 'minor', lead: 'lowStrings', pad: 'storm' },
    { id: 'hope', name: '双修', mood: 'hope', tempo: 66, scale: 'major', lead: 'guqin', pad: 'warm' },
    { id: 'horror', name: '走火入魔', mood: 'horror', tempo: 78, scale: 'phrygian', lead: 'lowStrings', pad: 'storm' }
  ],
  stats: [
    { key: 'aura', label: '灵力', init: 38, max: 120 },
    { key: 'dao', label: '道心', init: 66, max: 100, danger: true },
    { key: 'body', label: '体魄', init: 54, max: 100 },
    { key: 'pills', label: '丹药', init: 2, max: 12 },
    { key: 'craft', label: '器符', init: 1, max: 12 },
    { key: 'tribulation', label: '雷劫', init: 0, max: 9, danger: true }
  ],
  relations: [
    { key: 'mo', name: '墨渊', role: '云墟剑修 · 你的双修道侣', init: 25, max: 100 },
    { key: 'chi', name: '赤璃', role: '男狐妖宠 · 火系灵兽', init: 12, max: 100 }
  ],
  items: {
    herb: { name: '九叶灵草', desc: '叶背有银纹，三百年一熟', tags: ['食材', '灵植'], icon: '草' },
    furnace: { name: '青纹丹炉', desc: '炉底刻着云墟的旧印', tags: ['制作', '炼丹'], icon: '炉' },
    talisman: { name: '引雷符', desc: '画歪一笔就会劈自己', tags: ['符箓', '危险'], icon: '符' },
    sword: { name: '无锋灵剑', desc: '墨渊赠你，剑穗是他的旧发带', tags: ['灵器', '关系'], icon: '剑' },
    egg: { name: '赤狐灵卵', desc: '壳上有火焰纹，偶尔自己翻身', tags: ['妖宠', '孵化'], icon: '卵' }
  },
  startItems: [{ id: 'herb', qty: 3 }, { id: 'furnace', qty: 1 }, { id: 'talisman', qty: 1 }],
  skills: [{ id: 'alchemy', name: '青纹丹法（入门）' }, { id: 'forge', name: '灵器淬炼（入门）' }, { id: 'pet', name: '灵兽契（未结）' }],
  rules: [
    { text: '炼丹时炉火不可离人；丹成三转，少一转则废。', code: 'X-01' },
    { text: '双修不是采补。道心不稳时强行双修，双方都会跌境。', code: 'X-02' },
    { text: '妖宠结契后，主人死，宠亦死；宠死，主人道心留一道疤。', code: 'X-03' },
    { text: '秘境试炼只认修为，不认人情。', code: 'X-04' },
    { text: '雷劫之下，不可借他人灵力。', code: 'X-05' }
  ],
  places: [
    { name: '云墟外门', desc: '你的住处与丹房', unlocked: true },
    { name: '灵植园', desc: '九叶灵草与妖卵', unlocked: true },
    { name: '炼丹房', desc: '青纹丹炉', unlocked: true },
    { name: '铸剑池', desc: '墨渊炼器的地方', unlocked: true },
    { name: '妖兽秘境', desc: '试炼与灵兽', unlocked: false },
    { name: '雷劫台', desc: '突破金丹的最后一步', unlocked: false }
  ],
  freeActions: [
    { keys: ['打坐', '修炼', '灵力'], text: '你在云墟的晨雾里打坐，灵力顺着经脉走了一个小周天。', eff: { stats: { aura: 8, dao: 2 } } },
    { keys: ['采药', '灵草'], text: '你在灵植园采到两株九叶灵草，根上还带着露。', eff: { stats: { aura: 3 }, addItems: [{ id: 'herb', qty: 2 }] } },
    { keys: ['炼丹', '丹'], text: '丹炉三转，炉盖掀开时，一枚青纹丹滚到你掌心。', eff: { stats: { pills: 1, aura: -6, craft: 1 } } },
    { keys: ['炼器', '铸剑'], text: '墨渊握住你的手教你控火，剑胚在池水里淬出一声龙吟。', eff: { stats: { craft: 1, aura: -4 }, rel: { mo: 7 } } },
    { keys: ['画符', '符'], text: '你以朱砂画引雷符，最后一笔落下，窗外真的响了一声闷雷。', eff: { stats: { craft: 1, aura: -3, dao: -2 } } },
    { keys: ['赤璃', '妖宠', '狐'], text: '赤璃蹭着你的手腕，尾巴尖的火苗把袖口烧出一个小洞。', eff: { rel: { chi: 8 }, stats: { dao: 2 } } },
    { keys: ['墨渊', '双修', '道侣'], text: '墨渊与你掌心相抵，两股灵力缠成一条细流。他没有闭眼，一直在看你。', eff: { rel: { mo: 10 }, stats: { aura: 12, dao: 3 } } }
  ],
  start: 'sect',
  scenes: {
    sect: {
      chapter: '第一卷 · 云墟', place: '云墟外门', title: '外门弟子与剑修',
      text: '云墟收徒只看灵根，不看出身。你以三品杂灵根入外门，被分到最偏的丹房。\n隔壁住着墨渊，云墟最年轻的剑修。他每晚在崖边练剑，剑光把云海劈成两半。\n今日他敲你的门，手里提着一只还在冒火的灵卵：“赤璃的卵，放你这里孵。我要下山一趟。”\n他没说什么时候回来。',
      choices: [
        { label: '接过灵卵，答应替他孵', hint: '妖宠线，墨渊 +12', eff: { rel: { mo: 12 }, addItems: [{ id: 'egg', qty: 1 }], flags: { egg: true } }, next: 'garden' },
        { label: '先问下山做什么，要不要一起', hint: '墨渊 +8，线索 +1', eff: { rel: { mo: 8 }, stats: { dao: 2 }, flags: { askMo: true } }, next: 'garden' },
        { label: '拒绝，先专心炼丹', hint: '炼丹 +1，墨渊 -4', eff: { stats: { pills: 1, craft: 1 }, rel: { mo: -4 } }, next: 'garden' }
      ]
    },
    garden: {
      chapter: '第二卷 · 灵植园', place: '灵植园', title: '草会认人',
      text: '灵植园夜里比白天热闹。九叶灵草会自己挪位置，避开被采过的坑。\n你蹲下拔草时，听见身后有细小的爪子声。\n一只通体赤红的小狐狸从土里钻出来，尾巴上还粘着卵壳。它歪头看你，开口却是少年嗓音：“你身上有墨渊的味道。”\n赤璃提前孵化了。',
      choices: [
        { label: '蹲下伸手，让赤璃自己过来', hint: '妖宠契，赤璃 +15', eff: { rel: { chi: 15 }, addSkills: ['pet'], stats: { dao: 4 }, flags: { petBond: true } }, next: 'alchemy' },
        { label: '用灵草喂它，先建立信任', hint: '赤璃 +10，灵草 -1', eff: { rel: { chi: 10 }, stats: { pills: 1 }, removeItems: [{ id: 'herb', qty: 1 }] }, next: 'alchemy' },
        { label: '把它关进丹房，等墨渊回来', hint: '赤璃 -6，道心 -3', eff: { rel: { chi: -6 }, stats: { dao: -3 }, flags: { caged: true } }, next: 'alchemy' }
      ]
    },
    alchemy: {
      chapter: '第三卷 · 丹房', place: '炼丹房', title: '三转丹火',
      text: '丹炉里的火分成三色：凡火、灵火、心火。\n你按古法放入九叶灵草，炉盖开始震动。第三转时，窗外忽然响起墨渊的剑鸣。\n他回来了，肩上有血，手里却攥着一株发黑的灵芝。\n“秘境里带出来的。”他把灵芝扔给你，“能炼续命丹，也能炼毒丹。看你怎么选。”',
      choices: [
        { label: '炼续命丹，先治墨渊的伤', hint: '丹药 +2，墨渊 +15', eff: { rel: { mo: 15 }, stats: { pills: 2, aura: -8 }, flags: { healMo: true } }, next: 'forge' },
        { label: '炼毒丹，留着对付秘境妖兽', hint: '器符 +1，道心 -4', eff: { stats: { craft: 1, dao: -4 }, flags: { poisonPill: true } }, next: 'forge' },
        { label: '把灵芝封存，先研究药性', hint: '线索 +2，炼丹 +1', eff: { stats: { craft: 1, aura: -2 }, flags: { studyHerb: true } }, next: 'forge' }
      ]
    },
    forge: {
      chapter: '第四卷 · 铸剑池', place: '铸剑池', title: '剑坯里有你的影子',
      text: '墨渊脱了上衣，站在铸剑池边淬火。他后背的旧伤从肩胛一直延伸到腰，像一道被剑劈开的云。\n你替他递锤，他忽然握住你的手腕：“这把剑坯里，我掺了你的一缕灵力。剑成之后，它会认你。”\n池水沸腾，剑坯发出低低的嗡鸣。\n赤璃蹲在梁上，尾巴绷得笔直。',
      choices: [
        { label: '把自己的灵力再渡一缕进去', hint: '墨渊 +18，灵剑认主', eff: { rel: { mo: 18 }, stats: { aura: -10, craft: 1 }, addItems: [{ id: 'sword', qty: 1 }], flags: { sword: true } }, next: 'secret' },
        { label: '问墨渊，剑成之后他去哪', hint: '墨渊 +10，线索 +1', eff: { rel: { mo: 10 }, stats: { dao: 2 }, flags: { moLeave: true } }, next: 'secret' },
        { label: '先给赤璃也铸一枚护爪', hint: '赤璃 +12，器符 +1', eff: { rel: { chi: 12 }, stats: { craft: 1, aura: -5 } }, next: 'secret' }
      ]
    },
    secret: {
      chapter: '第五卷 · 妖兽秘境', place: '妖兽秘境', title: '试炼只认修为',
      text: '秘境入口是一面水镜。镜上写着：金丹以下，入者自负生死。\n墨渊是金丹，你才筑基。他伸手拦你：“我替你进去。”\n赤璃却先一步跳进水镜，尾巴的火把镜面烧出一圈涟漪。\n镜中传来少年嗓音：“主人不去，我去。我死了，你别哭。”',
      choices: [
        { label: '拉住赤璃，三个人一起进', hint: '双线关系 +15，危险', eff: { rel: { mo: 15, chi: 15 }, stats: { tribulation: 2 }, flags: { enterTogether: true } }, next: 'trial' },
        { label: '让墨渊守入口，你和赤璃进', hint: '赤璃 +18，墨渊 +5', eff: { rel: { chi: 18, mo: 5 }, stats: { dao: 3 }, flags: { duoEntry: true } }, next: 'trial' },
        { label: '都不进，回去准备丹药', hint: '丹药 +2，道心 +3', eff: { stats: { pills: 2, dao: 3 }, flags: { prepare: true } }, next: 'trial' }
      ]
    },
    trial: {
      chapter: '第六卷 · 试炼', place: '妖兽秘境', title: '雷池上的丹炉',
      text: '秘境深处是一座悬浮的雷池，池心摆着一只倒扣的丹炉。\n试炼规则只有一句：取炉中丹，受三道雷。\n墨渊替你挡了第一道，剑身裂开一线。赤璃扑上第二道，尾巴烧成焦黑。\n第三道雷正在云里蓄力。你手里只剩一枚刚炼成的丹。',
      choices: [
        { label: '吞丹硬接第三道雷', hint: '雷劫 +3，体魄 +15，丹 -1', eff: { stats: { tribulation: 3, body: 15, pills: -1 }, flags: { tookThunder: true } }, next: 'demon' },
        { label: '把丹给墨渊，让他替你接', hint: '墨渊 +20，雷劫 +2', eff: { rel: { mo: 20 }, stats: { tribulation: 2, pills: -1 }, flags: { moThunder: true } }, next: 'demon' },
        { label: '把丹喂给赤璃，让它引雷入体', hint: '赤璃 +20，雷劫 +4', eff: { rel: { chi: 20 }, stats: { tribulation: 4, pills: -1 }, flags: { chiThunder: true } }, next: 'demon' }
      ]
    },
    demon: {
      chapter: '第七卷 · 心魔', place: '雷劫台', title: '另一个你',
      text: '第三道雷没有落在身上，而是劈进了识海。\n你在识海里看见另一个自己：穿黑袍，踩着你所有没选的路，怀里抱着死去的赤璃，身后站着不再回头的墨渊。\n“你谁都想救，”它说，“最后谁都救不了。”\n现实里，墨渊在喊你的名字。',
      choices: [
        { label: '承认怕失去，但不放手', hint: '道心 +10，双修线', eff: { stats: { dao: 10 }, rel: { mo: 10, chi: 10 }, flags: { acceptFear: true } }, next: 'finale' },
        { label: '斩掉心魔，独自扛雷劫', hint: '雷劫 +2，体魄 +10', eff: { stats: { tribulation: 2, body: 10, dao: -4 }, flags: { cutDemon: true } }, next: 'finale' },
        { label: '把心魔引到雷池里，借雷炼它', hint: '器符 +2，雷劫 +3', eff: { stats: { craft: 2, tribulation: 3 }, flags: { forgeDemon: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 飞升', place: '雷劫台', title: '云墟最高的那道雷',
      text: '第九道雷在云层里翻身，整座云墟都在发白。\n墨渊把裂开的剑插在崖边，向你伸出手。赤璃蹲在他肩上，焦黑的尾巴重新冒出火星。\n你可以选择一个人扛，也可以选择三个人一起。\n雷光照亮墨渊的眼睛，他什么都没说。',
      choices: [
        { label: '握住墨渊和赤璃，三人共渡雷劫', hint: '共生飞升', eff: { rel: { mo: 25, chi: 25 }, stats: { dao: 10 }, flags: { ascendTogether: true } }, next: 'end' },
        { label: '推开他们，独自飞升', hint: '孤仙线', eff: { stats: { aura: 30, dao: -8 }, flags: { aloneAscend: true } }, next: 'end' },
        { label: '放弃飞升，带他们回云墟', hint: '归隐线', eff: { rel: { mo: 20, chi: 20 }, stats: { dao: 8 }, flags: { retire: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '云墟', title: '云海之上', text: '雷声停了。', choices: [] }
  },
  events: [
    { id: 'herb_move', title: '灵草自己跑了', if: function (s) { return s.day >= 2; }, text: '九叶灵草从药圃挪到丹房门口，根须上沾着赤璃的毛。', eff: { stats: { aura: 3 }, rel: { chi: 3 } } },
    { id: 'mo_sword', title: '墨渊在崖边练剑', if: function (s) { return s.rel.mo >= 35; }, text: '剑光照亮半个云墟。墨渊收剑时，剑尖总是朝你的窗户偏一寸。', eff: { rel: { mo: 6 }, stats: { dao: 2 } } },
    { id: 'furnace_fire', title: '丹炉炸了一角', if: function (s) { return s.stats.craft >= 2; }, text: '炉盖飞起来砸穿屋顶，赤璃叼着半枚丹从烟里钻出来。', eff: { stats: { pills: -1, craft: 1, hp: -0 }, rel: { chi: 4 } } },
    { id: 'tribulation', title: '云层里有雷声', if: function (s) { return s.stats.tribulation >= 3; }, text: '没有雨的云层里滚过一声闷雷。墨渊把你的手按在剑柄上：“别怕。”', eff: { stats: { tribulation: 1, dao: -2 }, rel: { mo: 5 } } },
    { id: 'chi_fire', title: '赤璃烧了你的被子', if: function (s) { return s.rel.chi >= 40; }, text: '赤璃蜷在你被烧出的洞里睡得正香，尾巴尖的火苗一起一伏。', eff: { stats: { dao: 2 }, rel: { chi: 5 } } },
    { id: 'elder', title: '长老来查丹房', if: function (s) { return s.day >= 4; }, text: '长老翻开你的丹录，看到毒丹那一页，眉头皱了一下又合上。', eff: { stats: { dao: -2 }, flags: { elderKnows: true } } }
  ],
  endings: [
    { id: 'together', title: '三人共渡', if: function (s) { return s.flags.ascendTogether; }, text: '雷劫落下时，三股灵力缠成一条绳。\n云墟所有弟子都看见，那道最亮的雷光里有两个人影和一只火狐。\n后来云墟的剑谱上多了一页：双修非采补，是并肩。' },
    { id: 'alone', title: '孤仙', if: function (s) { return s.flags.aloneAscend; }, text: '你一个人站在云海之上，雷劫散了，修为圆满。\n身后没有人叫你名字。\n很多年后，你回云墟看了一眼，丹房门口还蹲着一只焦尾的小狐狸。' },
    { id: 'retire', title: '回云墟', if: function (s) { return s.flags.retire; }, text: '你把最后一道雷引回云层，牵住墨渊的手，赤璃跳上你肩。\n飞升有什么好？云墟的灵草还没收，丹炉还没洗，墨渊的剑也还没修。' },
    { id: 'fall', title: '心魔成丹', if: function (s) { return s.stats.tribulation >= 9; }, text: '第九道雷落下时，你识海里的黑袍人替你接住了。\n它成了你的金丹。\n从此你每炼一枚丹，炉底都会浮出一张你自己的脸。' }
  ],
  nexusLinks: [
    { label: '学习：青纹丹法与淬剑术', kind: '学习', target: 'learn' },
    { label: '物品：灵剑 / 引雷符制作', kind: '物品', target: 'items' },
    { label: '物种：男狐妖宠赤璃', kind: '人物档案', target: 'species' }
  ]
};
