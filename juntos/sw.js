// Guarda os arquivos do app para abrir rápido e como app instalado. Os dados sempre vêm do servidor.
const CACHE = "juntos-v6";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./fatura.js"];
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
      .catch(() => caches.match(e.request).then(r => r || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});

// Notificações: mostra o aviso e abre o app na aba certa ao tocar.
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Juntos", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./" }, vibrate: [120, 60, 120]
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.includes("/juntos/") && "focus" in c) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
// Se o celular trocar a inscrição, o app refaz sozinho na próxima vez que abrir.
