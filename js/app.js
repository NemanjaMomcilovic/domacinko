/**
 * Domaćinko - Shared utilities
 */

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Dobro jutro';
  if (hour < 18) return 'Dobar dan';
  return 'Dobro veče';
}

function getAssetBase() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '..' : '.';
}

function initApp() {
  initTheme();
  initThemeSync();
  bindThemeSwitches();
  initAccessibility?.();
  initPageTransition?.();
  initOfflineBanner?.();
  loadHelpTooltipsScript();
  registerServiceWorker();
  initAuthGuard();
  if (typeof checkAndSendNotifications === 'function') {
    setTimeout(() => checkAndSendNotifications(), 2000);
  }
}

function loadHelpTooltipsScript() {
  if (document.querySelector('script[src*="help-tooltips"]')) return;
  const base = getAssetBase();
  const script = document.createElement('script');
  script.src = `${base}/js/help-tooltips.js`;
  script.defer = true;
  document.body.appendChild(script);
}

function loadScriptIfNeeded(filename) {
  const base = getAssetBase();
  const src = `${base}/js/${filename}`;
  if (document.querySelector(`script[src*="${filename}"]`)) return Promise.resolve();
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = resolve;
    document.body.appendChild(script);
  });
}

async function initAuthGuard() {
  if (typeof waitForAuth !== 'function') return;

  const path = window.location.pathname;
  const file = path.split('/').pop() || '';
  const exempt = ['auth.html', 'onboarding.html', 'landing.html', 'splash.html', 'presents.html'];
  if (exempt.includes(file)) return;
  if (path.endsWith('/') && !path.includes('/pages/')) return;

  if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
    await loadScriptIfNeeded('household-sync.js');
  }

  await waitForAuth();

  const inPages = path.includes('/pages/');
  const authUrl = inPages ? 'auth.html' : 'pages/auth.html';
  const onboardingUrl = inPages ? 'onboarding.html' : 'pages/onboarding.html';

  if (!isGuestMode() && !isLoggedIn()) {
    const allowSettings = file === 'settings.html'
      && typeof isSupabaseConfigured === 'function'
      && !isSupabaseConfigured();
    if (!allowSettings) {
      window.location.href = authUrl;
      return;
    }
  }

  if (needsOnboarding() && file !== 'onboarding.html') {
    const allowSettings = file === 'settings.html'
      && typeof isSupabaseConfigured === 'function'
      && !isSupabaseConfigured();
    if (!allowSettings) {
      window.location.href = onboardingUrl;
    }
  }
}

function initTheme() {
  const settings = getSettings();
  const dark = !!settings.darkTheme;
  applyTheme(dark, { animate: false });
}

function applyTheme(dark, { animate = false } = {}) {
  const root = document.documentElement;
  if (animate) {
    root.setAttribute('data-theme-transition', '');
    setTimeout(() => root.removeAttribute('data-theme-transition'), 400);
  }
  root.setAttribute('data-theme', dark ? 'dark' : 'light');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#0e1712' : '#2f8a5c');

  const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (statusBar) statusBar.setAttribute('content', dark ? 'black-translucent' : 'default');

  syncThemeSwitchUI(dark);
}

function syncThemeSwitchUI(dark) {
  document.querySelectorAll('.theme-switch').forEach(btn => {
    btn.classList.toggle('theme-switch--dark', dark);
    btn.setAttribute('aria-checked', dark ? 'true' : 'false');
    const label = btn.querySelector('.theme-switch__label');
    if (label) label.textContent = dark ? 'Tamna tema' : 'Svetla tema';
  });

  document.querySelectorAll('#dark-theme-toggle, [data-theme-toggle]').forEach(el => {
    if (el.classList.contains('toggle')) {
      el.classList.toggle('toggle--on', dark);
    }
    el.setAttribute('aria-checked', dark ? 'true' : 'false');
    const aria = el.getAttribute('aria-label');
    if (aria && (aria.includes('tema') || aria.includes('Tema'))) {
      el.setAttribute('aria-label', dark ? 'Tamna tema' : 'Svetla tema');
    }
  });

  document.querySelectorAll('[data-theme-hint]').forEach(el => {
    el.textContent = dark ? 'Tamna tema' : 'Svetla tema';
  });
}

function toggleTheme() {
  const settings = getSettings();
  const dark = !settings.darkTheme;
  saveSettings({ darkTheme: dark });
  applyTheme(dark, { animate: true });
  try {
    localStorage.setItem('domacinko_theme_ping', String(Date.now()));
  } catch { /* ignore */ }
  return dark;
}

function bindThemeSwitches(root = document) {
  root.querySelectorAll('.theme-switch, #dark-theme-toggle, [data-theme-toggle]').forEach(btn => {
    if (btn.dataset.themeBound === '1') return;
    btn.dataset.themeBound = '1';
    btn.addEventListener('click', e => {
      e.preventDefault();
      toggleTheme();
    });
  });
  syncThemeSwitchUI(!!getSettings().darkTheme);
}

function initThemeSync() {
  window.addEventListener('storage', e => {
    if (!e.key) return;
    const isData = e.key === 'domacinko_data' || e.key.startsWith('domacinko_data_');
    const isPing = e.key === 'domacinko_theme_ping';
    if (!isData && !isPing) return;
    const dark = !!getSettings().darkTheme;
    applyTheme(dark, { animate: true });
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const base = getAssetBase();
  navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
}

function renderScoreRing(score, containerId) {
  renderHealthScore(score, containerId);
}

function renderHealthScore(score, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const activeSegments = Math.ceil(score / 10);
  const segments = Array.from({ length: 10 }, (_, i) =>
    `<div class="health-bar__segment${i < activeSegments ? ' health-bar__segment--active' : ''}"></div>`
  ).join('');

  const statusLabel = getHealthStatusLabel(score);
  const title = getHealthTitle(score);

  container.innerHTML = `
    <div class="health-score">
      <p class="health-score__status-label">🏡 Stanje domaćinstva: <strong>${statusLabel}</strong></p>
      <div class="health-score__value">${score} <span>/ 100</span></div>
      <div class="health-score__title">${title}</div>
      <div class="health-bar">${segments}</div>
    </div>
  `;
}

function renderHealthFeedback(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const bullets = getFinancialHealthFeedback();
  if (bullets.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = bullets.map(b => {
    const icon = b.type === 'good' ? '✔' : b.type === 'warn' ? '⚠' : '💡';
    const cls = b.type === 'good' ? 'health-feedback__item--good'
      : b.type === 'warn' ? 'health-feedback__item--warn' : 'health-feedback__item--tip';
    return `<p class="health-feedback__item ${cls}">${icon} ${b.text}</p>`;
  }).join('');
}

function getUserAvatarContent(settings) {
  const name = (settings?.userName || settings?.firstName || '').trim();
  if (name) return name.charAt(0).toUpperCase();
  return '🏡';
}

function renderSavingsGoalCard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const savings = getSavingsProgress();
  if (savings.goal <= 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <p class="card__title">🎯 Cilj: ${savings.goalName}</p>
    ${renderProgressBar(savings.pct, `${formatCurrency(savings.saved)} / ${formatCurrency(savings.goal)}`)}
    <p class="savings-goal__line">Ušteđeno: <strong>${formatCurrency(savings.saved)}</strong></p>
    <p class="savings-goal__line">Još: <strong>${formatCurrency(savings.remaining)}</strong> do ${savings.goalName}</p>
  `;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
}

function populateCategorySelect(selectId, includeAll = false) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const options = includeAll ? [{ id: '', label: 'Sve kategorije', icon: '📋' }] : [];
  select.innerHTML = [...options, ...CATEGORIES].map(c =>
    `<option value="${c.id}">${c.icon} ${c.label}</option>`
  ).join('');
}

function renderEmptyState(icon, title, subtitle, cta) {
  const ctaHtml = cta
    ? `<a href="${cta.href}" class="btn btn--primary btn--sm empty-state__cta">${cta.label}</a>`
    : '';
  return `
    <div class="empty-state animate-fade-in">
      <div class="empty-state__icon">${icon}</div>
      <p class="empty-state__title">${title}</p>
      ${subtitle ? `<p class="empty-state__subtitle">${subtitle}</p>` : ''}
      ${ctaHtml}
    </div>
  `;
}

function renderProgressBar(pct, label, options = {}) {
  const fillClass = pct >= 100 ? 'progress-bar__fill--danger'
    : pct >= 80 ? 'progress-bar__fill--warning' : '';
  return `
    <div class="progress-bar">
      ${label ? `<div class="progress-bar__header"><span>${label}</span><span>${pct}%</span></div>` : ''}
      <div class="progress-bar__track">
        <div class="progress-bar__fill ${fillClass}" style="width:${Math.min(100, pct)}%"></div>
      </div>
    </div>
  `;
}

function renderCategoryBudgetBar(status) {
  const label = `${status.icon} ${status.label}: ${formatCurrency(status.spent)} / ${formatCurrency(status.budget)}`;
  return renderProgressBar(status.pct, label);
}

document.addEventListener('DOMContentLoaded', initApp);
