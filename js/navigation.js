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
    <a href="${item.href}" class="nav-item${item.id === activePage ? ' active' : ''}" data-page="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </a>
  `).join('');
}

function renderPageHeader(title, showBack = false, backHref = 'home.html') {
  const header = document.getElementById('page-header');
  if (!header) return;

  header.innerHTML = `
    ${showBack ? `<a href="${backHref}" class="page-header__back" aria-label="Nazad">←</a>` : '<span style="width:36px"></span>'}
    <h1 class="page-header__title">${title}</h1>
    <span style="width:36px"></span>
  `;
}

function initNavigation(activePage, options = {}) {
  renderBottomNav(activePage);
  if (options.title) {
    renderPageHeader(options.title, options.showBack, options.backHref);
  }
}
