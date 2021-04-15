var User = require('../models/users');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var Base62 = require('base62');
var fs = require('fs');
var Gmailer = require("gmail-sender");
var gm = require('gm');
const async = require("async");
const multer = require('multer');
var cors = require('cors');
var fileExtension = require('file-extension')

exports.userSave = function (req, res) {
    console.log("I M HERE>>>>>>");
    console.log("req.body>>>>>>>>>>>>", req.body);
    //return false;
    var first_name = req.body.first_name || '';
    var last_name = req.body.last_name || '';
    var email = req.body.email || '';
    var password = req.body.password || '';
    var phoneno = req.body.phoneno || '';


    if (first_name == '' || last_name == '') {
        return res.status(404).send({'err' : 'All inputs are required.'});
    }

    const file = req.file;
    if (typeof file === "undefined") {
        var fileName = "";
    } else {
        console.log("File>>>>>>>>>>",file);
        console.log("FIleName>>>>>>",file.filename);
        var fileName = file.filename;
    }
    

    var newUser = new User();
    newUser.first_name = first_name;
    newUser.last_name = last_name;
    newUser.email = email;
    newUser.password = password;
    newUser.phoneno = phoneno;
    newUser.image = fileName;
    var util = require('util');
    fs.writeFileSync('mynewfile3.txt', util.inspect(file) , 'utf-8');
    newUser.save(function (err, reply) {
        console.log("AFTER SAVE>>>>>>>>>>");
        if (err) {
            return res.status(404).send({'err' : err});
        }
        return res.status(200).send({ confirm : 'User has been saved successfully.' });
    });
};

exports.userUpdate = async function (req, res) {
    const { _id, first_name, last_name, email, phoneno } = req.body;
    console.log("REQUEST>>>>>>>>>>>>",req.body);
    try {
        const checkData = await User.findOne({ _id });
        if (!checkData) {
            return res.status(404).send({ confirm : 'Record not exists with this.' });
        }
        console.log("checkData>>>>>>>",checkData);
        const file = req.file;
        if (typeof file === "undefined") {
            var fileName = checkData.image;
        } else {
            console.log("File>>>>>>>>>>",file);
            console.log("FIleName>>>>>>",file.filename);
            var fileName = file.filename;
        }

        checkData.first_name = first_name;
        checkData.last_name = last_name;
        checkData.email = email;
        checkData.phoneno = phoneno;
        checkData.image = fileName;
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
    console.log("I M HERE>>>>>>");
    console.log("req.body>>>>>>>>>>>>", req.body);
    //return false;
    var userId = req.body.userId || '';
    User.findOneAndDelete({ _id: userId }, function (err) {
        if (err) {
            console.log("I M HERE IF>>>>>>>>");
            return res.status(404).send({'err' : err});

        } else {
            console.log("I M HERE ELSE>>>>>>>>");
            return res.status(200).send({ confirm : 'User has been deleted successfully.' });
        }
    });
}

exports.detailUser = async function(req, res) {
    console.log("I M HERE>>>>>>");
    console.log("req.body>>>>>>>>>>>>", req.body);
    //return false;
    var userId = req.body._id || '';
    console.log("userId>>>>>>>>",userId);
    User.findOne({"_id":userId }, function (err, userDetails) {
	
        if (err) {
            console.log("err>>>>>>>>>>>>>>>>",err);
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
                        list: function(src){
                            return src.userDetails;
                        }, 
            
                }; 
            
            var copy = cloneObjectByTemplate(userDetails, template);
            console.log("copy>>>>>>>>>>>",copy);	
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












