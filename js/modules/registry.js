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
    name: '10KEY Savetnik',
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

  ModuleRegistry.register('house-profile', {
    name: 'Profil kuće',
    icon: '🏠',
    description: 'Kvadratura, grejanje, aparati',
    path: 'house-profile.html',
    getContext: () => typeof getHouseProfileContext === 'function' ? getHouseProfileContext() : null
  });

  ModuleRegistry.register('briefing', {
    name: 'Jutarnji brifing',
    icon: '☀️',
    description: 'Proaktivni pregled dana',
    path: 'home.html',
    getContext: () => typeof generateMorningBriefing === 'function' ? generateMorningBriefing() : null
  });

  ModuleRegistry.register('visual-assist', {
    name: 'Vizuelni asistent',
    icon: '📷',
    description: 'Analiza fotografija',
    path: 'visual-assist.html',
    getContext: () => null
  });

  ModuleRegistry.register('forecast', {
    name: 'Prognoza troškova',
    icon: '📅',
    description: 'Predviđeni troškovi',
    path: 'forecast.html',
    getContext: () => typeof getForecastContext === 'function' ? getForecastContext() : null
  });

  ModuleRegistry.register('knowledge', {
    name: 'Baza znanja',
    icon: '📚',
    description: 'Sačuvana rešenja',
    path: 'knowledge.html',
    getContext: () => typeof getKnowledgeContext === 'function' ? getKnowledgeContext() : null
  });

  ModuleRegistry.register('tools-inventory', {
    name: 'Inventar alata',
    icon: '🔧',
    description: 'Alati koje posedujete',
    path: 'tools.html',
    getContext: () => typeof getToolsContext === 'function' ? getToolsContext() : null
  });

  ModuleRegistry.register('diary', {
    name: 'Dnevnik kuće',
    icon: '📔',
    description: 'Istorija radova',
    path: 'diary.html',
    getContext: () => typeof getDiaryContext === 'function' ? getDiaryContext() : null
  });

  ModuleRegistry.register('seasonal', {
    name: 'Sezonski plan',
    icon: '📅',
    description: 'Mesečna checklista',
    path: 'seasonal.html',
    getContext: () => typeof getSeasonalContext === 'function' ? getSeasonalContext() : null
  });

  ModuleRegistry.register('projects', {
    name: 'Projekti',
    icon: '🛠️',
    description: 'DIY projekti i materijal',
    path: 'projects.html',
    getContext: () => typeof getProjectsContext === 'function' ? getProjectsContext() : null
  });

  ModuleRegistry.register('safety', {
    name: 'Bezbednost',
    icon: '🚨',
    description: 'Detektori, prva pomoć, lekovi',
    path: 'safety.html',
    getContext: () => typeof getSafetyContext === 'function' ? getSafetyContext() : null
  });

  ModuleRegistry.register('garden', {
    name: 'Bašta',
    icon: '🌿',
    description: 'Biljke i zalivanje',
    path: 'garden.html',
    getContext: () => typeof getGardenContext === 'function' ? getGardenContext() : null
  });

  ModuleRegistry.register('craftsmen', {
    name: 'Mreža majstora',
    icon: '👷',
    description: 'Orijentacione cene majstora',
    path: 'craftsmen.html',
    getContext: () => null
  });

  ModuleRegistry.register('voice', {
    name: 'Glasovni režim',
    icon: '🎤',
    description: 'Glasovne komande',
    path: 'home.html',
    getContext: () => null
  });

  ModuleRegistry.register('home-magazine', {
    name: 'Kućni magacin',
    icon: '🏪',
    description: 'Sijalice, boja, šrafovi',
    path: 'inventory.html',
    getContext: () => typeof getMagazineContext === 'function' ? getMagazineContext() : null
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof registerCoreModules === 'function') registerCoreModules();
});
