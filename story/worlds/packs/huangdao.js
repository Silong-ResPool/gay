/* 世界：荒岛契约 / 海岛生存 · 双男主 */
window.SL_PACK = {
  id:'huangdao', title:'荒岛契约', subtitle:'潮汐 · 淡水 · 两个人的岛',
  kicker:'ISLAND PACT', theme:'island', layout:'dashboard', modeLabel:'海岛生存', mode:'island',
  accent:'#2dd4bf', accent2:'#fbbf24', bg:'#04110f', bg2:'#190b1f',
  cover:'../../assets/ui/world_island.jpg', turnsPerDay:4, eventChance:.4,
  freePlaceholder:'自由行动：找淡水 / 捕鱼 / 修庇护所 / 找阿澜 / 发信号 / 探索礁洞 / 生火',
  bgm:[
    {id:'tide',name:'潮汐',mood:'daily',tempo:64,scale:'major',lead:'guitar',pad:'waves'},
    {id:'storm',name:'风暴将至',mood:'tense',tempo:98,scale:'minor',lead:'lowStrings',pad:'storm'},
    {id:'camp',name:'篝火',mood:'romance',tempo:70,scale:'dorian',lead:'harmonica',pad:'warm'},
    {id:'reef',name:'礁洞深处',mood:'horror',tempo:60,scale:'phrygian',lead:'choir',pad:'dark'}
  ],
  stats:[
    {key:'hp',label:'体力',init:80,max:100,danger:true},
    {key:'water',label:'淡水',init:2,max:99},
    {key:'trust',label:'阿澜信任',init:14,max:100},
    {key:'signal',label:'信号进度',init:0,max:100}
  ],
  relations:[
    {key:'lan',name:'阿澜',role:'岛上原住民 · 会读潮汐的男人',init:14,max:100},
    {key:'zhou',name:'周屿',role:'货轮大副 · 事故幸存者',init:6,max:100}
  ],
  items:{
    spear:{name:'珊瑚长矛',desc:'阿澜用礁石磨出来的，矛尖有细密的盐纹。',tags:['武器','工具'],icon:'矛'},
    map:{name:'潮汐图',desc:'刻在鲸骨上的旧航海图，标着三个淡水池。',tags:['导航','关键'],icon:'图'},
    radio:{name:'货轮应急电台',desc:'还差一块电池和一根天线。',tags:['工具','求救'],icon:'台'},
    shell:{name:'阿澜的螺号',desc:'吹响时，海面会先安静下来。',tags:['信物','感情'],icon:'螺'},
    fish:{name:'风干鱼',desc:'咸得发苦，但能撑两天。',tags:['食物'],icon:'鱼'}
  },
  startItems:[{id:'spear',qty:1},{id:'shell',qty:1}],
  skills:[{id:'fish',name:'捕鱼'},{id:'tide',name:'读潮'},{id:'fire',name:'钻木取火'}],
  rules:[
    {text:'涨潮前必须回到高处；礁洞会在十分钟内灌满。',code:'I-01'},
    {text:'阿澜不说话时不要追问；他在听海。',code:'I-02'},
    {text:'岛上的红果可以吃，蓝果碰一口就会看见死去的亲人。',code:'I-03'},
    {text:'货轮残骸里的电台不能连续开机超过三分钟；会引来不该来的船。',code:'I-04'},
    {text:'风暴夜不要离开篝火超过十步。',code:'I-05'}
  ],
  places:[
    {name:'沙滩营地',desc:'你醒来的地方',unlocked:true},
    {name:'椰林',desc:'淡水和椰子',unlocked:true},
    {name:'礁石滩',desc:'退潮后能捡到货轮残骸',unlocked:true},
    {name:'礁洞',desc:'阿澜不让你进去的地方',unlocked:false},
    {name:'岛心废墟',desc:'旧灯塔与信号塔',unlocked:false},
    {name:'货轮残骸',desc:'周屿守着的电台',unlocked:false}
  ],
  freeActions:[
    {keys:['淡水','水','找水'],text:'你沿着椰林往里走，找到一处被藤蔓盖住的淡水池。水面上浮着一层细盐。',eff:{stats:{water:3,hp:4}}},
    {keys:['捕鱼','鱼','打猎'],text:'阿澜带你到礁石外沿，用珊瑚长矛扎中一条银鱼。他把鱼递给你，自己留下鱼尾。',eff:{stats:{hp:6},rel:{lan:6},addItems:[{id:'fish',qty:1}]}},
    {keys:['庇护所','修','搭'],text:'你和阿澜用棕榈叶和沉船木板搭起一面挡风的墙。他站在下面伸手试了试高度，肩背几乎贴到你。',eff:{stats:{hp:4,trust:5},rel:{lan:7}}},
    {keys:['阿澜','交谈','找'],text:'阿澜坐在礁石上，用螺号对着海面吹了一声。海安静下来，他回头看你：“它说，今晚有船。”',eff:{rel:{lan:9},stats:{signal:3}}},
    {keys:['信号','求救','电台'],text:'你把电台拆开，发现电池仓里塞着一张货轮船员名单。最后一个名字被海水泡得只剩姓。',eff:{stats:{signal:6},flags:{crewList:true}}},
    {keys:['礁洞','探索','洞'],text:'礁洞入口被潮水封住一半。你举着火把往里走，洞壁上刻满了和阿澜螺号一样的纹。',eff:{stats:{signal:4,hp:-4},flags:{reefGlyph:true}}}
  ],
  start:'wake',
  scenes:{
    wake:{chapter:'第一日 · 沙滩',place:'沙滩营地',title:'潮水送上来的两个人',
      text:'你在一阵咸涩的风里醒来。\n货轮不见了，只剩一片陌生的岛和半截救生艇。\n不远处的礁石上坐着一个男人，皮肤被晒成深麦色，正在用石头磨一根长矛。\n他抬头看你，目光在你手腕的货轮手环上停了一秒。\n“阿澜。”他说，“这座岛的名字。也是我的名字。”\n潮水正在涨。',
      choices:[
        {label:'先跟他走，去高处避开涨潮',hint:'阿澜 +8，安全',eff:{rel:{lan:8},stats:{hp:4},flags:{followLan:true}},next:'coconut'},
        {label:'先问货轮其他幸存者在哪',hint:'线索，阿澜 +4',eff:{rel:{lan:4},stats:{signal:2},flags:{askedCrew:true}},next:'coconut'},
        {label:'自己往椰林找淡水，不依赖他',hint:'独狼线，体力 -4',eff:{stats:{water:2,hp:-4},flags:{alone:true}},next:'coconut'}
      ]},
    coconut:{chapter:'第二日 · 椰林',place:'椰林',title:'淡水池',
      text:'椰林深处有一处被藤蔓盖住的淡水池。\n阿澜用刀割开藤蔓，先捧了一捧水递给你。\n“岛上只有三个淡水池。”他说，“一个在明处，两个在潮汐下面。涨潮时，它们会变成海。”\n你听见远处传来金属摩擦的声音，像货轮的舱门被风推动。',
      choices:[
        {label:'跟阿澜去礁石滩，看看货轮残骸',hint:'探索，信号 +4',eff:{stats:{signal:4},rel:{lan:6}},next:'wreck'},
        {label:'留下修庇护所，把淡水存起来',hint:'体力 +，安全',eff:{stats:{water:2,hp:6},flags:{shelterUp:true}},next:'wreck'},
        {label:'问阿澜，为什么岛上只有他一个人',hint:'阿澜 +10，真相',eff:{rel:{lan:10},flags:{lanStory:true}},next:'wreck'}
      ]},
    wreck:{chapter:'第三日 · 货轮残骸',place:'货轮残骸',title:'电台与名单',
      text:'货轮残骸卡在两块礁石之间，船身被撕开一道口子。\n周屿守在舱门口，手里拿着一根撬棍：“电台还能用，但电池只剩一格。”\n阿澜没有上船。他站在礁石上，看着船舱深处，像在等什么东西出来。\n“里面有人。”周屿压低声音，“不是我们的人。”',
      choices:[
        {label:'先进船舱，把电台和名单带出来',hint:'信号 +8，危险 +6',eff:{stats:{signal:8,hp:-6},addItems:[{id:'radio',qty:1}],flags:{gotRadio:true}},next:'reef'},
        {label:'听阿澜的，先不要进船舱',hint:'阿澜 +8，安全',eff:{rel:{lan:8},stats:{signal:2},flags:{listenedLan:true}},next:'reef'},
        {label:'让周屿守门，你和阿澜从船尾绕进去',hint:'周屿 +6，阿澜 +6',eff:{rel:{lan:6,zhou:6},stats:{signal:5}},next:'reef'}
      ]},
    reef:{chapter:'第四日 · 礁洞',place:'礁洞',title:'潮汐下面的门',
      text:'退潮后，礁洞入口露出来。\n洞壁上刻满螺旋纹，和货轮船底的藤壶排列一模一样。\n阿澜站在洞口，螺号在手里转了一圈：“这里是我不能进去的地方。”\n“为什么？”你问。\n“因为里面有一个和我长得一样的人。”他说，“每年风暴夜，他会出来一次。”',
      choices:[
        {label:'举火把进洞，陪阿澜面对那个人',hint:'阿澜 +16，危险 +8',eff:{rel:{lan:16},stats:{hp:-8,signal:4},flags:{facedDouble:true}},next:'storm'},
        {label:'先回营地准备武器和淡水',hint:'安全，资源 +',eff:{stats:{water:2,hp:4},flags:{prepared:true}},next:'storm'},
        {label:'把螺号留在洞口，试探里面的反应',hint:'线索，阿澜 +6',eff:{rel:{lan:6},stats:{signal:5},flags:{hornTest:true}},next:'storm'}
      ]},
    storm:{chapter:'第五日 · 风暴夜',place:'沙滩营地',title:'海上的第二条船',
      text:'风暴在夜里压过来。\n篝火被风吹得只剩一线，阿澜用身体挡在火前，背脊被雨浇透。\n海面上出现第二条船，没有灯，也没有声音。\n周屿把电台打开，杂音里有人在叫你的名字。\n阿澜抓住你的手腕：“别回答。那不是救援。”',
      choices:[
        {label:'关掉电台，留在火边',hint:'阿澜 +12，安全',eff:{rel:{lan:12},stats:{hp:4},flags:{ignoredShip:true}},next:'tower'},
        {label:'回答电台，问对方是谁',hint:'信号 +10，危险 +12',eff:{stats:{signal:10,hp:-10},flags:{answeredShip:true}},next:'tower'},
        {label:'和阿澜一起把船引向礁石，让它搁浅',hint:'危险 +8，真相',eff:{stats:{signal:6,hp:-6},rel:{lan:10},flags:{wreckedShip:true}},next:'tower'}
      ]},
    tower:{chapter:'终章前夜 · 岛心灯塔',place:'岛心废墟',title:'灯塔上的名字',
      text:'岛心废墟里有一座旧灯塔。\n你们爬上塔顶，发现灯室里刻着几十个名字，每一个都和阿澜有关。\n最下面一行是新刻的：你的名字。\n阿澜站在门口，没有进来。\n“这座岛会记住每一个留下来的人。”他说，“也会让每一个想走的人忘记自己为什么来。”',
      choices:[
        {label:'把自己的名字划掉，选择离开',hint:'结局 · 离岛',eff:{stats:{signal:20},rel:{lan:8},flags:{leaveIsland:true}},next:'finale'},
        {label:'在名字旁边刻上阿澜，选择留下',hint:'结局 · 岛民',eff:{rel:{lan:25},flags:{stayIsland:true}},next:'finale'},
        {label:'点亮灯塔，让所有船都看见这座岛',hint:'结局 · 引航者',eff:{stats:{signal:25},rel:{lan:12},flags:{lightTower:true}},next:'finale'}
      ]},
    finale:{chapter:'终章 · 沙滩',place:'沙滩营地',title:'潮水会记得',
      text:'灯塔亮起来时，整座岛都安静了。\n阿澜站在沙滩上，螺号挂在颈间。\n海面上，第二条船慢慢转向，像一头终于认路的兽。\n“你要走了吗？”他问。\n你听见潮水在脚边退回去。',
      choices:[
        {label:'带阿澜一起上船，去他的海之外',hint:'结局 · 双人远航',eff:{rel:{lan:30},flags:{sailTogether:true}},next:'end'},
        {label:'把螺号留在沙滩，独自登船',hint:'结局 · 一个人的航线',eff:{rel:{lan:12},flags:{sailAlone:true}},next:'end'},
        {label:'烧掉灯塔，和他在岛上过完余生',hint:'结局 · 无人知晓',eff:{rel:{lan:28},flags:{burnTower:true}},next:'end'}
      ]},
    end:{chapter:'终章',place:'沙滩',title:'潮汐尽头',text:'潮水把脚印抹平了。',choices:[]}
  },
  events:[
    {id:'tide_event',title:'潮水提前上涨',if:function(s){return s.day>=2},text:'潮水比预计早了一小时。营地边缘的脚印被一只不属于你的脚踩乱。',eff:{stats:{hp:-4,water:-1}}},
    {id:'lan_song',title:'阿澜的螺号',if:function(s){return s.rel.lan>=30},text:'阿澜在夜里吹响螺号。海面静下来，他低声说：“它在问你，要不要留下。”',eff:{rel:{lan:8}}},
    {id:'blue_fruit',title:'蓝果',if:function(s){return s.stats.hp<=40},text:'你误吃了蓝果，看见一个和你很像的人站在礁石上。他说：“别信阿澜。”',eff:{stats:{hp:-5,signal:3},flags:{blueVision:true}}},
    {id:'wreck_call',title:'残骸里的呼叫',if:function(s){return s.flags.gotRadio},text:'电台自己开机，杂音里有人用你的声音说：“我在这座岛上。”',eff:{stats:{signal:4,hp:-3}}},
    {id:'storm_warn',title:'风暴云墙',if:function(s){return s.day>=4},text:'海平线上立起一堵黑墙。阿澜开始把营地往高处搬。',eff:{stats:{water:-1,hp:-2}}}
  ],
  endings:[
    {id:'sail',title:'双人远航',if:function(s){return s.flags.sailTogether},text:'你和阿澜一起登上那条船。\n他站在甲板上，第一次没有回头看岛。\n“海会记得我们吗？”他问。\n“会。”你说，“但我们可以不记得它。”'},
    {id:'alone',title:'一个人的航线',if:function(s){return s.flags.sailAlone},text:'你独自登船。阿澜留在沙滩上，螺号没有吹。\n船开出很远，你还能看见他站在原处。\n后来每次涨潮，你都会梦见一座没有名字的岛。'},
    {id:'burn',title:'无人知晓',if:function(s){return s.flags.burnTower},text:'灯塔烧起来的那晚，海面上所有船都失去了方向。\n你和阿澜坐在沙滩上，看着火光一点点矮下去。\n“这样就没有人能找到我们了。”他说。\n你握住他的手，听见潮水在身后合拢。'},
    {id:'drown',title:'潮水之下',if:function(s){return s.stats.hp<=10||s.stats.water<=0},text:'淡水耗尽的那天，阿澜把最后一捧水喂给你。\n你醒来时，他不在。\n礁洞深处多了一个和你长得一样的人。'}
  ],
  nexusLinks:[
    {label:'法则：潮汐与记忆',kind:'宇宙法则',target:'law'},
    {label:'规则：荒岛生存守则',kind:'规则系',target:'rules'},
    {label:'人物：陆屿 / 阿澜',kind:'人物',target:'chars'}
  ]
};
