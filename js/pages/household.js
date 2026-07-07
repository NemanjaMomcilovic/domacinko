const HOUSEHOLD_SECTIONS = [
  { key: 'familyMembers', label: 'Članovi porodice', icon: '👨‍👩‍👧', placeholder: 'Ime člana' },
  { key: 'cars', label: 'Automobili', icon: '🚗', placeholder: 'Marka i model' },
  { key: 'bills', label: 'Računi', icon: '📄', placeholder: 'Naziv računa' },
  { key: 'pets', label: 'Ljubimci', icon: '🐾', placeholder: 'Ime ljubimca' },
  { key: 'subscriptions', label: 'Pretplate', icon: '📱', placeholder: 'Naziv pretplate' },
  { key: 'appliances', label: 'Aparati', icon: '🔌', placeholder: 'Naziv aparata' },
  { key: 'pantry', label: 'Ostava', icon: '🥫', placeholder: 'Namirnica (npr. jaja, mleko)' },
  { key: 'documents', label: 'Dokumenti', icon: '📋', placeholder: 'Naziv dokumenta' },
  { key: 'warranties', label: 'Garancije', icon: '🛡️', placeholder: 'Naziv garancije' },
  { key: 'importantDates', label: 'Važni datumi', icon: '📅', placeholder: 'Opis datuma' }
];

function renderHousehold() {
  const household = getHousehold();
  const container = document.getElementById('household-sections');

  container.innerHTML = HOUSEHOLD_SECTIONS.map(section => {
    const items = household[section.key] || [];
    return `
      <div class="household-section card card--flat" data-section="${section.key}">
        <div class="household-section__header">
          <h3 class="household-section__title">${section.icon} ${section.label}</h3>
          <span class="badge badge--success">${items.length}</span>
        </div>
        <div class="section-items">
          ${items.length === 0
            ? '<p class="text-muted" style="font-size:var(--font-size-sm)">Nema unosa. Dodajte prvi ispod!</p>'
            : items.map(item => `
              <div class="list-item" style="padding:var(--space-sm) 0">
                <div class="list-item__content">
                  <div class="list-item__title">${item.name}</div>
                  ${item.note ? `<div class="list-item__subtitle">${item.note}</div>` : ''}
                </div>
                <button class="btn btn--ghost btn--sm delete-hh" data-section="${section.key}" data-id="${item.id}">✕</button>
              </div>
            `).join('')}
        </div>
        <form class="add-hh-form mt-sm" data-section="${section.key}">
          <div style="display:flex;gap:var(--space-sm)">
            <input type="text" class="form-input" placeholder="${section.placeholder}" required style="flex:1">
            <button type="submit" class="btn btn--primary btn--sm">+</button>
          </div>
        </form>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.add-hh-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const section = form.dataset.section;
      const input = form.querySelector('input');
      const name = input.value.trim();
      if (!name) return;
      addHouseholdItem(section, { name });
      input.value = '';
      renderHousehold();
      showToast('Dodato!');
    });
  });

  container.querySelectorAll('.delete-hh').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteHouseholdItem(btn.dataset.section, btn.dataset.id);
      renderHousehold();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('', { title: 'Domaćinstvo', showBack: true, backHref: 'home.html' });
  renderHousehold();
});
