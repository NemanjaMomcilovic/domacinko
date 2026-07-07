document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth?.();
  initNavigation('settings', { title: 'Moj profil', showBack: true, backHref: 'settings.html' });

  const settings = getSettings();
  const profile = getCurrentProfile?.();

  document.getElementById('profile-first-name').value = settings.firstName || profile?.first_name || '';
  document.getElementById('profile-last-name').value = settings.lastName || profile?.last_name || '';
  document.getElementById('profile-income').value = settings.monthlyIncome || profile?.monthly_income || 0;
  document.getElementById('profile-savings').value = settings.currentSavings || profile?.current_savings || 0;
  document.getElementById('profile-budget').value = settings.monthlyBudget || 80000;

  const displayName = (typeof getAuthDisplayName === 'function' ? getAuthDisplayName() : settings.userName) || 'Korisnik';
  document.getElementById('profile-display-name').textContent = displayName;
  document.getElementById('profile-email').textContent = getCurrentUser?.()?.email || profile?.email || '';

  const avatar = document.getElementById('profile-avatar');
  const initial = getUserAvatarContent(settings);
  avatar.textContent = initial;

  document.getElementById('profile-form').addEventListener('submit', e => {
    e.preventDefault();
    const firstName = document.getElementById('profile-first-name').value.trim();
    const lastName = document.getElementById('profile-last-name').value.trim();
    saveSettings({
      firstName,
      lastName,
      userName: [firstName, lastName].filter(Boolean).join(' '),
      monthlyIncome: parseFloat(document.getElementById('profile-income').value) || 0,
      currentSavings: parseFloat(document.getElementById('profile-savings').value) || 0,
      monthlyBudget: parseFloat(document.getElementById('profile-budget').value) || 80000
    });
    showToast('Profil sačuvan!', 'success');
    document.getElementById('profile-display-name').textContent = [firstName, lastName].filter(Boolean).join(' ') || 'Korisnik';
    avatar.textContent = getUserAvatarContent(getSettings());
  });

  document.getElementById('delete-account-btn').addEventListener('click', async () => {
    const confirmed = confirm('Da li ste sigurni? Svi lokalni podaci će biti obrisani i bićete odjavljeni.');
    if (!confirmed) return;

    const typed = prompt('Unesite "OBRIŠI" za potvrdu brisanja naloga:');
    if (typed !== 'OBRIŠI') {
      showToast('Brisanje otkazano.', 'warning');
      return;
    }

    resetAllData();
    resetOnboarding();
    if (typeof signOut === 'function') await signOut();
    if (typeof clearGuestMode === 'function') clearGuestMode();
    showToast('Nalog i podaci obrisani.', 'success');
    setTimeout(() => { window.location.href = 'auth.html'; }, 800);
  });
});
