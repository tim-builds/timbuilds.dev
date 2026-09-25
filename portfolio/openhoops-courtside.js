/* Progressive enhancement only. Without JS, both genuine app screens remain visible. */
(() => {
  'use strict';
  const picker = document.querySelector('.screen-picker');
  const stage = document.querySelector('.screen-stage');
  if (!picker || !stage) return;
  const buttons = [...picker.querySelectorAll('button[data-screen]')];
  const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
  if (!buttons.length || panels.some(panel => !panel)) return;

  function select(index) {
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
      panels[i].hidden = !selected;
    });
    // Start the selected image loading even when the stage is below the fold.
    const image = panels[index].querySelector('img');
    if (image) image.loading = 'eager';
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      select(next);
      buttons[next].focus();
    });
  });
  const initial = buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
  stage.classList.add('is-enhanced');
  select(initial < 0 ? 0 : initial);
  picker.hidden = false;
})();
