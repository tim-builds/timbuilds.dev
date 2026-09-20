import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const window={};vm.runInNewContext(fs.readFileSync(new URL('./touchpad.js',import.meta.url),'utf8'),{window,AbortController,performance});
class Pad extends EventTarget {captures=new Set();setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);}}
const pad=new Pad();let time=0,taps=0,cancels=0,dx=0,dy=0;
const gesture=window.TimDemoTouchpad.mount({element:pad,move:(x,y)=>{dx+=x;dy+=y;},tap:()=>taps++,cancel:()=>cancels++,now:()=>time});
function event(type,x=50,y=50,extra={}){const e=new Event(type,{cancelable:true});Object.assign(e,{clientX:x,clientY:y,pointerId:1,pointerType:'touch',button:0,buttons:type==='pointerup'?0:1,isPrimary:true,...extra});pad.dispatchEvent(e);return e;}
assert.equal(event('pointerdown').defaultPrevented,true);time+=70;event('pointerup');assert.equal(taps,1);
event('pointerdown');event('pointermove',53,52);time+=50;event('pointerup',53,52);assert.equal(taps,2,'small finger jitter is a click');
event('pointerdown');event('pointermove',85,50);event('pointermove',50,50);time+=50;event('pointerup');assert.equal(taps,2,'drag returning to origin is not a tap');
event('pointerdown',20,30);event('pointermove',60,80);time+=50;event('pointerup',65,90);assert.equal(taps,2);assert.ok(dx>40&&dy>50,'relative movement uses final release coordinate too');
event('pointerdown');time+=500;event('pointerup');assert.equal(taps,2,'long contact does not accidentally click');
event('pointerdown');event('pointercancel');event('pointerup');assert.equal(taps,2);assert.equal(cancels,1);
event('pointerdown');event('lostpointercapture');event('pointerup');assert.equal(taps,2);assert.equal(cancels,2);
event('pointerdown');event('pointerup',50,50,{pointerId:2,isPrimary:false});time+=50;event('pointerup');assert.equal(taps,3,'other finger does not end first touch');
event('pointerdown',50,50,{isPrimary:false,pointerId:2});event('pointerup',50,50,{isPrimary:false,pointerId:2});assert.equal(taps,3,'secondary-only gesture ignored');
event('pointerdown');gesture.cancel();event('pointerup');assert.equal(cancels,3);assert.equal(taps,3);
event('pointerdown',50,50,{pointerType:'mouse'});event('pointermove',60,50,{pointerType:'mouse',buttons:0});assert.equal(cancels,4);
gesture.destroy();event('pointerdown');time+=60;event('pointerup');assert.equal(taps,3,'destroy removes listeners');
console.log('PASS: tap/jitter, movement, drag-back, long contact, cancellation, capture loss, primary pointer isolation, mouse release and cleanup.');