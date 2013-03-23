var request = require('request'),
	async = require('async'),
	models = require('../lib/models')
;

var fetch = function(file,cb){
     request.get(file, function(err,response,body){
           if ( err){
                 cb(err);
           } else {
           		try {
           			var o = JSON.parse(body);
           			cb(null, o);
           		}
                catch (e) {
                	cb(e);
                }
           }
     });
}

exports.video = function(req, res) {
	var id = req.route.params.id;
	async.map([
		'http://gdata.youtube.com/feeds/api/videos/'+ id +'?v=2&alt=jsonc',
		'http://gdata.youtube.com/feeds/api/videos/' + id + '/related?v=2&alt=jsonc'
	], fetch, function(err, results) {
		if (err) {
			res.send(400);
		}
		else {
			try {
				var v;
				if (results[0].error)
					res.send(404);
				else {
					var v = results[0].data;
					if (!results[1].error) {
						v.relatedVideos = results[1].data.items;
					}
					res.send(200, v);
				}
			}
			catch (e) {
				send(500);
			}
		}
	});
};

exports.uploaderVideo = function(req, res) {
	var id = req.route.params.id;
	request(
		{uri: 'http://gdata.youtube.com/feeds/api/users/' + id + '/uploads?v=2&alt=jsonc'},
		function (error, response, body) {
			try {
				var o = JSON.parse(body);
				res.send(200, o.data.items);
			}
			catch (ex) {
				res.send(500)
			}
		}
	);
};


exports.search = function(req, res) {
	var q = req.query.q;
	request(
		{uri: 'http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=' + encodeURIComponent(q)},
		function (error, response, body) {
			var o = JSON.parse(body);
			res.send(200, o.data);
		}
	);
};

exports.searchAutocomplete = function(req, res) {
	var q = req.query.q;
	request(
		{uri: 'http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' + encodeURIComponent(q)},
		function (error, response, body) {
			try {
				var r = body.match(/^window\.google\.ac\.h\((.+)\)$/)[1];
				var ro = JSON.parse(r);
				var l = [];

				for (var i in ro[1]) {
					l.push(ro[1][i][0]);
				}

				res.send(200, l);
			}
			catch (err) {
				res.send(400, err);
			}
		}
	);
};

exports.savePlaylist = function(req, res) {
	var playlist = new models.playlist(req.param('playlist'));
	if (req.session.passport) {
		var user = req.session.passport.user;

		if (playlist._id) {
			models.playlist.find({_id: playlist._id, user: user.id}, function(err, p) {
				if (p) {
					playlist.save(function (err, nPlaylist) {
						res.send(nPlaylist);
					});
				}
				else
					res.send(403);
			});
		}
		else {
			playlist.user = user._id;
			playlist.save(function (err, nPlaylist) {
				res.send(nPlaylist);
			});
		}			
	}
	else
		res.send(401);
};

exports.getPlaylists = function(req, res) {
	if (req.session.passport) {
		var user = req.session.passport.user;
		models.playlist.findByUser(user, function(err, data) {
			res.send(data);
		});	
	}
	else
		res.send(401);
};