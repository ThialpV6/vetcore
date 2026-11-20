const CACHE_NAME = "vetcore-pro-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
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
  if (
    e.request.method !== "GET" ||
    url.includes("workers.dev") ||
    url.includes("googleapis.com") ||
    url.includes("firebase") ||
    url.includes("gstatic.com")
  ) {
    return;
  }

  // Stale-While-Revalidate: resposta instantânea do cache + atualização silenciosa em segundo plano
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(e.request).then((cached) => {
        const netFetch = fetch(e.request)
          .then((res) => {
            if (res && res.status === 200) cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || netFetch;
      })
    )
  );
});
