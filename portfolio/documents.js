/* Read-only document windows use the canonical public policy pages. */
(() => {
  'use strict';
  const A=window.TimApps,W=window.TimWindows;
  const sources={privacy:{name:'OpenHoops Privacy.txt',url:'openhoops/privacy.html'},terms:{name:'OpenHoops Terms.txt',url:'openhoops/terms.html'}};
  function plain(main){
    const block=new Set(['H1','H2','H3','P','UL','OL','LI','TABLE','TR','DIV','SECTION']);
    function walk(node){
      if(node.nodeType===3)return node.textContent.replace(/\s+/g,' ');
      if(node.nodeType!==1)return '';
      if(['SCRIPT','STYLE','NOSCRIPT'].includes(node.tagName))return '';
      let text=[...node.childNodes].map(walk).join('');
      if(node.tagName==='BR')return '\n';
      if(['TH','TD'].includes(node.tagName))return text.trim()+' | ';
      if(node.tagName==='TR')text=text.replace(/\s*\|\s*$/,'');
      if(node.tagName==='LI')text='• '+text.trim();
      return block.has(node.tagName)?'\n'+text.trim()+'\n':text;
    }
    return walk(main).replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  }
  for(const [id,source] of Object.entries(sources))A.register('document-'+id,source.name,'document',(body)=>{
    let aborted=false,text='';const controller=new AbortController();
    body.innerHTML='<div class="document-reader"><div class="app-menubar"><button class="bevel-button" data-doc-save>Save .txt</button><a class="bevel-button" data-document-original href="'+source.url+'" target="_blank" rel="noopener noreferrer">Original page ↗</a></div><p class="document-status" role="status">Opening document…</p><pre class="document-text" tabindex="0" aria-label="'+source.name+'" aria-readonly="true"></pre></div>';
    const status=body.querySelector('.document-status'),area=body.querySelector('pre');
    fetch(new URL(source.url,document.baseURI),{cache:'no-cache',signal:controller.signal})
      .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.text();})
      .then(html=>{if(aborted)return;const parsed=new DOMParser().parseFromString(html,'text/html'),main=parsed.querySelector('main');if(!main)throw new Error('Document content unavailable');text=plain(main);area.textContent=text;status.textContent='Read-only · OpenHoops policy document';area.focus({preventScroll:true});})
      .catch(()=>{if(!aborted){status.textContent='Could not load the document. Use Original page above, or close and reopen to retry.';area.textContent='';}});
    body.querySelector('[data-doc-save]').addEventListener('click',()=>{if(text)A.download(new Blob([text+'\n'],{type:'text/plain;charset=utf-8'}),source.name);});
    return {cleanup:()=>{aborted=true;controller.abort();if(location.hash==='#document-'+id){try{history.replaceState(null,'',location.pathname+location.search);}catch{}}}};
  });
  function open(id,historyUpdate=true){if(!sources[id])return false;A.open('document-'+id);if(historyUpdate&&location.hash!=='#document-'+id){try{history.pushState(null,'','#document-'+id);}catch{}}return true;}
  document.addEventListener('click',e=>{const link=e.target.closest('a');if(!link||link.hasAttribute('data-document-original')||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button>0)return;const path=new URL(link.href).pathname;const id=Object.keys(sources).find(k=>path===new URL(sources[k].url,document.baseURI).pathname);if(id&&new URL(link.href).origin===location.origin){e.preventDefault();open(id);}});
  function sync(){const id=location.hash.startsWith('#document-')?location.hash.slice(10):null;if(sources[id])open(id,false);else for(const k of Object.keys(sources)){const el=document.querySelector('#window-document-'+k);if(el&&!el.hidden)W.close('document-'+k);}}
  window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);sync();
  window.TimDocuments=Object.freeze({open,plain});
})();
