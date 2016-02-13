'use strict';

const LocalStrategy = require('passport-local').Strategy;
const User = require('../server/User/User').User;

module.exports = function (passport) {
    passport.use('create-local-user', new LocalStrategy(
        function (username, password, done) {
            User.findOne({'local.username': username}).then(function (err, user) {
                if(err) { return done(err); }
                if(user) {
                    return done(null, false, {message: 'That username is already taken.'});
                } else {
                    let newUser = new User();
                    newUser.createCredentials(username, password);
                    newUser.save().then(function (err, newUser) {
                        if(err) { return done(err); }
                        return done(null, newUser);
                    });
                }
            });
        }
    ));
};
