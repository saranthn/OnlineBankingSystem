var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;
var router = express.Router();

var User = require('../models/user');

router.get('/login',function (req,res) {
	res.render('login');
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
  passport.authenticate('local',{successRedirect:'/',failureRedirect:'users/login'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
  });

module.exports = router;