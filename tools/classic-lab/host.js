/* Local-only adapter. No game URLs or game data are published with this source. */
(async()=>{
 'use strict';if(location.hostname!=='127.0.0.1')return;
 const entries=await fetch('/__classic__/config.json').then(r=>{if(!r.ok)throw Error('Lab config unavailable');return r.json();});
 const A=window.TimApps,W=window.TimWindows;
 for(const entry of entries)A.register('lab-'+entry.id,entry.title+' — private test','globe',(body,win)=>{
  let userPaused=false,visible=true,closed=false;
  body.innerHTML='<div style="display:flex;flex-direction:column;height:100%;min-height:0"><div class="app-menubar"><button class="bevel-button" data-classic-pause>Pause</button><button class="bevel-button" data-classic-expand>Expand game</button><button class="bevel-button" data-classic-restart>Restart</button></div><div data-classic-stage style="position:relative;flex:1;min-height:0;overflow:hidden;background:#000"></div><p class="accessory-note" role="status" data-classic-status>Private compatibility test. Loading…</p></div>';
  const stage=body.querySelector('[data-classic-stage]'),status=body.querySelector('[data-classic-status]'),frame=document.createElement('iframe');
  frame.setAttribute('sandbox','allow-scripts');frame.allow='autoplay';frame.title=entry.title;frame.src='/__classic__/frame.html?game='+encodeURIComponent(entry.id);
  frame.style.cssText='position:absolute;width:640px;height:420px;border:0;transform-origin:0 0;';stage.append(frame);
  const send=()=>{if(!closed)frame.contentWindow?.postMessage({type:'classic-lab-control',running:visible&&!userPaused&&!document.hidden},'*');};
  function fit(){const scale=Math.min(stage.clientWidth/640,stage.clientHeight/420);frame.style.transform=`scale(${Math.max(0,scale)})`;frame.style.left=(stage.clientWidth-640*scale)/2+'px';frame.style.top=(stage.clientHeight-420*scale)/2+'px';}
  const observer=new ResizeObserver(fit);observer.observe(stage);fit();
  function report(e){if(e.source!==frame.contentWindow||e.origin!=='null'||e.data?.type!=='classic-lab-status')return;const s=e.data.state;if(!s||typeof s.current_frame!=='number')return;win.dataset.classicReady=String(s.movie_loaded);win.dataset.classicFrame=String(s.current_frame);win.dataset.classicPlaying=String(s.is_playing);status.textContent='PRIVATE TEST · '+(s.movie_loaded?'Frame '+s.current_frame+' / '+s.total_frames:'Loading')+' · '+(s.at_breakpoint?'Emulator stopped at an error':s.is_playing?'Running':'Paused');}
  window.addEventListener('message',report);document.addEventListener('visibilitychange',send);
  body.querySelector('[data-classic-pause]').onclick=e=>{userPaused=!userPaused;e.currentTarget.textContent=userPaused?'Resume':'Pause';e.currentTarget.setAttribute('aria-pressed',String(userPaused));send();};
  body.querySelector('[data-classic-expand]').onclick=()=>W.maximize('lab-'+entry.id);
  body.querySelector('[data-classic-restart]').onclick=()=>{userPaused=false;body.querySelector('[data-classic-pause]').textContent='Pause';delete win.dataset.classicReady;frame.src='/__classic__/frame.html?game='+encodeURIComponent(entry.id)+'&restart='+Date.now();};
  frame.addEventListener('load',send);
  return {visibility:v=>{visible=v;send();},cleanup:()=>{closed=true;observer.disconnect();window.removeEventListener('message',report);document.removeEventListener('visibilitychange',send);frame.src='about:blank';frame.remove();}};
 });
 const original=window.TimStartMenu;window.TimStartMenu=()=>{const t=document.createElement('template');t.innerHTML=original();const menu=t.content.querySelector('.start-submenu');if(menu){menu.append(document.createElement('hr'));for(const g of entries){const b=document.createElement('button');b.dataset.appOpen='lab-'+g.id;b.textContent=g.title+' (private test)';menu.append(b);}}return t.innerHTML;};
 document.querySelector('#start-menu').innerHTML=window.TimStartMenu();window.TimClassicLab=Object.freeze({ids:entries.map(e=>'lab-'+e.id)});
})().catch(error=>console.error('Classic-game lab:',error.message));
