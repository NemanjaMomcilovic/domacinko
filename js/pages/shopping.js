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
    <div class="shopping-item${item.bought ? ' bought' : ''}" data-id="${item.id}">
      <input type="checkbox" class="shopping-checkbox" ${item.bought ? 'checked' : ''}>
      <span class="shopping-item__name" style="flex:1">${item.name}</span>
      <button class="btn btn--ghost btn--sm delete-item" data-id="${item.id}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.shopping-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const itemEl = cb.closest('.shopping-item');
      itemEl.classList.add('shopping-item--checked');
      const id = itemEl.dataset.id;
      toggleShoppingItem(id);
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
      <button class="btn btn--ghost btn--sm del-watch" data-id="${w.id}">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-watch').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteWatchItem(btn.dataset.id);
      renderWatchList();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('shopping', { title: 'Lista za kupovinu' });
  renderShoppingList();
  renderPurchasePatterns();
  renderWatchList();

  const form = document.getElementById('add-item-form');
  const input = document.getElementById('item-name');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    addShoppingItem(name);
    input.value = '';
    renderShoppingList();
    showToast('Dodato na listu!');
  });

  document.getElementById('clear-list').addEventListener('click', () => {
    if (confirm('Da li ste sigurni da želite da obrišete celu listu?')) {
      clearShoppingList();
      renderShoppingList();
      showToast('Lista je obrisana.');
    }
  });

  document.getElementById('add-watch')?.addEventListener('click', () => {
    const name = document.getElementById('watch-name').value.trim();
    const price = document.getElementById('watch-price').value;
    if (!name) return;
    addWatchItem({ productName: name, targetPrice: price });
    document.getElementById('watch-name').value = '';
    document.getElementById('watch-price').value = '';
    renderWatchList();
    showToast('Dodato na listu praćenja.');
  });
});
