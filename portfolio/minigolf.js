/* Nine-hole Mini Golf. All artwork and course layouts are original. */
(() => {
  'use strict';
  const A=window.TimApps,E=window.TimArcadeEngines;
  A.register('minigolf','Mini Golf','globe',(body)=>{
    let game=new E.Golf(),scores=[],aim=null,frame=0,last=0,visible=true,closed=false;
    const app=document.createElement('div');app.className='minigolf-app';
    const toolbar=document.createElement('div');toolbar.className='app-menubar';
    for(const [id,label] of [['new','New round'],['reset','Retry hole'],['next','Next hole']]){
      const b=document.createElement('button');b.className='bevel-button';b.dataset.golf=id;b.textContent=label;toolbar.append(b);
    }
    const hole=document.createElement('strong');hole.id='golf-hole';toolbar.append(hole);
    const canvas=document.createElement('canvas');canvas.id='golf-course';canvas.width=720;canvas.height=420;canvas.tabIndex=0;
    canvas.setAttribute('aria-label','Mini Golf course. Drag back from the ball and release, or use the controls below.');
    const controls=document.createElement('div');controls.className='golf-controls';
    app.append(toolbar,canvas,controls);body.append(app);
    const ctx=canvas.getContext('2d');
    function slider(id,label,max,value){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type='range';input.min=0;input.max=max;input.value=value;input.id=id;const out=document.createElement('output');out.textContent=value;input.addEventListener('input',()=>out.textContent=input.value);l.append(input,out);controls.append(l);return input;}
    const angle=slider('golf-angle','Direction',359,0),power=slider('golf-power','Power',100,45);power.min=1;
    const putt=document.createElement('button');putt.className='bevel-button';putt.dataset.golf='shoot';putt.textContent='Putt';controls.append(putt);
    const status=document.createElement('p');status.id='golf-status';status.setAttribute('role','status');const scorecard=document.createElement('p');scorecard.id='golf-scorecard';app.append(status,scorecard);
    function paint(){
      const c=game.course;ctx.fillStyle='#33533b';ctx.fillRect(0,0,720,420);ctx.fillStyle='#84b953';ctx.fillRect(20,20,680,380);ctx.strokeStyle='#8fc85b';ctx.lineWidth=1;
      for(let x=20;x<700;x+=35){ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,400);ctx.stroke();}
      for(const r of c.sand){ctx.fillStyle='#e8d598';ctx.fillRect(...r);}
      for(const r of c.water){ctx.fillStyle='#479cbd';ctx.fillRect(...r);ctx.strokeStyle='#8dd4de';for(let y=r[1]+12;y<r[1]+r[3];y+=18){ctx.beginPath();ctx.moveTo(r[0]+8,y);ctx.lineTo(r[0]+r[2]-8,y);ctx.stroke();}}
      for(const r of c.walls){ctx.fillStyle='#475049';ctx.fillRect(...r);ctx.fillStyle='#a7b3a3';ctx.fillRect(r[0],r[1],r[2],4);}
      ctx.fillStyle='#152b21';ctx.beginPath();ctx.arc(c.cup[0],c.cup[1],11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f6efe0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.cup[0],c.cup[1]);ctx.lineTo(c.cup[0],c.cup[1]-40);ctx.stroke();ctx.fillStyle='#bd4240';ctx.fillRect(c.cup[0]+1,c.cup[1]-40,23,14);
      if(!game.sunk){ctx.fillStyle='#172b2144';ctx.beginPath();ctx.arc(game.x+3,game.y+3,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fffdf0';ctx.beginPath();ctx.arc(game.x,game.y,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#829481';ctx.lineWidth=1;ctx.stroke();}
      if(aim&&!game.moving){ctx.strokeStyle='#fff5ca';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(game.x,game.y);ctx.lineTo(game.x+(game.x-aim.x)*.6,game.y+(game.y-aim.y)*.6);ctx.stroke();ctx.setLineDash([]);}
    }
    function update(){
      hole.textContent='Hole '+(game.index+1)+' / 9 · '+game.course.name+' · Par '+game.course.par;
      status.textContent=game.sunk?(game.index===8?'Round complete!':'In the cup! Continue to the next hole.')+' Strokes: '+game.strokes:game.penalty?'Water hazard: one penalty stroke. Try again.':game.moving?'Ball in motion…':'Strokes: '+game.strokes+' · Pull back from the ball and release, or use Direction, Power and Putt.';
      body.querySelector('[data-golf=next]').disabled=!game.sunk||game.index===8;putt.disabled=game.moving||game.sunk;
      scorecard.textContent=scores.length?'Scorecard: '+scores.map((s,i)=>(i+1)+': '+s).join(' · ')+' | Total '+scores.reduce((a,b)=>a+b,0):'Nine original holes · Water adds a penalty · Sand slows the ball';
      canvas.dataset.hole=game.index;canvas.dataset.strokes=game.strokes;canvas.dataset.sunk=game.sunk;
    }
    function tick(now){if(closed||!visible)return;const moving=game.moving;game.step(last?Math.min(2,(now-last)/16.667):1);last=now;paint();if(moving&&!game.moving){if(game.sunk)scores[game.index]=game.strokes;update();}frame=requestAnimationFrame(tick);}
    const point=e=>{const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/720,r.height/420),left=r.left+(r.width-720*scale)/2,top=r.top+(r.height-420*scale)/2;return {x:(e.clientX-left)/scale,y:(e.clientY-top)/scale};};
    function shoot(direction,strength){if(game.shoot(direction,strength)){aim=null;update();}}
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0||game.moving||game.sunk)return;const p=point(e);if(Math.hypot(p.x-game.x,p.y-game.y)>32){status.textContent='Start your drag on the white ball, or use the Putt controls.';return;}e.preventDefault();aim={...p,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(aim&&aim.id===e.pointerId)Object.assign(aim,point(e));});
    canvas.addEventListener('pointerup',e=>{if(!aim||aim.id!==e.pointerId)return;const p=point(e),dx=game.x-p.x,dy=game.y-p.y;aim=null;if(Math.hypot(dx,dy)>5)shoot(Math.atan2(dy,dx),Math.min(100,Math.hypot(dx,dy)*.6));});
    for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>aim=null);
    body.addEventListener('click',e=>{const command=e.target.closest('[data-golf]')?.dataset.golf;if(command==='shoot')shoot(Number(angle.value)*Math.PI/180,Number(power.value));if(command==='new'){game=new E.Golf();scores=[];aim=null;update();}if(command==='reset'){game=new E.Golf(game.index);scores=scores.slice(0,game.index);aim=null;update();}if(command==='next'&&game.sunk&&game.index<8){game=new E.Golf(game.index+1);aim=null;update();}});
    canvas.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();shoot(Number(angle.value)*Math.PI/180,Number(power.value));}});
    update();frame=requestAnimationFrame(tick);return {cleanup:()=>{closed=true;cancelAnimationFrame(frame);},visibility:v=>{visible=v;aim=null;last=0;cancelAnimationFrame(frame);if(v&&!closed)frame=requestAnimationFrame(tick);}};
  });
})();
