/* Early navigation for our information pages; actual Play links use native new tabs. */
(() => {
  'use strict';
  let desktop;
  try{
    if(parent===window||parent.location.origin!==location.origin||!parent.TimBrowser)return;
    desktop=parent;
  }catch{return;}
  document.documentElement.setAttribute('data-website-bridge','true');
  document.addEventListener('click',event=>{
    if(!desktop.TimBrowser.owns(window))return;
    const link=event.target.closest('a[href]');
    desktop.TimBrowser.follow(link,event);
  },true);
})();
