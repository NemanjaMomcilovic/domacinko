/**
 * Domaćinko — Autentifikacija (Supabase)
 */

const AUTH_MODE_KEY = 'domacinko_auth_mode';
const PROFILE_CACHE_KEY = 'domacinko_profile_cache';

let _currentUser = null;
let _currentProfile = null;
let _authReady = false;
let _authReadyPromise = null;

function isGuestMode() {
  return localStorage.getItem(AUTH_MODE_KEY) === 'guest';
}

function setGuestMode() {
  localStorage.setItem(AUTH_MODE_KEY, 'guest');
  _currentUser = null;
  _currentProfile = null;
}

function clearGuestMode() {
  localStorage.removeItem(AUTH_MODE_KEY);
}

function isLoggedIn() {
  return !!_currentUser && !isGuestMode();
}

function getCurrentUser() {
  return _currentUser;
}

function getCurrentProfile() {
  return _currentProfile;
}

function cacheProfile(profile) {
  if (profile) {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  }
}

function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function applyProfileToLocalSettings(profile, skipSave) {
  if (!profile) return;
  const updates = {
    userName: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim(),
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    monthlyBudget: profile.monthly_budget ?? 80000,
    monthlyIncome: profile.monthly_income ?? 0,
    currentSavings: profile.current_savings ?? 0,
    savingsGoal: profile.savings_goal ?? 0,
    savingsGoalName: profile.savings_goal_name || '',
    currency: profile.currency || 'RSD'
  };
  if (skipSave && typeof saveSettings === 'function') {
    const data = getData();
    data.settings = { ...data.settings, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else if (typeof saveSettings === 'function') {
    saveSettings(updates);
  }
  if (profile.onboarding_complete) {
    setOnboardingComplete();
  }
}

async function waitForAuth() {
  if (_authReady) return;
  if (_authReadyPromise) return _authReadyPromise;
  _authReadyPromise = initAuth();
  return _authReadyPromise;
}

async function initAuth() {
  if (isGuestMode()) {
    _authReady = true;
    return { user: null, profile: null };
  }

  if (!isSupabaseConfigured()) {
    _authReady = true;
    return { user: null, profile: null };
  }

  const client = getSupabaseClient();
  if (!client) {
    _authReady = true;
    return { user: null, profile: null };
  }

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    _currentUser = session.user;
    clearGuestMode();
    await fetchProfile();
    if (typeof pullUserDataFromCloud === 'function') {
      await pullUserDataFromCloud();
    }
    if (typeof initHouseholdSync === 'function') {
      await initHouseholdSync();
    }
  }

  client.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      _currentUser = session.user;
      clearGuestMode();
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchProfile();
      }
    } else if (event === 'SIGNED_OUT') {
      _currentUser = null;
      _currentProfile = null;
      cacheProfile(null);
    }
  });

  _authReady = true;
  return { user: _currentUser, profile: _currentProfile };
}

async function fetchProfile() {
  if (!_currentUser || !isSupabaseConfigured()) return null;

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', _currentUser.id)
    .maybeSingle();

  if (error) {
    console.warn('Profil nije učitan:', error.message);
    _currentProfile = getCachedProfile();
    return _currentProfile;
  }

  if (!data) {
    _currentProfile = await createDefaultProfile();
  } else {
    _currentProfile = data;
  }

  cacheProfile(_currentProfile);
  applyProfileToLocalSettings(_currentProfile, true);
  return _currentProfile;
}

async function createDefaultProfile() {
  if (!_currentUser) return null;

  const client = getSupabaseClient();
  const profile = {
    user_id: _currentUser.id,
    email: _currentUser.email || '',
    first_name: '',
    last_name: '',
    monthly_income: 0,
    current_savings: 0,
    savings_goal: 10000,
    savings_goal_name: '',
    monthly_budget: 80000,
    currency: 'RSD',
    onboarding_complete: false
  };

  const { data, error } = await client
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.warn('Kreiranje profila nije uspelo:', error.message);
    return profile;
  }
  return data;
}

async function saveProfile(updates) {
  if (!_currentUser || !isSupabaseConfigured()) return null;

  const client = getSupabaseClient();
  const payload = { user_id: _currentUser.id, ...updates };

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);

  _currentProfile = data;
  cacheProfile(data);
  applyProfileToLocalSettings(data, true);
  return data;
}

async function signUp(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase nije podešen.');

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getOAuthRedirectUrl() }
  });
  if (error) throw error;

  if (data.user) {
    _currentUser = data.user;
    clearGuestMode();
    await createDefaultProfile();
  }
  return data;
}

async function finalizeSignIn(user) {
  _currentUser = user;
  clearGuestMode();
  await fetchProfile();
  if (typeof pullUserDataFromCloud === 'function') {
    await pullUserDataFromCloud();
  }
  if (typeof initHouseholdSync === 'function') {
    await initHouseholdSync();
  }
  await offerGuestDataImport();
}

async function signIn(email, password) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase nije podešen.');

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  await finalizeSignIn(data.user);
  return data;
}

async function signInWithGoogle() {
  return signInWithOAuth('google');
}

async function signInWithFacebook() {
  return signInWithOAuth('facebook');
}

function getOAuthSignInOptions(provider) {
  const options = { redirectTo: getOAuthRedirectUrl() };
  if (provider === 'google') {
    options.queryParams = { prompt: 'select_account' };
  } else if (provider === 'facebook') {
    options.queryParams = { auth_type: 'reauthenticate' };
  }
  return options;
}

async function signInWithOAuth(provider) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase nije podešen.');

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: getOAuthSignInOptions(provider)
  });
  if (error) throw error;
  return data;
}

async function resetPassword(email) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase nije podešen. Unesite ključeve u Podešavanjima.');

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: getOAuthRedirectUrl()
  });
  if (error) throw error;
}

function mapAuthError(err) {
  const msg = (err?.message || err?.error_description || String(err || '')).toLowerCase();
  if (!msg || msg === 'undefined') return 'Došlo je do greške. Pokušajte ponovo.';
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Pogrešan email ili lozinka.';
  }
  if (msg.includes('invalid') && msg.includes('session')) return 'Sesija je istekla. Prijavite se ponovo.';
  if (msg.includes('email not confirmed')) return 'Potvrdite email pre prijave.';
  if (msg.includes('user already registered')) return 'Nalog sa ovim emailom već postoji.';
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Proverite internet vezu i pokušajte ponovo.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Previše pokušaja. Sačekajte par minuta.';
  }
  if (msg.includes('access_denied') || msg.includes('oauth') || msg.includes('cancel')) {
    return 'Prijava otkazana. Pokušajte ponovo.';
  }
  return err?.message || err?.error_description || 'Došlo je do greške. Pokušajte ponovo.';
}

function isOAuthCallbackUrl() {
  const combined = (window.location.hash || '') + (window.location.search || '');
  return /access_token|refresh_token|(?:^|[?&#])code=|error(?:=|_description)/.test(combined);
}

function parseOAuthUrlError() {
  const hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const search = new URLSearchParams(window.location.search || '');
  return hash.get('error_description') || hash.get('error')
    || search.get('error_description') || search.get('error');
}

function cleanOAuthUrl() {
  history.replaceState({}, document.title, window.location.pathname);
}

async function handleOAuthCallback() {
  if (!isOAuthCallbackUrl()) return { handled: false };

  const urlError = parseOAuthUrlError();
  if (urlError) {
    cleanOAuthUrl();
    return { handled: true, success: false, error: mapAuthError({ message: urlError }) };
  }

  const client = getSupabaseClient();
  if (!client) {
    cleanOAuthUrl();
    return { handled: true, success: false, error: 'Supabase nije podešen.' };
  }

  const { data: { session }, error } = await client.auth.getSession();
  cleanOAuthUrl();

  if (error) return { handled: true, success: false, error: mapAuthError(error) };
  if (!session?.user) {
    return { handled: true, success: false, error: 'Prijava nije uspela. Pokušajte ponovo.' };
  }

  await finalizeSignIn(session.user);
  return { handled: true, success: true };
}

async function signOut() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Odjava:', err.message);
    }
  }
  _currentUser = null;
  _currentProfile = null;
  cacheProfile(null);
  localStorage.removeItem(AUTH_MODE_KEY);
  sessionStorage.removeItem('guest_import_asked');
  if (typeof clearHouseholdCache === 'function') {
    clearHouseholdCache();
  }
}

async function saveHouseholdItem(type, data) {
  if (!_currentUser || !isSupabaseConfigured()) return null;

  const client = getSupabaseClient();
  const { data: row, error } = await client
    .from('household_items')
    .insert({ user_id: _currentUser.id, type, data })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
}

function hasGuestLocalData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    const expenses = parsed.expenses?.length || 0;
    const shopping = parsed.shoppingList?.length || 0;
    const name = parsed.settings?.userName;
    return !!(expenses || shopping || name);
  } catch {
    return false;
  }
}

async function offerGuestDataImport() {
  if (!isLoggedIn() || !hasGuestLocalData()) return;

  const alreadyAsked = sessionStorage.getItem('guest_import_asked');
  if (alreadyAsked) return;

  sessionStorage.setItem('guest_import_asked', '1');

  const importData = confirm(
    'Pronašli smo podatke sa ovog uređaja (gost režim). Želite li da ih uvezete u vaš nalog?'
  );

  if (importData && typeof pushUserDataToCloud === 'function') {
    await pushUserDataToCloud(getData());
    showToast?.('Podaci sa uređaja su uvezeni u vaš nalog!');
  }
}

function needsOnboarding() {
  if (isGuestMode()) {
    return !isOnboardingComplete();
  }
  if (isLoggedIn() && _currentProfile) {
    return !_currentProfile.onboarding_complete;
  }
  if (isLoggedIn()) {
    const cached = getCachedProfile();
    if (cached) return !cached.onboarding_complete;
  }
  return !isOnboardingComplete();
}

function getAuthDisplayName() {
  if (_currentProfile?.first_name) {
    return [_currentProfile.first_name, _currentProfile.last_name].filter(Boolean).join(' ');
  }
  const settings = typeof getSettings === 'function' ? getSettings() : {};
  return settings.userName || settings.firstName || 'Korisnik';
}

async function requireAuthOrGuest(redirectPath) {
  await waitForAuth();
  if (isGuestMode() || isLoggedIn()) return true;

  const base = window.location.pathname.includes('/pages/')
    ? redirectPath || 'auth.html'
    : 'pages/auth.html';
  window.location.href = base;
  return false;
}
