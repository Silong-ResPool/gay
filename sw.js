/* v8.0.4 永久缓存 Service Worker：CSS/JS/图片/视频/字体 缓存优先；
   HTML 走网络优先（保证更新可见），断网回退缓存。 */
var CACHE = 'sl-static-v1';
var ASSET_RE = /\.(png|jpe?g|webp|gif|svg|ico|css|js|webm|mp4|woff2?|ttf|mp3|wav|ogg)(\?.*)?$/i;

self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isAsset = ASSET_RE.test(url.pathname) || req.destination === 'image' ||
    req.destination === 'style' || req.destination === 'script' || req.destination === 'font';

  if (isAsset) {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(req).then(function (r) {
        return r || fetch(req).then(function (res) {
          if (res && res.ok) c.put(req, res.clone());
          return res;
        });
      });
    }));
  } else {
    e.respondWith(fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req);
    }));
  }
});
