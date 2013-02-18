var request = require('request'),
	async = require('async');

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
		'http://gdata.youtube.com/feeds/api/videos/' + id + '/related?v=2&alt=jsonc',
		'http://gdata.youtube.com/feeds/api/videos/'+ id +'/comments?alt=json'
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

exports.search = function(req, res) {
	var q = req.query.q;
	request(
		{uri: 'http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=' + encodeURIComponent(q)},
		function (error, response, body) {
			var o = JSON.parse(body);
			res.send(200, o.data);
		}
	);
}
