document.addEventListener('DOMContentLoaded', () => {
  initNavigation('home');

  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const score = getFinancialHealthScore();
  const expenses = getMonthlyExpenses(now.getFullYear(), now.getMonth()).slice(0, 5);
  const tasks = getTasks();
  const shopping = getShoppingList().filter(i => !i.bought);

  const name = settings.userName || 'prijatelju';
  document.getElementById('greeting').textContent = `${getGreeting()}, ${name}!`;

  const household = getHousehold();
  const members = household.familyMembers?.length || 0;
  const statusText = members > 0
    ? `Domaćinstvo: ${members} članova`
    : 'Podesite domaćinstvo u podešavanjima';
  document.getElementById('household-status').textContent = statusText;

  const comparison = getMonthComparison();
  const compEl = document.getElementById('month-comparison');
  if (comparison) {
    compEl.innerHTML = `<div class="comparison-banner ${comparison.less ? 'comparison-banner--good' : 'comparison-banner--warn'}">${comparison.text} 💚</div>`;
  }

  renderScoreRing(score, 'health-score');

  document.getElementById('monthly-spent').textContent = formatCurrency(spent);
  document.getElementById('monthly-budget').textContent = formatCurrency(budget);
  document.getElementById('remaining').textContent = formatCurrency(remaining);
  document.getElementById('remaining').className = remaining >= 0
    ? 'stat-card__value stat-card__value--positive'
    : 'stat-card__value stat-card__value--negative';

  const savings = getSavingsProgress();
  document.getElementById('savings-progress').innerHTML = renderProgressBar(
    savings.pct,
    `${formatCurrency(savings.saved)} od ${formatCurrency(savings.goal)}`
  );

  document.getElementById('daily-advice').textContent = getDailyAdvice();

  const reminders = getRecurringReminders();
  if (reminders.length > 0) {
    document.getElementById('recurring-section').classList.remove('hidden');
    document.getElementById('recurring-reminders').innerHTML = reminders.map(r => `
      <div class="reminder-item">
        <span class="reminder-item__icon">${getCategoryIcon(r.category)}</span>
        <span><strong>${r.name}</strong> — ${formatCurrency(r.amount)} (do ${r.dayOfMonth}. u mesecu)</span>
      </div>
    `).join('');
  }

  const tasksEl = document.getElementById('tasks-list');
  const todayTasks = tasks.filter(t => !t.done).slice(0, 5);
  if (todayTasks.length === 0) {
    tasksEl.innerHTML = renderEmptyState('✅', 'Svi zadaci su završeni!', 'Uživajte u slobodnom danu.');
  } else {
    tasksEl.innerHTML = todayTasks.map(t => `
      <div class="task-item animate-slide-in">
        <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}>
        <span>${t.text}</span>
      </div>
    `).join('');
    tasksEl.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        toggleTask(cb.dataset.id);
        location.reload();
      });
    });
  }

  const expensesEl = document.getElementById('latest-expenses');
  if (expenses.length === 0) {
    expensesEl.innerHTML = renderEmptyState('💸', 'Još nema troškova', 'Dodajte prvi trošak i pratite budžet!');
  } else {
    expensesEl.innerHTML = expenses.map(e => `
      <div class="list-item list-item--new">
        <div class="list-item__icon">${getCategoryIcon(e.category)}</div>
        <div class="list-item__content">
          <div class="list-item__title">${e.name}</div>
          <div class="list-item__subtitle">${getCategoryLabel(e.category)} · ${formatDate(e.date)}</div>
        </div>
        <div class="list-item__amount">${formatCurrency(e.amount)}</div>
      </div>
    `).join('');
  }

  if (shopping.length > 0) {
    document.getElementById('shopping-hint').textContent =
      `Imate ${shopping.length} stavke na listi za kupovinu.`;
    document.getElementById('shopping-hint').classList.remove('hidden');
  }
});
