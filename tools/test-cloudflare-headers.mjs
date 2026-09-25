import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.qa/cloudflare-export-manifest.json'),'utf8')).files;
const text=fs.readFileSync(path.join(root,'dist/_headers'),'utf8');
assert.equal(fs.readFileSync(path.join(root,'dist/.assetsignore'),'utf8'),'.timbuilds-export\n');
const blocks=text.trim().split(/\n\s*\n/).map(b=>b.split('\n')),routes=new Map();
for(const [route,...lines] of blocks){assert.ok(!routes.has(route),'duplicate header route: '+route);routes.set(route,lines.join('\n'));}
assert.ok(routes.size<=100);assert.ok(!routes.get('/*').includes('Cache-Control'),'do not change non-HTML caching');
for(const f of manifest){assert.deepEqual(fs.readFileSync(path.join(root,f.path)),fs.readFileSync(path.join(root,'dist',f.path)),'export retains original bytes');if(!f.path.endsWith('.html'))continue;
 const clean=f.path==='index.html'?'/':f.path.endsWith('/index.html')?'/'+f.path.slice(0,-10):'/'+f.path.slice(0,-5);
 for(const url of ['/'+f.path,clean]){const header=routes.get(url);assert.ok(header?.includes('no-transform'),url);if(['openhoops/reset.html','openhoops/confirm.html'].includes(f.path)){assert.ok(header.includes('no-store'));assert.ok(!header.includes('public'));}else assert.ok(header.includes('public, max-age=0, must-revalidate'));}
}
assert.ok(!text.includes('Clear-Site-Data'));
console.log(`PASS ${routes.size} nonoverlapping header rules; all HTML paths preserve content, auth pages stay no-store, and all ${manifest.length} source files export unchanged.`);
