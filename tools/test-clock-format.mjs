import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../portfolio/clock-format.js',import.meta.url),'utf8'),context);
const format=context.window.TimClock.format;
for(let h=0;h<24;h++)for(let m=0;m<60;m++){
 const text=format(new Date(2026,8,20,h,m));
 assert.match(text,/^(?:[1-9]|1[0-2]):[0-5][0-9] (?:AM|PM)$/);
 assert.equal(text.endsWith('AM'),h<12);assert.equal(Number(text.split(':')[0]),h%12||12);
}
for(const [h,m,wanted]of [[0,0,'12:00 AM'],[9,5,'9:05 AM'],[12,0,'12:00 PM'],[13,7,'1:07 PM'],[23,59,'11:59 PM']])assert.equal(format(new Date(2026,8,20,h,m)),wanted);
assert.equal(format(new Date('invalid')),'--:--');console.log('PASS all 1,440 local minutes, AM/PM, noon/midnight, no leading hour zero and invalid-date fallback.');
