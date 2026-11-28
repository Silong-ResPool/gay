/* 2026-11-28 · 首页「梦幻紫罗兰」视觉层引导
   其它页面保持原有图标增强逻辑，不改动；仅首页加载新皮肤并修复首页历史问题。 */
(function(){
  var path=location.pathname.replace(/\/index\.html?$/i,'').replace(/\/+$/,'');
  var HOME=(path===''||path==='/gay');
  var DV_CSS='assets/ui/dream-violet.css?v=20261128f';

  var paths={home:'M3 11l9-8 9 8M5 10v10h14V10',download:'M12 3v12m0 0l-5-5m5 5l5-5M4 21h16',close:'M6 6l12 12M18 6L6 18',menu:'M4 7h16M4 12h16M4 17h16',image:'M4 5h16v14H4zM8 11l3 3 3-3 4 4',music:'M9 18V5l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z',game:'M7 8h10a4 4 0 014 4v1a3 3 0 01-5 2l-2-2h-2l-2 2a3 3 0 01-5-2v-1a4 4 0 014-4z',book:'M4 5a3 3 0 013-3h13v17H7a3 3 0 00-3 3zM17 2v17'};
  function svg(n){return '<svg class="ov-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[n]||paths.download)+'"/></svg>'}
  function legacy(){
    document.querySelectorAll('i.fa,i.fas,i.far,i.fab,span.fa').forEach(function(el){
      if(el.dataset.ov)return;el.dataset.ov='1';const c=el.className;const name=Object.keys(paths).find(k=>c.includes(k))||'menu';el.insertAdjacentHTML('afterbegin',svg(name));el.style.fontSize='0';
    });
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,'');}});
    document.querySelectorAll('a,button').forEach(el=>{if(el.innerText&&el.innerText.includes('下载'))el.setAttribute('href','download.html');});
  }

  function addCss(){
    if(document.querySelector('link[data-dv]'))return;
    var l=document.createElement('link');
    l.rel='stylesheet';l.href=DV_CSS;l.setAttribute('data-dv','1');
    (document.body||document.head).appendChild(l);
  }
  function cleanTop(){
    if(!document.body)return;
    for(var i=document.body.childNodes.length-1;i>=0;i--){
      var n=document.body.childNodes[i];
      if(n.nodeType===3&&/unauthorized host|throw new Error/.test(n.nodeValue))document.body.removeChild(n);
    }
  }
  function progress(){
    if(document.getElementById('dvProgress'))return;
    var d=document.createElement('div');d.id='dvProgress';document.body.appendChild(d);
    var tick=function(){
      var h=document.documentElement;
      var max=h.scrollHeight-h.clientHeight;
      var p=max>0?Math.min(1,Math.max(0,h.scrollTop/max)):0;
      d.style.transform='scaleX('+p+')';
    };
    addEventListener('scroll',tick,{passive:true});
    addEventListener('resize',tick,{passive:true});
    tick();
  }
  function home(){
    document.documentElement.classList.add('dv-home');
    addCss();
    cleanTop();
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content','#0d0820');
    progress();
    document.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('#slNavSearch');
      if(t){e.preventDefault();e.stopPropagation();if(window.__SL_TOPSEARCH_OPEN)window.__SL_TOPSEARCH_OPEN();}
    },true);
    var kw=document.getElementById('slTopKw');
    if(kw&&window.innerWidth<=430)kw.setAttribute('placeholder','输入关键词');
    else if(kw&&window.innerWidth<=760)kw.setAttribute('placeholder','输入关键词，搜全网资源');
    setTimeout(cleanTop,800);
  }

  if(HOME){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',home);
    else home();
    return;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',legacy);else legacy();
  new MutationObserver(function(){requestAnimationFrame(legacy)}).observe(document.documentElement,{subtree:true,childList:true});
})();
