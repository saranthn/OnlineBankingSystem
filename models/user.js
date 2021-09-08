var mongoose =  require('mongoose');
var bcrypt = require('bcryptjs');
var LOCK_TIME = 1 * 60 * 1000;

var Account = require('../models/account');

var UserSchema = mongoose.Schema({
	username: {type: String, index:true, unique:true},
	firstname: String,
	lastname: String,
	password: String,
	email: String,
	accounts: [{type:mongoose.Schema.Types.ObjectId, ref: 'Account'}],
	notifications: [{type:mongoose.Schema.Types.ObjectId, ref: 'Notification'}],
	city: String,
	state: String,
	pan: Number,
	address: String,
	zip: Number,
	loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number}
});


UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
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
;
module.exports.incLoginAttempts = function (data, callback) {
    if (data.lockUntil && data.lockUntil < Date.now()) {
        return data.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, callback);
    }
    var updates = { $inc: { loginAttempts: 1 } };
    console.log(data.loginAttempts);
    console.log(data.isLocked);
    if (data.loginAttempts + 1 >= 3 && !data.isLocked) {
    	console.log("enter");
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return data.updateOne(updates, callback);
}

module.exports.createAccount = function (username, newAccount, callback) {
	newAccount.save(callback);
}

module.exports.addAccountToUser = function (username, newAccount, callback) {
	User.findOneAndUpdate({username : username},{$push:{accounts:newAccount}},{new: true}, callback);
}

module.exports.addNotification = function (username, data, callback) {
	User.findOneAndUpdate({username : username}, {$push: {notifications : data}},{new: true}, callback);
}

module.exports.getNotification = function (username, callback) {
	var query = User.find(username).populate('notifications');
	query.exec(callback);
}