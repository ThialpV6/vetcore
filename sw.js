const CACHE_NAME = "vetcore-pro-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./database.js",
  "./app.js",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  // Nunca interceptar chamadas dinâmicas da IA (Cloudflare Worker), Firebase ou Google Drive
  if (
    e.request.method !== "GET" ||
    url.includes("workers.dev") ||
    url.includes("googleapis.com") ||
    url.includes("firebase") ||
    url.includes("gstatic.com")
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});