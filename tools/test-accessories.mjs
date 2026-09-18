import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const context={};vm.runInNewContext(fs.readFileSync(new URL('../portfolio/classic-engines.js',import.meta.url),'utf8'),context);
const {Calculator,Mines}=context.TimClassicEngines;
const calculate=keys=>{const c=new Calculator();for(const key of keys)c.input(key);return c;};
for(const [keys,expected] of [[['2','+','3','=','=', '='],'11'],[['9','/','0','='],'Error'],[['2','0','0','+','1','0','%','='],'220'],[['1','.','5','*','2','='],'3'],[['9','sqrt'],'3'],[['8','1/x'],'0.125'],[['5','+/-'],'-5'],[['9','MS','C','MR'],'9'],[['1','2','BS'],'1'],[['2','+','*','3','='],'6']])assert.equal(calculate(keys).display,expected,keys.join(' '));
for(let trial=0;trial<250;trial++){
 let seed=trial+1;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const g=new Mines(9,10,random),first=trial%81;
 g.reveal(first);assert.equal(g.over,false);assert.equal(g.cells[first].count,0);assert.equal(g.cells.filter(c=>c.bomb).length,10);
 for(let i=0;i<81;i++)assert.equal(g.cells[i].count,g.neighbors(i).filter(j=>g.cells[j].bomb).length);
 const covered=g.cells.findIndex(c=>!c.open);g.flag(covered);g.reveal(covered);assert.equal(g.cells[covered].open,false);g.flag(covered);
 for(let i=0;i<81;i++)if(!g.cells[i].bomb)g.reveal(i);assert.ok(g.over&&g.won);assert.equal(g.cells.filter(c=>c.flag).length,10);
 const loss=new Mines(9,10,random);loss.reveal(0);loss.reveal(loss.cells.findIndex(c=>c.bomb));assert.ok(loss.over&&!loss.won);
}
console.log('PASS: 10 calculator scenarios and 250 minefields: safe first click, counts, flag protection, win and loss.');
