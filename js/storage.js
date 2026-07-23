/**
 * Domaćinko - localStorage API
 */

const STORAGE_KEY = 'domacinko_data';
const PROFILES_META_KEY = 'domacinko_profiles_meta';
const ACTIVE_PROFILE_KEY = 'domacinko_active_profile';

function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'default';
}

function getStorageKey() {
  const id = getActiveProfileId();
  return id === 'default' ? STORAGE_KEY : `${STORAGE_KEY}_${id}`;
}

function getProfilesMeta() {
  try {
    const raw = localStorage.getItem(PROFILES_META_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!parsed.length) {
      return [{ id: 'default', name: 'Podrazumevani', createdAt: new Date().toISOString() }];
    }
    return parsed;
  } catch {
    return [{ id: 'default', name: 'Podrazumevani', createdAt: new Date().toISOString() }];
  }
}

function saveProfilesMeta(profiles) {
  localStorage.setItem(PROFILES_META_KEY, JSON.stringify(profiles));
}

function getActiveProfileName() {
  const meta = getProfilesMeta();
  const active = getActiveProfileId();
  return meta.find(p => p.id === active)?.name || 'Podrazumevani';
}

function listLocalProfiles() {
  return getProfilesMeta();
}

function addLocalProfile(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const profiles = getProfilesMeta();
  if (profiles.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return null;

  const id = generateId();
  profiles.push({ id, name: trimmed, createdAt: new Date().toISOString() });
  saveProfilesMeta(profiles);
  localStorage.setItem(`${STORAGE_KEY}_${id}`, JSON.stringify(structuredClone(DEFAULT_DATA)));
  return { id, name: trimmed };
}

function switchLocalProfile(profileId) {
  const profiles = getProfilesMeta();
  if (!profiles.some(p => p.id === profileId)) return false;

  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  return true;
}

function deleteLocalProfile(profileId) {
  if (profileId === 'default') return false;
  const profiles = getProfilesMeta().filter(p => p.id !== profileId);
  if (profiles.length === getProfilesMeta().length) return false;

  localStorage.removeItem(`${STORAGE_KEY}_${profileId}`);
  saveProfilesMeta(profiles);

  if (getActiveProfileId() === profileId) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, 'default');
  }
  return true;
}

const CATEGORIES = [
  { id: 'food', label: 'Hrana', icon: '🍎' },
  { id: 'bills', label: 'Računi', icon: '📄' },
  { id: 'home', label: 'Dom', icon: '🏠' },
  { id: 'car', label: 'Auto', icon: '🚗' },
  { id: 'fuel', label: 'Gorivo', icon: '⛽' },
  { id: 'health', label: 'Zdravlje', icon: '💊' },
  { id: 'kids', label: 'Deca', icon: '👶' },
  { id: 'pets', label: 'Ljubimci', icon: '🐾' },
  { id: 'clothes', label: 'Odeća', icon: '👕' },
  { id: 'entertainment', label: 'Zabava', icon: '🎬' },
  { id: 'travel', label: 'Putovanja', icon: '✈️' },
  { id: 'other', label: 'Ostalo', icon: '📦' }
];

const ONBOARDING_KEY = 'onboardingComplete';
const SPLASH_KEY = 'splashSeen';
const NOTIFICATION_STATE_KEY = 'domacinko_notifications';

const MEAL_DAYS = [
  { id: 'mon', label: 'Pon', full: 'Ponedeljak' },
  { id: 'tue', label: 'Uto', full: 'Utorak' },
  { id: 'wed', label: 'Sre', full: 'Sreda' },
  { id: 'thu', label: 'Čet', full: 'Četvrtak' },
  { id: 'fri', label: 'Pet', full: 'Petak' },
  { id: 'sat', label: 'Sub', full: 'Subota' },
  { id: 'sun', label: 'Ned', full: 'Nedelja' }
];

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Doručak', short: 'Dor' },
  { id: 'lunch', label: 'Ručak', short: 'Ruč' },
  { id: 'dinner', label: 'Večera', short: 'Več' }
];

function emptyMealSlot() {
  return { type: 'empty', name: '', mealId: '', ingredients: [] };
}

function emptyMealDay() {
  return {
    breakfast: emptyMealSlot(),
    lunch: emptyMealSlot(),
    dinner: emptyMealSlot()
  };
}

function defaultMealPlan() {
  return {
    mon: emptyMealDay(),
    tue: emptyMealDay(),
    wed: emptyMealDay(),
    thu: emptyMealDay(),
    fri: emptyMealDay(),
    sat: emptyMealDay(),
    sun: emptyMealDay()
  };
}

function isMealSlotFilled(slot) {
  if (!slot || slot.type === 'empty') return false;
  if (slot.type === 'meal') return !!(slot.name || slot.mealId);
  if (slot.type === 'ingredients') {
    return !!(slot.name || (Array.isArray(slot.ingredients) && slot.ingredients.length));
  }
  return !!(slot.name || slot.mealId || (slot.ingredients && slot.ingredients.length));
}

function formatMealSlotLabel(slot) {
  if (!isMealSlotFilled(slot)) return '';
  if (slot.type === 'ingredients') {
    if (slot.name) return slot.name;
    const ings = slot.ingredients || [];
    if (!ings.length) return '';
    return ings.slice(0, 3).join(', ') + (ings.length > 3 ? '…' : '');
  }
  return slot.name || '';
}

function findMealPresetById(id) {
  if (!id || typeof SERBIAN_MEAL_PRESETS === 'undefined') return null;
  return SERBIAN_MEAL_PRESETS.find(m => m.id === id) || null;
}

function findMealPresetByName(name) {
  if (!name || typeof SERBIAN_MEAL_PRESETS === 'undefined') return null;
  const needle = name.trim().toLowerCase();
  return SERBIAN_MEAL_PRESETS.find(m => m.name.toLowerCase() === needle) || null;
}

function getMealPresetsForSlot(slotId) {
  if (typeof SERBIAN_MEAL_PRESETS === 'undefined') return [];
  if (!slotId) return [...SERBIAN_MEAL_PRESETS];
  return SERBIAN_MEAL_PRESETS.filter(m =>
    (m.tags || ['any']).includes(slotId) || (m.tags || []).includes('any')
  );
}

function migrateMealSlot(raw) {
  if (!raw) return emptyMealSlot();
  if (typeof raw === 'string') {
    const name = raw.trim();
    if (!name) return emptyMealSlot();
    const preset = findMealPresetByName(name);
    return {
      type: 'meal',
      name: preset?.name || name,
      mealId: preset?.id || '',
      ingredients: preset?.ingredients ? [...preset.ingredients] : []
    };
  }
  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients.map(i => String(i).trim()).filter(Boolean)
    : [];
  let type = raw.type;
  if (type !== 'meal' && type !== 'ingredients' && type !== 'empty') {
    type = raw.mealId || (raw.name && !ingredients.length) ? 'meal'
      : ingredients.length ? 'ingredients'
      : raw.name ? 'meal'
      : 'empty';
  }
  const slot = {
    type,
    name: (raw.name || '').trim(),
    mealId: raw.mealId || '',
    ingredients
  };
  if (slot.type === 'empty' || !isMealSlotFilled(slot)) return emptyMealSlot();
  return slot;
}

function migrateMealDay(raw) {
  if (!raw) return emptyMealDay();
  if (typeof raw === 'string') {
    const day = emptyMealDay();
    day.lunch = migrateMealSlot(raw);
    return day;
  }
  return {
    breakfast: migrateMealSlot(raw.breakfast),
    lunch: migrateMealSlot(raw.lunch),
    dinner: migrateMealSlot(raw.dinner)
  };
}

function migrateMealPlan(plan) {
  const next = defaultMealPlan();
  if (!plan || typeof plan !== 'object') return next;
  MEAL_DAYS.forEach(day => {
    next[day.id] = migrateMealDay(plan[day.id]);
  });
  return next;
}

function countFilledMealDays(plan) {
  const p = plan || getMealPlan();
  return MEAL_DAYS.filter(d => {
    const day = p[d.id];
    return day && MEAL_SLOTS.some(s => isMealSlotFilled(day[s.id]));
  }).length;
}

function countFilledMealSlots(plan) {
  const p = plan || getMealPlan();
  let n = 0;
  MEAL_DAYS.forEach(d => {
    const day = p[d.id];
    if (!day) return;
    MEAL_SLOTS.forEach(s => {
      if (isMealSlotFilled(day[s.id])) n++;
    });
  });
  return n;
}

function getTodayMealKey() {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
}

function getTodayMealDay() {
  return getMealPlan()[getTodayMealKey()] || emptyMealDay();
}

/** Sažetak današnjih obroka (ručak/večera prioritetno) za brifing i Savetnik */
function getTodayMealSummary() {
  const day = getTodayMealDay();
  const parts = [];
  MEAL_SLOTS.forEach(slot => {
    const label = formatMealSlotLabel(day[slot.id]);
    if (label) parts.push(`${slot.label}: ${label}`);
  });
  return parts.join(' · ');
}

const MEAL_INGREDIENT_MAP = {
  'piletina': ['piletina', 'so', 'biber', 'ulje'],
  'ćuretina': ['ćuretina', 'so', 'biber', 'ulje'],
  'gulaš': ['meso', 'luk', 'paprika', 'paradajz', 'brašno'],
  'pasulj': ['pasulj', 'luk', 'šargarepa', 'krompir', 'crvena paprika'],
  'riba': ['riba', 'limun', 'so', 'biber', 'ulje'],
  'palačinke': ['brašno', 'jaja', 'mleko', 'šećer', 'ulje'],
  'pasta': ['pasta', 'paradajz', 'luk', 'sir', 'ulje'],
  'šopska': ['paradajz', 'krastavac', 'sir', 'luk', 'masline'],
  'pizza': ['brašno', 'sir', 'paradajz', 'šunka', 'masline'],
  'supa': ['povrće', 'luk', 'šargarepa', 'krompir', 'so'],
  'musaka': ['krompir', 'meso', 'jaja', 'mleko', 'luk'],
  'sarma': ['kupus', 'meso', 'pirinač', 'luk', 'so'],
  'pljeskavica': ['mleveno meso', 'luk', 'so', 'biber'],
  'kuvano jaje': ['jaja', 'so'],
  'omlet': ['jaja', 'mleko', 'sir', 'so'],
  'salata': ['zelena salata', 'paradajz', 'krastavac', 'ulje'],
  'čorba': ['povrće', 'luk', 'šargarepa', 'so'],
  'kuvano meso': ['meso', 'luk', 'šargarepa', 'krompir', 'so']
};

const MEAL_SUGGESTIONS = [
  { name: 'Piletina sa povrćem', ingredients: ['piletina', 'paprika', 'luk', 'ulje'] },
  { name: 'Pasulj', ingredients: ['pasulj', 'luk', 'šargarepa', 'krompir'] },
  { name: 'Palačinke', ingredients: ['brašno', 'jaja', 'mleko', 'šećer'] },
  { name: 'Pasta sa sirom', ingredients: ['pasta', 'sir', 'ulje'] },
  { name: 'Omlet', ingredients: ['jaja', 'mleko', 'sir'] },
  { name: 'Šopska salata', ingredients: ['paradajz', 'krastavac', 'sir', 'luk'] },
  { name: 'Kuvano jaje', ingredients: ['jaja'] },
  { name: 'Gulaš', ingredients: ['meso', 'luk', 'paprika', 'paradajz'] }
];

const INVENTORY_LOCATIONS = ['Špajz', 'Podrum', 'Kuhinja', 'Dnevna soba', 'Spavaća soba', 'Garaža', 'Balkon', 'Ostalo'];

const PREDEFINED_MAINTENANCE = [
  { id: 'boiler', name: 'Servis bojlera', intervalMonths: 12, icon: '🔥', seasonal: false },
  { id: 'filter', name: 'Zamena filtera (voda/vazduh)', intervalMonths: 6, icon: '💧', seasonal: false },
  { id: 'ac', name: 'Čišćenje klime', intervalMonths: 12, icon: '❄️', seasonal: false },
  { id: 'car', name: 'Servis automobila', intervalMonths: 12, icon: '🚗', seasonal: false },
  { id: 'smoke', name: 'Baterije detektora dima', intervalMonths: 12, icon: '🚨', seasonal: false },
  { id: 'spring', name: 'Prolećno čišćenje', intervalMonths: 12, icon: '🌸', seasonal: true, season: 'spring' },
  { id: 'autumn', name: 'Jesenje pripreme (oluk, bašta)', intervalMonths: 12, icon: '🍂', seasonal: true, season: 'autumn' },
  { id: 'gutters', name: 'Čišćenje oluka', intervalMonths: 6, icon: '🏠', seasonal: true, season: 'autumn' },
  { id: 'heating', name: 'Provera grejanja', intervalMonths: 12, icon: '🌡️', seasonal: true, season: 'autumn' }
];

const REPAIR_CATEGORIES = [
  { id: 'elektrika', label: 'Elektrika', icon: '⚡' },
  { id: 'vodovod', label: 'Vodovod', icon: '🚿' },
  { id: 'gips', label: 'Gips', icon: '🧱' },
  { id: 'keramika', label: 'Keramika', icon: '🪨' },
  { id: 'moleraj', label: 'Moleraj', icon: '🎨' },
  { id: 'basta', label: 'Bašta', icon: '🌿' },
  { id: 'namestaj', label: 'Nameštaj', icon: '🪑' },
  { id: 'alati', label: 'Alati', icon: '🔧' }
];

const TEACHER_TOPICS = [
  { id: 'budgeting', title: 'Osnovi budžetiranja', icon: '💰', description: 'Kako pratiti troškove i štedeti' },
  { id: 'cooking', title: 'Planiranje obroka', icon: '🍳', description: 'Kako smanjiti otpad i uštedeti na hrani' },
  { id: 'repairs', title: 'Osnovne popravke', icon: '🔧', description: 'Alati i bezbednost kod DIY poslova' },
  { id: 'maintenance', title: 'Održavanje kuće', icon: '🏠', description: 'Redovni servisi i sezonski poslovi' },
  { id: 'energy', title: 'Ušteda energije', icon: '⚡', description: 'Smanjenje računa za struju i grejanje' },
  { id: 'shopping', title: 'Pametna kupovina', icon: '🛒', description: 'Lista, poređenje cena, sezonske akcije' }
];

const SYNC_DEBOUNCE_MS = 1500;
let _syncTimer = null;
let _skipCloudSync = false;

const DEFAULT_DATA = {
  settings: {
    userName: '',
    firstName: '',
    lastName: '',
    monthlyIncome: 0,
    currentSavings: 0,
    currency: 'RSD',
    monthlyBudget: 80000,
    savingsGoal: 0,
    savingsGoalName: '',
    categoryBudgets: {},
    darkTheme: false,
    largeText: false,
    highContrast: false,
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    notificationsEnabled: false,
    contactEmail: '',
    avatarUrl: '',
    betaMode: true,
    householdSize: 1,
    billParser: 'local'
  },
  expenses: [],
  recurringExpenses: [],
  shoppingList: [],
  favoriteProducts: [],
  mealPlan: defaultMealPlan(),
  feedback: [],
  utilityBills: {
    templates: [],
    entries: []
  },
  household: {
    familyMembers: [],
    cars: [],
    bills: [],
    pets: [],
    subscriptions: [],
    appliances: [],
    pantry: [],
    documents: [],
    warranties: [],
    importantDates: []
  },
  tasks: [],
  chatHistory: [],
  inventory: [],
  maintenance: [],
  repairHistory: [],
  craftsmanContacts: [],
  teacherProgress: { completed: [], notes: {} },
  houseProfile: {
    squareMeters: 0,
    heatingType: 'gas',
    homeType: 'apartment',
    appliances: []
  },
  homeMagazine: [],
  knowledgeBase: [],
  knowledgeFavorites: [],
  tools: [],
  diary: [],
  seasonalProgress: {},
  projects: [],
  safety: {
    fireExtinguisherExpiry: '',
    coDetectorExpiry: '',
    firstAidCheck: '',
    medicines: []
  },
  garden: { plants: [], notes: '' },
  watchList: []
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getData() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) {
      saveData(DEFAULT_DATA);
      return structuredClone(DEFAULT_DATA);
    }
    const parsed = JSON.parse(raw);
    const merged = { ...structuredClone(DEFAULT_DATA), ...parsed };
    merged.settings = { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) };
    if (!merged.recurringExpenses) merged.recurringExpenses = [];
    merged.mealPlan = migrateMealPlan(merged.mealPlan);
    if (!merged.feedback) merged.feedback = [];
    if (merged.household && !merged.household.pantry) merged.household.pantry = [];
    if (!merged.inventory) merged.inventory = [];
    if (!merged.maintenance) merged.maintenance = [];
    if (!merged.repairHistory) merged.repairHistory = [];
    if (!merged.teacherProgress) merged.teacherProgress = { completed: [], notes: {} };
    if (!merged.settings.categoryBudgets) merged.settings.categoryBudgets = {};
    if (!merged.houseProfile) merged.houseProfile = { ...DEFAULT_DATA.houseProfile };
    if (!merged.homeMagazine) merged.homeMagazine = [];
    if (!merged.knowledgeBase) merged.knowledgeBase = [];
    if (!merged.knowledgeFavorites) merged.knowledgeFavorites = [];
    if (!merged.tools) merged.tools = [];
    if (!merged.diary) merged.diary = [];
    if (!merged.seasonalProgress) merged.seasonalProgress = {};
    if (!merged.projects) merged.projects = [];
    if (!merged.safety) merged.safety = { ...DEFAULT_DATA.safety, medicines: [] };
    if (!merged.garden) merged.garden = { plants: [], notes: '' };
    if (!merged.watchList) merged.watchList = [];
    if (!merged.utilityBills || typeof merged.utilityBills !== 'object') {
      merged.utilityBills = { templates: [], entries: [] };
    }
    if (!Array.isArray(merged.utilityBills.templates)) merged.utilityBills.templates = [];
    if (!Array.isArray(merged.utilityBills.entries)) merged.utilityBills.entries = [];
    if (!merged.settings.billParser) merged.settings.billParser = 'local';
    return merged;
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data, options = {}) {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
  if (!options.skipSync && !_skipCloudSync) {
    scheduleCloudSync();
  }
}

function scheduleCloudSync() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return;
  if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const data = getData();
    pushUserDataToCloud(data).catch(() => {});
    if (typeof isInHousehold === 'function' && isInHousehold()) {
      if (typeof pushHouseholdDataToCloud === 'function') {
        pushHouseholdDataToCloud(data).catch(() => {});
      } else if (typeof scheduleHouseholdSync === 'function') {
        scheduleHouseholdSync();
      }
    }
  }, SYNC_DEBOUNCE_MS);
}

async function pushUserDataToCloud(data) {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return;
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!client || !user) return;

  const { error } = await client
    .from('user_data')
    .upsert({
      user_id: user.id,
      data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
}

async function pullUserDataFromCloud() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return null;
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!client || !user) return null;

  const { data: row, error } = await client
    .from('user_data')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !row?.data) return null;

  _skipCloudSync = true;
  const merged = { ...structuredClone(DEFAULT_DATA), ...row.data };
  merged.settings = { ...DEFAULT_DATA.settings, ...(row.data.settings || {}) };
  localStorage.setItem(getStorageKey(), JSON.stringify(merged));
  _skipCloudSync = false;
  return merged;
}

function getSettings() {
  return getData().settings;
}

function isBetaMode() {
  const settings = getSettings();
  return settings.betaMode !== false;
}

function saveSettings(settings, options = {}) {
  const data = getData();
  data.settings = { ...data.settings, ...settings };
  if (settings.firstName !== undefined || settings.lastName !== undefined) {
    const first = settings.firstName ?? data.settings.firstName ?? '';
    const last = settings.lastName ?? data.settings.lastName ?? '';
    data.settings.userName = [first, last].filter(Boolean).join(' ').trim();
  }
  saveData(data, options);

  if (!options.skipProfileSync && typeof isLoggedIn === 'function' && isLoggedIn()) {
    syncSettingsToProfile(data.settings);
  }
}

async function syncSettingsToProfile(settings) {
  if (typeof saveProfile !== 'function') return;
  try {
    await saveProfile({
      first_name: settings.firstName || settings.userName?.split(' ')[0] || '',
      last_name: settings.lastName || settings.userName?.split(' ').slice(1).join(' ') || '',
      monthly_income: settings.monthlyIncome || 0,
      current_savings: settings.currentSavings || 0,
      monthly_budget: settings.monthlyBudget || 80000,
      savings_goal: settings.savingsGoal || 0,
      savings_goal_name: settings.savingsGoalName || '',
      currency: settings.currency || 'RSD'
    });
  } catch (e) {
    console.warn('Sinhronizacija profila:', e.message);
  }
}

function getExpenses() {
  return getData().expenses;
}

function addExpense(expense) {
  const data = getData();
  const newExpense = {
    id: generateId(),
    name: expense.name,
    amount: parseFloat(expense.amount),
    category: expense.category,
    date: expense.date || new Date().toISOString().split('T')[0],
    note: expense.note || ''
  };
  data.expenses.unshift(newExpense);
  saveData(data);
  return newExpense;
}

function deleteExpense(id) {
  const data = getData();
  data.expenses = data.expenses.filter(e => e.id !== id);
  saveData(data);
}

function updateExpense(id, updates) {
  const data = getData();
  const expense = data.expenses.find(e => e.id === id);
  if (!expense) return null;
  Object.assign(expense, {
    name: updates.name ?? expense.name,
    amount: updates.amount !== undefined ? parseFloat(updates.amount) : expense.amount,
    category: updates.category ?? expense.category,
    date: updates.date ?? expense.date,
    note: updates.note ?? expense.note
  });
  saveData(data);
  return expense;
}

function filterExpenses({ category, dateFrom, dateTo } = {}) {
  let expenses = getExpenses();
  if (category) {
    expenses = expenses.filter(e => e.category === category);
  }
  if (dateFrom) {
    expenses = expenses.filter(e => e.date >= dateFrom);
  }
  if (dateTo) {
    expenses = expenses.filter(e => e.date <= dateTo);
  }
  return expenses.sort((a, b) => b.date.localeCompare(a.date));
}

function getMonthComparison() {
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const prev = getPreviousMonthSpent();
  if (prev <= 0) return null;
  const diff = spent - prev;
  const pct = Math.round(Math.abs(diff / prev) * 100);
  return {
    spent,
    prev,
    pct,
    less: diff < 0,
    text: diff < 0
      ? `${pct}% manje nego prošlog meseca`
      : diff > 0
        ? `${pct}% više nego prošlog meseca`
        : 'Isto kao prošlog meseca'
  };
}

function getSavingsProgress() {
  const settings = getSettings();
  const goal = settings.savingsGoal || 0;
  const goalName = (settings.savingsGoalName || '').trim();
  if (goal <= 0 || !goalName) return { goal: 0, saved: 0, pct: 0, goalName: '' };

  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const saved = Math.max(0, budget - spent);
  const pct = Math.min(100, Math.round((saved / goal) * 100));

  const remaining = Math.max(0, goal - saved);
  return {
    goal,
    saved,
    pct,
    remaining,
    goalName
  };
}

function getRecurringExpenses() {
  return getData().recurringExpenses || [];
}

function addRecurringExpense(expense) {
  const data = getData();
  if (!data.recurringExpenses) data.recurringExpenses = [];
  const item = {
    id: generateId(),
    name: expense.name,
    amount: parseFloat(expense.amount),
    category: expense.category,
    dayOfMonth: parseInt(expense.dayOfMonth, 10) || 1,
    note: expense.note || ''
  };
  data.recurringExpenses.push(item);
  saveData(data);
  return item;
}

function deleteRecurringExpense(id) {
  const data = getData();
  data.recurringExpenses = (data.recurringExpenses || []).filter(e => e.id !== id);
  saveData(data);
}

function getRecurringReminders() {
  const recurring = getRecurringExpenses();
  if (!recurring.length) return [];

  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthExpenses = getMonthlyExpenses(year, month);

  return recurring.filter(r => {
    if (day < r.dayOfMonth) return false;
    const alreadyPaid = monthExpenses.some(e =>
      e.name.toLowerCase() === r.name.toLowerCase() && e.amount === r.amount
    );
    return !alreadyPaid;
  });
}

function getMonthlyExpenses(year, month) {
  const expenses = getExpenses();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function getTotalSpent(year, month) {
  return getMonthlyExpenses(year, month).reduce((sum, e) => sum + e.amount, 0);
}

function getPreviousMonthSpent() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return getTotalSpent(prev.getFullYear(), prev.getMonth());
}

function getSpendingByCategory(year, month) {
  const expenses = getMonthlyExpenses(year, month);
  const byCategory = {};
  CATEGORIES.forEach(c => { byCategory[c.id] = 0; });
  expenses.forEach(e => {
    if (byCategory[e.category] !== undefined) {
      byCategory[e.category] += e.amount;
    } else {
      byCategory.other = (byCategory.other || 0) + e.amount;
    }
  });
  return byCategory;
}

function getFinancialHealthScore() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 80000;
  const prevSpent = getPreviousMonthSpent();

  if (budget <= 0) return 50;

  const remainingPct = Math.max(0, (budget - spent) / budget);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const expectedSpentPct = dayOfMonth / daysInMonth;
  const actualSpentPct = spent / budget;

  let score = 50;

  score += remainingPct * 40;

  if (actualSpentPct <= expectedSpentPct) {
    score += 20;
  } else if (actualSpentPct <= expectedSpentPct * 1.2) {
    score += 10;
  }

  if (prevSpent > 0) {
    if (spent < prevSpent) score += 10;
    else if (spent > prevSpent * 1.2) score -= 10;
  }

  const categoryStatus = getCategoryBudgetStatus();
  const exceeded = categoryStatus.filter(c => c.pct >= 100).length;
  const warned = categoryStatus.filter(c => c.pct >= 80 && c.pct < 100).length;
  score -= exceeded * 8;
  score -= warned * 3;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function getCategoryBudgets() {
  return getSettings().categoryBudgets || {};
}

function saveCategoryBudgets(budgets) {
  saveSettings({ categoryBudgets: budgets });
}

function getCategoryBudgetStatus() {
  const settings = getSettings();
  const budgets = settings.categoryBudgets || {};
  const now = new Date();
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());

  return CATEGORIES.map(cat => {
    const budget = budgets[cat.id] || 0;
    const spent = byCategory[cat.id] || 0;
    const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    let warning = null;
    if (budget > 0) {
      if (pct >= 100) warning = 'exceeded';
      else if (pct >= 80) warning = 'near';
    }
    return { id: cat.id, label: cat.label, icon: cat.icon, budget, spent, pct, warning };
  }).filter(c => c.budget > 0 || c.spent > 0);
}

function getCategoryBudgetWarnings() {
  return getCategoryBudgetStatus().filter(c => c.warning);
}

function getShoppingList() {
  return getData().shoppingList;
}

function addShoppingItem(name, category = 'other') {
  const data = getData();
  const item = { id: generateId(), name, bought: false, category };
  data.shoppingList.push(item);
  saveData(data);
  return item;
}

function toggleShoppingItem(id) {
  const data = getData();
  const item = data.shoppingList.find(i => i.id === id);
  if (item) item.bought = !item.bought;
  saveData(data);
}

function deleteShoppingItem(id) {
  const data = getData();
  data.shoppingList = data.shoppingList.filter(i => i.id !== id);
  saveData(data);
}

function clearShoppingList() {
  const data = getData();
  data.shoppingList = [];
  saveData(data);
}

function getHousehold() {
  return getData().household;
}

function addHouseholdItem(section, item) {
  const data = getData();
  if (!data.household[section]) data.household[section] = [];
  const newItem = { id: generateId(), ...item };
  data.household[section].push(newItem);
  saveData(data);
  return newItem;
}

function deleteHouseholdItem(section, id) {
  const data = getData();
  if (data.household[section]) {
    data.household[section] = data.household[section].filter(i => i.id !== id);
    saveData(data);
  }
}

function getTasks() {
  return getData().tasks;
}

function toggleTask(id) {
  const data = getData();
  const task = data.tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  saveData(data);
}

function getChatHistory() {
  return getData().chatHistory;
}

function addChatMessage(role, text, meta) {
  const data = getData();
  const msg = { id: generateId(), role, text, time: new Date().toISOString() };
  if (meta?.actions) msg.actions = meta.actions;
  data.chatHistory.push(msg);
  if (data.chatHistory.length > 50) {
    data.chatHistory = data.chatHistory.slice(-50);
  }
  saveData(data);
}

function clearChatHistory() {
  const data = getData();
  data.chatHistory = [];
  saveData(data);
}

function resetAllData() {
  localStorage.removeItem(getStorageKey());
  localStorage.removeItem(NOTIFICATION_STATE_KEY);
  saveData(DEFAULT_DATA);
}

function isOnboardingComplete() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

function setOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}

function isSplashSeen() {
  return localStorage.getItem(SPLASH_KEY) === 'true';
}

function setSplashSeen() {
  localStorage.setItem(SPLASH_KEY, 'true');
}

function exportAllData() {
  return JSON.stringify({
    version: '7.6.2',
    app: 'Domaćinko',
    exportedAt: new Date().toISOString(),
    profileId: getActiveProfileId(),
    profileName: getActiveProfileName(),
    onboardingComplete: isOnboardingComplete(),
    splashSeen: isSplashSeen(),
    profiles: getProfilesMeta(),
    data: getData()
  }, null, 2);
}

function importAllData(jsonString, options = {}) {
  const parsed = JSON.parse(jsonString);
  const payload = parsed.data || parsed;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Neispravan format podataka.');
  }
  if (parsed.profiles?.length && options.mergeProfiles !== false) {
    saveProfilesMeta(parsed.profiles);
  }
  saveData({ ...structuredClone(DEFAULT_DATA), ...payload });
  if (parsed.onboardingComplete) setOnboardingComplete();
  if (parsed.splashSeen) setSplashSeen();
  if (parsed.profileId && listLocalProfiles().some(p => p.id === parsed.profileId)) {
    switchLocalProfile(parsed.profileId);
  }
  return { version: parsed.version || 'unknown', profileName: parsed.profileName || getActiveProfileName() };
}

function addFeedback(text) {
  const data = getData();
  if (!data.feedback) data.feedback = [];
  data.feedback.push({
    id: generateId(),
    text,
    date: new Date().toISOString()
  });
  saveData(data);
}

function getMealPlan() {
  return migrateMealPlan(getData().mealPlan);
}

function saveMealPlan(mealPlan) {
  const data = getData();
  data.mealPlan = migrateMealPlan({ ...data.mealPlan, ...mealPlan });
  saveData(data);
}

function setMealForDay(dayId, mealOrDay) {
  const data = getData();
  if (!data.mealPlan) data.mealPlan = defaultMealPlan();
  data.mealPlan = migrateMealPlan(data.mealPlan);
  if (typeof mealOrDay === 'string') {
    data.mealPlan[dayId] = migrateMealDay(mealOrDay);
  } else {
    data.mealPlan[dayId] = migrateMealDay(mealOrDay || emptyMealDay());
  }
  saveData(data);
}

function getMealSlot(dayId, slotId) {
  const day = getMealPlan()[dayId] || emptyMealDay();
  return migrateMealSlot(day[slotId]);
}

function setMealSlot(dayId, slotId, slotData) {
  const data = getData();
  data.mealPlan = migrateMealPlan(data.mealPlan);
  if (!data.mealPlan[dayId]) data.mealPlan[dayId] = emptyMealDay();
  data.mealPlan[dayId][slotId] = migrateMealSlot(slotData);
  saveData(data);
}

function clearMealSlot(dayId, slotId) {
  setMealSlot(dayId, slotId, emptyMealSlot());
}

function clearMealDay(dayId) {
  setMealForDay(dayId, emptyMealDay());
}

function swapMealDays(fromDay, toDay) {
  if (!fromDay || !toDay || fromDay === toDay) return;
  const data = getData();
  data.mealPlan = migrateMealPlan(data.mealPlan);
  const tmp = data.mealPlan[fromDay];
  data.mealPlan[fromDay] = data.mealPlan[toDay];
  data.mealPlan[toDay] = tmp;
  saveData(data);
}

function collectSlotIngredients(slot) {
  if (!isMealSlotFilled(slot)) return [];
  if (Array.isArray(slot.ingredients) && slot.ingredients.length) {
    return slot.ingredients.map(i => String(i).trim()).filter(Boolean);
  }
  if (slot.mealId) {
    const preset = findMealPresetById(slot.mealId);
    if (preset?.ingredients?.length) return [...preset.ingredients];
  }
  const name = (slot.name || '').trim().toLowerCase();
  if (!name) return [];
  const preset = findMealPresetByName(name);
  if (preset?.ingredients?.length) return [...preset.ingredients];
  const found = [];
  for (const [key, items] of Object.entries(MEAL_INGREDIENT_MAP)) {
    if (name.includes(key)) items.forEach(i => found.push(i));
  }
  if (found.length) return found;
  return name.split(/[,+\-/&]| i /).map(p => p.trim()).filter(p => p.length > 2);
}

function extractIngredientsFromMeals() {
  const plan = getMealPlan();
  const ingredients = new Set();
  MEAL_DAYS.forEach(day => {
    const d = plan[day.id];
    if (!d) return;
    MEAL_SLOTS.forEach(slot => {
      collectSlotIngredients(d[slot.id]).forEach(i => ingredients.add(i));
    });
  });
  return [...ingredients];
}

function addIngredientsToShoppingList(ingredients) {
  const list = (ingredients || []).map(i => String(i).trim()).filter(Boolean);
  const existing = getShoppingList().map(i => i.name.toLowerCase());
  let added = 0;
  list.forEach(ing => {
    if (!existing.includes(ing.toLowerCase())) {
      addShoppingItem(ing.charAt(0).toUpperCase() + ing.slice(1));
      existing.push(ing.toLowerCase());
      added++;
    }
  });
  return { added, total: list.length };
}

function generateShoppingFromMealPlan() {
  const ingredients = extractIngredientsFromMeals();
  return addIngredientsToShoppingList(ingredients);
}

function addMealSlotIngredientsToShopping(dayId, slotId) {
  const slot = getMealSlot(dayId, slotId);
  return addIngredientsToShoppingList(collectSlotIngredients(slot));
}

function getPantryItems() {
  const household = getHousehold();
  return household.pantry || [];
}

function suggestMealsFromPantry() {
  const pantry = getPantryItems().map(p => (p.name || '').toLowerCase());
  if (!pantry.length) return null;

  const matches = MEAL_SUGGESTIONS.filter(meal =>
    meal.ingredients.some(ing => pantry.some(p => p.includes(ing) || ing.includes(p)))
  );

  if (!matches.length) {
    return { pantry, suggestions: [], message: 'Imate namirnice u ostavi, ali nismo pronašli gotove recepte. Probajte da planirate obrok ručno!' };
  }

  return { pantry, suggestions: matches.map(m => m.name), message: null };
}

function getBudgetUsagePct() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  if (budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

function getNotificationState() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotificationState(state) {
  localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
}

function getCategoryLabel(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.label : 'Ostalo';
}

function getCategoryIcon(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.icon : '📦';
}

function formatCurrency(amount) {
  const settings = getSettings();
  const formatted = new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `${formatted} ${settings.currency}`;
}

function getHealthTitle(score) {
  if (score >= 86) return '🏆 Domaćin godine';
  if (score >= 71) return 'Odličan domaćin';
  if (score >= 41) return 'Dobar domaćin';
  return 'Početnik';
}

function getHealthStatusLabel(score) {
  if (score >= 71) return 'Odlično';
  if (score >= 41) return 'Dobro';
  return 'Pažnja';
}

function getFinancialHealthFeedback() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const remaining = budget - spent;
  const prevSpent = getPreviousMonthSpent();
  const bullets = [];

  if (prevSpent > 0) {
    if (spent < prevSpent) {
      const pct = Math.round((1 - spent / prevSpent) * 100);
      if (pct > 0) bullets.push({ type: 'good', text: `Trošiš ${pct}% manje nego prošlog meseca.` });
    } else if (spent > prevSpent * 1.05) {
      const pct = Math.round((spent / prevSpent - 1) * 100);
      bullets.push({ type: 'warn', text: `Potrošio si ${pct}% više nego prošlog meseca.` });
    }
  }

  if (budget > 0) {
    if (remaining >= 0 && spent > 0) {
      bullets.push({ type: 'good', text: 'Ostao si u okviru budžeta.' });
    } else if (remaining < 0) {
      bullets.push({ type: 'warn', text: `Prešao si budžet za ${formatCurrency(Math.abs(remaining))}.` });
    }
  }

  const recurring = getRecurringExpenses();
  const reminders = getRecurringReminders();
  if (recurring.length > 0) {
    if (reminders.length === 0) {
      bullets.push({ type: 'good', text: 'Nijedan račun nije zakasnio.' });
    } else {
      bullets.push({ type: 'warn', text: `${reminders.length} račun(a) čeka plaćanje ovog meseca.` });
    }
  }

  getCategoryBudgetWarnings().forEach(w => {
    if (w.warning === 'exceeded') {
      bullets.push({ type: 'warn', text: `Prekoračen budžet za ${w.label.toLowerCase()} — ${formatCurrency(w.spent)}.` });
    } else if (w.warning === 'near') {
      bullets.push({ type: 'warn', text: `${w.label}: potrošeno ${w.pct}% budžeta.` });
    }
  });

  const savings = getSavingsProgress();
  if (savings.goal > 0) {
    if (savings.pct >= 75) {
      bullets.push({ type: 'good', text: `Cilj štednje „${savings.goalName}” — ${savings.pct}% ostvareno.` });
    } else if (savings.pct < 25 && savings.saved > 0) {
      bullets.push({ type: 'warn', text: `Još ${formatCurrency(savings.remaining)} do cilja „${savings.goalName}”.` });
    }
  }

  const byCat = getSpendingByCategory(now.getFullYear(), now.getMonth());
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevByCat = getSpendingByCategory(prevMonth.getFullYear(), prevMonth.getMonth());
  Object.entries(byCat).forEach(([catId, amount]) => {
    if (amount <= 0) return;
    const prevAmount = prevByCat[catId] || 0;
    if (prevAmount > 0 && amount > prevAmount * 1.15) {
      const pct = Math.round((amount / prevAmount - 1) * 100);
      bullets.push({ type: 'warn', text: `${getCategoryLabel(catId)} je skuplje za ${pct}% nego prošlog meseca.` });
    }
  });

  if (bullets.length === 0 && spent === 0) {
    bullets.push({ type: 'tip', text: 'Dodaj prvi trošak da mogu da analiziram tvoju potrošnju.' });
  }

  return bullets.slice(0, 6);
}

function getDomacinkoAdvice() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const remaining = budget - spent;
  const usagePct = getBudgetUsagePct();

  if (spent === 0) {
    return 'Dodaj prvi trošak da mogu da analiziram tvoju potrošnju.';
  }

  if (usagePct >= 78 && remaining > 0) {
    return `Potrošio si ${usagePct}% budžeta — pažljivo do kraja meseca.`;
  }

  if (remaining < 0) {
    return `Pažnja! Prešao si budžet za ${formatCurrency(Math.abs(remaining))}.`;
  }

  if (remaining >= 0 && usagePct < 70) {
    return `Dobro ideš. Ostalo ti je još ${formatCurrency(remaining)} do kraja budžeta.`;
  }

  return getDailyAdvice();
}

function getDailyAdvice() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const prevSpent = getPreviousMonthSpent();
  const shopping = getShoppingList().filter(i => !i.bought);
  const household = getHousehold();
  const subs = household.subscriptions?.length || 0;

  if (prevSpent > 0 && spent < prevSpent) {
    const pct = Math.round((1 - spent / prevSpent) * 100);
    if (pct > 0) return `Bravo! Potrošili ste ${pct}% manje nego prošlog meseca.`;
  }

  if (shopping.length > 0) {
    return `Imate ${shopping.length} stavke na listi za kupovinu.`;
  }

  if (remaining < budget * 0.15 && remaining > 0) {
    return 'Blizu ste mesečnog limita budžeta.';
  }

  if (remaining <= 0) {
    return 'Prekoračili ste mesečni budžet. Razmislite o uštedama.';
  }

  if (subs > 0) {
    return `Imate ${subs} pretplate u domaćinstvu.`;
  }

  const maintenanceDue = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  if (maintenanceDue.length > 0) {
    return `Imate ${maintenanceDue.length} zadatak(a) održavanja na redu — proverite!`;
  }

  const expiring = typeof getExpiringWarranties === 'function' ? getExpiringWarranties(30) : [];
  if (expiring.length > 0) {
    return `Garancija ističe za ${expiring.length} predmet(a) u inventaru.`;
  }

  const budgetWarnings = getCategoryBudgetWarnings();
  if (budgetWarnings.length > 0) {
    const w = budgetWarnings[0];
    return `Kategorija ${w.label} je na ${w.pct}% budžeta — pazite na troškove.`;
  }

  const tips = [
    'Planirajte obroke unapred — uštedite do 20% na hrani.',
    'Pregledajte pretplate — možda neke više ne koristite.',
    'Male uštede svakog dana vode do velikih ciljeva.',
    'Domaćinko je tu da vam pomogne — pitajte me bilo šta!'
  ];
  const dayIndex = now.getDate() % tips.length;
  return tips[dayIndex];
}

function getInventory() {
  return getData().inventory || [];
}

function addInventoryItem(item) {
  const data = getData();
  const newItem = {
    id: generateId(),
    name: item.name,
    location: item.location || '',
    purchaseDate: item.purchaseDate || '',
    warrantyEnd: item.warrantyEnd || '',
    receiptPhoto: item.receiptPhoto || '',
    note: item.note || ''
  };
  data.inventory.unshift(newItem);
  saveData(data);
  return newItem;
}

function updateInventoryItem(id, updates) {
  const data = getData();
  const item = data.inventory.find(i => i.id === id);
  if (!item) return null;
  Object.assign(item, updates);
  saveData(data);
  return item;
}

function deleteInventoryItem(id) {
  const data = getData();
  data.inventory = data.inventory.filter(i => i.id !== id);
  saveData(data);
}

function getExpiringWarranties(withinDays = 30) {
  const now = new Date();
  const limit = new Date(now);
  limit.setDate(limit.getDate() + withinDays);

  return getInventory().filter(item => {
    if (!item.warrantyEnd) return false;
    const end = new Date(item.warrantyEnd);
    return end >= now && end <= limit;
  }).sort((a, b) => a.warrantyEnd.localeCompare(b.warrantyEnd));
}

function getExpiredWarranties() {
  const now = new Date().toISOString().split('T')[0];
  return getInventory().filter(item => item.warrantyEnd && item.warrantyEnd < now);
}

function ensureMaintenanceInitialized() {
  const data = getData();
  if (!data.maintenance) data.maintenance = [];
}

function seedPredefinedMaintenance() {
  const data = getData();
  if (!data.maintenance) data.maintenance = [];
  if (data.maintenance.length > 0) return false;

  data.maintenance = PREDEFINED_MAINTENANCE.map(p => ({
    id: p.id,
    name: p.name,
    intervalMonths: p.intervalMonths,
    icon: p.icon,
    seasonal: p.seasonal || false,
    season: p.season || null,
    lastDone: null,
    enabled: true,
    custom: false
  }));
  saveData(data);
  return true;
}

function getMaintenanceTasks() {
  ensureMaintenanceInitialized();
  return getData().maintenance.filter(t => t.enabled);
}

function getAllMaintenanceTasks() {
  ensureMaintenanceInitialized();
  return getData().maintenance;
}

function addMaintenanceTask(task) {
  const data = getData();
  ensureMaintenanceInitialized();
  const item = {
    id: generateId(),
    name: task.name,
    intervalMonths: parseInt(task.intervalMonths, 10) || 6,
    icon: task.icon || '📋',
    lastDone: task.lastDone || null,
    enabled: true,
    custom: true,
    seasonal: false
  };
  data.maintenance.push(item);
  saveData(data);
  return item;
}

function updateMaintenanceTask(id, updates) {
  const data = getData();
  const task = data.maintenance.find(t => t.id === id);
  if (!task) return null;
  Object.assign(task, updates);
  saveData(data);
  return task;
}

function deleteMaintenanceTask(id) {
  const data = getData();
  const task = data.maintenance.find(t => t.id === id);
  if (!task || !task.custom) return false;
  data.maintenance = data.maintenance.filter(t => t.id !== id);
  saveData(data);
  return true;
}

function markMaintenanceDone(id, date) {
  return updateMaintenanceTask(id, {
    lastDone: date || new Date().toISOString().split('T')[0]
  });
}

function getNextDueDate(task) {
  if (!task.lastDone) return new Date();

  const last = new Date(task.lastDone);
  const next = new Date(last);
  next.setMonth(next.getMonth() + (task.intervalMonths || 12));
  return next;
}

function getDueMaintenance() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return getMaintenanceTasks()
    .filter(task => task.lastDone || task.custom)
    .map(task => {
      const nextDue = getNextDueDate(task);
      nextDue.setHours(0, 0, 0, 0);
      const overdue = nextDue <= today;
      const daysUntil = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
      return { ...task, nextDue: nextDue.toISOString().split('T')[0], overdue, daysUntil };
    })
    .filter(t => t.overdue || t.daysUntil <= 14)
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
}

function getRepairHistory() {
  return getData().repairHistory || [];
}

function addRepairRecord(record) {
  const data = getData();
  const item = {
    id: generateId(),
    category: record.category,
    problem: record.problem,
    advice: record.advice,
    difficulty: record.difficulty,
    tools: record.tools || [],
    diyVsPro: record.diyVsPro || '',
    costEstimate: record.costEstimate || '',
    steps: record.steps || [],
    date: new Date().toISOString()
  };
  data.repairHistory.unshift(item);
  if (data.repairHistory.length > 50) {
    data.repairHistory = data.repairHistory.slice(0, 50);
  }
  saveData(data);
  return item;
}

function deleteRepairRecord(id) {
  const data = getData();
  data.repairHistory = data.repairHistory.filter(r => r.id !== id);
  saveData(data);
}

function getTeacherProgress() {
  return getData().teacherProgress || { completed: [], notes: {} };
}

function markTopicComplete(topicId) {
  const data = getData();
  if (!data.teacherProgress) data.teacherProgress = { completed: [], notes: {} };
  if (!data.teacherProgress.completed.includes(topicId)) {
    data.teacherProgress.completed.push(topicId);
    saveData(data);
  }
}

function isTopicComplete(topicId) {
  return getTeacherProgress().completed.includes(topicId);
}

const MAGAZINE_CATEGORIES = [
  { id: 'bulbs', label: 'Sijalice', icon: '💡', unit: 'kom' },
  { id: 'paint', label: 'Boja', icon: '🎨', unit: 'l' },
  { id: 'screws', label: 'Šrafovi', icon: '🔩', unit: 'kom' },
  { id: 'cords', label: 'Produžni kablovi', icon: '🔌', unit: 'kom' },
  { id: 'filters', label: 'Filteri', icon: '🧽', unit: 'kom' },
  { id: 'other', label: 'Ostalo', icon: '📦', unit: 'kom' }
];

const SEASONAL_TASKS = {
  1: [
    { id: 'jan-heating', text: 'Provera grejanja i termostata' },
    { id: 'jan-pipes', text: 'Zaštita cevi od smrzavanja' },
    { id: 'jan-windows', text: 'Provera brtvi na prozorima' },
    { id: 'jan-budget', text: 'Pregled budžeta za novu godinu' }
  ],
  2: [
    { id: 'feb-filters', text: 'Zamena filtera vazduha' },
    { id: 'feb-boiler', text: 'Provera bojlera i pritiska' },
    { id: 'feb-pantry', text: 'Inventar špajza i zamrzivača' }
  ],
  3: [
    { id: 'mar-garden', text: 'Priprema bašte za proleće' },
    { id: 'mar-clean', text: 'Prolećno čišćenje' },
    { id: 'mar-ac', text: 'Test klime pre sezone' },
    { id: 'mar-gutters', text: 'Provera oluka posle zime' }
  ],
  4: [
    { id: 'apr-ac', text: 'Provera klime pre leta' },
    { id: 'apr-garden', text: 'Sadnja ranog povrća' },
    { id: 'apr-facade', text: 'Pregled fasade i terase' }
  ],
  5: [
    { id: 'may-garden', text: 'Sadnja i đubrenje' },
    { id: 'may-windows', text: 'Pranje prozora i roletni' },
    { id: 'may-grill', text: 'Priprema roštilja i dvorišta' }
  ],
  6: [
    { id: 'jun-ac', text: 'Servis klime' },
    { id: 'jun-garden', text: 'Redovno zalivanje i košenje' },
    { id: 'jun-car', text: 'Provera klima u autu' }
  ],
  7: [
    { id: 'jul-ac', text: 'Čišćenje filtera klime' },
    { id: 'jul-garden', text: 'Zalivanje ujutru/uveče' },
    { id: 'jul-vacation', text: 'Priprema kuće pre odmora' }
  ],
  8: [
    { id: 'aug-garden', text: 'Berba i zalivanje' },
    { id: 'aug-preserves', text: 'Priprema zimnice (pečenje, ajvar)' },
    { id: 'aug-roof', text: 'Pregled krova posle grmljavine' }
  ],
  9: [
    { id: 'sep-gutters', text: 'Čišćenje oluka' },
    { id: 'sep-heating', text: 'Test grejanja pre hladnih dana' },
    { id: 'sep-garden', text: 'Jesenja sadnja i đubrenje' }
  ],
  10: [
    { id: 'oct-heating', text: 'Priprema grejanja' },
    { id: 'oct-chimney', text: 'Čišćenje dimnjaka/kamine' },
    { id: 'oct-car', text: 'Zamena guma na auto' }
  ],
  11: [
    { id: 'nov-heating', text: 'Paljenje grejanja' },
    { id: 'nov-brooms', text: 'Metlice i lopate spremne' },
    { id: 'nov-pipes', text: 'Izolacija cevi na otvorenom' }
  ],
  12: [
    { id: 'dec-safety', text: 'Provera detektora dima i CO' },
    { id: 'dec-fire', text: 'Provera aparata za gašenje' },
    { id: 'dec-lights', text: 'Provera novogodišnjih instalacija' },
    { id: 'dec-budget', text: 'Godišnji pregled troškova' }
  ]
};

const TOOL_CATEGORIES = ['Ručni alat', 'Električni alat', 'Merenje', 'Vodoinstalaterski', 'Električarski', 'Baštenski', 'Ostalo'];

function getHouseProfile() {
  return getData().houseProfile || { ...DEFAULT_DATA.houseProfile };
}

function saveHouseProfile(profile) {
  const data = getData();
  data.houseProfile = { ...data.houseProfile, ...profile };
  saveData(data);
  return data.houseProfile;
}

function addHouseAppliance(appliance) {
  const data = getData();
  const item = { id: generateId(), name: appliance.name, purchaseDate: appliance.purchaseDate || '', type: appliance.type || '' };
  data.houseProfile.appliances = data.houseProfile.appliances || [];
  data.houseProfile.appliances.push(item);
  saveData(data);
  return item;
}

function deleteHouseAppliance(id) {
  const data = getData();
  data.houseProfile.appliances = (data.houseProfile.appliances || []).filter(a => a.id !== id);
  saveData(data);
}

function getHomeMagazine() {
  return getData().homeMagazine || [];
}

function addMagazineItem(item) {
  const data = getData();
  const newItem = {
    id: generateId(),
    name: item.name,
    category: item.category || 'other',
    quantity: parseFloat(item.quantity) || 1,
    unit: item.unit || 'kom',
    location: item.location || '',
    note: item.note || ''
  };
  data.homeMagazine.unshift(newItem);
  saveData(data);
  return newItem;
}

function updateMagazineItem(id, updates) {
  const data = getData();
  const item = data.homeMagazine.find(i => i.id === id);
  if (!item) return null;
  Object.assign(item, updates);
  saveData(data);
  return item;
}

function deleteMagazineItem(id) {
  const data = getData();
  data.homeMagazine = data.homeMagazine.filter(i => i.id !== id);
  saveData(data);
}

function searchMagazine(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return getHomeMagazine();
  return getHomeMagazine().filter(i =>
    i.name.toLowerCase().includes(q) ||
    (MAGAZINE_CATEGORIES.find(c => c.id === i.category)?.label || '').toLowerCase().includes(q) ||
    (i.location || '').toLowerCase().includes(q)
  );
}

function getLowStockMagazine(threshold = 2) {
  return getHomeMagazine().filter(i =>
    i.name && parseFloat(i.quantity) <= threshold
  );
}

function filterMagazineByCategory(categoryId) {
  if (!categoryId) return getHomeMagazine();
  return getHomeMagazine().filter(i => i.category === categoryId);
}

function getKnowledgeBase() {
  return getData().knowledgeBase || [];
}

function addKnowledgeEntry(entry) {
  const data = getData();
  const item = {
    id: generateId(),
    title: entry.title,
    solution: entry.solution,
    category: entry.category || 'ostalo',
    tags: entry.tags || [],
    date: new Date().toISOString()
  };
  data.knowledgeBase.unshift(item);
  saveData(data);
  return item;
}

function deleteKnowledgeEntry(id) {
  const data = getData();
  data.knowledgeBase = data.knowledgeBase.filter(k => k.id !== id);
  saveData(data);
}

function searchKnowledge(query, options = {}) {
  let items = getKnowledgeBase();
  if (options.category) {
    items = items.filter(k => k.category === options.category);
  }
  if (options.favoritesOnly) {
    const favs = getKnowledgeFavorites();
    items = items.filter(k => favs.includes(k.id));
  }
  const q = (query || '').toLowerCase().trim();
  if (!q) return items;
  return items.filter(k =>
    k.title.toLowerCase().includes(q) ||
    k.solution.toLowerCase().includes(q) ||
    (k.tags || []).some(t => t.toLowerCase().includes(q)) ||
    (KB_CATEGORY_LABELS[k.category] || k.category || '').toLowerCase().includes(q)
  );
}

const KB_CATEGORY_LABELS = {
  vodovod: 'Vodovod', elektrika: 'Elektrika', grejanje: 'Grejanje',
  aparati: 'Aparati', basta: 'Bašta', ostalo: 'Ostalo'
};

function getKnowledgeFavorites() {
  return getData().knowledgeFavorites || [];
}

function toggleKnowledgeFavorite(id) {
  const data = getData();
  if (!data.knowledgeFavorites) data.knowledgeFavorites = [];
  const idx = data.knowledgeFavorites.indexOf(id);
  if (idx >= 0) {
    data.knowledgeFavorites.splice(idx, 1);
  } else {
    data.knowledgeFavorites.unshift(id);
    data.knowledgeFavorites = data.knowledgeFavorites.slice(0, 50);
  }
  saveData(data);
  return data.knowledgeFavorites.includes(id);
}

function isKnowledgeFavorite(id) {
  return getKnowledgeFavorites().includes(id);
}

function getTools() {
  return getData().tools || [];
}

function addTool(tool) {
  const data = getData();
  const item = { id: generateId(), name: tool.name, category: tool.category || 'Ostalo', condition: tool.condition || 'dobro', note: tool.note || '' };
  data.tools.push(item);
  saveData(data);
  return item;
}

function deleteTool(id) {
  const data = getData();
  data.tools = data.tools.filter(t => t.id !== id);
  saveData(data);
}

function checkToolsAvailability(requiredTools) {
  const owned = getTools().map(t => t.name.toLowerCase());
  const missing = [];
  const available = [];
  (requiredTools || []).forEach(tool => {
    const t = tool.toLowerCase();
    const has = owned.some(o => o.includes(t) || t.includes(o));
    if (has) available.push(tool);
    else missing.push(tool);
  });
  return { available, missing, canDoIt: missing.length === 0 };
}

function getDiary() {
  return getData().diary || [];
}

function addDiaryEntry(entry) {
  const data = getData();
  const item = {
    id: generateId(),
    title: entry.title,
    type: entry.type || 'ostalo',
    date: entry.date || new Date().toISOString().split('T')[0],
    notes: entry.notes || '',
    photos: entry.photos || []
  };
  data.diary.unshift(item);
  saveData(data);
  return item;
}

function getDiaryFiltered(filters = {}) {
  let entries = getDiary();
  if (filters.type) {
    entries = entries.filter(e => e.type === filters.type);
  }
  if (filters.from) {
    entries = entries.filter(e => e.date >= filters.from);
  }
  if (filters.to) {
    entries = entries.filter(e => e.date <= filters.to);
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    entries = entries.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q)
    );
  }
  return entries;
}

const DIARY_TYPES = [
  { id: 'popravka', label: 'Popravka', icon: '🔧' },
  { id: 'servis', label: 'Servis', icon: '⚙️' },
  { id: 'farbanje', label: 'Farbanje', icon: '🎨' },
  { id: 'kupovina', label: 'Kupovina', icon: '🛒' },
  { id: 'ostalo', label: 'Ostalo', icon: '📔' }
];

function deleteDiaryEntry(id) {
  const data = getData();
  data.diary = data.diary.filter(d => d.id !== id);
  saveData(data);
}

function getSeasonalTasks(month) {
  const m = month || (new Date().getMonth() + 1);
  return SEASONAL_TASKS[m] || [];
}

function getSeasonalProgress(month) {
  const m = month || (new Date().getMonth() + 1);
  return getData().seasonalProgress[m] || {};
}

function toggleSeasonalTask(month, taskId) {
  const data = getData();
  const m = month || (new Date().getMonth() + 1);
  if (!data.seasonalProgress[m]) data.seasonalProgress[m] = {};
  data.seasonalProgress[m][taskId] = !data.seasonalProgress[m][taskId];
  saveData(data);
  return data.seasonalProgress[m][taskId];
}

function getProjects() {
  return getData().projects || [];
}

function addProject(project) {
  const data = getData();
  const item = {
    id: generateId(),
    name: project.name,
    budget: parseFloat(project.budget) || 0,
    dimensions: project.dimensions || '',
    photos: project.photos || [],
    materials: project.materials || [],
    workOrder: project.workOrder || [],
    status: project.status || 'planiranje',
    createdAt: new Date().toISOString()
  };
  data.projects.unshift(item);
  saveData(data);
  return item;
}

function updateProject(id, updates) {
  const data = getData();
  const project = data.projects.find(p => p.id === id);
  if (!project) return null;
  Object.assign(project, updates);
  saveData(data);
  return project;
}

function deleteProject(id) {
  const data = getData();
  data.projects = data.projects.filter(p => p.id !== id);
  saveData(data);
}

function generateProjectMaterials(projectName, dimensions) {
  const name = (projectName || '').toLowerCase();
  const dims = dimensions || '';
  const materials = [];
  let estimatedCost = { min: 5000, max: 15000, note: 'Procena za osnovni DIY projekat' };

  if (name.includes('farbanje') || name.includes('bojenje') || name.includes('soba')) {
    materials.push({ name: 'Boja za zidove', qty: '2-3 kesice', note: 'Za ~20m²', unitPrice: 2500 });
    materials.push({ name: 'Valjak i posuda', qty: '1 set', note: '', unitPrice: 1500 });
    materials.push({ name: 'Traka za maskiranje', qty: '2 rolne', note: '', unitPrice: 800 });
    materials.push({ name: 'Plastična folija', qty: '1 rolna', note: 'Zaštita poda', unitPrice: 500 });
    estimatedCost = { min: 8000, max: 25000, note: 'Zavisi od kvadrature i kvaliteta boje' };
  } else if (name.includes('polica') || name.includes('regal')) {
    materials.push({ name: 'Drvene daske', qty: '3-5 kom', note: dims || 'Po meri', unitPrice: 4000 });
    materials.push({ name: 'Šrafovi i tiplovi', qty: '1 pakovanje', note: '', unitPrice: 600 });
    materials.push({ name: 'Lak ili boja', qty: '0.5l', note: 'Opciono', unitPrice: 1200 });
    estimatedCost = { min: 5000, max: 18000, note: 'Drvo i dimenzije utiču na cenu' };
  } else if (name.includes('bašta') || name.includes('ograda')) {
    materials.push({ name: 'Drveni stubovi', qty: '4-8 kom', note: '', unitPrice: 8000 });
    materials.push({ name: 'Žica ili daske', qty: 'Po meri', note: dims, unitPrice: 5000 });
    materials.push({ name: 'Betonski lepak', qty: '2-3 vreće', note: '', unitPrice: 2000 });
    estimatedCost = { min: 15000, max: 60000, note: 'Dužina ograde i tip materijala' };
  } else if (name.includes('keramik') || name.includes('kupatil')) {
    materials.push({ name: 'Keramičke pločice', qty: 'Po m²', note: dims || 'Izmerite površinu', unitPrice: 3500 });
    materials.push({ name: 'Lepak za keramiku', qty: '2 vreće', note: '', unitPrice: 2500 });
    materials.push({ name: 'Fuga', qty: '2 kg', note: '', unitPrice: 800 });
    estimatedCost = { min: 20000, max: 80000, note: 'Majstor + materijal za kupatilo' };
  } else {
    materials.push({ name: 'Osnovni materijal', qty: 'Po projektu', note: 'Definišite u napomeni', unitPrice: 3000 });
    materials.push({ name: 'Šrafovi i spojnice', qty: '1 set', note: '', unitPrice: 800 });
    materials.push({ name: 'Alat (merenje, nivo)', qty: '—', note: 'Proverite inventar alata', unitPrice: 0 });
    estimatedCost = { min: 5000, max: 30000, note: 'Unesite dimenzije za precizniju procenu' };
  }

  const materialTotal = materials.reduce((s, m) => s + (m.unitPrice || 0), 0);
  return { materials, estimatedCost, materialTotal };
}

function getSafety() {
  return getData().safety || { ...DEFAULT_DATA.safety };
}

function saveSafety(safety) {
  const data = getData();
  data.safety = { ...data.safety, ...safety };
  saveData(data);
  return data.safety;
}

function addMedicine(med) {
  const data = getData();
  if (!data.safety.medicines) data.safety.medicines = [];
  const item = { id: generateId(), name: med.name, expiry: med.expiry || '' };
  data.safety.medicines.push(item);
  saveData(data);
  return item;
}

function deleteMedicine(id) {
  const data = getData();
  data.safety.medicines = (data.safety.medicines || []).filter(m => m.id !== id);
  saveData(data);
}

function getSafetyReminders() {
  const safety = getSafety();
  const reminders = [];
  const now = new Date();
  const checkExpiry = (date, label) => {
    if (!date) return;
    const d = new Date(date);
    const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (days <= 30) reminders.push({ label, days, expired: days < 0 });
  };
  checkExpiry(safety.fireExtinguisherExpiry, 'Aparat za gašenje požara');
  checkExpiry(safety.coDetectorExpiry, 'CO detektor');
  checkExpiry(safety.firstAidCheck, 'Prva pomoć — provera');
  (safety.medicines || []).forEach(m => {
    if (m.expiry) {
      const days = Math.ceil((new Date(m.expiry) - now) / (1000 * 60 * 60 * 24));
      if (days <= 60) reminders.push({ label: `Lek: ${m.name}`, days, expired: days < 0 });
    }
  });
  return reminders;
}

function getGarden() {
  return getData().garden || { plants: [], notes: '' };
}

function saveGarden(garden) {
  const data = getData();
  data.garden = { ...data.garden, ...garden };
  saveData(data);
  return data.garden;
}

function addPlant(plant) {
  const data = getData();
  const item = {
    id: generateId(),
    name: plant.name,
    wateringDays: parseInt(plant.wateringDays, 10) || 3,
    lastWatered: plant.lastWatered || '',
    lastFertilized: plant.lastFertilized || '',
    lastPruned: plant.lastPruned || ''
  };
  data.garden.plants = data.garden.plants || [];
  data.garden.plants.push(item);
  saveData(data);
  return item;
}

function updatePlant(id, updates) {
  const data = getData();
  const plant = (data.garden.plants || []).find(p => p.id === id);
  if (!plant) return null;
  Object.assign(plant, updates);
  saveData(data);
  return plant;
}

function deletePlant(id) {
  const data = getData();
  data.garden.plants = (data.garden.plants || []).filter(p => p.id !== id);
  saveData(data);
}

function getGardenReminders() {
  const plants = getGarden().plants || [];
  const now = new Date();
  const reminders = [];
  plants.forEach(p => {
    if (!p.lastWatered) {
      reminders.push({ plant: p.name, action: 'zalivanje', overdue: true });
      return;
    }
    const last = new Date(p.lastWatered);
    const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (daysSince >= p.wateringDays) {
      reminders.push({ plant: p.name, action: 'zalivanje', overdue: daysSince > p.wateringDays });
    }
  });
  return reminders;
}

function getWatchList() {
  return getData().watchList || [];
}

function addWatchItem(item) {
  const data = getData();
  const newItem = { id: generateId(), productName: item.productName, targetPrice: parseFloat(item.targetPrice) || 0, note: item.note || '' };
  data.watchList.push(newItem);
  saveData(data);
  return newItem;
}

function deleteWatchItem(id) {
  const data = getData();
  data.watchList = data.watchList.filter(w => w.id !== id);
  saveData(data);
}

function detectPurchasePatterns() {
  const expenses = getExpenses().filter(e => e.category === 'food' || e.category === 'home');
  const byName = {};
  expenses.forEach(e => {
    const key = e.name.toLowerCase().trim();
    if (!byName[key]) byName[key] = [];
    byName[key].push(new Date(e.date));
  });

  const patterns = [];
  Object.entries(byName).forEach(([name, dates]) => {
    if (dates.length < 3) return;
    dates.sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push(Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)));
    }
    const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    if (avgGap >= 3 && avgGap <= 21) {
      const weeks = Math.round(avgGap / 7);
      patterns.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        avgDays: avgGap,
        frequency: weeks <= 1 ? 'svake nedelje' : `svake ${weeks} nedelje`,
        count: dates.length
      });
    }
  });
  return patterns.sort((a, b) => b.count - a.count).slice(0, 10);
}

const SHOPPING_CATEGORIES = [
  { id: 'food', label: 'Hrana', icon: '🍎', color: '#2d8f5c' },
  { id: 'home', label: 'Dom', icon: '🏠', color: '#3b82c4' },
  { id: 'hygiene', label: 'Higijena', icon: '🧴', color: '#8b5cf6' },
  { id: 'other', label: 'Ostalo', icon: '📦', color: '#8a9a92' }
];

const SERBIAN_MEAL_PRESETS = [
  // Doručak
  { id: 'kajgana', name: 'Kajgana', tags: ['breakfast'], ingredients: ['jaja', 'ulje', 'so'] },
  { id: 'omlet', name: 'Omlet', tags: ['breakfast'], ingredients: ['jaja', 'mleko', 'sir', 'šunka', 'so'] },
  { id: 'kuvana-jaja', name: 'Kuvana jaja', tags: ['breakfast'], ingredients: ['jaja', 'so'] },
  { id: 'proja', name: 'Proja', tags: ['breakfast', 'any'], ingredients: ['kukuruzno brašno', 'jaja', 'mleko', 'ulje', 'so'] },
  { id: 'pogaca', name: 'Pogača', tags: ['breakfast', 'any'], ingredients: ['brašno', 'kvasac', 'ulje', 'so', 'mleko'] },
  { id: 'sendvic', name: 'Sendvič', tags: ['breakfast'], ingredients: ['hleb', 'šunka', 'sir', 'majonez'] },
  { id: 'ovsena-kasa', name: 'Ovsena kaša', tags: ['breakfast'], ingredients: ['ovsene pahuljice', 'mleko', 'med', 'banana'] },
  { id: 'jogurt-voce', name: 'Jogurt sa voćem', tags: ['breakfast'], ingredients: ['jogurt', 'voće', 'med'] },
  { id: 'burek', name: 'Burek', tags: ['breakfast', 'any'], ingredients: ['jufke', 'mleveno meso', 'luk', 'ulje'] },
  { id: 'gibanica', name: 'Gibanica', tags: ['breakfast', 'any'], ingredients: ['jufke', 'sir', 'jaja', 'ulje', 'mleko'] },
  { id: 'caj-kifla', name: 'Čaj i kifla', tags: ['breakfast'], ingredients: ['čaj', 'kifle', 'margarin'] },
  { id: 'palacinke', name: 'Palačinke', tags: ['breakfast', 'any'], ingredients: ['brašno', 'jaja', 'mleko', 'šećer', 'ulje'] },
  { id: 'hleb-kajmak', name: 'Hleb sa kajmakom', tags: ['breakfast'], ingredients: ['hleb', 'kajmak'] },
  { id: 'popara', name: 'Popara', tags: ['breakfast'], ingredients: ['hleb', 'mleko', 'sir', 'kajmak'] },
  { id: 'tost-sir', name: 'Tost sa sirom', tags: ['breakfast'], ingredients: ['hleb', 'sir', 'puter'] },
  { id: 'pita-sir', name: 'Pita sa sirom', tags: ['breakfast', 'any'], ingredients: ['jufke', 'sir', 'jaja', 'ulje'] },
  { id: 'komplet-lepinja', name: 'Komplet lepinja', tags: ['breakfast', 'any'], ingredients: ['lepinja', 'jaje', 'kajmak', 'suvo meso'] },
  { id: 'mesani-dorucak', name: 'Mešani doručak', tags: ['breakfast'], ingredients: ['jaja', 'slanina', 'hleb', 'sir'] },
  { id: 'sir-jaja', name: 'Sir i jaja', tags: ['breakfast'], ingredients: ['sir', 'jaja', 'hleb'] },
  { id: 'musli', name: 'Musli sa mlekom', tags: ['breakfast'], ingredients: ['musli', 'mleko', 'voće'] },
  { id: 'lepinja-kajmak', name: 'Lepinja sa kajmakom', tags: ['breakfast', 'any'], ingredients: ['lepinja', 'kajmak'] },
  { id: 'ajvar-jaja', name: 'Ajvar sa jajima', tags: ['breakfast'], ingredients: ['ajvar', 'jaja', 'hleb'] },

  // Ručak / večera
  { id: 'pasulj', name: 'Pasulj', tags: ['lunch', 'dinner'], ingredients: ['pasulj', 'luk', 'šargarepa', 'krompir', 'crvena paprika'] },
  { id: 'prebranac', name: 'Prebranac', tags: ['lunch', 'dinner'], ingredients: ['pasulj', 'luk', 'brašno', 'ulje', 'aleva paprika'] },
  { id: 'sarma', name: 'Sarma', tags: ['lunch', 'dinner'], ingredients: ['kupus', 'meso', 'pirinač', 'luk', 'so'] },
  { id: 'musaka', name: 'Musaka', tags: ['lunch', 'dinner'], ingredients: ['krompir', 'meso', 'jaja', 'mleko', 'luk'] },
  { id: 'paprikas', name: 'Paprikaš', tags: ['lunch', 'dinner'], ingredients: ['meso', 'paprika', 'luk', 'paradajz', 'aleva paprika'] },
  { id: 'pileci-paprikas', name: 'Pileći paprikaš', tags: ['lunch', 'dinner'], ingredients: ['piletina', 'paprika', 'luk', 'paradajz', 'pavlak'] },
  { id: 'svinjski-paprikas', name: 'Svinjski paprikaš', tags: ['lunch', 'dinner'], ingredients: ['svinjetina', 'paprika', 'luk', 'paradajz'] },
  { id: 'becar-paprikas', name: 'Bećar paprikaš', tags: ['lunch', 'dinner'], ingredients: ['paprika', 'luk', 'paradajz', 'jaja', 'ulje'] },
  { id: 'gulas', name: 'Gulaš', tags: ['lunch', 'dinner'], ingredients: ['meso', 'luk', 'paprika', 'paradajz', 'brašno'] },
  { id: 'teleci-gulas', name: 'Teleći gulaš', tags: ['lunch', 'dinner'], ingredients: ['teleće meso', 'luk', 'šargarepa', 'paprika', 'paradajz'] },
  { id: 'cufte', name: 'Ćufte', tags: ['lunch', 'dinner'], ingredients: ['mleveno meso', 'luk', 'jaja', 'pirinač', 'paradajz'] },
  { id: 'pljeskavica', name: 'Pljeskavica', tags: ['lunch', 'dinner'], ingredients: ['mleveno meso', 'luk', 'so', 'biber'] },
  { id: 'cevapi', name: 'Ćevapi', tags: ['lunch', 'dinner'], ingredients: ['mleveno meso', 'luk', 'so', 'lepinja'] },
  { id: 'pohovana-piletina', name: 'Pohovana piletina', tags: ['lunch', 'dinner'], ingredients: ['piletina', 'jaja', 'brašno', 'prezle', 'ulje'] },
  { id: 'ribija-corba', name: 'Riblja čorba', tags: ['lunch', 'dinner'], ingredients: ['riba', 'luk', 'šargarepa', 'paradajz', 'so'] },
  { id: 'teleca-corba', name: 'Teleća čorba', tags: ['lunch', 'dinner'], ingredients: ['teleće meso', 'šargarepa', 'celer', 'krompir', 'so'] },
  { id: 'corba-povrca', name: 'Čorba od povrća', tags: ['lunch', 'dinner'], ingredients: ['povrće', 'luk', 'šargarepa', 'so'] },
  { id: 'supa-piletina', name: 'Pileća supa', tags: ['lunch', 'dinner'], ingredients: ['piletina', 'šargarepa', 'celer', 'rezanci', 'so'] },
  { id: 'corba-paradajz', name: 'Čorba od paradajza', tags: ['lunch', 'dinner'], ingredients: ['paradajz', 'luk', 'pirinač', 'šećer', 'so'] },
  { id: 'grasak', name: 'Grašak', tags: ['lunch', 'dinner'], ingredients: ['grašak', 'šargarepa', 'luk', 'meso'] },
  { id: 'grasak-meso', name: 'Grašak sa mesom', tags: ['lunch', 'dinner'], ingredients: ['grašak', 'meso', 'šargarepa', 'luk'] },
  { id: 'boranija', name: 'Boranija', tags: ['lunch', 'dinner'], ingredients: ['boranija', 'luk', 'šargarepa', 'paradajz'] },
  { id: 'kupus', name: 'Dinstani kupus', tags: ['lunch', 'dinner'], ingredients: ['kupus', 'luk', 'ulje', 'so', 'biber'] },
  { id: 'podvarak', name: 'Podvarak', tags: ['lunch', 'dinner'], ingredients: ['kiseli kupus', 'meso', 'luk', 'so', 'biber'] },
  { id: 'duvec', name: 'Đuveč', tags: ['lunch', 'dinner'], ingredients: ['pirinač', 'paprika', 'patlidžan', 'paradajz', 'meso'] },
  { id: 'punjene-paprike', name: 'Punjene paprike', tags: ['lunch', 'dinner'], ingredients: ['paprika', 'meso', 'pirinač', 'luk', 'paradajz'] },
  { id: 'punjene-tikvice', name: 'Punjene tikvice', tags: ['lunch', 'dinner'], ingredients: ['tikvice', 'meso', 'pirinač', 'luk', 'jaja'] },
  { id: 'karadjordjeva', name: 'Karađorđeva šnicla', tags: ['lunch', 'dinner'], ingredients: ['svinjetina', 'kajmak', 'jaja', 'brašno', 'ulje'] },
  { id: 'becka-snicla', name: 'Bečka šnicla', tags: ['lunch', 'dinner'], ingredients: ['teleće meso', 'jaja', 'brašno', 'prezle', 'ulje'] },
  { id: 'krmenadla', name: 'Krmenadla', tags: ['lunch', 'dinner'], ingredients: ['svinjetina', 'so', 'biber', 'ulje', 'limun'] },
  { id: 'svinjski-kotlet', name: 'Svinjski kotlet', tags: ['lunch', 'dinner'], ingredients: ['svinjetina', 'so', 'biber', 'ulje'] },
  { id: 'rizoto', name: 'Rižoto', tags: ['lunch', 'dinner'], ingredients: ['pirinač', 'piletina', 'pečurke', 'luk', 'sir'] },
  { id: 'pilav', name: 'Pilav', tags: ['lunch', 'dinner'], ingredients: ['pirinač', 'meso', 'luk', 'šargarepa', 'ulje'] },
  { id: 'spagete-bolo', name: 'Špagete bolognese', tags: ['lunch', 'dinner'], ingredients: ['špagete', 'mleveno meso', 'paradajz', 'luk', 'sir'] },
  { id: 'makarone-sir', name: 'Makarone sa sirom', tags: ['lunch', 'dinner'], ingredients: ['makarone', 'sir', 'mleko', 'puter'] },
  { id: 'lazanje', name: 'Lazanje', tags: ['lunch', 'dinner'], ingredients: ['testenina', 'mleveno meso', 'paradajz', 'bešamel', 'sir'] },
  { id: 'pizza', name: 'Pizza (domaća)', tags: ['lunch', 'dinner'], ingredients: ['brašno', 'sir', 'paradajz', 'šunka', 'masline'] },
  { id: 'peceno-meso', name: 'Pečeno meso', tags: ['lunch', 'dinner'], ingredients: ['meso', 'krompir', 'ulje', 'so', 'biber'] },
  { id: 'rostilj-mix', name: 'Roštilj mix', tags: ['lunch', 'dinner'], ingredients: ['ćevapi', 'pljeskavica', 'kobasica', 'lepinja', 'luk'] },
  { id: 'kuvano-meso', name: 'Kuvano meso', tags: ['lunch', 'dinner'], ingredients: ['meso', 'luk', 'šargarepa', 'krompir', 'so'] },
  { id: 'piletina-povrce', name: 'Piletina sa povrćem', tags: ['lunch', 'dinner'], ingredients: ['piletina', 'paprika', 'luk', 'šargarepa', 'ulje'] },
  { id: 'fis-paprikas', name: 'Fiš paprikaš', tags: ['lunch', 'dinner'], ingredients: ['riba', 'paprika', 'luk', 'paradajz', 'aleva paprika'] },
  { id: 'pecena-paprika', name: 'Pečena paprika', tags: ['lunch', 'dinner', 'any'], ingredients: ['paprika', 'beli luk', 'ulje', 'sirće'] },
  { id: 'grilovano-povrce', name: 'Grilovano povrće', tags: ['lunch', 'dinner'], ingredients: ['tikvice', 'patlidžan', 'paprika', 'ulje'] },
  { id: 'dinstano-povrce', name: 'Dinstano povrće', tags: ['lunch', 'dinner'], ingredients: ['tikvice', 'patlidžan', 'paprika', 'luk', 'paradajz'] },
  { id: 'sataras', name: 'Sataraš', tags: ['lunch', 'dinner'], ingredients: ['paprika', 'paradajz', 'luk', 'ulje', 'jaja'] },
  { id: 'paprike-pavlaka', name: 'Paprike u pavlaci', tags: ['lunch', 'dinner'], ingredients: ['paprika', 'pavlak', 'beli luk', 'ulje'] },
  { id: 'sopska', name: 'Šopska salata', tags: ['lunch', 'dinner', 'any'], ingredients: ['paradajz', 'krastavac', 'sir', 'luk', 'masline'] },
  { id: 'srpska-salata', name: 'Srpska salata', tags: ['lunch', 'dinner', 'any'], ingredients: ['paradajz', 'paprika', 'luk', 'ulje', 'sirće'] },
  { id: 'tarator', name: 'Tarator', tags: ['lunch', 'dinner', 'any'], ingredients: ['krastavac', 'jogurt', 'beli luk', 'orasi', 'ulje'] },
  { id: 'kupus-salata', name: 'Kupus salata', tags: ['lunch', 'dinner', 'any'], ingredients: ['kupus', 'ulje', 'sirće', 'so'] },
  { id: 'mesana-salata', name: 'Mešana salata', tags: ['lunch', 'dinner', 'any'], ingredients: ['zelena salata', 'paradajz', 'krastavac', 'ulje'] },
  { id: 'krompir-salata', name: 'Krompir salata', tags: ['lunch', 'dinner'], ingredients: ['krompir', 'luk', 'ulje', 'sirće'] },
  { id: 'janija', name: 'Janija', tags: ['lunch', 'dinner'], ingredients: ['meso', 'luk', 'šargarepa', 'krompir', 'paradajz'] },
  { id: 'pasulj-sa-kobasicom', name: 'Pasulj sa kobasicom', tags: ['lunch', 'dinner'], ingredients: ['pasulj', 'kobasica', 'luk', 'šargarepa'] },
  { id: 'punjeni-kupus', name: 'Punjeni kupus', tags: ['lunch', 'dinner'], ingredients: ['kupus', 'meso', 'pirinač', 'luk'] }
];

function getTodaySpending() {
  const today = new Date().toISOString().split('T')[0];
  return getExpenses()
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
}

function getWeeklySpending() {
  const now = new Date();
  const dayLabels = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const amount = getExpenses()
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    days.push({
      day: date.getDate(),
      label: dayLabels[date.getDay()],
      amount,
      isToday: i === 0
    });
  }
  return days;
}

function getSpendingTrend(months = 6) {
  const now = new Date();
  const trend = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const spent = getTotalSpent(d.getFullYear(), d.getMonth());
    trend.push({
      label: d.toLocaleDateString('sr-RS', { month: 'short' }),
      amount: spent,
      year: d.getFullYear(),
      month: d.getMonth()
    });
  }
  return trend;
}

function getPersonalizedTips() {
  const tips = [];
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const usagePct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  if (usagePct >= 80) {
    tips.push({ icon: '💰', text: `Potrošeno ${usagePct}% budžeta — razmisli o uštedi do kraja meseca.` });
  }

  const pantry = getHousehold().pantry || [];
  const lowStock = pantry.filter(p => p.quantity !== undefined && parseFloat(p.quantity) <= 1);
  if (lowStock.length > 0) {
    tips.push({ icon: '🥫', text: `${lowStock.length} namirnica na isteku u ostavi — proveri špajz.` });
  }

  const shopping = getShoppingList().filter(i => !i.bought);
  if (shopping.length >= 5) {
    tips.push({ icon: '🛒', text: `Lista za kupovinu ima ${shopping.length} stavki — možda je vreme za odlazak u prodavnicu.` });
  }

  ensureMaintenanceInitialized?.();
  const due = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  const overdue = due.filter(t => t.overdue);
  if (overdue.length > 0) {
    tips.push({ icon: '🔧', text: `${overdue.length} zadatak održavanja kasni — ne odlaži popravke.` });
  }

  const profile = typeof getHouseProfile === 'function' ? getHouseProfile() : {};
  if (profile.heatingType === 'gas' && [10, 11, 0].includes(now.getMonth())) {
    tips.push({ icon: '🌡️', text: 'Sezona grejanja — proveri kotao i termostat pre hladnih dana.' });
  }

  const safety = typeof getSafetyReminders === 'function' ? getSafetyReminders() : [];
  const expiredSafety = safety.filter(r => r.expired);
  if (expiredSafety.length > 0) {
    tips.push({ icon: '🚨', text: 'Proveri detektore dima i prvu pomoć — nešto je isteklo!' });
  }

  if (tips.length === 0) {
    tips.push({ icon: '✨', text: 'Sve izgleda odlično! Nastavi da pratiš domaćinstvo redovno.' });
  }

  return tips.slice(0, 4);
}

function getFavoriteProducts() {
  return getData().favoriteProducts || [];
}

function addFavoriteProduct(name) {
  const data = getData();
  if (!data.favoriteProducts) data.favoriteProducts = [];
  const trimmed = name.trim();
  if (!trimmed || data.favoriteProducts.includes(trimmed)) return false;
  data.favoriteProducts.unshift(trimmed);
  data.favoriteProducts = data.favoriteProducts.slice(0, 20);
  saveData(data);
  return true;
}

function getLowStockPantry() {
  return (getHousehold().pantry || []).filter(p =>
    p.name && p.quantity !== undefined && parseFloat(p.quantity) <= 1
  );
}

function getFinancialTrainerInsights() {
  const now = new Date();
  const settings = getSettings();
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());
  const insights = [];
  const totalSpent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();
  const dailyBudget = budget > 0 ? Math.round((budget - totalSpent) / Math.max(1, daysLeft)) : 0;

  if (budget > 0 && daysLeft > 0) {
    insights.push({
      category: null,
      label: 'Dnevni budžet',
      amount: dailyBudget,
      annual: 0,
      message: `Do kraja meseca možete trošiti ~${formatCurrency(Math.max(0, dailyBudget))}/dan da ostanete u budžetu.`,
      savings: daysLeft <= 7 ? 'Poslednja nedelja — prioritet osnovnim troškovima.' : 'Ravnomerna potrošnja je ključ stabilnosti.'
    });
  }

  const top = Object.entries(byCategory)
    .filter(([, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  top.forEach(([catId, amount]) => {
    const annual = amount * 12;
    const label = getCategoryLabel(catId).toLowerCase();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevAmount = getSpendingByCategory(prevYear, prevMonth)[catId] || 0;
    const pctOfTotal = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    let trend = '';
    if (prevAmount > 0) {
      const change = Math.round((amount / prevAmount - 1) * 100);
      if (change > 10) trend = ` (+${change}% vs prošli mesec)`;
      else if (change < -10) trend = ` (${change}% vs prošli mesec — bravo!)`;
    }
    const dailyAvg = Math.round(amount / Math.max(1, now.getDate()));
    const tips = {
      food: 'Planirajte obroke nedelju unapred — ušteda do 20% na hrani.',
      bills: 'Poredite ponude dobavljača struje i interneta jednom godišnje.',
      car: 'Redovni servis sprečava skupe kvarove — proverite registraciju.',
      fuel: 'Kombinujte vožnje i proverite pritisak u gumama.',
      entertainment: 'Postavite mesečni limit za zabavu u podešavanjima.'
    };
    insights.push({
      category: catId,
      label: getCategoryLabel(catId),
      amount,
      annual,
      pctOfTotal,
      message: `${pctOfTotal}% budžeta ide na ${label}: ${formatCurrency(amount)}${trend}. Prosek: ${formatCurrency(dailyAvg)}/dan.`,
      savings: `Ušteda 20% = ${formatCurrency(annual * 0.2)}/god. ${tips[catId] || `Smanjite ${label} za jednu kupovinu nedeljno.`}`
    });
  });

  const income = settings.monthlyIncome || 0;
  if (income > 0 && totalSpent > 0) {
    const savingsRate = Math.round(((income - totalSpent) / income) * 100);
    if (savingsRate >= 20) {
      insights.push({
        category: null,
        label: 'Štednja',
        amount: income - totalSpent,
        annual: (income - totalSpent) * 12,
        message: `Odlično! Štedite ${savingsRate}% prihoda ovog meseca (${formatCurrency(income - totalSpent)}).`,
        savings: 'Nastavite — automatski prebacujte uštedu na poseban račun.'
      });
    } else if (savingsRate < 10) {
      insights.push({
        category: null,
        label: 'Štednja',
        amount: totalSpent,
        annual: 0,
        message: `Samo ${Math.max(0, savingsRate)}% prihoda ostaje — razmotrite smanjenje neesencijalnih troškova.`,
        savings: 'Pravilo 50/30/20: 50% potrebe, 30% želje, 20% štednja.'
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      category: null,
      label: 'Početak',
      amount: 0,
      annual: 0,
      message: 'Dodaj troškove da bih mogao da te podučavam o navikama!',
      savings: 'Svaka mala ušteda se sabira — kreni sa jednom kategorijom.'
    });
  }

  return insights;
}

function getUpcomingCosts(targetMonth, targetYear) {
  const now = new Date();
  const year = targetYear ?? now.getFullYear();
  const month = targetMonth ?? now.getMonth();
  const costs = [];
  const household = getHousehold();

  getRecurringExpenses().forEach(r => {
    costs.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(r.dayOfMonth).padStart(2, '0')}`,
      name: r.name,
      amount: r.amount,
      type: 'račun',
      icon: '📄'
    });
  });

  (household.bills || []).forEach(b => {
    if (b.amount) {
      costs.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(b.paymentDay || 15).padStart(2, '0')}`,
        name: b.name,
        amount: parseFloat(b.amount),
        type: 'račun',
        icon: '📄'
      });
    }
  });

  (household.subscriptions || []).forEach(s => {
    if (s.amount) {
      costs.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        name: s.name,
        amount: parseFloat(s.amount),
        type: 'pretplata',
        icon: '📱'
      });
    }
  });

  (household.cars || []).forEach(car => {
    if (car.registrationDate) {
      const reg = new Date(car.registrationDate);
      if (reg.getMonth() === month) {
        costs.push({
          date: car.registrationDate,
          name: `Registracija: ${car.name}`,
          amount: 15000,
          type: 'auto',
          icon: '🚗',
          estimated: true
        });
      }
    }
    costs.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
      name: `Servis: ${car.name}`,
      amount: 25000,
      type: 'auto',
      icon: '🔧',
      estimated: true
    });
  });

  (household.importantDates || []).forEach(d => {
    if (d.date) {
      const dt = new Date(d.date);
      if (dt.getMonth() === month && dt.getFullYear() === year) {
        costs.push({
          date: d.date,
          name: d.name,
          amount: parseFloat(d.amount) || 0,
          type: 'datum',
          icon: '🎂'
        });
      }
    }
  });

  (household.familyMembers || []).forEach(m => {
    if (m.birthday) {
      const bd = new Date(m.birthday);
      if (bd.getMonth() === month) {
        costs.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(bd.getDate()).padStart(2, '0')}`,
          name: `Rođendan: ${m.name}`,
          amount: 5000,
          type: 'rođendan',
          icon: '🎂',
          estimated: true
        });
      }
    }
  });

  return costs.sort((a, b) => a.date.localeCompare(b.date));
}

function getCraftsmanContacts() {
  return getData().craftsmanContacts || [];
}

function saveCraftsmanContact(contact) {
  const data = getData();
  if (!data.craftsmanContacts) data.craftsmanContacts = [];
  const item = {
    id: generateId(),
    trade: contact.trade || '',
    name: contact.name || '',
    phone: contact.phone || '',
    notes: contact.notes || ''
  };
  data.craftsmanContacts.unshift(item);
  saveData(data);
  return item;
}

function deleteCraftsmanContact(id) {
  const data = getData();
  data.craftsmanContacts = (data.craftsmanContacts || []).filter(c => c.id !== id);
  saveData(data);
}

const MAX_DIARY_PHOTO_SIZE = 150000;

function compressImageForStorage(dataUrl, maxSize = MAX_DIARY_PHOTO_SIZE) {
  if (!dataUrl || dataUrl.length <= maxSize) return dataUrl;
  return dataUrl.substring(0, maxSize);
}

/* ========== Utility bills (komunalije) ========== */

function getUtilityBills() {
  const data = getData();
  const ub = data.utilityBills || { templates: [], entries: [] };
  return {
    templates: Array.isArray(ub.templates) ? ub.templates : [],
    entries: Array.isArray(ub.entries) ? ub.entries : []
  };
}

function _saveUtilityBills(utilityBills) {
  const data = getData();
  data.utilityBills = {
    templates: utilityBills.templates || [],
    entries: utilityBills.entries || []
  };
  saveData(data);
}

function getUtilityTemplates() {
  return getUtilityBills().templates.filter(t => t.enabled !== false);
}

function getAllUtilityTemplates() {
  return getUtilityBills().templates;
}

function addUtilityTemplate(partial) {
  const ub = getUtilityBills();
  const template = {
    id: generateId(),
    type: partial.type || 'drugo',
    label: partial.label || '',
    recurrence: partial.recurrence || 'ask',
    lastAmount: typeof partial.lastAmount === 'number' ? partial.lastAmount : 0,
    enabled: partial.enabled !== false,
    createdAt: new Date().toISOString()
  };
  ub.templates.push(template);
  _saveUtilityBills(ub);
  return template;
}

function updateUtilityTemplate(id, updates) {
  const ub = getUtilityBills();
  const idx = ub.templates.findIndex(t => t.id === id);
  if (idx === -1) return null;
  ub.templates[idx] = { ...ub.templates[idx], ...updates, id };
  _saveUtilityBills(ub);
  return ub.templates[idx];
}

function deleteUtilityTemplate(id) {
  const ub = getUtilityBills();
  ub.templates = ub.templates.filter(t => t.id !== id);
  _saveUtilityBills(ub);
}

function getUtilityEntries(filters = {}) {
  let entries = getUtilityBills().entries;
  if (filters.period) entries = entries.filter(e => e.period === filters.period);
  if (filters.templateId) entries = entries.filter(e => e.templateId === filters.templateId);
  if (filters.status) entries = entries.filter(e => e.status === filters.status);
  if (filters.type) entries = entries.filter(e => e.type === filters.type);
  return entries.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function addUtilityEntry(partial) {
  const ub = getUtilityBills();
  const period = partial.period
    || (typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : new Date().toISOString().slice(0, 7));
  const entry = {
    id: generateId(),
    templateId: partial.templateId || null,
    type: partial.type || 'drugo',
    period,
    amount: typeof partial.amount === 'number' ? partial.amount : null,
    status: partial.status || 'pending',
    dueDate: partial.dueDate || null,
    photoDataUrl: partial.photoDataUrl || null,
    scannedAt: partial.scannedAt || null,
    paidAt: partial.paidAt || null,
    createdAt: new Date().toISOString(),
    scanMeta: partial.scanMeta || null
  };
  ub.entries.push(entry);
  if (entry.templateId && typeof entry.amount === 'number' && entry.amount > 0) {
    const tIdx = ub.templates.findIndex(t => t.id === entry.templateId);
    if (tIdx !== -1) ub.templates[tIdx].lastAmount = entry.amount;
  }
  _saveUtilityBills(ub);
  return entry;
}

function updateUtilityEntry(id, updates) {
  const ub = getUtilityBills();
  const idx = ub.entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  const next = { ...ub.entries[idx], ...updates, id };
  ub.entries[idx] = next;
  if (next.templateId && typeof next.amount === 'number' && next.amount > 0) {
    const tIdx = ub.templates.findIndex(t => t.id === next.templateId);
    if (tIdx !== -1) ub.templates[tIdx].lastAmount = next.amount;
  }
  _saveUtilityBills(ub);
  return next;
}

function deleteUtilityEntry(id) {
  const ub = getUtilityBills();
  ub.entries = ub.entries.filter(e => e.id !== id);
  _saveUtilityBills(ub);
}

function markUtilityBillPaid(id, amount) {
  const updates = {
    status: 'paid',
    paidAt: new Date().toISOString()
  };
  if (typeof amount === 'number' && amount > 0) updates.amount = amount;
  return updateUtilityEntry(id, updates);
}

/**
 * Ensure auto-recurrence templates have a pending entry for the period.
 * @param {string} [period]
 * @returns {object[]} newly created entries
 */
function ensureAutoUtilityBillsForPeriod(period) {
  const p = period
    || (typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : new Date().toISOString().slice(0, 7));
  const ub = getUtilityBills();
  const created = [];
  ub.templates
    .filter(t => t.enabled !== false && t.recurrence === 'auto')
    .forEach(t => {
      const exists = ub.entries.some(e => e.templateId === t.id && e.period === p && e.status !== 'skipped');
      if (exists) return;
      const entry = {
        id: generateId(),
        templateId: t.id,
        type: t.type,
        period: p,
        amount: t.lastAmount > 0 ? t.lastAmount : null,
        status: 'pending',
        dueDate: null,
        photoDataUrl: null,
        scannedAt: null,
        paidAt: null,
        createdAt: new Date().toISOString(),
        scanMeta: null
      };
      ub.entries.push(entry);
      created.push(entry);
    });
  if (created.length) _saveUtilityBills(ub);
  return created;
}

/**
 * Briefing / home prompts for ask|auto templates without a paid entry this month.
 * @returns {{ type: 'ask'|'unpaid', templateId, billType, label, entryId?: string }[]}
 */
const UTILITY_ASK_LABELS = {
  struja: 'struju',
  voda: 'vodu',
  grejanje: 'grejanje',
  internet: 'internet',
  stanarina: 'stanarinu',
  drugo: 'ostalo'
};

function getUtilityBillPrompts(period) {
  const p = period
    || (typeof getCurrentBillPeriod === 'function' ? getCurrentBillPeriod() : new Date().toISOString().slice(0, 7));
  ensureAutoUtilityBillsForPeriod(p);

  const ub = getUtilityBills();
  const prompts = [];

  ub.templates
    .filter(t => t.enabled !== false && (t.recurrence === 'ask' || t.recurrence === 'auto'))
    .forEach(t => {
      const custom = t.label && String(t.label).trim();
      const label = custom
        || (typeof getBillTypeLabel === 'function' ? getBillTypeLabel(t.type) : (UTILITY_ASK_LABELS[t.type] || t.type));
      const askLabel = custom || UTILITY_ASK_LABELS[t.type] || label;
      const entries = ub.entries.filter(e => e.templateId === t.id && e.period === p);
      const paid = entries.find(e => e.status === 'paid');
      if (paid) return;
      const skipped = entries.every(e => e.status === 'skipped') && entries.length > 0;
      if (skipped) return;

      const unpaid = entries.find(e => e.status === 'unpaid');
      if (unpaid) {
        prompts.push({
          type: 'unpaid',
          templateId: t.id,
          billType: t.type,
          label: askLabel,
          entryId: unpaid.id
        });
        return;
      }

      const pending = entries.find(e => e.status === 'pending');
      if (t.recurrence === 'ask' || pending) {
        prompts.push({
          type: 'ask',
          templateId: t.id,
          billType: t.type,
          label: askLabel,
          entryId: pending?.id || null
        });
      }
    });

  return prompts;
}
