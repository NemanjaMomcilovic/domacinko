document.addEventListener('DOMContentLoaded', () => {
  const beta = typeof isBetaMode === 'function' && isBetaMode();
  initNavigation('settings', {
    title: beta ? 'Alati za dom' : 'Svi moduli',
    showBack: true,
    backHref: 'settings.html'
  });
  renderModulesHub('modules-hub');
});
