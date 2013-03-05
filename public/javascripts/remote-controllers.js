function MainCtrl($scope, socket, videoStore) {
	$scope.status = 'init';
	$scope.user = sessionUser || {};
	$scope.currentVideo;
	$scope.searchResults = -1;
	$scope.roomId = document.location.href.match(/\?k=([\w-]+)(#.*)?$/)[1];

	
	socket.emit('init', {
		key: $scope.roomId,
		type: 'remote'
	}, function(response) {
		if (response.accepted)
			$scope.status = $scope.user.displayName ? $scope.submitUser() : 'loggin';
		else
			$scope.status = 'disconnected';
	});

	$scope.search = function(s) {
		videoStore.search(s, function(result) {
			$scope.searchResults = result.items || false;
		});
	};

	$scope.findAutocomplete = function(q, cb) {
		videoStore.searchAutocomplete(q, function(result) {
			cb(result);
		});
	};

	$scope.addVideo = function(v) {
		socket.emit('addVideo', v);
	};

	$scope.changePosition = function(i) {
		socket.emit('changePosition', i);
	};

	$scope.submitUser = function() {
		socket.emit('loggin', $scope.user, function(video) {
			$scope.status = 'connected';
			$scope.currentVideo = video;
		});
	};

	socket.on('currentVideo', function(v) {
		$scope.currentVideo = v;
	});

	socket.on('end', function() {
		$scope.status = 'disconnected';
	});
}