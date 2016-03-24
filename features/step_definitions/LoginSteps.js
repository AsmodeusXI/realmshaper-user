'use strict';

module.exports = function () {
    this.World = require('../config/World');
    let UserAuthenticationAPI = require('../api/UserAuthenticationAPI');

    this.When(/^I log in as "([^"]*)"$/, function (user) {
        return UserAuthenticationAPI.loginUser(user);
    });

    this.Then(/^I receive a token$/, function() {
        return UserAuthenticationAPI.validateUserToken();
    });
};
