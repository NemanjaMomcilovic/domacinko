const CRAFTSMEN = [
  { id: 'electrician', icon: '⚡', name: 'Električar', range: '3.000 – 15.000 RSD', desc: 'Ugradnja utičnica, osigurači, rasveta' },
  { id: 'plumber', icon: '🚿', name: 'Vodoinstalater', range: '2.500 – 12.000 RSD', desc: 'Curenje, slavine, bojler, kanalizacija' },
  { id: 'hvac', icon: '❄️', name: 'Klima servis', range: '4.000 – 20.000 RSD', desc: 'Čišćenje, punjenje freona, popravka' },
  { id: 'painter', icon: '🎨', name: 'Moler', range: '150 – 400 RSD/m²', desc: 'Farbanje zidova, gletovanje' },
  { id: 'locksmith', icon: '🔑', name: 'Bravar', range: '2.000 – 8.000 RSD', desc: 'Brave, štitnici, hitno otvaranje' },
  { id: 'gardener', icon: '🌿', name: 'Baštovan', range: '3.000 – 10.000 RSD', desc: 'Održavanje, orezivanje, navodnjavanje' },
  { id: 'appliance', icon: '🔌', name: 'Servis aparata', range: '2.500 – 15.000 RSD', desc: 'Bela tehnika, dijagnostika' },
  { id: 'roofer', icon: '🏠', name: 'Krovopokrivač', range: '5.000 – 30.000 RSD', desc: 'Curenje krova, oluci, izolacija' }
];

function renderSavedContacts() {
  const container = document.getElementById('saved-contacts');
  if (!container) return;
  const contacts = getCraftsmanContacts();
  if (contacts.length === 0) {
    container.innerHTML = renderEmptyState('📞', 'Nema sačuvanih kontakata', 'Dodajte telefon majstora koga koristite.');
    return;
  }
  container.innerHTML = contacts.map(c => `
    <div class="list-item">
      <div class="list-item__icon">👷</div>
      <div class="list-item__content">
        <div class="list-item__title">${c.name || c.trade}</div>
        <div class="list-item__subtitle">${c.trade}${c.phone ? ` · <a href="tel:${c.phone}">${c.phone}</a>` : ''}</div>
        ${c.notes ? `<p class="text-muted" style="font-size:var(--font-size-xs)">${c.notes}</p>` : ''}
      </div>
      <button class="btn btn--ghost btn--sm del-contact" data-id="${c.id}" aria-label="Obriši kontakt">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.del-contact').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteCraftsmanContact(btn.dataset.id);
      renderSavedContacts();
      showToast('Kontakt obrisan.', 'info');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'Mreža majstora', showBack: true, backHref: 'repairs.html' });

  document.getElementById('craftsmen-list').innerHTML = CRAFTSMEN.map(c => `
    <div class="module-card craftsmen-card" data-id="${c.id}" role="button" tabindex="0">
      <span class="module-card__icon">${c.icon}</span>
      <span class="module-card__title">${c.name}</span>
      <span class="module-card__desc">${c.desc}</span>
      <span class="craftsmen-card__price">${c.range}</span>
    </div>
  `).join('');

  document.querySelectorAll('.craftsmen-card').forEach(card => {
    const showInfo = () => {
      const c = CRAFTSMEN.find(x => x.id === card.dataset.id);
      document.getElementById('contact-trade').value = c.name;
      showToast(`${c.name}: ${c.range} (orijentaciono)`, 'info');
    };
    card.addEventListener('click', showInfo);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') showInfo(); });
  });

  renderSavedContacts();

  document.getElementById('save-contact')?.addEventListener('click', () => {
    const trade = document.getElementById('contact-trade').value.trim();
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const notes = document.getElementById('contact-notes').value.trim();
    if (!trade && !name) {
      showToast(getErrorMessage('required'), 'warning');
      return;
    }
    saveCraftsmanContact({ trade, name, phone, notes });
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-notes').value = '';
    renderSavedContacts();
    showToast('Kontakt sačuvan!', 'success');
  });
});
