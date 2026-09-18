/* Archival Windows 95 Plus! wallpapers plus separately labelled original retro patterns. All assets self-hosted. */
(() => {
  'use strict';
  const options=[['teal','Classic teal'],['night','Night shift'],['olive','Olive desk'],['starfield','Deep space'],['synthwave','After-hours arcade'],['checker','Poolside tiles'],['memphis','Saved by the desktop'],['bubbles','Bubble machine'],['clouds','Cloud nine'],['circuit','Circuit board'],['sunset','Desert sunset'],['graphite','Graphite 95']];
  const originals=[["win95-da","95 Plus! · Dangerous Creatures"],["win95-pc","95 Plus! · Inside Your Computer"],["win95-dv","95 Plus! · Leonardo da Vinci"],["win95-wh","95 Plus! · More Windows"],["win95-my","95 Plus! · Mystery"],["win95-na","95 Plus! · Nature"],["win95-sc","95 Plus! · Science"],["win95-sp","95 Plus! · Sports"],["win95-sx","95 Plus! · The 60s USA"],["win95-mo","95 Plus! · The Golden Era"],["win95-tr","95 Plus! · Travel"],["win95-wi","95 Plus! · Windows 95"]];
  options.unshift(...originals);
  let placement="fit";try{placement=localStorage.getItem("timbuilds.wallpaper-placement.v1")||"fit";}catch{}
  if(!["fit","fill","tile","center"].includes(placement))placement="fit";
  document.documentElement.dataset.wallpaperPlacement=placement;
  function sync(){
    const value=document.documentElement.dataset.wallpaper;
    document.querySelectorAll('.wallpaper-option').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.wallpaper===value)));
    const monitor=document.querySelector('#wallpaper-monitor');if(monitor)monitor.dataset.wallpaperPreview=value;
    const name=document.querySelector('#wallpaper-name');if(name)name.textContent=options.find(([id])=>id===value)?.[1]||'Classic teal';const placementControl=document.querySelector('#wallpaper-placement');if(placementControl)placementControl.value=placement;
  }
  function set(value){if(!options.some(([id])=>id===value))return;document.documentElement.dataset.wallpaper=value;try{localStorage.setItem('timbuilds.wallpaper.v1',value);}catch{}sync();}
  function markup(){return `<div class="project-detail-copy display-properties"><div class="eyebrow">DISPLAY PROPERTIES / BACKGROUND</div><div class="wallpaper-monitor" id="wallpaper-monitor" data-wallpaper-preview="${document.documentElement.dataset.wallpaper}"><div class="mini-window"><span>timBuilds — My Desktop</span><i></i><i></i><i></i></div></div><h2 id="wallpaper-name">Classic teal</h2><label class="wallpaper-placement">Picture display <select id="wallpaper-placement"><option value="fit">Fit (keep whole image)</option><option value="fill">Fill desktop</option><option value="center">Center (original size)</option><option value="tile">Tile (original size)</option></select></label><p class="accessory-note">Windows 95 Plus! originals first; original retro designs below. The archived pictures retain their original resolution, not invented 4K detail.</p><div class="wallpaper-options">${options.map(([id,label])=>`<button class="wallpaper-option" data-wallpaper="${id}" aria-pressed="${id===document.documentElement.dataset.wallpaper}"><span class="wallpaper-swatch" data-wallpaper-preview="${id}" aria-hidden="true"></span>${label}</button>`).join('')}</div><div class="detail-actions"><button class="bevel-button" data-action="arrange-icons">Arrange icons on left</button><button class="bevel-button" data-action="reset-window">Reset My Projects</button><button class="bevel-button" data-action="close-dialog">OK</button></div><p class="private-note">Applies immediately. Wallpaper and desktop positions are saved in this browser.</p></div>`;}
  try{set(localStorage.getItem('timbuilds.wallpaper.v1')||'teal');}catch{set('teal');}
  document.addEventListener("change",event=>{if(event.target.id!=="wallpaper-placement")return;const next=event.target.value;if(!["fit","fill","tile","center"].includes(next))return;placement=next;document.documentElement.dataset.wallpaperPlacement=next;try{localStorage.setItem("timbuilds.wallpaper-placement.v1",next);}catch{}});
  window.TimWallpaper=Object.freeze({options,set,sync,markup});
})();
