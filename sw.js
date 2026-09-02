// Service worker mínimo para instalar "Prefectura Escolar" como PWA.
// Sube este archivo (sw.js) a la misma carpeta del repo donde está index.html.

const CACHE_NAME = 'prefectura-21n-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: la app depende de datos en vivo de Firebase,
// así que no cacheamos agresivamente, solo permitimos que la
// app sea "instalable" y funcione offline como último recurso.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
