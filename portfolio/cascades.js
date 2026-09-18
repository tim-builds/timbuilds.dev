/* Cascading launch menus: side panels, not inline accordions. */
(() => {
  'use strict';
  let dispose=()=>{};
  function mount(nav){
    dispose();const root=nav.closest('#start-menu'),controller=new AbortController(),signal=controller.signal;
    let active=null,hoverTimer=null,leaveTimer=null,raf=0;
    const listen=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal});
    const parent=g=>g.querySelector(':scope > .start-parent'),panel=g=>g.querySelector(':scope > .start-submenu');
    function clear(){clearTimeout(hoverTimer);clearTimeout(leaveTimer);}
    function close(focus=false){clear();if(!active)return;const g=active;active=null;g.classList.remove('submenu-open');parent(g).setAttribute('aria-expanded','false');panel(g).hidden=true;if(focus)parent(g).focus({preventScroll:true});}
    function position(){if(!active||root.hidden)return;const g=active,sub=panel(g),anchor=parent(g).getBoundingClientRect();
      const width=Math.min(232,document.documentElement.clientWidth-12),top=window.TimWindows?.workTop?.()||0,bottom=window.TimWindows?.workBottom?.()||innerHeight;
      const rootRect=root.getBoundingClientRect();let x=rootRect.right-2,side='right';if(x+width>document.documentElement.clientWidth-4){x=rootRect.left-width+2;side='left';}
      if(x<4){x=Math.max(4,document.documentElement.clientWidth-width-6);side='overlay';}
      sub.dataset.side=side;sub.style.width=width+'px';sub.style.maxHeight=Math.max(120,bottom-top-8)+'px';sub.style.left=x+'px';sub.style.top=top+4+'px';
      const back=sub.querySelector('.cascade-back');back.hidden=side!=='overlay';const height=sub.getBoundingClientRect().height;
      sub.style.top=Math.max(top+4,Math.min(anchor.top-3,bottom-height-4))+'px';
    }
    function open(g,focus=false){clear();if(active&&active!==g)close();active=g;g.classList.add('submenu-open');parent(g).setAttribute('aria-expanded','true');panel(g).hidden=false;position();if(focus)panel(g).querySelector('button:not([hidden]):not(:disabled)')?.focus({preventScroll:true});}
    const groups=[...nav.querySelectorAll('.start-group')];
    groups.forEach((g,i)=>{const p=parent(g),sub=panel(g);p.setAttribute('aria-haspopup','menu');p.setAttribute('aria-controls','cascade-'+i);p.setAttribute('aria-expanded','false');sub.id='cascade-'+i;sub.classList.add('cascade-panel');sub.setAttribute('role','menu');sub.hidden=true;
      const back=document.createElement('button');back.type='button';back.className='cascade-back';back.textContent='‹ '+p.querySelector('span').textContent;back.hidden=true;back.setAttribute('aria-label','Back to Start menu');sub.prepend(back);listen(back,'click',()=>close(true));
      listen(p,'click',()=>active===g?close():open(g));listen(p,'pointerenter',e=>{if(e.pointerType!=='mouse')return;clear();hoverTimer=setTimeout(()=>open(g),110);});
      listen(g,'pointerleave',e=>{if(e.pointerType!=='mouse'||g.contains(e.relatedTarget))return;clearTimeout(hoverTimer);leaveTimer=setTimeout(()=>{if(active===g)close();},300);});listen(g,'pointerenter',()=>clearTimeout(leaveTimer));
    });
    listen(nav,'keydown',e=>{const b=e.target.closest('button');if(!b)return;const sub=b.closest('.cascade-panel');
      if(e.key==='ArrowRight'&&b.classList.contains('start-parent')){e.preventDefault();open(b.closest('.start-group'),true);return;}
      if(e.key==='ArrowLeft'&&sub){e.preventDefault();close(true);return;}
      if(e.key==='Escape'&&active){e.preventDefault();e.stopPropagation();close(true);return;}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const scope=sub||nav;
      const items=[...scope.querySelectorAll('button')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length&&(sub||!el.closest('.cascade-panel')));const i=items.indexOf(b);
      const next=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus({preventScroll:true});
    });
    listen(nav,'pointerover',e=>{if(e.pointerType!=='mouse')return;const b=e.target.closest('button');if(b&&!b.classList.contains('start-parent')&&!b.closest('.cascade-panel'))close();});
    listen(nav,'click',e=>{if(e.target.closest('button:not(.start-parent):not(.cascade-back)'))close();});
    const observer=new MutationObserver(()=>{if(root.hidden)close();});observer.observe(root,{attributes:true,attributeFilter:['hidden']});
    const reposition=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(position);};listen(window,'resize',reposition);listen(root,'scroll',reposition,{passive:true});listen(window,'blur',()=>close());
    dispose=()=>{close();cancelAnimationFrame(raf);observer.disconnect();controller.abort();};
  }
  window.TimCascades=Object.freeze({mount});
})();
