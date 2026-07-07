const CACHE_NAME = 'domacinko-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/components.css',
  './css/style.css',
  './js/storage.js',
  './js/app.js',
  './js/navigation.js',
  './js/pages/home.js',
  './js/pages/finances.js',
  './js/pages/ai.js',
  './js/pages/shopping.js',
  './js/pages/settings.js',
  './js/pages/add-expense.js',
  './js/pages/scan-receipt.js',
  './js/pages/household.js',
  './pages/home.html',
  './pages/finances.html',
  './pages/ai.html',
  './pages/shopping.html',
  './pages/settings.html',
  './pages/add-expense.html',
  './pages/scan-receipt.html',
  './pages/household.html',
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
