/* 世界：槐阴公寓 / 中式规则怪谈 · 双男主 */
window.SL_PACK = {
  id: 'hygy',
  title: '槐阴公寓',
  subtitle: '七日规则 · 中式怪谈',
  kicker: 'CHINESE HORROR · RULE UNKNOWN',
  theme: 'horror',
  layout: 'dashboard',
  modeLabel: '规则怪谈',
  mode: 'rule',
  accent: '#fb7185',
  accent2: '#2dd4bf',
  bg: '#070508',
  bg2: '#12080d',
  cover: '../../assets/ui/world_hygy.jpg?v=3',
  turnsPerDay: 5,
  eventChance: 0.38,
  freePlaceholder: '自由行动：搜索 / 休息 / 交谈 / 照镜子 / 去电梯 / 上天台',
  useNexusRules: true,
  stats: [
    { key: 'sanity', label: '理智', init: 74, max: 100, danger: true },
    { key: 'taint', label: '阴气', init: 16, max: 100, danger: true },
    { key: 'clue', label: '线索', init: 0, max: 12 },
    { key: 'escape', label: '逃生进度', init: 0, max: 7 }
  ],
  relations: [
    { key: 'lu', name: '陆时', role: '隔壁 403 租客 · 规则破坏者', init: 18, max: 100 }
  ],
  items: {
    rulepaper: { name: '槐阴公寓住户规则', desc: '一张受潮的红色油纸', tags: ['规则', '关键'], icon: '纸' },
    flashlight: { name: '旧手电', desc: '电量不多，但能照见门牌', tags: ['工具'], icon: '电' },
    key404: { name: '404 铜钥匙', desc: '钥匙柄上刻着一只闭着的眼', tags: ['关键', '危险'], icon: '钥' },
    talisman: { name: '半张镇宅符', desc: '符角写着“勿应三声”', tags: ['符箓', '防身'], icon: '符' },
    candy: { name: '水果硬糖', desc: '陆时塞给你的，甜得有点发苦', tags: ['食物', '关系'], icon: '糖' }
  },
  startItems: [{ id: 'rulepaper', qty: 1 }, { id: 'flashlight', qty: 1 }],
  skills: [
    { id: 'listen', name: '听门术：分辨敲门声' },
    { id: 'seal', name: '朱砂封门（未掌握）' }
  ],
  rules: [
    { text: '二十三点后，不要照走廊尽头的镜子。', code: 'R-01' },
    { text: '电梯停在四楼时，不要走出轿厢。', code: 'R-02' },
    { text: '听到三长两短的敲门声，不要应答，也不要开门。', code: 'R-03' },
    { text: '红伞只能在雨天打开；在室内打开，会有人替你撑伞。', code: 'R-04' },
    { text: '管理员老周没有影子。向他问好，但不要跟他走。', code: 'R-05' },
    { text: '如果你看见 404 的门牌，说明它已经记住你了。', code: 'R-06' }
  ],
  places: [
    { name: '公寓大厅', desc: '登记处、旧信箱、管理员室', unlocked: true },
    { name: '四楼走廊', desc: '404 与尽头的镜子', unlocked: true },
    { name: '电梯', desc: '总是自己停到四楼', unlocked: true },
    { name: '天台', desc: '晾衣绳与一座小神龛', unlocked: false },
    { name: '地下室', desc: '配电房后面的铁门', unlocked: false }
  ],
  freeActions: [
    { keys: ['搜索', '找', '调查'], text: '你在墙角摸到一层潮湿的纸灰，线索多了一点。', eff: { stats: { clue: 1, sanity: -2 } } },
    { keys: ['休息', '睡'], text: '你靠着门坐了一会儿，心跳慢下来，但走廊里始终有脚步声。', eff: { stats: { sanity: 4, taint: 1 } } },
    { keys: ['陆时', '交谈', '聊'], text: '陆时把温热的糖塞进你手心：“别死，我还缺个室友。”', eff: { rel: { lu: 6 }, addItems: [{ id: 'candy', qty: 1 }] } },
    { keys: ['镜子'], text: '你走到镜子前，镜中的你比现实慢了半拍。', eff: { stats: { sanity: -8, taint: 6, clue: 1 } }, next: 'mirror' },
    { keys: ['电梯'], text: '电梯门自己开了，楼层灯停在 4。', eff: { stats: { taint: 4 } }, next: 'elevator' },
    { keys: ['天台'], text: '你沿消防梯爬上天台，风里全是纸灰。', eff: { stats: { clue: 1, sanity: -3 } }, next: 'roof' },
    { keys: ['地下室', '配电'], text: '你绕到配电房后面，铁门上挂着一把生锈的锁。', eff: { stats: { clue: 1, taint: 5 } }, next: 'basement' },
    { keys: ['符', '贴'], text: '你把半张符压在门缝下，门外的脚步声停了一瞬。', eff: { stats: { taint: -4, sanity: 2 } } }
  ],
  start: 'arrive',
  scenes: {
    arrive: {
      chapter: '第一夜 · 入住',
      place: '公寓大厅',
      title: '你租下了 403',
      text: '槐阴公寓没有电梯广告，只有一股潮木头的味道。\n管理员老周把钥匙推过登记台，笑得像一张被水泡过的纸：“晚上别乱走，四楼在修。”\n你低头看见登记簿上，403 的上一任租客名字被红笔反复涂掉。\n走廊尽头，一个穿黑色外套的年轻男人正靠在墙边看你。他叫陆时，住在 403 隔壁。',
      choices: [
        { label: '先读门上的住户规则', hint: '线索 +1，拿到规则纸', eff: { stats: { clue: 1, sanity: -1 }, flags: { readRules: true } }, next: 'room403' },
        { label: '走过去问陆时四楼在修什么', hint: '关系 +8，触发陆时线', eff: { rel: { lu: 8 }, flags: { metLu: true } }, next: 'meetLu' },
        { label: '把钥匙放回柜台，今晚先离开', hint: '理智 +2，但公寓会记住你', eff: { stats: { sanity: 2, taint: 3 }, flags: { triedLeave: true } }, next: 'lobbyLock' }
      ]
    },
    lobbyLock: {
      chapter: '第一夜 · 门禁',
      place: '公寓大厅',
      title: '大门不见了',
      text: '你转身时，玻璃大门已经变成一排贴满小广告的防盗门。老周的位置空了，登记簿还在自己翻页。\n身后传来一声很轻的笑。陆时站在楼梯口，手里转着一把钥匙：“新来的？这楼不让人走，除非你把它哄睡。”',
      choices: [
        { label: '跟陆时上楼，先保命', hint: '关系 +10，进入 403', eff: { rel: { lu: 10 }, flags: { metLu: true } }, next: 'meetLu' },
        { label: '砸门，喊外面的人', hint: '阴气 +8，理智 -6', eff: { stats: { taint: 8, sanity: -6 }, flags: { noise: true } }, next: 'room403' }
      ]
    },
    meetLu: {
      chapter: '第一夜 · 邻居',
      place: '四楼走廊',
      title: '陆时不想一个人死',
      text: '陆时把一罐热咖啡塞给你，自己却没喝。他说这栋楼每年都要“收租”：先让新住户看见规则，再让规则慢慢变成真的。\n“我数过，走廊有 13 扇门，但登记簿只写了 12 户。”他抬眼看向你，“第 13 扇，是 404。”\n你注意到他右手腕上有一道很浅的红痕，像被什么东西抓过。',
      choices: [
        { label: '把门上的规则纸分给他一半', hint: '关系 +12，线索 +1', eff: { rel: { lu: 12 }, stats: { clue: 1 }, flags: { sharedRules: true } }, next: 'room403' },
        { label: '问他手腕上的伤', hint: '关系 +6，得知“镜中人”', eff: { rel: { lu: 6 }, stats: { clue: 1 }, flags: { knowsMirror: true } }, next: 'mirror' },
        { label: '先回 403 锁门，谁都不信', hint: '理智 +4，关系 -4', eff: { stats: { sanity: 4 }, rel: { lu: -4 } }, next: 'room403' }
      ]
    },
    room403: {
      chapter: '第一夜 · 23:00',
      place: '403 室内',
      title: '规则开始生效',
      text: '23:00，整栋楼的灯同时暗了一秒。\n你听见走廊尽头传来三长两短的敲门声——不是敲你的门，是敲隔壁 404。\n桌上那张住户规则纸自己挪了位置，第一行被红笔圈住：二十三点后，不要照走廊尽头的镜子。\n陆时给你发来一条消息：“别开门。也别去镜子那边。”',
      choices: [
        { label: '遵守规则，关灯上床', hint: '理智 +5，阴气 -2', eff: { stats: { sanity: 5, taint: -2 }, flags: { firstNightSafe: true } }, next: 'night2' },
        { label: '贴着猫眼往外看', hint: '线索 +2，理智 -6', eff: { stats: { clue: 2, sanity: -6, taint: 4 }, flags: { saw404: true } }, next: 'corridor' },
        { label: '给陆时打电话，让他来 403', hint: '关系 +8，但会引东西过来', eff: { rel: { lu: 8 }, stats: { taint: 3 }, flags: { calledLu: true } }, next: 'corridor' }
      ]
    },
    corridor: {
      chapter: '第二夜 · 猫眼',
      place: '四楼走廊',
      title: '404 的门开着',
      text: '猫眼里，走廊的声控灯一盏一盏亮过来，却没有任何人。\n404 的门开着一条缝，里面摆着一张和你房间一模一样的书桌。桌上放着一本登记簿，403 那一页写着你的名字——笔迹已经干了很久。\n陆时从 403 出来，看到你时明显松了口气。他压低声音：“你看见了？它开始复制房间了。”',
      choices: [
        { label: '和陆时一起进 404 找登记簿', hint: '线索 +2，关系 +10', eff: { rel: { lu: 10 }, stats: { clue: 2, taint: 6 }, flags: { entered404: true } }, next: 'fourthRoom' },
        { label: '先回 403，拿手电照镜子', hint: '触发镜子线', eff: { stats: { taint: 5, clue: 1 } }, next: 'mirror' },
        { label: '把 404 的门关上，贴符', hint: '阴气 -5，理智 +4', eff: { stats: { taint: -5, sanity: 4 }, addItems: [{ id: 'talisman', qty: 1 }] }, next: 'night2' }
      ]
    },
    mirror: {
      chapter: '第二夜 · 镜中人',
      place: '四楼走廊',
      title: '镜子里的你先笑了',
      text: '走廊尽头的穿衣镜蒙着一层灰。你抬手擦掉灰尘，镜中的自己却慢了一拍才抬头。\n更糟的是，镜子里站着两个人。一个是你，另一个是陆时——但镜子里的陆时，正把手搭在你肩上。\n现实中的陆时站在三米外，脸色发白：“别回应它。它想借你的名字出去。”',
      choices: [
        { label: '用规则纸盖住镜子，拉着陆时后退', hint: '理智 +3，线索 +1', eff: { stats: { sanity: 3, clue: 1, taint: -3 }, rel: { lu: 6 }, flags: { coveredMirror: true } }, next: 'night2' },
        { label: '对镜中的陆时说“你是谁”', hint: '理智 -12，阴气 +12，得到真相碎片', eff: { stats: { sanity: -12, taint: 12, clue: 2 }, flags: { mirrorAnswered: true } }, next: 'mirrorDeep' },
        { label: '砸碎镜子', hint: '阴气 +15，可能放它出来', eff: { stats: { taint: 15, sanity: -8 }, flags: { brokeMirror: true } }, next: 'night3' }
      ]
    },
    mirrorDeep: {
      chapter: '第二夜 · 借名',
      place: '镜面之后',
      title: '它记得你的名字',
      text: '镜中的陆时回答：“我是上一任 403。它把我的名字吃掉了，我只好借别人的。”\n他伸出手，掌心写着你的名字。\n“把名字给我，我就能替你去死。陆时也会安全。”\n你听见现实的陆时在很远的地方喊你，声音像隔着一层水。',
      choices: [
        { label: '拒绝借名，握紧陆时的声音', hint: '理智 -6，关系 +14', eff: { stats: { sanity: -6, taint: 4 }, rel: { lu: 14 }, flags: { refusedMirror: true, knowsName: true } }, next: 'night2' },
        { label: '把名字划掉一半，换线索', hint: '线索 +3，阴气 +10', eff: { stats: { clue: 3, taint: 10 }, flags: { halfName: true } }, next: 'basement' },
        { label: '转身跑向陆时的声音', hint: '关系 +8，理智 +2', eff: { rel: { lu: 8 }, stats: { sanity: 2, taint: 3 } }, next: 'night2' }
      ]
    },
    elevator: {
      chapter: '第三夜 · 四楼',
      place: '电梯',
      title: '电梯自己按了 4',
      text: '你进电梯，按了 1。轿厢却缓慢上升，数字停在 4。\n门打开，四楼走廊的灯全灭，只有 404 门缝里透出暖光。\n一个穿红裙的女人站在电梯角落——你确定刚才没人。她低着头，手里抱着一个没有脸的布娃娃。\n规则第二条在你脑子里响：电梯停在四楼时，不要走出轿厢。',
      choices: [
        { label: '按住关门键，退回 1 楼', hint: '理智 +5，阴气 -3', eff: { stats: { sanity: 5, taint: -3 }, flags: { elevatorSafe: true } }, next: 'night3' },
        { label: '走出电梯，去 404', hint: '线索 +2，阴气 +9', eff: { stats: { clue: 2, taint: 9 }, flags: { leftElevator: true } }, next: 'fourthRoom' },
        { label: '问红裙女人是谁', hint: '理智 -8，得到“租约”线索', eff: { stats: { sanity: -8, taint: 5, clue: 2 }, flags: { woman: true } }, next: 'fourthRoom' }
      ]
    },
    fourthRoom: {
      chapter: '第三夜 · 404',
      place: '404 室内',
      title: '第 13 户',
      text: '404 的布局和 403 完全一样，只是所有家具都朝墙摆放。\n墙上贴满住户规则，每一张的末尾都有一行不同的字：\n“已收租。”“已收租。”“已收租。”\n书桌抽屉里有一本厚册子，记录着每任 403 租客的死法。最后一页空白，页眉写着你的名字。旁边压着一把铜钥匙，钥匙柄上刻着一只闭着的眼。',
      choices: [
        { label: '拿走铜钥匙和登记册', hint: '获得关键物，线索 +2', eff: { stats: { clue: 2, taint: 7 }, addItems: [{ id: 'key404', qty: 1 }], flags: { gotKey: true } }, next: 'basement' },
        { label: '撕掉写着自己名字的那页', hint: '阴气 -4，理智 -3，激怒公寓', eff: { stats: { taint: -4, sanity: -3 }, flags: { torePage: true } }, next: 'night3' },
        { label: '先离开，去找陆时商量', hint: '关系 +10', eff: { rel: { lu: 10 }, flags: { toldLu404: true } }, next: 'roof' }
      ]
    },
    roof: {
      chapter: '第四夜 · 天台',
      place: '天台',
      title: '晾衣绳上的名字',
      text: '天台的风把晾衣绳吹得叮当作响。绳上挂着的不是衣服，而是一张张写满名字的布条。\n陆时已经在这里了。他手里拿着半张符，脚边是一盏没点亮的红灯笼。\n“我找到办法了。”他说，“这栋楼靠名字收租。把 404 的门从里面封住，再把登记簿烧掉，它就会饿。”\n他顿了顿，没看你：“但封门的人，可能出不来。”',
      choices: [
        { label: '我跟你一起封，谁也别留里面', hint: '关系 +20，逃生 +2', eff: { rel: { lu: 20 }, stats: { escape: 2 }, flags: { planSeal: true } }, next: 'basement' },
        { label: '让陆时留下，我去封', hint: '关系 +10，逃生 +1，危险', eff: { rel: { lu: 10 }, stats: { escape: 1, sanity: -5 }, flags: { soloSeal: true } }, next: 'basement' },
        { label: '不封了，找别的出口', hint: '理智 +3，逃生 +1', eff: { stats: { sanity: 3, escape: 1 }, flags: { planEscape: true } }, next: 'night3' }
      ]
    },
    night3: {
      chapter: '第五夜 · 停电',
      place: '四楼走廊',
      title: '整栋楼在呼吸',
      text: '凌晨两点，整栋楼停电。所有门同时打开一条缝，像一排张开的嘴。\n你听见老周在楼下喊：“收租了——收租了——”\n陆时从 403 冲出来，抓住你的手腕往地下室跑。他的手很凉，但握得很紧。\n“别回头。它现在只认名字，不认人。”',
      choices: [
        { label: '跟着陆时去地下室', hint: '关系 +8，进入终局线', eff: { rel: { lu: 8 }, stats: { taint: 6 } }, next: 'basement' },
        { label: '先回 403 拿登记册和符', hint: '线索 +1，阴气 +5', eff: { stats: { clue: 1, taint: 5 }, flags: { gotBook: true } }, next: 'basement' },
        { label: '甩开他，自己找大门', hint: '关系 -8，逃生 +1', eff: { rel: { lu: -8 }, stats: { escape: 1, sanity: -4 } }, next: 'lobbyLock' }
      ]
    },
    basement: {
      chapter: '终夜 · 地下室',
      place: '地下室',
      title: '门后的租约',
      text: '地下室没有配电箱，只有一扇铁门。门上贴着 13 张泛黄的租约，最下面一张是你的。\n陆时用铜钥匙打开门。门后是一间倒置的 403：天花板是地板，床悬在头顶，镜子铺满整面墙。\n房间中央摆着一盏红灯笼，灯芯是一截人的指骨。\n陆时低声说：“烧掉登记簿，把门从里面锁上。灯笼就会灭。”\n可他没说，锁门之后，钥匙会落在谁手里。',
      choices: [
        { label: '把登记簿扔进灯笼，和陆时一起退出', hint: '封印成功，关系 +15', eff: { rel: { lu: 15 }, stats: { taint: -8, escape: 2 }, flags: { sealed: true } }, next: 'finale' },
        { label: '让陆时先出去，自己留下锁门', hint: '献祭线，陆时关系 +25', eff: { rel: { lu: 25 }, stats: { taint: 15, sanity: -10 }, flags: { sacrifice: true } }, next: 'finale' },
        { label: '不烧登记簿，拿它和老周谈条件', hint: '理智 -4，线索 +2，可能逃出', eff: { stats: { sanity: -4, clue: 2, escape: 1 }, flags: { bargain: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终夜 · 天亮之前',
      place: '地下室',
      title: '最后一盏灯',
      text: '灯笼的火苗缩成一颗红豆。\n整栋楼安静下来，安静得能听见陆时的呼吸。\n铁门在你身后缓缓合拢。你手里还握着那把铜钥匙，钥匙柄上的眼睛不知道什么时候睁开了。\n陆时站在门外，隔着门缝看你。他没有说话，只是把手掌贴在铁门上。',
      choices: [
        { label: '把钥匙从门缝塞给陆时，让他走', hint: '关系 +20，触发“天亮之前”', eff: { rel: { lu: 20 }, flags: { gaveKey: true, escaped: true } }, next: 'end' },
        { label: '转动钥匙，把门从里面锁死', hint: '触发“封门”或“共生”', eff: { flags: { sealed: true }, stats: { taint: 10 } }, next: 'end' },
        { label: '把登记簿最后一页撕下来，写下两个人的名字', hint: '触发“共生”', eff: { rel: { lu: 25 }, flags: { bothNames: true, sealed: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '槐阴公寓', title: '门外的天光', text: '你听见远处传来第一声鸟叫。', choices: [] }
  },
  events: [
    { id: 'knock', title: '三长两短的敲门声', if: function (s) { return s.day >= 1; }, text: '门外有人用指节敲了三下，停两秒，又敲两下。你没有应答，但门缝下塞进来一张湿透的规则纸。', eff: { stats: { taint: 4, sanity: -3 }, addItems: [{ id: 'talisman', qty: 1 }] } },
    { id: 'lu_fever', title: '陆时发起了低烧', if: function (s) { return s.rel.lu >= 30; }, text: '陆时靠在 403 门边，额头烫得吓人，却还笑着说自己只是没睡好。你把最后半瓶水递给他。', eff: { rel: { lu: 8 }, stats: { sanity: 3 } } },
    { id: 'red_umbrella', title: '红伞自己开了', if: function (s) { return s.flags.readRules; }, text: '客厅角落的红伞“啪”地撑开，伞下站着一个没有脸的女人。她轻声问：“你要不要躲雨？”你想起规则第四条，退后一步，伞又自己合上。', eff: { stats: { taint: 6, sanity: -5, clue: 1 } } },
    { id: 'old_zhou', title: '管理员老周没有影子', if: function (s) { return s.day >= 2; }, text: '老周站在走廊灯下，脚下空空的。他问你要不要续租，你说再想想。他笑着点头，登记簿上你的名字自己往下沉了一行。', eff: { stats: { taint: 5, sanity: -2 }, flags: { zhouMet: true } } },
    { id: 'whisper', title: '墙里的声音', if: function (s) { return s.stats.taint >= 30; }, text: '墙里有人用你的声音说话：“别信陆时，他也签过租约。”你敲了敲墙，声音停了。', eff: { stats: { sanity: -6, clue: 1 }, flags: { wallWhisper: true } } },
    { id: 'candy', title: '糖纸上的字', if: function (s) { return s.rel.lu >= 45; }, text: '陆时给你的糖纸背面写着一行小字：“如果我忘了自己，叫我的名字。”', eff: { rel: { lu: 6 }, stats: { sanity: 4 }, flags: { luName: true } } },
    { id: 'rain', title: '走廊下起了雨', if: function (s) { return s.day >= 3; }, text: '走廊里突然下起雨，水只落在 404 门口。水洼里倒映出的不是你，而是上一任 403。', eff: { stats: { clue: 1, taint: 4 } } },
    { id: 'mirror_crack', title: '镜子裂了一道缝', if: function (s) { return s.flags.brokeMirror; }, text: '碎片里每一片都映着陆时。他同时抬头，对你说了同一句话：“别回头。”', eff: { stats: { taint: 8, sanity: -8 }, rel: { lu: 5 } } }
  ],
  endings: [
    { id: 'both', title: '共生 · 两个人的租约', if: function (s) { return s.flags.bothNames; }, text: '登记簿上并排写着两个名字。灯笼没有灭，却也不再亮了。\n第二天，槐阴公寓有了两个新管理员。他们只在深夜出现，替彼此留一盏灯。' },
    { id: 'escape', title: '天亮之前', if: function (s) { return s.flags.escaped; }, text: '你把钥匙塞给陆时，他用尽全力把铁门拉开一条缝。\n你们跑出公寓时，天刚亮。身后的楼没有影子，像一张被折起来的纸。\n陆时在街边蹲下，握住你的手腕：“下次别把我一个人留在门里。”' },
    { id: 'seal', title: '封门', if: function (s) { return s.flags.sealed; }, text: '你从里面锁上门。灯笼灭了，整栋楼的灯也一盏一盏熄灭。\n陆时在门外坐了一整夜。天亮后，404 的门牌不见了，403 的登记簿上，你的名字也淡成了空白。\n只有那张糖纸还在他掌心里。' },
    { id: 'sacrifice', title: '新的 404', if: function (s) { return s.flags.sacrifice; }, text: '你留在门里，听见陆时在门外喊你的名字。\n第二天，槐阴公寓又贴出一张招租启事。404 的门永远开着，里面摆着一张和 403 一模一样的书桌。\n一个穿黑外套的年轻人站在门口，手腕上多了一道红痕。' },
    { id: 'taint', title: '你变成了规则', if: function (s) { return s.stats.taint >= 80; }, text: '你开始听不见自己的心跳，却能听见整栋楼的呼吸。\n走廊尽头出现了一面新镜子。镜中的你对新来的租客笑了笑，抬起手指，指向门上的第一行规则。' }
  ],
  nexusLinks: [
    { label: '规则：槐阴公寓住户守则 R-01—R-06', kind: '规则系', target: 'rules' },
    { label: '物品：404 铜钥匙 / 镇宅符', kind: '物品', target: 'items' },
    { label: '人物：陆时 / 管理员老周', kind: '人物档案', target: 'species' }
  ]
};
