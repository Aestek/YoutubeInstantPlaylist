function LoginCtrl($scope, auth, $location, $routeParams) {

	if (auth.userState.authenticated)
		$location.path('/');
	
	$scope.authRequiered = !!$routeParams.required;

	$scope.facebookLogin = function() {
		auth.login('facebook', function() {
			window.history.back();
		});
	};
}