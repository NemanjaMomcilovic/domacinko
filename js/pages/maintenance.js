function formatDueLabel(task) {
  if (task.overdue) {
    const days = Math.abs(task.daysUntil);
    return days === 0 ? 'Danas!' : `Kasni ${days} dana`;
  }
  if (task.daysUntil === 0) return 'Danas';
  if (task.daysUntil === 1) return 'Sutra';
  return `Za ${task.daysUntil} dana`;
}

function renderMaintenanceList() {
  const container = document.getElementById('maintenance-list');
  if (!container) return;

  const tasks = getAllMaintenanceTasks();
  if (tasks.length === 0) {
    container.innerHTML = `
      ${renderEmptyState('🏠', 'Nema zadataka', 'Dodajte zadatak ispod ili učitajte uobičajene servise.')}
      <button type="button" class="btn btn--secondary btn--block mt-md" id="seed-maintenance-btn">
        Dodaj uobičajene zadatke (bojler, klima…)
      </button>
    `;
    document.getElementById('seed-maintenance-btn')?.addEventListener('click', () => {
      if (typeof seedPredefinedMaintenance === 'function' && seedPredefinedMaintenance()) {
        showToast('Zadaci dodati — označite „Poslednji put" za svaki servis.');
        renderMaintenanceList();
      }
    });
    return;
  }

  container.innerHTML = tasks.map(task => {
    const nextDue = getNextDueDate(task);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDue.setHours(0, 0, 0, 0);
    const overdue = nextDue <= today;
    const daysUntil = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
    const dueLabel = overdue
      ? (daysUntil === 0 ? 'Danas!' : `Kasni ${Math.abs(daysUntil)} dana`)
      : (daysUntil === 0 ? 'Danas' : `Za ${daysUntil} dana`);

    return `
      <div class="maintenance-item card card--flat ${overdue ? 'maintenance-item--overdue' : ''}" data-id="${task.id}">
        <div class="maintenance-item__header">
          <span class="maintenance-item__icon">${task.icon || '📋'}</span>
          <div class="maintenance-item__info">
            <div class="maintenance-item__name">${task.name}</div>
            <div class="maintenance-item__meta">
              Svakih ${task.intervalMonths} mes. · ${dueLabel}
              ${task.lastDone ? ` · Poslednji: ${formatDate(task.lastDone)}` : ''}
            </div>
          </div>
          <button type="button" class="toggle${task.enabled ? ' toggle--on' : ''}" data-toggle="${task.id}" aria-label="Uključi"></button>
        </div>
        <div class="maintenance-item__actions">
          <button type="button" class="btn btn--primary btn--sm mark-done" data-id="${task.id}">✓ Urađeno</button>
          ${task.custom ? `<button type="button" class="btn btn--ghost btn--sm delete-maint" data-id="${task.id}">Obriši</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.toggle;
      const task = getAllMaintenanceTasks().find(t => t.id === id);
      if (task) {
        updateMaintenanceTask(id, { enabled: !task.enabled });
        renderMaintenanceList();
      }
    });
  });

  container.querySelectorAll('.mark-done').forEach(btn => {
    btn.addEventListener('click', () => {
      markMaintenanceDone(btn.dataset.id);
      renderMaintenanceList();
      showToast('Zadatak označen kao urađen!');
    });
  });

  container.querySelectorAll('.delete-maint').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Obrisati zadatak?')) {
        deleteMaintenanceTask(btn.dataset.id);
        renderMaintenanceList();
        showToast('Zadatak obrisan.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('maintenance-list')) return;

  initNavigation('settings', { title: 'Održavanje', showBack: true, backHref: 'home.html' });
  ensureMaintenanceInitialized();
  renderMaintenanceList();

  document.getElementById('add-maintenance')?.addEventListener('click', () => {
    const name = document.getElementById('maint-name').value.trim();
    const interval = document.getElementById('maint-interval').value;
    const lastDone = document.getElementById('maint-last-done').value || null;

    if (!name) {
      showToast('Unesite naziv zadatka.');
      return;
    }

    addMaintenanceTask({ name, intervalMonths: interval, lastDone });
    document.getElementById('maint-name').value = '';
    document.getElementById('maint-interval').value = '6';
    document.getElementById('maint-last-done').value = '';
    renderMaintenanceList();
    showToast('Zadatak dodat!');
  });
});
