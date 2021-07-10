const cacheName = "kmmx-site-v1"
const assets = [
  "/index.html",
  "/css/style-intro.css",
  "/css/style.css",
  "/css/cursor.css",
  "/asset/js/app.js",
  "/asset/js/cursor.js",
  "/asset/logo.svg",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})