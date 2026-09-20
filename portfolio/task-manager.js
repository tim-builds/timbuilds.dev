/* Application list for the virtual desktop. */
(() => {
  'use strict';
  const A = window.TimApps;
  const W = window.TimWindows;
  A.register('taskmanager', 'Task Manager', 'taskmanager', (body) => {
    let selected = null;
    let visible = true;let signature="";
    body.innerHTML = '<div class="taskmanager"><h2>Applications</h2><div class="taskmanager-list" role="listbox" aria-label="Open applications"></div><p class="taskmanager-status" role="status"></p><div class="app-menubar"></div><p class="accessory-note">Only programs in this web desktop are listed. Save unsaved work before ending a task.</p></div>';
    const list = body.querySelector('.taskmanager-list');
    const status = body.querySelector('.taskmanager-status');
    const bar = body.querySelector('.app-menubar');
    for (const [id, label] of [['switch','Switch To'],['end','End Task'],['new','New Task…']]) {
      const button = document.createElement('button');
      button.className = 'bevel-button';
      button.dataset.taskCommand = id;
      button.textContent = label;
      bar.append(button);
    }
    function render() {
      if (!visible) return;
      const windows = W.list().filter(w => w.state !== 'closed');
      if (!windows.some(w => w.id === selected)) selected = null;
      const next=JSON.stringify([windows,W.active(),selected]);if(next===signature)return;signature=next;
      list.replaceChildren();
      for (const w of windows) {
        const button = document.createElement('button');
        button.dataset.taskId = w.id;
        button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', String(w.id === selected));
        const title = document.createElement('span');
        const state = document.createElement('span');
        title.textContent = w.label;
        state.textContent = w.state === 'minimized' ? 'Minimised' : w.id === W.active() ? 'Active' : 'Running';
        button.append(title, state); list.append(button);
      }
      status.textContent = windows.length + ' applications open';
      body.querySelector('[data-task-command=switch]').disabled = !selected;
      body.querySelector('[data-task-command=end]').disabled = !selected;
    }
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-task-id]');
      if (!button) return;
      selected = button.dataset.taskId; render();
      list.querySelector('[data-task-id="' + selected + '"]')?.focus({preventScroll:true});
    });
    bar.addEventListener('click', event => {
      const action = event.target.closest('[data-task-command]')?.dataset.taskCommand;
      if (action === 'switch' && selected) W.show(selected);
      if (action === 'end' && selected) { const id=selected; selected=null; W.close(id); render(); }
      if (action === 'new') A.open('run');
    });
    const timer = setInterval(render, 1200);
    window.addEventListener('timbuilds-active-window', render); render();
    return {cleanup:()=>{clearInterval(timer);window.removeEventListener('timbuilds-active-window',render);},visibility:value=>{visible=value;render();}};
  });
  // Task Manager remains available through Tools and Control Panel, not the tray.
})();
