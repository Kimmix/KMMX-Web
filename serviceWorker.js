const cacheName = "kmmx-site-v1.0.1"
const assets = [
  "/index.html",
  "/favicon.png",
  "/asset/script/app.js",
  "/asset/script/cursor.js",
  "/asset/KMMX_inthebox.webp",
  "/asset/KMMX_Katana.webp",
  "/asset/KMMX_Ref.webp",
  "/asset/KMMX_Sketch.webp",
  "/asset/KMMX_VRC1.webp",
  "/asset/maskable_icon.png",
  "/asset/splash.png",
  "/css/styles-about.css",
  "/css/styles-archive.css",
  "/css/styles-bio.css",
  "/css/styles-footer.css",
  "/css/styles-main.css",
  "/css/styles-refsheet.css",
  "/css/styles-title.css",
  "/css/cursor.css",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => { cache.addAll(assets) })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})