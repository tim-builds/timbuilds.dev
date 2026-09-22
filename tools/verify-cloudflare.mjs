import {execFileSync} from 'node:child_process';
/* Read-only checks of a candidate Pages deployment against the exact public export. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const origin=new URL(process.argv[2]||'http://127.0.0.1:8798');
assert.ok(origin.protocol==='https:'||(origin.protocol==='http:'&&['127.0.0.1','localhost'].includes(origin.hostname)),'Use HTTPS except on loopback.');
assert.equal(origin.pathname,'/');assert.equal(origin.search,'');assert.equal(origin.hash,'');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.qa/cloudflare-export-manifest.json'),'utf8')).files;
// Hosted Linux checkouts use Git's bytes; Windows working copies may use CRLF.
const gitRef=process.argv.find(a=>a.startsWith('--git-ref='))?.slice(10)||null;
if(gitRef)assert.match(gitRef,/^[a-f0-9]{40}$/,'Pin a complete Git commit SHA');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');const report=[];
for(const entry of manifest){
 if(entry.path==='.nojekyll')continue;
 const response=await fetch(new URL(entry.path,origin),{signal:AbortSignal.timeout(20000)});
 assert.equal(response.status,200,entry.path+' is served');assert.equal(new URL(response.url).origin,origin.origin,'No cross-origin redirect');
 const expected=gitRef?hash(execFileSync('git',['show',gitRef+':'+entry.path],{cwd:root,maxBuffer:32*1024*1024})):entry.sha256;
 assert.equal(hash(Buffer.from(await response.arrayBuffer())),expected,entry.path+' is byte-identical');
 assert.equal(response.headers.get('clear-site-data'),null,'Do not clear visitors’ storage');
 if(entry.path.endsWith('.wasm'))assert.match(response.headers.get('content-type')||'',/application\/wasm/);
 report.push({path:entry.path,status:response.status,finalPath:new URL(response.url).pathname});
}
for(const p of ['/openhoops/reset','/openhoops/add-friend']){
 const response=await fetch(new URL(p,origin));assert.equal(response.status,200,p);
 assert.equal(hash(Buffer.from(await response.arrayBuffer())),hash(gitRef?execFileSync('git',['show',gitRef+':'+p.slice(1)+'.html'],{cwd:root,maxBuffer:32*1024*1024}):fs.readFileSync(path.join(root,p.slice(1)+'.html'))));
 if(p.endsWith('/reset'))assert.match(response.headers.get('cache-control')||'',/no-store/);
}
for(const p of ['/missing-migration-check','/openhoops/missing-migration-check','/.git/HEAD','/.qa/private-demo/config.json','/tools/build-cloudflare.mjs','/wrangler.jsonc','/CNAME','/__classic__/config.json','/__classic__/game/billiards/csplmain.dcr','/__classic__/game/golf/csmgholes.cct']){const response=await fetch(new URL(p,origin));assert.equal(response.status,404,p);assert.ok(!(await response.text()).includes('project-data'));}
const query=await fetch(new URL('/openhoops/court.html?g=11111111-1111-4111-8111-111111111111',origin));assert.equal(new URL(query.url).search,'?g=11111111-1111-4111-8111-111111111111');
fs.writeFileSync(path.join(root,'.qa/cloudflare-http-checks.json'),JSON.stringify({origin:origin.origin,sourceCommit:gitRef,byteSource:gitRef?'Git object':'local export',timestamp:new Date().toISOString(),checks:report},null,2));
console.log('PASS: '+report.length+' public files byte-identical; same-origin redirects, WASM MIME, OpenHoops clean URLs, query retention, true 404 and no storage clearing.');
