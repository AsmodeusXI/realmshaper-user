'use strict';

let PromiseHelper = function () {

    function promisifyAssertions(assertFunction) {
        return new Promise(
            function (resolve) {
                assertFunction();
                resolve();
            }
        );
    }

    return {
        promisifyAssertions: promisifyAssertions
    }
}

module.exports = new PromiseHelper();
