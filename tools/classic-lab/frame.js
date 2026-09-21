/* Adapter protocol is deliberately tiny; the opaque frame has no desktop storage access. */
(()=>{
 'use strict';
 // Emulator preferences are ephemeral; never expose the parent desktop storage.
 const memoryStorage=()=>{const values=new Map();return {get length(){return values.size;},getItem:k=>values.get(String(k))??null,setItem:(k,v)=>{values.set(String(k),String(v));},removeItem:k=>values.delete(String(k)),clear:()=>values.clear(),key:i=>[...values.keys()][i]??null};};
 for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{value:memoryStorage(),configurable:false});
 let desired=true,last=null;window.addEventListener('unhandledrejection',e=>parent.postMessage({type:'classic-lab-debug',error:String(e.reason)},'*'));window.addEventListener('error',e=>parent.postMessage({type:'classic-lab-debug',error:e.message},'*'));const oldError=console.error;console.error=(...args)=>{parent.postMessage({type:'classic-lab-debug',error:args.map(String).join(' ')},'*');oldError(...args);};
 const parentOrigin=()=>document.body?.dataset.parentOrigin;
 const apply=()=>{const vm=window.__vm;if(!vm||typeof vm.mcp_get_execution_state!=='function')return;
  const s=JSON.parse(vm.mcp_get_execution_state());if(!s.movie_loaded)return;
  if(last!==desired){last=desired;if(desired&&!s.is_playing)vm.play();else if(!desired&&s.is_playing)vm.stop();}
 };
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==parentOrigin()||e.data?.type!=='classic-lab-control'||typeof e.data.running!=='boolean')return;desired=e.data.running;apply();});
 const timer=setInterval(()=>{try{apply();if(!window.__vm)return;const s=JSON.parse(window.__vm.mcp_get_execution_state());parent.postMessage({type:'classic-lab-status',state:{movie_loaded:!!s.movie_loaded,is_playing:!!s.is_playing,at_breakpoint:!!s.at_breakpoint,current_frame:Number(s.current_frame)||0,total_frames:Number(s.total_frames)||0}},parentOrigin());}catch(error){console.warn('Classic lab state unavailable:',error.message);}},500);
 window.addEventListener('pagehide',()=>clearInterval(timer));
})();
