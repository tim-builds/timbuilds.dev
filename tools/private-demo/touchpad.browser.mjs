import assert from 'node:assert/strict';
import path from 'node:path';
import {sleep} from '../classic-lab/browser.mjs';
export async function checkTouchpad(b,dir,id){
 const win='#window-lab-'+id;
 const metrics=()=>b.evaluate(`(()=>{const w=document.querySelector('${win}'),box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}};return {stage:box(w.querySelector('[data-classic-stage]')),pad:box(w.querySelector('[data-touchpad]')),frame:box(w.querySelector('iframe')),cursor:box(w.querySelector('[data-cursor]')),arrow:!!w.querySelector('[data-cursor] svg path')};})()`);
 const touch=(type,x,y)=>b.send('Input.dispatchTouchEvent',{type,touchPoints:x===undefined?[]:[{x,y,id:1,radiusX:3,radiusY:3,force:.8}]});
 async function drag(x,y,dx,dy){await touch('touchStart',x,y);await sleep(50);for(let i=1;i<=4;i++){await touch('touchMove',x+dx*i/4,y+dy*i/4);await sleep(25);}await touch('touchEnd');await sleep(100);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(350);
 let m=await metrics();assert.deepEqual(m.pad,m.stage,'touch surface covers the entire stage');assert.ok(m.arrow,'mouse arrow replaces circle');assert.ok(m.frame.y-m.stage.y>30&&m.stage.bottom-m.frame.bottom>30,'portrait has usable black margins');
 await b.evaluate(`window.__retainedGameFrame=document.querySelector('${win} iframe').contentWindow;window.__tapProof=0;true`);
 const initial=m.cursor;
 await drag(m.stage.x+100,m.stage.y+15,24,15);m=await metrics();assert.ok(m.cursor.x>initial.x+20&&m.cursor.y>initial.y+10,'dragging above game moves cursor');
 const above=m.cursor;await drag(m.stage.x+180,m.stage.bottom-15,-18,-12);m=await metrics();assert.ok(m.cursor.x<above.x-14&&m.cursor.y<above.y-8,'dragging below game moves cursor');
 assert.equal(await b.evaluate('window.__tapProof'),0,'drags do not click');
 if(id==='billiards'){
  const desired={x:m.frame.x+200*m.frame.w/640,y:m.frame.y+325*m.frame.h/420};
  await drag(m.stage.x+m.stage.w/2,m.stage.y+70,desired.x-m.cursor.x,desired.y-m.cursor.y);
 }
 m=await metrics();const before=m.cursor;
 await touch('touchStart',m.stage.x+20,m.stage.y+20);await sleep(65);await touch('touchEnd');await sleep(700);
 assert.equal(await b.evaluate('window.__tapProof'),1,'one margin tap invokes one click');
 assert.deepEqual((await metrics()).cursor,before,'tapping black margin clicks at existing cursor, not at finger');
 if(id==='billiards')await b.until(()=>b.evaluate(`Number(document.querySelector('${win}').dataset.classicFrame)>=30`),'black-margin tap chooses billiards table');
 await b.screenshot(path.join(dir,id+'-full-margin-touchpad.png'));
 await b.click(win+' [data-classic-hold]');assert.equal(await b.evaluate(`document.querySelector('${win} [data-classic-hold]').textContent`),'Release');
 await touch('touchStart',m.stage.x+100,m.stage.y+20);await touch('touchCancel');await sleep(100);
 assert.equal(await b.evaluate(`document.querySelector('${win} [data-classic-hold]').textContent`),'Hold','cancel releases held mouse');assert.equal(await b.evaluate('window.__tapProof'),1,'cancel does not click');
 await b.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await sleep(350);
 m=await metrics();assert.deepEqual(m.pad,m.stage,'full area also works in landscape');assert.equal(await b.evaluate(`document.querySelector('${win} iframe').contentWindow===window.__retainedGameFrame`),true,'rotation retains running game');
 await b.screenshot(path.join(dir,id+'-landscape-touchpad.png'));
 console.log('PASS',id,'top/bottom black-margin dragging, arrow cursor, tap-to-click, drag/cancel exclusion and retained landscape game.');
}