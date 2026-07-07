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

const DEFAULT_DATA = {
  settings: {
    userName: '',
    currency: 'RSD',
    monthlyBudget: 80000,
    savingsGoal: 10000
  },
  expenses: [],
  shoppingList: [],
  household: {
    familyMembers: [],
    cars: [],
    bills: [],
    pets: [],
    subscriptions: [],
    appliances: [],
    documents: [],
    warranties: [],
    importantDates: []
  },
  tasks: [
    { id: 't1', text: 'Plati struju', done: false },
    { id: 't2', text: 'Kupi mleko', done: false },
    { id: 't3', text: 'Proveri račune', done: false }
  ],
  chatHistory: []
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
    return { ...structuredClone(DEFAULT_DATA), ...parsed };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSettings() {
  return getData().settings;
}

function saveSettings(settings) {
  const data = getData();
  data.settings = { ...data.settings, ...settings };
  saveData(data);
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

  // Budget remaining (up to 40 points)
  score += remainingPct * 40;

  // Spending pace (up to 20 points)
  if (actualSpentPct <= expectedSpentPct) {
    score += 20;
  } else if (actualSpentPct <= expectedSpentPct * 1.2) {
    score += 10;
  }

  // Trend vs last month (up to 10 points)
  if (prevSpent > 0) {
    if (spent < prevSpent) score += 10;
    else if (spent > prevSpent * 1.2) score -= 10;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
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
  saveData(DEFAULT_DATA);
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

  const tips = [
    'Planirajte obroke unapred — uštedite do 20% na hrani.',
    'Pregledajte pretplate — možda neke više ne koristite.',
    'Male uštede svakog dana vode do velikih ciljeva.',
    'Domaćinko je tu da vam pomogne — pitajte me bilo šta!'
  ];
  const dayIndex = now.getDate() % tips.length;
  return tips[dayIndex];
}
