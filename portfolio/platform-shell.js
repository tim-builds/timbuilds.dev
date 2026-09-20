/* Global Macintosh menus and the GNOME 2 top panel. All launch existing web apps. */
(() => {
  'use strict';
  const V=window.TimVersion,W=window.TimWindows,S=window.TimShell,taskbar=document.querySelector('.taskbar');
  const start=document.querySelector('#start-button'),tasks=document.querySelector('#task-list');
  const menus=document.createElement('nav');menus.className='mac-menus';menus.setAttribute('aria-label','Macintosh menu bar');
  menus.innerHTML='<button class="finder-label" data-platform-menu="file">Finder</button><button data-platform-menu="file">File</button><button data-platform-menu="view">View</button><button data-platform-menu="special">Special</button>';
  start.after(menus);const apps=document.createElement('button');apps.id='mac-apps-button';apps.textContent='Finder';apps.setAttribute('aria-expanded','false');apps.setAttribute('aria-controls','task-list');taskbar.append(apps);
  const top=document.createElement('nav');top.className='platform-topbar';top.setAttribute('aria-label','GNOME desktop panel');top.innerHTML='<button data-platform-applications>Applications</button><button data-platform-menu="places">Places</button><button data-platform-menu="system">System</button><span class="tray-readout" role="group" aria-label="Local time and desktop era"><button class="platform-clock" data-app-open="datetime" aria-label="Open Date/Time Properties"></button><button class="environment-year" data-app-open="versions" aria-label="Change operating system" title="Change operating system"><span data-os-year></span></button></span>';document.body.append(top);
  const item=(label,id)=>({label,run:()=>S.launch(id)});
  function options(name){const active=W.active();if(name==='file')return [item('New Text Document','notepad'),item('Open My Projects','projects'),item('Open Computer','computer'),null,{label:'Close Window',disabled:!active,run:()=>W.close(active)}];
    if(name==='view')return [{label:'Arrange Icons',run:()=>window.TimDesktop.arrange()},{label:'Show Desktop',run:()=>W.showDesktop()},{label:'Restore Windows',run:()=>W.restoreDesktop()},null,item('Desktop Picture…','display'),item('Operating System…','versions')];
    if(name==='places')return [item('Home Folder','computer'),item('My Projects','projects'),item('Accessories','accessories'),item('Games','games'),item('Trash','recycle')];
    if(name==='system')return [item('Appearance…','display'),item('Operating System…','versions'),item('Control Panel','settings'),item('Date and Time','datetime'),item('Sound','volume'),null,item('About This Computer','system'),item('Shut Down…','shutdown')];
    return [item('About This Computer','system'),item('Control Panels','settings'),item('Operating System…','versions'),item('Date and Time','datetime'),null,item('Shut Down…','shutdown')];
  }
  function closeApps(focus=false){taskbar.classList.remove('mac-apps-open');apps.setAttribute('aria-expanded','false');if(focus)apps.focus({preventScroll:true});}
  function closeStart(){document.querySelector('#start-menu').hidden=true;start.setAttribute('aria-expanded','false');}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-platform-menu]');if(b){closeApps();closeStart();const r=b.getBoundingClientRect();S.showMenu(options(b.dataset.platformMenu),r.left,r.bottom,b);}if(e.target.closest('[data-platform-applications]'))start.click();if(e.target.closest('[data-window-task]'))closeApps();});
  apps.addEventListener('click',()=>{const open=!taskbar.classList.contains('mac-apps-open');closeStart();S.closeMenu();taskbar.classList.toggle('mac-apps-open',open);apps.setAttribute('aria-expanded',String(open));if(open)tasks.querySelector('.task-button:not([hidden])')?.focus({preventScroll:true});});
  tasks.addEventListener('keydown',e=>{if(V.info().family!=='mac'||!taskbar.classList.contains('mac-apps-open'))return;const buttons=[...tasks.querySelectorAll('.task-button:not([hidden])')],i=buttons.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeApps(true);}else if(['ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[n]?.focus();}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#mac-apps-button,#task-list'))closeApps();},true);
  function activeLabel(){const active=W.list().find(w=>w.id===W.active()),label=active?.label||'Finder';apps.textContent=label+' ▾';apps.title='Open applications';menus.querySelector('.finder-label').textContent=label;}
  function clock(){top.querySelector('.platform-clock').textContent=document.querySelector('#clock').textContent;}
  const clockObserver=new MutationObserver(clock);clockObserver.observe(document.querySelector('#clock'),{childList:true,characterData:true,subtree:true});clock();
  function sync(){V.sync();start.setAttribute("aria-label",V.info().family==="mac"?"Macintosh menu":V.info().family==="linux"?"Applications menu":"Start");closeApps();closeStart();S.closeMenu();activeLabel();const brand=document.querySelector('.start-brand');if(V.info().family==='linux')brand.textContent=V.current()==='kde'?'KDE 3.5':'Ubuntu';window.dispatchEvent(new Event('resize'));}
  window.addEventListener('timbuilds-version',sync);window.addEventListener('timbuilds-active-window',activeLabel);sync();
})();
