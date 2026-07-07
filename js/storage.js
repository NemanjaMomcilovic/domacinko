/**
 * Domaćinko - localStorage API
 */

const STORAGE_KEY = 'domacinko_data';

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
  { id: 'mon', label: 'Pon' },
  { id: 'tue', label: 'Uto' },
  { id: 'wed', label: 'Sre' },
  { id: 'thu', label: 'Čet' },
  { id: 'fri', label: 'Pet' },
  { id: 'sat', label: 'Sub' },
  { id: 'sun', label: 'Ned' }
];

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
    savingsGoal: 10000,
    savingsGoalName: '',
    categoryBudgets: {},
    darkTheme: false,
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    notificationsEnabled: false
  },
  expenses: [],
  recurringExpenses: [],
  shoppingList: [],
  mealPlan: {
    mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
  },
  feedback: [],
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
  tasks: [
    { id: 't1', text: 'Plati struju', done: false },
    { id: 't2', text: 'Kupi mleko', done: false },
    { id: 't3', text: 'Proveri račune', done: false }
  ],
  chatHistory: [],
  inventory: [],
  maintenance: [],
  repairHistory: [],
  teacherProgress: { completed: [], notes: {} }
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveData(DEFAULT_DATA);
      return structuredClone(DEFAULT_DATA);
    }
    const parsed = JSON.parse(raw);
    const merged = { ...structuredClone(DEFAULT_DATA), ...parsed };
    merged.settings = { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) };
    if (!merged.recurringExpenses) merged.recurringExpenses = [];
    if (!merged.mealPlan) merged.mealPlan = { ...DEFAULT_DATA.mealPlan };
    if (!merged.feedback) merged.feedback = [];
    if (merged.household && !merged.household.pantry) merged.household.pantry = [];
    if (!merged.inventory) merged.inventory = [];
    if (!merged.maintenance) merged.maintenance = [];
    if (!merged.repairHistory) merged.repairHistory = [];
    if (!merged.teacherProgress) merged.teacherProgress = { completed: [], notes: {} };
    if (!merged.settings.categoryBudgets) merged.settings.categoryBudgets = {};
    return merged;
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data, options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (!options.skipSync && !_skipCloudSync) {
    scheduleCloudSync();
  }
}

function scheduleCloudSync() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return;
  if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    pushUserDataToCloud(getData()).catch(() => {});
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  _skipCloudSync = false;
  return merged;
}

function getSettings() {
  return getData().settings;
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
  if (goal <= 0) return { goal: 0, saved: 0, pct: 0 };

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
    goalName: settings.savingsGoalName || 'Cilj štednje'
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

function addShoppingItem(name) {
  const data = getData();
  const item = { id: generateId(), name, bought: false };
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

function addChatMessage(role, text) {
  const data = getData();
  data.chatHistory.push({ id: generateId(), role, text, time: new Date().toISOString() });
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
  localStorage.removeItem(STORAGE_KEY);
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
    version: '5.0.0',
    exportedAt: new Date().toISOString(),
    onboardingComplete: isOnboardingComplete(),
    data: getData()
  }, null, 2);
}

function importAllData(jsonString) {
  const parsed = JSON.parse(jsonString);
  const payload = parsed.data || parsed;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Neispravan format podataka.');
  }
  saveData({ ...structuredClone(DEFAULT_DATA), ...payload });
  if (parsed.onboardingComplete) setOnboardingComplete();
  return true;
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
  return getData().mealPlan || { ...DEFAULT_DATA.mealPlan };
}

function saveMealPlan(mealPlan) {
  const data = getData();
  data.mealPlan = { ...data.mealPlan, ...mealPlan };
  saveData(data);
}

function setMealForDay(dayId, mealName) {
  const data = getData();
  if (!data.mealPlan) data.mealPlan = { ...DEFAULT_DATA.mealPlan };
  data.mealPlan[dayId] = mealName;
  saveData(data);
}

function extractIngredientsFromMeals() {
  const plan = getMealPlan();
  const ingredients = new Set();

  Object.values(plan).forEach(meal => {
    const name = (meal || '').trim().toLowerCase();
    if (!name) return;

    let matched = false;
    for (const [key, items] of Object.entries(MEAL_INGREDIENT_MAP)) {
      if (name.includes(key)) {
        items.forEach(i => ingredients.add(i));
        matched = true;
      }
    }

    if (!matched) {
      name.split(/[,+\-/&]| i /).forEach(part => {
        const trimmed = part.trim();
        if (trimmed.length > 2) ingredients.add(trimmed);
      });
    }
  });

  return [...ingredients];
}

function generateShoppingFromMealPlan() {
  const ingredients = extractIngredientsFromMeals();
  const existing = getShoppingList().map(i => i.name.toLowerCase());
  let added = 0;

  ingredients.forEach(ing => {
    if (!existing.includes(ing.toLowerCase())) {
      addShoppingItem(ing.charAt(0).toUpperCase() + ing.slice(1));
      added++;
    }
  });

  return { added, total: ingredients.length };
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
  if (data.maintenance.length > 0) return;

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
