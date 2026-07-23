/**
 * Shared household context + system prompt for LLM providers (Ollama, OpenAI).
 */

const AI_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function getTodayMealForAI() {
  if (typeof getTodayMealSummary === 'function') {
    return getTodayMealSummary();
  }
  const plan = getMealPlan();
  const key = typeof getTodayMealKey === 'function'
    ? getTodayMealKey()
    : AI_DAY_KEYS[new Date().getDay()];
  const day = plan[key];
  if (!day || typeof day === 'string') return (day || '').trim();
  if (typeof formatMealSlotLabel === 'function' && typeof MEAL_SLOTS !== 'undefined') {
    return MEAL_SLOTS.map(s => {
      const label = formatMealSlotLabel(day[s.id]);
      return label ? `${s.label}: ${label}` : '';
    }).filter(Boolean).join(' · ');
  }
  return '';
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
  const todayMeal = getTodayMealForAI();
  const mealPlan = getMealPlan();
  const plannedMeals = typeof countFilledMealDays === 'function'
    ? countFilledMealDays(mealPlan)
    : Object.values(mealPlan).filter(m => m && (typeof m === 'string' ? m.trim() : true)).length;
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
    (() => {
      const missing = typeof getMissingMealIngredients === 'function' ? getMissingMealIngredients() : [];
      const mealIngs = typeof collectIngredientsWithSources === 'function'
        ? collectIngredientsWithSources(typeof getRemainingMealDayIds === 'function' ? getRemainingMealDayIds() : null)
        : [];
      if (missing.length) {
        return `Sastojci iz plana (nedostaju na listi): ${missing.slice(0, 12).map(i => i.name).join(', ')}`;
      }
      if (mealIngs.length) {
        return `Sastojci iz plana: svi su već na listi (${mealIngs.length})`;
      }
      return null;
    })(),
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

function buildAdvisorSystemPrompt() {
  const context = buildRichContextBlock();
  return `Ti si 10KEY Savetnik — proaktivni asistent za domaćinstvo u aplikaciji Domaćinko.
Govoriš toplo, jasno i praktično na srpskom (latinica). Kratki odgovori (2-5 rečenica) osim ako korisnik traži detalje.
Koristi podatke korisnika ispod — ne izmišljaj brojeve. Ako nema podataka, predloži šta da unese u app.
Za opasne situacije (gas, struja, voda) uvek naglasi bezbednost i kada zvati majstora.
Možeš predložiti akcije: „Dodaj na listu: mleko" ili link ka modulu (Kupovina, Održavanje, Finansije).

PODACI KORISNIKA:
${context}`;
}

function getRecentChatMessages(limit = 8) {
  return getChatHistory()
    .slice(-limit)
    .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
}

function buildLLMMessages(userMessage, historyLimit = 6) {
  const history = getRecentChatMessages(historyLimit);
  return [
    { role: 'system', content: buildAdvisorSystemPrompt() },
    ...history.slice(0, -1),
    { role: 'user', content: userMessage }
  ];
}
