/* Puzzle rules only. Solving any number of layers never grants catalogue access. */
(() => {
  'use strict';
  function random(seed){let x=(seed>>>0)||741103;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
  function shuffle(list,rng){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function maze(size,rng){
    const cells=Array.from({length:size},()=>Array(size).fill(1));cells[0][0]=0;const stack=[[0,0]];
    while(stack.length){const [x,y]=stack[stack.length-1],choices=shuffle([[2,0],[-2,0],[0,2],[0,-2]],rng).filter(([dx,dy])=>x+dx>=0&&y+dy>=0&&x+dx<size&&y+dy<size&&cells[y+dy][x+dx]===1);
      if(!choices.length){stack.pop();continue;}const [dx,dy]=choices[0];cells[y+dy/2][x+dx/2]=0;cells[y+dy][x+dx]=0;stack.push([x+dx,y+dy]);
    }return cells;
  }
  function makeStage(number,seed){
    const n=Math.max(0,Math.floor(number)),cycle=Math.floor(n/12),rng=random((seed+n*2654435761)>>>0);
    const intro=['answer','answer','cipher','captcha','tiles','memory','maze','arithmetic','policy','tiles','order','answer'];
    const loop=['cipher','captcha','tiles','memory','maze','policy','order','arithmetic'];
    const type=n<12?intro[n]:loop[(n-12)%loop.length];
    const stage={number:n,type,cycle,title:'Verification required',hint:'',answer:'',rules:[]};
    if(type==='answer'){
      const entries=[{title:'Folder passphrase',answer:'open',hint:'Four letters. What do you do to a door? Starts with O.'},{title:'Legacy system check',answer:'1995',hint:'The four-digit year in Windows 95.'},{title:'The file with no extension',answer:'NOT_A_PASSWORD',hint:'Remove the extension from NOT_A_PASSWORD.TXT. Keep the underscores.'}];
      Object.assign(stage,entries[n===0?0:n===1?1:2]);
    }
    if(type==='cipher'){
      const word=n===2?'FOLDER':['RECURSION','FLOPPY','OVERFLOW','DEFRAG','MODEM','DIRECTORY'][Math.floor(rng()*6)],shift=n===2?1:1+cycle%7;
      stage.title='Decrypt the recovery fragment';stage.answer=word;stage.display=[...word].map(c=>String.fromCharCode(65+(c.charCodeAt(0)-65+shift)%26)).join('');stage.hint=`Shift each letter ${shift} place${shift===1?'':'s'} backwards through the alphabet. A wraps to Z.`;
    }
    if(type==='captcha'){
      const token=n===3?'DISK7':['PLEASEHOLD','ALMOSTHUMAN','FAXMACHINE','NOTAROBOT','MILDLYPANICKED'][Math.floor(rng()*5)]+(10+Math.floor(rng()*89));
      stage.title=cycle>1?'Legibility compliance audit':'Optical verification';stage.display=token;stage.reverse=cycle%2===1;stage.answer=stage.reverse?[...token].reverse().join(''):token;stage.hint=stage.reverse?'Read the characters from RIGHT to LEFT. The scanner was installed backwards.':'Copy the characters below, ignoring the interference lines. The text alternative is available underneath.';
    }
    if(type==='tiles'){
      const traffic=n===9||cycle%2===1;stage.title=traffic?'Select all traffic lights with impostor syndrome':'Select all floppy disks with an alibi';
      stage.hint=traffic?'Select a traffic light only when its caption says “doubts itself”. Confident traffic lights and anxious ducks do not count.':'Select a floppy disk only when its caption says “alibi on file”. A cloud is not a disk, regardless of its paperwork.';
      const positive=traffic?'doubts itself':'alibi on file',negative=traffic?'very confident':'no alibi',kind=traffic?'traffic':'disk';
      stage.tiles=shuffle(Array.from({length:9},(_,i)=>({kind:i<6?kind:i===6?'duck':i===7?'cloud':'folder',label:i<6?(traffic?'Traffic light':'Floppy disk'):i===6?'Duck':i===7?'Cloud':'Folder',note:i%2===0?positive:negative,correct:i<6&&i%2===0})),rng);
    }
    if(type==='memory'){
      stage.title='Reconstruct the boot sequence';stage.sequence=Array.from({length:Math.min(8,3+cycle)},()=>1+Math.floor(rng()*4));
      stage.hint='Replay the flashing pads, then press the same numbers in order. A text transcript is available. One incorrect pad restarts your entry, not your progress.';
    }
    if(type==='maze'){
      stage.title='Route the packet to port 95';stage.size=Math.min(9,5+2*Math.floor(cycle/2));stage.cells=maze(stage.size,rng);
      stage.hint='Move the packet from the top-left to the bottom-right. Dark squares are blocked. Use the arrow controls or focus the board and use your keyboard.';
    }
    if(type==='arithmetic'){
      const a=10+Math.floor(rng()*70),b=2+Math.floor(rng()*9);stage.title='Checksum reconciliation';stage.display=`(${a} × ${b}) + 95`;stage.answer=String(a*b+95);stage.hint='Multiply the two numbers in parentheses, then add 95. Decimal digits only. The calculator department is on lunch.';
    }
    if(type==='policy'){
      stage.title='Recovery phrase policy';stage.prefix=['DISK','BIOS','BOOT','PING'][cycle%4];stage.sum=Math.min(17,7+cycle*2);stage.suffix=cycle%2?'!':'?';
      stage.hint=`Use ${stage.prefix}, exactly two digits adding up to ${stage.sum}, then ${stage.suffix}. All four requirements must be satisfied at the same time.`;
      stage.answer=stage.prefix+Math.max(0,stage.sum-9)+Math.min(9,stage.sum)+stage.suffix;
    }
    if(type==='order'){
      stage.title='Defragment the access sectors';stage.order=shuffle(Array.from({length:Math.min(9,6+cycle)},(_,i)=>i+1),rng);
      stage.hint='Click the numbered sectors in ascending order, starting with 1. Their positions stay put. A wrong sector restarts this layer’s sequence.';
    }
    return stage;
  }
  function checks(stage,value){
    const text=String(value||'').trim().toUpperCase();
    if(stage.type==='policy'){
      const digits=text.slice(4,-1);
      return [
        {label:`Starts with ${stage.prefix}`,pass:text.startsWith(stage.prefix)},
        {label:'Exactly seven characters',pass:text.length===7},
        {label:`The two middle digits add up to ${stage.sum}`,pass:/^\d{2}$/.test(digits)&&Number(digits[0])+Number(digits[1])===stage.sum},
        {label:`Ends with ${stage.suffix}`,pass:text.endsWith(stage.suffix)}
      ];
    }
    return [{label:'Response matches the recovery hint',pass:text===stage.answer.toUpperCase()}];
  }
  function validate(stage,value){
    if(stage.type==='tiles'){if(!Array.isArray(value))return false;const indices=new Set(value);return stage.tiles.every((tile,i)=>indices.has(i)===tile.correct);}
    if(stage.type==='memory')return Array.isArray(value)&&value.length===stage.sequence.length&&value.every((v,i)=>v===stage.sequence[i]);
    if(stage.type==='order')return Array.isArray(value)&&value.length===stage.order.length&&value.every((v,i)=>v===i+1);
    if(stage.type==='maze')return value?.x===stage.size-1&&value?.y===stage.size-1;
    return checks(stage,value).every(rule=>rule.pass);
  }
  window.TimChallengeRules=Object.freeze({makeStage,checks,validate});
})();
