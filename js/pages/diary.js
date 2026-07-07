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
      </div>
      <button class="btn btn--ghost btn--sm del-diary" data-id="${e.id}">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-diary').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteDiaryEntry(btn.dataset.id);
      renderDiary();
      showToast('Unos obrisan.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Dnevnik kuće', showBack: true, backHref: 'home.html' });
  document.getElementById('diary-date').value = new Date().toISOString().split('T')[0];
  renderDiary();

  document.getElementById('add-diary').addEventListener('click', () => {
    const title = document.getElementById('diary-title').value.trim();
    if (!title) { showToast('Unesite naslov.'); return; }
    addDiaryEntry({
      title,
      date: document.getElementById('diary-date').value,
      notes: document.getElementById('diary-notes').value.trim()
    });
    document.getElementById('diary-title').value = '';
    document.getElementById('diary-notes').value = '';
    renderDiary();
    showToast('Unos dodat!');
  });
});
