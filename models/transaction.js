var mongoose =  require('mongoose');

var transactionSchema = mongoose.Schema({
	amount : Number,
	beneficiary : String
});

var Transaction = module.exports = mongoose.model('Transaction', transactionSchema);
