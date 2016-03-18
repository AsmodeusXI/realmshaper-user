'use strict';

const User = require('./User');
const _ = require('lodash');

module.exports = {
    getUserById: createResponder(getUserById),
    updateAuthenticatedUser: updateAuthenticatedUser,
    deleteAuthenticatedUser: deleteAuthenticatedUser
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
            .then(user => {
                // If User is req.user, update with req.body
                _.merge(user, req.body);
                user.save();
                res.json(user);
            })
            .catch(err => res.send(err));
    } else {
        res.json({message: 'User not authenticated.'});
    }
}

function deleteAuthenticatedUser(req, res) {
    // GET User by passed id
    if(req.user._id == req.params.user_id) {
        // If User is req.user, delete user
        return User.findByIdAndRemove(req.params.user_id)
            .then(() => {
                req.user = null;
                res.json({message: `User ${req.params.user_id} was removed!`});
            })
            .catch(err => res.send(err));
    } else {
        // Else do nothing / error with permissions
        res.json({message: 'User not authenticated.'});
    }
}

function createResponder(promiseResponseFromRequest) {
    return function(req, res) {
        return promiseResponseFromRequest(req)
            .then(data => res.json(data))
            .catch(err => res.send(err));
    };
}
