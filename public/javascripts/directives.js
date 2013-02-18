app.directive('scrollable', function() {
	return function(scope, element, attrs) {
		var $el = $(element);

		$el.tinyscrollbar({
			axis: attrs.scrollable
		});


		if (attrs.scrollBind) {
			scope.$watch(attrs.scrollBind, function() {
				setTimeout(function() {
					$el.tinyscrollbar_update('relative');
				}, 50);
			}, true);
		}
	}
});

var onYouTubePlayerReady;
var onYouTubePlayerStateChange;
app.directive('youtubePlayer', function() {
	return {
    	restrict: 'A',
     	replace: false,
    	scope: {
      		video: '=',
     		playing : '=',
     		currentTime: '=',
     		playerState: '='
     	},
     	controller: function($scope, $element) {
     		var $el = $($element);

			function makeid() {
			    var text = "";
			    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			    for( var i=0; i < 5; i++ )
			        text += possible.charAt(Math.floor(Math.random() * possible.length));

			    return text;
			}

			var container = 'player' + makeid();
			$el.attr('id', container);
		    var url = 'http://www.youtube.com/v/K-aERDSzU10?enablejsapi=1&playerapiid=' + container + '';
		    var att = { data: url, width: "100%", height: "100%" };
		    var par = { allowScriptAccess: "always", 'wmode': 'transparent' };
		    player = swfobject.createSWF(att, par, container);

		    onYouTubePlayerReady = function(id) {
		    	player.mute();

		    	$('#' + container).css('visibility', 'hidden');

		    	var currentTiemInterval = setInterval(function() {
		    		$scope.$apply(function() {
		    			$scope.currentTime = player.getCurrentTime();
		    		});
		    	}, 250);

		    	onYouTubePlayerStateChange = function(state) {
		    		$scope.playerState = state;
		    		$scope.playing = state === 1;
		    	};

		    	player.addEventListener('onStateChange', 'onYouTubePlayerStateChange');

			    $scope.$watch('video', function() {
			    	if ($scope.video.id) {
			    		$('#' + container).css('visibility', 'visible');
			    		player.loadVideoById($scope.video.id);
			    	}
			    	else {
			    		$('#' + container).css('visibility', 'hidden');
			    		player.pauseVideo();
			    	}
			    });
			}
     	}

    };
});	


app.directive('backgroundProgressbar', function() {
	return {
    	restrict: 'A',
     	replace: false,
    	scope: true,
     	controller: function($scope, $element, $attrs) {
     		var $el = $($element);

     		$scope.$watch($attrs.progress, function(p) {
     			//console.log('-webkit-gradient(linear, left top, right top, color-stop(0%,' + $scope.fgcolor +  '), color-stop(' + intval(progress) + '%,' + $scope.fgcolor +  '), color-stop(' + (intval(progress) + 0.1) + '%,' + $scope.bgcolor +  '), color-stop(100%,' + $scope.bgcolor +  '))');
     			$el.css(
     				'background', 
     				'-webkit-gradient(linear, left top, right top, color-stop(0%,' + $attrs.fgcolor +  '), color-stop(' + p + '%,' + $attrs.fgcolor +  '), color-stop(' + (p + 0.1) + '%,' + $attrs.bgcolor +  '), color-stop(100%,' + $attrs.bgcolor +  '))'
     			);
     		});
    	}
    };
});

app.directive('backImg', function() {
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            element.css({
                'background-image': 'url(' + value +')',
                'background-size' : 'cover'
            });
        });
    };
});

app.directive('qrCode', function() {
	return function(scope, element, attrs) {
		var $el = $(element);
		attrs.$observe('qrCode', function(val) {
			if (val)
				$el.qrcode({
					text: val,
					width: attrs.width,
					height: attrs.height,
					background: attrs.bgcolor,
					foreground: attrs.fgcolor
				});
		});
	};
});