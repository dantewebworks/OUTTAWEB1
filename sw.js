/* Outta Web service worker */
const CACHE_NAME = 'outtaweb-cache-v3';
const FONT_CACHE = 'outtaweb-fonts-v1';
const ASSETS = [
  '/',
  '/outta_web.html',
  '/manifest.webmanifest',
  '/logo.PNG',
  '/styles.css',
  '/sw.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Navigation requests: network-first, fallback to cached app shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Update cached shell for both root and outta_web.html
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/outta_web.html', res.clone());
            cache.put('/', res.clone());
          });
          return res;
        })
        .catch(() => caches.match('/outta_web.html') || caches.match('/'))
    );
    return;
  }

  // Cache Google Fonts
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((cached) =>
          cached || fetch(req).then((res) => {
            cache.put(req, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (url.origin === location.origin && req.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req).then((res) => {
            cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});

// Allow manual skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

