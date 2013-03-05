function MainCtrl($scope, videoStore) {

	// properties

	$scope.playlist = [];
	$scope.currentPosition = -1;
	$scope.currentVideo = {};
	$scope.currentVideoProgress = 0;
	$scope.currentTime = 0;
	$scope.playerState = -1;
	$scope.scrollPlaylistTo = function() {};

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
			$scope.scrollPlaylistTo('bottom');

			return i;
		}
	};

	$scope.setIndex = function(i) {
		console.log('Setting index', i)
		if (i < $scope.playlist.length && i >= 0) {
			$scope.currentPosition = i;
		}
		else
			$scope.currentPosition = -1;
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

		console.log('currentPosition', $scope.currentPosition)

		$scope.currentVideo = ($scope.playlist[$scope.currentPosition] || {}).video || {};
		$scope.currentAddedBy = ($scope.playlist[$scope.currentPosition] || {}).addedBy;

		if (!$scope.currentVideo.relatedVideos && $scope.currentVideo.id)
			videoStore.get($scope.currentVideo.id, function(v) {
				$scope.currentVideo = v;
			});

		for (var j in $scope.playlist)
			$scope.playlist[j].playing = false;

		if ($scope.playlist[$scope.currentPosition])
			$scope.playlist[$scope.currentPosition].playing = true;
	});

	$scope.$watch('playerState', function() {
		if ($scope.playerState == 0)
			$scope.setIndex($scope.currentPosition + 1);

		console.log('playerState', $scope.playerState)
	});

	$scope.$watch('currentTime', function() {
		$scope.currentVideoProgress = $scope.currentTime / $scope.currentVideo.duration * 100;
	});

	$scope.$watch('playlist', function() {
		var found = false;
		for (var i in $scope.playlist) {
			if ($scope.playlist[i].playing) {
				$scope.setIndex(parseInt(i));
				found = true;
			}
		}

		if (!found)
			$scope.currentPosition = $scope.setIndex(-1);
	}, true);
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
	});

	socket.on('remotes', function(remotes) {
		$scope.connectedRemotes = remotes;
	});

	socket.on('changePosition', function(i) {
		$scope.setIndex($scope.currentPosition + i);
	});

	// watchers

	$scope.$watch('currentPosition', function() {
		socket.emit('currentVideo', $scope.currentVideo);
	});
}

function PlaylistCtrl($scope) {

	// properties

	$scope.totalDuration = 0;
	$scope.playedDuration = 0;
	$scope.playlistProgress = 0;

	// watchers

	$scope.$watch('currentPosition', function() {
		console.log('currentPosition playlist', $scope.currentPosition)
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
			t += $scope.playlist[i].video.duration;
		}
		$scope.totalDuration = t;

	}, true);

	$scope.$watch('currentTime + " " + playerState', function() {
		if ($scope.totalDuration > 0)
			$scope.playlistProgress = ($scope.playedDuration + $scope.currentTime) / $scope.totalDuration * 100;
		else
			$scope.playlistProgress = 0;
	});
}