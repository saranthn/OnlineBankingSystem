var mongoose =  require('mongoose');

var transactionSchema = mongoose.Schema({
	date : Date,
	beneficiary : String,
	amount : Number
});

var Transaction = module.exports = mongoose.model('Transaction', transactionSchema);

module.exports.getTransactions = (transactionId,accdata,callback) => {
	Transaction.findOne({_id: transactionId}).exec(callback);
}
