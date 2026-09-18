/* Small non-modal desktop window manager. Geometry is local preference data only. */
(() => {
  'use strict';
  const registry=new Map(), taskbar=document.querySelector('.taskbar');
  const taskList=document.querySelector('#task-list'), compact=()=>innerWidth<=820;
  const clamp=(n,a,b)=>Math.max(a,Math.min(Math.max(a,b),n));
  const availableHeight=()=>Math.max(160,innerHeight-taskbar.getBoundingClientRect().height);
  const valid=r=>r&&['x','y','w','h'].every(k=>typeof r[k]==='number'&&Number.isFinite(r[k]));
  let saved={}, order=[], active=null, drag=null;
  try{saved=JSON.parse(localStorage.getItem('timbuilds.windows.v3')||'{}')||{};}catch{}
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function defaults(id){
    const i=registry.size;
    const sizes={calculator:[350,460],datetime:[560,450],minesweeper:[380,465],notepad:[670,500],paint:[820,640],pinball:[790,760],run:[440,280],volume:[350,350],shutdown:[440,370],system:[490,440],computer:[570,430],accessories:[470,330],games:[420,330],settings:[540,360],recycle:[650,460],screensaver:[460,380]};
    const size=sizes[id]||[660,id==='locked'?800:660];
    return id==='projects'?{x:innerWidth<1100?216:252,y:24,w:Math.min(1200,innerWidth-(innerWidth<1100?240:280)),h:availableHeight()-48}:{x:180+i*26,y:45+i*23,w:size[0],h:Math.min(size[1],availableHeight()-60)};
  }
  function bound(r,w){const width=clamp(r.w,Math.min(w.tiled?120:w.main?540:340,innerWidth),innerWidth),height=clamp(r.h,Math.min(w.tiled?50:250,availableHeight()),availableHeight());return {x:clamp(r.x,0,innerWidth-width),y:clamp(r.y,0,availableHeight()-height),w:width,h:height};}
  function persist(){const geometry={};for(const [id,w] of registry)geometry[id]=w.normal||w.rect;try{localStorage.setItem('timbuilds.windows.v3',JSON.stringify(geometry));}catch{}}
  function paint(w){
    const el=w.el;el.classList.toggle('is-maximized',w.maximized);
    if(w.main&&compact()&&!w.maximized){for(const k of ['left','top','width','height'])el.style.removeProperty(k);return;}
    const r=w.maximized?{x:0,y:0,w:innerWidth,h:availableHeight()}:compact()?{x:8,y:16,w:innerWidth-16,h:Math.min(w.rect.h,availableHeight()-24)}:bound(w.rect,w);
    Object.assign(el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  }
  function markActive(id){active=id;for(const [key,w] of registry){const yes=key===id&&w.state==='open';w.el.classList.toggle('is-focused',yes);w.task.classList.toggle('is-active',yes);w.task.setAttribute('aria-pressed',String(yes));}order.forEach((key,i)=>registry.get(key).el.style.zIndex=String(10+i));}
  function focusWindow(id,focus=true){const w=registry.get(id);if(!w||w.state!=='open')return;order=order.filter(k=>k!==id);order.push(id);markActive(id);if(focus)w.el.focus({preventScroll:true});}
  function fallback(){const id=[...order].reverse().find(key=>registry.get(key).state==='open');markActive(id||null);if(id)registry.get(id).el.focus({preventScroll:true});else document.querySelector('.desktop-shortcut')?.focus({preventScroll:true});}
  function show(id){const w=registry.get(id);if(!w)return;const wasHidden=w.state!=='open';w.state='open';w.el.hidden=false;w.task.hidden=false;paint(w);focusWindow(id);if(wasHidden)w.onVisibility?.(true);}
  function minimize(id){const w=registry.get(id);if(!w)return;w.state='minimized';w.el.hidden=true;w.onVisibility?.(false);if(active===id)fallback();else markActive(active);}
  function close(id){const w=registry.get(id);if(!w)return;w.state='closed';w.el.hidden=true;w.task.hidden=true;w.onVisibility?.(false);w.onClose?.();if(active===id)fallback();else markActive(active);}
  function toggleTask(id){const w=registry.get(id);if(!w)return;if(w.state==='open'&&active===id)minimize(id);else show(id);}
  function maximize(id){const w=registry.get(id);if(!w)return;if(w.maximized){w.rect=bound(w.normal||defaults(id),w);w.normal=null;}else w.normal={...w.rect};w.maximized=!w.maximized;const button=w.el.querySelector('[data-win-control="maximize"],[data-action="maximize"]');button.textContent=w.maximized?'▣':'□';button.title=w.maximized?'Restore':'Maximise';button.setAttribute('aria-label',(w.maximized?'Restore':'Maximise')+' '+(w.main?'project window':w.label));paint(w);focusWindow(id);persist();}
  function register({id,el,label,icon,main=false,task=null,onClose=null,onVisibility=null}){
    if(!task){task=document.createElement('button');task.className='task-button';task.innerHTML=`<svg aria-hidden="true"><use href="portfolio/icons.svg#${safe(icon)}"/></svg><span>${safe(label)}</span>`;taskList.appendChild(task);}
    task.removeAttribute('data-action');task.dataset.windowTask=id;task.setAttribute('aria-controls',el.id);task.title=label;
    const w={id,el,label,main,task,onClose,onVisibility,state:'open',maximized:false,normal:null};w.rect=bound(valid(saved[id])?saved[id]:defaults(id),w);
    el.dataset.windowId=id;el.tabIndex=-1;registry.set(id,w);order.push(id);
    const bar=el.querySelector(':scope > .titlebar');bar.tabIndex=0;bar.setAttribute('aria-label',`Move ${label} with arrow keys. Double-click to maximise.`);bar.addEventListener('dblclick',e=>{if(!e.target.closest('button'))maximize(id);});
    for(const dir of ['n','s','e','w','ne','nw','se','sw']){const h=document.createElement('span');h.className='window-resize resize-'+dir;h.dataset.resize=dir;h.setAttribute('aria-hidden','true');el.appendChild(h);}
    paint(w);return w;
  }
  function openPanel({id,title,label=title,html,icon='document',onClose=null,onVisibility=null}){
    let w=registry.get(id);if(w&&w.state!=='closed'){show(id);return {el:w.el,body:w.el.querySelector('.app-window-body'),created:false};}
    if(!w){const el=document.createElement('section');el.id='window-'+id;el.className='window app-window';el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-labelledby',el.id+'-title');
      el.innerHTML=`<div class="titlebar"><div class="window-title"><svg aria-hidden="true"><use href="portfolio/icons.svg#${safe(icon)}"/></svg><span id="${el.id}-title">${safe(title)}</span></div><div class="window-controls"><button data-win-control="minimize" aria-label="Minimise ${safe(label)}" title="Minimise">_</button><button data-win-control="maximize" aria-label="Maximise ${safe(label)}" title="Maximise">□</button><button data-win-control="close" aria-label="Close ${safe(label)}" title="Close">×</button></div></div><div class="app-window-body"></div><div class="window-statusbar"><span>${safe(label)}</span><button class="resize-grip" data-resize="se" aria-label="Resize ${safe(label)} with arrow keys" title="Drag to resize, or use arrow keys">◢</button></div>`;
      document.body.appendChild(el);w=register({id,el,label,icon,onClose,onVisibility});
    }
    w.onClose=onClose;w.onVisibility=onVisibility;const body=w.el.querySelector('.app-window-body');body.innerHTML=html;body.scrollTop=0;show(id);return {el:w.el,body,created:true};
  }
  function reset(id='projects'){const w=registry.get(id);if(!w)return;w.tiled=false;if(w.maximized)maximize(id);w.rect=bound(defaults(id),w);show(id);persist();}
  document.documentElement.classList.add('desktop-ready');
  register({id:'projects',el:document.querySelector('#portfolio-window'),label:'My Projects',icon:'folder',main:true,task:document.querySelector('.task-button')});markActive('projects');
  document.addEventListener('click',event=>{const task=event.target.closest('[data-window-task]');if(task){toggleTask(task.dataset.windowTask);return;}const button=event.target.closest('[data-win-control]');if(!button)return;const id=button.closest('[data-window-id]').dataset.windowId;({minimize,maximize,close})[button.dataset.winControl]?.(id);});
  document.addEventListener('focusin',event=>{
    const el=event.target.closest('[data-window-id]');
    if(el&&!el.hidden&&!document.querySelector('dialog[open]'))focusWindow(el.dataset.windowId,false);
  });
  document.addEventListener('pointerdown',event=>{
    const el=event.target.closest('[data-window-id]');if(!el||el.hidden)return;const w=registry.get(el.dataset.windowId);focusWindow(w.id,false);
    if(event.button!==0||compact()||document.querySelector('dialog[open]')||w.maximized)return;
    const handle=event.target.closest('[data-resize]'),bar=event.target.closest('[data-window-id] > .titlebar');if(!handle&&(!bar||event.target.closest('button')))return;
    const target=handle||bar;drag={w,target,id:event.pointerId,x:event.clientX,y:event.clientY,start:{...w.rect},dir:handle?.dataset.resize};target.setPointerCapture(event.pointerId);if(target.tabIndex>=0)target.focus({preventScroll:true});event.preventDefault();
  },true);
  function updateWindowDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { w: windowState, start, dir } = drag;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const minWidth = Math.min(windowState.main ? 540 : 340, innerWidth);
    const minHeight = Math.min(250, availableHeight());
    let { x, y, w, h } = start;
    if (!dir) { x += dx; y += dy; }
    else {
      if (dir.includes('e')) w = clamp(start.w + dx, minWidth, innerWidth - x);
      if (dir.includes('s')) h = clamp(start.h + dy, minHeight, availableHeight() - y);
      if (dir.includes('w')) { x = clamp(start.x + dx, 0, start.x + start.w - minWidth); w = start.x + start.w - x; }
      if (dir.includes('n')) { y = clamp(start.y + dy, 0, start.y + start.h - minHeight); h = start.y + start.h - y; }
    }
    windowState.rect = bound({ x, y, w, h }, windowState);
    document.documentElement.classList.add('desktop-dragging');
    paint(windowState);
  }
  document.addEventListener('pointermove', updateWindowDrag);
  function endWindowDrag(event) {
    if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
    const oldDrag = drag;
    drag = null;
    if (event.type !== 'pointerup') oldDrag.w.rect = oldDrag.start;
    document.documentElement.classList.remove('desktop-dragging');
    paint(oldDrag.w);
    persist();
  }
  document.addEventListener('pointerup', endWindowDrag);
  document.addEventListener('pointercancel', endWindowDrag);
  document.addEventListener('lostpointercapture', endWindowDrag);
  window.addEventListener('blur', () => endWindowDrag({type:'cancel'}));
  document.addEventListener('keydown', event => {
    const el = event.target.closest('[data-window-id]');
    if (!el) return;
    const w = registry.get(el.dataset.windowId);
    if (event.key === 'Escape' && !w.main && !document.querySelector('dialog[open]')) {
      close(w.id); event.preventDefault(); return;
    }
    if (compact() || w.maximized || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    const resize = event.target.closest('.resize-grip');
    if (!resize && event.target !== el.querySelector(':scope > .titlebar')) return;
    event.preventDefault();
    const d=event.shiftKey?40:10, dx=event.key==='ArrowRight'?d:event.key==='ArrowLeft'?-d:0, dy=event.key==='ArrowDown'?d:event.key==='ArrowUp'?-d:0;
    w.rect=bound(resize?{...w.rect,w:w.rect.w+dx,h:w.rect.h+dy}:{...w.rect,x:w.rect.x+dx,y:w.rect.y+dy},w);
    paint(w); persist();
  });
  window.addEventListener('resize', () => {
    if (drag) endWindowDrag({type:'cancel'});
    for (const w of registry.values()) {
      if (!compact()) w.rect=bound(w.rect,w);
      paint(w);
    }
  });
  let desktopRestore=[];
  function list(){return [...registry.values()].map(w=>({id:w.id,label:w.label,state:w.state,maximized:w.maximized}));}
  function showDesktop(){desktopRestore=[...registry.values()].filter(w=>w.state==='open').map(w=>w.id);for(const id of desktopRestore)minimize(id);}
  function restoreDesktop(){for(const id of desktopRestore)show(id);desktopRestore=[];}
  function cycle(direction=1){const ids=[...registry.values()].filter(w=>w.state==='open').map(w=>w.id);if(ids.length)show(ids[(ids.indexOf(active)+direction+ids.length)%ids.length]);}
  function arrange(mode){
    const windows=[...registry.values()].filter(w=>w.state==='open'),n=windows.length;if(!n)return;
    const vertical=mode==='vertical';let cols=1,rows=1;
    if(mode!=='cascade'){if(vertical){cols=Math.min(n,Math.max(1,Math.floor(innerWidth/340)));rows=Math.ceil(n/cols);}else{rows=Math.min(n,Math.max(1,Math.floor(availableHeight()/260)));cols=Math.ceil(n/rows);}}
    windows.forEach((w,i)=>{if(w.maximized)maximize(w.id);w.tiled=mode!=='cascade';const col=vertical?Math.floor(i/rows):i%cols,row=vertical?i%rows:Math.floor(i/cols);const r=w.tiled?{x:Math.floor(col*innerWidth/cols),y:Math.floor(row*availableHeight()/rows),w:Math.floor(innerWidth/cols),h:Math.floor(availableHeight()/rows)}:{x:36+i*26,y:24+i*26,w:Math.min(w.main?1100:650,innerWidth-60),h:Math.min(650,availableHeight()-60)};w.rect=bound(r,w);paint(w);});persist();
  }
  window.TimWindows=Object.freeze({
    openPanel, show, minimize, close, maximize, toggleTask, reset, list, arrange, showDesktop, restoreDesktop, cycle,
    deactivate:()=>markActive(null), active:()=>active, workHeight:availableHeight
  });
})();
