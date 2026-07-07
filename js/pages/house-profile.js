function renderAppliances() {
  const profile = getHouseProfile();
  const container = document.getElementById('appliances-list');
  const items = profile.appliances || [];
  if (items.length === 0) {
    container.innerHTML = renderEmptyState('🔌', 'Nema aparata', 'Dodajte frižider, veš mašinu, bojler...');
    return;
  }
  container.innerHTML = items.map(a => `
    <div class="list-item">
      <div class="list-item__icon">🔌</div>
      <div class="list-item__content">
        <div class="list-item__title">${a.name}</div>
        <div class="list-item__subtitle">${a.type || 'Aparat'}${a.purchaseDate ? ` · ${formatDate(a.purchaseDate)}` : ''}</div>
      </div>
      <button class="btn btn--ghost btn--sm del-app" data-id="${a.id}">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-app').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteHouseAppliance(btn.dataset.id);
      renderAppliances();
      showToast('Aparat uklonjen.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Profil kuće', showBack: true, backHref: 'household.html' });
  const profile = getHouseProfile();
  document.getElementById('sq-meters').value = profile.squareMeters || '';
  document.getElementById('home-type').value = profile.homeType || 'apartment';
  document.getElementById('heating-type').value = profile.heatingType || 'gas';
  renderAppliances();

  document.getElementById('profile-form').addEventListener('submit', e => {
    e.preventDefault();
    saveHouseProfile({
      squareMeters: parseFloat(document.getElementById('sq-meters').value) || 0,
      homeType: document.getElementById('home-type').value,
      heatingType: document.getElementById('heating-type').value
    });
    showToast('Profil kuće sačuvan!');
  });

  document.getElementById('add-appliance').addEventListener('click', () => {
    const name = document.getElementById('appliance-name').value.trim();
    if (!name) { showToast('Unesite naziv aparata.'); return; }
    addHouseAppliance({
      name,
      type: document.getElementById('appliance-type').value.trim(),
      purchaseDate: document.getElementById('appliance-date').value
    });
    document.getElementById('appliance-name').value = '';
    document.getElementById('appliance-type').value = '';
    document.getElementById('appliance-date').value = '';
    renderAppliances();
    showToast('Aparat dodat!');
  });
});
