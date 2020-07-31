// register service worker
if ('serviceWorker' in navigator) {

	navigator.serviceWorker.register('worker.js', {
		"scope": "/"
	})
	.then(function (registration) {

		/*
		initNotifications().then((token) => {

			let $body = $('body');
			let $adminBar = $(document.createElement('div'));

			$adminBar.html(token);

			$body.prepend($adminBar);

		messaging.onMessage((payload) => {
			console.log('Message received. ', payload);
		});
		}).catch((err) => {
			console.log(err);
		});
		*/
	})
	.catch(function (error) {
		console.log('Service worker registration failed, error:', error);
	});

}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

$(document).ready(function() {

	let color1 = getRandomColor();
	let rgb1 = hexToRgb(color1);
	let colorString1 = "rgba(" + rgb1.r + "," + rgb1.g + "," + rgb1.r + ",.33)";
	$('.layer1, .layer1 *').css('background-color', colorString1);

	lazyload();

	$('.grid.instagram').masonry();

	$('.grid.instagram .grid-item a').each(function() {

		let item = $(this);
		let text = item.attr("data-title");
		let likes = parseInt(item.attr("data-likes"));
		let comments = parseInt(item.attr("data-comments"));
		let time = item.attr("data-time");

		let tip = $(document.createElement('div'));

		tip.append('<p class="caption">' + text + "</p>");

		let tipFooter = $(document.createElement('div'));
		tipFooter.addClass("tippy-footer");

		tipFooter.append('<span class="likes"><i class="fas fa-heart"></i> ' + likes + "</span>");
		tipFooter.append('<span class="likes"><i class="fas fa-comment"></i> ' + comments + "</span>");
		tipFooter.append('<span class="time">' + moment(time * 1000).fromNow() + "</span>");

		tip.append(tipFooter);
		item.data("tippy", tip.html());

	});

	$('.grid.instagram .grid-item a').each(function() {

		let item = $(this);
		
		tippy(item[0], {
			"content": item.data("tippy"),
			"theme": "light",
			"interactive": true
		});

	});

});
