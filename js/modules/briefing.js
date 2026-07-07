/**
 * Domaćinko - Proaktivni jutarnji brifing
 */

function generateMorningBriefing() {
  const settings = getSettings();
  let name = settings.firstName || settings.userName?.split(' ')[0] || 'prijatelju';
  if (typeof isLoggedIn === 'function' && isLoggedIn() && typeof getAuthDisplayName === 'function') {
    const display = getAuthDisplayName();
    if (display && display !== 'Korisnik') {
      name = display.split(' ')[0];
    }
  }
  const bullets = [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dobar dan' : 'Dobro veče';

  const expiring = typeof getExpiringWarranties === 'function' ? getExpiringWarranties(30) : [];
  expiring.slice(0, 2).forEach(item => {
    const days = Math.ceil((new Date(item.warrantyEnd) - new Date()) / (1000 * 60 * 60 * 24));
    bullets.push({ type: 'warn', icon: '🛡️', text: `Garancija za „${item.name}" ističe za ${days} dana.` });
  });

  getCategoryBudgetWarnings().forEach(w => {
    if (w.warning === 'exceeded') {
      bullets.push({ type: 'warn', icon: '💰', text: `Prekoračen budžet za ${w.label.toLowerCase()} — ${formatCurrency(w.spent)}.` });
    } else if (w.warning === 'near') {
      bullets.push({ type: 'warn', icon: '💰', text: `${w.label}: potrošeno ${w.pct}% budžeta.` });
    }
  });

  const maintenanceDue = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  maintenanceDue.slice(0, 2).forEach(t => {
    bullets.push({
      type: t.overdue ? 'warn' : 'info',
      icon: t.icon || '🏠',
      text: t.overdue ? `${t.name} — kasni!` : `${t.name} — za ${t.daysUntil} dana.`
    });
  });

  const shopping = getShoppingList().filter(i => !i.bought);
  if (shopping.length > 0) {
    bullets.push({ type: 'info', icon: '🛒', text: `${shopping.length} stavki na listi za kupovinu.` });
  }

  const patterns = typeof detectPurchasePatterns === 'function' ? detectPurchasePatterns() : [];
  if (patterns.length > 0) {
    const p = patterns[0];
    bullets.push({ type: 'tip', icon: '🔄', text: `Kupuješ „${p.name}" ${p.frequency} — možda treba na listu?` });
  }

  const safetyReminders = typeof getSafetyReminders === 'function' ? getSafetyReminders() : [];
  safetyReminders.slice(0, 1).forEach(r => {
    bullets.push({
      type: r.expired ? 'warn' : 'info',
      icon: '🚨',
      text: r.expired ? `${r.label} — isteklo!` : `${r.label} — proveri za ${r.days} dana.`
    });
  });

  const gardenReminders = typeof getGardenReminders === 'function' ? getGardenReminders() : [];
  if (gardenReminders.length > 0) {
    bullets.push({ type: 'info', icon: '🌿', text: `Bašta: ${gardenReminders.length} biljka čeka ${gardenReminders[0].action}.` });
  }

  const month = new Date().getMonth() + 1;
  const seasonal = typeof getSeasonalTasks === 'function' ? getSeasonalTasks(month) : [];
  const progress = typeof getSeasonalProgress === 'function' ? getSeasonalProgress(month) : {};
  const undone = seasonal.filter(t => !progress[t.id]);
  if (undone.length > 0) {
    bullets.push({ type: 'tip', icon: '📅', text: `Sezonski zadatak: ${undone[0].text}` });
  }

  const seasonalTips = {
    7: 'Leto je — proveri klimu i redovno zalivaj baštu.',
    11: 'Jesen — pripremi grejanje i proveri metlice.',
    12: 'Zima — proveri detektor dima i CO.',
    3: 'Proleće — idealno za prolećno čišćenje i baštu.'
  };
  if (seasonalTips[month] && bullets.length < 6) {
    bullets.push({ type: 'tip', icon: '💡', text: seasonalTips[month] });
  }

  if (bullets.length === 0) {
    bullets.push({ type: 'good', icon: '✨', text: 'Sve izgleda pod kontrolom — odličan dan!' });
  }

  return {
    greeting: `${greeting}, ${name}`,
    bullets: bullets.slice(0, 6),
    generatedAt: new Date().toISOString()
  };
}

function renderMorningBriefing(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const briefing = generateMorningBriefing();
  container.innerHTML = `
    <div class="briefing-card">
      <h2 class="briefing-card__title">☀️ ${briefing.greeting}</h2>
      <ul class="briefing-card__list">
        ${briefing.bullets.map(b => `
          <li class="briefing-card__item briefing-card__item--${b.type}">
            <span class="briefing-card__icon">${b.icon}</span>
            <span>${b.text}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}
