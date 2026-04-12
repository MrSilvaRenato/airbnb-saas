/* Simple offline-first SW for AirBnB SaaS Dashboard */
const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const CORE_ASSETS = [
  '/',                // welcome/redirect
  '/dashboard',      // app shell entry
  '/build/manifest.json', // vite manifest when built
];

/* Install: cache core shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

/* Activate: cleanup old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Strategy helpers */
async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

/* Fetch handler */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only GET
  if (request.method !== 'GET') return;

  // Static assets: JS/CSS/fonts/images → stale-while-revalidate
  if (/\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|svg|ico)$/.test(url.pathname)) {
    return event.respondWith(staleWhileRevalidate(request));
  }

  // Public package pages (/p/slug) → cache-first so guests can reopen offline
  if (url.pathname.startsWith('/p/')) {
    return event.respondWith(cacheFirst(request));
  }

  // Shell pages (/dashboard, /host/*) → SW won’t cache auth-only APIs, but we’ll
  // still try S-W-R to improve perceived speed for static HTML responses.
  if (url.pathname === '/' || url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/host/')) {
    return event.respondWith(staleWhileRevalidate(request));
  }

  // Default: network first, fallback to cache if available
  return event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});


// Push Browser Notifications ChatBot
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: 'New message',
      body: event.data?.text() || '',
    };
  }

  const title = data.title || 'New live chat message';

  const options = {
    body: data.body || 'You have a new message',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/admin/dashboard';

  event.waitUntil(
    clients.openWindow(url)
  );
});