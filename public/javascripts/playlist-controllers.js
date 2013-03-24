function SearchCtrl($scope, api) {

	// properties
	$scope.searchResults = -1;


	// methods
	$scope.search = function(q) {
		api.videos.search.get({q: q}, function(result) {
			$scope.searchResults = result.items || [];
		});
	};

	$scope.findAutocomplete = function(q, cb) {
		api.videos.search.suggest.get({q: q}, function(result) {
			cb(result);
		});
	};
}

function RemoteCtrl($scope, socket, guid) {

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

function PlaylistCtrl($scope, api) {
	$scope.savePlaylist = function() {
		if ($scope.playlist._id)
			api.playlists.put({id: $scope.playlist._id, playlist: $scope.playlist});
		else
			api.playlists.post({playlist: $scope.playlist});
	};
}

function VideoInfosCtrl($scope, api) {
	$scope.uploaderVideos = [];
	$scope.$watch('playback.currentVideo', function(val) {
		if (val.id) 
			api.videos.fromUploader.get({name: val.uploader}, function(data) {
				$scope.uploaderVideos = data;
			});
	});
}
