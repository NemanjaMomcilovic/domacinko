function renderSafetyReminders() {
  const reminders = getSafetyReminders();
  const el = document.getElementById('safety-reminders');
  if (reminders.length === 0) {
    el.innerHTML = '<p class="text-muted" style="padding:var(--space-md)">Nema hitnih podsetnika. Popunite datume ispod.</p>';
    return;
  }
  el.innerHTML = reminders.map(r => `
    <div class="reminder-item ${r.expired ? 'reminder-item--danger' : 'reminder-item--warn'}">
      <span class="reminder-item__icon">🚨</span>
      <span>${r.label} — ${r.expired ? 'ISTEKLO!' : `za ${r.days} dana`}</span>
    </div>
  `).join('');
}

function renderMedicines() {
  const meds = getSafety().medicines || [];
  const el = document.getElementById('medicines-list');
  if (meds.length === 0) {
    el.innerHTML = renderEmptyState('💊', 'Nema lekova', 'Dodajte lekove iz apoteke.');
    return;
  }
  const now = new Date();
  el.innerHTML = meds.map(m => {
    const days = m.expiry ? Math.ceil((new Date(m.expiry) - now) / (1000 * 60 * 60 * 24)) : null;
    const badge = days !== null && days <= 30
      ? `<span class="badge badge--${days < 0 ? 'danger' : 'warning'}">${days < 0 ? 'Isteklo' : `${days}d`}</span>`
      : '';
    return `
      <div class="list-item">
        <div class="list-item__icon">💊</div>
        <div class="list-item__content">
          <div class="list-item__title">${m.name} ${badge}</div>
          ${m.expiry ? `<div class="list-item__subtitle">Do: ${formatDate(m.expiry)}</div>` : ''}
        </div>
        <button class="btn btn--ghost btn--sm del-med" data-id="${m.id}">✕</button>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.del-med').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteMedicine(btn.dataset.id);
      renderMedicines();
      renderSafetyReminders();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Bezbednost', showBack: true, backHref: 'household.html' });
  const safety = getSafety();
  document.getElementById('fire-ext').value = safety.fireExtinguisherExpiry || '';
  document.getElementById('co-det').value = safety.coDetectorExpiry || '';
  document.getElementById('first-aid').value = safety.firstAidCheck || '';
  renderSafetyReminders();
  renderMedicines();

  document.getElementById('safety-form').addEventListener('submit', e => {
    e.preventDefault();
    saveSafety({
      fireExtinguisherExpiry: document.getElementById('fire-ext').value,
      coDetectorExpiry: document.getElementById('co-det').value,
      firstAidCheck: document.getElementById('first-aid').value
    });
    renderSafetyReminders();
    showToast('Bezbednost sačuvana!');
  });

  document.getElementById('add-med').addEventListener('click', () => {
    const name = document.getElementById('med-name').value.trim();
    if (!name) return;
    addMedicine({ name, expiry: document.getElementById('med-expiry').value });
    document.getElementById('med-name').value = '';
    document.getElementById('med-expiry').value = '';
    renderMedicines();
    renderSafetyReminders();
    showToast('Lek dodat.');
  });
});
