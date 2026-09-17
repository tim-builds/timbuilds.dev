/* Desktop geometry is a preference, never an authentication signal. */
(() => {
  'use strict';
  const main=document.querySelector('#portfolio-window'), dock=document.querySelector('.desktop-dock'), bar=main.querySelector('.titlebar'), task=document.querySelector('.task-button');
  const icons=[...dock.querySelectorAll('.desktop-shortcut')], mobile=()=>innerWidth<=820, margin=12, gridX=104, gridY=96, top=66;
  const storage='timbuilds.desktop.v2'; let saved={}; try{saved=JSON.parse(localStorage.getItem(storage)||'{}')||{};}catch{}
  let positions={}, rect=null, normal=null, state='open', gesture=null, suppressUntil=0, lastPointer='mouse';
  const finite=v=>typeof v==='number'&&Number.isFinite(v), clamp=(v,lo,hi)=>Math.max(lo,Math.min(Math.max(lo,hi),v));
  const height=()=>innerHeight-document.querySelector('.taskbar').getBoundingClientRect().height;
  const defaults=()=>({x:innerWidth<1100?112:140,y:60,w:Math.min(1200,innerWidth-(innerWidth<1100?136:168)),h:Math.max(280,height()-84)});
  function bounded(r){const available=height(),w=clamp(r.w,Math.min(540,innerWidth),innerWidth),h=clamp(r.h,Math.min(280,available),available);return {x:clamp(r.x,0,innerWidth-w),y:clamp(r.y,0,available-h),w,h};}
  function persist(){try{localStorage.setItem(storage,JSON.stringify({positions,rect:normal||rect}));}catch{}}
  function paint(){if(mobile()){for(const k of ['left','top','width','height'])main.style.removeProperty(k);return;}const r=main.classList.contains('is-maximized')?{x:0,y:0,w:innerWidth,h:height()}:rect;Object.assign(main.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});}
  function placeIcons(reset=false){if(mobile()){icons.forEach(el=>{el.style.left='';el.style.top='';});return;}const rows=Math.max(1,Math.floor((height()-top)/gridY));const used=new Set();icons.forEach((el,i)=>{const id=el.dataset.shortcut;let p=!reset&&positions[id];let col=p&&finite(p.x)?Math.round((p.x-margin)/gridX):Math.floor(i/rows),row=p&&finite(p.y)?Math.round((p.y-top)/gridY):i%rows;col=clamp(col,0,Math.floor((innerWidth-margin-98)/gridX));row=clamp(row,0,rows-1);while(used.has(col+','+row)){row++;if(row>=rows){row=0;col++;}}used.add(col+','+row);p={x:margin+col*gridX,y:top+row*gridY};positions[id]=p;el.style.left=p.x+'px';el.style.top=p.y+'px';});}
  function status(next){state=next;main.hidden=next!=='open';task.hidden=next==='closed';task.classList.toggle('is-active',next==='open');task.setAttribute('aria-pressed',String(next==='open'));document.querySelector('#desktop-rest').hidden=true;if(next==='open'){paint();main.focus({preventScroll:true});}else{icons[0].focus({preventScroll:true});}}
  function maximize(){if(!main.classList.contains('is-maximized')){normal={...rect};main.classList.add('is-maximized');}else{main.classList.remove('is-maximized');rect=bounded(normal||defaults());normal=null;}const b=main.querySelector('[data-action="maximize"]'),big=main.classList.contains('is-maximized');b.setAttribute('aria-label',big?'Restore project window':'Maximise project window');b.title=big?'Restore':'Maximise';b.textContent=big?'▣':'□';paint();persist();}
  function arrange(){positions={};placeIcons(true);persist();}
  function resetWindow(){main.classList.remove('is-maximized');normal=null;rect=bounded(defaults());const b=main.querySelector('[data-action="maximize"]');b.setAttribute('aria-label','Maximise project window');b.title='Maximise';b.textContent='□';status('open');persist();}
  window.TimDesktop={open:()=>status('open'),minimize:()=>status('minimized'),close:()=>status('closed'),maximize,arrange,resetWindow};
  icons.forEach((el,i)=>{el.dataset.shortcut=['projects','about','contact','github','display'][i];el.title='Double-click to open · drag to move · arrow keys to move when selected';el.draggable=false;});
  if(saved.positions&&typeof saved.positions==='object')for(const el of icons){const p=saved.positions[el.dataset.shortcut];if(p&&finite(p.x)&&finite(p.y))positions[el.dataset.shortcut]={x:p.x,y:p.y};}
  rect=saved.rect&&['x','y','w','h'].every(k=>finite(saved.rect[k]))?bounded(saved.rect):bounded(defaults());
  document.documentElement.classList.add('desktop-ready');placeIcons();paint();
  function select(el){icons.forEach(i=>i.classList.toggle('is-selected',i===el));}
  document.addEventListener('click',event=>{const el=event.target.closest('.desktop-shortcut');if(!el)return;if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();return;}if(!mobile()&&event.detail>0&&lastPointer!=='touch'){event.preventDefault();event.stopImmediatePropagation();select(el);}},true);
  dock.addEventListener('dblclick',event=>{const el=event.target.closest('.desktop-shortcut');if(!el||mobile()||lastPointer==='touch'||performance.now()<suppressUntil)return;event.preventDefault();if(el.tagName==='A')window.open(el.href,'_blank','noopener,noreferrer');else el.click();});
  for(const dir of ['n','s','e','w','ne','nw','se','sw']){const handle=document.createElement('span');handle.className='window-resize resize-'+dir;handle.dataset.resize=dir;handle.setAttribute('aria-hidden','true');main.appendChild(handle);}
  bar.tabIndex=0;bar.setAttribute('aria-label','Move project window with arrow keys. Double-click to maximise.');bar.addEventListener('dblclick',e=>{if(!e.target.closest('button'))maximize();});
  document.addEventListener('pointerdown',event=>{
    lastPointer=event.pointerType||'mouse';if(mobile()||event.button!==0||document.querySelector('dialog[open]'))return;
    const icon=event.target.closest('.desktop-shortcut'),handle=event.target.closest('[data-resize]'),title=event.target.closest('#portfolio-window > .titlebar');
    if(!icon&&!handle&&(!title||event.target.closest('button')))return;if(!icon&&main.classList.contains('is-maximized'))return;
    const target=icon||handle||title;gesture={target,icon,dir:handle?.dataset.resize,x:event.clientX,y:event.clientY,start:icon?{...positions[icon.dataset.shortcut]}:{...rect},moved:false,id:event.pointerId};target.setPointerCapture(event.pointerId);if(icon){select(icon);icon.focus({preventScroll:true});}else if(target===bar||target.tagName==='BUTTON')target.focus({preventScroll:true});event.preventDefault();
  });
  document.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;const g=gesture,dx=event.clientX-g.x,dy=event.clientY-g.y;if(!g.moved&&Math.hypot(dx,dy)<5)return;g.moved=true;document.documentElement.classList.add('desktop-dragging');
    if(g.icon){const p={x:clamp(g.start.x+dx,margin,innerWidth-98),y:clamp(g.start.y+dy,top,height()-82)};positions[g.icon.dataset.shortcut]=p;g.icon.style.left=p.x+'px';g.icon.style.top=p.y+'px';return;}
    const s=g.start;if(!g.dir){rect=bounded({...s,x:s.x+dx,y:s.y+dy});}else{let {x,y,w,h}=s;const minW=Math.min(540,innerWidth),minH=Math.min(280,height());if(g.dir.includes('e'))w=clamp(s.w+dx,minW,innerWidth-x);if(g.dir.includes('s'))h=clamp(s.h+dy,minH,height()-y);if(g.dir.includes('w')){x=clamp(s.x+dx,0,s.x+s.w-minW);w=s.x+s.w-x;}if(g.dir.includes('n')){y=clamp(s.y+dy,0,s.y+s.h-minH);h=s.y+s.h-y;}rect={x,y,w,h};}paint();
  });
  function end(event){if(!gesture||(event.pointerId!==undefined&&event.pointerId!==gesture.id))return;const g=gesture;if(event.type==='pointercancel'||event.type==='lostpointercapture'){if(g.icon)positions[g.icon.dataset.shortcut]=g.start;else rect=g.start;}if(g.moved)suppressUntil=performance.now()+300;gesture=null;document.documentElement.classList.remove('desktop-dragging');placeIcons();paint();persist();}
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);document.addEventListener('lostpointercapture',end);window.addEventListener('blur',()=>{if(gesture)end({type:'pointercancel'});});
  document.addEventListener('keydown',event=>{if(mobile()||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;const el=event.target.closest('.desktop-shortcut');if(el){event.preventDefault();const p=positions[el.dataset.shortcut];p.x+=event.key==='ArrowRight'?gridX:event.key==='ArrowLeft'?-gridX:0;p.y+=event.key==='ArrowDown'?gridY:event.key==='ArrowUp'?-gridY:0;placeIcons();persist();return;}const resize=event.target.closest('.resize-grip');if((event.target!==bar&&!resize)||main.classList.contains('is-maximized'))return;event.preventDefault();const d=event.shiftKey?40:10,x=event.key==='ArrowRight'?d:event.key==='ArrowLeft'?-d:0,y=event.key==='ArrowDown'?d:event.key==='ArrowUp'?-d:0;rect=bounded(resize?{...rect,w:rect.w+x,h:rect.h+y}:{...rect,x:rect.x+x,y:rect.y+y});paint();persist();});
  window.addEventListener('resize',()=>{if(!mobile())rect=bounded(rect);placeIcons();paint();});
})();
