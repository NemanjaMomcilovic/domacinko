const TOTAL_STEPS = 5;
let currentScreen = 1;
const pantryItems = [];
const billItems = [];

function showScreen(n) {
  currentScreen = n;
  document.querySelectorAll('.onboarding__screen').forEach(el => {
    el.classList.toggle('hidden', parseInt(el.dataset.screen, 10) !== n);
  });
  document.querySelectorAll('.onboarding__dot').forEach(el => {
    el.classList.toggle('onboarding__dot--active', parseInt(el.dataset.dot, 10) === n);
  });

  const progress = document.getElementById('progress-label');
  if (progress) progress.textContent = `Korak ${n} od ${TOTAL_STEPS}`;

  const skipBtn = document.getElementById('skip-step-btn');
  const nextBtn = document.getElementById('next-btn');

  if (n >= 2 && n <= 4) {
    skipBtn.classList.remove('hidden');
  } else {
    skipBtn.classList.add('hidden');
  }

  if (n === 5) {
    nextBtn.textContent = 'Kreni u Domaćinko 🏡';
    const firstName = document.getElementById('onb-first-name').value.trim() || 'prijatelju';
    document.getElementById('onb-welcome-name').textContent = firstName;
  } else if (n === 1) {
    nextBtn.textContent = 'Nastavi';
  } else {
    nextBtn.textContent = 'Sačuvaj i nastavi';
  }
}

function renderPantryList() {
  const list = document.getElementById('onb-pantry-list');
  if (!list) return;
  if (pantryItems.length === 0) {
    list.innerHTML = '<li class="onboarding__item-list__empty">Još nema namirnica — dodaj ili preskoči</li>';
    return;
  }
  list.innerHTML = pantryItems.map((item, i) => `
    <li class="onboarding__item-list__item">
      <span>🥫 ${item}</span>
      <button type="button" class="btn btn--ghost btn--sm" data-remove-pantry="${i}">✕</button>
    </li>
  `).join('');
  list.querySelectorAll('[data-remove-pantry]').forEach(btn => {
    btn.addEventListener('click', () => {
      pantryItems.splice(parseInt(btn.dataset.removePantry, 10), 1);
      renderPantryList();
    });
  });
}

function renderBillsList() {
  const list = document.getElementById('onb-bills-list');
  if (!list) return;
  if (billItems.length === 0) {
    list.innerHTML = '<li class="onboarding__item-list__empty">Još nema računa — dodaj ili preskoči</li>';
    return;
  }
  list.innerHTML = billItems.map((bill, i) => `
    <li class="onboarding__item-list__item">
      <span>📄 ${bill.name} — ${formatCurrency(bill.amount)} · ${bill.dayOfMonth}. u mesecu</span>
      <button type="button" class="btn btn--ghost btn--sm" data-remove-bill="${i}">✕</button>
    </li>
  `).join('');
  list.querySelectorAll('[data-remove-bill]').forEach(btn => {
    btn.addEventListener('click', () => {
      billItems.splice(parseInt(btn.dataset.removeBill, 10), 1);
      renderBillsList();
    });
  });
}

function saveStep1Data() {
  const firstName = document.getElementById('onb-first-name').value.trim();
  const lastName = document.getElementById('onb-last-name').value.trim();

  if (!firstName) {
    showToast('Unesite ime.');
    return false;
  }

  saveSettings({
    firstName,
    lastName,
    userName: [firstName, lastName].filter(Boolean).join(' '),
    monthlyIncome: parseFloat(document.getElementById('onb-income').value) || 0,
    currentSavings: parseFloat(document.getElementById('onb-savings').value) || 0,
    monthlyBudget: parseFloat(document.getElementById('onb-budget').value) || 80000,
    savingsGoalName: document.getElementById('onb-goal-name').value.trim(),
    savingsGoal: parseFloat(document.getElementById('onb-goal-amount').value) || 0
  });
  return true;
}

function saveStep2Data() {
  pantryItems.forEach(name => {
    addHouseholdItem('pantry', { name, quantity: '', expiry: '' });
  });
}

function saveStep3Data() {
  billItems.forEach(bill => {
    addRecurringExpense({
      name: bill.name,
      amount: bill.amount,
      category: 'bills',
      dayOfMonth: bill.dayOfMonth
    });
    addHouseholdItem('bills', {
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dayOfMonth
    });
  });
}

function saveStep4Data() {
  const brand = document.getElementById('onb-car-brand').value.trim();
  const model = document.getElementById('onb-car-model').value.trim();
  const plate = document.getElementById('onb-car-plate').value.trim();
  const expiry = document.getElementById('onb-car-expiry').value;

  if (brand || model || plate) {
    addHouseholdItem('cars', {
      brand,
      model,
      plate,
      registrationExpiry: expiry,
      note: ''
    });
  }
}

async function finishOnboarding() {
  setOnboardingComplete();

  if (isLoggedIn()) {
    try {
      await saveProfile({
        first_name: document.getElementById('onb-first-name').value.trim(),
        last_name: document.getElementById('onb-last-name').value.trim(),
        monthly_income: parseFloat(document.getElementById('onb-income').value) || 0,
        current_savings: parseFloat(document.getElementById('onb-savings').value) || 0,
        monthly_budget: parseFloat(document.getElementById('onb-budget').value) || 80000,
        savings_goal: parseFloat(document.getElementById('onb-goal-amount').value) || 0,
        savings_goal_name: document.getElementById('onb-goal-name').value.trim(),
        onboarding_complete: true
      });
      if (typeof pushUserDataToCloud === 'function') {
        await pushUserDataToCloud(getData());
      }
    } catch (e) {
      console.warn('Sinhronizacija profila:', e.message);
    }
  }

  if (canUseNotifications()) {
    enableNotifications().finally(() => {
      window.location.href = 'home.html';
    });
  } else {
    window.location.href = 'home.html';
  }
}

function goNext() {
  if (currentScreen === 1) {
    if (!saveStep1Data()) return;
    showScreen(2);
  } else if (currentScreen === 2) {
    saveStep2Data();
    showScreen(3);
  } else if (currentScreen === 3) {
    saveStep3Data();
    showScreen(4);
  } else if (currentScreen === 4) {
    saveStep4Data();
    showScreen(5);
  } else {
    finishOnboarding();
  }
}

function skipOptionalStep() {
  if (currentScreen >= 2 && currentScreen <= 4) {
    showScreen(currentScreen + 1);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth();

  const allowed = await requireAuthOrGuest('auth.html');
  if (!allowed) return;

  if (!needsOnboarding()) {
    window.location.href = 'home.html';
    return;
  }

  const settings = getSettings();
  if (settings.firstName) document.getElementById('onb-first-name').value = settings.firstName;
  if (settings.lastName) document.getElementById('onb-last-name').value = settings.lastName;
  if (settings.monthlyIncome) document.getElementById('onb-income').value = settings.monthlyIncome;
  if (settings.currentSavings) document.getElementById('onb-savings').value = settings.currentSavings;
  if (settings.monthlyBudget) document.getElementById('onb-budget').value = settings.monthlyBudget;
  if (settings.savingsGoalName) document.getElementById('onb-goal-name').value = settings.savingsGoalName;
  if (settings.savingsGoal) document.getElementById('onb-goal-amount').value = settings.savingsGoal;

  renderPantryList();
  renderBillsList();
  showScreen(1);

  document.getElementById('onb-pantry-add').addEventListener('click', () => {
    const input = document.getElementById('onb-pantry-input');
    const val = input.value.trim();
    if (!val) return;
    pantryItems.push(val);
    input.value = '';
    renderPantryList();
  });

  document.getElementById('onb-pantry-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('onb-pantry-add').click();
    }
  });

  document.getElementById('onb-bill-add').addEventListener('click', () => {
    const name = document.getElementById('onb-bill-name').value.trim();
    const amount = parseFloat(document.getElementById('onb-bill-amount').value);
    const dayOfMonth = parseInt(document.getElementById('onb-bill-day').value, 10) || 1;
    if (!name || !amount) {
      showToast('Unesite naziv i iznos računa.');
      return;
    }
    billItems.push({ name, amount, dayOfMonth });
    document.getElementById('onb-bill-name').value = '';
    document.getElementById('onb-bill-amount').value = '';
    renderBillsList();
  });

  document.getElementById('next-btn').addEventListener('click', goNext);
  document.getElementById('skip-step-btn').addEventListener('click', skipOptionalStep);
});
