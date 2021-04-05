
var express = require('express');
var path = require('path');
var app = require('express')();
var compression = require('compression');
var modRewrite = require('connect-modrewrite');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var config = require('./helpers/config.js');
var jwt = require('jsonwebtoken');
require('dotenv').config();

var routes = {};
routes.homes = require('./route/homes.js');
// Contatus Us Form 
routes.contact = require('./route/contact.js');

app.get('/', function (req, res) {
	res.redirect('/dashboard');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var server = require('http').Server(app);
//var io = require('socket.io')(server);

// mongoose.connect(config.url);
mongoose.connect(config.url, { useNewUrlParser: true, useUnifiedTopology: true }).then(
	() => {
		console.log('Mongodb is connected!');
	},
	err => { console.log('Mongodb is not connected!') }
);

app.set('superSecret', config.secret); // Secret

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

app.use(express.static(__dirname + '/www', { maxAge: 2592000000 }));
const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log('Server is running on :', port);
});

app.all('*', function (req, res, next) {
	res.set('Access-Control-Allow-Origin', '*'); // JWEBTOKEN VERY IMPORTANT HERE!
	res.set('Access-Control-Allow-Credentials', true);
	res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
	res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-access-token');
	if ('OPTIONS' == req.method) return res.status(200).send();
	next();
});

// endpoints no AUTH
app.get('/dashboard', routes.homes.dashboard);
// ContactUs From 
app.post('/api/v1/constactus/save', routes.contact.contactSave);

app.use(function (req, res, next) {
	var token = req.headers['x-access-token'];
	console.log('token:', req.originalUrl);
	console.log("req.originalUrl>>>>>>>>>",req.originalUrl);
	if ((req.originalUrl != '/api/v1/constactus/save') && (req.originalUrl != '/dashboard')) {
		if (token) {
			jwt.verify(token, app.get('superSecret'), function (err, decoded) {
				if (err) {
					return res.json({ success: false, message: 'Failed to authenticate token.' });
				} else {
					// save the user
					req.decoded = decoded;
					next();
				}
			});
		} else {
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
	} else {
		next();
	}
});

