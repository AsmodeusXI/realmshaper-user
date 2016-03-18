'use strict';

// Config Setup
const config = require('./default')[process.env.NODE_ENV || 'local'];

// Mongoose Setup
const mongoose = require('mongoose');

module.exports = mongoose.createConnection(config.dbUrl);
