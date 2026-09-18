import assert from 'node:assert/strict';
import path from 'node:path';
export async function checkShell({evaluate,send,click,box,mouse,drag,viewport,navigate,origin,until,sleep,screenshot,output,pass,requests}){
  await viewport(1440,1000);await evaluate('window.TimDesktop.close();window.TimDesktop.arrange()');
  assert.equal(await evaluate('!!document.querySelector(".desktop-heading")'),false);
  assert.equal((await box('.desktop-shortcut[data-action="projects"]')).y,12);
  await mouse(2,2,'mousePressed');await mouse(115,202);assert.equal(await evaluate('document.querySelector("#desktop-selection").hidden'),false);await screenshot(path.join(output,'desktop-selection.png'));await mouse(115,202,'mouseReleased');
  assert.equal(await evaluate('document.querySelectorAll(".desktop-shortcut.is-selected").length'),2);assert.equal(await evaluate('document.querySelector("#desktop-selection").hidden'),true);
  await sleep(350);await drag('.desktop-shortcut[data-action="projects"]',208,96);
  assert.equal((await box('.desktop-shortcut[data-action="projects"]')).x,220);assert.equal((await box('.desktop-shortcut[data-shortcut="recycle"]')).x,220);assert.equal((await box('.desktop-shortcut[data-shortcut="recycle"]')).y-(await box('.desktop-shortcut[data-action="projects"]')).y,96);
  pass('Marquee selects multiple icons and group dragging preserves their relative positions');
  await mouse(850,700,'mousePressed');await mouse(850,700,'mouseReleased');assert.equal(await evaluate('document.querySelectorAll(".desktop-shortcut.is-selected").length'),0);
  await evaluate('window.TimDesktop.arrange()');await drag('.desktop-shortcut[data-shortcut="recycle"]',104,-96);assert.equal((await box('.desktop-shortcut[data-shortcut="recycle"]')).y,12);pass('Blank click clears selection and the entire top desktop row accepts icons');
  await evaluate('window.TimDesktop.arrange();window.TimDesktop.open()');await click('[data-window-task="projects"]');assert.equal(await evaluate('document.querySelector("#portfolio-window").hidden'),true);await click('[data-window-task="projects"]');assert.equal(await evaluate('document.querySelector("#portfolio-window").hidden'),false);pass('Clicking the focused My Projects task toggles minimise and restore');
  for(const id of ['about','contact','github','display'])await click(`[data-dialog="${id}"]`);
  assert.equal(await evaluate('document.querySelectorAll(".app-window:not([hidden])").length'),4);assert.equal(await evaluate('document.querySelectorAll(".task-button:not([hidden])").length'),5);assert.equal(await evaluate('document.querySelector("#detail-dialog").open'),false);pass('All four auxiliary menu entries open independent, non-modal windows with taskbar buttons');
  await click('[data-window-task="about"]');assert.equal(await evaluate('window.TimWindows.active()'),'about');assert.equal(await evaluate('document.querySelector("#window-about").hidden'),false);await click('[data-window-task="about"]');assert.equal(await evaluate('document.querySelector("#window-about").hidden'),true);await click('[data-window-task="about"]');assert.equal(await evaluate('document.querySelector("#window-about").hidden'),false);pass('An inactive task raises its window, a focused task minimises, and a minimised task restores');
  const before=await box('#window-about');await drag('#window-about > .titlebar',-40,-20);const after=await box('#window-about');assert.equal(after.x,before.x-40);assert.equal(after.y,before.y-20);await drag('#window-about .resize-se',-70,-50);const normal=await box('#window-about');await click('#window-about [data-win-control="maximize"]');assert.equal((await box('#window-about')).w,1440);await click('#window-about [data-win-control="maximize"]');assert.deepEqual(await box('#window-about'),normal);pass('Auxiliary windows move, resize, maximise and restore independently');
  await click('[data-window-task="display"]');const backgrounds=new Set();
  for(const id of await evaluate('window.TimWallpaper.options.map(o=>o[0])')){await click(`[data-wallpaper="${id}"]`);assert.equal(await evaluate('document.documentElement.dataset.wallpaper'),id);assert.equal(await evaluate('document.querySelectorAll(".wallpaper-option[aria-pressed=true]").length'),1);backgrounds.add(await evaluate('getComputedStyle(document.body).backgroundColor+getComputedStyle(document.body).backgroundImage'));}
  assert.equal(backgrounds.size,await evaluate('window.TimWallpaper.options.length'));await click('[data-wallpaper="synthwave"]');await screenshot(path.join(output,'retro-windows.png'));pass('All wallpaper options have working live previews and selection states');
  for(const id of ['about','contact','github','display'])await click(`#window-${id} [data-win-control="close"]`);
  assert.equal(await evaluate('document.querySelectorAll(".task-button:not([hidden])").length'),1);await evaluate('window.TimWallpaper.set("teal")');pass('Closing auxiliary windows removes their tasks without closing My Projects');
  await evaluate('sessionStorage.setItem("timbuilds.access-progress.v3",JSON.stringify({depth:0,seed:123456}))');await navigate(origin+'/?shell-test=3');await click('[data-action="locked"]');await until(()=>evaluate('!!document.querySelector(".access-terminal")'),'access terminal');await sleep(150);
  assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'0');
  assert.equal(await evaluate('/just a game|fictional|for fun|unwinnable/i.test(document.querySelector(".access-terminal").textContent)'),false);
  await evaluate('document.querySelector("#access-response").value="deliberately-wrong";document.querySelector("#access-form").requestSubmit()');assert.equal(await evaluate('document.querySelector("#access-accepted").hidden'),true);pass('Guest enters an immersive access terminal; incorrect first-stage responses are rejected');
  const networkStart=requests.length;
  function route(stage){const queue=[{x:0,y:0,path:[]}],seen=new Set(['0,0']);while(queue.length){const current=queue.shift();if(current.x===stage.size-1&&current.y===stage.size-1)return current.path;for(const [name,dx,dy] of [['right',1,0],['down',0,1],['left',-1,0],['up',0,-1]]){const x=current.x+dx,y=current.y+dy,key=x+','+y;if(x<0||y<0||x>=stage.size||y>=stage.size||stage.cells[y][x]||seen.has(key))continue;seen.add(key);queue.push({x,y,path:[...current.path,name]});}}throw new Error('Unreachable maze');}
  for(let n=0;n<24;n++){
    const stage=await evaluate(`window.TimChallengeRules.makeStage(${n},123456)`);
    assert.equal(await evaluate('Number(document.querySelector(".access-terminal").dataset.depth)'),n);
    assert.ok((await evaluate('document.querySelector("#access-hint").textContent')).length>20);
    if(n===3)await screenshot(path.join(output,'access-captcha.png'));if(n===4)await screenshot(path.join(output,'access-tiles.png'));if(n===6)await screenshot(path.join(output,'access-maze.png'));
    if(stage.type==='tiles'){
      const wrong=stage.tiles.findIndex(t=>!t.correct);await click(`[data-tile="${wrong}"]`);await evaluate('document.querySelector("#access-form").requestSubmit()');assert.equal(await evaluate('document.querySelector("#access-accepted").hidden'),true);await click(`[data-tile="${wrong}"]`);
      for(const [i,tile] of stage.tiles.entries())if(tile.correct)await click(`[data-tile="${i}"]`);await evaluate('document.querySelector("#access-form").requestSubmit()');
    }else if(stage.type==='memory'){
      await click('[data-access-action="replay"]');await sleep(80);await click('#bsod-dialog [data-bsod-action="desktop"]');await sleep(80);await click('[data-action="locked"]');await until(()=>evaluate('!!document.querySelector(".access-terminal")'),'resumed recovery');assert.equal(await evaluate('document.querySelectorAll(".sequence-pad:disabled").length'),0);
      for(const pad of stage.sequence)await click(`[data-pad="${pad}"]`);
    }else if(stage.type==='maze'){
      for(const direction of route(stage))await click(`[data-move="${direction}"]`);
    }else if(stage.type==='order'){
      await click('[data-sector="2"]');for(let i=1;i<=stage.order.length;i++)await click(`[data-sector="${i}"]`);
    }else{
      await evaluate(`document.querySelector('#access-response').value=${JSON.stringify(stage.answer)};document.querySelector('#access-response').dispatchEvent(new Event('input'));document.querySelector('#access-form').requestSubmit();`);
    }
    assert.equal(await evaluate('document.querySelector("#access-accepted").hidden'),false,`Layer ${n+1} accepts its correct solution`);
    await click('[data-access-action="next"]');
  }
  assert.equal(await evaluate('document.querySelectorAll(".locked-project").length'),0);assert.equal(requests.length,networkStart,'Challenge responses and mini-games make no network requests');
  assert.equal(await evaluate('Number(document.querySelector(".access-terminal").dataset.depth)'),24);pass('Twenty-four solvable layers cover all nine types, then continue procedurally without unlocking owner data');
  const progress=await evaluate('JSON.parse(sessionStorage.getItem("timbuilds.access-progress.v3"))');assert.deepEqual(progress,{depth:24,seed:123456});pass('Puzzle progress stores only the layer and seed; responses are neither stored nor transmitted');
  await navigate(origin+'/?shell-resume=3');await click('[data-action="locked"]');await until(()=>evaluate('!!document.querySelector(".access-terminal")'),'resumed terminal');assert.equal(await evaluate('document.querySelector(".access-terminal").dataset.depth'),'24');await click('#bsod-dialog [data-bsod-action="desktop"]');pass('Closing and reloading preserve the current layer without retaining entered responses');
  for(const width of [320,390,768]){
    await viewport(width,844);await click('[data-dialog="display"]');const display=await box('#window-display');assert.ok(display.x>=0&&display.x+display.w<=width);assert.equal(await evaluate('document.querySelector("#window-display .app-window-body").scrollWidth>document.querySelector("#window-display .app-window-body").clientWidth'),false);await click('#window-display [data-win-control="close"]');
    await click('[data-action="locked"]');const access=await box('#bsod-dialog');assert.ok(access.x>=0&&access.x+access.w<=width);assert.equal(await evaluate('document.querySelector("#bsod-dialog .bsod-scroll").scrollWidth>document.querySelector("#bsod-dialog .bsod-scroll").clientWidth'),false);if(width===320)await screenshot(path.join(output,'access-mobile.png'));await click('#bsod-dialog [data-bsod-action="desktop"]');
  }pass('Display and challenge windows fit 320–768 px screens without internal horizontal overflow');
  await viewport(1440,1000);await navigate(origin);await evaluate('window.TimDesktop.arrange();window.TimDesktop.resetWindow()');
}
