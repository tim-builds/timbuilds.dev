/* Era-specific browser shells; all actions use existing local web apps. */
(() => {
 'use strict';
 const V=window.TimVersion,A=window.TimApps,ids=['vista','10','11'];
 const symbols=new Set(['folder','document','notepad','computer','globe','calculator','paint','settings','power','mail','cards','mine','pinball','recycle','clock']);
 const icon=id=>`<svg aria-hidden="true"><use href="portfolio/${symbols.has(id)?'modern-icons':'icons'}.svg?v=19#${id}"/></svg>`;
 const app=(label,id,glyph='folder')=>`<button type="button" data-app-open="${id}">${icon(glyph)}<span>${label}</span></button>`;
 const projects=()=>`<button type="button" data-action="projects">${icon('folder')}<span>My Projects</span></button>`;
 const search=placeholder=>`<form class="modern-search" role="search"><label><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m15 15 6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span class="sr-only">Search desktop apps</span><input type="search" data-start-search placeholder="${placeholder}" autocomplete="off" maxlength="80" aria-controls="modern-search-results"></label></form>`;
 const results=()=>'<div class="modern-search-results" id="modern-search-results" hidden><p data-search-count role="status"></p><div data-search-list></div></div>';
 const all=()=>A.list().sort((a,b)=>a.label.localeCompare(b.label));
 const pinned=()=>projects()+app('Browser','browser','globe')+app('Notepad','notepad','notepad')+app('Paint','paint','paint')+app('Calculator','calculator','calculator')+app('Games','games','folder')+app('Pinball','pinball','pinball')+app('Solitaire','solitaire','cards')+app('Minesweeper','minesweeper','mine')+app('Documents','documents','document')+app('Settings','settings','settings')+app('Appearance','versions','computer');
 function menu(id,group,programs){
  const allPrograms=group(id==='vista'?'All Programs':'All apps','folder',programs);
  if(id==='vista')return `<div class="vista-menu"><div class="vista-columns" data-modern-home><div class="vista-apps">${projects()}${app('Internet Browser','browser','globe')}${app('Notepad','notepad','notepad')}${app('Paint','paint','paint')}${app('Calculator','calculator','calculator')}<hr>${app('Games','games','folder')}${allPrograms}</div><div class="vista-places"><div class="vista-avatar">${icon('computer')}</div><strong>Tim</strong>${app('Documents','documents','document')}${app('Computer','computer','computer')}${app('Games','games','folder')}<hr>${app('Control Panel','settings','settings')}${app('Personalization','versions','computer')}${app('Run…','run','computer')}${app('Shut down','shutdown','power')}</div></div>${results()}${search('Start Search')}</div>`;
  if(id==='10')return `<div class="ten-menu">${search('Search desktop apps')}<div class="ten-layout" data-modern-home><div class="ten-rail">${app('Tim','versions','computer')}${app('Documents','documents','document')}${app('Settings','settings','settings')}${app('Power','shutdown','power')}</div><div class="ten-apps"><h3>Quick access</h3>${projects()}${app('Notepad','notepad','notepad')}${app('Internet Browser','browser','globe')}<h3>Explore</h3>${app('Games','games','folder')}${app('Documents','documents','document')}${app('Calculator','calculator','calculator')}${app('Paint','paint','paint')}${allPrograms}</div><div class="ten-pins"><h3>Create and explore</h3><div class="ten-tiles">${projects()}${app('Browser','browser','globe')}${app('Paint','paint','paint')}${app('Notepad','notepad','notepad')}</div><h3>Play</h3><div class="ten-tiles">${app('Games','games','folder')}${app('Pinball','pinball','pinball')}${app('Solitaire','solitaire','cards')}${app('Minesweeper','minesweeper','mine')}</div></div></div>${results()}</div>`;
  return `<div class="eleven-menu">${search('Search apps, settings, and documents')}<div data-modern-home><div class="eleven-heading"><h3>Pinned</h3>${allPrograms}</div><div class="eleven-pins">${pinned()}</div><div class="eleven-heading"><h3>Recommended</h3><small>From this desktop</small></div><div class="eleven-recommended">${projects()}${app('Documents','documents','document')}${app('Games','games','folder')}${app('Appearance','versions','computer')}</div></div>${results()}<div class="eleven-footer"><span class="modern-user">${icon('computer')}Tim</span>${app('Power','shutdown','power')}</div></div>`;
 }
 function searchApps(input){
  const nav=input.closest('nav'),home=nav.querySelector('[data-modern-home]'),result=nav.querySelector('.modern-search-results');if(!home||!result)return;
  const text=input.value.trim().toLowerCase();home.hidden=!!text;result.hidden=!text;const list=result.querySelector('[data-search-list]');list.replaceChildren();if(!text)return;
  const entries=[{id:'projects',label:'My Projects',icon:'folder'},...all()].filter(a=>a.label.toLowerCase().includes(text)||a.id.toLowerCase().includes(text)).slice(0,12);
  result.querySelector('[data-search-count]').textContent=entries.length?`${entries.length} matching app${entries.length===1?'':'s'}`:'No apps found. Try Games, Notepad, or Appearance.';
  for(const a of entries){const t=document.createElement('template');t.innerHTML=a.id==='projects'?projects():app(A.safe(a.label),A.safe(a.id),a.icon);list.append(t.content);}
 }
 document.addEventListener('input',e=>{if(e.target.matches('[data-start-search]'))searchApps(e.target);});
 document.addEventListener('submit',e=>{if(!e.target.matches('.modern-search'))return;e.preventDefault();e.target.closest('nav').querySelector('[data-search-list] button')?.click();});
 document.addEventListener('keydown',e=>{if(!e.target.matches('[data-start-search]'))return;if(e.key==='Escape'&&e.target.value){e.preventDefault();e.stopImmediatePropagation();e.target.value='';searchApps(e.target);}else if(e.key==='ArrowDown'){e.preventDefault();e.target.closest('nav').querySelector('[data-search-list] button')?.focus();}},true);
 const originals=new WeakMap();let taskGroup=null,scheduled=0,lastOS=null;
 function icons(){
  const modern=ids.includes(V.current());
  for(const use of document.querySelectorAll('.desktop-dock use,.taskbar use,#start-menu use,.window-title use,.program-grid use')){
   const href=use.getAttribute('href');if(!originals.has(use)&&href?.includes('/icons.svg'))originals.set(use,href);const old=originals.get(use);if(!old)continue;
   const key=old.split('#')[1],next=modern&&use.closest('#start-button')?`portfolio/modern-icons.svg?v=19#start-${V.current()}`:modern&&symbols.has(key)?`portfolio/modern-icons.svg?v=19#${key}`:old;
   if(href!==next)use.setAttribute('href',next);
  }
 }
 function center(){if(!taskGroup||V.current()!=='11')return;const bar=document.querySelector('.taskbar'),tray=bar.querySelector('.clock-era');if(!tray)return;const br=bar.getBoundingClientRect(),tr=tray.getBoundingClientRect(),gw=taskGroup.getBoundingClientRect().width;const left=Math.max(4,Math.min((br.width-gw)/2,tr.left-br.left-gw-8));taskGroup.style.left=left+'px';}
 function sync(){
  const start=document.querySelector('#start-button');
  if(V.current()==='11'&&!taskGroup){taskGroup=document.createElement('div');taskGroup.className='win11-launchers';start.before(taskGroup);for(const el of [start,document.querySelector('#show-desktop-button'),document.querySelector('.task-separator'),document.querySelector('#task-list')])taskGroup.append(el);}
  else if(V.current()!=='11'&&taskGroup){for(const child of [...taskGroup.children])taskGroup.before(child);taskGroup.remove();taskGroup=null;}
  icons();if(lastOS!==V.current()){lastOS=V.current();window.TimChrome?.decorate(document);}center();
 }
 function schedule(){cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(()=>{icons();center();});}
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});const size=new ResizeObserver(schedule);size.observe(document.querySelector('.taskbar'));size.observe(document.querySelector('#task-list'));
 window.addEventListener('timbuilds-version',sync);window.addEventListener('timbuilds-active-window',schedule);window.addEventListener('resize',schedule);window.addEventListener('DOMContentLoaded',sync);
 window.TimModernWindows=Object.freeze({menu});sync();
})();
