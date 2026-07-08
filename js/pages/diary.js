let pendingPhoto = null;
let diaryFilters = { type: '', from: '', to: '', query: '' };

function getDiaryTypeInfo(typeId) {
  return (typeof DIARY_TYPES !== 'undefined' ? DIARY_TYPES : []).find(t => t.id === typeId)
    || { id: 'ostalo', label: 'Ostalo', icon: '📔' };
}

function renderDiary() {
  const entries = typeof getDiaryFiltered === 'function'
    ? getDiaryFiltered(diaryFilters)
    : getDiary();
  const container = document.getElementById('diary-list');

  if (entries.length === 0) {
    const hasFilters = diaryFilters.type || diaryFilters.from || diaryFilters.to || diaryFilters.query;
    container.innerHTML = renderEmptyState(
      '📔',
      hasFilters ? 'Nema unosa za filter' : 'Dnevnik je prazan',
      hasFilters ? 'Promenite filter ili dodajte novi unos.' : 'Zabeležite prvi događaj u vašem domu.'
    );
    return;
  }

  container.innerHTML = entries.map(e => {
    const typeInfo = getDiaryTypeInfo(e.type);
    return `
    <div class="list-item diary-entry animate-fade-in">
      <div class="list-item__icon">${typeInfo.icon}</div>
      <div class="list-item__content">
        <div class="list-item__title">${e.title}</div>
        <div class="list-item__subtitle">
          <span class="badge badge--info">${typeInfo.label}</span>
          ${formatDate(e.date)}
        </div>
        ${e.notes ? `<p class="diary-entry__notes">${e.notes}</p>` : ''}
        ${e.photos?.length ? `<img src="${e.photos[0]}" alt="Fotografija" class="diary-entry__photo" loading="lazy">` : ''}
      </div>
      <button class="btn btn--ghost btn--sm del-diary" data-id="${e.id}" aria-label="Obriši unos">✕</button>
    </div>
  `;
  }).join('');

  container.querySelectorAll('.del-diary').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteDiaryEntry(btn.dataset.id);
      renderDiary();
      showToast('Unos obrisan.', 'info');
    });
  });
}

function renderDiaryFilters() {
  const container = document.getElementById('diary-filters');
  if (!container || typeof DIARY_TYPES === 'undefined') return;

  container.innerHTML = `
    <div class="filter-row">
      <select class="form-select" id="diary-filter-type" aria-label="Filter po tipu">
        <option value="">Svi tipovi</option>
        ${DIARY_TYPES.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('')}
      </select>
      <input type="date" class="form-input" id="diary-filter-from" aria-label="Od datuma">
      <input type="date" class="form-input" id="diary-filter-to" aria-label="Do datuma">
    </div>
    <input type="search" class="form-input mt-sm" id="diary-filter-query" placeholder="Pretraži unose..." aria-label="Pretraga dnevnika">
  `;

  document.getElementById('diary-filter-type').addEventListener('change', e => {
    diaryFilters.type = e.target.value;
    renderDiary();
  });
  document.getElementById('diary-filter-from').addEventListener('change', e => {
    diaryFilters.from = e.target.value;
    renderDiary();
  });
  document.getElementById('diary-filter-to').addEventListener('change', e => {
    diaryFilters.to = e.target.value;
    renderDiary();
  });
  document.getElementById('diary-filter-query').addEventListener('input', e => {
    diaryFilters.query = e.target.value.trim();
    renderDiary();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Dnevnik kuće', showBack: true, backHref: 'home.html' });
  document.getElementById('diary-date').value = new Date().toISOString().split('T')[0];

  const typeSelect = document.getElementById('diary-type');
  if (typeSelect && typeof DIARY_TYPES !== 'undefined') {
    typeSelect.innerHTML = DIARY_TYPES.map(t =>
      `<option value="${t.id}">${t.icon} ${t.label}</option>`
    ).join('');
  }

  renderDiaryFilters();
  renderDiary();

  const photoInput = document.getElementById('diary-photo');
  const photoPreview = document.getElementById('diary-photo-preview');

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    if (file.size > 500000) {
      showToast('Slika je prevelika. Maksimum je 500 KB.', 'warning');
      photoInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      pendingPhoto = compressImageForStorage(reader.result);
      photoPreview.innerHTML = `<img src="${pendingPhoto}" alt="Pregled" class="diary-entry__photo" loading="lazy">`;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('add-diary').addEventListener('click', () => {
    const title = document.getElementById('diary-title').value.trim();
    if (!title) {
      showToast(getErrorMessage('required'), 'warning');
      return;
    }
    const photos = pendingPhoto ? [pendingPhoto] : [];
    addDiaryEntry({
      title,
      type: document.getElementById('diary-type')?.value || 'ostalo',
      date: document.getElementById('diary-date').value,
      notes: document.getElementById('diary-notes').value.trim(),
      photos
    });
    document.getElementById('diary-title').value = '';
    document.getElementById('diary-notes').value = '';
    photoInput.value = '';
    photoPreview.innerHTML = '';
    pendingPhoto = null;
    renderDiary();
    showToast('Unos dodat!', 'success');
  });
});
