const MONTH_NAMES = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

function renderSeasonal(month) {
  const tasks = getSeasonalTasks(month);
  const progress = getSeasonalProgress(month);
  const container = document.getElementById('seasonal-tasks');

  if (tasks.length === 0) {
    container.innerHTML = renderEmptyState('📅', 'Nema zadataka', 'Za ovaj mesec nema predefinisanih zadataka.');
    return;
  }

  const done = tasks.filter(t => progress[t.id]).length;
  container.innerHTML = `
    <p class="text-muted mb-sm" style="font-size:var(--font-size-sm)">${done}/${tasks.length} završeno</p>
    ${tasks.map(t => `
      <div class="task-item seasonal-task" data-id="${t.id}">
        <input type="checkbox" class="task-checkbox seasonal-cb" data-id="${t.id}" ${progress[t.id] ? 'checked' : ''}>
        <span>${t.text}</span>
      </div>
    `).join('')}
  `;

  container.querySelectorAll('.seasonal-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleSeasonalTask(month, cb.dataset.id);
      renderSeasonal(month);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Sezonski plan', showBack: true, backHref: 'maintenance.html' });

  const now = new Date();
  const sel = document.getElementById('seasonal-month');
  MONTH_NAMES.forEach((name, i) => {
    sel.innerHTML += `<option value="${i + 1}"${i === now.getMonth() ? ' selected' : ''}>${name}</option>`;
  });

  const render = () => renderSeasonal(parseInt(sel.value, 10));
  sel.addEventListener('change', render);
  render();
});
