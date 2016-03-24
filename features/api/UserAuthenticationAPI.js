'use strict';

let UserAuthenticationAPI = function () {

    const UserFactory = require('../config/UserFactory');
    const RequestHelper = require('../support/RequestHelper');

    function loginUser(identifier) {
        let user = UserFactory.getUser(identifier);
        
    }

    function validateUserToken() {

    }

    return {
        loginUser: loginUser,
        validateUserToken: validateUserToken
    }

}

module.exports = new UserAuthenticationAPI();
