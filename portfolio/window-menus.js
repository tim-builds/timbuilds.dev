/* Window-local application menus. */
(() => {
  'use strict';
  const W = window.TimWindows;
  const A = window.TimApps;
  const menu = document.createElement('div');
  menu.className = 'window os-command-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'menu');
  document.body.append(menu);
  let owner = null, invoker = null, previous = null;
  let actions = [], selectedProject = null;
  const q = selector => owner?.querySelector(selector);
  const click = selector => () => q(selector)?.click();
  const item = (label, run, disabled=false) => ({label, run, disabled});
  function closeMenu(restore=false) {
    menu.hidden=true; invoker?.setAttribute('aria-expanded','false');
    if(restore) invoker?.focus({preventScroll:true});
  }
  function notice(message) {
    W.openPanel({id:'command-notice',title:'Desktop',label:'Desktop message',icon:'document',html:'<div class="accessory-pad"><p>'+A.safe(message)+'</p><button class="bevel-button" data-action="close-dialog">OK</button></div>'});
  }
  const editor = () => previous?.matches('input,textarea') && owner?.contains(previous) ? previous : q('textarea,.explorer-path,.browser-url,input[type=search]');
  function selectAll() {
    const element=editor();
    if(element){element.focus();element.select();return;}
    const text=q('.document-text,.workspace,.program-grid,.app-window-body');
    if(text){const range=document.createRange();range.selectNodeContents(text);getSelection().removeAllRanges();getSelection().addRange(range);}
  }
  async function copy() {
    const element=editor();
    const text=element ? element.value.slice(element.selectionStart||0,element.selectionEnd||0)||element.value : q('.document-text')?.textContent || getSelection().toString();
    try { await navigator.clipboard.writeText(text||''); notice('Copied to clipboard.'); }
    catch { notice('Clipboard access was blocked. Select the text and use your browser’s Copy command.'); }
  }
  function commands(name) {
    const id=owner.dataset.windowId, projects=id==='projects', note=id==='notepad', paint=id==='paint';
    const named=label=>()=>[...owner.querySelectorAll('button')].find(b=>b.textContent===label)?.click();
    if(name==='Favourites')return [['openHoops','/openhoops/'],['Studio Siomai','https://studio-siomai.vercel.app/'],['Letters with Lola','/projects/letters-with-lola/'],['Grit Athletics','https://grit-athletics.pages.dev/']].map(([label,url])=>item(label,()=>window.TimBrowser.open(url)));
    if(name==='View'&&id==='browser')return [item('Back',click('[data-browser-action=back]'),q('[data-browser-action=back]').disabled),item('Forward',click('[data-browser-action=forward]'),q('[data-browser-action=forward]').disabled),item('Reload',click('[data-browser-action=reload]')),item('Home',click('[data-browser-action=home]')),null,item('Maximise / Restore',()=>W.maximize(id)),item('Fit window to screen',()=>W.reset(id))];
    if(name==='File') return [
      ...(id==='browser'?[item('Open location…',()=>q('.browser-url').focus())]:[]),
      ...(note?[item('New',click('[data-command=new]')),item('Open…',click('[data-command=open]')),item('Save as text…',click('[data-command=save]'))]:[]),
      ...(paint?[item('New drawing',named('Clear')),item('Save PNG…',named('Save PNG'))]:[]),
      ...(q('[data-doc-save]')?[item('Save as text…',click('[data-doc-save]'))]:[]),
      ...(projects?[item('Open selected project',()=>q('[data-id="'+selectedProject+'"] [data-project]')?.click(),!selectedProject),item('Open location…',()=>q('.explorer-path').focus())]:[]),
      item('New browser',()=>window.TimBrowser?.open('about:home')),null,item('Close',()=>W.close(id))
    ];
    if(name==='Edit') return [
      ...(paint?[item('Undo',named('Undo')),item('Redo',named('Redo'))]:[]),
      item('Select all',selectAll),item('Copy',copy),
      ...(note?[item('Word wrap',click('[data-command=wrap]')),item('Recycle note',click('[data-command=recycle]'))]:[]),
      ...(projects?[item('Find a project…',()=>q('#project-search').focus()),item('Clear search',()=>{const el=q('#project-search');el.value='';el.dispatchEvent(new Event('input'));})]:[])
    ];
    if(name==='View') return [
      ...(projects?[item('Cards',click('[data-view=grid]')),item('Details',click('[data-view=list]')),null,...['All projects','Apps','Games','Websites','Tools','Experiments','Locked'].map(c=>item(c,()=>window.TimCatalogue.browse(c)))]:[]),
      ...(q('.explorer-navigation')?[item('Refresh folder',()=>window.TimExplorer.refresh(owner))]:[]),
      null,item('Maximise / Restore',()=>W.maximize(id)),item('Fit window to screen',()=>W.reset(id)),item('Minimise',()=>W.minimize(id))
    ];
    if(name==='Tools') return [item('Task Manager',()=>A.open('taskmanager')),item('Run…',()=>A.open('run')),item('Display settings',()=>document.querySelector('[data-dialog=display]').click())];
    return [item('Desktop help',()=>document.querySelector('[data-dialog=help]').click()),item('About this desktop',()=>A.open('system'))];
  }
  function openMenu(button) {
    closeMenu(); invoker=button; owner=button.closest('[data-window-id]'); actions=commands(button.dataset.windowMenu);
    button.setAttribute('aria-expanded','true');menu.replaceChildren();
    actions.forEach((action,index)=>{
      if(!action){menu.append(document.createElement('hr'));return;}
      const b=document.createElement('button');b.setAttribute('role','menuitem');b.textContent=action.label;b.disabled=action.disabled;b.dataset.menuAction=index;menu.append(b);
    });
    const rect=button.getBoundingClientRect();menu.hidden=false;
    menu.style.left=Math.max(4,Math.min(rect.left,document.documentElement.clientWidth-menu.offsetWidth-4))+'px';
    menu.style.top=Math.max(W.workTop(),Math.min(rect.bottom,W.workBottom()-menu.offsetHeight-4))+'px';
    menu.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  }
  function install() {
    for(const win of document.querySelectorAll('[data-window-id]')) {
      if(win.querySelector(':scope > .application-menus') || ['taskmanager','naughty','command-notice','shutdown','locked'].includes(win.dataset.windowId))continue;
      const nav=win.querySelector(':scope > .window-menubar')||document.createElement('nav');nav.className='window-menubar application-menus';nav.setAttribute('aria-label','Application menus');nav.replaceChildren();
      for(const name of (win.dataset.windowId==='browser'?['File','Edit','View','Favourites','Tools','Help']:['File','Edit','View','Tools','Help'])) {const b=document.createElement('button');b.dataset.windowMenu=name;b.textContent=name;b.setAttribute('aria-haspopup','menu');b.setAttribute('aria-expanded','false');nav.append(b);}
      win.querySelector(':scope > .titlebar').after(nav);
    }
  }
  document.addEventListener('pointerdown',event=>{if(event.target.closest('[data-window-menu]'))previous=document.activeElement;else if(!menu.contains(event.target))closeMenu();},true);
  document.addEventListener('click',event=>{const button=event.target.closest('[data-window-menu]');if(button){if(invoker===button&&!menu.hidden)closeMenu();else openMenu(button);}const action=event.target.closest('[data-menu-action]');if(action){const run=actions[Number(action.dataset.menuAction)]?.run;closeMenu();run?.();}const card=event.target.closest('.project-card');if(card){selectedProject=card.dataset.id;document.querySelectorAll('.project-card').forEach(c=>c.classList.toggle('selected-project',c===card));}});
  menu.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu(true);return;}
    const buttons=[...menu.querySelectorAll('button:not(:disabled)')];const index=buttons.indexOf(document.activeElement);
    if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();}
    if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const siblings=[...invoker.parentElement.children],i=siblings.indexOf(invoker);openMenu(siblings[(i+(event.key==='ArrowRight'?1:-1)+siblings.length)%siblings.length]);}
  });
  document.addEventListener('keydown',event=>{if(event.target.matches('[data-window-menu]')&&['ArrowDown','Enter',' '].includes(event.key)){event.preventDefault();openMenu(event.target);}});
  window.addEventListener('resize',()=>closeMenu());window.addEventListener('timbuilds-version',()=>closeMenu());
  const observer=new MutationObserver(install);observer.observe(document.body,{childList:true});install();
  window.TimWindowMenus=Object.freeze({close:closeMenu,install});
})();
