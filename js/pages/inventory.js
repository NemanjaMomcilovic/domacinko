function renderInventoryList() {
  const container = document.getElementById('inventory-list');
  if (!container) return;

  const items = getInventory();
  if (items.length === 0) {
    container.innerHTML = renderEmptyState('📦', 'Inventar je prazan', 'Dodajte prvi predmet ispod.');
    return;
  }

  const now = new Date().toISOString().split('T')[0];

  container.innerHTML = items.map(item => {
    let warrantyBadge = '';
    if (item.warrantyEnd) {
      if (item.warrantyEnd < now) {
        warrantyBadge = '<span class="badge badge--danger">Garancija istekla</span>';
      } else {
        const daysLeft = Math.ceil((new Date(item.warrantyEnd) - new Date()) / (1000 * 60 * 60 * 24));
        const warn = daysLeft <= 30;
        warrantyBadge = `<span class="badge badge--${warn ? 'warning' : 'success'}">Garancija: ${daysLeft} dana</span>`;
      }
    }

    return `
      <div class="list-item inventory-item" data-id="${item.id}">
        ${item.receiptPhoto ? `<img src="${item.receiptPhoto}" alt="" class="inventory-item__thumb">` : '<div class="list-item__icon">📦</div>'}
        <div class="list-item__content">
          <div class="list-item__title">${item.name}</div>
          <div class="list-item__subtitle">
            ${item.location || 'Bez lokacije'}
            ${item.purchaseDate ? ` · Kupljeno: ${formatDate(item.purchaseDate)}` : ''}
          </div>
          ${warrantyBadge}
        </div>
        <button class="btn btn--ghost btn--sm delete-inv" data-id="${item.id}">✕</button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.delete-inv').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Obrisati predmet?')) {
        deleteInventoryItem(btn.dataset.id);
        renderInventoryList();
        showToast('Predmet obrisan.');
      }
    });
  });
}

function handleReceiptPhoto(input) {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Slika je prevelika (max 2MB).');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('receipt-preview').innerHTML = `<img src="${reader.result}" alt="Račun">`;
    document.getElementById('receipt-preview').dataset.photo = reader.result;
  };
  reader.readAsDataURL(file);
}

function renderMagazineList(query) {
  const container = document.getElementById('magazine-list');
  if (!container) return;
  const items = query ? searchMagazine(query) : getHomeMagazine();
  if (items.length === 0) {
    container.innerHTML = renderEmptyState('🏪', 'Magacin je prazan', 'Dodajte sijalice, boju, šrafove...');
    return;
  }
  container.innerHTML = items.map(item => {
    const cat = MAGAZINE_CATEGORIES.find(c => c.id === item.category);
    return `
      <div class="list-item">
        <div class="list-item__icon">${cat?.icon || '📦'}</div>
        <div class="list-item__content">
          <div class="list-item__title">${item.name}</div>
          <div class="list-item__subtitle">${cat?.label || 'Ostalo'} · ${item.quantity} ${item.unit}</div>
        </div>
        <button class="btn btn--ghost btn--sm del-mag" data-id="${item.id}">✕</button>
      </div>
    `;
  }).join('');
  container.querySelectorAll('.del-mag').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteMagazineItem(btn.dataset.id);
      renderMagazineList(document.getElementById('magazine-search')?.value);
      showToast('Uklonjeno iz magacina.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('inventory-list')) return;

  initNavigation('settings', { title: 'Inventar', showBack: true, backHref: 'home.html' });

  const locationSelect = document.getElementById('inv-location');
  if (locationSelect) {
    locationSelect.innerHTML = INVENTORY_LOCATIONS.map(l => `<option value="${l}">${l}</option>`).join('');
  }

  renderInventoryList();

  const magCat = document.getElementById('mag-category');
  if (magCat) {
    magCat.innerHTML = MAGAZINE_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    renderMagazineList();
    document.getElementById('magazine-search')?.addEventListener('input', e => renderMagazineList(e.target.value));
    document.getElementById('add-magazine')?.addEventListener('click', () => {
      const name = document.getElementById('mag-name').value.trim();
      if (!name) { showToast('Unesite naziv.'); return; }
      const cat = MAGAZINE_CATEGORIES.find(c => c.id === magCat.value);
      addMagazineItem({
        name,
        category: magCat.value,
        quantity: document.getElementById('mag-qty').value,
        unit: cat?.unit || 'kom'
      });
      document.getElementById('mag-name').value = '';
      renderMagazineList();
      showToast('Dodato u magacin!');
    });
  }

  document.getElementById('inv-receipt')?.addEventListener('change', e => handleReceiptPhoto(e.target));

  document.getElementById('add-inventory')?.addEventListener('click', () => {
    const name = document.getElementById('inv-name').value.trim();
    if (!name) {
      showToast('Unesite naziv predmeta.');
      return;
    }

    const preview = document.getElementById('receipt-preview');
    addInventoryItem({
      name,
      location: document.getElementById('inv-location').value,
      purchaseDate: document.getElementById('inv-purchase').value,
      warrantyEnd: document.getElementById('inv-warranty').value,
      receiptPhoto: preview?.dataset.photo || '',
      note: document.getElementById('inv-note').value.trim()
    });

    document.getElementById('inv-name').value = '';
    document.getElementById('inv-purchase').value = '';
    document.getElementById('inv-warranty').value = '';
    document.getElementById('inv-note').value = '';
    document.getElementById('inv-receipt').value = '';
    if (preview) {
      preview.innerHTML = '<span>📷 Dodajte sliku računa (opciono)</span>';
      delete preview.dataset.photo;
    }

    renderInventoryList();
    showToast('Predmet dodat u inventar!');
  });
});
