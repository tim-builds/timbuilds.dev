/* Responsive presentation of the game's existing canvas. */
(() => {
  'use strict';
  const canvas = document.querySelector('#canvas');
  let pending = 0;
  function fit() {
    pending = 0;
    const width = canvas.width;
    const height = canvas.height;
    if (!width || !height || !innerWidth || !innerHeight) return;
    const scale = Math.min(innerWidth / width, innerHeight / height);
    canvas.style.width = (width * scale) + 'px';
    canvas.style.height = (height * scale) + 'px';
  }
  function schedule() {
    if (!pending) pending = requestAnimationFrame(fit);
  }
  const observer = new ResizeObserver(schedule);
  observer.observe(document.documentElement);
  const changes = new MutationObserver(schedule);
  changes.observe(canvas, {attributes: true, attributeFilter: ['width', 'height']});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(pending); observer.disconnect(); changes.disconnect();
  });
  schedule();
})();
