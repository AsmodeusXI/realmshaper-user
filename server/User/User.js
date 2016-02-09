'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    local: {
        email: String,
        password: String
    }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hash(password, 8, function (err, hash) {
        // save? return?
    });
};
userSchema.methods.validPassword = function (password) {
    return bcrypt.compare(password, this.local.password, function (err, res) {
        // return the res?
    });
};

let User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};
