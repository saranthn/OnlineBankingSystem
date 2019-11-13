var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;

var router = express.Router();

var User = require('../models/user');
var Transaction = require('../models/transaction');
var Account = require('../models/account');
var Checkbook = require('../models/checkbook');
var Notification = require('../models/notification');

var dialog = require('dialog');
var PDFDocument = require('pdfkit');
var fs = require('fs');
//var alertify = require('alertifyjs');

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
	res.render('login',{error_msg: req.flash("message")});
});

router.get('/logout',function (req,res) {
  console.log('logging out');
  req.logout();
  res.redirect('login');
})

router.get('/:username/dashboard', ensureAuthenticated,function (req,res) {
	  User.findOne({username: req.user.username}).populate('accounts').populate('notifications').exec((err,userdata)=>{
    if(err) throw err;
    var accounts = userdata.accounts;
    var notification = userdata.notifications;
    res.render('user_dashboard',{accountdata: accounts, username: req.user.username,notification: notification});  
  });
});

router.get('/:username/acc_stmt', ensureAuthenticated, function (req,res) {
  User.findOne({username: req.user.username}).populate('accounts').populate('notifications').exec((err,userdata)=>{
    if(err) throw err;
    var accounts = userdata.accounts;
    var notification = userdata.notifications;
    res.render('user_acc_stmt',{accountdata: accounts, username: req.user.username,notification: notification});  
  });
});

//handling post request for account statement
router.post('/:username/acc_stmt', ensureAuthenticated, function (req, res) {
  var username = req.user.username;
  var accountNo = req.body.acc_sel;
  var transactionlist = null;
  var message = "Account Statement generated for : "+accountNo;
  console.log(req.body.acc_sel);
  // Create a document
  const doc = new PDFDocument;

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(fs.createWriteStream('output.pdf'));
  doc.fontSize(25).text("Loanly Bank");
  doc.moveDown();

  User.findOne({username: username}).populate('accounts').exec((err,userdata)=>{
    if(err) throw err;
    //console.log("Userdata: " + userdata);

    Account.getAccount({}, function(err,totalaccount){
       if(err) throw err;

       Account.getAccount({accountNo: accountNo},function(err,accdata){
         if(err) throw err;
         //console.log("Selected account data: " + accdata);

         var k = 100;
         transactionlist = accdata[0].transactions;
         for(var i=0; i<transactionlist.length;i++)
          {
            var date = "Date: " + transactionlist[i].date;
            var beneficiary = "Beneficiary: " + transactionlist[i].beneficiary;
            var beneficiaryAccountNo = "Beneficiary Account No: " + transactionlist[i].beneficiaryAccountNo;
            if(transactionlist[i].amount>0)
              var amount = "Credit: " + transactionlist[i].amount;
            else
              var amount = "Debit: " + transactionlist[i].amount;
            doc.fontSize(15).text(date);
            doc.fontSize(15).text(beneficiary);
            doc.fontSize(15).text(beneficiaryAccountNo);
            doc.fontSize(15).text(amount);
            doc.moveDown();
          }
          doc.end();
       });
    });
  });
  var newNotification = new Notification({
    message: message
  });

  Notification.createNotification(newNotification, function (err, data) {
    if(err) throw err;
    User.addNotification(username, data, function (err,user) {
      if(err) throw err;
    });
  });

  dialog.info('Account Statement generated!', 'My app', function(exitCode) {
    if (exitCode == 0) console.log(username + ": generated account statement");
    res.redirect('/users/'+username+'/dashboard');
  });

});

//handling get request for checkbook
router.get('/:username/checkbook_request', ensureAuthenticated, function (req,res) {
  User.findOne({username: req.user.username}).populate('accounts').populate('notifications').exec((err,userdata)=>{
    if(err) throw err;
    var accounts = userdata.accounts;
    var notification = userdata.notifications;
    res.render('user_checkbook',{accountdata: accounts, username: req.user.username,notification: notification});  
  });
});

//handling post request for checkbook
router.post('/:username/checkbook_request', function(req,res){

  console.log(req.body);

  var username = req.user.username;
  var accountNo = req.body.acc_sel;
  var noOfCheckbook = req.body.noOfCheckbooks;
  var noOfLeaves = req.body.noOfLeaves;
  var status = "Requested";
  var message = "Checkbook requested for : "+accountNo;

  console.log("hello");
  console.log(username);
  
  var newCheckbook = new Checkbook({
    username: username,
    accountNo: parseInt(accountNo),
    noOfCheckbook: parseInt(noOfCheckbook),
    noOfLeaves: parseInt(noOfLeaves),
    status: status 
  });

  var newNotification = new Notification({
    message: message
  });

  Notification.createNotification(newNotification, function (err, data) {
    if(err) throw err;
    User.addNotification(username, data, function (err,user) {
      if(err) throw err;
    });
  });

  Checkbook.createCheckbook(newCheckbook, function(err){
    if(err) throw err;
  });

  dialog.info('Checkbook Request has been registered !', 'My app', function(exitCode) {
    if (exitCode == 0) console.log(username + ": He accepted the checkbook request");
    res.redirect('/users/'+username+'/dashboard');
  });

});

router.get('/:username/transactions', ensureAuthenticated, function (req,res) {

  User.findOne({username: req.user.username}).populate('accounts').populate('notifications').exec((err,userdata)=>{
    if(err) throw err;
    var accounts = userdata.accounts;
    var notification = userdata.notifications;
    res.render('user_transactions',{accountdata: accounts, transactiondata: null, username: req.user.username,notification: notification});  
  });
});

router.post('/:username/transactions', function (req, res) {

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
          
          res.render('user_transactions',{  accountdata: userdata.accounts, transactiondata: transactionlist, username: req.user.username});
        });
     });
  });
});

router.get('/:username/profile', ensureAuthenticated, function (req,res) {
  User.findOne({username: req.user.username}).populate('accounts').populate('notifications').exec((err,userdata)=>{
    if(err) throw err;
    var accounts = userdata.accounts;
    var notification = userdata.notifications;
    res.render('user_profile',{accountdata: accounts, userDetails: req.user,notification: notification});  
  });
});

router.post('/:username/dashboard', function (req,res) {

  var username = req.user.username;
  var accountNo = req.body.accountNo;
  var beneficiary = req.body.beneficiary;
  var beneficiaryAccountNo = req.body.beneficiaryAccountNo;
  var amount = parseInt(req.body.amount);
  var message1 = "Successfully transferred to "+beneficiaryAccountNo;
  var message2 = "Successfully credited from "+accountNo;

  var benefquery = User.findOne({username: beneficiary}).populate('accounts');
  benefquery.exec(function(err, beneficiaryuserdata){
    if(err) throw err;

    if(beneficiaryuserdata == null){
      dialog.info("no such beneficiary name");
      res.redirect('/users/'+username+'/dashboard');
      return;
    }
    //console.log("The beneficiary accounts: " + beneficiaryuserdata.accounts);
    var bfound = false;
    for(var benefaccNo in beneficiaryuserdata.accounts) {
      //console.log("benefaccNo" + benefaccNo);
      //console.log("benefaccuserdata: " + beneficiaryuserdata.accounts[benefaccNo]);
      var benefaccounts = beneficiaryuserdata.accounts[benefaccNo]; 

      if(benefaccounts.accountNo == beneficiaryAccountNo){
        bfound = true;
        console.log("benefactno check");
        var usernamequery = User.findOne({username: username}).populate('accounts');
        usernamequery.exec(function(err, usernamedata){
          if(err) throw err;
          var afound = false;
          for(var useraccNo in usernamedata.accounts){
            var userAccontEle = usernamedata.accounts[useraccNo];
            if(userAccontEle.accountNo == accountNo){
                console.log("userno check");
                afound = true;
                User.getUserByUsername(beneficiary,function (err,user) {
                  if(err) throw err;
                  if(user)
                  {
                    var currdate = Date.now();
              
                    //Creating Transaction schema objext
                    var data = new Transaction({
                      date: currdate,
                      amount: -amount,
                      beneficiary: beneficiary,
                      beneficiaryAccountNo: beneficiaryAccountNo
                    });
              
              
                    var beneficiarydata = new Transaction({
                      date: currdate,
                      amount: amount,
                      beneficiary: username,
                      beneficiaryAccountNo: accountNo
                    });

                    var newNotification1 = new Notification({
                      message: message1
                    });

                    var newNotification2 = new Notification({
                      message: message2
                    });

                    Notification.createNotification(newNotification1, function (err, data) {
                      if(err) throw err;
                      User.addNotification(username, data, function (err,user) {
                        if(err) throw err;
                      });
                    });

                    Notification.createNotification(newNotification2, function (err, data) {
                      if(err) throw err;
                      User.addNotification(beneficiary, data, function (err,user) {
                        if(err) throw err;
                      });
                    });
              
                    Account.getBalance(accountNo,function (err, data) {
                      if(err) throw err;
                      console.log(data.balance);
                      Account.updateBalance(accountNo,data.balance-amount,function (err, data) {
                        if(err) throw err;
                      });
                    });
              
                    Account.getBalance(beneficiaryAccountNo,function (err, data) {
                      if(err) throw err;
                      console.log(data.balance);
                      Account.updateBalance(beneficiaryAccountNo,data.balance+amount,function (err, data) {
                        if(err) throw err;
                        console.log("done");
                      });
                    });
              
                    data.save(function (err) {
                      if(err) throw err;
                      Account.addTransaction(username, accountNo, data, function (err,user) {
                        if(err) throw err;
                      });
                    });
              
                    beneficiarydata.save(function (err) {
                      if(err) throw err;
                      Account.addTransaction(beneficiary, beneficiaryAccountNo, beneficiarydata, function (err,user) {
                        if(err) throw err;
                      });
                    });
                  }
                  else
                  {
                    console.log("not valid beneficiary");
                    res.redirect('/users/'+username+'/dashboard');
                  }
                });
                res.redirect('/users/'+username+'/dashboard');
            }

          }

          if(!afound){
            dialog.info("not a valid accountNo in your profile");
            res.redirect('/users/'+username+'/dashboard');
          }

        }); 
      }
    }

    if(!bfound){
      dialog.info("not valid beneficiary account No..");
      res.redirect('/users/'+username+'/dashboard');
    }

  });

});

passport.use(new LocalStrategy({passReqToCallback :true},
  function(req, username, password, done) {
  	User.getUserByUsername(username,function (err,user) {
  		if(err) throw err;
  		if(!user) {
  			return done(null,false,req.flash("message","Not a User"));
  		}
      if(user.isLocked) {
        return User.incLoginAttempts(user, function (err) {
          if(err) throw err;
        return done(null,null,req.flash("message","Maximum Tries Exceeded"));
        });
      }
  		User.comparePassword(password,user.password,function (err,isMatch) {
  			if(err) throw err;
  			if(isMatch){
          if(!user.loginAttempts && !user.lockUntil)
  				return done(null,user);

          var updates = {
            $set:{loginAttempts: 0},
            $unset: {lockUntil: 1}
          };
          return User.updateOne(updates,function (err) {
            if(err) throw err;
            return done(null,user)
          })
  			} 
  			else {
          console.log("invalid password");
          User.incLoginAttempts(user, function(err) {
                if (err) throw err;
                return done(null,false,req.flash("message","Invalid password"));
          });
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
  passport.authenticate('local',{failureRedirect:'/users/login',badRequestMessage : 'Missing username or password.',
    failureFlash: true}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    if(req.user.username=="root")
      res.redirect('/admin');
    else
      res.redirect('/users/' + req.user.username+'/dashboard');
  });

router.post('/:username/profile', function (req,res) {

  User.findOneAndUpdate({username:req.user.username}, req.body, {new : true}, function (err, user) {
    if(err) throw err;
  });

  res.redirect('/users/'+req.user.username+'/profile');

});

module.exports = router;