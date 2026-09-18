/* Layout viewport sizing for the browser desktop. */
(() => {
  'use strict';
  const root = document.documentElement;
  const editable = element => element?.matches?.('input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,[contenteditable=true]');
  let width = innerWidth, height = innerHeight;
  let focusHeight = height, focusWidth = width;
  let focused = false, keyboard = false, timer = 0;
  function paint() {
    root.style.setProperty('--desk-height', height + 'px');
    root.style.setProperty('--desk-width', width + 'px');
    root.dataset.keyboard = String(keyboard);
  }
  function measure() {
    const w = innerWidth, h = innerHeight;
    const visual = window.visualViewport;
    const rotated = Math.abs(w - focusWidth) > 80;
    const obscured = (visual && visual.scale < 1.05 && visual.height < focusHeight - 140) || h < focusHeight - 140;
    keyboard = w <= 820 && !rotated && (focused || keyboard || document.activeElement?.tagName === 'IFRAME') && Boolean(obscured);
    if (!keyboard) {
      width = w; height = h;
      if (!focused) { focusHeight = h; focusWidth = w; }
    } else { width = w; height = Math.max(height, focusHeight); }
    paint();
  }
  document.addEventListener('focusin', event => {
    if (!editable(event.target)) return;
    if (!focused && !keyboard) { focusHeight = height; focusWidth = width; }
    focused = true; measure();
  });
  document.addEventListener('focusout', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { focused = editable(document.activeElement); measure(); }, 240);
  });
  window.addEventListener('resize', measure);
  window.visualViewport?.addEventListener('resize', measure);
  window.addEventListener('orientationchange', () => { keyboard = false; focused = false; setTimeout(measure, 250); });
  window.TimViewport = Object.freeze({height: () => height, width: () => width, keyboard: () => keyboard, measure});
  const bar=document.querySelector(".taskbar");if(bar){new ResizeObserver(()=>root.style.setProperty("--taskbar-height",bar.getBoundingClientRect().height+"px")).observe(bar);}
  paint();
})();
