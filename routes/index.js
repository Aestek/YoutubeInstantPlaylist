
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};

/*
 * GET app.
 */

exports.app = function(req, res){
	res.cookie('origin', '/app');
	var user = ((req.session.passport || {}).user || {});
	res.render('app', {
		user: JSON.stringify(user)
	});
};

/*
 * GET remote.
 */

exports.remote = function(req, res) {
	res.cookie('origin', '/remote?k=' + req.query.k);
	var user = ((req.session.passport || {}).user || {});
	res.render('remote', {
		user: JSON.stringify(user)
	});
};