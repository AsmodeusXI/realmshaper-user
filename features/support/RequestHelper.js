'use script';

let RequestHelper = function () {

    const rp = require('request-promise');

    function post(url, body, headers) {
        return rp({
            method: 'POST',
            uri: url,
            body: body,
            headers: headers,
            json: true,
            resolveWithFullResponse: true
        });
    }

    return {
        post: post
    }
}

module.exports = new RequestHelper();
