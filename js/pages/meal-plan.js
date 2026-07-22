let dragState = { fromDay: null };
let modalState = { dayId: null, slotId: null, mode: 'meal', draft: null };

function escapeMealHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dayHasMeals(day) {
  return MEAL_SLOTS.some(s => isMealSlotFilled(day?.[s.id]));
}

function slotSubtitle(slot) {
  if (!isMealSlotFilled(slot)) return 'Dodirnite da dodate';
  if (slot.type === 'ingredients') {
    const n = (slot.ingredients || []).length;
    return n ? `${n} namirnica` : 'Namirnice';
  }
  const n = (slot.ingredients || []).length;
  return n ? `Gotovo jelo · ${n} sastojaka` : 'Gotovo jelo';
}

function renderMealDays() {
  const plan = getMealPlan();
  const container = document.getElementById('meal-days');

  container.innerHTML = `
    <p class="text-muted mb-sm meal-plan-hint" style="font-size:var(--font-size-xs)">
      Dodirnite obrok da izaberete jelo ili namirnice. Prevucite dan da zamenite cele dane.
    </p>
    <div class="meal-plan-grid" id="meal-plan-grid">
      ${MEAL_DAYS.map(day => {
        const dayData = plan[day.id] || emptyMealDay();
        return `
        <div class="meal-day meal-day--draggable" data-day="${day.id}" draggable="true">
          <div class="meal-day__header">
            <span class="meal-day__label">${day.full || day.label}</span>
            <button type="button" class="meal-day__clear btn btn--ghost btn--sm" data-clear-day="${day.id}"
              aria-label="Obriši sve obroke za ${day.label}" title="Obriši dan">✕</button>
          </div>
          <div class="meal-day__slots">
            ${MEAL_SLOTS.map(slot => {
              const s = dayData[slot.id] || emptyMealSlot();
              const filled = isMealSlotFilled(s);
              const label = formatMealSlotLabel(s);
              return `
              <button type="button" class="meal-slot${filled ? '' : ' meal-slot--empty'}"
                data-day="${day.id}" data-slot="${slot.id}">
                <span class="meal-slot__kind">${slot.label}</span>
                <span class="meal-slot__name">${escapeMealHtml(label || 'Prazno')}</span>
                <span class="meal-slot__meta">${escapeMealHtml(slotSubtitle(s))}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;

  bindMealDragDrop();
  bindMealSlots();
  bindMealClear();
  renderMealPlanEmptyHint();
}

function bindMealSlots() {
  document.querySelectorAll('.meal-slot').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openMealModal(btn.dataset.day, btn.dataset.slot);
    });
  });
}

function bindMealClear() {
  document.querySelectorAll('[data-clear-day]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      clearMealDay(btn.dataset.clearDay);
      renderMealDays();
      showToast('Dan obrisan.', 'info');
    });
  });
}

function bindMealDragDrop() {
  const days = document.querySelectorAll('.meal-day--draggable');

  days.forEach(dayEl => {
    const dayId = dayEl.dataset.day;

    dayEl.addEventListener('dragstart', e => {
      if (e.target.closest('.meal-slot, .meal-day__clear')) {
        e.preventDefault();
        return;
      }
      const plan = getMealPlan();
      if (!dayHasMeals(plan[dayId])) {
        e.preventDefault();
        return;
      }
      dragState = { fromDay: dayId };
      dayEl.classList.add('meal-day--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dayId);
    });

    dayEl.addEventListener('dragend', () => {
      dayEl.classList.remove('meal-day--dragging');
      document.querySelectorAll('.meal-day--over').forEach(el => el.classList.remove('meal-day--over'));
      dragState = { fromDay: null };
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
      const fromDay = e.dataTransfer.getData('text/plain') || dragState.fromDay;
      if (fromDay && fromDay !== dayId) {
        swapMealDays(fromDay, dayId);
        renderMealDays();
        showToast('Dani zamenjeni.', 'success');
      }
    });

    let touchDragDay = null;
    let touchTimer = null;

    dayEl.addEventListener('touchstart', e => {
      if (e.target.closest('.meal-slot, .meal-day__clear')) return;
      const plan = getMealPlan();
      if (!dayHasMeals(plan[dayId])) return;
      touchDragDay = dayId;
      touchTimer = setTimeout(() => {
        dayEl.classList.add('meal-day--dragging');
        if (navigator.vibrate) navigator.vibrate(30);
      }, 220);
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
        swapMealDays(touchDragDay, targetDay.dataset.day);
        renderMealDays();
        showToast('Dani zamenjeni.', 'success');
      }
      touchDragDay = null;
    });
  });
}

function openMealModal(dayId, slotId) {
  const slot = getMealSlot(dayId, slotId);
  modalState = {
    dayId,
    slotId,
    mode: slot.type === 'ingredients' ? 'ingredients' : 'meal',
    draft: {
      type: slot.type === 'empty' ? 'meal' : slot.type,
      name: slot.name || '',
      mealId: slot.mealId || '',
      ingredients: [...(slot.ingredients || [])]
    }
  };
  renderMealModal();
}

function closeMealModal() {
  modalState = { dayId: null, slotId: null, mode: 'meal', draft: null };
  const root = document.getElementById('meal-modal-root');
  if (root) root.innerHTML = '';
}

function renderMealModal() {
  const { dayId, slotId, mode, draft } = modalState;
  if (!dayId || !slotId) return;

  const dayMeta = MEAL_DAYS.find(d => d.id === dayId);
  const slotMeta = MEAL_SLOTS.find(s => s.id === slotId);
  const root = document.getElementById('meal-modal-root');
  const title = `${slotMeta?.label || ''} · ${dayMeta?.full || dayMeta?.label || ''}`;

  root.innerHTML = `
    <div class="modal-overlay" id="meal-overlay">
      <div class="modal meal-modal" role="dialog" aria-labelledby="meal-modal-title">
        <div class="meal-modal__top">
          <h2 class="modal__title" id="meal-modal-title">${escapeMealHtml(title)}</h2>
          <button type="button" class="btn btn--ghost btn--sm" id="meal-modal-close" aria-label="Zatvori">✕</button>
        </div>

        <div class="meal-modal__tabs" role="tablist">
          <button type="button" class="meal-modal__tab${mode === 'meal' ? ' is-active' : ''}" data-mode="meal" role="tab">
            Gotovo jelo
          </button>
          <button type="button" class="meal-modal__tab${mode === 'ingredients' ? ' is-active' : ''}" data-mode="ingredients" role="tab">
            Namirnice
          </button>
        </div>

        <div class="meal-modal__body" id="meal-modal-body">
          ${mode === 'meal' ? renderMealPickerBody(draft, slotId) : renderIngredientsBody(draft)}
        </div>

        <div class="modal__actions meal-modal__actions">
          <button type="button" class="btn btn--ghost" id="meal-modal-clear">Obriši</button>
          <button type="button" class="btn btn--primary" id="meal-modal-save">Sačuvaj</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('meal-modal-close').addEventListener('click', closeMealModal);
  document.getElementById('meal-overlay').addEventListener('click', e => {
    if (e.target.id === 'meal-overlay') closeMealModal();
  });
  document.getElementById('meal-modal-clear').addEventListener('click', () => {
    clearMealSlot(dayId, slotId);
    closeMealModal();
    renderMealDays();
    showToast('Obrok uklonjen.', 'info');
  });
  document.getElementById('meal-modal-save').addEventListener('click', saveModalDraft);

  root.querySelectorAll('.meal-modal__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modalState.mode = tab.dataset.mode;
      if (modalState.mode === 'ingredients') {
        modalState.draft.type = 'ingredients';
        modalState.draft.mealId = '';
      } else {
        modalState.draft.type = 'meal';
      }
      renderMealModal();
    });
  });

  if (mode === 'meal') bindMealPickerEvents();
  else bindIngredientsEvents();
}

function renderMealPickerBody(draft, slotId) {
  const presets = getMealPresetsForSlot(slotId);
  const q = (draft._search || '').trim().toLowerCase();
  const filtered = q
    ? presets.filter(m => m.name.toLowerCase().includes(q))
    : presets;
  const selected = draft.mealId || '';
  const selectedPreset = selected ? findMealPresetById(selected) : null;
  const hasIngredients = (draft.ingredients || []).length > 0
    || (selectedPreset?.ingredients || []).length > 0;

  return `
    <label class="form-label" for="meal-search">Pretraga jela</label>
    <input type="search" class="form-input mb-sm" id="meal-search" placeholder="npr. pasulj, sarma..."
      value="${escapeMealHtml(draft._search || '')}" autocomplete="off">
    <div class="meal-preset-list" id="meal-preset-list">
      ${filtered.length ? filtered.map(m => `
        <button type="button" class="meal-preset-item${selected === m.id ? ' is-selected' : ''}"
          data-meal-id="${m.id}">
          <span class="meal-preset-item__name">${escapeMealHtml(m.name)}</span>
          <span class="meal-preset-item__ings">${(m.ingredients || []).length} sastojaka</span>
        </button>
      `).join('') : `<p class="text-muted" style="font-size:var(--font-size-sm)">Nema jela za „${escapeMealHtml(draft._search || '')}".</p>`}
    </div>
    ${selected ? `
      <button type="button" class="btn btn--secondary btn--block mt-md${hasIngredients ? '' : ' hidden'}"
        id="meal-add-shopping">
        🛒 Dodaj sastojke na listu kupovine
      </button>
    ` : ''}
  `;
}

function renderIngredientsBody(draft) {
  const chips = (draft.ingredients || []).map((ing, i) => `
    <button type="button" class="fav-chip meal-ing-chip" data-ing-idx="${i}">
      ${escapeMealHtml(ing)} ✕
    </button>
  `).join('');

  return `
    <label class="form-label" for="meal-nick">Naziv obroka (opciono)</label>
    <input type="text" class="form-input mb-md" id="meal-nick" placeholder="npr. Brzi ručak"
      value="${escapeMealHtml(draft.name || '')}">

    <label class="form-label" for="meal-ing-input">Namirnice</label>
    <div class="meal-ing-row mb-sm">
      <input type="text" class="form-input" id="meal-ing-input" placeholder="Dodaj namirnicu..." autocomplete="off">
      <button type="button" class="btn btn--secondary" id="meal-ing-add">Dodaj</button>
    </div>
    <div class="fav-chips" id="meal-ing-chips">
      ${chips || `<p class="text-muted" style="font-size:var(--font-size-xs)">Još nema namirnica — unesite ih iznad.</p>`}
    </div>
  `;
}

function bindMealPickerEvents() {
  const search = document.getElementById('meal-search');
  if (search) {
    search.addEventListener('input', () => {
      modalState.draft._search = search.value;
      const body = document.getElementById('meal-modal-body');
      if (!body) return;
      body.innerHTML = renderMealPickerBody(modalState.draft, modalState.slotId);
      bindMealPickerEvents();
    });
    search.focus();
  }

  document.querySelectorAll('.meal-preset-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = findMealPresetById(btn.dataset.mealId);
      if (!preset) return;
      modalState.draft = {
        type: 'meal',
        name: preset.name,
        mealId: preset.id,
        ingredients: [...(preset.ingredients || [])],
        _search: modalState.draft._search || ''
      };
      renderMealModal();
    });
  });

  const shopBtn = document.getElementById('meal-add-shopping');
  if (shopBtn) {
    shopBtn.addEventListener('click', () => {
      const ings = modalState.draft.ingredients || [];
      const { added, total } = addIngredientsToShoppingList(ings);
      if (added > 0) showToast(`Dodato ${added} stavki na listu!`, 'success');
      else if (total > 0) showToast('Sve namirnice su već na listi.', 'info');
      else showToast('Nema sastojaka za ovo jelo.', 'warning');
    });
  }
}

function bindIngredientsEvents() {
  const nick = document.getElementById('meal-nick');
  const input = document.getElementById('meal-ing-input');
  const addBtn = document.getElementById('meal-ing-add');

  if (nick) {
    nick.addEventListener('change', () => {
      modalState.draft.name = nick.value.trim();
    });
  }

  const addIng = () => {
    const val = (input?.value || '').trim();
    if (!val) return;
    if (!modalState.draft.ingredients) modalState.draft.ingredients = [];
    if (!modalState.draft.ingredients.some(i => i.toLowerCase() === val.toLowerCase())) {
      modalState.draft.ingredients.push(val);
    }
    modalState.draft.type = 'ingredients';
    modalState.draft.mealId = '';
    if (nick) modalState.draft.name = nick.value.trim();
    renderMealModal();
    document.getElementById('meal-ing-input')?.focus();
  };

  addBtn?.addEventListener('click', addIng);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIng();
    }
  });

  document.querySelectorAll('.meal-ing-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const idx = parseInt(chip.dataset.ingIdx, 10);
      modalState.draft.ingredients.splice(idx, 1);
      renderMealModal();
    });
  });
}

function saveModalDraft() {
  const { dayId, slotId, mode, draft } = modalState;
  if (!dayId || !slotId || !draft) return;

  let slot;
  if (mode === 'meal') {
    if (!draft.mealId && !draft.name) {
      showToast('Izaberite jelo iz kataloga.', 'warning');
      return;
    }
    slot = {
      type: 'meal',
      name: draft.name,
      mealId: draft.mealId,
      ingredients: [...(draft.ingredients || [])]
    };
  } else {
    const name = (document.getElementById('meal-nick')?.value || draft.name || '').trim();
    const ingredients = [...(draft.ingredients || [])];
    if (!name && !ingredients.length) {
      showToast('Unesite naziv ili barem jednu namirnicu.', 'warning');
      return;
    }
    slot = { type: 'ingredients', name, mealId: '', ingredients };
  }

  setMealSlot(dayId, slotId, slot);
  closeMealModal();
  renderMealDays();
  showToast('Obrok sačuvan.', 'success');
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
          <div class="list-item__title">${escapeMealHtml(s)}</div>
        </div>
      </div>
    `).join('')}
  `;
}

function renderMealPlanEmptyHint() {
  const plan = getMealPlan();
  const hasMeals = countFilledMealSlots(plan) > 0;
  const hint = document.getElementById('meal-empty-hint');
  if (!hint) return;
  if (!hasMeals) {
    hint.classList.remove('hidden');
    hint.innerHTML = renderEmptyState(
      '🍽️',
      'Plan obroka je prazan',
      'Dodirnite doručak, ručak ili večeru i izaberite gotovo jelo ili unesite namirnice.'
    );
  } else {
    hint.classList.add('hidden');
    hint.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('meals', { title: 'Obroci' });
  renderMealDays();

  const beta = typeof isBetaMode === 'function' && isBetaMode();
  const cookSection = document.getElementById('cook-suggestions')?.closest('.section');
  if (beta && cookSection) {
    cookSection.classList.add('hidden');
  } else {
    renderCookSuggestions();
  }

  document.getElementById('generate-shopping').addEventListener('click', () => {
    const filled = countFilledMealSlots();
    if (!filled) {
      showToast('Prvo unesite obroke za nedelju.');
      return;
    }
    const { added, total } = generateShoppingFromMealPlan();
    if (added > 0) {
      showToast(`Dodato ${added} stavki na listu za kupovinu!`);
    } else if (total > 0) {
      showToast('Sve namirnice su već na listi.');
    } else {
      showToast('Nismo pronašli namirnice. Dodajte sastojke uz obroke.');
    }
  });
});
