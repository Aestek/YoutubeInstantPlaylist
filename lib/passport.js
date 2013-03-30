var 	  models = require('./models')
		, passport = require('passport')
		, FacebookStrategy = require('passport-facebook').Strategy
;


module.exports = function(app) {
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	passport.use(new FacebookStrategy({
			clientID: '140946366072938',
			clientSecret: 'e2bb01c1ed27f92268e304fe10019832',
			callbackURL: "http://localhost:8000/auth/facebook/callback",
			profileFields: ['cover', 'id', 'displayName', 'profileUrl']
		},
		function(accessToken, refreshToken, profile, done) {
			process.nextTick(function () {
				models.user.findOne({'infos.id': profile.id, 'infos.provider': 'facebook'}, function(err, user) {
					if (!user) {
						user = new models.user({
							infos: profile,
							playlists: []
						});
						user.save();
					}
					console.log(user);
					done(null, user);
				});
			});
		}
	));

	app.get('/auth/facebook/', passport.authenticate('facebook'));

	app.get('/auth/facebook/callback', 
		passport.authenticate('facebook', { failureRedirect: '/login' }),
		function(req, res) {
			res.render('auth-callback', {
				authData: JSON.stringify(req.user)
			});
		});

	app.get('/auth/logout/', function(req, res){
		req.logout();
		res.redirect('/');
	});

};