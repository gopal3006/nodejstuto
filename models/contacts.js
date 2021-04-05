var mongoose = require('mongoose');
var random = require('mongoose-simple-random');
var shortid = require('shortid');

var contactSchema = mongoose.Schema({

    first_name       :   { type: String },
    last_name       :   { type: String },
    email:  { type: String },
    subject :   { type: String },
    message :   { type: String },
	created_at  :   { type: Date, default: Date.now },  
    modified_at :   { type: Date, default: Date.now }
});
contactSchema.plugin(random);

module.exports = mongoose.model('Contact', contactSchema);