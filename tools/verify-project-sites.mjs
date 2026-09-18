import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const projects=JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8'));
const sites=JSON.parse(fs.readFileSync(path.join(root,'portfolio/project-sites.json'),'utf8'));
assert.equal(sites.length,10);assert.equal(sites.filter(s=>s.launchUrl).length,2);
for(const s of sites){
 const p=projects.find(p=>p.id===s.project),html=fs.readFileSync(path.join(root,'projects',p.id,'index.html'),'utf8');
 assert.equal(p.url,`/projects/${p.id}/`);assert.ok(html.includes('<h1>'));assert.ok(html.includes(p.image));assert.ok(html.includes('width="1200" height="700"'));
 assert.equal((html.match(/<script\b/g)||[]).length,1);assert.ok(html.includes('website-bridge.js'));
 assert.ok(!/<iframe|<canvas|type="password"|contenteditable=/i.test(html),'Information only, no embedded app or account inputs');
 if(s.launchUrl){assert.equal(p.category,'Games');const links=[...html.matchAll(/<a\b[^>]*data-launch-app[^>]*>/g)].map(m=>m[0]);assert.equal(links.length,2);for(const link of links){assert.ok(link.includes('href="'+s.launchUrl+'"'));assert.ok(link.includes('target="_blank"'));assert.ok(link.includes('rel="noopener noreferrer"'));}assert.ok(html.includes('opens in a new browser tab'));}
 else assert.ok(!html.includes('data-launch-app'));
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){const file=path.join(root,match[1]);assert.ok(fs.existsSync(file),'Local link exists: '+match[1]);}
}
for(const p of projects.filter(p=>p.category==='Games'||p.category==='Apps'))assert.ok(p.url?.startsWith('/'),'App and game cards link to local information sites');
assert.equal(projects.find(p=>p.id==='studio-siomai').url,'https://studio-siomai.vercel.app/');assert.equal(projects.find(p=>p.id==='grit-athletics').url,'https://grit-athletics.pages.dev/');
const hoops=fs.readFileSync(path.join(root,'openhoops/index.html'),'utf8');assert.ok(hoops.includes('>openHoops</a>'));assert.ok(!/OpenHoops|OPENHOOPS|<span>OPEN<\/span>/u.test(hoops));assert.ok(hoops.includes('Internal testing'));
console.log('PASS: ten information sites, two explicit external game launches, unchanged live website destinations and exact openHoops page branding.');
