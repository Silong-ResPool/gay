/* 世界：黑狱沉浮 / 误抓 · 翻盘 · 双男主 */
window.SL_PACK = {
  id:'heiyu', title:'黑狱沉浮', subtitle:'误抓 · 铁窗 · 黑白两道',
  kicker:'BLACK PRISON · REBIRTH', theme:'prison', layout:'dashboard', modeLabel:'监狱翻盘', mode:'prison',
  accent:'#d4a24c', accent2:'#8b5cf6', bg:'#08070a', bg2:'#17120d',
  cover:'../../assets/ui/world_prison.jpg', turnsPerDay:4, eventChance:.42,
  freePlaceholder:'自由行动：拉拢 / 锻炼 / 找秦峥 / 查案卷 / 去工坊 / 见典狱长 / 传信',
  bgm:[
    {id:'iron',name:'铁窗雨',mood:'daily',tempo:64,scale:'minor',lead:'cello',pad:'rain'},
    {id:'power',name:'夺权',mood:'tense',tempo:100,scale:'phrygian',lead:'lowStrings',pad:'pulse'},
    {id:'free',name:'出狱以后',mood:'hope',tempo:76,scale:'major',lead:'piano',pad:'warm'},
    {id:'night',name:'放风场夜巡',mood:'horror',tempo:68,scale:'minor',lead:'choir',pad:'dark'}
  ],
  stats:[
    {key:'hp',label:'体质',init:76,max:100,danger:true},
    {key:'power',label:'势力',init:6,max:100},
    {key:'money',label:'资金',init:0,max:9999,unit:'元'},
    {key:'danger',label:'危险值',init:20,max:100,danger:true}
  ],
  relations:[
    {key:'qin',name:'秦峥',role:'前检察官 · 监狱真正的棋手',init:18,max:100},
    {key:'zhou',name:'老周',role:'B 区牢头 · 摇摆的旧势力',init:6,max:100},
    {key:'gu',name:'顾检',role:'市检察院 · 旧案复查',init:4,max:100}
  ],
  items:{
    file:{name:'半页案卷',desc:'死者名字被涂掉，只剩你的签名。纸角有检察院的钢印。',tags:['证据','关键'],icon:'卷'},
    blade:{name:'磨尖的勺柄',desc:'藏在床板下，柄上刻着一个“冤”字。',tags:['武器','危险'],icon:'刃'},
    phone:{name:'典狱长的旧手机',desc:'里面有一段没有备份的通话录音。',tags:['证据','危险'],icon:'机'},
    watch:{name:'秦峥的旧表',desc:'表背刻着“等出去”。他从不摘下来。',tags:['信物','感情'],icon:'表'},
    letter:{name:'申诉信',desc:'还差一个证人签名，和一个能打开档案柜的人。',tags:['证据'],icon:'信'}
  },
  startItems:[{id:'file',qty:1},{id:'blade',qty:1},{id:'letter',qty:1}],
  skills:[{id:'read',name:'看人'},{id:'fight',name:'近身格斗'},{id:'law',name:'法条记忆'}],
  rules:[
    {text:'放风场第三个水龙头是旧势力的交货点，碰了就要站队。',code:'P-01'},
    {text:'新人不站队，活不过第一个月；站错队，活不过第一个冬天。',code:'P-02'},
    {text:'典狱长的话只能信一半，另一半要用录音换。',code:'P-03'},
    {text:'秦峥替你挡过一刀；这笔债，要用整座监狱来还。',code:'P-04'},
    {text:'越接近出狱，越要小心“意外”。',code:'P-05'}
  ],
  places:[
    {name:'入监区',desc:'铁门、编号与第一顿冷饭',unlocked:true},
    {name:'B 区牢房',desc:'你和秦峥的上下铺',unlocked:true},
    {name:'放风场',desc:'势力交接的地盘',unlocked:true},
    {name:'工坊',desc:'案卷与武器的来源',unlocked:true},
    {name:'医务室',desc:'秦峥替你换药的地方',unlocked:false},
    {name:'典狱长办公室',desc:'黑白两道的交易桌',unlocked:false}
  ],
  freeActions:[
    {keys:['拉拢','结盟','收买'],text:'你把半包烟递给邻铺，换来一句：“B 区今晚有人要动秦峥。”',eff:{stats:{power:5,danger:4}}},
    {keys:['锻炼','健身','练'],text:'你在床沿做俯卧撑，秦峥靠在墙边替你数。数到第三十下，他的声音低了下去。',eff:{stats:{hp:8},rel:{qin:5}}},
    {keys:['查案','案卷','翻案'],text:'你把半页案卷翻过来，对着灯看。纸背浮出一行压痕：证人还活着，在 B 区。',eff:{stats:{power:4},rel:{qin:6},flags:{witnessAlive:true}}},
    {keys:['秦峥','交谈','聊'],text:'秦峥替你整理衣领，指尖在领口停了一瞬：“出去以后，别再拿命换清白。”',eff:{rel:{qin:9},stats:{danger:-2}}},
    {keys:['工坊','搜','找'],text:'你在工坊废料堆里摸到一截铁片，还有一本被油布包住的旧账。',eff:{addItems:[{id:'blade',qty:1}],stats:{danger:4,power:3}}},
    {keys:['典狱长','老周','打听'],text:'老周在洗衣房等你，手里转着一串钥匙：“想见典狱长？先拿点东西来换。”',eff:{stats:{power:5,danger:3},flags:{zhouContact:true}}}
  ],
  start:'intake',
  scenes:{
    intake:{chapter:'第 1 日 · 入监',place:'入监区',title:'编号 0417',
      text:'你被推进铁门时，雨正从屋檐上往下砸。\n罪名是“故意杀人”。你没有做过，但所有证据都指向你：死者的最后一条通话记录，恰好是你的号码。\n走廊尽头，一个穿灰衬衫的男人靠在墙边，手里没有烟，只有一枚旧表。\n他抬眼看了看你的编号，又看了看押送警：“新来的？”\n他叫秦峥，入狱前是检察官。',
      choices:[
        {label:'走到秦峥身边，让他带你进 B 区',hint:'秦峥保护 · 主受线',eff:{rel:{qin:14},flags:{protected:true}},next:'cell'},
        {label:'挡在秦峥前面，先替他接下老周的挑衅',hint:'你保护秦峥 · 主攻线',eff:{stats:{power:6,hp:-5},rel:{qin:10},flags:{protector:true}},next:'cell'},
        {label:'谁也不靠，自己走进去',hint:'独狼线 · 危险 +6',eff:{stats:{danger:6,power:3}},next:'cell'}
      ]},
    cell:{chapter:'第 2 日 · B 区',place:'B 区牢房',title:'上下铺',
      text:'B 区的灯整夜不关。\n你的床在上铺，秦峥在下铺。他把半页案卷垫在枕头下面，像垫着一把枪。\n“0417，”他仰头看你，“你被判了七年。想在这里活到第七年，得先让别人怕你。”\n走廊里传来铁棍拖过地面的声音。老周的人正在往这边走。',
      choices:[
        {label:'把秦峥护在身后，正面迎上老周',hint:'势力 +8，危险 +6',eff:{stats:{power:8,danger:6,hp:-6},rel:{qin:8,zhou:-5},flags:{stoodUp:true}},next:'yard'},
        {label:'听秦峥的，先退到监控死角',hint:'人脉 +6，秦峥 +6',eff:{stats:{power:6},rel:{qin:6},flags:{listened:true}},next:'yard'},
        {label:'拿出案卷，问秦峥当年为什么辞职',hint:'线索，秦峥 +8',eff:{rel:{qin:8},flags:{askResign:true}},next:'yard'}
      ]},
    yard:{chapter:'第 3 日 · 放风场',place:'放风场',title:'第三个水龙头',
      text:'放风场的第三个水龙头底下，摆着一只没有标签的塑料桶。\n老周的人守在旁边，谁靠近就打谁。秦峥说，那桶里是从医务室流出来的止痛药，再往外卖，就是一条人命。\n“你要势力，就得先把这条线切断。”秦峥把一枚磨尖的勺柄塞进你袖口。',
      choices:[
        {label:'当着所有人砸掉药桶，立规矩',hint:'势力 +12，危险 +10',eff:{stats:{power:12,danger:10,hp:-8},rel:{qin:10,zhou:-15},flags:{brokeMarket:true}},next:'workshop'},
        {label:'截下药桶，转手卖给老周换消息',hint:'资金 +800，势力 +8',eff:{stats:{money:800,power:8,danger:4},flags:{zhouDeal:true}},next:'workshop'},
        {label:'先不动，暗中记下所有接头人',hint:'线索 +2，危险 +2',eff:{stats:{power:4,danger:2},flags:{recorded:true}},next:'workshop'}
      ]},
    workshop:{chapter:'第 4 日 · 工坊',place:'工坊',title:'一本账，一把刀',
      text:'工坊的缝纫机下面藏着一只铁盒。\n你撬开它，里面是老周的旧账本，还有一张被撕掉一半的探视记录。\n记录上写着你的名字，和一个你从未见过的证人编号。\n秦峥盯着那行字，忽然笑了：“我说过，你的案子不止你一个人。”\n门外，老周的人正在清点工坊。',
      choices:[
        {label:'带走账本，从洗衣房绕出去',hint:'获得账本，危险 +6',eff:{addItems:[{id:'file',qty:1}],stats:{danger:6},rel:{qin:6},flags:{hasLedger:true}},next:'riot'},
        {label:'把账本交给老周，换典狱长见面机会',hint:'势力 +10，线索 +1',eff:{stats:{power:10,danger:4},flags:{zhouLedger:true,meetWarden:true}},next:'warden'},
        {label:'先问秦峥，为什么他知道证人编号',hint:'秦峥 +12，真相',eff:{rel:{qin:12},flags:{qinSecret:true}},next:'infirmary'}
      ]},
    riot:{chapter:'第 5 日 · 暴动',place:'B 区牢房',title:'铁门开了',
      text:'夜里十一点，B 区的铁门被人从外面打开。\n老周带着人冲进来，手里提着钢管。有人喊“0417 是条子的人”，整层牢房都醒了。\n秦峥把你推到床后，自己迎上去。第一根钢管落在他肩上时，你听见骨头响。\n“别出来。”他背对着你，声音很稳。',
      choices:[
        {label:'冲出去替秦峥挡第二棍',hint:'秦峥 +18，重伤',eff:{stats:{hp:-22,power:8},rel:{qin:18},flags:{tookBlow:true}},next:'infirmary'},
        {label:'拉响消防警报，逼狱警提前介入',hint:'危险 -8，势力 +5',eff:{stats:{danger:-8,power:5},rel:{qin:8},flags:{alarm:true}},next:'warden'},
        {label:'趁乱夺下老周的账本，反手栽赃',hint:'老周 -20，势力 +10',eff:{stats:{power:10,danger:6},rel:{zhou:-20},flags:{framedZhou:true}},next:'warden'}
      ]},
    infirmary:{chapter:'第 6 日 · 医务室',place:'医务室',title:'灯坏之后',
      text:'医务室的灯坏了，只剩走廊的一线白光。\n秦峥坐在床边，替你处理肩上的伤。他的手指很稳，呼吸却不像。\n“你刚才不该出来。”他说。\n“你替我挡的时候，也没想过该不该。”\n他沉默了很久，忽然低头，把额头抵在你肩上。那一小块皮肤，比伤口还烫。',
      choices:[
        {label:'伸手抱住他，什么也不问',hint:'秦峥 +20，心动',eff:{rel:{qin:20},flags:{intimate:true}},next:'warden'},
        {label:'问他，出去以后会不会走',hint:'秦峥 +12，约定',eff:{rel:{qin:12},flags:{promise:true}},next:'warden'},
        {label:'把旧表还给他，先谈正事',hint:'势力 +5，秦峥 +6',eff:{stats:{power:5},rel:{qin:6},flags:{watchReturned:true}},next:'warden'}
      ]},
    warden:{chapter:'第 7 日 · 典狱长办公室',place:'典狱长办公室',title:'白道也要讲价',
      text:'典狱长把一叠文件推到你面前。\n“你替老周顶了太多事。”他说，“现在他上面的人要弃车保帅。你只要签了这份口供，我可以让你提前出去。”\n文件下面压着一张探视单。证人还活着，被关在另一座看守所。\n秦峥站在你身后，没有说话。你知道他在等你自己选。',
      choices:[
        {label:'拒绝签字，拿录音换正式翻案',hint:'翻案线 · 危险 +12',eff:{stats:{danger:12,power:6},addItems:[{id:'phone',qty:1}],flags:{refuseDeal:true}},next:'finale'},
        {label:'假意签字，暗中录下典狱长的话',hint:'获得录音，势力 +8',eff:{stats:{power:8,danger:8},addItems:[{id:'phone',qty:1}],flags:{recordedWarden:true}},next:'finale'},
        {label:'要求先见证人，再谈条件',hint:'线索 +1，秦峥 +8',eff:{stats:{power:6},rel:{qin:8},flags:{witnessMeet:true}},next:'finale'}
      ]},
    finale:{chapter:'终章 · 放风场',place:'放风场',title:'整座监狱都在看',
      text:'放风场的喇叭响了三次。\n老周被按在地上，他身后的人一个个退开。顾检站在典狱长身边，手里拎着那只旧账本。\n你站在人群中央，秦峥在你半步之后。\n铁门外的天是灰的，但有一线光正从云缝里漏下来。\n“0417，”秦峥在你耳边说，“你可以走了。”',
      choices:[
        {label:'牵着秦峥，从正门走出去',hint:'幸福结局',eff:{rel:{qin:25},flags:{walkOut:true}},next:'end'},
        {label:'留下接管监狱，让秦峥先出去等你',hint:'黑牢之王',eff:{stats:{power:25},rel:{qin:10},flags:{prisonKing:true}},next:'end'},
        {label:'把证据交给顾检，先洗清罪名',hint:'沉冤昭雪',eff:{stats:{power:15},flags:{cleared:true}},next:'end'}
      ]},
    end:{chapter:'终章',place:'监狱正门',title:'门外的风',text:'铁门在身后合上。',choices:[]}
  },
  events:[
    {id:'blade',title:'床板下的刀片',if:function(s){return s.day>=1},text:'你在床板缝里摸到一片磨尖的塑料。秦峥没有问，只把它接过去，替你藏好。',eff:{rel:{qin:4},stats:{danger:2}}},
    {id:'visit',title:'一封没有署名的探监单',if:function(s){return s.flags.askResign||s.day>=2},text:'探监室玻璃上蒙着雾。对面的人只写了一个地址，又把纸撕碎。',eff:{stats:{power:4},flags:{clueAddress:true}}},
    {id:'qin_wound',title:'秦峥的肩伤又裂开',if:function(s){return s.rel.qin>=30},text:'秦峥换衣服时，肩胛上的旧伤露出来。他说是入狱前留下的，可那道疤和狱警的警棍形状一样。',eff:{rel:{qin:8},stats:{hp:-3}}},
    {id:'storm',title:'放风场提前清场',if:function(s){return s.stats.danger>=35},text:'狱警把所有人在雨里赶回牢房。有人在队伍最后被拖走，地上留了一只鞋。',eff:{stats:{danger:6,power:3}}},
    {id:'rain',title:'雨夜里的上下铺',if:function(s){return s.rel.qin>=45},text:'雨敲在铁皮顶上。秦峥从下铺伸手上来，碰了碰你的床沿：“睡着了吗？”你没有回答，只把手垂下去。',eff:{rel:{qin:8}}}
  ],
  endings:[
    {id:'walk',title:'门外有风',if:function(s){return s.flags.walkOut},text:'你牵着秦峥走出监狱正门。铁门在身后合上，像合上一本旧账。\n他抬手替你挡住久违的阳光，指尖停在你的眉骨上。\n“以后别再进来了。”他说。\n“那要看你在不在外面。”'},
    {id:'king',title:'黑牢之王',if:function(s){return s.flags.prisonKing},text:'你留了下来。老周的位置、顾检的线、典狱长的账，全都换成了你的名字。\n黑白两道开始怕一个编号 0417 的人。\n只有秦峥每个月十五来探监，坐在玻璃对面，替你把衣领整理好。\n“我在外面等你。”他说。'},
    {id:'clear',title:'沉冤昭雪',if:function(s){return s.flags.cleared},text:'顾检把录音放上听证会的那天，全市都在下雨。\n你走出法院时，秦峥站在台阶下，手里拿着一把黑色的伞。\n他没有问你赢了没有，只问：“回家吗？”\n你点头。伞往你这边偏了偏。'},
    {id:'fallen',title:'无名碑',if:function(s){return s.stats.hp<=15||s.stats.danger>=95},text:'暴动那晚，B 区的灯再也没亮过。\n秦峥抱着你从铁门里出来，雨水把血冲进排水沟。\n后来放风场多了一块没有名字的水泥砖。有人每天放一支烟，有人每天擦一遍。'}
  ],
  nexusLinks:[
    {label:'法则：罪与罚的交换',kind:'宇宙法则',target:'law'},
    {label:'规则：监狱生存守则',kind:'规则系',target:'rules'},
    {label:'人物：闻川 / 秦峥',kind:'人物',target:'chars'}
  ]
};
