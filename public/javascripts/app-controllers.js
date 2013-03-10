function MainCtrl($scope, videoStore) {

	// properties

	$scope.playlist = {
		items : [],
		totalTime : 0
	};

	$scope.playback = {
		position: -1,
		currentVideo: {},
		elapsedTime: 0,
		currentElapsedTime: 0,
		playing: false,
		playerState: -1,
		volume: 80
	};

	// methods

	$scope.addVideo = function(v, user) {
		var i = $scope.playlist.items.push({
			video: v,
			addedBy: user
		}) - 1;
		if (i == 0)
			$scope.setIndex(0);

		return i;
	};

	$scope.setIndex = function(i) {
		if (i < $scope.playlist.items.length && i >= 0) {
			$scope.playback.position = i;
		}
		else
			$scope.playback.position = -1;
	};

	$scope.removeAt = function(i) {
		var a = [];
		for (var j in $scope.playlist.items) 
			if (i != j)
				a.push($scope.playlist.items[j]);
		$scope.playlist.items = a;
		
		var pLength = $scope.playlist.items.length;

		if (pLength == 0)
			$scope.setIndex(-1);
		else if (i > pLength -1)
			$scope.setIndex(pLength - 1);
		else if (i < $scope.playback.position)
			$scope.setIndex($scope.playback.position - 1);
	};

	$scope.removeAll = function() {
		$scope.playlist.items = [];
		$scope.playback.position = -1;
	};

	// watcher

	$scope.$watch('playback.position', function() {

		$scope.playback.currentVideo = ($scope.playlist.items[$scope.playback.position] || {}).video || {};

		if (!$scope.playback.currentVideo.relatedVideos && $scope.playback.currentVideo.id)
			videoStore.get($scope.playback.currentVideo.id, function(v) {
				$scope.playback.currentVideo = v;
			});

		for (var j in $scope.playlist.items)
			$scope.playlist.items[j].playing = false;

		if ($scope.playlist.items[$scope.playback.position])
			$scope.playlist.items[$scope.playback.position].playing = true;
	});

	$scope.$watch('playback.playerState', function() {
		if ($scope.playback.playerState == 0)
			$scope.setIndex($scope.playback.position + 1);
	});


	$scope.$watch('playlist', function() {
		var found = false;
		for (var i in $scope.playlist.items) {
			if ($scope.playlist.items[i].playing) {
				$scope.setIndex(parseInt(i));
				found = true;
			}
		}

		if (!found)
			$scope.playback.position = $scope.setIndex(-1);
	}, true);
}

