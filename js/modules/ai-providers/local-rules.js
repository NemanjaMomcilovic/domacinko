/**
 * 10KEY lokalni Savetnik — rule + intent engine (default / fallback).
 * Besplatno, offline, na osnovu stvarnih podataka u aplikaciji.
 */

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

function parseShoppingAction(message) {
  const m = message.match(/(?:dodaj|stavi)\s+(.+?)\s+(?:na\s+listu|u\s+kupovinu)/i);
  if (m) return m[1].trim();
  const m2 = message.match(/^dodaj\s+(.+)/i);
  if (m2 && !/trošak|trosak|zadatak|podsetnik/i.test(message)) return m2[1].trim();
  return null;
}

function respondGreeting(ctx) {
  const name = ctx.advisor.settings?.userName || ctx.advisor.name || 'prijatelju';
  const profile = ctx.profile;
  const heating = profile.heatingType || 'nepoznato';
  const sqm = profile.squareMeters || 0;
  let extra = sqm > 0 ? ` Kuća ${sqm}m², grejanje: ${heating}.` : '';
  return `${getGreeting()}, ${name}! 💚 Potrošeno ${formatCurrency(ctx.advisor.spent)} od ${formatCurrency(ctx.advisor.budget)}.${extra} Kako mogu da pomognem?`;
}

function respondCookToday(ctx) {
  const today = typeof getTodayMealForAI === 'function' ? getTodayMealForAI() : '';
  if (today) return `Danas je planirano: **${today}**. Pogledajte Plan obroka za ceo meni. 🍽️`;
  const suggestion = typeof suggestMealsFromPantry === 'function' ? suggestMealsFromPantry() : null;
  if (suggestion?.suggestions?.length) {
    return `Nemate plan za danas. Iz ostave možete: ${suggestion.suggestions.slice(0, 3).join(', ')}.`;
  }
  const pantry = getPantryItems();
  if (pantry.length === 0) return 'Ostava je prazna — dodajte namirnice u Domaćinstvo, pa planirajte obrok.';
  return `Danas nije planiran obrok. U ostavi imate: ${pantry.slice(0, 6).map(p => p.name).join(', ')}. Šta vas muči da skuvate?`;
}

function respondBriefingLocal() {
  if (typeof generateMorningBriefing !== 'function') {
    return 'Pitajte o budžetu, kuvanju, kupovini ili održavanju.';
  }
  const b = generateMorningBriefing();
  const lines = [b.greeting || 'Pregled dana:'];
  (b.bullets || []).slice(0, 5).forEach(bullet => {
    if (bullet?.text) lines.push(`• ${bullet.text.replace(/<[^>]+>/g, '')}`);
  });
  return lines.join('\n');
}

function buildHouseholdContextLocal() {
  if (typeof getAdvisorContext === 'function') return getAdvisorContext();
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  return { settings, spent, budget, remaining: budget - spent, score: getFinancialHealthScore() };
}

/**
 * Synchronous local advisor reply (intent engine).
 */
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
  } : buildHouseholdContextLocal();
  const profile = ctx?.houseProfile || (typeof getHouseProfile === 'function' ? getHouseProfile() : {});
  const wrap = { advisor, profile, ctx };
  const lower = message.toLowerCase();

  if (/dodaj\s+sastojk.*iz\s+plana|generi[sš]i\s+listu.*(obrok|plan)|dodaj\s+sve\s+sastojk/.test(lower)) {
    if (typeof generateShoppingFromMealPlan === 'function') {
      const { added, total } = generateShoppingFromMealPlan();
      if (added > 0) return `Dodato **${added}** sastojaka sa plana obroka na listu kupovine. 🛒`;
      if (total > 0) return 'Svi sastojci iz plana su već na listi.';
      return 'Plan nema sastojaka — izaberite gotova jela u Planu obroka.';
    }
  }

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
    case 'briefing': return respondBriefingLocal();
    case 'cook_today': return respondCookToday(wrap);
    case 'meal_plan': {
      const plan = getMealPlan();
      const days = { mon: 'Pon', tue: 'Uto', wed: 'Sre', thu: 'Čet', fri: 'Pet', sat: 'Sub', sun: 'Ned' };
      const entries = Object.entries(days).map(([k, label]) => {
        const day = plan[k];
        if (!day) return null;
        if (typeof day === 'string') {
          return day.trim() ? `${label}: ${day.trim()}` : null;
        }
        const parts = (typeof MEAL_SLOTS !== 'undefined' ? MEAL_SLOTS : [])
          .map(s => {
            const text = typeof formatMealSlotLabel === 'function' ? formatMealSlotLabel(day[s.id]) : '';
            return text ? `${s.short || s.label}: ${text}` : '';
          })
          .filter(Boolean);
        return parts.length ? `${label}: ${parts.join(', ')}` : null;
      }).filter(Boolean);
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
      const missing = typeof getMissingMealIngredients === 'function' ? getMissingMealIngredients() : [];
      const parts = [];
      if (shopping.length) {
        parts.push(`Na listi (${shopping.length}): ${shopping.slice(0, 10).map(i => i.name).join(', ')}.`);
      } else {
        parts.push('Lista za kupovinu je trenutno prazna.');
      }
      if (missing.length) {
        parts.push(`Za predstojeće obroke još treba: ${missing.slice(0, 12).map(i => i.name).join(', ')}.`);
        parts.push('Recite „dodaj sastojke iz plana" ili otvorite Plan obroka.');
      } else if (!shopping.length) {
        parts.push('Planirajte obroke ili recite „dodaj mleko na listu".');
      } else {
        parts.push('Sastojci iz plana su već pokriveni listom. 🛒');
      }
      return parts.join(' ');
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

async function chatLocalRules(message) {
  return getSmartResponse(message);
}

const LocalRulesProvider = {
  id: 'local',
  label: '10KEY lokalni',
  supportsStream: false,
  chat: chatLocalRules
};
