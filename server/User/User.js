'use strict';

const dbConnection = require('../../config/dbConnection');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let userSchema = new Schema({
    local: {
        username: String,
        password: String,
        token: String,
        tokenTime: {type: Date, default: null}
    },
    isAdmin: Boolean
});

userSchema.statics.createUser = function (username, password) {
    return this.create(
        {
            local: {
                username: username,
                password: bcrypt.hashSync(password, 10) //TODO: Think about async?
            },
            isAdmin: false
        }
    );
}

userSchema.statics.validatePassword = function(user, password) {
    return bcrypt.compareSync(password, user.local.password); //TODO: Think about async?
}

module.exports = dbConnection.model('User', userSchema);
