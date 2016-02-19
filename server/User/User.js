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

userSchema.statics.createUser = function (username, password) {
    return this.create(
        {
            local: {
                username: username,
                password: bcrypt.hashSync(password, 10) //TODO: Think about async?
            }
        }
    );
}

userSchema.statics.validatePassword = function(user, password) {
    return bcrypt.compareSync(password, user.local.password); //TODO: Think about async?
}

let User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};
