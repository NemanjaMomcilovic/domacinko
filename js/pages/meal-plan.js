function renderMealDays() {
  const plan = getMealPlan();
  const container = document.getElementById('meal-days');

  container.innerHTML = MEAL_DAYS.map(day => `
    <div class="meal-day">
      <label class="meal-day__label" for="meal-${day.id}">${day.label}</label>
      <input type="text" class="form-input meal-day__input" id="meal-${day.id}"
        data-day="${day.id}" value="${plan[day.id] || ''}"
        placeholder="npr. Piletina sa povrćem">
    </div>
  `).join('');

  container.querySelectorAll('.meal-day__input').forEach(input => {
    input.addEventListener('change', () => {
      setMealForDay(input.dataset.day, input.value.trim());
    });
    input.addEventListener('blur', () => {
      setMealForDay(input.dataset.day, input.value.trim());
    });
  });
}

function renderCookSuggestions() {
  const container = document.getElementById('cook-suggestions');
  const result = suggestMealsFromPantry();

  if (!result) {
    container.innerHTML = renderEmptyState(
      '🍳',
      'Još nema namirnica u ostavi',
      'Dodajte šta imate kod kuće u Domaćinstvo → Ostava, pa ćemo vam predložiti obroke!'
    );
    return;
  }

  if (result.message) {
    container.innerHTML = `
      <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);line-height:1.6">
        ${result.message}
      </p>
      <p class="text-muted mt-sm" style="font-size:var(--font-size-xs)">
        U ostavi: ${result.pantry.join(', ')}
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <p class="text-muted mb-md" style="font-size:var(--font-size-sm)">
      Na osnovu vaše ostave, možete skuvati:
    </p>
    ${result.suggestions.map(s => `
      <div class="list-item" style="padding:var(--space-sm) 0">
        <div class="list-item__icon">🍽️</div>
        <div class="list-item__content">
          <div class="list-item__title">${s}</div>
        </div>
      </div>
    `).join('')}
  `;
}

function renderMealPresets() {
  const container = document.getElementById('meal-presets');
  if (!container || typeof SERBIAN_MEAL_PRESETS === 'undefined') return;
  container.innerHTML = `
    <p class="text-muted mb-sm" style="font-size:var(--font-size-xs)">Dodirnite jelo da ga dodate u prvi slobodan dan</p>
    <div class="fav-chips">
      ${SERBIAN_MEAL_PRESETS.map(m => `<button type="button" class="fav-chip meal-preset" data-name="${m.name}">${m.name}</button>`).join('')}
    </div>
  `;
  container.querySelectorAll('.meal-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = getMealPlan();
      const emptyDay = MEAL_DAYS.find(d => !(plan[d.id] || '').trim());
      if (!emptyDay) {
        showToast('Svi dani su popunjeni. Obrišite neki obrok prvo.', 'warning');
        return;
      }
      setMealForDay(emptyDay.id, btn.dataset.name);
      renderMealDays();
      showToast(`${btn.dataset.name} → ${emptyDay.label}`, 'success');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('', { title: 'Plan obroka', showBack: true, backHref: 'home.html' });
  renderMealPresets();
  renderMealDays();
  renderCookSuggestions();

  document.getElementById('generate-shopping').addEventListener('click', () => {
    const plan = getMealPlan();
    const hasMeals = Object.values(plan).some(m => (m || '').trim());
    if (!hasMeals) {
      showToast('Prvo unesite obroke za nedelju.');
      return;
    }
    const { added, total } = generateShoppingFromMealPlan();
    if (added > 0) {
      showToast(`Dodato ${added} stavki na listu za kupovinu!`);
    } else if (total > 0) {
      showToast('Sve namirnice su već na listi.');
    } else {
      showToast('Nismo pronašli namirnice. Probajte detaljnije nazive obroka.');
    }
  });
});
