var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Account = require('../models/account');

router.get('/login',function (req,res) {
	res.render('login');
});

router.get('/register',function (req,res) {
	res.render('register');
});

router.get('/account',function(req, res){
	res.render('admin_accountcreation');
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

router.post('/account', function (req,res) {

	var username = req.body.username;
	var accountNo = req.body.accountNo;
	var balance = req.body.balance;
	var type;
	type = req.body.acctype;

	var branch = req.body.branch;

	var newAccount = new Account({
		accountNo: accountNo,
		balance: balance,
		type: type,
		branch: branch
	});

	User.createAccount(username, newAccount, function (err,user) {
		if(err) throw err;
		else
		{
			User.addAccountToUser(username,newAccount,function (err) {
				if(err) throw err;
			});
		}
	});
	res.redirect('/users/login');
});

module.exports = router;