/* Relative trackpad gestures. Kept separate so cancellation/tap rules are testable. */
(() => {
  'use strict';
  function mount({element,move,tap,cancel,now=()=>performance.now()}) {
    const controller=new AbortController();let active=null;
    const listen=(type,fn)=>element.addEventListener(type,fn,{signal:controller.signal});
    function abort(){const had=!!active;active=null;if(had)cancel();}
    function update(event){
      if(!active||event.pointerId!==active.id)return;
      const dx=event.clientX-active.x,dy=event.clientY-active.y;
      active.moved ||= Math.hypot(event.clientX-active.startX,event.clientY-active.startY)>8;
      active.x=event.clientX;active.y=event.clientY;
      if(dx||dy)move(dx,dy);
    }
    listen('pointerdown',event=>{
      if(active||event.isPrimary===false||event.button!==0)return;
      event.preventDefault();
      active={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:now(),moved:false};
      element.setPointerCapture(event.pointerId);
    });
    listen('pointermove',event=>{
      if(!active||event.pointerId!==active.id)return;
      if(event.pointerType==='mouse'&&event.buttons===0){abort();return;}
      event.preventDefault();update(event);
    });
    listen('pointerup',event=>{
      if(!active||event.pointerId!==active.id)return;
      event.preventDefault();update(event);
      const click=!active.moved&&now()-active.started<=400;active=null;
      if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
      if(click)tap();
    });
    for(const type of ['pointercancel','lostpointercapture'])listen(type,event=>{if(active?.id===event.pointerId)abort();});
    return {cancel:abort,destroy(){abort();controller.abort();}};
  }
  window.TimDemoTouchpad=Object.freeze({mount});
})();