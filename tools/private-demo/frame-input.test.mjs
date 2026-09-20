import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./frame.js',import.meta.url),'utf8').split('/* Mouse-compatible touchpad bridge:')[1];assert.ok(source);
const parent={},events=[],listeners=[];const origin='https://fixture.invalid';
class InputEvent{constructor(type,props){Object.assign(this,{type},props);}}
const target={dispatchEvent:e=>events.push(e)},context={parent,window:{addEventListener:(type,fn)=>listeners.push(fn)},document:{body:{dataset:{parentOrigin:origin}},elementFromPoint:()=>target},PointerEvent:InputEvent,MouseEvent:InputEvent,Number};
vm.runInNewContext(source.slice(source.indexOf('*/')+2),context);
function input(action,extra={}){listeners[0]({source:parent,origin,data:{type:'classic-demo-pointer',action,x:220,y:240},...extra});}
input('down');assert.equal(events.find(e=>e.type==='mousedown').buttons,1);
input('move');input('move');assert.ok(events.filter(e=>e.type==='mousemove').every(e=>e.buttons===1));assert.equal(events.filter(e=>e.type==='mouseup').length,0,'held input is not collapsed into a click');
input('up');assert.equal(events.filter(e=>e.type==='mouseup').at(-1).buttons,0);assert.equal(events.filter(e=>e.type==='mousedown').length,1);
input('move');assert.equal(events.filter(e=>e.type==='mousemove').at(-1).buttons,0);
const clicks=events.filter(e=>e.type==='click').length;input('down');input('cancel');assert.equal(events.at(-1).type,'mouseup');assert.equal(events.at(-1).buttons,0);assert.equal(events.filter(e=>e.type==='click').length,clicks,'cancel does not synthesize a click');
const count=events.length;input('down',{origin:'https://other.invalid'});input('down',{source:{}});input('unknown');input('down',{data:{type:'classic-demo-pointer',action:'down',x:NaN,y:20}});assert.equal(events.length,count,'untrusted and invalid inputs ignored');
console.log('PASS actual frame bridge emits sustained buttons=1 mouse moves, one release, cancel without click, and rejects wrong source/origin.');