import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkStartAccess({evaluate,send,click,box,viewport,navigate,origin,sleep,screenshot,output,pass}){
 const tap=async selector=>{const r=await box(selector),point={x:r.x+r.w/2,y:r.y+r.h/2,id:1};await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await sleep(60);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(80);};
 await navigate(origin);await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 try{
  for(const os of ['95','98','2000','xp','kde'])for(const [width,height] of [[320,740],[390,844],[844,390],[1440,900]]){
   await viewport(width,height);await evaluate(`window.TimVersion.set('${os}');window.TimWindows.showDesktop();document.querySelector('#start-menu').hidden=true;true`);
   await tap('#start-button');assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),false);
   const check=async selector=>{const menu=await box(selector),bar=await box('.taskbar');assert.ok(menu.y>=0&&menu.y+menu.h<=bar.y-.5,os+' '+selector+' stays above measured taskbar at '+width);assert.ok(menu.x>=0&&menu.x+menu.w<=width+.5);assert.equal(await evaluate('(()=>{const b=document.querySelector("#start-button"),r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest("button")===b})()'),true,'Start remains touchable');};
   await check('#start-menu');
   if(os==='xp'&&width===390)await screenshot(path.join(output,'start-clear-phone.png'));
   await evaluate('document.querySelector("#start-menu .start-parent").scrollIntoView({block:"nearest",behavior:"instant"});true');await tap('#start-menu .start-parent');await check('#start-menu .cascade-panel:not([hidden])');
   await tap('#start-button');assert.equal(await evaluate('document.querySelector("#start-menu").hidden'),true,'same Start button closes its menu');
  }
  await viewport(390,844);await evaluate('window.TimVersion.set("xp");document.querySelector(".taskbar").style.setProperty("padding-bottom","34px","important");true');await sleep(180);
  await tap('#start-button');let menu=await box('#start-menu'),bar=await box('.taskbar');assert.ok(menu.y+menu.h<=bar.y-.5,'menu follows larger safe-area-like padding');
  await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:false});await sleep(300);menu=await box('#start-menu');bar=await box('.taskbar');assert.ok(menu.y>=0&&menu.y+menu.h<=bar.y-.5,'rotation while open keeps menu above taskbar');
  await tap('#start-button');await evaluate('document.querySelector(".taskbar").style.removeProperty("padding-bottom");true');
 }finally{await send('Emulation.setTouchEmulationEnabled',{enabled:false});await evaluate('document.querySelector(".taskbar").style.removeProperty("padding-bottom");document.querySelector("#start-menu").hidden=true;true');}
 pass('Start and cascading menus clear the full taskbar; real touch opens/closes at 320/390/844/1440px, all five bottom-taskbar skins, resized padding and live rotation');
}
