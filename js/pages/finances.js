let categoryChart = null;

function getFilters() {
  return {
    category: document.getElementById('filter-category').value || undefined,
    dateFrom: document.getElementById('filter-from').value || undefined,
    dateTo: document.getElementById('filter-to').value || undefined
  };
}

function renderComparison() {
  const comparison = getMonthComparison();
  const el = document.getElementById('fin-comparison');
  if (!comparison) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `<div class="comparison-banner ${comparison.less ? 'comparison-banner--good' : 'comparison-banner--warn'}">${comparison.text}</div>`;
}

function renderSavings() {
  const savings = getSavingsProgress();
  document.getElementById('fin-savings-progress').innerHTML = renderProgressBar(
    savings.pct,
    savings.goalName !== 'Cilj štednje'
      ? `${formatCurrency(savings.saved)} / ${formatCurrency(savings.goal)}`
      : `${formatCurrency(savings.saved)} od ${formatCurrency(savings.goal)}`
  );
  const remainingEl = document.getElementById('fin-savings-remaining');
  if (remainingEl && savings.goal > 0) {
    remainingEl.textContent = `Još ${formatCurrency(savings.remaining)} do ${savings.goalName}`;
    remainingEl.classList.remove('hidden');
  }
}

function renderCategoryBreakdown(byCategory) {
  const categoriesEl = document.getElementById('category-breakdown');
  const sorted = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    categoriesEl.innerHTML = renderEmptyState('📊', 'Nema troškova', 'Dodajte troškove da vidite raspodelu po kategorijama.');
    return;
  }

  const maxAmount = sorted[0][1];
  categoriesEl.innerHTML = sorted.map(([catId, amount]) => {
    const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
    return `
      <div class="category-bar">
        <div class="category-bar__header">
          <span>${getCategoryIcon(catId)} ${getCategoryLabel(catId)}</span>
          <span>${formatCurrency(amount)}</span>
        </div>
        <div class="category-bar__track">
          <div class="category-bar__fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderChart(byCategory) {
  const canvas = document.getElementById('category-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const sorted = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  if (categoryChart) {
    categoryChart.destroy();
    categoryChart = null;
  }

  if (sorted.length === 0) return;

  const colors = ['#2d8f5c', '#3b82c4', '#e6a817', '#d64545', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7'];

  categoryChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: sorted.map(([id]) => getCategoryLabel(id)),
      datasets: [{
        data: sorted.map(([, amt]) => amt),
        backgroundColor: colors.slice(0, sorted.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
        }
      }
    }
  });
}

function renderExpensesList() {
  const filters = getFilters();
  const expenses = filterExpenses(filters);
  const list = document.getElementById('expenses-list');

  if (expenses.length === 0) {
    list.innerHTML = renderEmptyState('📝', 'Nema troškova', 'Podesite filtere ili dodajte novi trošak.');
    return;
  }

  list.innerHTML = expenses.map(e => `
    <div class="list-item">
      <div class="list-item__icon">${getCategoryIcon(e.category)}</div>
      <div class="list-item__content">
        <div class="list-item__title">${e.name}</div>
        <div class="list-item__subtitle">${getCategoryLabel(e.category)} · ${formatDate(e.date)}</div>
      </div>
      <div class="list-item__amount">${formatCurrency(e.amount)}</div>
      <div class="list-item__actions">
        <button class="btn btn--ghost btn--sm edit-expense" data-id="${e.id}" title="Izmeni">✏️</button>
        <button class="btn btn--ghost btn--sm delete-expense" data-id="${e.id}" title="Obriši">✕</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.delete-expense').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Obrisati ovaj trošak?')) {
        deleteExpense(btn.dataset.id);
        refreshFinances();
        showToast('Trošak obrisan.');
      }
    });
  });

  list.querySelectorAll('.edit-expense').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
}

function openEditModal(id) {
  const expense = getExpenses().find(e => e.id === id);
  if (!expense) return;

  const container = document.getElementById('edit-modal-container');
  container.innerHTML = `
    <div class="modal-overlay" id="edit-overlay">
      <div class="modal">
        <h2 class="modal__title">Izmeni trošak</h2>
        <div class="form-group">
          <label class="form-label" for="edit-name">Naziv</label>
          <input type="text" class="form-input" id="edit-name" value="${expense.name}">
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-amount">Iznos</label>
          <input type="number" class="form-input" id="edit-amount" value="${expense.amount}" min="1">
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-category">Kategorija</label>
          <select class="form-select" id="edit-category"></select>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-date">Datum</label>
          <input type="date" class="form-input" id="edit-date" value="${expense.date}">
        </div>
        <div class="modal__actions">
          <button class="btn btn--secondary" style="flex:1" id="edit-cancel">Otkaži</button>
          <button class="btn btn--primary" style="flex:1" id="edit-save">Sačuvaj</button>
        </div>
      </div>
    </div>
  `;

  populateCategorySelect('edit-category');
  document.getElementById('edit-category').value = expense.category;

  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('edit-overlay').addEventListener('click', e => {
    if (e.target.id === 'edit-overlay') closeEditModal();
  });

  document.getElementById('edit-save').addEventListener('click', () => {
    updateExpense(id, {
      name: document.getElementById('edit-name').value.trim(),
      amount: document.getElementById('edit-amount').value,
      category: document.getElementById('edit-category').value,
      date: document.getElementById('edit-date').value
    });
    closeEditModal();
    refreshFinances();
    showToast('Trošak ažuriran.');
  });
}

function closeEditModal() {
  document.getElementById('edit-modal-container').innerHTML = '';
}

function renderCategoryBudgets() {
  const container = document.getElementById('category-budgets');
  if (!container) return;

  const statuses = getCategoryBudgetStatus().filter(c => c.budget > 0);
  if (statuses.length === 0) {
    container.innerHTML = renderEmptyState('📊', 'Nema budžeta po kategorijama', 'Postavite limite u podešavanjima.');
    return;
  }

  container.innerHTML = statuses.map(s => renderCategoryBudgetBar(s)).join('');
}

function renderFinancialTrainer() {
  const container = document.getElementById('financial-trainer');
  if (!container) return;
  const insights = getFinancialTrainerInsights();
  container.innerHTML = insights.map(i => `
    <p class="advice-banner__text" style="margin-bottom:var(--space-sm)">${i.message}</p>
    <p class="text-muted" style="font-size:var(--font-size-sm)">${i.savings}</p>
  `).join('');
}

function refreshFinances() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());

  document.getElementById('fin-spent').textContent = formatCurrency(spent);
  document.getElementById('fin-remaining').textContent = formatCurrency(remaining);
  document.getElementById('fin-remaining').className = remaining >= 0 ? 'card__value text-success' : 'card__value text-danger';

  renderComparison();
  renderSavings();
  renderCategoryBudgets();
  renderCategoryBreakdown(byCategory);
  renderChart(byCategory);
  renderExpensesList();
  renderFinancialTrainer();
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('finances', { title: 'Finansije' });

  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const score = getFinancialHealthScore();
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());

  document.getElementById('fin-budget').textContent = formatCurrency(budget);
  document.getElementById('fin-spent').textContent = formatCurrency(spent);
  document.getElementById('fin-remaining').textContent = formatCurrency(remaining);
  document.getElementById('fin-remaining').className = remaining >= 0 ? 'card__value text-success' : 'card__value text-danger';

  renderHealthScore(score, 'fin-health-score');
  renderHealthFeedback('fin-health-feedback');

  const scoreLabel = document.getElementById('score-label');
  if (score >= 71) scoreLabel.textContent = 'Odlično! Finansije su pod kontrolom.';
  else if (score >= 41) scoreLabel.textContent = 'Dobro, ali pazite na troškove.';
  else scoreLabel.textContent = 'Potrebna je pažnja na budžet.';

  populateCategorySelect('filter-category', true);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  document.getElementById('filter-from').value = monthStart;
  document.getElementById('filter-to').value = monthEnd;

  ['filter-category', 'filter-from', 'filter-to'].forEach(id => {
    document.getElementById(id).addEventListener('change', renderExpensesList);
  });

  renderComparison();
  renderSavings();
  renderCategoryBudgets();
  renderCategoryBreakdown(byCategory);
  renderChart(byCategory);
  renderExpensesList();
  renderFinancialTrainer();
});
