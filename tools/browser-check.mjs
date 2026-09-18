import {checkRecovery} from './check-recovery.mjs';
import {checkFinish} from './check-finish.mjs';
import {checkProjectSites} from './check-project-sites.mjs';
import {checkRefinements} from './check-refinements.mjs';
import {checkCleanDesktop} from './check-clean-desktop.mjs';
import {checkShell} from './check-shell.mjs';
import {checkClassic} from './check-classic.mjs';
import {checkEnvironments} from './check-environments.mjs';
import {checkPlatforms} from './check-platforms.mjs';
import {checkImmersion} from './check-immersion.mjs';
/** Optional, dependency-free Chrome checks. Uses its own temporary profile and loopback server. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8'));
const chrome=process.env.PORTFOLIO_CHROME || (process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/chromium');
assert.ok(fs.existsSync(chrome),'Set PORTFOLIO_CHROME to an installed Chrome/Chromium executable.');
const output=path.join(root,'.qa');fs.mkdirSync(output,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'timbuilds-browser-'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.wasm':'application/wasm'};
const server=http.createServer((req,res)=>{
 let relative;
 try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(relative==='/')relative='/index.html';
 let file=path.resolve(root,'.'+relative);
 if(!file.startsWith(root+path.sep)||relative.split('/').some(p=>p.startsWith('.'))){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,"index.html");const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);}catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=process.env.PORTFOLIO_ORIGIN || `http://127.0.0.1:${server.address().port}`;
const browser=spawn(chrome,['--headless=new','--enable-unsafe-swiftshader','--use-angle=swiftshader','--use-gl=angle','--no-first-run','--disable-default-apps','--disable-background-networking','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
let ws;let nextId=1;const pending=new Map();const errors=[];const checks=[];const requests=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn,label){for(let i=0;i<100;i++){if(await fn())return;await sleep(100);}throw new Error(`Timed out: ${label}`);}
function send(method,params={}){return new Promise((resolve,reject)=>{const id=nextId++;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},12000);pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+': '+r.exceptionDetails.exception?.description);return r.result.value;}
async function click(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);}
function pass(label){checks.push(label);console.log('PASS: '+label);}
async function navigate(url){
 const token=String(Date.now())+Math.random();await evaluate('window.__testNavigationToken='+JSON.stringify(token));const result=await send('Page.navigate',{url});
 const changed=Boolean(result.loaderId)||new URL(url).hash.startsWith('#owner-key=');
 const expression='document.readyState === "complete" && !!document.querySelector("#project-data")'+(changed?' && window.__testNavigationToken !== '+JSON.stringify(token):'');
 await until(async()=>{try{return await evaluate(expression);}catch(error){if(/context.*destroyed|Cannot find context/i.test(error.message))return false;throw error;}},'new document page load');await sleep(180);
}
async function viewport(width,height=900){await evaluate('document.activeElement?.blur()');await sleep(270);await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(120);await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))");}
async function screenshot(file,clip){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,...(clip?{clip}:{})});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
try{
 const active=path.join(profile,'DevToolsActivePort');await until(()=>fs.existsSync(active),'Chrome startup');
 const port=fs.readFileSync(active,'utf8').split(/\r?\n/)[0];
 const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);message.error?waiter.reject(new Error(message.error.message)):waiter.resolve(message.result);}else if(message.method==='Network.requestWillBeSent'){requests.push(message.params.request.url);}else if(message.method==='Runtime.exceptionThrown'){errors.push(message.params.exceptionDetails.text);}});
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await viewport(1440,1100);await navigate(origin);
 assert.equal(await evaluate('document.querySelectorAll(".project-card").length'),catalogue.length);pass('All public static project entries');
 for(const [category,count] of ['Apps','Games','Websites','Tools','Experiments','All projects'].map(c=>[c,c==='All projects'?catalogue.length:catalogue.filter(p=>p.category===c).length])){await click(`.folder-button[data-category="${category}"]`);assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),count);}pass('Every category filter');
 await evaluate('const q=document.querySelector("#project-search");q.value="grandma";q.dispatchEvent(new Event("input"));');assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),2);
 await evaluate('document.querySelector("#project-search").value="no-matching-project";document.querySelector("#project-search").dispatchEvent(new Event("input"));');assert.equal(await evaluate('document.querySelector("#empty-state").hidden'),false);await click('[data-action="reset-filters"]');pass('Search and empty-state recovery');
 await click('[data-view="list"]');assert.ok(await evaluate('document.querySelector("#project-grid").classList.contains("is-list")'));await click('[data-view="grid"]');pass('Grid and list views');
 await click('.project-card h3 [data-project="letters-with-lola"]');assert.equal(await evaluate('location.hash'),'#project-letters-with-lola');assert.ok(await evaluate('document.querySelector("#detail-dialog").open'));
 await evaluate('history.back()');await until(()=>evaluate('!document.querySelector("#detail-dialog").open'),'Back closes project dialog');pass('Project URL state and browser Back');
 await navigate(origin+'/#project-openhoops');assert.ok(await evaluate('document.querySelector("#detail-dialog").open'));assert.ok((await evaluate('document.querySelector("#dialog-title").textContent')).includes('openHoops'));await click('.dialog-close');pass('Direct project link opens and closes');
 for(const id of JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8')).map(p=>p.id)){
  await click(`.project-card h3 [data-project="${id}"]`);await until(()=>evaluate('document.querySelector(".project-detail-preview").complete && document.querySelector(".project-detail-preview").naturalWidth>0'),'project image');await click('.dialog-close');
 }pass('All project dialogs and local artwork');
 await click('[data-dialog="display"]');await click('.wallpaper-option[data-wallpaper="night"]');await click('#window-display [data-win-control="close"]');await navigate(origin);assert.equal(await evaluate('document.documentElement.dataset.wallpaper'),'night');await click('[data-dialog="display"]');await click('.wallpaper-option[data-wallpaper="teal"]');await click('#window-display [data-win-control="close"]');pass('Wallpaper persists across a real page load');
 await click('#start-button');assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),false);await click('#start-button');
 await click('[data-action="minimize"]');assert.ok(await evaluate('document.querySelector("#portfolio-window").hidden'));await click('.task-button');assert.equal(await evaluate('document.querySelector("#portfolio-window").hidden'),false);pass('Start menu and minimise/restore');
 for(const width of [320,390,600,768,1024,1440,1920,2560,3440]){await viewport(width);assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'),false,`horizontal overflow at ${width}`);}pass('Responsive widths 320–3440 px');
 await viewport(390,844);await evaluate('window.scrollTo(0,0)');await screenshot(path.join(output,'mobile.png'));
 await viewport(1440,1100);await evaluate('window.scrollTo(0,0);document.activeElement.blur()');await screenshot(path.join(output,'desktop.png'));
 if(process.argv.includes('--capture-social')){await evaluate('window.TimVersion.reset()');await viewport(1280,720);await evaluate('window.scrollTo(0,0)');await screenshot(path.join(root,'portfolio/social.png'),{x:0,y:0,width:1280,height:672,scale:.9375});pass('Social preview generated from this actual website');}
 const box=selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
 let mouseHeld=false;async function mouse(x,y,type='mouseMoved',count=1){if(type==='mousePressed')mouseHeld=true;if(type==='mouseReleased')mouseHeld=false;await send('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',buttons:mouseHeld?1:0,clickCount:type==='mouseMoved'?0:count});}
 async function drag(selector,dx,dy){const r=await box(selector),x=r.x+r.w/2,y=r.y+r.h/2;await mouse(x,y);await mouse(x,y,'mousePressed');await sleep(60);for(let i=1;i<=5;i++){await mouse(x+dx*i/5,y+dy*i/5);await sleep(35);}await sleep(40);await mouse(x+dx,y+dy,'mouseReleased');await sleep(350);}
 await viewport(1440,1000);await evaluate('window.TimDesktop.resetWindow();window.TimDesktop.arrange()');
 const before=await box('#portfolio-window');await drag('#portfolio-window > .titlebar',-40,10);const moved=await box('#portfolio-window');assert.equal(Math.round(moved.x),Math.round(before.x-40));assert.equal(Math.round(moved.y),Math.round(before.y+10));pass('Real pointer drag moves the main window');
 await drag('.resize-se',-160,-120);const resized=await box('#portfolio-window');assert.equal(Math.round(resized.w),Math.round(moved.w-160));assert.equal(Math.round(resized.h),Math.round(moved.h-120));pass('Corner drag resizes the project window');
 await drag('.resize-e',60,0);const edge=await box('#portfolio-window');assert.equal(Math.round(edge.w),Math.round(resized.w+60));pass('Edge resizing');
 await click('[data-action="maximize"]');const max=await box('#portfolio-window');assert.equal(max.x,0);assert.equal(max.y,0);assert.equal(max.w,1440);assert.equal(max.h,await evaluate('innerHeight-document.querySelector(".taskbar").getBoundingClientRect().height'));await click('[data-action="maximize"]');assert.deepEqual(await box('#portfolio-window'),edge);pass('Maximise fills the work area, restore returns to exact geometry');
 await click('[data-action="close-projects"]');assert.ok(await evaluate('document.querySelector("#portfolio-window").hidden && document.querySelector(".task-button").hidden'));
 const icon=await box('.desktop-shortcut[data-action="projects"]');const ix=icon.x+icon.w/2,iy=icon.y+icon.h/2;await mouse(ix,iy,'mousePressed');await mouse(ix,iy,'mouseReleased');assert.ok(await evaluate('document.querySelector("#portfolio-window").hidden'),'Single click only selects the desktop folder');await mouse(ix,iy,'mousePressed',2);await mouse(ix,iy,'mouseReleased',2);await sleep(150);assert.equal(await evaluate('document.querySelector("#portfolio-window").hidden'),false);pass('Close removes the task; real double-click reopens, single click does not');
 await click('[data-action="close-projects"]');await drag('.desktop-shortcut[data-action="projects"]',220,0);const movedIcon=await box('.desktop-shortcut[data-action="projects"]');assert.equal(movedIcon.x,220);await navigate(origin);assert.equal((await box('.desktop-shortcut[data-action="projects"]')).x,220);await evaluate('window.TimDesktop.arrange()');assert.equal((await box('.desktop-shortcut[data-action="projects"]')).x,12);pass('Desktop icon drag, grid snapping, persistence and arrange-left reset');
 for(const width of [1024,1440,2560,3440]){await viewport(width,1100);await evaluate('window.TimDesktop.arrange()');assert.equal((await box('.desktop-shortcut[data-action="projects"]')).x,12);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);}await screenshot(path.join(output,'ultrawide.png'));pass('Left-aligned icons across 1024–3440 px widths');
 await viewport(1440,1000);await evaluate('window.TimDesktop.resetWindow();document.querySelector(".workspace").scrollTop=200');const scroll=await evaluate('document.querySelector(".workspace").scrollTop');await click('[data-category="Websites"]');assert.equal(await evaluate('document.querySelector(".workspace").scrollTop'),scroll);assert.equal(await evaluate('window.scrollY'),0);await click('[data-category="All projects"]');pass('Filtering preserves explorer scroll position and never scrolls the desktop');
 await checkRecovery({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkEnvironments({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass});
 await checkPlatforms({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkCleanDesktop({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkShell({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkClassic({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkImmersion({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkRefinements({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkProjectSites({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await checkFinish({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests});
 await evaluate('localStorage.setItem("owner","true");localStorage.setItem("timbuilds.owner","true")');await navigate(origin);await click('[data-action="locked"]');await until(()=>evaluate('!!document.querySelector("#bsod-dialog[open] .access-terminal")'),'guest terminal after owner-key lookup');assert.ok(await evaluate('!!document.querySelector(".access-terminal")'));await click('#bsod-dialog [data-bsod-action="desktop"]');pass('Spoofing an owner preference does not bypass encryption');
 const ownerFile=process.env.TIMBUILDS_OWNER_FILE||path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'.local','share'),'timbuilds-owner','catalogue.json');
 if(fs.existsSync(ownerFile)){
  const owner=JSON.parse(fs.readFileSync(ownerFile,'utf8')),publicIds=new Set(JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8')).map(p=>p.id));for(const p of owner.projects){assert.ok(!publicIds.has(p.id));assert.ok(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes(`data-id="${p.id}"`));}
  await navigate(origin+'/#owner-key='+owner.key);await until(()=>evaluate('document.querySelectorAll(".locked-project").length===8'),'owner catalogue');assert.equal(await evaluate('location.hash'),'');await click('.dialog-close');assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),8);pass('Valid owner capability decrypts eight entries and is removed from browser history');
  await navigate(origin);await click('[data-action="locked"]');assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),8);assert.equal(await evaluate('document.querySelector("#detail-dialog").open'),false);pass('Saved owner key automatically opens Locked after a real reload');
  for(const version of ['95','98','2000','xp','system7','mac9','ubuntu','kde']){await evaluate('window.TimVersion.set('+JSON.stringify(version)+')');await click('[data-action="locked"]');assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),8);assert.equal(await evaluate('document.querySelector("#detail-dialog").open'),false);}pass('Owner access and all eight private entries survive switching between every desktop platform');
  assert.equal(await evaluate('document.querySelector(".locked-project[data-id=cham-care]").hidden'),false);await evaluate('window.TimPower.start("restart")');await click('.power-skip');await click('.power-skip');await click('[data-action="locked"]');await until(()=>evaluate('document.querySelectorAll(".locked-project:not([hidden])").length===8'),'owner folder after restart');pass('ChamCare is owner-only and restarting preserves all eight encrypted catalogue entries');
  await evaluate('window.TimVersion.set("95")');
  await click('[data-category="All projects"]');assert.equal(await evaluate('document.querySelectorAll(".locked-project:not([hidden])").length'),0);pass('Private entries remain excluded from All projects even for the owner');
  const keyFlags=await evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.open('timbuilds-owner-v1',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('keys','readonly'),q=tx.objectStore('keys').get('catalogue');q.onsuccess=()=>{resolve({extractable:q.result.extractable,algorithm:q.result.algorithm.name});db.close();};};r.onerror=()=>reject(r.error);})`);assert.deepEqual(keyFlags,{extractable:false,algorithm:'AES-GCM'});pass('Browser persists a non-exportable CryptoKey, not a plaintext localStorage flag');
  await navigate(origin+'/#owner-key='+'A'.repeat(43));await until(()=>evaluate('document.querySelector("#detail-dialog")?.open'),'invalid enrollment result');assert.equal(await evaluate('document.querySelectorAll(".locked-project").length'),0);await click('.dialog-close');pass('Wrong decryption key fails closed');
  await evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase('timbuilds-owner-v1');r.onsuccess=resolve;r.onerror=()=>reject(r.error);})`);await navigate(origin);await click('[data-action="locked"]');await until(()=>evaluate('!!document.querySelector("#bsod-dialog[open] .access-terminal")'),'guest terminal after owner-key lookup');assert.ok(await evaluate('!!document.querySelector(".access-terminal")'));await click('#bsod-dialog [data-bsod-action="desktop"]');pass('Clearing the browser key removes owner access');
 }
 const blocked=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}});Object.defineProperty(window,'indexedDB',{get(){throw new DOMException('denied','SecurityError')}});`});await navigate(origin);await click('[data-action="locked"]');await until(()=>evaluate('!!document.querySelector("#bsod-dialog[open] .access-terminal")'),'guest terminal after owner-key lookup');assert.ok(await evaluate('!!document.querySelector(".access-terminal")'));await click('#bsod-dialog [data-bsod-action="desktop"]');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:blocked.identifier});pass('Blocked browser storage does not break public browsing or the puzzle');
 await viewport(390,844);await navigate(origin);await click('[data-action="maximize"]');assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);await click('[data-action="maximize"]');pass('Mobile maximise and restore remain usable');
 await viewport(1440,1000);await navigate(origin);await evaluate('window.TimDesktop.resetWindow();window.TimDesktop.arrange()');await screenshot(path.join(output,'desktop.png'));

 await evaluate('document.querySelector("#portfolio-window > .titlebar").focus()');const keyboardBefore=await box('#portfolio-window');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});assert.equal((await box('#portfolio-window')).x,keyboardBefore.x-10);await evaluate('document.querySelector(".resize-grip").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});assert.equal((await box('#portfolio-window')).w,keyboardBefore.w-10);pass('Keyboard title-bar movement and resize grip');
 await viewport(390,844);await click('[data-action="close-projects"]');await evaluate('window.scrollTo(0,0)');await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});const touchIcon=await box('.desktop-shortcut[data-action="projects"]');await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touchIcon.x+touchIcon.w/2,y:touchIcon.y+touchIcon.h/2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(200);assert.equal(await evaluate('document.querySelector("#portfolio-window").hidden'),false);await send('Emulation.setTouchEmulationEnabled',{enabled:false});pass('Emulated touchscreen single tap reopens My Projects');
 assert.deepEqual(errors,[]);pass('No runtime JavaScript errors');
 fs.writeFileSync(path.join(output,'browser-checks.json'),JSON.stringify({checks,origin,browser:'installed Chrome, separate disposable profile',timestamp:new Date().toISOString(),limits:'Not a physical-phone or formal accessibility certification.'},null,2));
 console.log(`PASS: ${checks.length} browser check groups. Screenshots in .qa/.`);
}catch(error){try{await screenshot(path.join(output,"failure.png"));console.error("Viewport diagnostic",await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+.5&&e.getBoundingClientRect().width>0).slice(0,18).map(e=>({tag:e.tagName,id:e.id,classes:String(e.className),right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width}))})'));}catch{}console.error(error);process.exitCode=1;}
finally{
 if(ws&&ws.readyState===WebSocket.OPEN){try{await send('Browser.close');}catch{}ws.close();}
 server.close();await sleep(700);if(browser.exitCode===null)browser.kill();
 try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200});}catch{console.log('Own temporary Chrome profile retained for lock cleanup: '+profile);}
}
