'use strict';

const User = require('./User').User;

function createNewUser(req, username, password, done) {
    User.findOne({'local.username': username})
        .then(function (user) {
            if(user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {
                User.createUser(username, password)
                    .then(function (newUser) {
                        return done(null, newUser);
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
            if(!user.validPassword(password)) {
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
