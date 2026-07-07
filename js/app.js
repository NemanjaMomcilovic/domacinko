/**
 * Domaćinko - Shared utilities
 */

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Dobro jutro';
  if (hour < 18) return 'Dobar dan';
  return 'Dobro veče';
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
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: var(--color-text); color: white; padding: 12px 24px;
      border-radius: 24px; font-size: 14px; z-index: 200;
      opacity: 0; transition: opacity 0.3s; pointer-events: none;
      max-width: 90%; text-align: center;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

function populateCategorySelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = CATEGORIES.map(c =>
    `<option value="${c.id}">${c.icon} ${c.label}</option>`
  ).join('');
}
