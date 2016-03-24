let World = function World() {
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');

    chai.use(chaiAsPromised);

    expect = chai.expect;
    assert = chai.assert;

    scenarioContext = [];
    // Config URL based on Node ENV variables? Default to local.
};

module.exports.World = World;
