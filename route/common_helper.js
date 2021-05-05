const fs = require('fs');
const handlebars = require('handlebars');
const async = require("async");
const nodemailer = require("nodemailer");

exports.sendMail = async function (userData, emailSubject, emailBoday) {
    
    //return false;
    // SEND EMAIL
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, 
        service: 'gmail',
        auth: {
                user: 'developers2.arkenea@gmail.com', 
                pass: 'gmail@123', 
        },
    });

    const readHTMLFile = async function(path, callback) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

    await readHTMLFile(__dirname + '/templates/email-template.html', function(err, html) {
        var template = handlebars.compile(html);
        var dateData = Date(Date.now()); 
        
        // Converting the number of millisecond in date string 
        var finalDate = dateData.toString(); 
        var replacements = {
             "subject": emailSubject,
             "body":emailBoday
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'developers2.arkenea@gmail.com',
            to: userData.email,
            subject: emailSubject,
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error>>>>>>>>>>>>>>>>", error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    });
}