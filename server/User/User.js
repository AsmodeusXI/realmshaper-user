'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    local: {
        username: String,
        password: String
    }
});

userSchema.methods.createCredentials = function (username, password) {
    this.local.username = username;
    this.local.password = bcrypt.hashSync(password, 10); //TODO: Think about async?
};
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password); //TODO: Think about async?
};

let User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};
