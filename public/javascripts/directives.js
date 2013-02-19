
// directive wrapper for the tinyscrollbar jQuery plugin

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


// directive wrapper for YoutubePlayer

// player event callback must be accessible from the global scope
var onYouTubePlayerReady;
var onYouTubePlayerStateChange;
app.directive('youtubePlayer', function() {
	return {
    	restrict: 'A',
     	replace: false,
    	scope: {
      		video: '=',
     		currentTime: '=',
     		playerState: '='
     	},
     	controller: function($scope, $element, guid) {
     		var $el = $($element);

     		// swfobject requires an id to append the object in the element
			var container = 'player' + guid.get();
			$el.attr('id', container);

			// YoutubePlayer requires a video id to load
		    var att = { 
		    	data: 'http://www.youtube.com/v/K-aERDSzU10?enablejsapi=1&playerapiid=' + container,
		    	width: '100%', 
		    	height: '100%' 
		    };
		    var par = { 
		    	allowScriptAccess: 'always', 
		    	wmode: 'transparent' 
		    };

		    function switchPlayerVisibility(v) {
		    	var vis = v ? 'visible' : 'hidden';
		    	$(document.getElementById(container)).css('visibility', vis);
		    }

		    onYouTubePlayerReady = function(id) {
		    	switchPlayerVisibility(false);

		    	setInterval(function() {
		    		$scope.$apply(function() {
		    			$scope.currentTime = player.getCurrentTime();
		    		});
		    	}, 500);

		    	onYouTubePlayerStateChange = function(state) {
		    		$scope.playerState = state;
		    	};

		    	player.addEventListener('onStateChange', 'onYouTubePlayerStateChange');

			    $scope.$watch('video', function() {
			    	if ($scope.video.id) {
			    		switchPlayerVisibility(true);
			    		player.loadVideoById($scope.video.id);
			    	}
			    	else {
			    		switchPlayerVisibility(false);
			    		player.pauseVideo();
			    	}
			    });
			};

			player = swfobject.createSWF(att, par, container);
     	}
    };
});	


// directive allowing to display a progressbar in the background of an element with css gradients

app.directive('backgroundProgressbar', function() {
	return {
    	restrict: 'A',
     	replace: false,
    	scope: true,
     	controller: function($scope, $element, $attrs) {
     		var $el = $($element);

     		$scope.$watch($attrs.progress, function(p) {
     			$el.css(
     				'background', 
     				'-webkit-gradient(linear, left top, right top, color-stop(0%,' + $attrs.fgcolor +  '), color-stop(' + p + '%,' + $attrs.fgcolor +  '), color-stop(' + (p + 0.1) + '%,' + $attrs.bgcolor +  '), color-stop(100%,' + $attrs.bgcolor +  '))'
     			);
     		});
    	}
    };
});

// directive displaying a bacground-image in an element, avoiding non-angular-parsed url loading

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

// directive wrapper for the qrCode jQuery plugin

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