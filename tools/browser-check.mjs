/** Optional, dependency-free Chrome checks. Uses its own temporary profile and loopback server. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const chrome=process.env.PORTFOLIO_CHROME || (process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/chromium');
assert.ok(fs.existsSync(chrome),'Set PORTFOLIO_CHROME to an installed Chrome/Chromium executable.');
const output=path.join(root,'.qa');fs.mkdirSync(output,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'timbuilds-browser-'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let relative;
 try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(relative==='/')relative='/index.html';
 const file=path.resolve(root,'.'+relative);
 if(!file.startsWith(root+path.sep)||relative.split('/').some(p=>p.startsWith('.'))){res.writeHead(403).end();return;}
 try{const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);}catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=process.env.PORTFOLIO_ORIGIN || `http://127.0.0.1:${server.address().port}`;
const browser=spawn(chrome,['--headless=new','--no-first-run','--disable-default-apps','--disable-background-networking','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
let ws;let nextId=1;const pending=new Map();const errors=[];const checks=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn,label){for(let i=0;i<100;i++){if(await fn())return;await sleep(100);}throw new Error(`Timed out: ${label}`);}
function send(method,params={}){return new Promise((resolve,reject)=>{const id=nextId++;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},12000);pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+': '+r.exceptionDetails.exception?.description);return r.result.value;}
async function click(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);}
function pass(label){checks.push(label);console.log('PASS: '+label);}
async function navigate(url){await send('Page.navigate',{url});await until(()=>evaluate('document.readyState === "complete" && !!document.querySelector("#project-data")'),'page load');await sleep(180);}
async function viewport(width,height=900){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(80);}
async function screenshot(file,clip){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,...(clip?{clip}:{})});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
try{
 const active=path.join(profile,'DevToolsActivePort');await until(()=>fs.existsSync(active),'Chrome startup');
 const port=fs.readFileSync(active,'utf8').split(/\r?\n/)[0];
 const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);message.error?waiter.reject(new Error(message.error.message)):waiter.resolve(message.result);}else if(message.method==='Runtime.exceptionThrown'){errors.push(message.params.exceptionDetails.text);}});
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 await send('Page.enable');await send('Runtime.enable');await viewport(1440,1100);await navigate(origin);
 assert.equal(await evaluate('document.querySelectorAll(".project-card").length'),20);pass('20 static project entries');
 for(const [category,count] of [['Apps',3],['Games',2],['Websites',5],['Tools',5],['Experiments',5],['All projects',20]]){await click(`.folder-button[data-category="${category}"]`);assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),count);}pass('Every category filter');
 await evaluate('const q=document.querySelector("#project-search");q.value="grandma";q.dispatchEvent(new Event("input"));');assert.equal(await evaluate('document.querySelectorAll(".project-card:not([hidden])").length'),2);
 await evaluate('document.querySelector("#project-search").value="no-matching-project";document.querySelector("#project-search").dispatchEvent(new Event("input"));');assert.equal(await evaluate('document.querySelector("#empty-state").hidden'),false);await click('[data-action="reset-filters"]');pass('Search and empty-state recovery');
 await click('[data-view="list"]');assert.ok(await evaluate('document.querySelector("#project-grid").classList.contains("is-list")'));await click('[data-view="grid"]');pass('Grid and list views');
 await click('.project-card h3 [data-project="letters-with-lola"]');assert.equal(await evaluate('location.hash'),'#project-letters-with-lola');assert.ok(await evaluate('document.querySelector("#detail-dialog").open'));
 await evaluate('history.back()');await until(()=>evaluate('!document.querySelector("#detail-dialog").open'),'Back closes project dialog');pass('Project URL state and browser Back');
 await navigate(origin+'/#project-openhoops');assert.ok(await evaluate('document.querySelector("#detail-dialog").open'));assert.ok((await evaluate('document.querySelector("#dialog-title").textContent')).includes('OpenHoops'));await click('.dialog-close');pass('Direct project link opens and closes');
 for(const id of JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8')).map(p=>p.id)){
  await click(`.project-card h3 [data-project="${id}"]`);await until(()=>evaluate('document.querySelector(".project-detail-preview").complete && document.querySelector(".project-detail-preview").naturalWidth>0'),'project image');await click('.dialog-close');
 }pass('All project dialogs and local artwork');
 await click('.desktop-shortcut[data-dialog="display"]');await click('.wallpaper-option[data-wallpaper="night"]');await click('.dialog-close');await navigate(origin);assert.equal(await evaluate('document.documentElement.dataset.wallpaper'),'night');await click('.desktop-shortcut[data-dialog="display"]');await click('.wallpaper-option[data-wallpaper="teal"]');await click('.dialog-close');pass('Wallpaper persists across a real page load');
 await click('#start-button');assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),false);await click('#start-button');
 await click('[data-action="minimize"]');assert.ok(await evaluate('document.querySelector("#portfolio-window").hidden'));await click('.task-button');assert.equal(await evaluate('document.querySelector("#portfolio-window").hidden'),false);pass('Start menu and minimise/restore');
 for(const width of [320,390,600,768,1024,1440,1920]){await viewport(width);assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'),false,`horizontal overflow at ${width}`);}pass('Responsive widths 320–1920 px');
 await viewport(390,844);await evaluate('window.scrollTo(0,0)');await screenshot(path.join(output,'mobile.png'));
 await viewport(1440,1100);await evaluate('window.scrollTo(0,0);document.activeElement.blur()');await screenshot(path.join(output,'desktop.png'));
 if(process.argv.includes('--capture-social')){await viewport(1280,720);await evaluate('window.scrollTo(0,0)');await screenshot(path.join(root,'portfolio/social.png'),{x:0,y:0,width:1280,height:672,scale:.9375});pass('Social preview generated from this actual website');}
 assert.deepEqual(errors,[]);pass('No runtime JavaScript errors');
 fs.writeFileSync(path.join(output,'browser-checks.json'),JSON.stringify({checks,origin,browser:'installed Chrome, separate disposable profile',timestamp:new Date().toISOString(),limits:'Not a physical-phone or formal accessibility certification.'},null,2));
 console.log(`PASS: ${checks.length} browser check groups. Screenshots in .qa/.`);
}catch(error){console.error(error);process.exitCode=1;}
finally{
 if(ws&&ws.readyState===WebSocket.OPEN){try{await send('Browser.close');}catch{}ws.close();}
 server.close();await sleep(700);if(browser.exitCode===null)browser.kill();
 try{fs.rmSync(profile,{recursive:true,force:true});}catch{console.log('Own temporary Chrome profile retained for lock cleanup: '+profile);}
}
