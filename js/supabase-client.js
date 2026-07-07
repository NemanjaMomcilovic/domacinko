/**
 * Domaćinko — Supabase klijent
 */

const SUPABASE_CONFIG_KEY = 'domacinko_supabase_config';

let _supabaseClient = null;

function getDomacinkoConfig() {
  if (window.DOMACINKO_CONFIG) return window.DOMACINKO_CONFIG;
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

function getSupabaseConfigSource() {
  if (window.DOMACINKO_CONFIG?.SUPABASE_URL && window.DOMACINKO_CONFIG?.SUPABASE_ANON_KEY) {
    return 'config.js';
  }
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.SUPABASE_URL && parsed.SUPABASE_ANON_KEY) return 'localStorage';
    }
  } catch { /* ignore */ }
  return 'none';
}

function saveSupabaseConfig(url, anonKey) {
  const payload = {
    SUPABASE_URL: (url || '').trim(),
    SUPABASE_ANON_KEY: (anonKey || '').trim()
  };
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(payload));
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
  const cfg = getDomacinkoConfig();
  const url = cfg.SUPABASE_URL || '';
  const key = cfg.SUPABASE_ANON_KEY || '';
  if (!url || !key) return false;
  if (url.includes('your-project') || key.includes('your-anon')) return false;
  return true;
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

function getOAuthRedirectUrl() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return window.location.origin + path.replace(/[^/]+$/, 'auth.html');
  }
  return window.location.origin + '/pages/auth.html';
}
