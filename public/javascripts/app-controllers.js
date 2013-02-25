function MainCtrl($scope, videoStore) {

	// properties

	$scope.playlist = [];
	$scope.currentPosition = -1;
	$scope.currentVideo = {};
	$scope.currentVideoProgress = 0;
	$scope.currentTime = 0;
	$scope.playerState = -1;

	$scope.particularModifiers = {
		playlist: {
			type: 'change',
			vals: {
				color: "#DE3A3A",
				directionVariance: 50,
				position: {
					x: $(window).innerWidth() / 2,
					y: $(window).innerHeight() / 2
				},
				xVariance: 0,
				directionVariance : 1000,
				velocity: -10
			}
		}, 
		playerState: {
			type: 'val',
			vals: {
				1 : {
					color: '#6FB827',
				},
				default: {
					color: '#1B9EE0',
				}
			}
		}
	};

	// methods

	$scope.addVideo = function(v) {
		if (($scope.playlist[$scope.playlist.length -1] || {}).id != v.id) {
			var i = $scope.playlist.push(v) - 1;
			if (i == 0)
				$scope.setIndex(0);
			return i;
		}
	};

	$scope.setIndex = function(i) {
		if (i < $scope.playlist.length && i >= 0) {
			$scope.currentPosition = i;

			for (var j in $scope.playlist)
				$scope.playlist[j].playing = false;

			$scope.playlist[i].playing = true;
		}
	};

	$scope.removeAt = function(i) {
		var a = [];
		for (var j in $scope.playlist) 
			if (i != j)
				a.push($scope.playlist[j]);
		$scope.playlist = a;
		
		var pLength = $scope.playlist.length;

		if (pLength == 0)
			$scope.setIndex(-1);
		else if (i > pLength -1)
			$scope.setIndex(pLength - 1);
		else if (i < $scope.currentPosition)
			$scope.setIndex($scope.currentPosition - 1);
	};

	$scope.removeAll = function() {
		$scope.playlist = [];
		$scope.currentPosition = -1;
		$scope.currentVideoProgress = 0;
	};

	// watcher

	$scope.$watch('currentPosition', function() {
		$scope.currentVideo = $scope.playlist[$scope.currentPosition] || {};

		if (!$scope.currentVideo.relatedVideos && $scope.currentVideo.id)
			videoStore.get($scope.currentVideo.id, function(v) {
				$scope.currentVideo = v;
			});

		console.log($scope.currentVideo.id)

	});

	$scope.$watch('playerState', function() {
		if ($scope.playerState == 0 && $scope.currentPosition < $scope.playlist.length -1)
			$scope.setIndex($scope.currentPosition + 1);
	});

	$scope.$watch('currentTime', function() {
		$scope.currentVideoProgress = $scope.currentTime / $scope.currentVideo.duration * 100;
	});
}

function SearchCtrl($scope, videoStore) {

	// properties

	$scope.searchResults = -1;


	// methods

	$scope.search = function(q) {
		videoStore.search(q, function(result) {
			$scope.searchResults = result.items || [];
		});
	};
}

function RemoteCtrl($scope, socket, guid, videoStore) {

	// properties

	$scope.roomId = guid.get();
	$scope.socketConnected = false;
	$scope.appDomain = window.location.host;

	// socket

	socket.emit('init', $scope.roomId, function() {
		$scope.socketConnected = true;
	});

	socket.on('addVideo', function(id) {
		videoStore.get(id, function(video) {
			$scope.addVideo(video);
		});
	});

	// watchers

	$scope.$watch('currentPosition', function() {
		socket.emit('currentVideo', $scope.currentVideo.id);
	});
}

function PlaylistCtrl($scope) {

	// properties

	$scope.totalDuration = 0;
	$scope.playedDuration = 0;
	$scope.playlistProgress = 0;

	// watchers

	$scope.$watch('currentPosition', function() {
		var c = 0;
		for (var i in $scope.playlist) {
			if (i < $scope.currentPosition)
				c += $scope.playlist[i].duration;
			else
				break;
		}
		console.log($scope.currentPosition)
		$scope.playedDuration = c;
	});

	$scope.$watch('playlist', function() {
		var t = 0;
		var found = false;
		for (var i in $scope.playlist) {
			t += $scope.playlist[i].duration;

			if ($scope.playlist[i].playing) {
				$scope.currentPosition = parseInt(i);
				found = true;
			}
		}

		if (!found)
			$scope.currentPosition = -1;

		$scope.totalDuration = t;

	}, true);

	$scope.$watch('currentTime + " " + playerState', function() {
		if ($scope.totalDuration > 0)
			$scope.playlistProgress = ($scope.playedDuration + $scope.currentTime) / $scope.totalDuration * 100;
		else
			$scope.playlistProgress = 0;
	});
}