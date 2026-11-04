/* v8.0.7：全站强制单一黑夜紫罗兰模式
   清除历史白日/黄昏 class，并强制成人内容全部可见；
   用 MutationObserver 防止旧页面脚本再次加回 sl-day / mode-daily。 */
(function(){
  function force(){
    var d=document.documentElement;
    if(d){
      d.classList.remove('sl-day','sl-dusk','day');
      d.classList.add('sl-night');
    }
    if(document.body){
      document.body.classList.remove('mode-daily','mode-dusk','day');
      document.body.classList.add('mode-night','mode-adult');
    }
  }
  try{
    localStorage.setItem('sl_cycle','1');
    localStorage.setItem('sl_site_mode','"adult"');
  }catch(e){}
  force();
  try{
    new MutationObserver(force).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  }catch(e){}
  document.addEventListener('DOMContentLoaded',function(){
    force();
    try{
      new MutationObserver(force).observe(document.body,{attributes:true,attributeFilter:['class']});
    }catch(e){}
    setTimeout(force,300);
  });
})();
