var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var Base62 = require('base62');
var fs = require('fs');
var Gmailer = require("gmail-sender");
var gm = require('gm');

// Helpers
exports.dashboard = function (req, res) {
    res.render('Homes/dashboard', {});
    
}

exports.varification = function (req, res) {
    res.render('Homes/varification', {});  
}
