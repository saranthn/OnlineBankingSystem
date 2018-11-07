var express = require('express');
var router = express.Router();
var flash = require('connect-flash');

var User = require('../models/user');
var Account = require('../models/account');

router.get('/', function(req,res){
	res.render('admindashboard');
});

router.get('/login',function (req,res) {
	res.render('login');
});

router.get('/register',function (req,res) {
	res.render('register',{msg: req.flash("info")});
});

router.get('/account',function(req, res){
	res.render('admin_accountcreation',{msg: req.flash("info")});
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

	var query = User.findOne({username: username});
	query.exec(function (err, user) {
		if(user)
		{		
			req.flash("info","Username Already Taken");
			res.redirect('/admin/register');
		}
		else
		{
			User.createUser(newUser, function (err,user) {
				if(err) throw err;
				console.log(user);
			});
			req.flash("info","Successfully Registered");
			res.redirect('/admin/register');
		}
	});
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

	var query = Account.findOne({accountNo: accountNo});
	query.exec(function (err, user) {
		if(user)
		{		
			req.flash("info","Account number Already Taken");
			res.redirect('/admin/account');
		}
		else
		{
			User.createAccount(username, newAccount, function (err,user) {
				if(err) throw err;
				else
				{
					User.addAccountToUser(username,newAccount,function (err) {
						if(err) throw err;
					});
				}
			});
			req.flash("info","Account registered !!");
			res.redirect('/admin/account');
		}
	});

});

module.exports = router;