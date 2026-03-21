const SW_VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = 'your-face-' + SW_VERSION;
const CORE_CACHE = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.map((name) => {
        if (name !== CACHE_NAME) {
          return caches.delete(name);
        }
        return Promise.resolve();
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') {
    return;
  }

  // Nunca cachear API para evitar inconsistencias de datos.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  const isNavigation = req.mode === 'navigate';
  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(async () => {
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;

          const home = await caches.match('/');
          if (home) return home;

          const offline = await caches.match('/offline.html');
          if (offline) return offline;

          return new Response('Offline', {
            status: 503,
            statusText: 'Offline',
          });
        })
    );
    return;
  }

  const isStaticAsset = url.origin === self.location.origin
    && (
      url.pathname.startsWith('/build/')
      || url.pathname.endsWith('.css')
      || url.pathname.endsWith('.js')
      || url.pathname.endsWith('.png')
      || url.pathname.endsWith('.jpg')
      || url.pathname.endsWith('.jpeg')
      || url.pathname.endsWith('.webp')
      || url.pathname.endsWith('.svg')
      || url.pathname.endsWith('.woff2')
    );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
  }
});