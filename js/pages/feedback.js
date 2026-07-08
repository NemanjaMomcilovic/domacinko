/**
 * Domaćinko — Beta feedback
 */

const FEEDBACK_STORAGE_KEY = 'domacinko_feedback';
const DEFAULT_FEEDBACK_EMAIL = 'feedback@10key.app';

function getFeedbackContactEmail() {
  const settings = typeof getSettings === 'function' ? getSettings() : {};
  const fromSettings = (settings.contactEmail || '').trim();
  if (fromSettings) return fromSettings;

  const cfg = typeof getDomacinkoConfig === 'function' ? getDomacinkoConfig() : {};
  const fromConfig = (cfg.CONTACT_EMAIL || '').trim();
  if (fromConfig) return fromConfig;

  return DEFAULT_FEEDBACK_EMAIL;
}

const RATING_LABELS = {
  1: 'Može bolje',
  2: 'U redu',
  3: 'Dobro',
  4: 'Veoma dobro',
  5: 'Odlično!'
};

let selectedRating = 0;

function getFeedbackSubmissions() {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFeedbackSubmission(entry) {
  const list = getFeedbackSubmissions();
  list.push(entry);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
  return entry;
}

function collectFeedbackFormData() {
  const dailyRadio = document.querySelector('input[name="would-use-daily"]:checked');
  return {
    rating: selectedRating,
    likes: document.getElementById('feedback-likes').value.trim(),
    improvements: document.getElementById('feedback-improvements').value.trim(),
    wouldUseDaily: dailyRadio ? dailyRadio.value : '',
    name: document.getElementById('feedback-name').value.trim(),
    email: document.getElementById('feedback-email').value.trim()
  };
}

function validateFeedbackForm(data) {
  let valid = true;

  const ratingError = document.getElementById('rating-error');
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    ratingError?.classList.remove('hidden');
    valid = false;
  } else {
    ratingError?.classList.add('hidden');
  }

  const dailyError = document.getElementById('daily-error');
  if (!data.wouldUseDaily) {
    dailyError?.classList.remove('hidden');
    valid = false;
  } else {
    dailyError?.classList.add('hidden');
  }

  const emailInput = document.getElementById('feedback-email');
  if (data.email && emailInput && !emailInput.checkValidity()) {
    emailInput.reportValidity();
    valid = false;
  }

  if (!data.likes && !data.improvements) {
    showToast('Napišite bar jedan komentar — šta vam se sviđa ili šta poboljšati.');
    valid = false;
  }

  return valid;
}

function buildFeedbackEmailBody(data) {
  const lines = [
    'Beta feedback — Domaćinko',
    '',
    `Ocena: ${data.rating}/5`,
    `Svakodnevna upotreba: ${data.wouldUseDaily}`,
    ''
  ];
  if (data.likes) lines.push('Šta mi se sviđa:', data.likes, '');
  if (data.improvements) lines.push('Šta poboljšati:', data.improvements, '');
  if (data.name) lines.push(`Ime: ${data.name}`);
  if (data.email) lines.push(`Email: ${data.email}`);
  lines.push('', `Poslato: ${new Date().toLocaleString('sr-RS')}`);
  return lines.join('\n');
}

function buildMailtoLink(data) {
  const subject = encodeURIComponent(`Domaćinko beta feedback — ${data.rating}/5 zvezda`);
  const body = encodeURIComponent(buildFeedbackEmailBody(data));
  return `mailto:${getFeedbackContactEmail()}?subject=${subject}&body=${body}`;
}

async function submitFeedbackToSupabase(data) {
  if (!isSupabaseConfigured?.()) return { ok: false, skipped: true };
  const client = getSupabaseClient?.();
  if (!client) return { ok: false, skipped: true };

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const row = {
    user_id: user?.id || null,
    rating: data.rating,
    likes: data.likes || null,
    improvements: data.improvements || null,
    would_use_daily: data.wouldUseDaily,
    name: data.name || null,
    email: data.email || null
  };

  const { error } = await client.from('feedback').insert(row);
  if (error) {
    console.warn('Supabase feedback insert:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function prefillFromProfile() {
  const settings = typeof getSettings === 'function' ? getSettings() : {};
  const profile = typeof getCurrentProfile === 'function' ? getCurrentProfile() : null;

  const nameParts = [
    profile?.first_name || settings.firstName,
    profile?.last_name || settings.lastName
  ].filter(Boolean);
  const name = nameParts.join(' ').trim() || settings.userName || '';
  if (name) document.getElementById('feedback-name').value = name;

  const email = profile?.email || (typeof getCurrentUser === 'function' ? getCurrentUser()?.email : '') || '';
  if (email) document.getElementById('feedback-email').value = email;
}

function initStarRating() {
  const stars = document.querySelectorAll('.star-rating__btn');
  const hint = document.getElementById('rating-hint');

  stars.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.value, 10);
      updateStarDisplay(stars, selectedRating);
      document.getElementById('rating-error')?.classList.add('hidden');
      if (hint) hint.textContent = RATING_LABELS[selectedRating] || '';
    });
  });
}

function updateStarDisplay(stars, rating) {
  stars.forEach(btn => {
    const value = parseInt(btn.dataset.value, 10);
    const active = value <= rating;
    btn.classList.toggle('star-rating__btn--active', active);
    btn.textContent = active ? '★' : '☆';
    btn.setAttribute('aria-checked', value === rating ? 'true' : 'false');
  });
}

function showFeedbackSuccess() {
  document.getElementById('feedback-form')?.classList.add('hidden');
  document.getElementById('feedback-success')?.classList.remove('hidden');
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();
  const data = collectFeedbackFormData();
  if (!validateFeedbackForm(data)) return;

  const submitBtn = document.getElementById('feedback-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Šaljem…';
  }

  const entry = {
    id: typeof generateId === 'function' ? generateId() : `fb_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString()
  };
  saveFeedbackSubmission(entry);

  const supabaseResult = await submitFeedbackToSupabase(data);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Pošalji feedback';
  }

  if (!supabaseResult.skipped && !supabaseResult.ok) {
    showToast('Sačuvano lokalno. Server nije primio — probajte emailom.');
  }

  showFeedbackSuccess();
}

function handleEmailFallback(e) {
  e.preventDefault();
  const data = collectFeedbackFormData();
  if (!data.rating) {
    showToast('Prvo izaberite ocenu zvezdicama.');
    return;
  }
  window.location.href = buildMailtoLink(data);
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForAuth?.();

  initNavigation('settings', {
    title: 'Beta feedback',
    showBack: true,
    backHref: 'settings.html'
  });

  prefillFromProfile();
  initStarRating();

  document.getElementById('feedback-form')?.addEventListener('submit', handleFeedbackSubmit);
  document.getElementById('feedback-email-btn')?.addEventListener('click', handleEmailFallback);
});
