/* Service worker do Exposoma na web: guarda os arquivos do app para abrir rápido e funcionar sem internet.
   Os dados (previsão, focos, etc.) sempre vão para a rede; o app já guarda a última resposta por conta própria. */
const CACHE = 'exposoma-v1';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './manifest.webmanifest', './icones/icone-192.png']).catch(() => {})));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  if (e.request.mode === 'navigate') {
    // Páginas: rede primeiro, e a página inicial guardada se estiver sem internet.
    e.respondWith(fetch(e.request).then((r) => { caches.open(CACHE).then((c) => c.put('./', r.clone())); return r; }).catch(() => caches.match('./')));
    return;
  }
  // Arquivos do app (JS, fontes, imagens): têm nome com hash, então podem vir do cache.
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) caches.open(CACHE).then((c) => c.put(e.request, r.clone())); return r; })));
});
