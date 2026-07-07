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

  renderScoreRing(score, 'fin-health-score');

  const scoreLabel = document.getElementById('score-label');
  if (score >= 80) scoreLabel.textContent = 'Odlično! Finansije su pod kontrolom.';
  else if (score >= 60) scoreLabel.textContent = 'Dobro, ali pazite na troškove.';
  else if (score >= 40) scoreLabel.textContent = 'Pažnja — blizu ste limita.';
  else scoreLabel.textContent = 'Potrebna je pažnja na budžet.';

  const categoriesEl = document.getElementById('category-breakdown');
  const sorted = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    categoriesEl.innerHTML = '<p class="text-muted text-center">Nema troškova ovog meseca.</p>';
  } else {
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
});
