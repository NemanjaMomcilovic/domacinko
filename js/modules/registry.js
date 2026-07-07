/**
 * Domaćinko - Module Registry
 * Central registry for all application modules
 */

const ModuleRegistry = (() => {
  const modules = new Map();

  function register(id, config) {
    if (!id || !config) return false;
    modules.set(id, {
      id,
      name: config.name || id,
      icon: config.icon || '📦',
      description: config.description || '',
      path: config.path || null,
      init: config.init || null,
      getContext: config.getContext || null,
      ...config
    });
    return true;
  }

  function get(id) {
    return modules.get(id) || null;
  }

  function getAll() {
    return [...modules.values()];
  }

  function getContext(id) {
    const mod = modules.get(id);
    if (mod?.getContext) return mod.getContext();
    if (typeof getModuleContext === 'function') return getModuleContext(id);
    return null;
  }

  function initModule(id) {
    const mod = modules.get(id);
    if (mod?.init) mod.init();
    return mod;
  }

  function initAll() {
    modules.forEach(mod => {
      if (mod.init) mod.init();
    });
  }

  return { register, get, getAll, getContext, initModule, initAll };
})();

function registerCoreModules() {
  ModuleRegistry.register('finances', {
    name: 'Finansije',
    icon: '💰',
    description: 'Praćenje troškova i budžeta',
    path: 'finances.html',
    getContext: () => typeof getFinanceContext === 'function' ? getFinanceContext() : null
  });

  ModuleRegistry.register('shopping', {
    name: 'Pametna kupovina',
    icon: '🛒',
    description: 'Lista za kupovinu i plan obroka',
    path: 'shopping.html',
    getContext: () => typeof getShoppingContext === 'function' ? getShoppingContext() : null
  });

  ModuleRegistry.register('receipts', {
    name: 'Fiskalni računi',
    icon: '📷',
    description: 'Skeniranje i OCR računa',
    path: 'scan-receipt.html',
    getContext: () => typeof getReceiptsContext === 'function' ? getReceiptsContext() : null
  });

  ModuleRegistry.register('repairs', {
    name: 'Popravke',
    icon: '🔧',
    description: 'AI Majstor za DIY savete',
    path: 'repairs.html',
    getContext: () => typeof getRepairsContext === 'function' ? getRepairsContext() : null
  });

  ModuleRegistry.register('maintenance', {
    name: 'Održavanje',
    icon: '🏠',
    description: 'Servis i sezonski poslovi',
    path: 'maintenance.html',
    getContext: () => typeof getMaintenanceContext === 'function' ? getMaintenanceContext() : null
  });

  ModuleRegistry.register('kitchen', {
    name: 'Kuhinja',
    icon: '🍽️',
    description: 'Plan obroka i recepti',
    path: 'meal-plan.html',
    getContext: () => typeof getKitchenContext === 'function' ? getKitchenContext() : null
  });

  ModuleRegistry.register('inventory', {
    name: 'Inventar',
    icon: '📦',
    description: 'Kućni inventar i garancije',
    path: 'inventory.html',
    getContext: () => typeof getInventoryContext === 'function' ? getInventoryContext() : null
  });

  ModuleRegistry.register('household', {
    name: 'Domaćinstvo',
    icon: '🏡',
    description: 'Porodica, vozila, dokumenti',
    path: 'household.html',
    getContext: () => typeof getHouseholdContext === 'function' ? getHouseholdContext() : null
  });

  ModuleRegistry.register('ai-advisor', {
    name: 'AI Savetnik',
    icon: '💬',
    description: 'Finansijski i domaći saveti',
    path: 'ai.html',
    getContext: () => typeof getAdvisorContext === 'function' ? getAdvisorContext() : null
  });

  ModuleRegistry.register('ai-majstor', {
    name: 'AI Majstor',
    icon: '🔧',
    description: 'DIY saveti za popravke',
    path: 'repairs.html',
    getContext: () => typeof getRepairsContext === 'function' ? getRepairsContext() : null
  });

  ModuleRegistry.register('ai-teacher', {
    name: 'AI Učitelj',
    icon: '📚',
    description: 'Učenje o domaćinstvu',
    path: 'ai.html#ucitelj',
    getContext: () => typeof getTeacherContext === 'function' ? getTeacherContext() : null
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof registerCoreModules === 'function') registerCoreModules();
});
