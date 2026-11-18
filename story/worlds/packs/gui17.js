/* 世界：十七中 · 规则怪谈 / 中式恐怖 · 双男主 */
window.SL_PACK = {
  id:'gui17', title:'十七中', subtitle:'规则怪谈 · 第十三条校规',
  kicker:'RULE 13 · SCHOOL', theme:'sin', layout:'dashboard', modeLabel:'规则怪谈', mode:'rules',
  accent:'#84cc16', accent2:'#7c3aed', bg:'#070a09', bg2:'#10160f',
  cover:'../../assets/ui/world_guize.jpg', turnsPerDay:5, eventChance:.48,
  freePlaceholder:'自由行动：读校规 / 巡走廊 / 找江渡 / 开储物柜 / 去广播室 / 数楼梯 / 照镜子',
  bgm:[
    {id:'bell',name:'放学铃',mood:'daily',tempo:62,scale:'minor',lead:'piano',pad:'rain'},
    {id:'rule',name:'第十三条',mood:'tense',tempo:90,scale:'phrygian',lead:'lowStrings',pad:'pulse'},
    {id:'chase',name:'追你的东西',mood:'horror',tempo:112,scale:'phrygian',lead:'choir',pad:'dark'},
    {id:'dawn',name:'天亮以后',mood:'hope',tempo:74,scale:'major',lead:'strings',pad:'warm'}
  ],
  stats:[
    {key:'hp',label:'生命',init:80,max:100,danger:true},
    {key:'sanity',label:'理智',init:70,max:100,danger:true},
    {key:'rule',label:'规则理解',init:10,max:100},
    {key:'clue',label:'线索',init:2,max:99}
  ],
  relations:[
    {key:'jiang',name:'江渡',role:'夜巡老师 · 上一届幸存者',init:20,max:100},
    {key:'guard',name:'老门卫',role:'传达室 · 知道校规的来处',init:8,max:100},
    {key:'lin',name:'林默',role:'同班同学 · 失踪过七天',init:6,max:100}
  ],
  items:{
    rulebook:{name:'十七中校规',desc:'封皮是黑的，第十三条用红笔圈了三遍：23:00 后，不要走西楼梯。',tags:['规则','关键'],icon:'规'},
    flashlight:{name:'旧手电',desc:'江渡给你的，光柱里偶尔会浮出不属于人的指纹。',tags:['工具','照明'],icon:'灯'},
    key:{name:'西楼梯钥匙',desc:'钥匙柄上刻着“13”，摸起来像一块冰。',tags:['钥匙','危险'],icon:'钥'},
    photo:{name:'上一届毕业照',desc:'照片里多出一个人，站在你现在的位子上。',tags:['线索','恐怖'],icon:'照'},
    tape:{name:'广播室磁带',desc:'录着一段没有声音的早读，倒放能听见有人在数楼梯。',tags:['线索'],icon:'带'}
  },
  startItems:[{id:'rulebook',qty:1},{id:'flashlight',qty:1}],
  skills:[{id:'count',name:'数楼梯'},{id:'readrule',name:'读规则'},{id:'hide',name:'屏息'}],
  rules:[
    {text:'23:00 后，不要走西楼梯；如果听见有人在上面数数，跟着数到十三，不要停。',code:'R-13'},
    {text:'走廊镜子里出现第二个人时，不要回头；先确认镜子里的人有没有影子。',code:'R-07'},
    {text:'广播室每天只播一次早读；播第二次时，关上窗，不要听。',code:'R-09'},
    {text:'储物柜第 13 号不属于任何学生；不要打开，也不要往里放东西。',code:'R-04'},
    {text:'如果看见穿旧校服的人站在楼梯口，先问他今天是星期几。他答错，就跑。',code:'R-11'}
  ],
  places:[
    {name:'教学楼大厅',desc:'校规牌与值班表',unlocked:true},
    {name:'三楼走廊',desc:'镜子与永远关不上的窗',unlocked:true},
    {name:'西楼梯',desc:'第十三阶不存在',unlocked:true},
    {name:'广播室',desc:'没有声音的早读',unlocked:false},
    {name:'储物间',desc:'第 13 号柜子',unlocked:false},
    {name:'旧礼堂',desc:'上一届的毕业照',unlocked:false}
  ],
  freeActions:[
    {keys:['校规','读','规则'],text:'你翻开校规，第十三条的红字淡了一点。纸背浮出一行新字：“你已经读过三次。”',eff:{stats:{rule:5,sanity:-2}}},
    {keys:['走廊','巡','镜子'],text:'走廊尽头的镜子里，你身后站着第二个人。他穿旧校服，没有影子。你想起规则第七条。',eff:{stats:{sanity:-5,clue:1}}},
    {keys:['江渡','找','交谈'],text:'江渡用手电照你的脸，确认你有影子才松手：“别走西楼梯。上一次，我没拉住的人，就在那里消失的。”',eff:{rel:{jiang:8},stats:{sanity:3}}},
    {keys:['储物柜','柜子','13'],text:'第 13 号柜门自己开了一条缝。里面只有一张你的照片，背面写着“欢迎回来”。',eff:{stats:{clue:2,sanity:-4},flags:{lockerOpen:true}}},
    {keys:['广播室','广播','磁带'],text:'广播室的门没锁。磁带在转，喇叭里没有声音，只有指甲刮过桌面的节奏。',eff:{stats:{clue:2,sanity:-3},flags:{broadcastClue:true}}},
    {keys:['楼梯','数','西楼梯'],text:'你站在西楼梯口数台阶。数到十二，脚下还有一级；数到十三，整栋楼安静了。',eff:{stats:{rule:6,sanity:-3},flags:{counted13:true}}}
  ],
  start:'gate',
  scenes:{
    gate:{chapter:'第一夜 · 校门',place:'教学楼大厅',title:'多出来的一节课',
      text:'你是转学生，第一天报到就赶上下雨。\n传达室的老门卫递给你一把旧手电和一本黑皮校规，只说了句：“23:00 以后，别走西楼梯。”\n教学楼大厅的钟停在 22:57。\n一个穿深色风衣的年轻男人从走廊尽头走来，手电光扫过你的脸。\n“新来的？”他说，“我叫江渡，夜巡老师。你身上有影子，跟我走。”',
      choices:[
        {label:'跟江渡走，先问第十三条到底是什么',hint:'江渡 +10，规则 +4',eff:{rel:{jiang:10},stats:{rule:4},flags:{trustJiang:true}},next:'corridor'},
        {label:'先翻开校规，自己读第十三条',hint:'规则 +8，理智 -2',eff:{stats:{rule:8,sanity:-2},flags:{read13:true}},next:'corridor'},
        {label:'不相信他，先去传达室问老门卫',hint:'老门卫 +8，线索 +1',eff:{rel:{guard:8},stats:{clue:1}},next:'corridor'}
      ]},
    corridor:{chapter:'第一夜 · 三楼',place:'三楼走廊',title:'镜子里的第二个人',
      text:'三楼的灯管一闪一闪。\n走廊尽头有一面旧镜子，镜框上贴着褪色的“整容镜”三个字。\n你走过去时，镜子里除了你，还有一个人。\n他站在你身后，穿旧校服，脸被阴影遮住。\n江渡的手电突然灭了。他在黑暗里抓住你的手腕：“别回头。看他的影子。”',
      choices:[
        {label:'盯着镜子里的人，确认他有没有影子',hint:'规则 +6，理智 -3',eff:{stats:{rule:6,sanity:-3},flags:{sawShadow:true}},next:'stairs'},
        {label:'拉江渡后退，用手电照镜子背面',hint:'江渡 +8，线索 +1',eff:{rel:{jiang:8},stats:{clue:1}},next:'stairs'},
        {label:'按规则第七条，先闭眼数到十',hint:'理智 +4，安全',eff:{stats:{sanity:4,rule:3}},next:'stairs'}
      ]},
    stairs:{chapter:'第二夜 · 西楼梯',place:'西楼梯',title:'第十三级',
      text:'西楼梯的灯全坏了。\n江渡走在前面，手电光只够照亮三级台阶。\n“这楼梯原来有十二级。”他说，“三年前，有个学生数出了第十三级。第二天，他的课桌还在，人不见了。”\n你听见上面有人在数数。\n一、二、三……声音很轻，像一个孩子在忍着哭。',
      choices:[
        {label:'跟着数到十三，看看会发生什么',hint:'规则 +10，危险 +8',eff:{stats:{rule:10,sanity:-6},flags:{counted13:true}},next:'broadcast'},
        {label:'拉住江渡，往楼下退',hint:'安全，江渡 +6',eff:{stats:{sanity:3},rel:{jiang:6},flags:{retreated:true}},next:'broadcast'},
        {label:'问上面的人，今天是星期几',hint:'规则 +6，线索 +2',eff:{stats:{rule:6,clue:2},flags:{askedDay:true}},next:'broadcast'}
      ]},
    broadcast:{chapter:'第二夜 · 广播室',place:'广播室',title:'没有声音的早读',
      text:'广播室的门虚掩着。\n磁带在转，喇叭里却没有声音。你凑近，听见极轻的呼吸，像有人贴着话筒。\n江渡翻出一张旧值班表，上面每一任广播员的名字都被划掉，只剩最后一个空位。\n空位旁边写着你的名字。\n“别听。”江渡伸手盖住你的耳朵，“它在学你。”',
      choices:[
        {label:'推开江渡的手，把磁带倒放',hint:'线索 +3，理智 -6',eff:{stats:{clue:3,sanity:-6},flags:{tapeReverse:true}},next:'locker'},
        {label:'关掉广播，先带江渡离开',hint:'江渡 +10，安全',eff:{rel:{jiang:10},stats:{sanity:3}},next:'locker'},
        {label:'按规则第九条，关上窗再听',hint:'规则 +8，真相',eff:{stats:{rule:8,sanity:-3},flags:{windowClosed:true}},next:'locker'}
      ]},
    locker:{chapter:'第三夜 · 储物间',place:'储物间',title:'第 13 号柜',
      text:'储物间里全是铁皮柜，只有第 13 号是木头的。\n柜门上没有锁，只有一道从里面刻出来的划痕，像有人用指甲写过“放我出去”。\n江渡站在你身后，呼吸很轻。\n“三年前，”他说，“我就是从这柜子里出来的。”\n你回头看他。他的影子在灯下分成两条。',
      choices:[
        {label:'打开柜门，看里面到底有什么',hint:'真相，危险 +10',eff:{stats:{clue:3,sanity:-8},flags:{openedLocker:true}},next:'hall'},
        {label:'先问江渡，他到底是什么',hint:'江渡 +14，真相',eff:{rel:{jiang:14},stats:{clue:2},flags:{jiangTruth:true}},next:'hall'},
        {label:'把校规塞进柜门缝，封住它',hint:'规则 +8，安全',eff:{stats:{rule:8,sanity:3},flags:{sealedLocker:true}},next:'hall'}
      ]},
    hall:{chapter:'第三夜 · 旧礼堂',place:'旧礼堂',title:'毕业照',
      text:'旧礼堂的舞台上挂着一张巨大的毕业照。\n照片里是上一届高三，每个人都笑着。最后一排最右边，站着一个人，脸和你一模一样。\n江渡站在照片下面，抬头看了很久。\n“那一年，我没有救出他们。”他说，“所以每年校庆，我都会回来当夜巡。”\n礼堂的门在身后自己关上。',
      choices:[
        {label:'站到照片里那个位置，替江渡补上缺席',hint:'江渡 +18，结局线',eff:{rel:{jiang:18},stats:{sanity:-4},flags:{standPhoto:true}},next:'finale'},
        {label:'把照片摘下来，烧掉多出来的那个人',hint:'危险 +8，线索 +2',eff:{stats:{clue:2,sanity:-6},flags:{burnPhoto:true}},next:'finale'},
        {label:'拉着江渡从舞台后门离开',hint:'江渡 +10，逃离线',eff:{rel:{jiang:10},stats:{sanity:2},flags:{escapeHall:true}},next:'finale'}
      ]},
    finale:{chapter:'终章 · 西楼梯',place:'西楼梯',title:'第十三级之后',
      text:'你们回到西楼梯。\n楼梯上站着十三个穿旧校服的人，每个人都没有影子。\n江渡把手电交给你：“第十三级不是台阶，是一道门。门后面，是这所学校吃掉的所有人。”\n他往前一步，影子终于分成两条：一条属于他，一条属于三年前的他。\n“这一次，”他说，“你选谁出去？”',
      choices:[
        {label:'拉住江渡，两个人一起跨过第十三级',hint:'结局 · 双人幸存',eff:{rel:{jiang:20},stats:{rule:10},flags:{bothOut:true}},next:'end'},
        {label:'把江渡推出去，自己留下封门',hint:'结局 · 守门人',eff:{rel:{jiang:15},stats:{sanity:-10},flags:{stayGate:true}},next:'end'},
        {label:'按校规念完第十三条，让所有人重来一次',hint:'结局 · 规则重写',eff:{stats:{rule:20},rel:{jiang:8},flags:{rewriteRule:true}},next:'end'}
      ]},
    end:{chapter:'终章',place:'校门',title:'天亮以后',text:'校门口的钟终于走过 23:00。',choices:[]}
  },
  events:[
    {id:'clock',title:'钟停在 22:57',if:function(s){return s.day>=1},text:'大厅的钟一直停在 22:57。你路过时，秒针动了一下，又退回去。',eff:{stats:{sanity:-3}}},
    {id:'classmate',title:'林默的课桌',if:function(s){return s.day>=2},text:'林默的课桌里塞着一张纸条：“如果你看见我，别叫我名字。”',eff:{stats:{clue:2,sanity:-2},flags:{linNote:true}}},
    {id:'guard',title:'老门卫的登记本',if:function(s){return s.rel.guard>=15},text:'老门卫翻出三年前的登记本。你入校那天的签名，已经在上面。',eff:{stats:{clue:3,sanity:-4}}},
    {id:'mirror',title:'镜子里的第二个人',if:function(s){return s.stats.sanity<=60},text:'走廊镜子里的人越来越清楚。他穿着你的校服，脸上却是一张空白的皮。',eff:{stats:{sanity:-5,rule:3}}},
    {id:'bell',title:'第二次放学铃',if:function(s){return s.day>=3},text:'放学铃响了两遍。第二遍之后，所有教室的灯同时熄灭。',eff:{stats:{sanity:-4,clue:1}}}
  ],
  endings:[
    {id:'both',title:'双人幸存',if:function(s){return s.flags.bothOut},text:'你和江渡一起跨过第十三级。\n身后那十三个没有影子的人，一个接一个消失。\n天亮时，校门口的钟终于走过 23:00。江渡站在阳光里，第一次有了一条完整的影子。\n“以后，”他说，“别再来这所学校。”'},
    {id:'gate',title:'守门人',if:function(s){return s.flags.stayGate},text:'你把江渡推出去，自己留在第十三级之后。\n门关上前，他回头看你，手电还亮着。\n后来十七中多了一个夜巡老师，姓江，每年校庆都来。\n他总在楼梯口放一把手电，说给一个还没出来的人。'},
    {id:'rewrite',title:'规则重写',if:function(s){return s.flags.rewriteRule},text:'你念完第十三条，整栋楼的灯同时亮起。\n十三个穿旧校服的人抬起头，第一次露出脸。\n江渡站在你身边，替你把校规合上。\n“从今天起，”他说，“第十三条由你来写。”'},
    {id:'eaten',title:'课桌还在',if:function(s){return s.stats.sanity<=10||s.stats.hp<=10},text:'第二天，你的课桌还在，人不见了。\n江渡在储物间找到那本黑皮校规，第十三条后面多了一行你的字。\n他把校规放回原处，每年校庆都来检查一遍。'}
  ],
  nexusLinks:[
    {label:'法则：规则即真实',kind:'宇宙法则',target:'law'},
    {label:'规则：十七中校规',kind:'规则系',target:'rules'},
    {label:'人物：沈言 / 江渡',kind:'人物',target:'chars'}
  ]
};
