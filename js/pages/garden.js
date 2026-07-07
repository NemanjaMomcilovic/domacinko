const GARDEN_TIPS = [
  'Zalivajte ujutru ili uveče — manje isparavanja.',
  'U letnjim mesecima proverite vlažnost zemlje svakog dana.',
  'Đubrite biljke u sezoni rasta (proleće–leto).',
  'Orezujte suve grane — biljka će biti zdravija.',
  'Kišni dan? Preskočite zalivanje i proverite drenažu.'
];

const WATERING_SCHEDULE = [
  { days: 1, label: 'Svaki dan', icon: '💧', desc: 'Tropske biljke, sadnice' },
  { days: 2, label: 'Na 2 dana', icon: '🌱', desc: 'Većina cveća na terasi' },
  { days: 3, label: 'Na 3 dana', icon: '🌿', desc: 'Biljke u senci' },
  { days: 7, label: 'Nedeljno', icon: '🌵', desc: 'Sukulenti, kaktusi' }
];

function renderWateringSchedule() {
  const container = document.getElementById('watering-schedule');
  if (!container) return;
  const garden = getGarden();
  const plants = garden.plants || [];

  container.innerHTML = WATERING_SCHEDULE.map(s => {
    const count = plants.filter(p => parseInt(p.wateringDays, 10) === s.days).length;
    return `
      <div class="reminder-item">
        <span class="reminder-item__icon">${s.icon}</span>
        <span><strong>${s.label}</strong> — ${s.desc}${count > 0 ? ` (${count} biljka)` : ''}</span>
      </div>
    `;
  }).join('');
}

function renderGarden() {
  const garden = getGarden();
  const reminders = getGardenReminders();
  const remEl = document.getElementById('garden-reminders');

  if (reminders.length === 0) {
    remEl.innerHTML = '<p class="text-muted" style="padding:var(--space-md)">Sve biljke su na vreme zalivene! 🌿</p>';
  } else {
    remEl.innerHTML = `
      <p class="text-muted mb-sm" style="font-size:var(--font-size-xs);padding:0 var(--space-md)">${reminders.length} biljka čeka zalivanje</p>
      ${reminders.map(r => `
        <div class="reminder-item ${r.overdue ? 'reminder-item--danger' : ''}">
          <span class="reminder-item__icon">💧</span>
          <span><strong>${r.plant}</strong> — ${r.overdue ? 'KASNI!' : `vreme za ${r.action}`}</span>
        </div>
      `).join('')}
    `;
  }

  const plants = garden.plants || [];
  const listEl = document.getElementById('plants-list');
  if (plants.length === 0) {
    listEl.innerHTML = renderEmptyState('🌿', 'Nema biljaka', 'Dodajte biljke iz bašte ili terase.');
    return;
  }

  listEl.innerHTML = plants.map(p => {
    const daysSince = p.lastWatered
      ? Math.floor((new Date() - new Date(p.lastWatered)) / (1000 * 60 * 60 * 24))
      : null;
    const dueIn = daysSince !== null ? parseInt(p.wateringDays, 10) - daysSince : null;
    const statusBadge = dueIn !== null && dueIn <= 0
      ? '<span class="badge badge--danger">Zaliti!</span>'
      : dueIn !== null && dueIn <= 1
        ? '<span class="badge badge--warning">Uskoro</span>'
        : '';
    return `
      <div class="list-item">
        <div class="list-item__icon">🌿</div>
        <div class="list-item__content">
          <div class="list-item__title">${p.name} ${statusBadge}</div>
          <div class="list-item__subtitle">Na ${p.wateringDays} dana${p.lastWatered ? ` · Poslednje: ${formatDate(p.lastWatered)}` : ' · Još nije zalivano'}</div>
        </div>
        <button class="btn btn--secondary btn--sm water-plant" data-id="${p.id}" aria-label="Zalij ${p.name}">💧</button>
        <button class="btn btn--ghost btn--sm del-plant" data-id="${p.id}" aria-label="Obriši">✕</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.water-plant').forEach(btn => {
    btn.addEventListener('click', () => {
      updatePlant(btn.dataset.id, { lastWatered: new Date().toISOString().split('T')[0] });
      renderGarden();
      renderWateringSchedule();
      showToast('Zalivanje zabeleženo!', 'success');
    });
  });
  listEl.querySelectorAll('.del-plant').forEach(btn => {
    btn.addEventListener('click', () => {
      deletePlant(btn.dataset.id);
      renderGarden();
      renderWateringSchedule();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Bašta', showBack: true, backHref: 'home.html' });

  const tipIndex = new Date().getDate() % GARDEN_TIPS.length;
  document.getElementById('garden-weather-text').textContent = GARDEN_TIPS[tipIndex];
  renderWateringSchedule();
  renderGarden();

  const waterSelect = document.getElementById('plant-water-days');
  if (waterSelect) {
    waterSelect.innerHTML = WATERING_SCHEDULE.map(s =>
      `<option value="${s.days}">${s.icon} ${s.label}</option>`
    ).join('');
  }

  document.getElementById('add-plant').addEventListener('click', () => {
    const name = document.getElementById('plant-name').value.trim();
    if (!name) {
      showToast(getErrorMessage('required'), 'warning');
      return;
    }
    addPlant({
      name,
      wateringDays: document.getElementById('plant-water-days').value
    });
    document.getElementById('plant-name').value = '';
    renderGarden();
    renderWateringSchedule();
    showToast('Biljka dodata!', 'success');
  });
});
