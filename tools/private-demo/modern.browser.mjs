import assert from 'node:assert/strict';import path from 'node:path';import {sleep} from '../classic-lab/browser.mjs';
export async function checkModernPrivate(b,dir,id){
 const selector='#window-lab-'+id;
 if(await b.evaluate('!!document.fullscreenElement'))await b.evaluate('document.exitFullscreen()');
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(250);
 await b.evaluate(`window.__modernRetainedFrame=document.querySelector('${selector} iframe').contentWindow;true`);
 for(const os of ['vista','10','11']){
  await b.evaluate(`window.TimVersion.set('${os}');window.TimWindows.showDesktop();true`);await sleep(220);
  await b.click('#start-button');assert.equal(await b.evaluate('document.querySelector("#start-menu").getBoundingClientRect().bottom<document.querySelector(".taskbar").getBoundingClientRect().top'),true);
  assert.equal(await b.evaluate('document.querySelectorAll("#start-menu [data-app-open=private-candystand]").length'),1,'private shortcut retained in each era menu');
  await b.click('#start-menu [data-app-open=games]');
  await b.evaluate('(()=>{const w=document.querySelector("#window-games"),f=w.querySelector(".explorer-navigation");f.querySelector("input").value="C:\\Games";f.requestSubmit();return true;})()');
  assert.equal(await b.evaluate('document.querySelectorAll("#window-games [data-entry=private-candystand]").length'),1);
  await b.click('#window-games [data-entry=private-candystand]');await b.click('#window-games [data-entry=lab-'+id+']');
  assert.equal(await b.evaluate(`document.querySelector('${selector} iframe').contentWindow===window.__modernRetainedFrame`),true,'theme change does not remount original game');
  await b.until(()=>b.evaluate(`document.querySelector('${selector}').dataset.classicPlaying==='true'`),'retained game playing');
  const point=await b.evaluate(`(()=>{const r=document.querySelector('${selector} [data-touchpad]').getBoundingClientRect();return {x:r.x+50,y:r.y+25,id:1}})()`);
  await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await sleep(430);assert.equal(await b.evaluate(`document.querySelector('${selector}').dataset.classicMouseHeld`),'true');
  await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,x:point.x+20,y:point.y+10}]});await sleep(100);assert.equal(await b.evaluate(`document.querySelector('${selector}').dataset.classicMouseHeld`),'true');
  await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(120);assert.equal(await b.evaluate(`document.querySelector('${selector}').dataset.classicMouseHeld`),'false');
  await b.screenshot(path.join(dir,`private-${os}-${id}.png`));
  const auth=await b.evaluate('fetch("/__classic__/config.json",{cache:"no-store"}).then(r=>r.status)');assert.equal(auth,200,'same authenticated session across OS change');
 }
 await b.evaluate('window.TimVersion.set("xp");true');
 console.log('PASS',id,'same live game iframe and login across Vista/10/11, private Games-folder routing, clear Start button and unchanged held touch.');
}
