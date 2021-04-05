var Contact = require('../models/contacts');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var Base62 = require('base62');
var fs = require('fs');
var Gmailer = require("gmail-sender");
var gm = require('gm');
const nodemailer = require("nodemailer");
const async = require("async");

exports.contactSave = function (req, res) {
    console.log("I M HERE>>>>>>");
    console.log("req.body>>>>>>>>>>>>", req.body);
    //return false;
    var first_name = req.body.first_name || '';
    var last_name = req.body.last_name || '';
    var email = req.body.email || '';
    var subject = req.body.subject || '';
    var message = req.body.message || '';


    if (first_name == '' || last_name == '') {
        return res.status(404).send({'err' : 'All inputs are required.'});
    }
    var newContact = new Contact();
    newContact.first_name = first_name;
    newContact.last_name = last_name;
    newContact.email = email;
    newContact.subject = subject;
    newContact.message = message;
    newContact.save(function (err, reply) {
        console.log("AFTER SAVE>>>>>>>>>>");
        if (err) {
            return res.status(404).send({'err' : err});
        }
        // SEND EMAIL
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            service: 'gmail',
            auth: {
                    user: 'developers.arkenea@gmail.com', 
                    pass: 'gmail@123', 
            },
        });

        var mailOptions = {
            from: 'developers.arkenea@gmail.com',
            to: 'developers.arkenea@gmail.com',
            subject: 'Contact Us - '+subject,
            html: 'Hello Admin <br></br> Some one is tring to contact you. Please find details following.'+'<br></br>Firstname:- '+first_name+'<br></br>Last Name:- '+last_name+'<br></br>Email:- '+email+'<br></br>Subject:- '+subject+'<br></br>Message:- '+message
        };
          
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        return res.status(200).send({ confirm : 'Contact Form has been saved successfully.' });
    });


};













