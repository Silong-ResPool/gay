/* 世界：九霄灵契 / 国风修仙 · 双修 · 妖宠 · 炼丹炼器 */
window.SL_PACK = {
  id:'jiuxiao', title:'九霄灵契', subtitle:'云海仙门 · 双修与妖宠',
  kicker:'NINE HEAVENS', theme:'xianxia', layout:'cinema', modeLabel:'修仙试炼', mode:'xianxia',
  accent:'#e0b15a', accent2:'#ddd6fe', bg:'#080b08', bg2:'#16120a',
  cover:'../../assets/ui/world_xianxia2.jpg', turnsPerDay:5, eventChance:.38,
  freePlaceholder:'自由行动：打坐 / 双修 / 炼丹 / 炼器 / 画符 / 喂妖宠 / 进秘境 / 找玄烬',
  bgm:[
    {id:'cloud',name:'云海晨钟',mood:'daily',tempo:64,scale:'pentatonic',lead:'guqin',pad:'space'},
    {id:'trial',name:'秘境试炼',mood:'tense',tempo:96,scale:'minor',lead:'pipa',pad:'pulse'},
    {id:'dual',name:'双修',mood:'romance',tempo:72,scale:'dorian',lead:'dizi',pad:'soft'},
    {id:'tribulation',name:'雷劫',mood:'horror',tempo:108,scale:'phrygian',lead:'lowStrings',pad:'storm'}
  ],
  stats:[
    {key:'hp',label:'气血',init:100,max:100,danger:true},
    {key:'qi',label:'修为',init:12,max:100},
    {key:'dan',label:'丹力',init:6,max:100},
    {key:'pet',label:'灵契',init:8,max:100}
  ],
  relations:[
    {key:'xuan',name:'玄烬',role:'剑修 · 你的双修道侣',init:22,max:100},
    {key:'bai',name:'白团',role:'男妖宠 · 九尾狐',init:14,max:100},
    {key:'qing',name:'青衡',role:'丹峰长老 · 看你不顺眼',init:4,max:100},
    {key:'shu',name:'书梨',role:'器灵 · 炼器炉',init:10,max:100}
  ],
  items:{
    herb:{name:'九转灵草',desc:'丹峰后山采的，叶背有银色脉络。',tags:['药材','炼丹'],icon:'草'},
    cauldron:{name:'小丹炉',desc:'青衡淘汰下来的旧炉，炉底刻着“慢火”。',tags:['工具','炼丹'],icon:'炉'},
    sword:{name:'玄烬的旧剑',desc:'剑穗上系着你的发带。',tags:['武器','信物'],icon:'剑'},
    talisman:{name:'空白符纸',desc:'画对笔顺才能生效，画错会反噬。',tags:['符箓','材料'],icon:'符'},
    petegg:{name:'白团褪下的尾羽',desc:'碰到心口会发热，像一只小动物在睡。',tags:['妖宠','信物'],icon:'羽'}
  },
  startItems:[{id:'herb',qty:2},{id:'cauldron',qty:1},{id:'talisman',qty:2}],
  skills:[{id:'dual',name:'双修诀'},{id:'alchemy',name:'炼丹'},{id:'forge',name:'炼器'},{id:'pet',name:'灵契'},{id:'talisman',name:'符箓'}],
  rules:[
    {text:'双修必须两人同时入定；一方走火，另一方会分担七成反噬。',code:'X-01'},
    {text:'妖宠认主前不能喂血；喂了血，它就会替你挡一次死劫，然后消失。',code:'X-02'},
    {text:'丹成时不能开炉盖；青衡的旧炉盖过一次，炸掉了半座丹峰。',code:'X-03'},
    {text:'符纸的笔顺不能倒；倒着画，召来的不是神。',code:'X-04'},
    {text:'秘境试炼只开七日；第七日不出来，门会把你当成秘境的一部分。',code:'X-05'}
  ],
  places:[
    {name:'外门竹舍',desc:'你和玄烬的住处',unlocked:true},
    {name:'丹峰',desc:'炼丹与青衡的地盘',unlocked:true},
    {name:'剑坪',desc:'双修与剑法',unlocked:true},
    {name:'灵兽园',desc:'白团不肯回窝的地方',unlocked:true},
    {name:'秘境入口',desc:'七日试炼',unlocked:false},
    {name:'雷劫台',desc:'渡劫或身死',unlocked:false}
  ],
  freeActions:[
    {keys:['打坐','修炼','吐纳'],text:'你在竹舍后山打坐，灵气沿着经脉走了一周天。玄烬坐在对面，睁眼时正好与你对上。',eff:{stats:{qi:5,hp:3},rel:{xuan:4}}},
    {keys:['双修','玄烬','道侣'],text:'你和玄烬掌心相对，灵气在两人之间来回。他的指尖很凉，呼吸却越来越近。',eff:{stats:{qi:8,hp:2},rel:{xuan:9}}},
    {keys:['炼丹','丹炉','灵草'],text:'你把灵草投进旧炉，慢火三转。炉盖轻轻震动，像有什么在里面敲门。',eff:{stats:{dan:6},addItems:[{id:'herb',qty:1}]}},
    {keys:['炼器','剑','炉'],text:'书梨从炉里探出半张脸，替你敲了敲剑坯：“再加一滴血，它就认你。”',eff:{stats:{dan:4,hp:-3},rel:{shu:6}}},
    {keys:['画符','符纸','笔顺'],text:'你按青衡教的笔顺画符。最后一笔落下，符纸自己立起来，烧出一只很小的鸟。',eff:{stats:{dan:4},flags:{talismanMade:true}}},
    {keys:['妖宠','白团','喂'],text:'白团从梁上跳下来，九条尾巴只露出一条。它叼走你手里的灵果，又故意把尾巴扫过你的手腕。',eff:{stats:{pet:6},rel:{bai:8}}},
    {keys:['秘境','试炼','入口'],text:'秘境入口的石门开了一条缝。里面传来剑鸣，像有人在等你。',eff:{stats:{qi:4},flags:{sawTrial:true}}}
  ],
  start:'bamboo',
  scenes:{
    bamboo:{chapter:'卷一 · 外门',place:'外门竹舍',title:'同住一间竹舍',
      text:'你被分到外门最偏的一间竹舍。\n推门进去，里面已经住了个人。\n玄烬坐在窗边擦剑，白衣松垮，发带没系。他抬眼看了你一下：“你睡里面。我睡门边。”\n夜里山风穿堂，他把外袍丢到你床上，自己只穿单衣。\n“别误会。”他说，“我怕你冻死，明天没人替我试剑。”',
      choices:[
        {label:'把外袍还给他，说你不冷',hint:'玄烬 +6，倔强线',eff:{rel:{xuan:6},flags:{returnCoat:true}},next:'sword'},
        {label:'披上外袍，往他那边挪半尺',hint:'玄烬 +10，暧昧',eff:{rel:{xuan:10},stats:{hp:4},flags:{sharedBed:true}},next:'sword'},
        {label:'问他，为什么愿意跟一个外门弟子同住',hint:'真相，玄烬 +8',eff:{rel:{xuan:8},flags:{askedXuan:true}},next:'sword'}
      ]},
    sword:{chapter:'卷二 · 剑坪',place:'剑坪',title:'双修第一式',
      text:'剑坪的晨雾里，玄烬教你第一式。\n他站在你身后，手覆在你握剑的手上，呼吸落在耳侧。\n“引气入剑，不要用力。”他说，“你越急，剑越不听。”\n剑尖亮起一线灵光。你回头，正好撞进他眼睛里。\n远处青衡咳了一声。',
      choices:[
        {label:'顺势与他掌心相对，试一次双修',hint:'修为 +8，玄烬 +10',eff:{stats:{qi:8},rel:{xuan:10},flags:{dualFirst:true}},next:'danfeng'},
        {label:'先练剑，不被青衡看轻',hint:'锋刃，玄烬 +4',eff:{stats:{hp:6,qi:4},rel:{xuan:4}},next:'danfeng'},
        {label:'问玄烬，双修会不会有反噬',hint:'规则 +，玄烬 +6',eff:{rel:{xuan:6},stats:{dan:3},flags:{dualRisk:true}},next:'danfeng'}
      ]},
    danfeng:{chapter:'卷三 · 丹峰',place:'丹峰',title:'旧炉与青衡',
      text:'丹峰上全是苦味。\n青衡把一只旧丹炉踢到你脚边：“炼出一炉能看的丹，我就让你进秘境。”\n炉底刻着“慢火”两个字，字迹是玄烬的。\n白团从你肩头跳下来，绕着丹炉转了一圈，尾巴竖得笔直。\n“它说炉里有东西。”玄烬站在门口，“你信它，还是信青衡？”',
      choices:[
        {label:'信白团，开炉检查',hint:'灵契 +6，危险 +4',eff:{stats:{pet:6,hp:-4},rel:{bai:8},flags:{checkedCauldron:true}},next:'pet'},
        {label:'信青衡，按常规火候炼丹',hint:'丹力 +8，青衡 +6',eff:{stats:{dan:8},rel:{qing:6}},next:'pet'},
        {label:'让玄烬替你守着炉，自己控火',hint:'玄烬 +10，丹力 +5',eff:{stats:{dan:5},rel:{xuan:10},flags:{xuanGuard:true}},next:'pet'}
      ]},
    pet:{chapter:'卷四 · 灵兽园',place:'灵兽园',title:'九尾不肯回窝',
      text:'白团趴在灵兽园最高的树上，九条尾巴垂下来，像九条白色的绳子。\n它不肯回窝。\n你爬上去，它往你怀里钻，尾巴把你和树枝缠在一起。\n玄烬站在树下，抬头看你们，忽然说：“它认你了。”\n“妖宠认主，会替主人挡一次死劫。”他顿了顿，“然后消失。”',
      choices:[
        {label:'抱紧白团，说不会让它挡劫',hint:'白团 +14，灵契 +6',eff:{rel:{bai:14},stats:{pet:6},flags:{petPromise:true}},next:'trial'},
        {label:'问玄烬，有没有办法让妖宠不消失',hint:'真相，玄烬 +8',eff:{rel:{xuan:8},stats:{dan:3},flags:{petMethod:true}},next:'trial'},
        {label:'把白团交给玄烬，自己先练符',hint:'符箓，白团 -4',eff:{stats:{dan:5},rel:{bai:-4},flags:{petLeft:true}},next:'trial'}
      ]},
    trial:{chapter:'卷五 · 秘境',place:'秘境入口',title:'七日试炼',
      text:'秘境的门只开七日。\n里面是一座倒悬的山，瀑布从头顶往下流。\n玄烬走在你前面，剑没有出鞘。白团缩在你怀里，尾巴尖端一直指着同一个方向。\n“秘境会照出人心里最想要的东西。”玄烬说，“你看见什么，都不要停。”\n雾里出现了另一个你，和另一个玄烬。',
      choices:[
        {label:'握住玄烬的手，不看幻象',hint:'玄烬 +16，修为 +6',eff:{rel:{xuan:16},stats:{qi:6},flags:{heldInTrial:true}},next:'tribulation'},
        {label:'拔剑劈开幻象，找出秘境核心',hint:'修为 +10，危险 +8',eff:{stats:{qi:10,hp:-8},flags:{brokeIllusion:true}},next:'tribulation'},
        {label:'让白团带路，绕开幻象',hint:'白团 +12，线索',eff:{rel:{bai:12},stats:{pet:4},flags:{petPath:true}},next:'tribulation'}
      ]},
    tribulation:{chapter:'卷六 · 雷劫台',place:'雷劫台',title:'第一道雷',
      text:'你们从秘境出来时，天上已经聚起雷云。\n青衡站在雷劫台下，手里拿着你炼的那炉丹：“丹成了。但雷劫也来了。”\n玄烬把你推到身后，剑终于出鞘。\n“双修的人，雷劫会一起劈。”他说，“你怕不怕？”\n白团从你怀里跳出来，九条尾巴全部张开。',
      choices:[
        {label:'站到玄烬身边，一起接雷',hint:'玄烬 +20，修为 +10',eff:{rel:{xuan:20},stats:{qi:10,hp:-10},flags:{sharedTribulation:true}},next:'finale'},
        {label:'让白团替你挡第一道雷',hint:'白团 +18，灵契 -6',eff:{rel:{bai:18},stats:{pet:-6,hp:4},flags:{petBlocked:true}},next:'finale'},
        {label:'用符纸引开雷劫，自己扛第二道',hint:'符箓 +，危险 +8',eff:{stats:{dan:8,hp:-12},flags:{talismanThunder:true}},next:'finale'}
      ]},
    finale:{chapter:'终章 · 云海',place:'剑坪',title:'九霄之上',
      text:'雷云散开时，剑坪上只剩你们三个人。\n白团的尾巴少了一条。它趴在玄烬肩上，眯着眼睛，像睡着了。\n青衡把那炉丹放在你手里：“从今天起，丹峰归你。”\n玄烬用剑尖在石阶上划了一道：“从这里到山门，以后我陪你走。”\n云海在脚下翻涌。',
      choices:[
        {label:'牵住玄烬，一起御剑去更高处',hint:'结局 · 九霄道侣',eff:{rel:{xuan:28},stats:{qi:12},flags:{flyTogether:true}},next:'end'},
        {label:'留在丹峰，把白团养回来',hint:'结局 · 丹峰日常',eff:{rel:{bai:20,xuan:10},flags:{stayDanfeng:true}},next:'end'},
        {label:'独自进秘境，找让妖宠不消失的办法',hint:'结局 · 再入秘境',eff:{stats:{qi:8},rel:{bai:15},flags:{seekMethod:true}},next:'end'}
      ]},
    end:{chapter:'终章',place:'云海',title:'灵契',text:'云海把山门藏在白里。',choices:[]}
  },
  events:[
    {id:'herb',title:'后山灵草',if:function(s){return s.day>=1},text:'你在后山发现一株九转灵草，叶背有银色的脉络。白团先你一步扑过去，又叼回来放在你手里。',eff:{stats:{dan:3},addItems:[{id:'herb',qty:1}],rel:{bai:4}}},
    {id:'qing',title:'青衡的刁难',if:function(s){return s.day>=2},text:'青衡当着全峰弟子面说你炼的丹“狗都不吃”。玄烬把丹炉盖子合上，替你挡了一句。',eff:{rel:{qing:-4,xuan:6}}},
    {id:'dual_echo',title:'双修余韵',if:function(s){return s.stats.qi>=35},text:'夜里你还能感觉到玄烬的灵气在经脉里流动，像一条没有走完的路。',eff:{stats:{qi:3},rel:{xuan:6}}},
    {id:'pet_night',title:'白团夜游',if:function(s){return s.rel.bai>=30},text:'白团半夜跳上你的床，九条尾巴盖在你身上，像一床会呼吸的被子。',eff:{stats:{pet:4},rel:{bai:6}}},
    {id:'thunder',title:'远处雷声',if:function(s){return s.day>=4},text:'山门外传来雷声，但天上没有云。青衡说，这是秘境在提醒你，七日快到了。',eff:{stats:{dan:3,hp:-3}}}
  ],
  endings:[
    {id:'fly',title:'九霄道侣',if:function(s){return s.flags.flyTogether},text:'你和玄烬御剑穿过云海。\n风把衣袂吹到一起，他伸手替你拨开额前的发。\n“以后，”他说，“双修不必再找借口。”\n白团趴在剑尾，九条尾巴只剩八条，睡得安稳。'},
    {id:'danfeng',title:'丹峰日常',if:function(s){return s.flags.stayDanfeng},text:'你留在了丹峰。\n玄烬每天来蹭一炉丹，白团每天偷一颗。\n青衡嘴上嫌你们吵，却把丹峰最好的炉子留给了你。\n山门外的云海，偶尔会传来一声剑鸣。'},
    {id:'seek',title:'再入秘境',if:function(s){return s.flags.seekMethod},text:'你独自走进秘境。\n白团在门口等你，九条尾巴全部竖起来。\n“这一次，”你说，“我不会让你消失。”\n秘境的门在你身后合上，像一本翻到最后一页的书。'},
    {id:'fall',title:'雷劫之下',if:function(s){return s.stats.hp<=10||s.stats.qi<=0},text:'第一道雷落下时，玄烬替你挡了半道。\n白团挡了另一半。\n你醒来时，剑坪上只剩一把旧剑，和八条白色的尾羽。\n云海很安静。'}
  ],
  nexusLinks:[
    {label:'法则：灵契与因果',kind:'宇宙法则',target:'law'},
    {label:'规则：九霄仙门守则',kind:'规则系',target:'rules'},
    {label:'人物：云舒 / 玄烬 / 白团',kind:'人物',target:'chars'}
  ]
};
