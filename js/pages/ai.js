/**
 * Domaćinko — 10KEY Savetnik (lokalni intent engine) + opcioni GPT-4o
 */

const OPENAI_MODEL = 'gpt-4o';
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const AI_INTENTS = [
  { id: 'greeting', score: (t) => /^(zdravo|ćao|cao|pozdrav|hej|dobro|dobar|čao)\b/.test(t) ? 3 : 0 },
  { id: 'spending_top', score: (t) => /gde\s+najviše|najviše\s+troš|najvise\s+tros|top\s+kategorij/.test(t) ? 4 : 0 },
  { id: 'spending_today', score: (t) => /koliko\s+(sam\s+)?(potro|tros).*(danas|danasnj)|danas.*(potro|tros)|trošk.*danas/.test(t) ? 5 : 0 },
  { id: 'recent_expenses', score: (t) => /poslednj|nedavn|skorašnj|skorasnj.*trošk|lista\s+trošk/.test(t) ? 4 : 0 },
  { id: 'spending_total', score: (t) => (/koliko\s+(sam\s+)?(potro|tros)|ukupn.*trošk|potrošeno\s+ovog/.test(t) && !/danas/.test(t)) ? 4 : 0 },
  { id: 'budget_remaining', score: (t) => /koliko\s+(mi\s+)?(je\s+)?(ostalo|preostalo|ima)|preostali\s+budžet/.test(t) ? 4 : 0 },
  { id: 'budget_categories', score: (t) => /budžet|budzet|kategorij|prekorač/.test(t) ? 3 : 0 },
  { id: 'savings', score: (t) => /ušted|usted|šted|sted|cilj\s+šted/.test(t) ? 3 : 0 },
  { id: 'cook_today', score: (t) => /šta\s+da\s+kuvam|sta\s+da\s+kuvam|obrok\s+danas|večera\s+danas|ručak\s+danas|šta\s+kuvati/.test(t) ? 5 : 0 },
  { id: 'meal_plan', score: (t) => /plan\s+obroka|nedelj.*obrok|meni/.test(t) ? 3 : 0 },
  { id: 'shopping_list', score: (t) => /šta\s+(da\s+)?kupim|sta\s+(da\s+)?kupim|lista\s+za\s+kupovinu|na\s+listi|kupovin/.test(t) ? 4 : 0 },
  { id: 'add_shopping', score: (t) => /dodaj\s+.+\s+(na\s+listu|u\s+kupovinu)|stavi\s+.+\s+na\s+listu/.test(t) ? 5 : 0 },
  { id: 'maintenance_due', score: (t) => /šta\s+kasni|sta\s+kasni|na\s+redu\s+za\s+održ|održavan|odrzavan|servis|šta\s+treba\s+u\s+kući/.test(t) ? 4 : 0 },
  { id: 'recurring_bills', score: (t) => /mesečn.*račun|ponavljajuć|fiksni\s+trošk|pretplat/.test(t) ? 3 : 0 },
  { id: 'forecast', score: (t) => /prognoz|predstojeć|predstojec|sledeć.*trošk/.test(t) ? 3 : 0 },
  { id: 'energy', score: (t) => /struj|elektr|energi/.test(t) ? 3 : 0 },
  { id: 'heating', score: (t) => /grejan|grejanje|radijator|kotao/.test(t) ? 3 : 0 },
  { id: 'gas', score: (t) => /\bgas\b/.test(t) ? 3 : 0 },
  { id: 'water', score: (t) => /voda|vodu|bojler|slavina/.test(t) ? 2 : 0 },
  { id: 'pantry', score: (t) => /ostav|namirnic|šta\s+imam\s+za\s+jelo/.test(t) ? 3 : 0 },
  { id: 'tasks', score: (t) => /zadatak|task|podsetnik/.test(t) ? 3 : 0 },
  { id: 'tools', score: (t) => /\balat/.test(t) ? 2 : 0 },
  { id: 'magazine', score: (t) => /magacin|sijalic|inventar/.test(t) ? 2 : 0 },
  { id: 'repairs', score: (t) => /poprav|majstor|kvar|pokvar/.test(t) ? 3 : 0 },
  { id: 'household', score: (t) => /porodic|članov|domaćinstv|auto\b|ljubim/.test(t) ? 2 : 0 },
  { id: 'briefing', score: (t) => /brifing|pregled\s+dana|šta\s+danas|sta\s+danas|sažetak/.test(t) ? 4 : 0 },
  { id: 'comparison', score: (t) => /prošl.*mesec|poređenje|više\s+nego\s+prošl/.test(t) ? 3 : 0 },
  { id: 'health_score', score: (t) => /finansijsko\s+zdravlje|zdravlje\s+budžet|ocena\s+budžet/.test(t) ? 3 : 0 }
];

function escapeChatHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatChatText(text) {
  return escapeChatHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function hasOpenAIKey() {
  const key = getSettings().apiKey;
  return Boolean(key && key.trim());
}

function getOpenAIModel() {
  return OPENAI_MODEL;
}

function getTodayMealKey() {
  return DAY_KEYS[new Date().getDay()];
}

function getTodayMeal() {
  const plan = getMealPlan();
  const key = getTodayMealKey();
  return (plan[key] || '').trim();
}

function detectIntent(message) {
  const t = message.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalized = t
    .replace(/ć/g, 'c').replace(/č/g, 'c').replace(/š/g, 's')
    .replace(/ž/g, 'z').replace(/đ/g, 'dj');

  let best = { id: 'general', score: 0 };
  AI_INTENTS.forEach(intent => {
    const score = intent.score(normalized);
    if (score > best.score) best = { id: intent.id, score };
  });
  return best.id;
}

function buildRichContextBlock() {
  const ctx = typeof buildFullAIContext === 'function' ? buildFullAIContext() : {};
  const finance = ctx.finance || {};
  const settings = finance.settings || getSettings();
  const now = new Date();
  const budget = finance.budget ?? settings.monthlyBudget ?? 0;
  const spent = finance.spent ?? getTotalSpent(now.getFullYear(), now.getMonth());
  const remaining = finance.remaining ?? (budget - spent);
  const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const savings = typeof getSavingsProgress === 'function' ? getSavingsProgress() : {};
  const recurring = typeof getRecurringExpenses === 'function' ? getRecurringExpenses() : [];
  const reminders = typeof getRecurringReminders === 'function' ? getRecurringReminders() : [];
  const todayMeal = getTodayMeal();
  const mealPlan = getMealPlan();
  const plannedMeals = Object.values(mealPlan).filter(m => m && m.trim()).length;
  const shopping = getShoppingList().filter(i => !i.bought);
  const dueMaint = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  const overdueMaint = dueMaint.filter(t => t.overdue);
  const pantryLow = typeof getLowStockPantry === 'function' ? getLowStockPantry() : [];
  const tasks = getTasks().filter(t => !t.done);
  const comparison = typeof getMonthComparison === 'function' ? getMonthComparison() : null;
  const household = typeof getHousehold === 'function' ? getHousehold() : {};
  const profile = ctx.houseProfile || (typeof getHouseProfile === 'function' ? getHouseProfile() : {});

  const topCats = Object.entries(
    typeof getSpendingByCategory === 'function'
      ? getSpendingByCategory(now.getFullYear(), now.getMonth())
      : {}
  )
    .filter(([, a]) => a > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, amt]) => `${getCategoryLabel(id)}: ${formatCurrency(amt)}`);

  const lines = [
    `Korisnik: ${settings.userName || settings.firstName || 'korisnik'}`,
    `Budžet: ${formatCurrency(budget)} | Potrošeno: ${formatCurrency(spent)} (${budgetPct}%) | Preostalo: ${formatCurrency(remaining)}`,
    `Finansijsko zdravlje: ${finance.score ?? getFinancialHealthScore()}/100`,
    topCats.length ? `Top troškovi: ${topCats.join(', ')}` : 'Top troškovi: nema unosa ovog meseca',
    comparison?.text ? `Poređenje: ${comparison.text}` : null,
    savings.goalName ? `Cilj štednje „${savings.goalName}": ${savings.pct}% (${formatCurrency(savings.saved)}/${formatCurrency(savings.goal)})` : null,
    `Danas za ručak/večeru: ${todayMeal || 'nije planirano'} | Plan obroka: ${plannedMeals}/7 dana`,
    shopping.length ? `Lista za kupovinu (${shopping.length}): ${shopping.slice(0, 8).map(i => i.name).join(', ')}` : 'Lista za kupovinu: prazna',
    dueMaint.length ? `Održavanje na redu (${overdueMaint.length} kasni): ${dueMaint.slice(0, 5).map(t => `${t.name}${t.overdue ? ' [KASNI]' : ''}`).join(', ')}` : 'Održavanje: sve na vreme',
    pantryLow.length ? `Ostava na isteku: ${pantryLow.map(p => p.name).join(', ')}` : null,
    tasks.length ? `Otvoreni zadaci: ${tasks.slice(0, 4).map(t => t.text).join(', ')}` : null,
    recurring.length ? `Mesečni računi: ${recurring.map(r => `${r.name} ${formatCurrency(r.amount)}`).join(', ')}` : null,
    reminders.length ? `Podsetnici računa: ${reminders.slice(0, 3).map(r => `${r.name} do ${r.dayOfMonth}.`).join(', ')}` : null,
    `Kuća: ${profile.squareMeters || '?'}m², ${profile.heatingType || 'nepoznato grejanje'}, ${profile.homeType || 'tip nepoznat'}`,
    household.familyMembers?.length ? `Članovi domaćinstva: ${household.familyMembers.length}` : null,
    ctx.tools?.count ? `Alati: ${(ctx.tools.tools || []).slice(0, 6).join(', ')}` : null
  ].filter(Boolean);

  return lines.join('\n');
}

function buildOpenAISystemPrompt() {
  const context = buildRichContextBlock();
  return `Ti si 10KEY Savetnik — proaktivni asistent za domaćinstvo u aplikaciji Domaćinko.
Govoriš toplo, jasno i praktično na srpskom (latinica). Kratki odgovori (2-5 rečenica) osim ako korisnik traži detalje.
Koristi podatke korisnika ispod — ne izmišljaj brojeve. Ako nema podataka, predloži šta da unese u app.
Za opasne situacije (gas, struja, voda) uvek naglasi bezbednost i kada zvati majstora.
Možeš predložiti akcije: „Dodaj na listu: mleko" ili link ka modulu (Kupovina, Održavanje, Finansije).

PODACI KORISNIKA:
${context}`;
}

function getProactiveWelcome() {
  const settings = getSettings();
  const name = settings.firstName || settings.userName?.split(' ')[0] || 'prijatelju';
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const tips = [];

  if (typeof generateMorningBriefing === 'function') {
    const briefing = generateMorningBriefing();
    (briefing.bullets || []).slice(0, 2).forEach(b => {
      if (b?.text) tips.push(b.text.replace(/<[^>]+>/g, ''));
    });
  }

  const due = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  const overdue = due.filter(t => t.overdue);
  if (overdue.length > 0) {
    tips.push(`⚠️ Kasni: ${overdue.slice(0, 2).map(t => t.name).join(', ')}`);
  }

  const todayMeal = getTodayMeal();
  if (todayMeal) tips.push(`🍽️ Danas planirano: ${todayMeal}`);

  const shopping = getShoppingList().filter(i => !i.bought);
  if (shopping.length > 0) tips.push(`🛒 ${shopping.length} stavki na listi za kupovinu`);

  const remaining = budget - spent;
  let budgetLine = budget > 0
    ? `Potrošeno ${formatCurrency(spent)} od ${formatCurrency(budget)}`
    : 'Postavite budžet u profilu za personalizovane savete';

  if (budget > 0 && remaining < 0) {
    tips.push(`Budžet prekoračen za ${formatCurrency(Math.abs(remaining))}`);
  }

  const mode = hasOpenAIKey()
    ? `Napredni režim (GPT-4o) je uključen`
    : `🧠 10KEY Savetnik — besplatno, radi odmah i offline`;
  let welcome = `${getGreeting()}, ${name}! Ja sam **10KEY Savetnik**, vaš kućni asistent.\n${mode}.\n${budgetLine}.`;

  if (tips.length > 0) {
    welcome += '\n\n' + tips.map(t => `• ${t}`).join('\n');
  } else {
    welcome += '\n\nPitajte o budžetu, današnjim troškovima, kuvanju, kupovini ili održavanju — odgovaram iz vaših podataka.';
  }

  return welcome;
}

function renderAIStatus() {
  const el = document.getElementById('ai-status');
  if (!el) return;

  if (hasOpenAIKey()) {
    el.className = 'ai-status ai-status--openai';
    el.innerHTML = `<span>🧠 <strong>10KEY Savetnik</strong> + <span class="ai-status__addon">Napredni režim (GPT-4o)</span></span>`;
    return;
  }

  el.className = 'ai-status ai-status--local';
  el.innerHTML = `<span>🧠 <strong>10KEY Savetnik</strong> — besplatno, koristi vaše podatke, radi offline</span>`;
}

function parseOpenAIError(response, error) {
  if (!navigator.onLine) return 'Nema internet konekcije. Koristim 10KEY Savetnik.';
  if (response?.status === 401) return 'Neispravan OpenAI ključ. Proverite u Više → Napredno → Napredni režim.';
  if (response?.status === 429) return 'Previše zahteva. Sačekajte minut i pokušajte ponovo.';
  if (response?.status === 403) return 'OpenAI odbio zahtev — proverite kredit na nalogu.';
  if (error?.message?.includes('Failed to fetch')) return 'Mreža nedostupna. Koristim 10KEY Savetnik.';
  return 'OpenAI trenutno nedostupan. Koristim 10KEY Savetnik.';
}

function parseShoppingAction(message) {
  const m = message.match(/(?:dodaj|stavi)\s+(.+?)\s+(?:na\s+listu|u\s+kupovinu)/i);
  if (m) return m[1].trim();
  const m2 = message.match(/^dodaj\s+(.+)/i);
  if (m2 && !/trošak|trosak|zadatak|podsetnik/i.test(message)) return m2[1].trim();
  return null;
}

function extractSuggestedActions(message, response) {
  const actions = [];
  const item = parseShoppingAction(message);
  if (item) {
    actions.push({ type: 'shopping', label: `Dodaj „${item}" na listu`, payload: item });
  }
  const listMatch = response.match(/dodaj\s+na\s+listu[:\s]+([^.!\n]+)/i);
  if (listMatch && !item) {
    actions.push({ type: 'shopping', label: `Dodaj „${listMatch[1].trim()}"`, payload: listMatch[1].trim() });
  }
  if (/održavanje|odrzavanje|servis/i.test(response) && /kasni|na redu/i.test(response)) {
    actions.push({ type: 'link', label: 'Otvori Održavanje', href: 'maintenance.html' });
  }
  if (/lista\s+za\s+kupovinu|kupovin/i.test(response)) {
    actions.push({ type: 'link', label: 'Otvori Kupovinu', href: 'shopping.html' });
  }
  if (/finansij|budžet|budzet|trošk/i.test(response)) {
    actions.push({ type: 'link', label: 'Otvori Finansije', href: 'finances.html' });
  }
  if (/plan\s+obroka|obrok|kuvam/i.test(response)) {
    actions.push({ type: 'link', label: 'Plan obroka', href: 'meal-plan.html' });
  }
  if (/trošak|dodaj\s+trošak/i.test(response)) {
    actions.push({ type: 'link', label: 'Dodaj trošak', href: 'add-expense.html' });
  }
  return actions.slice(0, 3);
}

function renderActionBar(actions) {
  if (!actions.length) return '';
  return `<div class="chat-actions">${actions.map(a => {
    if (a.type === 'link') {
      return `<a href="${a.href}" class="chat-action-btn">${a.label}</a>`;
    }
    return `<button type="button" class="chat-action-btn" data-action="shopping" data-payload="${escapeChatHtml(a.payload)}">${a.label}</button>`;
  }).join('')}</div>`;
}

function handleChatActions(container) {
  container.querySelectorAll('[data-action="shopping"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.payload;
      if (name && typeof addShoppingItem === 'function') {
        addShoppingItem(name.charAt(0).toUpperCase() + name.slice(1));
        showToast(`Dodato na listu: ${name}`, 'success');
        btn.disabled = true;
        btn.textContent = '✓ Dodato';
      }
    });
  });
}

/* ─── Local intent handlers ─── */

function respondGreeting(ctx) {
  const name = ctx.advisor.settings?.userName || ctx.advisor.name || 'prijatelju';
  const profile = ctx.profile;
  const heating = profile.heatingType || 'nepoznato';
  const sqm = profile.squareMeters || 0;
  let extra = sqm > 0 ? ` Kuća ${sqm}m², grejanje: ${heating}.` : '';
  return `${getGreeting()}, ${name}! 💚 Potrošeno ${formatCurrency(ctx.advisor.spent)} od ${formatCurrency(ctx.advisor.budget)}.${extra} Kako mogu da pomognem?`;
}

function respondCookToday(ctx) {
  const today = getTodayMeal();
  if (today) return `Danas je planirano: **${today}**. Pogledajte Plan obroka za ceo meni. 🍽️`;
  const suggestion = typeof suggestMealsFromPantry === 'function' ? suggestMealsFromPantry() : null;
  if (suggestion?.suggestions?.length) {
    return `Nemate plan za danas. Iz ostave možete: ${suggestion.suggestions.slice(0, 3).join(', ')}.`;
  }
  const pantry = getPantryItems();
  if (pantry.length === 0) return 'Ostava je prazna — dodajte namirnice u Domaćinstvo, pa planirajte obrok.';
  return `Danas nije planiran obrok. U ostavi imate: ${pantry.slice(0, 6).map(p => p.name).join(', ')}. Šta vas muči da skuvate?`;
}

function respondBriefing() {
  if (typeof generateMorningBriefing !== 'function') {
    return getProactiveWelcome();
  }
  const b = generateMorningBriefing();
  const lines = [b.greeting || 'Pregled dana:'];
  (b.bullets || []).slice(0, 5).forEach(bullet => {
    if (bullet?.text) lines.push(`• ${bullet.text.replace(/<[^>]+>/g, '')}`);
  });
  return lines.join('\n');
}

function getSmartResponse(message) {
  const intent = detectIntent(message);
  const ctx = typeof buildFullAIContext === 'function' ? buildFullAIContext() : null;
  const advisor = ctx ? {
    settings: ctx.finance?.settings || getSettings(),
    spent: ctx.finance?.spent ?? getTotalSpent(new Date().getFullYear(), new Date().getMonth()),
    budget: ctx.finance?.budget ?? getSettings().monthlyBudget,
    remaining: ctx.finance?.remaining ?? 0,
    score: ctx.finance?.score ?? getFinancialHealthScore(),
    name: ctx.finance?.settings?.userName
  } : buildHouseholdContext();
  const profile = ctx?.houseProfile || (typeof getHouseProfile === 'function' ? getHouseProfile() : {});
  const wrap = { advisor, profile, ctx };
  const lower = message.toLowerCase();

  const addItem = parseShoppingAction(message);
  if (addItem) {
    if (typeof addShoppingItem === 'function') {
      addShoppingItem(addItem.charAt(0).toUpperCase() + addItem.slice(1));
      return `Dodato na listu za kupovinu: **${addItem}** 🛒`;
    }
    return `Da dodam „${addItem}" na listu, idite u Kupovina.`;
  }

  switch (intent) {
    case 'greeting': return respondGreeting(wrap);
    case 'briefing': return respondBriefing();
    case 'cook_today': return respondCookToday(wrap);
    case 'meal_plan': {
      const plan = getMealPlan();
      const days = { mon: 'Pon', tue: 'Uto', wed: 'Sre', thu: 'Čet', fri: 'Pet', sat: 'Sub', sun: 'Ned' };
      const entries = Object.entries(days).filter(([k]) => plan[k]?.trim()).map(([k, label]) => `${label}: ${plan[k]}`);
      return entries.length ? `Plan obroka:\n${entries.join('\n')}` : 'Plan obroka je prazan — dodajte obroke u Plan obroka.';
    }
    case 'spending_top': {
      const byCat = getSpendingByCategory(new Date().getFullYear(), new Date().getMonth());
      const top = Object.entries(byCat).filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]);
      if (!top.length) return 'Još nema troškova ovog meseca — odličan početak! 💚';
      const [catId, amount] = top[0];
      const pct = advisor.spent > 0 ? Math.round((amount / advisor.spent) * 100) : 0;
      const rest = top.slice(1, 3).map(([id, amt]) => `${getCategoryLabel(id).toLowerCase()} ${formatCurrency(amt)}`).join(', ');
      return `Najviše trošite na **${getCategoryLabel(catId).toLowerCase()}** — ${formatCurrency(amount)} (${pct}%).${rest ? ` Zatim: ${rest}.` : ''}`;
    }
    case 'spending_today': {
      const todaySpent = typeof getTodaySpending === 'function' ? getTodaySpending() : 0;
      const today = new Date().toISOString().split('T')[0];
      const todayItems = getExpenses().filter(e => e.date === today);
      if (!todayItems.length) return `Danas još nema unetih troškova. 💚 Mesečno: ${formatCurrency(advisor.spent)} od ${formatCurrency(advisor.budget)}.`;
      const list = todayItems.slice(0, 5).map(e => `${e.name} ${formatCurrency(e.amount)}`).join(', ');
      return `Danas ste potrošili **${formatCurrency(todaySpent)}**: ${list}.${todayItems.length > 5 ? ` (+${todayItems.length - 5} još)` : ''}`;
    }
    case 'recent_expenses': {
      const recent = getExpenses().slice(0, 6);
      if (!recent.length) return 'Nema unetih troškova — dodajte prvi u Finansijama.';
      return `Poslednji troškovi:\n${recent.map(e => `• ${e.name} — ${formatCurrency(e.amount)} (${e.date})`).join('\n')}`;
    }
    case 'spending_total':
      return `Ovog meseca: **${formatCurrency(advisor.spent)}** troškova. Finansijsko zdravlje: **${advisor.score}/100**.`;
    case 'budget_remaining':
      if (advisor.remaining >= 0) {
        return `Od budžeta ${formatCurrency(advisor.budget)} ostalo je **${formatCurrency(advisor.remaining)}**. 💚`;
      }
      return `Budžet prekoračen za **${formatCurrency(Math.abs(advisor.remaining))}**. Razmislite o smanjenju troškova.`;
    case 'budget_categories': {
      const warnings = typeof getCategoryBudgetStatus === 'function' ? getCategoryBudgetStatus().filter(c => c.warning) : [];
      if (warnings.length) {
        const w = warnings[0];
        return `⚠️ **${w.label}** je na ${w.pct}% budžeta (${formatCurrency(w.spent)} / ${formatCurrency(w.budget)}).`;
      }
      const byCat = getSpendingByCategory(new Date().getFullYear(), new Date().getMonth());
      const top = Object.entries(byCat).filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (!top.length) return 'Nema troškova — postavite budžet po kategorijama u Naprednom.';
      return `Top kategorije: ${top.map(([id, amt]) => `${getCategoryLabel(id).toLowerCase()} ${formatCurrency(amt)}`).join(', ')}.`;
    }
    case 'savings': {
      const s = getSavingsProgress();
      if (!s.goalName) return 'Postavite cilj štednje u profilu — pratite napredak ovde.';
      return `Cilj „${s.goalName}": **${s.pct}%** (${formatCurrency(s.saved)} od ${formatCurrency(s.goal)}).${s.remaining > 0 ? ` Još ${formatCurrency(s.remaining)} do cilja.` : ' Cilj dostignut! 🎉'}`;
    }
    case 'shopping_list': {
      const shopping = getShoppingList().filter(i => !i.bought);
      if (!shopping.length) return 'Lista za kupovinu je prazna. Recite „dodaj mleko na listu" ili planirajte obroke.';
      return `Na listi (${shopping.length}): ${shopping.slice(0, 10).map(i => i.name).join(', ')}. 🛒`;
    }
    case 'maintenance_due': {
      const due = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
      if (!due.length) return 'Sve je na vreme u kući! ✅ Nema kasnih servisa.';
      const overdue = due.filter(t => t.overdue);
      let msg = overdue.length
        ? `**Kasni (${overdue.length}):** ${overdue.map(t => t.name).join(', ')}.\n`
        : '';
      const upcoming = due.filter(t => !t.overdue).slice(0, 3);
      if (upcoming.length) msg += `Na redu: ${upcoming.map(t => `${t.name} (za ${t.daysUntil} d)`).join(', ')}.`;
      return msg || 'Proverite sekciju Održavanje.';
    }
    case 'recurring_bills': {
      const rec = getRecurringExpenses();
      const rem = getRecurringReminders();
      if (!rec.length) return 'Nema mesečnih računa — dodajte struju, internet u Naprednom → Mesečni računi.';
      const total = rec.reduce((s, r) => s + r.amount, 0);
      let msg = `Mesečni fiksni troškovi (~${formatCurrency(total)}): ${rec.map(r => r.name).join(', ')}.`;
      if (rem.length) msg += `\nPodsetnici: ${rem.slice(0, 3).map(r => `${r.name} do ${r.dayOfMonth}.`).join(', ')}.`;
      return msg;
    }
    case 'forecast': {
      const costs = typeof getUpcomingCosts === 'function' ? getUpcomingCosts() : [];
      if (!costs.length) return 'Nema predstojećih troškova — dodajte račune u Domaćinstvu.';
      const total = costs.reduce((s, c) => s + (c.amount || 0), 0);
      return `Predstoje ~${formatCurrency(total)}: ${costs.slice(0, 4).map(c => `${c.name} ${formatCurrency(c.amount)}`).join(', ')}.`;
    }
    case 'health_score':
      return `Finansijsko zdravlje: **${advisor.score}/100**. Potrošeno ${formatCurrency(advisor.spent)} od ${formatCurrency(advisor.budget)}.`;
    case 'comparison': {
      const cmp = getMonthComparison();
      return cmp ? cmp.text + ' 💚' : 'Nema dovoljno podataka za poređenje sa prošlim mesecom.';
    }
    case 'energy': {
      const heating = profile.heatingType || 'nepoznato';
      let tip = 'Za manji račun: LED sijalice, isključite standby, bojler planski, klima 24–25°C leti.';
      if (heating === 'electric' || heating === 'struja') tip += ' Električno grejanje — spustite termostat noću za 2°C.';
      return tip;
    }
    case 'heating': {
      const heating = profile.heatingType || 'nepoznato';
      const season = [10, 11, 0, 1, 2].includes(new Date().getMonth());
      return `Grejanje (${heating}): termostat max 21°C, prozori zaptiveni.${season ? ' Sezona — proverite kotao.' : ''} Ušteda do 15%.`;
    }
    case 'gas':
      return 'Gas: proverite ventil i curenje sapunskom vodom. Miris gasa — provetravajte, zovite hitnu, ne palite svetlo.';
    case 'water':
      if (lower.includes('bojler')) {
        const due = (typeof getDueMaintenance === 'function' ? getDueMaintenance() : []).find(t => t.name.toLowerCase().includes('bojler'));
        if (due) return `Bojler: ${due.overdue ? 'servis kasni!' : `servis za ${due.daysUntil} dana.`} Palite planski, ne 24/7.`;
      }
      return 'Manji račun za vodu: popravite slavine, skratite tuš, veš mašina kad je puna.';
    case 'pantry': {
      const low = typeof getLowStockPantry === 'function' ? getLowStockPantry() : [];
      if (low.length) return `U ostavi na isteku: ${low.map(p => p.name).join(', ')}.`;
      const pantry = getPantryItems();
      if (!pantry.length) return 'Ostava prazna — dodajte namirnice u Domaćinstvo.';
      return `U ostavi: ${pantry.slice(0, 8).map(p => p.name).join(', ')}.`;
    }
    case 'tasks': {
      const tasks = getTasks().filter(t => !t.done);
      if (!tasks.length) return 'Nema otvorenih zadataka — uživajte! ✅';
      return `Zadaci: ${tasks.slice(0, 5).map(t => t.text).join(', ')}.`;
    }
    case 'tools': {
      const tools = typeof getTools === 'function' ? getTools() : [];
      if (!tools.length) return 'Nemate evidentiranih alata — dodajte u sekciju Alati.';
      return `Vaši alati: ${tools.slice(0, 8).map(t => t.name).join(', ')}.`;
    }
    case 'magazine': {
      const mag = typeof getHomeMagazine === 'function' ? getHomeMagazine() : [];
      if (!mag.length) return 'Kućni magacin prazan — dodajte sijalice i materijal u Inventar.';
      return `Magacin: ${mag.slice(0, 6).map(i => i.name).join(', ')}.`;
    }
    case 'repairs':
      return 'Za popravke otvorite tab **Majstor** — opišite problem za korak-po-korak savet! 🔧';
    case 'household': {
      const h = getHousehold();
      const parts = [];
      if (h.familyMembers?.length) parts.push(`${h.familyMembers.length} članova`);
      if (h.pets?.length) parts.push(`${h.pets.length} ljubimaca`);
      if (h.cars?.length) parts.push(`${h.cars.length} vozila`);
      return parts.length ? `Domaćinstvo: ${parts.join(', ')}.` : 'Dodajte članove porodice u Domaćinstvu za bolje savete.';
    }
    default:
      break;
  }

  if (ctx?.maintenance?.overdueCount > 0) {
    return `Imate ${ctx.maintenance.overdueCount} zakašnjelih servisa: ${(ctx.maintenance.overdue || []).slice(0, 3).join(', ')}. Šta kasni u kući? — pitajte eksplicitno!`;
  }

  return `Razumem pitanje o „${message.slice(0, 40)}${message.length > 40 ? '…' : ''}". Budžet: ${formatCurrency(advisor.spent)}/${formatCurrency(advisor.budget)} (zdravlje ${advisor.score}/100).\n\nProbajte: „Koliko sam potrošio danas?", „Šta da kuvam danas?", „Šta kasni u kući?"`;
}

function buildHouseholdContext() {
  if (typeof getAdvisorContext === 'function') return getAdvisorContext();
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  return { settings, spent, budget, remaining: budget - spent, score: getFinancialHealthScore() };
}

function getRecentChatMessages(limit = 8) {
  return getChatHistory()
    .slice(-limit)
    .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
}

/* ─── OpenAI streaming ─── */

async function streamOpenAI(message, settings, onToken) {
  const systemPrompt = buildOpenAISystemPrompt();
  const history = getRecentChatMessages(6);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(0, -1),
    { role: 'user', content: message }
  ];

  let response;
  try {
    response = await fetch(settings.apiUrl || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: getOpenAIModel(),
        messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: true
      })
    });
  } catch (err) {
    const e = new Error('network');
    e.userMessage = parseOpenAIError(null, err);
    throw e;
  }

  if (!response.ok) {
    const e = new Error('api');
    e.userMessage = parseOpenAIError(response);
    throw e;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) {
          fullText += token;
          onToken(fullText);
        }
      } catch { /* skip malformed chunk */ }
    }
  }

  return fullText.trim() || getSmartResponse(message);
}

async function getAIResponse(message, onToken) {
  const settings = getSettings();
  if (settings.apiKey?.trim()) {
    try {
      if (onToken) {
        return await streamOpenAI(message, settings, onToken);
      }
      return await streamOpenAI(message, settings, () => {});
    } catch (err) {
      const local = getSmartResponse(message);
      throw Object.assign(new Error('fallback'), {
        response: `${local}\n\n⚠️ ${err.userMessage || parseOpenAIError()}`,
        userMessage: err.userMessage
      });
    }
  }
  return getSmartResponse(message);
}

/* ─── Chat UI ─── */

let streamingBubbleEl = null;

function renderChat(options = {}) {
  const { typing = false, streamText = null, streamActions = null } = options;
  const container = document.getElementById('chat-messages');
  const history = getChatHistory();

  if (history.length === 0 && !typing && !streamText) {
    container.innerHTML = `<div class="chat-bubble chat-bubble--ai">${formatChatText(getProactiveWelcome())}</div>`;
    return;
  }

  let html = history.map(msg => {
    const actions = msg.actions?.length ? renderActionBar(msg.actions) : '';
    return `<div class="chat-bubble chat-bubble--${msg.role === 'user' ? 'user' : 'ai'}">${formatChatText(msg.text)}</div>${actions}`;
  }).join('');

  if (streamText !== null) {
    const actions = streamActions ? renderActionBar(streamActions) : '';
    html += `<div class="chat-bubble chat-bubble--ai chat-bubble--streaming" id="streaming-bubble">${formatChatText(streamText)}</div>${actions}`;
  } else if (typing) {
    html += '<div class="chat-bubble chat-bubble--ai chat-bubble--typing"><span class="typing-dots">10KEY Savetnik razmišlja</span></div>';
  }

  container.innerHTML = html;
  handleChatActions(container);
  container.scrollTop = container.scrollHeight;
}

function sendMessage(text) {
  const input = document.getElementById('chat-input');
  const message = text || input.value.trim();
  if (!message) return;

  addChatMessage('user', message);
  input.value = '';
  renderChat({ typing: true });

  const sendBtn = document.getElementById('chat-send');
  const voiceBtn = document.getElementById('chat-voice');
  sendBtn.disabled = true;
  if (voiceBtn) voiceBtn.disabled = true;

  const settings = getSettings();
  const useStream = settings.apiKey?.trim();

  if (useStream) {
    let streamStarted = false;
    getAIResponse(message, (partial) => {
      if (!streamStarted) streamStarted = true;
      renderChat({ streamText: partial });
    })
      .then(response => {
        const actions = extractSuggestedActions(message, response);
        addChatMessage('ai', response, actions.length ? { actions } : undefined);
        renderChat();
      })
      .catch(err => {
        if (err.response) {
          const actions = extractSuggestedActions(message, err.response);
          addChatMessage('ai', err.response, actions.length ? { actions } : undefined);
        } else {
          addChatMessage('ai', getSmartResponse(message) + '\n\n⚠️ Greška pri slanju.');
        }
        renderChat();
      })
      .finally(() => {
        sendBtn.disabled = false;
        if (voiceBtn) voiceBtn.disabled = false;
        input.focus();
      });
    return;
  }

  getAIResponse(message)
    .then(response => {
      const actions = extractSuggestedActions(message, response);
      addChatMessage('ai', response, actions.length ? { actions } : undefined);
      renderChat();
    })
    .catch(() => {
      addChatMessage('ai', getSmartResponse(message) + '\n\n⚠️ Greška pri slanju.');
      renderChat();
    })
    .finally(() => {
      sendBtn.disabled = false;
      if (voiceBtn) voiceBtn.disabled = false;
      input.focus();
    });
}

function initChatVoice() {
  const btn = document.getElementById('chat-voice');
  const input = document.getElementById('chat-input');
  if (!btn || !input) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btn.style.display = 'none';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'sr-RS';
  recognition.interimResults = false;
  let listening = false;

  btn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch {
      showToast('Mikrofon nije dostupan.', 'warning');
    }
  });

  recognition.onstart = () => {
    listening = true;
    btn.classList.add('chat-voice--active');
    btn.setAttribute('aria-label', 'Zaustavi slušanje');
  };

  recognition.onend = recognition.onerror = () => {
    listening = false;
    btn.classList.remove('chat-voice--active');
    btn.setAttribute('aria-label', 'Glasovni unos');
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript.trim();
    input.value = transcript;
    showToast(`Čuo: „${transcript}"`, 'info', 2000);
  };
}

/* ─── Teacher tab ─── */

const TEACHER_LESSONS = {
  budgeting: {
    title: 'Osnovi budžetiranja',
    content: `**Zašto pratiti troškove?**
Bez pregleda ne znate gde novac odlazi. Domaćinko vam pomaže da vidite mesečne troškove po kategorijama.

**Koraci:**
1. Postavite mesečni budžet u podešavanjima
2. Unosite svaki trošak (ili skenirajte račun)
3. Pregledajte finansijsko zdravlje na početnoj
4. Postavite budžet po kategorijama za bolju kontrolu

**Savet:** Mali troškovi (kafa, grickalice) se brzo sabiru — pratite ih bar nedelju dana.`
  },
  cooking: {
    title: 'Planiranje obroka',
    content: `**Plan obroka štedi novac i vreme.**

**Koraci:**
1. Planirajte nedelju unapred u sekciji Plan obroka
2. Generišite listu za kupovinu automatski
3. Koristite ostavu — "Šta mogu da skuvam?" predlaže recepte
4. Kupujte sezonsko povrće — jeftinije i svežije

**Savet:** Kuvajte duplo i zamrzavajte — ušteda do 30% na hrani.`
  },
  repairs: {
    title: 'Osnovne popravke',
    content: `**Bezbednost na prvom mestu!**

**Pre DIY posla:**
- Isključite struju/vodu ako radite sa instalacijama
- Imate osnovne alate: odvijač, klešta, čekić, metar
- Znajte kada pozvati majstora (gas, glavni osigurač, pucanje cevi)

**AI Majstor** vam daje korake, alate i procenu troška za svaki problem.`
  },
  maintenance: {
    title: 'Održavanje kuće',
    content: `**Redovno održavanje sprečava skupe popravke.**

**Obavezno godišnje:**
- Servis bojlera i klime
- Baterije detektora dima
- Zamena filtera za vodu/vazduh
- Servis automobila

**Sezonski:** prolećno čišćenje, jesenje pripreme oluka i grejanja.

Koristite sekciju Održavanje sa podsetnicima na početnoj.`
  },
  energy: {
    title: 'Ušteda energije',
    content: `**Smanjite račune bez gubljenja komfora.**

**Brzi saveti:**
- LED sijalice — 80% manje potrošnje
- Isključujte standby uređaje (TV, punjači)
- Klima na 24–25°C leti, grejanje max 21°C zimi
- Perilica i mašina za sudove punite do kraja

**Procena:** do 15% manji račun za struju uz male promene navika.`
  },
  shopping: {
    title: 'Pametna kupovina',
    content: `**Lista je vaš najbolji prijatelj.**

**Pravila:**
1. Nikad bez liste u prodavnicu
2. Poredite cene po kilogramu, ne po pakovanju
3. Koristite akcije samo za stvari koje ionako kupujete
4. Ne idite gladni u supermarket

Domaćinko generiše listu iz plana obroka i pamti šta vam treba.`
  }
};

function renderTeacherTopics() {
  const container = document.getElementById('teacher-topics');
  if (!container) return;

  container.innerHTML = TEACHER_TOPICS.map(topic => {
    const lesson = TEACHER_LESSONS[topic.id];
    const done = isTopicComplete(topic.id);
    const content = lesson ? lesson.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : topic.description;

    return `
      <div class="card teacher-topic ${done ? 'teacher-topic--done' : ''}" data-topic="${topic.id}">
        <div class="teacher-topic__header">
          <span>${topic.icon} ${topic.title}</span>
          ${done ? '<span class="badge badge--success">✓</span>' : ''}
        </div>
        <p class="text-muted" style="font-size:var(--font-size-sm)">${topic.description}</p>
        <div class="teacher-topic__content hidden">${content}</div>
        <button type="button" class="btn btn--secondary btn--sm mt-sm toggle-lesson">${done ? 'Ponovo pročitaj' : 'Otvori lekciju'}</button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.toggle-lesson').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.teacher-topic');
      const content = card.querySelector('.teacher-topic__content');
      const isHidden = content.classList.contains('hidden');
      content.classList.toggle('hidden', !isHidden);
      btn.textContent = isHidden ? 'Zatvori' : 'Otvori lekciju';
      if (isHidden) {
        markTopicComplete(card.dataset.topic);
        card.classList.add('teacher-topic--done');
        if (!card.querySelector('.badge')) {
          card.querySelector('.teacher-topic__header').insertAdjacentHTML('beforeend', '<span class="badge badge--success">✓</span>');
        }
      }
    });
  });
}

function switchAITab(tabId) {
  document.querySelectorAll('#ai-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });

  document.getElementById('panel-savetnik').classList.toggle('hidden', tabId !== 'savetnik');
  document.getElementById('panel-majstor').classList.toggle('hidden', tabId !== 'majstor');
  document.getElementById('panel-ucitelj').classList.toggle('hidden', tabId !== 'ucitelj');

  const status = document.getElementById('ai-status');
  if (status) status.classList.toggle('hidden', tabId !== 'savetnik');

  const main = document.querySelector('.app-container');
  if (tabId === 'savetnik') {
    main.classList.add('app-container--chat');
  } else {
    main.classList.remove('app-container--chat');
  }

  if (tabId === 'majstor' && !window._majstorInit) {
    initRepairsUI({
      categoryId: 'majstor-categories',
      problemId: 'majstor-problem',
      submitId: 'majstor-submit',
      resultId: 'majstor-result'
    });
    window._majstorInit = true;
  }

  if (history.replaceState) {
    const newHash = tabId === 'savetnik' ? '' : `#${tabId}`;
    history.replaceState(null, '', newHash || window.location.pathname);
  }
}

function renderSuggestedChips(containerId, module = 'savetnik') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const questions = typeof getSuggestedQuestions === 'function' ? getSuggestedQuestions(module) : [];
  container.innerHTML = questions.map(q =>
    `<button type="button" class="chip" data-question="${escapeChatHtml(q)}">${escapeChatHtml(q)}</button>`
  ).join('');
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.question));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: '10KEY Savetnik' });

  const hash = window.location.hash.replace('#', '');
  const initialTab = ['savetnik', 'majstor', 'ucitelj'].includes(hash) ? hash : 'savetnik';
  switchAITab(initialTab);

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (['savetnik', 'majstor', 'ucitelj'].includes(h)) switchAITab(h);
  });

  document.querySelectorAll('#ai-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => switchAITab(tab.dataset.tab));
  });

  renderAIStatus();
  renderChat();
  renderTeacherTopics();
  renderSuggestedChips('quick-chips', 'savetnik');
  initChatVoice();

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
});
