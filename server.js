
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path')
	, passport = require('passport')
	, connect = require('connect')
	, mongoose = require('mongoose')
	, models = require('./lib/models')
	, session = require('./lib/session')
;

// db setup

mongoose.connect('mongodb://localhost/yip');

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
		store: session.store,
		secret: session.secret
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
app.get('/partials/:id', routes.partials)

require('./lib/api')(app);

require('./lib/passport')(app);

var httpServer = http.createServer(app).listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});

require('./lib/io')(httpServer);