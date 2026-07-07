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
  registerServiceWorker();
  if (typeof checkAndSendNotifications === 'function') {
    setTimeout(() => checkAndSendNotifications(), 2000);
  }
}

function initTheme() {
  const settings = getSettings();
  const theme = settings.darkTheme ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const settings = getSettings();
  const dark = !settings.darkTheme;
  saveSettings({ darkTheme: dark });
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  return dark;
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const base = getAssetBase();
  navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
}

function renderScoreRing(score, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = 'var(--color-primary)';
  if (score < 40) color = 'var(--color-danger)';
  else if (score < 70) color = 'var(--color-warning)';

  container.innerHTML = `
    <div class="score-ring">
      <svg class="score-ring__svg" width="100" height="100" viewBox="0 0 100 100">
        <circle class="score-ring__bg" cx="50" cy="50" r="${radius}" />
        <circle class="score-ring__fill" cx="50" cy="50" r="${radius}"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}" />
      </svg>
      <span class="score-ring__value">${score}</span>
    </div>
  `;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
}

function showToast(message, duration = 2500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('toast--visible');
  setTimeout(() => { toast.classList.remove('toast--visible'); }, duration);
}

function populateCategorySelect(selectId, includeAll = false) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const options = includeAll ? [{ id: '', label: 'Sve kategorije', icon: '📋' }] : [];
  select.innerHTML = [...options, ...CATEGORIES].map(c =>
    `<option value="${c.id}">${c.icon} ${c.label}</option>`
  ).join('');
}

function renderEmptyState(icon, title, subtitle) {
  return `
    <div class="empty-state animate-fade-in">
      <div class="empty-state__icon">${icon}</div>
      <p class="empty-state__title">${title}</p>
      ${subtitle ? `<p class="empty-state__subtitle">${subtitle}</p>` : ''}
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
