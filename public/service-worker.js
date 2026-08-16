const CACHE_NAME = 'turizm-muhasebe-mobile-v1';
const APP_SHELL = [
  '/admin.html?mobile=1',
  '/manifest.webmanifest',
  '/style.css?v=20260816-mobile1',
  '/app.js?v=20260816-mobile1',
  '/vendor/exceljs.min.js?v=4.4.0',
  '/assets/mobile-app-icon-192.png',
  '/assets/mobile-app-icon-512.png',
  '/assets/mobile-app-icon-180.png',
  '/assets/logo.png',
  '/assets/hakikat-logo.png',
  '/assets/hakikat-logo-white.png',
  '/assets/hazeyn-logo-receipt.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/admin.html?mobile=1')));
    return;
  }

  event.respondWith(caches.match(request).then(cached => {
    const network = fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || network;
  }));
});
