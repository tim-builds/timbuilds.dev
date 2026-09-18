/* Deterministic accessory logic, shared by browser and tests. No eval(). */
((root)=>{
  'use strict';
  class Calculator {
    constructor(){this.memory=0;this.clear();}
    clear(){this.display='0';this.total=null;this.operator=null;this.fresh=true;this.last=null;}
    value(){return Number(this.display);}
    put(n){this.display=Number.isFinite(n)?String(Number(n.toPrecision(12))):'Error';this.fresh=true;}
    calculate(a,op,b){return op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:op==='/'?(b===0?NaN:a/b):b;}
    input(key){
      if(key==='C'){this.clear();return;}if(this.display==='Error'&&!['MR','MC'].includes(key))this.clear();
      if(/^\d$/.test(key)||key==='.'){if(this.fresh){this.display=key==='.'?'0.':key;this.fresh=false;}else if(key==='.'&&!this.display.includes('.'))this.display+='.';else if(key!=='.'&&this.display.replace(/[-.]/g,'').length<12)this.display=this.display==='0'?key:this.display+key;return;}
      if(key==='CE'){this.display='0';this.fresh=true;return;}if(key==='BS'){this.display=this.display.length>1?this.display.slice(0,-1):'0';if(this.display==='-')this.display='0';return;}
      if(key==='+/-'){if(this.value())this.display=String(-this.value());return;}
      if(key==='MC'){this.memory=0;return;}if(key==='MR'){this.put(this.memory);return;}if(key==='MS'){this.memory=this.value();return;}if(key==='M+'){this.memory+=this.value();return;}
      if(key==='%'){this.put(this.total!==null&&['+','-'].includes(this.operator)?this.total*this.value()/100:this.value()/100);this.fresh=false;return;}
      if(key==='sqrt'){this.put(Math.sqrt(this.value()));return;}if(key==='1/x'){this.put(this.value()===0?NaN:1/this.value());return;}
      if(['+','-','*','/'].includes(key)){if(this.operator&&!this.fresh)this.put(this.calculate(this.total,this.operator,this.value()));else this.total=this.value();this.total=this.value();this.operator=key;this.fresh=true;this.last=null;return;}
      if(key==='='){if(this.operator){const operand=this.value(),op=this.operator;this.put(this.calculate(this.total,op,operand));this.last={op,operand};this.operator=null;this.total=null;}else if(this.last)this.put(this.calculate(this.value(),this.last.op,this.last.operand));}
    }
  }
  class Mines {
    constructor(size=9,bombs=10,random=Math.random){this.size=size;this.bombs=bombs;this.random=random;this.cells=Array.from({length:size*size},()=>({bomb:false,open:false,flag:false,count:0}));this.started=false;this.over=false;this.won=false;}
    neighbors(i){const out=[],x=i%this.size,y=Math.floor(i/this.size);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if((dx||dy)&&nx>=0&&nx<this.size&&ny>=0&&ny<this.size)out.push(ny*this.size+nx);}return out;}
    seed(first){const excluded=new Set([first,...this.neighbors(first)]),available=this.cells.map((_,i)=>i).filter(i=>!excluded.has(i));for(let i=available.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[available[i],available[j]]=[available[j],available[i]];}for(const i of available.slice(0,this.bombs))this.cells[i].bomb=true;for(let i=0;i<this.cells.length;i++)this.cells[i].count=this.neighbors(i).filter(j=>this.cells[j].bomb).length;this.started=true;}
    reveal(i){if(this.over||!this.cells[i]||this.cells[i].flag||this.cells[i].open)return;if(!this.started)this.seed(i);if(this.cells[i].bomb){this.cells[i].open=true;this.over=true;return;}const queue=[i];while(queue.length){const j=queue.pop(),c=this.cells[j];if(c.open||c.flag||c.bomb)continue;c.open=true;if(!c.count)queue.push(...this.neighbors(j));}this.won=this.cells.filter(c=>!c.bomb).every(c=>c.open);if(this.won){this.over=true;for(const c of this.cells)if(c.bomb)c.flag=true;}}
    flag(i){if(!this.over&&this.cells[i]&&!this.cells[i].open)this.cells[i].flag=!this.cells[i].flag;}
    chord(i){const c=this.cells[i];if(this.over||!c?.open||c.count!==this.neighbors(i).filter(j=>this.cells[j].flag).length)return;for(const j of this.neighbors(i))this.reveal(j);}
  }
  root.TimClassicEngines=Object.freeze({Calculator,Mines});
})(globalThis);
