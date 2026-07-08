let currentImageData = null;

const VISUAL_RULES = [
  { keywords: ['curenje', 'kap', 'voda', 'poplava'], response: '💧 **Curenje vode**: Odmah zatvorite glavni ventil! Stavite posudu ispod curenja. Za slavinu — zamena gumice (~200 RSD). Za cev — zategnite spoj ili zovite vodoinstalatera hitno.' },
  { keywords: ['plavina', 'mold', 'muc', 'gljiv'], response: '🦠 **Plavina/muc**: Uzrok je vlaga. Proverite curenje i provetravanje. Očistite belim sirćetom (1:1 sa vodom). Za veće površine — sredstvo protiv plavine i maska.' },
  { keywords: ['bolest', 'pegor', 'insekt', 'crven'], response: '🌱 **Bolest biljke**: Izolujte zaraženu biljku. Orezujte oštećene delove. Za pečurke — fungicid. Za insekte — sapunski rastvor.' },
  { keywords: ['ventil', 'slavina'], response: '🔧 **Ventil/slavina**: Zatvorite glavni ventil. Proverite gumicu ili zaptivač. Zamena sedla ~200–500 RSD.' },
  { keywords: ['osigurač', 'fuse', 'struja', 'iskra', 'struju'], response: '⚡ **Struja/osigurač**: Isključite glavni prekidač. Uklonite uređaje sa grane i ponovo uključite. Ako pada — kratki spoj, zovite električara.' },
  { keywords: ['gas', 'miris'], response: '🔥 **Gas**: Provetravajte, ne palite svetlo. Zatvorite ventil. Ako miris ostaje — napolje i hitna pomoć.' },
  { keywords: ['grejanje', 'radijator', 'kotao'], response: '🌡️ **Grejanje**: Proverite termostat, odzračivanje radijatora, pritisak. Sezonski servis kotla obavezan.' },
  { keywords: ['bojler'], response: '🔥 **Bojler**: Isključite struju. Proverite sigurnosni ventil i brtve. Curenje — majstor. Palite planski, ne 24/7.' },
  { keywords: ['klima', 'klimu'], response: '❄️ **Klima**: Filter, spoljna jedinica, 24–25°C. Servis pre leta. Ne hladite sa otvorenim prozorom.' },
  { keywords: ['fleka', 'mrlja', 'zid', 'boja'], response: '🎨 **Fleka na zidu**: Odredite uzrok (vlaga, voda). Za vodene — prvo rešite curenje, pa boja.' },
  { keywords: ['biljka', 'list', 'žuto', 'uvođen'], response: '🌿 **Biljka**: Žuti listovi — prekomerno zalivanje ili manjak svetlosti. Orezujte suve delove.' },
  { keywords: ['frižider', 'frizider', 'hladnjak', 'hladi'], response: '❄️ **Frižider**: Termostat 3–5°C. Očistite odledjivač i zadnju rešetku. Proverite brtve na vratima.' },
  { keywords: ['veš', 'ves', 'mašina', 'masina', 'pranje'], response: '🫧 **Veš mašina**: Filter, brtva, crevo. Nivelišite noge. Eco program i puna mašina štede vodu.' },
  { keywords: ['kirija', 'kredit'], response: '💰 **Trošak**: Evidentirajte u Finansijama kao račun. Ponavljajuće stavite u Podešavanjima za podsetnik.' },
  { keywords: ['popust', 'akcija'], response: '🛒 **Kupovina**: Popust vredi samo za stvari koje ionako kupujete. Proverite magacin pre odlaska u prodavnicu.' }
];

function getRuleBasedResponse(note) {
  const text = (note || '').toLowerCase();
  for (const rule of VISUAL_RULES) {
    if (rule.keywords.some(k => text.includes(k))) return rule.response;
  }

  const ctx = typeof buildFullAIContext === 'function' ? buildFullAIContext() : null;
  if (ctx?.houseProfile?.heatingType) {
    return `🏠 **Opšti savet** (grejanje: ${ctx.houseProfile.heatingType}): Opisite problem detaljnije ili koristite AI Majstor. Za gas i struju uvek pozovite stručnjaka ako niste sigurni.`;
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
