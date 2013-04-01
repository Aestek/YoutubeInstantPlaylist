

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



function VideoInfosCtrl($scope, api) {
	$scope.uploaderVideos = [];
	$scope.$watch('playback.currentVideo', function(val) {
		if (val.id) 
			api.videos.fromUploader.get({name: val.uploader}, function(data) {
				$scope.uploaderVideos = data;
			});
	});
}
