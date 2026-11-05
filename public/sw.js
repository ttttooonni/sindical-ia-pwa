"use strict";
const VERSION = "2026-11-05-2";
const C = "sindical-ia-" + VERSION;
const A = ["./", "styles.css", "app.js", "data.json", "manifest.webmanifest", "fonts/BarlowCondensed-Bold.ttf", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-192.png", "icons/maskable-512.png", "img/galeria/dia5-gobernanza.webp", "img/galeria/dia5-negociacion.webp", "img/galeria/dia4-apertura.webp", "img/ponentes/afra-blanco.webp", "img/ponentes/susana-huertas.webp", "img/ponentes/pepe-alvarez.webp", "img/ponentes/carlos-cuerpo.webp", "img/ponentes/lucia-palacios.webp", "img/ponentes/laura-olias.webp", "img/ponentes/raquel-pascual.webp", "img/ponentes/cristina-alonso.webp", "img/ponentes/alejandra-de-la-fuente.webp"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(A.map(u => new Request(u, {cache: "reload"}))))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith("sindical-ia-") && x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
const put = (req, res) => { if (res && res.ok && res.type === "basic") { const cp = res.clone(); caches.open(C).then(c => c.put(req, cp)); } return res; };
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => put("./", r)).catch(() => caches.match("./")));
    return;
  }
  if (url.pathname.endsWith("/data.json")) {
    e.respondWith(fetch(req).then(r => put(req, r)).catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => put(req, r)).catch(() => hit);
    return hit || net;
  }));
});
