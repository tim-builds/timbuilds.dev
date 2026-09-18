/* A browser inside the desktop; site embedding restrictions are respected. */
(() => {
  'use strict';
  const A=window.TimApps,W=window.TimWindows;
  let controller=null;
  const blockedHosts=new Set(['github.com','www.github.com','solitaire-mocha.vercel.app']);
  function normalize(value){
    if(value==='about:home')return value;
    try {
      const raw=String(value).trim();
      const url=new URL(raw.startsWith('/')?raw:/^[a-z][a-z0-9+.-]*:/i.test(raw)?raw:'https://'+raw,location.href);
      if(url.username||url.password)return null;
      if(url.origin===location.origin)return url.pathname==='/'?'about:home':url.href;
      if(url.protocol!=='https:'||!url.hostname.includes('.')||url.hostname.includes(':'))return null;
      if(/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname))return null;
      return url.href;
    } catch {return null;}
  }
  A.register('browser','Internet Browser','globe',(body,win)=>{
    let history=['about:home'],index=0,current='about:home',frame=null,timer=0,closed=false;
    body.innerHTML='<div class="desktop-browser"><nav class="browser-menu" aria-label="Browser menu"></nav><form class="browser-toolbar"></form><div class="browser-content"></div><div class="browser-status"><span role="status"></span><a data-browser-external target="_blank" rel="noopener noreferrer">Open in real browser ↗</a></div></div>';
    const form=body.querySelector('form'),bar=body.querySelector('.browser-menu');
    for(const [id,label]of [['back','←'],['forward','→'],['reload','↻'],['home','⌂']]) {
      const b=document.createElement('button');b.type='button';b.dataset.browserAction=id;b.textContent=label;b.title=id[0].toUpperCase()+id.slice(1);b.setAttribute('aria-label','Browser '+b.title);form.append(b);
    }
    const address=document.createElement('input');address.className='browser-url';address.type='text';address.setAttribute('aria-label','Website address');address.autocomplete='off';address.spellcheck=false;form.append(address);
    const go=document.createElement('button');go.type='submit';go.textContent='↵';go.setAttribute('aria-label','Go to website');form.append(go);
    for(const [id,label]of [['favorites','Favourites'],['help','Help']]){const b=document.createElement('button');b.dataset.browserMenu=id;b.textContent=label;bar.append(b);}
    const content=body.querySelector('.browser-content'),status=body.querySelector('.browser-status span'),outside=body.querySelector('[data-browser-external]');
    function sync(){address.value=current;form.querySelector('[data-browser-action=back]').disabled=index===0;form.querySelector('[data-browser-action=forward]').disabled=index===history.length-1;outside.hidden=current==='about:home';if(current!=='about:home')outside.href=current;}
    function home(){
      content.innerHTML='<section class="browser-home"><span class="browser-home-kicker">timBuilds Internet</span><h1>Your corner of the web.</h1><p>Open a project, or enter a website address above.</p><div class="browser-bookmarks"></div><p class="browser-home-note">Some websites do not allow embedded viewing. The external-browser button is always available.</p></section>';
      const links=[['OpenHoops','/openhoops/'],['Studio Siomai','https://studio-siomai.vercel.app/'],['Letters with Lola','https://letters-with-lola.vercel.app/'],['Grit Athletics','https://grit-athletics.pages.dev/'],['Solitaire Clemulie','https://solitaire-mocha.vercel.app/'],['GitHub','https://github.com/flushatoilet']];
      for(const [label,url]of links){const b=document.createElement('button');b.textContent=label;b.dataset.bookmark=url;content.querySelector('.browser-bookmarks').append(b);}status.textContent='Home';
    }
    function navigate(value,push=true){
      const next=normalize(value);if(!next){status.textContent='Enter a public HTTPS website address.';address.setAttribute('aria-invalid','true');return false;}
      address.removeAttribute('aria-invalid');clearTimeout(timer);frame?.remove();frame=null;content.replaceChildren();current=next;
      if(push&&history[index]!==next){history=history.slice(0,index+1);history.push(next);if(history.length>50)history.shift();index=history.length-1;}sync();
      if(current==='about:home'){home();return true;}
      const url=new URL(current);
      if(blockedHosts.has(url.hostname)||url.origin===location.origin&&/\/(reset|delete-account)\.html$/.test(url.pathname)){
        content.innerHTML='<section class="browser-message"><div class="browser-message-icon">↗</div><h1>Open this site in your browser</h1><p>This website or account page needs a separate browser tab. Your desktop remains open here.</p><a data-browser-external class="bevel-button" target="_blank" rel="noopener noreferrer">Continue to website ↗</a></section>';content.querySelector('a').href=current;status.textContent='Embedded viewing is unavailable for this page.';return true;
      }
      frame=document.createElement('iframe');frame.className='browser-frame';frame.title='Website: '+url.hostname;frame.referrerPolicy='no-referrer';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads');
      status.textContent='Loading '+url.hostname+'…';frame.src=current;content.append(frame);
      frame.addEventListener('load',()=>{
        if(closed)return;clearTimeout(timer);status.textContent='Website frame loaded. A blank or blocked page can be opened externally.';
        try {const doc=frame.contentDocument;if(!doc)return;const actual=frame.contentWindow.location.href;if(actual!=='about:blank'){current=actual;history[index]=actual;sync();status.textContent=doc.title||url.hostname;}
          doc.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||a.download||event.ctrlKey||event.metaKey)return;const dest=new URL(a.href);if(a.getAttribute('href').startsWith('#'))return;if(!['http:','https:'].includes(dest.protocol))return;event.preventDefault();if(dest.origin===location.origin&&/\/openhoops\/(privacy|terms)\.html$/.test(dest.pathname)){window.TimDocuments.open(dest.pathname.includes('privacy')?'privacy':'terms');}else navigate(dest.href);});
        } catch { /* Cross-origin content is intentionally not inspected. */ }
      });
      timer=setTimeout(()=>{if(!closed)status.textContent='Still waiting. This site may not allow embedded viewing; use Open in real browser.';},12000);return true;
    }
    form.addEventListener('submit',event=>{event.preventDefault();navigate(address.value);});
    body.addEventListener('click',event=>{
      const bookmark=event.target.closest('[data-bookmark]');if(bookmark)navigate(bookmark.dataset.bookmark);
      const action=event.target.closest('[data-browser-action]')?.dataset.browserAction;
      if(action==='back'&&index>0)navigate(history[--index],false);
      if(action==='forward'&&index<history.length-1)navigate(history[++index],false);
      if(action==='reload')navigate(current,false);
      if(action==='home'||event.target.closest('[data-browser-menu=favorites]'))navigate('about:home');
      if(event.target.closest('[data-browser-menu=help]')){status.textContent='Use Back, Forward, Reload, Home and the address field. External sites may block embedding or require cookies; Open in real browser is the fallback.';}
    });
    address.addEventListener('focus',()=>address.select());
    controller={navigate,current:()=>current};home();sync();
    return {cleanup:()=>{closed=true;clearTimeout(timer);frame?.remove();controller=null;}};
  });
  function open(value='about:home'){
    const next=normalize(value);if(!next)return false;
    const dialog=document.querySelector('#detail-dialog');if(dialog?.open)dialog.querySelector('.dialog-close').click();
    A.open('browser');controller?.navigate(next);return true;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||link.hasAttribute('data-browser-external')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;
    const raw=link.getAttribute('href');if(raw.startsWith('#'))return;
    const url=new URL(link.href);if(!['http:','https:'].includes(url.protocol))return;
    if(url.origin===location.origin&&/\/openhoops\/(privacy|terms)\.html$/.test(url.pathname)&&!link.hasAttribute('data-document-original'))return;
    event.preventDefault();event.stopPropagation();open(url.href);
  },true);
  window.TimBrowser=Object.freeze({open,normalize,current:()=>controller?.current()||'about:home'});
})();
