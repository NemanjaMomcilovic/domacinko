function renderMembers(members) {
  const container = document.getElementById('members-list');
  if (!container) return;

  if (!members.length) {
    container.innerHTML = renderEmptyState('👤', 'Nema članova', '');
    return;
  }

  const currentUserId = getCurrentUser()?.id;
  container.innerHTML = members.map(m => `
    <div class="list-item" style="padding:var(--space-sm) 0">
      <div class="list-item__icon">${m.role === 'owner' ? '👑' : '👤'}</div>
      <div class="list-item__content">
        <div class="list-item__title">${m.name}${m.user_id === currentUserId ? ' <span class="badge badge--success">Vi</span>' : ''}</div>
        <div class="list-item__subtitle">${m.role === 'owner' ? 'Vlasnik' : 'Član'}${m.email ? ' · ' + m.email : ''}</div>
      </div>
    </div>
  `).join('');
}

function showHouseholdView(view) {
  ['household-loading', 'household-guest', 'household-none', 'household-active'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hidden', id !== view);
  });
}

function renderActiveHousehold(household) {
  document.getElementById('household-name').textContent = household.name || 'Domaćinstvo';
  document.getElementById('household-role').textContent = household.role === 'owner' ? 'Vi ste vlasnik' : 'Vi ste član';
  document.getElementById('invite-code-display').textContent = household.invite_code || '------';

  const inviteCard = document.getElementById('invite-card');
  if (inviteCard) {
    inviteCard.classList.toggle('hidden', household.role !== 'owner');
  }

  renderMembers(getHouseholdMembers());
  showHouseholdView('household-active');
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth?.();
  initNavigation(null, { title: 'Porodica', showBack: true, backHref: 'settings.html' });

  if (!isLoggedIn?.()) {
    showHouseholdView('household-guest');
    return;
  }

  if (!isSupabaseConfigured?.()) {
    showHouseholdView('household-none');
    showToast('Prvo podesite Supabase u Podešavanjima.', 'warning');
    return;
  }

  try {
    await initHouseholdSync();
    const household = getCurrentHousehold();
    if (household) {
      renderActiveHousehold(household);
    } else {
      showHouseholdView('household-none');
    }
  } catch (e) {
    showToast(e.message || 'Greška pri učitavanju.', 'error');
    showHouseholdView('household-none');
  }

  document.getElementById('create-household-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('create-household-name')?.value.trim();
    const btn = document.getElementById('create-household-btn');
    btn.disabled = true;
    try {
      const h = await createHousehold(name);
      showToast('Domaćinstvo kreirano! Podelite pozivni kod.', 'success');
      renderActiveHousehold(h);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('join-household-btn')?.addEventListener('click', async () => {
    const code = document.getElementById('join-invite-code')?.value.trim();
    const btn = document.getElementById('join-household-btn');
    btn.disabled = true;
    try {
      const h = await joinHousehold(code);
      showToast('Uspešno ste se pridružili domaćinstvu!', 'success');
      renderActiveHousehold(h);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('copy-invite-btn')?.addEventListener('click', async () => {
    const ok = await copyInviteCode();
    showToast(ok ? 'Kod kopiran u clipboard!' : 'Kopiranje nije uspelo.', ok ? 'success' : 'error');
  });

  document.getElementById('sync-now-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('sync-now-btn');
    btn.disabled = true;
    try {
      await pullHouseholdDataFromCloud();
      await pushHouseholdDataToCloud(getData());
      await loadHouseholdMembers();
      renderMembers(getHouseholdMembers());
      showToast('Sinhronizacija završena!', 'success');
    } catch (e) {
      showToast(e.message || 'Sinhronizacija nije uspela.', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('leave-household-btn')?.addEventListener('click', async () => {
    const household = getCurrentHousehold();
    const msg = household?.role === 'owner'
      ? 'Napustiti domaćinstvo? Ako ste poslednji član, svi zajednički podaci će biti obrisani.'
      : 'Da li ste sigurni da želite da napustite domaćinstvo?';
    if (!confirm(msg)) return;

    try {
      await leaveHousehold();
      showToast('Napustili ste domaćinstvo.', 'info');
      showHouseholdView('household-none');
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  document.getElementById('join-invite-code')?.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  });
});
