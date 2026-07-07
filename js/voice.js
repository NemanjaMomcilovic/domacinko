/**
 * Domaćinko - Glasovni režim (Web Speech API)
 */

const VoiceMode = (() => {
  let recognition = null;
  let listening = false;
  let btnEl = null;

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function init() {
    if (!isSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'sr-RS';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      handleCommand(transcript);
    };

    recognition.onerror = () => {
      listening = false;
      updateButton();
      showToast('Glas nije prepoznat. Pokušaj ponovo.');
    };

    recognition.onend = () => {
      listening = false;
      updateButton();
    };

    createFloatingButton();
  }

  function createFloatingButton() {
    if (document.getElementById('voice-fab')) return;
    btnEl = document.createElement('button');
    btnEl.id = 'voice-fab';
    btnEl.className = 'voice-fab';
    btnEl.setAttribute('aria-label', 'Glasovni režim');
    btnEl.innerHTML = '🎤';
    btnEl.title = 'Domaćinko, slušam...';
    document.body.appendChild(btnEl);
    btnEl.addEventListener('click', toggle);
  }

  function updateButton() {
    if (!btnEl) return;
    btnEl.classList.toggle('voice-fab--active', listening);
    btnEl.innerHTML = listening ? '🔴' : '🎤';
  }

  function toggle() {
    if (!recognition) {
      showToast('Glasovni režim nije podržan u ovom pregledaču.');
      return;
    }
    if (listening) {
      recognition.stop();
      listening = false;
      updateButton();
      return;
    }
    listening = true;
    updateButton();
    showToast('Slušam... Reci „Domaćinko" pa komandu.');
    try {
      recognition.start();
    } catch {
      listening = false;
      updateButton();
    }
  }

  function handleCommand(text) {
    const cmd = text.replace(/^domaćinko[,\s]*/i, '').trim();

    if (cmd.includes('koliko') && (cmd.includes('potroš') || cmd.includes('potros'))) {
      const now = new Date();
      const spent = getTotalSpent(now.getFullYear(), now.getMonth());
      showToast(`Ovog meseca si potrošio ${formatCurrency(spent)}.`);
      return;
    }

    if (cmd.startsWith('dodaj ')) {
      const item = cmd.replace(/^dodaj\s+/, '').trim();
      if (item) {
        addShoppingItem(item.charAt(0).toUpperCase() + item.slice(1));
        showToast(`Dodato na listu: ${item}`);
      }
      return;
    }

    if (cmd.includes('podseti') || cmd.includes('podsetnik')) {
      const taskText = cmd.replace(/podseti\s+me\s+(za\s+)?/i, '').trim();
      if (taskText) {
        const data = getData();
        data.tasks.push({ id: generateId(), text: taskText, done: false });
        saveData(data);
        showToast(`Podsetnik dodat: ${taskText}`);
      }
      return;
    }

    if (cmd.includes('sijalic') || cmd.includes('imam li')) {
      const results = searchMagazine(cmd);
      if (results.length > 0) {
        const r = results[0];
        showToast(`Imate ${r.quantity} ${r.unit} — ${r.name}`);
      } else {
        showToast('Nisam pronašao u kućnom magacinu.');
      }
      return;
    }

    if (cmd.includes('budžet') || cmd.includes('budzet')) {
      const settings = getSettings();
      const spent = getTotalSpent(new Date().getFullYear(), new Date().getMonth());
      const remaining = settings.monthlyBudget - spent;
      showToast(`Preostalo ${formatCurrency(remaining)} od budžeta.`);
      return;
    }

    showToast(`Čuo sam: „${text}". Probaj: „koliko sam potrošio", „dodaj mleko".`);
  }

  return { init, toggle, isSupported };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('no-voice')) return;
  VoiceMode.init();
});
