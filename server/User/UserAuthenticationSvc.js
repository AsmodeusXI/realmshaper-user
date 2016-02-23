'use strict';

const User = require('./User').User;
const jwt = require('jsonwebtoken');

function createNewUser(req, username, password, done) {
    User.findOne({'local.username': username})
        .then(function (user) {
            if(user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {
                User.createUser(username, password)
                    .then(function (user) {
                        user.local.token = jwt.sign(user, 'supersecretsecret'); //TODO: Make a real secret
                        user.save()
                            .then(function (user) {
                                return done(null, user);
                            })
                            .catch(function (err) {
                                return done(err);
                            });
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            }
        })
        .catch(function (err) {
            return done(err);
        });
}

function loginLocalUser(req, username, password, done) {
    let invalidLoginMessage = 'Invalid user or password';
    User.findOne({'local.username': username})
        .then(function (user) {
            if(!user) {
                return done(null, false, req.flash('loginMessage', invalidLoginMessage));
            }
            if(!User.validatePassword(user, password)) {
                return done(null, false, req.flash('loginMessage', invalidLoginMessage));
            }
            return done(null, user);
        })
        .catch(function (err) {
            return done(err);
        });
}

exports.createNewUser = createNewUser;
exports.loginLocalUser = loginLocalUser;
