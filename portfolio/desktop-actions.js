/* Playful refusal: no virtual or device files are deleted. */
(() => {
  'use strict';
  function naughty(){
    window.TimWindows.openPanel({id:'naughty',title:'Recycle Bin',label:'Recycle Bin message',icon:'recycle',html:'<div class="accessory-pad naughty-message"><p role="alert">you\'re naughty</p><button class="bevel-button" data-action="close-dialog">OK</button></div>'});
    document.querySelector('#window-naughty button[data-action="close-dialog"]')?.focus({preventScroll:true});
  }
  window.addEventListener('timbuilds-naughty',naughty);
  document.addEventListener('click',e=>{if(!e.target.closest('#window-recycle [data-empty]'))return;e.preventDefault();e.stopImmediatePropagation();naughty();},true);
  window.TimDesktopActions=Object.freeze({naughty});
})();
