const GARDEN_TIPS = [
  'Zalivajte ujutru ili uveče — manje isparavanja.',
  'U letnjim mesecima proverite vlažnost zemlje svakog dana.',
  'Đubrite biljke u sezoni rasta (proleće–leto).',
  'Orezujte suve grane — biljka će biti zdravija.',
  'Kišni dan? Preskočite zalivanje i proverite drenazu.'
];

function renderGarden() {
  const garden = getGarden();
  const reminders = getGardenReminders();
  const remEl = document.getElementById('garden-reminders');

  if (reminders.length === 0) {
    remEl.innerHTML = '<p class="text-muted" style="padding:var(--space-md)">Sve biljke su na vreme zalivene! 🌿</p>';
  } else {
    remEl.innerHTML = reminders.map(r => `
      <div class="reminder-item ${r.overdue ? 'reminder-item--danger' : ''}">
        <span class="reminder-item__icon">💧</span>
        <span><strong>${r.plant}</strong> — vreme za ${r.action}</span>
      </div>
    `).join('');
  }

  const plants = garden.plants || [];
  const listEl = document.getElementById('plants-list');
  if (plants.length === 0) {
    listEl.innerHTML = renderEmptyState('🌿', 'Nema biljaka', 'Dodajte biljke iz bašte ili terase.');
    return;
  }

  listEl.innerHTML = plants.map(p => `
    <div class="list-item">
      <div class="list-item__icon">🌿</div>
      <div class="list-item__content">
        <div class="list-item__title">${p.name}</div>
        <div class="list-item__subtitle">Zalivanje na ${p.wateringDays} dana${p.lastWatered ? ` · Poslednje: ${formatDate(p.lastWatered)}` : ''}</div>
      </div>
      <button class="btn btn--secondary btn--sm water-plant" data-id="${p.id}">💧</button>
      <button class="btn btn--ghost btn--sm del-plant" data-id="${p.id}">✕</button>
    </div>
  `).join('');

  listEl.querySelectorAll('.water-plant').forEach(btn => {
    btn.addEventListener('click', () => {
      updatePlant(btn.dataset.id, { lastWatered: new Date().toISOString().split('T')[0] });
      renderGarden();
      showToast('Zalivanje zabeleženo!');
    });
  });
  listEl.querySelectorAll('.del-plant').forEach(btn => {
    btn.addEventListener('click', () => {
      deletePlant(btn.dataset.id);
      renderGarden();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Bašta', showBack: true, backHref: 'home.html' });

  const tipIndex = new Date().getDate() % GARDEN_TIPS.length;
  document.getElementById('garden-weather-text').textContent = GARDEN_TIPS[tipIndex];
  renderGarden();

  document.getElementById('add-plant').addEventListener('click', () => {
    const name = document.getElementById('plant-name').value.trim();
    if (!name) { showToast('Unesite naziv biljke.'); return; }
    addPlant({
      name,
      wateringDays: document.getElementById('plant-water-days').value
    });
    document.getElementById('plant-name').value = '';
    renderGarden();
    showToast('Biljka dodata!');
  });
});
