var app = angular.module('app', ['ui', '$strap.directives']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/home', {templateUrl: 'partials/home', controller: HomeCtrl}).
		when('/playlists', {templateUrl: 'partials/playlists', controller: PlaylistsCtrl}).
		when('/login', {templateUrl: 'partials/login', controller: LoginCtrl}).
		otherwise({redirectTo: '/playlist'});
}]);