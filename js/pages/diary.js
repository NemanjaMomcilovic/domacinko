let pendingPhoto = null;

function renderDiary() {
  const entries = getDiary();
  const container = document.getElementById('diary-list');
  if (entries.length === 0) {
    container.innerHTML = renderEmptyState('📔', 'Dnevnik je prazan', 'Zabeležite prvi događaj u vašem domu.');
    return;
  }
  container.innerHTML = entries.map(e => `
    <div class="list-item diary-entry">
      <div class="list-item__icon">📔</div>
      <div class="list-item__content">
        <div class="list-item__title">${e.title}</div>
        <div class="list-item__subtitle">${formatDate(e.date)}</div>
        ${e.notes ? `<p class="diary-entry__notes">${e.notes}</p>` : ''}
        ${e.photos?.length ? `<img src="${e.photos[0]}" alt="Fotografija" class="diary-entry__photo" loading="lazy" style="max-width:100%;border-radius:8px;margin-top:8px">` : ''}
      </div>
      <button class="btn btn--ghost btn--sm del-diary" data-id="${e.id}" aria-label="Obriši unos">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-diary').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteDiaryEntry(btn.dataset.id);
      renderDiary();
      showToast('Unos obrisan.', 'info');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Dnevnik kuće', showBack: true, backHref: 'home.html' });
  document.getElementById('diary-date').value = new Date().toISOString().split('T')[0];
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
      photoPreview.innerHTML = `<img src="${pendingPhoto}" alt="Pregled" style="max-width:100%;border-radius:8px;margin-top:8px" loading="lazy">`;
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
