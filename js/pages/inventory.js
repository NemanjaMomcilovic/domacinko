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

function renderMagazineList(query, categoryId) {
  const container = document.getElementById('magazine-list');
  if (!container) return;

  let items = query ? searchMagazine(query) : getHomeMagazine();
  if (categoryId) items = items.filter(i => i.category === categoryId);

  if (items.length === 0) {
    container.innerHTML = renderEmptyState('🏪', 'Magacin je prazan', 'Dodajte sijalice, boju, šrafove...');
    return;
  }

  container.innerHTML = items.map(item => {
    const cat = MAGAZINE_CATEGORIES.find(c => c.id === item.category);
    const qty = parseFloat(item.quantity);
    const lowStock = qty <= 2;
    return `
      <div class="list-item${lowStock ? ' list-item--warn' : ''}">
        <div class="list-item__icon">${cat?.icon || '📦'}</div>
        <div class="list-item__content">
          <div class="list-item__title">${item.name}</div>
          <div class="list-item__subtitle">${cat?.label || 'Ostalo'} · ${item.quantity} ${item.unit}${item.location ? ` · ${item.location}` : ''}</div>
          ${lowStock ? '<span class="badge badge--warning">Niska zaliha</span>' : ''}
        </div>
        <button class="btn btn--ghost btn--sm del-mag" data-id="${item.id}">✕</button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.del-mag').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteMagazineItem(btn.dataset.id);
      renderMagazineList(
        document.getElementById('magazine-search')?.value,
        document.getElementById('mag-category-filter')?.value
      );
      renderMagazineLowStock();
      showToast('Uklonjeno iz magacina.');
    });
  });
}

function renderMagazineLowStock() {
  const el = document.getElementById('magazine-low-stock');
  if (!el || typeof getLowStockMagazine !== 'function') return;

  const low = getLowStockMagazine(2);
  if (low.length === 0) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="reminder-item reminder-item--warn">
      <span class="reminder-item__icon">⚠️</span>
      <span><strong>Niska zaliha:</strong> ${low.map(i => `${i.name} (${i.quantity})`).join(', ')}</span>
    </div>
  `;
}

function renderMagazineCategoryFilters() {
  const container = document.getElementById('magazine-categories');
  if (!container) return;

  container.innerHTML = `
    <div class="fav-chips mb-sm">
      <button type="button" class="fav-chip mag-cat active" data-cat="">Sve</button>
      ${MAGAZINE_CATEGORIES.map(c =>
        `<button type="button" class="fav-chip mag-cat" data-cat="${c.id}">${c.icon} ${c.label}</button>`
      ).join('')}
    </div>
    <input type="hidden" id="mag-category-filter" value="">
  `;

  container.querySelectorAll('.mag-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.mag-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('mag-category-filter').value = btn.dataset.cat;
      renderMagazineList(document.getElementById('magazine-search')?.value, btn.dataset.cat);
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
    renderMagazineCategoryFilters();
    renderMagazineList();
    renderMagazineLowStock();
    document.getElementById('magazine-search')?.addEventListener('input', e => {
      renderMagazineList(e.target.value, document.getElementById('mag-category-filter')?.value);
    });
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
      renderMagazineList(
        document.getElementById('magazine-search')?.value,
        document.getElementById('mag-category-filter')?.value
      );
      renderMagazineLowStock();
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
