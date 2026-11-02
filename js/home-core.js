
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var LS={
  get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  put:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
var order=(window.SLINDEX&&window.SLINDEX.order)||[];
/* 内容模式：日常 / 成人 / 儿童 / 全年龄 */
var MODE=window.SLMODE;
function modeKind(){return MODE?MODE.eff():'adult'}
function siteOk(s,sec){return MODE?MODE.visible(s,sec):true}
(function(){
  var b=document.getElementById('oriBtn');
  if(b)b.onclick=function(){
    var list=['gay','les','bg'];
    var i=list.indexOf(MODE.ori);
    var next=list[(i+1)%list.length];
    MODE.setOri(next);MODE.apply();render();
    toast(next==='gay'?'成人取向：男同':(next==='les'?'成人取向：女同':'成人取向：男女'));
  };
})();
function sectionOkSites(id){return sectionSites(id).filter(function(s){return siteOk(s,id)})}
var CURRENT_SEC=(function(){try{return localStorage.getItem('sl_cur_sec')||''}catch(e){return ''}})();
var DATA={},loaded={};
var MODULES=[
  {t:'打赏♡',d:'喜欢这里就请玉珩喝杯奶茶：所有资源永久免费，打赏全凭心意',u:(window.SLLINKS?SL_D(SLLINKS.tip):'tip/index.html'),i:'fa-solid fa-heart'},
  {t:'图像处理',d:'PS 级开源编辑器 miniPaint：图层、蒙版、滤镜、调色、文字、动画，全部本地完成',u:'imagepro/index.html',i:'fa-solid fa-wand-magic-sparkles'},
  {t:'L2D',d:'Live2DViewerEX 官方 Web：页面内直接打开，模型切换与设置齐全，不再安装独立包',u:'level2d',i:'fa-solid fa-cube'},
  {t:'游戏机',d:'全类型游戏合并为一个 SWF/模拟器舞台：游戏菜单内切换，不再分标签',u:'games/index.html',i:'fa-solid fa-gamepad'},
  {t:'巳泷音乐',d:'Mineradio 粒子舞台 × Folia 歌词动画 + 多源在线音乐',u:'music/index.html',i:'fa-solid fa-music'},
  {t:'影视乐园',d:'TVBox 全接口融合：综合/成人/动漫/自定义，单页最多 100 条懒加载',u:'video/index.html',i:'fa-solid fa-film'},
  {t:'我的收藏',d:'独立收藏界面：收藏的网址统一管理，可直接跳转或删除',u:'favorites/index.html',i:'fa-solid fa-star'},
  {t:'编辑器',d:'Monaco 内核 · HTML 实时预览 · 点击控件调参数 · 内置代码助手',u:'codeeditor/index.html',i:'fa-solid fa-code'}
];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function decodeU(u){
  try{ if(!u||u==='#')return ''; if(!/^[0-9a-fA-F]+$/.test(u))return u;
    var s='';for(var i=0;i+3<u.length;i+=4){s+=String.fromCharCode(parseInt(u.substr(i,4),16))}return s;
  }catch(e){return u||''}
}
function host(u){try{return decodeU(u).replace(/^https?:\/\//,'').split('/')[0]}catch(e){return ''}}
function initial(t){t=String(t||'?');return t.replace(/[^0-9a-zA-Z\u4e00-\u9fa5]/g,'').charAt(0)||'?'}
function toast(m){var t=$('toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},2200)}

/* ================= v8.4.0 可收起管家小窗：双环圆球 + 透明小人 + 头顶气泡 ================= */
var AI_POP_TIMER=0,AI_POP_LAST=0,DOCK_BUSY=false,DOCK_SEQ=0;
var CHAR={x:0,drag:false,hold:0,sx:0,ox:0,loaded:false,inited:false};
/* ===== 小人可调参数（主人自行修改这里即可） =====
   CHAR_W_RATIO  小人高度 = 当前小窗宽度 × 此比例（0.18 = 18%），与小窗同步缩放
   CHAR_DROP     臀部在小人视频里的锚点比例：实测臀部线在视频高度 64% 处，
                 即离视频底边 36%，所以 0.36 时臀部永远钉在小窗上沿，缩放时不会悬空
   规则：以小窗上沿那条线为圆心做等比例放大，臀部位置（垂直+水平中心）固定不变 */
var CHAR_DROP=0.36,CHAR_W_RATIO=0.18;
function popMuted(){try{var v=LS.get('sl_pop_mute','0');return v===1||String(v)==='1'}catch(e){return false}}
function dockBusy(){return DOCK_BUSY}
function dockIsOpen(){return document.body.classList.contains('dock-open')}
function loadChar(){
  if(CHAR.loaded)return;
  var v=$('slChar');if(!v)return;
  
  v.src='assets/pet/char.webm';
  /* 内置小人默认静音：视频自带背景音不能外放 */
  try{ v.muted=true; v.defaultMuted=true; v.volume=0; }catch(e){}
  CHAR.loaded=true;
}
function getCharW(){var v=$('slChar');if(!v||!dockIsOpen())return 92;var r=v.getBoundingClientRect();return r.width||92}
function sidebarRight(){
  var s=document.querySelector('.side');if(!s)return 0;
  var r=s.getBoundingClientRect();
  /* 侧边栏完全在屏幕内时才作为碰撞墙；移动端收起（translateX(-100%)）时为 0 */
  return (r.right>0&&r.right<window.innerWidth)?Math.ceil(r.right):0;
}
function clampCharX(cx){
  var w=getCharW();
  var minLeft=Math.max(4,sidebarRight()+4);          /* 侧边栏就是墙：小人不能进入侧边栏区域 */
  var maxLeft=Math.max(minLeft,window.innerWidth-w-4);
  return Math.max(minLeft,Math.min(maxLeft,Math.round(cx-w/2)))+w/2;
}
function layoutBubble(){
  var v=$('slChar'),b=$('slBubble');if(!v||!b)return;
  var r=v.getBoundingClientRect();if(!r.width)return;
  var cx=r.left+r.width/2;
  var bw=b.offsetWidth||240;
  var onLeft=cx>=(window.innerWidth-cx);
  b.classList.toggle('tail-right',onLeft);
  b.classList.toggle('tail-left',!onLeft);
  var left=onLeft?(cx-bw-6):(cx+6);
  left=Math.max(8,Math.min(window.innerWidth-bw-8,left));
  b.style.left=Math.round(left)+'px';
  b.style.bottom=Math.round(window.innerHeight-r.top+7)+'px';
}
function layoutCharBubble(){if(dockIsOpen())layoutBubble()}
function setCharX(x){
  var v=$('slChar');if(!v)return;
  CHAR.x=x;
  if(!dockIsOpen())return;
  /* x 存的是臀部中心（圆心），缩放时圆心不动，只向两侧等比例放大 */
  var ax=clampCharX(x);
  CHAR.x=ax;
  v.style.left=Math.round(ax-getCharW()/2)+'px';
  layoutBubble();
}
function syncDockH(){
  var d=$('slDock');if(!d)return;
  var dh=d.offsetHeight||94;
  document.documentElement.style.setProperty('--dockH',dh+'px');
  var v=$('slChar'),dw=d.getBoundingClientRect().width||0;
  if(v&&dw){
    /* 高度与小窗宽度成正比 → 与小窗同步等比例放大 */
    var h=Math.max(1,Math.round(dw*CHAR_W_RATIO));
    v.style.height=h+'px';
    /* 圆心放大：把视频高度的 36%（臀部线）钉在小窗上沿，缩放时臀部垂直位置不变 */
    v.style.bottom=Math.round(dh-h*CHAR_DROP)+'px';
  }
  layoutCharBubble();
}
function dockOpen(){
  document.body.classList.add('dock-open');
  loadChar();
  setTimeout(function(){
    syncDockH();
    setCharX(CHAR.x||Math.round(window.innerWidth*0.62));
    CHAR.inited=true;
    try{$('slChar').play().catch(function(){})}catch(e){}
    layoutBubble();
  },40);
}
function dockClose(){document.body.classList.remove('dock-open')}
function focusHomeSearch(){
  dockClose();
  try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){window.scrollTo(0,0)}
}
/* 小窗模式：search=查资源，chat=聊天。标签只切换模式，不触发检索 */
var DOCK_MODE=(function(){try{return LS.get('sl_dock_mode','search')==='chat'?'chat':'search'}catch(e){return 'search'}})();
/* 小窗独立朗读：与聊天页互不影响；只用男声，绝不放系统女声 */
var HOME_TTS_ON=(function(){try{return LS.get('sl_dock_tts','1')!=='0'}catch(e){return true}})();
var HOME_TTS_SEQ=0;
/* 朗读串行队列：新文本打断旧文本；单段≤100字；播上一段时静默预合成下一段，播完立即接上 */
var DTTS={gen:0,chunks:[],i:0,job:''};
function ttsSplitText(t,max){
  max=max||100;var out=[],buf='',lastP=-1;
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);buf+=c;
    if(/[。！？；!?;\n]/.test(c))lastP=buf.length;
    if(buf.length>=max){
      var cut=(lastP>max*0.5)?lastP:buf.length;
      var seg=buf.slice(0,cut).trim();if(seg)out.push(seg);
      buf=buf.slice(cut);lastP=-1;
    }
  }
  if(buf.trim())out.push(buf.trim());
  return out;
}
function homeSpeak(txt){
  if(!HOME_TTS_ON)return;
  txt=String(txt||'').replace(/[#*_>`\[\]]/g,' ').replace(/\s+/g,' ').trim();
  if(!txt)return;
  /* 不再弹出“正在准备朗读文本”，直接朗读 */
  /* 主界面小人一开口就必须能看到小窗，避免凭空出现声音 */
  if(!dockIsOpen())dockOpen();
  var A=null;try{A=window.Android}catch(e){}
  if(!A||typeof A.ttsSpeakEdge!=='function')return;
  DTTS.gen++;var gen=DTTS.gen;
  DTTS.chunks=ttsSplitText(txt.slice(0,400),100);DTTS.i=0;DTTS.job='';
  try{if(typeof A.ttsStopEdge==='function')A.ttsStopEdge()}catch(e){}
  playDockChunk(gen);
}
function playDockChunk(gen){
  if(gen!==DTTS.gen||DTTS.i>=DTTS.chunks.length)return;
  var A=null;try{A=window.Android}catch(e){}
  if(!A||typeof A.ttsSpeakEdge!=='function')return;
  var voice='en-US-BrianMultilingualNeural',pitch='+0Hz';
  var job='dock_'+(++HOME_TTS_SEQ);DTTS.job=job;
  try{A.ttsSpeakEdge(job,DTTS.chunks[DTTS.i],voice,pitch,1)}catch(e){}
  var nx=DTTS.chunks[DTTS.i+1];
  if(nx&&typeof A.ttsPrefetchEdge==='function'){
    try{A.ttsPrefetchEdge('dockpf_'+(++HOME_TTS_SEQ),nx,voice,pitch,1)}catch(e){}
  }
}
window.__slTtsEvent=function(job,ok,msg){
  if(!job)return;
  if(job.indexOf('dockpf_')===0||job.indexOf('grppf_')===0)return;
  if(job.indexOf('grp_')===0){
    if(job===GP.job){GP.busy=false;grpNext()}
    return;
  }
  if(job===DTTS.job){
    if(!ok){DTTS.chunks=[];return}
    DTTS.i++;playDockChunk(DTTS.gen);return;
  }
  /* 聊天页朗读任务的完成回调转发给 iframe，保证队列能继续 */
  try{
    var f=document.getElementById('butlerFrame');
    if(f&&f.contentWindow)f.contentWindow.postMessage({type:'sl_tts_event',job:job,ok:!!ok,msg:String(msg||'')},'*');
  }catch(e){}
};
/* 群聊多智能体朗读：各自音色，按消息顺序串行播报，不互相打断 */
var GQ=[],GP={busy:false,job:''};
function grpSpeak(text,voice,pitch){
  if(!HOME_TTS_ON)return;
  var t=String(text||'').replace(/[#*_>`\[\]]/g,' ').replace(/\s+/g,' ').trim();
  if(!t)return;
  ttsSplitText(t.slice(0,600),100).forEach(function(seg){
    GQ.push({text:seg,voice:voice||'en-US-BrianMultilingualNeural',pitch:pitch||'+0Hz'});
  });
  grpNext();
}
function grpNext(){
  if(GP.busy||!GQ.length)return;
  var A=null;try{A=window.Android}catch(e){}
  if(!A||typeof A.ttsSpeakEdge!=='function')return;
  var it=GQ.shift();GP.busy=true;
  var job='grp_'+(++HOME_TTS_SEQ);GP.job=job;
  try{A.ttsSpeakEdge(job,it.text,it.voice,it.pitch,1)}catch(e){GP.busy=false}
}
window.addEventListener('message',function(e){
  try{
    if(e&&e.data&&e.data.type==='sl_group_tts'){
      grpSpeak(e.data.text,e.data.voice,e.data.pitch);
    }
  }catch(err){}
});
function syncDockTts(){
  var b=$('dkTts');if(!b)return;
  b.classList.toggle('on',HOME_TTS_ON);b.classList.toggle('off',!HOME_TTS_ON);
  b.innerHTML='<i class="fa-solid '+(HOME_TTS_ON?'fa-volume-high':'fa-volume-xmark')+'"></i>';
}
function setDockMode(m){
  DOCK_MODE=(m==='chat')?'chat':'search';
  try{LS.put('sl_dock_mode',DOCK_MODE)}catch(e){}
  var t=$('dkTabs');if(t)[].forEach.call(t.children,function(b){b.classList.toggle('on',b.getAttribute('data-mode')===DOCK_MODE)});
  var i=$('dkInput');if(i)i.placeholder=DOCK_MODE==='chat'?'想和玉珩聊什么？直接说…':'输入关键词，玉珩帮你找…';
}
function dockReset(){
  DOCK_BUSY=false;DOCK_SEQ++;ASK_SEC=null;
  var t=$('bbTxt');if(t)t.textContent='主人，直接说您的需求，比如“我想找漫画网站”或“打开音乐”。';
  var b=$('dkBtns');if(b)b.innerHTML='';
  var bb=$('slBubble');if(bb)bb.classList.add('on');
  setTimeout(syncDockH,0);
}
function closeAiPop(){dockReset()}
function dockSay(opts){
  opts=opts||{};
  AI_POP_LAST=Date.now();
  var seq=++DOCK_SEQ;
  DOCK_BUSY=!!(opts.input||(opts.buttons&&opts.buttons.length));
  var t=$('bbTxt');if(t)t.textContent=opts.fallback||'亲爱的主人，请问需要我为您做些什么？';
  var b=$('dkBtns');if(b){
    b.innerHTML='';
    (opts.buttons||[]).forEach(function(x){
      var el=document.createElement('button');el.textContent=x.label;if(x.primary)el.className='pri';
      el.onclick=function(){closeAiPop();try{x.on&&x.on('')}catch(e){}};
      b.appendChild(el);
    });
  }
  var bb=$('slBubble');if(bb)bb.classList.add('on');
  setTimeout(function(){syncDockH();layoutBubble()},0);
  var spoken=false;
  function speakNow(){ if(spoken)return;spoken=true;
    if(!dockIsOpen())dockOpen();
    var el=$('bbTxt');if(el)homeSpeak(el.textContent); }
  if(opts.noAI){
    setTimeout(speakNow,160);
  }else{
    var spTo=setTimeout(speakNow,7000);
    aiGenerate(opts.fallback||'',opts.context||'').then(function(txt){
      if(txt&&seq===DOCK_SEQ){var el=$('bbTxt');if(el)el.textContent=txt;setTimeout(layoutBubble,30)}
    }).catch(function(){}).then(function(){clearTimeout(spTo);setTimeout(speakNow,80)});
  }
}
function aiPop(opts){dockSay(opts)}
(function(){
  var orb=$('slOrb');if(!orb)return;
  orb.onclick=dockOpen;
  var col=$('dkCollapse');if(col)col.onclick=dockClose;
  var cbtn=$('chatDockBtn');
  if(cbtn)cbtn.onclick=function(){ try{openButler('')}catch(e){} };
  var v=$('slChar');
  if(v){
    v.addEventListener('pointerdown',function(e){
      if(e.button!=null&&e.button!==0)return;
      CHAR.sx=e.clientX;CHAR.ox=v.getBoundingClientRect().left;
      CHAR.hold=setTimeout(function(){
        CHAR.drag=true;v.classList.add('dragging');
        try{v.setPointerCapture(e.pointerId)}catch(_){}
      },280);
      e.preventDefault();
    });
    v.addEventListener('pointermove',function(e){
      if(!CHAR.drag){if(Math.abs(e.clientX-CHAR.sx)>8)clearTimeout(CHAR.hold);return}
      setCharX(CHAR.ox+e.clientX-CHAR.sx+getCharW()/2);
      e.preventDefault();
    });
    function end(){clearTimeout(CHAR.hold);CHAR.drag=false;v.classList.remove('dragging')}
    v.addEventListener('pointerup',end);
    v.addEventListener('pointercancel',end);
    v.addEventListener('loadedmetadata',function(){setTimeout(function(){setCharX(CHAR.x||Math.round(window.innerWidth*0.62));layoutBubble()},40)});
  }
  window.addEventListener('resize',function(){syncDockH();setCharX(CHAR.x);layoutBubble()});
  try{new MutationObserver(function(){if(dockIsOpen()&&CHAR.inited)setCharX(CHAR.x)}).observe(document.body,{attributes:true,attributeFilter:['class']})}catch(e){}
  var tabs=$('dkTabs');
  if(tabs)tabs.onclick=function(e){var b=e.target.closest?e.target.closest('[data-mode]'):null;if(b)setDockMode(b.getAttribute('data-mode'))};
  function dockSend(){
    var i=$('dkInput');var q=String(i&&i.value||'').trim();if(!q)return;
    i.value='';
    try{if(window.slPetTrigger)window.slPetTrigger(q)}catch(e){}
    if(DOCK_MODE==='chat'){openButler(q);return}
    if(ASK_SEC){var s=ASK_SEC;ASK_SEC=null;filterSection(s,q);return}
    routeHomeQuery(q);
  }
  var snd=$('dkSend');if(snd)snd.onclick=dockSend;
  var din=$('dkInput');if(din)din.addEventListener('keydown',function(e){if(e.key==='Enter'||e.keyCode===13){e.preventDefault();dockSend()}});
  setDockMode(DOCK_MODE);
  var tb=$('dkTts');
  if(tb)tb.onclick=function(){HOME_TTS_ON=!HOME_TTS_ON;try{LS.put('sl_dock_tts',HOME_TTS_ON?'1':'0')}catch(e){};syncDockTts();toast(HOME_TTS_ON?'小窗朗读已开启':'小窗朗读已关闭')};
  syncDockTts();
  loadChar();
  dockReset();syncDockH();
})();
function aiGenerate(template,context){
  if(!GREET_KEY||!GREET_BASE)return Promise.resolve('');
  var prompt='你是巳泷资源库的全能管家玉珩，说话温柔、自然、不重复套话。请把下面这句兜底提示改写成一句更自然的中文提示，意思必须保持一致，不要加引号，不要解释。\n兜底：'+template+'\n场景：'+(context||'主页资源检索');
  var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort()},6500);
  return fetch(GREET_BASE.replace(/\/+$/,'')+'/chat/completions',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+GREET_KEY},
    body:JSON.stringify({model:GREET_MODEL,messages:[{role:'user',content:prompt}],temperature:1.0,max_tokens:90}),signal:ctrl.signal})
    .then(function(r){if(!r.ok)throw new Error('http');return r.json()})
    .then(function(j){var c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;return String(c||'').trim()})
    .finally(function(){clearTimeout(to)});
}

/* ================= v8.4.0 主页智能检索：AI 识别意图 + 模糊匹配 ================= */
var MODULE_MAP={music:'巳泷音乐',games:'游戏机',video:'影视乐园',imagepro:'图像处理',codeeditor:'编辑器',favorites:'我的收藏',level2d:'L2D',tip:'打赏♡'};
function coreOf(q){
  var s=String(q||'').toLowerCase().replace(/[，。！？、,.!?~～…:：;；\s]+/g,' ');
  s=s.replace(/(请|麻烦|帮我|帮忙|给我|我想|我要|想要|想|找找|找|搜索|搜|查询|查|看看|看一下|打开|进入|启动|去|逛|有没有|推荐|一些|一下|网站|网页|资源|平台|网址|入口|界面|功能|吗|呢|吧|啊|呀|哦|啦|的|了)/g,' ').replace(/\s+/g,' ').trim();
  if(!s)s=String(q||'').toLowerCase().replace(/[，。！？、,.!?~～…\s]+/g,' ').trim();
  return s;
}
function bigrams(s){s=String(s||'');var a=[];for(var i=0;i<s.length-1;i++)a.push(s.substr(i,2));return a.length?a:[s]}
/* 关键词清洗：只保留真正要搜的核心词，去掉“帮我/找一下/一些/资源/网站”等口语壳 */
function cleanKw(k){
  var s=String(k||'').replace(/[，。！？、,.!?~～…:：;；]+/g,' ').trim();
  s=s.replace(/^(请|麻烦|帮我|帮忙|给我|我想|我要|想要|想|找找|找一下|找|搜索一下|搜索|搜一下|搜|查询一下|查询|查一下|查|看看|看一下|打开|进入|去|有没有|推荐|一些|一点|一下|的|了)\s*/g,'');
  s=s.replace(/\s*(网站|网页|资源|平台|网址|入口|界面|功能|内容|相关|东西|网址入口|的网站|的资源)\s*$/g,'');
  return s.trim()||String(k||'').trim();
}
function sectionOfQuery(q){
  var c=coreOf(q);if(!c)return null;
  var SYN={'动漫':'漫画','电影':'影视','电视剧':'影视','连续剧':'影视','本子':'漫画','电子书':'小说','书':'小说','单机':'游戏','手游':'游戏','番剧':'漫画动画','歌曲':'音乐','歌':'音乐','壁纸':'图集'};
  if(SYN[c])c=SYN[c];
  var ATT=/免费|高清|中文|无广告|国内|最新|好用|精品|正版|完整|在线|下载/g;
  function pick(cc){
    var best=null,bs=0;
    order.forEach(function(o){
      var t=o.title.replace(/资源|工具|分享|服务|更新|竞技|合集/g,'');
      if(!t)return;
      var sc=0;
      if(o.title.indexOf(cc)>=0)sc=100;
      else if(cc.indexOf(t)>=0)sc=90;
      else if(t.indexOf(cc)>=0)sc=80;
      if(sc>bs){bs=sc;best=o}
    });
    return bs>=80?best:null;
  }
  var hit=pick(c);
  if(!hit){var c2=c.replace(ATT,'').trim();if(c2&&c2!==c)hit=pick(c2)}
  return hit;
}
function fuzzyHits(q){
  var core=coreOf(q),full=String(q||'').toLowerCase(),catOf={};
  order.forEach(function(o){sectionSites(o.id).forEach(function(x){if(!catOf[x.u])catOf[x.u]=o.title})});
  var out=[];
  allSites().forEach(function(s){
    var t=String(s.t||'').toLowerCase(),d=String(s.d||'').toLowerCase(),k=String(s.k||'').toLowerCase(),
        cat=String(catOf[s.u]||'').toLowerCase(),u=decodeU(s.u).toLowerCase(),sc=0;
    if(core){
      if(t.indexOf(core)>=0)sc=100;
      else if(k.indexOf(core)>=0)sc=85;
      else if(cat.indexOf(core)>=0)sc=70;
      else if(d.indexOf(core)>=0)sc=50;
      else if(u.indexOf(core)>=0)sc=40;
      else if(core.length>=2){
        var gs=bigrams(core),hit=0;
        gs.forEach(function(g){if(t.indexOf(g)>=0||d.indexOf(g)>=0||k.indexOf(g)>=0)hit++});
        if(hit)sc=Math.min(30,Math.round(hit/gs.length*30));
      }
    }
    if(!sc&&full&&d.indexOf(full)>=0)sc=15;
    if(sc>0)out.push({s:s,sc:sc,cat:catOf[s.u]||''});
  });
  out.sort(function(a,b){return b.sc-a.sc});
  return out;
}
function localIntent(q){
  var s=String(q||'');
  if(/聊天|委屈|难过|陪我|心情|聊聊|想你|孤单|无聊|烦|抱抱|不开心|喜欢你/.test(s))return {intent:'chat',keyword:s};
  var M=[['music',/音乐|听歌|歌单|播放器/],['games',/游戏机|小游戏|模拟器/],['video',/影视乐园|看剧|追剧/],
    ['imagepro',/图像处理|修图|抠图|ps/],['codeeditor',/代码编辑器|写代码|编辑器/],['favorites',/我的收藏|收藏夹/],
    ['level2d',/l2d|live2d|看板娘|桌宠/],['tip',/打赏/]];
  var openW=/打开|进入|启动|想用|用一下|去一下|进入一下/;
  for(var i=0;i<M.length;i++){if(openW.test(s)&&M[i][1].test(s))return {intent:'open',module:M[i][0],keyword:s}}
  return {intent:'search',keyword:coreOf(s)||s};
}
function aiIntent(q){
  var fallback=localIntent(q);
  var remote=new Promise(function(resolve){
    if(!GREET_KEY||!GREET_BASE){resolve(fallback);return}
    var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort()},5000);
    var prompt='你是巳泷资源库的管家玉珩。请判断用户这句话的意图，只输出一个 JSON，不要解释、不要代码块。\n'+
      '格式：{"intent":"search|chat|open","keyword":"检索关键词","module":"music|games|video|imagepro|codeeditor|favorites|level2d|tip"}\n'+
      '规则：想找网站/资源/内容→search，keyword 只保留核心名词（如“漫画”“小说”“免费影视”）；想聊天/说心情/与资源无关→chat；明确要打开某个站内板块→open 并填 module。\n'+
      '用户：'+String(q||'');
    fetch(GREET_BASE.replace(/\/+$/,'')+'/chat/completions',{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+GREET_KEY},
      body:JSON.stringify({model:GREET_MODEL,messages:[{role:'user',content:prompt}],temperature:.2,max_tokens:90}),signal:ctrl.signal})
      .then(function(r){if(!r.ok)throw new Error('http');return r.json()})
      .then(function(j){
        var c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
        var m=String(c||'').match(/\{[\s\S]*\}/);if(!m)throw new Error('json');
        var o=JSON.parse(m[0]);
        var it={intent:o.intent==='chat'?'chat':(o.intent==='open'?'open':'search'),
          keyword:String(o.keyword||'').trim(),module:String(o.module||'').trim()};
        if(it.intent==='search'&&!it.keyword)it.keyword=coreOf(q)||q;
        if(it.intent==='search')it.keyword=cleanKw(it.keyword||q);
        if(it.intent==='open'&&!MODULE_MAP[it.module])it.intent='search';
        resolve(it);
      }).catch(function(){resolve(fallback)}).finally(function(){clearTimeout(to)});
  });
  /* 兜底：网络/接口卡住时最多等 5.6 秒，直接按本地规则判断意图 */
  var guard=new Promise(function(resolve){setTimeout(function(){resolve(fallback)},5600)});
  return Promise.race([remote,guard]);
}
function openModuleById(id){
  var title=MODULE_MAP[id];if(!title)return false;
  var m=MODULES.filter(function(x){return x.t===title})[0];if(!m)return false;
  if(m.u==='level2d'){openLevel2DDialog();return true}
  location.href=m.u;return true;
}
function clearHits(){[].forEach.call(document.querySelectorAll('.card.hit'),function(c){c.classList.remove('hit')})}
function expandSection(id){
  var g=$('grid-'+id);if(!g)return;
  var sites=sectionSites(id);if(!sites.length)return;
  g.innerHTML=sites.map(function(s){return cardHtml(s,false)}).join('');
  var b=document.querySelector('[data-more="'+id+'"]');if(b){b.textContent='收起';b.setAttribute('data-open','1')}
}
function homeSearch(q,opts){
  opts=opts||{};
  q=String(q||'').trim();if(!q)return {n:0};
  var list=fuzzyHits(q),hits=[],seen={};
  list.forEach(function(x){if(x.sc>=40&&!seen[x.s.u]){seen[x.s.u]=1;hits.push(x.s)}});
  /* 当前内容模式下不可见的站点不参与站内命中 */
  var u2sec0={};order.forEach(function(o){sectionSites(o.id).forEach(function(s){u2sec0[s.u]=o.id})});
  hits=hits.filter(function(s){return siteOk(s,u2sec0[s.u]||'')});
  clearHits();
  if(!hits.length){
    if(!opts.silent){
      aiPop({fallback:'主人，站内未找到与「'+q+'」相关的内容，已为您转去全网检索。',
        buttons:[{label:'全网搜索',primary:true,on:function(){startWebSearch(q)}},{label:'再想想',on:function(){}}],
        context:'站内未找到相关内容'});
    }
    return {n:0,secs:{},firstId:''};
  }
  var secs={},uSet={},u2sec={};
  order.forEach(function(o){sectionSites(o.id).forEach(function(x){if(!u2sec[x.u])u2sec[x.u]=o.id})});
  hits.forEach(function(s){uSet[s.u]=1;var sid=u2sec[s.u];if(sid)secs[sid]=1});
  Object.keys(secs).forEach(expandSection);
  [].forEach.call(document.querySelectorAll('.card[data-u]'),function(c){if(uSet[c.getAttribute('data-u')])c.classList.add('hit')});
  var firstId=Object.keys(secs)[0];
  var first=firstId&&$(firstId);if(first){try{first.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}
  if(!opts.silent){
    aiPop({fallback:'主人，我为你找到 '+hits.length+' 个相关站点，已在页面中高亮标出。需要我继续帮你筛选吗？',
      buttons:[{label:'继续筛选',primary:true,on:function(){var v=$('apInput');if(v&&v.value)routeHomeQuery(v)}},
               {label:'全网搜索',on:function(){startWebSearch(q)}}],
      input:true,placeholder:'继续输入关键词，管家帮你缩小范围…',context:'本地检索 '+q});
  }
  return {n:hits.length,secs:secs,firstId:firstId};
}
/* v8.4.0：主页管家按钮——先识别意图，再决定检索 / 打开板块 / 进聊天 */
function routeHomeQuery(q){
  q=String(q||'').trim();
  if(!q)return;
  dockOpen();
  if(/^(https?:\/\/|www\.)/i.test(q)){
    var url=/^www\./i.test(q)?('https://'+q):q;
    aiPop({fallback:'主人，我检测到一个完整链接：'+url+'\n要直接前往目标页面，还是把它当作关键词继续搜索？',
      buttons:[{label:'前往网站',primary:true,on:function(){window.open(url,'_blank','noopener')}},
               {label:'搜索关键词',on:function(){routeHomeQuery(q.replace(/^https?:\/\//,'').replace(/^www\./i,''))}}],
      context:'检测到完整链接'});
    return;
  }
  aiPop({fallback:'请主人稍等片刻，玉珩正在理解您的需求…',noAI:true,input:true});
  aiIntent(q).then(function(it){
    if(it.intent==='open'&&openModuleById(it.module)){closeAiPop();toast('好的主人，正在为您打开…');return}
    var core=cleanKw(it.keyword||coreOf(q)||q)||q;
    /* 先判断是不是在找某个大板块：是则直接滑到该板块，再问类型，不把整句话当关键词 */
    var sec=sectionOfQuery(core);
    if(sec){
      closeAiPop();selectSection(sec.id);
      setTimeout(function(){askSectionType(sec);},420);
      return;
    }
    var res=homeSearch(core,{silent:true,keepInput:true});
    if(res.n){
      closeAiPop();
      aiPop({fallback:'主人，我已为您找到相关内容，请查看是否是你想看的资源（共 '+res.n+' 个站点）。',
        buttons:[{label:'就是它',primary:true,on:closeAiPop},
                 {label:'换个关键词',on:function(){aiPop({fallback:'好的，请在底部小窗输入新的关键词，我继续帮您找。',input:true,context:'等待新关键词'})}},
                 {label:'全网再找',on:function(){startWebSearch(core)}}],
        context:'站内找到相关内容 '+core});
      return;
    }
    /* 站内没有命中：先说明句，再直接回主页展示全网结果，不进聊天界面 */
    closeAiPop();
    aiPop({fallback:'主人，站内未找到与「'+core+'」相关的内容，已为您转去全网检索。',
      context:'站内未找到-转全网'});
    setTimeout(function(){startWebSearch(core)},700);
  }).catch(function(){closeAiPop();startWebSearch(cleanKw(coreOf(q)||q))});
}
/* 已定位板块后，继续在小窗输入更详细的关键词 → 只在该板块内筛选 */
var ASK_SEC=null;
function askSectionType(sec){
  ASK_SEC=sec;
  aiPop({fallback:'主人，您是在找「'+sec.title+'」板块的内容吗？可以点“就是这个板块”，再输入更详细的关键词，我帮您继续筛选。',
    buttons:[
      {label:'就是这个板块',primary:true,on:function(){
        aiPop({fallback:'好，请在底部小窗输入更详细的关键词（类型、标签或名字），我在「'+sec.title+'」里帮您精准定位。',
          buttons:[{label:'不用了',on:closeAiPop}],input:true,context:'板块内继续筛选 '+sec.title});
      }},
      {label:'不用了',on:closeAiPop}
    ],context:'确认分类板块 '+sec.title});
}
function filterSection(sec,kw){
  var k=String(kw||'').trim().toLowerCase();if(!k)return 0;
  clearHits();
  var matched=sectionSites(sec.id).filter(function(s){
    var hay=(s.t+' '+(s.d||'')+' '+(s.f||'')+' '+(s.k||'')).toLowerCase();
    return hay.indexOf(k)>=0;
  });
  if(!matched.length){toast('「'+sec.title+'」里暂时没有「'+kw+'」，可以直接往下逛');return 0}
  expandSection(sec.id);
  var set={};matched.forEach(function(s){set[s.u]=1});
  [].forEach.call(document.querySelectorAll('.card[data-u]'),function(c){if(set[c.getAttribute('data-u')])c.classList.add('hit')});
  var first=document.querySelector('.card.hit');
  if(first){try{first.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}}
  aiPop({fallback:'已为你在「'+sec.title+'」标出 '+matched.length+' 个与「'+kw+'」相关的站点。',
    buttons:[{label:'知道了',primary:true,on:closeAiPop},
             {label:'换一个类型',on:function(){askSectionType(sec)}}],
    context:'板块内筛选 '+sec.title+' '+kw});
  return matched.length;
}
function startWebSearch(q){
  q=cleanKw(String(q||'').trim());if(!q)return;
  dockClose();
  SEARCH.inline=true;SEARCH.mode='web';SEARCH.cat='all';
  if($('kw'))$('kw').value=q;
  homeMode='web';
  try{webSearch(q)}catch(e){toast('全网搜索启动失败：'+e.message)}
}

function loadData(){
  var pending=order.slice();
  (function next(){
    if(!pending.length){render();return}
    var id=pending.shift();
    if(loaded[id])return next();
    var s=document.createElement('script');
    s.src='data/'+id.id+'.js';
    s.onload=function(){loaded[id.id]=1;DATA[id.id]=window.SLDATA&&window.SLDATA[id.id];next()};
    s.onerror=function(){loaded[id.id]=1;next()};
    document.body.appendChild(s);
  })();
}
function sectionSites(id){
  var d=DATA[id]; if(!d||!d.cards)return [];
  var out=[];
  d.cards.forEach(function(c){(c.sites||[]).forEach(function(s){out.push(s)})});
  return out;
}
function allSites(){var a=[];order.forEach(function(o){a=a.concat(sectionSites(o.id))});return a}
function cardHtml(s,hero){
  var u=decodeU(s.u),h=host(s.u);
  return '<div class="card'+(hero?' hero':'')+'" data-u="'+esc(s.u)+'">'+
    '<div class="av">'+esc(initial(s.t))+'</div>'+
    '<div class="bd"><div class="tt">'+esc(s.t)+'</div><div class="ds">'+esc(s.d||'')+'</div>'+
    (h?'<div class="hs">'+esc(h)+'</div>':'')+'</div></div>';
}
function modCardHtml(m){
  return '<div class="card hero" data-mod="'+esc(m.u)+'">'+
    '<div class="av"><i class="'+m.i+'"></i></div>'+
    '<div class="bd"><div class="tt">'+esc(m.t)+'</div><div class="ds">'+esc(m.d)+'</div>'+
    '<div class="hs">进入板块 →</div></div></div>';
}

/* ===== 主页轮播 / 搜索 / 快捷直达 ===== */
/* v9.9.0：链接全部来自 data/links-app.js / links-web.js 动态数据层 */
var LBT=((window.SLLINKS&&SLLINKS.lbt)||[]).map(function(x){return [x[0],SL_D(x[1])]});
/* v9.8.0：完全按原站 silong-respool.github.io/gay/ 的顺序复刻，分两行 */
var QUICK1=((window.SLLINKS&&SLLINKS.quick1)||[]).map(function(x){return [x[0],SL_D(x[1]),x[2]]});
var QUICK2=((window.SLLINKS&&SLLINKS.quick2)||[]).map(function(x){return [x[0],SL_D(x[1]),x[2]]});
var FAV=LS.get('sl_fav_sites',[]);
function isFav(u){return FAV.some(function(x){return x.u===u})}
function toggleFav(site){
  var u=decodeU(site.u||'');
  var i=FAV.findIndex(function(x){return x.u===u});
  if(i>=0)FAV.splice(i,1);else FAV.push({t:site.t||host(u)||u,u:u});
  LS.put('sl_fav_sites',FAV);
  render();
  toast(i>=0?'已取消收藏':'已收藏，可在侧边栏「我的收藏」找到');
}
var lbtIdx=0,lbtTimer=0,homeMode='site';
function homeTopHtml(){
  var mk=modeKind();
  function img(i,dir){
    var fb=LBT[(i-1)%Math.max(1,LBT.length)];
    var fbSrc=fb?fb[0]:'logo.png';
    return '<a class="lbt-item" href="javascript:;"><img src="assets/lbt-'+dir+'/'+i+'.jpg" onerror="this.onerror=null;this.src=\''+esc(fbSrc)+'\'" alt="'+dir+' 轮播 '+i+'"></a>';
  }
  var slides,dots,n;
  if(mk==='daily'){ n=6;slides=[1,2,3,4,5,6].map(function(i){return img(i,'day')}).join(''); }
  else if(mk==='adult'){ n=6;slides=[1,2,3,4,5,6].map(function(i){return img(i,'night')}).join(''); }
  else{ n=12;slides=[1,2,3,4,5,6].map(function(i){return img(i,'day')}).join('')+[1,2,3,4,5,6].map(function(i){return img(i,'night')}).join(''); }
  dots=[];for(var di=0;di<n;di++)dots.push('<i class="'+(di===0?'on':'')+'" data-lbt="'+di+'"></i>');
  dots=dots.join('');
  function linkHtml(x,extra){
    return '<a href="'+esc(x[1])+'"'+(x[1]==='#album'?'':' target="_blank" rel="noopener"')+(extra||'')+'><i class="'+x[2]+'"></i>'+esc(x[0])+'</a>';
  }
  var ql1,ql2;
  var TOOLS=[['图像处理','imagepro/index.html','fa-solid fa-wand-magic-sparkles'],
             ['编辑器','codeeditor/index.html','fa-solid fa-code'],
             ['我的收藏','favorites/index.html','fa-solid fa-star']];
  function toolsHtml(){return TOOLS.map(function(x){return '<a href="'+esc(x[1])+'"><i class="'+x[2]+'"></i>'+esc(x[0])+'</a>'}).join('')}
  if(mk==='daily'){
    ql1=toolsHtml(); ql2='';
  }else if(mk==='adult'){
    ql1=QUICK1.map(function(x){return linkHtml(x,x[0]==='打赏♡'?' style="border-color:rgba(217,70,239,.65);color:#ffd6f4;background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(217,70,239,.14))"':'')}).join('')+'<button class="ql-more" id="qlMore">更多</button>';
    ql2=QUICK2.map(function(x){return linkHtml(x)}).join('');
  }else{
    ql1=toolsHtml()+QUICK1.map(function(x){return linkHtml(x)}).join('')+'<button class="ql-more" id="qlMore">更多</button>';
    ql2=QUICK2.map(function(x){return linkHtml(x)}).join('');
  }
  return '<div class="home-top">'+
    '<div class="greet-bar" id="greetBar"><div class="greet-track" id="greetTxt"></div></div>'+
    '<div class="lbt" id="lbt"><div class="lbt-box" id="lbtBox">'+slides+'</div>'+
      '<button class="lbt-btn lbt-prev" id="lbtPrev" title="上一张"><i class="fa-solid fa-chevron-left"></i></button>'+
      '<button class="lbt-btn lbt-next" id="lbtNext" title="下一张"><i class="fa-solid fa-chevron-right"></i></button>'+
      '<div class="lbt-dots" id="lbtDots">'+dots+'</div></div>'+
    '<div class="quick-links" id="qlBar"><div class="ql-line ql-row1">'+ql1+'</div><div class="ql-line ql-row2" id="qlRow2">'+ql2+'</div></div>'+
    '<div id="srInlineHost"></div>'+
  '</div>';
}
function lbtShow(i){
  var box=$('lbtBox');if(!box)return;
  var n=box.children.length||3;
  lbtIdx=(i+n)%n;
  box.style.transform='translateX(-'+(lbtIdx*100/n)+'%)';
  [].forEach.call($('lbtDots').children,function(d,k){d.classList.toggle('on',k===lbtIdx)});
}
function bindHomeTop(){
  var box=$('lbtBox');if(!box)return;
  lbtShow(0);
  if(lbtTimer)clearInterval(lbtTimer);
  lbtTimer=setInterval(function(){lbtShow(lbtIdx+1)},4500);
  $('lbtPrev').onclick=function(){lbtShow(lbtIdx-1)};
  $('lbtNext').onclick=function(){lbtShow(lbtIdx+1)};
  $('lbtDots').onclick=function(e){var d=e.target.closest?e.target.closest('[data-lbt]'):null;if(d)lbtShow(+d.getAttribute('data-lbt'))};
  var sx=0;
  $('lbt').addEventListener('touchstart',function(e){sx=e.touches[0].clientX;pauseLbt()},{passive:true});
  $('lbt').addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)lbtShow(lbtIdx+(dx<0?1:-1));resumeLbt()});
  $('lbt').addEventListener('mouseenter',pauseLbt);
  $('lbt').addEventListener('mouseleave',resumeLbt);
  var qm=$('qlMore');
  if(qm)qm.onclick=function(){
    var bar=$('qlBar'); if(!bar)return;
    var on=bar.classList.toggle('expand');
    qm.textContent=on?'收起':'更多';
  };
  var alb=document.querySelector('.quick-links a[href="#album"]');
  if(alb)alb.onclick=function(e){e.preventDefault();$('albumOv').classList.add('on')};
  try{
    if($('albumA')&&window.SLLINKS)$('albumA').href=SL_D(SLLINKS.album1);
    if($('albumB')&&window.SLLINKS)$('albumB').href=SL_D(SLLINKS.album2);
  }catch(e){}
  var ac=$('albumClose'); if(ac)ac.onclick=function(){$('albumOv').classList.remove('on')};
  var ao=$('albumOv'); if(ao)ao.onclick=function(e){if(e.target===ao)ao.classList.remove('on')};
  maybeGreet();
}
function pauseLbt(){if(lbtTimer){clearInterval(lbtTimer);lbtTimer=0}}
function resumeLbt(){if(!lbtTimer&&$('lbtBox'))lbtTimer=setInterval(function(){lbtShow(lbtIdx+1)},4500)}
/* v9.8.1：主页每日问候 / 整点祝福（AI 生成，不写入聊天记录） */
/* v9.9.0：问候接口同样走 data/api-app.js / api-web.js，页面不再出现明文 Key */
var GREET_KEY=(window.SL_API&&SL_API.k&&SL_API.k[0])?SL_D(SL_API.k[0]):'';
var GREET_BASE=(window.SL_API?SL_D(SL_API.b):'https://api.agnes-ai.cn/v1');
var GREET_MODEL=(window.SL_API?SL_D(SL_API.m):'agnes-3.0-flash');
function greetFallback(h){
  var m=(window.SLMODE?SLMODE.eff():'adult');
  if(m==='kids'){
    if(h>=5&&h<9)return '小朋友早安呀，起床后记得刷牙洗脸，喝一杯温水再吃早饭。';
    if(h>=9&&h<12)return '上午好呀小朋友，看完一集动画就让眼睛休息一下下。';
    if(h>=12&&h<14)return '中午啦，先吃午饭再睡个午觉，下午才有力气玩。';
    if(h>=14&&h<18)return '下午好小朋友，玩游戏记得每隔一会儿站起来活动一下。';
    if(h>=18&&h<22)return '晚上好呀，今天看了什么好玩的动画？早点收拾好玩具哦。';
    return '已经很晚啦小朋友，该刷牙睡觉了，晚安好梦。';
  }
  if(m==='daily'){
    if(h>=5&&h<9)return '早上好，今天也按计划来。先喝水、吃早餐，再开始手头的事。';
    if(h>=9&&h<12)return '上午好，工作学习记得每小时起来活动一下，效率会更高。';
    if(h>=12&&h<14)return '中午了，先吃饭休息，下午的安排不用急着现在做。';
    if(h>=14&&h<18)return '下午好，今天剩下的任务列一下，重要的先完成。';
    if(h>=18&&h<23)return '晚上好，今天辛苦了，把明天要做的事记下来就收工吧。';
    return '时间不早了，建议尽快休息，明天还要用精神。';
  }
  if(h>=5&&h<9)return '早安，主人。天刚亮，记得先喝一杯温水，早餐要好好吃。';
  if(h>=9&&h<12)return '上午好，主人。今天也请慢慢来，重要的事一件一件做。';
  if(h>=12&&h<14)return '中午好，主人。先放下手里的事，去吃午饭，再小憩一会儿。';
  if(h>=14&&h<18)return '下午好，主人。忙累了就伸个懒腰，晚餐想吃点什么呢？';
  if(h>=18&&h<23)return '晚上好，主人。今天辛苦了，愿余下的时间都轻轻松松。';
  return '这么晚了，主人。该把手机放下，去睡觉了，晚安，做个好梦。';
}
function showGreeting(t){
  var bar=$('greetBar'),txt=$('greetTxt'); if(!bar||!txt)return;
  txt.textContent='✦ '+t+' ✦';
  bar.classList.add('on');
  clearTimeout(window.__greetHide);
  window.__greetHide=setTimeout(function(){ bar.classList.remove('on'); },15000);
}
function aiGreeting(h){
  var m=(window.SLMODE?SLMODE.eff():'adult');
  var sys= m==='kids'
    ? '你是温柔的大哥哥，正在对小朋友说话。称呼“小朋友”。'
    : (m==='daily'
      ? '你是一位专业、理性的办公与资源管家，不带暧昧，称呼用户为“你”。'
      : '你是一位温柔、尊敬的中文男管家，称呼“主人”。');
  var tip= m==='kids'
    ? '结合时段给小朋友关怀（早上鼓励起床、白天提醒休息眼睛、晚上劝早睡）。'
    : (m==='daily'
      ? '结合时段给工作学习提醒（喝水、休息、吃饭、收工与明日计划）。'
      : '结合当前时段给出关心的提醒（早晨活力/中午午饭午休/下午日程与晚餐/深夜温柔劝睡）。');
  var prompt=sys+'现在是'+h+'点。请用一句话问候，'+tip+'要求：20~45 个汉字，自然，不要提“我是AI”，不要用引号，不要固定模板。只输出这一句话。';
  var ctrl=new AbortController(); var to=setTimeout(function(){ctrl.abort()},9000);
  return fetch(GREET_BASE.replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+GREET_KEY},
    body:JSON.stringify({model:GREET_MODEL,messages:[{role:'user',content:prompt}],temperature:0.95,max_tokens:90}),signal:ctrl.signal})
    .then(function(r){return r.json()}).then(function(j){var c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;return String(c||'').trim()})
    .finally(function(){clearTimeout(to)});
}
function refreshGreeting(force){
  var now=new Date(),h=now.getHours(),band=h;
  var key='sl_greeting_'+now.toDateString()+'_'+band;
  var cached=LS.get(key,'');
  if(cached&&!force){ showGreeting(cached); return; }
  showGreeting(greetFallback(h));
  aiGreeting(h).then(function(t){
    if(t&&t.length>=6&&t.length<=90){ LS.put(key,t); showGreeting(t); }
  }).catch(function(){});
}
function maybeGreet(){ setTimeout(refreshGreeting,350); }
function startRuntime(){
  clearInterval(window.__slRunT);
  function pad(n){return n<10?'0'+n:String(n)}
  function upd(){
    var start=new Date('2020-01-01T00:00:00+08:00').getTime();
    var diff=Math.max(0,Date.now()-start);
    var days=Math.floor(diff/86400000);
    var h=Math.floor(diff/3600000)%24, m=Math.floor(diff/60000)%60, s=Math.floor(diff/1000)%60;
    if($('runDays'))$('runDays').textContent=days;
    if($('runH'))$('runH').textContent=pad(h);
    if($('runM'))$('runM').textContent=pad(m);
    if($('runS'))$('runS').textContent=pad(s);
    if($('copyYear'))$('copyYear').textContent='© 2020-'+new Date().getFullYear();
  }
  upd(); window.__slRunT=setInterval(upd,1000);
  var mail=$('aboutMail');
  if(mail) mail.onclick=function(){
    var e=this.getAttribute('data-mail')||'';
    try{ navigator.clipboard.writeText(e); }catch(err){
      try{var ta=document.createElement('textarea');ta.value=e;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}catch(_){}
    }
    toast('邮箱已复制：'+e);
  };
}
/* v8.4.0：导航只做平滑滚动定位，整页内容始终连贯 */
function selectSection(id){
  CURRENT_SEC=id;
  try{localStorage.setItem('sl_cur_sec',id)}catch(e){}
  document.body.classList.remove('sb');
  try{closeSr()}catch(e){}
  var el=document.getElementById(id);
  if(el){
    try{el.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){el.scrollIntoView()}
  }
  var links=document.querySelectorAll('.side a[href^="#"]');
  for(var i=0;i<links.length;i++){
    var href=links[i].getAttribute('href')||'';
    if(href==='#'+id) links[i].classList.add('on'); else links[i].classList.remove('on');
  }
}
function bindMoreButtons(){
  var btns=document.querySelectorAll('[data-more]');
  for(var i=0;i<btns.length;i++){
    (function(b){
      b.onclick=function(){
        var id=b.getAttribute('data-more');
        var g=document.getElementById('grid-'+id);
        if(!g)return;
        var sites=sectionOkSites(id);
        if(b.getAttribute('data-open')==='1'){
          g.innerHTML=sites.slice(0,9).map(function(s){return cardHtml(s,false)}).join('');
          b.textContent='展开全部';b.setAttribute('data-open','0');
        }else{
          g.innerHTML=sites.map(function(s){return cardHtml(s,false)}).join('');
          b.textContent='收起';b.setAttribute('data-open','1');
        }
      };
    })(btns[i]);
  }
}
/* 侧边栏：模式 / 取向 / 密码 / 儿童时长 / 分级调整 */
function needPwd(){
  var v=prompt('请输入密码（默认 2778）','');
  if(v==null)return false;
  if(String(v)!==String(MODE.pwd)){ toast('密码错误'); return false; }
  return true;
}
function askAdultOri(){
  var same=confirm('你的取向是「同性」吗？\n确定 = 同性（下一步选男同 / 女同）\n取消 = 异性（男女向）');
  if(!same){ MODE.setOri('bg'); return; }
  var gay=confirm('确定 = 男同\n取消 = 女同');
  MODE.setOri(gay?'gay':'les');
}
function buildModeSide(sb){
  var g=document.createElement('div');g.className='grp';g.textContent='内容模式';sb.appendChild(g);
  var modes=[['day','白日·办公'],['night','黑夜·成人']];
  modes.forEach(function(x){
    var a=document.createElement('a');a.href='javascript:;';
    a.innerHTML='<span class="ic"><i class="fa-solid fa-circle-half-stroke"></i></span>'+x[1];
    if(MODE.mode===x[0])a.classList.add('on');
    a.onclick=function(e){
      e.preventDefault();
      if(MODE.mode===x[0])return;
      var need=(x[0]==='adult'||x[0]==='kids'||MODE.mode==='kids');
      if(need&&!needPwd())return;
      MODE.setMode(x[0]);MODE.apply();
      if(x[0]==='adult' && !(window.__oriAsked)){
        window.__oriAsked=true; askAdultOri();
      }
      render();toast('已切换到：'+x[1]);
    };
    sb.appendChild(a);
  });
  if(modeKind()==='adult'){
    var g2=document.createElement('div');g2.className='grp';g2.textContent='成人取向';sb.appendChild(g2);
    [['gay','男同 ♂'],['les','女同 ♀'],['bg','男女 ♂♀']].forEach(function(o){
      var a=document.createElement('a');a.href='javascript:;';
      a.innerHTML='<span class="ic">'+(o[0]==='les'?'♀':'♂')+'</span>'+o[1];
      if(MODE.ori===o[0])a.classList.add('on');
      a.onclick=function(e){e.preventDefault();MODE.setOri(o[0]);render();toast('取向：'+o[1])};
      sb.appendChild(a);
    });
  }
  var g3=document.createElement('div');g3.className='grp';g3.textContent='模式设置';sb.appendChild(g3);
  if(MODE.mode==='all'){
    var dn=document.createElement('a');dn.href='javascript:';
    dn.innerHTML='<span class="ic"><i class="fa-solid fa-moon"></i></span>当前：'+(MODE.day()?'白日·日常':'黑夜·成人')+'（点击切换）';
    dn.onclick=function(e){e.preventDefault();MODE.setDay(!MODE.day());MODE.apply();render();toast(MODE.day()?'已切换到白日·日常':'已切换到黑夜·成人')};
    sb.appendChild(dn);
  }
  var pw=document.createElement('a');pw.href='javascript:;';
  pw.innerHTML='<span class="ic"><i class="fa-solid fa-key"></i></span>修改切换密码';
  pw.onclick=function(e){e.preventDefault();
    var v=prompt('新密码（默认 2778）：',MODE.pwd);
    if(v==null)return;MODE.setPwd(v);toast('密码已更新');
  };sb.appendChild(pw);
  var kl=document.createElement('a');kl.href='javascript:;';
  kl.innerHTML='<span class="ic"><i class="fa-solid fa-hourglass"></i></span>儿童游玩时长（'+MODE.kidsLimit+' 分钟）';
  kl.onclick=function(e){e.preventDefault();
    var v=prompt('儿童模式游玩时长（分钟，5~600）：',MODE.kidsLimit);
    if(v==null)return;MODE.setKidsLimit(v);toast('已设为 '+MODE.kidsLimit+' 分钟');
  };sb.appendChild(kl);
  var g4=document.createElement('div');g4.className='grp';g4.textContent='分级调整（点击切换）';sb.appendChild(g4);
  order.forEach(function(o){
    var cur=MODE.getKind(o.id)||'auto';
    var label={auto:'自动',daily:'日常',adult:'成人',kids:'儿童'}[cur]||'自动';
    var a=document.createElement('a');a.href='javascript:;';
    a.innerHTML='<span class="ic"><i class="fa-solid fa-tag"></i></span>'+esc(o.title)+' · '+label;
    a.onclick=function(e){e.preventDefault();
      var next={auto:'daily',daily:'adult',adult:'kids',kids:'auto'}[cur];
      if(next==='auto'){ // 清除覆盖
        try{var m=JSON.parse(localStorage.getItem('sl_sect_kind')||'{}');delete m[o.id];localStorage.setItem('sl_sect_kind',JSON.stringify(m));}catch(err){}
      }else MODE.setKind(o.id,next);
      toast(o.title+' → '+({daily:'日常',adult:'成人',kids:'儿童',auto:'自动'}[next]));
      location.reload();
    };
    sb.appendChild(a);
  });
}
function render(){
  var c=$('content');c.innerHTML=homeTopHtml();
  bindHomeTop();
  var isKids=(modeKind()==='kids');
  if(isKids){
    var kh=document.createElement('div');kh.className='hd';
    kh.innerHTML='<h2><i class="fa-solid fa-candy-cane" style="color:#ff8fb1"></i> 小朋友专区</h2><span class="cnt">动画 · 游戏 · 科普</span>';
    var kg=document.createElement('div');kg.className='grid kid-mod';
    kg.innerHTML=MODE.KIDS.map(function(k){
      return '<div class="card hero" data-kid="'+esc(k.id)+'"><div class="av">'+k.icon+'</div><div class="bd">'+
        '<div class="tt">'+esc(k.title)+'</div><div class="ds">点进去看看 '+k.sites.length+' 个好去处</div>'+
        '<div class="hs">儿童专属 →</div></div></div>';
    }).join('');
    c.appendChild(kh);c.appendChild(kg);
    MODE.KIDS.forEach(function(k){
      var h=document.createElement('div');h.className='hd';h.id=k.id;
      h.innerHTML='<h2>'+esc(k.title)+'</h2><span class="cnt">'+k.sites.length+' 个站点</span>';
      var g=document.createElement('div');g.className='grid';g.id='grid-'+k.id;
      g.innerHTML=k.sites.map(function(s){
        return '<div class="card" data-url="'+esc(s.u)+'"><div class="av">'+(s.e||'🎈')+'</div>'+
          '<div class="bd"><div class="tt">'+esc(s.t)+'</div><div class="ds">'+esc(s.d)+'</div>'+
          '<div class="hs">点击打开</div></div></div>';
      }).join('');
      c.appendChild(h);c.appendChild(g);
    });
  }else{
  var h1=document.createElement('div');h1.className='hd';h1.innerHTML='<h2><i class="fa-solid fa-layer-group" style="color:var(--acc2)"></i> 功能板块</h2><span class="cnt">全新融合板块</span>';
  var g1=document.createElement('div');g1.className='grid';
  g1.innerHTML=MODULES.map(modCardHtml).join('');
  c.appendChild(h1);c.appendChild(g1);
  /* v8.4.0：整页连贯——所有分类都渲染在同一页，默认每个分类展示 9 个卡片，点「展开」看全部；
     左侧导航只做平滑滚动定位，不切页、不固定，用户可上下自由滑动。 */
  order.forEach(function(o){
    var sites=sectionOkSites(o.id);
    if(!sites.length)return;
    var h=document.createElement('div');h.className='hd';h.id=o.id;
    h.innerHTML='<h2>'+esc(o.title)+'</h2><span class="cnt">'+sites.length+' 个站点</span>'+
      (sites.length>9?'<button class="more" type="button" data-more="'+o.id+'">展开全部</button>':'');
    var g=document.createElement('div');g.className='grid';g.id='grid-'+o.id;
    g.innerHTML=sites.slice(0,9).map(function(s){return cardHtml(s,false)}).join('');
    c.appendChild(h);c.appendChild(g);
  });
  /* 儿童启蒙：并入日常内容分类（黑夜模式自动隐藏） */
  if(modeKind()!=='adult' && MODE && MODE.KIDS){
    var ks=[];MODE.KIDS.forEach(function(k){ks=ks.concat(k.sites)});
    var kh2=document.createElement('div');kh2.className='hd';kh2.id='kids-section';
    kh2.innerHTML='<h2><i class="fa-solid fa-child" style="color:#f59e0b"></i> 儿童启蒙</h2><span class="cnt">'+ks.length+' 个站点</span>';
    var kg2=document.createElement('div');kg2.className='grid';kg2.id='grid-kids-section';
    kg2.innerHTML=ks.map(function(s){
      return '<div class="card" data-url="'+esc(s.u)+'"><div class="av">'+(s.e||'🎈')+'</div>'+
        '<div class="bd"><div class="tt">'+esc(s.t)+'</div><div class="ds">'+esc(s.d)+'</div>'+
        '<div class="hs">点击打开</div></div></div>';
    }).join('');
    c.appendChild(kh2);c.appendChild(kg2);
  }
  }
  bindMoreButtons();
  try{initButlerPopups()}catch(e){}
  /* 关于网站（动态运行时长 + 三个联系方式 + 打赏） */
  var about=document.createElement('div');about.className='about-site';about.id='aboutSite';
  var QQURL=SL_D(SLLINKS.qq);
  var MPURL=SL_D(SLLINKS.mp);
  about.innerHTML='<h2><i class="fa-solid fa-circle-info" style="color:#c084fc"></i> 关于网站</h2>'+
    '<div class="meta">巳泷资源库 · 已运行 <b id="runDays" style="color:#e9d5ff">--</b> 天 <b id="runH" style="color:#e9d5ff">--</b> 小时 <b id="runM" style="color:#e9d5ff">--</b> 分 <b id="runS" style="color:#e9d5ff">--</b> 秒<br><span id="copyYear">© 2020-'+new Date().getFullYear()+'</span> 巳泷资源库 · 所有资源永久免费，不设会员墙、不强制收费。</div>'+
    '<div class="disc">免责声明：本站仅收录公开网络资源入口，不存储、不制作、不传播任何违法内容。资源版权归原作者所有，请于 24 小时内删除并支持正版。若权利人认为内容侵权，请通过下方联系方式告知，我们会在收到通知后第一时间处理。未成年人请勿访问成人内容。</div>'+
    '<div class="contact-row">'+
      '<a class="pill" href="'+QQURL+'" target="_blank" rel="noopener"><i class="fa-brands fa-qq"></i> QQ群</a>'+
      '<a class="pill" href="'+MPURL+'" target="_blank" rel="noopener"><i class="fa-brands fa-weixin"></i> 公众号</a>'+
      '<a class="pill" href="javascript:;" id="aboutMail" data-mail="'+esc(SL_D(SLLINKS.mail))+'"><i class="fa-solid fa-envelope"></i> 邮箱</a>'+
      '<a class="pill" href="'+esc(SL_D(SLLINKS.tip))+'"><i class="fa-solid fa-heart"></i> 打赏</a>'+
    '</div>';
  c.appendChild(about);
  startRuntime();
  var sb=$('side');sb.innerHTML='';
  var isKidsSide=(modeKind()==='kids');
  if(!isKidsSide){
  var gh=document.createElement('div');gh.className='grp';gh.textContent='功能板块';sb.appendChild(gh);
  MODULES.forEach(function(m){
    var a=document.createElement('a');a.className='hero';a.href=m.u;a.target='_blank';a.rel='noopener';
    a.innerHTML='<span class="ic"><i class="'+m.i+'"></i></span>'+esc(m.t);
    a.onclick=function(e){
      /* 关键：保留 target=_blank，让 App 走本地 HTTP 页面/原生视频壳，避免 file:// 黑屏 */
      document.body.classList.remove('sb');
      try{closeSr()}catch(err){}
      SEARCH.seq++;SEARCH._stopped=true;
      if(m.u==='level2d'){ e.preventDefault(); openLevel2DDialog(); }
    };
    sb.appendChild(a)
  });

  var gh2=document.createElement('div');gh2.className='grp';gh2.textContent='资源分类';sb.appendChild(gh2);
  order.forEach(function(o){
    if(!sectionOkSites(o.id).length)return;
    var a=document.createElement('a');a.href='#'+o.id;
    a.innerHTML='<span class="ic"><i class="fa-solid fa-folder"></i></span>'+esc(o.title);
    if(o.id===CURRENT_SEC)a.classList.add('on');
    a.onclick=function(e){ e.preventDefault(); selectSection(o.id); };
    sb.appendChild(a);
  });
  if(modeKind()!=='adult' && MODE && MODE.KIDS){
    var ak=document.createElement('a');ak.href='#kids-section';
    ak.innerHTML='<span class="ic"><i class="fa-solid fa-child"></i></span>儿童启蒙';
    ak.onclick=function(e){e.preventDefault();selectSection('kids-section')};
    sb.appendChild(ak);
  }
  }else{
    var ghK=document.createElement('div');ghK.className='grp';ghK.textContent='儿童专区';sb.appendChild(ghK);
    MODE.KIDS.forEach(function(k){
      var a=document.createElement('a');a.href='#'+k.id;
      a.innerHTML='<span class="ic">'+k.icon+'</span>'+esc(k.title);
      a.onclick=function(e){ e.preventDefault(); selectSection(k.id); };
      sb.appendChild(a);
    });
  }
  /* v9.8.3：APP 下载上方新增「联系方式」（QQ群 / 公众号 / 邮箱复制） */
  var ghC=document.createElement('div');ghC.className='grp';ghC.textContent='联系方式';sb.appendChild(ghC);
  var cQQ=document.createElement('a');cQQ.href=QQURL;cQQ.target='_blank';cQQ.rel='noopener';
  cQQ.innerHTML='<span class="ic"><i class="fa-solid fa-comments"></i></span>QQ 群';
  cQQ.onclick=function(){ document.body.classList.remove('sb'); };
  sb.appendChild(cQQ);
  var cMP=document.createElement('a');cMP.href=MPURL;cMP.target='_blank';cMP.rel='noopener';
  cMP.innerHTML='<span class="ic"><i class="fa-brands fa-weixin"></i></span>公众号';
  cMP.onclick=function(){ document.body.classList.remove('sb'); };
  sb.appendChild(cMP);
  var cMail=document.createElement('a');cMail.href='javascript:;';
  cMail.innerHTML='<span class="ic"><i class="fa-solid fa-envelope"></i></span>邮箱（点击复制）';
  cMail.onclick=function(e){
    if(e)e.preventDefault();
    var m=SL_D(SLLINKS.mail);
    try{ navigator.clipboard.writeText(m); }catch(err){
      try{var ta=document.createElement('textarea');ta.value=m;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}catch(_){}
    }
    toast('邮箱已复制：'+m);
  };
  sb.appendChild(cMail);
  /* v9.8.0：侧边栏最底部 APP 下载——点击立即在应用内部复制安装包，不跳外链 */
  var ghApp=document.createElement('div');ghApp.className='grp';ghApp.textContent='应用';sb.appendChild(ghApp);
  var dl=document.createElement('a');dl.href=SL_D(SLLINKS.app);dl.target='_blank';dl.rel='noopener';
  dl.innerHTML='<span class="ic"><i class="fa-solid fa-download"></i></span>APP 下载';
  dl.style.background='linear-gradient(135deg,rgba(109,40,217,.22),rgba(217,70,239,.16))';
  dl.style.margin='6px 10px';dl.style.borderRadius='10px';
  dl.onclick=function(){ document.body.classList.remove('sb'); };
  sb.appendChild(dl);
}

/* =====================================================================
   搜索模块
   ===================================================================== */
var SEARCH={mode:'site',cat:'all',layout:'list',kw:'',
  data:{web:[],video:[],image:[],magnet:[]},
  seen:{web:{},video:{},image:{},magnet:{}},
  eng:{},busy:false,seq:0,_rt:0,loadingMore:false,doneAll:false};
window.__SR=SEARCH; /* 调试用：可在控制台查看翻页/引擎状态 */
var butlerLoaded=false;
function openButler(q,mode){
  var f=$('butlerFrame');if(!f)return;
  mode=mode||'chat';
  var cur=f.getAttribute('src')||'';
  if(!butlerLoaded||!cur){
    f.src='butler/index.html?mode='+mode+(q?('&q='+encodeURIComponent(q)):'');
    butlerLoaded=true;
  }else{
    try{ f.contentWindow.postMessage({type:'sl_butler_mode',mode:mode},'*'); }catch(e){}
    if(q){
      // v9.8.1：只把关键词带到管家，不自动发送；由主人决定聊天还是检索
      try{ f.contentWindow.postMessage({type:'sl_butler_query',q:String(q)},'*'); }catch(e){}
    }
  }
  $('butlerView').classList.add('on');
}
$('butlerClose').onclick=function(){ $('butlerView').classList.remove('on'); SL_POP.lastAct=Date.now(); };

/* ================= v8.4.0 管家主动提示（AI 文案 + 兜底模板） ================= */
var SL_POP={first:false,sec:'',secTimer:0,idleTimer:0,lastAct:Date.now(),prompted:{}};
function slTouch(){SL_POP.lastAct=Date.now()}
function openChatOrSearch(v){
  v=String(v||'').trim();
  if(/聊天|委屈|难过|陪我|心情|聊聊|想你|孤单/.test(v)){ openButler(v||'我想和你聊聊天'); return; }
  if(v)routeHomeQuery(v); else openButler('');
}
function initButlerPopups(){
  if(window.__slPopInit)return;window.__slPopInit=1;
  ['scroll','click','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,slTouch,{passive:true})});
  function maybeFirst(){
    if(popMuted()||SL_POP.first||window.scrollY<160)return;
    if(dockBusy()||$('butlerView').classList.contains('on'))return;
    SL_POP.first=true;
    aiPop({proactive:true,fallback:'亲爱的主人，请问你需要查询哪些资源，或者想和我聊聊天呢？',
      input:true,placeholder:'输入关键词，或对我说“想聊天”…',
      buttons:[
        {label:'查询资源',primary:true,on:function(v){openChatOrSearch(v)}},
        {label:'和管家聊聊',on:function(v){openButler(v||'')}}
      ],context:'首次滑动主页'});
  }
  window.addEventListener('scroll',function(){maybeFirst();checkSectionStay()},{passive:true});
  /* v8.4.0：主页连续 5 分钟无操作 → 直接打开聊天界面；聊天期间计时暂停，返回主页重新计时 */
  setInterval(function(){
    if(popMuted())return;
    if($('butlerView').classList.contains('on'))return;
    if(Date.now()-SL_POP.lastAct>300000&&!dockBusy()){
      SL_POP.lastAct=Date.now();
      openButler('');
    }
  },8000);
  /* 同一网站访问第 3 次提示收藏 */
  window.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('#ov .go, #aiPop a.go'):null;
    if(!a)return;
    var href=a.getAttribute('href');if(!href||/^javascript:/i.test(href))return;
    var vc=LS.get('sl_visit_count',{});vc[href]=(vc[href]||0)+1;LS.put('sl_visit_count',vc);
    if(vc[href]===3&&!popMuted()){
      var site=allSites().filter(function(s){return decodeU(s.u)===href})[0]||{};
      setTimeout(function(){
        if(popMuted())return;
        aiPop({proactive:true,fallback:'主人似乎很喜欢这个网站，要让我为您收藏它吗？',
          buttons:[
            {label:'收藏',primary:true,on:function(){ if(!isFav(href)){FAV.push({t:site.t||host(site.u)||href,u:href});LS.put('sl_fav_sites',FAV);toast('已收藏，可在「我的收藏」找到')} }},
            {label:'不用了',on:function(){}}
          ],context:'同一网站第三次访问'});
      },350);
    }
  },true);
}
function checkSectionStay(){
  var hds=document.querySelectorAll('.content .hd, .main .hd');
  var cur='';
  for(var i=0;i<hds.length;i++){
    var r=hds[i].getBoundingClientRect();
    if(r.top>40&&r.top<180){cur=hds[i].id;break}
  }
  if(!cur||cur===SL_POP.sec)return;
  SL_POP.sec=cur;clearTimeout(SL_POP.secTimer);
  var title=(document.getElementById(cur)||{}).textContent||'';
  SL_POP.secTimer=setTimeout(function(){
    if(popMuted()||dockBusy()||$('butlerView').classList.contains('on')||SL_POP.sec!==cur||SL_POP.prompted[cur])return;
    SL_POP.prompted[cur]=1;
    aiPop({proactive:true,fallback:'主人似乎很喜欢这个板块的资源。需要我为您推荐一些相关的网站吗？',
      buttons:[
        {label:'推荐一下',primary:true,on:function(){selectSection(cur);var q=String(title).replace(/\d+.*$/,'').trim();if(q)homeSearch(q)}},
        {label:'不用了',on:function(){}}
      ],context:'分类停留提示'});
  },9000);
}
window.addEventListener('message',function(e){
  try{
    if(!e||!e.data)return;
    if(e.data.type==='sl_butler_close'){ $('butlerView').classList.remove('on'); SL_POP.lastAct=Date.now(); }
    if(e.data.type==='sl_pop_mute'){ LS.put('sl_pop_mute',e.data.value?'1':'0'); }
  }catch(err){}
});
/* v8.4.0：右下角四键快捷滑动：双上=顶部，单上=上一板块，单下=下一板块，双下=底部 */
function curSectionIdx(){
  var idx=0;
  for(var i=0;i<order.length;i++){
    var el=$(order[i].id);
    if(el&&el.getBoundingClientRect().top<=140)idx=i;else if(el)break;
  }
  return idx;
}
(function(){
  var nav=$('quickNav');if(!nav)return;
  /* 平时隐藏，滑动时才出现；停止滑动 3 秒自动收起，避免遮挡内容 */
  function revealNav(){
    nav.classList.add('on');
    clearTimeout(nav._hideT);
    nav._hideT=setTimeout(function(){nav.classList.remove('on')},3000);
  }
  window.addEventListener('scroll',revealNav,{passive:true});
  nav.onclick=function(e){
    revealNav();
    var b=e.target.closest?e.target.closest('[data-nav]'):null;if(!b)return;
    var k=b.getAttribute('data-nav');
    if(k==='top'){ try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)} return }
    if(k==='bottom'){ try{window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}catch(_){window.scrollTo(0,document.body.scrollHeight)} return }
    var i=curSectionIdx();
    var to=Math.max(0,Math.min(order.length-1,i+(k==='next'?1:-1)));
    if(order[to])selectSection(order[to].id);
  };
})();
window.SL_SEARCH_TEXT=getText; /* 供玉珩管家 iframe 站外搜索复用本地代理 */
var CHAN=LS.get('sl_search_chan','auto');
var MAGMODE=LS.get('sl_search_mag','builtin');
var YPROXY=LS.get('sl_search_yproxy','')||'';
var ENGON=LS.get('sl_search_engines',null)||{};

/* ---------- 网络层：本地代理 → 公共代理 → 直连 ---------- */
function withTimeout(p,ms){
  return new Promise(function(res,rej){
    var t=setTimeout(function(){rej(new Error('timeout'))},ms||14000);
    p.then(function(v){clearTimeout(t);res(v)},function(e){clearTimeout(t);rej(e)});
  });
}
function textOrThrow(r){
  if(!r.ok)throw new Error('HTTP '+r.status);
  return r.text().then(function(t){
    if(!t||t.length<20)throw new Error('empty');
    if(/^proxy error$/i.test(t.trim()))throw new Error('proxy error');
    return t;
  });
}
/* 本地代理多地址探测：App 同源 → PC 18099 → App 8080 → 备用端口
   注意：代理响应必须带 X-SL-Proxy: 1，避免被普通静态服务器的 404/首页误判为成功 */
var LP_BASE=null,LP_TRY=null;
function proxyBases(){
  var out=[];
  if(location.protocol==='http:'||location.protocol==='https:')out.push('');
  if(location.protocol!=='https:'){
    out.push('http://127.0.0.1:18099');
    out.push('http://127.0.0.1:8080');
    [8081,8888,9090,12345,16868].forEach(function(p){out.push('http://127.0.0.1:'+p)});
    out.push('http://localhost:18099');
  }
  return out;
}
function proxyCheck(b){
  return withTimeout(fetch(b+'/proxy?ping=1').then(function(r){
    if(!r.ok)throw new Error('HTTP '+r.status);
    if(r.headers.get('X-SL-Proxy')!=='1')throw new Error('not silong proxy');
    return r.text();
  }).then(function(t){
    if(t.trim()!=='pong')throw new Error('bad proxy');
    return b;
  }),4000);
}
function ensureLP(){
  if(LP_BASE!==null)return Promise.resolve(LP_BASE);
  if(LP_TRY)return LP_TRY;
  var bases=proxyBases();
  if(!bases.length)return Promise.reject(new Error('本地代理未启动'));
  LP_TRY=new Promise(function(resolve,reject){
    var done=false,left=bases.length,last=null;
    bases.forEach(function(b){
      proxyCheck(b).then(function(){
        if(done)return;done=true;LP_BASE=b;resolve(b);
      }).catch(function(e){
        last=e;
        if(--left===0&&!done){done=true;reject(last||new Error('本地代理未启动'))}
      });
    });
  });
  LP_TRY.then(function(){LP_TRY=null},function(){LP_TRY=null});
  return LP_TRY;
}
/* 并发闸门：server.ps1 单线程 / App 4 线程，同时最多 4 个代理请求，避免排队雪崩 */
var NET_MAX=4,NET_ACTIVE=0,NET_Q=[];
function netRun(fn){
  return new Promise(function(resolve,reject){
    function go(){
      NET_ACTIVE++;
      Promise.resolve().then(fn).then(function(v){
        NET_ACTIVE--;resolve(v);pump();
      },function(e){
        NET_ACTIVE--;reject(e);pump();
      });
    }
    function pump(){
      while(NET_ACTIVE<NET_MAX&&NET_Q.length)NET_Q.shift()();
    }
    if(NET_ACTIVE<NET_MAX)go();else NET_Q.push(go);
  });
}
function localProxy(url,ref,ms){
  var qs='/proxy?url='+encodeURIComponent(url)+(ref?('&ref='+encodeURIComponent(ref)):'');
  /* 国际源（Yandex / Google / DDG / Yahoo / Mojeek / Wikipedia / SearXNG）走用户配置的代理出口 */
  if(YPROXY&&/^https?:\/\/[^/]*(yandex\.|ya\.ru|google\.|duckduckgo\.|search\.yahoo\.|mojeek\.|wikipedia\.|searx\.|nyaa\.si|openverse\.)/i.test(url))qs+='&via='+encodeURIComponent(YPROXY);
  return ensureLP().then(function(b){
    return netRun(function(){
      var ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
      var timer=ctrl?setTimeout(function(){try{ctrl.abort()}catch(e){}},ms||18000):0;
      var opt=ctrl?{signal:ctrl.signal}:{};
      return fetch(b+qs,opt).then(function(r){
        if(!r.ok)throw new Error('HTTP '+r.status);
        if(r.headers.get('X-SL-Proxy')!=='1')throw new Error('not silong proxy');
        return r.text();
      }).then(function(t){
        if(!t||t.length<20)throw new Error('empty');
        if(/^proxy error$/i.test(t.trim()))throw new Error('proxy error');
        return t;
      }).then(function(t){
        if(timer)clearTimeout(timer);
        LP_BASE=b;
        return t;
      },function(e){
        if(timer)clearTimeout(timer);
        /* 只有本地服务真的连不上才清空探测结果；目标站超时/拦截不清空，避免反复重探 */
        var msg=String((e&&e.message)||e);
        if(b===LP_BASE&&/Failed to fetch|NetworkError|Load failed|not silong proxy/i.test(msg))LP_BASE=null;
        throw e;
      });
    });
  });
}
function pubProxy(url){
  var list=[
    'https://api.allorigins.win/raw?url='+encodeURIComponent(url),
    'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url),
    'https://corsproxy.io/?url='+encodeURIComponent(url)
  ];
  return new Promise(function(resolve,reject){
    var done=false,left=list.length;
    list.forEach(function(u){
      netRun(function(){return withTimeout(fetch(u).then(textOrThrow),6500)}).then(function(t){
        if(done)return;done=true;resolve(t);
      }).catch(function(){
        if(--left===0&&!done){done=true;reject(new Error('public proxy failed'))}
      });
    });
  });
}
function directGet(url){
  return netRun(function(){return withTimeout(fetch(url).then(textOrThrow),9000)});
}
function getText(url,ref,ms){
  if(CHAN==='local')return localProxy(url,ref,ms);
  if(CHAN==='public')return pubProxy(url);
  if(CHAN==='direct')return directGet(url);
  var p=localProxy(url,ref,ms);
  /* 文件直开（file://）时浏览器只允许访问本地代理，公共代理/直连必被 CORS 拦截，直接快速失败 */
  if(location.protocol==='file:')return p;
  /* 本地代理已可用时，目标站失败就直接失败，不再排队公共代理/直连，避免 19 个引擎互相堵死 */
  return p.catch(function(e){
    if(LP_BASE!==null)throw e;
    return pubProxy(url).catch(function(){return directGet(url)});
  });
}
function getJson(url,ref,ms){return getText(url,ref,ms).then(function(t){return JSON.parse(t)})}

/* ---------- 通用工具 ---------- */
function stripTags(s){
  return String(s||'').replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'")
    .replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(+n)})
    .replace(/\s+/g,' ').trim();
}
function xmlVal(node,tag){var e=node.querySelector(tag);return e?stripTags(e.textContent):''}
function absUrl(base,u){
  if(!u)return '';
  u=String(u).trim();
  if(/^https?:\/\//i.test(u))return u;
  if(u.indexOf('//')===0)return 'https:'+u;
  return base.replace(/\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;
}
function safeDec(s){try{return decodeURIComponent(s)}catch(e){return s}}
/* 所有内置引擎默认开启；用户手动关闭的仍尊重 ENGON */
function engOn(id){return ENGON[id]!==false}
function fmtSize(n){if(!n)return '-';var u=['B','KB','MB','GB','TB'],i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return n.toFixed(i?1:0)+u[i]}
function parseSize(s){
  var m=/([\d.]+)\s*(B|KiB|MiB|GiB|TiB)/i.exec(String(s||''));
  if(!m)return 0;
  var u={b:1,kib:1024,mib:1048576,gib:1073741824,tib:1099511627776}[m[2].toLowerCase()]||1;
  return Math.round(parseFloat(m[1])*u);
}

/* ---------- 网页引擎 ---------- */
function bingWeb(q,page){
  var first=(page-1)*10+1;
  var u='https://cn.bing.com/search?q='+encodeURIComponent(q)+'&first='+first+'&count=50&adlt=off&setlang=zh-CN';
  return getText(u,null,12000).then(function(html){
    if(/captcha|验证码|Are you a robot/i.test(html))throw new Error('bing captcha');
    var doc=new DOMParser().parseFromString(html,'text/html');
    var out=[],seen={};
    [].slice.call(doc.querySelectorAll('li.b_algo')).forEach(function(li){
      var a=li.querySelector('h2 a[href]')||li.querySelector('h2 a');
      if(!a)return;
      var href=absUrl('https://cn.bing.com/',a.getAttribute('href'));
      if(!/^https?:/i.test(href)||seen[href])return;
      var title=stripTags(a.textContent);
      if(!title)return;
      seen[href]=1;
      var d=li.querySelector('.b_caption p, .b_algoSlug, p');
      out.push({type:'web',source:'Bing',title:title,url:href,desc:d?stripTags(d.textContent):'',host:host(href)});
    });
    if(!out.length)throw new Error('bing blocked');
    return out;
  });
}
function yandexWeb(q,page){
  function grab(domain){
    var u='https://'+domain+'/search/?text='+encodeURIComponent(q)+'&p='+(page-1)+'&family=0';
    return getText(u,'https://'+domain+'/',8000).then(function(html){
      if(/captcha|showcaptcha|SmartCaptcha|not a robot/i.test(html))throw new Error('yandex captcha');
      var doc=new DOMParser().parseFromString(html,'text/html');
      var out=[],seen={};
      [].slice.call(doc.querySelectorAll('li.serp-item, .serp-item, article.serp-item')).forEach(function(li){
        var a=li.querySelector('a.Link[href^="http"], a.OrganicTitle-Link[href], h2 a[href], a[href^="http"]');
        var h=li.querySelector('h2, .OrganicTitle-LinkText, .OrganicTitle-Link');
        if(!a||!h)return;
        var href=a.getAttribute('href');
        if(!href||href.indexOf('yandex.')>=0||seen[href])return;
        seen[href]=1;
        var d=li.querySelector('.OrganicTextContentSpan, .TextContainer, .Organic-Content');
        out.push({type:'web',source:'Yandex',title:stripTags(h.textContent),url:href,desc:d?stripTags(d.textContent):'',host:host(href)});
      });
      if(!out.length)throw new Error('yandex blocked');
      return out;
    });
  }
  return grab('yandex.com').catch(function(){return grab('yandex.ru')});
}
function sogouWeb(q,page){
  var u='https://www.sogou.com/web?query='+encodeURIComponent(q)+'&page='+page+'&safesearch=0';
  return getText(u,'https://www.sogou.com/',12000).then(function(html){
    var out=[],seen={};
    var re=/<div[^>]+class="[^"]*vrwrap[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]+class="[^"]*vrwrap|<\/body>)/gi,m;
    while((m=re.exec(html))){
      var blk=m[1];
      var a=/<h3[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(blk);
      if(!a)continue;
      var href=a[1];
      if(href.indexOf('/link?')===0)href='https://www.sogou.com'+href;
      if(!/^https?:/i.test(href)||seen[href])continue;
      var title=stripTags(a[2]);
      if(!title)continue;
      seen[href]=1;
      var d=/<div[^>]+class="[^"]*(?:text-layout|str-text|space-txt)[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(blk);
      out.push({type:'web',source:'搜狗',title:title,url:href,desc:d?stripTags(d[1]):'',host:host(href)});
    }
    if(!out.length)throw new Error('sogou blocked');
    return out;
  });
}
function so360Web(q,page){
  var u='https://www.so.com/s?q='+encodeURIComponent(q)+'&pn='+page+'&safe=0';
  return getText(u,'https://www.so.com/',12000).then(function(html){
    var out=[],seen={};
    var re=/<li[^>]+class="[^"]*res-list[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,m;
    while((m=re.exec(html))){
      var blk=m[1];
      var a=/<h3[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(blk);
      if(!a)continue;
      var href=a[1];
      if(href.indexOf('/')===0)href='https://www.so.com'+href;
      if(!/^https?:/i.test(href)||seen[href])continue;
      var title=stripTags(a[2]);
      if(!title)continue;
      seen[href]=1;
      var d=/<p[^>]+class="[^"]*res-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(blk);
      out.push({type:'web',source:'360',title:title,url:href,desc:d?stripTags(d[1]):'',host:host(href)});
    }
    if(!out.length)throw new Error('360 blocked');
    return out;
  });
}
function googleWeb(q,page){
  var start=(page-1)*20;
  function grab(extra){
    var u='https://www.google.com/search?q='+encodeURIComponent(q)+'&num=20&start='+start+'&hl=zh-CN&safe=off'+extra;
    return getText(u,'https://www.google.com/',8000).then(function(html){
      if(/unusual traffic|not a robot|captcha/i.test(html))throw new Error('google captcha');
      var doc=new DOMParser().parseFromString(html,'text/html');
      var out=[],seen={};
      [].slice.call(doc.querySelectorAll('a[href]')).forEach(function(a){
        var href=a.getAttribute('href')||'';
        var m=/^\/url\?q=([^&"]+)/.exec(href);
        if(m)href=safeDec(m[1]);
        if(!/^https?:/i.test(href)||href.indexOf('google.')>=0||seen[href])return;
        var h=a.querySelector('h3');
        if(!h)return;
        var title=stripTags(h.textContent);
        if(!title)return;
        seen[href]=1;
        var box=a.closest('div.g, div.MjjYud, div');
        var d=box?box.querySelector('.VwiC3b, .IsZvec, .s3v9rd'):null;
        out.push({type:'web',source:'Google',title:title,url:href,desc:d?stripTags(d.textContent):'',host:host(href)});
      });
      if(!out.length)throw new Error('google blocked');
      return out;
    });
  }
  return grab('&gbv=1').catch(function(){return grab('&udm=14')});
}
function ddgWeb(q,page){
  var s=(page-1)*30;
  var u='https://html.duckduckgo.com/html/?q='+encodeURIComponent(q)+'&s='+s+'&kp=-2';
  return getText(u,'https://html.duckduckgo.com/',7000).then(function(html){
    var out=[],seen={};
    var re=/<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>([\s\S]{0,900}?)(?=<a[^>]+class="result__a"|<\/body>)/gi,m;
    while((m=re.exec(html))){
      var href=m[1],title=stripTags(m[2]);
      var um=/[?&]uddg=([^&]+)/.exec(href);
      if(um)href=safeDec(um[1]);
      if(href.indexOf('//duckduckgo.com/l/')===0)continue;
      if(!/^https?:/i.test(href)||!title||seen[href])continue;
      seen[href]=1;
      var sm=/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div)>/i.exec(m[3]);
      out.push({type:'web',source:'DuckDuckGo',title:title,url:href,desc:sm?stripTags(sm[1]):'',host:host(href)});
    }
    if(!out.length)throw new Error('ddg blocked');
    return out;
  });
}
function yahooWeb(q,page){
  var b=(page-1)*10+1;
  var u='https://search.yahoo.com/search?p='+encodeURIComponent(q)+'&b='+b+'&vm=off';
  return getText(u,'https://search.yahoo.com/',7000).then(function(html){
    var out=[],seen={};
    var re=/<div[^>]+class="[^"]*algo[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]+class="[^"]*algo|<\/body>)/gi,m;
    while((m=re.exec(html))){
      var blk=m[1];
      var a=/<h3[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(blk);
      if(!a)continue;
      var href=a[1],title=stripTags(a[2]);
      if(!/^https?:/i.test(href)||!title||seen[href])continue;
      seen[href]=1;
      var d=/<div[^>]+class="[^"]*compText[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(blk);
      out.push({type:'web',source:'Yahoo',title:title,url:href,desc:d?stripTags(d[1]):'',host:host(href)});
    }
    if(!out.length)throw new Error('yahoo blocked');
    return out;
  });
}
function mojeekWeb(q,page){
  var s=(page-1)*10;
  var u='https://www.mojeek.com/search?q='+encodeURIComponent(q)+'&s='+s+'&safe=0';
  return getText(u,'https://www.mojeek.com/',7000).then(function(html){
    var out=[],seen={};
    var re=/<li[^>]*>([\s\S]*?)<\/li>/gi,m;
    while((m=re.exec(html))){
      var blk=m[1];
      var a=/<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(blk);
      if(!a)continue;
      var href=a[1],title=stripTags(a[2]);
      if(!/^https?:/i.test(href)||!title||seen[href])continue;
      seen[href]=1;
      var d=/<p[^>]+class="[^"]*s[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(blk);
      out.push({type:'web',source:'Mojeek',title:title,url:href,desc:d?stripTags(d[1]):'',host:host(href)});
    }
    if(!out.length)throw new Error('mojeek blocked');
    return out;
  });
}
function searxWeb(q,page){
  var list=['https://searx.be','https://search.inetol.net','https://priv.au','https://opnxng.com',
    'https://searx.tiekoetter.com','https://baresearch.org','https://search.hbubli.cc','https://search.sapti.me',
    'https://searxng.brihx.fr','https://searx.namejeff.xyz'];
  var qs='q='+encodeURIComponent(q)+'&pageno='+page+'&language=zh-CN&safesearch=0'+
    '&engines=google,bing,yandex,duckduckgo,brave,mojeek,qwant';
  function one(base){
    return getText(base+'/search?'+qs+'&format=json',base+'/',7000).then(function(t){
      var j=JSON.parse(t);
      var arr=(j.results||[]).map(function(x){
        return {type:'web',source:'SearXNG',title:x.title||x.url,url:x.url,desc:x.content||'',host:host(x.url)};
      }).filter(function(x){return x.url});
      if(!arr.length)throw new Error('empty');
      return arr;
    }).catch(function(){
      /* 部分实例关闭了 JSON API，退回 HTML 结果页解析 */
      return getText(base+'/search?'+qs,base+'/',7000).then(function(html){
        var doc=new DOMParser().parseFromString(html,'text/html');
        var out=[],seen={};
        [].slice.call(doc.querySelectorAll('article.result, .result')).forEach(function(ar){
          var a=ar.querySelector('h3 a[href], a.url_header[href], a[href]');
          if(!a)return;
          var href=absUrl(base+'/',a.getAttribute('href'));
          if(!/^https?:/i.test(href)||seen[href])return;
          var title=stripTags(a.textContent);
          if(!title)return;
          seen[href]=1;
          var d=ar.querySelector('p.content, .content');
          out.push({type:'web',source:'SearXNG',title:title,url:href,desc:d?stripTags(d.textContent):'',host:host(href)});
        });
        if(!out.length)throw new Error('empty html');
        return out;
      });
    });
  }
  return new Promise(function(resolve,reject){
    var done=false,left=list.length,last=null;
    list.forEach(function(base){
      one(base).then(function(arr){
        if(done||!arr||!arr.length)return;
        done=true;resolve(arr);
      }).catch(function(e){
        last=e;
        if(--left===0&&!done){done=true;reject(last||new Error('searx blocked'))}
      });
    });
  });
}
function githubWeb(q,page){
  return getJson('https://api.github.com/search/repositories?q='+encodeURIComponent(q)+'&page='+page+'&per_page=20',null,10000)
  .then(function(j){
    return (j.items||[]).map(function(x){
      return {type:'web',source:'GitHub',title:x.full_name,url:x.html_url,
        desc:stripTags((x.description||'')+' · ★'+x.stargazers_count+(x.language?' · '+x.language:'')),host:'github.com'};
    });
  });
}
function stackWeb(q,page){
  return getJson('https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q='+encodeURIComponent(q)+'&site=stackoverflow&pagesize=30&page='+page,null,10000)
  .then(function(j){
    return (j.items||[]).map(function(x){
      return {type:'web',source:'StackOverflow',title:stripTags(x.title),url:x.link,
        desc:stripTags(x.excerpt||''),host:'stackoverflow.com'};
    });
  });
}
function hnWeb(q,page){
  return getJson('https://hn.algolia.com/api/v1/search?query='+encodeURIComponent(q)+'&page='+(page-1)+'&hitsPerPage=20',null,10000)
  .then(function(j){
    return (j.hits||[]).map(function(x){
      return {type:'web',source:'HackerNews',title:x.title||x.story_title||('HN #'+x.objectID),
        url:x.url||('https://news.ycombinator.com/item?id='+x.objectID),
        desc:(x.author?('by '+x.author+' · '):'')+(x.points||0)+' points · '+(x.num_comments||0)+' comments',host:host(x.url||'news.ycombinator.com')};
    });
  });
}
function wikiWeb(q,page){
  return getJson('https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&sroffset='+((page-1)*10)+'&srlimit=10&format=json&origin=*',null,8000)
  .then(function(j){
    return ((j.query&&j.query.search)||[]).map(function(x){
      return {type:'web',source:'Wikipedia',title:x.title,
        url:'https://zh.wikipedia.org/wiki/'+encodeURIComponent(x.title),desc:stripTags(x.snippet||''),host:'zh.wikipedia.org'};
    });
  });
}

function arxivWeb(q,page){
  var start=(page-1)*20;
  var u='http://export.arxiv.org/api/query?search_query=all:'+encodeURIComponent(q)+'&start='+start+'&max_results=20';
  return getText(u,'https://arxiv.org/',12000).then(function(xml){
    var doc=new DOMParser().parseFromString(xml,'text/xml');
    var out=[];
    [].slice.call(doc.getElementsByTagName('entry')).forEach(function(e){
      function g(tag){var n=e.getElementsByTagName(tag)[0];return n?stripTags(n.textContent):''}
      var id=g('id'),title=g('title'),desc=g('summary');
      if(!id||!title)return;
      out.push({type:'web',source:'arXiv',title:title,url:id,desc:desc,host:'arxiv.org'});
    });
    if(!out.length)throw new Error('arxiv empty');
    return out;
  });
}
function openlibWeb(q,page){
  return getJson('https://openlibrary.org/search.json?q='+encodeURIComponent(q)+'&page='+page+'&limit=20',null,10000)
  .then(function(j){
    return (j.docs||[]).map(function(x){
      return {type:'web',source:'OpenLibrary',title:x.title||'OpenLibrary',
        url:'https://openlibrary.org'+(x.key||''),
        desc:((x.author_name||[]).join(', '))+(x.first_publish_year?(' · '+x.first_publish_year):''),host:'openlibrary.org'};
    }).filter(function(x){return x.url.indexOf('/works/')>=0});
  });
}
function archiveWeb(q,page){
  var u='https://archive.org/advancedsearch.php?q='+encodeURIComponent(q)+'&fl[]=identifier&fl[]=title&fl[]=description&rows=20&page='+page+'&output=json';
  return getJson(u,'https://archive.org/',12000).then(function(j){
    var docs=(j.response&&j.response.docs)||[];
    return docs.map(function(x){
      return {type:'web',source:'InternetArchive',title:Array.isArray(x.title)?x.title[0]:(x.title||x.identifier),
        url:'https://archive.org/details/'+x.identifier,
        desc:Array.isArray(x.description)?x.description[0]:(x.description||''),host:'archive.org'};
    }).filter(function(x){return x.url&&x.url.indexOf('undefined')<0});
  });
}

/* ---------- 图片引擎 ---------- */
function bingImage(q,page){
  if(page>1)return Promise.resolve([]);
  return getText('https://cn.bing.com/images/search?q='+encodeURIComponent(q)+'&form=HDRSC2&first=1&adlt=off',null,12000)
  .then(function(html){
    var out=[],seen={};
    var re=/murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g,m;
    while((m=re.exec(html))){
      var u=m[1].replace(/\\\//g,'/');
      if(seen[u])continue;seen[u]=1;
      out.push({type:'image',source:'Bing',title:'',url:u,pic:u,desc:'',host:host(u)});
    }
    if(!out.length)throw new Error('bing image empty');
    return out;
  });
}
function baiduImage(q,page){
  var pn=(page-1)*30;
  var u='https://image.baidu.com/search/acjson?tn=resultjson_com&word='+encodeURIComponent(q)+'&pn='+pn+'&rn=30&safesearch=0';
  return getText(u,'https://image.baidu.com/',12000).then(function(t){
    var j=null;
    try{j=JSON.parse(t)}catch(e){}
    var arr=(j&&j.data)||[];
    var out=[];
    arr.forEach(function(x){
      var pic=x.thumbURL||x.middleURL||x.hoverURL||'';
      var full=x.objURL||x.ObjURL||x.middleURL||x.hoverURL||pic;
      if(!pic)return;
      out.push({type:'image',source:'百度',title:stripTags(x.fromPageTitleEnc||x.fromPageTitle||''),url:full,pic:pic,desc:'',host:host(full)});
    });
    if(!out.length){
      var re=/"thumbURL":"(https?:\\?\/\\?\/[^"]+)"/g,m;
      while((m=re.exec(t))){
        var p=m[1].replace(/\\\//g,'/');
        out.push({type:'image',source:'百度',title:'',url:p,pic:p,desc:'',host:host(p)});
      }
    }
    if(!out.length)throw new Error('baidu image empty');
    return out;
  });
}
function so360Image(q,page){
  var pn=(page-1)*30;
  var u='https://image.so.com/j?q='+encodeURIComponent(q)+'&pn='+pn+'&rn=30&safe=0';
  return getJson(u,'https://image.so.com/',12000).then(function(j){
    return ((j&&j.list)||[]).map(function(x){
      var pic=x.thumb||x.img||'';
      var full=x.img||x.thumb||'';
      return {type:'image',source:'360',title:x.title||'',url:full,pic:pic,desc:x.site||'',host:host(full)};
    }).filter(function(x){return x.pic});
  });
}
function yandexImage(q,page){
  if(page>1)return Promise.resolve([]);
  return getText('https://yandex.com/images/search?text='+encodeURIComponent(q)+'&family=0',null,8000)
  .then(function(html){
    var out=[],seen={};
    var re=/"origUrl":"(https?:\\?\/\\?\/[^"]+)"/g,m;
    while((m=re.exec(html))){
      var u=m[1].replace(/\\\//g,'/');
      if(seen[u])continue;seen[u]=1;
      out.push({type:'image',source:'Yandex',title:'',url:u,pic:u,desc:'',host:host(u)});
    }
    if(!out.length)throw new Error('yandex image blocked');
    return out;
  });
}

function openverseImage(q,page){
  return getJson('https://api.openverse.org/v1/images/?q='+encodeURIComponent(q)+'&page='+page+'&page_size=20',null,10000)
  .then(function(j){
    return (j.results||[]).map(function(x){
      return {type:'image',source:'Openverse',title:x.title||'',url:x.url,pic:x.thumbnail||x.url,
        desc:x.creator?('by '+x.creator):'',host:host(x.url)};
    }).filter(function(x){return x.pic});
  });
}

/* ---------- 视频引擎 ---------- */
function biliVideo(q,page){
  return getJson('https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword='+encodeURIComponent(q)+'&page='+page,'https://www.bilibili.com/',12000)
  .then(function(j){
    if(!j||j.code!==0)throw new Error('bili '+(j&&j.code));
    return (j.data.result||[]).map(function(x){
      return {type:'video',source:'B站',title:stripTags(x.title),url:x.arcurl||('https://www.bilibili.com/video/'+x.bvid),
        pic:(x.pic||'').replace(/^\/\//,'https://'),desc:stripTags(x.description||''),author:x.author||'',dur:x.duration||'',host:'bilibili.com'};
    });
  });
}
function acfunVideo(q,page){
  var u='https://www.acfun.cn/search?keyword='+encodeURIComponent(q)+'&page='+page;
  return getText(u,'https://www.acfun.cn/',12000).then(function(html){
    var s=html.replace(/\\"/g,'"').replace(/\\\//g,'/');
    var out=[],seen={};
    var re=/<a href="\/v\/ac(\d+)"[^>]*data-click-log='([^']+)'/g,m;
    while((m=re.exec(s))){
      var id=m[1],log=null;
      try{log=JSON.parse(m[2])}catch(e){}
      var title=(log&&log.title)||'';
      if(!title){
        var around=s.slice(m.index,m.index+700);
        var tm=/title":"([^"]+)"/.exec(around);
        if(tm)title=tm[1];
      }
      if(!title||seen[id])continue;
      seen[id]=1;
      var pic='';
      var pm=/"coverUrl":"([^"]+)"/.exec(s.slice(m.index,m.index+900));
      if(pm)pic=pm[1].replace(/\\\//g,'/');
      out.push({type:'video',source:'AcFun',title:title,url:'https://www.acfun.cn/v/ac'+id,pic:pic,desc:'AcFun 视频',author:(log&&log.authorName)||'',dur:'',host:'acfun.cn'});
    }
    if(!out.length)throw new Error('acfun empty');
    return out;
  });
}
function yandexVideo(q,page){
  if(page>1)return Promise.resolve([]);
  return getText('https://yandex.com/video/search?text='+encodeURIComponent(q)+'&family=0',null,8000)
  .then(function(html){
    var out=[],seen={};
    var re=/"link":"(https?:\\?\/\\?\/[^"]+)"/g,m;
    while((m=re.exec(html))){
      var u=m[1].replace(/\\\//g,'/');
      if(seen[u]||u.indexOf('yandex.')>=0)continue;seen[u]=1;
      out.push({type:'video',source:'Yandex',title:'',url:u,pic:'',desc:'',host:host(u)});
    }
    if(!out.length)throw new Error('yandex video blocked');
    return out;
  });
}

/* ---------- 磁力引擎 ---------- */
function apibayMagnet(q,page){
  if(page>1)return Promise.resolve([]);
  return getJson('https://apibay.org/q.php?q='+encodeURIComponent(q),null,12000)
  .then(function(j){
    if(!Array.isArray(j))throw new Error('bad');
    return j.filter(function(x){return x.info_hash&&x.info_hash!=='0000000000000000000000000000000000000000'}).map(function(x){
      return {type:'magnet',source:'TPB',title:x.name,url:'magnet:?xt=urn:btih:'+x.info_hash+'&dn='+encodeURIComponent(x.name),
        magnet:'magnet:?xt=urn:btih:'+x.info_hash+'&dn='+encodeURIComponent(x.name),
        hash:x.info_hash,size:+x.size||0,seed:+x.seeders||0,leech:+x.leechers||0,files:+x.num_files||0,
        desc:'做种 '+x.seeders+' · 下载 '+x.leechers+' · '+fmtSize(+x.size||0),host:'apibay.org'};
    });
  });
}

function nyaaMagnet(q,page){
  var u='https://nyaa.si/?f=0&c=0_0&q='+encodeURIComponent(q)+'&p='+page;
  return getText(u,'https://nyaa.si/',10000).then(function(html){
    var out=[],seen={};
    var re=/<tr[^>]*>([\s\S]*?)<\/tr>/g,m;
    while((m=re.exec(html))){
      var blk=m[1];
      var mg=/href="(magnet:[^"]+)"/.exec(blk);
      if(!mg)continue;
      var t=/<a href="\/view\/[^"]+"[^>]*title="([^"]+)"/.exec(blk);
      var hash=/btih:([a-zA-Z0-9]+)/.exec(mg[1]);
      var key=hash?hash[1]:mg[1];
      if(seen[key])continue;seen[key]=1;
      var sm=/class="[^"]*size[^"]*"[^>]*>([^<]+)</.exec(blk);
      var sd=/class="[^"]*success[^"]*"[^>]*>(\d+)</.exec(blk);
      out.push({type:'magnet',source:'Nyaa',title:t?stripTags(t[1]):'Nyaa',
        url:mg[1],magnet:mg[1],hash:hash?hash[1]:'',size:sm?parseSize(sm[1]):0,seed:sd?+sd[1]:0,leech:0,files:0,
        desc:(sm?sm[1].trim():'')+(sd?(' · 做种 '+sd[1]):''),host:'nyaa.si'});
    }
    if(!out.length)throw new Error('nyaa empty');
    return out;
  });
}

/* 引擎清单：to=单次超时；翻页不设数量上限，由 emptyPages 判断是否到底 */
var ENGINES={
  web:[
    {id:'bing',n:'Bing',f:bingWeb,to:12000},
    {id:'sogou',n:'搜狗',f:sogouWeb,to:12000},
    {id:'so360',n:'360',f:so360Web,to:12000},
    {id:'yandex',n:'Yandex',f:yandexWeb,to:8000,oneTry:true},
    {id:'google',n:'Google',f:googleWeb,to:7000,oneTry:true},
    {id:'ddg',n:'DuckDuckGo',f:ddgWeb,to:7000,oneTry:true},
    {id:'yahoo',n:'Yahoo',f:yahooWeb,to:7000,oneTry:true},
    {id:'mojeek',n:'Mojeek',f:mojeekWeb,to:7000,oneTry:true},
    {id:'searx',n:'SearXNG',f:searxWeb,to:12000,oneTry:true},
    {id:'github',n:'GitHub',f:githubWeb,to:10000,oneTry:true},
    {id:'stack',n:'StackOverflow',f:stackWeb,to:10000,oneTry:true},
    {id:'hn',n:'HackerNews',f:hnWeb,to:10000,oneTry:true},
    {id:'wiki',n:'Wikipedia',f:wikiWeb,to:8000,oneTry:true},
    {id:'arxiv',n:'arXiv',f:arxivWeb,to:12000,oneTry:true},
    {id:'openlib',n:'OpenLibrary',f:openlibWeb,to:10000,oneTry:true},
    {id:'archive',n:'InternetArchive',f:archiveWeb,to:12000,oneTry:true}
  ],
  image:[
    {id:'bing',n:'Bing',f:bingImage,to:12000},
    {id:'baidu',n:'百度',f:baiduImage,to:12000},
    {id:'so360',n:'360',f:so360Image,to:12000},
    {id:'openverse',n:'Openverse',f:openverseImage,to:10000,oneTry:true},
    {id:'yandex',n:'Yandex',f:yandexImage,to:8000,oneTry:true}
  ],
  video:[
    {id:'bili',n:'B站',f:biliVideo,to:12000},
    {id:'acfun',n:'AcFun',f:acfunVideo,to:12000},
    {id:'yandex',n:'Yandex',f:yandexVideo,to:8000,oneTry:true}
  ],
  magnet:[
    {id:'tpb',n:'TPB',f:apibayMagnet,to:12000},
    {id:'nyaa',n:'Nyaa',f:nyaaMagnet,to:10000,oneTry:true}
  ]
};

/* ---------- 搜索入口 ---------- */
/* v9.8.1：搜索结果页引擎条（点击询问是否跳转） */
var SR_ENGINES=[
  {n:'站内',u:''},
  {n:'Google',u:'https://www.google.com/search?q='},
  {n:'Yandex',u:'https://yandex.com/search/touch/?text='},
  {n:'Bing',u:'https://cn.bing.com/search?q='},
  {n:'微软',u:'https://www.bing.com/search?q='},
  {n:'DuckDuckGo',u:'https://duckduckgo.com/?q='},
  {n:'百度',u:'https://www.baidu.com/s?wd='},
  {n:'搜狗',u:'https://www.sogou.com/web?query='},
  {n:'360',u:'https://www.so.com/s?q='},
  {n:'B站',u:'https://search.bilibili.com/all?keyword='},
  {n:'P站',u:'https://www.pixiv.net/search.php?word='},
  {n:'聚合源',u:''}
];
function renderSrEngines(){
  var box=$('srEngines'); if(!box)return;
  box.innerHTML=SR_ENGINES.map(function(x,i){return '<button class="sr-engine" data-eng="'+i+'">'+esc(x.n)+'</button>'}).join('');
  box.onclick=function(e){
    var b=e.target.closest?e.target.closest('[data-eng]'):null; if(!b)return;
    var eng=SR_ENGINES[+b.getAttribute('data-eng')];
    if(!eng.u){ toast('该引擎无法跳转'); setTimeout(function(){},3000); return; }
    var kw=String($('srKw')&&$('srKw').value||$('kw')&&$('kw').value||'').trim();
    var url=eng.u+encodeURIComponent(kw||'');
    $('modal').innerHTML='<button class="x" id="engX">×</button><h3>跳转到 '+esc(eng.n)+'</h3>'+
      '<div style="font-size:12.5px;color:var(--mut);line-height:1.7;margin:10px 0 14px">是否跳转至「'+esc(eng.n)+'」搜索'+(kw?'「'+esc(kw)+'」':'当前关键词')+'？</div>'+
      '<div style="display:flex;gap:10px"><button class="go" id="engYes" style="flex:1;margin:0">确认跳转</button><button class="sr-tool" id="engNo" style="flex:1;padding:10px">取消</button></div>';
    $('ov').classList.add('on');
    $('engX').onclick=$('engNo').onclick=function(){$('ov').classList.remove('on')};
    $('engYes').onclick=function(){ $('ov').classList.remove('on'); try{window.open(url,'_blank')}catch(e){location.href=url} };
  };
}
/* v9.8.0：搜索兜底——站内/全网都没结果时，给出可直接跳转的引擎卡片（Yandex 优先，失效再选 Bing/微软） */
function engineFallbackHtml(q){
  var kw=encodeURIComponent(String(q||''));
  var list=[
    ['Yandex（俄罗斯引擎·优先）','https://yandex.com/search/touch/?text='+kw+'&lr=20734','fa-solid fa-y',true],
    ['必应 Bing','https://cn.bing.com/search?q='+kw,'fa-brands fa-microsoft',false],
    ['微软 Bing 国际','https://www.bing.com/search?q='+kw,'fa-brands fa-microsoft',false],
    ['Google','https://www.google.com/search?q='+kw+'&safe=off','fa-brands fa-google',false],
    ['DuckDuckGo','https://duckduckgo.com/?q='+kw+'&kp=-2','fa-solid fa-shield-halved',false],
    ['百度','https://www.baidu.com/s?wd='+kw,'fa-solid fa-paw',false],
    ['搜狗','https://www.sogou.com/web?query='+kw,'fa-solid fa-s',false],
    ['360 搜索','https://www.so.com/s?q='+kw,'fa-solid fa-circle-nodes',false]
  ];
  return '<div style="font-size:13px;font-weight:800;color:#ffd6ef;margin-top:6px">没有本地/全网结果，直接去搜索引擎：</div>'+
    '<div class="eng-list">'+list.map(function(x){
      return '<a class="eng-card'+(x[3]?' primary':'')+'" href="'+x[1]+'" target="_blank" rel="noopener"><i class="'+x[2]+'"></i>'+x[0]+'<small>打开 →</small></a>';
    }).join('')+'</div>'+
    '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">'+
      '<button class="hs-chat" data-ebq="'+esc(String(q||''))+'">让资源管家帮您找</button>'+
    '</div>';
}
function openSr(){
  var sr=$('srView');
  if(SEARCH.inline){
    var host=$('srInlineHost');
    if(host)host.appendChild(sr);
    sr.classList.add('inline','on');
    [].forEach.call($('content').querySelectorAll('.hd, .grid, .about-site'),function(el){el.classList.add('sl-hide')});
  }else{
    sr.classList.add('on');document.body.classList.add('srmode');
  }
  renderSrEngines();
  try{ var sk=$('srKw'); if(sk && SEARCH.kw) sk.value=SEARCH.kw; }catch(e){}
}
function closeSr(){
  var sr=$('srView');
  if(sr&&sr.classList.contains('inline')){
    document.body.appendChild(sr);
    sr.classList.remove('inline');
    [].forEach.call($('content').querySelectorAll('.sl-hide'),function(el){el.classList.remove('sl-hide')});
  }
  sr.classList.remove('on');
  document.body.classList.remove('srmode');
  SEARCH.inline=false;
}
function setMode(m){
  SEARCH.mode=m;
  [].forEach.call($('mSwitch').children,function(b){b.classList.toggle('on',b.getAttribute('data-m')===m)});
  LS.put('sl_search_mode',m);
}
function showCatTabs(on){
  [].forEach.call($('srTabs').children,function(b){b.style.display=on?'':'none'});
  if($('srLayout'))$('srLayout').style.display=on?'':'none';
}
function siteSearch(kw){
  var c=$('srBody');
  var hits=allSites().filter(function(s){return (s.t+' '+(s.d||'')+' '+s.k).toLowerCase().indexOf(kw)>=0});
  $('srStat').textContent='站内 · 找到 '+hits.length+' 个站点';
  [].forEach.call($('srTabs').children,function(b){b.style.display='none'});
  if(!hits.length){c.innerHTML='<div class="sr-empty">没有找到相关站点<br>试试切换到「全网」，或让资源管家帮您找<br><button class="sr-butler-btn" data-ebq="'+esc(kw)+'"><i class="fa-solid fa-wand-magic-sparkles"></i> 打开资源管家</button></div>';return}
  c.innerHTML='<div class="grid">'+hits.map(function(s){return cardHtml(s,false)}).join('')+'</div>';
}

/* ---------- 聚合与无限翻页 ---------- */
/* 核心源先跑：Bing/搜狗/360 → 图片 → 视频 → 磁力 → 国外源/API，避免慢源把队列堵死 */
var ENG_PRI={'bing:web':1,'sogou:web':2,'so360:web':3,'bing:image':4,'baidu:image':5,'so360:image':6,
  'bili:video':7,'acfun:video':8,'tpb:magnet':9,'github:web':10,'stack:web':11,'hn:web':12,
  'yandex:web':13,'google:web':14,'ddg:web':15,'yahoo:web':16,'mojeek:web':17,'searx:web':18,'wiki:web':19,
  'openverse:image':7,'nyaa:magnet':10,'yandex:image':20,'yandex:video':21};
function engList(){
  return Object.keys(SEARCH.eng).map(function(k){return SEARCH.eng[k]}).sort(function(a,b){
    return (ENG_PRI[a.e.id+':'+a.cat]||50)-(ENG_PRI[b.e.id+':'+b.cat]||50);
  });
}
function resetEngines(){
  SEARCH.eng={};
  ['web','video','image','magnet'].forEach(function(cat){
    (ENGINES[cat]||[]).forEach(function(e){
      if(!engOn(e.id))return;
      SEARCH.eng[e.id+':'+cat]={e:e,cat:cat,page:1,done:false,fail:0,inflight:false};
    });
  });
}
function normKey(cat,x){
  if(cat==='magnet')return String(x.hash||x.magnet||x.url||'').toLowerCase();
  if(cat==='image')return String(x.url||x.pic||'').toLowerCase();
  return String(x.url||'').split('#')[0].replace(/[?&](utm_[^&]*|from|source)=[^&]*/gi,'');
}
function mergeResults(cat,arr,engine){
  var start=SEARCH.data[cat].length,added=[];
  (arr||[]).forEach(function(x){
    var k=normKey(cat,x);
    if(!k||SEARCH.seen[cat][k])return;
    SEARCH.seen[cat][k]=1;
    x.engine=x.engine||engine.n;
    x.type=cat;
    SEARCH.data[cat].push(x);
    added.push(x);
  });
  return {start:start,items:added};
}
/* 相关性排序：标题完全匹配 > 标题开头 > 标题包含 > 简介/URL 包含，再叠加源权重 */
var SRC_PRI={'Bing':14,'搜狗':12,'360':12,'百度':11,'Google':10,'DuckDuckGo':10,'Yandex':9,
  'B站':9,'AcFun':8,'GitHub':7,'StackOverflow':7,'HackerNews':7,'Wikipedia':7,'arXiv':7,
  'Bing 学术':6,'Bing 代码':6,'Bing 影视':6,'Bing 新闻':6,'OpenLibrary':5,'InternetArchive':5,
  'Openverse':4,'TPB':4,'Nyaa':4};
function relevanceScore(kw,x){
  var q=String(kw||'').toLowerCase().trim();
  var title=String(x.title||'').toLowerCase();
  var desc=String(x.desc||'').toLowerCase();
  var url=String(x.url||'').toLowerCase();
  var s=0;
  if(title===q)s+=200;
  else if(title.indexOf(q)===0)s+=120;
  else if(title.indexOf(q)>=0)s+=90;
  if(desc.indexOf(q)>=0)s+=35;
  if(url.indexOf(q)>=0)s+=15;
  var terms=q.split(/\s+/).filter(Boolean);
  if(terms.length>1){
    var hit=0;
    terms.forEach(function(t){if(title.indexOf(t)>=0)hit++});
    s+=hit*25;
  }
  s+=SRC_PRI[x.engine]||0;
  return s;
}
function sortByRelevance(){
  ['web','video','image','magnet'].forEach(function(cat){
    SEARCH.data[cat].sort(function(a,b){return relevanceScore(SEARCH.kw,b)-relevanceScore(SEARCH.kw,a)});
  });
}
function updateStat(){
  var d=SEARCH.data;
  var counts={web:d.web.length,video:d.video.length,image:d.image.length,magnet:d.magnet.length};
  var total=counts.web+counts.video+counts.image+counts.magnet;
  var done=SEARCH.doneAll||engList().every(function(s){return s.done});
  var fails=engList().filter(function(s){return s.fail>0}).length;
  $('srStat').textContent='「'+SEARCH.kw+'」共 '+total+' 条 · 网页 '+counts.web+' / 视频 '+counts.video+' / 图片 '+counts.image+' / 磁力 '+counts.magnet+
    (fails?(' · '+fails+' 路失败'):'')+(SEARCH.loadingMore?' · 加载中…':(done?' · 已到底':''));
}
function updateMore(){
  var old=$('srMore');
  if(old){old.outerHTML=moreHtml();bindMore();}
}
/* 翻页时只追加新节点，不重建整个结果列表，保证几千条也不卡 */
function appendCategory(cat,start,items){
  window.__APPENDS=(window.__APPENDS||0)+1;
  if(!items||!items.length)return;
  if(SEARCH.cat!=='all'&&SEARCH.cat!==cat){updateStat();return}
  var sec=$('sec-'+cat);
  if(!sec){renderSr();return}
  var list=sec.querySelector('.rlist,.rgrid');
  if(!list){renderSr();return}
  var html=items.map(function(x,i){
    if(cat==='web')return rowHtml(x,start+i);
    if(cat==='magnet')return magHtml(x,start+i);
    return cellHtml(x,cat,start+i);
  }).join('');
  list.insertAdjacentHTML('beforeend',html);
  var em=sec.querySelector('.sec-hd em');
  if(em)em.textContent=SEARCH.data[cat].length;
  updateStat();
}
function scheduleRender(){
  if(SEARCH._rt)return;
  SEARCH._rt=setTimeout(function(){
    SEARCH._rt=0;
    if(SEARCH._stopped)return;
    var st=$('srBody').scrollTop;
    renderSr();
    if(st)$('srBody').scrollTop=st;
  },150);
}
function runEngines(my,isInitial){
  var jobs=[];
  engList().forEach(function(s){
    if(s.done||s.inflight||(s.nextAt&&Date.now()<s.nextAt))return;
    s.inflight=true;
    var p=s.page;
    jobs.push(withTimeout(Promise.resolve().then(function(){return s.e.f(SEARCH.kw,p)}),60000)
    .then(function(arr){
      s.inflight=false;
      if(my!==SEARCH.seq)return;
      s.fail=0;s.nextAt=0;
      if(!arr||!arr.length){s.done=true}
      else{
        var merged=mergeResults(s.cat,arr,s.e);
        s.page++;
        /* 不设结果数量上限：连续 3 页没有新结果（全是重复/空页）才算到底 */
        if(merged.items.length)s.emptyPages=0;else s.emptyPages=(s.emptyPages||0)+1;
        if(s.emptyPages>=3)s.done=true;
        if(isInitial)scheduleRender();
        else appendCategory(s.cat,merged.start,merged.items);
      }
    },function(err){
      s.inflight=false;
      if(my!==SEARCH.seq)return;
      s.fail++;
      s.nextAt=Date.now()+25000; /* 失败源冷却 25 秒，避免每一轮都堵住代理队列 */
      if(s.fail>=(s.e.oneTry?1:2))s.done=true;
      try{console.warn('[search] '+s.e.id+'/'+s.cat+' p'+p+' '+((err&&err.message)||err))}catch(e){}
      if(isInitial)scheduleRender();else updateStat(); /* 翻页失败只更新状态，不重建列表 */
    }));
  });
  return Promise.all(jobs).then(function(){
    if(my!==SEARCH.seq)return;
    if(isInitial){
      SEARCH.busy=false;
      if(SEARCH._rt){clearTimeout(SEARCH._rt);SEARCH._rt=0;} /* 取消初始阶段的待渲染，避免排序后又被重建 */
      sortByRelevance();
    }else{SEARCH.loadingMore=false;SEARCH.busy=false;}
    if(engList().every(function(s){return s.done}))SEARCH.doneAll=true;
    var total=SEARCH.data.web.length+SEARCH.data.video.length+SEARCH.data.image.length+SEARCH.data.magnet.length;
    if(!total&&SEARCH.doneAll){
      showChannelError(engList().filter(function(s){return s.fail>0}).map(function(s){return s.e.n+'·'+s.cat}),engList().length,SEARCH.kw);
    }else if(isInitial){
      renderSr();
    }else{
      updateStat();updateMore();
    }
    bindMore();
  });
}
function webSearch(kw){
  var my=++SEARCH.seq;
  SEARCH.kw=kw;SEARCH.busy=true;SEARCH.loadingMore=false;SEARCH.doneAll=false;SEARCH._stopped=false;
  SEARCH.data={web:[],video:[],image:[],magnet:[]};
  SEARCH.seen={web:{},video:{},image:{},magnet:{}};
  resetEngines();
  openSr();setMode('web');showCatTabs(true);
  $('srStat').textContent='正在聚合 '+engList().length+' 个搜索源…';
  $('srBody').innerHTML='<div class="sr-load"><span class="spin"></span>聚合搜索中，请稍候…</div>';
  /* 首屏先拉第 1 页；完成后自动补第 2 页，避免首屏只有零星结果 */
  runEngines(my,true).then(function(){
    if(my!==SEARCH.seq||SEARCH.doneAll)return;
    SEARCH.busy=true;
    runEngines(my,false);
  });
}
function loadMore(){
  if(SEARCH.mode!=='web'||SEARCH.loadingMore||SEARCH.doneAll||!SEARCH.kw)return;
  SEARCH.loadingMore=true;
  updateStat();updateMore(); /* 不重建列表，只切换底部状态，翻页全程增量追加 */
  runEngines(SEARCH.seq,false);
}
function moreHtml(){
  if(SEARCH.loadingMore)return '<div class="sr-more" id="srMore"><span class="spin"></span> 正在加载更多…</div>';
  if(SEARCH.doneAll)return '<div class="sr-more">已经到底了 · 没有更多新结果</div>';
  return '<div class="sr-more" id="srMore"><i class="fa-solid fa-arrow-down"></i> 继续下滑，自动加载更多</div>';
}
function bindMore(){var b=$('srMore');if(b)b.onclick=loadMore}
function renderSr(){
  window.__RENDERS=(window.__RENDERS||0)+1;
  var d=SEARCH.data,cat=SEARCH.cat;
  var total=d.web.length+d.video.length+d.image.length+d.magnet.length;
  updateStat();
  var box=$('srBody');
  if(!total){
    box.innerHTML=(SEARCH.busy||SEARCH.loadingMore)
      ?'<div class="sr-load"><span class="spin"></span>聚合搜索中，请稍候…</div>'
      :'<div class="sr-empty">没有找到结果<br>换个关键词，或者让资源管家帮您找<br><button class="sr-butler-btn" data-ebq="'+esc(SEARCH.kw||'')+'"><i class="fa-solid fa-wand-magic-sparkles"></i> 打开资源管家</button></div>';
    return;
  }
  var html='';
  if(cat==='all'){
    if(d.web.length)html+=secHtml('web','网页',d.web,d.web.length);
    if(d.video.length)html+=secHtml('video','视频',d.video,d.video.length);
    if(d.image.length)html+=secHtml('image','图片',d.image,d.image.length);
    if(d.magnet.length)html+=secHtml('magnet','磁力',d.magnet,d.magnet.length);
  }else{
    html+=secHtml(cat,{web:'网页',video:'视频',image:'图片',magnet:'磁力'}[cat],d[cat],d[cat].length);
  }
  if(SEARCH.mode==='web')html+=moreHtml();
  box.innerHTML=html;
  bindResults(box);
  bindMore();
}
function showChannelError(fails,total,kw){
  var isFile=location.protocol==='file:';
  var isLocal=/^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  var tips;
  if(isFile){
    tips='当前是以文件方式直接打开，浏览器会拦截跨域请求。<br>请双击同目录的 <b>启动网页版.bat</b>（或运行 server.ps1），<br>然后用 <b>http://127.0.0.1:18099/index.html</b> 打开。';
  }else if(isLocal){
    tips='当前页面服务器没有提供搜索代理。<br>请运行同目录的 server.ps1（端口 18099），或双击 <b>启动网页版.bat</b>。<br>App 内打开无需此步骤。';
  }else{
    tips='当前网页不在本地环境中，浏览器无法跨域搜索。<br>请改用 App，或在电脑上运行 server.ps1 后<br>访问 <b>http://127.0.0.1:18099/index.html</b>。';
  }
  $('srStat').textContent='搜索通道不可用 · 成功 0 / '+total+' 路';
  $('srBody').innerHTML='<div class="sr-empty" style="max-width:560px;margin:0 auto">'+
    '<div style="font-size:15px;font-weight:800;color:#eee9f8;margin-bottom:10px">没有连上搜索通道</div>'+
    '<div style="line-height:1.9">'+tips+'</div>'+
    '<div style="margin-top:12px;font-size:11px;color:#7d7397">失败引擎：'+esc(fails.join('、')||'—')+'</div>'+
    '<div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
    '<button class="sr-tool" id="srRetry" style="padding:8px 16px"><i class="fa-solid fa-rotate-right"></i> 重新搜索</button>'+
    '<button class="sr-tool" id="srGoSet" style="padding:8px 16px"><i class="fa-solid fa-sliders"></i> 通道设置</button></div>'+
    '<div style="margin-top:10px;font-size:11px;color:#7d7397">也可在设置里切换「公共代理 / 直连」再试</div>'+
    '<button class="sr-butler-btn" data-ebq="'+esc(kw||'')+'" style="margin-top:12px"><i class="fa-solid fa-wand-magic-sparkles"></i> 打开资源管家帮您找</button></div>';
  var r=$('srRetry');if(r)r.onclick=function(){webSearch(kw)};
  var s=$('srGoSet');if(s)s.onclick=openSet;
}
function secHtml(cat,label,arr,total){
  if(!arr.length)return '';
  var inner='';
  if(cat==='web')inner='<div class="rlist'+(SEARCH.layout==='grid'?' gridmode':'')+'">'+arr.map(rowHtml).join('')+'</div>';
  else if(cat==='magnet')inner='<div class="rlist'+(SEARCH.layout==='grid'?' gridmode':'')+'">'+arr.map(magHtml).join('')+'</div>';
  else inner='<div class="rgrid">'+arr.map(function(x,i){return cellHtml(x,cat,i)}).join('')+'</div>';
  return '<div class="sr-sec" id="sec-'+cat+'"><div class="sec-hd"><i class="fa-solid fa-'+
    ({web:'globe',video:'circle-play',image:'image',magnet:'magnet'}[cat])+'"></i>'+label+
    '<em>'+total+'</em></div>'+inner+'</div>';
}
function rowHtml(x,i){
  return '<div class="rrow" data-t="web" data-i="'+i+'">'+
    '<a class="rt" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title||x.url)+'</a>'+
    '<a class="ru" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.url)+'</a>'+
    (x.desc?'<div class="rd">'+esc(x.desc)+'</div>':'')+
    '<div class="rm"><span class="tag">'+esc(x.engine||x.source||'')+'</span><span class="tag">'+esc(x.host||host(x.url))+'</span>'+
    '<span class="mini" data-sniff="'+i+'"><i class="fa-solid fa-tower-broadcast"></i> 嗅探资源</span></div></div>';
}
function magHtml(x,i){
  return '<div class="rrow" data-t="magnet" data-i="'+i+'">'+
    '<div class="rt"><i class="fa-solid fa-magnet" style="color:#6d28d9"></i> '+esc(x.title)+'</div>'+
    '<div class="rd">'+esc(x.desc||'')+'</div>'+
    '<div class="rm"><span class="tag">'+esc(x.engine||'TPB')+'</span><span class="tag">'+fmtSize(x.size)+'</span>'+
    (x.files?'<span class="tag">'+x.files+' 个文件</span>':'')+'<span class="mini">点击解析 ›</span></div></div>';
}
function cellHtml(x,cat,i){
  var pic=x.pic||(cat==='image'?x.url:'');
  return '<div class="rcell" data-t="'+cat+'" data-i="'+i+'">'+
    '<div class="th">'+(pic?'<img src="'+esc(pic)+'" loading="lazy" onerror="this.style.display=\'none\'" alt="">':'')+
    '<div class="ph"><i class="fa-solid fa-'+(cat==='video'?'film':'image')+'"></i></div>'+
    '<span class="badge">'+esc(x.engine||x.source||'')+'</span>'+(x.dur?'<span class="dur">'+esc(x.dur)+'</span>':'')+'</div>'+
    '<div class="cap"><div class="t">'+esc(x.title||(cat==='image'?'点击查看大图':x.url))+'</div>'+
    '<div class="s">'+esc(x.author||x.host||'')+'</div></div></div>';
}
function bindResults(box){
  box.onclick=function(e){
    if(e.target.closest&&e.target.closest('a[href]'))return; /* 原始链接直接跳转，不弹详情 */
    var sn=e.target.closest?e.target.closest('[data-sniff]'):null;
    if(sn){ e.stopPropagation(); sniffWeb(SEARCH.data.web[+sn.getAttribute('data-sniff')]); return }
    var el=e.target.closest?e.target.closest('[data-t]'):null;
    if(!el)return;
    var t=el.getAttribute('data-t'),i=+el.getAttribute('data-i');
    var item=SEARCH.data[t]&&SEARCH.data[t][i]; if(!item)return;
    if(t==='web')openDetail('web',item);
    else if(t==='image')openDetail('image',item);
    else if(t==='video')openDetail('video',item);
    else if(t==='magnet')openDetail('magnet',item);
  };
}
function setCat(c){
  SEARCH.cat=c;
  [].forEach.call($('srTabs').children,function(b){b.classList.toggle('on',b.getAttribute('data-c')===c)});
}

/* ---------- 资源嗅探 ---------- */
function sniffWeb(item){
  toast('正在嗅探该页面的媒体资源…');
  getText(item.url).then(function(html){
    var out=[],seen={};
    var re=/(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4|webm|mp3|m4a)(?:\?[^\s"'<>\\]*)?)/gi,m;
    while((m=re.exec(html))){
      var u=m[1];
      if(seen[u])continue; seen[u]=1; out.push(u);
      if(out.length>=40)break;
    }
    if(!out.length){toast('没嗅探到可播放的媒体资源');return}
    var body=$('dtBody');
    $('dtTt').textContent='资源嗅探 · '+host(item.url);
    body.innerHTML='<div class="dt-info" style="max-width:900px"><div class="k">页面</div><div class="v">'+esc(item.url)+'</div></div>'+
      '<div class="dt-ops" style="max-width:900px"><a class="primary" href="'+esc(out[0])+'" target="_blank" rel="noopener">播放第一个</a><button id="snCopy">复制全部</button></div>'+
      out.map(function(u){
        var isHls=/\.m3u8/i.test(u);
        return '<div class="dt-info" style="max-width:900px"><div class="k">'+(isHls?'HLS 播放列表':'媒体文件')+'</div><div class="v">'+esc(u)+'</div>'+
          '<div class="dt-ops" style="margin-top:8px"><button class="primary" data-vplay="'+esc(u)+'">立即播放</button><a href="'+esc(u)+'" target="_blank" rel="noopener">新窗口打开</a></div></div>';
      }).join('');
    $('detail').classList.add('on');
    body.onclick=function(e){
      var b=e.target.closest?e.target.closest('[data-vplay]'):null;
      if(b){ playVideo(b.getAttribute('data-vplay'),'嗅探资源',item.url) }
      var cp=e.target.closest?e.target.closest('#snCopy'):null;
      if(cp){ copyText(out.join('\n')); toast('已复制 '+out.length+' 条资源链接') }
    };
  }).catch(function(){toast('嗅探失败：页面无法访问')});
}

/* ---------- 详情 ---------- */
function copyText(t){
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  }catch(e){}
  var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy')}catch(e){}ta.remove();
}
function shareItem(title,url){
  if(navigator.share){ navigator.share({title:title,url:url}).catch(function(){}); return }
  copyText(url); toast('已复制链接，可分享给好友');
}
function openDetail(kind,item){
  var body=$('dtBody');
  var head=$('dtTt');
  body.onclick=null;
  if(kind==='image'){
    var src=item.url;
    head.textContent=item.title||'图片预览';
    body.innerHTML='<img class="big" src="'+esc(src)+'" alt="" onerror="this.style.opacity=.25">'+
      '<div class="dt-info"><div class="k">图片地址</div><div class="v">'+esc(src)+'</div></div>'+
      '<div class="dt-ops"><a class="primary" href="'+esc(src)+'" download target="_blank" rel="noopener"><i class="fas fa-download"></i> 下载原图</a>'+
      '<button id="dtShare"><i class="fas fa-share-nodes"></i> 分享</button>'+
      '<a href="'+esc(src)+'" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> 打开原图</a></div>';
  }else if(kind==='video'){
    head.textContent=item.title||'视频';
    body.innerHTML='<div class="dt-vwrap" id="vWrap"></div>'+
      '<div class="dt-info"><div class="k">标题</div><div class="v">'+esc(item.title||'')+'</div></div>'+
      (item.url?'<div class="dt-info"><div class="k">原始链接</div><div class="v">'+esc(item.url)+'</div></div>':'')+
      '<div class="dt-ops"><a class="primary" href="'+esc(item.url)+'" target="_blank" rel="noopener"><i class="fas fa-up-right-from-square"></i> 打开原视频</a>'+
      '<a href="'+esc(item.url)+'" download target="_blank" rel="noopener"><i class="fas fa-download"></i> 下载</a>'+
      '<button id="dtShare"><i class="fas fa-share-nodes"></i> 分享</button></div>';
    mountVideo($('vWrap'),item.url,item.title);
  }else if(kind==='web'){
    head.textContent=item.title||'网页';
    body.innerHTML='<div class="dt-info"><div class="k">标题</div><div class="v">'+esc(item.title||'')+'</div></div>'+
      (item.desc?'<div class="dt-info"><div class="k">内容简介</div><div class="v">'+esc(item.desc)+'</div></div>':'')+
      '<div class="dt-info"><div class="k">原始链接</div><div class="v">'+esc(item.url)+'</div></div>'+
      '<div class="dt-ops"><a class="primary" href="'+esc(item.url)+'" target="_blank" rel="noopener">打开网页</a>'+
      '<button id="dtSearch"><i class="fa-solid fa-magnifying-glass"></i> 搜索相关</button>'+
      '<button id="dtShare"><i class="fas fa-share-nodes"></i> 分享</button></div>';
  }else if(kind==='magnet'){
    head.textContent='磁力解析';
    var tr=[];(item.magnet||'').replace(/&tr=([^&]+)/g,function(_,t){tr.push(decodeURIComponent(t))});
    body.innerHTML='<div class="dt-info"><div class="k">名称</div><div class="v">'+esc(item.title||'')+'</div></div>'+
      '<div class="dt-info"><div class="k">Info Hash</div><div class="v">'+esc(item.hash||'')+'</div></div>'+
      '<div class="dt-info"><div class="k">磁力链接</div><div class="v">'+esc(item.magnet||item.url)+'</div></div>'+
      '<div class="dt-ops"><button class="primary" id="mgLocal"><i class="fas fa-download"></i> 用本地工具打开</button>'+
      '<button id="mgCopy"><i class="fas fa-copy"></i> 复制磁力</button>'+
      '<a href="'+esc(item.magnet||item.url)+'" download><i class="fas fa-file"></i> 保存链接</a></div>'+
      '<div id="mgRes" style="width:100%;max-width:900px"></div>';
    body.onclick=function(e){
      var b=e.target.closest?e.target.closest('button'):null;if(!b)return;
      if(b.id==='mgCopy'){copyText(item.magnet||item.url);toast('磁力链接已复制')}
      if(b.id==='mgLocal'){openMagnet(item.magnet||item.url)}
    };
    if(MAGMODE==='builtin')builtinMagnet(item);
  }else{return}
  var sh=$('dtShare');
  if(sh)sh.onclick=function(){shareItem(head.textContent,item.url)};
  var ds=$('dtSearch');
  if(ds)ds.onclick=function(){
    var kw=item.title||item.url||'';
    $('detail').classList.remove('on');
    if(!kw)return;
    setMode('web');$('kw').value=kw;webSearch(kw);
  };
  $('detail').classList.add('on');
}
/* 内置磁力解析：解析 magnet 元信息；能拿到 tracker 就一并列出 */
function builtinMagnet(item){
  var box=$('mgRes');if(!box)return;
  var u=item.magnet||item.url;
  var m=/xt=urn:btih:([a-zA-Z0-9]+)/.exec(u);
  if(!m){
    box.innerHTML='<div class="dt-info"><div class="k">内置解析</div><div class="v">该链接缺少有效 Info Hash，已自动切换为调用本地磁力工具…</div></div>';
    toast('内置解析失败，已自动调用本地磁力工具');
    openMagnet(u);return;
  }
  var dn=/[?&]dn=([^&]+)/.exec(u);
  var html='<div class="dt-info"><div class="k">内置解析结果</div><div class="v">'+
    '哈希：'+esc(m?m[1]:'—')+'<br>名称：'+esc(dn?decodeURIComponent(dn[1]):item.title||'')+'<br>文件数：'+esc(item.files||'未知')+
    '<br>大小：'+fmtSize(item.size)+'<br>做种/下载：'+esc(item.seed||0)+' / '+esc(item.leech||0)+'</div></div>'+
    '<div class="dt-ops"><button class="primary" id="mgLocal2">用本地工具打开</button><button id="mgCopy2">复制磁力</button></div>';
  box.innerHTML=html;
  box.onclick=function(e){
    var b=e.target.closest?e.target.closest('button'):null;if(!b)return;
    if(b.id==='mgCopy2'){copyText(u);toast('磁力链接已复制')}
    if(b.id==='mgLocal2'){openMagnet(u)}
  };
}
function openMagnet(u){
  if(MAGMODE==='copy'){copyText(u);toast('已复制磁力链接，请粘贴到下载器');return}
  try{
    var a=document.createElement('a');a.href=u;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){
      toast('若未唤起下载工具，请点「复制磁力」手动粘贴');
    },1600);
  }catch(e){copyText(u);toast('已复制磁力链接')}
}

/* ---------- 视频播放内核（与影视乐园同款 hls.js） ---------- */
function mountVideo(wrap,url,title){
  if(!wrap)return;
  if(!url){wrap.innerHTML='<div class="sr-empty">该结果没有可直接播放的视频地址</div>';return}
  /* 哔哩哔哩：直接用官方播放器内嵌（可在线播放，带完整控制条），无需再破解直链 */
  var bv=/bilibili\.com\/video\/(BV[0-9A-Za-z]+|av\d+)/i.exec(url);
  if(bv){
    var id=bv[1], isav=/^av/i.test(id);
    var src='https://player.bilibili.com/player.html?'+(isav?('aid='+id.slice(2)):('bvid='+id))+'&autoplay=0&high_quality=1&danmaku=0';
    wrap.innerHTML='<iframe src="'+esc(src)+'" allowfullscreen referrerpolicy="no-referrer" scrolling="no"></iframe>'+
      '<div class="vctl"><span style="font-size:11px;color:var(--mut)">哔哩哔哩官方播放内核</span>'+
      '<span style="flex:1"></span><a href="'+esc(url)+'" target="_blank" rel="noopener" style="font-size:11.5px;color:var(--acc)">在 B 站打开</a></div>';
    return;
  }
  /* AcFun：官方播放器内嵌 */
  var ac=/acfun\.cn\/v\/ac(\d+)/i.exec(url);
  if(ac){
    var asrc='https://www.acfun.cn/player/ac'+ac[1];
    wrap.innerHTML='<iframe src="'+esc(asrc)+'" allowfullscreen referrerpolicy="no-referrer" scrolling="no"></iframe>'+
      '<div class="vctl"><span style="font-size:11px;color:var(--mut)">AcFun 官方播放内核</span>'+
      '<span style="flex:1"></span><a href="'+esc(url)+'" target="_blank" rel="noopener" style="font-size:11.5px;color:var(--acc)">在 AcFun 打开</a></div>';
    return;
  }
  var isHls=/\.m3u8(\?|$)/i.test(url);
  wrap.innerHTML='<video id="srVideo" controls playsinline preload="metadata"></video>'+
    '<div class="vctl"><span id="vStat" style="font-size:11px;color:var(--mut)"></span>'+
    '<span style="flex:1"></span>'+
    '<button id="vSpeed">1.0x</button><button id="vFit">适应</button><button id="vFs">全屏</button></div>';
  var v=$('srVideo'),stat=$('vStat');
  function setStat(t){if(stat)stat.textContent=t}
  setStat(isHls?'HLS 流 · hls.js 内核':'直链视频');
  if(isHls&&window.Hls&&window.Hls.isSupported()){
    var hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
    window.__srHls=hls;
    hls.loadSource(url);hls.attachMedia(v);
    hls.on(window.Hls.Events.ERROR,function(_,d){ if(d&&d.fatal)setStat('播放出错：'+d.details) });
    hls.on(window.Hls.Events.MANIFEST_PARSED,function(_,d){ setStat('HLS · '+(d.levels.length)+' 档画质'); try{v.play()}catch(e){} });
  }else{
    v.src=url;
    v.onerror=function(){setStat('该地址可能不允许直接播放，可点下方「打开原视频」')};
    try{v.play()}catch(e){}
  }
  var sp=1;
  $('vSpeed').onclick=function(){sp=sp>=2?0.5:sp+0.5;v.playbackRate=sp;this.textContent=sp.toFixed(1)+'x'};
  var fit=true;
  $('vFit').onclick=function(){fit=!fit;v.style.objectFit=fit?'contain':'cover';this.textContent=fit?'适应':'铺满'};
  $('vFs').onclick=function(){
    if(v.requestFullscreen)v.requestFullscreen().catch(function(){});
    else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();
  };
}
function playVideo(url,title,srcPage){
  $('dtTt').textContent=title||'播放';
  var body=$('dtBody');
  body.innerHTML='<div class="dt-vwrap" id="vWrap"></div>'+
    (srcPage?'<div class="dt-info"><div class="k">来源页面</div><div class="v">'+esc(srcPage)+'</div></div>':'')+
    '<div class="dt-ops"><a href="'+esc(url)+'" target="_blank" rel="noopener">新窗口打开</a><button class="primary" id="dtShare2">分享</button></div>';
  mountVideo($('vWrap'),url,title);
  var b=$('dtShare2');if(b)b.onclick=function(){shareItem(title,url)};
  $('detail').classList.add('on');
}

/* ---------- 搜索框事件 ---------- */
var lastKw='';
function doSearch(){
  var kw=String($('kw').value||'').trim();
  if(!kw){ closeSr(); render(); return }
  lastKw=kw;
  if(SEARCH.mode==='web')webSearch(kw);
  else{ openSr(); showCatTabs(false); siteSearch(kw) }
}
$('goSearch').onclick=doSearch;
/* v9.8.0：搜索结果页顶部直接继续搜索（宽度限制在侧栏右侧，不覆盖侧栏） */
function srSearchGo(){
  var v=String(($('srKw')||{}).value||'').trim(); if(!v)return;
  $('kw').value=v; doSearch();
}
if($('srGo'))$('srGo').onclick=srSearchGo;
/* 搜索结果页左上角返回：关闭结果页回主页，而不是大退出 */
if($('srBack'))$('srBack').onclick=function(){ try{closeSr()}catch(e){}; window.scrollTo({top:0,behavior:'smooth'}); };
if($('srKw'))$('srKw').addEventListener('keydown',function(e){ if(e.key==='Enter'||e.keyCode===13){ e.preventDefault(); srSearchGo(); } });
if($('srBody'))$('srBody').addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-ebq]'):null;
  if(b){ openButler(b.getAttribute('data-ebq')||''); }
});
$('kw').addEventListener('keydown',function(e){ if(e.key==='Enter'||e.keyCode===13){ e.preventDefault(); doSearch() } });
var tmr=0;
$('kw').addEventListener('input',function(){
  var v=this.value;
  clearTimeout(tmr);
  if(!v.trim()){ closeSr(); render(); return }
  if(SEARCH.mode==='site'){
    tmr=setTimeout(function(){ openSr(); showCatTabs(false); siteSearch(v.trim().toLowerCase()) },180);
  }
});
$('mSwitch').onclick=function(e){
  var b=e.target.closest?e.target.closest('button'):null;if(!b)return;
  setMode(b.getAttribute('data-m'));
  if($('kw').value.trim())doSearch();
};
$('srTabs').onclick=function(e){
  var b=e.target.closest?e.target.closest('.sr-tab'):null;if(!b)return;
  setCat(b.getAttribute('data-c')); renderSr(); $('srBody').scrollTop=0;
};
$('srLayout').onclick=function(){
  SEARCH.layout=SEARCH.layout==='list'?'grid':'list';
  this.textContent=SEARCH.layout==='list'?'列表':'网格';
  this.classList.toggle('on',SEARCH.layout==='grid');
  var st=$('srBody').scrollTop;
  renderSr();
  $('srBody').scrollTop=st;
};
/* 无限翻页：接近底部自动加载下一页，直到所有源都搜不出新结果 */
$('srBody').addEventListener('scroll',function(){
  if(SEARCH.mode!=='web'||SEARCH.loadingMore||SEARCH.doneAll)return;
  if(this.scrollTop+this.clientHeight>=this.scrollHeight-600)loadMore();
},{passive:true});
$('dtClose').onclick=function(){
  $('detail').classList.remove('on');
  var v=$('srVideo');if(v){try{v.pause()}catch(e){}}
  if(window.__srHls){try{window.__srHls.destroy()}catch(e){};window.__srHls=null}
  $('dtBody').innerHTML='';
};

/* ---------- 设置 ---------- */
function openSet(){
  $('setSheet').classList.add('on');
  $('setChan').value=CHAN;
  $('setMag').value=MAGMODE;
  $('setYProxy').value=YPROXY;
  var all=[];
  Object.keys(ENGINES).forEach(function(k){ENGINES[k].forEach(function(e){if(!all.some(function(x){return x.id===e.id}))all.push(e)})});
  $('setEngines').innerHTML=all.map(function(e){return '<span data-e="'+e.id+'" class="'+(engOn(e.id)?'on':'')+'">'+e.n+'</span>'}).join('');
  $('setDiag').textContent='当前通道：'+(CHAN==='auto'?'自动（本地优先）':CHAN==='local'?'本地代理':CHAN==='public'?'公共代理':'直连')+
    ' · 本地代理：'+(LP_BASE!==null?((LP_BASE||location.origin)+'/proxy'):'自动探测（同源 / 8080 / 18099）');
}
$('setTest').onclick=function(){
  var b=this;b.disabled=true;$('setDiag').textContent='正在检测本地代理…';
  localProxy('https://cn.bing.com/search?q=test&format=rss').then(function(t){
    $('setDiag').textContent='本地代理可用：'+((LP_BASE||location.origin)+'/proxy')+' · 返回 '+t.length+' 字节';
  }).catch(function(e){
    LP_BASE=null;
    $('setDiag').textContent='本地代理不可用：'+(e&&e.message||e)+'。请运行 server.ps1，或在 App 内打开。';
  }).then(function(){b.disabled=false});
};
$('setYProxy').onchange=function(){
  YPROXY=this.value.trim();LS.put('sl_search_yproxy',YPROXY);
  $('setDiag').textContent='国际源代理出口：'+(YPROXY||'自动（7890 / 10809 / 7891 / 1080）');
};
$('setYTest').onclick=function(){
  var b=this;b.disabled=true;$('setDiag').textContent='正在测试 Yandex…';
  yandexWeb('猫').then(function(arr){
    $('setDiag').textContent='Yandex 可用：返回 '+arr.length+' 条 · 出口 '+(YPROXY||'自动探测');
  }).catch(function(e){
    $('setDiag').textContent='Yandex 不可用：'+(e&&e.message||e)+'。请填写可用代理出口，或让 Yandex 自动跳过。';
  }).then(function(){b.disabled=false});
};
$('srSet').onclick=openSet;
$('setClose').onclick=function(){$('setSheet').classList.remove('on')};
$('setChan').onchange=function(){CHAN=this.value;LS.put('sl_search_chan',CHAN);openSet()};
$('setMag').onchange=function(){MAGMODE=this.value;LS.put('sl_search_mag',MAGMODE)};
/* v8.0.4：网络加速（VPN）功能已按要求彻底移除，不再出现任何开关或提示 */
$('setEngines').onclick=function(e){
  var s=e.target.closest?e.target.closest('span[data-e]'):null;if(!s)return;
  var id=s.getAttribute('data-e');
  ENGON[id]=!engOn(id);
  LS.put('sl_search_engines',ENGON);
  s.classList.toggle('on',engOn(id));
};

/* v9.8.1：Level2D 官方引擎入口——先选择容器运行或安装独立附包 */
function openLevel2DDialog(){
  var ov=$('l2dView');
  if(!ov){
    ov=document.createElement('div');ov.id='l2dView';ov.className='l2d-view';
    ov.innerHTML='<div class="l2d-bar"><b>Live2DViewerEX · 官方 Web</b><button id="l2dClose" title="关闭">×</button></div>'+
      '<iframe id="l2dFrame" src="live2d/index.html" allow="autoplay; fullscreen; clipboard-read; clipboard-write"></iframe>';
    document.body.appendChild(ov);
    ov.querySelector('#l2dClose').onclick=function(){ov.classList.remove('on')};
  }
  ov.classList.add('on');
}
/* ---------- 站点卡片点击 ---------- */
document.addEventListener('click',function(e){
  var card=e.target.closest?e.target.closest('.card'):null;
  if(!card)return;
  var mod=card.getAttribute('data-mod');
  if(mod==='level2d'){ openLevel2DDialog(); return; }
  var durl=card.getAttribute('data-url');
  if(durl){ window.open(durl,'_blank','noopener'); return; }
  if(mod){ window.open(mod,'_blank','noopener'); return; }
  var u=decodeU(card.getAttribute('data-u'));
  if(!u||u==='#')return;
  var site=allSites().filter(function(s){return s.u===card.getAttribute('data-u')})[0]||{};
  var m=$('modal');
  m.innerHTML='<button class="x" onclick="document.getElementById(\'ov\').classList.remove(\'on\')">✕</button>'+
    '<h3>'+esc(site.t||'站点')+'</h3><div class="host">'+esc(u)+'</div>'+
    (site.d?'<div class="blk"><div class="lb">简介</div><div class="vl">'+esc(site.d)+'</div></div>':'')+
    (site.f?'<div class="blk"><div class="lb">特点</div><div class="vl">'+esc(String(site.f).split('|').join(' · '))+'</div></div>':'')+
    (site.p?'<div class="blk"><div class="lb">备注</div><div class="vl">'+esc(site.p)+'</div></div>':'')+
    (site.k?'<div class="blk"><div class="lb">关键词</div><div class="vl">'+esc(site.k)+'</div></div>':'')+
    (site.pw?'<div class="blk"><div class="lb">密码</div><div class="vl">'+esc(site.pw)+'</div></div>':'')+
    '<div style="display:flex;gap:8px;margin-top:6px">'+
      '<button id="siteFav" style="flex:1;padding:11px;border-radius:10px;border:1px solid rgba(240,196,106,.45);background:rgba(240,196,106,.12);color:#f0c46a;font-weight:700;cursor:pointer">'+(isFav(u)?'★ 已收藏':'☆ 收藏网站')+'</button>'+
      '<button id="siteSearch" style="flex:1;padding:11px;border-radius:10px;border:1px solid rgba(139,92,246,.5);background:rgba(139,92,246,.15);color:#d9c9ff;font-weight:700;cursor:pointer"><i class="fa-solid fa-magnifying-glass"></i> 搜索相关</button>'+
    '</div>'+
    '<a class="go" href="'+esc(u)+'" target="_blank" rel="noopener">前往站点</a>';
  $('ov').classList.add('on');
  var fb=$('siteFav');
  if(fb)fb.onclick=function(){ $('ov').classList.remove('on'); toggleFav(site); };
  var fs=$('siteSearch');
  if(fs)fs.onclick=function(){
    var kw=site.t||site.k||'';
    $('ov').classList.remove('on');
    if(!kw)return;
    $('kw').value=kw;setMode('web');webSearch(kw);
  };
});

/* 启动 */
$('ov').onclick=function(e){ if(e.target===this) this.classList.remove('on'); };
/* 每到整点刷新一次祝福；页面回到前台时也检查 */
var __lastHour=new Date().getHours();
setInterval(function(){
  var h=new Date().getHours();
  if(h!==__lastHour){ __lastHour=h; refreshGreeting(true); }
},30000);
document.addEventListener('visibilitychange',function(){ if(!document.hidden) refreshGreeting(); });
setMode('site');
if(MODE)MODE.apply();
window.__slRerender=function(){render()};
window.__slRefreshTheme=function(){if(MODE)MODE.apply()};
loadData();
})();
