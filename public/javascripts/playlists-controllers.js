function PlaylistsCtrl($scope, api) {
	$scope.playlists = [];

	api.me.playlists.get(function(data) {
		$scope.playlists = data;
	});
}