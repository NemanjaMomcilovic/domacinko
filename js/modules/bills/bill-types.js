/**
 * Domaćinko — tipovi komunalija (struja, voda, …)
 * Stabilan katalog: id, label, icon, default expense category.
 */

const BILL_TYPES = [
  { id: 'struja', label: 'Struja', icon: '⚡', category: 'bills' },
  { id: 'voda', label: 'Voda', icon: '💧', category: 'bills' },
  { id: 'grejanje', label: 'Grejanje', icon: '🔥', category: 'bills' },
  { id: 'internet', label: 'Internet', icon: '🌐', category: 'bills' },
  { id: 'stanarina', label: 'Stanarina', icon: '🏠', category: 'bills' },
  { id: 'drugo', label: 'Drugo', icon: '📄', category: 'bills' }
];

const BILL_RECURRENCE = [
  { id: 'ask', label: 'Pitaj me svaki mesec', desc: 'Brifing te podseti da uneseš račun' },
  { id: 'auto', label: 'Automatski', desc: 'Svaki mesec kreira pending unos' },
  { id: 'off', label: 'Bez podsetnika', desc: 'Samo ručni unos' }
];

const BILL_STATUS = {
  pending: { id: 'pending', label: 'Čeka unos', badge: 'badge--warning' },
  unpaid: { id: 'unpaid', label: 'Neplaćeno', badge: 'badge--danger' },
  paid: { id: 'paid', label: 'Plaćeno', badge: 'badge--success' },
  skipped: { id: 'skipped', label: 'Preskočeno', badge: '' }
};

function getBillType(typeId) {
  return BILL_TYPES.find(t => t.id === typeId) || BILL_TYPES[BILL_TYPES.length - 1];
}

function getBillTypeLabel(typeId, customLabel) {
  if (customLabel && String(customLabel).trim()) return String(customLabel).trim();
  return getBillType(typeId).label;
}

function getCurrentBillPeriod(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatBillPeriod(period) {
  if (!period || !/^\d{4}-\d{2}$/.test(period)) return period || '';
  const [y, m] = period.split('-');
  const months = [
    'januar', 'februar', 'mart', 'april', 'maj', 'jun',
    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
  ];
  return `${months[Number(m) - 1] || m} ${y}`;
}
