const mongoose = require('mongoose');

const Account = require('../models/account');
const Transaction = require('../models/transaction');
const User = require('../models/user');

var checkbookSchema = mongoose.Schema({
    username: String,
    accountNo: Number,
    noOfCheckbooks: Number,
    noOfLeaves: Number,
    status: String 
});

var Checkbook = module.exports = mongoose.model('Checkbook',checkbookSchema);

module.exports.createCheckbook = function (newCheckbook,callback) {
    newCheckbook.save(callback);
}

