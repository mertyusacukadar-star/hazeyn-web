const CACHE_NAME = 'turizm-muhasebe-mobile-v35-usability';
const APP_SHELL = [
  '/workspace-usability.js?v=20261001-ux3',
  '/workspace-usability.css?v=20261001-ux3',
  '/company-manager.js?v=20261001-ux3',
  '/workspace-theme.js?v=20261001-ux3',
  '/workspace-theme.css?v=20261001-ux3',
  '/tour-trash.js?v=20261001-ux3',
  '/recovery-ui.js?v=20261001-ux3',
  '/backup-destinations.js?v=20261001-ux3',
  '/company-config.js?v=20261001-ux3',
  '/bus-companies.js?v=20261001-ux3',
  '/bus-shared-picker.js?v=20261001-ux3',
  '/passenger-fields.js?v=20261001-ux3',
  '/passenger-fields.css?v=20261001-ux3',
  '/bus-print.js?v=20261001-ux3',
  '/bus-plan.js?v=20261001-ux3',
  '/bus-workspace.js?v=20261001-ux3',
  '/bus-workspace.css?v=20261001-ux3',
  '/workspace-dialog.js?v=20261001-ux3',
  '/workspace-collections.js?v=20261001-ux3',
  '/workspace-lists.js?v=20261001-ux3',
  '/workspace-lists.css?v=20261001-ux3',
  '/workspace-login.js?v=20261001-ux3',
  '/workspace-login.css?v=20261001-ux3',
  '/admin.html?mobile=1',
  '/manifest.webmanifest',
  '/style.css?v=20260917-livecamera2',
  '/mrz-camera.js?v=20260917-livecamera2',
  '/document-reader.js?v=20260917-livecamera2',
  '/workspace-ui.css?v=20261001-ux3',
  '/workspace-ui.js?v=20261001-ux3',
  '/app.js?v=20261001-ux3',
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
