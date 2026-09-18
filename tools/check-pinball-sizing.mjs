import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkPinballSizing({evaluate,send,click,box,mouse,viewport,navigate,origin,until,sleep,screenshot,output,pass}){
 await viewport(1440,900);await navigate(origin);
 const assertPainted=async()=>{await sleep(300);const r=await box('.pinball-viewport');const image=await send('Page.captureScreenshot',{format:'png',clip:{x:r.x,y:r.y,width:r.w,height:r.h,scale:1}});assert.ok(Buffer.from(image.data,'base64').length>12000,'Pinball viewport contains the detailed table, not a cleared black surface');};
 const games=['pinball','solitaire','minesweeper','reversi','minigolf'];
 for(const os of ['95','98','2000','xp','system7','mac9','ubuntu','kde']){
  await evaluate(`window.TimVersion.set(${JSON.stringify(os)})`);
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('#start-menu .start-submenu [data-app-open]')).filter(b=>${JSON.stringify(games)}.includes(b.dataset.appOpen)).map(b=>b.dataset.appOpen)`),games);
  assert.equal(await evaluate('document.querySelector("#start-menu [data-app-open=pinball]").textContent.trim()'),'Pinball: Space Cadet');
 }
 await evaluate('window.TimVersion.set("2000");window.TimApps.open("games")');
 assert.equal(await evaluate('document.querySelector("#window-games .program-grid [data-entry]").dataset.entry'),'pinball');await evaluate('window.TimWindows.close("games")');
 pass('Pinball: Space Cadet is first among games in Programs and the Games folder, across all eight Start menus');
 for(const [width,height] of [[320,700],[390,844],[1440,900]]){
  await viewport(width,height);await evaluate('window.TimApps.open("pinball")');
  await until(()=>evaluate('document.querySelector("#window-pinball").dataset.pinballReady==="true"'),'pinball runtime');await sleep(450);
  assert.equal(await evaluate('window.TimWindows.list().find(w=>w.id==="pinball").label'),'Pinball: Space Cadet');
  assert.equal(await evaluate('!!document.querySelector("#window-pinball>.application-menus")'),false);
  assert.equal(await evaluate('document.querySelector("#window-pinball [data-browser-external]").href'),'https://pinball.alula.me/');
  await evaluate('window.__sizeFrame=document.querySelector("#pinball-frame");window.__sizeRuntime=window.__sizeFrame.contentWindow;true');
  const size=()=>evaluate('(()=>{const w=document.querySelector("#pinball-frame").contentWindow,c=w.document.querySelector("canvas"),r=c.getBoundingClientRect();return {w:r.width*document.querySelector("#pinball-frame").getBoundingClientRect().width/w.innerWidth,h:r.height*document.querySelector("#pinball-frame").getBoundingClientRect().height/w.innerHeight,nw:c.width,nh:c.height,aw:document.querySelector(".pinball-viewport").clientWidth,ah:document.querySelector(".pinball-viewport").clientHeight,same:w===window.__sizeRuntime};})()');
  const before=await size(),rect=await box('#window-pinball');
  assert.ok(Math.abs(before.nw/before.nh-600/440)<.012,'Initial canvas keeps the game aspect ratio, not the browser default 2:1');
  assert.ok(before.h>=before.w*.72,'Table is not initialized into a shallow 2:1 strip');
  const toggle=async()=>{const r=await box('[data-pin-action=expand]');await mouse(r.x+r.w/2,r.y+r.h/2,'mousePressed');await mouse(r.x+r.w/2,r.y+r.h/2,'mouseReleased');await sleep(220);};
  await toggle();assert.equal(await evaluate('document.querySelector("[data-pin-action=expand]").textContent'),'Restore window');
  const expanded=await size();assert.ok(expanded.same);assert.ok(expanded.w<=expanded.aw+1&&expanded.h<=expanded.ah+1);assert.ok(Math.abs(expanded.w/expanded.h-expanded.nw/expanded.nh)<.012);assert.ok(expanded.h>=before.h-.5);assert.ok(Math.min(Math.abs(expanded.w-expanded.aw),Math.abs(expanded.h-expanded.ah))<2);
  assert.equal(await evaluate('document.querySelector("#window-pinball .app-window-body").scrollWidth>document.querySelector("#window-pinball .app-window-body").clientWidth'),false);
  await assertPainted();await screenshot(path.join(output,'pinball-expanded-'+width+'.png'));
  await toggle();assert.deepEqual(await box('#window-pinball'),rect);assert.equal(await evaluate('document.querySelector("[data-pin-action=expand]").textContent'),'Expand game');assert.ok((await size()).same);
  await click('#window-pinball [data-win-control=maximize]');assert.equal(await evaluate('document.querySelector("[data-pin-action=expand]").textContent'),'Restore window');await toggle();assert.deepEqual(await box('#window-pinball'),rect);
  await click('[data-pin-action=new]');await click('[data-pin-action=pause]');assert.equal(await evaluate('document.querySelector("[data-pin-action=pause]").getAttribute("aria-pressed")'),'true');await toggle();await toggle();assert.equal(await evaluate('document.querySelector("[data-pin-action=pause]").getAttribute("aria-pressed")'),'true');await click('[data-pin-action=pause]');
  await evaluate('window.TimWindows.minimize("pinball")');await sleep(150);assert.equal(await evaluate('window.__sizeRuntime.document.documentElement.dataset.paused'),'true');await evaluate('window.TimWindows.show("pinball")');await sleep(150);assert.ok((await size()).same);
  await assertPainted();await screenshot(path.join(output,'pinball-window-'+width+'.png'));await evaluate('window.TimWindows.close("pinball")');assert.equal(await evaluate('document.querySelectorAll("#pinball-frame").length'),0);
 }
 pass('Correct canvas ratio and real Expand/Restore clicks preserve proportions, geometry and the running game at 320/390/1440px');
 await viewport(1440,1000);await navigate(origin);
}
