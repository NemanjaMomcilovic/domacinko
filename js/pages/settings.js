function renderLocalProfiles() {
  const container = document.getElementById('local-profiles-list');
  if (!container || typeof listLocalProfiles !== 'function') return;

  const profiles = listLocalProfiles();
  const activeId = getActiveProfileId();

  container.innerHTML = profiles.map(p => `
    <div class="list-item local-profile-item" style="padding:var(--space-sm) 0">
      <div class="list-item__icon">${p.id === activeId ? '✓' : '👤'}</div>
      <div class="list-item__content">
        <div class="list-item__title">${p.name}${p.id === activeId ? ' <span class="badge badge--success">Aktivan</span>' : ''}</div>
        <div class="list-item__subtitle">${p.id === 'default' ? 'Glavni profil uređaja' : 'Lokalni profil'}</div>
      </div>
      <div style="display:flex;gap:var(--space-xs)">
        ${p.id !== activeId ? `<button type="button" class="btn btn--secondary btn--sm switch-profile" data-id="${p.id}" aria-label="Prebaci na ${p.name}">Prebaci</button>` : ''}
        ${p.id !== 'default' ? `<button type="button" class="btn btn--ghost btn--sm delete-profile" data-id="${p.id}" aria-label="Obriši profil ${p.name}">✕</button>` : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.switch-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      if (switchLocalProfile(btn.dataset.id)) {
        showToast('Profil prebačen. Osvežavam...', 'success');
        setTimeout(() => location.reload(), 600);
      }
    });
  });

  container.querySelectorAll('.delete-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      const profile = profiles.find(p => p.id === btn.dataset.id);
      if (!confirm(`Obrisati profil „${profile?.name}" i sve njegove podatke?`)) return;
      if (deleteLocalProfile(btn.dataset.id)) {
        showToast('Profil obrisan.');
        renderLocalProfiles();
      }
    });
  });
}

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

function renderCategoryBudgetSettings() {
  const container = document.getElementById('category-budgets-settings');
  if (!container) return;

  const budgets = getCategoryBudgets();
  container.innerHTML = CATEGORIES.map(cat => `
    <div class="settings-item">
      <label class="settings-item__label" for="cat-budget-${cat.id}">${cat.icon} ${cat.label}</label>
      <input type="number" class="form-input cat-budget-input" id="cat-budget-${cat.id}"
        data-cat="${cat.id}" min="0" step="500" value="${budgets[cat.id] || ''}"
        placeholder="0" style="width:100px;text-align:right;border:none;padding:0">
    </div>
  `).join('');
}

function saveCategoryBudgetsFromForm() {
  const budgets = {};
  document.querySelectorAll('.cat-budget-input').forEach(input => {
    const val = parseFloat(input.value);
    if (val > 0) budgets[input.dataset.cat] = val;
  });
  saveCategoryBudgets(budgets);
}

function isConfigJsSupabase() {
  const source = typeof getSupabaseConfigSource === 'function' ? getSupabaseConfigSource() : 'none';
  const configured = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();
  return source === 'config.js' && configured;
}

function renderDeveloperSection() {
  const section = document.getElementById('developer-settings');
  if (!section) return;

  if (isConfigJsSupabase()) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  renderSupabaseConfigSection();
}

function renderSupabaseConfigSection() {
  const group = document.getElementById('supabase-config-group');
  const statusEl = document.getElementById('supabase-config-status');
  const urlEl = document.getElementById('supabase-url');
  const keyEl = document.getElementById('supabase-anon-key');

  if (isConfigJsSupabase()) {
    group?.classList.add('hidden');
    return;
  }

  group?.classList.remove('hidden');
  if (!statusEl || !urlEl || !keyEl) return;

  const source = typeof getSupabaseConfigSource === 'function' ? getSupabaseConfigSource() : 'none';
  const cfg = typeof getDomacinkoConfig === 'function' ? getDomacinkoConfig() : {};

  if (source === 'localStorage') {
    statusEl.textContent = 'Lokalno sačuvani ključevi.';
    urlEl.value = cfg.SUPABASE_URL || '';
    keyEl.value = cfg.SUPABASE_ANON_KEY || '';
  } else if (source === 'config.js-invalid') {
    statusEl.textContent = 'Neispravna konfiguracija — unesite ključeve ispod.';
    urlEl.value = cfg.SUPABASE_URL || '';
    keyEl.value = cfg.SUPABASE_ANON_KEY || '';
  } else {
    statusEl.textContent = 'Sinhronizacija nije podešena.';
    urlEl.value = '';
    keyEl.value = '';
  }

  urlEl.readOnly = false;
  keyEl.readOnly = false;
  document.getElementById('save-supabase-config')?.classList.remove('hidden');
  document.getElementById('clear-supabase-config')?.classList.remove('hidden');
  document.getElementById('test-supabase-config')?.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth?.();
  if (typeof initHouseholdSync === 'function' && isLoggedIn?.()) {
    await initHouseholdSync().catch(() => {});
  }
  initNavigation('settings', { title: 'Više' });

  const settings = getSettings();

  document.getElementById('currency').value = settings.currency || 'RSD';
  document.getElementById('api-key').value = settings.apiKey || '';
  document.getElementById('contact-email').value = settings.contactEmail || '';

  renderAccountSection();
  renderHouseholdSection();
  renderDeveloperSection();
  renderLocalProfiles();

  document.getElementById('add-local-profile')?.addEventListener('click', () => {
    const name = document.getElementById('new-profile-name')?.value.trim();
    if (!name) {
      showToast('Unesite ime profila.');
      return;
    }
    const created = addLocalProfile(name);
    if (!created) {
      showToast('Profil sa tim imenom već postoji.');
      return;
    }
    document.getElementById('new-profile-name').value = '';
    showToast(`Profil „${name}" dodat!`);
    renderLocalProfiles();
  });

  document.getElementById('save-supabase-config')?.addEventListener('click', () => {
    const url = document.getElementById('supabase-url').value.trim();
    const key = document.getElementById('supabase-anon-key').value.trim();
    if (typeof saveSupabaseConfig !== 'function') return;
    try {
      saveSupabaseConfig(url, key);
      showToast('Supabase ključevi sačuvani! Možete se prijaviti.');
      renderDeveloperSection();
      renderAccountSection();
    } catch (err) {
      showToast(err.message || 'Čuvanje nije uspelo.', 'error');
    }
  });

  document.getElementById('test-supabase-config')?.addEventListener('click', async () => {
    const url = document.getElementById('supabase-url').value.trim();
    const key = document.getElementById('supabase-anon-key').value.trim();
    const btn = document.getElementById('test-supabase-config');
    if (typeof testSupabaseConnection !== 'function') {
      showToast('Test veze nije dostupan.');
      return;
    }
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Testiram...';
    try {
      const result = await testSupabaseConnection(url, key);
      showToast(result.message, result.ok ? 'success' : 'error');
      if (result.ok && url && key && typeof saveSupabaseConfig === 'function') {
        try {
          saveSupabaseConfig(url, key);
          renderDeveloperSection();
          renderAccountSection();
        } catch { /* već testirano */ }
      }
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  document.getElementById('clear-supabase-config')?.addEventListener('click', () => {
    if (!confirm('Obrisati sačuvane Supabase ključeve sa ovog uređaja?')) return;
    if (typeof clearSupabaseConfig === 'function') {
      clearSupabaseConfig();
      showToast('Ključevi obrisani.');
      renderDeveloperSection();
      renderAccountSection();
    }
  });

  const themeToggle = document.getElementById('dark-theme-toggle');
  if (settings.darkTheme) themeToggle.classList.add('toggle--on');

  themeToggle.addEventListener('click', () => {
    const dark = toggleTheme();
    themeToggle.classList.toggle('toggle--on', dark);
    saveSettings({ darkTheme: dark });
  });

  const largeTextToggle = document.getElementById('large-text-toggle');
  if (settings.largeText) largeTextToggle?.classList.add('toggle--on');
  largeTextToggle?.addEventListener('click', () => {
    const on = !largeTextToggle.classList.contains('toggle--on');
    largeTextToggle.classList.toggle('toggle--on', on);
    saveSettings({ largeText: on });
    initAccessibility?.();
    showToast(on ? 'Veći tekst uključen.' : 'Veći tekst isključen.', 'info');
  });

  const contrastToggle = document.getElementById('high-contrast-toggle');
  if (settings.highContrast) contrastToggle?.classList.add('toggle--on');
  contrastToggle?.addEventListener('click', () => {
    const on = !contrastToggle.classList.contains('toggle--on');
    contrastToggle.classList.toggle('toggle--on', on);
    saveSettings({ highContrast: on });
    initAccessibility?.();
    showToast(on ? 'Visok kontrast uključen.' : 'Visok kontrast isključen.', 'info');
  });

  const showAllToggle = document.getElementById('show-all-modules-toggle');
  if (showAllToggle) {
    if (!isBetaMode()) showAllToggle.classList.add('toggle--on');
    showAllToggle.addEventListener('click', () => {
      const showAll = !showAllToggle.classList.contains('toggle--on');
      showAllToggle.classList.toggle('toggle--on', showAll);
      saveSettings({ betaMode: !showAll });
      showToast(
        showAll ? 'Puni prikaz uključen — osvežavam...' : 'Beta režim uključen — osvežavam...',
        'info'
      );
      setTimeout(() => location.reload(), 600);
    });
  }

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
  renderCategoryBudgetSettings();

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
    const payload = {
      currency: document.getElementById('currency').value
    };
    const apiKeyEl = document.getElementById('api-key');
    const contactEmailEl = document.getElementById('contact-email');
    if (apiKeyEl) payload.apiKey = apiKeyEl.value.trim();
    if (contactEmailEl) payload.contactEmail = contactEmailEl.value.trim();
    saveSettings(payload);
    saveCategoryBudgetsFromForm();
    showToast('Podešavanja sačuvana!');
  });

  document.getElementById('replay-onboarding').addEventListener('click', () => {
    resetOnboarding();
    window.location.href = 'onboarding.html';
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
        const result = importAllData(reader.result);
        showToast(`Podaci uvezeni (v${result.version})! Osvežavam...`, 'success');
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

function renderHouseholdSection() {
  const subtitle = document.getElementById('household-subtitle');
  if (!subtitle) return;

  if (isInHousehold?.()) {
    const household = getCurrentHousehold?.();
    const name = household?.name || 'Porodično domaćinstvo';
    subtitle.textContent = `${name} — delite troškove, kupovinu i podatke sa članovima.`;
    return;
  }

  if (isLoggedIn?.() && isConfigJsSupabase()) {
    subtitle.textContent = 'Kreirajte domaćinstvo ili se pridružite pozivnim kodom — podaci se sinhronizuju.';
    return;
  }

  subtitle.textContent = 'Podelite troškove i kupovinu sa porodicom — pozivni kodovi i sinhronizacija.';
}

function renderAccountSection() {
  const nameEl = document.getElementById('account-name');
  const emailEl = document.getElementById('account-email');
  const modeEl = document.getElementById('account-mode');
  const syncBadge = document.getElementById('account-sync-badge');
  const avatarEl = document.getElementById('account-avatar');
  const logoutBtn = document.getElementById('logout-btn');
  const loginLink = document.getElementById('login-link');
  const configured = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();
  const settings = getSettings();

  if (avatarEl && typeof getUserAvatarContent === 'function') {
    const avatarContent = getUserAvatarContent(settings);
    avatarEl.textContent = avatarContent;
    avatarEl.classList.toggle('user-avatar--initial', avatarContent.length === 1);
  }

  const showSyncBadge = isConfigJsSupabase() && isLoggedIn?.() && !isGuestMode?.();
  syncBadge?.classList.toggle('hidden', !showSyncBadge);

  if (isGuestMode?.()) {
    nameEl.textContent = settings.userName || 'Gost';
    emailEl.textContent = '';
    modeEl.textContent = 'Gost režim — podaci samo na ovom uređaju';
    logoutBtn.classList.add('hidden');
    loginLink.classList.remove('hidden');
    return;
  }

  if (isLoggedIn?.()) {
    const user = getCurrentUser();
    const profile = getCurrentProfile();
    nameEl.textContent = getAuthDisplayName();
    emailEl.textContent = user?.email || profile?.email || '';
    modeEl.textContent = isInHousehold?.() ? 'Porodično domaćinstvo' : '';
    logoutBtn.classList.remove('hidden');
    loginLink.classList.add('hidden');

    logoutBtn.onclick = async () => {
      if (!confirm('Da li ste sigurni da želite da se odjavite?')) return;
      await signOut();
      clearGuestMode();
      window.location.href = 'auth.html';
    };
    return;
  }

  nameEl.textContent = 'Niste prijavljeni';
  emailEl.textContent = '';
  modeEl.textContent = configured
    ? 'Prijavite se za sinhronizaciju između uređaja'
    : 'Prijavite se ili koristite gost režim';
  logoutBtn.classList.add('hidden');
  loginLink.classList.remove('hidden');
}
