var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;
var router = express.Router();

var User = require('../models/user');
var Transaction = require('../models/transaction');
var Account = require('../models/account');

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated())
  {
    return next();
  }
  else
  {
    res.redirect("/users/login");
  }
}


router.get('/login',function (req,res) {
	res.render('login');
});

router.get('/logout',function (req,res) {
  console.log('logging out');
  req.logout();
  res.redirect('login');
})

router.get('/:username/dashboard', ensureAuthenticated,function (req,res) {
	console.log(req.params.username);
	res.render('user_dashboard',{ username: req.user.username });
});

router.get('/:username/acc_stmt', ensureAuthenticated, function (req,res) {
  res.render('user_acc_stmt',{ username: req.user.username });
});

router.get('/:username/checkbook_request', ensureAuthenticated, function (req,res) {
  res.render('user_checkbook',{ username: req.user.username });
});

router.get('/:username/transactions', ensureAuthenticated, function (req,res) {
  //console.log("transaction get :- " + req.user.username);

  User.findOne({username: req.user.username}).populate('accounts').exec((err,userdata)=>{
    if(err) throw err;
    var accounts = userdata.accounts;
    if(err) throw err;
    res.render('user_transactions',{  accountdata: accounts,
                                      transactiondata: null, //accdata[0].transactions, 
                                      username: req.user.username});  
  })
});

router.post('/:username/transactions_post', function (req, res) {

    var accno = req.body.acc_sel;
    //console.log("Selected account no: " + accno);
    User.findOne({username: req.user.username}).populate('accounts').exec((err,userdata)=>{
       if(err) throw err;
       //console.log("Userdata: " + userdata);

       Account.getAccount({}, function(err,totalaccount){
          if(err) throw err;

          Account.getAccount({accountNo: accno},function(err,accdata){
            if(err) throw err;
            //console.log("Selected account data: " + accdata);
  
            var transactionlist = accdata[0].transactions;
            //console.log("transaction list: " + transactionlist);
            
            res.render('user_transactions',{  accountdata: totalaccount,
                          transactiondata: transactionlist, 
                          username: req.user.username,
                        });
  
          });

       });
  
    });
});

router.get('/:username/profile', ensureAuthenticated, function (req,res) {
  res.render('user_profile',{ userDetails: req.user });
});

router.post('/:username/dashboard', function (req,res) {
  var username = req.user.username;
  var accountNo = req.body.accountNo;
  var beneficiary = req.body.beneficiary;
  var amount = req.body.amount;

  if(User.findOne({username : beneficiary})!=null)
  {
    var currdate = Date.now();

    //Creating Transaction schema objext
    var data = new Transaction({
      date: currdate,
      amount: amount,
      beneficiary: beneficiary
    });

    data.save(function (err) {
      if(err) throw err;
      Account.addTransaction(username, accountNo, data, function (err,user) {
        if(err) throw err;
      })
    });
  }
  else
  {
    console.log("not valid user");
    res.redirect('/users/'+username+'dashboard');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
  	User.getUserByUsername(username,function (err,user) {
  		if(err) throw err;
  		if(!user) {
  			return done(null,false,{message: 'UnKnown user'});
  		}
  		User.comparePassword(password,user.password,function (err,isMatch) {
  			if(err) throw err;
  			if(isMatch){
  				return done(null,user);
  			} 
  			else {
  				return done(null,false, {message:'Invalid Password'});
  			}
  		});
  	});
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username+'/dashboard');
  });

router.post('/:username/profile', function (req,res) {

  User.findOneAndUpdate({username:req.user.username}, req.body, {new : true}, function (err, user) {
    if(err) throw err;
    console.log(req.user.username);
  });

  res.redirect('/users/'+req.user.username+'/profile');

});

module.exports = router;