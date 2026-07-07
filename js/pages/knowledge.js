const KB_CATEGORIES = { vodovod: 'Vodovod', elektrika: 'Elektrika', grejanje: 'Grejanje', aparati: 'Aparati', ostalo: 'Ostalo' };

function renderKnowledge(query) {
  const items = query ? searchKnowledge(query) : getKnowledgeBase();
  const container = document.getElementById('knowledge-list');
  if (items.length === 0) {
    container.innerHTML = renderEmptyState('📚', 'Baza je prazna', 'Sačuvajte rešenja iz AI Majstora ili dodajte ručno.');
    return;
  }
  container.innerHTML = items.map(k => `
    <div class="list-item knowledge-item">
      <div class="list-item__icon">📚</div>
      <div class="list-item__content">
        <div class="list-item__title">${k.title}</div>
        <div class="list-item__subtitle">${KB_CATEGORIES[k.category] || k.category} · ${formatDate(k.date.split('T')[0])}</div>
        <p class="knowledge-item__solution">${k.solution}</p>
      </div>
      <button class="btn btn--ghost btn--sm del-kb" data-id="${k.id}">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-kb').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Obrisati rešenje?')) {
        deleteKnowledgeEntry(btn.dataset.id);
        renderKnowledge(document.getElementById('knowledge-search').value);
        showToast('Obrisano.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'Baza znanja', showBack: true, backHref: 'ai.html' });

  const prefill = sessionStorage.getItem('knowledge_prefill');
  if (prefill) {
    try {
      const data = JSON.parse(prefill);
      document.getElementById('kb-title').value = data.title || '';
      document.getElementById('kb-solution').value = data.solution || '';
      sessionStorage.removeItem('knowledge_prefill');
    } catch { /* ignore */ }
  }

  renderKnowledge();
  document.getElementById('knowledge-search').addEventListener('input', e => renderKnowledge(e.target.value));

  document.getElementById('save-knowledge').addEventListener('click', () => {
    const title = document.getElementById('kb-title').value.trim();
    const solution = document.getElementById('kb-solution').value.trim();
    if (!title || !solution) { showToast('Unesite naslov i rešenje.'); return; }
    addKnowledgeEntry({
      title,
      solution,
      category: document.getElementById('kb-category').value,
      tags: title.toLowerCase().split(/\s+/)
    });
    document.getElementById('kb-title').value = '';
    document.getElementById('kb-solution').value = '';
    renderKnowledge();
    showToast('Rešenje sačuvano!');
  });
});
