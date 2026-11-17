/* 世界：黑牢翻盘 / 冤狱 · 监狱争霸 · 双男主 */
window.SL_PACK = {
  id: 'jycs', title: '黑牢翻盘', subtitle: '冤狱 · 铁窗 · 黑白两道',
  kicker: 'BLACK CELL · RISE', theme: 'prison', layout: 'dashboard', modeLabel: '监狱争霸', mode: 'prison',
  accent: '#f59e0b', accent2: '#ef4444', bg: '#0a0806', bg2: '#171009',
  cover: 'https://aka.doubaocdn.com/s/2XQbGuyVOO', turnsPerDay: 4, eventChance: 0.42,
  freePlaceholder: '自由行动：拉拢 / 锻炼 / 搜身 / 写信 / 找沈砚 / 去医务室 / 打听典狱长',
  bgm: [
    { id: 'iron_rain', name: '铁窗雨', mood: 'daily', tempo: 62, scale: 'minor', lead: 'cello', pad: 'rain' },
    { id: 'dark_tide', name: '暗潮', mood: 'tense', tempo: 96, scale: 'phrygian', lead: 'lowStrings', pad: 'pulse' },
    { id: 'release', name: '出狱那天', mood: 'hope', tempo: 74, scale: 'major', lead: 'piano', pad: 'warm' },
    { id: 'horror', name: '放风场夜巡', mood: 'horror', tempo: 70, scale: 'minor', lead: 'lowStrings', pad: 'dark' }
  ],
  stats: [
    { key: 'hp', label: '体质', init: 72, max: 100, danger: true },
    { key: 'respect', label: '威信', init: 8, max: 100 },
    { key: 'network', label: '人脉', init: 5, max: 100 },
    { key: 'danger', label: '危险值', init: 18, max: 100, danger: true },
    { key: 'money', label: '资金', init: 0, max: 9999, unit: '元' }
  ],
  relations: [
    { key: 'shen', name: '沈砚', role: '前律师 · 监狱军师', init: 22, max: 100 },
    { key: 'lu', name: '陆骁', role: '牢头 · 旧势力', init: 5, max: 100 },
    { key: 'k', name: '老K', role: '典狱长线人', init: 0, max: 100 }
  ],
  items: {
    blade: { name: '磨尖的牙刷柄', desc: '藏在床板缝里，握柄上刻着一个“冤”字', tags: ['武器', '危险'], icon: '刃' },
    ledger: { name: '旧账本', desc: '记着监狱里每一笔见不得光的交易', tags: ['证据', '关键'], icon: '账' },
    letter: { name: '申诉信', desc: '写满你被栽赃的经过，还差一个证人签名', tags: ['证据'], icon: '信' },
    med: { name: '止痛片', desc: '沈砚从医务室带回来的，只有两片', tags: ['药品'], icon: '药' },
    watch: { name: '沈砚的旧表', desc: '表背刻着“等出去”三个字', tags: ['信物', '感情'], icon: '表' },
    phone: { name: '典狱长的手机', desc: '里面有一段能翻案的录音', tags: ['证据', '危险'], icon: '机' }
  },
  startItems: [{ id: 'blade', qty: 1 }, { id: 'letter', qty: 1 }],
  skills: [{ id: 'read', name: '看人' }, { id: 'fight', name: '近身格斗' }],
  rules: [
    { text: '放风场的第三个水龙头不能碰，那是旧势力的交货点。', code: 'P-01' },
    { text: '每个新人都要选一边站；不站队的人，活不过第一个月。', code: 'P-02' },
    { text: '典狱长的话只能信一半，另一半要拿录音换。', code: 'P-03' },
    { text: '沈砚替你挡过一刀；这笔债，你要用整座监狱来还。', code: 'P-04' },
    { text: '越接近出狱，越要小心“意外”。', code: 'P-05' }
  ],
  places: [
    { name: '入监区', desc: '铁门、编号与第一顿冷饭', unlocked: true },
    { name: 'B 区牢房', desc: '你和沈砚的上下铺', unlocked: true },
    { name: '放风场', desc: '势力交接的地盘', unlocked: true },
    { name: '工坊', desc: '账本和武器的来源', unlocked: true },
    { name: '医务室', desc: '沈砚替你换药的地方', unlocked: false },
    { name: '典狱长办公室', desc: '黑白两道的交易桌', unlocked: false }
  ],
  freeActions: [
    { keys: ['拉拢', '结盟', '收买'], text: '你把省下的半包烟递给邻铺，换来一句“B 区今晚有人要动你”。', eff: { stats: { network: 6, danger: 3 } } },
    { keys: ['锻炼', '健身', '练'], text: '你在床沿做俯卧撑，沈砚靠在墙边替你数。数到第三十下，他的声音低了下去。', eff: { stats: { hp: 8 }, rel: { shen: 4 } } },
    { keys: ['搜身', '搜', '找'], text: '你在工坊废料堆里摸到一截铁片，还有一个被油布包住的账本。', eff: { addItems: [{ id: 'ledger', qty: 1 }], stats: { danger: 4, network: 3 } } },
    { keys: ['写信', '申诉', '翻案'], text: '你把申诉信又抄了一遍。沈砚在旁边补上一行：证人还活着，在 B 区。', eff: { stats: { network: 4 }, rel: { shen: 6 }, flags: { witnessAlive: true } } },
    { keys: ['沈砚', '交谈', '聊'], text: '沈砚替你整理衣领，指尖在领口停了一瞬：“出去以后，别再用命换钱。”', eff: { rel: { shen: 8 }, stats: { danger: -2 } } },
    { keys: ['医务室', '换药', '伤'], text: '医务室的灯坏了。沈砚就着走廊的光替你换药，呼吸落在你后颈。', eff: { stats: { hp: 10 }, rel: { shen: 8 } } },
    { keys: ['打听', '典狱长', '老K'], text: '老K在洗衣房等你，手里转着一串钥匙：“想见典狱长？先拿点东西来换。”', eff: { stats: { network: 5, danger: 3 }, flags: { kContact: true } } }
  ],
  start: 'intake',
  scenes: {
    intake: {
      chapter: '第 1 日 · 入监', place: '入监区', title: '编号 0417',
      text: '你被推进铁门时，雨正从屋檐上往下砸。\n罪名是“诈骗致人死亡”。你没有做过，但所有证据都指向你。\n走廊尽头，一个穿灰衬衫的男人靠在墙边抽烟。他抬眼看了看你的编号，又看了看你身后的押送警。\n“新来的，”他把烟摁灭，“在这里，清白是最没用的东西。”\n他叫沈砚，入狱前是律师。',
      choices: [
        { label: '走到沈砚身边，让他带你进 B 区', hint: '由沈砚保护 · 主受线', eff: { rel: { shen: 14 }, flags: { protected: true }, log: '你选择站在沈砚身侧。' }, next: 'cell' },
        { label: '挡在沈砚前面，先替他接下挑衅', hint: '由你保护沈砚 · 主攻线', eff: { stats: { respect: 6, hp: -5 }, rel: { shen: 10 }, flags: { protector: true }, log: '你选择站在沈砚前面。' }, next: 'cell' },
        { label: '谁也不靠，自己走进去', hint: '独狼线 · 危险 +6', eff: { stats: { danger: 6, respect: 3 } }, next: 'cell' }
      ]
    },
    cell: {
      chapter: '第 2 日 · B 区', place: 'B 区牢房', title: '上下铺',
      text: 'B 区的灯整夜不关。\n你的床在上铺，沈砚在下铺。他把一本旧账本垫在枕头下面，像垫着一把枪。\n“0417，”他仰头看你，“你被判了七年。想在这里活到第七年，得先学会让别人怕你。”\n走廊里传来铁棍拖过地面的声音。有人在往这边走。',
      choices: [
        { label: '把沈砚护在身后，正面迎上陆骁', hint: '威信 +8，危险 +6', eff: { stats: { respect: 8, danger: 6, hp: -6 }, rel: { shen: 8, lu: -5 }, flags: { stoodUp: true } }, next: 'yard' },
        { label: '听沈砚的，先退到监控死角', hint: '人脉 +6，沈砚 +6', eff: { stats: { network: 6 }, rel: { shen: 6 }, flags: { listened: true } }, next: 'yard' },
        { label: '拿出申诉信，问沈砚能不能翻案', hint: '线索 +1，沈砚 +5', eff: { rel: { shen: 5 }, flags: { askAppeal: true } }, next: 'yard' }
      ]
    },
    yard: {
      chapter: '第 3 日 · 放风场', place: '放风场', title: '第三个水龙头',
      text: '放风场的第三个水龙头底下，摆着一只没有标签的塑料桶。\n陆骁的人守在旁边，谁靠近就打谁。沈砚说，那桶里装的是从医务室流出来的止痛药，再往外交，就是一条人命。\n“你要威信，就得先把这条线切断。”沈砚把一枚磨尖的牙刷柄塞进你袖口。',
      choices: [
        { label: '当着所有人砸掉药桶，立规矩', hint: '威信 +12，危险 +10', eff: { stats: { respect: 12, danger: 10, hp: -8 }, rel: { shen: 10, lu: -15 }, flags: { brokeMarket: true } }, next: 'workshop' },
        { label: '截下药桶，转手卖给老K换消息', hint: '资金 +800，人脉 +8', eff: { stats: { money: 800, network: 8, danger: 4 }, flags: { kDeal: true } }, next: 'workshop' },
        { label: '先不动，暗中记下所有接头人', hint: '线索 +2，危险 +2', eff: { stats: { network: 4, danger: 2 }, flags: { recorded: true } }, next: 'workshop' }
      ]
    },
    workshop: {
      chapter: '第 4 日 · 工坊', place: '工坊', title: '一本账，一把刀',
      text: '工坊的缝纫机下面藏着一只铁盒。\n你撬开它，里面是陆骁的旧账本，还有一张被撕掉一半的探视记录。\n记录上写着你的名字，和一个你从未见过的证人编号。\n沈砚盯着那行字，忽然笑了：“我说过，你的案子不止你一个人。”\n门外，陆骁的人正在清点工坊。',
      choices: [
        { label: '带走账本，从洗衣房绕出去', hint: '获得账本，危险 +6', eff: { addItems: [{ id: 'ledger', qty: 1 }], stats: { danger: 6 }, rel: { shen: 6 }, flags: { hasLedger: true } }, next: 'riot' },
        { label: '把账本交给老K，换典狱长见面机会', hint: '人脉 +10，线索 +1', eff: { stats: { network: 10, danger: 4 }, flags: { kLedger: true, meetWarden: true } }, next: 'warden' },
        { label: '先问沈砚，为什么他知道证人编号', hint: '沈砚 +12，真相', eff: { rel: { shen: 12 }, flags: { shenSecret: true } }, next: 'infirmary' }
      ]
    },
    riot: {
      chapter: '第 5 日 · 暴动', place: 'B 区牢房', title: '铁门开了',
      text: '夜里十一点，B 区的铁门被人从外面打开。\n陆骁带着人冲进来，手里提着钢管。有人喊“0417 是条子的人”，整层牢房都醒了。\n沈砚把你推到床后，自己迎上去。第一根钢管落在他肩上时，你听见骨头响。\n“别出来。”他背对着你，声音很稳。',
      choices: [
        { label: '冲出去替沈砚挡第二棍', hint: '沈砚 +18，重伤', eff: { stats: { hp: -22, respect: 8 }, rel: { shen: 18 }, flags: { tookBlow: true } }, next: 'infirmary' },
        { label: '拉响消防警报，逼狱警提前介入', hint: '危险 -8，威信 +5', eff: { stats: { danger: -8, respect: 5 }, rel: { shen: 8 }, flags: { alarm: true } }, next: 'warden' },
        { label: '趁乱夺下陆骁的账本，反手栽赃', hint: '陆骁 -20，威信 +10', eff: { stats: { respect: 10, danger: 6 }, rel: { lu: -20 }, flags: { framedLu: true } }, next: 'warden' }
      ]
    },
    infirmary: {
      chapter: '第 6 日 · 医务室', place: '医务室', title: '灯坏之后',
      text: '医务室的灯坏了，只剩走廊的一线白光。\n沈砚坐在床边，替你处理肩上的伤。他的手指很稳，呼吸却不像。\n“你刚才不该出来。”他说。\n“你替我挡的时候，也没想过该不该。”\n他沉默了很久，忽然低头，把额头抵在你肩上。那一小块皮肤，比伤口还烫。',
      choices: [
        { label: '伸手抱住他，什么也不问', hint: '沈砚 +20，心动', eff: { rel: { shen: 20 }, flags: { intimate: true } }, next: 'warden' },
        { label: '问他，出去以后会不会走', hint: '沈砚 +12，约定', eff: { rel: { shen: 12 }, flags: { promise: true } }, next: 'warden' },
        { label: '把旧表还给他，先谈正事', hint: '人脉 +5，沈砚 +6', eff: { stats: { network: 5 }, rel: { shen: 6 }, flags: { watchReturned: true } }, next: 'warden' }
      ]
    },
    warden: {
      chapter: '第 7 日 · 典狱长办公室', place: '典狱长办公室', title: '白道也要讲价',
      text: '典狱长把一叠文件推到你面前。\n“你替陆骁顶了太多事。”他说，“现在他上面的人要弃车保帅。你只要签了这份口供，我可以让你提前出去。”\n文件下面压着一张探视单。证人还活着，被关在另一座看守所。\n沈砚站在你身后，没有说话。你知道他在等你自己选。',
      choices: [
        { label: '拒绝签字，拿录音换正式翻案', hint: '翻案线 · 危险 +12', eff: { stats: { danger: 12, respect: 6 }, addItems: [{ id: 'phone', qty: 1 }], flags: { refuseDeal: true } }, next: 'finale' },
        { label: '假意签字，暗中录下典狱长的话', hint: '获得录音，人脉 +8', eff: { stats: { network: 8, danger: 8 }, addItems: [{ id: 'phone', qty: 1 }], flags: { recordedWarden: true } }, next: 'finale' },
        { label: '要求先见证人，再谈条件', hint: '线索 +1，沈砚 +8', eff: { stats: { network: 6 }, rel: { shen: 8 }, flags: { witnessMeet: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 放风场', place: '放风场', title: '整座监狱都在看',
      text: '放风场的喇叭响了三次。\n陆骁被按在地上，他身后的人一个个退开。老K站在典狱长身边，手里拎着那只旧账本。\n你站在人群中央，沈砚在你半步之后。\n铁门外的天是灰的，但有一线光正从云缝里漏下来。\n“0417，”沈砚在你耳边说，“你可以走了。”',
      choices: [
        { label: '牵着沈砚，从正门走出去', hint: '幸福结局', eff: { rel: { shen: 25 }, flags: { walkOut: true } }, next: 'end' },
        { label: '留下接管监狱，让沈砚先出去等你', hint: '黑牢之王', eff: { stats: { respect: 25 }, rel: { shen: 10 }, flags: { prisonKing: true } }, next: 'end' },
        { label: '把证据交给记者，先洗清罪名', hint: '沉冤昭雪', eff: { stats: { network: 15 }, flags: { cleared: true } }, next: 'end' }
      ]
    },
    end: {
      chapter: '终章', place: '监狱正门', title: '门外的风',
      text: '铁门在身后合上。',
      choices: []
    }
  },
  events: [
    { id: 'blade_found', title: '床板下的刀片', if: function (s) { return s.day >= 1; }, text: '你在床板缝里摸到一片磨尖的塑料。沈砚没有问，只把它接过去，替你藏好。', eff: { rel: { shen: 4 }, stats: { danger: 2 } } },
    { id: 'visit', title: '一封没有署名的探监单', if: function (s) { return s.flags.askAppeal || s.day >= 2; }, text: '探监室玻璃上蒙着雾。对面的人只写了一个地址，又把纸撕碎。', eff: { stats: { network: 4 }, flags: { clueAddress: true } } },
    { id: 'shen_wound', title: '沈砚的肩伤又裂开', if: function (s) { return s.rel.shen >= 30; }, text: '沈砚换衣服时，肩胛上的旧伤露出来。他说是入狱前留下的，可那道疤和狱警的警棍形状一样。', eff: { rel: { shen: 8 }, stats: { hp: -3 }, addItems: [{ id: 'med', qty: 1 }] } },
    { id: 'yard_storm', title: '放风场提前清场', if: function (s) { return s.stats.danger >= 35; }, text: '狱警把所有人在雨里赶回牢房。有人在队伍最后被拖走，地上留了一只鞋。', eff: { stats: { danger: 6, network: 3 } } },
    { id: 'k_offer', title: '老K递来一支烟', if: function (s) { return s.flags.kContact || s.stats.network >= 20; }, text: '老K把烟递给你，烟嘴里卷着一张小纸条：今晚别睡。', eff: { stats: { network: 5 }, flags: { kWarning: true } } },
    { id: 'rain_night', title: '雨夜里的上下铺', if: function (s) { return s.rel.shen >= 45; }, text: '雨敲在铁皮顶上。沈砚从下铺伸手上来，碰了碰你的床沿：“睡着了吗？”你没有回答，只把手垂下去。', eff: { rel: { shen: 8 } } }
  ],
  endings: [
    { id: 'walk', title: '门外有风', if: function (s) { return s.flags.walkOut; }, text: '你牵着沈砚走出监狱正门。铁门在身后合上，像合上一本旧账。\n他抬手替你挡住久违的阳光，指尖停在你的眉骨上。\n“以后别再进来了。”他说。\n“那要看你在不在外面。”' },
    { id: 'king', title: '黑牢之王', if: function (s) { return s.flags.prisonKing; }, text: '你留了下来。陆骁的位置、老K的线、典狱长的账，全都换成了你的名字。\n黑白两道开始怕一个编号 0417 的人。\n只有沈砚每个月十五来探监，坐在玻璃对面，替你把衣领整理好。\n“我在外面等你。”他说。' },
    { id: 'clear', title: '沉冤昭雪', if: function (s) { return s.flags.cleared; }, text: '记者把录音放上网络的那天，全市都在下雨。\n你走出法院时，沈砚站在台阶下，手里拿着一把黑色的伞。\n他没有问你赢了没有，只问：“回家吗？”\n你点头。伞往你这边偏了偏。' },
    { id: 'fallen', title: '无名碑', if: function (s) { return s.stats.hp <= 15 || s.stats.danger >= 95; }, text: '暴动那晚，B 区的灯再也没亮过。\n沈砚抱着你从铁门里出来，雨水把血冲进排水沟。\n后来放风场多了一块没有名字的水泥砖。有人每天放一支烟，有人每天擦一遍。' }
  ],
  nexusLinks: [
    { label: '法则：罪与罚的交换', kind: '宇宙法则', target: 'law' },
    { label: '规则：监狱生存守则', kind: '规则系', target: 'rules' },
    { label: '人物：沈砚 / 陆骁', kind: '人物', target: 'chars' }
  ]
};
