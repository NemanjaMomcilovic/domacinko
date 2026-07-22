const TOTAL_STEPS = 3;
let currentScreen = 1;

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

  if (n === 2) {
    skipBtn.classList.remove('hidden');
  } else {
    skipBtn.classList.add('hidden');
  }

  if (n === 3) {
    nextBtn.textContent = 'Dodaj prvi trošak →';
    const firstName = document.getElementById('onb-first-name').value.trim()
      || getSettings()?.firstName
      || 'prijatelju';
    document.getElementById('onb-welcome-name').textContent = firstName;
  } else {
    nextBtn.textContent = 'Nastavi';
  }
}

function saveStep1Data() {
  const firstName = document.getElementById('onb-first-name').value.trim();
  const lastName = document.getElementById('onb-last-name')?.value.trim()
    || (getSettings()?.lastName || '');
  const householdSize = parseInt(document.getElementById('onb-household-size').value, 10) || 1;

  if (!firstName) {
    showToast('Unesite ime.');
    return false;
  }

  saveSettings({
    firstName,
    lastName,
    userName: [firstName, lastName].filter(Boolean).join(' '),
    householdSize
  });

  const data = getData();
  const existing = data.household?.familyMembers?.length || 0;
  if (existing < householdSize) {
    for (let i = existing; i < householdSize; i++) {
      addHouseholdItem('familyMembers', {
        name: i === 0 ? firstName : `Član ${i + 1}`,
        type: i === 0 ? 'Odrasla osoba' : 'Odrasla osoba'
      });
    }
  }

  return true;
}

function saveStep2Data() {
  const budget = parseFloat(document.getElementById('onb-budget').value) || 80000;
  saveSettings({ monthlyBudget: budget });
}

async function finishOnboarding() {
  setOnboardingComplete();

  const firstName = document.getElementById('onb-first-name').value.trim()
    || getSettings()?.firstName
    || '';
  const lastName = document.getElementById('onb-last-name')?.value.trim()
    || getSettings()?.lastName
    || '';
  const budget = parseFloat(document.getElementById('onb-budget').value) || 80000;

  if (isLoggedIn()) {
    try {
      await saveProfile({
        first_name: firstName,
        last_name: lastName,
        monthly_budget: budget,
        onboarding_complete: true
      });
      if (typeof pushUserDataToCloud === 'function') {
        await pushUserDataToCloud(getData());
      }
    } catch (e) {
      console.warn('Sinhronizacija profila:', e.message);
    }
  }

  const goToExpenses = () => {
    window.location.href = 'add-expense.html';
  };

  if (canUseNotifications()) {
    enableNotifications().finally(goToExpenses);
  } else {
    goToExpenses();
  }
}

function goNext() {
  if (currentScreen === 1) {
    if (!saveStep1Data()) return;
    showScreen(2);
  } else if (currentScreen === 2) {
    saveStep2Data();
    showScreen(3);
  } else {
    finishOnboarding();
  }
}

function skipOptionalStep() {
  if (currentScreen === 2) {
    showScreen(3);
  }
}

function applyAuthPrefillToOnboarding() {
  if (typeof applyAuthProfileToSettings === 'function' && isLoggedIn() && getCurrentUser()) {
    applyAuthProfileToSettings(getCurrentUser());
  }

  const settings = getSettings();
  const firstNameInput = document.getElementById('onb-first-name');
  const lastNameInput = document.getElementById('onb-last-name');
  const titleEl = document.querySelector('[data-screen="1"] .onboarding__title');
  const textEl = document.querySelector('[data-screen="1"] .onboarding__text');
  const nameLabel = document.querySelector('label[for="onb-first-name"]');

  if (settings.firstName && firstNameInput) firstNameInput.value = settings.firstName;
  if (settings.lastName && lastNameInput) lastNameInput.value = settings.lastName;
  if (settings.householdSize) {
    document.getElementById('onb-household-size').value = String(Math.min(6, settings.householdSize));
  }
  if (settings.monthlyBudget) document.getElementById('onb-budget').value = settings.monthlyBudget;

  if ((settings.firstName || '').trim()) {
    if (titleEl) titleEl.textContent = `Zdravo, ${settings.firstName}!`;
    if (textEl) {
      textEl.textContent = 'Ime smo preuzeli sa naloga. Potvrdite veličinu domaćinstva — sve možete promeniti kasnije u Više → Moj profil.';
    }
    if (nameLabel) nameLabel.textContent = 'Ime (sa naloga)';
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

  applyAuthPrefillToOnboarding();

  // Ako ime već postoji, i dalje prikaži korak 1 zbog domaćinstva (ime je popunjeno).
  showScreen(1);

  document.getElementById('next-btn').addEventListener('click', goNext);
  document.getElementById('skip-step-btn').addEventListener('click', skipOptionalStep);
});
