let currentImageData = null;

const VISUAL_RULES = [
  { keywords: ['ventil', 'slavina', 'curenje', 'kap'], response: '🔧 **Ventil/slavina**: Zatvorite glavni ventil vode. Proverite gumicu (sedlo) ili zaptivač. Za zamenu sedla treba ključ za slavinu i nova gumica (~200-500 RSD). Ako curi iz čaure — pozovite vodoinstalatera.' },
  { keywords: ['osigurač', 'fuse', 'struja', 'iskra'], response: '⚡ **Osigurač**: Isključite glavni prekidač. Proverite koji osigurač je pao. Uklonite uređaje sa te grane i ponovo uključite. Ako opet pada — kratki spoj, ne dirajte sami, zovite električara.' },
  { keywords: ['fleka', 'mrlja', 'zid', 'boja'], response: '🎨 **Fleka na zidu**: Odredite uzrok (vlaga, voda, dim). Za masne fleke — deterdžent i topla voda. Za vodene — prvo rešite curenje, pa akrilna boja. Testirajte na malom delu.' },
  { keywords: ['biljka', 'list', 'žuto', 'uvođen'], response: '🌿 **Biljka**: Žuti listovi — prekomerno zalivanje ili manjak svetlosti. Proverite vlažnost zemlje prstom. Orezujte suve delove. Đubrite sezonski.' },
  { keywords: ['frižider', 'hladnjak', 'hladi'], response: '❄️ **Frižider**: Proverite termostat (3-5°C). Očistite odledjivač i zadnju rešetku. Ako motor radi non-stop — proverite brtve na vratima.' },
  { keywords: ['veš', 'mašina', 'pranje'], response: '🫧 **Veš mašina**: Ne pere — proverite filter i doziranje deterdženta. Curenje — proverite brtve i crevo. Vibracije — nivelišite noge.' }
];

function getRuleBasedResponse(note) {
  const text = (note || '').toLowerCase();
  for (const rule of VISUAL_RULES) {
    if (rule.keywords.some(k => text.includes(k))) return rule.response;
  }
  return '🏠 **Opšti savet**: Opisite problem detaljnije ili koristite AI Majstor za korak-po-korak uputstvo. Ako je bezbednosno pitanje (gas, struja) — uvek pozovite stručnjaka.';
}

async function analyzeWithVision(imageData, note) {
  const settings = getSettings();
  if (!settings.apiKey) return getRuleBasedResponse(note);

  try {
    const response = await fetch(settings.apiUrl || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `Ti si Domaćinko, pomoćnik za domaćinstvo. Analiziraj sliku i daj kratak savet na srpskom. Korisnik pita: ${note || 'Šta je ovo i šta da radim?'}` },
            { type: 'image_url', image_url: { url: imageData } }
          ]
        }],
        max_tokens: 400
      })
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  } catch (e) {
    console.warn('Vision API:', e);
  }
  return getRuleBasedResponse(note);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'Vizuelni asistent', showBack: true, backHref: 'home.html' });

  const preview = document.getElementById('visual-preview');
  const input = document.getElementById('visual-input');
  const analyzeBtn = document.getElementById('analyze-photo');
  const resultEl = document.getElementById('visual-result');

  document.getElementById('pick-photo').addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      currentImageData = reader.result;
      preview.innerHTML = `<img src="${currentImageData}" alt="Upload">`;
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  });

  analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analiziram...';
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = '<p class="text-muted">Domaćinko razmišlja...</p>';

    const note = document.getElementById('visual-note').value.trim();
    const response = await analyzeWithVision(currentImageData, note);
    resultEl.innerHTML = `
      <h3 class="section__title mb-sm">Rezultat analize</h3>
      <div class="visual-response">${response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
      <a href="knowledge.html" class="btn btn--secondary btn--sm mt-md" id="save-solution">Sačuvaj rešenje</a>
    `;
    document.getElementById('save-solution')?.addEventListener('click', e => {
      e.preventDefault();
      const title = note || 'Vizuelna analiza';
      sessionStorage.setItem('knowledge_prefill', JSON.stringify({ title, solution: response.replace(/\*\*/g, '') }));
      window.location.href = 'knowledge.html';
    });

    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analiziraj';
  });
});
