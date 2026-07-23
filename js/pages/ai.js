/**
 * Domaćinko — 10KEY Savetnik UI
 * Providers: js/modules/ai-providers/ (local | ollama | openai)
 */

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

  const todayMeal = typeof getTodayMealForAI === 'function' ? getTodayMealForAI() : '';
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

  const status = typeof getAIProviderStatus === 'function'
    ? getAIProviderStatus(settings)
    : { modeLabel: '🧠 10KEY Savetnik — besplatno, radi odmah i offline' };
  let welcome = `${getGreeting()}, ${name}! Ja sam **10KEY Savetnik**, vaš kućni asistent.\n${status.modeLabel}.\n${budgetLine}.`;

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

  const status = typeof getAIProviderStatus === 'function'
    ? getAIProviderStatus()
    : {
        badgeClass: 'ai-status--local',
        html: '<span>🧠 <strong>10KEY Savetnik</strong></span>'
      };

  el.className = `ai-status ${status.badgeClass}`;
  el.innerHTML = status.html;
}

function extractSuggestedActions(message, response) {
  const actions = [];
  const item = typeof parseShoppingAction === 'function' ? parseShoppingAction(message) : null;
  if (item) {
    actions.push({ type: 'shopping', label: `Dodaj „${item}" na listu`, payload: item });
  }
  const listMatch = response.match(/dodaj\s+na\s+listu[:\s]+([^.!\n]+)/i);
  if (listMatch && !item) {
    actions.push({ type: 'shopping', label: `Dodaj „${listMatch[1].trim()}"`, payload: listMatch[1].trim() });
  }
  if (/dodaj\s+sastojke\s+iz\s+plana|predstojeće\s+obroke\s+još\s+treba/i.test(response)
    || /dodaj\s+sastojk.*iz\s+plana/i.test(message)) {
    actions.push({ type: 'generate_shopping', label: 'Dodaj sastojke iz plana', payload: 'week' });
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
    const action = a.type === 'generate_shopping' ? 'generate_shopping' : 'shopping';
    return `<button type="button" class="chat-action-btn" data-action="${action}" data-payload="${escapeChatHtml(a.payload || '')}">${a.label}</button>`;
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
  container.querySelectorAll('[data-action="generate_shopping"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof generateShoppingFromMealPlan !== 'function') return;
      const { added, total } = generateShoppingFromMealPlan();
      if (added > 0) showToast(`Dodato ${added} sastojaka na listu!`, 'success');
      else if (total > 0) showToast('Sve je već na listi.', 'info');
      else showToast('Nema sastojaka u planu.', 'warning');
      btn.disabled = true;
      btn.textContent = added > 0 ? '✓ Dodato' : '✓ Gotovo';
    });
  });
}

async function getAIResponse(message, onToken) {
  if (typeof chatWithAI === 'function') {
    return chatWithAI(message, onToken);
  }
  return typeof getSmartResponse === 'function' ? getSmartResponse(message) : '';
}

/* ─── Chat UI ─── */

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

  const useStream = typeof shouldStreamAI === 'function' ? shouldStreamAI() : false;

  if (useStream) {
    getAIResponse(message, (partial) => {
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
          const local = typeof getSmartResponse === 'function' ? getSmartResponse(message) : '';
          addChatMessage('ai', local + '\n\n⚠️ Greška pri slanju.');
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
      const local = typeof getSmartResponse === 'function' ? getSmartResponse(message) : '';
      addChatMessage('ai', local + '\n\n⚠️ Greška pri slanju.');
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
