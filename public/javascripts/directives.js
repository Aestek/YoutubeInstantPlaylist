
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
		    	data: 'http://www.youtube.com/v/K-aERDSzU10?enablejsapi=1&autohide=1&color=white&controls=2&modestbranding=0&rel=0&playerapiid=' + container,
		    	width: '100%', 
		    	height: '100%' 
		    };
		    var par = { 
		    	allowScriptAccess: 'always', 
		    	wmode: 'transparent',
		    	allowfullscreen: true
		    };

		    function switchPlayerVisibility(v) {
		    	var e = $(document.getElementById(container)).parent();
		    	if (v)
		    		e.removeClass('hidden');
		    	else
		    		e.addClass('hidden');
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

app.directive('particular', function() {
	return function(scope, element, attrs) {
		$el = $(element);

		function setSize() {
			elX = $el.innerWidth();
			elY = $el.innerHeight();

			$canvas.css({
				height: elY,
				width: elX
			})
		}

		elX = $el.innerWidth();
		elY = $el.innerHeight();

		var $canvas = $('<canvas height="' + elY + '" width="' + elX + '" />').prependTo($el);
		setSize();
		$(window).resize(function() {
			setSize();
		});

		 var defaultsSettings = {
	        shape: 'square',
	        velocity: new Vector({y: -3}),
	        xVariance: elX / 2,
	        yVariance: 0,
	        spawnSpeed: 1,
	        generations: 1,
	        maxParticles: 200,
	        size: 30,
	        sizeVariance: 30,
	        life: 300,
	        lifeVariance: 10,    
	        direction: 0,
	        directionVariance: 15,
	        color: '#1B9EE0',
	        opacity: 0.9,
	        onDraw: function(p) {
	          var y = -this.age * 3;
	          p.size *= 0.999;
	          p.opacity = 0.6 - (p.age / p.life * 0.5);
	        },
            position: new Vector({
                x: elX / 2,
                y: elY
            })
        };

        var currentSettings = $.extend({}, defaultsSettings);

		var canvas = $canvas.get(0);
	    particles = new ParticleCanvas(canvas, {
            x: elX / 2,
            y: elY / 2
        });
	    particles.start();
	    particles.update(currentSettings);

   		attrs.$observe('particular', function(modifiers) {
   			modifiers = scope.$eval(modifiers);
		   
		   	for (var i in modifiers) {
		   		(function(exp) {
		   			var currentValParams;
		   			var inited = false;
		   			scope.$watch(exp, function(expValue, oldExpValue) {
		   				if (inited) {
			   				if (modifiers[exp].type == 'change') {
					   			particles.update($.extend(currentSettings, currentSettings, modifiers[exp].vals));

					   			setTimeout(function() {
					   				particles.update(defaultsSettings);
					   				currentSettings = $.extend({}, defaultsSettings);
					   			}, 1000);
					   		}
					   		else {
					   			var val = modifiers[exp].vals[expValue] || modifiers[exp].vals.default;
					   			if (!angular.equals(val, currentValParams)) {
						   			$.extend(defaultsSettings, defaultsSettings, val);
						   			particles.update($.extend(currentSettings, currentSettings, val));
						   			currentValParams = val;
						   		}
					   		}
					   	}
					   	else
					   		inited = true;
			   		
		   			}, true);
		   		})(i);
		   	}
		});

	};
});


app.directive('bsTypeahead', ['$parse', function($parse) {
	'use strict';

	return {
		restrict: 'A',
		require: '?ngModel',
		link: function postLink(scope, element, attrs, controller) {

			var getter = $parse(attrs.bsTypeahead),
					setter = getter.assign,
					value = getter(scope),
					updater = $parse(attrs.bsTypeaheadUpdater)(scope);

			// Watch bsTypeahead for changes
			scope.$watch(attrs.bsTypeahead, function(newValue, oldValue) {
				if(newValue !== oldValue) {
					value = newValue;
				}
			});

			element.attr('data-provide', 'typeahead');
			element.typeahead({
				source: function(query) { return angular.isFunction(value) ? value.apply(null, arguments) : value; },
				minLength: attrs.minLength || 1,
				items: attrs.items,
				updater: function(value) {
					// If we have a controller (i.e. ngModelController) then wire it up
					if(controller) {
						scope.$apply(function () {
							controller.$setViewValue(value);
							updater.apply(null, [value]);
						});
					}
					if (updater)
						
					return value;
				}
			});

			// Bootstrap override
			var typeahead = element.data('typeahead');
			// Fixes #2043: allows minLength of zero to enable show all for typeahead
			typeahead.lookup = function (ev) {
				var items;
				this.query = this.$element.val() || '';
				if (this.query.length < this.options.minLength) {
					return this.shown ? this.hide() : this;
				}
				items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
				return items ? this.process(items) : this;
			};

			// Support 0-minLength
			if(attrs.minLength === "0") {
				setTimeout(function() { // Push to the event loop to make sure element.typeahead is defined (breaks tests otherwise)
					element.on('focus', function() {
						setTimeout(element.typeahead.bind(element, 'lookup'), 200);
					});
				});
			}

		}
	};

}]);