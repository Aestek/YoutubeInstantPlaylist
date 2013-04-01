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

function ensureAuthMiddleware(req, res, next) {
	if ((req.user || {})._id)
		next();
	else
		res.send(401);
};

module.exports = function(app) {
	require('./api-engine')(app, {
			uriPrefix : '/api/'
		}, {
		'playlists/:id?' : {
			expose: 'playlists',
			get: function(req, res) {
				var id = req.route.params.id;
				if (!id)
					res.send(400);
				else
					models.playlist.find({_id: id}, function(err, playlist) {
						if (playlist)
							res.send(playlist);
						else
							res.send(404);
					});
			},
			put: {
				middleware: ensureAuthMiddleware,
				handler: function(req, res) {
					var id = req.route.params.id;
					if (!id)
						res.send(400);
					else {
						var playlist = new models.playlist(req.param('playlist'));
						models.playlist.find({_id: id, user: req.user.id}, function(err, p) {
							if (p) {
								playlist.save(function (err, nPlaylist) {
									res.send(nPlaylist);
								});
							}
							else
								res.send(403);
						});
					}
				}
			},
			post:  {
				middleware: ensureAuthMiddleware,
				handler: function(req, res) {
					var playlist = new models.playlist(req.param('playlist'));
					playlist.user = req.user._id;
					playlist.save(function (err, nPlaylist) {
						res.send(nPlaylist);
					});
				}
			}
		},

		'videos/:id?': {
			expose: 'videos',
			cache: true,
			get: function (req, res) {
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
							send(404);
						}
					}
				});
			},
			next: {
				'from-uploader/:name': {
					expose: 'fromUploader',
					cache: true,
					get: function (req, res) {
						var id = req.route.params.name;
						request(
							{uri: 'http://gdata.youtube.com/feeds/api/users/' + id + '/uploads?v=2&alt=jsonc'},
							function (error, response, body) {
								try {
									var o = JSON.parse(body);
									if (o.error)
										res.send(404);
									else
										res.send(200, o.data.items);
								}
								catch (ex) {
									res.send(400)
								}
							}
						);
					}
				},
				'search/': {
					expose: 'search',
					cache: true,
					get:  function(req, res) {
						var q = req.query.q;
						request(
							{uri: 'http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=' + encodeURIComponent(q)},
							function (error, response, body) {
								var o = JSON.parse(body);
								res.send(200, o.data);
							}
						);
					},

					next: {
						'suggest/': {
							expose: 'suggest',
							cache: true,
							get: function(req, res) {
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
							}
						}
					}
				}
			}
		},
		'me/': {
			expose: 'me',
			next: {
				'playlists/': {
					expose: 'playlists',
					get: {
						middleware: ensureAuthMiddleware,
						handler: function(req, res) {
							models.playlist.find({user: req.user._id}, function(err, playlists) {
								if (playlists)
									res.send(playlists);
								else
									res.send([]);
							});
						}
					}
				},
				'status/': {
					expose: 'status',
					get: function(req, res) {
						res.send({
							authenticated: !!req.user,
							profile: req.user
						});
					},
					delete: {
						middleware: ensureAuthMiddleware,
						handler: function(req, res) {
							req.logout();
							res.end();
						}
					}
				}
			}
		}
	})
}