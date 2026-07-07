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

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('shopping', { title: 'Lista za kupovinu' });
  renderShoppingList();

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
});
