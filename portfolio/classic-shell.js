/* Desktop menus. Operations affect only the browser-based desktop. */
(() => {
  'use strict';
  const A=window.TimApps, W=window.TimWindows, D=window.TimDesktop;
  function launch(id) {
    if(A.open(id))return;
    if(id==='projects')W.show('projects');
    else document.querySelector(`[data-dialog="${id}"]`)?.click();
  }
  const icon=id=>`<svg aria-hidden="true"><use href="portfolio/icons.svg#${id}"/></svg>`;
  const appButton=(id,label,glyph)=>`<button class="program-icon" data-app-open="${id}">${icon(glyph)}<span>${label}</span></button>`;
  const categories={accessories:['notepad','calculator','paint'],games:['minesweeper','pinball'],settings:['versions','datetime','volume','system']};
  for(const [id,label] of [['accessories','Accessories'],['games','Games'],['computer','My Computer'],['settings','Control Panel']]) {
    A.register(id,label,id==='computer'?'computer':'folder',(body)=>{
      const ids=id==='computer'?['accessories','games','settings','recycle']:categories[id];
      const list=A.list();
      body.innerHTML='<div class="explorer-address">'+A.safe(id==='computer'?'My Computer':'C:\\Windows\\'+label)+'</div><div class="program-grid">'+ids.map(key=>{const a=list.find(x=>x.id===key);return a?appButton(key,a.label,a.icon):'';}).join('')+'</div><p class="accessory-note">'+(id==='computer'?'This computer is your browser desktop. Your real files and system are separate.':'Open a program to launch it in its own window.')+'</p>';
    });
  }
  A.register('system','System Properties','computer',(body)=>{
    body.innerHTML='<div class="accessory-pad"><div class="classic-tabs"><button class="selected">General</button></div><h2>timBuilds Desktop</h2><p>A <strong data-os-name></strong> environment, running entirely in your web browser.</p><dl class="system-specs"><dt>System</dt><dd><strong data-os-name></strong> · <span data-os-edition></span></dd><dt>Display</dt><dd>'+innerWidth+' × '+innerHeight+' CSS pixels</dd><dt>Programs</dt><dd>'+A.list().length+' web accessories and folders</dd><dt>Personal files</dt><dd>Notes stored locally in this browser</dd><dt>Owner folder</dt><dd>Encrypted; independent of the games</dd></dl><p>No Windows installation, account or device access is required.</p><a href="portfolio/THIRD-PARTY-NOTICES.md" target="_blank" rel="noopener">Credits and asset sources ↗</a></div>';
    window.TimVersion.sync();
  });
  A.register('run','Run','computer',(body)=>{
    const commands={browser:'browser',iexplore:'browser',taskmgr:'taskmanager',sol:'solitaire',solitaire:'solitaire',reversi:'reversi',minigolf:'minigolf',kolf:'minigolf',privacy:'document-privacy',winver:'versions',themes:'versions',notepad:'notepad',calc:'calculator',calculator:'calculator',mspaint:'paint',paint:'paint',winmine:'minesweeper',minesweeper:'minesweeper',pinball:'pinball',control:'settings',timedate:'datetime',explorer:'computer',projects:'projects',help:'help'};
    body.innerHTML='<div class="accessory-pad"><p>Type the name of a program to open it.</p><form id="run-form"><label for="run-command">Open:</label><input id="run-command" autocomplete="off" spellcheck="false" placeholder="notepad" maxlength="80"><p class="accessory-note">notepad · calc · mspaint · winmine · pinball · control</p><button class="bevel-button">OK</button></form><p role="status" id="run-status"></p></div>';
    body.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();const value=body.querySelector('input').value.trim().toLowerCase().replace(/\.exe$/,'');
      if(commands[value]){W.close('run');launch(commands[value]);}
      else body.querySelector('#run-status').textContent='Cannot find that program. Use one of the program names above.';
    });body.querySelector('input').focus({preventScroll:true});
  });
  let audio=null;const savedSound=A.read('timbuilds.sound.v1',null),sound={enabled:savedSound?.enabled===true,volume:Number.isFinite(savedSound?.volume)?Math.max(0,Math.min(100,savedSound.volume)):25};
  function beep(){if(!sound.enabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=660;gain.gain.setValueAtTime(Math.max(0,Math.min(100,sound.volume))/500,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.18);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.2);}catch{}}
  A.register('volume','Volume Control','speaker',(body)=>{
    body.innerHTML='<div class="accessory-pad volume-app"><h2>Desktop sounds</h2><label><input type="checkbox" id="desktop-mute"> Enable desktop sounds</label><label>Volume <input type="range" min="0" max="100" id="desktop-volume"></label><button class="bevel-button" id="test-sound">Test sound</button><p class="accessory-note">Optional, locally synthesised sound. Pinball has its own sound control.</p></div>';
    const enabled=body.querySelector('#desktop-mute'),volume=body.querySelector('#desktop-volume');enabled.checked=!!sound.enabled;volume.value=sound.volume;
    function apply(){sound.enabled=enabled.checked;sound.volume=Number(volume.value);A.save('timbuilds.sound.v1',sound);}
    enabled.addEventListener('change',apply);volume.addEventListener('input',apply);body.querySelector('#test-sound').addEventListener('click',beep);
  });
  const menu=document.createElement('div');menu.id='desktop-context-menu';menu.className='classic-menu window';menu.hidden=true;menu.setAttribute('role','menu');document.body.append(menu);
  let menuActions=[],menuFocus=null;
  function closeMenu(restore=false){menu.hidden=true;if(restore&&menuFocus?.isConnected)menuFocus.focus({preventScroll:true});}
  function showMenu(items,x,y,target){menuFocus=target;menuActions=items;menu.replaceChildren();items.forEach((item,i)=>{if(!item){const hr=document.createElement('hr');hr.setAttribute('role','separator');menu.append(hr);return;}const b=document.createElement('button');b.setAttribute('role','menuitem');b.textContent=item.label;b.dataset.menuIndex=i;b.disabled=!!item.disabled;menu.append(b);});menu.hidden=false;menu.style.left='0';menu.style.top='0';const r=menu.getBoundingClientRect();menu.style.left=Math.max(0,Math.min(x,innerWidth-r.width-4))+'px';menu.style.top=Math.max(0,Math.min(y,innerHeight-r.height-4))+'px';menu.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
  menu.addEventListener('click',e=>{const b=e.target.closest('[data-menu-index]');if(!b)return;const item=menuActions[Number(b.dataset.menuIndex)];closeMenu();item?.run?.();});
  menu.addEventListener('keydown',e=>{const items=[...menu.querySelectorAll('button:not(:disabled)')],i=items.indexOf(document.activeElement);if(['ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[n]?.focus();}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu(true);}});
  document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))closeMenu();},true);window.addEventListener('resize',()=>closeMenu());window.addEventListener('blur',()=>closeMenu());
  function contextItems(target){
    const shortcut=target.closest('.desktop-shortcut'),task=target.closest('[data-window-task]'),title=target.closest('[data-window-id] > .titlebar');
    if(shortcut?.dataset.shortcut==='recycle')return [{label:'Open',run:()=>shortcut.click()},null,{label:'Empty Recycle Bin',run:()=>window.TimDesktopActions.warn('empty')}];
    if(shortcut)return [{label:'Open',run:()=>shortcut.click()},null,{label:'Arrange icons on left',run:()=>D.arrange()},{label:'Properties',run:()=>launch(shortcut.dataset.appOpen==='computer'?'system':'display')}];
    if(task||title){const id=task?task.dataset.windowTask:title.parentElement.dataset.windowId,w=W.list().find(x=>x.id===id);return [{label:'Restore',run:()=>{W.show(id);if(w.maximized)W.maximize(id);},disabled:w.state==='open'&&!w.maximized},{label:'Fit to screen',run:()=>W.reset(id)}, {label:'Move',run:()=>{W.show(id);document.querySelector(`[data-window-id="${id}"] > .titlebar`).focus();},disabled:w.maximized},{label:'Size',run:()=>{W.show(id);document.querySelector(`[data-window-id="${id}"] .resize-grip`).focus();},disabled:w.maximized},{label:'Minimise',run:()=>W.minimize(id),disabled:w.state!=='open'},{label:'Maximise',run:()=>{W.show(id);if(!w.maximized)W.maximize(id);},disabled:w.maximized},null,{label:'Close',run:()=>W.close(id)}];}
    if(target.closest('.clock-tray'))return [{label:'Adjust Date/Time…',run:()=>launch('datetime')},{label:'Volume Control',run:()=>launch('volume')}];
    if(target.closest('.taskbar'))return [{label:'Cascade windows',run:()=>W.arrange('cascade')},{label:'Tile windows horizontally',run:()=>W.arrange('horizontal')},{label:'Tile windows vertically',run:()=>W.arrange('vertical')},null,{label:'Show desktop',run:()=>W.showDesktop()},{label:'Restore windows',run:()=>W.restoreDesktop()},null,{label:'Operating system…',run:()=>launch('versions')}];
    if(target.closest('.desktop-dock')||target===document.body)return [{label:'Arrange icons on left',run:()=>D.arrange()},{label:'Refresh',run:()=>{window.dispatchEvent(new Event('resize'));beep();}},null,{label:'New Text Document',run:()=>launch('notepad')},{label:'Run…',run:()=>launch('run')},null,{label:'Operating system…',run:()=>launch('versions')},{label:'Properties',run:()=>launch('display')}];
    return null;
  }
  document.addEventListener('contextmenu',e=>{if(e.shiftKey||e.defaultPrevented||e.target.closest('input,textarea,canvas,dialog[open],.mine-board'))return;const items=contextItems(e.target);if(!items)return;e.preventDefault();showMenu(items,e.clientX,e.clientY,e.target.closest('button,[tabindex]')||document.querySelector('.desktop-dock'));});
  document.addEventListener('keydown',e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){const items=contextItems(e.target);if(items){e.preventDefault();const r=e.target.getBoundingClientRect();showMenu(items,r.left+10,r.bottom,e.target);}}if(e.ctrlKey&&e.key==='Escape'){e.preventDefault();document.querySelector('#start-button').click();}if(e.altKey&&e.key==='F6'){e.preventDefault();W.cycle(e.shiftKey?-1:1);}});
  document.addEventListener('click',e=>{if(e.target.closest('.clock-tray'))launch('datetime');const emblem=e.target.closest('[data-window-id] > .titlebar .window-title > svg');if(emblem){const r=emblem.getBoundingClientRect();showMenu(contextItems(emblem),r.left,r.bottom,emblem.closest('.titlebar'));}});
  function menuButton(label,app,glyph){return `<button data-app-open="${app}">${icon(glyph)}<span>${label}</span></button>`;}
  const nav=document.querySelector('#start-menu > nav');
  function renderStart(){nav.innerHTML=window.TimStartMenu();
  window.TimCascades.mount(nav);
    window.TimVersion.sync();
  }
  renderStart();window.addEventListener('timbuilds-version',renderStart);
  const start=document.querySelector('#start-button');start.addEventListener('click',()=>{if(!document.querySelector('#start-menu').hidden){nav.querySelector('button')?.focus({preventScroll:true});}});
  window.TimShell=Object.freeze({launch,closeMenu,beep,showMenu,contextAt:(x,y,target=document.querySelector(".desktop-dock"))=>{const items=contextItems(target);if(items)showMenu(items,x,y,target);}});
})();
