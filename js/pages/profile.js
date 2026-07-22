function renderProfileAvatar(settings) {
  const avatar = document.getElementById('profile-avatar');
  if (!avatar) return;

  const url = (settings?.avatarUrl || '').trim();
  if (url) {
    avatar.classList.remove('user-avatar--initial');
    avatar.innerHTML = `<img src="${url}" alt="" class="user-avatar__img" referrerpolicy="no-referrer">`;
    return;
  }

  avatar.innerHTML = '';
  avatar.textContent = getUserAvatarContent(settings);
  avatar.classList.add('user-avatar--initial');
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth?.();
  if (typeof applyAuthProfileToSettings === 'function' && isLoggedIn?.() && getCurrentUser?.()) {
    applyAuthProfileToSettings(getCurrentUser());
  }

  initNavigation('settings', { title: 'Moj profil', showBack: true, backHref: 'settings.html' });

  const settings = getSettings();
  const profile = getCurrentProfile?.();
  const user = getCurrentUser?.();

  document.getElementById('profile-first-name').value = settings.firstName || profile?.first_name || '';
  document.getElementById('profile-last-name').value = settings.lastName || profile?.last_name || '';
  document.getElementById('profile-income').value = settings.monthlyIncome || profile?.monthly_income || 0;
  document.getElementById('profile-savings').value = settings.currentSavings || profile?.current_savings || 0;
  document.getElementById('profile-budget').value = settings.monthlyBudget || 80000;

  const displayName = (typeof getAuthDisplayName === 'function' ? getAuthDisplayName() : settings.userName) || 'Korisnik';
  document.getElementById('profile-display-name').textContent = displayName;
  document.getElementById('profile-email').textContent =
    user?.email || settings.contactEmail || profile?.email || '';

  renderProfileAvatar(settings);

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
    renderProfileAvatar(getSettings());

    if (isLoggedIn?.()) {
      saveProfile?.({
        first_name: firstName,
        last_name: lastName,
        monthly_income: parseFloat(document.getElementById('profile-income').value) || 0,
        current_savings: parseFloat(document.getElementById('profile-savings').value) || 0,
        monthly_budget: parseFloat(document.getElementById('profile-budget').value) || 80000
      }).catch((err) => console.warn('Sinhronizacija profila:', err.message));
    }
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
