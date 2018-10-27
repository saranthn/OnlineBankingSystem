var mongoose =  require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
	username: String,
	firstname: String,
	lastname: String,
	password: String,
	email: String,
	city: String,
	state: String,
	pan: Number,
	address: String,
	zip: Number
});

var User = module.exports = mongoose.model('User',UserSchema);

module.exports.createUser = function (newUser,callback) {
	bcrypt.genSalt(10, function(err, salt) {
	bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}