/**
 * Domaćinko - Shared UI helpers (skeletons, toasts, transitions, accessibility)
 */

const ERROR_MESSAGES = {
  network: 'Nema internet konekcije. Proverite mrežu i pokušajte ponovo.',
  auth: 'Prijava nije uspela. Proverite email i lozinku.',
  save: 'Čuvanje nije uspelo. Pokušajte ponovo.',
  load: 'Učitavanje podataka nije uspelo.',
  required: 'Popunite sva obavezna polja.',
  invalid: 'Uneti podaci nisu ispravni.',
  permission: 'Potrebna je dozvola u pregledaču.',
  generic: 'Nešto nije u redu. Pokušajte ponovo.'
};

/**
 * @param {string} code - Error code key
 * @param {string} [fallback] - Custom fallback message
 * @returns {string}
 */
function getErrorMessage(code, fallback) {
  return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES.generic;
}

/**
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type]
 * @param {number} [duration]
 */
function showToast(message, typeOrDuration = 'info', duration = 2500) {
  let type = 'info';
  let dur = duration;

  if (typeof typeOrDuration === 'number') {
    dur = typeOrDuration;
  } else if (['success', 'error', 'warning', 'info'].includes(typeOrDuration)) {
    type = typeOrDuration;
  }

  const icons = { success: '✓', error: '✕', warning: '⚠', info: '💡' };
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast__icon" aria-hidden="true">${icons[type]}</span><span>${message}</span>`;
  toast.classList.add('toast--visible');

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('toast--visible'), dur);
}

/**
 * @param {number} [count]
 * @param {'card'|'list'|'stat'} [variant]
 * @returns {string}
 */
function renderSkeleton(count = 3, variant = 'list') {
  const items = Array.from({ length: count }, () => {
    if (variant === 'stat') {
      return `<div class="skeleton skeleton--stat"></div>`;
    }
    if (variant === 'card') {
      return `<div class="skeleton skeleton--card"></div>`;
    }
    return `<div class="skeleton skeleton--row"><div class="skeleton skeleton--circle"></div><div class="skeleton skeleton--lines"><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line skeleton--line-short"></div></div></div>`;
  }).join('');
  return `<div class="skeleton-group" aria-busy="true" aria-label="Učitavanje...">${items}</div>`;
}

/**
 * @param {string} containerId
 * @param {number} [count]
 * @param {'card'|'list'|'stat'} [variant]
 */
function showSkeleton(containerId, count = 3, variant = 'list') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = renderSkeleton(count, variant);
}

function initPageTransition() {
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => {
    document.body.classList.add('page-enter--active');
  });
}

function initOfflineBanner() {
  if (document.getElementById('offline-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.className = 'offline-banner hidden';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = '<span aria-hidden="true">📡</span> Niste na mreži — podaci se čuvaju lokalno';
  document.body.prepend(banner);

  const update = () => {
    banner.classList.toggle('hidden', navigator.onLine);
    document.documentElement.classList.toggle('is-offline', !navigator.onLine);
  };

  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/**
 * @param {() => void|Promise<void>} onRefresh
 */
function initPullToRefresh(onRefresh) {
  const container = document.querySelector('.main-content') || document.querySelector('.app-container');
  if (!container || !onRefresh) return;

  let indicator = document.getElementById('pull-refresh');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'pull-refresh';
    indicator.className = 'pull-refresh';
    indicator.innerHTML = '<span class="pull-refresh__icon">↓</span><span class="pull-refresh__text">Povucite za osvežavanje</span>';
    container.prepend(indicator);
  }

  let startY = 0;
  let pulling = false;

  container.addEventListener('touchstart', e => {
    if (container.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    if (!pulling) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0 && diff < 120) {
      indicator.classList.add('pull-refresh--visible');
      indicator.style.setProperty('--pull-distance', `${Math.min(diff, 80)}px`);
      indicator.querySelector('.pull-refresh__icon').textContent = diff > 60 ? '↻' : '↓';
    }
  }, { passive: true });

  container.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    const dist = parseInt(indicator.style.getPropertyValue('--pull-distance') || '0', 10);
    indicator.classList.remove('pull-refresh--visible');
    indicator.style.removeProperty('--pull-distance');

    if (dist >= 60) {
      indicator.classList.add('pull-refresh--loading');
      indicator.classList.add('pull-refresh--visible');
      try {
        await onRefresh();
        showToast('Podaci osveženi!', 'success');
      } catch {
        showToast(getErrorMessage('load'), 'error');
      }
      indicator.classList.remove('pull-refresh--loading', 'pull-refresh--visible');
    }
  }, { passive: true });
}

function initAccessibility() {
  const settings = typeof getSettings === 'function' ? getSettings() : {};
  document.documentElement.toggleAttribute('data-large-text', !!settings.largeText);
  document.documentElement.toggleAttribute('data-high-contrast', !!settings.highContrast);
}

/**
 * @param {string} text - Tooltip text
 * @returns {string}
 */
function renderHelpTooltip(text) {
  return `<button type="button" class="help-tooltip" aria-label="Pomoć: ${text}" title="${text}">?</button>`;
}

/**
 * @param {string} containerId
 * @param {Array<{icon:string,label:string,value:string,link?:string}>} items
 */
function renderQuickStatsRow(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="quick-stats" role="list">
      ${items.map(item => `
        <${item.link ? 'a' : 'div'} ${item.link ? `href="${item.link}"` : ''} class="quick-stat" role="listitem">
          <span class="quick-stat__icon" aria-hidden="true">${item.icon}</span>
          <span class="quick-stat__value">${item.value}</span>
          <span class="quick-stat__label">${item.label}</span>
        </${item.link ? 'a' : 'div'}>
      `).join('')}
    </div>
  `;
}
