'use strict';

const User = require('./User');
const jwt = require('jsonwebtoken');
const ERROR_CONTAINER = {
    signup: null,
    login: null,
    logout: null,
    authenticate: null
};

module.exports = {
    createNewUser: createNewUser,
    loginLocalUser: loginLocalUser,
    logoutLocalUser: logoutLocalUser,
    authenticateUser: authenticateUser,
    respondToSignup: respondToSignup,
    respondToLogin: respondToLogin,
    respondToLogout: respondToLogout
}

function respondToSignup(req, res) {
    respondToUserEvent(req, res, 'signup');
}

function respondToLogin(req, res) {
    respondToUserEvent(req, res, 'login');
}

function respondToLogout(req, res) {
    res.json({message: 'User logged out!'});
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
                    .then(user => done(null, user))
                    .catch(done);
            }
        })
        .catch(done);
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
            user.local.token = jwt.sign(user, process.env.TOKEN_SECRET);
            user.save()
                .then(user => done(null, user))
                .catch(done);
        })
        .catch(done);
}

// Idempotence with DELETE (logout a "logged out" user)
function logoutLocalUser(token, done) {
    User.findOne({'local.token': token})
        .then(function (user) {
            if(!user.local.token) {
                ERROR_CONTAINER['logout'] = 'Cannot logout a user that is not logged in.';
                return done(null, false);
            } else {
                user.local.token = null;
                user.save()
                    .then(user => done(null, true))
                    .catch(done);
            }
        })
        .catch(done);
}

function authenticateUser(token, done) {
    User.findOne({'local.token': token})
        // Check for a bad token (with the date as well)
        .then(user => done(null, user))
        .catch(done);
}
