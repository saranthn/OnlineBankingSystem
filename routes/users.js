var express = require('express');
var router = express.Router();

router.get('/login',function (req,res) {
	res.render('login');
});

router.post('/login',function (req,res) {
	var username = req.body.username;
	var password = req.body.password;
	console.log(username);
});

module.exports = router;