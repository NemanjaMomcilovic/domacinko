const REPAIR_TEMPLATES = {
  elektrika: {
    difficulty: 'Srednje do teško',
    tools: ['Odvijač', 'Tester napona', 'Izolovana klešta', 'Lampe'],
    steps: [
      'Isključite struju na osiguraču i proverite testerom da nema napona.',
      'Identifikujte tačan uzrok — labav kontakt, pregorela sijalica ili oštećen prekidač.',
      'Zamenite oštećeni deo istim tipom i snage.',
      'Uključite struju i testirajte. Ako problem ostaje, pozovite električara.'
    ],
    diyVsPro: 'DIY: zamena sijalice, utikača, prekidača (ako znate). Majstor: rad u ormaru, nova instalacija, kvarovi u zidu.',
    costEstimate: 'DIY: 500–3.000 RSD | Majstor: 3.000–15.000+ RSD'
  },
  vodovod: {
    difficulty: 'Lako do srednje',
    tools: ['Ključ za cevi', 'Teflon traka', 'Kofa', 'Peškir'],
    steps: [
      'Zatvorite glavni ventil za vodu.',
      'Postavite kofu ispod curenja i osušite cev.',
      'Proverite da li je problem u brtvi, navoju ili samoj cevi.',
      'Zategnite spoj ili zamenite brtvu/teflon traku.',
      'Otvorite ventil polako i proverite da nema curenja 10 minuta.'
    ],
    diyVsPro: 'DIY: curenje slavine, zamena brtve, čep. Majstor: pucanje cevi u zidu, zamena bojlera.',
    costEstimate: 'DIY: 300–2.000 RSD | Majstor: 2.500–20.000+ RSD'
  },
  gips: {
    difficulty: 'Srednje',
    tools: ['Gips masa', 'Špacl', 'Brusni papir', 'Nož za gips'],
    steps: [
      'Očistite oštećenu površinu od labavih delova.',
      'Nanesite tanki sloj gips mase i izravnajte špaclom.',
      'Sačekajte da se osuši (prema uputstvu na pakovanju).',
      'Brusite dok ne bude glatko, ponovite ako treba.',
      'Premazujte podlogom i bojom da se uklopi sa zidom.'
    ],
    diyVsPro: 'DIY: male rupe i pukotine do 10 cm. Majstor: velike površine, vlažne prostorije, plafon.',
    costEstimate: 'DIY: 500–1.500 RSD | Majstor: 3.000–12.000 RSD'
  },
  keramika: {
    difficulty: 'Srednje do teško',
    tools: ['Keramičarska masa', 'Plocica', 'Nivelir', 'Guma za fugovanje'],
    steps: [
      'Uklonite oštećenu pločicu pažljivo čekićem i dletom.',
      'Očistite podlogu i nanesite lepak za keramiku.',
      'Postavite novu pločicu i poravnajte sa susednim.',
      'Sačekajte sušenje, zatim fugujte spojnice.',
      'Obrišite višak i proverite stabilnost nakon 24h.'
    ],
    diyVsPro: 'DIY: 1–2 pločice. Majstor: ceo pod, kupatilo, hidroizolacija.',
    costEstimate: 'DIY: 1.000–4.000 RSD | Majstor: 5.000–30.000+ RSD'
  },
  moleraj: {
    difficulty: 'Lako do srednje',
    tools: ['Valjak', 'Kist', 'Folija', 'Traka', 'Boja', 'Podloga'],
    steps: [
      'Zaštitite pod i nameštaj folijom i trakom.',
      'Očistite zid i nanesite podlogu ako je potrebna.',
      'Nanesite prvi sloj boje ravnomerno valjkom.',
      'Sačekajte sušenje (4–6h), zatim drugi sloj.',
      'Uklonite zaštitu i proverite pokrivenost na svetlu.'
    ],
    diyVsPro: 'DIY: jedna soba, osvežavanje. Majstor: fasada, visoki plafoni, dekorativne tehnike.',
    costEstimate: 'DIY: 2.000–8.000 RSD/soba | Majstor: 8.000–25.000 RSD/soba'
  },
  basta: {
    difficulty: 'Lako',
    tools: ['Sekira', 'Makaze za živu ogradu', 'Lopata', 'Crevo'],
    steps: [
      'Procenite šta treba — košenje, orezivanje, navodnjavanje ili zaštita od štetočina.',
      'Uklonite suvo lišće i korov sa gazona i oko biljaka.',
      'Orezujte mrtve grane i oblikujte živu ogradu.',
      'Navodnite ujutru ili uveče, ne tokom najveće vrućine.',
      'Dodajte đubrivo prema sezoni (proleće/jesen).'
    ],
    diyVsPro: 'DIY: većina baštanskih poslova. Majstor: veliki rasad, sistemi navodnjavanja.',
    costEstimate: 'DIY: 1.000–5.000 RSD | Majstor: 5.000–20.000 RSD'
  },
  namestaj: {
    difficulty: 'Lako do srednje',
    tools: ['Šrafciger', 'Allen ključ', 'Lepak za drvo', 'Brusni papir'],
    steps: [
      'Identifikujte problem — labav zglob, pukotina, ogrebotina.',
      'Za labave delove: zategnite šrafove ili zamenite šarke.',
      'Za pukotine u drvu: napunite lepkom i drškom, brusite.',
      'Za ogrebotine: vosak u boji drveta ili touch-up marker.',
      'Testirajte stabilnost pre upotrebe.'
    ],
    diyVsPro: 'DIY: montaža, zatezanje, male popravke. Majstor: tapaciranje, restauracija antikviteta.',
    costEstimate: 'DIY: 500–3.000 RSD | Majstor: 3.000–15.000 RSD'
  },
  alati: {
    difficulty: 'Lako',
    tools: ['Ulje za mašine', 'Četka', 'Krpa', 'Oštrač'],
    steps: [
      'Očistite alat od prljavštine i rdje četkom.',
      'Proverite oštrinu ili funkcionalnost (ključevi, testera).',
      'Podmažite pokretne delove uljem za mašine.',
      'Oštrite oštre ivice ako je potrebno.',
      'Čuvajte na suvom mestu u kutiji ili na zidu.'
    ],
    diyVsPro: 'DIY: održavanje alata je uvek vaš posao. Zamena alata ako je oštećen.',
    costEstimate: 'DIY: 200–1.500 RSD | Novi alat: 1.000–10.000+ RSD'
  }
};

function getRepairCategoryLabel(id) {
  const cat = REPAIR_CATEGORIES.find(c => c.id === id);
  return cat ? cat.label : id;
}

function getRuleBasedRepairAdvice(category, problem) {
  const template = REPAIR_TEMPLATES[category] || REPAIR_TEMPLATES.alati;
  const catLabel = getRepairCategoryLabel(category);
  const problemLower = (problem || '').toLowerCase();

  let extraStep = '';
  if (problemLower.includes('curen') || problemLower.includes('kap')) {
    extraStep = 'Fokus: locirajte tačno mesto curenja pre popravke.';
  } else if (problemLower.includes('puk') || problemLower.includes('pukotin')) {
    extraStep = 'Fokus: stabilizujte pukotinu pre punjenja ili lepljenja.';
  } else if (problemLower.includes('ne radi') || problemLower.includes('ne pali')) {
    extraStep = 'Fokus: proverite napajanje, osigurače i jednostavne uzroke pre zamene.';
  }

  const steps = [...template.steps];
  if (extraStep) steps.unshift(extraStep);

  return {
    summary: `Za problem u kategoriji ${catLabel}: "${problem}". Evo korak-po-korak saveta:`,
    steps,
    difficulty: template.difficulty,
    tools: template.tools,
    diyVsPro: template.diyVsPro,
    costEstimate: template.costEstimate
  };
}

async function getRepairAdvice(category, problem) {
  const settings = getSettings();
  const ruleAdvice = getRuleBasedRepairAdvice(category, problem);

  if (settings.apiKey && settings.apiKey.trim()) {
    try {
      const aiAdvice = await callRepairOpenAI(category, problem, settings);
      if (aiAdvice) return { ...ruleAdvice, ...aiAdvice, source: 'ai' };
    } catch { /* fallback to rule-based */ }
  }

  return { ...ruleAdvice, source: 'local' };
}

async function callRepairOpenAI(category, problem, settings) {
  const catLabel = getRepairCategoryLabel(category);
  const systemPrompt = `Ti si AI Majstor — stručnjak za kućne popravke u Srbiji. Odgovaraj na srpskom, jasno i bezbedno.
Daj: korake (niz), difficulty (string), tools (niz), diyVsPro (string), costEstimate (string u RSD).
Uvek naglasi bezbednost. Ako je opasno, preporuči majstora.`;

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
        { role: 'user', content: `Kategorija: ${catLabel}\nProblem: ${problem}\nOdgovori kao JSON: {"steps":[],"difficulty":"","tools":[],"diyVsPro":"","costEstimate":""}` }
      ],
      max_tokens: 500,
      temperature: 0.6
    })
  });

  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return null;
}

function renderRepairResult(advice, source, meta = {}) {
  const stepsHtml = advice.steps.map((s, i) => `<li>${s}</li>`).join('');
  const toolsHtml = advice.tools.map(t => `<span class="chip">${t}</span>`).join('');
  const saveBtn = meta.category && meta.problem ? `
      <button type="button" class="btn btn--secondary btn--block mt-md" id="save-repair-solution">
        📚 Sačuvaj rešenje u bazu znanja
      </button>` : '';

  return `
    <div class="repair-result card animate-fade-in">
      <p class="repair-result__summary">${advice.summary || 'Evo saveta za vaš problem:'}</p>
      <div class="repair-result__meta">
        <span class="badge badge--${advice.difficulty.includes('Lako') ? 'success' : advice.difficulty.includes('teško') ? 'danger' : 'warning'}">${advice.difficulty}</span>
        ${source === 'ai' ? '<span class="badge">AI</span>' : '<span class="badge">Lokalno</span>'}
      </div>
      <h4 class="repair-result__heading">Koraci</h4>
      <ol class="repair-result__steps">${stepsHtml}</ol>
      <h4 class="repair-result__heading">Alati</h4>
      <div class="quick-chips" style="padding:0">${toolsHtml}</div>
      <h4 class="repair-result__heading">DIY vs Majstor</h4>
      <p class="repair-result__text">${advice.diyVsPro}</p>
      <h4 class="repair-result__heading">Procena troška</h4>
      <p class="repair-result__text">${advice.costEstimate}</p>
      ${saveBtn}
    </div>
  `;
}

function saveRepairToKnowledge(category, problem, advice) {
  const catLabel = getRepairCategoryLabel(category);
  const steps = (advice.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const solution = [
    advice.summary || '',
    '',
    'Koraci:',
    steps,
    '',
    `Težina: ${advice.difficulty}`,
    `Alati: ${(advice.tools || []).join(', ')}`,
    advice.diyVsPro || '',
    advice.costEstimate || ''
  ].filter(Boolean).join('\n');

  const categoryMap = {
    elektrika: 'elektrika',
    vodovod: 'vodovod',
    gips: 'ostalo',
    keramika: 'ostalo',
    moleraj: 'ostalo',
    basta: 'ostalo',
    namestaj: 'ostalo',
    alati: 'aparati'
  };

  sessionStorage.setItem('knowledge_prefill', JSON.stringify({
    title: `${catLabel}: ${problem}`,
    solution,
    category: categoryMap[category] || 'ostalo'
  }));
  window.location.href = 'knowledge.html';
}

function renderRepairHistory() {
  const container = document.getElementById('repair-history');
  if (!container) return;

  const history = getRepairHistory();
  if (history.length === 0) {
    container.innerHTML = renderEmptyState('🔧', 'Nema istorije', 'Vaši saveti će se čuvati ovde.');
    return;
  }

  container.innerHTML = history.map(r => `
    <div class="list-item" style="padding:var(--space-sm) 0">
      <div class="list-item__icon">${REPAIR_CATEGORIES.find(c => c.id === r.category)?.icon || '🔧'}</div>
      <div class="list-item__content">
        <div class="list-item__title">${r.problem}</div>
        <div class="list-item__subtitle">${getRepairCategoryLabel(r.category)} · ${r.difficulty} · ${formatDate(r.date.split('T')[0])}</div>
      </div>
      <button class="btn btn--ghost btn--sm delete-repair" data-id="${r.id}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.delete-repair').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteRepairRecord(btn.dataset.id);
      renderRepairHistory();
      showToast('Obrisano iz istorije.');
    });
  });
}

function initRepairsUI(options = {}) {
  const categoryContainer = document.getElementById(options.categoryId || 'repair-categories');
  const resultContainer = document.getElementById(options.resultId || 'repair-result');
  const problemInput = document.getElementById(options.problemId || 'repair-problem');
  const submitBtn = document.getElementById(options.submitId || 'repair-submit');

  if (!categoryContainer) return;

  let selectedCategory = REPAIR_CATEGORIES[0].id;

  categoryContainer.innerHTML = REPAIR_CATEGORIES.map(c => `
    <button type="button" class="chip repair-cat${c.id === selectedCategory ? ' repair-cat--active' : ''}" data-cat="${c.id}">
      ${c.icon} ${c.label}
    </button>
  `).join('');

  categoryContainer.querySelectorAll('.repair-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat;
      categoryContainer.querySelectorAll('.repair-cat').forEach(b => b.classList.remove('repair-cat--active'));
      btn.classList.add('repair-cat--active');
    });
  });

  if (!submitBtn || submitBtn.dataset.initialized === 'true') return;
  submitBtn.dataset.initialized = 'true';

  submitBtn.addEventListener('click', async () => {
    const problem = problemInput?.value.trim();
    if (!problem) {
      showToast('Opišite problem.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Analiziram...';

    const advice = await getRepairAdvice(selectedCategory, problem);
    addRepairRecord({
      category: selectedCategory,
      problem,
      advice: advice.summary,
      difficulty: advice.difficulty,
      tools: advice.tools,
      diyVsPro: advice.diyVsPro,
      costEstimate: advice.costEstimate,
      steps: advice.steps
    });

    if (resultContainer) {
      resultContainer.innerHTML = renderRepairResult(advice, advice.source, {
        category: selectedCategory,
        problem
      });
      document.getElementById('save-repair-solution')?.addEventListener('click', () => {
        saveRepairToKnowledge(selectedCategory, problem, advice);
      });
    }

    renderRepairHistory();
    if (problemInput) problemInput.value = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Daj savet';
    showToast('Savet sačuvan!');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('repairs.html')) return;
  initNavigation('ai', { title: 'AI Majstor', showBack: true, backHref: 'ai.html' });
  initRepairsUI();
  renderRepairHistory();
});
