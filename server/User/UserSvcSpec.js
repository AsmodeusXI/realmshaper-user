'use strict';

/* EXTERNAL DEPENDENCIES */
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
require('sinon-as-promised');
const mongoose = require('mongoose');

/* INTERNAL DEPENDENCIES */
const UserSvc = require('./UserSvc');
const User = require('./User');

describe("#UserSvc", function () {

    let _req,
        _res,
        _json,
        _send,
        _findById = null;

    let testAuthenticatedFirstUser = {
        _id: 111,
        local: {
            username: 'username',
            password: 'password',
            token: 'token'
        },
        save: null,
        delete: null
    };

    let testAuthenticatedSecondUser = {
        _id: 222,
        local: {
            username: 'adifferentuser',
            password: 'adifferentpassword',
            token: 'adifferenttoken'
        },
        save: null,
        delete: null
    };

    let testPublicProfile = {
        local: {
            username: 'adifferentuser'
        }
    };

    describe('#getUserById', function () {

        beforeEach(function () {
            _findById = sinon.stub(User, 'findById');
            _req = {
                user: null,
                params: {
                    user_id: 222
                }
            };
            _json = sinon.spy();
            _send = sinon.spy();
            _res = {
                json: _json,
                send: _send
            };
        });

        afterEach(function () {
            User.findById.restore();
        });

        it('returns the full selected user if authorized to do so', function testGetAuthenticatedUser() {
            _req.user = testAuthenticatedSecondUser;
            _findById.resolves(testAuthenticatedSecondUser);
            UserSvc.getUserById(_req, _res);
            expect(_req.user._id).to.equal(_req.params.user_id);
            expect(_findById).to.be.calledWith(222);
            return _findById().then().then(function () {
                expect(_json).to.be.calledWith(testAuthenticatedSecondUser);
            });
        });

        it('returns the public profile if they lack user access', function testGetPublicProfile() {
            _req.user = testAuthenticatedFirstUser;
            _findById.resolves(testPublicProfile);
            UserSvc.getUserById(_req, _res);
            expect(_req.user._id).to.not.equal(_req.params.user_id);
            expect(_findById).to.be.calledWith(222, 'local.username');
            return _findById().then().then(function () {
                expect(_json).to.be.calledWith({
                        local: {
                            username: 'adifferentuser'
                        }
                    });
            });
        });

        it('fails as expected if there is an error with findById', function testFailureStatus() {
            _req.user = testAuthenticatedSecondUser;
            _findById.rejects('Something bad happened');
            UserSvc.getUserById(_req, _res);
            expect(_findById).to.be.calledWith(222);
            return _findById().catch().catch(function () {
                expect(_send).to.be.calledWith(new Error('Something bad happened'));
            });
        });
    });

    describe('#updateAuthenticatedUser', function () {

        let _save = null;

        let testUpdate = {
            local: {
                username: 'newusername'
            }
        };

        let testUpdateAuthenticatedFirstUser = {
            _id: 111,
            local: {
                username: 'newusername',
                password: 'password',
                token: 'token'
            },
            save: null,
            delete: null
        };

        beforeEach(function () {
            _findById = sinon.stub(User, 'findById');
            _req = {
                user: null,
                params: {
                    user_id: 111
                },
                body: testUpdate
            };
            _json = sinon.spy();
            _send = sinon.spy();
            _res = {
                json: _json,
                send: _send
            };
            _save = sinon.spy();
            testAuthenticatedFirstUser.save = _save;
            testUpdateAuthenticatedFirstUser.save = _save;
        });

        afterEach(function () {
            User.findById.restore();
        });

        it('only updates the user if the user is authenticated', function testUpdateAuthenticatedUser() {
            _req.user = testAuthenticatedFirstUser;
            _findById.resolves(testAuthenticatedFirstUser);
            UserSvc.updateAuthenticatedUser(_req, _res);
            expect(_findById).to.be.calledWith(111);
            expect(_req.user._id).to.equal(_req.params.user_id);
            return _findById().then(function () {
                expect(_save).to.be.called;
                expect(_json).to.be.calledWith(testUpdateAuthenticatedFirstUser);
            });
        });

        it('returns an unauthorized message when the user is not authenticated', function testNoUpdateForAuthorized() {
            _req.user = testAuthenticatedSecondUser;
            UserSvc.updateAuthenticatedUser(_req, _res);
            expect(_json).to.be.calledWith({ message: 'User not authenticated.' });
        });

        it('fails as expected if user is authenticated but find fails', function testFindFailure() {
            _req.user = testAuthenticatedFirstUser;
            _findById.rejects('Find fails!');
            UserSvc.updateAuthenticatedUser(_req, _res);
            return _findById().catch(function () {
                expect(_send).to.be.calledWith(new Error('Find fails!'));
            });
        });
    });

    describe('#deleteAuthenticatedUser', function () {
        beforeEach(function () {

        });

        afterEach(function () {

        });

        it('only deletes the user if the user is authenticated', function testDeleteAuthenticatedUser(){

        });
    });
});
