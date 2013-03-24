// main api service

app.factory('api', function($http, $cacheFactory, $rootScope) {
	var api = {};
	var verbs = ['get', 'post', 'put', 'delete'];

	function constructUrl(url, params) {
		params = params || {};

		url = url.replace(/:(\w+)(\??)/gi, function(u, p) {
			if (params[p]) {
				var v = params[p];
				delete params[p];
				return v;
			}
			else
				return '';
		}).replace(/\/\//g, '/');

		return {
			url: url,
			params: params
		};
	}

	function resolveEls(els, container) {
		for (var i in els) {
			container[i] = {};

			for (var j in verbs) {
				if (els[i][verbs[j]])
					(function(i, j) {
						container[i][verbs[j]] = function() {
							var params = arguments.length == 2 ? arguments[0] : null;
							var cb = arguments.length == 2 ? arguments[1] : arguments[0];
							var urlConfig = constructUrl(els[i].uri, params);
							$http({
								url: urlConfig.url,
								params: urlConfig.params,
								method: verbs[j],
								cache: els[i].cache
							}).success(function(data, status, headers, config) {
								if (cb)
									cb(data);
							}).error(function(data, status, headers, config) {
								if (status == 401)
									$rootScope.$emit('authRequired', {
										uri: urlConfig.url,
										method: verbs[j],
										statusCode: status,
										retry: function() {
											container[i][verbs[j]](arguments[0], arguments[1]);
										}
									});
								if (cb)
									cb(null, data);
							});
						};
					})(i, j);
			}

			if (els[i].next)
				resolveEls(els[i].next, container[i])
		}
	}
	resolveEls(apiManifest, api);

	console.log(api)

	return api;
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