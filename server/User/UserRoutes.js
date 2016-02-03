'use strict';

module.exports = function (app) {
    app.get('/api/users', function (req, res) {}); // users (GET) [ADMIN; "See All Users"]
    app.get('/api/users/:user_id', function (req, res) {}); // users/user_id (GET) [ADMIN/User; "See Profile"]
    app.post('/api/users', function (req, res) {}); // users (POST) [ALL; "Sign-up"]
    app.put('/api/users/:user_id', function (req, res) {}); // users/user_id (PUT) [ADMIN/User; "Edit Profile"]
    app.delete('/api/users/:user_id', function (req, res) {}); // users/user_id (DLETE) [ADMIN/User; "Delete Profile"]
}
