const CACHE_NAME = 'shroomlife-1.3.2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urlsToCache = ['/favicon.ico']
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
          return Promise.resolve()
        })
      )
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Check if the request is made by a chrome-extension scheme
  if (new URL(event.request.url).protocol === 'chrome-extension:') {
    // If so, just return without caching
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      const fetchRequest = event.request.clone()

      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})
