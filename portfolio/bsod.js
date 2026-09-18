/* A recoverable, page-local Stop screen. Never restarts the real browser or OS. */
(() => {
  'use strict';
  const dialog = document.createElement('dialog');
  dialog.id = 'bsod-dialog';
  dialog.setAttribute('aria-labelledby', 'bsod-title');
  dialog.setAttribute('aria-describedby', 'bsod-description');
  dialog.innerHTML = '<header class="bsod-toolbar"><span class="bsod-brand" aria-hidden="true">Windows</span><button type="button" data-bsod-action="desktop">[Esc] Return to desktop</button></header><div class="bsod-scroll"><section class="bsod-report"><h1 id="bsod-title" tabindex="-1">A problem has been detected.</h1><p id="bsod-description"></p><p class="bsod-stop" id="bsod-stop"></p><p>If this is the first time you have seen this Stop error, return to the desktop. If curiosity persists, attempt recovery below.</p><p>Your windows and files have been preserved. No restart is required.</p><details class="bsod-dump"><summary>Technical information / inspect memory dump</summary><pre id="bsod-dump"></pre><button type="button" data-bsod-action="check">[F5] Retry system check</button><p id="bsod-check" role="status">Recovery driver loaded. Awaiting operator input.</p></details></section><section class="bsod-recovery" aria-label="Recovery challenges"></section><footer class="bsod-footer">System halted. Operator still in control. <button type="button" data-bsod-action="desktop">Return to desktop</button></footer></div>';
  document.body.append(dialog);
  let previous = null, previousWindow = null, checks = 0, mounted = false;
  const messages = ['Checking project integrity... PASSED. Deleting the portfolio is still not a supported feature.', 'Loading curiosity.sys... FAILED SUCCESSFULLY. Please complete another recovery challenge.', 'Memory dump complete. Found: 640 KB of ambition, one stubborn folder, zero deleted files.'];
  function systemCheck() { dialog.querySelector('#bsod-check').textContent = messages[checks++ % messages.length]; }
  function cleanup() {
    if (!mounted) return;
    mounted = false;
    window.TimBreach.destroy();
    dialog.querySelector('.bsod-recovery').replaceChildren();
    document.documentElement.classList.remove('bsod-active');
    if (previous?.isConnected && previous.getClientRects().length) previous.focus({preventScroll:true});
    else if (previousWindow) document.querySelector('[data-window-id="' + previousWindow + '"]:not([hidden])')?.focus({preventScroll:true});
    previous = null; previousWindow = null;
  }
  function close() { if (!dialog.open) return; dialog.close(); cleanup(); }
  function fitViewport(){if(!dialog.open)return;const v=window.visualViewport;dialog.style.height=((v&&v.scale<1.05?v.height:innerHeight))+'px';dialog.style.top=((v&&v.scale<1.05?v.offsetTop:0))+'px';}
  window.visualViewport?.addEventListener('resize',fitViewport);window.visualViewport?.addEventListener('scroll',fitViewport);window.addEventListener('resize',fitViewport);
  function open(reason = 'locked') {
    if (dialog.open) return;
    previous = document.activeElement; previousWindow = window.TimWindows.active(); checks = 0;
    window.TimShell?.closeMenu(); window.TimWindowMenus?.close(); window.TimDragFeedback?.cancel();
    document.querySelector('#start-menu').hidden = true;
    document.querySelector('#start-button').setAttribute('aria-expanded', 'false');
    dialog.dataset.reason = reason;
    const recycle = reason === 'projects';
    dialog.querySelector('#bsod-description').textContent = recycle
      ? 'The desktop has been halted to prevent the deletion of perfectly good projects. My Projects has been returned to its original location.'
      : 'An attempt was made to access a highly suspicious folder. The curiosity protection subsystem has halted the desktop.';
    dialog.querySelector('#bsod-stop').textContent = recycle ? 'PROJECTS_CANNOT_BE_RECYCLED' : 'UNAUTHORIZED_FOLDER_CURIOSITY';
    dialog.querySelector('#bsod-dump').textContent = '*** STOP: 0x000000E7 (0x54494D, 0x00000001)\n*** ' + (recycle ? 'recycle_guard.sys' : 'curiosity.sys') + ' — recovery handler active\n\nBeginning dump of imaginary memory.\nPhysical files affected: 0\nDesktop session: PRESERVED';
    dialog.querySelector('.bsod-dump').open = false;
    dialog.querySelector('#bsod-check').textContent = 'Recovery driver loaded. Awaiting operator input.';
    document.documentElement.classList.add('bsod-active');
    dialog.showModal(); mounted = true; fitViewport();
    window.TimBreach.mount(dialog.querySelector('.bsod-recovery'), {focus:false, onDisconnect:close});
    dialog.querySelector('.bsod-scroll').scrollTop = 0;
    dialog.querySelector('#bsod-title').focus({preventScroll:true});
  }
  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-bsod-action]')?.dataset.bsodAction;
    if (action === 'desktop') close();
    if (action === 'check') systemCheck();
  });
  // Contain shell shortcuts, not text editing or normal focus navigation.
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Tab') {
      const controls=[...dialog.querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex]')].filter(el=>!el.matches(':disabled')&&el.tabIndex>=0&&el.getClientRects().length);
      if(controls.length){event.preventDefault();const i=controls.indexOf(document.activeElement),n=i<0?(event.shiftKey?controls.length-1:0):(i+(event.shiftKey?-1:1)+controls.length)%controls.length;controls[n].focus();}
    } else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'F5') { event.preventDefault(); dialog.querySelector('.bsod-dump').open = true; systemCheck(); }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', () => { if (!dialog.open) cleanup(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) window.TimBreach.visibility(false); });
  window.addEventListener('timbuilds-session-reset', close);
  window.TimBSOD = Object.freeze({open, close, isOpen:() => dialog.open});
})();
