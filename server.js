
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, apiRoutes = require('./routes/api')
	, http = require('http')
	, path = require('path')
	, socketIo = require('socket.io')
;

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 8000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
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

var httpServer = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});


var io = socketIo.listen(httpServer);

io.sockets.on('connection', function (socket) {
	var roomId;
	socket.on('init', function(id, fn) {
		socket.join(id);
		roomId = id;
		fn(io.sockets.manager.rooms['/' + roomId].currentVideo);
	});

	socket.on('currentVideo', function(id) {
		io.sockets.manager.rooms['/' + roomId].currentVideo = id;
		io.sockets.in(roomId).emit('currentVideo', id);
	});

	socket.on('addVideo', function(id) {
		io.sockets.in(roomId).emit('addVideo', id);
		console.log(id);
	});
});