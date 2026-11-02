
/* ===== v9.9.1 内容模式核心：日常 / 成人 / 儿童 / 全年龄 ===== */
window.SLMODE=(function(){
  function g(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
  function p(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  var mode=g('sl_site_mode',''),ori=g('sl_adult_ori','gay'),pwd=String(g('sl_mode_pwd','2778')),
      over=g('sl_sect_kind',{})||{},kidsLimit=+g('sl_kids_limit',60)||60;
  var ADULT_SEC={'comprehensive-section':1,'search-section':1,'comics-section':1,'videos-section':1,
                 'novels-section':1,'images-section':1,'furry-section':1};
  var ADULT_KW=/男同|BL|耽美|本子|里番|成人|H漫|色情|18\+|无码|エロ|肉番|调教|奴|sm|性爱|裸|写真|AV|口交|肛|淫|露出|福利|gay|同志/;
  var KID_KW=/儿童|幼儿|启蒙|宝宝|儿歌|少儿|科普|kids|小猪佩奇|海绵宝宝|卡通|动画片|绘本/;
  var NONADULT_KW=/国漫|日漫|经典|名著|全年龄|儿童|科普|热血|少年漫|治愈|纯爱|正常向/;
  var LES_KW=/女同|百合|lesbian|LES|GL|蕾丝/;
  var GAY_KW=/男同|BL|耽美|gay|同志/;
  function text(s){return String(s&&s.t||'')+' '+String(s&&s.d||'')}
  function kindOf(s,sec){
    var t=text(s);
    if(KID_KW.test(t))return 'kids';
    if(over[sec])return over[sec];
    if(ADULT_SEC[sec])return NONADULT_KW.test(t)?'daily':'adult';
    return ADULT_KW.test(t)?'adult':'daily';
  }
  function oriOf(s){
    var t=text(s);
    if(LES_KW.test(t))return 'les';
    if(GAY_KW.test(t))return 'gay';
    return 'mixed';
  }
  function cycle(){ return 1; }   /* v8.0.4：统一黑夜模式，取消日夜切换 */
  function eff(){ return 'adult'; }
  function visible(s,sec){ return true; }  /* v8.0.4：所有板块全部展示，不再隐藏 */
  function apply(){
    document.body.classList.remove('mode-kids','mode-daily','mode-dusk');
    document.body.classList.remove('day');
    document.body.classList.add('mode-adult');
    var ob=document.getElementById('oriBtn'); if(ob)ob.style.display='none';
  }
  var KIDS=[
    {id:'kids-anime',title:'启蒙动画',icon:'🎬',sites:[
      {t:'小猪佩奇',d:'英国官方动画站，粉红猪小妹一家',u:'https://www.peppapig.com',e:'🐷'},
      {t:'宝宝巴士',d:'启蒙动画、儿歌、益智小游戏',u:'https://www.babybus.com',e:'🚌'},
      {t:'PBS Kids',d:'美国公共电视儿童频道，动画与游戏',u:'https://pbskids.org',e:'🐯'},
      {t:'尼克儿童',d:'海绵宝宝等经典卡通',u:'https://www.nick.com',e:'🦑'},
      {t:'卡通频道',d:'Cartoon Network 儿童动画',u:'https://www.cartoonnetwork.com',e:'🐱'}
    ]},
    {id:'kids-games',title:'儿童游戏',icon:'🎮',sites:[
      {t:'Scratch',d:'图形化编程，做自己的小游戏',u:'https://scratch.mit.edu',e:'🧩'},
      {t:'Code.org',d:'儿童编程启蒙课程与游戏',u:'https://code.org',e:'💻'},
      {t:'ABCya',d:'分年龄段的儿童益智游戏',u:'https://www.abcya.com',e:'🎲'},
      {t:'PBS 游戏',d:'动画角色小游戏合集',u:'https://pbskids.org/games',e:'🎠'}
    ]},
    {id:'kids-learn',title:'知识科普',icon:'📚',sites:[
      {t:'国家地理儿童',d:'动物、自然、地理科普',u:'https://kids.nationalgeographic.com',e:'🌍'},
      {t:'中国科普博览',d:'中科院科普平台，适合亲子共读',u:'https://www.kepu.net.cn',e:'🔬'},
      {t:'可汗学院儿童',d:'免费幼儿数学与阅读启蒙',u:'https://learn.khanacademy.org/kids',e:'🧮'},
      {t:'NASA 儿童',d:'太空、星球、火箭科普',u:'https://www.nasa.gov/kidsclub',e:'🚀'}
    ]},
    {id:'kids-life',title:'儿童乐园',icon:'🎈',sites:[
      {t:'儿童绘本馆',d:'睡前故事与绘本阅读',u:'https://www.storylineonline.net',e:'📖'},
      {t:'迪士尼儿童',d:'经典动画与角色互动',u:'https://kids.disney.co.jp',e:'🏰'},
      {t:'儿歌多多',d:'中文儿歌与律动',u:'https://www.ergebao.com',e:'🎵'}
    ]}
  ];
  return {
    get mode(){return mode},get ori(){return ori},get pwd(){return pwd},
    get kidsLimit(){return kidsLimit},KIDS:KIDS,ADULT_SEC:ADULT_SEC,
    eff:eff,apply:apply,kindOf:kindOf,oriOf:oriOf,visible:visible,
    setMode:function(m){p('sl_site_mode',m);},
    setOri:function(o){ori=o;p('sl_adult_ori',o)},
    setPwd:function(v){pwd=String(v||'2778');p('sl_mode_pwd',pwd)},
    setKidsLimit:function(v){kidsLimit=Math.max(5,Math.min(600,+v||60));p('sl_kids_limit',kidsLimit)},
    setKind:function(sec,k){over[sec]=k;p('sl_sect_kind',over)},
    getKind:function(sec){return over[sec]||''},
    day:function(){return false},
    setDay:function(v){},
    setNight:function(v){},
    cycle:cycle,
    dragToggle:function(){}
  };
})();
