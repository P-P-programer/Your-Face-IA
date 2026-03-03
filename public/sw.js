// filepath: c:\Users\felip\Desktop\proyectos\Your-Face\public\sw.js
const CACHE_NAME = 'your-face-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.add('/');  // Solo cachea el HTML principal
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // No cachear API calls
  if (event.request.url.includes('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache first, then network
      return response || fetch(event.request).then(res => {
        if (!res || res.status !== 200) return res;
        
        // Cachear dinámicamente
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(event.request, res.clone()));
        return res;
      });
    }).catch(() => {
      return caches.match('/');
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});