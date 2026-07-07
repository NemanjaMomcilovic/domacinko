const MONTH_NAMES = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

function renderForecast() {
  const month = parseInt(document.getElementById('forecast-month').value, 10);
  const year = parseInt(document.getElementById('forecast-year').value, 10);
  const costs = getUpcomingCosts(month, year);
  const total = costs.reduce((s, c) => s + (c.amount || 0), 0);
  const estimated = costs.filter(c => c.estimated).length;

  document.getElementById('forecast-total').textContent = formatCurrency(total);
  document.getElementById('forecast-note').textContent = estimated > 0
    ? `Uključuje ${estimated} procenjenih stavki`
    : `${costs.length} planiranih stavki`;

  const container = document.getElementById('forecast-calendar');
  if (costs.length === 0) {
    container.innerHTML = renderEmptyState('📅', 'Nema predviđenih troškova', 'Dodajte račune, aute i važne datume u Domaćinstvu.');
    return;
  }

  container.innerHTML = costs.map(c => `
    <div class="list-item">
      <div class="list-item__icon">${c.icon}</div>
      <div class="list-item__content">
        <div class="list-item__title">${c.name}${c.estimated ? ' <span class="badge badge--warning">procena</span>' : ''}</div>
        <div class="list-item__subtitle">${formatDate(c.date)} · ${c.type}</div>
      </div>
      <div class="list-item__amount">${formatCurrency(c.amount)}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('finances', { title: 'Prognoza troškova', showBack: true, backHref: 'finances.html' });

  const now = new Date();
  const monthSel = document.getElementById('forecast-month');
  const yearSel = document.getElementById('forecast-year');

  MONTH_NAMES.forEach((name, i) => {
    monthSel.innerHTML += `<option value="${i}"${i === now.getMonth() ? ' selected' : ''}>${name}</option>`;
  });
  for (let y = now.getFullYear(); y <= now.getFullYear() + 1; y++) {
    yearSel.innerHTML += `<option value="${y}"${y === now.getFullYear() ? ' selected' : ''}>${y}</option>`;
  }

  monthSel.addEventListener('change', renderForecast);
  yearSel.addEventListener('change', renderForecast);
  renderForecast();
});
