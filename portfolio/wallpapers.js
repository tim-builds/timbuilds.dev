/* Original CSS wallpapers: no downloads, accounts, or remote image requests. */
(() => {
  'use strict';
  const options=[['teal','Classic teal'],['night','Night shift'],['olive','Olive desk'],['starfield','Deep space'],['synthwave','After-hours arcade'],['checker','Poolside tiles'],['memphis','Saved by the desktop'],['bubbles','Bubble machine'],['clouds','Cloud nine'],['circuit','Circuit board'],['sunset','Desert sunset'],['graphite','Graphite 95']];
  function sync(){
    const value=document.documentElement.dataset.wallpaper;
    document.querySelectorAll('.wallpaper-option').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.wallpaper===value)));
    const monitor=document.querySelector('#wallpaper-monitor');if(monitor)monitor.dataset.wallpaperPreview=value;
    const name=document.querySelector('#wallpaper-name');if(name)name.textContent=options.find(([id])=>id===value)?.[1]||'Classic teal';
  }
  function set(value){if(!options.some(([id])=>id===value))return;document.documentElement.dataset.wallpaper=value;try{localStorage.setItem('timbuilds.wallpaper.v1',value);}catch{}sync();}
  function markup(){return `<div class="project-detail-copy display-properties"><div class="eyebrow">DISPLAY PROPERTIES / BACKGROUND</div><div class="wallpaper-monitor" id="wallpaper-monitor" data-wallpaper-preview="${document.documentElement.dataset.wallpaper}"><div class="mini-window"><span>timBuilds — My Desktop</span><i></i><i></i><i></i></div></div><h2 id="wallpaper-name">Classic teal</h2><div class="wallpaper-options">${options.map(([id,label])=>`<button class="wallpaper-option" data-wallpaper="${id}" aria-pressed="${id===document.documentElement.dataset.wallpaper}"><span class="wallpaper-swatch" data-wallpaper-preview="${id}" aria-hidden="true"></span>${label}</button>`).join('')}</div><div class="detail-actions"><button class="bevel-button" data-action="arrange-icons">Arrange icons on left</button><button class="bevel-button" data-action="reset-window">Reset My Projects</button><button class="bevel-button" data-action="close-dialog">OK</button></div><p class="private-note">Applies immediately. Wallpaper and desktop positions are saved in this browser.</p></div>`;}
  try{set(localStorage.getItem('timbuilds.wallpaper.v1')||'teal');}catch{set('teal');}
  window.TimWallpaper=Object.freeze({options,set,sync,markup});
})();
