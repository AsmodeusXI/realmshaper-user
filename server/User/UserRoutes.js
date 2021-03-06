'use strict';

const UserAuthenticationSvc = require('./UserAuthenticationSvc');
const UserSvc = require('./UserSvc');

module.exports = function (app, passport) {

    let passportApiOpts = {session: false};

    app.get('/api/users', function (req, res) {}); // users (GET) [ADMIN; "See All Users"]
    app.get('/api/users/:user_id', passport.authenticate('authenticate-user', passportApiOpts), UserSvc.getUserById); // users/user_id (GET) [ADMIN/User; "See Profile"]
    app.post('/api/users', passport.authenticate('create-local-user', passportApiOpts), UserAuthenticationSvc.respondToSignup); // users (POST) [ALL; "Sign-up"]
    app.put('/api/users/:user_id', passport.authenticate('authenticate-user', passportApiOpts), UserSvc.updateAuthenticatedUser); // users/user_id (PUT) [ADMIN/User; "Edit Profile"]
    app.delete('/api/users/:user_id', passport.authenticate('authenticate-user', passportApiOpts), UserSvc.deleteAuthenticatedUser); // users/user_id (DELETE) [ADMIN/User; "Delete Profile"]
    app.get('/api/permitted-users', passport.authenticate('authenticate-user', passportApiOpts), returnUser);
    app.post('/api/permitted-users', passport.authenticate('login-local-user', passportApiOpts), UserAuthenticationSvc.respondToLogin); // login a given user
    app.delete('/api/permitted-users/:user_id', passport.authenticate('logout-local-user', passportApiOpts), UserAuthenticationSvc.respondToLogout); // logout a given user

    function returnUser(req, res) {
        res.json(req.user);
    }

}
