/* 世界：烽烟照胆 / 近代军阀 · 双男主 · 战略与抉择 */
window.SL_PACK = {
  id: 'fyzd', title: '烽烟照胆', subtitle: '近代军阀 · 枪火与盟誓',
  kicker: 'WARLORD 1927 · STRATEGY', theme: 'war', layout: 'dashboard', modeLabel: '军阀经营', mode: 'war',
  accent: '#c08457', accent2: '#facc15', bg: '#0c0907', bg2: '#1a120c', cover: '../../assets/ui/world_fyzd.jpg?v=3',
  turnsPerDay: 6, eventChance: 0.4, freePlaceholder: '自由行动：操练 / 筹粮 / 谈判 / 听戏 / 巡查 / 和段峥交谈',
  useNexusRules: true,
  stats: [
    { key: 'army', label: '兵力', init: 2, max: 20 },
    { key: 'grain', label: '粮饷', init: 4, max: 20, danger: true },
    { key: 'loyalty', label: '军心', init: 58, max: 100, danger: true },
    { key: 'influence', label: '势力', init: 12, max: 100 },
    { key: 'honor', label: '信义', init: 66, max: 100 }
  ],
  relations: [
    { key: 'duan', name: '段峥', role: '镇北军少帅 · 你的盟约对象', init: 20, max: 100 },
    { key: 'shen', name: '沈望', role: '戏班班主 · 地下革命者', init: 10, max: 100 }
  ],
  items: {
    watch: { name: '军用怀表', desc: '表盖里嵌着段峥的照片', tags: ['关系', '信物'], icon: '表' },
    order: { name: '镇北军军令', desc: '“守土，不扰民”五个字', tags: ['军令', '关键'], icon: '令' },
    silver: { name: '一袋银元', desc: '袁大头，敲起来很脆', tags: ['资金'], icon: '银' },
    letter: { name: '密信', desc: '革命军与商会之间的暗号', tags: ['线索', '危险'], icon: '信' },
    gun: { name: '毛瑟手枪', desc: '段峥教过你怎么开', tags: ['武器'], icon: '枪' }
  },
  startItems: [{ id: 'watch', qty: 1 }, { id: 'order', qty: 1 }, { id: 'silver', qty: 2 }],
  skills: [{ id: 'drill', name: '步兵操典' }, { id: 'talk', name: '军阀谈判术' }],
  rules: [
    { text: '镇北军不拿百姓一针一线；违令者军法从事。', code: 'W-01' },
    { text: '粮饷不足三日，军心必乱。', code: 'W-02' },
    { text: '与革命军谈判时，不要先交枪。', code: 'W-03' },
    { text: '戏班是城里最干净的地方，也是最危险的地方。', code: 'W-04' },
    { text: '段峥的怀表停在 1925 年，那是他父亲死的那天。', code: 'W-05' }
  ],
  places: [
    { name: '镇北帅府', desc: '段峥的地盘', unlocked: true },
    { name: '军营', desc: '操练场与军械库', unlocked: true },
    { name: '火车站', desc: '军粮与情报', unlocked: true },
    { name: '春和戏班', desc: '沈望的台口', unlocked: true },
    { name: '前线战壕', desc: '真正的枪声', unlocked: false }
  ],
  freeActions: [
    { keys: ['操练', '练兵', '军队'], text: '你在操练场站了一下午，士兵们的脚步声终于踩到一个点上。', eff: { stats: { army: 1, grain: -1, loyalty: 4 } } },
    { keys: ['筹粮', '粮', '钱'], text: '你从商会借来一批粮，代价是答应修一条路。', eff: { stats: { grain: 2, influence: 2, honor: -2 } } },
    { keys: ['谈判', '谈'], text: '你和邻军代表在茶楼坐了两个时辰，谁都没先提枪。', eff: { stats: { influence: 3, loyalty: 2 } } },
    { keys: ['听戏', '戏班', '沈望'], text: '沈望在台上唱《霸王别姬》，唱到“力拔山兮”时，眼睛一直看着你。', eff: { rel: { shen: 8 }, stats: { honor: 2 } } },
    { keys: ['巡查', '巡'], text: '你沿着城墙走了一圈，百姓看见镇北军的旗子，没有关门。', eff: { stats: { loyalty: 3, honor: 3 } } },
    { keys: ['段峥', '少帅', '交谈'], text: '段峥把怀表递给你看，表盖里他的照片年轻得不像个少帅。', eff: { rel: { duan: 8 }, stats: { influence: 2 } } },
    { keys: ['沈望', '革命'], text: '沈望卸了戏妆，露出眼角一道旧伤：“段家军里，只有你还把人当人。”', eff: { rel: { shen: 8 }, stats: { honor: 2 } } }
  ],
  start: 'mansion',
  scenes: {
    mansion: {
      chapter: '第一幕 · 帅府', place: '镇北帅府', title: '少帅把军令压在棋盘下',
      text: '1927 年，镇北军困守孤城。\n段峥把一张军令压在棋盘下，自己和你下了一夜残局。\n“南边革命军要来了。”他落下一子，“我父亲死在他们手里，可我不想让这座城陪葬。”\n门外，副官在催粮。怀表滴答，停在了 1925 年。',
      choices: [
        { label: '把军令翻出来，问他到底想守还是想谈', hint: '段峥 +12，线索 +1', eff: { rel: { duan: 12 }, stats: { influence: 2 }, flags: { askDuan: true } }, next: 'camp' },
        { label: '先替他解决粮饷', hint: '粮饷 +2，军心 +6', eff: { stats: { grain: 2, loyalty: 6, honor: -2 } }, next: 'station' },
        { label: '去春和戏班听沈望的口风', hint: '沈望 +10，密信线索', eff: { rel: { shen: 10 }, stats: { honor: 2 }, flags: { metShen: true } }, next: 'theater' }
      ]
    },
    camp: {
      chapter: '第二幕 · 军营', place: '军营', title: '军心不是喊出来的',
      text: '军营里，两个营长为最后半袋米吵到拔枪。\n段峥站在台上没说话，只把自己的口粮袋扔进锅里。\n士兵们安静下来。\n系统提示：\n【军心事件：选择如何分粮。】',
      choices: [
        { label: '按伤兵优先，军官最后', hint: '军心 +15，段峥 +10', eff: { stats: { loyalty: 15, grain: -1 }, rel: { duan: 10 }, flags: { fairGrain: true } }, next: 'station' },
        { label: '按战功分配，激励士气', hint: '兵力 +2，军心 +6', eff: { stats: { army: 2, loyalty: 6, grain: -1 } }, next: 'station' },
        { label: '把自己的口粮全部分掉', hint: '军心 +20，生命 -4', eff: { stats: { loyalty: 20, grain: -2, honor: 5 } }, next: 'station' }
      ]
    },
    station: {
      chapter: '第三幕 · 火车站', place: '火车站', title: '军粮车厢里藏着什么',
      text: '火车站停着一列没有番号的军粮车。\n你撬开车厢，里面不是米，是成箱的鸦片。\n押车的是商会会长的侄子，他笑着说：“少帅知道的。这东西比米值钱。”\n段峥的怀表在你口袋里走了一格。',
      choices: [
        { label: '封存鸦片，回去问段峥', hint: '信义 +10，段峥 +8', eff: { stats: { honor: 10 }, rel: { duan: 8 }, flags: { opium: true } }, next: 'theater' },
        { label: '当场烧掉，得罪商会', hint: '信义 +15，势力 -5', eff: { stats: { honor: 15, influence: -5, grain: -1 }, flags: { burnedOpium: true } }, next: 'theater' },
        { label: '假装没看见，先换军粮', hint: '粮饷 +4，信义 -8', eff: { stats: { grain: 4, honor: -8, influence: 3 }, flags: { silentOpium: true } }, next: 'theater' }
      ]
    },
    theater: {
      chapter: '第四幕 · 戏班', place: '春和戏班', title: '戏台下的密信',
      text: '沈望在后台卸妆，戏服堆在椅背上。\n他递给你一封信：“革命军愿意让镇北军整编，但段峥得交出兵权。”\n信角盖着商会的暗印，和鸦片车厢上的印一模一样。\n“有人在拿这座城做买卖。”沈望说，“你护的是城，还是段家？”',
      choices: [
        { label: '把密信交给段峥，让他自己决定', hint: '段峥 +18，信义 +5', eff: { rel: { duan: 18 }, stats: { honor: 5 }, flags: { giveLetter: true } }, next: 'front' },
        { label: '和沈望联手，绕开段峥谈判', hint: '沈望 +18，段峥 -8', eff: { rel: { shen: 18, duan: -8 }, stats: { influence: 5 }, flags: { secretTalk: true } }, next: 'front' },
        { label: '烧掉密信，先保镇北军', hint: '军心 +8，沈望 -10', eff: { stats: { loyalty: 8 }, rel: { shen: -10 }, flags: { burnedLetter: true } }, next: 'front' }
      ]
    },
    front: {
      chapter: '第五幕 · 前线', place: '前线战壕', title: '第一枪',
      text: '革命军的前锋摸到城外，镇北军的防线只剩一道土坡。\n段峥把毛瑟手枪塞给你：“你枪法是我教的。现在，你决定打不打。”\n战壕里全是泥，士兵们看你。\n沈望站在后方救护队里，没穿戏服。',
      choices: [
        { label: '下令开枪，守住镇北军', hint: '兵力 +3，军心 +5，段峥 +10', eff: { stats: { army: 3, loyalty: 5, grain: -2 }, rel: { duan: 10 }, flags: { fought: true } }, next: 'talk' },
        { label: '下令停火，派沈望去谈', hint: '信义 +15，沈望 +15', eff: { stats: { honor: 15 }, rel: { shen: 15 }, flags: { ceasefire: true } }, next: 'talk' },
        { label: '带一个排绕后，切断革命军补给', hint: '影响力 +8，兵力 -1', eff: { stats: { influence: 8, army: -1, loyalty: 4 }, flags: { flank: true } }, next: 'talk' }
      ]
    },
    talk: {
      chapter: '第六幕 · 谈判', place: '镇北帅府', title: '一张桌子，两把枪',
      text: '谈判桌摆在帅府大厅。革命军代表、商会会长、段峥和你。\n商会会长把一份“和平协议”推过来：镇北军改编，段峥出国，你留任市长。\n段峥没有看协议，只看着你。\n沈望站在门外，手里攥着戏班的铜锣。',
      choices: [
        { label: '把协议推回去，要求段峥留下', hint: '段峥 +25，势力 -5', eff: { rel: { duan: 25 }, stats: { influence: -5, honor: 5 }, flags: { keepDuan: true } }, next: 'finale' },
        { label: '签协议，保住全城百姓', hint: '信义 +20，段峥 -10', eff: { stats: { honor: 20, influence: 5 }, rel: { duan: -10 }, flags: { sign: true } }, next: 'finale' },
        { label: '把商会鸦片账本拍在桌上，反将一军', hint: '势力 +15，沈望 +15', eff: { stats: { influence: 15 }, rel: { shen: 15 }, flags: { expose: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 城门', place: '镇北帅府', title: '城开之前',
      text: '天快亮了，城外传来革命军的军号。\n段峥站在城门下，军装穿得整整齐齐，怀表挂在胸前。\n沈望在城楼上，戏班的人把铜锣敲得震天响。\n你手里有城门钥匙。',
      choices: [
        { label: '开城门，和段峥一起交出兵权', hint: '段峥结局', eff: { rel: { duan: 20 }, flags: { openWithDuan: true } }, next: 'end' },
        { label: '开城门，但让沈望先带百姓撤', hint: '沈望结局', eff: { rel: { shen: 20 }, flags: { openWithShen: true } }, next: 'end' },
        { label: '关城门，带镇北军突围', hint: '军阀线', eff: { stats: { army: 2, honor: -10 }, flags: { breakOut: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '孤城', title: '枪声之后', text: '城门开了。', choices: [] }
  },
  events: [
    { id: 'grain_short', title: '粮车被劫', if: function (s) { return s.stats.grain <= 2; }, text: '最后一辆粮车在半路被劫，押车兵只带回来一颗子弹。', eff: { stats: { grain: -1, loyalty: -5 } } },
    { id: 'desert', title: '两个兵跑了', if: function (s) { return s.stats.loyalty <= 40; }, text: '夜里两个兵把枪留在营门口，人不见了。你把枪捡起来，没追。', eff: { stats: { army: -1, loyalty: -3 } } },
    { id: 'duan_watch', title: '段峥的怀表停了', if: function (s) { return s.rel.duan >= 30; }, text: '段峥把怀表放在你掌心：“表停的时候，我父亲说，别让城跟着他陪葬。”', eff: { rel: { duan: 8 }, stats: { honor: 3 } } },
    { id: 'shen_song', title: '沈望在城头唱戏', if: function (s) { return s.rel.shen >= 30; }, text: '沈望没化妆，站在城头唱了一段空城计。士兵们听着，没人说话。', eff: { rel: { shen: 8 }, stats: { loyalty: 4 } } },
    { id: 'opium_fire', title: '商会仓库起火', if: function (s) { return s.flags.opium; }, text: '商会仓库半夜起火，鸦片味飘了半座城。有人想烧掉账本。', eff: { stats: { influence: -2, honor: 3 } } },
    { id: 'traitor', title: '副官不见了', if: function (s) { return s.stats.influence >= 30; }, text: '副官的抽屉空了，城防图也不见了。段峥把自己的手枪上了膛。', eff: { stats: { loyalty: -4, army: -1 } } }
  ],
  endings: [
    { id: 'duan', title: '城开之后', if: function (s) { return s.flags.openWithDuan; }, text: '城门打开时，段峥把军帽摘下来，放在你手里。\n革命军没有开枪。镇北军整编那天，你和段峥站在队伍最后，怀表重新开始走。' },
    { id: 'shen', title: '戏班出城', if: function (s) { return s.flags.openWithShen; }, text: '沈望带着百姓从西门撤走，戏班的铜锣一路敲到天亮。\n你留在城门口，段峥站在你身边，谁都没有回头。\n后来戏班里多了一出新戏，叫《照胆》。' },
    { id: 'break', title: '孤军', if: function (s) { return s.flags.breakOut; }, text: '镇北军突围到山口时，只剩十九个人。\n段峥把最后一颗子弹留给自己，你把他拖上马。\n身后孤城的钟声，一直响到天明。' },
    { id: 'honor', title: '城里的第一盏灯', if: function (s) { return s.stats.honor >= 90; }, text: '你没有开一枪，城里的灯却在夜里亮了一盏。\n百姓说，镇北军这次真的没拿一针一线。\n段峥把怀表修好，表针停在你们进城的那天。' }
  ],
  nexusLinks: [
    { label: '规则：镇北军军法', kind: '规则系', target: 'rules' },
    { label: '物品：怀表与军令', kind: '物品', target: 'items' },
    { label: '人物：段峥 / 沈望', kind: '人物档案', target: 'species' }
  ]
};
