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

	$scope.addVideo = function(v, user) {
		if ((($scope.playlist[$scope.playlist.length -1] || {}).video || {}).id != v.id) {
			var i = $scope.playlist.push({
				video: v,
				addedBy: user
			}) - 1;
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
		$scope.currentVideo = ($scope.playlist[$scope.currentPosition] || {}).video || {};
		$scope.currentAddedBy = ($scope.playlist[$scope.currentPosition] || {}).addedBy;

		if (!$scope.currentVideo.relatedVideos && $scope.currentVideo.id)
			videoStore.get($scope.currentVideo.id, function(v) {
				$scope.currentVideo = v;
			});
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
		console.log('sss')
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

	$scope.roomId = 'aaa' //guid.get();
	$scope.socketConnected = false;
	$scope.appDomain = window.location.host;
	$scope.connectedRemotes = [];

	// socket

	socket.emit('init', {
		key: $scope.roomId, 
		type: 'player'
	}, function() {
		$scope.socketConnected = true;
	});

	socket.on('addVideo', function(o) {
		$scope.addVideo(o.video, o.addedBy);
		console.log(o.addedBy);
	});

	socket.on('remotes', function(remotes) {
		console.log(remotes)
		$scope.connectedRemotes = remotes;
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