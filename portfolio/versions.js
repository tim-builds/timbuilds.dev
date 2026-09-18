/* Apply the saved environment before first paint. This is preference data, not owner authentication. */
(() => {
  'use strict';
  const freeze=o=>{Object.values(o).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(o);};
  const data=freeze(window.TimEnvironmentData),themes=data.themes,papers=data.wallpapers;
  const key='timbuilds.environment.v1',placements=['fit','fill','center','tile'];
  const find=id=>themes.find(t=>t.id===id),allowed=(p,id)=>p&&(p.kind==='creative'||p.versions?.includes(id));
  let current='2000',persistent=true,migratedDefault=false;const desktops={};
  for(const t of themes)desktops[t.id]={wallpaper:t.wallpaper,placement:t.placement};
  try {
    const raw=JSON.parse(localStorage.getItem(key)||'null');
    if(raw&&typeof raw==='object'){
      if(find(raw.version))current=raw.version;
      for(const t of themes){const saved=raw.desktops?.[t.id];if(saved&&allowed(papers.find(p=>p.id===saved.wallpaper),t.id))desktops[t.id].wallpaper=saved.wallpaper;if(saved&&placements.includes(saved.placement))desktops[t.id].placement=saved.placement;}
      if(raw.defaultsRevision!==2&&desktops['2000'].wallpaper==='win2000-windows-2000'){desktops['2000'].wallpaper='win2000-paradise';migratedDefault=true;}
    } else {
      const old=localStorage.getItem('timbuilds.wallpaper.v1'),placement=localStorage.getItem('timbuilds.wallpaper-placement.v1');
      if(allowed(papers.find(p=>p.id===old),'95'))desktops['95'].wallpaper=old;
      if(placements.includes(placement))desktops['95'].placement=placement;
    }
  } catch { /* Invalid or unavailable storage falls back to Windows 2000. */ }
  function persist(){try{localStorage.setItem(key,JSON.stringify({version:current,desktops,defaultsRevision:2}));persistent=true;}catch{persistent=false;}}
  function apply(){
    const t=find(current),saved=desktops[current],p=papers.find(x=>x.id===saved.wallpaper),root=document.documentElement;
    root.dataset.os=current;root.dataset.family=t.family||"windows";root.dataset.wallpaper=p.id;root.dataset.wallpaperPlacement=saved.placement;root.dataset.wallpaperKind=p.file?'image':p.kind;
    for(const name of ['--wall-color','--wall-image','--wall-size','--wall-position'])root.style.removeProperty(name);
    if(p.file){root.style.setProperty('--wall-image',`url("${new URL("portfolio/wallpapers/"+p.file,document.baseURI).href}")`);root.style.setProperty('--wall-color',t.color);root.style.setProperty('--wall-size',({fit:'contain',fill:'cover',center:'auto',tile:'auto'})[saved.placement]);root.style.setProperty('--wall-position',saved.placement==='tile'?'0 0':'center');}
    else if(p.pattern){root.style.setProperty('--wall-color',p.color);root.style.setProperty('--wall-image',p.pattern);root.style.setProperty('--wall-size',p.size);root.style.setProperty('--wall-position','0 0');}
    else if(p.id==='win2000-blue'){root.style.setProperty('--wall-color','#3a6ea5');root.style.setProperty('--wall-image','none');}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t.color);
  }
  function set(id){if(!find(id)||id===current)return false;current=id;apply();persist();window.dispatchEvent(new CustomEvent('timbuilds-version',{detail:{version:current}}));return true;}
  function wallpaper(id){if(!allowed(papers.find(p=>p.id===id),current))return false;desktops[current].wallpaper=id;apply();persist();window.dispatchEvent(new Event('timbuilds-wallpaper'));return true;}
  function placement(value){if(!placements.includes(value))return false;desktops[current].placement=value;apply();persist();window.dispatchEvent(new Event('timbuilds-wallpaper'));return true;}
  function reset(){desktops[current]={wallpaper:find(current).wallpaper,placement:find(current).placement};apply();persist();window.dispatchEvent(new Event('timbuilds-wallpaper'));}
  function selector(){const button=t=>`<button type="button" data-version="${t.id}" class="version-option" aria-pressed="${t.id===current}"><span class="version-mini" data-preview-os="${t.id}" aria-hidden="true"><i></i><b></b></span><strong>${t.name}</strong><small>${t.id==='2000'?'Default · ':''}${t.edition}</small></button>`;return '<fieldset class="version-selector"><legend>Operating system</legend>'+[['windows','Windows'],['mac','Classic Macintosh'],['linux','Linux desktops']].map(([family,label])=>'<h3 class="version-family-label">'+label+'</h3><div class="version-options">'+themes.filter(t=>(t.family||'windows')===family).map(button).join('')+'</div>').join('')+'</fieldset>';}
  function sync(){
    const t=find(current);document.querySelectorAll('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.version===current)));
    document.querySelectorAll('[data-os-name]').forEach(el=>el.textContent=t.name);
    document.querySelectorAll('[data-os-edition]').forEach(el=>el.textContent=t.edition);
    document.querySelectorAll('[data-os-year]').forEach(el=>el.textContent=t.year);
    document.querySelectorAll('[data-os-short]').forEach(el=>el.textContent=t.short);
    document.querySelectorAll('[data-os-description]').forEach(el=>el.textContent=t.description);
    const brand=document.querySelector('.start-brand');if(brand&&t.family!=="mac"&&t.family!=="linux")brand.innerHTML=`<strong>Windows</strong><span>${t.id==='xp'?'xp':t.short}</span>${t.id==='2000'?'<small>Professional</small>':''}`;
    document.querySelectorAll('.environment-year').forEach(badge=>{badge.title=`${t.name} (${t.year}) — change operating system`;badge.setAttribute('aria-label',`${t.year}, ${t.name} — change operating system`);});
    const label=document.querySelector('#version-storage-status');if(label)label.textContent=persistent?'Your version and its wallpaper choices are remembered separately in this browser.':'Browser storage is unavailable. Your choices apply for this visit.';
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-version]');if(!b)return;set(b.dataset.version);sync();});
  document.addEventListener('DOMContentLoaded',sync);
  window.addEventListener('timbuilds-version',sync);
  window.TimVersion=Object.freeze({themes,current:()=>current,info:()=>find(current),selection:()=>({...desktops[current]}),options:()=>papers.filter(p=>allowed(p,current)),set,wallpaper,placement,reset,selector,sync,storageKey:key});
  apply();if(migratedDefault)persist();
})();
