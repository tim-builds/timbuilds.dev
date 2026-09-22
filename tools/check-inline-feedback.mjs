import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkInlineFeedback({evaluate,send,click,box,mouse,viewport,navigate,origin,until,sleep,screenshot,output,pass}) {
 const primary='.access-verify';
 const checkState=async state=>{assert.equal(await evaluate('document.querySelector(".access-verify").dataset.state'),state);assert.equal(await evaluate('document.querySelector(".access-verify")===window.__verifyPrimary'),true);};
 const pointer=async r=>{await mouse(r.x+r.w/2,r.y+r.h/2,'mousePressed');await mouse(r.x+r.w/2,r.y+r.h/2,'mouseReleased');};
 const touch=async r=>{await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.w/2,y:r.y+r.h/2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 const key=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});};
 const stable=(a,b)=>{for(const property of ['x','y','w','h'])assert.ok(Math.abs(a[property]-b[property])<1,'Primary button keeps its '+property+' coordinate/size');};
 for(const width of [1440,390,320]){
  await viewport(width,900);await navigate(origin);await evaluate('sessionStorage.setItem("timbuilds.access-progress.v3",JSON.stringify({depth:0,seed:123456}))');await navigate(origin);
  await evaluate('window.TimCatalogue.browse("Locked")');await until(()=>evaluate('!!document.querySelector(".access-verify")'),'inline verify button');
  assert.equal(await evaluate('document.querySelectorAll("#bsod-dialog [data-bsod-action=desktop]").length'),1);
  assert.equal(await evaluate('document.querySelectorAll(".bsod-recovery [data-access-action=disconnect],.bsod-footer button,#access-accepted").length'),0);
  await evaluate('window.__verifyPrimary=document.querySelector(".access-verify");window.__verifyPrimary.scrollIntoView({block:"center"});document.querySelector("#access-response").value="incorrect";document.querySelector("#access-response").dispatchEvent(new Event("input",{bubbles:true}))');
  const before=await box(primary);await pointer(before);await checkState('rejected');stable(before,await box(primary));
  assert.equal(await evaluate('document.querySelector(".access-verify").textContent'),'✕ Incorrect — try again');
  assert.equal(await evaluate('document.querySelector("#access-response").getAttribute("aria-invalid")'),'true');
  assert.equal(await evaluate('document.querySelector("#access-controls").disabled'),false);
  await pointer(before);assert.equal(await evaluate('document.querySelector("#access-attempts").textContent'),'Attempts at this layer: 2');
  if(width===390)await screenshot(path.join(output,'inline-feedback-incorrect-phone.png'));
  await evaluate('document.querySelector("#access-response").value=window.TimChallengeRules.makeStage(0,123456).answer;document.querySelector("#access-response").dispatchEvent(new Event("input",{bubbles:true}))');await checkState('ready');
  await pointer(before);await checkState('accepted');stable(before,await box(primary));
  assert.equal(await evaluate('document.querySelector(".access-verify").textContent'),'✓ Correct — continue →');assert.equal(await evaluate('document.querySelector(".access-verify").matches(":disabled")'),false);
  assert.equal(await evaluate('document.querySelector("#access-controls").disabled'),true);assert.equal(await evaluate('document.activeElement===window.__verifyPrimary'),true);
  if(width===390)await screenshot(path.join(output,'inline-feedback-correct-phone.png'));
  await sleep(100);assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'0');
  if(width===320){await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await touch(before);await send('Emulation.setTouchEmulationEnabled',{enabled:false});}else await pointer(before);
  assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'1');assert.equal(await evaluate('window.__verifyPrimary.isConnected'),false);assert.equal(await evaluate('document.querySelector(".access-verify").dataset.state'),'ready');
  await evaluate('window.__verifyPrimary=document.querySelector(".access-verify");document.querySelector("#access-response").value=window.TimChallengeRules.makeStage(1,123456).answer;document.querySelector("#access-response").focus()');
  await key();await checkState('accepted');await key();assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'2');
  const exit=await box('.bsod-toolbar [data-bsod-action=desktop]');assert.ok(exit.y>=0&&exit.y+exit.h<100);await pointer(exit);assert.equal(await evaluate('window.TimBSOD.isOpen()'),false);
 }
 pass('One fixed-position button reports wrong/correct answers, then continues through the same mouse/touch target at 320/390/1440px');
 pass('Enter verifies and continues; exactly one Return to desktop button remains in the upper-right toolbar');
 await viewport(1440,1000);await navigate(origin);await evaluate('window.TimVersion.set("2000");window.TimVersion.reset();window.TimWindows.reset("projects")');
}
