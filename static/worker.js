self.addEventListener('install', function () {
	console.log("INSTALL EVENT");
	caches.delete("shroomlife").then(function() {
		caches.open("shroomlife").then(function(cache) {
			cache.add("/favicon.ico");
		});
	});
});

self.addEventListener('fetch', function (event) {

	if(event.request.cache === "reload") {
		event.respondWith(addResponseToCache(event));
	} else {
		event.respondWith(
			caches.match(event.request).then(function(response) {
				return response || addResponseToCache(event);
			})
		);
	}

});

function addResponseToCache(event) {

	return fetch(event.request).then((response) => {
	
		let url = new URL(event.request.url);
		let cachedResponse = response.clone();

		if (url.origin === location.origin) {

			caches.open("shroomlife").then(function(cache) {
				cache.put(event.request, cachedResponse);
			});

		}

		return response;

	});

}