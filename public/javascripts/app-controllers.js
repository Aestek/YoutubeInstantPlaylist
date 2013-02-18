function MainCtrl($scope, videoStore, socket) {
	$scope.playlist = [];
	$scope.currentPosition = -1;
	$scope.currentVideo = {};
	$scope.currentVideoProgress = 0;
	$scope.currentTime = 0;
	$scope.playerState = -1;
	$scope.roomId = 'azerty';

	$scope.addVideo = function(v) {
		if (($scope.playlist[$scope.playlist.length -1] || {}).id != v.id) {
			var i = $scope.playlist.push(v) - 1;
			if ($scope.playlist.length == 1)
				$scope.setIndex(0);
			return i;
		}
	};

	$scope.setIndex = function(i) {
		if (i < $scope.playlist.length && i >= 0)
			$scope.currentPosition = i;
	};

	$scope.removeAt = function(i) {
		var a = [];
		for (var j in $scope.playlist) 
			if (i != j)
				a.push($scope.playlist[j]);
		$scope.playlist = a;
		
		var pLength = $scope.playlist.length;

		if (pLength == 0)
			$scope.currentPosition = -1;
		else if (i > pLength -1)
			$scope.currentPosition = pLength - 1;
		else if (i < $scope.currentPosition)
			$scope.currentPosition--;
	};

	$scope.removeAll = function() {
		$scope.playlist = [];
		$scope.currentPosition = -1;
		$scope.currentVideoProgress = 0;
	};

	socket.emit('init', $scope.roomId, function() {
		console.log('Socket inited');
	});

	socket.on('addVideo', function(id) {
		videoStore.get(id, function(video) {
			$scope.addVideo(video);
		});
	});

	$scope.$watch('currentPosition', function() {
		$scope.currentVideo = $scope.playlist[$scope.currentPosition] || {};

		socket.emit('currentVideo', $scope.currentVideo.id);

		if (!$scope.currentVideo.relatedVideos && $scope.currentVideo.id)
			videoStore.get($scope.currentVideo.id, function(v) {
				$scope.currentVideo = v;
			});

	});

	$scope.$watch('playerState', function() {
		if ($scope.playerState == 0 && $scope.currentPosition < $scope.playlist.length -1)
			$scope.currentPosition++;
	});

	$scope.$watch('currentTime', function() {
		$scope.currentVideoProgress = $scope.currentTime / $scope.currentVideo.duration * 100;
	});
}

function SearchCtrl($scope, videoStore) {
	$scope.searchResults = -1;

	$scope.search = function(q) {
		videoStore.search(q, function(result) {
			$scope.searchResults = result.items || [];
		});
	};
}

function PlayerCtrl($scope) {
	
}

function PlaylistCtrl($scope) {
	$scope.totalDuration = 0;
	$scope.playedDuration = 0;
	$scope.playlistProgress = 0;

	$scope.$watch('currentPosition', function() {
		var c = 0;
		for (var i in $scope.playlist) {
			if (i < $scope.currentPosition)
				c += $scope.playlist[i].duration;
			else
				break;
		}

		$scope.playedDuration = c;
	});

	$scope.$watch('playlist', function() {
		var t = 0;
		for (var i in $scope.playlist)
			t += $scope.playlist[i].duration;
		$scope.totalDuration = t;
	}, true);

	$scope.$watch('currentTime', function() {
		if ($scope.totalDuration > 0)
			$scope.playlistProgress = ($scope.playedDuration + $scope.currentTime) / $scope.totalDuration * 100;
		else
			$scope.playlistProgress = 0;
	});
}