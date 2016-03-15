'use strict';

const User = require('./User');
const _ = require('lodash');

module.exports = {
    getUserById: createResponder(getUserById),
    updateAuthenticatedUser: updateAuthenticatedUser,
    deleteAuthenticatedUser: createResponder(deleteAuthenticatedUser)
}

function getUserById(req) {
    if(req.user._id == req.params.user_id) {
        return User.findById(req.params.user_id);
    } else {
        return User.findById(req.params.user_id, 'local.username');
    }
}


function updateAuthenticatedUser(req, res) {
    if(req.user._id == req.params.user_id) {
        return User.findById(req.params.user_id)
            .then(function (user) {
                // If User is req.user, update with req.body
                _.merge(user, req.body);
                user.save();
                return user;
            });
    } else {
        res.json({message: 'User not authenticated.'})
    }
}

function deleteAuthenticatedUser(req) {
    // GET User by passed id
    // If User is req.user, delete user
    // Else do nothing / error with permissions
}

function createResponder(promiseResponseFromRequest) {
    return function(req, res) {
        return promiseResponseFromRequest(req)
            .then(function (data) {
                res.json(data);
            })
            .catch(function (err) {
                res.send(err);
            });
    };
}
