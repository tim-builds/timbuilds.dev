import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const root=new URL('../portfolio/',import.meta.url),context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('environment-data.js',root),'utf8'),context);
const {themes,wallpapers}=context.window.TimEnvironmentData;
assert.deepEqual(Array.from(themes,t=>t.id),['95','98','2000','xp']);assert.equal(new Set(wallpapers.map(p=>p.id)).size,wallpapers.length);
for(const p of wallpapers){assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(typeof p.label==='string'&&p.label.length>0);if(p.file){assert.match(p.file,/^[a-z0-9-]+\.jpg$/);assert.ok(fs.existsSync(new URL('wallpapers/'+p.file,root)));}if(p.kind!=='creative')assert.ok(p.versions.every(id=>themes.some(t=>t.id===id)));}
for(const t of themes){const p=wallpapers.find(p=>p.id===t.wallpaper);assert.ok(p&&p.versions.includes(t.id));assert.ok(['fit','fill','tile','center'].includes(t.placement));}
const provenance=JSON.parse(fs.readFileSync(new URL('wallpapers/environment-provenance.json',root),'utf8'));
for(const p of provenance.images){const bytes=fs.readFileSync(new URL('wallpapers/'+p.file,root));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.sha256,p.file+' matches recorded source');assert.ok(p.width>0&&p.height>0);}
const html=fs.readFileSync(new URL('template.html',root),'utf8');assert.ok(html.includes('data-os="2000"'));assert.ok(html.indexOf('Content-Security-Policy')<html.indexOf('src="portfolio/versions.js'));assert.ok(html.indexOf('src="portfolio/versions.js')<html.indexOf('href="portfolio/site.css'));
console.log(`PASS: four themes, ${wallpapers.length} allowlisted wallpaper choices, ${provenance.images.length} verified archive hashes/dimensions and Windows 2000 pre-paint defaults.`);
