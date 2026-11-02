
/* 日间 / 夜间：保留紫罗兰配色，只提升或降低整体亮度 */
(function(){
  var KEY='sl_theme_day';
  var on=false;
  try{ on=localStorage.getItem(KEY)==='1'; }catch(e){}
  function apply(){
    var M=window.SLMODE;
    if(M)M.apply();
    else document.body.classList.toggle('day',on);
    var cord=document.getElementById('lampCord');
    if(cord&&M)cord.classList.toggle('retract', M.cycle()===2);
  }
  apply();
  function rerender(){ try{window.__slRerender&&window.__slRerender()}catch(e){} }
  function toggle(){
    var M=window.SLMODE;
    if(M)M.dragToggle();
    apply();rerender();
  }
  /* v8.4.0：不再点按钮切换，改为下拉右下灯绳 */
  var cord=document.getElementById('lampCord');
  if(cord){
    var dragging=false,startY=0,dy=0,TH=26,BASE=78,MAXPULL=44;
    function toggleIfPulled(){ if(dy>=TH) toggle(); }
    cord.addEventListener('pointerdown',function(e){
      dragging=true;startY=e.clientY;dy=0;
      cord.classList.add('pulling');
      cord.style.height=BASE+'px';
      try{cord.setPointerCapture(e.pointerId)}catch(_){}
      e.preventDefault();
    });
    cord.addEventListener('pointermove',function(e){
      if(!dragging)return;
      dy=Math.max(0,Math.min(MAXPULL,e.clientY-startY));
      /* 顶部固定，只把绳子拉长：绳子始终连着按钮，不会断开 */
      cord.style.height=(BASE+dy)+'px';
      e.preventDefault();
    });
    function end(){
      if(!dragging)return;
      dragging=false;
      var pulled=dy;
      cord.classList.remove('pulling');
      cord.style.height='';
      dy=pulled;
      toggleIfPulled();
    }
    cord.addEventListener('pointerup',end);
    cord.addEventListener('pointercancel',end);
    /* 鼠标/触屏都只响应下拉；禁用按钮本身的点击切换 */
    var btn=document.getElementById('themeToggle');
    if(btn)btn.onclick=function(e){
      e.preventDefault();e.stopPropagation();
      var M=window.SLMODE;if(!M)return;
      M.setDay(!M.day());
      apply();rerender();
    };
  }
})();
