/* Drag copies keep the original shortcuts stationary until the drop is accepted. */
(() => {
  'use strict';
  let layer=null,copies=[],originals=[],animations=[],token=0;
  function cancel(){
    token++;for(const animation of animations)animation.cancel();animations=[];
    layer?.remove();layer=null;copies=[];
    originals.forEach(el=>el.classList.remove('drag-origin'));originals=[];
    document.querySelector('[data-shortcut=recycle]')?.classList.remove('recycle-drop-target');
  }
  function begin(ids){
    cancel();layer=document.createElement('div');layer.className='desktop-drag-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;
    for(const id of ids){
      const el=document.querySelector('.desktop-dock [data-shortcut="'+id+'"]');if(!el)continue;
      const r=el.getBoundingClientRect(),copy=document.createElement('div');copy.className='desktop-drag-copy';
      for(const child of el.children)copy.append(child.cloneNode(true));
      Object.assign(copy.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'});
      layer.append(copy);copies.push(copy);originals.push(el);el.classList.add('drag-origin');
    }
    document.body.append(layer);
  }
  function move(dx,dy,overBin){
    for(const el of copies)el.style.transform=`translate(${dx}px, ${dy}px)`;
    document.querySelector('[data-shortcut=recycle]')?.classList.toggle('recycle-drop-target',!!overBin);
    if(layer)layer.dataset.dropTarget=overBin?'recycle':'desktop';
  }
  function reject(done){
    const current=token;
    document.querySelector('[data-shortcut=recycle]')?.classList.remove('recycle-drop-target');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    animations=reduced?[]:copies.map(el=>el.animate([
      {transform:el.style.transform,opacity:.65},
      {transform:'translate(0px, 0px)',opacity:.15}
    ],{duration:190,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'}));
    Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{
      if(token!==current)return;cancel();done();
    });
  }
  window.TimDragFeedback=Object.freeze({begin,move,cancel,reject});
})();
