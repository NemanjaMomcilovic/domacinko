/**
 * Domaćinko - Proaktivni jutarnji brifing (digitalni domaćin)
 */

function getUpcomingBirthdays(withinDays = 14) {
  const household = getHousehold();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcoming = [];

  (household.familyMembers || []).forEach(m => {
    if (!m.birthday || !m.name) return;
    const bd = new Date(m.birthday);
    const thisYear = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
    let target = thisYear;
    if (thisYear < now) {
      target = new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate());
    }
    const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (days <= withinDays) {
      upcoming.push({ name: m.name, days });
    }
  });
  return upcoming.sort((a, b) => a.days - b.days);
}

function getProjectDeadlines() {
  const projects = typeof getProjects === 'function' ? getProjects() : [];
  const now = new Date();
  return projects
    .filter(p => p.status && p.status !== 'završeno' && p.deadline)
    .map(p => {
      const d = new Date(p.deadline);
      const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return { name: p.name, days, overdue: days < 0 };
    })
    .filter(p => p.overdue || p.days <= 14)
    .sort((a, b) => a.days - b.days);
}

function getWeeklySpendingSpike() {
  if (typeof getWeeklySpending !== 'function') return null;
  const days = getWeeklySpending();
  const amounts = days.map(d => d.amount).filter(a => a > 0);
  if (amounts.length < 3) return null;

  const total = amounts.reduce((s, a) => s + a, 0);
  const avg = total / amounts.length;
  const today = days.find(d => d.isToday);
  if (!today || today.amount <= 0) return null;

  if (today.amount > avg * 2 && today.amount > 2000) {
    return { today: today.amount, avg: Math.round(avg) };
  }

  const last3 = days.slice(-3).reduce((s, d) => s + d.amount, 0);
  const prev4 = days.slice(0, 4).reduce((s, d) => s + d.amount, 0);
  if (prev4 > 0 && last3 > prev4 * 1.5 && last3 > 5000) {
    return { spike: true, last3, prev4 };
  }
  return null;
}

function getHomemakerGreeting(name, hour) {
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  if (hour < 10) {
    return isWeekend
      ? `Dobro jutro, ${name} — vikend je za dom i porodicu ☕`
      : `Dobro jutro, ${name} — evo šta danas treba znati`;
  }
  if (hour < 18) return `Dobar dan, ${name}`;
  return `Dobro veče, ${name} — pregled dana`;
}

function generateMorningBriefing() {
  const settings = getSettings();
  let name = settings.firstName || settings.userName?.split(' ')[0] || 'prijatelju';
  if (typeof isLoggedIn === 'function' && isLoggedIn() && typeof getAuthDisplayName === 'function') {
    const display = getAuthDisplayName();
    if (display && display !== 'Korisnik') {
      name = display.split(' ')[0];
    }
  }
  if (typeof getActiveProfileName === 'function') {
    const profileName = getActiveProfileName();
    if (profileName && profileName !== 'Podrazumevani') {
      name = profileName.split(' ')[0] || name;
    }
  }

  const bullets = [];
  const now = new Date();
  const hour = now.getHours();
  const dayOfMonth = now.getDate();
  const greeting = getHomemakerGreeting(name, hour);

  const todaySpent = typeof getTodaySpending === 'function' ? getTodaySpending() : 0;
  if (todaySpent > 0) {
    bullets.push({ type: 'info', icon: '💸', text: `Danas već ${formatCurrency(todaySpent)} — držim računa za vas.` });
  }

  const usagePct = typeof getBudgetUsagePct === 'function' ? getBudgetUsagePct() : 0;
  const budget = settings.monthlyBudget || 0;
  if (budget > 0 && usagePct >= 90) {
    bullets.push({ type: 'warn', icon: '💰', text: `Budžet na ${usagePct}% — domaćica preporučuje pažnju do kraja meseca.` });
  } else if (budget > 0 && usagePct >= 70 && usagePct < 90) {
    bullets.push({ type: 'info', icon: '💰', text: `Potrošeno ${usagePct}% budžeta — još ste u sigurnoj zoni.` });
  }

  getCategoryBudgetWarnings().forEach(w => {
    if (w.warning === 'exceeded') {
      bullets.push({ type: 'warn', icon: '📊', text: `${w.label}: prekoračen limit (${w.pct}%) — razmislite o uštedi.` });
    } else if (w.warning === 'near') {
      bullets.push({ type: 'warn', icon: '📊', text: `${w.label} na ${w.pct}% budžeta — blizu limita.` });
    }
  });

  const savings = typeof getSavingsProgress === 'function' ? getSavingsProgress() : { goal: 0, pct: 0, goalName: '' };
  if (savings.goal > 0 && savings.goalName) {
    if (savings.pct >= 50) {
      bullets.push({ type: 'good', icon: '🎯', text: `Cilj „${savings.goalName}": ${savings.pct}% — odličan napredak!` });
    } else if (savings.pct > 0) {
      bullets.push({ type: 'tip', icon: '🎯', text: `Štednja ka „${savings.goalName}": ${savings.pct}% — svaki dinar se računa.` });
    }
  }

  const recurringReminders = typeof getRecurringReminders === 'function' ? getRecurringReminders() : [];
  if (recurringReminders.length > 0) {
    const names = recurringReminders.slice(0, 2).map(r => r.name).join(', ');
    bullets.push({
      type: 'warn',
      icon: '📄',
      text: recurringReminders.length === 1
        ? `Račun „${names}" još nije plaćen ovog meseca.`
        : `${recurringReminders.length} računa čeka plaćanje: ${names}.`
    });
  }

  const lowStock = typeof getLowStockPantry === 'function' ? getLowStockPantry() : [];
  if (lowStock.length > 0) {
    const names = lowStock.slice(0, 3).map(p => p.name).join(', ');
    bullets.push({
      type: 'warn',
      icon: '🥫',
      text: lowStock.length === 1
        ? `U ostavi ponestaje: ${names}.`
        : `Špajz: ${lowStock.length} stavki na minimumu (${names}).`
    });
  }

  const expiring = typeof getExpiringWarranties === 'function' ? getExpiringWarranties(30) : [];
  expiring.slice(0, 2).forEach(item => {
    const days = Math.ceil((new Date(item.warrantyEnd) - now) / (1000 * 60 * 60 * 24));
    bullets.push({ type: 'warn', icon: '🛡️', text: `Garancija „${item.name}" ističe za ${days} dana — sačuvajte račun.` });
  });

  const maintenanceDue = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  maintenanceDue.slice(0, 2).forEach(t => {
    bullets.push({
      type: t.overdue ? 'warn' : 'info',
      icon: t.icon || '🔧',
      text: t.overdue ? `${t.name} kasni — ne odlažite servis!` : `${t.name} za ${t.daysUntil} dana.`
    });
  });

  const shopping = getShoppingList().filter(i => !i.bought);
  if (shopping.length >= 8) {
    bullets.push({ type: 'info', icon: '🛒', text: `Lista za kupovinu ima ${shopping.length} stavki — možda je dan za nabavku.` });
  } else if (shopping.length > 0) {
    bullets.push({ type: 'info', icon: '🛒', text: `${shopping.length} stavki na listi — ${shopping[0].name}${shopping.length > 1 ? ' i još...' : ''}.` });
  }

  const safetyReminders = typeof getSafetyReminders === 'function' ? getSafetyReminders() : [];
  safetyReminders.slice(0, 2).forEach(r => {
    bullets.push({
      type: r.expired ? 'warn' : 'info',
      icon: '🚨',
      text: r.expired ? `${r.label} — isteklo, proverite odmah!` : `${r.label} — provera za ${r.days} dana.`
    });
  });

  const gardenReminders = typeof getGardenReminders === 'function' ? getGardenReminders() : [];
  if (gardenReminders.length > 0) {
    const overdue = gardenReminders.filter(r => r.overdue);
    if (overdue.length > 0) {
      bullets.push({ type: 'warn', icon: '🌿', text: `Bašta: ${overdue[0].plant} čeka zalivanje!` });
    } else {
      bullets.push({ type: 'info', icon: '🌿', text: `Bašta: ${gardenReminders.length} biljka — ${gardenReminders[0].action} danas.` });
    }
  }

  const spike = getWeeklySpendingSpike();
  if (spike?.spike) {
    bullets.push({ type: 'warn', icon: '📈', text: `Potrošnja u porastu poslednjih dana — ${formatCurrency(spike.last3)} vs ranije ${formatCurrency(spike.prev4)}.` });
  } else if (spike?.today) {
    bullets.push({ type: 'warn', icon: '📈', text: `Danas iznad proseka (${formatCurrency(spike.today)} vs ~${formatCurrency(spike.avg)}).` });
  }

  const birthdays = getUpcomingBirthdays(14);
  if (birthdays.length > 0) {
    const b = birthdays[0];
    bullets.push({
      type: b.days <= 3 ? 'warn' : 'info',
      icon: '🎂',
      text: b.days === 0
        ? `Danas je rođendan: ${b.name}! 🎉`
        : `Rođendan ${b.name} za ${b.days} dana — vreme za poklon ili plan.`
    });
  }

  const projectDeadlines = getProjectDeadlines();
  if (projectDeadlines.length > 0) {
    const p = projectDeadlines[0];
    bullets.push({
      type: p.overdue ? 'warn' : 'info',
      icon: '🛠️',
      text: p.overdue
        ? `Projekat „${p.name}" kasni — završite ili pomerite rok.`
        : `Projekat „${p.name}" — rok za ${p.days} dana.`
    });
  }

  const month = now.getMonth() + 1;
  const seasonalProgress = typeof getSeasonalProgress === 'function' ? getSeasonalProgress(month) : {};
  const hasSeasonalEngagement = Object.keys(seasonalProgress).length > 0;
  if (hasSeasonalEngagement) {
    const seasonal = typeof getSeasonalTasks === 'function' ? getSeasonalTasks(month) : [];
    const undone = seasonal.filter(t => !seasonalProgress[t.id]);
    if (undone.length > 0) {
      bullets.push({ type: 'tip', icon: '📅', text: `Sezonski posao: ${undone[0].text}` });
    }
  }

  const patterns = typeof detectPurchasePatterns === 'function' ? detectPurchasePatterns() : [];
  if (patterns.length > 0) {
    const p = patterns[0];
    bullets.push({ type: 'tip', icon: '🔄', text: `Često kupujete „${p.name}" (${p.frequency}) — dodajte na listu unapred.` });
  }

  const comparison = typeof getMonthComparison === 'function' ? getMonthComparison() : null;
  if (comparison && comparison.less && comparison.pct >= 10) {
    bullets.push({ type: 'good', icon: '✨', text: `Bravo! ${comparison.pct}% manje nego prošlog meseca.` });
  }

  const priority = { warn: 0, info: 1, tip: 2, good: 3 };
  bullets.sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9));

  return {
    greeting,
    bullets: bullets.slice(0, 8),
    isEmpty: bullets.length === 0,
    generatedAt: now.toISOString()
  };
}

function renderMorningBriefing(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const briefing = generateMorningBriefing();
  const timeStr = new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });

  const bodyHtml = briefing.isEmpty
    ? `
      <div class="briefing-card__empty">
        <p class="briefing-card__empty-text">Dodajte trošak, račun ili cilj u aplikaciji da vidite pregled.</p>
        <div class="briefing-card__empty-links">
          <a href="add-expense.html" class="briefing-card__empty-link">💸 Dodaj trošak</a>
          <a href="settings.html" class="briefing-card__empty-link">📄 Računi i ciljevi</a>
          <a href="maintenance.html" class="briefing-card__empty-link">🔧 Održavanje</a>
        </div>
      </div>
    `
    : `
      <ul class="briefing-card__list">
        ${briefing.bullets.map(b => `
          <li class="briefing-card__item briefing-card__item--${b.type}">
            <span class="briefing-card__icon">${b.icon}</span>
            <span>${b.text}</span>
          </li>
        `).join('')}
      </ul>
    `;

  container.innerHTML = `
    <div class="briefing-card briefing-card--hero">
      <h2 class="briefing-card__title">☀️ ${briefing.greeting}</h2>
      <p class="briefing-card__subtitle">Vaš digitalni domaćin · ${timeStr}</p>
      ${bodyHtml}
    </div>
  `;
}
