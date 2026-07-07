function renderExpenses() {
  const now = new Date();
  const expenses = getMonthlyExpenses(now.getFullYear(), now.getMonth());
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  document.getElementById('monthly-total').textContent = formatCurrency(total);

  const list = document.getElementById('expenses-list');
  if (expenses.length === 0) {
    list.innerHTML = renderEmptyState('💸', 'Nema troškova ovog meseca', 'Dodajte prvi trošak iznad!');
    return;
  }

  list.innerHTML = expenses.slice(0, 10).map(e => `
    <div class="list-item list-item--new">
      <div class="list-item__icon">${getCategoryIcon(e.category)}</div>
      <div class="list-item__content">
        <div class="list-item__title">${e.name}</div>
        <div class="list-item__subtitle">${getCategoryLabel(e.category)} · ${formatDate(e.date)}</div>
      </div>
      <div class="list-item__amount">${formatCurrency(e.amount)}</div>
      <button class="btn btn--ghost btn--sm delete-expense" data-id="${e.id}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.delete-expense').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteExpense(btn.dataset.id);
      renderExpenses();
      showToast('Trošak obrisan.');
    });
  });
}

function prefillFromParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('name')) document.getElementById('expense-name').value = params.get('name');
  if (params.get('amount')) document.getElementById('expense-amount').value = params.get('amount');
  if (params.get('date')) document.getElementById('expense-date').value = params.get('date');
  if (params.get('category')) document.getElementById('expense-category').value = params.get('category');
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('', { title: 'Dodaj trošak', showBack: true, backHref: 'home.html' });

  populateCategorySelect('expense-category');
  document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
  prefillFromParams();

  const form = document.getElementById('expense-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('expense-name').value.trim();
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const note = document.getElementById('expense-note').value.trim();

    if (!name || !amount || parseFloat(amount) <= 0) {
      showToast('Unesite naziv i iznos.');
      return;
    }

    addExpense({ name, amount, category, date, note });
    form.reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    renderExpenses();
    showToast('Trošak sačuvan!');
  });

  renderExpenses();
});
