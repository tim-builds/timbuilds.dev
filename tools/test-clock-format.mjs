import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../portfolio/site.js',import.meta.url),'utf8');
const actual=source.match(/^  function updateClock\(\)\{[^\n]+\}$/m)?.[0];
assert.ok(actual,'Exercise the production clock formatter, not a copied implementation.');
const nodes={'#clock':{},'#year':{}},ctx=vm.createContext({$:id=>nodes[id],String});
for(let minute=0;minute<1440;minute++){
 const hour=Math.floor(minute/60),part=minute%60,date=new Date(2026,0,15,hour,part);
 ctx.Date=class{constructor(){return date;}};vm.runInContext(actual+';updateClock();',ctx);
 const text=nodes['#clock'].textContent,match=text.match(/^([1-9]|1[0-2]):([0-5]\d) (AM|PM)$/);
 assert.ok(match,'Unpadded 12-hour hour / padded minute / uppercase AM or PM: '+text);
 assert.equal(Number(match[1])%12,hour%12);assert.equal(Number(match[2]),part);assert.equal(match[3],hour<12?'AM':'PM');
 assert.equal(nodes['#clock'].dateTime,date.toISOString());assert.equal(nodes['#year'].textContent,'2026');
}
console.log('PASS: production clock format for all 1,440 minutes, including midnight/noon, unpadded hours, padded minutes and AM/PM.');
