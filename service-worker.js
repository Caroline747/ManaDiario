self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('gv-v1').then((cache) => cache.addAll([
      './', './index.html', './manifest.json', './icon512_maskable.png', './icon512_rounded.png'
    ])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        // opcional: colocar no cache dinâmico
        return res;
      }).catch(() => {
        // opcional: retornar fallback
      });
    })
  );
});