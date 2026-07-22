function refreshHomeDashboard() {
  if (typeof renderMorningBriefing === 'function') {
    renderMorningBriefing('morning-briefing');
  }

  const beta = typeof isBetaMode === 'function' && isBetaMode();
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const score = getFinancialHealthScore();
  const expenses = getMonthlyExpenses(now.getFullYear(), now.getMonth()).slice(0, 5);
  const tasks = getTasks();
  const shopping = getShoppingList().filter(i => !i.bought);

  const maintenanceDue = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];

  if (typeof renderQuickStatsRow === 'function') {
    const stats = [
      { icon: '💸', label: 'Danas', value: formatCurrency(getTodaySpending?.() || 0), link: 'add-expense.html' },
      { icon: '🛒', label: 'Kupovina', value: String(shopping.length), link: 'shopping.html' }
    ];
    if (!beta) {
      stats.push({ icon: '🔧', label: 'Održavanje', value: String(maintenanceDue.length), link: 'maintenance.html' });
    }
    renderQuickStatsRow('quick-stats', stats);
  }

  const tipsEl = document.getElementById('personalized-tips');
  if (tipsEl && typeof getPersonalizedTips === 'function') {
    const tips = getPersonalizedTips();
    tipsEl.innerHTML = `
      <div class="card card--flat">
        <p class="card__title">💡 Saveti za tebe</p>
        ${tips.map(t => `<p class="advice-banner__text" style="margin-bottom:var(--space-sm)">${t.icon} ${t.text}</p>`).join('')}
      </div>
    `;
  }

  const comparison = getMonthComparison();
  const compEl = document.getElementById('month-comparison');
  if (comparison && compEl) {
    compEl.innerHTML = `<div class="comparison-banner ${comparison.less ? 'comparison-banner--good' : 'comparison-banner--warn'}">${comparison.text} 💚</div>`;
  }

  renderHealthScore(score, 'health-score');
  renderHealthFeedback('health-feedback');

  document.getElementById('monthly-spent').textContent = formatCurrency(spent);
  document.getElementById('monthly-budget').textContent = formatCurrency(budget);
  document.getElementById('remaining').textContent = formatCurrency(remaining);
  document.getElementById('remaining').className = remaining >= 0
    ? 'stat-card__value stat-card__value--positive'
    : 'stat-card__value stat-card__value--negative';

  renderSavingsGoalCard('savings-card');
  document.getElementById('daily-advice').textContent = getDomacinkoAdvice();

  const reminders = getRecurringReminders();
  const recurringSection = document.getElementById('recurring-section');
  if (reminders.length > 0 && recurringSection) {
    recurringSection.classList.remove('hidden');
    document.getElementById('recurring-reminders').innerHTML = reminders.map(r => `
      <div class="reminder-item">
        <span class="reminder-item__icon">${getCategoryIcon(r.category)}</span>
        <span><strong>${r.name}</strong> — ${formatCurrency(r.amount)} (do ${r.dayOfMonth}. u mesecu)</span>
      </div>
    `).join('');
  }

  const tasksEl = document.getElementById('tasks-list');
  const tasksSection = document.getElementById('tasks-section');
  const todayTasks = tasks.filter(t => !t.done).slice(0, 5);
  if (beta) {
    tasksSection?.classList.add('hidden');
  } else {
    tasksSection?.classList.remove('hidden');
    if (todayTasks.length === 0) {
      tasksEl.innerHTML = renderEmptyState('✅', 'Svi zadaci su završeni!', 'Uživajte u slobodnom danu.');
    } else {
      tasksEl.innerHTML = todayTasks.map(t => `
        <div class="task-item animate-slide-in">
          <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''} aria-label="Označi zadatak: ${t.text}">
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
  }

  const expensesEl = document.getElementById('latest-expenses');
  if (expenses.length === 0) {
    expensesEl.innerHTML = renderEmptyState(
      '💸',
      'Još nema troškova',
      'Dodajte prvi trošak i pratite budžet!',
      { href: 'add-expense.html', label: 'Dodaj trošak' }
    );
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

  const shoppingHint = document.getElementById('shopping-hint');
  if (shopping.length > 0 && shoppingHint) {
    shoppingHint.textContent = `Imate ${shopping.length} stavke na listi za kupovinu.`;
    shoppingHint.classList.remove('hidden');
  }

  const budgetWarnings = getCategoryBudgetWarnings();
  if (budgetWarnings.length > 0) {
    document.getElementById('budget-warnings-section').classList.remove('hidden');
    document.getElementById('budget-warnings').innerHTML = budgetWarnings.map(w => `
      <div class="reminder-item ${w.warning === 'exceeded' ? 'reminder-item--danger' : 'reminder-item--warn'}">
        <span class="reminder-item__icon">${w.icon}</span>
        <span><strong>${w.label}</strong> — ${w.pct}% budžeta (${formatCurrency(w.spent)} / ${formatCurrency(w.budget)})</span>
      </div>
    `).join('');
  }

  if (maintenanceDue.length > 0 && !beta) {
    document.getElementById('maintenance-section').classList.remove('hidden');
    document.getElementById('maintenance-due').innerHTML = maintenanceDue.slice(0, 5).map(t => `
      <div class="reminder-item ${t.overdue ? 'reminder-item--danger' : ''}">
        <span class="reminder-item__icon">${t.icon || '📋'}</span>
        <span><strong>${t.name}</strong> — ${t.overdue ? 'Kasni!' : `Za ${t.daysUntil} dana`}</span>
      </div>
    `).join('');
  }

  const expiringWarranties = getExpiringWarranties(30);
  if (expiringWarranties.length > 0 && !beta) {
    document.getElementById('warranty-section').classList.remove('hidden');
    document.getElementById('warranty-expiring').innerHTML = expiringWarranties.slice(0, 5).map(item => {
      const daysLeft = Math.ceil((new Date(item.warrantyEnd) - new Date()) / (1000 * 60 * 60 * 24));
      return `
        <div class="reminder-item reminder-item--warn">
          <span class="reminder-item__icon">🛡️</span>
          <span><strong>${item.name}</strong> — garancija ističe za ${daysLeft} dana</span>
        </div>
      `;
    }).join('');
  }
}

const QUICK_ACTIONS_BETA = [
  { href: 'add-expense.html', icon: '💸', label: 'Dodaj trošak' },
  { href: 'utility-bills.html', icon: '💡', label: 'Komunalije' },
  { href: 'meal-plan.html', icon: '🍽️', label: 'Plan obroka' },
  { href: 'ai.html', icon: '💬', label: '10KEY Savetnik' },
  { href: 'shopping.html', icon: '🛒', label: 'Lista kupovine' }
];

const QUICK_ACTIONS_FULL = [
  ...QUICK_ACTIONS_BETA,
  { href: 'ai.html#majstor', icon: '🔧', label: 'AI Majstor' },
  { href: 'maintenance.html', icon: '🏠', label: 'Održavanje' },
  { href: 'inventory.html', icon: '📦', label: 'Inventar' }
];

function renderQuickActions() {
  const container = document.getElementById('quick-actions');
  if (!container) return;
  const actions = (typeof isBetaMode === 'function' && isBetaMode())
    ? QUICK_ACTIONS_BETA
    : QUICK_ACTIONS_FULL;
  container.innerHTML = actions.map(a => `
    <a href="${a.href}" class="quick-action">
      <span class="quick-action__icon">${a.icon}</span>
      ${a.label}
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth?.();
  if (typeof applyAuthProfileToSettings === 'function' && isLoggedIn?.() && getCurrentUser?.()) {
    applyAuthProfileToSettings(getCurrentUser());
  }

  initNavigation('home');
  initPwaInstallBanner();
  initFeedbackBanner();

  const settings = getSettings();
  const name = (typeof getAuthDisplayName === 'function' ? getAuthDisplayName() : settings.userName) || 'prijatelju';
  document.getElementById('greeting').textContent = `${getGreeting()}, ${name}!`;

  const avatarEl = document.getElementById('user-avatar');
  const avatarUrl = (settings.avatarUrl || '').trim();
  if (avatarUrl) {
    avatarEl.classList.remove('user-avatar--initial');
    avatarEl.innerHTML = `<img src="${avatarUrl}" alt="" class="user-avatar__img" referrerpolicy="no-referrer">`;
  } else {
    avatarEl.innerHTML = '';
    const avatarContent = getUserAvatarContent(settings);
    avatarEl.textContent = avatarContent;
    if (avatarContent.length === 1) avatarEl.classList.add('user-avatar--initial');
  }

  const household = getHousehold();
  const members = household.familyMembers?.length || 0;
  const statusText = members > 0
    ? `Domaćinstvo: ${members} članova`
    : 'Domaćinko prati tvoje domaćinstvo.';
  document.getElementById('household-status').textContent = statusText;

  renderQuickActions();
  refreshHomeDashboard();
  initPullToRefresh?.(() => {
    refreshHomeDashboard();
    return Promise.resolve();
  });
});

function initPwaInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (!banner) return;

  const DISMISS_KEY = 'domacinko_pwa_install_dismissed';
  if (localStorage.getItem(DISMISS_KEY) === 'true') return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    banner.classList.remove('hidden');
  });

  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } else {
      showToast('iOS: Safari → Podeli → Dodaj na početni ekran', 'info', 4000);
    }
    banner.classList.add('hidden');
    localStorage.setItem(DISMISS_KEY, 'true');
  });

  document.getElementById('pwa-install-dismiss')?.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem(DISMISS_KEY, 'true');
  });

  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches && !deferredPrompt) {
        banner.classList.remove('hidden');
      }
    }, 2500);
  }
}

function initFeedbackBanner() {
  const banner = document.getElementById('feedback-banner');
  if (!banner) return;

  const DISMISS_KEY = 'domacinko_feedback_banner_dismissed';
  if (localStorage.getItem(DISMISS_KEY) === 'true') return;

  banner.classList.remove('hidden');

  document.getElementById('feedback-banner-dismiss')?.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem(DISMISS_KEY, 'true');
  });
}