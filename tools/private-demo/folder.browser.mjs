import assert from 'node:assert/strict';
import path from 'node:path';
import {sleep} from '../classic-lab/browser.mjs';
export async function checkPrivateFolder(b,dir){
 const touchTap=async selector=>{const p=await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:1}})()`);await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await sleep(60);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(120);};
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(200);
 await touchTap('#start-button');
 assert.equal(await b.evaluate('document.querySelector("#start-menu").hidden'),false);
 assert.equal(await b.evaluate('document.querySelector("#start-menu").getBoundingClientRect().bottom<document.querySelector(".taskbar").getBoundingClientRect().top'),true,'private Start clears taskbar');
 await b.screenshot(path.join(dir,'private-start-clear.png'));
 await touchTap('#start-menu [data-app-open=games]');
 assert.equal(await b.evaluate('document.querySelectorAll("#window-games [data-entry=private-candystand]").length'),1);
 await b.screenshot(path.join(dir,'private-games-folder.png'));
 await touchTap('#window-games [data-entry=private-candystand]');
 const address=()=>b.evaluate('document.querySelector("#window-games .explorer-path").value');
 const expected='C:\\Games\\Candystand (Private)';assert.equal(await address(),expected);
 assert.deepEqual(await b.evaluate('[...document.querySelectorAll("#window-games [data-entry]")].map(b=>b.dataset.entry)'),['lab-billiards','lab-golf']);
 await b.screenshot(path.join(dir,'private-candystand-folder.png'));
 await touchTap('#window-games [data-nav=up]');assert.equal(await address(),'C:\\Games');
 await touchTap('#window-games [data-nav=back]');assert.equal(await address(),expected);
 await touchTap('#window-games [data-nav=forward]');assert.equal(await address(),'C:\\Games');
 await touchTap('#window-games [data-entry=private-candystand]');
 await b.evaluate('window.TimApps.open("computer");true');await touchTap('#window-computer [data-entry=games]');assert.equal(await b.evaluate('document.querySelectorAll("#window-computer [data-entry=private-candystand]").length'),1,'My Computer path uses the same folder');
 await b.evaluate('window.TimWindows.close("computer");window.TimWindows.showDesktop();true');await touchTap('#start-button');await touchTap('#start-menu .start-parent');await touchTap('#start-menu [data-app-open=private-candystand]');
 assert.equal(await b.evaluate('document.querySelector("#window-private-candystand .explorer-path").value'),expected,'existing Start shortcut preserved');
 await b.evaluate('window.TimWindows.close("private-candystand");window.TimWindows.show("games");true');
 console.log('PASS private Start > Games > Candystand folder, both game entries, touch navigation, Up/Back/Forward, My Computer and retained Start shortcut.');
}
