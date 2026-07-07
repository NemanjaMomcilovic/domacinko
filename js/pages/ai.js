const AI_RESPONSES = {
  budzet: [
    'Za kontrolu budžeta, pratite troškove svakodnevno. Mali koraci vode do velikih ušteda! 💚',
    'Preporučujem da odvojite 10% prihoda za štednju pre nego što počnete da trošite.',
    'Pregledajte pretplate — često plaćamo usluge koje ne koristimo.'
  ],
  hrana: [
    'Planiranje obroka unapred može smanjiti troškove hrane do 20%. Napravite listu za nedelju dana!',
    'Kupujte sezonsko voće i povrće — jeftinije je i zdravije.',
    'Ne idite u prodavnicu gladni — to je klasična greška koja košta! 😊'
  ],
  stednja: [
    'Pravilo 50/30/20: 50% za potrebe, 30% za želje, 20% za štednju. Probajte!',
    'Automatska štednja na početku meseca je najbolji trik.',
    'Male uštede se sabiraju — čak i 200 RSD dnevno je 6000 mesečno!'
  ],
  dom: [
    'Redovno održavanje štedi novac na dugoročne popravke.',
    'Proverite garancije na uređaje — možda nešto još važi!',
    'Energetska efikasnost: LED sijalice i termostat mogu smanjiti račune.'
  ],
  default: [
    'Tu sam da pomognem! Pitajte me o budžetu, štednji, kupovini ili domaćinstvu.',
    'Svaki korak ka boljem domaćinstvu je važan. Šta vas zanima?',
    'Nema glupih pitanja — samo pitajte! 😊',
    'Zajedno možemo da organizujemo vaše finansije i domaćinstvo.'
  ]
};

function getAIResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('budžet') || lower.includes('budzet') || lower.includes('novac') || lower.includes('para'))
    return pickRandom(AI_RESPONSES.budzet);
  if (lower.includes('hrana') || lower.includes('kupov') || lower.includes('obrok'))
    return pickRandom(AI_RESPONSES.hrana);
  if (lower.includes('šted') || lower.includes('sted') || lower.includes('ušted'))
    return pickRandom(AI_RESPONSES.stednja);
  if (lower.includes('dom') || lower.includes('kuć') || lower.includes('kuc') || lower.includes('račun'))
    return pickRandom(AI_RESPONSES.dom);

  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const remaining = settings.monthlyBudget - spent;

  if (lower.includes('koliko') || lower.includes('potroš') || lower.includes('potros')) {
    return `Ovog meseca ste potrošili ${formatCurrency(spent)}. Preostalo vam je ${formatCurrency(remaining)} od budžeta.`;
  }

  if (lower.includes('zdravo') || lower.includes('ćao') || lower.includes('cao') || lower.includes('pozdrav')) {
    return `${getGreeting()}! Ja sam Domaćinko, vaš AI pomoćnik za domaćinstvo. Kako mogu da pomognem?`;
  }

  return pickRandom(AI_RESPONSES.default);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderChat() {
  const container = document.getElementById('chat-messages');
  const history = getChatHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="chat-bubble chat-bubble--ai">
        Zdravo! Ja sam Domaćinko 💚 Pitajte me bilo šta o budžetu, kupovini ili domaćinstvu!
      </div>
    `;
    return;
  }

  container.innerHTML = history.map(msg => `
    <div class="chat-bubble chat-bubble--${msg.role === 'user' ? 'user' : 'ai'}">${msg.text}</div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'Pitaj Domaćinka' });
  renderChat();

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addChatMessage('user', text);
    input.value = '';
    renderChat();

    setTimeout(() => {
      const response = getAIResponse(text);
      addChatMessage('ai', response);
      renderChat();
    }, 600);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
});
