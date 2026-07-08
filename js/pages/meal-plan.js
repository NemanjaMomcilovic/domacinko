let dragState = { fromDay: null, meal: '' };

function renderMealDays() {
  const plan = getMealPlan();
  const container = document.getElementById('meal-days');

  container.innerHTML = `
    <p class="text-muted mb-sm meal-plan-hint" style="font-size:var(--font-size-xs)">
      Prevucite obrok na drugi dan ili promenite redosled. Dodirnite i držite na telefonu.
    </p>
    <div class="meal-plan-grid" id="meal-plan-grid">
      ${MEAL_DAYS.map(day => `
        <div class="meal-day meal-day--draggable" data-day="${day.id}" draggable="true">
          <div class="meal-day__header">
            <span class="meal-day__label">${day.label}</span>
            <button type="button" class="meal-day__clear btn btn--ghost btn--sm" data-clear="${day.id}" aria-label="Obriši obrok za ${day.label}" title="Obriši">✕</button>
          </div>
          <div class="meal-day__dropzone" data-drop="${day.id}">
            <span class="meal-day__meal${plan[day.id] ? '' : ' meal-day__meal--empty'}">${plan[day.id] || 'Prevucite jelo ovde'}</span>
          </div>
          <input type="text" class="form-input meal-day__input sr-only" id="meal-${day.id}"
            data-day="${day.id}" value="${plan[day.id] || ''}" aria-label="Obrok za ${day.label}">
        </div>
      `).join('')}
    </div>
  `;

  bindMealDragDrop();
  bindMealInputs();
  bindMealClear();
  renderMealPlanEmptyHint();
}

function bindMealInputs() {
  document.querySelectorAll('.meal-day__input').forEach(input => {
    input.addEventListener('change', () => {
      setMealForDay(input.dataset.day, input.value.trim());
      updateMealDisplay(input.dataset.day, input.value.trim());
    });
  });
}

function bindMealClear() {
  document.querySelectorAll('.meal-day__clear').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dayId = btn.dataset.clear;
      setMealForDay(dayId, '');
      updateMealDisplay(dayId, '');
      showToast('Obrok uklonjen.', 'info');
    });
  });
}

function updateMealDisplay(dayId, mealName) {
  const zone = document.querySelector(`[data-drop="${dayId}"] .meal-day__meal`);
  if (!zone) return;
  zone.textContent = mealName || 'Prevucite jelo ovde';
  zone.classList.toggle('meal-day__meal--empty', !mealName);
  const input = document.getElementById(`meal-${dayId}`);
  if (input) input.value = mealName;
}

function swapMeals(fromDay, toDay) {
  if (!fromDay || !toDay || fromDay === toDay) return;
  const plan = getMealPlan();
  const fromMeal = plan[fromDay] || '';
  const toMeal = plan[toDay] || '';
  setMealForDay(fromDay, toMeal);
  setMealForDay(toDay, fromMeal);
  updateMealDisplay(fromDay, toMeal);
  updateMealDisplay(toDay, fromMeal);
}

function bindMealDragDrop() {
  const days = document.querySelectorAll('.meal-day--draggable');

  days.forEach(dayEl => {
    const dayId = dayEl.dataset.day;

    dayEl.addEventListener('dragstart', e => {
      const plan = getMealPlan();
      const meal = plan[dayId] || '';
      if (!meal) {
        e.preventDefault();
        return;
      }
      dragState = { fromDay: dayId, meal };
      dayEl.classList.add('meal-day--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', `${dayId}|${meal}`);
    });

    dayEl.addEventListener('dragend', () => {
      dayEl.classList.remove('meal-day--dragging');
      document.querySelectorAll('.meal-day--over').forEach(el => el.classList.remove('meal-day--over'));
      dragState = { fromDay: null, meal: '' };
    });

    dayEl.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dayEl.classList.add('meal-day--over');
    });

    dayEl.addEventListener('dragleave', () => {
      dayEl.classList.remove('meal-day--over');
    });

    dayEl.addEventListener('drop', e => {
      e.preventDefault();
      dayEl.classList.remove('meal-day--over');
      const raw = e.dataTransfer.getData('text/plain');
      const [fromDay] = raw.split('|');
      if (fromDay) {
        swapMeals(fromDay, dayId);
        showToast('Obrok premešten.', 'success');
      }
    });

    let touchDragDay = null;
    let touchTimer = null;

    dayEl.addEventListener('touchstart', e => {
      const plan = getMealPlan();
      if (!plan[dayId]) return;
      touchDragDay = dayId;
      touchTimer = setTimeout(() => {
        dayEl.classList.add('meal-day--dragging');
        if (navigator.vibrate) navigator.vibrate(30);
      }, 200);
    }, { passive: true });

    dayEl.addEventListener('touchmove', e => {
      if (!touchDragDay) return;
      clearTimeout(touchTimer);
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetDay = target?.closest('.meal-day--draggable');
      document.querySelectorAll('.meal-day--over').forEach(el => el.classList.remove('meal-day--over'));
      if (targetDay) targetDay.classList.add('meal-day--over');
    }, { passive: true });

    dayEl.addEventListener('touchend', e => {
      clearTimeout(touchTimer);
      if (!touchDragDay) return;
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetDay = target?.closest('.meal-day--draggable');
      document.querySelectorAll('.meal-day--dragging, .meal-day--over').forEach(el => {
        el.classList.remove('meal-day--dragging', 'meal-day--over');
      });
      if (targetDay && targetDay.dataset.day !== touchDragDay) {
        swapMeals(touchDragDay, targetDay.dataset.day);
        showToast('Obrok premešten.', 'success');
      }
      touchDragDay = null;
    });
  });

  document.querySelectorAll('.meal-preset').forEach(btn => {
    btn.setAttribute('draggable', 'true');
    btn.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', `preset|${btn.dataset.name}`);
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  days.forEach(dayEl => {
    dayEl.addEventListener('drop', e => {
      const raw = e.dataTransfer.getData('text/plain');
      if (raw.startsWith('preset|')) {
        e.preventDefault();
        const mealName = raw.split('|')[1];
        const dayId = dayEl.dataset.day;
        setMealForDay(dayId, mealName);
        updateMealDisplay(dayId, mealName);
        showToast(`${mealName} → ${MEAL_DAYS.find(d => d.id === dayId)?.label}`, 'success');
      }
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

function renderMealPlanEmptyHint() {
  const plan = getMealPlan();
  const hasMeals = Object.values(plan).some(m => (m || '').trim());
  const hint = document.getElementById('meal-empty-hint');
  if (!hint) return;
  if (!hasMeals) {
    hint.classList.remove('hidden');
    hint.innerHTML = renderEmptyState(
      '🍽️',
      'Plan obroka je prazan',
      'Izaberite jelo ispod ili prevucite predloge na dane u nedelji.'
    );
  } else {
    hint.classList.add('hidden');
    hint.innerHTML = '';
  }
}

function renderMealPresets() {
  const container = document.getElementById('meal-presets');
  if (!container || typeof SERBIAN_MEAL_PRESETS === 'undefined') return;
  container.innerHTML = `
    <p class="text-muted mb-sm" style="font-size:var(--font-size-xs)">Dodirnite ili prevucite jelo na dan u planu</p>
    <div class="fav-chips">
      ${SERBIAN_MEAL_PRESETS.map(m => `<button type="button" class="fav-chip meal-preset" data-name="${m.name}" draggable="true">${m.name}</button>`).join('')}
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
      renderMealPlanEmptyHint();
      showToast(`${btn.dataset.name} → ${emptyDay.label}`, 'success');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('meals', { title: 'Obroci' });
  renderMealPresets();
  renderMealDays();
  renderMealPlanEmptyHint();
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
