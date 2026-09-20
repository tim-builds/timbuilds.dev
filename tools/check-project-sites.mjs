import assert from 'node:assert/strict';import path from 'node:path';
export async function checkProjectSites({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests}){
 const open=url=>evaluate('window.TimBrowser.open('+JSON.stringify(url)+')');
 const ready=()=>until(()=>evaluate('document.querySelector(".browser-frame")?.contentDocument?.readyState==="complete"&&!!document.querySelector(".browser-frame")?.contentDocument?.querySelector("main")'),'project website complete');
 const frameClick=async selector=>{const p=await evaluate(`(()=>{const f=document.querySelector('.browser-frame'),a=f.contentDocument.querySelector(${JSON.stringify(selector)});a.scrollIntoView({block:'center',behavior:'instant'});const fr=f.getBoundingClientRect(),r=a.getBoundingClientRect();return {x:fr.x+r.x+r.width/2,y:fr.y+r.y+r.height/2};})()`);await mouse(p.x,p.y,'mousePressed');await mouse(p.x,p.y,'mouseReleased');};
 await viewport(1440,1000);await navigate(origin);
 const registry=await evaluate('window.TimProjectSites');assert.equal(registry.length,10);
 for(const entry of registry){await click('.project-card[data-id="'+entry.project+'"] .card-footer a');await ready();assert.ok((await evaluate('document.querySelector(".browser-frame").src')).endsWith(entry.site));assert.equal(await evaluate('document.querySelector(".browser-frame").contentDocument.querySelectorAll("iframe,canvas").length'),0);assert.equal(await evaluate('document.querySelector(".browser-frame").contentDocument.documentElement.dataset.project'),entry.project);}
 pass('Every new project card opens its own information website, not an embedded app runtime');
 for(const entry of registry.filter(s=>s.launch)){
   const start=requests.length;await open(entry.launch);await ready();assert.ok((await evaluate('window.TimBrowser.current()')).endsWith(entry.site));assert.ok(!requests.slice(start).some(url=>url.startsWith(entry.launch)),'Typing an app address does not load its runtime in a frame');
   const before=(await send('Target.getTargets')).targetInfos.map(t=>t.targetId);const oldFrame=await evaluate('document.querySelector(".browser-frame").src');
   await frameClick('[data-launch-app]');let target;
   await until(async()=>{target=(await send('Target.getTargets')).targetInfos.find(t=>t.type==='page'&&!before.includes(t.targetId)&&t.url.startsWith(entry.launch));return !!target;},'external game tab '+entry.project);
   assert.equal(await evaluate('document.querySelector(".browser-frame").src'),oldFrame);assert.equal(await evaluate('location.origin'),new URL(origin).origin);
   await send('Target.closeTarget',{targetId:target.targetId});await send('Page.bringToFront');
   await screenshot(path.join(output,entry.project+'-website.png'));
 }
 pass('Real Play clicks open both games in separate browser tabs while the desktop remains on the project website');
 await open('/openhoops/');await ready();assert.equal(await evaluate('document.querySelector(".browser-frame").contentDocument.querySelector(".wordmark").textContent'),'openHoops');
 await click('[data-browser-action=home]');assert.equal(await evaluate('window.TimBrowser.current()'),'about:home');await click('[data-browser-action=back]');await ready();assert.ok((await evaluate('window.TimBrowser.current()')).endsWith('/openhoops/'));await click('[data-browser-action=forward]');assert.equal(await evaluate('window.TimBrowser.current()'),'about:home');
 await open('/projects/letters-with-lola/');await ready();await frameClick('.related-projects a');await until(()=>evaluate('window.TimBrowser.current().endsWith("/projects/solitaire/")'),'related-project navigation');await ready();assert.ok((await evaluate('window.TimBrowser.current()')).endsWith('/projects/solitaire/'));await click('[data-browser-action=back]');await ready();assert.ok((await evaluate('window.TimBrowser.current()')).endsWith('/projects/letters-with-lola/'));
 pass('Internal Back/Forward, related-project links and bookmarks stay within the website browser');
 await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:128000,uploadThroughput:128000});
 try{
   await open('/openhoops/');await until(()=>evaluate('!!document.querySelector(".browser-frame")?.contentDocument?.querySelector(".hero")'),'early openHoops DOM');
   assert.notEqual(await evaluate('document.querySelector(".browser-frame").contentDocument.readyState'),'complete');
   await frameClick('header a[href="privacy.html"]');
 }finally{await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await send('Network.setCacheDisabled',{cacheDisabled:false});}
 await until(()=>evaluate('document.querySelector("#window-document-privacy .document-text")?.textContent.length>10000'),'early policy link');await evaluate('window.TimWindows.close("document-privacy")');
 assert.ok((await evaluate('window.TimBrowser.current()')).endsWith('/openhoops/'));pass('Owned website links route correctly even when clicked before slow images finish loading');
 for(const width of [320,390,768,1440]){
   await viewport(width,900);await open('/openhoops/');await evaluate('if(!document.querySelector("#window-browser").classList.contains("is-maximized"))window.TimWindows.maximize("browser")');await ready();
   await evaluate('[...document.querySelector(".browser-frame").contentDocument.images].forEach(i=>i.loading="eager")');
   await until(()=>evaluate('[...document.querySelector(".browser-frame").contentDocument.images].every(i=>i.complete&&i.naturalWidth>0)'),'openHoops screenshots');
   const metrics=await evaluate(`(()=>{const f=document.querySelector('.browser-frame'),doc=f.contentDocument;return {fits:doc.documentElement.scrollWidth<=f.clientWidth+1,images:[...doc.images].map(i=>{const r=i.getBoundingClientRect(),s=f.contentWindow.getComputedStyle(i);return {w:r.width-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth),h:r.height-parseFloat(s.borderTopWidth)-parseFloat(s.borderBottomWidth),ratio:i.naturalWidth/i.naturalHeight};})};})()`);
   assert.ok(metrics.fits,'Embedded openHoops fits '+width);for(const i of metrics.images)assert.ok(Math.abs(i.w/i.h-i.ratio)<.003,'No stretched image at '+width);
   if(width===390){await screenshot(path.join(output,'openhoops-mobile-hero.png'));await evaluate('document.querySelector(".browser-frame").contentDocument.querySelector(".venue-section").scrollIntoView()');await screenshot(path.join(output,'openhoops-mobile-venue.png'));}
 }
 pass('Both openHoops screenshots preserve their real aspect ratios across phone, tablet and desktop widths');
 for(const entry of registry){await viewport(390,844);await open(entry.site);await ready();const data=await evaluate('(()=>{const d=document.querySelector(".browser-frame").contentDocument;return {w:d.documentElement.scrollWidth,v:d.documentElement.clientWidth,links:d.querySelectorAll("[data-launch-app]").length};})()');assert.ok(data.w<=data.v+1,entry.project+' mobile overflow');assert.equal(data.links,entry.launch?2:0);}
 pass('All ten project websites fit mobile and distinguish playable releases from work in progress');
 await evaluate('window.TimWindows.close("browser")');await viewport(1440,1000);await navigate(origin);await evaluate('window.TimWindows.showDesktop();window.TimDesktop.arrange()');
 const before=await box('[data-shortcut=projects]'),bin=await box('[data-shortcut=recycle]');
 await mouse(before.x+before.w/2,before.y+before.h/2,'mousePressed');await mouse(bin.x+bin.w/2,bin.y+bin.h/2);await sleep(100);
 assert.equal(await evaluate('document.querySelectorAll(".desktop-drag-copy").length'),1);assert.deepEqual(await box('[data-shortcut=projects]'),before);assert.ok(await evaluate('document.querySelector("[data-shortcut=recycle]").classList.contains("recycle-drop-target")'));await screenshot(path.join(output,'recycle-drag-feedback.png'));
 await mouse(bin.x+bin.w/2,bin.y+bin.h/2,'mouseReleased');await until(()=>evaluate('document.querySelector("#bsod-dialog").open'),'protected folder warning');assert.equal(await evaluate('document.querySelector("#bsod-stop").textContent'),'PROJECTS_CANNOT_BE_RECYCLED');assert.equal(await evaluate('document.querySelectorAll(".desktop-drag-copy").length'),0);assert.deepEqual(await box('[data-shortcut=projects]'),before);await screenshot(path.join(output,'polished-recycle-warning.png'));await click('#bsod-dialog [data-bsod-action="desktop"]');
 pass('Dragging uses a translucent copy and bin highlight; a refused drop returns cleanly and opens a recoverable blue screen');
 for(const os of ['95','98','2000','xp','system7','mac9','ubuntu','kde']){
   await evaluate('window.TimVersion.set('+JSON.stringify(os)+');window.TimDesktopActions.warn("empty")');
   const r=await box('#desktop-warning');assert.ok(r.w>250&&r.w<500&&r.h<300,'Compact warning '+os);assert.equal(await evaluate('document.activeElement.classList.contains("warning-ok")'),true);await click('#desktop-warning .warning-close');
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await evaluate('window.TimVersion.set("2000");window.TimDesktop.arrange()');await drag('[data-shortcut=projects]',0,96);assert.equal(await evaluate('document.querySelector("#bsod-dialog").open'),true);assert.equal(await evaluate('document.querySelectorAll(".desktop-drag-copy").length'),0);await click('#bsod-dialog [data-bsod-action="desktop"]');await send('Emulation.setEmulatedMedia',{features:[]});
 pass('The warning follows all eight OS themes, has focused dismissal controls and respects reduced motion');
 await viewport(390,844);await send('Page.navigate',{url:origin+'/openhoops/'});await until(()=>evaluate('!!document.querySelector(".hero h1")&&document.readyState==="complete"'),'standalone openHoops');
 assert.equal(await evaluate('document.querySelector(".wordmark").textContent'),'openHoops');assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);await screenshot(path.join(output,'openhoops-standalone-phone.png'));
 await send('Page.navigate',{url:origin+'/projects/letters-with-lola/'});await until(()=>evaluate('document.documentElement.dataset.project==="letters-with-lola"&&document.readyState==="complete"'),'standalone game website');assert.equal(await evaluate('document.querySelector("[data-launch-app]").target'),'_blank');assert.equal(await evaluate('document.querySelectorAll("iframe,canvas").length'),0);pass('Project websites also work as direct standalone URLs outside the simulated desktop');
 await navigate(origin);await viewport(1440,1000);await evaluate('window.TimVersion.set("2000");window.TimWindows.reset("projects")');
}
