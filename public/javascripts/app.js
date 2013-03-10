var app = angular.module('app', ['ui']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/playlist', {templateUrl: 'partials/playlist-editor',   controller: PlaylistCtrl}).
		when('/playlists', {templateUrl: 'partials/playlists',   controller: PlaylistsCtrl}).
		otherwise({redirectTo: '/playlist'});
}]);