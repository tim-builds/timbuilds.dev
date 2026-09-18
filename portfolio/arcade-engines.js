/* Original game logic shared by browser and tests. */
((root)=>{
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  class Solitaire {
    constructor(random=Math.random){
      this.history=[];this.moves=0;
      const deck=Array.from({length:52},(_,i)=>({id:i,suit:Math.floor(i/13),rank:i%13+1,up:false}));
      for(let i=51;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
      this.tableau=Array.from({length:7},(_,n)=>{const pile=deck.splice(0,n+1);pile[n].up=true;return pile;});
      this.stock=deck;this.waste=[];this.foundations=[[],[],[],[]];
    }
    snapshot(){return clone({tableau:this.tableau,stock:this.stock,waste:this.waste,foundations:this.foundations,moves:this.moves});}
    remember(){this.history.push(this.snapshot());if(this.history.length>80)this.history.shift();this.moves++;}
    undo(){const old=this.history.pop();if(old)Object.assign(this,old);return !!old;}
    pile(type,i=0){return type==='tableau'?this.tableau[i]:type==='foundation'?this.foundations[i]:type==='waste'?this.waste:null;}
    draw(){if(!this.stock.length&&!this.waste.length)return false;this.remember();if(this.stock.length){const c=this.stock.pop();c.up=true;this.waste.push(c);}else{this.stock=this.waste.reverse().map(c=>({...c,up:false}));this.waste=[];}return true;}
    move(source,dest){
      const from=this.pile(source.type,source.pile),to=this.pile(dest.type,dest.pile);
      if(!from||!to||from===to||dest.type==='waste')return false;
      const index=source.index??from.length-1,cards=from.slice(index);
      if(!cards.length||!cards[0].up||source.type!=='tableau'&&cards.length!==1)return false;
      for(let i=1;i<cards.length;i++)if(!cards[i].up||cards[i-1].rank!==cards[i].rank+1||cards[i-1].suit%2===cards[i].suit%2)return false;
      const first=cards[0],top=to.at(-1);
      if(dest.type==='foundation'){if(cards.length!==1||first.suit!==dest.pile||first.rank!==(top?top.rank+1:1))return false;}
      else if(top?top.suit%2===first.suit%2||top.rank!==first.rank+1:first.rank!==13)return false;
      this.remember();to.push(...from.splice(index));if(from.length&&source.type==='tableau')from.at(-1).up=true;return true;
    }
    auto(){for(const source of [{type:'waste',pile:0},...this.tableau.map((_,i)=>({type:'tableau',pile:i}))]){const c=this.pile(source.type,source.pile).at(-1);if(c&&this.move(source,{type:'foundation',pile:c.suit}))return true;}return false;}
    get won(){return this.foundations.every(p=>p.length===13);}
  }
  class Reversi {
    constructor(){this.board=Array(64).fill(0);this.board[27]=this.board[36]=2;this.board[28]=this.board[35]=1;this.turn=1;this.over=false;this.history=[];}
    flips(index,player=this.turn){if(index<0||index>=64||this.board[index])return [];const out=[],x=index%8,y=Math.floor(index/8);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const line=[];for(let nx=x+dx,ny=y+dy;nx>=0&&nx<8&&ny>=0&&ny<8;nx+=dx,ny+=dy){const v=this.board[ny*8+nx];if(v===3-player)line.push(ny*8+nx);else{if(v===player)out.push(...line);break;}}}return out;}
    legal(player=this.turn){return this.board.map((_,i)=>i).filter(i=>this.flips(i,player).length);}
    move(index){if(this.over)return false;const flipped=this.flips(index);if(!flipped.length)return false;this.history.push({board:[...this.board],turn:this.turn,over:this.over});this.board[index]=this.turn;for(const i of flipped)this.board[i]=this.turn;this.turn=3-this.turn;if(!this.legal().length){this.turn=3-this.turn;if(!this.legal().length)this.over=true;}return true;}
    undo(){const old=this.history.pop();if(old)Object.assign(this,old);return !!old;}
    bestMove(){const corners=[0,7,56,63],danger=[1,6,8,9,14,15,48,49,54,55,57,62];const value=i=>(corners.includes(i)?100:danger.includes(i)?-20:0)+this.flips(i).length;return this.legal().sort((a,b)=>value(b)-value(a))[0];}
    score(){return [this.board.filter(v=>v===1).length,this.board.filter(v=>v===2).length];}
  }
  const courses=[
    {name:'First putt',par:2,start:[110,210],cup:[610,210],walls:[],sand:[],water:[]},
    {name:'Around the bend',par:3,start:[90,315],cup:[625,100],walls:[[310,155,38,250]],sand:[],water:[]},
    {name:'The narrow gate',par:3,start:[85,210],cup:[635,210],walls:[[330,20,32,145],[330,265,32,135]],sand:[],water:[]},
    {name:'Sandy shortcut',par:3,start:[90,120],cup:[620,310],walls:[],sand:[[275,120,170,180]],water:[]},
    {name:'Waterfront',par:4,start:[90,325],cup:[630,100],walls:[],sand:[],water:[[260,145,190,155]]},
    {name:'Bank shot',par:3,start:[100,210],cup:[620,210],walls:[[340,115,35,205]],sand:[],water:[]},
    {name:'Slalom',par:4,start:[75,80],cup:[635,340],walls:[[200,20,26,225],[455,175,26,225]],sand:[],water:[]},
    {name:'Twin islands',par:4,start:[75,210],cup:[640,210],walls:[[335,170,30,80]],sand:[[190,285,100,90]],water:[[180,80,115,125],[445,235,110,100]]},
    {name:'The clubhouse',par:4,start:[80,340],cup:[630,85],walls:[[220,170,28,230],[470,20,28,230]],sand:[[280,290,115,80]],water:[]}
  ];
  class Golf {
    constructor(index=0){this.index=index;this.course=courses[index];if(!this.course)throw new Error('Unknown course');[this.x,this.y]=this.course.start;this.vx=0;this.vy=0;this.strokes=0;this.sunk=false;this.last=[this.x,this.y];this.penalty=false;}
    get moving(){return Math.hypot(this.vx,this.vy)>.04;}
    shoot(angle,power){if(this.moving||this.sunk||!Number.isFinite(angle)||!Number.isFinite(power))return false;const speed=Math.max(1,Math.min(100,power))*.12;this.last=[this.x,this.y];this.vx=Math.cos(angle)*speed;this.vy=Math.sin(angle)*speed;this.strokes++;this.penalty=false;return true;}
    step(dt=1){if(!this.moving||this.sunk)return;dt=Math.max(0,Math.min(2,dt));const inside=(r,x,y)=>x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3];
      for(let k=0;k<5;k++){const oldX=this.x,oldY=this.y;this.x+=this.vx*dt/5;this.y+=this.vy*dt/5;
        if(this.x<27||this.x>693){this.x=Math.max(27,Math.min(693,this.x));this.vx*=-.78;}if(this.y<27||this.y>393){this.y=Math.max(27,Math.min(393,this.y));this.vy*=-.78;}
        for(const r of this.course.walls){if(this.x+7>r[0]&&this.x-7<r[0]+r[2]&&this.y+7>r[1]&&this.y-7<r[1]+r[3]){if(oldX+7<=r[0]||oldX-7>=r[0]+r[2]){this.x=oldX;this.vx*=-.8;}else{this.y=oldY;this.vy*=-.8;}}}
        if(this.course.water.some(r=>inside(r,this.x,this.y))){[this.x,this.y]=this.last;this.vx=this.vy=0;this.strokes++;this.penalty=true;return;}
        const d=Math.hypot(this.x-this.course.cup[0],this.y-this.course.cup[1]);if(d<11&&Math.hypot(this.vx,this.vy)<5){[this.x,this.y]=this.course.cup;this.vx=this.vy=0;this.sunk=true;return;}
      }
      const friction=this.course.sand.some(r=>inside(r,this.x,this.y))?.87:.989;this.vx*=Math.pow(friction,dt);this.vy*=Math.pow(friction,dt);if(Math.hypot(this.vx,this.vy)<.06)this.vx=this.vy=0;
    }
  }
  root.TimArcadeEngines=Object.freeze({Solitaire,Reversi,Golf,courses});
})(globalThis);
