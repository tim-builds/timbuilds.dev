/* timBuilds: progressive enhancement for an ordinary static portfolio. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const data = JSON.parse($('#project-data').textContent);
  const byId = new Map(data.map(p => [p.id, p]));
  const grid = $('#project-grid');
  const cards = new Map($$('.project-card').map(el => [el.dataset.id, el]));
  const dialog = $('#detail-dialog');
  const body = $('#dialog-body');
  const main = $('#portfolio-window');
  const search = $('#project-search');
  let category = 'All projects';
  let lockedProjects = [];
  let folderRequest = 0;
  let view = 'list';
  let previousFocus = null;
  let dialogKind = null;
  const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // URL state is optional in downloaded previews and restricted browsers.
  function writeURL(method, state, url) { try { history[method](state, '', url); } catch { /* The portfolio still works without history access. */ } }
  const external = (url, text) => `<a class="bevel-button primary-button" href="${safe(url)}"${url.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${safe(text)} <span aria-hidden="true">↗</span>${url.startsWith('https:')?'<span class="sr-only"> (opens in the desktop browser)</span>':''}</a>`;

  function installLocked(projects){
    if(lockedProjects.length)return;lockedProjects=projects;
    for(const p of projects){if(byId.has(p.id))continue;byId.set(p.id,p);const card=document.createElement('article');card.className='project-card locked-project';card.dataset.id=p.id;card.dataset.category='Locked';card.hidden=true;
      card.innerHTML='<div class="card-preview"><img src="portfolio/previews/'+safe(p.preview)+'.svg" width="640" height="340" alt="Illustrated concept for '+safe(p.title)+'" loading="lazy"><span class="preview-label">PRIVATE CATALOGUE</span></div><div class="card-content"><div class="card-category">Locked<span class="file-extension">.project</span></div><h3><button data-project="'+safe(p.id)+'" aria-haspopup="dialog">'+safe(p.title)+'<span aria-hidden="true">↗</span></button></h3><p>'+safe(p.summary)+'</p><div class="card-footer"><span class="project-status">'+safe(p.status)+'</span><button data-project="'+safe(p.id)+'">Details ↗</button></div></div>';cards.set(p.id,card);grid.appendChild(card);
    }
  }
  async function openLocked(){
    const request=++folderRequest;const access=await window.TimLocked.ready;if(request!==folderRequest)return;
    if(access.projects){installLocked(access.projects);category='Locked';search.value='';showProjects();applyFilter();}
    else {
      window.TimBSOD.open('locked');
    }
  }

  function applyFilter() {
    const workspace=$('.workspace'), oldScroll=workspace.scrollTop, oldPage=window.scrollY;
    const query = search.value.trim().toLocaleLowerCase();
    const source=category==='Locked'?lockedProjects:data;
    let ordered = [...source];
    for(const card of cards.values()) card.hidden=true;
    let visible = 0;
    for (const project of ordered) {
      const matchesCategory = category === 'Locked' || category === 'All projects' || project.category === category;
      const searchable = [project.title,project.summary,project.detail,project.category,project.status,...project.stack].join(' ').toLocaleLowerCase();
      const matches = matchesCategory && (!query || searchable.includes(query));
      const card = cards.get(project.id);
      card.hidden = !matches;
      grid.appendChild(card);
      if (matches) visible++;
    }
    $('#empty-state').hidden = visible !== 0;
    $('#results-count').textContent = `${visible} project${visible===1?'':'s'} · ${category==='All projects'?'All folders':category}${query?' · Filtered':''}`;
    $('#window-status').textContent = `${visible} of ${source.length} projects${view==='list'?' · List view':''}`;
    $('#address-text').value = `C:\\Tim\\Projects\\${category}`;
    $('#collection-title').textContent=category==='All projects'?'My Projects':category;
    window.dispatchEvent(new CustomEvent("timbuilds-folder",{detail:category}));
    workspace.scrollTop=oldScroll;if(window.scrollY!==oldPage)window.scrollTo(0,oldPage);
  }
  function setView(next) {
    if(!['grid','list'].includes(next))return false;
    view = next;
    grid.classList.toggle('is-list', next==='list');
    $$('.view-button').forEach(button => {
      button.classList.toggle('is-active',button.dataset.view===next);
      button.setAttribute('aria-pressed',String(button.dataset.view===next));
    });
    applyFilter();
  }
  function setStart(open) {
    $('#start-menu').hidden = !open;
    $('#start-button').setAttribute('aria-expanded',String(open));
  }
  function showProjects(scroll=false) {
    window.TimDesktop.open();setStart(false);
    if(scroll) $('#projects').scrollIntoView({block:'start',behavior:'auto'});
    main.focus({preventScroll:true});
  }
  const setWallpaper=name=>window.TimWallpaper.set(name);
  function openWindow(title, html, glyph='document', kind=null) {
    previousFocus = document.activeElement;
    dialogKind = kind;
    $('#dialog-title').textContent = title;
    $('#dialog-icon use').setAttribute('href',`portfolio/icons.svg#${glyph}`);
    body.innerHTML = html;
    dialog.style.transform = '';
    setStart(false);
    if (!dialog.open) dialog.showModal();
    body.scrollTop=0;
    $('.dialog-close').focus({preventScroll:true});
  }
  function openProject(id, updateURL=true) {
    const p = byId.get(id);
    if (!p) return;
    const statusClass=['Playable','Interactive demo','You are here'].includes(p.status)?' status-public':'';
    openWindow(`${p.title} — Project details`, `<img class="project-detail-preview" src="${safe(p.image||`portfolio/previews/${p.preview}.svg`)}" width="1200" height="700" alt="${safe(p.imageAlt||p.title)}"><p class="sketch-note">${safe(p.imageNote||'Project illustration · not a screenshot')}</p><div class="project-detail-copy"><div class="detail-meta"><span class="eyebrow">${safe(p.category)}</span><span class="project-status${statusClass}"><i aria-hidden="true"></i>${safe(p.status)}</span></div><h2>${safe(p.title)}</h2><p>${safe(p.detail)}</p><div class="tech-tags" aria-label="Project technologies">${p.stack.map(tag=>`<span>${safe(tag)}</span>`).join('')}</div><div class="detail-actions">${p.url?external(p.url,p.cta):external(`mailto:support@timbuilds.dev?subject=${encodeURIComponent(`About ${p.title}`)}`,'Ask me about it')}<button class="text-button" data-action="close-dialog">Back to the projects</button></div>${p.url?'':'<p class="private-note">No public app link yet. Source and working files remain private.</p>'}</div>`,p.icon,'project');
    if (updateURL) writeURL('pushState',{project:id},`#project-${id}`);
  }
  const panels = {
    about: {title:'About Tim', icon:'document', html:`<div class="project-detail-copy"><div class="eyebrow">ABOUT TIM</div><div class="about-layout"><div><p class="about-lede">Hi, I’m Tim.<br>I like making things.</p><p>I’m an independent developer in Ontario, learning by building things people around me can actually use.</p></div><img src="portfolio/desk.svg" width="245" height="180" alt="Pixel-art computer and plant"></div><div class="about-points"><p>Some projects start close to home: a word game and solitaire for my grandma, a piano studio website for my sister. Others start with an itch—like knowing whether there’s a basketball run before heading to the gym.</p><p>I work with AI coding tools, then spend a lot of time on the part people feel: the wording, the interactions, and whether the thing does what it promised.</p><p>This is the whole collection, including the experiments. A prototype is labelled a prototype. There’s always another folder taking shape.</p></div><div class="detail-actions"><button class="bevel-button primary-button" data-dialog="contact">Say hello ↗</button><a class="text-button" href="https://github.com/flushatoilet" target="_blank" rel="noopener noreferrer">GitHub profile ↗<span class="sr-only"> (opens in the desktop browser)</span></a></div></div>`},
    contact: {title:'Say Hello — New message', icon:'mail', html:`<div class="project-detail-copy"><div class="eyebrow">CONTACT</div><h2>Let’s talk.</h2><p>For project questions, feedback or enquiries, email me below.</p><a class="email-address" href="mailto:support@timbuilds.dev?subject=Hello%20Tim">support@timbuilds.dev</a><div class="detail-actions"><a class="bevel-button primary-button" href="mailto:support@timbuilds.dev?subject=Hello%20Tim">Open your email app ↗</a><button class="bevel-button" data-action="copy-email">Copy address</button></div><p class="clipboard-status" id="clipboard-status" role="status" aria-live="polite"></p><p class="private-note">No form submission or account needed. This page does not send a message on your behalf.</p></div>`},
    display: {title:'Display Properties',icon:'palette',html:''},
    github: {title:'GitHub — Source explorer',icon:'code',html:'<div class="project-detail-copy"><div class="eyebrow">GITHUB</div><h2>Source code</h2><p>Explore my public GitHub profile, or look at the source for this desktop.</p><div class="detail-actions"><a class="bevel-button primary-button" href="https://github.com/flushatoilet" target="_blank" rel="noopener noreferrer">Open GitHub profile ↗<span class="sr-only"> (opens in the desktop browser)</span></a><a class="bevel-button" href="https://github.com/tim-builds/timbuilds.dev" target="_blank" rel="noopener noreferrer">Portfolio source ↗<span class="sr-only"> (opens in the desktop browser)</span></a></div><p class="private-note">Websites open in the desktop browser. Sites that prohibit embedding offer an external-tab fallback. Private repositories remain private.</p></div>'},
    help: {title:'Desktop Help', icon:'document', html:`<div class="project-detail-copy"><div class="eyebrow">DESKTOP HELP</div><h2>Using this desktop</h2><ul class="help-list"><li>Double-click desktop icons to open them, or press Enter. On touchscreens, tap once. Hold an icon to move it, or hold empty desktop space to drag a selection rectangle. Drag window title bars to move them and use the lower-right corner to resize. Ordinary swipes inside a window scroll its contents. The small desktop button beside Start hides or restores windows. Drag the empty desktop to select a group; Ctrl-click adds or removes icons. Drag selected icons together; they snap to a grid. Use Alt + arrow keys to move a selected group. Display settings can arrange them on the left again.</li><li>Drag the project title bar to move the window. Drag an edge or corner to resize. Maximise fills the workspace, restore returns to the previous size, and close removes the taskbar item. Double-click My Projects to reopen. Focus the title bar or resize grip and use arrow keys for keyboard control.</li><li>Right-click the desktop, an icon, a taskbar button or a title bar for a context menu. Shift-right-click keeps your browser menu. Click the clock for a calendar; click the underlined year beside it to change operating systems. Start → Operating system (or Display Properties) switches between the eleven Windows, Macintosh and Linux desktops, with a separate wallpaper choice for each. Start → Programs contains classic accessories; Run accepts notepad, calc, mspaint, winmine and pinball. Alt+F6 cycles windows.</li><li>Use the View menu to browse project categories or switch between List and Cards. Locked opens the blue-screen recovery console; dragging My Projects into the Recycle Bin finds the same console. Press Escape or choose Return to desktop to leave without deleting anything. Search works across names, descriptions and technologies.</li><li>Click a project’s name for details. App and game links open their project websites. Play buttons on those websites launch the actual games in a new browser tab. Website projects link to their websites.</li><li>Use <kbd>/</kbd> to jump to search, <kbd>Tab</kbd> to move through controls, and <kbd>Esc</kbd> to close a popup.</li><li>Click a focused window’s taskbar button to minimise it; click again to restore. About, contact, GitHub and Display each have their own window. Open My Projects again from <strong>My Projects</strong> or the <strong>Start</strong> button.</li></ul><p class="private-note">A modern portfolio with eleven desktop environments. Browser accessories are reimplementations. Wallpaper and pinball credits are in System Properties. This is not Microsoft software.</p><div class="detail-actions"><button class="bevel-button" data-action="close-dialog">Got it</button></div></div>`},
  };
  function openPanel(name) {
    if(!panels[name])return;
    if(dialog.open)closeDialog();
    const panel=panels[name],labels={about:'About Tim',contact:'Say Hello',display:'Display',github:'GitHub',help:'Help'};
    window.TimWindows.openPanel({id:name,title:panel.title,label:labels[name],icon:panel.icon,html:name==='display'?window.TimWallpaper.markup():panel.html});
    if(name==='display')window.TimWallpaper.sync();
  }
  function closeSurface(el){const app=el.closest('.app-window');if(app)window.TimWindows.close(app.dataset.windowId);else closeDialog();}
  function closeDialog(clearHash=true) {
    const wasProject=dialogKind==='project';
    dialog.close();dialog.style.transform='';dialogKind=null;
    if(wasProject && clearHash && location.hash.startsWith('#project-')) writeURL('replaceState',null,location.pathname+location.search+'#projects');
    if(previousFocus && previousFocus.isConnected && !previousFocus.closest('[hidden]')) previousFocus.focus({preventScroll:true});
    else if(!main.hidden) main.focus({preventScroll:true});
  }
  document.addEventListener('click',async event => {
    const el=event.target.closest('button,a');
    if (!el) return;
    if(el.dataset.action!=='locked')folderRequest++;
    if(el.dataset.category){category=el.dataset.category;showProjects();applyFilter();el.focus({preventScroll:true});}
    else if(el.dataset.view) setView(el.dataset.view);
    else if(el.dataset.project) openProject(el.dataset.project);
    else if(el.dataset.dialog) {
      event.preventDefault();
      // Moving between information windows must not leave a stale project URL.
      if(dialogKind==='project' && location.hash.startsWith('#project-')) writeURL('replaceState',null,location.pathname+location.search+'#projects');
      openPanel(el.dataset.dialog);
    }
    else if(el.dataset.wallpaper) setWallpaper(el.dataset.wallpaper);
    else if(el.dataset.action==='projects') showProjects();
    else if(el.dataset.action==='explore-desktop'){window.TimWindows.showDesktop();setStart(true);$('#start-button').focus({preventScroll:true});}
    else if(el.dataset.action==='locked') await openLocked();
    else if(el.dataset.action==='arrange-icons'){window.TimDesktop.arrange();closeSurface(el);}
    else if(el.dataset.action==='reset-window'){window.TimDesktop.resetWindow();closeSurface(el);}
    else if(el.dataset.action==='close-projects')window.TimDesktop.close();
    else if(el.dataset.action==='minimize')window.TimDesktop.minimize();
    else if(el.dataset.action==='maximize')window.TimDesktop.maximize();
    else if(el.dataset.action==='toggle-view')setView(view==='grid'?'list':'grid');
    else if(el.dataset.action==='reset-filters'){category='All projects';search.value='';applyFilter();search.focus({preventScroll:true});}
    else if(el.dataset.action==='close-dialog')closeSurface(el);
    else if(el.dataset.action==='copy-email'){
      const status=$('#clipboard-status');
      try {if(!navigator.clipboard)throw new Error('clipboard unavailable');await navigator.clipboard.writeText('support@timbuilds.dev');status.textContent='Address copied. ';}
      catch{status.textContent='Copy is unavailable here. Select the address above, or open your email app.';}
    }
  });
  search.addEventListener('input',applyFilter);
  $('#start-button').addEventListener('click',()=>setStart($('#start-menu').hidden));
  document.addEventListener('click',event=>{if(!event.target.closest('#start-menu,#start-button,[data-action=explore-desktop]'))setStart(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !$('#start-menu').hidden){setStart(false);$('#start-button').focus();}
    if(event.key==='/' && !dialog.open && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,select,[contenteditable="true"]')){event.preventDefault();showProjects(true);search.focus();}
  });
  $('.dialog-close').addEventListener('click',()=>closeDialog());
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
  let backdropStart=false;
  dialog.addEventListener('pointerdown',event=>{const r=dialog.getBoundingClientRect();backdropStart=event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom);});
  dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(backdropStart&&event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeDialog();backdropStart=false;});
  // Optional desktop dragging: bounded to keep the close control on screen.
  let drag=null;
  const bar=$('.dialog-titlebar');
  bar.addEventListener('pointerdown',event=>{
    if(event.target.closest('button')||event.button!==0||window.innerWidth<601)return;
    const r=dialog.getBoundingClientRect();
    const match=dialog.style.transform.match(/translate\(([-.\d]+)px, ([-.\d]+)px\)/);
    drag={x:event.clientX,y:event.clientY,tx:match?Number(match[1]):0,ty:match?Number(match[2]):0,r};
    bar.setPointerCapture(event.pointerId);
  });
  bar.addEventListener('pointermove',event=>{
    if(!drag)return;
    const dx=Math.max(-drag.r.left+8,Math.min(window.innerWidth-drag.r.right-8,event.clientX-drag.x));
    const dy=Math.max(-drag.r.top+8,Math.min(window.innerHeight-drag.r.bottom-8,event.clientY-drag.y));
    dialog.style.transform=`translate(${drag.tx+dx}px, ${drag.ty+dy}px)`;
  });
  const endDrag=()=>{drag=null;};bar.addEventListener('pointerup',endDrag);bar.addEventListener('pointercancel',endDrag);
  window.addEventListener('resize',()=>{dialog.style.transform='';});
  function syncURL(){const id=location.hash.startsWith('#project-')?location.hash.slice(9):null;if(id&&byId.has(id))openProject(id,false);else if(dialog.open&&dialogKind==='project')closeDialog(false);}
  window.addEventListener('popstate',syncURL);
  window.addEventListener('hashchange',syncURL);
  function updateClock(){const now=new Date();$('#clock').textContent=(now.getHours()%12||12)+':'+String(now.getMinutes()).padStart(2,'0')+' '+(now.getHours()<12?'AM':'PM');$('#clock').dateTime=now.toISOString();$('#clock').title=now.toLocaleDateString([],{weekday:'long',year:'numeric',month:'long',day:'numeric'});$('#year').textContent=String(now.getFullYear());}
  window.TimCatalogue=Object.freeze({setView,view:()=>view,browse(name){if(name==='Locked')return openLocked();if(!['All projects','Apps','Games','Websites','Tools','Experiments'].includes(name))return false;category=name;search.value='';showProjects();applyFilter();return true;}});
  window.addEventListener('timbuilds-session-reset',()=>{category='All projects';search.value='';view='list';grid.classList.add('is-list');applyFilter();$('.workspace').scrollTop=0;});
  document.querySelector('#show-desktop-button').addEventListener('click',()=>{if(window.TimWindows.list().some(w=>w.state==='open'))window.TimWindows.showDesktop();else if(window.TimWindows.list().some(w=>w.state==='minimized'))window.TimWindows.restoreDesktop();else showProjects();});
  updateClock();setInterval(updateClock,30000);syncURL();
  window.TimLocked.ready.then(access=>{
    if(access.projects){installLocked(access.projects);if(access.enrolled){document.title=access.persistent?'Owner browser ready — timBuilds':'Owner browser needs storage — timBuilds';openLocked();openWindow('Owner browser ready','<div class="project-detail-copy"><h2>Your locked folder is ready.</h2><p>'+(access.persistent?'This browser will recognise its saved key automatically next time.':'This browser could not save its key. Access lasts for this visit only; reopen the local owner shortcut next time.')+'</p><p class="private-note">This trusts this browser profile, not a hardware fingerprint. Keep your device and browser secure.</p><button class="bevel-button" data-action="close-dialog">Open my folder</button></div>','lock','owner-ready');}else syncURL();}
    else if(access.enrollmentFailed)openWindow('Owner setup did not finish','<div class="project-detail-copy"><h2>Still locked.</h2><p>The private key could not open this catalogue. No access was granted. Reopen the local owner setup shortcut after checking that this site has finished deploying.</p></div>','lock','owner-error');
  });
})();
