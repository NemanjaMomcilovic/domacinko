function renderRecurringList() {
  const list = getRecurringExpenses();
  const container = document.getElementById('recurring-list');

  if (list.length === 0) {
    container.innerHTML = renderEmptyState('📄', 'Nema mesečnih računa', 'Dodajte struju, internet ili druge redovne troškove ispod.');
    return;
  }

  container.innerHTML = list.map(r => `
    <div class="list-item" style="padding:var(--space-sm) 0">
      <div class="list-item__icon">${getCategoryIcon(r.category)}</div>
      <div class="list-item__content">
        <div class="list-item__title">${r.name}</div>
        <div class="list-item__subtitle">${formatCurrency(r.amount)} · ${r.dayOfMonth}. u mesecu</div>
      </div>
      <button class="btn btn--ghost btn--sm delete-rec" data-id="${r.id}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.delete-rec').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteRecurringExpense(btn.dataset.id);
      renderRecurringList();
      showToast('Račun uklonjen.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Podešavanja' });

  const settings = getSettings();

  document.getElementById('user-name').value = settings.userName || '';
  document.getElementById('currency').value = settings.currency || 'RSD';
  document.getElementById('monthly-budget').value = settings.monthlyBudget || 80000;
  document.getElementById('savings-goal').value = settings.savingsGoal || 10000;
  document.getElementById('api-key').value = settings.apiKey || '';

  const themeToggle = document.getElementById('dark-theme-toggle');
  if (settings.darkTheme) themeToggle.classList.add('toggle--on');

  themeToggle.addEventListener('click', () => {
    const dark = toggleTheme();
    themeToggle.classList.toggle('toggle--on', dark);
  });

  const notifToggle = document.getElementById('notifications-toggle');
  if (settings.notificationsEnabled) notifToggle.classList.add('toggle--on');

  notifToggle.addEventListener('click', async () => {
    const isOn = notifToggle.classList.contains('toggle--on');
    if (isOn) {
      disableNotifications();
      notifToggle.classList.remove('toggle--on');
      showToast('Obaveštenja isključena.');
    } else {
      const ok = await enableNotifications();
      notifToggle.classList.toggle('toggle--on', ok);
      if (ok) {
        showToast('Obaveštenja uključena!');
      } else {
        showToast('Dozvolite obaveštenja u pregledaču.');
      }
    }
  });

  populateCategorySelect('rec-category');
  renderRecurringList();

  document.getElementById('add-recurring').addEventListener('click', () => {
    const name = document.getElementById('rec-name').value.trim();
    const amount = document.getElementById('rec-amount').value;
    const category = document.getElementById('rec-category').value;
    const dayOfMonth = document.getElementById('rec-day').value;

    if (!name || !amount) {
      showToast('Unesite naziv i iznos.');
      return;
    }

    addRecurringExpense({ name, amount, category, dayOfMonth });
    document.getElementById('rec-name').value = '';
    document.getElementById('rec-amount').value = '';
    renderRecurringList();
    showToast('Mesečni račun dodat!');
  });

  document.getElementById('settings-form').addEventListener('submit', e => {
    e.preventDefault();
    saveSettings({
      userName: document.getElementById('user-name').value.trim(),
      currency: document.getElementById('currency').value,
      monthlyBudget: parseFloat(document.getElementById('monthly-budget').value) || 80000,
      savingsGoal: parseFloat(document.getElementById('savings-goal').value) || 10000,
      apiKey: document.getElementById('api-key').value.trim()
    });
    showToast('Podešavanja sačuvana!');
  });

  document.getElementById('replay-onboarding').addEventListener('click', () => {
    resetOnboarding();
    window.location.href = 'onboarding.html';
  });

  document.getElementById('send-feedback').addEventListener('click', () => {
    const text = document.getElementById('feedback-text').value.trim();
    if (!text) {
      showToast('Unesite predlog pre slanja.');
      return;
    }
    addFeedback(text);
    const payload = `Domaćinko predlog (${new Date().toLocaleDateString('sr-RS')}):\n\n${text}`;
    navigator.clipboard.writeText(payload).then(() => {
      showToast('Predlog sačuvan i kopiran u clipboard!');
    }).catch(() => {
      showToast('Predlog sačuvan lokalno!');
    });
    document.getElementById('feedback-text').value = '';
  });

  document.getElementById('export-data').addEventListener('click', () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domacinko-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Podaci izvezeni!');
  });

  document.getElementById('import-data').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(reader.result);
        showToast('Podaci uvezeni! Osvežavam...');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        showToast('Greška pri uvozu: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('reset-data').addEventListener('click', () => {
    if (confirm('Da li ste sigurni? Svi podaci će biti obrisani i vraćeni na početne vrednosti.')) {
      resetAllData();
      resetOnboarding();
      showToast('Podaci su resetovani.');
      setTimeout(() => location.reload(), 1000);
    }
  });

  document.getElementById('clear-chat').addEventListener('click', () => {
    clearChatHistory();
    showToast('Istorija chata obrisana.');
  });
});
