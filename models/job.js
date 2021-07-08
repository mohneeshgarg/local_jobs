const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobScehma = new Schema({
    title:{
        type: String,
        required: true
    },
    address:{
        type: String, 
        required: true
    },
    salary:{
        type: Number,
        required: true
    },
    contact:{
        type: Number,
        required: true
    },
    image:{
        type: String, 
        required: true
    },
    owner:{
        type: String
    }
});

module.exports = mongoose.model('Job', jobScehma);