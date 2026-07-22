const CACHE_NAME = 'domacinko-v7.5.0';

const ASSETS = [
  './',
  './index.html',
  './splash.html',
  './presents.html',
  './landing.html',
  './pages/privacy.html',
  './manifest.json',
  './config.example.js',
  './css/variables.css',
  './css/components.css',
  './css/style.css',
  './js/storage.js',
  './js/mvp-config.js',
  './js/supabase-client.js',
  './js/auth.js',
  './js/household-sync.js',
  './js/ui-helpers.js',
  './js/help-tooltips.js',
  './js/app.js',
  './js/navigation.js',
  './js/notifications.js',
  './js/voice.js',
  './js/modules/registry.js',
  './js/modules/ai-context.js',
  './js/modules/briefing.js',
  './js/modules/bills/bill-types.js',
  './js/modules/bills/parsers/local-ocr.js',
  './js/modules/bills/bill-parser-registry.js',
  './js/modules/bills/bill-scanner.js',
  './js/pages/auth.js',
  './js/pages/home.js',
  './js/pages/finances.js',
  './js/pages/ai.js',
  './js/pages/shopping.js',
  './js/pages/settings.js',
  './js/pages/profile.js',
  './js/pages/add-expense.js',
  './js/pages/utility-bills.js',
  './js/pages/scan-receipt.js',
  './js/pages/household.js',
  './js/pages/onboarding.js',
  './js/pages/meal-plan.js',
  './js/pages/repairs.js',
  './js/pages/maintenance.js',
  './js/pages/inventory.js',
  './js/pages/house-profile.js',
  './js/pages/visual-assist.js',
  './js/pages/forecast.js',
  './js/pages/knowledge.js',
  './js/pages/tools.js',
  './js/pages/diary.js',
  './js/pages/seasonal.js',
  './js/pages/projects.js',
  './js/pages/garden.js',
  './js/pages/craftsmen.js',
  './js/pages/safety.js',
  './js/pages/household-share.js',
  './js/pages/feedback.js',
  './js/pages/modules.js',
  './pages/household-share.html',
  './pages/feedback.html',
  './pages/modules.html',
  './pages/home.html',
  './pages/auth.html',
  './pages/finances.html',
  './pages/utility-bills.html',
  './pages/ai.html',
  './pages/shopping.html',
  './pages/settings.html',
  './pages/profile.html',
  './pages/add-expense.html',
  './pages/scan-receipt.html',
  './pages/household.html',
  './pages/onboarding.html',
  './pages/meal-plan.html',
  './pages/repairs.html',
  './pages/maintenance.html',
  './pages/inventory.html',
  './pages/house-profile.html',
  './pages/visual-assist.html',
  './pages/forecast.html',
  './pages/knowledge.html',
  './pages/tools.html',
  './pages/diary.html',
  './pages/seasonal.html',
  './pages/projects.html',
  './pages/garden.html',
  './pages/craftsmen.html',
  './pages/safety.html',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/logos/10key.png',
  './assets/logos/domacinko.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.includes('/cdn.jsdelivr.net/') || url.pathname.includes('supabase')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './pages/home.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('domacinko') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
