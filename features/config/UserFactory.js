'use strict';

let UserFactory = function () {
    let users = []
    users['Admin User'] = { username: 'admin-user', password: 'admin-password' };
    users['User'] = { username: 'user', password: 'user-password' };

    function getUser(identifier) {
        return users[identifier];
    }

    return {
        getUser: getUser
    }
}

module.exports = new UserFactory();
