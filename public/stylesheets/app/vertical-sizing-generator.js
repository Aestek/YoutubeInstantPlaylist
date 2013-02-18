var fs = require('fs');

var nb = 16;
var margin = 15;
var unit = 100 / nb;
var less = '';
for (var i = 0; i <= nb - 1; i++) {
	for (var j = 1; j <= nb; j++) {

		if (i + j <= nb) {
			var a = unit * i;
			var b = (nb - i - j) * unit;

			if (i == 0)
				less += 	'.row' + j + ', .rowoffset' + i + '.row' + j + ' { ';
			else
			 	less += 	'.row' + j + '.rowoffset' + i + ' { ';

			less += 		'top: -webkit-calc(~"' + a + '% + ' + margin + 'px"); ' +
							'position: absolute; ';
							
			if (i + j == nb)
				less += 	'bottom: -webkit-calc(~"' + b + '% + ' + margin + 'px"); '
			else
				less +=		'bottom: ' + b + '%;';

			less +=			'}\n';

			if (i == 0)
				less += 	'.col' + j + ', .coloffset' + i + '.col' + j + ' { ';
			else
			 	less += 	'.col' + j + '.coloffset' + i + ' { ';

			less += 		'left: -webkit-calc(~"' + a + '% + ' + margin + 'px"); ' +
							'position: absolute; ';

			if (i + j == nb)
				less += 	'right: -webkit-calc(~"' + b + '% + ' + margin + 'px"); '
			else
				less +=		'right: ' + b + '%;';

			less +=			'}\n';
		}
	}
}

fs.writeFile('vertical-sizing.less', less, function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("The file was saved!");
	}
});
