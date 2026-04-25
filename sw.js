// Service Worker - never cache HTML, always fetch fresh
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only intercept our own pages
  if (url.origin === self.location.origin && url.pathname.endsWith('.html')) {
    // Always fetch from network, never cache
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          // Return fresh response with strict no-cache headers
          const headers = new Headers(response.headers);
          headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          headers.set('Pragma', 'no-cache');
          headers.set('Expires', '0');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
        })
        .catch(() => {
          // If offline, let the browser use cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For everything else (JS, CSS, images) - network first
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .catch(() => caches.match(event.request))
    );
  }
});
