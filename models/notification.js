const mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
	message: String
});

var Notification = module.exports = mongoose.model('Notification',notificationSchema);

module.exports.createNotification = function (newNotification,callback) {
    newNotification.save(callback);
}