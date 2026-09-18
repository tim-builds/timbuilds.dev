/* First-click-safe Minesweeper with keyboard and touch flagging. */
(() => {
  'use strict';
  window.TimApps.register('minesweeper','Minesweeper','mine',(body)=>{
    let game,elapsed=0,timer=null,visible=true,flagMode=false,size=9,bombs=10;
    body.innerHTML='<div class="minesweeper-app"><div class="app-menubar"><label>Game <select id="mine-level"><option value="9">Beginner · 9 × 9</option><option value="16">Intermediate · 16 × 16</option></select></label><button id="mine-flag-mode" aria-pressed="false">Flag mode</button></div><div class="mine-dashboard"><output id="mine-count" aria-label="Mines remaining">010</output><button id="mine-new" aria-label="New Minesweeper game" title="New game">☺</button><output id="mine-time" aria-label="Elapsed seconds">000</output></div><div class="mine-board-scroll"><div id="mine-board" class="mine-board" role="grid" aria-label="Minesweeper board"></div></div><p id="mine-status" role="status">Click a square. Right-click or press F to flag. First move is safe.</p></div>';
    const board=body.querySelector('#mine-board'),status=body.querySelector('#mine-status'),count=body.querySelector('#mine-count');
    function stop(){clearInterval(timer);timer=null;}
    function run(){stop();if(visible&&game.started&&!game.over)timer=setInterval(()=>{elapsed=Math.min(999,elapsed+1);body.querySelector('#mine-time').textContent=String(elapsed).padStart(3,'0');},1000);}
    function render(){count.textContent=String(game.bombs-game.cells.filter(c=>c.flag).length).padStart(3,'0');for(let i=0;i<game.cells.length;i++){const c=game.cells[i],b=board.children[i],shown=c.open||game.over&&c.bomb;b.className='mine-cell'+(shown?' revealed':'')+(game.over&&c.open&&c.bomb?' detonated':'');b.textContent=c.flag?'⚑':shown?(c.bomb?'✹':c.count||''):'';b.dataset.number=String(c.count);b.setAttribute('aria-label',`Row ${Math.floor(i/size)+1}, column ${i%size+1}: ${c.flag?'flag':shown?(c.bomb?'mine':c.count+' neighboring mines'):'covered'}`);}
      if(game.over){stop();body.querySelector('#mine-new').textContent=game.won?'😎':'☹';status.textContent=game.won?'Field cleared. Well played.':'You found a mine. Click the face to try again.';}
    }
    function reset(){stop();game=new window.TimClassicEngines.Mines(size,bombs);elapsed=0;body.querySelector('#mine-time').textContent='000';body.querySelector('#mine-new').textContent='☺';board.style.setProperty('--mine-size',size);board.replaceChildren();for(let i=0;i<size*size;i++){const b=document.createElement('button');b.dataset.cell=i;b.setAttribute('role','gridcell');b.tabIndex=i===0?0:-1;board.appendChild(b);}status.textContent='Click a square. Right-click or press F to flag. First move is safe.';render();}
    function play(i,flag=false){const started=game.started;if(flag)game.flag(i);else if(game.cells[i].open)game.chord(i);else game.reveal(i);render();if(!started&&game.started)run();}
    board.addEventListener('click',e=>{const b=e.target.closest('[data-cell]');if(b)play(Number(b.dataset.cell),flagMode);});
    board.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-cell]');if(b){e.preventDefault();e.stopPropagation();play(Number(b.dataset.cell),true);}});
    board.addEventListener('keydown',e=>{const b=e.target.closest('[data-cell]');if(!b)return;const i=Number(b.dataset.cell),delta=({ArrowLeft:-1,ArrowRight:1,ArrowUp:-size,ArrowDown:size})[e.key];if(delta!==undefined){e.preventDefault();const next=Math.max(0,Math.min(size*size-1,i+delta));b.tabIndex=-1;board.children[next].tabIndex=0;board.children[next].focus({preventScroll:true});}else if(e.key.toLowerCase()==='f'){e.preventDefault();play(i,true);}});
    body.querySelector('#mine-level').addEventListener('change',e=>{size=Number(e.target.value);bombs=size===9?10:40;reset();});body.querySelector('#mine-new').addEventListener('click',reset);body.querySelector('#mine-flag-mode').addEventListener('click',e=>{flagMode=!flagMode;e.target.setAttribute('aria-pressed',String(flagMode));});
    reset();return {cleanup:stop,visibility:v=>{visible=v;run();}};
  });
})();
