import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkRecovery({evaluate,send,click,box,mouse,viewport,navigate,origin,until,sleep,screenshot,output,pass}) {
 const key=async(name,code,mods=0)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,modifiers:mods});await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code,modifiers:mods});};
 const state=id=>evaluate(`window.TimWindows.list().find(w=>w.id===${JSON.stringify(id)})?.state`);
 const tap=async selector=>{const r=await box(selector);await mouse(r.x+r.w/2,r.y+r.h/2,'mousePressed');await mouse(r.x+r.w/2,r.y+r.h/2,'mouseReleased');};
 await viewport(1440,1000);await navigate(origin);
 await evaluate('sessionStorage.setItem("timbuilds.access-progress.v3",JSON.stringify({depth:0,seed:123456}))');await navigate(origin);
 await evaluate('window.TimApps.open("notepad");const n=document.querySelector("#notepad-text");n.value="Keep my work during the crash";n.dispatchEvent(new Event("input"));window.TimWindows.show("projects")');
 const before=await evaluate('window.TimWindows.list()'),rect=await box('#portfolio-window');
 await click('[data-action=locked]');await until(()=>evaluate('window.TimBSOD.isOpen()'),'BSOD from Locked');
 assert.equal(await evaluate('document.querySelector("#bsod-stop").textContent'),'UNAUTHORIZED_FOLDER_CURIOSITY');
 assert.equal(await evaluate('!!document.querySelector("#window-locked")'),false);
 assert.equal(await evaluate('document.activeElement.id'),'bsod-title');
 await key('F5',116);assert.ok((await evaluate('document.querySelector("#bsod-check").textContent')).includes('PASSED'));
 await key('/',191);assert.equal(await evaluate('document.activeElement.id'),'bsod-title');
 await evaluate('document.querySelector("#bsod-title").focus()');await key('Tab',9,8);assert.equal(await evaluate('document.activeElement===document.querySelector(".bsod-footer button")'),true);
 for(let i=0;i<14;i++){await key('Tab',9);assert.equal(await evaluate('document.querySelector("#bsod-dialog").contains(document.activeElement)'),true);}
 await evaluate('document.querySelector("#access-response").focus()');await key('Escape',27);
 assert.equal(await evaluate('window.TimBSOD.isOpen()'),false);assert.deepEqual(await evaluate('window.TimWindows.list()'),before);assert.deepEqual(await box('#portfolio-window'),rect);
 assert.equal(await evaluate('document.querySelector("#notepad-text").value'),'Keep my work during the crash');
 pass('BSOD contains keyboard focus and shell shortcuts; Escape from its input preserves desktop windows, geometry and notes');
 await click('[data-action=locked]');await until(()=>evaluate('!!document.querySelector(".access-terminal")'),'recovery form');
 await evaluate('document.querySelector("#access-response").value=window.TimChallengeRules.makeStage(0,123456).answer;document.querySelector("#access-form").requestSubmit()');await click('[data-access-action=next]');
 await click('#bsod-dialog [data-bsod-action=desktop]');await evaluate('window.TimDesktopActions.warn("move")');
 assert.equal(await evaluate('document.querySelector("#bsod-stop").textContent'),'PROJECTS_CANNOT_BE_RECYCLED');assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'1');assert.equal(await evaluate('document.querySelector("#desktop-warning").open'),false);
 await evaluate('window.TimBSOD.close();window.TimBSOD.open("locked")');await sleep(80);assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'1');
 await click('[data-access-action=disconnect]');assert.equal(await evaluate('window.TimBSOD.isOpen()'),false);
 pass('Both entrances share saved challenge progress; rapid reopen and the in-console return button clean up safely');
 for(const os of ['95','98','2000','xp','system7','mac9','ubuntu','kde'])for(const width of [320,390,1440]){
  await viewport(width,900);await evaluate(`window.TimVersion.set(${JSON.stringify(os)});window.TimWindows.showDesktop()`);
  const clock=os==='ubuntu'?'.platform-clock':'.clock-tray',year=os==='ubuntu'?'.platform-topbar .environment-year':'#environment-button';
  assert.equal(await evaluate('document.querySelectorAll("#task-manager-button").length'),1);
  assert.ok((await evaluate('document.querySelector("#task-manager-button use").getAttribute("href")')).endsWith('#taskmanager'));
  assert.equal(await evaluate('window.TimApps.list().find(a=>a.id==="taskmanager").icon'),'taskmanager');
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(year)}+' [data-os-year]').textContent`),await evaluate('window.TimVersion.info().year'));
  const c=await box(clock),y=await box(year);assert.ok(y.x>=c.x+c.w-.5&&y.x+y.w<=width+.5,os+' year follows time at '+width);
  for(const [selector,id] of [['#task-manager-button','taskmanager'],[clock,'datetime'],[year,'versions']]){
   await evaluate(`window.TimWindows.close(${JSON.stringify(id)})`);await tap(selector);assert.equal(await state(id),'open',os+' '+id+' opens');await tap(selector);assert.equal(await state(id),'minimized',os+' '+id+' minimizes');await tap(selector);assert.equal(await state(id),'open',os+' '+id+' restores');await evaluate(`window.TimWindows.close(${JSON.stringify(id)})`);
  }
  await evaluate('window.TimBSOD.open("locked")');const b=await box('#bsod-dialog');assert.equal(b.x,0);assert.equal(b.w,width);assert.equal(b.h,900);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#bsod-dialog")).backgroundColor'),'rgb(0, 0, 170)');
  assert.equal(await evaluate('document.querySelector(".bsod-scroll").scrollWidth>document.querySelector(".bsod-scroll").clientWidth'),false);
  const exit=await box('.bsod-toolbar [data-bsod-action=desktop]');assert.ok(exit.y>=0&&exit.x+exit.w<=width&&exit.y+exit.h<100);
  if(os==='xp'&&width===1440)await screenshot(path.join(output,'bsod-desktop.png'));if(os==='2000'&&width===390)await screenshot(path.join(output,'bsod-phone.png'));
  await tap('.bsod-toolbar [data-bsod-action=desktop]');assert.equal(await evaluate('window.TimBSOD.isOpen()'),false);
 }
 pass('Real tray clicks open/minimize/restore Task Manager, clock and era picker on 320/390/1440px across all eight OS skins');
 pass('Blue screen remains full viewport, scrollable without horizontal overflow and visibly escapable in every skin');
 await viewport(390,844);await evaluate('window.TimBSOD.open();document.querySelector("#access-response").focus()');await send('Emulation.setDeviceMetricsOverride',{width:390,height:490,deviceScaleFactor:1,mobile:false});await sleep(150);
 const exit=await box('.bsod-toolbar [data-bsod-action=desktop]');assert.ok(exit.y>=0&&exit.y+exit.h<490);await tap('.bsod-toolbar [data-bsod-action=desktop]');await viewport(1440,1000);
 await evaluate('window.TimVersion.set("xp");window.TimVersion.reset()');
 const image=await evaluate('new Promise((resolve,reject)=>{const p=window.TimVersion.options().find(p=>p.id==="winxp-bliss"),i=new Image();i.onload=()=>resolve({w:i.naturalWidth,h:i.naturalHeight,thumbnail:p.thumbnail,original:window.TimVersion.options().some(p=>p.id==="winxp-bliss-original")});i.onerror=reject;i.src="portfolio/wallpapers/"+p.file;})');
 assert.equal(image.w,4089);assert.equal(image.h,2726);assert.equal(image.original,true);assert.equal(image.thumbnail,'winxp-bliss-thumb.jpg');
 await screenshot(path.join(output,'xp-high-resolution-desktop.png'));
 pass('XP defaults to a real 4089x2726 source, keeps the original option and uses a lightweight thumbnail; recovery exit survives keyboard resizing');
 await navigate(origin);await evaluate('window.TimVersion.set("2000");window.TimVersion.reset();window.TimWindows.reset("projects")');
}
