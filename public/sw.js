self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through handler so server actions, cookies, and SSR remain perfectly real-time
  event.respondWith(fetch(event.request));
});
