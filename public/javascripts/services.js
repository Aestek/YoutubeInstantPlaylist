// main api service

app.factory('videoStore', function($http, $cacheFactory) {
	var caches = {
		video : $cacheFactory('video'),
		search : $cacheFactory('search')
	};

	function getCacheGeneric(type, id, fallback, callback) {
		var e = caches[type].get(id);
		if (e) {
			callback(e);
			return;
		}
		else
			fallback(function(e) {
				caches[type].put(id, e);
				callback(e);
			});
	};

	return {
		search: function(q, callback) {
			getCacheGeneric('search', q, function(fn) {
				$http.get('/api/search/', {
					params: {
						q: q
					}
				}).success(function(data) {
					fn(data);
				});
			}, function(e) {
				callback(e);
			});
		},
		get: function(id, callback) {
			getCacheGeneric('video', id, function(fn) {
				$http.get('/api/video/' + id).success(function(data) {
					fn(data);
				});
			}, function(e) {
				callback(e);
			});
		}
	}
});

// guid service

app.factory('guid', function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	return {
		get: function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}
	}
});


// socket.io service

app.factory('socket', function ($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {	
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});