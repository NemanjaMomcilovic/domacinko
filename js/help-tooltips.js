/**
 * Domaćinko - Kontekstualna pomoć (? ikone)
 */

const DISMISSED_TIPS_KEY = 'domacinko_dismissed_tips';

const HELP_TOPICS = {
  finances: {
    title: 'Finansije',
    text: 'Pratite mesečni budžet, troškove po kategorijama i finansijsko zdravlje. Postavite limite po kategorijama u Podešavanjima — upozorenje na 80%, prekoračenje na 100%. Finansijski trener daje personalizovane savete na osnovu vaših podataka.'
  },
  shopping: {
    title: 'Lista za kupovinu',
    text: 'Dodajte stavke ručno ili generišite iz plana obroka. Kategorije pomažu u prodavnici. Omiljeni proizvodi se brzo dodaju jednim dodirom. Domaćinko pamti navike kupovine.'
  },
  'meal-plan': {
    title: 'Plan obroka',
    text: 'Tri obroka dnevno (doručak, ručak, večera). Dodirnite slot — izaberite gotovo srpsko jelo ili unesite samo namirnice. Generišite listu za kupovinu iz plana.'
  },
  'ai-modules': {
    title: 'AI moduli',
    text: 'Savetnik odgovara na pitanja o budžetu i domu. Majstor daje korake za popravke. Učitelj objašnjava budžetiranje, kuvanje i održavanje. Bez OpenAI ključa radi pametno lokalno.'
  },
  'visual-assist': {
    title: 'Vizuelni asistent',
    text: 'Slikajte problem (curenje, fleka, biljka) i dobijte savet. Sa OpenAI ključem analiza slike je preciznija; bez ključa koriste se proverena pravila na srpskom.'
  },
  'ocr-scan': {
    title: 'OCR skeniranje',
    text: 'Fotografišite račun — aplikacija prepoznaje iznos i predlaže kategoriju. Proverite podatke pre čuvanja. Radi offline za ručni unos ako OCR ne uspe.'
  },
  magazine: {
    title: 'Kućni magacin',
    text: 'Evidentirajte sijalice, boju, šrafove i filtere po lokaciji i kategoriji. Upozorenje na nisku zaliha. Pre kupovine proverite magacin — štedi novac.'
  },
  maintenance: {
    title: 'Održavanje',
    text: 'Redovni servisi (bojler, klima, auto) sa podsetnicima. Označite „Urađeno" kad završite — Domaćinko računa sledeći rok i podseća u jutarnjem brifingu.'
  },
  seasonal: {
    title: 'Sezonski plan',
    text: 'Checklist za svih 12 meseci — grejanje, klima, bašta, bezbednost. Označite završene zadatke. Domaćinko podseća u jutarnjem brifingu.'
  },
  forecast: {
    title: 'Prognoza troškova',
    text: 'Kalendar predstojećih računa, pretplata, registracije i rođendana. Planirajte novac unapred — posebno korisno na početku meseca.'
  },
  projects: {
    title: 'Projekti',
    text: 'DIY projekti sa budžetom, listom materijala, procenom troška i redosledom radova. Unesite dimenzije za bolju procenu (farbanje, police, ograda).'
  },
  diary: {
    title: 'Dnevnik kuće',
    text: 'Zabeležite popravke, servise, farbanje sa datumom, tipom i fotografijom. Filtrirajte po tipu i datumu — korisno za garancije i prodaju kuće.'
  },
  knowledge: {
    title: 'Baza znanja',
    text: 'Čuvajte rešenja iz AI Majstora ili vizuelnog asistenta. Pretražujte po tagovima, kategorijama i označite omiljene zvezdicom.'
  },
  garden: {
    title: 'Bašta',
    text: 'Evidentirajte biljke i raspored zalivanja. Domaćinko podseća kada je vreme za zalivanje u jutarnjem brifingu.'
  },
  safety: {
    title: 'Bezbednost',
    text: 'Pratite detektore dima, CO, aparat za gašenje, prvu pomoć i lekove. Istekle stavke se prikazuju na početnoj i u brifingu.'
  },
  tools: {
    title: 'Inventar alata',
    text: 'Evidentirajte alate po kategorijama. AI Majstor proverava da li imate potrebne alate pre DIY saveta.'
  },
  household: {
    title: 'Domaćinstvo',
    text: 'Članovi porodice, automobili, računi, ostava, garancije. Rođendani se pojavljuju u prognozi troškova i brifingu.'
  },
  'house-profile': {
    title: 'Profil kuće',
    text: 'Kvadratura, tip grejanja i aparati pomažu AI-u da daje relevantnije savete — npr. gas vs. struja, stan vs. kuća.'
  },
  supabase: {
    title: 'Supabase sinhronizacija',
    text: 'Korak 1: Napravite besplatan projekat na supabase.com. Korak 2: Kopirajte Project URL i anon public ključ ovde. Korak 3: Prijavite se — podaci se sinhronizuju između uređaja. Detalji u docs/supabase-setup.md.'
  },
  openai: {
    title: 'OpenAI ključ',
    text: 'Opcioni API ključ sa platform.openai.com omogućava pametnije AI odgovore i analizu slika. Bez ključa Domaćinko koristi proverena lokalna pravila — sve radi offline. Ključ se čuva samo na vašem uređaju.'
  },
  backup: {
    title: 'Backup podataka',
    text: 'Izvezite JSON backup sa svim podacima (troškovi, liste, projekti). Uvezite na drugom uređaju ili nakon resetovanja. Backup uključuje profil i verziju aplikacije.'
  }
};

const PAGE_HELP_MAP = {
  'finances.html': ['finances'],
  'shopping.html': ['shopping'],
  'meal-plan.html': ['meal-plan'],
  'ai.html': ['ai-modules'],
  'repairs.html': ['ai-modules'],
  'visual-assist.html': ['visual-assist'],
  'scan-receipt.html': ['ocr-scan'],
  'inventory.html': ['magazine'],
  'maintenance.html': ['maintenance'],
  'seasonal.html': ['seasonal'],
  'forecast.html': ['forecast'],
  'projects.html': ['projects'],
  'diary.html': ['diary'],
  'knowledge.html': ['knowledge'],
  'garden.html': ['garden'],
  'safety.html': ['safety'],
  'tools.html': ['tools'],
  'household.html': ['household'],
  'house-profile.html': ['house-profile'],
  'settings.html': ['openai', 'backup']
};

function getDismissedTips() {
  try {
    const raw = localStorage.getItem(DISMISSED_TIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissTip(tipId) {
  const dismissed = getDismissedTips();
  if (!dismissed.includes(tipId)) {
    dismissed.push(tipId);
    localStorage.setItem(DISMISSED_TIPS_KEY, JSON.stringify(dismissed));
  }
}

function resetDismissedTips() {
  localStorage.removeItem(DISMISSED_TIPS_KEY);
}

function isTipDismissed(tipId) {
  return getDismissedTips().includes(tipId);
}

function createHelpButton(tipId) {
  const topic = HELP_TOPICS[tipId];
  if (!topic || isTipDismissed(tipId)) return '';
  return `<button type="button" class="help-tooltip" data-help-id="${tipId}" aria-label="Pomoć: ${topic.title}" aria-expanded="false">?</button>`;
}

function closeHelpPopover() {
  document.querySelectorAll('.help-popover').forEach(p => p.remove());
  document.querySelectorAll('.help-tooltip[aria-expanded="true"]').forEach(b => {
    b.setAttribute('aria-expanded', 'false');
  });
}

function showHelpPopover(btn, tipId) {
  closeHelpPopover();
  const topic = HELP_TOPICS[tipId];
  if (!topic) return;

  const popover = document.createElement('div');
  popover.className = 'help-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', topic.title);
  popover.innerHTML = `
    <div class="help-popover__header">
      <strong>${topic.title}</strong>
      <button type="button" class="help-popover__close" aria-label="Zatvori">✕</button>
    </div>
    <p class="help-popover__text">${topic.text}</p>
    <button type="button" class="btn btn--ghost btn--sm help-popover__dismiss" data-dismiss="${tipId}">
      Ne prikazuj ponovo
    </button>
  `;

  document.body.appendChild(popover);

  const rect = btn.getBoundingClientRect();
  const top = Math.min(rect.bottom + 8, window.innerHeight - popover.offsetHeight - 16);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - popover.offsetWidth - 8));
  popover.style.top = `${Math.max(8, top)}px`;
  popover.style.left = `${left}px`;

  btn.setAttribute('aria-expanded', 'true');

  popover.querySelector('.help-popover__close').addEventListener('click', closeHelpPopover);
  popover.querySelector('.help-popover__dismiss').addEventListener('click', () => {
    dismissTip(tipId);
    document.querySelectorAll(`[data-help-id="${tipId}"]`).forEach(b => b.remove());
    closeHelpPopover();
    showToast?.('Savet sakriven. Resetujte u Podešavanjima.', 'info');
  });
}

function initHelpTooltips() {
  const page = window.location.pathname.split('/').pop() || '';
  const tipIds = PAGE_HELP_MAP[page] || [];

  tipIds.forEach((tipId, index) => {
    const topic = HELP_TOPICS[tipId];
    if (!topic || isTipDismissed(tipId)) return;

    if (page === 'settings.html') {
      const selectors = {
        openai: '#api-key',
        backup: '#export-data'
      };
      const sel = selectors[tipId];
      if (tipId === 'openai') {
        const label = document.querySelector('label[for="api-key"]');
        if (label && !label.querySelector('.help-tooltip')) {
          label.insertAdjacentHTML('beforeend', ` ${createHelpButton(tipId)}`);
        }
      }
      return;
    }

    if (index === 0) {
      const mainTitle = document.querySelector('.section__title, .page-header__title, main h2, .text-muted.text-center');
      if (mainTitle && !mainTitle.querySelector('.help-tooltip')) {
        mainTitle.insertAdjacentHTML('beforeend', ` ${createHelpButton(tipId)}`);
      }
    }
  });

  document.querySelectorAll('[data-help]').forEach(el => {
    const tipId = el.dataset.help;
    if (!el.querySelector('.help-tooltip')) {
      el.insertAdjacentHTML('beforeend', ` ${createHelpButton(tipId)}`);
    }
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.help-tooltip');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const tipId = btn.dataset.helpId;
      if (btn.getAttribute('aria-expanded') === 'true') {
        closeHelpPopover();
      } else {
        showHelpPopover(btn, tipId);
      }
      return;
    }
    if (!e.target.closest('.help-popover')) {
      closeHelpPopover();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeHelpPopover();
  });
}

document.addEventListener('DOMContentLoaded', initHelpTooltips);
