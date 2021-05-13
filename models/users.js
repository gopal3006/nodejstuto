var mongoose = require('mongoose');
var random = require('mongoose-simple-random');
var shortid = require('shortid');

var usersSchema = mongoose.Schema({

    first_name       :   { type: String },
    last_name       :   { type: String },
    email           :  { type: String },
    password        :   { type: String },
    phoneno         :   { type: String },
    otp             :   { type: String },
    is_mobile_varified  :   { type: Boolean, default: false },
    image           :   { type: String },
    dob             :   { type: Date },
    last_login      :   { type: Date, default: new Date() },
    timezone        :   { type: String },
    offset          :     { type: String },
	created_at      :   { type: Date, default: Date.now },  
    modified_at     :   { type: Date, default: Date.now }
});
usersSchema.plugin(random);

module.exports = mongoose.model('User', usersSchema);