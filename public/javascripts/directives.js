
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
					$el.tinyscrollbar_update(attrs.defaultUpdate);
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
     		playerState: '=',
     		volume: '=',
     		mute: '='
     	},
     	controller: function($scope, $element, guid) {
     		var $el = $($element);

     		// swfobject requires an id to append the object in the element
			var container = 'player' + guid.get();
			$el.attr('id', container);

			// YoutubePlayer requires a video id to load
		    var att = { 
		    	data: 'http://www.youtube.com/v/K-aERDSzU10?enablejsapi=1&controls=0&modestbranding=0&rel=0&playerapiid=' + container,
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
			    		player.stopVideo();
			    		player.clearVideo();
			    	}
			    });

			    $scope.$watch('volume', function(val) {
			    	player.setVolume(val);
			    });

			    $scope.$watch('playerState', function(val) {
			    	if (val == 1)
			    		player.playVideo();
			    	else if (val == 2)
			    		player.pauseVideo();
			    });

			    $scope.$watch('mute', function(val) {
			    	if (val)
			    		player.mute();
			    	else
			    		player.unMute();
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


app.directive('bsModal', ['$parse', '$compile', '$http', '$timeout', '$q', '$templateCache', function($parse, $compile, $http, $timeout, $q, $templateCache) {
	'use strict';

	return {
		restrict: 'A',
		scope: true,
		link: function postLink(scope, element, attr, ctrl) {

			var getter = $parse(attr.bsModal),
				setter = getter.assign,
				value = getter(scope);

			$q.when($templateCache.get(value) || $http.get(value, {cache: true})).then(function onSuccess(template) {

				// Handle response from $http promise
				if(angular.isObject(template)) {
					template = template.data;
				}

				// Build modal object
				var id = getter(scope).replace('.html', '').replace(/\//g, '-').replace(/\./g, '-') + '-' + scope.$id;
				var $modal = $('<div class="modal hide" tabindex="-1"></div>')
					.attr('id', id)
					.attr('data-backdrop', attr.backdrop || true)
					.attr('data-keyboard', attr.keyboard || true)
					.addClass(attr.modalClass ? 'fade ' + attr.modalClass : 'fade')
					.html(template);

				$('body').append($modal);

				// Configure element
				element.attr('href', '#' + id).attr('data-toggle', 'modal');

				// Compile modal content
				$timeout(function(){
					$compile($modal)(scope);
				});

				// Provide scope display functions
				scope._modal = function(name) {
					$modal.modal(name);
				};
				scope.hide = function() {
					$modal.modal('hide');
				};
				scope.show = function() {
					$modal.modal('show');
				};
				scope.dismiss = scope.hide;

			});
		}
	};
}]);

app.directive('noClick', function() {
	return function(scope, element, attrs) {
		$(element).click(function(e) {
			e.stopPropagation();
			return false;
		});
	};
});

app.directive('verticalProgressBar', function() {
	return {
    	restrict: 'A',
     	replace: false,
    	scope: {
      		value: '=verticalProgressBar'
     	},
     	controller: function($scope, $element, guid) {
     		$el = $($element);
     		$bar = $el.find('.bar');

     		function setProgress(y) {
     			$scope.$apply(function() {
     				$scope.value = 100 - (y - $el.offset().top) / $el.height() * 100;
     				$bar.css('height', $scope.value + '%');
     			});
     			
     		}

     		$el.mousedown(function(e) {
     			setProgress(e.pageY);

     			$el.mousemove(function(e) {
     				setProgress(e.pageY);
     			});

     			$(window).one('mouseup', function() {
     				$el.unbind('mousemove');
     			});
     		});

     		$scope.$watch('value', function() {
     			$bar.css('height', $scope.value + '%');
     		});
     	}
    };
});

app.directive('bsPopover', ['$parse', '$compile', '$http', '$timeout', '$q', '$templateCache', function($parse, $compile, $http, $timeout, $q, $templateCache) {
  'use strict';

  // Hide popovers when pressing esc
  $("body").on("keyup", function(ev) {
    if(ev.keyCode === 27) {
      $(".popover.in").each(function() {
        $(this).popover('hide');
      });
    }
  });

  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element, attr, ctrl) {

      var getter = $parse(attr.bsPopover),
        setter = getter.assign,
        value = getter(scope),
        options = {};

      if(angular.isObject(value)) {
        options = value;
        options.content = '<div back-img="{{playlist.items[playback.position - 1].thumbnail.hqDefault}}" />'
      }

      $q.when(options.content || $templateCache.get(value) || $http.get(value, {cache: true})).then(function onSuccess(template) {

        // Handle response from $http promise
        if(angular.isObject(template)) {
          template = template.data;
        }

        // Handle data-unique attribute
       // if(!!attr.unique) {
          element.on('show', function(ev) { // requires bootstrap 2.3.0+
            // Hide any active popover except self
            $(".popover.in").each(function() {
              var $this = $(this),
                popover = $this.data('popover');
              if(popover && !popover.$element.is(element)) {
                $this.popover('hide');
              }
            });
          });
        //}

        // Handle data-hide attribute to toggle visibility
        if(!!attr.hide) {
          scope.$watch(attr.hide, function(newValue, oldValue) {
            if(!!newValue) {
              popover.hide();
            } else if(newValue !== oldValue) {
              popover.show();
            }
          });
        }

        // Initialize popover
        element.popover(angular.extend({}, options, {
          content: template,
          html: true
        }));

        // Bootstrap override to provide tip() reference & compilation
        var popover = element.data('popover');
        popover.hasContent = function() {
          return this.getTitle() || template; // fix multiple $compile()
        };
        popover.getPosition = function() {
          var r = $.fn.popover.Constructor.prototype.getPosition.apply(this, arguments);

          // Compile content
          $compile(this.$tip)(scope);
          scope.$digest();

          // Bind popover to the tip()
          this.$tip.data('popover', this);

          return r;
        };

        // Provide scope display functions
        scope._popover = function(name) {
          element.popover(name);
        };
        scope.hide = function() {
          element.popover('hide');
        };
        scope.show = function() {
          element.popover('show');
        };
        scope.dismiss = scope.hide;

      });

    }
  };

}]);