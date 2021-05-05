
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

const multer = require('multer');
var cors = require('cors');
var fileExtension = require('file-extension')

//FILE UPLOAD USING MULTER
// Configure Storage
var storage = multer.diskStorage({

    // Setting directory on disk to save uploaded files
    destination: function (req, file, cb) {
        cb(null, 'public/userImages')
    },

    // Setting name of file saved
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + fileExtension(file.originalname))
    }
})

var upload = multer({
    storage: storage,
    limits: {
        // Setting Image Size Limit to 2MBs
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            //Error 
            cb(new Error('Please upload JPG and PNG images only!'))
        }
        //Success 
        cb(undefined, true)
    }
})

var routes = {};
routes.homes = require('./route/homes.js');
// Contatus Us Form 
routes.contact = require('./route/contact.js');
// Users APIs
routes.users = require('./route/users.js');

app.get('/', function (req, res) {
	res.redirect('/dashboard');
});


app.get('/varification/:userId', function (req, res) {
		var id = req.params.userId;
        console.log(id);
        res.redirect('/varification');
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
app.get('/varification', routes.homes.varification);
// ContactUs From 
app.post('/api/v1/constactus/save', routes.contact.contactSave);

// Users APIs Lists 
app.post('/api/v1/users/save', upload.single('uploadedImage'), routes.users.userSave);
app.get('/api/v1/users/list', routes.users.userList);
app.post('/api/v1/users/isemail', routes.users.isEmailId);
app.post('/api/v1/users/delete', routes.users.deleteUser);
app.post('/api/v1/users/update', upload.single('uploadedImage'), routes.users.userUpdate);
app.post('/api/v1/users/detail', routes.users.detailUser);
app.post('/api/v1/users/uploadImage', routes.users.uploadImage);
app.post('/api/v1/users/login', routes.users.login);
app.post('/api/v1/users/forgotPassword', routes.users.forgotPassword);

app.use(function (req, res, next) {
	var token = req.headers['x-access-token'];
	console.log('token:', req.originalUrl);
	console.log("req.originalUrl>>>>>>>>>",req.originalUrl);
	if ((req.originalUrl != '/api/v1/constactus/save') && (req.originalUrl != '/dashboard') && (req.originalUrl != '/varification') && (req.originalUrl != '/api/v1/users/isemail') && (req.originalUrl != '/api/v1/users/delete') && (req.originalUrl != '/api/v1/users/delete') && (req.originalUrl != '/api/v1/users/forgotPassword')) {
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

