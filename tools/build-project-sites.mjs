/* Build standalone information pages. App runtimes are never included in these pages. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const projects=JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8'));
const sites=JSON.parse(fs.readFileSync(path.join(root,'portfolio/project-sites.json'),'utf8'));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const outputs=new Map(),destinations=[];
function external(href,label,launch=false){assert.ok(href.startsWith('https://'));return `<a class="site-button primary" ${launch?'data-launch-app ':''}data-browser-external href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new browser tab)</span></a>`;}
for(const s of sites){
 assert.match(s.project,/^[a-z0-9-]+$/);assert.match(s.theme,/^[a-z0-9-]+$/);
 const p=projects.find(p=>p.id===s.project);assert.ok(p,'Public project exists');
 assert.ok(!destinations.some(d=>d.project===p.id),'Unique site');assert.equal(p.url,`/projects/${p.id}/`);
 assert.ok(s.features.length===3&&s.availability&&s.story);assert.ok(p.image.startsWith('portfolio/media/'));
 if(s.launchUrl)assert.ok(p.category==='Games'&&new URL(s.launchUrl).protocol==='https:');
 const route=`/projects/${p.id}/`;
 destinations.push({project:p.id,title:p.title,site:route,launch:s.launchUrl||null});
 const contact=`mailto:support@timbuilds.dev?subject=${encodeURIComponent('About '+p.title)}`;
 const cta=s.launchUrl?external(s.launchUrl,s.launchLabel,true):p.source?external(p.source,'Explore the source'):`<a class="site-button primary" href="${contact}">Ask about the project <span aria-hidden="true">↗</span></a>`;
 const titleLines=s.headline.split('\n').map(escape).join('<br>');
 const features=s.features.map(([title,body],i)=>`<article><span class="feature-index">0${i+1}</span><h3>${escape(title)}</h3><p>${escape(body)}</p></article>`).join('\n');
 const sameCategory=projects.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,2);
 const related=sameCategory.map(x=>`<a href="${escape(x.url||'/')}"><span>${escape(x.title)}</span><span aria-hidden="true">↗</span></a>`).join('');
 const html=`<!doctype html>
<html lang="en" data-project="${p.id}" data-theme="${s.theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escape(s.intro)}">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
<title>${escape(p.title)} — A project by Tim</title>
<link rel="icon" href="/portfolio/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/portfolio/project-sites.css?v=10">
<script src="/portfolio/website-bridge.js?v=10"></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="product-header"><a class="product-wordmark" href="./">${escape(p.title)}</a><nav aria-label="Project website"><a href="#story">The story</a><a href="mailto:support@timbuilds.dev">Contact</a><a href="/">timBuilds <span aria-hidden="true">↗</span></a></nav></header>
<main id="main">
<section class="product-hero"><p class="site-eyebrow">${escape(s.eyebrow)}</p><h1>${titleLines}</h1><p class="product-intro">${escape(s.intro)}</p><div class="product-actions">${cta}<a class="secondary-link" href="#preview">Take a look <span aria-hidden="true">↓</span></a></div><p class="launch-note">${escape(s.availability)}</p></section>
<figure class="product-preview" id="preview"><div class="preview-chrome"><span aria-hidden="true">● ● ●</span><span>${escape(p.title)} / ${escape(p.imageLabel)}</span></div><img src="/${escape(p.image)}" width="1200" height="700" alt="${escape(p.imageAlt)}" decoding="async"><figcaption>${escape(p.imageNote)}</figcaption></figure>
<section class="product-features" aria-label="About the project">${features}</section>
<section class="product-story" id="story"><div><p class="site-eyebrow">FROM A PERSONAL IDEA</p><h2>${escape(s.storyTitle)}</h2></div><div><p>${escape(s.story)}</p><p class="project-stack">${p.stack.map(escape).join(' · ')}</p></div></section>
<section class="product-next" aria-labelledby="next-heading"><div><p class="site-eyebrow">${s.launchUrl?'READY WHEN YOU ARE':'THE PROJECT TODAY'}</p><h2 id="next-heading">${s.launchUrl?'Shall we play?':escape(p.status)}</h2><p>${escape(s.availability)}</p></div>${cta}</section>
${related?`<aside class="related-projects" aria-label="More projects"><h2>More from the collection</h2>${related}</aside>`:''}
</main>
<footer class="product-footer"><a href="/">A project by timBuilds</a><span>Made for real people.</span><a href="mailto:support@timbuilds.dev">support@timbuilds.dev</a></footer>
</body>
</html>
`;
 outputs.set(path.join('projects',p.id,'index.html'),html);
}
outputs.set('portfolio/project-destinations.js','/* Generated by tools/build-project-sites.mjs. Public navigation metadata only. */\nwindow.TimProjectSites=Object.freeze('+JSON.stringify(destinations)+'.map(Object.freeze));\n');
if(process.argv.includes('--check')){
 for(const [file,text] of outputs)assert.equal(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'),text,'Stale project website: '+file);
 console.log('PASS: '+sites.length+' standalone project websites and navigation registry are current.');
}else{
 for(const [file,text] of outputs){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);}
 console.log('Built '+sites.length+' project websites and the app-to-website navigation registry.');
}
