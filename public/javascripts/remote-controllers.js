function MainCtrl($scope, socket, videoStore) {
	$scope.user = sessionUser;
	$scope.startModalVisible = !sessionUser.displayName;
	$scope.currentVideoId = '';
	$scope.currentVideo = false;
	$scope.searchResults = -1;
	$scope.roomId = document.location.href.match(/\?k=([\w-]+)(#.*)?$/)[1];

	function initSocket() {
		socket.emit('init', {
			key: $scope.roomId,
			type: 'remote',
			user: $scope.user
		}, function(id) {
			$scope.currentVideoId = id;
		});
	}

	if ($scope.user.displayName)
		initSocket();

	$scope.search = function(s) {
		videoStore.search(s, function(result) {
			$scope.searchResults = result.items || false;
		});
	};

	$scope.addVideo = function(v) {
		if (confirm('Do you want to add this video to the playlist ?'))
		socket.emit('addVideo', v);
	};

	$scope.submitUser = function() {
		if ($scope.userName) {
			$scope.user.displayName = $scope.userName;
			$scope.startModalVisible = false;
			initSocket();
		}
	};

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