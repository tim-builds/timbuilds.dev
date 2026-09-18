/* Local wrapper for the MIT engine and verified CC0 game assets. */
'use strict';
var supportsWebGL=!!document.createElement('canvas').getContext('webgl');
if(!supportsWebGL)document.querySelector('#status').textContent='Pinball needs WebGL graphics. Try a browser with graphics acceleration available.';
var Module = {
  noInitialRun: !supportsWebGL,
  arguments: ['-sw'],
  canvas: document.querySelector('#canvas'),
  locateFile: path => path,
  print: text => console.log(String(text)),
  printErr: text => console.error(String(text)),
  setStatus: text => {
    const element = document.querySelector('#status');
    if(!supportsWebGL)return;
    element.textContent = String(text);
    element.hidden = !text;
  },
  onRuntimeInitialized: () => {
    if(!supportsWebGL){parent.postMessage({type:'timbuilds-pinball-error'},location.origin);return;}
    document.documentElement.dataset.ready = 'true';
    parent.postMessage({type:'timbuilds-pinball-ready'}, location.origin);
  },
  onAbort: () => {
    document.querySelector('#status').textContent = 'Pinball could not start in this browser. Close and reopen the window to retry.';
  }
};
(() => {
  const keys={left:['z','KeyZ',90],right:['/','Slash',191],launch:[' ','Space',32],new:['F2','F2',113],pause:['F3','F3',114]};
  let visible=true, muted=true, initialized=false;
  function keyboard(name,down){
    const key=keys[name];if(!key)return;
    const event=new KeyboardEvent(down?'keydown':'keyup',{key:key[0],code:key[1],keyCode:key[2],which:key[2],bubbles:true,cancelable:true});
    Module.canvas.dispatchEvent(event);
  }
  function audioState(){
    const context=window.SDL2?.audioContext||Module.SDL2?.audioContext;
    if(context){if(muted||!visible)context.suspend().catch(()=>{});else context.resume().catch(()=>{});}
  }
  function visibility(next){
    const changed=visible!==next;visible=next;document.documentElement.dataset.paused=String(!next);
    for(const name of ['left','right','launch'])keyboard(name,false);
    try{if(changed){if(next)Module.resumeMainLoop?.();else Module.pauseMainLoop?.();}}catch{}
    audioState();
  }
  window.addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==location.origin)return;
    const message=event.data;if(message?.type!=='timbuilds-pinball')return;
    if(message.action==='visibility')visibility(!!message.value);
    else if(message.action==='mute'){muted=!!message.value;audioState();}
    else if(message.action==='key'){Module.canvas.focus({preventScroll:true});keyboard(message.key,!!message.down);audioState();}
  });
  Module.canvas.addEventListener('contextmenu',event=>event.preventDefault());
  document.addEventListener('keydown',event=>{
    if([' ','/','F2','F3','F4'].includes(event.key))event.preventDefault();
    audioState();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)visibility(false);});
  const check=setInterval(()=>{
    if(supportsWebGL&&!initialized&&Module.calledRun){
      initialized=true;document.documentElement.dataset.ready='true';Module.setStatus('');
      parent.postMessage({type:'timbuilds-pinball-ready'},location.origin);visibility(visible);
    }
    audioState();
  },500);
  window.addEventListener('pagehide',()=>clearInterval(check));
})();
