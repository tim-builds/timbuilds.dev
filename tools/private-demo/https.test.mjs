import {checkTouchpad} from './touchpad.browser.mjs';
/** Local-only HTTPS integration test; credentials are generated for this fixture only. */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {connect,sleep} from '../classic-lab/browser.mjs';
const dir=path.resolve('.qa/private-demo/https-test');fs.mkdirSync(dir,{recursive:true});
const source=JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8'));
const origin='https://localhost:8810',password=randomBytes(18).toString('base64url');
const config={privateTest:true,ownerOnly:true,engine:source.engine,games:source.games,originFile:path.join(dir,'origin.txt'),passwordHash:createHash('sha256').update(password).digest('hex')};
fs.writeFileSync(config.originFile,origin);fs.writeFileSync(path.join(dir,'config.json'),JSON.stringify(config));
const openssl=process.platform==='win32'?'C:/Program Files/Git/usr/bin/openssl.exe':'openssl';
const cert=path.join(dir,'cert.pem'),key=path.join(dir,'key.pem');
const made=spawnSync(openssl,['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',key,'-out',cert,'-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost'],{stdio:'ignore'});
assert.equal(made.status,0,'local test certificate creation');
const gateway=spawn(process.execPath,['tools/private-demo/serve.mjs',path.join(dir,'config.json'),'8808'],{stdio:'ignore',windowsHide:true});
const tls=https.createServer({key:fs.readFileSync(key),cert:fs.readFileSync(cert)},(req,res)=>{
 const upstream=http.request({host:'127.0.0.1',port:8808,path:req.url,method:req.method,headers:{...req.headers,'x-forwarded-proto':'https'}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',()=>res.writeHead(502).end());req.pipe(upstream);
});
await new Promise(r=>tls.listen(8810,'127.0.0.1',r));await sleep(500);const b=await connect();
try{
 await b.send('Security.setIgnoreCertificateErrors',{ignore:true});
 await b.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 await b.send('Page.navigate',{url:origin});await b.until(()=>b.evaluate('!!document.querySelector("#password")'),'local fixture login');
 await b.evaluate(`document.querySelector('#password').value=${JSON.stringify(password)};true`);await b.click('button[type="submit"]');
 await b.until(()=>b.evaluate('!!window.TimClassicLab'),'authenticated desktop',30000);
 await b.evaluate('(()=>{const original=window.TimDemoTouchpad.mount;window.TimDemoTouchpad={mount:opts=>original({...opts,tap:()=>{window.__tapProof=(window.__tapProof||0)+1;opts.tap();},press:()=>{const held=opts.press();if(held)(window.__gestureProof||=[]).push("down");return held;},release:cancelled=>{(window.__gestureProof||=[]).push(cancelled?"cancel-up":"up");opts.release(cancelled);}})};return true;})()');
 assert.equal(await b.evaluate('window.TimVersion.current()'),'xp');assert.equal(await b.evaluate('window.TimWindows.list().find(w=>w.id==="projects").maximized'),true);assert.equal(await b.evaluate('!!document.querySelector("#task-manager-button")'),false);assert.equal(await b.evaluate('window.TimVersion.selection().placement'),'fit');
 console.log('PASS real login form, Secure cookie, HTTPS proxy and private desktop (local fixture).');
 for(const id of ['billiards','golf']){
  await b.evaluate(`window.TimApps.open('lab-${id}');true`);
  await b.until(()=>b.evaluate(`document.querySelector('#window-lab-${id}')?.dataset.classicReady==='true'`),id+' authenticated prefix load',60000);
  await sleep(1200);await b.click(`#window-lab-${id} [data-classic-expand]`);await sleep(400);
  assert.equal(await b.evaluate(`document.querySelector('#window-lab-${id} iframe').getAttribute('sandbox')`),'allow-scripts');
  await b.screenshot(path.join(dir,id+'.png'));console.log('PASS',id,'game and emulator load through session-bound capability path in opaque iframe.');
  await checkTouchpad(b,dir,id);
  if(await b.evaluate('!!document.fullscreenElement'))await b.evaluate('document.exitFullscreen()');
  await b.evaluate(`window.TimWindows.close('lab-${id}');true`);
 }
 await b.evaluate('(async()=>{const entries=await (await fetch("/__classic__/config.json")).json();window.__fixtureEntry=entries[0].frame;return true;})()');
 assert.equal(await b.evaluate('document.cookie.includes("__Host-timbuilds_demo")'),false,'session is HttpOnly');
 await b.evaluate('fetch("/__auth/logout",{method:"POST"}).then(r=>r.status)');
 assert.equal(await b.evaluate('fetch(window.__fixtureEntry).then(r=>r.status)'),401,'ticket revoked by logout');
 assert.equal(await b.evaluate('fetch("/__classic__/config.json").then(r=>r.status)'),401,'config revoked');
 assert.deepEqual(b.errors,[]);console.log('PASS HttpOnly cookie, logout revocation and no top-level browser exceptions.');
 fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify({passed:true,scope:'Local HTTPS fixture only. Not the live tunnel login, not physical phone or full rounds.',timestamp:new Date().toISOString()},null,2));
}catch(error){await b.screenshot(path.join(dir,'failure.png'));console.log('Fixture diagnosis:',await b.evaluate('JSON.stringify({url:location.pathname,title:document.title,text:document.body.innerText.slice(0,600),apps:!!window.TimApps,menu:!!window.TimStartMenu,lab:!!window.TimClassicLab})'));console.log('Browser exceptions:',JSON.stringify(b.errors));throw error;}finally{await b.close();tls.closeAllConnections();await new Promise(r=>tls.close(r));gateway.kill();}