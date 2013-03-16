function SearchCtrl($scope, videoStore) {

	// properties
	$scope.searchResults = -1;


	// methods
	$scope.search = function(q) {
		videoStore.search(q, function(result) {
			$scope.searchResults = result.items || [];
		});
	};

	$scope.findAutocomplete = function(q, cb) {
		videoStore.searchAutocomplete(q, function(result) {
			cb(result);
		});
	};
}

function RemoteCtrl($scope, socket, guid, videoStore) {

	// properties
	$scope.roomId = guid.get();
	$scope.socketConnected = false;
	$scope.appDomain = window.location.host;
	$scope.connectedRemotes = [];
	$scope.active = true;

	// socket
	socket.emit('init', {
		key: $scope.roomId, 
		type: 'player'
	}, function() {
		$scope.socketConnected = true;
	});

	socket.on('addVideo', function(o) {
		$scope.addVideo(o.video, o.addedBy);
	});

	socket.on('remotes', function(remotes) {
		$scope.connectedRemotes = remotes;
	});

	socket.on('changePosition', function(i) {
		$scope.setIndex($scope.playlist.position + i);
	});

	// watchers
	$scope.$watch('currentPosition', function() {
		socket.emit('currentVideo', $scope.playlist.currentVideo);
	});
}

function PlaylistCtrl($scope) {

	/*// watchers

	$scope.$watch('currentPosition', function() {
		console.log('currentPosition playlist', $scope.playlist.position)
		var c = 0;
		for (var i in $scope.playlist) {
			if (i < $scope.playlist.position)
				c += $scope.playlist[i].video.duration;
			else
				break;
		}

		$scope.playedDuration = c;
	});

	$scope.$watch('playlist', function() {
		var t = 0;
		var found = false;
		for (var i in $scope.playlist) {
			t += $scope.playlist[i].video.duration;
		}
		$scope.totalDuration = t;

	}, true);

	$scope.$watch('currentTime + " " + playerState', function() {
		if ($scope.totalDuration > 0)
			$scope.playlistProgress = ($scope.playedDuration + $scope.currentTime) / $scope.totalDuration * 100;
		else
			$scope.playlistProgress = 0;
	});*/
}

function VideoInfosCtrl($scope, videoStore) {
	$scope.uploaderVideos = [];
	$scope.$watch('playback.currentVideo', function(val) {
		if (val.id) 
			videoStore.uploaderVideos(val.uploader, function(data) {
				$scope.uploaderVideos = data;
			});
	});
}
