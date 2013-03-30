var session = require('./session'),
	socketIo = require('socket.io'),
	cookie = require('cookie'),
	connect = require('connect')
;

module.exports = function(httpServer) {
		
	var io = socketIo.listen(httpServer);

	//io.set('log level', 2)

	io.set('authorization', function(data, accept){
		var cookies = cookie.parse(data.headers.cookie)

		data.cookie = connect.utils.parseSignedCookies(cookies, session.secret);
		data.sessionID = data.cookie['express.sid'];

		session.store.get(data.sessionID, function(err, session) {
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

			if (data.type == 'remote') {
				if (roomData.player) {
					fn({
						accepted: true
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

		socket.on('loggin', function(user, fn) {
			socket.set('user', user);

			roomData.connectedRemotes.push(user);
			roomData.player.emit('remotes', roomData.connectedRemotes);

			fn(roomData.currentVideo);
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
			if (roomData) {
				roomData.currentVideo = v;
				io.sockets.in(roomId).emit('currentVideo', v);
			}
		});

		socket.on('changePosition', function(i) {
			roomData.player.emit('changePosition', i);
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
}