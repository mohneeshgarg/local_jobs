const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const userScehma = new Schema({
    email:{
        type:String, 
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    address:{
        type: String, 
        required: true
    },
    age:{
        type: Number,
        required: true
    }
});
userScehma.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userScehma);