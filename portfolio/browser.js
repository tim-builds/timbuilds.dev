/* Website browser: project information stays here; actual game launches use real tabs. */
(() => {
  'use strict';
  const A=window.TimApps,sites=window.TimProjectSites||[];
  const blockedHosts=new Set(['github.com','www.github.com']);
  let controller=null;
  function normalize(value){
    if(value==='about:home')return value;
    try{
      const raw=String(value).trim();
      const url=new URL(raw.startsWith('/')?raw:/^[a-z][a-z0-9+.-]*:/i.test(raw)?raw:'https://'+raw,location.href);
      if(url.username||url.password)return null;
      const app=sites.find(s=>s.launch&&new URL(s.launch).origin===url.origin);
      if(app)return new URL(app.site,location.origin).href;
      if(url.origin===location.origin){if(url.pathname==='/'||url.pathname==='/index.html')return 'about:home';return url.href;}
      if(url.protocol!=='https:'||!url.hostname.includes('.')||url.hostname.includes(':'))return null;
      if(/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname))return null;
      return url.href;
    }catch{return null;}
  }
  function isOwnedPage(url){return url.origin===location.origin&&['/openhoops/',...sites.map(s=>s.site)].some(p=>url.pathname===p||url.pathname===p+'index.html');}
  function policy(url){return url.origin===location.origin&&/^\/openhoops\/(privacy|terms)\.html$/.test(url.pathname)?(url.pathname.includes('privacy')?'privacy':'terms'):null;}
  function follow(link,event){
    if(!link||link.hasAttribute('download')||link.hasAttribute('data-launch-app')||link.hasAttribute('data-browser-external')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return false;
    if(link.getAttribute('href')?.startsWith('#'))return false;let url;try{url=new URL(link.href);}catch{return false;}
    if(!['http:','https:'].includes(url.protocol))return false;event.preventDefault();event.stopImmediatePropagation();
    const doc=policy(url);if(doc&&!link.hasAttribute('data-document-original'))window.TimDocuments.open(doc);else open(url.href);return true;
  }
  A.register('browser','Internet Browser','globe',(body)=>{
    let history=['about:home'],index=0,current='about:home',frame=null,timer=0,closed=false;
    body.innerHTML='<div class="desktop-browser"><nav class="browser-menu" aria-label="Browser menu"></nav><form class="browser-toolbar"></form><div class="browser-content"></div><div class="browser-status"><span role="status"></span><a data-browser-external target="_blank" rel="noopener noreferrer">Open in real browser ↗</a></div></div>';
    const form=body.querySelector('form'),bar=body.querySelector('.browser-menu');
    for(const [id,label] of [['back','←'],['forward','→'],['reload','↻'],['home','⌂']]){
      const b=document.createElement('button');b.type='button';b.dataset.browserAction=id;b.textContent=label;b.title=id[0].toUpperCase()+id.slice(1);b.setAttribute('aria-label','Browser '+b.title);form.append(b);
    }
    const address=document.createElement('input');address.className='browser-url';address.type='text';address.setAttribute('aria-label','Website address');address.autocomplete='off';address.spellcheck=false;form.append(address);
    const go=document.createElement('button');go.type='submit';go.textContent='↵';go.setAttribute('aria-label','Go to website');form.append(go);
    for(const [id,label] of [['favorites','Favourites'],['help','Help']]){const b=document.createElement('button');b.dataset.browserMenu=id;b.textContent=label;bar.append(b);}
    const content=body.querySelector('.browser-content'),status=body.querySelector('.browser-status span'),outside=body.querySelector('[data-browser-external]');
    function sync(){address.value=current;form.querySelector('[data-browser-action=back]').disabled=index===0;form.querySelector('[data-browser-action=forward]').disabled=index===history.length-1;outside.hidden=current==='about:home';if(current!=='about:home')outside.href=current;}
    function home(){
      content.innerHTML='<section class="browser-home"><span class="browser-home-kicker">timBuilds Internet</span><h1>Project websites</h1><p>Browse project websites below or enter an address. Game websites include a Play link that opens the game in a new browser tab.</p><div class="browser-bookmarks"></div><p class="browser-home-note">Some external websites prohibit embedded viewing. Open in real browser is always available.</p></section>';
      const links=[['openHoops','/openhoops/'],['Letters with Lola','/projects/letters-with-lola/'],['Solitaire Clemulie','/projects/solitaire/'],['Studio Siomai','https://studio-siomai.vercel.app/'],['Grit Athletics','https://grit-athletics.pages.dev/'],['GitHub','https://github.com/flushatoilet']];
      for(const [label,url] of links){const b=document.createElement('button');b.textContent=label;b.dataset.bookmark=url;content.querySelector('.browser-bookmarks').append(b);}status.textContent='Project websites';
    }
    function fallback(url){
      content.innerHTML='<section class="browser-message"><div class="browser-message-icon" aria-hidden="true">↗</div><h1>Continue in your browser</h1><p>This website or account page needs its own browser tab. Your desktop stays open here.</p><a data-browser-external class="bevel-button" target="_blank" rel="noopener noreferrer">Open website ↗</a></section>';
      content.querySelector('a').href=url.href;status.textContent='This page is not embedded.';
    }
    function navigate(value,push=true){
      const next=normalize(value);if(!next){status.textContent='Enter a public HTTPS website address.';address.setAttribute('aria-invalid','true');return false;}
      address.removeAttribute('aria-invalid');clearTimeout(timer);frame?.remove();frame=null;content.replaceChildren();current=next;
      if(push&&history[index]!==next){history=history.slice(0,index+1);history.push(next);if(history.length>50)history.shift();index=history.length-1;}sync();
      if(current==='about:home'){home();return true;}
      const url=new URL(current),owned=isOwnedPage(url);
      if(blockedHosts.has(url.hostname)||(url.origin===location.origin&&!owned)){fallback(url);return true;}
      const loadedFrame=document.createElement('iframe');frame=loadedFrame;
      loadedFrame.className='browser-frame';loadedFrame.title='Website: '+url.hostname;loadedFrame.referrerPolicy='no-referrer';
      loadedFrame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads'+(owned?' allow-popups allow-popups-to-escape-sandbox':''));
      status.textContent='Loading '+url.hostname+'…';const requested=current;loadedFrame.src=current;content.append(loadedFrame);
      loadedFrame.addEventListener('load',()=>{
        if(closed||frame!==loadedFrame)return;clearTimeout(timer);
        status.textContent='Website frame loaded. If it is blocked, use Open in real browser.';
        try{
          const doc=loadedFrame.contentDocument;if(!doc)return;
          const actual=loadedFrame.contentWindow.location.href;if(actual==='about:blank')return;
          const route=new URL(actual),id=policy(route);
          if(id){window.TimDocuments.open(id);loadedFrame.src=requested;return;}
          const mapped=normalize(actual);if(mapped!==actual||route.origin===location.origin&&!isOwnedPage(route)){navigate(actual,false);return;}
          current=actual;history[index]=actual;sync();status.textContent=doc.title||url.hostname;
          if(!doc.documentElement.hasAttribute('data-website-bridge'))doc.addEventListener('click',event=>follow(event.target.closest('a[href]'),event),true);
        }catch{ /* The browser's cross-origin boundary is intentionally respected. */ }
      });
      timer=setTimeout(()=>{if(!closed&&frame===loadedFrame)status.textContent='Still waiting. The site may not allow embedding; Open in real browser is available.';},12000);return true;
    }
    form.addEventListener('submit',event=>{event.preventDefault();navigate(address.value);});
    body.addEventListener('click',event=>{
      const bookmark=event.target.closest('[data-bookmark]');if(bookmark)navigate(bookmark.dataset.bookmark);
      const action=event.target.closest('[data-browser-action]')?.dataset.browserAction;
      if(action==='back'&&index>0)navigate(history[--index],false);if(action==='forward'&&index<history.length-1)navigate(history[++index],false);
      if(action==='reload')navigate(current,false);if(action==='home'||event.target.closest('[data-browser-menu=favorites]'))navigate('about:home');
      if(event.target.closest('[data-browser-menu=help]'))status.textContent='Browse project websites here. Play buttons open the actual games in new browser tabs. External sites may require Open in real browser.';
    });
    address.addEventListener('focus',()=>address.select());
    controller={navigate,current:()=>current,owns:source=>frame?.contentWindow===source};home();sync();
    return {cleanup:()=>{closed=true;clearTimeout(timer);frame?.remove();controller=null;}};
  });
  function open(value='about:home'){
    const next=normalize(value);if(!next)return false;
    const dialog=document.querySelector('#detail-dialog');if(dialog?.open)dialog.querySelector('.dialog-close').click();
    A.open('browser');controller?.navigate(next);return true;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link)return;
    let url;try{url=new URL(link.href);}catch{return;}
    if(policy(url)&&!link.hasAttribute('data-document-original'))return;
    follow(link,event);
  },true);
  window.TimBrowser=Object.freeze({open,normalize,follow,owns:source=>controller?.owns(source)||false,current:()=>controller?.current()||'about:home'});
})();
