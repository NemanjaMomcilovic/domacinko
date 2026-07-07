/**
 * Domaćinko - Navigation
 */

const NAV_ITEMS = [
  { id: 'home', href: 'home.html', icon: '🏠', label: 'Početna' },
  { id: 'finances', href: 'finances.html', icon: '💰', label: 'Finansije' },
  { id: 'ai', href: 'ai.html', icon: '💬', label: 'AI' },
  { id: 'shopping', href: 'shopping.html', icon: '🛒', label: 'Kupovina' },
  { id: 'settings', href: 'settings.html', icon: '⚙️', label: 'Više' }
];

function renderBottomNav(activePage) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  nav.innerHTML = NAV_ITEMS.map(item => `
    <a href="${item.href}" class="nav-item${item.id === activePage ? ' active' : ''}" data-page="${item.id}" aria-label="${item.label}" aria-current="${item.id === activePage ? 'page' : 'false'}">
      <span class="nav-icon" aria-hidden="true">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </a>
  `).join('');
}

function renderPageHeader(title, showBack = false, backHref = 'home.html', rightAction = '') {
  const header = document.getElementById('page-header');
  if (!header) return;

  const spacer = '<span class="page-header__spacer" aria-hidden="true"></span>';
  header.innerHTML = `
    ${showBack ? `<a href="${backHref}" class="page-header__back" aria-label="Nazad na prethodnu stranicu">←</a>` : spacer}
    <h1 class="page-header__title">${title}</h1>
    ${rightAction || spacer}
  `;
}

function initNavigation(activePage, options = {}) {
  renderBottomNav(activePage);
  if (options.title) {
    renderPageHeader(options.title, options.showBack, options.backHref);
  }
}
