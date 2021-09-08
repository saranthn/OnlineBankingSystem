var mongoose =  require('mongoose');

var Transaction = require('../models/transaction');
var User = require('../models/user');

var accountSchema = mongoose.Schema({
	accountNo : {type: Number, index:true, unique: true},
	balance : Number,
	type : String,
	branch : String,
	transactions : [{type:mongoose.Schema.Types.ObjectId, ref: 'Transaction'}]
});

var Account = module.exports = mongoose.model('Account', accountSchema);

module.exports.addTransaction = function (username, accountNo, data, callback) {
	Account.findOneAndUpdate({accountNo : accountNo}, {$push: {transactions : data}},{new: true}, callback);
}

module.exports.updateBalance = function (accountNo, data, callback) {
	Account.findOneAndUpdate({accountNo : accountNo}, {$set: {balance : data}},{new: true}, callback);
}

module.exports.getBalance = function (accountNo,callback) {
	Account.findOne({accountNo: accountNo}, callback);
}

module.exports.getAccount = function (accountId, callback) {
	var query = Account.find(accountId).populate('transactions');
	query.exec(callback);
}

