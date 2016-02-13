'use strict';

module.exports = function () {
    // Package Imports
    const express = require('express');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const cors = require('cors');
    const passport = require('passport');
    const session = require('express-session');
    const flash = require('connect-flash');
    const app = express();

    // App Setup
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors());
    app.use(flash());
    app.use(session({ secret: 'asecretsecretthatssecretlykeptsecret' }))
    app.use('/', express.static(__dirname));

    // Config Setup
    const config = require('./config/default')[process.env.NODE_ENV || 'local'];
    require('./config/passport')(passport);

    // Mongoose Setup
    const mongoose = require('mongoose');
    mongoose.Promise = require('bluebird');
    mongoose.connect(config.dbUrl);

    // Passport Setup
    app.use(passport.initialize());
    app.use(passport.session());

    // Domain Routes
    require('./server/User/UserRoutes')(app, passport);

    // Default Routes
    app.get('*', function(req, res) {
        res.send(config.message);
    });

    // Server Start
    app.listen(config.port);
}

module.exports();
