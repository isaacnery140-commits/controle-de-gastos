// O app mudou para https://finagenda.com.br. Este service worker se remove e apaga o cache antigo.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.map(x => caches.delete(x))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll()).then(cs => cs.forEach(c => c.navigate("https://finagenda.com.br/")))
));
