import assert from 'node:assert/strict';import path from 'node:path';
export async function checkModernWindows({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests}){
 const state=id=>evaluate(`window.TimWindows.list().find(w=>w.id==='${id}')`);
 const realClick=async selector=>{const r=await box(selector);await mouse(r.x+r.w/2,r.y+r.h/2,'mousePressed');await mouse(r.x+r.w/2,r.y+r.h/2,'mouseReleased');await sleep(100);};
 await navigate(origin);assert.equal(await evaluate('window.TimVersion.current()'),'xp');assert.equal(await evaluate('window.TimVersion.themes.length'),11);
 await evaluate('window.TimApps.open("versions")');assert.equal(await evaluate('document.querySelectorAll(".version-option").length'),11);await click('#window-versions [data-version="vista"]');assert.equal(await evaluate('window.TimVersion.current()'),'vista');await evaluate('window.TimWindows.close("versions");window.TimApps.open("notepad");document.querySelector("#notepad-text").value="Retain this note across modern skins";window.__modernNote=document.querySelector("#notepad-text");window.__modernToken=42');
 const colors=new Set();
 for(const os of ['vista','10','11']){
  await evaluate(`window.TimVersion.set('${os}');window.TimWindows.showDesktop()`);await sleep(250);
  assert.equal(await evaluate('window.__modernNote===document.querySelector("#notepad-text")'),true);assert.equal(await evaluate('window.__modernNote.value'),'Retain this note across modern skins');assert.equal(await evaluate('window.__modernToken'),42);
  assert.equal(await evaluate('window.TimVersion.selection().placement'),'fit');const options=await evaluate('window.TimVersion.options().filter(p=>p.file).map(p=>p.file)');assert.equal(options.length,2);
  for(const file of options)assert.equal(await evaluate(`new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth>=800);i.onerror=()=>resolve(false);i.src='portfolio/wallpapers/${file}';})`),true);
  for(const [width,height] of [[320,740],[390,844],[844,390],[1440,1000],[2560,1440]]){
   await viewport(width,height);await evaluate('if(!document.querySelector("#start-menu").hidden)document.querySelector("#start-button").click();window.TimWindows.showDesktop()');await sleep(150);
   await realClick('#start-button');await sleep(150);assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),false);
   await until(()=>evaluate('(()=>{const s=document.querySelector("#start-button use"),f=document.querySelector(".desktop-shortcut[data-shortcut=projects] use");return s.getBBox().width>0&&f.getBBox().width>0})()'),'actual rendered modern SVG icons');
   await screenshot(path.join(output,`modern-${os}-start-${width}.png`));
   const menu=await box('#start-menu'),bar=await box('.taskbar'),start=await box('#start-button');
   assert.ok(menu.y>=-.5&&menu.x>=-.5&&menu.x+menu.w<=width+.5,os+' menu inside viewport '+width);assert.ok(menu.y+menu.h<=bar.y+.5,os+' Start menu above taskbar '+width);
   assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false,os+' no page overflow '+width);
   const hit=await evaluate('(()=>{const s=document.querySelector("#start-button"),r=s.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest("button")===s;})()');assert.equal(hit,true,os+' Start remains tappable');
   const allApps='#start-menu .start-parent';await click(allApps);await sleep(150);const sub=await box('#start-menu .cascade-panel:not([hidden])');assert.ok(sub.y>=-.5&&sub.y+sub.h<=bar.y+.5&&sub.x>=0&&sub.x+sub.w<=width+.5,os+' cascade fits '+width);
   await realClick('#start-button');assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),true);
   if(os==='11'){
    const group=await box('.win11-launchers'),tray=await box('.taskbar>.clock-era');assert.ok(group.x+group.w<=tray.x+1,'launcher group clears time/year');if(width>=1440)assert.ok(Math.abs(group.x+group.w/2-width/2)<2,'Windows 11 launcher actually centered');
   }
   await evaluate('window.TimWindows.show("projects")');await screenshot(path.join(output,`modern-${os}-projects-${width}.png`));await evaluate('window.TimWindows.showDesktop()');
  }
  await viewport(1440,1000);await evaluate('window.TimWindows.show("notepad");window.TimWindows.reset("notepad")');await screenshot(path.join(output,`modern-${os}-window.png`));
  colors.add(await evaluate('getComputedStyle(document.querySelector("#window-notepad>.titlebar")).backgroundImage+getComputedStyle(document.querySelector("#window-notepad>.titlebar")).backgroundColor'));
  const controls=await evaluate('(()=>{const w=document.querySelector("#window-notepad"),t=w.querySelector(".titlebar").getBoundingClientRect();return [...w.querySelectorAll(".window-controls button")].map(b=>{const r=b.getBoundingClientRect();return {hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest("button")===b,inside:r.top>=t.top-6&&r.bottom<=t.bottom+1,kind:b.dataset.chromeIcon};});})()');assert.ok(controls.every(c=>c.hit&&c.inside),os+' reachable caption controls '+JSON.stringify(controls));
  const initial=await box('#window-notepad');await drag('#window-notepad>.titlebar',-25,-15);const moved=await box('#window-notepad');assert.equal(Math.round(moved.x),Math.round(initial.x-25));
  await click('#window-notepad [data-win-control=maximize]');assert.equal((await state('notepad')).maximized,true);await click('#window-notepad [data-win-control=maximize]');assert.deepEqual(await box('#window-notepad'),moved);
  await realClick('[data-window-task=notepad]');assert.equal((await state('notepad')).state,'minimized');await realClick('[data-window-task=notepad]');assert.equal((await state('notepad')).state,'open');
  await realClick('#start-button');await evaluate('(()=>{const q=document.querySelector("[data-start-search]");q.value="Calculator";q.dispatchEvent(new Event("input",{bubbles:true}));})()');assert.equal(await evaluate('document.querySelectorAll("[data-search-list] button").length'),1);
  const beforeRequests=requests.length;await evaluate('document.querySelector(".modern-search").requestSubmit()');assert.equal((await state('calculator')).state,'open');assert.ok(!requests.slice(beforeRequests).some(u=>!u.startsWith(origin)),'Start search stays local');await evaluate('window.TimWindows.close("calculator")');
  await realClick('#start-button');await evaluate('(()=>{const q=document.querySelector("[data-start-search]");q.value="no-match-xyz";q.dispatchEvent(new Event("input",{bubbles:true}));})()');assert.equal(await evaluate('document.querySelectorAll("[data-search-list] button").length'),0);await evaluate('(()=>{const q=document.querySelector("[data-start-search]");q.value="";q.dispatchEvent(new Event("input",{bubbles:true}));})()');await click('#start-menu [data-app-open=games]');assert.equal((await state('games')).state,'open');await evaluate('window.TimWindows.close("games")');

  await viewport(390,844);await evaluate('window.TimWindows.showDesktop()');await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  for(let n=0;n<2;n++){const r=await box('#start-button');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.w/2,y:r.y+r.h/2,id:1}]});await sleep(60);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(100);assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),n===1);}
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  pass(os+': real phone-sized touch toggles, rendered SVG icons, distinct shell, menus/cascades, real app search, wallpaper decode/Fit, note retention, caption controls, task switching, 320–2560px layouts');
 }
 assert.equal(colors.size,3,'three distinct caption treatments');
 for(const os of ['xp','95','system7','ubuntu','10','11','98']){await evaluate(`window.TimVersion.set('${os}')`);await sleep(100);assert.equal(await evaluate('!!document.querySelector(".win11-launchers")'),os==='11');assert.equal(await evaluate('document.querySelectorAll("#start-button").length'),1);assert.equal(await evaluate('document.querySelectorAll("#task-list").length'),1);assert.equal(await evaluate('window.__modernNote===document.querySelector("#notepad-text")'),true);}
 await evaluate('window.TimVersion.set("11");window.TimVersion.wallpaper("win11-bloom-dark")');await navigate(origin);assert.equal(await evaluate('window.TimVersion.current()'),'11');assert.equal(await evaluate('window.TimVersion.selection().wallpaper'),'win11-bloom-dark');
 await evaluate('localStorage.removeItem("timbuilds.environment.v1")');await navigate(origin);assert.equal(await evaluate('window.TimVersion.current()'),'xp');assert.equal((await state('projects')).maximized,true);
 for(const os of ['vista','10','11']){await evaluate(`window.TimVersion.set('${os}');window.TimPower.start('restart')`);assert.equal(await evaluate('document.querySelector(".power-screen").dataset.powerOs'),os);await click('.power-skip');await click('.power-skip');assert.equal(await evaluate('window.TimPower.state()'),'running');assert.equal(await evaluate('window.TimVersion.current()'),os);}await evaluate('window.TimVersion.set("xp");window.TimWindows.show("projects")');
 pass('Three era-specific browser restart sequences exit cleanly without changing OS preferences');
 pass('11 total OS options, real picker selection, wrapper-free return to old skins, per-theme wallpaper persistence and unchanged XP/maximized defaults');
}
