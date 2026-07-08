/**
 * Domaćinko - Unified AI Context Builders
 */

function getFinanceContext() {
  const settings = getSettings();
  const now = new Date();
  const spent = getTotalSpent(now.getFullYear(), now.getMonth());
  const budget = settings.monthlyBudget || 0;
  const byCategory = getSpendingByCategory(now.getFullYear(), now.getMonth());
  const categoryBudgets = typeof getCategoryBudgetStatus === 'function'
    ? getCategoryBudgetStatus()
    : [];

  const topCategories = Object.entries(byCategory)
    .filter(([, a]) => a > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, amt]) => `${getCategoryLabel(id)}: ${formatCurrency(amt)}`)
    .join(', ');

  const warnings = categoryBudgets.filter(c => c.warning).map(c => c.label);

  return {
    settings,
    spent,
    budget,
    remaining: budget - spent,
    topCategories,
    comparison: getMonthComparison(),
    savings: getSavingsProgress(),
    score: getFinancialHealthScore(),
    categoryBudgets,
    budgetWarnings: warnings
  };
}

function getHouseholdContext() {
  const household = getHousehold();
  const members = household.familyMembers?.length || 0;
  const pets = household.pets?.length || 0;
  const cars = household.cars?.length || 0;
  const bills = household.bills?.length || 0;
  const subs = household.subscriptions?.length || 0;

  return {
    members,
    pets,
    cars,
    bills,
    subscriptions: subs,
    documents: household.documents?.length || 0,
    warranties: household.warranties?.length || 0,
    finance: getFinanceContext()
  };
}

function getShoppingContext() {
  const shopping = getShoppingList();
  const pending = shopping.filter(i => !i.bought);
  const mealPlan = getMealPlan();
  const plannedMeals = Object.values(mealPlan).filter(m => m && m.trim()).length;

  return {
    pendingCount: pending.length,
    items: pending.map(i => i.name),
    mealPlan,
    plannedMeals,
    pantry: getPantryItems().map(p => p.name)
  };
}

function getReceiptsContext() {
  const expenses = getExpenses().slice(0, 10);
  return {
    recentExpenses: expenses.map(e => ({
      name: e.name,
      amount: e.amount,
      date: e.date,
      category: getCategoryLabel(e.category)
    })),
    totalThisMonth: getTotalSpent(new Date().getFullYear(), new Date().getMonth())
  };
}

function getRepairsContext() {
  const history = typeof getRepairHistory === 'function' ? getRepairHistory() : [];
  return {
    recentRepairs: history.slice(0, 5).map(r => ({
      category: r.category,
      problem: r.problem,
      difficulty: r.difficulty,
      date: r.date
    })),
    totalRepairs: history.length
  };
}

function getMaintenanceContext() {
  const due = typeof getDueMaintenance === 'function' ? getDueMaintenance() : [];
  const overdue = due.filter(t => t.overdue);
  const upcoming = due.filter(t => !t.overdue);

  return {
    dueCount: due.length,
    overdueCount: overdue.length,
    overdue: overdue.map(t => t.name),
    upcoming: upcoming.slice(0, 5).map(t => t.name),
    tasks: typeof getMaintenanceTasks === 'function' ? getMaintenanceTasks().length : 0
  };
}

function getKitchenContext() {
  const mealPlan = getMealPlan();
  const pantry = getPantryItems();
  const suggestion = suggestMealsFromPantry();

  return {
    mealPlan,
    pantryItems: pantry.map(p => p.name),
    suggestions: suggestion?.suggestions || []
  };
}

function getInventoryContext() {
  const items = typeof getInventory === 'function' ? getInventory() : [];
  const expiring = typeof getExpiringWarranties === 'function' ? getExpiringWarranties(30) : [];

  return {
    totalItems: items.length,
    locations: [...new Set(items.map(i => i.location).filter(Boolean))],
    expiringWarranties: expiring.map(i => i.name),
    expiringCount: expiring.length
  };
}

function getAdvisorContext() {
  const finance = getFinanceContext();
  const shopping = getShoppingContext();
  const household = getHouseholdContext();
  const maintenance = getMaintenanceContext();
  const houseProfile = typeof getHouseProfileContext === 'function' ? getHouseProfileContext() : {};
  const knowledge = typeof getKnowledgeContext === 'function' ? getKnowledgeContext() : { count: 0 };
  const tools = typeof getToolsContext === 'function' ? getToolsContext() : { count: 0 };
  const magazine = typeof getMagazineContext === 'function' ? getMagazineContext() : { count: 0 };
  const lowStock = typeof getLowStockPantry === 'function' ? getLowStockPantry() : [];

  return {
    ...finance,
    shopping: shopping.items,
    shoppingCount: shopping.pendingCount,
    members: household.members,
    maintenanceDue: maintenance.dueCount,
    maintenanceOverdue: maintenance.overdueCount,
    houseProfile,
    knowledgeCount: knowledge.count,
    toolsCount: tools.count,
    magazineItems: magazine.items || [],
    lowStockPantry: lowStock.map(p => p.name),
    name: finance.settings.userName || 'korisnik'
  };
}

const MODULE_SUGGESTED_QUESTIONS = {
  savetnik: [
    'Koliko sam potrošio danas?',
    'Koliko sam potrošio?',
    'Šta da kuvam danas?',
    'Šta kasni u kući?',
    'Gde najviše trošim?',
    'Koliko mi je ostalo?',
    'Šta je na listi za kupovinu?',
    'Pregled dana'
  ],
  majstor: [
    'Curi slavina u kupatilu',
    'Pregoreo osigurač',
    'Pukotina na zidu',
    'Biljka ima žute listove'
  ],
  finances: [
    'Koliko sam potrošio ovog meseca?',
    'Koja kategorija prekoračuje budžet?',
    'Koliko mogu da uštedim?'
  ],
  shopping: [
    'Šta imam na listi?',
    'Šta mi nedostaje u ostavi?',
    'Šta često kupujem?'
  ],
  garden: [
    'Koje biljke treba zaliti?',
    'Saveti za zalivanje leti'
  ],
  safety: [
    'Šta je isteklo u apoteci?',
    'Kada proveriti detektor dima?'
  ]
};

function getSuggestedQuestions(module = 'savetnik') {
  if (module === 'savetnik' && typeof buildFullAIContext === 'function') {
    const ctx = buildFullAIContext();
    const dynamic = [];
    const due = ctx.maintenance?.overdueCount || 0;
    if (due > 0) dynamic.push('Šta kasni u kući?');
    const shopping = ctx.shopping?.pendingCount || 0;
    if (shopping > 0) dynamic.push('Šta je na listi za kupovinu?');
    const todayMeal = ctx.shopping?.mealPlan;
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
    if (todayMeal?.[dayKey]?.trim()) dynamic.push('Šta da kuvam danas?');
    const base = MODULE_SUGGESTED_QUESTIONS.savetnik;
    const merged = [...new Set([...dynamic, ...base])];
    return merged.slice(0, 8);
  }
  return MODULE_SUGGESTED_QUESTIONS[module] || MODULE_SUGGESTED_QUESTIONS.savetnik;
}

function getTeacherContext() {
  const progress = typeof getTeacherProgress === 'function' ? getTeacherProgress() : { completed: [] };
  return {
    completedTopics: progress.completed || [],
    completedCount: (progress.completed || []).length
  };
}

function getModuleContext(moduleId) {
  const builders = {
    finances: getFinanceContext,
    shopping: getShoppingContext,
    receipts: getReceiptsContext,
    repairs: getRepairsContext,
    maintenance: getMaintenanceContext,
    kitchen: getKitchenContext,
    inventory: getInventoryContext,
    household: getHouseholdContext,
    'ai-advisor': getAdvisorContext,
    'ai-teacher': getTeacherContext,
    'house-profile': getHouseProfileContext,
    knowledge: getKnowledgeContext,
    'tools-inventory': getToolsContext,
    diary: getDiaryContext,
    seasonal: getSeasonalContext,
    projects: getProjectsContext,
    safety: getSafetyContext,
    garden: getGardenContext,
    forecast: getForecastContext,
    'home-magazine': getMagazineContext
  };
  const builder = builders[moduleId];
  return builder ? builder() : getAdvisorContext();
}

function buildFullAIContext() {
  return {
    finance: getFinanceContext(),
    household: getHouseholdContext(),
    shopping: getShoppingContext(),
    maintenance: getMaintenanceContext(),
    inventory: getInventoryContext(),
    repairs: getRepairsContext(),
    houseProfile: typeof getHouseProfileContext === 'function' ? getHouseProfileContext() : null,
    briefing: typeof generateMorningBriefing === 'function' ? generateMorningBriefing() : null,
    knowledge: typeof getKnowledgeContext === 'function' ? getKnowledgeContext() : null,
    tools: typeof getToolsContext === 'function' ? getToolsContext() : null,
    garden: typeof getGardenContext === 'function' ? getGardenContext() : null,
    safety: typeof getSafetyContext === 'function' ? getSafetyContext() : null,
    forecast: typeof getForecastContext === 'function' ? getForecastContext() : null
  };
}

function getHouseProfileContext() {
  const profile = getHouseProfile();
  return {
    squareMeters: profile.squareMeters,
    heatingType: profile.heatingType,
    homeType: profile.homeType,
    appliances: (profile.appliances || []).map(a => a.name)
  };
}

function getKnowledgeContext() {
  const items = getKnowledgeBase();
  return { count: items.length, recent: items.slice(0, 5).map(k => k.title) };
}

function getToolsContext() {
  const tools = getTools();
  return { count: tools.length, tools: tools.map(t => t.name) };
}

function getDiaryContext() {
  const entries = getDiary();
  return { count: entries.length, recent: entries.slice(0, 3).map(e => e.title) };
}

function getSeasonalContext() {
  const month = new Date().getMonth() + 1;
  const tasks = getSeasonalTasks(month);
  const progress = getSeasonalProgress(month);
  const done = tasks.filter(t => progress[t.id]).length;
  return { month, total: tasks.length, done };
}

function getProjectsContext() {
  const projects = getProjects();
  return { count: projects.length, active: projects.filter(p => p.status !== 'završeno').length };
}

function getSafetyContext() {
  const reminders = getSafetyReminders();
  return { reminderCount: reminders.length, reminders: reminders.map(r => r.label) };
}

function getGardenContext() {
  const reminders = getGardenReminders();
  return { plantCount: (getGarden().plants || []).length, wateringDue: reminders.length };
}

function getForecastContext() {
  const now = new Date();
  const costs = getUpcomingCosts(now.getMonth(), now.getFullYear());
  const total = costs.reduce((s, c) => s + (c.amount || 0), 0);
  return { upcomingCount: costs.length, estimatedTotal: total };
}

function getMagazineContext() {
  const items = getHomeMagazine();
  return { count: items.length, items: items.slice(0, 10).map(i => `${i.name} (${i.quantity})`) };
}
