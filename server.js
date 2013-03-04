
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, apiRoutes = require('./routes/api')
	, http = require('http')
	, path = require('path')
	, socketIo = require('socket.io')
	, passport = require('passport')
	, FacebookStrategy = require('passport-facebook').Strategy
	, connect = require('connect')
	, cookie = require('cookie')
;

// session setup

var sessionStore = new connect.session.MemoryStore();
var sessionSecret = 'c7b86b18-cc90-463d-9e2a-ae7d4cf9b128';

// passport setup

// Passport session setup.
//	 To support persistent login sessions, Passport needs to be able to
//	 serialize users into and deserialize users out of the session.	Typically,
//	 this will be as simple as storing the user ID when serializing, and finding
//	 the user by ID when deserializing.	However, since this example does not
//	 have a database of user records, the complete Facebook profile is serialized
//	 and deserialized.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


// Use the FacebookStrategy within Passport.
//	 Strategies in Passport require a `verify` function, which accept
//	 credentials (in this case, an accessToken, refreshToken, and Facebook
//	 profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
		clientID: '140946366072938',
		clientSecret: 'e2bb01c1ed27f92268e304fe10019832',
		callbackURL: "http://localhost:8000/auth/facebook/callback",
		profileFields: ['cover', 'id', 'displayName', 'profileUrl']
	},
	function(accessToken, refreshToken, profile, done) {
		return done(null, profile);
	}
));


// express setup

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 8000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		key: 'express.sid',
		store: sessionStore,
		secret: sessionSecret
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/app', routes.app);
app.get('/remote', routes.remote);

app.get('/api/video/:id', apiRoutes.video);
app.get('/api/search/', apiRoutes.search);
app.get('/api/search-autocomplete/', apiRoutes.searchAutocomplete);

app.get('/auth/facebook/', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', 
	passport.authenticate('facebook', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect(req.cookies.origin || '/');
	});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

var httpServer = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});


// socket.io setup

var io = socketIo.listen(httpServer);

//io.set('log level', 2)

io.set('authorization', function(data, accept){
	var cookies = cookie.parse(data.headers.cookie)

	data.cookie = connect.utils.parseSignedCookies(cookies, sessionSecret);

	data.sessionID = data.cookie['express.sid'];

	sessionStore.get(data.sessionID, function(err, session) {
		data.session = session;
		return accept(null, true);
	});
});

io.sockets.on('connection', function (socket) {
	var hs = socket.handshake;
	console.log('A socket with sessionID '+hs.sessionID+' connected.');

	var roomId;
	var roomData;

	socket.on('init', function(data, fn) {
		roomId = data.key;
		socket.join(roomId);
		if (!io.sockets.manager.rooms['/' + roomId]._data)
			io.sockets.manager.rooms['/' + roomId]._data = {
				connectedRemotes : []
			};

		roomData = io.sockets.manager.rooms['/' + roomId]._data;

		socket.set('clientType', data.type);

		socket.set('user', data.user);

		if (data.type == 'remote') {
			if (roomData.player) {
				fn({
					accepted: true,
					currentVideo: roomData.currentVideo
				});
				socket.get('user', function(err, data) {	
					roomData.connectedRemotes.push(data);
					roomData.player.emit('remotes', roomData.connectedRemotes);
				});
			}
			else {
				fn({
					accepted: false
				});
				socket.disconnect();
			}
		}
		else
			roomData.player = socket;

	});

	socket.on('disconnect', function() {
		socket.get('clientType', function(err, type) {
			if (type == 'remote' && type) {
				if (roomData.player)
					socket.get('user', function(err, user) {
						roomData.connectedRemotes.splice(roomData.connectedRemotes.indexOf(user), 1);
						roomData.player.emit('remotes', roomData.connectedRemotes);
					});
			}
			else {
				io.sockets.in(roomId).emit('end', 'player disconnected');
				var clients = io.sockets.clients(roomId);
				for (var i in clients) {
					clients[i].get('clientType', function(err, type) {
						if (type == 'remote')
							clients[i].disconnect();
					});
				}
			}
				
		});
	});

	socket.on('currentVideo', function(v) {
		roomData.currentVideo = v;
		io.sockets.in(roomId).emit('currentVideo', v);
	});

	socket.on('addVideo', function(video) {
		socket.get('user', function(err, user) {
			io.sockets.in(roomId).emit('addVideo', {
				video: video,
				addedBy: user
			});
		});
	});
});