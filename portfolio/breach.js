/* Local access-themed puzzle. It has no reference to the real owner key or catalogue. */
(() => {
  'use strict';
  const rules=window.TimChallengeRules, storage='timbuilds.access-progress.v3';
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let seed=741103;try{seed=crypto.getRandomValues(new Uint32Array(1))[0];}catch{}
  let depth=0;try{const p=JSON.parse(sessionStorage.getItem(storage)||'{}');if(Number.isSafeInteger(p.depth)&&p.depth>=0&&p.depth<1e9&&Number.isInteger(p.seed)){depth=p.depth;seed=p.seed>>>0;}}catch{}
  let root=null, controller=null, stage=null, attempts=0, solved=false, playing=false, entry=[], packet={x:0,y:0};
  const timers=new Set();
  let initialFocus=true;
  const autoStage=()=>['memory','maze','order'].includes(stage.type);
  function primaryState(state='ready'){
    const button=root.querySelector('.access-verify');
    button.dataset.state=state;
    button.textContent=state==='accepted'?'✓ Correct — continue →':state==='rejected'?'✕ Incorrect — try again':autoStage()?'Complete challenge first':'Verify response ↵';
    button.disabled=autoStage()&&!solved;
    root.querySelector('#access-response')?.setAttribute('aria-invalid',String(state==='rejected'));
  }
  function edited(){if(!solved&&root.querySelector('.access-verify').dataset.state==='rejected')primaryState();paintRules();}
  function remember(){try{sessionStorage.setItem(storage,JSON.stringify({depth,seed}));}catch{}}
  function feedback(text){const el=root?.querySelector('#access-feedback');if(el)el.textContent=text;}
  function stopPlayback(){for(const timer of timers)clearTimeout(timer);timers.clear();playing=false;if(!root)return;root.querySelectorAll('.sequence-pad').forEach(el=>{el.classList.remove('is-lit');el.disabled=solved;});const replay=root.querySelector('[data-access-action="replay"]');if(replay)replay.disabled=solved;}
  function later(fn,ms){const timer=setTimeout(()=>{timers.delete(timer);if(root)fn();},ms);timers.add(timer);}
  function contents(s){
    if(s.type==='tiles')return `<div class="verification-grid">${s.tiles.map((tile,i)=>`<button type="button" class="verification-tile" data-tile="${i}" aria-pressed="false"><span class="tile-art art-${tile.kind}" aria-hidden="true"><i></i><b></b></span><strong>${safe(tile.label)}</strong><span>${safe(tile.note)}</span></button>`).join('')}</div>`;
    if(s.type==='memory')return `<button class="bevel-button" type="button" data-access-action="replay">▶ Replay boot sequence</button><div class="sequence-pads">${[1,2,3,4].map(n=>`<button type="button" class="sequence-pad pad-${n}" data-pad="${n}" aria-label="Boot pad ${n}">${n}</button>`).join('')}</div><p id="sequence-entry">Sequence entered: —</p><details class="access-alternative"><summary>Text sequence</summary><p>${s.sequence.join(' → ')}</p></details>`;
    if(s.type==='maze')return `<div id="packet-board" class="packet-board" style="--maze-size:${s.size}" tabindex="0" aria-label="Packet routing board. Use arrow keys to reach the bottom-right port.">${s.cells.flatMap((row,y)=>row.map((wall,x)=>`<span data-cell="${x},${y}" class="maze-cell${wall?' is-wall':''}${x===0&&y===0?' is-packet':''}${x===s.size-1&&y===s.size-1?' is-exit':''}" aria-hidden="true">${x===0&&y===0?'■':x===s.size-1&&y===s.size-1?'95':''}</span>`)).join('')}</div><p id="packet-location" role="status">Packet: row 1, column 1</p><div class="packet-controls" aria-label="Move packet"><button type="button" data-move="up" aria-label="Move up">↑</button><button type="button" data-move="left" aria-label="Move left">←</button><button type="button" data-move="down" aria-label="Move down">↓</button><button type="button" data-move="right" aria-label="Move right">→</button></div>`;
    if(s.type==='order')return `<div class="sector-grid">${s.order.map(n=>`<button class="sector" type="button" data-sector="${n}" aria-label="Sector ${n}"><span>SECTOR</span><strong>${String(n).padStart(2,'0')}</strong></button>`).join('')}</div><p id="sector-progress">Next sector: 1</p>`;
    let display='';
    if(s.type==='captcha')display=`<div class="distorted-captcha" aria-hidden="true">${[...s.display].map((c,i)=>`<span style="--tilt:${(i%5-2)*9}deg;--shift:${(i%3-1)*5}px">${safe(c)}</span>`).join('')}</div><details class="access-alternative"><summary>Text alternative</summary><p>Characters, left to right: ${[...s.display].join(' · ')}.</p></details>`;
    else if(s.display)display=`<div class="recovery-fragment">${safe(s.display)}</div>`;
    return `${display}<label class="response-label" for="access-response">Challenge response</label><input class="access-response" id="access-response" type="text" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="access-hint" placeholder="Type a recovery response"><div id="access-rules" class="access-rules"></div>`;
  }
  function paintRules(){
    const list=root.querySelector('#access-rules');if(!list||stage.type!=='policy')return;
    list.innerHTML=rules.checks(stage,root.querySelector('#access-response').value).map(rule=>`<p class="access-rule ${rule.pass?'is-satisfied':''}"><span aria-hidden="true">${rule.pass?'✓':'×'}</span>${safe(rule.label)}<span class="sr-only">${rule.pass?' — satisfied':' — not yet satisfied'}</span></p>`).join('');
  }
  function showStage(){
    stopPlayback();stage=rules.makeStage(depth,seed);attempts=0;solved=false;entry=[];packet={x:0,y:0};

    root.innerHTML=`<div class="access-terminal" data-depth="${depth}" data-challenge-type="${stage.type}"><div class="access-path"><span>C:\\Tim\\Locked</span><span class="access-state">RESTRICTED</span></div><div class="access-heading"><span class="access-lock" aria-hidden="true">▣</span><div><div class="eyebrow">RECOVERY CONSOLE / LAYER ${String(depth+1).padStart(4,'0')}</div><h2>${safe(stage.title)}</h2></div></div><p class="access-hint" id="access-hint"><strong>Recovery hint</strong>${safe(stage.hint)}</p><form id="access-form" autocomplete="off"><fieldset id="access-controls"><legend class="sr-only">Layer ${depth+1} challenge</legend>${contents(stage)}</fieldset><button class="bevel-button access-verify" type="submit" aria-describedby="access-feedback"></button></form><p id="access-feedback" class="access-feedback" role="status" aria-live="polite">${depth?'Previous layer accepted. Additional verification required.':'Recovery halted. Operator verification required.'}</p><div class="access-footer"><span id="access-attempts">Attempts at this layer: 0</span></div></div>`;
    primaryState();paintRules();if(initialFocus)root.querySelector('#access-response,#packet-board,button:not(:disabled)')?.focus({preventScroll:true});initialFocus=true;root.scrollTop=0;remember();
  }
  function reject(message='Response rejected. Consult the recovery hint and try again.'){
    attempts++;primaryState('rejected');root.querySelector('#access-attempts').textContent=`Attempts at this layer: ${attempts}`;feedback(`${message} Attempt ${attempts}.`);
  }
  // The primary button stays outside the fieldset so accepting never disables Continue.
  function accept(){
    if(solved)return;solved=true;stopPlayback();root.querySelector('#access-controls').disabled=true;
    primaryState('accepted');root.querySelector('.access-state').textContent='LAYER VERIFIED';feedback('Correct. Use the same button to continue to the next recovery layer.');
    root.querySelector('.access-verify').focus({preventScroll:true});
  }
  function verify(){
    if(solved){depth++;showStage();return;}
    if(autoStage())return;
    const input=root.querySelector('#access-response');
    const value=stage.type==='tiles'?entry:input?.value||'';paintRules();
    if(rules.validate(stage,value))accept();else reject(stage.type==='tiles'?'Selection rejected. Check both the object and its paperwork.':undefined);
  }
  function replay(){
    if(stage.type!=='memory'||solved)return;stopPlayback();edited();entry=[];root.querySelector('#sequence-entry').textContent='Sequence entered: —';
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){feedback('Boot sequence: '+stage.sequence.join(' → '));return;}
    playing=true;root.querySelectorAll('.sequence-pad').forEach(el=>el.disabled=true);root.querySelector('[data-access-action="replay"]').disabled=true;
    stage.sequence.forEach((n,i)=>{later(()=>{root.querySelector(`[data-pad="${n}"]`).classList.add('is-lit');feedback(`Boot signal ${i+1} of ${stage.sequence.length}: pad ${n}`);},i*700);later(()=>root.querySelector(`[data-pad="${n}"]`).classList.remove('is-lit'),i*700+440);});
    later(()=>{stopPlayback();feedback('Reconstruct the sequence using the numbered pads.');},stage.sequence.length*700);
  }
  function move(direction) {
    if (stage.type !== 'maze' || solved) return;
    const steps = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
    const [dx,dy] = steps[direction] || [0,0];
    const x = packet.x + dx;
    const y = packet.y + dy;
    if (x < 0 || y < 0 || x >= stage.size || y >= stage.size || stage.cells[y][x]) {
      feedback('Packet blocked. Try another route.');
      return;
    }
    const old = root.querySelector(`[data-cell="${packet.x},${packet.y}"]`);
    old.classList.remove('is-packet');
    old.textContent = '';
    packet = {x,y};
    const next = root.querySelector(`[data-cell="${x},${y}"]`);
    next.classList.add('is-packet');
    next.textContent = '■';
    root.querySelector('#packet-location').textContent = `Packet: row ${y+1}, column ${x+1}`;
    if (rules.validate(stage,packet)) accept();
  }
  function click(event) {
    const button=event.target.closest('button');
    if (!button) return;
    const action=button.dataset.accessAction;

    if (solved) return;
    if (action==='replay') { replay(); return; }
    if (button.dataset.tile!==undefined && stage.type==='tiles') {
      const n=Number(button.dataset.tile);
      entry=entry.includes(n)?entry.filter(i=>i!==n):[...entry,n];
      button.setAttribute('aria-pressed',String(entry.includes(n)));edited();
      return;
    }
    if (button.dataset.pad && stage.type==='memory' && !playing) {
      const n=Number(button.dataset.pad);
      if (n!==stage.sequence[entry.length]) {
        entry=[]; reject('Sequence mismatch. Entry reset; replay the boot sequence.');
      } else { entry.push(n); edited(); feedback('Boot signal accepted.'); }
      root.querySelector('#sequence-entry').textContent='Sequence entered: '+(entry.join(' → ')||'—');
      if (rules.validate(stage,entry)) accept();
      return;
    }
    if (button.dataset.move) { move(button.dataset.move); return; }
    if (button.dataset.sector && stage.type==='order') {
      const n=Number(button.dataset.sector);
      if (n!==entry.length+1) {
        entry=[];
        root.querySelectorAll('[data-sector]').forEach(el=>{el.disabled=false;el.classList.remove('is-complete');});
        reject('Sector out of sequence. Defragmentation restarted.');
      } else { entry.push(n); edited(); button.disabled=true; button.classList.add('is-complete'); }
      root.querySelector('#sector-progress').textContent=`Sectors restored: ${entry.length} / ${stage.order.length}`;
      if (rules.validate(stage,entry)) accept();
    }
  }
  function destroy() { stopPlayback(); controller?.abort(); controller=null; root=null; }
  function mount(body, settings={}) {
    destroy(); root=body; controller=new AbortController();
    initialFocus=settings.focus!==false;
    const options={signal:controller.signal};
    root.addEventListener('click',click,options);
    root.addEventListener('input',edited,options);
    root.addEventListener('submit',event=>{event.preventDefault();verify();},options);
    root.addEventListener('keydown',event=>{
      if (event.target.id!=='packet-board') return;
      const dir=({ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'})[event.key];
      if (dir) { event.preventDefault(); move(dir); }
    },options);
    showStage();
  }
  window.addEventListener('timbuilds-session-reset',()=>{destroy();depth=0;attempts=0;solved=false;entry=[];try{seed=crypto.getRandomValues(new Uint32Array(1))[0];sessionStorage.removeItem(storage);}catch{}});
  window.TimBreach=Object.freeze({mount,destroy,visibility:visible=>{if(!visible)stopPlayback();}});
})();
