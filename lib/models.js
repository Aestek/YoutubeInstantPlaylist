var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
	infos: Object,
	playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
});
var user = mongoose.model('User', userSchema);

var playlistSchema = new mongoose.Schema({
	items : [],
	totalTime : 0
});
var playlist = mongoose.model('Playlist', playlistSchema);

module.exports = {
	user: user,
	playlist: playlist
};