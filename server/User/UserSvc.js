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
    if(validateUpdate(req)) {
        return User.findById(req.params.user_id)
            .then(user => {
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
    if(validateUpdate(req)) {
        return User.findByIdAndRemove(req.params.user_id)
            .then(() => {
                req.user = null;
                res.json({message: `User ${req.params.user_id} was removed!`});
            })
            .catch(err => res.send(err));
    } else {
        res.json({message: 'User not authenticated.'});
    }
}

function validateUpdate(req) {
    let isUserUpdatingSelfOrAdmin = ((req.user._id == req.params.user_id) || req.user.isAdmin);
    let isUserUpdatingAdminFlagAsAdmin = true;
    if(req.body && req.body.isAdmin && !req.user.isAdmin) {
        isUserUpdatingAdminFlagAsAdmin = false;
    }
    return (isUserUpdatingSelfOrAdmin && isUserUpdatingAdminFlagAsAdmin);
}

function createResponder(promiseResponseFromRequest) {
    return function(req, res) {
        return promiseResponseFromRequest(req)
            .then(data => res.json(data))
            .catch(err => res.send(err));
    };
}
