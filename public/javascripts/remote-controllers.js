function MainCtrl($scope, socket, videoStore) {
	$scope.currentVideoId = '';
	$scope.currentVideo = false;
	$scope.searchResults = -1;

	$scope.search = function(s) {
		videoStore.search(s, function(result) {
			$scope.searchResults = result.items || false;
		});
	};

	$scope.addVideo = function(v) {
		socket.emit('addVideo', v.id);
	};

	socket.emit('init', 'azerty', function(id) {
		$scope.currentVideoId = id;
	});

	socket.on('currentVideo', function(id) {
		$scope.currentVideoId = id;
	});

	$scope.$watch('currentVideoId', function() {
		if ($scope.currentVideoId)
			videoStore.get($scope.currentVideoId, function(v) {
				$scope.currentVideo = v;
			});
		else
			$scope.currentVideo = false;
	});
}