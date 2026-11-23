(function(){
  const paths={home:'M3 11l9-8 9 8M5 10v10h14V10',download:'M12 3v12m0 0l-5-5m5 5l5-5M4 21h16',close:'M6 6l12 12M18 6L6 18',menu:'M4 7h16M4 12h16M4 17h16',image:'M4 5h16v14H4zM8 11l3 3 3-3 4 4',music:'M9 18V5l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z',game:'M7 8h10a4 4 0 014 4v1a3 3 0 01-5 2l-2-2h-2l-2 2a3 3 0 01-5-2v-1a4 4 0 014-4z',book:'M4 5a3 3 0 013-3h13v17H7a3 3 0 00-3 3zM17 2v17'};
  function svg(n){return `<svg class="ov-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.download}"/></svg>`}
  function run(){
    document.querySelectorAll('i.fa,i.fas,i.far,i.fab,span.fa').forEach(function(el){
      if(el.dataset.ov)return;el.dataset.ov='1';const c=el.className;const name=Object.keys(paths).find(k=>c.includes(k))||'menu';el.insertAdjacentHTML('afterbegin',svg(name));el.style.fontSize='0';
    });
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,'');}});
    document.querySelectorAll('a,button').forEach(el=>{if(el.innerText&&el.innerText.includes('下载'))el.setAttribute('href','download.html');});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  new MutationObserver(()=>requestAnimationFrame(run)).observe(document.documentElement,{subtree:true,childList:true});
})();
