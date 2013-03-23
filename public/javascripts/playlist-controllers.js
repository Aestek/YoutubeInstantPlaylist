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

function PlaylistCtrl($scope, $http) {
	$scope.savePlaylist = function() {
		$http.post('/api/playlist/', {
			playlist: $scope.playlist
		});
	};
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
