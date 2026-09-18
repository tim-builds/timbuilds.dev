/* Local-only drawing accessory. */
(() => {
  'use strict';
  const A = window.TimApps;
  A.register('paint', 'Paint', 'paint', (body) => {
    const toolbar = document.createElement('div');
    toolbar.className = 'app-menubar';
    const canvas = document.createElement('canvas');
    canvas.id = 'paint-canvas';
    canvas.width = 768;
    canvas.height = 480;
    canvas.setAttribute('aria-label', 'Drawing canvas');
    const paper = document.createElement('div');
    paper.className = 'paint-paper';
    paper.append(canvas);
    body.append(toolbar, paper);
    const context = canvas.getContext('2d', {willReadFrequently: true});
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    let tool = 'pencil', color = '#000000', width = 3, drawing = null;
    const history = [], redo = [];
    const snapshot = () => context.getImageData(0, 0, canvas.width, canvas.height);
    function remember() {
      history.push(snapshot());
      if (history.length > 12) history.shift();
      redo.length = 0;
    }
    function control(label, action) {
      const b = document.createElement('button');
      b.className = 'bevel-button'; b.textContent = label;
      b.addEventListener('click', action); toolbar.append(b); return b;
    }
    const tools = document.createElement('select');
    tools.id = 'paint-tool'; tools.setAttribute('aria-label', 'Drawing tool');
    for (const name of ['pencil','brush','eraser','line','rectangle','ellipse']) {
      const option = document.createElement('option'); option.value = name;
      option.textContent = name[0].toUpperCase()+name.slice(1); tools.append(option);
    }
    tools.addEventListener('change', () => tool = tools.value); toolbar.append(tools);
    const ink = document.createElement('input'); ink.type = 'color'; ink.value = color;
    ink.setAttribute('aria-label', 'Paint colour'); ink.addEventListener('input', () => color=ink.value); toolbar.append(ink);
    const size = document.createElement('select'); size.setAttribute('aria-label','Brush size');
    for (const value of [1,3,6,12,24]) { const o=document.createElement('option');o.value=value;o.textContent=value+' px';o.selected=value===width;size.append(o); }
    size.addEventListener('change',()=>width=Number(size.value));toolbar.append(size);
    control('Undo',()=>{if(history.length){redo.push(snapshot());context.putImageData(history.pop(),0,0);}});
    control('Redo',()=>{if(redo.length){history.push(snapshot());context.putImageData(redo.pop(),0,0);}});
    control('Clear',()=>{remember();context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);});
    control('Save PNG',()=>canvas.toBlob(blob=>{if(blob)A.download(blob,'Untitled.png');},'image/png'));
    const note=document.createElement('p');note.className='accessory-note';
    note.textContent='Draw with your mouse or finger. Save PNG to keep a copy. Undo remembers the last 12 changes.';body.append(note);
    const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};};
    function setup(){context.strokeStyle=tool==='eraser'?'white':color;context.fillStyle=context.strokeStyle;context.lineWidth=tool==='eraser'?Math.max(12,width):tool==='brush'?width*2:width;context.lineCap='round';context.lineJoin='round';}
    canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;e.preventDefault();remember();setup();const p=point(e);
      drawing={id:e.pointerId,start:p,last:p,base:snapshot()};canvas.setPointerCapture(e.pointerId);
      if(['pencil','brush','eraser'].includes(tool)){context.beginPath();context.arc(p.x,p.y,context.lineWidth/2,0,Math.PI*2);context.fill();}
    });
    canvas.addEventListener('pointermove',e=>{
      if(!drawing||drawing.id!==e.pointerId)return;const p=point(e),s=drawing.start;setup();
      if(['line','rectangle','ellipse'].includes(tool)){
        context.putImageData(drawing.base,0,0);context.beginPath();
        if(tool==='line'){context.moveTo(s.x,s.y);context.lineTo(p.x,p.y);}
        else if(tool==='rectangle')context.rect(s.x,s.y,p.x-s.x,p.y-s.y);
        else context.ellipse((s.x+p.x)/2,(s.y+p.y)/2,Math.abs(p.x-s.x)/2,Math.abs(p.y-s.y)/2,0,0,Math.PI*2);
        context.stroke();
      }else{context.beginPath();context.moveTo(drawing.last.x,drawing.last.y);context.lineTo(p.x,p.y);context.stroke();}
      drawing.last=p;
    });
    function stop(e){if(!drawing)return;if(e.type!=='pointerup')context.putImageData(drawing.base,0,0);drawing=null;}
    canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('lostpointercapture',stop);
    return {cleanup:()=>{drawing=null;history.length=0;redo.length=0;},visibility:v=>{if(!v)stop({type:'cancel'});}};
  });
})();
