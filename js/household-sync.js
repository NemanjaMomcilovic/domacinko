/**
 * Domaćinko — Porodična sinhronizacija (Supabase households)
 */

const HOUSEHOLD_CACHE_KEY = 'domacinko_household_cache';
const HOUSEHOLD_LAST_SYNC_KEY = 'domacinko_household_last_sync';

const SHARED_SYNC_KEYS = [
  'expenses', 'shoppingList', 'household', 'mealPlan', 'maintenance',
  'inventory', 'tasks', 'recurringExpenses', 'favoriteProducts', 'utilityBills'
];

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

let _currentHousehold = null;
let _householdMembers = [];
let _householdSyncTimer = null;
const HOUSEHOLD_SYNC_DEBOUNCE_MS = 1500;

function getHouseholdCache() {
  try {
    const raw = localStorage.getItem(HOUSEHOLD_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setHouseholdCache(household) {
  if (household) {
    localStorage.setItem(HOUSEHOLD_CACHE_KEY, JSON.stringify(household));
  } else {
    localStorage.removeItem(HOUSEHOLD_CACHE_KEY);
  }
}

function clearHouseholdCache() {
  localStorage.removeItem(HOUSEHOLD_CACHE_KEY);
  localStorage.removeItem(HOUSEHOLD_LAST_SYNC_KEY);
  _currentHousehold = null;
  _householdMembers = [];
}

function isInHousehold() {
  return !!(getCurrentHousehold()?.id);
}

function getCurrentHousehold() {
  return _currentHousehold || getHouseholdCache();
}

function getCurrentHouseholdId() {
  return getCurrentHousehold()?.id || null;
}

function generateInviteCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  }
  return code;
}

function extractSharedData(fullData) {
  const shared = {};
  SHARED_SYNC_KEYS.forEach(key => {
    if (fullData[key] !== undefined) shared[key] = fullData[key];
  });
  return shared;
}

function mergeSharedDataIntoLocal(shared) {
  if (!shared || typeof shared !== 'object') return false;

  const data = getData();
  let changed = false;
  SHARED_SYNC_KEYS.forEach(key => {
    if (shared[key] !== undefined) {
      data[key] = shared[key];
      changed = true;
    }
  });

  if (changed) {
    if (typeof _skipCloudSync !== 'undefined') _skipCloudSync = true;
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
    if (typeof _skipCloudSync !== 'undefined') _skipCloudSync = false;
    localStorage.setItem(HOUSEHOLD_LAST_SYNC_KEY, new Date().toISOString());
  }
  return changed;
}

async function initHouseholdSync() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    clearHouseholdCache();
    return null;
  }
  if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) {
    return getHouseholdCache();
  }

  await loadCurrentHousehold();
  if (isInHousehold()) {
    await pullHouseholdDataFromCloud();
    await loadHouseholdMembers();
  }
  return getCurrentHousehold();
}

async function loadCurrentHousehold() {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!client || !user) return null;

  const { data: membership, error } = await client
    .from('household_members')
    .select('household_id, role, joined_at, households(id, name, invite_code, created_by, created_at)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !membership?.households) {
    _currentHousehold = null;
    clearHouseholdCache();
    return null;
  }

  const h = membership.households;
  _currentHousehold = {
    id: h.id,
    name: h.name,
    invite_code: h.invite_code,
    role: membership.role,
    created_by: h.created_by,
    joined_at: membership.joined_at
  };
  setHouseholdCache(_currentHousehold);
  return _currentHousehold;
}

async function loadHouseholdMembers() {
  const householdId = getCurrentHouseholdId();
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client || !householdId) {
    _householdMembers = [];
    return [];
  }

  const { data, error } = await client
    .from('household_members')
    .select('user_id, role, joined_at, profiles(first_name, last_name, email)')
    .eq('household_id', householdId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.warn('Članovi domaćinstva:', error.message);
    return _householdMembers;
  }

  _householdMembers = (data || []).map(m => ({
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at,
    name: [m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ').trim()
      || m.profiles?.email?.split('@')[0] || 'Član',
    email: m.profiles?.email || ''
  }));
  return _householdMembers;
}

function getHouseholdMembers() {
  return _householdMembers;
}

async function createHousehold(name) {
  const client = getSupabaseClient();
  const user = getCurrentUser();
  if (!client || !user) throw new Error('Morate biti prijavljeni.');

  const existing = await loadCurrentHousehold();
  if (existing) throw new Error('Već ste u domaćinstvu. Prvo napustite postojeće.');

  const householdName = (name || '').trim() || 'Moje domaćinstvo';
  let inviteCode = generateInviteCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data: household, error: hErr } = await client
      .from('households')
      .insert({
        name: householdName,
        invite_code: inviteCode,
        created_by: user.id
      })
      .select()
      .single();

    if (!hErr && household) {
      const { error: mErr } = await client.from('household_members').insert({
        household_id: household.id,
        user_id: user.id,
        role: 'owner'
      });
      if (mErr) throw new Error(mErr.message);

      await client.from('household_data').upsert({
        household_id: household.id,
        data: extractSharedData(getData()),
        updated_at: new Date().toISOString(),
        updated_by: user.id
      });

      _currentHousehold = {
        id: household.id,
        name: household.name,
        invite_code: household.invite_code,
        role: 'owner',
        created_by: user.id
      };
      setHouseholdCache(_currentHousehold);
      await loadHouseholdMembers();
      await pushHouseholdDataToCloud(getData());
      return _currentHousehold;
    }

    if (hErr?.code === '23505') {
      inviteCode = generateInviteCode();
      attempts++;
      continue;
    }
    throw new Error(hErr?.message || 'Kreiranje domaćinstva nije uspelo.');
  }

  throw new Error('Nije moguće generisati jedinstveni pozivni kod. Pokušajte ponovo.');
}

async function joinHousehold(inviteCode) {
  const client = getSupabaseClient();
  const user = getCurrentUser();
  if (!client || !user) throw new Error('Morate biti prijavljeni.');

  const code = (inviteCode || '').trim().toUpperCase();
  if (code.length !== 6) throw new Error('Pozivni kod mora imati 6 karaktera.');

  const existing = await loadCurrentHousehold();
  if (existing) throw new Error('Već ste u domaćinstvu. Prvo napustite postojeće.');

  const { data: household, error: hErr } = await client
    .from('households')
    .select('id, name, invite_code, created_by')
    .eq('invite_code', code)
    .maybeSingle();

  if (hErr || !household) throw new Error('Pozivni kod nije pronađen. Proverite sa vlasnikom.');

  const { error: mErr } = await client.from('household_members').insert({
    household_id: household.id,
    user_id: user.id,
    role: 'member'
  });
  if (mErr) throw new Error(mErr.message);

  _currentHousehold = {
    id: household.id,
    name: household.name,
    invite_code: household.invite_code,
    role: 'member',
    created_by: household.created_by
  };
  setHouseholdCache(_currentHousehold);
  await loadHouseholdMembers();
  await pullHouseholdDataFromCloud();
  return _currentHousehold;
}

async function leaveHousehold() {
  const client = getSupabaseClient();
  const user = getCurrentUser();
  const household = getCurrentHousehold();
  if (!client || !user || !household) return;

  if (household.role === 'owner') {
    const members = await loadHouseholdMembers();
    if (members.length > 1) {
      const other = members.find(m => m.user_id !== user.id);
      if (other) {
        await client.from('household_members')
          .update({ role: 'owner' })
          .eq('household_id', household.id)
          .eq('user_id', other.user_id);
      }
    } else {
      await client.from('households').delete().eq('id', household.id);
    }
  }

  await client.from('household_members')
    .delete()
    .eq('household_id', household.id)
    .eq('user_id', user.id);

  clearHouseholdCache();
}

async function pushHouseholdDataToCloud(fullData) {
  if (!isInHousehold() || typeof isLoggedIn !== 'function' || !isLoggedIn()) return;

  const client = getSupabaseClient();
  const user = getCurrentUser();
  const householdId = getCurrentHouseholdId();
  if (!client || !user || !householdId) return;

  const shared = extractSharedData(fullData || getData());
  const { error } = await client.from('household_data').upsert({
    household_id: householdId,
    data: shared,
    updated_at: new Date().toISOString(),
    updated_by: user.id
  }, { onConflict: 'household_id' });

  if (error) throw new Error(error.message);
  localStorage.setItem(HOUSEHOLD_LAST_SYNC_KEY, new Date().toISOString());
}

async function pullHouseholdDataFromCloud() {
  if (!isInHousehold()) return null;

  const client = getSupabaseClient();
  const householdId = getCurrentHouseholdId();
  if (!client || !householdId) return null;

  const { data: row, error } = await client
    .from('household_data')
    .select('data, updated_at')
    .eq('household_id', householdId)
    .maybeSingle();

  if (error || !row?.data) return null;

  const lastLocal = localStorage.getItem(HOUSEHOLD_LAST_SYNC_KEY);
  if (lastLocal && row.updated_at && new Date(row.updated_at) <= new Date(lastLocal)) {
    return null;
  }

  mergeSharedDataIntoLocal(row.data);
  return row.data;
}

function scheduleHouseholdSync() {
  if (!isInHousehold()) return;
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return;
  clearTimeout(_householdSyncTimer);
  _householdSyncTimer = setTimeout(() => {
    pushHouseholdDataToCloud(getData()).catch(() => {});
  }, HOUSEHOLD_SYNC_DEBOUNCE_MS);
}

async function copyInviteCode() {
  const code = getCurrentHousehold()?.invite_code;
  if (!code) return false;
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    return false;
  }
}
