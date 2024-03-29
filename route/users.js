var User = require('../models/users');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var Base62 = require('base62');
var fs = require('fs');
const handlebars = require('handlebars');
var Gmailer = require("gmail-sender");
var gm = require('gm');
const async = require("async");
const multer = require('multer');
var cors = require('cors');
var fileExtension = require('file-extension');
const bodyParser = require('body-parser');
const mime = require('mime');
const nodemailer = require("nodemailer");
const commonFunction = require('./common_helper');
const moment = require('moment');
const mtz  = require('moment-timezone');

exports.userSave = function (req, res) {
    var first_name = req.body.first_name || '';
    var last_name = req.body.last_name || '';
    var email = req.body.email || '';
    var password = req.body.password || '';
    var phoneno = req.body.phoneno || '';
    var dob = req.body.dob || '';


    if (first_name == '' || last_name == '') {
        return res.status(404).send({'err' : 'All inputs are required.'});
    }

    const file = req.file;
    if (typeof file === "undefined") {
        var fileName = "";
    } else {
        var fileName = file.filename;
    }
    // Save base64ImageUrl
    if (req.body.base64image == ""){
        var base64ImageName = "";
    } else {
        var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
        response = {};
        
        if (matches.length !== 3) {
            return res.status(404).send({'err' : 'Invalid input string.'});
        }
        
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let type = decodedImg.type;
        let extension = mime.getExtension(type);
        let base64ImageName = "image" + '-' + Date.now() + '.' + extension;
        try {
        fs.writeFileSync("./public/userImages/" + base64ImageName, imageBuffer, 'utf8');
            var newUser = new User();
            newUser.first_name = first_name;
            newUser.last_name = last_name;
            newUser.email = email;
            newUser.password = password;
            newUser.phoneno = phoneno;
            newUser.image = base64ImageName;
            newUser.dob = dob;
            newUser.save(function (err, reply) {
                if (err) {
                    return res.status(404).send({'err' : err});
                }
                var varificationBody = "Hi "+newUser.first_name+", Please click on following link to verified your account.";
                varificationBody +=" Link :- https://nodejstutomean.herokuapp.com/varification/"+reply._id+""
                commonFunction.sendMail(newUser,"Account Varification",varificationBody);
                return res.status(200).send({ confirm : 'User has been saved successfully.' });
            });
        } catch (e) {
            return res.status(404).send({'err' : e});
        }
    }
};

exports.userUpdate = async function (req, res) {
    const { _id, first_name, last_name, email, phoneno, dob } = req.body;
    try {
        const checkData = await User.findOne({ _id });
        if (!checkData) {
            return res.status(404).send({ confirm : 'Record not exists with this.' });
        }
        const file = req.file;
        if (typeof file === "undefined") {
            var fileName = checkData.image;
        } else {
            var fileName = file.filename;
        }

        // Save base64ImageUrl
        if (req.body.base64image == ""){
            var base64ImageName = checkData.image;;
        } else {
            var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
            response = {};
            
            if (matches.length !== 3) {
                return res.status(404).send({'err' : 'Invalid input string.'});
            }
            
            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');
            let decodedImg = response;
            let imageBuffer = decodedImg.data;
            let type = decodedImg.type;
            let extension = mime.getExtension(type);
            var base64ImageName = "image" + '-' + Date.now() + '.' + extension;
            try {
            fs.writeFileSync("./public/userImages/" + base64ImageName, imageBuffer, 'utf8');
                //return res.send({"status":"success"});
            } catch (e) {
                console.log("e>>>>>>>>>>>>>>>",e);
                //next(e);
            }
        }

        checkData.first_name = first_name;
        checkData.last_name = last_name;
        checkData.email = email;
        checkData.phoneno = phoneno;
        checkData.image = base64ImageName;
        checkData.dob = dob;
        console.log("checkData>>>>>>>",checkData);
        //return false;
        checkData.save();
        return res.status(200).send({ confirm : 'User has been updated successfully.' });
    } catch (error) {
        console.log("--error", error)
        return res.status(404).send({'err' : error});
    } 
}

exports.userList = function (req, res) {

    User.find( {  }, function (err, listUser) {
	
    if (err) {
        console.log("err>>>>>>>>>>>>>>>>",err);
        return res.status(401).send({'err' : 'There is something wrong...'});
    }

    if (listUser == undefined) {		
        return res.status(404).send({'err' : 'User list not found'});
    }

            var template = {
                __v: true,
                _id: function(src){
                    // return encodeId(src._id);
                    return src._id;
                },
                created_at: function(src){
                            return src.created_at.toDateString();
                        },
                modified_at: function(src){
                    return src.modified_at.toDateString();
                },  
                first_name: false,
                last_name: true,
                email: true,
                password: true,
                phoneno: true,
                image: true,
                    list: function(src){
                        return src.listUser;
                    }, 
        
            }; 
        
        var copy = cloneObjectByTemplate(listUser, template);	
        return res.status(200).send({ data: copy });
    });
    
}


exports.deleteUser = function(req, res) {
    //return false;
    var userId = req.body.userId || '';
    User.findOneAndDelete({ _id: userId }, function (err) {
        if (err) {
            return res.status(404).send({'err' : err});

        } else {
            return res.status(200).send({ confirm : 'User has been deleted successfully.' });
        }
    });
}

exports.detailUser = async function(req, res) {
     
    //return false;
    var userId = req.body._id || '';
    User.findOne({"_id":userId }, function (err, userDetails) {
	
        if (err) {
            return res.status(401).send({'err' : 'There is something wrong...'});
        }
    
        if (userDetails == undefined) {		
            return res.status(404).send({'err' : 'User Detail not found'});
        }
    
                var template = {
                    __v: true,
                    _id: function(src){
                        return encodeId(src._id);
                    },
                    created_at: function(src){
                                return src.created_at.toDateString();
                            },
                    modified_at: function(src){
                        return src.modified_at.toDateString();
                    },  
                    first_name: false,
                    last_name: true,
                    email: true,
                    password: true,
                    phoneno: true,
                    image: true,
                    dob: true,
                        list: function(src){
                            return src.userDetails;
                        }, 
            
                }; 
            
            var copy = cloneObjectByTemplate(userDetails, template);
            return res.status(200).send({ data: copy });
        });
}

exports.isEmailId = function(req, res) {
    User.find( {email:req.body.email}, function (err, listUser) {
	
    if (err) {
        console.log("err>>>>>>>>>>>>>>>>",err);
        return res.status(401).send({'err' : 'There is something wrong...'});
    }

    if (listUser == undefined) {		
        return res.status(404).send({'err' : 'User Email not found'});
    }

            var template = {
                __v: true,
                _id: function(src){
                    return encodeId(src._id);
                },
                created_at: function(src){
                            return src.created_at.toDateString();
                        },
                modified_at: function(src){
                    return src.modified_at.toDateString();
                },  
                first_name: false,
                last_name: true,
                email: true,
                password: true,
                phoneno: true,
                    list: function(src){
                        return src.listUser;
                    }, 
        
            }; 
        
        var copy = cloneObjectByTemplate(listUser, template);	
        console.log("copy>>>>>>>>>>>",copy);
        if(copy !=''){
            console.log("I M IF>>>>>");
            return res.status(200).send({'success' : 'User Email Already Exist'});
        }else{
            console.log("I M ELSE");
            return res.status(404).send({'err' : 'User Email not found'});
        }
        
    });
}

exports.uploadImage = function(req, res) {
    console.log("req>>>>>>>>>",req.body);
    //commonFunction.sendMail("Gopal","TESTSUBJECT","TESTBODY");
    return false;
}

exports.login = async function (req, res) {
    let email = req.body.email || '';
    let password = req.body.password || '';
    if (email == '') {
        return res.status(404).send({'err' : 'Username Required.'});
    }

    if (password == '') {
        return res.status(404).send({'err' : 'Password Required.'});
    }

    User.findOne({"email":email,"password":password}, function (err, userDetails) {

        if (err) {
            return res.status(401).send({'err' : 'There is something wrong...'});
        }
    
        if (userDetails == undefined) {		
            //return res.status(200).send({'err' : 'User Detail not found'});
            return res.status(200).send({ 'err' : 'User Detail not found',data: "" });
        }
        const checkData = {};
        var query = {'_id': userDetails._id};
        var UTCTIME = moment.utc().format();
        var timeZone = moment.tz.guess();
        
        //console.log("Javascript Timezone>>>>>>",Intl.DateTimeFormat().resolvedOptions().timeZone);
        //console.log("timeZone>>>>>>>>",timeZone);
        //var UTCTIME = new Date();
        //var timeZoneOffset = UTCTIME.getTimezoneOffset();
        //console.log("timeZoneOffset>>>>>>>.",timeZoneOffset);
        
        //var timeZone = moment.tz.zone(timeZone).abbr(timeZoneOffset);
        console.log("UTCTIME>>>>>",UTCTIME); 
        checkData.last_login = UTCTIME;
        checkData.timezone = timeZone;
        //checkData.offset = timeZoneOffset;

        User.findOneAndUpdate(query, checkData, {upsert: true}, function(err, updatedUserData) {
            if (err){
                return res.status(200).send({'err' : 'There is something wrong...'});
            } else {
                //console.log("UPDATE>>>>>>>>>>>>",updatedUserData);
                var template = {
                    __v: true,
                    _id: function(src){
                        return src._id;
                    },
                    created_at: function(src){
                                return src.created_at.toDateString();
                            },
                    last_login: function(src){
                        return src.last_login;
                    },
                    modified_at: function(src){
                        return src.modified_at.toDateString();
                    },  
                    first_name: false,
                    last_name: true,
                    email: true,
                    phoneno: true,
                    image: true,
                    dob: true,
                    offset: true,
                    timezone: true,
                        list: function(src){
                            return src.updatedUserData;
                        }, 
            
                }; 
                var copy = cloneObjectByTemplate(updatedUserData, template);
                console.log("copy>>>>>>>>>>>",copy);	
                return res.status(200).send({ data: copy });
            }
        });
    }); 
}

exports.forgotPassword =  async function (req, res) {
    console.log("req.body>>>>>>>",req.body);
    let email = req.body.email || '';
    if (email == '') {
        return res.status(200).send({'err' : 'Email Required.'});
    }

    User.findOne({"email":email}, async function (err, userDetails) {

        if (err) {
            console.log("err>>>>>>>>>>>>>>>>",err);
            return res.status(200).send({'err' : 'There is something wrong...', data: "" });
        }
    
        if (userDetails == undefined) {		
            //return res.status(200).send({'err' : 'User Detail not found'});
            return res.status(200).send({ 'err' : 'Please check your email id', data: "" });
        }
        console.log("userDetails>>>>>>>>>>>",userDetails);
        var template = {
            __v: true,
            _id: function(src){
                return src._id;
            },
            created_at: function(src){
                        return src.created_at.toDateString();
                    },
            modified_at: function(src){
                return src.modified_at.toDateString();
            },  
            first_name: false,
            last_name: true,
            email: true,
            phoneno: true,
            image: true,
            dob: true,
                list: function(src){
                    return src.userDetails;
                }, 
    
        }; 
    
        var copy = cloneObjectByTemplate(userDetails, template);

        console.log("copy>>>>>>>>>",copy);
        var userId = copy._id;
        console.log("userId>>>>>>>>1233",userId);
        var newPassword =  Math.floor(Math.random() * 100000);
        var forgotPasswordBody = "Hi "+copy.first_name+", Please find updated password to login your account.";
                forgotPasswordBody +=" password :- "+newPassword+""
        commonFunction.sendMail(copy,"Forgot Password",forgotPasswordBody);
        try {
            console.log("newPassword>>>>>>>>>",newPassword);
            const checkData = {};
            var query = {'_id': userId};
            checkData.password = newPassword;

            User.findOneAndUpdate(query, checkData, {upsert: true}, function(err, doc) {
                if (err){
                    return res.status(200).send({'err' : 'There is something wrong...', data: "" });
                } else {
                    console.log(">>>>>>>>>>>Success Update"); 
                } 
                
            });
        } catch(error){
            return res.status(200).send({ 'err' : 'There is something wrong. Please check your email id',data: "" });
        }
        return res.status(200).send({ 'success' : 'Email has been sent on your register email with updated password.',data: copy });
    });
}

exports.resetPassword = async function (req, res) {
    console.log("req.body>>>>>>>",req.body);
    let password = req.body.password || '';
    let confirm_password = req.body.confirm_password || '';

    if (password == '') {
        return res.status(200).send({'err' : 'Password Required.'});
    }
    if (confirm_password == '') {
        return res.status(200).send({'err' : 'Confirm Password Required.'});
    }

    User.findOne({"_id":req.body._id}, async function (err, userDetails) {

        if (err) {
            console.log("err>>>>>>>>>>>>>>>>",err);
            return res.status(200).send({'err' : 'There is something wrong...', data: "" });
        }
    
        if (userDetails == undefined) {		
            return res.status(200).send({ 'err' : 'User not found', data: "" });
        }

        if(password == confirm_password) {

            try {
                const checkData = {};
                var query = {'_id': req.body._id};
                checkData.password = confirm_password;
    
                User.findOneAndUpdate(query, checkData, {upsert: true}, function(err, doc) {
                    if (err){
                        return res.status(200).send({'err' : 'There is something wrong...', data: "" });
                    } else {
                        return res.status(200).send({ 'success' : 'New password has been updated successfully.',data: userDetails });
                    } 
                    
                });
            } catch(error){
                console.log("error>>>>>>>>>>>",error);
                return res.status(200).send({ 'err' : 'There is something wrong. Please check your email id',data: "" });
            }
                

        } else {
            return res.status(200).send({ 'err' : 'New password and Confirm password should be same', data: "" });
        }
    })
}

exports.sendSMS = async function (req, res) {
    console.log(">>>>>>>>>>>>>>>","I M HERE");
    console.log("REQ>>>>",req.body.phoneno);
    let phoneno = req.body.phoneno || '';

    if (phoneno == '') {
        return res.status(200).send({'err' : 'Phone number Required.',data: ""});
    }

    //TEST
    //const accountSid = "AC1e1dbc8ae084496394718bb95e32baa2"; 
    //LIVE
    const accountSid = "AC5dc6143c7aabee10338268085a29b481";
    //TEST
    //const authToken = "d57a4ab1fa29d9b430e8c57ce5ea0774";
    //LIVE
    const authToken = "2896ce6129b3deb529b79847e7056237";
    const client = require('twilio')(accountSid, authToken);
    const OTP =  Math.floor(Math.random() * 10000);
    console.log("OTP>>>>>>>>>>",OTP);
    const checkData = {};
    var query = {'_id': req.body._id};
    checkData.otp = OTP;
    checkData.is_mobile_varified = false;

    User.findOneAndUpdate(query, checkData, {upsert: true}, async function(err, doc) {
        if (err){
            return res.status(200).send({'err' : 'There is something wrong...', data: "" });
        } else {
            await client.messages
            .create({
                body: 'Please find one time password to varified your mobile number. OTP :-'+OTP,
                from: '+18065133875',
                to: '+91'+req.body.phoneno
            })
            .then(
                message => console.log(message.sid)
                
                );
            return res.status(200).send({'success' : 'Please check your mobile where we have sent an OTP for mobile number varification.',data: {"id":"123"} });
        } 
    });  
}

exports.verifiedOTP = async function (req, res) {
    User.findOne({"_id":req.body._id,"otp":req.body.otp}, async function (err, userDetails) {
        if (err) {
            console.log("err>>>>>>>>>>>>>>>>",err);
            return res.status(200).send({'err' : 'There is something wrong...', data: "" });
        }
    
        if (userDetails == undefined) {		
            return res.status(200).send({ 'err' : 'Please enter valid OTP.', data: "" });
        }

        try {
            const checkData = {};
            var query = {'_id': req.body._id};
            checkData.otp = "";
            checkData.is_mobile_varified = true;

            User.findOneAndUpdate(query, checkData, {upsert: true}, function(err, doc) {
                if (err){
                    return res.status(200).send({'err' : 'There is something wrong...', data: "" });
                } else {
                    return res.status(200).send({ 'success' : 'Mobile number varified successfully.',data: userDetails });
                } 
                
            });
        } catch(error){
            console.log("error>>>>>>>>>>>",error);
            return res.status(200).send({ 'err' : 'There is something wrong. Please enter valid OTP.',data: "" });
        }
    })
}

// Some Common finction 
function encodeId(id) {
    var firsthalf = id.toString().substring(0,12);
    var secondhalf = id.toString().substring(12,24);
    var dec_fh = parseInt(firsthalf, 16);
    var dec_sh = parseInt(secondhalf, 16);
    var pretty_id = Base62.encode(dec_fh) + Base62.encode(dec_sh);
    return pretty_id;
};

function isFunction(ftc) {
    var getType = {};
    return ftc && getType.toString.call(ftc) === '[object Function]';
};


function cloneObjectByTemplate(obj, tpl, cloneConstructor) {
    if (typeof cloneConstructor === "undefined") {
        cloneConstructor = false;
    }
    if (obj == null || typeof (obj) != 'object') return obj;
 
    // Array
    if (Array.isArray(obj)) {
        var ret = [];
        for (var i = 0; i < obj.length; i++) {
            ret.push(cloneObjectByTemplate(obj[i], tpl, cloneConstructor));
        }
        return ret;
    }
 
    // Obj
    var temp = cloneConstructor ? new obj.constructor() : {};
 
    for (var key in tpl) {
        //if we are provided with a function to determine the value of this property, call it
        if (isFunction(tpl[key])) {
            temp[key] = tpl[key](obj); //assign the result of the function call, passing in the value
        } else {
            // Obj Properties
            if (obj[key] != undefined) {
                if (Array.isArray(obj[key])) {
                    temp[key] = [];
                    for (var i = 0; i < obj[key].length; i++) {
                        temp[key].push(cloneObjectByTemplate(obj[key][i], tpl[key], cloneConstructor));
                    }
                } else {
                    temp[key] = cloneObjectByTemplate(obj[key], tpl[key], cloneConstructor);
                }
            }
        }
    }
 
    return temp;
};  











