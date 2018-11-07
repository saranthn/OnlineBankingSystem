var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var exphbs = require('express-handlebars');
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;
var path = require('path');
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bank', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars',exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
	secret : 'secret',
	saveUninitialized : true,
	resave : true
}));

app.use(flash());

app.use(function (req,res,next) {
	res.locals.user = req.user || null;
	next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/',routes);
app.use('/users',users);
app.use('/admin',admin);

app.set('port',3001);
app.listen(app.get('port'), () => {
    console.log('Server is up and running on port number ' + app.get('port'));
});