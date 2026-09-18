/* Familiar desktop games, original browser implementations. */
(() => {
  'use strict';const A=window.TimApps,E=window.TimArcadeEngines;
  A.register('solitaire','Solitaire','cards',(body)=>{
    let game=new E.Solitaire(),selected=null,message='Draw a card, or select a face-up card and then a destination.';
    const suits=['♣','♥','♠','♦'],ranks=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    body.innerHTML='<div class="solitaire-app"><div class="app-menubar"><button class="bevel-button" data-sol="new">New deal</button><button class="bevel-button" data-sol="undo">Undo</button><button class="bevel-button" data-sol="auto">To foundation</button><span>Klondike · draw one</span></div><div class="solitaire-table"><div class="solitaire-top"></div><div class="solitaire-columns"></div></div><p class="solitaire-status" role="status"></p></div>';
    const top=body.querySelector('.solitaire-top'),columns=body.querySelector('.solitaire-columns'),status=body.querySelector('.solitaire-status');
    function card(c,source,index){
      const b=document.createElement('button');b.className='playing-card'+(c.up?(c.suit%2?' red-card':''):' card-back');
      b.dataset.pile=source.pile;b.dataset.type=source.type;b.dataset.index=index;b.disabled=!c.up;
      b.setAttribute('aria-label',c.up?ranks[c.rank]+' of '+['clubs','hearts','spades','diamonds'][c.suit]:'Face-down card');
      if(c.up)b.innerHTML='<span>'+ranks[c.rank]+suits[c.suit]+'</span><b>'+suits[c.suit]+'</b>';
      if(selected?.type===source.type&&selected.pile===source.pile&&index>=selected.index)b.classList.add('selected-card');return b;
    }
    function pile(type,i){const node=document.createElement('div');node.className='solitaire-pile';node.dataset.pile=i;node.dataset.type=type;const empty=document.createElement('button');empty.className='empty-pile';empty.dataset.pile=i;empty.dataset.type=type;empty.textContent=type==='foundation'?suits[i]:'K';empty.setAttribute('aria-label',type==='foundation'?'Foundation '+suits[i]:'Empty tableau column '+(i+1));node.append(empty);return node;}
    function render(){
      top.replaceChildren();columns.replaceChildren();
      const stock=document.createElement('button');stock.className='playing-card '+(game.stock.length?'card-back':'stock-empty');stock.dataset.sol='draw';stock.setAttribute('aria-label',game.stock.length?'Draw from stock':'Recycle waste');stock.textContent=game.stock.length?'':'↻';top.append(stock);
      const waste=pile('waste',0);waste.querySelector('button').textContent='';if(game.waste.length)waste.append(card(game.waste.at(-1),{type:'waste',pile:0},game.waste.length-1));top.append(waste);top.append(document.createElement('div'));
      game.foundations.forEach((p,i)=>{const n=pile('foundation',i);if(p.length)n.append(card(p.at(-1),{type:'foundation',pile:i},p.length-1));top.append(n);});
      game.tableau.forEach((p,i)=>{const n=pile('tableau',i);n.style.minHeight=Math.max(112,100+(p.length-1)*24)+'px';p.forEach((c,j)=>{const b=card(c,{type:'tableau',pile:i},j);b.style.top=j*24+'px';n.append(b);});columns.append(n);});
      status.textContent=(game.won?'You won! All four suits are home.':message)+' · Moves: '+game.moves;body.querySelector('[data-sol=undo]').disabled=!game.history.length;
    }
    body.addEventListener('click',e=>{
      const command=e.target.closest('[data-sol]')?.dataset.sol;
      if(command){if(command==='new')game=new E.Solitaire();if(command==='draw')game.draw();if(command==='undo')game.undo();if(command==='auto')message=game.auto()?'Moved to the foundation.':'No exposed card can move to a foundation yet.';selected=null;render();return;}
      const b=e.target.closest('button[data-type]');if(!b)return;
      const target={type:b.dataset.type,pile:Number(b.dataset.pile),index:b.dataset.index===undefined?undefined:Number(b.dataset.index)};
      if(selected&&game.move(selected,target)){selected=null;message='Card moved.';render();return;}
      const p=game.pile(target.type,target.pile);
      if(target.index!==undefined&&p[target.index]?.up){selected=target;message='Choose a destination. Build descending in alternating colours; foundations build A to K.';}else{selected=null;message='Only a king can start an empty column.';}render();
    });
    render();
  });
  A.register('reversi','Reversi','mine',(body)=>{
    let game=new E.Reversi(),computer=true,timer=null,visible=true,closed=false;
    body.innerHTML='<div class="reversi-app"><div class="app-menubar"><button class="bevel-button" data-reversi="new">New game</button><button class="bevel-button" data-reversi="undo">Undo turn</button><label>Opponent <select id="reversi-opponent"><option value="computer">Computer</option><option value="human">Two players</option></select></label></div><p id="reversi-score"></p><div class="reversi-board" role="grid" aria-label="Reversi board"></div><p id="reversi-status" role="status"></p></div>';
    const board=body.querySelector('.reversi-board'),status=body.querySelector('#reversi-status');
    function ai(){clearTimeout(timer);if(!closed&&visible&&computer&&game.turn===2&&!game.over)timer=setTimeout(()=>{game.move(game.bestMove());render();},420);}
    function render(){const legal=game.legal(),score=game.score();board.replaceChildren();for(let i=0;i<64;i++){const b=document.createElement('button');b.dataset.square=i;b.setAttribute('role','gridcell');b.setAttribute('aria-label',String.fromCharCode(65+i%8)+(Math.floor(i/8)+1)+': '+(game.board[i]===1?'black':game.board[i]===2?'white':legal.includes(i)?'legal move':'empty'));b.className=game.board[i]?'disc-'+game.board[i]:legal.includes(i)?'legal-square':'';b.innerHTML=game.board[i]?'<i></i>':legal.includes(i)?'·':'';board.append(b);}body.querySelector('#reversi-score').textContent='Black '+score[0]+' — '+score[1]+' White';status.textContent=game.over?(score[0]===score[1]?'Draw.':(score[0]>score[1]?'Black':'White')+' wins.'):(game.turn===1?'Black':'White')+' to move. Bracket the opposing discs to flip them.';ai();}
    board.addEventListener('click',e=>{const b=e.target.closest('[data-square]');if(!b||computer&&game.turn===2)return;if(game.move(Number(b.dataset.square)))render();});
    body.addEventListener('click',e=>{const command=e.target.closest('[data-reversi]')?.dataset.reversi;if(!command)return;clearTimeout(timer);if(command==='new')game=new E.Reversi();else{game.undo();if(computer&&game.turn===2)game.undo();}render();});
    body.querySelector('select').addEventListener('change',e=>{computer=e.target.value==='computer';ai();});render();return {cleanup:()=>{closed=true;clearTimeout(timer);},visibility:v=>{visible=v;ai();}};
  });
})();
