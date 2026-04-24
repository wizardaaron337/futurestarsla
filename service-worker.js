// Future Stars Service Worker
const CACHE_NAME = 'future-stars-v1';
const STATIC_ASSETS = [
  '/',
  '/signin.html',
  '/pin.html',
  '/dashboard.html',
  '/tournaments.html',
  '/inventory.html',
  '/trips.html',
  '/pj-planner.html',
  '/trip-tracker.html',
  '/trip-plans.html',
  '/team.html',
  '/animations.css',
  '/dark-mode.js',
  '/keyboard-shortcuts.js',
  '/footer-component.js',
  '/manifest.json',
  '/images/fs.jpeg'
];

// Install: cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (e.request.mode === 'navigate') {
          return caches.match('/dashboard.html');
        }
      });
    })
  );
});
