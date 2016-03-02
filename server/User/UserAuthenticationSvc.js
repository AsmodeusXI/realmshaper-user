'use strict';

const User = require('./User').User;
const jwt = require('jsonwebtoken');
const ERROR_CONTAINER = {
    signup: null,
    login: null,
    logout: null
};

exports.createNewUser = createNewUser;
exports.loginLocalUser = loginLocalUser;
exports.logoutLocalUser = logoutLocalUser;
exports.respondToSignup = respondToSignup;
exports.respondToLogin = respondToLogin;

function respondToSignup(req, res) {
    respondToUserEvent(req, res, 'signup');
}

function respondToLogin(req, res) {
    respondToUserEvent(req, res, 'login');
}

function respondToUserEvent(req, res, errorMessageKey) {
    if (req.user) {
        res.json(req.user);
    } else {
        res.json({message: ERROR_CONTAINER[errorMessageKey]});
    }
}

function createNewUser(req, username, password, done) {
    User.findOne({'local.username': username})
        .then(function (user) {
            if(user) {
                ERROR_CONTAINER['signup'] = 'That username is already taken.';
                return done(null, false);
            } else {
                User.createUser(username, password)
                    .then(function (user) {
                        user.local.token = jwt.sign(user, process.env.TOKEN_SECRET);
                        user.local.isLoggedIn = true;
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
                ERROR_CONTAINER['login'] = invalidLoginMessage;
                return done(null, false);
            }
            if(!User.validatePassword(user, password)) {
                ERROR_CONTAINER['login'] = invalidLoginMessage;
                return done(null, false);
            }
            user.local.isLoggedIn = true;
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

function logoutLocalUser(token, done) {
    User.findOne({'local.token': token})
        .then(function (user) {
            if(!user.local.isLoggedIn) {
                ERROR_CONTAINER['logout'] = 'Cannot logout a user that is not logged in.';
                return done(null, false);
            } else {
                user.local.isLoggedIn = false;
                user.save()
                    .then(function (user) {
                        return done(null, true);
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
