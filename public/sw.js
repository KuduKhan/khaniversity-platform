const CACHE = "khaniversity-shell-v1";
const STATIC = "khaniversity-static-v1";
const OFFLINE = "/offline.html";
const PRECACHE = [OFFLINE, "/icons/khaniversity.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => ![CACHE, STATIC].includes(key)).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/learn/") || url.pathname.startsWith("/admin/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.open(STATIC).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          const path = url.pathname;
          const previewIsSafe = path === "/" || path.startsWith("/catalog") || path.startsWith("/schools/") || path.startsWith("/preview/");
          if (previewIsSafe) {
            const cache = await caches.open(CACHE);
            cache.put(request, response.clone());
          }
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        return cached || caches.match(OFFLINE);
      }
    })());
  }
});
