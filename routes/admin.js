var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/login',function (req,res) {
	res.render('login');
});

router.get('/register',function (req,res) {
	res.render('register');
});

router.post('/register',function (req,res) {
	var username = req.body.username;
	var password = req.body.password;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var city = req.body.city;
	var state = req.body.state; 
	var pan = req.body.pan;
	var zip = req.body.zip;
	var address = req.body.address;

	console.log(username);

	var newUser = new User({
		username: username,
		password: password,
		firstname: firstname,
		lastname: lastname,
		email: email,
		city: city,
		state: state,
		pan: pan,
		address: address,
		zip:zip
	});

	User.createUser(newUser, function (err,user) {
		if(err) throw err;
		console.log(user);
	});

	res.redirect('/users/login');
});

module.exports = router;