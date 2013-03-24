function PlaylistsCtrl($scope, api) {
	$scope.playlists = [];

	api.user.playlists.get(function(data) {
		$scope.playlists = data;
	});
}