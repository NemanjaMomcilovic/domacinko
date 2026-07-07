let currentScreen = 1;

function showScreen(n) {
  currentScreen = n;
  document.querySelectorAll('.onboarding__screen').forEach(el => {
    el.classList.toggle('hidden', parseInt(el.dataset.screen, 10) !== n);
  });
  document.querySelectorAll('.onboarding__dot').forEach(el => {
    el.classList.toggle('onboarding__dot--active', parseInt(el.dataset.dot, 10) === n);
  });

  const nextBtn = document.getElementById('next-btn');
  if (n === 3) {
    nextBtn.textContent = 'Završi';
  } else {
    nextBtn.textContent = 'Nastavi';
  }
}

function finishOnboarding(shouldAddExpense = false) {
  const name = document.getElementById('onb-name').value.trim();
  const budget = parseFloat(document.getElementById('onb-budget').value) || 80000;

  saveSettings({ userName: name, monthlyBudget: budget });

  if (shouldAddExpense) {
    const expName = document.getElementById('onb-expense-name').value.trim();
    const expAmount = document.getElementById('onb-expense-amount').value;
    const expCategory = document.getElementById('onb-expense-category').value;
    if (expName && expAmount) {
      addExpense({ name: expName, amount: expAmount, category: expCategory });
    }
  }

  setOnboardingComplete();

  if (canUseNotifications()) {
    enableNotifications().then(() => {
      window.location.href = 'home.html';
    }).catch(() => {
      window.location.href = 'home.html';
    });
  } else {
    window.location.href = 'home.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (isOnboardingComplete()) {
    window.location.href = 'home.html';
    return;
  }

  populateCategorySelect('onb-expense-category');

  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentScreen === 1) {
      showScreen(2);
    } else if (currentScreen === 2) {
      showScreen(3);
    } else {
      const expName = document.getElementById('onb-expense-name').value.trim();
      const expAmount = document.getElementById('onb-expense-amount').value;
      finishOnboarding(!!(expName && expAmount));
    }
  });

  document.getElementById('skip-btn').addEventListener('click', () => {
    if (currentScreen < 3) {
      if (currentScreen === 1) {
        showScreen(2);
      } else {
        showScreen(3);
      }
    } else {
      finishOnboarding(false);
    }
  });
});
