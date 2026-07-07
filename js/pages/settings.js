function renderRecurringList() {
  const list = getRecurringExpenses();
  const container = document.getElementById('recurring-list');

  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted text-center" style="font-size:var(--font-size-sm)">Nema mesečnih računa. Dodajte ispod.</p>';
    return;
  }

  container.innerHTML = list.map(r => `
    <div class="list-item" style="padding:var(--space-sm) 0">
      <div class="list-item__icon">${getCategoryIcon(r.category)}</div>
      <div class="list-item__content">
        <div class="list-item__title">${r.name}</div>
        <div class="list-item__subtitle">${formatCurrency(r.amount)} · ${r.dayOfMonth}. u mesecu</div>
      </div>
      <button class="btn btn--ghost btn--sm delete-rec" data-id="${r.id}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.delete-rec').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteRecurringExpense(btn.dataset.id);
      renderRecurringList();
      showToast('Račun uklonjen.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Podešavanja' });

  const settings = getSettings();

  document.getElementById('user-name').value = settings.userName || '';
  document.getElementById('currency').value = settings.currency || 'RSD';
  document.getElementById('monthly-budget').value = settings.monthlyBudget || 80000;
  document.getElementById('savings-goal').value = settings.savingsGoal || 10000;
  document.getElementById('api-key').value = settings.apiKey || '';

  const toggle = document.getElementById('dark-theme-toggle');
  if (settings.darkTheme) toggle.classList.add('toggle--on');

  toggle.addEventListener('click', () => {
    const dark = toggleTheme();
    toggle.classList.toggle('toggle--on', dark);
  });

  populateCategorySelect('rec-category');
  renderRecurringList();

  document.getElementById('add-recurring').addEventListener('click', () => {
    const name = document.getElementById('rec-name').value.trim();
    const amount = document.getElementById('rec-amount').value;
    const category = document.getElementById('rec-category').value;
    const dayOfMonth = document.getElementById('rec-day').value;

    if (!name || !amount) {
      showToast('Unesite naziv i iznos.');
      return;
    }

    addRecurringExpense({ name, amount, category, dayOfMonth });
    document.getElementById('rec-name').value = '';
    document.getElementById('rec-amount').value = '';
    renderRecurringList();
    showToast('Mesečni račun dodat!');
  });

  document.getElementById('settings-form').addEventListener('submit', e => {
    e.preventDefault();
    saveSettings({
      userName: document.getElementById('user-name').value.trim(),
      currency: document.getElementById('currency').value,
      monthlyBudget: parseFloat(document.getElementById('monthly-budget').value) || 80000,
      savingsGoal: parseFloat(document.getElementById('savings-goal').value) || 10000,
      apiKey: document.getElementById('api-key').value.trim()
    });
    showToast('Podešavanja sačuvana!');
  });

  document.getElementById('reset-data').addEventListener('click', () => {
    if (confirm('Da li ste sigurni? Svi podaci će biti obrisani i vraćeni na početne vrednosti.')) {
      resetAllData();
      showToast('Podaci su resetovani.');
      setTimeout(() => location.reload(), 1000);
    }
  });

  document.getElementById('clear-chat').addEventListener('click', () => {
    clearChatHistory();
    showToast('Istorija chata obrisana.');
  });
});
