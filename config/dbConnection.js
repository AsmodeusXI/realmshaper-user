'use strict';

const config = require('./default')[process.env.NODE_ENV || 'local'];
const mongoose = require('mongoose');

module.exports = mongoose.createConnection(config.dbUrl);
