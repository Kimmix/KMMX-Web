const cacheName = `kmmx-site-v1.2.2`
const assets = [
  "/index.html",
  "/favicon.png",
  "/asset/script/app.js",
  "/asset/script/cursor.js",
  "/asset/Katana.png",
  "/asset/KIMMIX_CHIBI.webp",
  "/asset/KMMX_inthebox.webp",
  "/asset/KMMX_Katana2.webp",
  "/asset/KMMX_Ref.png",
  "/asset/maskable_icon.png",
  "/asset/splash.png",
  "/css/cursor.css",
  "/css/styles-archive.css",
  "/css/styles-cardui.css",
  "/css/styles-contact.css",
  "/css/styles-footer.css",
  "/css/styles-main.css",
  "/css/styles-refsheet.css",
  "/css/styles-title.css",
]

self.addEventListener("install", installEvent => {
  self.skipWaiting();
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
