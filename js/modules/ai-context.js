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

  return {
    ...finance,
    shopping: shopping.items,
    shoppingCount: shopping.pendingCount,
    members: household.members,
    maintenanceDue: maintenance.dueCount,
    name: finance.settings.userName || 'korisnik'
  };
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
    'ai-teacher': getTeacherContext
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
    repairs: getRepairsContext()
  };
}
