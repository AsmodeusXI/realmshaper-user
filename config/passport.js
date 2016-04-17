'use strict';

const LocalStrategy = require('passport-local').Strategy;
const UniqueTokenStrategy = require('passport-unique-token').Strategy;
const UserAuthenticationSvc = require('../server/User/UserAuthenticationSvc');

module.exports = function (passport) {

    let localStrategyOptions = {
        passReqToCallback: true
    };

    let uniqueTokenStrategyOptions = {
        tokenQuery: 'rs-user-token',
        tokenParams: 'rs-user-token',
        tokenField: 'rs-user-token',
        tokenHeader: 'rs-user-token',
        failedOnMissing: false
    };

    passport.use('create-local-user', new LocalStrategy(
        localStrategyOptions,
        function (req, username, password, done) {
            UserAuthenticationSvc.createNewUser(req, username, password, done);
        }
    ));

    passport.use('login-local-user', new LocalStrategy(
        localStrategyOptions,
        function (req, username, password, done) {
            UserAuthenticationSvc.loginLocalUser(req, username, password, done);
        }
    ));

    passport.use('logout-local-user', new UniqueTokenStrategy(
        uniqueTokenStrategyOptions,
        function (token, done) {
            UserAuthenticationSvc.logoutLocalUser(token, done);
        }
    ));

    passport.use('authenticate-user', new UniqueTokenStrategy(
        uniqueTokenStrategyOptions,
        function (token, done) {
            UserAuthenticationSvc.authenticateUser(token, done);
        }
    ));
};
