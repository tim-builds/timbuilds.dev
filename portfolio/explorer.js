/* Navigable virtual folders; paths never access the visitor's filesystem. */
(() => {
  'use strict';
  const A=window.TimApps,W=window.TimWindows,navigators=new WeakMap();
  const categories=['All projects','Apps','Games','Websites','Tools','Experiments','Locked'];
  const folders={computer:['projects','accessories','games','documents','browser','settings','recycle'],accessories:['notepad','calculator','paint'],games:['pinball','solitaire','minesweeper','reversi','minigolf'],documents:['document-privacy','document-terms'],settings:['versions','datetime','volume','system','screensaver','taskmanager']};
  const names={computer:'My Computer',accessories:'Accessories',games:'Games',documents:'Documents',settings:'Control Panel'};
  const parents=Object.create(null);
  function pathFor(id){if(parents[id])return pathFor(parents[id]).replace(/\\$/,'')+'\\'+names[id];return id==='computer'?'C:\\':id==='projects'?'C:\\Tim\\Projects\\All projects':id.startsWith('project:')?'C:\\Tim\\Projects\\'+id.slice(8):'C:\\'+(names[id]||id);}
  function resolve(raw){
    if(typeof raw!=='string'||raw.length>260||/[<>"\0]/.test(raw)||/^(?:https?|javascript|file|data):/i.test(raw))return null;
    let path=raw.trim().replace(/\\/g,'/').replace(/^Macintosh HD:/i,'/').replace(/:/g,'/').replace(/^C\//i,'/').replace(/^\/?home\/tim\//i,'/Tim/').replace(/\/+/g,'/').replace(/^\/|\/$/g,'').toLowerCase();
    if(path.split('/').some(p=>p==='..'))return null;
    if(['','computer','my computer','macintosh hd'].includes(path))return 'computer';
    if(['projects','tim/projects','tim/projects/all projects'].includes(path))return 'projects';
    if(path.startsWith('tim/projects/')){const c=categories.find(c=>c.toLowerCase()===path.slice(13));return c?'project:'+c:null;}
    const folder=Object.keys(names).find(k=>[k,names[k].toLowerCase(),pathFor(k).slice(3).replace(/\\/g,'/').toLowerCase(),'windows/'+k,'applications/'+k].includes(path));if(folder)return folder;
    if(['privacy','openhoops privacy.txt','documents/openhoops privacy.txt','openhoops/privacy.html'].includes(path))return 'document-privacy';
    if(['terms','openhoops terms.txt','documents/openhoops terms.txt','openhoops/terms.html'].includes(path))return 'document-terms';
    const base=path.split('/').at(-1).replace(/\.exe$/,'');return A.list().some(a=>a.id===base)?base:null;
  }
  function route(id){if(id==='projects')window.TimCatalogue.browse('All projects');else if(id.startsWith('project:'))window.TimCatalogue.browse(id.slice(8));else if(id==='document-privacy')window.TimDocuments.open('privacy');else if(id==='document-terms')window.TimDocuments.open('terms');else A.open(id);}
  function toolbar(){return '<form class="explorer-navigation"><button type="button" data-nav="back" aria-label="Back" title="Back">←</button><button type="button" data-nav="forward" aria-label="Forward" title="Forward">→</button><button type="button" data-nav="up" aria-label="Up one folder" title="Up">↑</button><label>Address<input class="explorer-path" spellcheck="false" autocomplete="off" aria-label="Folder address" maxlength="260"></label><button type="submit" aria-label="Go to address">↵</button></form><p class="explorer-error" role="status" hidden></p>';}
  function attach(form,initial,onNavigate){
    const state={stack:[initial],index:0,now:initial};const input=form.querySelector('input'),error=form.nextElementSibling;
    function paint(){input.value=pathFor(state.now);form.querySelector('[data-nav=back]').disabled=state.index===0;form.querySelector('[data-nav=forward]').disabled=state.index===state.stack.length-1;}
    function go(id,push=true){if(onNavigate(id)===false){paint();return;}state.now=id;if(push&&state.stack[state.index]!==id){state.stack=state.stack.slice(0,state.index+1);state.stack.push(id);state.index++;}error.hidden=true;paint();}
    form.addEventListener('submit',e=>{e.preventDefault();const id=resolve(input.value);if(!id){error.textContent='Folder not found. Try C:\\Tim\\Projects, C:\\Games or C:\\Documents.';error.hidden=false;input.setAttribute('aria-invalid','true');return;}input.removeAttribute('aria-invalid');go(id);});
    form.addEventListener('click',e=>{const direction=e.target.closest('[data-nav]')?.dataset.nav;if(direction==='up')go(state.now.startsWith('project:')?'projects':parents[state.now]||'computer');if(direction==='back'&&state.index>0)go(state.stack[--state.index],false);if(direction==='forward'&&state.index<state.stack.length-1)go(state.stack[++state.index],false);});
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();paint();error.hidden=true;input.removeAttribute('aria-invalid');}});input.addEventListener('focus',()=>input.select());paint();const api={go,paint,state};navigators.set(form,api);return api;
  }
  function registerBrowser(id,label){A.register(id,label,id==='computer'?'computer':'folder',(body)=>{
    let browser;body.innerHTML=toolbar()+'<div class="program-grid"></div>';const grid=body.querySelector('.program-grid');
    function render(next){if(!folders[next]){route(next);return false;}grid.replaceChildren();const list=A.list();for(const key of folders[next]){const app=list.find(a=>a.id===key);const title=key==='projects'?'My Projects':app?.label||names[key]||key;const b=document.createElement('button');b.className='program-icon';b.dataset.entry=key;b.innerHTML='<svg aria-hidden="true"><use href="portfolio/icons.svg?v=12#'+(app?.icon||'folder')+'"/></svg>';const text=document.createElement('span');text.textContent=title;b.append(text);grid.append(b);}}
    browser=attach(body.querySelector('form'),id,render);render(id);grid.addEventListener('click',e=>{const item=e.target.closest('[data-entry]');if(!item)return;const next=item.dataset.entry;if(folders[next])browser.go(next);else route(next);});
    const refresh=()=>render(browser.state.now);window.addEventListener('timbuilds-explorer-folders',refresh);
    return {cleanup:()=>window.removeEventListener('timbuilds-explorer-folders',refresh)};
  });}
  for(const [id,label] of Object.entries(names))registerBrowser(id,label);
  const old=document.querySelector('#portfolio-window .addressbar');old.innerHTML=toolbar();const form=old.querySelector('form');form.querySelector('input').id='address-text';
  let internal=false;const main=attach(form,'projects',id=>{internal=true;route(id);internal=false;return id==='projects'||id.startsWith('project:');});
  window.addEventListener('timbuilds-folder',e=>{if(internal)return;const id=e.detail==='All projects'?'projects':'project:'+e.detail;main.state.now=id;if(main.state.stack[main.state.index]!==id){main.state.stack=main.state.stack.slice(0,main.state.index+1);main.state.stack.push(id);main.state.index++;}main.paint();});
  window.addEventListener('timbuilds-session-reset',()=>{main.state.stack=['projects'];main.state.index=0;main.state.now='projects';main.paint();});
  document.addEventListener('keydown',e=>{if((e.altKey&&e.key.toLowerCase()==='d')||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='l'&&e.target.closest('[data-window-id]'))){const win=e.target.closest('[data-window-id]'),address=win?.querySelector('.explorer-path');if(address){e.preventDefault();address.focus();address.select();}}});
  // Only in-memory registrations. Private launchers supply their entries after authentication.
  function registerFolder({id,label,parent,entries}){
    if(typeof id!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(id)||Object.hasOwn(names,id)||A.list().some(a=>a.id===id))return false;
    if(typeof label!=='string'||!label.trim()||label.length>80||/[\\/<>"\0]/.test(label)||['.','..'].includes(label)||!Object.hasOwn(folders,parent))return false;
    if(Object.keys(names).some(k=>names[k].toLowerCase()===label.toLowerCase()))return false;
    if(!Array.isArray(entries)||entries.length>100||entries.some(key=>typeof key!=='string'||!A.list().some(a=>a.id===key)))return false;
    names[id]=label;parents[id]=parent;folders[id]=[...new Set(entries)];folders[parent].push(id);registerBrowser(id,label);
    window.dispatchEvent(new Event('timbuilds-explorer-folders'));return true;
  }
  window.TimExplorer=Object.freeze({resolve,route,pathFor,registerFolder,refresh:win=>{const api=navigators.get(win.querySelector(".explorer-navigation"));if(api)api.go(api.state.now,false);}});
})();
