$(document).ready((e) => {

	let $body = $("body");
	let $window = $(window);
	let $permissions = $body.find('.permissions');

	let permissionBtns = $permissions.find("a[data-permission]");
	permissionBtns.click((event) => {

		let btn = $(event.currentTarget);
		let icon = btn.find('i');
		let action = btn.attr('data-permission');

		console.log(btn);

		switch (action) {

			case 'notifications':

				Notification.requestPermission().then((state) => {

					if (state === 'granted') {
						icon.removeClass('fa-bell-slash');
						icon.addClass('fa-bell');
					} else {
						icon.addClass('fa-bell-slash');
						icon.removeClass('fa-bell');
					}

				});
				break;

			case 'push':

				console.log(subscribePush());
				break;

		}

	});

});

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('worker.js', {
			"scope": "/"
		})
		.then(function (registration) {
			console.log('Registration successful, scope is:', registration.scope);
		})
		.catch(function (error) {
			console.log('Service worker registration failed, error:', error);
		});
/*
	navigator.serviceWorker.ready
		.then(function (registration) {
			registration.pushManager.getSubscription()
				.then(function (subscription) {
					//If already access granted, enable push button status
					if (subscription) {
						changePushStatus(true);
					} else {
						changePushStatus(false);
					}
				})
				.catch(function (error) {
					console.error('Error occurred while enabling push ', error);
				});
		});

	// Ask User if he/she wants to subscribe to push notifications and then
	// ..subscribe and send push notification
	function subscribePush() {
		navigator.serviceWorker.ready.then(function (registration) {
			if (!registration.pushManager) {
				alert('Your browser doesn\'t support push notification.');
				return false;
			}

			//To subscribe `push notification` from push manager
			registration.pushManager.subscribe({
					userVisibleOnly: true //Always show notification when received
				})
				.then(function (subscription) {
					toast('Subscribed successfully.');
					console.info('Push notification subscribed.');
					console.log(subscription);
					//saveSubscriptionID(subscription);
					changePushStatus(true);
				})
				.catch(function (error) {
					changePushStatus(false);
					console.error('Push notification subscription error: ', error);
				});
		})
	}

	// Unsubscribe the user from push notifications
	function unsubscribePush() {
		navigator.serviceWorker.ready
			.then(function (registration) {
				//Get `push subscription`
				registration.pushManager.getSubscription()
					.then(function (subscription) {
						//If no `push subscription`, then return
						if (!subscription) {
							alert('Unable to unregister push notification.');
							return;
						}

						//Unsubscribe `push notification`
						subscription.unsubscribe()
							.then(function () {
								toast('Unsubscribed successfully.');
								console.info('Push notification unsubscribed.');
								console.log(subscription);
								//deleteSubscriptionID(subscription);
								changePushStatus(false);
							})
							.catch(function (error) {
								console.error(error);
							});
					})
					.catch(function (error) {
						console.error('Failed to unsubscribe push notification.');
					});
			})
	}

	//To change status
	function changePushStatus(status) {
		console.log(status);
	}
	*/

}
