'use strict';

const LocalStrategy = require('passport-local').Strategy;
const UserAuthenticationSvc = require('../server/User/UserAuthenticationSvc');

module.exports = function (passport) {

    let strategyOptions = {
        passReqToCallback: true
    }

    passport.use('create-local-user', new LocalStrategy(
        strategyOptions,
        function (req, username, password, done) {
            UserAuthenticationSvc.createNewUser(req, username, password, done);
        }
    ));

    passport.use('login-local-user', new LocalStrategy(
        strategyOptions,
        function (req, username, password, done) {
            UserAuthenticationSvc.loginLocalUser(req, username, password, done);
        }
    ));
};
