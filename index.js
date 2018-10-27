var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var exphbs = require('express-handlebars');
var path = require('path');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bank', { useNewUrlParser: true });
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

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

app.use('/',routes);
app.use('/users',users);

app.set('port',3001);
app.listen(app.get('port'), () => {
    console.log('Server is up and running on port number ' + app.get('port'));
});