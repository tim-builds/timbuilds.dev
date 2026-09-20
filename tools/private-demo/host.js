/* Injected only by the authenticated private demo server; absent from public index. */
(async()=>{
 'use strict';
 const entries=await fetch('/__classic__/config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Sign-in required');return r.json();});
 const A=window.TimApps,W=window.TimWindows;
 const icon=id=>`<svg aria-hidden="true"><use href="portfolio/icons.svg#${id}"/></svg>`;
 async function lock(){for(const e of entries)W.close('lab-'+e.id);await fetch('/__auth/logout',{method:'POST'});location.replace('/');}
 A.register('private-candystand','Candystand - Private demos','folder',(body)=>{
  body.innerHTML='<div style="padding:16px"><p>Owner-only demos. Choose a game; rotate your phone sideways for more space.</p><div data-private-games style="display:grid;gap:12px"></div><p>Touchpad: slide to aim, tap anywhere to click, or Hold then move and Release to drag/shoot. The black margins work too. Direct touch is also available.</p><button class="bevel-button" data-lock style="min-height:44px">Lock private demo</button></div>';
  for(const e of entries){const b=document.createElement('button');b.className='bevel-button';b.style.cssText='min-height:64px;text-align:left;font-size:16px';b.textContent=e.title;b.onclick=()=>A.open('lab-'+e.id);body.querySelector('[data-private-games]').append(b);}
  body.querySelector('[data-lock]').onclick=lock;
 });
 for(const entry of entries)A.register('lab-'+entry.id,entry.title+' - Private','globe',(body,win)=>{
  let userPaused=false,visible=true,closed=false,held=false,trackpad=matchMedia('(pointer:coarse)').matches,scale=1,x=320,y=210,clickTimer=0;
  body.innerHTML='<div style="display:flex;flex-direction:column;height:100%;min-height:0"><div class="app-menubar" style="display:flex;flex-wrap:wrap;gap:4px"><button class="bevel-button" data-classic-pause>Pause</button><button class="bevel-button" data-classic-expand>Fullscreen</button><button class="bevel-button" data-classic-restart>Restart</button><button class="bevel-button" data-classic-touch>Touchpad</button><button class="bevel-button" data-classic-tap>Tap</button><button class="bevel-button" data-classic-hold>Hold</button><button class="bevel-button" data-classic-lock>Lock</button></div><div data-classic-stage style="position:relative;flex:1;min-height:0;overflow:hidden;background:#000;touch-action:none"><div data-touchpad style="position:absolute;inset:0;z-index:3;touch-action:none;background:transparent;user-select:none;cursor:none" aria-label="Game touchpad: drag anywhere, including black margins, to move the mouse; tap to click"></div><div data-cursor aria-hidden="true" style="position:absolute;z-index:4;pointer-events:none;width:20px;height:28px"><svg viewBox="0 0 24 32" style="display:block;width:20px;height:28px;filter:drop-shadow(1px 1px 1px #0008)"><path d="M1 1v24l6-6 5 11 5-2-5-10h9Z" fill="white" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg></div></div><p class="accessory-note" role="status" data-classic-status style="margin:4px 8px;line-height:1.3">Private demo. Loading...</p></div>';
  body.firstElementChild.style.background='var(--window-bg, #c0c0c0)';for(const b of body.querySelectorAll('button'))b.style.minHeight='44px';
  const stage=body.querySelector('[data-classic-stage]'),pad=body.querySelector('[data-touchpad]'),cursor=body.querySelector('[data-cursor]'),status=body.querySelector('[data-classic-status]'),frame=document.createElement('iframe');
  frame.setAttribute('sandbox','allow-scripts');frame.allow='autoplay';frame.referrerPolicy='no-referrer';frame.title=entry.title;frame.src=entry.frame;
  frame.style.cssText='position:absolute;width:640px;height:420px;border:0;transform-origin:0 0;';stage.prepend(frame);
  const send=()=>{if(!closed)frame.contentWindow?.postMessage({type:'classic-lab-control',running:visible&&!userPaused&&!document.hidden},'*');};
  const input=action=>frame.contentWindow?.postMessage({type:'classic-demo-pointer',action,x,y},'*');
  function draw(){cursor.style.left=((stage.clientWidth-640*scale)/2+x*scale)+'px';cursor.style.top=((stage.clientHeight-420*scale)/2+y*scale)+'px';}
  function fit(){scale=Math.max(0,Math.min(stage.clientWidth/640,stage.clientHeight/420));frame.style.transform=`scale(${scale})`;frame.style.left=(stage.clientWidth-640*scale)/2+'px';frame.style.top=(stage.clientHeight-420*scale)/2+'px';draw();}
  function release(cancelled=false){if(clickTimer){clearTimeout(clickTimer);clickTimer=0;input(cancelled?'cancel':'up');}if(held)input(cancelled?'cancel':'up');held=false;body.querySelector('[data-classic-hold]').textContent='Hold';body.querySelector('[data-classic-hold]').setAttribute('aria-pressed','false');}
  function mode(){release();pad.hidden=!trackpad;cursor.hidden=!trackpad;body.querySelector('[data-classic-touch]').textContent=trackpad?'Direct touch':'Touchpad';for(const key of ['tap','hold'])body.querySelector('[data-classic-'+key+']').hidden=!trackpad;}
  function tap(){if(closed||userPaused||!visible||document.hidden||clickTimer)return;if(held){release();return;}input('move');input('down');clickTimer=setTimeout(()=>{clickTimer=0;if(!closed)input('up');},80);}
  const touch=window.TimDemoTouchpad.mount({element:pad,move:(dx,dy)=>{x=Math.max(1,Math.min(639,x+dx/Math.max(.1,scale)));y=Math.max(1,Math.min(419,y+dy/Math.max(.1,scale)));draw();input('move');},tap,cancel:()=>release(true)});
  function suspend(){if(document.hidden){touch.cancel();release(true);}send();}
  function blur(){touch.cancel();release(true);}
  window.addEventListener('blur',blur);
  mode();const observer=new ResizeObserver(fit);observer.observe(stage);fit();
  function report(e){if(e.source!==frame.contentWindow||e.origin!=='null'||e.data?.type!=='classic-lab-status')return;const s=e.data.state;if(!s||typeof s.current_frame!=='number')return;win.dataset.classicReady=String(s.movie_loaded);win.dataset.classicFrame=String(s.current_frame);win.dataset.classicPlaying=String(s.is_playing);status.textContent=s.at_breakpoint?'Demo stopped at an emulator error. Restart to try again.':s.movie_loaded?(trackpad?'Drag anywhere, including black margins | Tap to click | Hold, drag, Release':'Direct touch | Landscape gives you more room'):'Private demo. Loading...';}
  window.addEventListener('message',report);document.addEventListener('visibilitychange',suspend);
  body.querySelector('[data-classic-pause]').onclick=e=>{touch.cancel();release(true);userPaused=!userPaused;e.currentTarget.textContent=userPaused?'Resume':'Pause';e.currentTarget.setAttribute('aria-pressed',String(userPaused));send();};
  body.querySelector('[data-classic-expand]').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await body.firstElementChild.requestFullscreen();}catch{W.maximize('lab-'+entry.id);}};
  body.querySelector('[data-classic-touch]').onclick=()=>{touch.cancel();trackpad=!trackpad;mode();};
  body.querySelector('[data-classic-tap]').onclick=tap;
  body.querySelector('[data-classic-hold]').onclick=e=>{held=!held;input(held?'down':'up');e.currentTarget.textContent=held?'Release':'Hold';e.currentTarget.setAttribute('aria-pressed',String(held));};
  body.querySelector('[data-classic-lock]').onclick=lock;
  body.querySelector('[data-classic-restart]').onclick=()=>{touch.cancel();release(true);userPaused=false;body.querySelector('[data-classic-pause]').textContent='Pause';delete win.dataset.classicReady;frame.src=entry.frame+'&restart='+Date.now();};
  frame.addEventListener('load',()=>{send();input('move');});
  if(matchMedia('(max-width:700px)').matches)setTimeout(()=>W.maximize('lab-'+entry.id),50);
  return {visibility:v=>{visible=v;if(!v){touch.cancel();release(true);}send();},cleanup:()=>{touch.destroy();release(true);closed=true;observer.disconnect();window.removeEventListener('message',report);document.removeEventListener('visibilitychange',suspend);window.removeEventListener('blur',blur);frame.src='about:blank';frame.remove();}};
 });
 const original=window.TimStartMenu;
 window.TimStartMenu=()=>{const t=document.createElement('template');t.innerHTML=original();const menu=t.content.querySelector('.start-submenu');if(menu){menu.append(document.createElement('hr'));const b=document.createElement('button');b.dataset.appOpen='private-candystand';b.innerHTML=icon('folder')+'<span>Candystand (Private)</span>';menu.append(b);}return t.innerHTML;};
 const nav=document.querySelector('#start-menu > nav');nav.innerHTML=window.TimStartMenu();window.TimCascades.mount(nav);
 window.TimClassicLab=Object.freeze({ids:entries.map(e=>'lab-'+e.id)});
 setInterval(async()=>{try{const r=await fetch('/__classic__/config.json',{cache:'no-store'});if(r.status===401){for(const e of entries)W.close('lab-'+e.id);location.replace('/');}}catch{}},60000);
})().catch(error=>console.error('Private demo:',error.message));