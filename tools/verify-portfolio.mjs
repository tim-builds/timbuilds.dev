import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.equal(new Set(data.map(p=>p.id)).size,data.length,'Unique project identifiers');
assert.ok(data.length > 0, 'Catalogue is not empty');
for (const p of data) {
 assert.match(p.id,/^[a-z0-9-]+$/);
 for(const key of ['title','category','status','summary','detail','icon','preview']) assert.ok(typeof p[key]==='string'&&p[key].trim(),`${p.id}: ${key}`);
 assert.ok(['Apps','Games','Websites','Tools','Experiments'].includes(p.category));
 assert.ok(p.stack.length>0);
 assert.ok(fs.existsSync(path.join(root,'portfolio/previews',p.preview+'.svg')));
 assert.ok(html.includes(`data-id="${p.id}"`),`${p.id} is rendered without JS`);
 if(p.url){assert.ok(p.url.startsWith('https://')||p.url==='/openhoops/');assert.ok(p.cta);}
 if(p.source){assert.ok(p.source.startsWith('https://github.com/'));assert.equal(p.source,p.url);}
}
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const url=match[1].split('#')[0].split('?')[0];
 if(/^(https?:|mailto:|\/openhoops\/)/.test(url)||url.startsWith('openhoops/'))continue;
 assert.ok(fs.existsSync(path.join(root,url)),`Local asset exists: ${url}`);
}
assert.ok(html.includes('openhoops/privacy.html'));
assert.ok(html.includes('openhoops/terms.html'));
assert.ok(html.includes('support@timbuilds.dev'));
assert.ok(!/gh[pousr]_[A-Za-z0-9]{20,}|sk_live_[A-Za-z0-9]+|service_role/.test(html),'No credential-shaped content');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'One explorer heading; no faux README section');
console.log(`PASS: ${data.length} complete, unique projects; local assets; links; metadata; credential-shaped-content check.`);
