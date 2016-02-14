'use strict';

const LocalStrategy = require('passport-local').Strategy;
const UserAuthenticationSvc = require('../server/User/UserAuthenticationSvc');

module.exports = function (passport) {
    passport.use('create-local-user', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            UserAuthenticationSvc.createNewUser(req, username, password, done);
        }
    ));
};
