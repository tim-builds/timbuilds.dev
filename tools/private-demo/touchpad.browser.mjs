import assert from 'node:assert/strict';
import path from 'node:path';
import {sleep} from '../classic-lab/browser.mjs';
export async function checkTouchpad(b,dir,id){
 const win='#window-lab-'+id;
 // Inspect the emulator's actual Lingo mouse state, not a host callback or UI flag.
 const targets=await b.send('Target.getTargets');const target=targets.targetInfos.find(t=>t.type==='iframe'&&t.url.includes('/__classic__/frame.html')&&t.url.includes('game='+id));assert.ok(target,'opaque game debug target');
 const {sessionId}=await b.send('Target.attachToTarget',{targetId:target.targetId,flatten:true});
 const mouseDown=async()=>{const result=JSON.parse(await b.evaluate('Promise.resolve(__vm.mcp_eval_lingo("_mouse.mouseDown"))',sessionId));assert.equal(result.success,true);return Number(result.result_value);};
 assert.equal(await mouseDown(),0,id+' emulator initially released');
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
 // Actual browser touch contacts, not just toolbar commands or synthetic clicks.
 await b.evaluate('window.__gestureProof=[];true');
 let holdPoint={x:m.stage.x+100,y:m.stage.y+25};
 await touch('touchStart',holdPoint.x,holdPoint.y);await sleep(120);
 assert.equal(await b.evaluate(`document.querySelector('${win}').dataset.classicMouseHeld`),'false','short contact not prematurely held');
 await sleep(320);assert.equal(await b.evaluate(`document.querySelector('${win}').dataset.classicMouseHeld`),'true','stationary finger triggers mouse down before release');
 assert.deepEqual(await b.evaluate('window.__gestureProof'),['down']);assert.equal(await mouseDown(),1,id+' actual emulator sees finger-down before lift');
 const heldCursor=(await metrics()).cursor;
 await touch('touchMove',holdPoint.x+25,holdPoint.y+15);await sleep(700);
 assert.equal(await b.evaluate(`document.querySelector('${win}').dataset.classicMouseHeld`),'true','moving finger keeps mouse down');
 assert.ok((await metrics()).cursor.x>heldCursor.x+20);
 assert.deepEqual(await b.evaluate('window.__gestureProof'),['down'],'no repeating presses during hold');assert.equal(await mouseDown(),1,id+' actual emulator remains held during drag');
 await b.screenshot(path.join(dir,id+'-finger-held.png'));
 await touch('touchEnd');await sleep(120);
 assert.equal(await b.evaluate(`document.querySelector('${win}').dataset.classicMouseHeld`),'false','finger lift releases mouse');
 assert.deepEqual(await b.evaluate('window.__gestureProof'),['down','up']);assert.equal(await mouseDown(),0,id+' actual emulator releases on lift');
 assert.equal(await b.evaluate('window.__tapProof'),1,'hold release does not create another tap');
 m=await metrics();await touch('touchStart',m.stage.x+100,m.stage.bottom-25);await sleep(430);await touch('touchCancel');await sleep(100);
 assert.equal(await b.evaluate(`document.querySelector('${win}').dataset.classicMouseHeld`),'false');
 assert.deepEqual(await b.evaluate('window.__gestureProof'),['down','up','down','cancel-up']);assert.equal(await mouseDown(),0,id+' actual emulator releases on touchcancel');
 // Pausing while a contact is held must not leave a stuck button or a delayed press.
 await touch('touchStart',m.stage.x+90,m.stage.y+20);await sleep(430);
 await b.evaluate(`document.querySelector('${win} [data-classic-pause]').click();true`);await touch('touchEnd');await sleep(400);
 assert.equal(await b.evaluate(`document.querySelector('${win}').dataset.classicMouseHeld`),'false');
 await b.evaluate(`document.querySelector('${win} [data-classic-pause]').click();true`);
 assert.equal(await b.evaluate('window.__tapProof'),1);
 assert.equal(await mouseDown(),0,id+' pause leaves emulator released');
 console.log('PASS',id,'actual Lingo mouse state 0 -> 1 -> held during drag -> 0 on lift/cancel; real 350ms finger hold, sustained down during drag, lift-to-release, yellow pointer feedback, cancel and pause cleanup.');
 await b.click(win+' [data-classic-hold]');assert.equal(await b.evaluate(`document.querySelector('${win} [data-classic-hold]').textContent`),'Release');
 await touch('touchStart',m.stage.x+100,m.stage.y+20);await touch('touchCancel');await sleep(100);
 assert.equal(await b.evaluate(`document.querySelector('${win} [data-classic-hold]').textContent`),'Hold','cancel releases held mouse');assert.equal(await b.evaluate('window.__tapProof'),1,'cancel does not click');
 await b.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await sleep(350);
 m=await metrics();assert.deepEqual(m.pad,m.stage,'full area also works in landscape');assert.equal(await b.evaluate(`document.querySelector('${win} iframe').contentWindow===window.__retainedGameFrame`),true,'rotation retains running game');
 await b.screenshot(path.join(dir,id+'-landscape-touchpad.png'));
 await b.send('Target.detachFromTarget',{sessionId});
 console.log('PASS',id,'top/bottom black-margin dragging, arrow cursor, tap-to-click, drag/cancel exclusion and retained landscape game.');
}