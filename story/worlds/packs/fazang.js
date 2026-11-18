/* 世界：法老秘境 / 埃及探险 · 复活干尸 · 双男主 */
window.SL_PACK = {
  id:'fazang', title:'法老秘境', subtitle:'黄沙之下 · 复活的法老',
  kicker:'TOMB OF THE SUN', theme:'dungeon', layout:'dashboard', modeLabel:'古墓探险', mode:'dungeon',
  accent:'#fbbf24', accent2:'#a855f7', bg:'#100b05', bg2:'#1f1608',
  cover:'../../assets/ui/world_egypt.jpg', turnsPerDay:4, eventChance:.45,
  freePlaceholder:'自由行动：读壁画 / 挖宝藏 / 找阿图姆 / 破解机关 / 点燧石 / 逃出口 / 看金棺',
  bgm:[
    {id:'sand',name:'沙下风声',mood:'daily',tempo:62,scale:'minor',lead:'oud',pad:'wind'},
    {id:'trap',name:'机关启动',mood:'tense',tempo:104,scale:'phrygian',lead:'lowStrings',pad:'pulse'},
    {id:'gold',name:'金棺',mood:'hope',tempo:74,scale:'major',lead:'harp',pad:'warm'},
    {id:'mummy',name:'干尸醒来',mood:'horror',tempo:58,scale:'minor',lead:'choir',pad:'dark'}
  ],
  stats:[
    {key:'hp',label:'生命',init:90,max:100,danger:true},
    {key:'torch',label:'火把',init:6,max:99},
    {key:'clue',label:'线索',init:2,max:99},
    {key:'curse',label:'诅咒',init:0,max:100,danger:true}
  ],
  relations:[
    {key:'atum',name:'阿图姆',role:'守墓人后裔 · 会读古埃及文',init:20,max:100},
    {key:'lin',name:'林教授',role:'考古队长 · 失踪又出现',init:8,max:100},
    {key:'camel',name:'老骆驼',role:'向导 · 只认金币',init:4,max:100}
  ],
  items:{
    map:{name:'墓室结构图',desc:'画在金箔上，右下角被人撕走。',tags:['导航','关键'],icon:'图'},
    flint:{name:'燧石与火折',desc:'阿图姆的，点一次能撑半刻钟。',tags:['工具','照明'],icon:'石'},
    ankh:{name:'安卡钥匙',desc:'打开法老内殿的唯一钥匙，摸起来像有脉搏。',tags:['钥匙','诅咒'],icon:'安'},
    scroll:{name:'复活咒文',desc:'只读了一半，后半段被血盖住。',tags:['咒文','危险'],icon:'卷'},
    gold:{name:'法老金饰',desc:'很重，很亮，戴上会听见有人在耳边数心跳。',tags:['宝藏','诅咒'],icon:'金'}
  },
  startItems:[{id:'map',qty:1},{id:'flint',qty:1}],
  skills:[{id:'read',name:'读壁画'},{id:'trap',name:'拆机关'},{id:'run',name:'沙地奔跑'}],
  rules:[
    {text:'壁画上的眼睛如果跟着你转，不要直视；先低头看脚下的影子。',code:'E-01'},
    {text:'金棺打开前必须先点燃四角火盆，否则里面的东西会先醒。',code:'E-02'},
    {text:'干尸移动时没有脚步声，只有沙子从绷带里漏下来的声音。',code:'E-03'},
    {text:'安卡钥匙不能离开墓室；带出去的人会开始忘记自己的名字。',code:'E-04'},
    {text:'复活咒文只能读一次；第二次读，复活的不是法老。',code:'E-05'}
  ],
  places:[
    {name:'金字塔入口',desc:'被风沙埋了一半的石门',unlocked:true},
    {name:'壁画走廊',desc:'眼睛会转的壁画',unlocked:true},
    {name:'机关室',desc:'压力石板与毒箭',unlocked:true},
    {name:'金棺室',desc:'法老与四角火盆',unlocked:false},
    {name:'内殿',desc:'安卡钥匙的锁孔',unlocked:false},
    {name:'地下河',desc:'唯一通往外面的水路',unlocked:false}
  ],
  freeActions:[
    {keys:['壁画','读','眼睛'],text:'你举火把照壁画。画上的眼睛跟着火苗转了一下，又停住。阿图姆在你身后低声说：“别直视，看影子。”',eff:{stats:{clue:3,torch:-1,curse:-2}}},
    {keys:['宝藏','挖','金'],text:'你在碎石堆里挖到一枚金饰。刚拿起，耳边就响起一阵很慢的心跳声。',eff:{stats:{curse:5},addItems:[{id:'gold',qty:1}]},},
    {keys:['阿图姆','交谈','找'],text:'阿图姆用指尖拂过壁画上的名字：“这是我曾祖父。他守这座墓，守到自己也成了墓的一部分。”',eff:{rel:{atum:9},stats:{clue:2}}},
    {keys:['机关','拆','破解'],text:'你按住压力石板，用燧石卡住齿轮。毒箭从头顶擦过，阿图姆把你按进怀里，等机关停转。',eff:{stats:{hp:-4,clue:3},rel:{atum:6}}},
    {keys:['火把','点','燧石'],text:'你点燃备用火把，火光把走廊里的影子拉长。有一道影子比你的动作慢了半拍。',eff:{stats:{torch:3,curse:-2}}},
    {keys:['金棺','法老','看'],text:'金棺盖上刻着法老的脸，眉眼和阿图姆有七分像。棺缝里漏出一线干燥的香气。',eff:{stats:{curse:4,clue:3},flags:{sawCoffin:true}}}
  ],
  start:'entry',
  scenes:{
    entry:{chapter:'第一日 · 入口',place:'金字塔入口',title:'风沙下的门',
      text:'考古队的营地只剩三顶帐篷。\n林教授失踪前留下的最后一条记录是：“金棺不是空的。”\n阿图姆站在金字塔入口，手里举着一支火把，火光只照亮他半张脸。\n“你确定要进去？”他问，“这座墓会记住每一个拿走东西的人。”\n风把沙吹进门缝，像有人在里面呼吸。',
      choices:[
        {label:'跟阿图姆进去，先看墓室结构图',hint:'阿图姆 +8，线索 +2',eff:{rel:{atum:8},stats:{clue:2}},next:'gallery'},
        {label:'先追问林教授失踪的细节',hint:'线索 +3，危险 +4',eff:{stats:{clue:3,curse:2},flags:{askedLin:true}},next:'gallery'},
        {label:'独自点燧石，先探壁画走廊',hint:'火把 +2，危险 +6',eff:{stats:{torch:2,hp:-4},flags:{aloneEntry:true}},next:'gallery'}
      ]},
    gallery:{chapter:'第二日 · 壁画走廊',place:'壁画走廊',title:'会转的眼睛',
      text:'走廊两侧的壁画保存得过于完整。\n每一幅画上都有一双眼睛，画的是不同的人，却都看向同一个方向。\n阿图姆用火把照着一行小字：“看见者，替我看守。”\n“这是守墓人的咒。”他说，“你看了，就得留下点什么。”\n你听见身后有沙子从绷带里漏下来的声音。',
      choices:[
        {label:'用火把烧掉那双眼睛的画',hint:'诅咒 -4，危险 +8',eff:{stats:{torch:-2,curse:-4,hp:-6},flags:{burnedEye:true}},next:'trap'},
        {label:'按阿图姆教的，低头看影子',hint:'安全，阿图姆 +8',eff:{stats:{curse:-3},rel:{atum:8}},next:'trap'},
        {label:'把结构图上的金箔撕下一角，贴住画眼',hint:'线索 +2，诅咒 +3',eff:{stats:{clue:2,curse:3},flags:{goldEye:true}},next:'trap'}
      ]},
    trap:{chapter:'第三日 · 机关室',place:'机关室',title:'四角火盆',
      text:'机关室中央摆着四只铜火盆，盆里没有灰，只有四道刻痕。\n阿图姆说，金棺就在下面，但必须先让四只火盆同时亮起来。\n你们只有一支火把和一块燧石。\n墙角堆着几具干尸，绷带上还挂着考古队的工牌。',
      choices:[
        {label:'拆下火把布条，分四路点火',hint:'火把 -4，机关开',eff:{stats:{torch:-4,hp:-4,clue:2},flags:{litFour:true}},next:'coffin'},
        {label:'用燧石直接点四角，自己留在中央',hint:'危险 +8，阿图姆 +10',eff:{stats:{hp:-8,curse:4},rel:{atum:10},flags:{litCentral:true}},next:'coffin'},
        {label:'先拆一具干尸的绷带当火引',hint:'诅咒 +6，线索 +3',eff:{stats:{curse:6,clue:3},flags:{usedMummy:true}},next:'coffin'}
      ]},
    coffin:{chapter:'第四日 · 金棺室',place:'金棺室',title:'法老的脸',
      text:'金棺盖被四角火光一照，缓缓滑开一道缝。\n里面躺着一个年轻男人，脸上覆着金面具，眉眼和阿图姆几乎一样。\n他的胸口放着安卡钥匙，钥匙下面压着半卷复活咒文。\n阿图姆跪下去，手指悬在面具上方，没有碰：“他不是我祖先。他是我哥哥。”\n棺里的手指动了一下。',
      choices:[
        {label:'先拿安卡钥匙，再拉阿图姆后退',hint:'获得钥匙，危险 +8',eff:{addItems:[{id:'ankh',qty:1}],stats:{curse:6},flags:{gotAnkh:true}},next:'inner'},
        {label:'问阿图姆，哥哥为什么会躺在法老的棺材里',hint:'阿图姆 +14，真相',eff:{rel:{atum:14},stats:{clue:3},flags:{brotherTruth:true}},next:'inner'},
        {label:'读半卷复活咒文，试着让他坐起来',hint:'诅咒 +12，线索 +4',eff:{stats:{curse:12,clue:4},flags:{readSpell:true}},next:'inner'}
      ]},
    inner:{chapter:'第五日 · 内殿',place:'内殿',title:'安卡之锁',
      text:'内殿的门只有安卡钥匙能开。\n门后不是墓室，是一条地下河。水面黑得发亮，对岸有一道通向外面的天光。\n林教授坐在河边，衣服完好，像刚进来不久。\n“你们终于来了。”他说，“别把钥匙带出去。门一开，整座墓都会醒。”\n他身后，金棺室的方向传来绷带拖过石阶的声音。',
      choices:[
        {label:'把钥匙插进锁孔，先开出口',hint:'出口开，诅咒 +8',eff:{stats:{curse:8,clue:2},flags:{openedGate:true}},next:'mummy'},
        {label:'听林教授的，把钥匙留在内殿',hint:'安全，阿图姆 +10',eff:{rel:{atum:10},stats:{curse:-3},flags:{leftKey:true}},next:'mummy'},
        {label:'问林教授，他为什么知道门会醒',hint:'线索 +4，真相',eff:{stats:{clue:4},flags:{linTruth:true}},next:'mummy'}
      ]},
    mummy:{chapter:'终章前夜 · 地下河',place:'地下河',title:'复活的法老',
      text:'干尸从金棺室爬出来了。\n他没有脸，只有金面具和一双干枯的手。绷带拖在地上，沙子一颗颗往下漏。\n阿图姆站在你前面，举起火把：“哥哥。”\n干尸停了一瞬。\n林教授在身后低声念咒，地下河的水开始倒流。\n“咒文只能读一次。”他说，“读错一个音，复活的就是法老，不是他。”',
      choices:[
        {label:'让阿图姆念咒，你替他挡住干尸',hint:'阿图姆 +20，生命 -12',eff:{rel:{atum:20},stats:{hp:-12,curse:6},flags:{coverAtum:true}},next:'finale'},
        {label:'打断林教授，先带阿图姆从水路走',hint:'逃离线，诅咒 +4',eff:{stats:{curse:4},rel:{atum:8},flags:{escapeWater:true}},next:'finale'},
        {label:'抢过咒文，自己读完后半段',hint:'真相，诅咒 +15',eff:{stats:{curse:15,clue:5},flags:{readFull:true}},next:'finale'}
      ]},
    finale:{chapter:'终章 · 天光',place:'地下河',title:'黄沙之上',
      text:'地下河的水位开始下降，天光从对岸的裂口里灌进来。\n干尸停在河中央，金面具裂开一条缝。\n阿图姆站在你身边，手里握着安卡钥匙。\n“把它带出去，我哥哥就能真正死。”他说，“留在这里，这座墓就能继续睡。”\n沙子从头顶落下来，像一场很慢的雨。',
      choices:[
        {label:'带钥匙出去，让阿图姆的哥哥安息',hint:'结局 · 日出',eff:{rel:{atum:25},stats:{curse:8},flags:{takeKeyOut:true}},next:'end'},
        {label:'把钥匙留在内殿，陪阿图姆守墓',hint:'结局 · 守墓人',eff:{rel:{atum:28},flags:{stayTomb:true}},next:'end'},
        {label:'炸掉入口，让整座墓永远埋进沙里',hint:'结局 · 封墓',eff:{stats:{curse:-10},rel:{atum:12},flags:{sealTomb:true}},next:'end'}
      ]},
    end:{chapter:'终章',place:'金字塔外',title:'风沙之后',text:'金字塔在沙里合上了眼。',choices:[]}
  },
  events:[
    {id:'sand',title:'沙暴封门',if:function(s){return s.day>=2},text:'入口被沙暴封住。阿图姆用身体挡在你前面，沙粒打在他背上像细小的枪声。',eff:{stats:{hp:-4,torch:-1}}},
    {id:'lin_note',title:'林教授的笔记',if:function(s){return s.stats.clue>=6},text:'你在石缝里找到一页笔记：“法老不是被复活的，他是被留下来的。”',eff:{stats:{clue:3,curse:2}}},
    {id:'gold_whisper',title:'金饰在说话',if:function(s){return s.stats.curse>=20},text:'你口袋里的金饰开始发热。耳边有人数你的心跳，数到第七下停住。',eff:{stats:{curse:5,hp:-3}}},
    {id:'atum_scar',title:'阿图姆的旧伤',if:function(s){return s.rel.atum>=35},text:'阿图姆换绷带时，你看见他胸口有一道和法老面具一样的裂痕。',eff:{rel:{atum:8},stats:{clue:2}}},
    {id:'flood',title:'地下河涨水',if:function(s){return s.day>=4},text:'地下河的水位突然上涨，水面上浮着一层金色粉末。',eff:{stats:{hp:-5,torch:-2}}}
  ],
  endings:[
    {id:'sun',title:'日出',if:function(s){return s.flags.takeKeyOut},text:'你们带着安卡钥匙走出金字塔。\n太阳从沙丘后面升起来，阿图姆第一次没有遮住脸。\n“他走了。”他说。\n你不知道他说的是哥哥，还是这座墓。\n你把钥匙放进他掌心，他握住你的手，没有放。'},
    {id:'keeper',title:'守墓人',if:function(s){return s.flags.stayTomb},text:'你们留在了内殿。\n阿图姆每天给四角火盆添油，你负责读壁画上的名字。\n地下河的水声像一支很慢的歌。\n“这样也很好。”他说，“至少这次，有人陪我守。”'},
    {id:'seal',title:'封墓',if:function(s){return s.flags.sealTomb},text:'入口塌下来的那一刻，整座金字塔发出一声很长的叹息。\n你们站在沙丘上，看着风把最后的痕迹抹平。\n阿图姆把安卡钥匙埋进沙里：“以后不会有人再吵醒他了。”\n他回头看你，眼睛里终于有了光。'},
    {id:'mummy',title:'第十八次呼吸',if:function(s){return s.stats.curse>=90||s.stats.hp<=10},text:'干尸的手穿过你的胸口时，你没有觉得疼。\n阿图姆抱着你，念完了整卷咒文。\n金字塔深处多了一具新的干尸，胸口放着半张结构图。\n每年风沙起时，守墓人都会听见两个人说话。'}
  ],
  nexusLinks:[
    {label:'法则：名字与复活',kind:'宇宙法则',target:'law'},
    {label:'规则：金字塔守则',kind:'规则系',target:'rules'},
    {label:'人物：顾行 / 阿图姆',kind:'人物',target:'chars'}
  ]
};
