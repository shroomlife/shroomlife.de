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

	start();

});

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

const canvas = document.querySelector("canvas.trees");
const ctx = canvas.getContext("2d");
const branch = function(l) {
	if (l > 8) return;
	ctx.save();
	ctx.scale(1 - l * 0.1, 0.5);
	ctx.fillRect(-0.5, -0.5, 1, 1);
	ctx.restore();
	if (Math.random() * 1.04 < 0.04) {
		ctx.save();
		ctx.translate(-0.1, 0);
		ctx.rotate((Math.random() * 5 + 15) * Math.PI / 180);
		ctx.translate(0, 0.3);
		ctx.scale(0.7 * 0.9999995, 0.7 * 0.9999995);
		branch(l + 1);
		ctx.restore();
		ctx.translate(0.1, 0);
		ctx.rotate((-Math.random() * 15 - 10) * Math.PI / 180);
		ctx.translate(0, 0.3);
		ctx.scale(0.7 * 0.9999995, 0.7 * 0.9999995);
		branch(l + 1);
	} else {
		ctx.rotate((Math.random() * 10 - 5) * Math.PI / 180);
		ctx.translate(0, 0.3);
		ctx.scale(0.9999995, 0.9999995);
		branch(l);
	}
};

let running = false;
function start() {
	if (running === true) return;
	running = true;

	let $canvas = $(canvas);

	let $container = $canvas.closest('section');

	$canvas.css({
		"width": $container.outerWidth(),
		"height": $container.outerHeight()
	});

	const w = (canvas.width = canvas.offsetWidth * 2);
	const h = (canvas.height = canvas.offsetHeight * 2);
	ctx.fillStyle = "transparent";
	ctx.fillRect(0, 0, w, h);
	let i = 0;
	let total = 33;


	let drawInterval = setInterval(function() {
		ctx.save();
		ctx.translate(w * 0.2 + Math.random() * w * 0.6, h);
		ctx.scale(-20 - i * 0.5, -20 - i * 0.5);
		ctx.fillStyle = `rgba(32, 178, 170, ${i/total})`;
		branch(0);
		ctx.restore();
		i++;

		if(i === total) {
			console.log(i);
			clearInterval(drawInterval);
			running = false;
		}

	}, 377);
}
