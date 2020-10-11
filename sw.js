const currentCache = 'latestNews-v1';
const offlineUrl = './offline-page.html';
// Cache our known resources during install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(currentCache)
    .then(cache => cache.addAll([
      './js/main.js',
      './js/article.js',
      './images/newspaper.svg',
      './css/site.css',
      './data/latest.json',
      './data/data-1.json',
      './data/data-2.json',
      './data/data-3.json',
      './data/data-4.json',
      './article.html',
      './index.html',
      offlineUrl
    ]))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.filter(cacheName => {
        return cacheName !== currentCache
      }).map(cacheName => caches.delete(cacheName))
    ))
  );
});



// Cache any new resources as they are fetched
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
    .then(function(response) {
      if (response) {
        return response;
      }
      var fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(
        function(response) {
          if(!response || response.status !== 200) {
            return response;
          }

          var responseToCache = response.clone();
          caches.open(currentCache)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });

          return response;
        }
      ).catch(error => {
        if (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')){
          return caches.match(offlineUrl);
        }
      });
    })
  ).catch(() => {
      return caches.match(offlineUrl);
  });
});