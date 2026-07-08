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

function buildHouseholdContext() {
  if (typeof getAdvisorContext === 'function') return getAdvisorContext();
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  return { settings, spent, budget, remaining: budget - spent, score: getFinancialHealthScore() };
}

function getSmartResponse(message) {
  const lower = message.toLowerCase().trim();
  const ctx = typeof buildFullAIContext === 'function' ? buildFullAIContext() : null;
  const advisor = ctx ? {
    settings: ctx.finance?.settings || getSettings(),
    spent: ctx.finance?.spent ?? getTotalSpent(new Date().getFullYear(), new Date().getMonth()),
    budget: ctx.finance?.budget ?? getSettings().monthlyBudget,
    remaining: ctx.finance?.remaining ?? 0,
    score: ctx.finance?.score ?? getFinancialHealthScore(),
    houseProfile: ctx.houseProfile,
    tools: ctx.tools,
    magazine: ctx.magazine
  } : buildHouseholdContext();
  const name = advisor.settings?.userName || advisor.name || 'prijatelju';
  const profile = advisor.houseProfile || (typeof getHouseProfile === 'function' ? getHouseProfile() : {});
  const heating = profile.heatingType || 'nepoznato';
  const sqm = profile.squareMeters || 0;

  if (lower.includes('zdravo') || lower.includes('ćao') || lower.includes('cao') || lower.includes('pozdrav') || lower.includes('hej')) {
    let extra = '';
    if (sqm > 0) extra = ` Kuća ${sqm}m², grejanje: ${heating}.`;
    return `${getGreeting()}, ${name}! 💚 Potrošeno ${formatCurrency(advisor.spent)} od ${formatCurrency(advisor.budget)}.${extra} Kako mogu da pomognem?`;
  }

  if (lower.includes('gde najviše') || lower.includes('najviše troš') || lower.includes('najvise tros')) {
    const byCat = getSpendingByCategory(new Date().getFullYear(), new Date().getMonth());
    const top = Object.entries(byCat).filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]);
    if (top.length === 0) {
      return 'Još nema troškova ovog meseca — odličan početak! 💚';
    }
    const [catId, amount] = top[0];
    const pct = advisor.spent > 0 ? Math.round((amount / advisor.spent) * 100) : 0;
    return `Najviše trošite na ${getCategoryLabel(catId).toLowerCase()} — ${formatCurrency(amount)} (${pct}% budžeta). 💚`;
  }

  if (lower.includes('koliko') && (lower.includes('potro') || lower.includes('tros'))) {
    return `Do sada imaš evidentirano ukupno ${formatCurrency(advisor.spent)} troškova ovog meseca. Finansijsko zdravlje: ${advisor.score}/100.`;
  }

  if (lower.includes('ušted') || lower.includes('usted') || lower.includes('popust')) {
    const insights = typeof getFinancialTrainerInsights === 'function' ? getFinancialTrainerInsights() : [];
    if (insights[0]?.savings) return insights[0].savings;
    return 'Prvo pogledaj hranu, gorivo, kafiće i impulzivne kupovine. Koristite akcije samo za stvari koje ionako kupujete — popust nije ušteda ako ne trebate proizvod.';
  }

  if (lower.includes('struj') || lower.includes('elektr')) {
    const toolCount = ctx?.tools?.count || (typeof getTools === 'function' ? getTools().length : 0);
    let tip = 'Za manji račun: LED sijalice, isključite standby, bojler planski, klima 24–25°C leti.';
    if (heating === 'electric' || heating === 'struja') tip += ' Električno grejanje — spuštajte termostat noću za 2°C.';
    if (toolCount > 0) tip += ` Imate ${toolCount} alata — DIY manje troši od majstora za sitnice.`;
    return tip;
  }

  if (lower.includes('gas')) {
    return 'Gas: proverite ventil i curenje sapunskom vodom. Redovan servis kotla je obavezan. Ako osećate miris gasa — odmah provetravajte i zovite hitnu, ne palite svetlo.';
  }

  if (lower.includes('grejan') || lower.includes('grejanje') || lower.includes('kirija')) {
    if (lower.includes('kirija')) {
      return 'Kirija je obično najveći fiksni trošak. Evidentirajte je kao račun u Podešavanjima i pratite u prognozi troškova.';
    }
    const season = [10, 11, 0, 1, 2].includes(new Date().getMonth());
    return `Grejanje (${heating}): termostat max 21°C, prozori zaptiveni.${season ? ' Sezona grejanja — proverite kotao i odvod kondenzata.' : ''} Ušteda do 15% sa dobrim navikama.`;
  }

  if (lower.includes('kredit')) {
    return 'Krediti idu u kategoriju Računi ili Ostalo. Pratite ratu mesečno — Domaćinko može podsetiti kroz ponavljajuće troškove u Podešavanjima.';
  }

  if (lower.includes('voda') || lower.includes('vodu') || lower.includes('bojler')) {
    if (lower.includes('bojler')) {
      const due = (typeof getDueMaintenance === 'function' ? getDueMaintenance() : []).find(t => t.id === 'boiler' || t.name.toLowerCase().includes('bojler'));
      if (due) return `Bojler: ${due.overdue ? 'servis kasni!' : `servis za ${due.daysUntil} dana.`} Palite 1h pre tuširanja, ne 24/7 — štedi struju i produžava vek.`;
      return 'Bojler: servis godišnje, palite planski (1h pre tuša), proverite sigurnosni ventil. Curi — zovite majstora.';
    }
    return 'Za manji račun za vodu: popravite slavine, skratite tuš, mašina za veš kad je puna.';
  }

  if (lower.includes('klima')) {
    const due = (typeof getDueMaintenance === 'function' ? getDueMaintenance() : []).find(t => t.id === 'ac' || t.name.toLowerCase().includes('klim'));
    const maint = due ? (due.overdue ? ' Servis klime kasni!' : ` Čišćenje klime za ${due.daysUntil} dana.`) : '';
    return `Klima: 24–25°C leti, filter čistite mesečno, zatvarajte prozore.${maint}`;
  }

  if (lower.includes('frižider') || lower.includes('frizider') || lower.includes('hladnjak')) {
    const appliances = profile.appliances || [];
    const hasFridge = appliances.some(a => (a.name || '').toLowerCase().includes('friž') || (a.name || '').toLowerCase().includes('friz'));
    return `Frižider: termostat 3–5°C, odmrzavajte redovno, ne stavljajte toplo hranu.${hasFridge ? ' Imate ga u profilu kuće — proverite starost (stariji troši više).' : ''}`;
  }

  if (lower.includes('veš') || lower.includes('ves') || lower.includes('mašina') || lower.includes('masina')) {
    return 'Veš mašina: punite do kraja, eco program, čistite filter. Curenje — proverite brtve i crevo. Vibracije — nivelišite noge.';
  }

  if (lower.includes('auto') || lower.includes('gorivo')) {
    return 'Kod auta najviše pomažu redovan servis, pritisak u gumama i mirnija vožnja. Evidentirajte registraciju u Domaćinstvu za prognozu.';
  }

  if (lower.includes('račun') || lower.includes('racun')) {
    return 'Račune skenirajte u Slikaj račun ili unesite ručno. Ponavljajuće stavite u Podešavanja → Mesečni računi.';
  }

  if (lower.includes('koliko') && (lower.includes('ostalo') || lower.includes('preostalo') || lower.includes('ima'))) {
    if (advisor.remaining >= 0) {
      return `Od budžeta od ${formatCurrency(advisor.budget)} ostalo vam je još ${formatCurrency(advisor.remaining)}. Nastavite ovako! 💚`;
    }
    return `Budžet je prekoračen za ${formatCurrency(Math.abs(advisor.remaining))}. Sledeći mesec je nova prilika! 💚`;
  }

  if (lower.includes('šta da kupim') || lower.includes('sta da kupim') || lower.includes('lista') || lower.includes('kupovin')) {
    const shopping = getShoppingList().filter(i => !i.bought);
    if (shopping.length === 0) {
      return 'Pre kupovine napravi spisak i nemoj ići gladan u market. Lista za kupovinu je trenutno prazna.';
    }
    return `Na listi: ${shopping.slice(0, 8).map(i => i.name).join(', ')}. Srećna kupovina! 🛒`;
  }

  if (lower.includes('održavan') || lower.includes('odrzavan') || lower.includes('servis')) {
    const due = getDueMaintenance();
    if (due.length === 0) return 'Svi zadaci održavanja su na vreme! 💚';
    return `Na redu: ${due.slice(0, 3).map(t => t.name).join(', ')}. Proverite Održavanje! 💚`;
  }

  if (lower.includes('poprav') || lower.includes('majstor')) {
    return 'Za popravke koristite AI Majstor tab — opišite problem i dobijte korak-po-korak savet! 🔧';
  }

  if (lower.includes('magacin') || lower.includes('sijalic') || lower.includes('inventar')) {
    const mag = typeof getHomeMagazine === 'function' ? getHomeMagazine() : [];
    if (mag.length === 0) return 'Kućni magacin je prazan. Dodajte sijalice, boju i šrafove u Inventar → Magacin.';
    return `U magacinu: ${mag.slice(0, 6).map(i => i.name).join(', ')}. Proverite pre kupovine! 📦`;
  }

  if (lower.includes('alat') || lower.includes('alati')) {
    const tools = typeof getTools === 'function' ? getTools() : [];
    if (tools.length === 0) return 'Nemate evidentiranih alata — dodajte u sekciju Alati za bolje DIY savete.';
    return `Vaši alati: ${tools.slice(0, 8).map(t => t.name).join(', ')}. Majstor proverava šta imate pre saveta.`;
  }

  if (lower.includes('ostav') || lower.includes('namirnic')) {
    const low = typeof getLowStockPantry === 'function' ? getLowStockPantry() : [];
    if (low.length > 0) return `U ostavi na isteku: ${low.map(p => p.name).join(', ')}. Vreme za kupovinu! 🥫`;
    const pantry = getPantryItems();
    if (pantry.length === 0) return 'Ostava je prazna — dodajte namirnice u Domaćinstvo.';
    return `U ostavi: ${pantry.slice(0, 8).map(p => p.name).join(', ')}.`;
  }

  if (lower.includes('prognoz') || lower.includes('predstoje')) {
    const costs = typeof getUpcomingCosts === 'function' ? getUpcomingCosts() : [];
    if (costs.length === 0) return 'Nema evidentiranih predstojećih troškova — dodajte račune u Domaćinstvu ili Podešavanjima.';
    const total = costs.reduce((s, c) => s + (c.amount || 0), 0);
    return `Ovog meseca ~${formatCurrency(total)} predstojećih troškova. Prvo: ${costs.slice(0, 3).map(c => c.name).join(', ')}.`;
  }

  return `Razumem! Na ${formatCurrency(advisor.spent)} od ${formatCurrency(advisor.budget)} budžeta (zdravlje ${advisor.score}/100). Pitajte o struji, grejanju, kupovini ili popravkama! 💚`;
}

async function getAIResponse(message) {
  const settings = getSettings();
  if (settings.apiKey && settings.apiKey.trim()) {
    try {
      return await callOpenAI(message, settings);
    } catch {
      return getSmartResponse(message) + ' (API nije dostupan — lokalni odgovor.)';
    }
  }
  return getSmartResponse(message);
}

async function callOpenAI(message, settings) {
  const ctx = typeof buildFullAIContext === 'function' ? buildFullAIContext() : getAdvisorContext();
  const profile = ctx.houseProfile || {};
  const systemPrompt = `Ti si Domaćinko, prijateljski AI pomoćnik za domaćinstvo na srpskom. Topao i ohrabrujući ton.
Kontekst korisnika:
- Budžet: ${formatCurrency(ctx.finance?.budget || ctx.budget)}, potrošeno: ${formatCurrency(ctx.finance?.spent || ctx.spent)}, zdravlje: ${ctx.finance?.score || ctx.score}/100
- Kuća: ${profile.squareMeters || '?'}m², grejanje: ${profile.heatingType || 'nepoznato'}, tip: ${profile.homeType || 'nepoznato'}
- Kupovina: ${ctx.shopping?.pendingCount || ctx.shoppingCount || 0} stavki na listi
- Održavanje: ${ctx.maintenance?.dueCount || ctx.maintenanceDue || 0} na redu (${ctx.maintenance?.overdueCount || ctx.maintenanceOverdue || 0} kasni)
- Alati: ${ctx.tools?.count || 0}, Baza znanja: ${ctx.knowledge?.count || 0} rešenja
- Magacin: ${(ctx.magazine?.items || ctx.magazineItems || []).slice(0, 5).join(', ') || 'prazan'}
- Ostava na isteku: ${(ctx.lowStockPantry || []).join(', ') || 'nema'}
Odgovaraj kratko (2-4 rečenice), srpski, emoji 💚.`;

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
    container.innerHTML = `<div class="chat-bubble chat-bubble--ai">Zdravo! Ja sam Domaćinko 💚 Pitajte me o budžetu, kupovini, održavanju ili popravkama!</div>`;
    return;
  }

  container.innerHTML = history.map(msg =>
    `<div class="chat-bubble chat-bubble--${msg.role === 'user' ? 'user' : 'ai'}">${msg.text}</div>`
  ).join('');
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
}

function renderSuggestedChips(containerId, module = 'savetnik') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const questions = typeof getSuggestedQuestions === 'function' ? getSuggestedQuestions(module) : [];
  container.innerHTML = questions.map(q =>
    `<button type="button" class="chip" data-question="${q}">${q}</button>`
  ).join('');
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.question));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'AI' });

  const hash = window.location.hash.replace('#', '');
  const initialTab = ['savetnik', 'majstor', 'ucitelj'].includes(hash) ? hash : 'savetnik';
  switchAITab(initialTab);

  document.querySelectorAll('#ai-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => switchAITab(tab.dataset.tab));
  });

  renderChat();
  renderTeacherTopics();
  renderSuggestedChips('quick-chips', 'savetnik');

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
});
