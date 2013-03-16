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
		playerState: 5,
		volume: 80,
		mute: false
	};

	// methods

	$scope.addVideo = function(v, user) {
		var i = $scope.playlist.items.push({
			video: v,
			addedBy: user,
			date: new Date().toString()
		}) - 1;
		if (i == 0)
			$scope.setIndex(0);
		console.log(new Date().getTime());
		return i;
	};

	$scope.setIndex = function(i) {
		if (i < $scope.playlist.items.length && i >= 0)
			$scope.playback.position = i;
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

	$scope.$watch('playback.position', function(val) {
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
		var duration = 0;
		var currentDuration = 0;
		for (var i in $scope.playlist.items) {
			if ($scope.playlist.items[i].playing) {
				$scope.setIndex(parseInt(i));
				found = true;
			}
			if (!found)
				currentDuration += $scope.playlist.items[i].video.duration;
			duration += $scope.playlist.items[i].video.duration;
		}
		if (!found)
			$scope.setIndex();

		$scope.playlist.totalTime = duration;
		$scope.playback.elapsedTime = currentDuration;
	}, true);
}

function PlayerControlsCtrl($scope) {
	$scope.togglePlay = function() {
		if ($scope.playback.currentVideo.id)
			$scope.playback.playerState = $scope.playback.playerState == 1 ? 2 : 1;
	};

	$scope.next = function() {
		$scope.setIndex($scope.playback.position + 1);
	};

	$scope.previous = function() {
		$scope.setIndex($scope.playback.position - 1);
	};

	$scope.$watch('playback.volume', function() {
		$scope.playback.mute = false;
	});
}

function UserCtrl($scope) {
	$scope.user = sessionUser;
}