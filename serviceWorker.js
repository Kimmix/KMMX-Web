const cacheName = 'kmmx-site-v2.0.0'
// const assets = [
//   "/favicon.png",
//   "/asset/script/cursor.js",
//   "/asset/KIMMIX_CHIBI.webp",
//   "/asset/KMMX_inthebox.webp",
//   "/asset/KMMX_Katana2.webp",
//   "/asset/KMMX_Ref.png",
//   "/asset/maskable_icon.png",
//   "/asset/splash.png",
//   "/asset/arcai_b.svg",
//   "/css/cursor.css",
// ]
// "/index.html",
// "/css/styles-archive.css",
// "/css/styles-cardui.css",
// "/css/styles-contact.css",
// "/css/styles-footer.css",
// "/css/styles-main.css",
// "/css/styles-navdot.css",
// "/css/styles-quote.css",
// "/css/styles-refsheet.css",
// "/css/styles-title.css",

self.addEventListener('install', async installEvent => {
  await installEvent.waitUntil(
    caches.open(cacheName).then(cache => { cache.addAll(assets) })
  )
})

self.addEventListener('fetch', fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})

self.addEventListener('activate', function (activateEvent) {
  activateEvent.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheStoreName) {
          return cacheStoreName !== cacheName
        }).map(function (cacheStoreName) {
          return caches.delete(cacheStoreName);
        })
      );
    })
  );
});

self.addEventListener('message', (messageEvent) => {
  if (messageEvent.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});