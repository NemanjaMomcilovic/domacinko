let categoryChart = null;
let trendChart = null;

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

function renderWeeklySpending() {
  const container = document.getElementById('weekly-spending');
  if (!container || typeof getWeeklySpending !== 'function') return;

  const days = getWeeklySpending();
  const max = Math.max(...days.map(d => d.amount), 1);
  const total = days.reduce((s, d) => s + d.amount, 0);

  container.innerHTML = `
    <p class="text-muted mb-sm" style="font-size:var(--font-size-sm)">Ukupno 7 dana: <strong>${formatCurrency(total)}</strong></p>
    <div class="weekly-chart" role="img" aria-label="Grafikon potrošnje po danima">
      ${days.map(d => `
        <div class="weekly-bar">
          <span class="weekly-bar__amount">${d.amount > 0 ? formatCurrency(d.amount) : '—'}</span>
          <div class="weekly-bar__fill${d.isToday ? ' weekly-bar__fill--today' : ''}" style="height:${Math.max(4, (d.amount / max) * 80)}px"></div>
          <span class="weekly-bar__label">${d.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTrendChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas || typeof Chart === 'undefined' || typeof getSpendingTrend !== 'function') return;

  const trend = getSpendingTrend(6);

  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }

  trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: trend.map(t => t.label),
      datasets: [{
        label: 'Potrošnja',
        data: trend.map(t => t.amount),
        borderColor: '#2d8f5c',
        backgroundColor: 'rgba(45, 143, 92, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#2d8f5c'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => formatCurrency(v) }
        }
      }
    }
  });
}

function exportFinancesPdf() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const score = getFinancialHealthScore();
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());
  const monthName = now.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });
  const healthTitle = getHealthTitle(score);
  const insights = getFinancialTrainerInsights();
  const comparison = getMonthComparison();
  const savings = getSavingsProgress();

  const rows = Object.entries(byCategory)
    .filter(([, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amt]) => {
      const pct = spent > 0 ? Math.round((amt / spent) * 100) : 0;
      return `<tr><td>${getCategoryIcon(id)} ${getCategoryLabel(id)}</td><td style="text-align:right">${formatCurrency(amt)}</td><td style="text-align:right;color:#666">${pct}%</td></tr>`;
    })
    .join('');

  const trainerHtml = insights.slice(0, 3).map(i =>
    `<li style="margin-bottom:8px"><strong>${i.label}:</strong> ${i.message}</li>`
  ).join('');

  const printWin = window.open('', '_blank');
  if (!printWin) {
    showToast('Dozvolite pop-up prozore za izvoz.', 'warning');
    return;
  }

  printWin.document.write(`<!DOCTYPE html><html lang="sr"><head><meta charset="UTF-8"><title>Domaćinko — Izveštaj ${monthName}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:'Segoe UI',system-ui,sans-serif;padding:32px;max-width:720px;margin:0 auto;color:#1a2e24;line-height:1.5}
      .brand{display:flex;align-items:center;gap:12px;border-bottom:3px solid #2d8f5c;padding-bottom:16px;margin-bottom:24px}
      .brand h1{margin:0;font-size:1.5rem;color:#2d8f5c}
      .brand span{font-size:0.75rem;color:#666}
      .score-box{background:linear-gradient(135deg,#e8f5ee,#d4ede0);padding:20px;border-radius:12px;margin:20px 0;text-align:center}
      .score-box .num{font-size:2.5rem;font-weight:700;color:#2d8f5c}
      .summary{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
      .summary div{background:#f5f9f7;padding:14px;border-radius:8px}
      .summary strong{display:block;font-size:0.75rem;color:#666;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{padding:10px 8px;border-bottom:1px solid #e0e8e4;text-align:left}
      th{background:#f5f9f7;font-size:0.8rem;color:#666}
      .trainer{background:#fffbeb;border-left:4px solid #e6a817;padding:16px;border-radius:0 8px 8px 0;margin:20px 0}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e0e8e4;font-size:11px;color:#888;text-align:center}
      @media print{body{padding:16px}}
    </style></head><body>
    <div class="brand">
      <div>
        <h1>🏡 Domaćinko</h1>
        <span>Powered by <strong style="color:#2d8f5c">10KEY</strong> · Mesečni finansijski izveštaj</span>
      </div>
    </div>
    <p style="font-size:1.1rem;margin:0"><strong>${monthName}</strong>${settings.userName ? ` · ${settings.userName}` : ''}</p>

    <div class="score-box">
      <div class="num">${score}/100</div>
      <div>${healthTitle}</div>
      ${comparison ? `<div style="font-size:0.85rem;margin-top:8px;color:#555">${comparison.text}</div>` : ''}
    </div>

    <div class="summary">
      <div><strong>Budžet</strong>${formatCurrency(budget)}</div>
      <div><strong>Potrošeno</strong>${formatCurrency(spent)}</div>
      <div><strong>Preostalo</strong>${formatCurrency(budget - spent)}</div>
      <div><strong>Cilj štednje</strong>${savings.goal > 0 ? `${savings.pct}% · ${savings.goalName}` : '—'}</div>
    </div>

    <h2 style="font-size:1rem;color:#2d8f5c">Troškovi po kategorijama</h2>
    <table>
      <thead><tr><th>Kategorija</th><th style="text-align:right">Iznos</th><th style="text-align:right">Udeo</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">Nema troškova ovog meseca</td></tr>'}</tbody>
    </table>

    <div class="trainer">
      <h2 style="font-size:1rem;margin:0 0 12px;color:#b8860b">💪 Uvid finansijskog trenera</h2>
      <ul style="margin:0;padding-left:20px;font-size:0.9rem">${trainerHtml || '<li>Dodajte troškove za personalizovane savete.</li>'}</ul>
    </div>

    <div class="footer">
      Generisano iz Domaćinko aplikacije · ${new Date().toLocaleString('sr-RS')}<br>
      10KEY platforma · domacinko
    </div>
  </body></html>`);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => printWin.print(), 500);
  showToast('Izveštaj spreman za štampu.', 'success');
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
  renderWeeklySpending();
  renderTrendChart();
  renderExpensesList();
  renderFinancialTrainer();
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('finances', { title: 'Finansije' });

  const expensesList = document.getElementById('expenses-list');
  if (expensesList) expensesList.innerHTML = renderSkeleton(4, 'list');

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
  renderWeeklySpending();
  renderTrendChart();
  renderExpensesList();
  renderFinancialTrainer();

  document.getElementById('export-pdf-btn')?.addEventListener('click', exportFinancesPdf);
});
