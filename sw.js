/* Service Worker leve — cache de estáticos para abrir offline básico */
const CACHE="focinhos-v1";
const ASSETS=[
  "./index.html",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/agendar.js",
  "./assets/icons.svg",
  "./pages/agendar.html",
  "./pages/delivery.html",
  "./pages/taxi.html",
  "./pages/sobre.html",
  "./pages/404.html"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))) .then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const req=e.request;
  e.respondWith(
    caches.match(req).then(res=> res || fetch(req).then(net=>{
      const copy=net.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); return net;
    }).catch(()=> caches.match("./index.html")))
  );
});
    