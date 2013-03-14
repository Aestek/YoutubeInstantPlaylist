app.filter('formatText', function() {
	return function(input) {
		if (input) {
			input = input.replace(/\r?\n/g, '<br />');
		}
		return input;
	};
});

app.filter('secToTime', function() {
	return function(input) {
		sec_numb    = parseInt(input);
	    var hours   = Math.floor(sec_numb / 3600);
	    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
	    var seconds = sec_numb - (hours * 3600) - (minutes * 60);

	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    var time    = hours == 0 ? minutes+':'+seconds : hours+':'+minutes+':'+seconds;
	    return time;
	};
});