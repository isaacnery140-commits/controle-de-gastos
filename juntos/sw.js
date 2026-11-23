// Guarda os arquivos do app para abrir rápido e como app instalado. Os dados sempre vêm do servidor.
const CACHE = "juntos-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).then(() => c.add(LIB).catch(() => {}))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const proprio = url.origin === location.origin && url.pathname.includes("/juntos/");
  if (!proprio && e.request.url !== LIB) return; // Supabase passa direto
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
