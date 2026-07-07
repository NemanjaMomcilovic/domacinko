const HOUSEHOLD_SECTIONS = [
  {
    key: 'familyMembers',
    label: 'Članovi porodice',
    icon: '👨‍👩‍👧',
    fields: [
      { id: 'name', placeholder: 'Ime člana', type: 'text', required: true },
      { id: 'type', type: 'select', options: ['Odrasla osoba', 'Dete', 'Penzioner', 'Drugo'], default: 'Odrasla osoba' },
      { id: 'birthday', placeholder: 'Rođendan', type: 'date' }
    ]
  },
  {
    key: 'cars',
    label: 'Automobili',
    icon: '🚗',
    fields: [
      { id: 'name', placeholder: 'Marka i model', type: 'text', required: true },
      { id: 'registrationDate', placeholder: 'Datum registracije', type: 'date' }
    ]
  },
  {
    key: 'bills',
    label: 'Računi',
    icon: '📄',
    fields: [
      { id: 'name', placeholder: 'Naziv računa', type: 'text', required: true },
      { id: 'amount', placeholder: 'Mesečni iznos', type: 'number', min: 0 },
      { id: 'paymentDay', placeholder: 'Dan plaćanja', type: 'number', min: 1, max: 31 }
    ]
  },
  {
    key: 'pets',
    label: 'Ljubimci',
    icon: '🐾',
    fields: [
      { id: 'name', placeholder: 'Ime ljubimca', type: 'text', required: true },
      { id: 'type', type: 'select', options: ['Pas', 'Mačka', 'Ptica', 'Drugo'], default: 'Pas' }
    ]
  },
  {
    key: 'subscriptions',
    label: 'Pretplate',
    icon: '📱',
    fields: [
      { id: 'name', placeholder: 'Naziv pretplate', type: 'text', required: true },
      { id: 'amount', placeholder: 'Mesečni iznos', type: 'number', min: 0 }
    ]
  },
  { key: 'appliances', label: 'Aparati', icon: '🔌', fields: [{ id: 'name', placeholder: 'Naziv aparata', type: 'text', required: true }] },
  { key: 'pantry', label: 'Ostava', icon: '🥫', fields: [{ id: 'name', placeholder: 'Namirnica (npr. jaja, mleko)', type: 'text', required: true }] },
  { key: 'documents', label: 'Dokumenti', icon: '📋', fields: [{ id: 'name', placeholder: 'Naziv dokumenta', type: 'text', required: true }] },
  { key: 'warranties', label: 'Garancije', icon: '🛡️', fields: [{ id: 'name', placeholder: 'Naziv garancije', type: 'text', required: true }] },
  { key: 'importantDates', label: 'Važni datumi', icon: '📅', fields: [
    { id: 'name', placeholder: 'Opis datuma', type: 'text', required: true },
    { id: 'date', placeholder: 'Datum', type: 'date' },
    { id: 'amount', placeholder: 'Procenjeni iznos', type: 'number', min: 0 }
  ]}
];

function formatHouseholdSubtitle(item, sectionKey) {
  const parts = [];
  if (sectionKey === 'familyMembers') {
    if (item.type) parts.push(item.type);
    if (item.birthday) parts.push(`Rođendan: ${formatDate(item.birthday)}`);
  }
  if (sectionKey === 'cars' && item.registrationDate) {
    parts.push(`Registracija: ${formatDate(item.registrationDate)}`);
  }
  if (sectionKey === 'bills') {
    if (item.amount) parts.push(formatCurrency(parseFloat(item.amount)));
    if (item.paymentDay) parts.push(`${item.paymentDay}. u mesecu`);
  }
  if (sectionKey === 'pets' && item.type) parts.push(item.type);
  if (sectionKey === 'subscriptions' && item.amount) {
    parts.push(`${formatCurrency(parseFloat(item.amount))} mesečno`);
  }
  if (sectionKey === 'importantDates' && item.date) {
    parts.push(formatDate(item.date));
    if (item.amount) parts.push(formatCurrency(parseFloat(item.amount)));
  }
  if (item.note && parts.length === 0) parts.push(item.note);
  return parts.join(' · ');
}

function renderFieldInput(field) {
  if (field.type === 'select') {
    const options = (field.options || []).map(opt =>
      `<option value="${opt}"${opt === field.default ? ' selected' : ''}>${opt}</option>`
    ).join('');
    return `<select class="form-select hh-field" data-field="${field.id}"${field.required ? ' required' : ''}>${options}</select>`;
  }
  const attrs = [
    `class="form-input hh-field"`,
    `data-field="${field.id}"`,
    `placeholder="${field.placeholder || ''}"`,
    `type="${field.type || 'text'}"`
  ];
  if (field.required) attrs.push('required');
  if (field.min !== undefined) attrs.push(`min="${field.min}"`);
  if (field.max !== undefined) attrs.push(`max="${field.max}"`);
  return `<input ${attrs.join(' ')}>`;
}

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
            : items.map(item => {
              const subtitle = formatHouseholdSubtitle(item, section.key);
              return `
              <div class="list-item" style="padding:var(--space-sm) 0">
                <div class="list-item__content">
                  <div class="list-item__title">${item.name}</div>
                  ${subtitle ? `<div class="list-item__subtitle">${subtitle}</div>` : ''}
                </div>
                <button class="btn btn--ghost btn--sm delete-hh" data-section="${section.key}" data-id="${item.id}">✕</button>
              </div>
            `;
            }).join('')}
        </div>
        <form class="add-hh-form mt-sm" data-section="${section.key}">
          <div class="hh-form-fields">
            ${section.fields.map(f => renderFieldInput(f)).join('')}
          </div>
          <button type="submit" class="btn btn--primary btn--sm btn--block mt-sm">Dodaj</button>
        </form>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.add-hh-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const section = form.dataset.section;
      const item = { name: '' };
      form.querySelectorAll('.hh-field').forEach(input => {
        const key = input.dataset.field;
        let val = input.value.trim();
        if (input.type === 'number' && val) val = parseFloat(val);
        if (key === 'name') item.name = val;
        else if (val) item[key] = val;
      });
      if (!item.name) return;
      addHouseholdItem(section, item);
      form.reset();
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
