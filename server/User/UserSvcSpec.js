'use strict';

/* EXTERNAL DEPENDENCIES */
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
require('sinon-as-promised');

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
        isAdmin: false,
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
        isAdmin: false,
        save: null,
        delete: null
    };

    let testAdminUser = {
        _id: 333,
        local: {
            username: 'admin',
            password: 'admin',
            token: 'admintoken'
        },
        isAdmin: true,
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

        it('returns the full selected user if you are the user', function testGetAuthenticatedUser() {
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
            isAdmin: false,
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

        it('updates the user if the user is authenticated', function testUpdateAuthenticatedUser() {
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

        it('updates the user if the user is an admin', function testUpdateAsAdmin() {
            _req.user = testAdminUser;
            _findById.resolves(testAuthenticatedFirstUser);
            UserSvc.updateAuthenticatedUser(_req, _res);
            expect(_findById).to.be.calledWith(111);
            expect(_req.user.isAdmin).to.be.true;
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

        let _findByIdAndRemove,
            _delete = null;

        beforeEach(function () {
            _findByIdAndRemove = sinon.stub(User, 'findByIdAndRemove');
            _delete = sinon.spy();
            _json = sinon.spy();
            _send = sinon.spy();
            _req = {
                user: null,
                params: {
                    user_id: null
                }
            };
            _res = {
                json: _json,
                send: _send
            };
        });

        afterEach(function () {
            User.findByIdAndRemove.restore();
        });

        it('deletes the user if the user is authenticated', function testDeleteAuthenticatedUser() {
            _req.user = testAuthenticatedFirstUser;
            _req.params.user_id = testAuthenticatedFirstUser._id;
            _findByIdAndRemove.resolves();
            UserSvc.deleteAuthenticatedUser(_req, _res);
            expect(_findByIdAndRemove).to.be.calledWith(111);
            return _findByIdAndRemove().then(function () {
                expect(_json).to.be.calledWith({message: `User ${testAuthenticatedFirstUser._id} was removed!`});
            });
        });

        it('deletes the user if the user is an admin', function testDeleteAsAdmin() {
            _req.user = testAdminUser;
            _req.params.user_id = testAuthenticatedFirstUser._id;
            _findByIdAndRemove.resolves();
            UserSvc.deleteAuthenticatedUser(_req, _res);
            expect(_req.user.isAdmin).to.be.true;
            expect(_findByIdAndRemove).to.be.calledWith(111);
            return _findByIdAndRemove().then(function () {
                expect(_json).to.be.calledWith({message: `User ${testAuthenticatedFirstUser._id} was removed!`});
            });
        });

        it('fails properly if the user is authenticated by not found', function testFailedFindAndRemove() {
            _req.user = testAuthenticatedFirstUser;
            _req.params.user_id = testAuthenticatedFirstUser._id;
            _findByIdAndRemove.rejects('Failed to find user!');
            UserSvc.deleteAuthenticatedUser(_req, _res);
            expect(_findByIdAndRemove).to.be.calledWith(111);
            return _findByIdAndRemove().catch(function () {
                expect(_send).to.be.calledWith(new Error('Failed to find user!'));
            });
        });

        it('sends the correct message if user is not authenticated', function testNotAuthenticatedToDelete() {
            _req.user = testAuthenticatedSecondUser;
            _req.params.user_id = testAuthenticatedFirstUser._id;
            UserSvc.deleteAuthenticatedUser(_req, _res);
            expect(_json).to.be.calledWith({message: 'User not authenticated.'});
        });
    });
});
