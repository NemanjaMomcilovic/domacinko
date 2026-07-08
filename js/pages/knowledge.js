const KB_CATEGORIES = {
  vodovod: 'Vodovod', elektrika: 'Elektrika', grejanje: 'Grejanje',
  aparati: 'Aparati', basta: 'Bašta', ostalo: 'Ostalo'
};

let kbFilter = { category: '', favoritesOnly: false, query: '' };

function renderKnowledge() {
  const items = typeof searchKnowledge === 'function'
    ? searchKnowledge(kbFilter.query, { category: kbFilter.category, favoritesOnly: kbFilter.favoritesOnly })
    : getKnowledgeBase();
  const container = document.getElementById('knowledge-list');

  if (items.length === 0) {
    container.innerHTML = renderEmptyState(
      '📚',
      kbFilter.favoritesOnly ? 'Nema omiljenih' : 'Baza je prazna',
      kbFilter.favoritesOnly ? 'Označite zvezdicom rešenja koja često koristite.' : 'Sačuvajte rešenja iz AI Majstora ili dodajte ručno.'
    );
    return;
  }

  container.innerHTML = items.map(k => {
    const isFav = typeof isKnowledgeFavorite === 'function' && isKnowledgeFavorite(k.id);
    const tags = (k.tags || []).slice(0, 4).map(t => `<span class="fav-chip fav-chip--sm">${t}</span>`).join('');
    return `
    <div class="list-item knowledge-item">
      <div class="list-item__icon">📚</div>
      <div class="list-item__content">
        <div class="list-item__title">${k.title}</div>
        <div class="list-item__subtitle">${KB_CATEGORIES[k.category] || k.category} · ${formatDate(k.date.split('T')[0])}</div>
        ${tags ? `<div class="fav-chips mt-xs">${tags}</div>` : ''}
        <p class="knowledge-item__solution">${k.solution}</p>
      </div>
      <button type="button" class="btn btn--ghost btn--sm kb-fav" data-id="${k.id}" aria-label="${isFav ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}">${isFav ? '★' : '☆'}</button>
      <button class="btn btn--ghost btn--sm del-kb" data-id="${k.id}" aria-label="Obriši">✕</button>
    </div>
  `;
  }).join('');

  container.querySelectorAll('.del-kb').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Obrisati rešenje?')) {
        deleteKnowledgeEntry(btn.dataset.id);
        renderKnowledge();
        showToast('Obrisano.');
      }
    });
  });

  container.querySelectorAll('.kb-fav').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleKnowledgeFavorite(btn.dataset.id);
      renderKnowledge();
    });
  });
}

function renderKnowledgeFilters() {
  const container = document.getElementById('knowledge-filters');
  if (!container) return;

  container.innerHTML = `
    <div class="fav-chips mb-sm">
      <button type="button" class="fav-chip kb-cat-filter active" data-cat="">Sve</button>
      ${Object.entries(KB_CATEGORIES).map(([id, label]) =>
        `<button type="button" class="fav-chip kb-cat-filter" data-cat="${id}">${label}</button>`
      ).join('')}
      <button type="button" class="fav-chip" id="kb-favorites-filter">★ Omiljeno</button>
    </div>
  `;

  container.querySelectorAll('.kb-cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.kb-cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      kbFilter.category = btn.dataset.cat;
      renderKnowledge();
    });
  });

  document.getElementById('kb-favorites-filter')?.addEventListener('click', () => {
    kbFilter.favoritesOnly = !kbFilter.favoritesOnly;
    document.getElementById('kb-favorites-filter').classList.toggle('active', kbFilter.favoritesOnly);
    renderKnowledge();
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
      if (data.category) document.getElementById('kb-category').value = data.category;
      sessionStorage.removeItem('knowledge_prefill');
    } catch { /* ignore */ }
  }

  renderKnowledgeFilters();
  renderKnowledge();

  document.getElementById('knowledge-search').addEventListener('input', e => {
    kbFilter.query = e.target.value;
    renderKnowledge();
  });

  document.getElementById('save-knowledge').addEventListener('click', () => {
    const title = document.getElementById('kb-title').value.trim();
    const solution = document.getElementById('kb-solution').value.trim();
    const tagsRaw = document.getElementById('kb-tags')?.value.trim() || '';
    if (!title || !solution) {
      showToast('Unesite naslov i rešenje.', 'warning');
      return;
    }
    const tags = tagsRaw
      ? tagsRaw.split(/[,;]+/).map(t => t.trim().toLowerCase()).filter(Boolean)
      : title.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    addKnowledgeEntry({
      title,
      solution,
      category: document.getElementById('kb-category').value,
      tags
    });
    document.getElementById('kb-title').value = '';
    document.getElementById('kb-solution').value = '';
    document.getElementById('kb-tags').value = '';
    renderKnowledge();
    showToast('Rešenje sačuvano!', 'success');
  });
});
