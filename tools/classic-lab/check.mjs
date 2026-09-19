import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {connect,sleep} from './browser.mjs';
const origin=process.argv[2]||'http://127.0.0.1:8796';
if(new URL(origin).hostname!=='127.0.0.1')throw Error('This private test refuses non-loopback origins.');
const output=path.resolve('.qa/classic-integration');fs.mkdirSync(output,{recursive:true});
const b=await connect(),checks=[];const pass=s=>{checks.push(s);console.log('PASS:',s);};
try{
 for(const route of ['/.qa/classic-config.json','/.git/config','/tools/classic-lab/serve.mjs','/__classic__/game/golf/missing.cct'])assert.equal((await fetch(origin+route)).status,404);
 assert.equal(await new Promise((resolve,reject)=>{http.get(origin+'/',{headers:{Host:'attacker.invalid'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject);}),403);pass('Private config, source internals, missing files and foreign Host headers are not served');
 await b.send('Page.navigate',{url:origin+'/'});await b.until(()=>b.evaluate('!!window.TimClassicLab'),'desktop and local entries');
 await b.evaluate('localStorage.setItem("classic-secret-test","not-for-games");window.TimWindows.showDesktop()');
 const entries=await b.evaluate('window.TimClassicLab.ids');assert.equal(entries.length,2);
 for(const id of entries){
  await b.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await b.evaluate(`window.TimApps.open(${JSON.stringify(id)});true`);await b.until(()=>b.evaluate(`document.querySelector('#window-${id}').dataset.classicReady==='true'`),id+' movie');
  await b.evaluate(`window.__retainedFrame=document.querySelector('#window-${id} iframe').contentWindow;true`);
  assert.equal(await b.evaluate(`(()=>{try{void document.querySelector('#window-${id} iframe').contentWindow.document;return false;}catch{return true;}})()`),true);
  assert.equal(await b.evaluate(`document.querySelector('#window-${id} iframe').getAttribute('sandbox')`),'allow-scripts');
  await b.click(`#window-${id} [data-classic-pause]`);await b.until(()=>b.evaluate(`document.querySelector('#window-${id}').dataset.classicPlaying==='false'`),id+' pause');
  const stopped=await b.evaluate(`document.querySelector('#window-${id}').dataset.classicFrame`);await sleep(800);assert.equal(await b.evaluate(`document.querySelector('#window-${id}').dataset.classicFrame`),stopped);
  await b.click(`#window-${id} [data-classic-pause]`);await b.until(()=>b.evaluate(`document.querySelector('#window-${id}').dataset.classicPlaying==='true'`),id+' resume');
  await b.evaluate(`window.TimWindows.minimize('${id}')`);await b.until(()=>b.evaluate(`document.querySelector('#window-${id}').dataset.classicPlaying==='false'`),id+' minimize');
  await b.evaluate(`window.TimWindows.show('${id}')`);await b.until(()=>b.evaluate(`document.querySelector('#window-${id}').dataset.classicPlaying==='true'`),id+' restore');
  assert.equal(await b.evaluate(`document.querySelector('#window-${id} iframe').contentWindow===window.__retainedFrame`),true);
  for(const width of [320,390,1440]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await sleep(400);
   if(!await b.evaluate(`document.querySelector('#window-${id}').classList.contains('is-maximized')`))await b.click(`#window-${id} [data-classic-expand]`);
   await sleep(350);
   const size=await b.evaluate(`(()=>{const s=document.querySelector('#window-${id} [data-classic-stage]').getBoundingClientRect(),r=document.querySelector('#window-${id} iframe').getBoundingClientRect();return {sx:s.x,sy:s.y,sw:s.width,sh:s.height,x:r.x,y:r.y,w:r.width,h:r.height};})()`);
   assert.ok(Math.abs(size.w/size.h-640/420)<.001);assert.ok(size.x>=size.sx-1&&size.y>=size.sy-1&&size.x+size.w<=size.sx+size.sw+1&&size.y+size.h<=size.sy+size.sh+1);
   assert.equal(await b.evaluate(`document.querySelector('#window-${id} iframe').contentWindow===window.__retainedFrame`),true);
   await b.screenshot(path.join(output,id+'-'+width+'.png'));
  }
  assert.equal(await b.evaluate('localStorage.getItem("classic-secret-test")'),'not-for-games');
  await b.evaluate(`window.TimWindows.close('${id}')`);assert.equal(await b.evaluate(`document.querySelectorAll('#window-${id} iframe').length`),0);
  await b.evaluate(`window.TimApps.open('${id}');true`);await b.until(()=>b.evaluate(`document.querySelector('#window-${id}').dataset.classicReady==='true'`),id+' fresh reopen');
  assert.equal(await b.evaluate(`document.querySelector('#window-${id} iframe').contentWindow===window.__retainedFrame`),false);await b.evaluate(`window.TimWindows.close('${id}')`);
  pass(id+': opaque sandbox, pause/resume/minimize/restore, proportional resizing at 320/390/1440px, cleanup and fresh reopen');
 }
 assert.deepEqual(b.errors,[]);pass('No top-level runtime errors; desktop storage sentinel retained');
 fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({checks,timestamp:new Date().toISOString(),origin,limitations:'Private compatibility only; not permission clearance, completed rounds, all AI behavior, auditory fidelity or physical-phone certification.'},null,2));
}catch(error){await b.screenshot(path.join(output,'failure.png')).catch(()=>{});throw error;}
finally{await b.close();}
