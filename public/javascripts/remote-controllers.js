function MainCtrl($scope, socket, videoStore) {
	$scope.active = false;
	$scope.user = sessionUser;
	$scope.startModalVisible = !sessionUser.displayName;
	$scope.currentVideo;
	$scope.searchResults = -1;
	$scope.roomId = document.location.href.match(/\?k=([\w-]+)(#.*)?$/)[1];

	function initSocket() {
		socket.emit('init', {
			key: $scope.roomId,
			type: 'remote',
			user: $scope.user
		}, function(response) {
			console.log(response)
			if (response.accepted) {
				$scope.currentVideoId = id;
				$scope.active = true;
			}
			else
				alert('disconnected')
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

	socket.on('currentVideo', function(v) {
		$scope.currentVideo = v;
	});

	socket.on('end', function() {
		$scope.active = false;
		alert('disconnected')
	});
}