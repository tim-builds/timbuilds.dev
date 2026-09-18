/* OS-style protected-file warning. Refused operations never delete data. */
(() => {
  'use strict';
  const dialog=document.createElement('dialog');
  dialog.id='desktop-warning';dialog.className='window recycle-warning';
  dialog.setAttribute('role','alertdialog');
  dialog.setAttribute('aria-labelledby','recycle-warning-heading');
  dialog.setAttribute('aria-describedby','recycle-warning-copy');
  dialog.innerHTML='<div class="titlebar"><div class="window-title"><span id="recycle-warning-title">Cannot move folder</span></div><div class="window-controls"><button type="button" class="warning-close" aria-label="Close message">×</button></div></div><div class="warning-body"><span class="warning-symbol" aria-hidden="true">×</span><div><h2 id="recycle-warning-heading">Hey! Nice try.</h2><p id="recycle-warning-copy"></p></div></div><div class="warning-footer"><button type="button" class="bevel-button warning-ok">OK</button></div>';
  document.body.append(dialog);let previous=null;
  function dismiss(){if(dialog.open)dialog.close();}
  function warn(reason='move'){
    previous=document.activeElement;
    dialog.dataset.reason=reason;
    const title=dialog.querySelector('#recycle-warning-title');
    const copy=dialog.querySelector('#recycle-warning-copy');
    title.textContent=reason==='empty'?'Cannot empty Recycle Bin':'Cannot move folder';
    copy.textContent=reason==='empty'?'This desktop keeps its files. Nothing was deleted.':'My Projects belongs on this desktop. The folder has been left where it was.';
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('.warning-ok').focus({preventScroll:true});
  }
  dialog.querySelector('.warning-ok').addEventListener('click',dismiss);
  dialog.querySelector('.warning-close').addEventListener('click',dismiss);
  dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  dialog.addEventListener('close',()=>{
    if(previous?.isConnected&&!previous.closest('[hidden]'))previous.focus({preventScroll:true});
  });
  window.addEventListener('timbuilds-session-reset',dismiss);
  window.TimDesktopActions=Object.freeze({warn,dismiss});
})();
