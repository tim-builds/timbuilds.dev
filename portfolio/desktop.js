/* Desktop selection and icon layout; never used to determine owner access. */
(() => {
  'use strict';
  const dock=document.querySelector('.desktop-dock'), icons=[...dock.querySelectorAll('.desktop-shortcut')];
  const compact=()=>innerWidth<=820, left=12, top=12, cellW=104, cellH=96;
  const clamp=(v,a,b)=>Math.max(a,Math.min(Math.max(a,b),v));
  let positions={}, selected=new Set(), gesture=null, suppressUntil=0, pointerType='mouse';
  const box=document.createElement('div');box.id='desktop-selection';box.hidden=true;box.setAttribute('aria-hidden','true');document.body.appendChild(box);
  const status=document.createElement('span');status.className='sr-only';status.setAttribute('role','status');dock.appendChild(status);dock.tabIndex=0;
  icons.forEach((el,i)=>{el.dataset.shortcut=['projects','about','contact','github','display'][i];el.draggable=false;el.title='Double-click to open · drag to move · Ctrl-click to select more';});
  try{const saved=JSON.parse(localStorage.getItem('timbuilds.desktop.v3')||'null');if(saved?.positions&&typeof saved.positions==='object'&&!Array.isArray(saved.positions))positions=saved.positions;else{const previous=JSON.parse(localStorage.getItem('timbuilds.desktop.v2')||'{}');for(const [id,p] of Object.entries(previous?.positions||{}))positions[id]={x:p.x,y:p.y-54};}}catch{}
  const workHeight=()=>window.TimWindows.workHeight();
  function persist(){try{localStorage.setItem('timbuilds.desktop.v3',JSON.stringify({positions}));}catch{}}
  function paintSelection(){icons.forEach(el=>el.classList.toggle('is-selected',selected.has(el.dataset.shortcut)));status.textContent=selected.size?`${selected.size} desktop item${selected.size===1?'':'s'} selected`:'';}
  function layout(priority=[]){
    if(compact()){icons.forEach(el=>{el.style.left='';el.style.top='';});return;}
    const rows=Math.max(1,Math.floor((workHeight()-top)/cellH)),cols=Math.max(1,Math.floor((innerWidth-left)/cellW));
    const used=new Set(), ordered=[...icons].sort((a,b)=>Number(priority.includes(b.dataset.shortcut))-Number(priority.includes(a.dataset.shortcut)));
    for(const el of ordered){const id=el.dataset.shortcut,i=icons.indexOf(el),p=positions[id];let col=p&&Number.isFinite(p.x)?Math.round((p.x-left)/cellW):Math.floor(i/rows),row=p&&Number.isFinite(p.y)?Math.round((p.y-top)/cellH):i%rows;
      col=clamp(col,0,cols-1);row=clamp(row,0,rows-1);let attempts=0;
      while(used.has(col+','+row)&&attempts++<rows*cols){row++;if(row>=rows){row=0;col=(col+1)%cols;}}
      used.add(col+','+row);positions[id]={x:left+col*cellW,y:top+row*cellH};el.style.left=positions[id].x+'px';el.style.top=positions[id].y+'px';
    }
  }
  function arrange(){positions={};layout();persist();}
  function selectOnly(id){selected=new Set(id?[id]:[]);paintSelection();}
  function activate(el){el.click();}
  layout();
  dock.addEventListener('pointerdown',event=>{
    pointerType=event.pointerType||'mouse';if(compact()||event.button!==0||document.querySelector('dialog[open]'))return;
    const el=event.target.closest('.desktop-shortcut'), modifier=event.ctrlKey||event.metaKey||event.shiftKey;
    window.TimWindows.deactivate();
    if(el){const id=el.dataset.shortcut;if(modifier){if(selected.has(id))selected.delete(id);else selected.add(id);}else if(!selected.has(id))selected=new Set([id]);paintSelection();el.focus({preventScroll:true});}
    const initial=new Set(selected),start=Object.fromEntries([...selected].map(id=>[id,{...positions[id]}]));
    if(!el&&!modifier)selectOnly(null);if(!el)dock.focus({preventScroll:true});
    gesture={id:event.pointerId,el,modifier,initial,start,x:event.clientX,y:event.clientY,moved:false};(el||dock).setPointerCapture(event.pointerId);event.preventDefault();
  });
  dock.addEventListener('pointermove',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;const g=gesture,dx=event.clientX-g.x,dy=event.clientY-g.y;
    if(!g.moved&&Math.hypot(dx,dy)<5)return;g.moved=true;document.documentElement.classList.add('desktop-dragging');
    if(g.el){const group=Object.values(g.start);if(!group.length)return;
      const mx=clamp(dx,left-Math.min(...group.map(p=>p.x)),innerWidth-98-Math.max(...group.map(p=>p.x))),my=clamp(dy,top-Math.min(...group.map(p=>p.y)),workHeight()-82-Math.max(...group.map(p=>p.y)));
      for(const el of icons){const p=g.start[el.dataset.shortcut];if(!p)continue;positions[el.dataset.shortcut]={x:p.x+mx,y:p.y+my};el.style.left=p.x+mx+'px';el.style.top=p.y+my+'px';}
    }else{
      const x=Math.min(g.x,event.clientX),y=Math.min(g.y,event.clientY),w=Math.abs(dx),h=Math.abs(dy);
      Object.assign(box.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});box.hidden=false;
      const hits=icons.filter(el=>{const r=el.getBoundingClientRect();return r.left<x+w&&r.right>x&&r.top<y+h&&r.bottom>y;}).map(el=>el.dataset.shortcut);
      selected=new Set(g.modifier?[...g.initial,...hits]:hits);paintSelection();
    }
  });
  function finish(event){
    if(!gesture||(event.pointerId!==undefined&&event.pointerId!==gesture.id))return;const g=gesture;gesture=null;
    if(event.type!=='pointerup'){for(const [id,p] of Object.entries(g.start))positions[id]=p;selected=g.initial;}
    else if(g.el&&!g.moved&&!g.modifier)selected=new Set([g.el.dataset.shortcut]);
    if(g.moved)suppressUntil=performance.now()+300;box.hidden=true;document.documentElement.classList.remove('desktop-dragging');layout([...selected]);paintSelection();persist();
  }
  dock.addEventListener('pointerup',finish);dock.addEventListener('pointercancel',finish);dock.addEventListener('lostpointercapture',finish);
  window.addEventListener('blur',()=>finish({type:'cancel'}));
  document.addEventListener('click',event=>{
    const el=event.target.closest('.desktop-shortcut');if(!el)return;
    if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!compact()&&event.detail>0&&pointerType!=='touch'){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  dock.addEventListener('dblclick',event=>{const el=event.target.closest('.desktop-shortcut');if(!el||compact()||pointerType==='touch'||performance.now()<suppressUntil)return;event.preventDefault();activate(el);});
  dock.addEventListener('keydown',event=>{
    if(compact())return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'){event.preventDefault();selected=new Set(icons.map(el=>el.dataset.shortcut));paintSelection();return;}
    if(event.key==='Escape'){finish({type:'cancel'});selectOnly(null);return;}
    const el=event.target.closest('.desktop-shortcut');
    if(!el&&event.key==='Enter'){event.preventDefault();icons.filter(el=>selected.has(el.dataset.shortcut)).forEach(activate);return;}
    if(!el||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    if(event.altKey){for(const id of selected){const p=positions[id];p.x+=event.key==='ArrowRight'?cellW:event.key==='ArrowLeft'?-cellW:0;p.y+=event.key==='ArrowDown'?cellH:event.key==='ArrowUp'?-cellH:0;}layout([...selected]);persist();}
    else{const index=icons.indexOf(el),next=icons[clamp(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1),0,icons.length-1)];selectOnly(next.dataset.shortcut);next.focus({preventScroll:true});}
  });
  window.addEventListener('resize',()=>{if(gesture)finish({type:'cancel'});layout();});
  window.TimDesktop=Object.freeze({
    open:()=>window.TimWindows.show('projects'), minimize:()=>window.TimWindows.minimize('projects'),
    close:()=>window.TimWindows.close('projects'), maximize:()=>window.TimWindows.maximize('projects'),
    resetWindow:()=>window.TimWindows.reset('projects'), arrange
  });
})();
