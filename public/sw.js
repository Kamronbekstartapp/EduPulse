// Service Worker (EduPulse)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Tarmoq so'rovlarini o'tkazib yuborish
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});