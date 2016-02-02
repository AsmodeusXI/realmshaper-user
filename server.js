'use strict';

module.exports = function () {
    const express = require('express');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const passport = require('passport');
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());

    // Config Setup
    const config = require('./config/default')[process.env.NODE_ENV || 'local'];

    // Mongoose Setup
    const mongoose = require('mongoose');
    mongoose.Promise = require('bluebird');
    mongoose.connect(config.dbUrl);

    // File Location Setup
    app.use('/', express.static(__dirname));

    // Default routes
    app.get('*', function(req, res) {
        res.send(config.message);
    });

    // Server startup
    app.listen(config.port);
}

module.exports();
