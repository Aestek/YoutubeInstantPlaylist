var connect = require('connect');

var sessionStore = new connect.session.MemoryStore();
var sessionSecret = 'c7b86b18-cc90-463d-9e2a-ae7d4cf9b128';

module.exports = {
	store: sessionStore,
	secret: sessionSecret
};