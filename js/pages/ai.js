function buildHouseholdContext() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());
  const shopping = getShoppingList().filter(i => !i.bought);
  const household = getHousehold();
  const comparison = getMonthComparison();
  const savings = getSavingsProgress();

  const topCategories = Object.entries(byCategory)
    .filter(([, a]) => a > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, amt]) => `${getCategoryLabel(id)}: ${formatCurrency(amt)}`)
    .join(', ');

  return {
    settings,
    spent,
    budget,
    remaining,
    topCategories,
    shopping: shopping.map(i => i.name),
    members: household.familyMembers?.length || 0,
    comparison,
    savings,
    score: getFinancialHealthScore()
  };
}

function getSmartResponse(message) {
  const lower = message.toLowerCase().trim();
  const ctx = buildHouseholdContext();
  const name = ctx.settings.userName || 'prijatelju';

  if (lower.includes('zdravo') || lower.includes('ćao') || lower.includes('cao') || lower.includes('pozdrav') || lower.includes('hej')) {
    return `${getGreeting()}, ${name}! Ja sam Domaćinko 💚 Ovog meseca ste potrošili ${formatCurrency(ctx.spent)} od ${formatCurrency(ctx.budget)}. Kako mogu da pomognem?`;
  }

  if (lower.includes('gde najviše') || lower.includes('najviše troš') || lower.includes('najvise tros')) {
    const byCat = getSpendingByCategory(new Date().getFullYear(), new Date().getMonth());
    const top = Object.entries(byCat).filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]);
    if (top.length === 0) {
      return 'Još nema troškova ovog meseca — odličan početak! Kada dodate troškove, mogu da vam pokažem gde najviše idu. 💚';
    }
    const [catId, amount] = top[0];
    const pct = ctx.spent > 0 ? Math.round((amount / ctx.spent) * 100) : 0;
    return `Najviše trošite na ${getCategoryLabel(catId).toLowerCase()} — ${formatCurrency(amount)} (${pct}% budžeta). ${top.length > 1 ? `Sledeće je ${getCategoryLabel(top[1][0]).toLowerCase()} sa ${formatCurrency(top[1][1])}.` : ''} Nema šta da brinete — samo pratite trend! 💚`;
  }

  if (lower.includes('koliko') && (lower.includes('ostalo') || lower.includes('preostalo') || lower.includes('ima'))) {
    if (ctx.remaining >= 0) {
      return `Od budžeta od ${formatCurrency(ctx.budget)} ostalo vam je još ${formatCurrency(ctx.remaining)}. ${ctx.comparison ? ctx.comparison.text + '.' : ''} Nastavite ovako! 💚`;
    }
    return `Budžet je prekoračen za ${formatCurrency(Math.abs(ctx.remaining))}, ali to se dešava — važno je da pratite troškove. Sledeći mesec je nova prilika! 💚`;
  }

  if (lower.includes('šta da kupim') || lower.includes('sta da kupim') || lower.includes('lista') || lower.includes('kupovin')) {
    if (ctx.shopping.length === 0) {
      return 'Lista za kupovinu je prazna! Dodajte stavke u sekciji Kupovina, pa mogu da vam pomognem da planirate. 💚';
    }
    const items = ctx.shopping.slice(0, 8).join(', ');
    const more = ctx.shopping.length > 8 ? ` i još ${ctx.shopping.length - 8} stavki` : '';
    return `Na listi za kupovinu imate: ${items}${more}. Srećna kupovina! 🛒`;
  }

  if (lower.includes('budžet') || lower.includes('budzet') || lower.includes('limit')) {
    const pct = Math.round((ctx.spent / ctx.budget) * 100);
    return `Mesečni budžet je ${formatCurrency(ctx.budget)}, potrošeno ${formatCurrency(ctx.spent)} (${pct}%). ${ctx.remaining >= 0 ? `Ostaje ${formatCurrency(ctx.remaining)}.` : 'Budžet je prekoračen, ali zajedno možemo da planiramo bolje.'} 💚`;
  }

  if (lower.includes('šted') || lower.includes('sted') || lower.includes('ušted') || lower.includes('usted') || lower.includes('cilj')) {
    return `Vaš cilj štednje je ${formatCurrency(ctx.savings.goal)}. Ovog meseca ste "uštedeli" ${formatCurrency(ctx.savings.saved)} (${ctx.savings.pct}% cilja). Svaki korak se računa! 💚`;
  }

  if (lower.includes('potroš') || lower.includes('potros') || lower.includes('troš') || lower.includes('tros')) {
    let msg = `Ovog meseca ste potrošili ${formatCurrency(ctx.spent)}.`;
    if (ctx.comparison) msg += ` To je ${ctx.comparison.text.toLowerCase()}.`;
    if (ctx.topCategories) msg += ` Glavne kategorije: ${ctx.topCategories}.`;
    return msg + ' 💚';
  }

  if (lower.includes('zdravlje') || lower.includes('ocena') || lower.includes('score')) {
    const labels = ['Potrebna pažnja', 'Umereno', 'Dobro', 'Odlično'];
    const label = ctx.score >= 80 ? labels[3] : ctx.score >= 60 ? labels[2] : ctx.score >= 40 ? labels[1] : labels[0];
    return `Vaše finansijsko zdravlje je ${ctx.score}/100 — ${label}. ${ctx.score >= 60 ? 'Nastavite ovako!' : 'Mali koraci svaki dan pomažu — tu sam za vas!'} 💚`;
  }

  if (lower.includes('domaćinstv') || lower.includes('domacinstv') || lower.includes('porodica') || lower.includes('član')) {
    const h = getHousehold();
    const parts = [];
    if (h.familyMembers?.length) parts.push(`${h.familyMembers.length} članova`);
    if (h.pets?.length) parts.push(`${h.pets.length} ljubimaca`);
    if (h.cars?.length) parts.push(`${h.cars.length} automobila`);
    if (parts.length === 0) return 'Domaćinstvo još nije podešeno — dodajte članove u sekciji Domaćinstvo. Tu sam da pomognem! 💚';
    return `Vaše domaćinstvo: ${parts.join(', ')}. Sve na jednom mestu — super organizovano! 💚`;
  }

  if (lower.includes('savet') || lower.includes('preporuk') || lower.includes('pomoc') || lower.includes('pomoć')) {
    return getDailyAdvice() + ' 💚';
  }

  if (lower.includes('hvala') || lower.includes('super') || lower.includes('odlično') || lower.includes('odlicno')) {
    return 'Nema na čemu! Tu sam kad god zatreba. Zajedno držimo domaćinstvo pod kontrolom! 💚';
  }

  return `Razumem vaše pitanje! Ovog meseca ste na ${formatCurrency(ctx.spent)} od ${formatCurrency(ctx.budget)} budžeta. ${ctx.remaining >= 0 ? `Ostaje ${formatCurrency(ctx.remaining)}.` : ''} Pitajte me o budžetu, kupovini, štednji ili domaćinstvu — tu sam za vas! 💚`;
}

async function getAIResponse(message) {
  const settings = getSettings();

  if (settings.apiKey && settings.apiKey.trim()) {
    try {
      return await callOpenAI(message, settings);
    } catch {
      return getSmartResponse(message) + ' (API nije dostupan — koristim lokalne odgovore.)';
    }
  }

  return getSmartResponse(message);
}

async function callOpenAI(message, settings) {
  const ctx = buildHouseholdContext();
  const systemPrompt = `Ti si Domaćinko, prijateljski AI pomoćnik za domaćinstvo na srpskom jeziku. Budi topao, ohrabrujuć i nikada osuđujući.

Kontekst korisnika:
- Ime: ${ctx.settings.userName || 'korisnik'}
- Budžet: ${formatCurrency(ctx.budget)}, potrošeno: ${formatCurrency(ctx.spent)}, preostalo: ${formatCurrency(ctx.remaining)}
- Finansijsko zdravlje: ${ctx.score}/100
- Cilj štednje: ${formatCurrency(ctx.savings.goal)}, napredak: ${ctx.savings.pct}%
- Top kategorije: ${ctx.topCategories || 'nema podataka'}
- Lista za kupovinu: ${ctx.shopping.join(', ') || 'prazna'}
- ${ctx.comparison ? ctx.comparison.text : 'Nema poređenja sa prošlim mesecom'}

Odgovaraj kratko (2-4 rečenice), na srpskom, sa emoji 💚 gde je prikladno.`;

  const response = await fetch(settings.apiUrl || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || getSmartResponse(message);
}

function renderChat() {
  const container = document.getElementById('chat-messages');
  const history = getChatHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="chat-bubble chat-bubble--ai">
        Zdravo! Ja sam Domaćinko 💚 Znam vaše troškove, budžet i listu za kupovinu — pitajte me bilo šta!
      </div>
    `;
    return;
  }

  container.innerHTML = history.map(msg => `
    <div class="chat-bubble chat-bubble--${msg.role === 'user' ? 'user' : 'ai'}">${msg.text}</div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

function sendMessage(text) {
  const input = document.getElementById('chat-input');
  const message = text || input.value.trim();
  if (!message) return;

  addChatMessage('user', message);
  input.value = '';
  renderChat();

  const sendBtn = document.getElementById('chat-send');
  sendBtn.disabled = true;

  getAIResponse(message).then(response => {
    addChatMessage('ai', response);
    renderChat();
    sendBtn.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'Pitaj Domaćinka' });
  renderChat();

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.question));
  });
});
