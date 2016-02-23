'use strict';

module.exports = function (app, passport) {

    let passportApiOpts = {failureFlash: true, session: false};

    app.get('/api/users', function (req, res) {}); // users (GET) [ADMIN; "See All Users"]
    app.get('/api/users/:user_id', function (req, res) {}); // users/user_id (GET) [ADMIN/User; "See Profile"]
    app.post('/api/users', passport.authenticate('create-local-user', passportApiOpts), function (req, res) {
        res.json(req.user);
    }); // users (POST) [ALL; "Sign-up"]
    app.put('/api/users/:user_id', function (req, res) {}); // users/user_id (PUT) [ADMIN/User; "Edit Profile"]
    app.delete('/api/users/:user_id', function (req, res) {}); // users/user_id (DELETE) [ADMIN/User; "Delete Profile"]
    app.post('/api/permitted-users', passport.authenticate('login-local-user', passportApiOpts), function (req, res) {
        res.json(req.user);
    }); // login a given user
    app.delete('/api/permitted-users/:user_id', function (req, res) {}); // logout a given user
}
