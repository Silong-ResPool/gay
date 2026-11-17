/* 世界：战国妖神录 / 新版引擎 · 古风志怪 · 双男主 */
window.SL_PACK = {
  id: 'zgysl', title: '战国·妖神录', subtitle: '昭元三年 · 白霜城',
  kicker: 'WAR · FOX SPIRIT', theme: 'ancient', layout: 'dashboard', modeLabel: '志怪权谋', mode: 'ancient',
  accent: '#f59e0b', accent2: '#b91c1c', bg: '#0b0705', bg2: '#1a0d08',
  cover: 'https://aka.doubaocdn.com/s/dH5cGfyFrh', turnsPerDay: 4, eventChance: 0.45,
  freePlaceholder: '自由行动：巡城 / 查案 / 去茶楼 / 找谢昭 / 找白狸 / 画符 / 练剑',
  bgm: [
    { id: 'snow', name: '白霜城的雪', mood: 'daily', tempo: 64, scale: 'minor', lead: 'guqin', pad: 'snow' },
    { id: 'fox', name: '狐火', mood: 'horror', tempo: 52, scale: 'phrygian', lead: 'dizi', pad: 'fire' },
    { id: 'war', name: '城头鼓', mood: 'tense', tempo: 100, scale: 'minor', lead: 'pipa', pad: 'drum' }
  ],
  stats: [
    { key: 'hp', label: '气血', init: 78, max: 100, danger: true },
    { key: 'mind', label: '心念', init: 55, max: 100, danger: true },
    { key: 'blade', label: '锋刃', init: 20, max: 100 },
    { key: 'suspicion', label: '城中疑云', init: 12, max: 100, danger: true },
    { key: 'talismans', label: '符纸', init: 3, max: 20 }
  ],
  relations: [
    { key: 'zhao', name: '谢昭', role: '白霜城少将 · 冷面刀客', init: 18, max: 100 },
    { key: 'li', name: '白狸', role: '妖神录残页化形 · 狐妖', init: 8, max: 100 },
    { key: 'shen', name: '沈砚', role: '茶楼说书人 · 情报贩子', init: 0, max: 100 }
  ],
  items: {
    sword: { name: '照胆刀', desc: '谢昭的佩刀，刀鞘上刻着一行小字：不负', tags: ['武器', '信物'], icon: '刀' },
    page: { name: '妖神录残页', desc: '纸页摸起来像雪，字迹会移动', tags: ['关键', '危险'], icon: '页' },
    talisman: { name: '镇狐符', desc: '画到最后一笔时，手会自己停下来', tags: ['符箓', '消耗'], icon: '符' },
    tea: { name: '白霜茶', desc: '茶楼特供，喝下去能看见雪里的脚印', tags: ['食物', '线索'], icon: '茶' },
    jade: { name: '半块玉佩', desc: '和谢昭腰间那块正好拼成一只狐', tags: ['信物', '感情'], icon: '玉' },
    letter: { name: '密信', desc: '写着三日后城破，落款是当朝国师', tags: ['证据', '危险'], icon: '信' }
  },
  startItems: [{ id: 'sword', qty: 1 }, { id: 'page', qty: 1 }, { id: 'talismans', qty: 3 }],
  skills: [{ id: 'blade', name: '照胆刀法' }, { id: 'seal', name: '镇狐符' }],
  rules: [
    { text: '白霜城的雪只落在活人肩上，妖物走过的地方是干的。', code: 'Z-01' },
    { text: '妖神录一共四卷，读完的人会忘记自己的名字。', code: 'Z-02' },
    { text: '谢昭的刀从不出鞘；出鞘时，城里一定有人要死。', code: 'Z-03' },
    { text: '茶楼的说书人知道所有秘密，但他只讲一半。', code: 'Z-04' },
    { text: '狐妖认主之前，会先偷走你的一样东西。', code: 'Z-05' }
  ],
  places: [
    { name: '白霜城头', desc: '谢昭每日巡城', unlocked: true },
    { name: '茶楼', desc: '说书人沈砚的地盘', unlocked: true },
    { name: '城西旧宅', desc: '妖神录残页出现的地方', unlocked: true },
    { name: '雪巷', desc: '没有脚印的巷子', unlocked: true },
    { name: '国师府', desc: '城破密信的来源', unlocked: false },
    { name: '狐火祠', desc: '白狸的真身所在', unlocked: false }
  ],
  freeActions: [
    { keys: ['巡城', '城头', '谢昭'], text: '你和谢昭并肩巡城。他替你拂掉肩上的雪，动作比刀还轻。', eff: { stats: { blade: 4 }, rel: { zhao: 6 } } },
    { keys: ['查案', '调查', '线索'], text: '你在雪巷尽头找到一串没有脚印的痕迹，痕迹一直延伸到城西旧宅。', eff: { stats: { suspicion: 4 }, flags: { dryFootprints: true } } },
    { keys: ['茶楼', '沈砚', '听书'], text: '沈砚把醒木一拍，讲了一个狐妖替人挡劫的故事。散场后，他塞给你半张城防图。', eff: { rel: { shen: 8 }, stats: { suspicion: 2 }, flags: { cityMap: true } } },
    { keys: ['白狸', '狐妖', '交谈'], text: '白狸从梁上跳下来，尾巴扫过你的手腕：“你身上有谢昭的味道。”', eff: { rel: { li: 8 }, stats: { mind: -2 } } },
    { keys: ['画符', '符纸', '镇狐'], text: '你画镇狐符，最后一笔又停住了。白狸在旁边笑：“你舍不得镇我。”', eff: { stats: { talismans: -1, mind: 3 }, rel: { li: 5 } } },
    { keys: ['练刀', '刀法', '练'], text: '谢昭按住你的手腕，教你把刀势收住：“刀不是用来杀人的，是用来让人不敢动。”', eff: { stats: { blade: 8 }, rel: { zhao: 6 } } },
    { keys: ['旧宅', '妖神录', '残页'], text: '旧宅的墙上浮现出妖神录第二卷。你只看了三行，就听见有人在你身后叫你的名字。', eff: { stats: { mind: -6 }, flags: { secondPage: true } } }
  ],
  start: 'wall',
  scenes: {
    wall: {
      chapter: '第 1 日 · 城头', place: '白霜城头', title: '雪只落在活人肩上',
      text: '昭元三年，白霜城的雪下了整整一月。\n你站在城头，看见雪落在每一个活人肩上，唯独城西那条巷子，干干净净。\n谢昭按着刀走过来，把一件大氅披在你身上：“别看了。那条巷子，昨晚又少了一个人。”\n他腰间挂着半块玉佩，形状像一只狐。',
      choices: [
        { label: '跟谢昭去城西查案', hint: '谢昭 +12，线索 +1', eff: { rel: { zhao: 12 }, flags: { goWest: true } }, next: 'alley' },
        { label: '先去茶楼，找沈砚打听', hint: '沈砚 +10，线索 +1', eff: { rel: { shen: 10 }, stats: { suspicion: 2 }, flags: { teaFirst: true } }, next: 'teahouse' },
        { label: '独自去城西旧宅，找妖神录', hint: '心念 -6，线索 +2', eff: { stats: { mind: -6 }, flags: { soloWest: true } }, next: 'alley' }
      ]
    },
    alley: {
      chapter: '第 2 日 · 雪巷', place: '雪巷', title: '没有脚印的人',
      text: '雪巷里没有脚印。\n巷子尽头，一个穿白衣的人背对着你站着，肩上没有雪。\n他回过头，脸是空的。\n谢昭的刀在鞘里响了一声。\n你听见白狸在屋顶笑：“别怕，他只是忘了自己长什么样。”',
      choices: [
        { label: '拔刀挡在谢昭身前', hint: '锋刃 +6，谢昭 +14', eff: { stats: { blade: 6 }, rel: { zhao: 14 }, flags: { protectZhao: true } }, next: 'teahouse' },
        { label: '问白狸，这个人是谁', hint: '白狸 +12，线索 +2', eff: { rel: { li: 12 }, stats: { mind: -3 }, flags: { emptyFace: true } }, next: 'teahouse' },
        { label: '用镇狐符试探空脸人', hint: '符纸 -1，线索 +1', eff: { stats: { talismans: -1, suspicion: 3 }, flags: { usedTalisman: true } }, next: 'teahouse' }
      ]
    },
    teahouse: {
      chapter: '第 3 日 · 茶楼', place: '茶楼', title: '说书人的半张图',
      text: '茶楼里坐满了人。\n沈砚一拍醒木，讲起二十年前的旧事：国师以妖神录为饵，把整座白霜城炼成阵眼。\n散场后，他把半张城防图塞给你：“另外半张，在国师府。”\n谢昭坐在二楼，面前的茶一口没动。',
      choices: [
        { label: '把城防图交给谢昭', hint: '谢昭 +16，线索 +1', eff: { rel: { zhao: 16 }, flags: { mapToZhao: true } }, next: 'house' },
        { label: '问沈砚，为什么要帮你', hint: '沈砚 +12，线索 +1', eff: { rel: { shen: 12 }, flags: { shenWhy: true } }, next: 'house' },
        { label: '把图收起来，谁也不告诉', hint: '心念 -4，危险 +4', eff: { stats: { mind: -4, suspicion: 4 }, flags: { secretMap: true } }, next: 'house' }
      ]
    },
    house: {
      chapter: '第 4 日 · 旧宅', place: '城西旧宅', title: '妖神录第二卷',
      text: '旧宅的墙上浮出妖神录第二卷。\n字迹像雪一样落下来，拼成一句话：\"城破之日，需一活人祭阵。\"\n白狸蹲在梁上，尾巴垂下来：“谢昭的玉佩，就是阵眼的钥匙。”\n门外，谢昭的脚步声停了。',
      choices: [
        { label: '把残页藏起来，不让谢昭看见', hint: '谢昭 +10，心念 -4', eff: { rel: { zhao: 10 }, stats: { mind: -4 }, flags: { hidPage: true } }, next: 'temple' },
        { label: '把真相告诉谢昭', hint: '谢昭 +18，线索 +2', eff: { rel: { zhao: 18 }, flags: { toldZhao: true } }, next: 'temple' },
        { label: '问白狸，能不能替你祭阵', hint: '白狸 +15，危险 +6', eff: { rel: { li: 15 }, stats: { suspicion: 6 }, flags: { foxOffer: true } }, next: 'temple' }
      ]
    },
    temple: {
      chapter: '第 5 日 · 狐火祠', place: '狐火祠', title: '狐火',
      text: '狐火祠在城西地下，入口被雪封了三年。\n白狸用尾巴扫开雪，露出里面的九尾壁画。\n“我不是妖神。”他说，“我是被妖神录吃掉的人留下的执念。”\n谢昭站在壁画前，半块玉佩在手里发热。\n壁画上的狐狸，正好缺了半边脸。',
      choices: [
        { label: '把自己的血滴在壁画上', hint: '心念 -8，线索 +2', eff: { stats: { mind: -8, hp: -5 }, flags: { bloodWall: true } }, next: 'finale' },
        { label: '把玉佩交给白狸，让他补全壁画', hint: '白狸 +20，谢昭 -6', eff: { rel: { li: 20, zhao: -6 }, flags: { jadeToFox: true } }, next: 'finale' },
        { label: '拉住谢昭，先离开狐火祠', hint: '谢昭 +14，危险 -4', eff: { rel: { zhao: 14 }, stats: { suspicion: -4 }, flags: { leftTemple: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 城头', place: '白霜城头', title: '城破之日',
      text: '第三日，国师的兵到了城下。\n白霜城的雪忽然停了。\n谢昭拔刀，刀光照亮半座城。\n沈砚站在城楼阴影里，手里拿着另外半张城防图。\n白狸落在你肩上，问：“阵眼、城、还是人，你选哪个？”',
      choices: [
        { label: '和谢昭一起守城，把阵眼留给自己', hint: '谢昭结局', eff: { rel: { zhao: 25 }, flags: { guardWithZhao: true } }, next: 'end' },
        { label: '跟白狸进狐火祠，关闭妖神录', hint: '白狸结局', eff: { rel: { li: 25 }, flags: { closeBook: true } }, next: 'end' },
        { label: '把城防图交给沈砚，让全城撤离', hint: '沈砚结局', eff: { rel: { shen: 20 }, flags: { evacuate: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '白霜城', title: '雪停', text: '雪终于停了。', choices: [] }
  },
  events: [
    { id: 'missing', title: '城西又少一个人', if: function (s) { return s.day >= 1; }, text: '更夫说，城西昨晚少了一个人。雪地上没有脚印，只有半块冷掉的饼。', eff: { stats: { suspicion: 3 }, flags: { missingPerson: true } } },
    { id: 'fox_tail', title: '窗外的狐狸尾巴', if: function (s) { return s.rel.li >= 20; }, text: '半夜，一条白色的尾巴从窗缝垂进来，轻轻卷走你桌上的半块玉佩。', eff: { rel: { li: 6 }, stats: { mind: -2 } } },
    { id: 'zhao_wound', title: '谢昭的旧伤', if: function (s) { return s.rel.zhao >= 30; }, text: '谢昭在城头换药，背上有三道旧刀伤。他说是二十年前留下的，可伤口的形状像狐爪。', eff: { rel: { zhao: 8 }, addItems: [{ id: 'jade', qty: 1 }] } },
    { id: 'tea_dream', title: '茶里的雪', if: function (s) { return s.flags.teaFirst; }, text: '你喝下白霜茶，看见雪地里有一行脚印，一直走到国师府后门。', eff: { stats: { suspicion: 4 }, flags: { teaVision: true } } },
    { id: 'book_voice', title: '妖神录在叫你的名字', if: function (s) { return s.stats.mind <= 45; }, text: '你听见妖神录在叫你。声音像谢昭，也像白狸，最后变成你自己的。', eff: { stats: { mind: -6 } } },
    { id: 'army', title: '城下鼓声', if: function (s) { return s.day >= 4; }, text: '城下传来第一声战鼓。谢昭把刀横在膝上，一整夜没有睡。', eff: { stats: { suspicion: 6 }, rel: { zhao: 5 } } }
  ],
  endings: [
    { id: 'zhao', title: '照胆', if: function (s) { return s.flags.guardWithZhao; }, text: '城守住了。\n谢昭的刀断成两截，一截插在城头，一截留在你手里。\n他把半块玉佩放进你掌心：“以后白霜城的雪，落在我们两个人肩上。”' },
    { id: 'fox', title: '狐火人间', if: function (s) { return s.flags.closeBook; }, text: '妖神录在狐火里烧尽。白狸的第九条尾巴化成一场雪，落在你手背上。\n“我本来就没有脸。”他笑，“现在有了。”\n你伸手碰了碰他的脸，是温的。' },
    { id: 'shen', title: '满城灯火', if: function (s) { return s.flags.evacuate; }, text: '沈砚把城防图摊开，带着百姓从暗道撤离。\n白霜城空了，国师的兵扑了个空。\n你站在城头，看见谢昭和白狸一左一右，替你挡住最后一阵箭雨。' },
    { id: 'fall', title: '雪埋白霜', if: function (s) { return s.stats.mind <= 5 || s.stats.suspicion >= 95; }, text: '城破那天，雪下得很大。\n妖神录从城西旧宅一直烧到城头，把所有人的脸都烧成了空白。\n只有半块玉佩留在雪里，像一只没有眼睛的狐。' }
  ],
  nexusLinks: [
    { label: '法则：妖神录的代价', kind: '宇宙法则', target: 'law' },
    { label: '规则：白霜城夜行守则', kind: '规则系', target: 'rules' },
    { label: '物品：照胆刀 / 镇狐符', kind: '物品', target: 'items' }
  ]
};
