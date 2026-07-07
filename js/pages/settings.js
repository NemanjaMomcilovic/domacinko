document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Podešavanja' });

  const settings = getSettings();

  document.getElementById('user-name').value = settings.userName || '';
  document.getElementById('currency').value = settings.currency || 'RSD';
  document.getElementById('monthly-budget').value = settings.monthlyBudget || 80000;
  document.getElementById('savings-goal').value = settings.savingsGoal || 10000;

  document.getElementById('settings-form').addEventListener('submit', e => {
    e.preventDefault();
    saveSettings({
      userName: document.getElementById('user-name').value.trim(),
      currency: document.getElementById('currency').value,
      monthlyBudget: parseFloat(document.getElementById('monthly-budget').value) || 80000,
      savingsGoal: parseFloat(document.getElementById('savings-goal').value) || 10000
    });
    showToast('Podešavanja sačuvana!');
  });

  document.getElementById('reset-data').addEventListener('click', () => {
    if (confirm('Da li ste sigurni? Svi podaci će biti obrisani i vraćeni na početne vrednosti.')) {
      resetAllData();
      showToast('Podaci su resetovani.');
      setTimeout(() => location.reload(), 1000);
    }
  });

  document.getElementById('clear-chat').addEventListener('click', () => {
    clearChatHistory();
    showToast('Istorija chata obrisana.');
  });
});
