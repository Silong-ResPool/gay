
/* ===== v9.9.0 自定义桌宠：上传 / 分组 / 动作触发 / 行走 / 精确位置 ===== */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var KEY='sl_pets_v1';
var PETS=[],GROUPS=[],NODES={},URLS={},WALK={},DB=null,LAST_RAND={},SAVE_T=0;

function clamp(n,a,b){return n<a?a:(n>b?b:n)}
function uid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function toast2(m){var t=$('toast');if(!t)return;t.textContent=m;t.classList.add('on');
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},2200)}
function save(){clearTimeout(SAVE_T);SAVE_T=setTimeout(function(){
  try{localStorage.setItem(KEY,JSON.stringify({pets:PETS,groups:GROUPS}))}catch(e){}},120)}

function load(){
  try{var d=JSON.parse(localStorage.getItem(KEY)||'null');
    if(d&&Array.isArray(d.pets)){PETS=d.pets;GROUPS=Array.isArray(d.groups)?d.groups:[]}
  }catch(e){}
  if(!GROUPS.length)GROUPS=[{id:'g0',name:'默认分组',rand:0,gap:8}];
  PETS.forEach(function(p){
    if(!p.gid)p.gid=GROUPS[0].id;
    if(typeof p.xr!=='number')p.xr=.5;
    if(typeof p.pyr!=='number')p.pyr=.72;
    if(typeof p.wr!=='number')p.wr=.22;
    if(!p.axis)p.axis='free';
    if(typeof p.vis!=='number')p.vis=1;
    if(typeof p.mute!=='number')p.mute=1;
    if(typeof p.z!=='number')p.z=1;
  });
}
/* IndexedDB 存视频 blob，避免 localStorage 超限 */
function db(cb){if(DB)return cb(DB);
  try{var r=indexedDB.open('sl_pet_db',1);
    r.onupgradeneeded=function(){try{r.result.createObjectStore('v')}catch(e){}};
    r.onsuccess=function(){DB=r.result;cb(DB)};
    r.onerror=function(){cb(null)};
  }catch(e){cb(null)}}
function putBlob(id,b,cb){db(function(d){if(!d)return cb&&cb();
  var t=d.transaction('v','readwrite');t.objectStore('v').put(b,id);
  t.oncomplete=function(){cb&&cb()};t.onerror=function(){cb&&cb()}})}
function getBlob(id,cb){db(function(d){if(!d)return cb(null);
  var g=d.transaction('v').objectStore('v').get(id);
  g.onsuccess=function(){cb(g.result||null)};g.onerror=function(){cb(null)}})}
function delBlob(id){db(function(d){if(!d)return;
  try{d.transaction('v','readwrite').objectStore('v').delete(id)}catch(e){}})}

function dockH(){var d=$('slDock');
  return (document.body.classList.contains('dock-open')&&d)?(d.offsetHeight||0):0}
function place(p,v){
  if(!v)return;
  if(!p.vis){v.style.display='none';return}
  var W=window.innerWidth,H=window.innerHeight-dockH();
  var w=Math.round(clamp(p.wr||.22,.06,.75)*W*clamp(p.z||1,.2,3));
  v.style.display='block';v.style.width=w+'px';
  if(p.kind==='l2d')v.style.height=Math.round(w*1.4)+'px';
  var rw=v.getBoundingClientRect().width||w;
  var rh=v.getBoundingClientRect().height||Math.round(w*1.2);
  v.style.left=Math.round(clamp(p.xr,0,1)*Math.max(0,W-rw))+'px';
  v.style.top=Math.round(clamp(p.pyr,0,1)*Math.max(0,H-rh))+'px';
}
function node(p){
  if(NODES[p.id])return NODES[p.id];
  var v;
  if(p.kind==='l2d'){
    v=document.createElement('div');
    v.className='sl-pet sl-pet-l2d';
    var f=document.createElement('iframe');
    f.setAttribute('scrolling','no');f.setAttribute('frameborder','0');
    f.setAttribute('allowtransparency','true');
    f.src=p.src||'live2d/pet.html?m=sample/Mark/Mark.model3.json';
    v.appendChild(f);
    setTimeout(function(){place(p,v)},300);
    setTimeout(function(){place(p,v)},1200);
  }else{
    v=document.createElement('video');
    v.className='sl-pet';v.autoplay=true;v.loop=true;v.muted=!!p.mute;
    v.setAttribute('playsinline','');
    getBlob(p.id,function(b){
      if(!b)return;var u=URL.createObjectURL(b);URLS[p.id]=u;v.src=u;
      v.addEventListener('loadedmetadata',function(){place(p,v)});
      v.play().catch(function(){});
    });
  }
  document.body.appendChild(v);NODES[p.id]=v;drag(p,v);
  return v;
}
function drag(p,v){
  var s={};
  v.addEventListener('pointerdown',function(e){
    if(e.button!=null&&e.button!==0)return;
    s.on=true;s.sx=e.clientX;s.sy=e.clientY;s.ox=p.xr;s.oy=p.pyr;
    v.classList.add('dragging');try{v.setPointerCapture(e.pointerId)}catch(_){}
    e.preventDefault();
  });
  v.addEventListener('pointermove',function(e){
    if(!s.on)return;
    var W=window.innerWidth,H=window.innerHeight-dockH();
    var r=v.getBoundingClientRect();
    if(p.axis!=='lockX')p.xr=clamp(s.ox+(e.clientX-s.sx)/Math.max(1,W-r.width),0,1);
    if(p.axis!=='lockY')p.pyr=clamp(s.oy+(e.clientY-s.sy)/Math.max(1,H-r.height),0,1);
    place(p,v);save();e.preventDefault();
  });
  function end(){if(!s.on)return;s.on=false;v.classList.remove('dragging')}
  v.addEventListener('pointerup',end);v.addEventListener('pointercancel',end);
}
function apply(p){
  var v=NODES[p.id];
  if(!p.vis){if(v)v.style.display='none';return}
  v=node(p);
  if(p.kind!=='l2d')v.muted=!!p.mute;
  place(p,v);
  if(p.kind!=='l2d')v.play().catch(function(){});
}
function renderPets(){PETS.forEach(apply)}

/* 关键词触发：命中组内关键词 → 该组切到对应宠物动作 */
window.slPetTrigger=function(q){
  q=String(q||'').toLowerCase();if(!q)return;
  var hit=false;
  PETS.forEach(function(p){
    if(!p.kw)return;
    var ws=String(p.kw).split(/[,，\s、]+/).filter(Boolean);
    var ok=ws.some(function(w){return q.indexOf(String(w).toLowerCase())>=0});
    if(!ok)return;
    hit=true;
    PETS.forEach(function(o){if(o.gid===p.gid){o.vis=(o===p)?1:0;apply(o)}});
  });
  if(hit){save();toast2('桌宠动作已切换')}
};

/* 行走：沿屏幕 / 小窗上沿来回走，遇墙反弹 */
setInterval(function(){
  PETS.forEach(function(p){
    if(!p.vis||!p.walk||p.axis==='lockX')return;
    var v=NODES[p.id];if(!v)return;
    var st=WALK[p.id]||(WALK[p.id]={d:Math.random()<.5?-1:1});
    p.xr=clamp(p.xr+st.d*(p.spd||.06)*.08,0,1);
    if(p.xr<=0){p.xr=0;st.d=1}
    if(p.xr>=1){p.xr=1;st.d=-1}
    place(p,v);
  });
},80);

/* 无条件随机：分组内定时随机切换动作 */
setInterval(function(){
  var now=Date.now();
  GROUPS.forEach(function(g){
    if(!g.rand)return;
    var list=PETS.filter(function(p){return p.gid===g.id});
    if(list.length<2)return;
    if(now-(LAST_RAND[g.id]||0)<(g.gap||8)*1000)return;
    LAST_RAND[g.id]=now;
    var pick=list[Math.floor(Math.random()*list.length)];
    list.forEach(function(o){o.vis=(o===pick)?1:0;apply(o)});
    save();
  });
},1000);

/* ===== 管理面板 ===== */
function row(p){var d=document.createElement('div');d.className='pet-row';p.appendChild(d);return d}
function mkBtn(t,on){var b=document.createElement('button');b.textContent=t;if(on)b.className='on';return b}
function mkRange(min,max,step,val,fn){
  var i=document.createElement('input');i.type='range';i.min=min;i.max=max;i.step=step;i.value=val;
  i.oninput=function(){fn(parseFloat(this.value))};return i}
function mkNum(min,max,val,fn){
  var i=document.createElement('input');i.type='number';i.min=min;i.max=max;i.value=val;
  i.oninput=function(){var n=parseFloat(this.value);if(!isNaN(n))fn(n)};return i}
function renderPanel(){
  var box=$('petList');if(!box)return;
  box.innerHTML='';

  var gsub=document.createElement('div');gsub.className='pet-sub';
  gsub.textContent='宠物分组（组内「随机」= 无条件随机切换动作）';box.appendChild(gsub);
  GROUPS.forEach(function(g){
    var d=document.createElement('div');d.className='pet-grp';
    var b=document.createElement('b');b.textContent=g.name;d.appendChild(b);
    var rb=mkBtn(g.rand?'随机中':'取消随机',!!g.rand);
    rb.onclick=function(){g.rand=g.rand?0:1;LAST_RAND[g.id]=0;save();renderPanel()};
    d.appendChild(rb);
    var del=mkBtn('删除',false);
    del.onclick=function(){
      if(!confirm('删除分组「'+g.name+'」？组内宠物会移到第一个分组'))return;
      GROUPS=GROUPS.filter(function(x){return x!==g});
      if(!GROUPS.length)GROUPS=[{id:'g0',name:'默认分组',rand:0,gap:8}];
      PETS.forEach(function(p){if(p.gid===g.id)p.gid=GROUPS[0].id});
      save();renderPets();renderPanel();
    };
    d.appendChild(del);box.appendChild(d);
  });
  var add=document.createElement('div');add.className='pet-grp';
  var ai=document.createElement('input');ai.type='text';ai.placeholder='新分组名称';add.appendChild(ai);
  var ab=mkBtn('新建分组',false);
  ab.onclick=function(){var n=ai.value.trim();if(!n)return;
    GROUPS.push({id:'g'+Date.now().toString(36),name:n.slice(0,12),rand:0,gap:8});
    save();renderPanel()};
  add.appendChild(ab);box.appendChild(add);

  var l2d=document.createElement('div');l2d.className='pet-grp';
  var lsel=document.createElement('select');
  [['sample/Mark/Mark.model3.json','红衣 Mark'],
   ['sample/Natori/Natori.model3.json','男角色 Natori'],
   ['assets/demo/Haru.model3.json','Haru']].forEach(function(o){
    var op=document.createElement('option');op.value=o[0];op.textContent=o[1];lsel.appendChild(op)});
  l2d.appendChild(lsel);
  var lb=mkBtn('添加 Live2D 桌宠',false);
  lb.onclick=function(){
    var src=lsel.value;
    var nm=(lsel.options[lsel.selectedIndex]&&lsel.options[lsel.selectedIndex].textContent)||'Live2D';
    var p={id:uid(),name:'L2D·'+nm,gid:GROUPS[0].id,kw:'',xr:.5,pyr:.6,wr:.26,axis:'free',vis:1,mute:1,walk:0,spd:.06,
      kind:'l2d',src:'live2d/pet.html?m='+encodeURIComponent(src)};
    PETS.push(p);save();renderPets();renderPanel();toast2('已添加 Live2D 桌宠');
  };
  l2d.appendChild(lb);box.appendChild(l2d);

  var psub=document.createElement('div');psub.className='pet-sub';
  psub.textContent='桌宠列表（可多只同时显示）';box.appendChild(psub);
  if(!PETS.length){
    var e=document.createElement('div');e.className='pet-empty';
    e.textContent='还没有桌宠，点上方上传按钮添加透明通道视频吧';box.appendChild(e);
    return;
  }
  PETS.forEach(function(p){
    var it=document.createElement('div');it.className='pet-item';box.appendChild(it);

    var r1=row(it);
    var nm=document.createElement('b');nm.textContent=p.name||'桌宠';r1.appendChild(nm);
    var bv=mkBtn(p.vis?'显示中':'已隐藏',!!p.vis);
    bv.onclick=function(){p.vis=p.vis?0:1;apply(p);save();renderPanel()};r1.appendChild(bv);
    var bm=mkBtn(p.mute?'静音':'有声',!!p.mute);
    bm.onclick=function(){p.mute=p.mute?0:1;apply(p);save();renderPanel()};r1.appendChild(bm);
    var bw=mkBtn('行走',!!p.walk);
    bw.onclick=function(){p.walk=p.walk?0:1;save();renderPanel()};r1.appendChild(bw);
    var bd=mkBtn('删除',false);
    bd.onclick=function(){
      if(!confirm('删除桌宠「'+p.name+'」？'))return;
      try{if(NODES[p.id])NODES[p.id].remove()}catch(e){}
      try{if(URLS[p.id])URL.revokeObjectURL(URLS[p.id])}catch(e){}
      delete NODES[p.id];delete URLS[p.id];delBlob(p.id);
      PETS=PETS.filter(function(x){return x!==p});
      save();renderPanel();toast2('已删除');
    };
    r1.appendChild(bd);

    var r2=row(it);r2.appendChild(document.createTextNode('名称'));
    var ni=document.createElement('input');ni.type='text';ni.value=p.name||'';
    ni.oninput=function(){p.name=this.value.slice(0,16);save()};r2.appendChild(ni);

    var r3=row(it);r3.appendChild(document.createTextNode('分组'));
    var sel=document.createElement('select');
    GROUPS.forEach(function(g){var o=document.createElement('option');o.value=g.id;o.textContent=g.name;
      if(g.id===p.gid)o.selected=true;sel.appendChild(o)});
    sel.onchange=function(){p.gid=this.value;save()};r3.appendChild(sel);
    r3.appendChild(document.createTextNode('关键词'));
    var ki=document.createElement('input');ki.type='text';ki.value=p.kw||'';ki.placeholder='词1,词2';
    ki.oninput=function(){p.kw=this.value.slice(0,40);save()};r3.appendChild(ki);

    var r4=row(it);r4.appendChild(document.createTextNode('移动'));
    var ax=document.createElement('select');
    [['free','不锁定（全屏跟手）'],['lockY','固定垂直高度（只左右）'],['lockX','固定水平位置（只上下）']].forEach(function(o){
      var op=document.createElement('option');op.value=o[0];op.textContent=o[1];
      if(p.axis===o[0])op.selected=true;ax.appendChild(op)});
    ax.onchange=function(){p.axis=this.value;apply(p);save()};r4.appendChild(ax);

    var r5=row(it);r5.appendChild(document.createTextNode('大小'));
    r5.appendChild(mkRange(.06,.75,.01,p.wr||.22,function(v){p.wr=v;apply(p);save()}));
    r5.appendChild(mkNum(6,75,Math.round((p.wr||.22)*100),function(v){p.wr=clamp(v/100,.06,.75);apply(p);save()}));

    var r6=row(it);r6.appendChild(document.createTextNode('水平'));
    r6.appendChild(mkRange(0,100,.5,Math.round((p.xr||0)*100),function(v){p.xr=v/100;apply(p);save()}));
    r6.appendChild(mkNum(0,100,Math.round((p.xr||0)*100),function(v){p.xr=clamp(v/100,0,1);apply(p);save()}));

    var r7=row(it);r7.appendChild(document.createTextNode('垂直'));
    r7.appendChild(mkRange(0,100,.5,Math.round((p.pyr==null?0.72:p.pyr)*100),function(v){p.pyr=v/100;apply(p);save()}));
    r7.appendChild(mkNum(0,100,Math.round((p.pyr==null?0.72:p.pyr)*100),function(v){p.pyr=clamp(v/100,0,1);apply(p);save()}));

    /* 直角坐标系：X 横向像素 / Y 纵向像素 / Z 深度缩放，可直接输入任意值 */
    var r8=row(it);r8.appendChild(document.createTextNode('坐标'));
    var cx=document.createElement('span');cx.textContent='X';r8.appendChild(cx);
    r8.appendChild(mkNum(0,4000,Math.round((p.xr||0)*window.innerWidth),function(v){
      p.xr=clamp(v/Math.max(1,window.innerWidth),0,1);apply(p);save()}));
    var cy=document.createElement('span');cy.textContent='Y';r8.appendChild(cy);
    r8.appendChild(mkNum(0,4000,Math.round((p.pyr==null?0.72:p.pyr)*window.innerHeight),function(v){
      p.pyr=clamp(v/Math.max(1,window.innerHeight),0,1);apply(p);save()}));
    var cz=document.createElement('span');cz.textContent='Z';r8.appendChild(cz);
    r8.appendChild(mkNum(0.2,3,.1,Math.round((p.z||1)*100)/100,function(v){
      p.z=clamp(v,.2,3);apply(p);save()}));
  });
}

/* ===== 面板开关 / 上传 ===== */
function openPanel(){renderPanel();var p=$('petPanel');if(p)p.classList.add('on')}
function closePanel(){var p=$('petPanel');if(p)p.classList.remove('on')}
var pb=$('petBtn');if(pb)pb.onclick=openPanel;
var pc=$('petClose');if(pc)pc.onclick=closePanel;
var pn=$('petPanel');if(pn)pn.onclick=function(e){if(e.target===pn)closePanel()};
var pf=$('petFile');if(pf)pf.onchange=function(){
  var f=this.files&&this.files[0];if(!f)return;
  var id=uid(),name=(f.name||'桌宠').replace(/\.[^.]+$/,'').slice(0,14)||'桌宠';
  var p={id:id,name:name,gid:GROUPS[0].id,kw:'',xr:.5,pyr:.72,wr:.22,axis:'free',vis:1,mute:1,walk:0,spd:.06};
  putBlob(id,f,function(){
    PETS.push(p);save();renderPets();renderPanel();toast2('已添加桌宠：'+name);
  });
  this.value='';
};
window.addEventListener('resize',function(){renderPets()});
/* 小窗展开/收起会改变可用高度，桌宠重新贴边 */
try{new MutationObserver(function(){renderPets()}).observe(document.body,{attributes:true,attributeFilter:['class']})}catch(e){}
load();renderPets();
})();
