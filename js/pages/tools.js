function renderTools() {
  const tools = getTools();
  const container = document.getElementById('tools-list');
  if (tools.length === 0) {
    container.innerHTML = renderEmptyState('🔧', 'Nema alata', 'Dodajte šrafciger, čekić, bušilicu...');
    return;
  }
  container.innerHTML = tools.map(t => `
    <div class="list-item">
      <div class="list-item__icon">🔧</div>
      <div class="list-item__content">
        <div class="list-item__title">${t.name}</div>
        <div class="list-item__subtitle">${t.category} · ${t.condition}</div>
      </div>
      <button class="btn btn--ghost btn--sm del-tool" data-id="${t.id}">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteTool(btn.dataset.id);
      renderTools();
      showToast('Alat uklonjen.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Inventar alata', showBack: true, backHref: 'household.html' });

  const catSel = document.getElementById('tool-category');
  catSel.innerHTML = TOOL_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  renderTools();

  document.getElementById('add-tool').addEventListener('click', () => {
    const name = document.getElementById('tool-name').value.trim();
    if (!name) { showToast('Unesite naziv alata.'); return; }
    addTool({ name, category: catSel.value });
    document.getElementById('tool-name').value = '';
    renderTools();
    showToast('Alat dodat!');
  });

  document.getElementById('run-check').addEventListener('click', () => {
    const input = document.getElementById('check-tools').value.trim();
    if (!input) return;
    const required = input.split(',').map(s => s.trim()).filter(Boolean);
    const result = checkToolsAvailability(required);
    const el = document.getElementById('check-result');
    if (result.canDoIt) {
      el.innerHTML = `<p class="health-feedback__item health-feedback__item--good">✔ Možeš sa onim što imaš!</p>`;
    } else {
      el.innerHTML = `
        <p class="health-feedback__item health-feedback__item--warn">⚠ Nedostaje ti: ${result.missing.join(', ')}</p>
        ${result.available.length ? `<p class="health-feedback__item health-feedback__item--good">✔ Imaš: ${result.available.join(', ')}</p>` : ''}
      `;
    }
  });
});
