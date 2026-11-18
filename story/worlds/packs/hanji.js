/* 世界：永冻觉醒 / 极寒末世 · 异能刷怪 · 双男主 */
window.SL_PACK = {
  id:'hanji', title:'永冻觉醒', subtitle:'零下八十七度 · 异能刷怪',
  kicker:'FROZEN AWAKENING', theme:'survival', layout:'dashboard', modeLabel:'末世刷怪', mode:'survival',
  accent:'#7dd3fc', accent2:'#a78bfa', bg:'#040b14', bg2:'#0d1b2a',
  cover:'../../assets/ui/world_hanji.jpg', turnsPerDay:5, eventChance:.45,
  freePlaceholder:'自由行动：刷冰尸 / 吸晶核 / 生火 / 找秦野 / 修避难所 / 搜物资 / 觉醒技能',
  bgm:[
    {id:'wind',name:'永冻的风',mood:'daily',tempo:60,scale:'minor',lead:'synth',pad:'wind'},
    {id:'horde',name:'尸潮来袭',mood:'tense',tempo:110,scale:'phrygian',lead:'lowStrings',pad:'pulse'},
    {id:'fire',name:'还有火',mood:'hope',tempo:72,scale:'major',lead:'piano',pad:'warm'},
    {id:'ice',name:'冰层下面',mood:'horror',tempo:66,scale:'minor',lead:'choir',pad:'dark'}
  ],
  stats:[
    {key:'hp',label:'生命',init:100,max:100,danger:true},
    {key:'heat',label:'体温',init:62,max:100,danger:true},
    {key:'gene',label:'晶核能量',init:4,max:100},
    {key:'ammo',label:'弹药',init:8,max:99}
  ],
  relations:[
    {key:'qin',name:'秦野',role:'火系觉醒者 · 前消防员',init:24,max:100},
    {key:'shen',name:'沈砾',role:'冰系研究员 · 晶核专家',init:10,max:100},
    {key:'xiao',name:'小满',role:'避难所少年 · 感知型',init:8,max:100}
  ],
  items:{
    core:{name:'冰晶核',desc:'从冰尸颅内取出，摸起来像一块会跳的冰。',tags:['异能','危险'],icon:'核'},
    fuel:{name:'最后一桶柴油',desc:'避难所供暖只够撑三天。',tags:['资源','关键'],icon:'油'},
    rifle:{name:'改装猎枪',desc:'秦野的旧枪，枪托上刻着“活着回来”。',tags:['武器'],icon:'枪'},
    coat:{name:'防寒战术服',desc:'内衬有发热丝，左胸口袋缝着一张全家福。',tags:['防具','保暖'],icon:'衣'},
    map:{name:'冰下地铁图',desc:'标着三个未冻结的物资点，和一个被红笔圈住的“巢”。',tags:['导航','危险'],icon:'图'}
  },
  startItems:[{id:'core',qty:1},{id:'rifle',qty:1},{id:'coat',qty:1}],
  skills:[{id:'fire',name:'余烬'},{id:'ice',name:'冰甲'},{id:'sense',name:'热源感知'}],
  rules:[
    {text:'体温低于 30 会失去行动力；先回火边，再谈战斗。',code:'F-01'},
    {text:'冰尸颅内的晶核只能空手取；戴手套会让晶体瞬间碎裂。',code:'F-02'},
    {text:'天黑后不要进入地铁隧道；里面的东西会模仿你的呼吸。',code:'F-03'},
    {text:'觉醒技能会引来一次尸潮；找好退路再升级。',code:'F-04'},
    {text:'秦野的火只能点三次；第三次之后，他会把自己的温度给你。',code:'F-05'}
  ],
  places:[
    {name:'避难所',desc:'最后一排还能亮的暖气片',unlocked:true},
    {name:'冰原超市',desc:'被雪埋了一半的物资点',unlocked:true},
    {name:'高架桥',desc:'尸潮必经的狭窄通道',unlocked:true},
    {name:'地铁隧道',desc:'冰层下的巢',unlocked:false},
    {name:'研究所',desc:'晶核实验记录',unlocked:false},
    {name:'火种塔',desc:'城市最后的供暖中心',unlocked:false}
  ],
  freeActions:[
    {keys:['刷','冰尸','打怪'],text:'你和秦野在高架下引出一只落单冰尸。它扑过来时，你侧身把枪口塞进它的下颌。晶核在颅骨里亮了一下。',eff:{stats:{hp:-6,gene:5,ammo:-1},rel:{qin:5}}},
    {keys:['晶核','吸收','觉醒'],text:'你把晶核按进掌心，冰从血管里往上爬。秦野抓住你的肩，掌心的火替你压住那股冷。',eff:{stats:{gene:7,heat:-5},rel:{qin:6},flags:{awakened:true}}},
    {keys:['生火','火','取暖'],text:'秦野把手伸进铁盆，掌心腾起一小团火。避难所里的人都不自觉往这边靠。',eff:{stats:{heat:12,hp:4},rel:{qin:6}}},
    {keys:['秦野','找','交谈'],text:'秦野把最后半块压缩饼干掰给你，自己嚼雪：“我答应过带他们出去。现在多了一个你。”',eff:{rel:{qin:9},stats:{heat:3}}},
    {keys:['避难所','修','供暖'],text:'你钻进管道，用柴油和旧风扇修好第二组暖气。孩子们终于不再整夜咳嗽。',eff:{stats:{heat:8,ammo:-1},flags:{heatFixed:true}}},
    {keys:['搜','物资','超市'],text:'你在超市冷柜后面找到一箱罐头和半盒子弹。冰层下面有东西跟着你的脚步移动。',eff:{stats:{ammo:3,heat:-3},flags:{supplies:true}}}
  ],
  start:'shelter',
  scenes:{
    shelter:{chapter:'第一夜 · 避难所',place:'避难所',title:'最后一排暖气片',
      text:'零下八十七度。\n避难所只剩一排暖气片还亮着，柴油表停在最后一格。\n你从雪里爬回来，怀里抱着半箱罐头。秦野蹲在炉边，掌心托着一小团火，像托着一只随时会死的鸟。\n“又带回来一个。”他抬头看你，“外面还有活的吗？”\n你摇头。他把火往你这边推了推。',
      choices:[
        {label:'先把手伸到火边，告诉他外面还有一个人',hint:'体温 +8，秦野 +8',eff:{stats:{heat:8},rel:{qin:8},flags:{promiseRescue:true}},next:'market'},
        {label:'把罐头分给孩子，自己去检查暖气',hint:'避难所 +，体温 -3',eff:{stats:{heat:-3,gene:3},flags:{fedKids:true}},next:'market'},
        {label:'问秦野，晶核能不能让人觉醒',hint:'晶核 +3，秦野 +4',eff:{stats:{gene:3},rel:{qin:4},flags:{askedAwaken:true}},next:'market'}
      ]},
    market:{chapter:'第二日 · 冰原超市',place:'冰原超市',title:'冷柜后面的东西',
      text:'超市的玻璃门被冰封了一半。\n你和秦野从侧门进去，手电扫过空货架。冷柜后面传来指甲刮铁皮的声音。\n“冰尸。”秦野压低声音，“至少三只。”\n他把猎枪递给你，自己掌心已经亮起来。\n“我数三下。”他说，“你打最左边那只，剩下的交给我。”',
      choices:[
        {label:'按秦野的计划，先打最左边',hint:'配合，弹药 -1',eff:{stats:{gene:5,ammo:-2,hp:-4},rel:{qin:10},flags:{teamFight:true}},next:'bridge'},
        {label:'不按计划，先引它们撞冷柜',hint:'危险 +6，晶核 +4',eff:{stats:{gene:4,hp:-8,heat:-4},flags:{coldTrap:true}},next:'bridge'},
        {label:'让秦野放火，自己趁机搜物资',hint:'物资 +，体温 -4',eff:{stats:{ammo:4,heat:-5},rel:{qin:3},flags:{fireSearch:true}},next:'bridge'}
      ]},
    bridge:{chapter:'第三日 · 高架桥',place:'高架桥',title:'尸潮',
      text:'高架桥是回避难所的近路，也是尸潮的必经口。\n你们走到桥中央时，桥下的雪忽然开始动。\n一只、两只、十只，冰尸从桥墩后面爬上来，像一片逆流的白色潮水。\n秦野把你推到护栏边：“跑。”\n他没有跑。他站在桥中央，掌心的火第一次亮得像太阳。',
      choices:[
        {label:'不跑，站到秦野身边一起迎着尸潮',hint:'秦野 +18，生命 -12',eff:{rel:{qin:18},stats:{hp:-12,gene:6},flags:{stoodTogether:true}},next:'tunnel'},
        {label:'按他说的跑，但把猎枪留给他',hint:'安全，秦野 +8',eff:{stats:{heat:-4},rel:{qin:8},flags:{leftGun:true}},next:'tunnel'},
        {label:'引爆桥下的油罐，把尸潮一起埋了',hint:'危险 +10，清场',eff:{stats:{gene:8,heat:-8},flags:{blewBridge:true}},next:'tunnel'}
      ]},
    tunnel:{chapter:'第四日 · 地铁隧道',place:'地铁隧道',title:'冰层下的呼吸',
      text:'桥塌之后，你们只能走地铁隧道。\n隧道里的冰是透明的，能看见下面冻着的人影。\n每走十几步，就有一声呼吸从冰层下面传上来，和你的节奏一模一样。\n沈砾在隧道深处等你们，手里提着三支晶核试管。\n“这些晶核不是从尸体里长出来的。”他说，“是从活人身上掉下来的。”',
      choices:[
        {label:'追问沈砾，晶核到底是什么',hint:'真相，沈砾 +10',eff:{stats:{gene:4},rel:{shen:10},flags:{coreTruth:true}},next:'lab'},
        {label:'先带秦野离开，不碰试管',hint:'秦野 +8，安全',eff:{rel:{qin:8},stats:{heat:2}},next:'lab'},
        {label:'拿走一支试管，现场注射',hint:'觉醒，生命 -10',eff:{stats:{gene:12,hp:-10},flags:{injected:true}},next:'lab'}
      ]},
    lab:{chapter:'第五日 · 研究所',place:'研究所',title:'觉醒记录',
      text:'研究所的应急灯还亮着。\n屏幕上循环播放一段实验录像：志愿者把手伸进晶核，皮肤下面长出第二层冰甲，然后开始忘记自己的名字。\n秦野站在你身后，很久没有说话。\n“我认识录像里的人。”他说，“是我妹妹。”\n他的火在掌心里缩了一下。',
      choices:[
        {label:'关掉录像，握住秦野的手',hint:'秦野 +16，情感线',eff:{rel:{qin:16},stats:{heat:4},flags:{comfortQin:true}},next:'tower'},
        {label:'问他，妹妹最后有没有活下来',hint:'真相，秦野 +10',eff:{rel:{qin:10},stats:{gene:3},flags:{sisterTruth:true}},next:'tower'},
        {label:'继续看录像，找觉醒的副作用',hint:'晶核 +6，理智 -4',eff:{stats:{gene:6,hp:-4},flags:{awakenSide:true}},next:'tower'}
      ]},
    tower:{chapter:'终章前夜 · 火种塔',place:'火种塔',title:'最后一次供暖',
      text:'火种塔是全城最后的供暖中心。\n你们到达时，塔顶的火焰只剩一人高。沈砾说，只要把足够的晶核投进去，火就能再烧一个月。\n秦野站在塔下，掌心已经没有火。\n“我可以烧自己。”他说得平静，“一次，够全城撑到春天。”\n小满在台阶上哭，雪落在他肩上，化成了水。',
      choices:[
        {label:'拦住秦野，把自己的晶核全部投进火里',hint:'结局 · 共同燃烧',eff:{stats:{gene:-10,hp:-8},rel:{qin:20},flags:{shareFire:true}},next:'finale'},
        {label:'让秦野烧自己，你留下来守城',hint:'结局 · 火种不灭',eff:{rel:{qin:14},stats:{heat:-10},flags:{qinSacrifice:true}},next:'finale'},
        {label:'带所有人撤进地铁隧道，放弃火种塔',hint:'结局 · 向地下走',eff:{stats:{heat:6},rel:{qin:8,shen:6},flags:{goUnderground:true}},next:'finale'}
      ]},
    finale:{chapter:'终章 · 冰原',place:'火种塔',title:'春天还很远',
      text:'火种塔的光穿过雪幕，整座城都能看见。\n尸潮停在塔下，像一片被光钉住的白色海。\n秦野站在你身边，掌心还剩最后一粒火星。\n“如果春天真的会来，”他说，“你想做什么？”\n你听见自己的呼吸在风里散开。',
      choices:[
        {label:'带他去看没有冻住的海',hint:'结局 · 春日之约',eff:{rel:{qin:25},flags:{seaPromise:true}},next:'end'},
        {label:'留下重建避难所，把火传下去',hint:'结局 · 新火种',eff:{stats:{gene:10},rel:{qin:12},flags:{rebuild:true}},next:'end'},
        {label:'走进尸潮，替全城争取最后一夜',hint:'结局 · 永冻英雄',eff:{stats:{hp:-20},flags:{lastNight:true}},next:'end'}
      ]},
    end:{chapter:'终章',place:'冰原',title:'雪停之后',text:'雪落在火种塔上，没有立刻融化。',choices:[]}
  },
  events:[
    {id:'cold',title:'体温掉到危险线',if:function(s){return s.stats.heat<=35},text:'你的手指开始失去知觉。秦野把外套解开，把你整个人按进他怀里的那点温度。',eff:{stats:{heat:10},rel:{qin:6}}},
    {id:'kid',title:'小满的感知',if:function(s){return s.rel.xiao>=15},text:'小满突然指向地铁方向：“下面有东西在学你走路。”',eff:{stats:{gene:3},flags:{xiaoWarn:true}}},
    {id:'horde',title:'远处的尸潮',if:function(s){return s.day>=3},text:'冰原尽头出现一条白线。不是雪，是尸潮。它们朝着火种塔的方向移动。',eff:{stats:{heat:-6,danger:4}}},
    {id:'memory',title:'秦野的旧照片',if:function(s){return s.rel.qin>=40},text:'秦野从战术服内袋里摸出一张全家福，照片边缘被火燎过。他指着妹妹，又指了指你：“你们有点像。”',eff:{rel:{qin:8}}},
    {id:'core_echo',title:'晶核在呼唤',if:function(s){return s.stats.gene>=30},text:'你掌心的晶核开始发热，像一颗不属于你的心脏在跳。',eff:{stats:{gene:4,hp:-3},flags:{coreEcho:true}}}
  ],
  endings:[
    {id:'sea',title:'春日之约',if:function(s){return s.flags.seaPromise},text:'春天来得比预想晚。\n你们沿着解冻的公路一直往南，走到第一片没有结冰的海。\n秦野把手伸进水里，掌心没有火，只有温度。\n“原来海是咸的。”他说。\n你没有告诉他，那是因为你在哭。'},
    {id:'newfire',title:'新火种',if:function(s){return s.flags.rebuild},text:'你们留了下来，把火种塔改成新的避难所。\n沈砾负责晶核，小满负责感知，秦野负责火。\n你负责记住每一个没能走进这里的人。\n塔顶的火再没灭过。'},
    {id:'hero',title:'永冻英雄',if:function(s){return s.flags.lastNight},text:'你走进尸潮的那一夜，火种塔的火烧到了天亮。\n秦野在塔下等你，掌心一直亮着。\n雪停了。\n后来有人在冰原上找到一把猎枪，枪托上刻着“活着回来”。'},
    {id:'frozen',title:'冰层之下',if:function(s){return s.stats.hp<=10||s.stats.heat<=0},text:'你倒在离火种塔三百米的地方。\n秦野把你抱进塔里时，你的睫毛已经结了冰。\n他守了三天，火没有灭。\n第四天，冰层下面多了一声和你一样的呼吸。'}
  ],
  nexusLinks:[
    {label:'法则：晶核能量守恒',kind:'宇宙法则',target:'law'},
    {label:'规则：极寒生存守则',kind:'规则系',target:'rules'},
    {label:'人物：林渡 / 秦野 / 沈砾',kind:'人物',target:'chars'}
  ]
};
