app.factory('videoStore', function($http, $cacheFactory) {
	var cache = $cacheFactory('videoStore');

	return {
		search: function(q, callback) {
			$http.get('/api/search/', {
				params: {
					q: q
				}
			}).success(function(data) {
				callback(data);
			});
		},
		get: function(id, callback) {
			var v = cache.get(id);
			if (!v)
				$http.get('/api/video/' + id).success(function(data) {
					callback(data);
					cache.put(id, data);
				});
			else
				callback(v);
		}
	}
});


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