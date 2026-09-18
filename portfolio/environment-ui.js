/* Version switching never reloads the page or resets an application's content. */
(() => {
  'use strict';
  const V=window.TimVersion,A=window.TimApps;
  A.register('versions','Operating System','computer',body=>{
    body.innerHTML=`<div class="accessory-pad environment-properties"><div class="classic-tabs"><span class="selected">Appearance</span></div><h2>Choose your desktop</h2><p>One portfolio. Eight familiar desktops.</p>${V.selector()}<section class="environment-current"><strong data-os-name></strong><span data-os-edition></span><p data-os-description></p></section><div class="detail-actions"><button class="bevel-button" data-dialog="display">Change wallpaper…</button><button class="bevel-button" data-action="close-dialog">OK</button></div><p class="accessory-note" id="version-storage-status"></p><p class="accessory-note">Switching keeps your windows, notes, games and owner access in place. This changes the website’s appearance, not your computer’s operating system.</p></div>`;
    V.sync();
  });
  function sync(){
    V.sync();
    const mode=V.current();
    const startText=document.querySelector('#start-button strong');if(startText)startText.textContent=mode==='xp'?'start':mode==='system7'||mode==='mac9'?'Mac':mode==='ubuntu'?'Applications':mode==='kde'?'K Menu':'Start';
    const saver=document.querySelector('.power-message');if(saver)saver.dataset.environment=mode;
    const status=document.querySelector('#environment-status');if(status)status.textContent=V.info().name+' desktop selected.';
    // Theme-specific taskbar height can change the usable desktop bounds.
    window.dispatchEvent(new Event('resize'));
  }
  const badge=document.createElement('button');badge.id='environment-button';badge.className='environment-button';badge.dataset.appOpen='versions';badge.setAttribute('aria-label','Change operating system');badge.innerHTML='<span data-os-year></span><span class="era-chevron" aria-hidden="true">▾</span>';badge.classList.add('environment-year');
  document.querySelector('.clock-tray').after(badge);
  const status=document.createElement('span');status.id='environment-status';status.className='sr-only';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(status);
  window.addEventListener('timbuilds-version',sync);
  sync();
})();
