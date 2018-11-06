var mongoose =  require('mongoose');
var bcrypt = require('bcryptjs');

var Account = require('../models/account');

var UserSchema = mongoose.Schema({
	username: {type: String, index:true, unique:true},
	firstname: String,
	lastname: String,
	password: String,
	email: String,
	accounts: [{type:mongoose.Schema.Types.ObjectId, ref: 'Account'}],
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

module.exports.getUserByUsername = function (username, callback) {
	var query = {username: username};
	User.findOne(query,callback);
}

module.exports.getUserById  = function (id, callback) {
	User.findById(id,callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		 if(err) throw err;
		 callback(null, isMatch);
	});
}

module.exports.createAccount = function (username, newAccount, callback) {
	newAccount.save(callback);
}

module.exports.addAccountToUser = function (username, newAccount, callback) {
	User.findOneAndUpdate({username : username},{$push:{accounts:newAccount}},{new: true}, callback);
}