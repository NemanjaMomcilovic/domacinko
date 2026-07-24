/**
 * Domaćinko — MVP scope (v1 core vs v2+ deferred)
 * betaMode=true (default) shows only core modules in nav/home/onboarding.
 */

/** Jedna rečenica — fokus proizvoda (koristiti svuda gde ima smisla) */
const MVP_TAGLINE = 'Prati troškove, planira obroke, pita savetnika.';

const MVP_WHAT_APP_DOES = [
  'Prati troškove, budžet i komunalije',
  'Planira obroke i listu za kupovinu',
  'Pita 10KEY Savetnika — besplatno, offline'
];

const MVP_MODULE_SECTIONS = [
  {
    title: '💰 Finansije',
    modules: [
      { id: 'finances', name: 'Finansije', icon: '📊', path: 'finances.html', desc: 'Troškovi, budžet i pregled', tier: 'core' },
      { id: 'add-expense', name: 'Dodaj trošak', icon: '💸', path: 'add-expense.html', desc: 'Brzo unesite novi rashod', tier: 'core' },
      { id: 'utility-bills', name: 'Komunalije', icon: '💡', path: 'utility-bills.html', desc: 'Struja, voda, grejanje — unos i plaćanje', tier: 'core' },
      { id: 'forecast', name: 'Prognoza troškova', icon: '📅', path: 'forecast.html', desc: 'Predstojeći rashodi', tier: 'v2' },
      { id: 'scan-receipt', name: 'Slikaj račun', icon: '📸', path: 'scan-receipt.html', desc: 'OCR skeniranje troškova (prodavnica)', tier: 'v2' },
      { id: 'household', name: 'Domaćinstvo', icon: '🏡', path: 'household.html', desc: 'Računi, auti, ostava', tier: 'v2' }
    ]
  },
  {
    title: '💬 10KEY Savetnik',
    modules: [
      { id: 'ai-advisor', name: '10KEY Savetnik', icon: '💬', path: 'ai.html', desc: 'Pitaj o budžetu, obrocima i kupovini', tier: 'core' },
      { id: 'visual-assist', name: 'Vizuelni asistent', icon: '📷', path: 'visual-assist.html', desc: 'Slikaj i analiziraj problem', tier: 'v2' },
      { id: 'ai-majstor', name: 'AI Majstor', icon: '🔧', path: 'repairs.html', desc: 'Popravke korak po korak', tier: 'v2' },
      { id: 'knowledge', name: 'Baza znanja', icon: '📚', path: 'knowledge.html', desc: 'Sačuvana rešenja', tier: 'v2' }
    ]
  },
  {
    title: '🏠 Kuća',
    modules: [
      { id: 'house-profile', name: 'Profil kuće', icon: '🏠', path: 'house-profile.html', desc: 'Kvadratura, grejanje, aparati', tier: 'v2' },
      { id: 'maintenance', name: 'Održavanje', icon: '🔩', path: 'maintenance.html', desc: 'Servisi, sezonski poslovi', tier: 'v2' },
      { id: 'seasonal', name: 'Sezonski plan', icon: '📋', path: 'seasonal.html', desc: 'Mesečna checklista', tier: 'v2' },
      { id: 'inventory', name: 'Inventar', icon: '📦', path: 'inventory.html', desc: 'Garancije i kućni magacin', tier: 'v2' },
      { id: 'tools', name: 'Alati', icon: '🧰', path: 'tools.html', desc: 'Inventar alata za DIY', tier: 'v2' },
      { id: 'diary', name: 'Dnevnik kuće', icon: '📔', path: 'diary.html', desc: 'Istorija radova', tier: 'v2' },
      { id: 'projects', name: 'Projekti', icon: '🛠️', path: 'projects.html', desc: 'DIY sa listom materijala', tier: 'v2' },
      { id: 'garden', name: 'Bašta', icon: '🌿', path: 'garden.html', desc: 'Zalivanje i biljke', tier: 'v2' },
      { id: 'safety', name: 'Bezbednost', icon: '🚨', path: 'safety.html', desc: 'Detektori i lekovi', tier: 'v2' },
      { id: 'craftsmen', name: 'Majstori', icon: '👷', path: 'craftsmen.html', desc: 'Orijentacione cene', tier: 'v2' }
    ]
  },
  {
    title: '🛒 Kupovina',
    modules: [
      { id: 'kitchen', name: 'Plan obroka', icon: '🍽️', path: 'meal-plan.html', desc: 'Nedeljni meni i kupovina', tier: 'core' },
      { id: 'shopping', name: 'Kupovina', icon: '🛒', path: 'shopping.html', desc: 'Lista i navike kupovine', tier: 'core' }
    ]
  },
  {
    title: '👤 Nalog i porodica',
    modules: [
      { id: 'profile', name: 'Moj profil', icon: '👤', path: 'profile.html', desc: 'Ime, budžet, ciljevi', tier: 'core' },
      { id: 'household-share', name: 'Porodica', icon: '👨‍👩‍👧', path: 'household-share.html', desc: 'Pozivni kod i sinhronizacija', tier: 'core' },
      { id: 'feedback', name: 'Feedback', icon: '💬', path: 'feedback.html', desc: 'Ocenite beta verziju', tier: 'core' },
      { id: 'settings', name: 'Podešavanja', icon: '⚙️', path: 'settings.html', desc: 'Nalog, izgled, obaveštenja', tier: 'core' }
    ]
  }
];

function isModuleCore(mod) {
  return mod?.tier === 'core';
}

function isModuleAvailableInBeta(mod) {
  return isModuleCore(mod);
}

function renderMvpBullets(className = 'mvp-bullets') {
  return `<ul class="${className}">${MVP_WHAT_APP_DOES.map(t => `<li>${t}</li>`).join('')}</ul>`;
}

function renderMvpTagline(className = 'mvp-tagline') {
  return `<p class="${className}">${MVP_TAGLINE}</p>`;
}

function renderModuleCard(mod, beta) {
  const comingSoon = beta && !isModuleAvailableInBeta(mod);
  const badge = comingSoon
    ? '<span class="module-card__badge">Dolazi uskoro</span>'
    : (mod.tier === 'core' ? '<span class="module-card__badge module-card__badge--core">Aktivno</span>' : '');

  if (comingSoon) {
    return `
      <div class="module-card module-card--coming-soon" role="button" tabindex="0"
        data-module-id="${mod.id}" aria-label="${mod.name} — dolazi uskoro">
        <span class="module-card__icon">${mod.icon}</span>
        <span class="module-card__title">${mod.name}</span>
        <span class="module-card__desc">${mod.desc}</span>
        ${badge}
      </div>
    `;
  }

  return `
    <a href="${mod.path}" class="module-card">
      <span class="module-card__icon">${mod.icon}</span>
      <span class="module-card__title">${mod.name}</span>
      <span class="module-card__desc">${mod.desc}</span>
      ${badge}
    </a>
  `;
}

function renderModulesHub(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const beta = typeof isBetaMode === 'function' && isBetaMode();
  const hero = beta
    ? `
      <div class="modules-hero modules-hero--beta">
        <div>
          <h2 class="modules-hero__title">Osnovni fokus</h2>
          <p class="modules-hero__tagline">${MVP_TAGLINE}</p>
          <p class="modules-hero__text">Napredni moduli su u beta načinu u pozadini. Uključite „Prikaži sve module" u Podešavanjima samo ako želite raniji pristup.</p>
        </div>
      </div>
    `
    : `
      <div class="modules-hero">
        <span class="modules-hero__icon" aria-hidden="true">🏠</span>
        <div>
          <h2 class="modules-hero__title">Svi moduli Domaćinka</h2>
          <p class="modules-hero__tagline">${MVP_TAGLINE}</p>
          <p class="modules-hero__text">Organizovano po kategorijama — finansije, kuća, kupovina i 10KEY Savetnik.</p>
        </div>
      </div>
    `;

  const sections = beta
    ? MVP_MODULE_SECTIONS.map(section => ({
        ...section,
        modules: section.modules.filter(isModuleAvailableInBeta)
      })).filter(section => section.modules.length > 0)
    : MVP_MODULE_SECTIONS;

  container.innerHTML = `
    ${hero}
    ${sections.map(section => `
      <section class="modules-section">
        <h2 class="modules-section__title">${section.title}</h2>
        <div class="module-hub">
          ${section.modules.map(mod => renderModuleCard(mod, beta)).join('')}
        </div>
      </section>
    `).join('')}
    ${beta ? `
      <p class="text-muted text-center modules-beta-note" style="font-size:var(--font-size-xs);margin-top:var(--space-xl)">
        Više alata (održavanje, inventar, bašta…) dolazi uskoro — ili ih uključite u Podešavanjima → Napredno.
      </p>
    ` : ''}
  `;

  if (beta) {
    container.querySelectorAll('.module-card--coming-soon').forEach(card => {
      const showHint = () => showToast?.('Ovaj modul dolazi u narednoj verziji. Uključite „Prikaži sve module" u Podešavanjima za raniji pristup.', 'info', 4000);
      card.addEventListener('click', showHint);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showHint();
        }
      });
    });
  }
}
