function getCategoryClass(catId) {
  return `shopping-cat--${catId || 'other'}`;
}

function getShoppingCategoryLabel(catId) {
  const cat = SHOPPING_CATEGORIES?.find(c => c.id === catId);
  return cat ? `${cat.icon} ${cat.label}` : catId;
}

function renderFavoriteChips() {
  const container = document.getElementById('favorite-chips');
  if (!container) return;
  const favs = getFavoriteProducts();
  if (favs.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <p class="text-muted mb-sm" style="font-size:var(--font-size-xs)">Omiljeni proizvodi — dodirnite za brzo dodavanje</p>
    <div class="fav-chips">
      ${favs.map(name => `<button type="button" class="fav-chip" data-name="${name}">${name}</button>`).join('')}
    </div>
  `;
  container.querySelectorAll('.fav-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      addShoppingItem(btn.dataset.name, document.getElementById('item-category')?.value || 'food');
      renderShoppingList();
      showToast(`${btn.dataset.name} dodato!`, 'success');
    });
  });
}

function renderShoppingList() {
  const list = getShoppingList();
  const container = document.getElementById('shopping-list');

  if (list.length === 0) {
    container.innerHTML = renderEmptyState('🛒', 'Lista je prazna', 'Dodajte proizvod ispod — Domaćinko će vam pomoći da ne zaboravite ništa!');
    document.getElementById('list-count').textContent = '';
    return;
  }

  const unbought = list.filter(i => !i.bought).length;
  document.getElementById('list-count').textContent =
    unbought > 0 ? `Imate ${unbought} stavke na listi za kupovinu.` : 'Sve je kupljeno! 🎉';

  container.innerHTML = list.map(item => `
    <div class="shopping-item ${getCategoryClass(item.category)}${item.bought ? ' bought' : ''}" data-id="${item.id}">
      <input type="checkbox" class="shopping-checkbox" ${item.bought ? 'checked' : ''} aria-label="Označi ${item.name} kao kupljeno">
      <span class="shopping-item__name" style="flex:1">${item.name}</span>
      <button class="btn btn--ghost btn--sm delete-item" data-id="${item.id}" aria-label="Obriši ${item.name}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.shopping-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const itemEl = cb.closest('.shopping-item');
      itemEl.classList.add('shopping-item--checked');
      toggleShoppingItem(itemEl.dataset.id);
      setTimeout(() => renderShoppingList(), 300);
    });
  });

  container.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteShoppingItem(btn.dataset.id);
      renderShoppingList();
    });
  });
}

function renderPurchasePatterns() {
  const container = document.getElementById('purchase-patterns');
  if (!container) return;
  const patterns = detectPurchasePatterns();
  if (patterns.length === 0) {
    container.innerHTML = renderEmptyState('🔄', 'Nema prepoznatih navika', 'Dodajte više troškova hrane da otkrijemo obrasce.');
    return;
  }
  container.innerHTML = patterns.map(p => `
    <div class="reminder-item">
      <span class="reminder-item__icon">🛒</span>
      <span>Kupuješ <strong>${p.name}</strong> ${p.frequency} (${p.count}× zabeleženo)</span>
    </div>
  `).join('');
}

function renderWatchList() {
  const container = document.getElementById('watch-list');
  if (!container) return;
  const items = getWatchList();
  if (items.length === 0) {
    container.innerHTML = renderEmptyState('👀', 'Lista je prazna', 'Dodajte proizvod čiju cenu pratite.');
    return;
  }
  container.innerHTML = items.map(w => `
    <div class="list-item">
      <div class="list-item__icon">👀</div>
      <div class="list-item__content">
        <div class="list-item__title">${w.productName}</div>
        <div class="list-item__subtitle">Cilj: ${formatCurrency(w.targetPrice)}</div>
      </div>
      <button class="btn btn--ghost btn--sm del-watch" data-id="${w.id}" aria-label="Ukloni sa liste">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-watch').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteWatchItem(btn.dataset.id);
      renderWatchList();
    });
  });
}

function renderLowStockWarnings() {
  const container = document.getElementById('pantry-warnings');
  if (!container) return;
  const low = getLowStockPantry();
  if (low.length === 0) {
    container.innerHTML = renderEmptyState('🥫', 'Ostava je u redu', 'Sve namirnice imaju dovoljnu zalihu.');
    return;
  }
  container.innerHTML = low.map(p => `
    <div class="reminder-item reminder-item--warn">
      <span class="reminder-item__icon">⚠️</span>
      <span><strong>${p.name}</strong> — ostalo malo (${p.quantity || 0})</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('shopping', { title: 'Lista za kupovinu' });

  const catSelect = document.getElementById('item-category');
  if (catSelect && typeof SHOPPING_CATEGORIES !== 'undefined') {
    catSelect.innerHTML = SHOPPING_CATEGORIES.map(c =>
      `<option value="${c.id}">${c.icon} ${c.label}</option>`
    ).join('');
  }

  renderFavoriteChips();
  renderShoppingList();
  renderPurchasePatterns();
  renderWatchList();
  renderLowStockWarnings();

  const form = document.getElementById('add-item-form');
  const input = document.getElementById('item-name');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    const category = document.getElementById('item-category')?.value || 'other';
    addShoppingItem(name, category);
    addFavoriteProduct(name);
    input.value = '';
    renderShoppingList();
    renderFavoriteChips();
    showToast('Dodato na listu!', 'success');
  });

  document.getElementById('clear-list').addEventListener('click', () => {
    if (confirm('Da li ste sigurni da želite da obrišete celu listu?')) {
      clearShoppingList();
      renderShoppingList();
      showToast('Lista je obrisana.', 'info');
    }
  });

  document.getElementById('add-watch')?.addEventListener('click', () => {
    const name = document.getElementById('watch-name').value.trim();
    const price = document.getElementById('watch-price').value;
    if (!name) {
      showToast(getErrorMessage('required'), 'warning');
      return;
    }
    addWatchItem({ productName: name, targetPrice: price });
    document.getElementById('watch-name').value = '';
    document.getElementById('watch-price').value = '';
    renderWatchList();
    showToast('Dodato na listu praćenja.', 'success');
  });
});
