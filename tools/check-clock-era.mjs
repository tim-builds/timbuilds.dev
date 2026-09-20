import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkClockEra({evaluate,click,box,mouse,viewport,navigate,origin,sleep,screenshot,output,pass}){
 await navigate(origin);await evaluate('window.TimWindows.showDesktop()');
 const tap=async selector=>{const r=await box(selector);await mouse(r.x+r.w/2,r.y+r.h/2,'mousePressed');await mouse(r.x+r.w/2,r.y+r.h/2,'mouseReleased');await sleep(50);};
 for(const os of ['95','98','2000','xp','system7','mac9','ubuntu','kde'])for(const width of [320,390,1440]){
  await viewport(width,900);await evaluate(`window.TimVersion.set('${os}');window.TimWindows.showDesktop()`);
  const root=os==='ubuntu'?'.platform-topbar > .clock-era':'.taskbar > .clock-era';
  const clock=root+' > '+(os==='ubuntu'?'.platform-clock':'.clock-tray'),year=root+' > .environment-year';
  const data=await evaluate(`(()=>{const g=document.querySelector('${root}'),c=document.querySelector('${clock}'),y=document.querySelector('${year}'),t=c.querySelector('time')||c,p=y.querySelector('[data-os-year]'),cr=c.getBoundingClientRect(),yr=y.getBoundingClientRect(),gr=g.getBoundingClientRect(),cs=getComputedStyle(c),ys=getComputedStyle(y);return {time:t.textContent,year:p.textContent,fontC:cs.font,fontY:ys.font,colorC:cs.color,colorY:ys.color,borderC:cs.borderWidth,borderY:ys.borderWidth,shadowC:cs.boxShadow,shadowY:ys.boxShadow,underC:getComputedStyle(t).textDecorationLine,underY:getComputedStyle(p).textDecorationLine,glyphs:g.querySelectorAll('.era-chevron,.online-dot').length,role:g.getAttribute('role'),cx:cr.x,cy:cr.y,cw:cr.width,ch:cr.height,yx:yr.x,yy:yr.y,yw:yr.width,yh:yr.height,gx:gr.x,gy:gr.y,gw:gr.width,gh:gr.height,overflow:document.documentElement.scrollWidth>innerWidth,hitC:document.elementFromPoint(cr.x+cr.width/2,cr.y+cr.height/2)?.closest('button')===c,hitY:document.elementFromPoint(yr.x+yr.width/2,yr.y+yr.height/2)?.closest('button')===y};})()`);
  assert.match(data.time,/^([1-9]|1[0-2]):[0-5]\d (AM|PM)$/);assert.equal(data.year,await evaluate('window.TimVersion.info().year'));
  assert.equal(data.fontC,data.fontY,os+' matching text style');assert.equal(data.colorC,data.colorY);assert.equal(data.borderC,'0px');assert.equal(data.borderY,'0px');assert.equal(data.shadowC,'none');assert.equal(data.shadowY,'none');
  assert.equal(data.underC,'none');assert.ok(data.underY.includes('underline'));assert.equal(data.glyphs,0);assert.equal(data.role,'group');
  assert.ok(data.yx>=data.cx+data.cw-.5&&data.yx-data.cx-data.cw<12,'time immediately left of year');assert.ok(Math.abs(data.cy+data.ch/2-data.yy-data.yh/2)<1,'shared baseline');
  assert.ok(data.gx>=0&&data.gx+data.gw<=width+.5&&data.gy>=0&&data.gy+data.gh<=900.5,os+' group fits '+width);assert.equal(data.overflow,false);assert.ok(data.hitC&&data.hitY,os+' both controls reachable');
  for(const [selector,id] of [[clock,'datetime'],[year,'versions']]){
   await evaluate(`window.TimWindows.close('${id}')`);await tap(selector);assert.equal(await evaluate(`window.TimWindows.list().find(w=>w.id==='${id}').state`),'open');
   await tap(selector);assert.equal(await evaluate(`window.TimWindows.list().find(w=>w.id==='${id}').state`),'minimized');await tap(selector);assert.equal(await evaluate(`window.TimWindows.list().find(w=>w.id==='${id}').state`),'open');await evaluate(`window.TimWindows.close('${id}')`);
  }
  if(os==='xp'){await evaluate('window.TimWindows.show("projects")');await screenshot(path.join(output,'integrated-clock-'+width+'.png'));await evaluate('window.TimWindows.showDesktop()');}
 }
 await viewport(390,844);await evaluate('window.TimVersion.set("xp")');await tap('.taskbar .environment-year');await click('#window-versions [data-version="95"]');assert.equal(await evaluate('document.querySelector("#environment-button [data-os-year]").textContent'),'1995');
 await evaluate('window.TimWindows.close("versions");window.TimVersion.set("xp");window.TimWindows.show("projects")');
 pass('Integrated time/year: consistent type and baseline, only year underlined, no dot/chevron/bevel, h:mm AM/PM, real clock/era toggles and live year switching across 8 skins at 320/390/1440px');
}
