const CACHE_NAME = 'domacinko-v4';

const ASSETS = [
  './',
  './index.html',
  './landing.html',
  './manifest.json',
  './css/variables.css',
  './css/components.css',
  './css/style.css',
  './js/storage.js',
  './js/app.js',
  './js/navigation.js',
  './js/notifications.js',
  './js/modules/registry.js',
  './js/modules/ai-context.js',
  './js/pages/home.js',
  './js/pages/finances.js',
  './js/pages/ai.js',
  './js/pages/shopping.js',
  './js/pages/settings.js',
  './js/pages/add-expense.js',
  './js/pages/scan-receipt.js',
  './js/pages/household.js',
  './js/pages/onboarding.js',
  './js/pages/meal-plan.js',
  './js/pages/repairs.js',
  './js/pages/maintenance.js',
  './js/pages/inventory.js',
  './pages/home.html',
  './pages/finances.html',
  './pages/ai.html',
  './pages/shopping.html',
  './pages/settings.html',
  './pages/add-expense.html',
  './pages/scan-receipt.html',
  './pages/household.html',
  './pages/onboarding.html',
  './pages/meal-plan.html',
  './pages/repairs.html',
  './pages/maintenance.html',
  './pages/inventory.html',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
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
