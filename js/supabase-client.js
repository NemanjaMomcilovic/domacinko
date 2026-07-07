/**
 * Domaćinko — Supabase klijent
 */

let _supabaseClient = null;

function getDomacinkoConfig() {
  if (window.DOMACINKO_CONFIG) return window.DOMACINKO_CONFIG;
  try {
    const stored = localStorage.getItem('domacinko_supabase_config');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
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
