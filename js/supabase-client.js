/**
 * Domaćinko — Supabase klijent
 */

const SUPABASE_CONFIG_KEY = 'domacinko_supabase_config';

let _supabaseClient = null;

function normalizeSupabaseConfig(raw) {
  if (!raw || typeof raw !== 'object') return { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' };
  return {
    SUPABASE_URL: (raw.SUPABASE_URL || '').trim(),
    SUPABASE_ANON_KEY: (raw.SUPABASE_ANON_KEY || raw.SUPABASE_PUBLISHABLE_KEY || '').trim()
  };
}

function isPlaceholderSupabaseConfig(cfg) {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key } = normalizeSupabaseConfig(cfg);
  if (!url && !key) return true;
  if (url.includes('your-project') || key.includes('your-anon')) return true;
  return false;
}

function isValidSupabaseUrl(url) {
  const u = (url || '').trim();
  if (!u || u.includes('your-project')) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

function isValidSupabaseKey(key) {
  const k = (key || '').trim();
  if (!k || k.includes('your-anon')) return false;
  if (k.startsWith('eyJ') && k.length > 20) return true;
  if (k.startsWith('sb_publishable_') && k.length > 20) return true;
  return false;
}

function isSupabaseConfigValid(cfg) {
  const normalized = normalizeSupabaseConfig(cfg);
  return isValidSupabaseUrl(normalized.SUPABASE_URL)
    && isValidSupabaseKey(normalized.SUPABASE_ANON_KEY);
}

function readStoredSupabaseConfig() {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (!stored) return null;
    const parsed = normalizeSupabaseConfig(JSON.parse(stored));
    return isSupabaseConfigValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getDomacinkoConfig() {
  if (window.DOMACINKO_CONFIG && isSupabaseConfigValid(window.DOMACINKO_CONFIG)) {
    return normalizeSupabaseConfig(window.DOMACINKO_CONFIG);
  }
  const stored = readStoredSupabaseConfig();
  if (stored) return stored;
  return normalizeSupabaseConfig(window.DOMACINKO_CONFIG || {});
}

function getSupabaseConfigSource() {
  if (window.DOMACINKO_CONFIG && isSupabaseConfigValid(window.DOMACINKO_CONFIG)) {
    return 'config.js';
  }
  if (readStoredSupabaseConfig()) return 'localStorage';
  if (window.DOMACINKO_CONFIG && !isPlaceholderSupabaseConfig(window.DOMACINKO_CONFIG)) {
    return 'config.js-invalid';
  }
  return 'none';
}

function saveSupabaseConfig(url, anonKey) {
  const payload = normalizeSupabaseConfig({ SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey });
  if (!isSupabaseConfigValid(payload)) {
    throw new Error('Neispravan Supabase URL ili ključ.');
  }
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(payload));
  } catch {
    throw new Error('Čuvanje nije uspelo — pregledač možda blokira skladištenje.');
  }
  resetSupabaseClient();
  return payload;
}

function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  resetSupabaseClient();
}

function resetSupabaseClient() {
  _supabaseClient = null;
}

function isSupabaseConfigured() {
  return isSupabaseConfigValid(getDomacinkoConfig());
}

function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;
  if (!isSupabaseConfigured()) return null;
  if (typeof supabase === 'undefined' || !supabase.createClient) return null;

  const cfg = getDomacinkoConfig();
  _supabaseClient = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });
  return _supabaseClient;
}

async function testSupabaseConnection(url, anonKey) {
  const cfg = (url && anonKey)
    ? normalizeSupabaseConfig({ SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey })
    : getDomacinkoConfig();
  if (!isSupabaseConfigValid(cfg)) {
    return { ok: false, message: 'Unesite ispravan Supabase URL i ključ (eyJ... ili sb_publishable_...).' };
  }
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    return { ok: false, message: 'Supabase biblioteka nije učitana.' };
  }
  try {
    const client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const { error } = await client.auth.getSession();
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Supabase povezan — možete se prijaviti.' };
  } catch (err) {
    return { ok: false, message: err.message || 'Veza nije uspela.' };
  }
}

function getOAuthRedirectUrl() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return window.location.origin + path.replace(/[^/]+$/, 'auth.html');
  }
  return window.location.origin + '/pages/auth.html';
}
