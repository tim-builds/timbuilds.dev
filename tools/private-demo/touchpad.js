/* Relative touchpad: quick tap clicks; stationary long press holds until lift. */
(() => {
  'use strict';
  function mount({element,move,tap,press=()=>false,release=()=>{},cancel,enabled=()=>true,now=()=>performance.now(),setTimer=setTimeout,clearTimer=clearTimeout,holdMs=350}) {
    const controller=new AbortController();let active=null,timer=null;
    const listen=(type,fn)=>element.addEventListener(type,fn,{signal:controller.signal});
    function clear(){if(timer!==null){clearTimer(timer);timer=null;}}
    function unCapture(id){if(element.hasPointerCapture(id))element.releasePointerCapture(id);}
    function abort(){const old=active;active=null;clear();if(!old)return;unCapture(old.id);if(old.held)release(true);cancel();}
    function update(event){
      if(!active||event.pointerId!==active.id)return;
      const dx=event.clientX-active.x,dy=event.clientY-active.y;
      if(Math.hypot(event.clientX-active.startX,event.clientY-active.startY)>8){active.moved=true;if(!active.held)clear();}
      active.x=event.clientX;active.y=event.clientY;
      if(dx||dy)move(dx,dy);
    }
    listen('pointerdown',event=>{
      if(active||!enabled()||event.isPrimary===false||event.button!==0)return;
      event.preventDefault();
      const gesture=active={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:now(),moved:false,held:false};
      try{element.setPointerCapture(event.pointerId);}catch{abort();return;}
      timer=setTimer(()=>{timer=null;if(active!==gesture||gesture.moved||!enabled())return;gesture.held=press()!==false;},holdMs);
    });
    listen('pointermove',event=>{
      if(!active||event.pointerId!==active.id)return;
      if(!enabled()||(event.pointerType==='mouse'&&event.buttons===0)){abort();return;}
      event.preventDefault();update(event);
    });
    listen('pointerup',event=>{
      if(!active||event.pointerId!==active.id)return;
      event.preventDefault();if(!enabled()){abort();return;}update(event);
      const old=active,click=!old.held&&!old.moved&&now()-old.started<holdMs;
      active=null;clear();unCapture(event.pointerId);
      if(old.held)release(false);else if(click)tap();
    });
    for(const type of ['pointercancel','lostpointercapture'])listen(type,event=>{if(active?.id===event.pointerId)abort();});
    listen('contextmenu',event=>event.preventDefault());
    return {cancel:abort,destroy(){abort();controller.abort();}};
  }
  window.TimDemoTouchpad=Object.freeze({mount});
})();