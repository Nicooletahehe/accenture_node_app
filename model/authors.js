const mongoose = require('mongoose');
const Joi = require("joi");

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,

    },
    website: {
        type: String,
    }
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;