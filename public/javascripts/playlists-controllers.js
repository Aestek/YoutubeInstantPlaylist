function PlaylistsCtrl($scope, api, auth) {
	auth.ensureRouteAuthentication();

	$scope.playlists = [];

	api.me.playlists.get(function(data) {
		$scope.playlists = data;
	});
}