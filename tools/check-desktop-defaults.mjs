import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkDesktopDefaults({evaluate,click,box,viewport,navigate,origin,screenshot,output,pass}){
 await evaluate('localStorage.removeItem("timbuilds.environment.v1");localStorage.removeItem("timbuilds.windows.v3")');
 for(const [width,height] of [[320,740],[390,844],[844,390],[1440,1000],[3440,1440]]){
  await viewport(width,height);await navigate(origin);
  assert.equal(await evaluate('window.TimVersion.current()'),'xp');
  assert.equal(await evaluate('window.TimVersion.selection().placement'),'fit');
  assert.equal(await evaluate('window.TimWindows.list().find(w=>w.id==="projects").maximized'),true);
  assert.equal(await evaluate('document.querySelector("#portfolio-window [data-action=maximize]").dataset.chromeIcon'),'restore');
  const w=await box('#portfolio-window'),bottom=await evaluate('window.TimWindows.workBottom()');
  assert.equal(w.x,0);assert.equal(w.y,0);assert.equal(w.w,width);assert.ok(Math.abs(w.h-bottom)<1,'projects clear taskbar');
  assert.equal(await evaluate('!!document.querySelector("#task-manager-button")'),false);
  await screenshot(path.join(output,`xp-initial-${width}.png`));
  await evaluate('window.TimWindows.showDesktop()');
  const wall=await evaluate(`(async()=>{
   const el=document.querySelector('#desktop-wallpaper'),r=el.getBoundingClientRect(),s=getComputedStyle(el),p=window.TimVersion.options().find(p=>p.id===window.TimVersion.selection().wallpaper),i=new Image();i.src='portfolio/wallpapers/'+p.file;await i.decode();
   const scale=Math.min(r.width/i.naturalWidth,r.height/i.naturalHeight);
   return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,size:s.backgroundSize,repeat:s.backgroundRepeat,events:s.pointerEvents,iw:i.naturalWidth,ih:i.naturalHeight,rw:i.naturalWidth*scale,rh:i.naturalHeight*scale};
  })()`);
  assert.equal(wall.size,'contain');assert.equal(wall.repeat,'no-repeat');assert.equal(wall.events,'none');assert.equal(wall.w,width);assert.ok(Math.abs(wall.bottom-bottom)<1);assert.ok(wall.rw<=wall.w+.01&&wall.rh<=wall.h+.01);assert.ok(Math.abs(wall.rw/wall.rh-wall.iw/wall.ih)<.001);
  await screenshot(path.join(output,`xp-whole-wallpaper-${width}.png`));
  await evaluate('window.TimWindows.restoreDesktop()');
  await click('#portfolio-window [data-action=maximize]');assert.equal(await evaluate('window.TimWindows.list().find(w=>w.id==="projects").maximized'),false);
  await navigate(origin);assert.equal(await evaluate('window.TimWindows.list().find(w=>w.id==="projects").maximized'),true,'reopening site starts maximized even after restore');
 }
 await viewport(1440,1000);
 await evaluate('window.TimWindows.freshSession()');assert.equal(await evaluate('window.TimWindows.list().find(w=>w.id==="projects").maximized'),true);
 await click('#portfolio-window [data-window-menu=Tools]');await evaluate('[...document.querySelectorAll(".os-command-menu button")].find(b=>b.textContent==="Task Manager").click()');
 assert.equal(await evaluate('window.TimWindows.active()'),'taskmanager');await evaluate('window.TimWindows.close("taskmanager")');
 pass('XP + maximized first/reloaded/restarted Projects, correct Restore icon, whole-image desktop fit at 320/390/844/1440/3440px and Task Manager available via Tools without tray icon');
}