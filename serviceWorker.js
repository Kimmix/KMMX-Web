const cacheName = "kmmx-site-v1"
const assets = [
  "/index.html",
  "/asset/script/app.js",
  "/asset/script/cursor.js",
  "/asset/KMMX_VRC1.jpg",
  "/asset/maskable_icon.png",
  "/asset/splash.png",
  "/css/styles-about.css",
  "/css/styles-archive.css",
  "/css/styles-footer.css",
  "/css/styles-intro.css",
  "/css/styles-title.css",
  "/css/cursor.css",
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