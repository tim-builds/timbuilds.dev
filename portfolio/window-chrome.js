/* Fixed-size vector controls, independent of the visitor's symbol font. */
(() => {
  'use strict';
  const shapes={
    minimize:'<path d="M2 9h8v2H2z"/>',
    maximize:'<path fill-rule="evenodd" d="M1 1h10v10H1zm1 3v6h8V4z"/>',
    restore:'<path fill-rule="evenodd" d="M4 1h7v7H8v3H1V4h3zm1 2v1h3v3h2V3zM2 6v4h5V6z"/>',
    close:'<path d="M2 1 6 5 10 1 11 2 7 6 11 10 10 11 6 7 2 11 1 10 5 6 1 2z"/>',
    grid:'<path d="M1 1h4v4H1zm6 0h4v4H7zM1 7h4v4H1zm6 0h4v4H7z"/>',
    list:'<path d="M1 1h2v2H1zm4 0h6v2H5zM1 5h2v2H1zm4 0h6v2H5zM1 9h2v2H1zm4 0h6v2H5z"/>',
    desktop:'<path fill-rule="evenodd" d="M0 1h12v8H7v1h3v1H2v-1h3V9H0zm1 1v6h10V2z"/>',
    back:'<path d="m5 1 1 1-3 3h8v2H3l3 3-1 1-5-5z"/>',
    forward:'<path d="m7 1 5 5-5 5-1-1 3-3H1V5h8L6 2z"/>',
    up:'<path d="m1 5 5-5 5 5-1 1-3-3v8H5V3L2 6z"/>',
    go:'<path d="M9 1h2v7H4l2 2-1 1-5-4 5-4 1 1-2 2h5z"/>',
    reload:'<path d="M10 1v3A5 5 0 1 0 11 8H9a3 3 0 1 1-1-4H6v2h6V1z"/>',
    home:'<path d="m0 5 6-5 6 5-1 1-1-1v6H7V7H5v4H2V5L1 6z"/>'
  };
  const thin={minimize:'<path d="M1 6h10" fill="none" stroke="currentColor" stroke-width="1"/>',maximize:'<path d="M1.5 1.5h9v9h-9z" fill="none" stroke="currentColor" stroke-width="1"/>',restore:'<path d="M3.5 1.5h7v7M1.5 3.5h7v7h-7z" fill="none" stroke="currentColor" stroke-width="1"/>',close:'<path d="m1.5 1.5 9 9m0-9-9 9" fill="none" stroke="currentColor" stroke-width="1"/>'};
  const svg=kind=>'<svg class="chrome-glyph" viewBox="0 0 12 12" aria-hidden="true" focusable="false">'+(['vista','10','11'].includes(document.documentElement.dataset.os)&&thin[kind]||shapes[kind])+'</svg>';
  function set(button,kind){if(!button||!shapes[kind])return;button.dataset.chromeIcon=kind;button.classList.add('chrome-icon-button');button.innerHTML=svg(kind);}
  function decorate(root){
    const query=s=>[...(root.matches?.(s)?[root]:[]),...root.querySelectorAll(s)];
    for(const button of query('[data-win-control],[data-action="minimize"],[data-action="maximize"],[data-action="close-projects"],.dialog-close,.warning-close')){const k=button.dataset.winControl||button.dataset.action;set(button,k==='close-projects'||button.matches('.dialog-close,.warning-close')?'close':k==='maximize'&&button.closest('.is-maximized')?'restore':k);}
    for(const b of query('.view-button[data-view]'))set(b,b.dataset.view==='grid'?'grid':'list');for(const b of query('#show-desktop-button'))set(b,'desktop');
    for(const b of query('[data-nav],[data-browser-action]'))set(b,b.dataset.nav||b.dataset.browserAction);for(const b of query('.explorer-navigation button[type=submit],.browser-toolbar button[type=submit]'))set(b,'go');
  }
  window.TimChrome=Object.freeze({set,decorate});decorate(document);
  new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&n.tagName!=='svg'&&n.tagName!=='path'&&n.tagName!=='SVG'&&n.tagName!=='PATH')decorate(n);}).observe(document.body,{childList:true,subtree:true});
})();
