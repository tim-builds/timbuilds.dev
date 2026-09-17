import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(root,'portfolio/challenge-rules.js'),'utf8'),context);
const {makeStage,validate}=context.window.TimChallengeRules;
function route(stage){const seen=new Set(['0,0']),queue=[[0,0]];while(queue.length){const [x,y]=queue.shift();if(x===stage.size-1&&y===stage.size-1)return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,key=a+','+b;if(a>=0&&b>=0&&a<stage.size&&b<stage.size&&!stage.cells[b][a]&&!seen.has(key)){seen.add(key);queue.push([a,b]);}}}return false;}
const types=new Set();let tested=0;
for(const seed of [1,741103,4294967295])for(let n=0;n<512;n++){
 const s=makeStage(n,seed);types.add(s.type);assert.ok(s.hint.length>20);assert.ok(s.title);let answer=s.answer;
 if(s.type==='maze'){assert.ok(route(s),`Solvable maze at ${n}`);assert.ok(s.size<=9);answer={x:s.size-1,y:s.size-1};}
 if(s.type==='tiles')answer=s.tiles.flatMap((tile,i)=>tile.correct?[i]:[]);
 if(s.type==='memory'){assert.ok(s.sequence.length<=8);answer=s.sequence;}
 if(s.type==='order'){assert.ok(s.order.length<=9);answer=s.order.map((_,i)=>i+1);}
 assert.ok(validate(s,answer),`Layer ${n} of type ${s.type} has a valid solution`);
 assert.equal(validate(s,'not-the-answer'),false,`Wrong response is rejected at ${n}`);tested++;
}
assert.equal(types.size,9);assert.equal(makeStage(0,1).answer,'open');assert.equal(makeStage(1,1).answer,'1995');
for(const n of [10000,12345678,999999999]){const stage=makeStage(n,741103);assert.ok(stage.hint);assert.ok(types.has(stage.type));}
console.log(`PASS: ${tested} generated layers, nine challenge types, three seeds, valid/invalid responses, bounded sizes and reachable mazes.`);
