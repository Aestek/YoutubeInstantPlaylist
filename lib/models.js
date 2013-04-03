var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
	infos: Object
});
var user = mongoose.model('User', userSchema);

var playlistSchema = new mongoose.Schema({
	items : [],
	totalTime : Number,
	title: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

playlistSchema.statics.findByUser = function(user, cb) {
	console.log('finding p for', user)
	return this.model('Playlist').find({user: user.id}, cb);
};

var playlist = mongoose.model('Playlist', playlistSchema);

module.exports = {
	user: user,
	playlist: playlist
};
