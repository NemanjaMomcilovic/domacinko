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
  const ctx = buildHouseholdContext();
  const name = ctx.settings?.userName || ctx.name || 'prijatelju';

  if (lower.includes('zdravo') || lower.includes('ćao') || lower.includes('cao') || lower.includes('pozdrav') || lower.includes('hej')) {
    return `${getGreeting()}, ${name}! Ja sam Domaćinko 💚 Ovog meseca ste potrošili ${formatCurrency(ctx.spent)} od ${formatCurrency(ctx.budget)}. Kako mogu da pomognem?`;
  }

  if (lower.includes('gde najviše') || lower.includes('najviše troš') || lower.includes('najvise tros')) {
    const byCat = getSpendingByCategory(new Date().getFullYear(), new Date().getMonth());
    const top = Object.entries(byCat).filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]);
    if (top.length === 0) {
      return 'Još nema troškova ovog meseca — odličan početak! 💚';
    }
    const [catId, amount] = top[0];
    const pct = ctx.spent > 0 ? Math.round((amount / ctx.spent) * 100) : 0;
    return `Najviše trošite na ${getCategoryLabel(catId).toLowerCase()} — ${formatCurrency(amount)} (${pct}% budžeta). 💚`;
  }

  if (lower.includes('koliko') && (lower.includes('potro') || lower.includes('tros'))) {
    return `Do sada imaš evidentirano ukupno ${formatCurrency(ctx.spent)} troškova ovog meseca.`;
  }

  if (lower.includes('ušted') || lower.includes('usted')) {
    return 'Prvo pogledaj hranu, gorivo, kafiće i impulzivne kupovine. Tu ljudi najčešće izgube najviše novca.';
  }

  if (lower.includes('struj')) {
    return 'Za manji račun za struju: koristi LED sijalice, isključi uređaje iz utičnice, bojler pali planski i proveri stare uređaje.';
  }

  if (lower.includes('voda') || lower.includes('vodu')) {
    return 'Za manji račun za vodu: popravi slavine koje kaplju, skrati tuširanje i koristi mašinu za veš kad je puna.';
  }

  if (lower.includes('auto') || lower.includes('gorivo')) {
    return 'Kod auta najviše pomažu redovan servis, pravilan pritisak u gumama i mirnija vožnja. To može smanjiti potrošnju goriva.';
  }

  if (lower.includes('račun') || lower.includes('racun')) {
    return 'Račune možeš skenirati kamerom u sekciji Slikaj račun, ili ručno uneti trošak.';
  }

  if (lower.includes('koliko') && (lower.includes('ostalo') || lower.includes('preostalo') || lower.includes('ima'))) {
    if (ctx.remaining >= 0) {
      return `Od budžeta od ${formatCurrency(ctx.budget)} ostalo vam je još ${formatCurrency(ctx.remaining)}. Nastavite ovako! 💚`;
    }
    return `Budžet je prekoračen za ${formatCurrency(Math.abs(ctx.remaining))}. Sledeći mesec je nova prilika! 💚`;
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
    return `U magacinu imate: ${mag.slice(0, 6).map(i => i.name).join(', ')}. Proverite pre kupovine! 📦`;
  }

  if (lower.includes('ostav') || lower.includes('namirnic')) {
    const low = typeof getLowStockPantry === 'function' ? getLowStockPantry() : [];
    if (low.length > 0) return `U ostavi na isteku: ${low.map(p => p.name).join(', ')}. Vreme za kupovinu! 🥫`;
    const pantry = getPantryItems();
    if (pantry.length === 0) return 'Ostava je prazna — dodajte namirnice u Domaćinstvo.';
    return `U ostavi: ${pantry.slice(0, 8).map(p => p.name).join(', ')}.`;
  }

  return `Razumem! Na ${formatCurrency(ctx.spent)} od ${formatCurrency(ctx.budget)} budžeta. Pitajte o finansijama, kupovini, održavanju ili popravkama! 💚`;
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
