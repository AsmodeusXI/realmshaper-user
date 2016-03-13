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
const UserAuthenticationSvc = require('./UserAuthenticationSvc');
const User = require('./User');
const jwt = require('jsonwebtoken');

describe('#UserAuthenticationSvc', function () {

    let _findOne,
        _createUser,
        _validatePassword,
        _sign,
        _save,
        _req,
        _done = null;

    let testNewUser = {
        local: {
            username: 'testuser',
            password: 'testpass',
        },
        save: null
    };

    let testExistingUser = {
        _id: 'test',
        local: {
            username: 'testexistingname',
            password: 'testexistingpassword'
        }
    };

    let testLoginUser = {
        local: {
            username: 'atestname',
            password: 'atestpassword',
            token: null
        },
        save: null
    };

    let testLoggedInUser = {
        local: {
            username: 'atestname',
            password: 'atestpassword',
            token: 'test'
        },
        save: null
    };

    let testLoggedOutUser = {
        local: {
            username: 'testuser',
            password: 'testpassword',
            token: null
        },
        save: null
    };

    describe('#createNewUser', function () {

        beforeEach(function () {
            _findOne = sinon.stub(User, 'findOne');
            _createUser = sinon.stub(User, 'createUser');
            _done = sinon.spy();
        });

        afterEach(function () {
            User.findOne.restore();
            User.createUser.restore();
        });

        it('should create a new user if none are found by \"User.findOne()\"', function testUserCreation() {
            _findOne.resolves(null);
            _createUser.resolves(testNewUser);
            UserAuthenticationSvc.createNewUser(_req, 'testuser', 'testpass', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'testuser'});
            return _findOne().then(function () {
                expect(_createUser).to.be.calledWith('testuser', 'testpass');
                return _createUser().then(function () {
                    expect(_done).to.be.calledWith(null, testNewUser);
                });
            });
        });

        it('should fail properly when the new user save causes an error', function testUserSaveFailure() {
            _findOne.resolves(null);
            _createUser.rejects('This fails terribly!');
            UserAuthenticationSvc.createNewUser(_req, 'testuser', 'testpass', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'testuser'});
            return _findOne().then(function () {
                expect(_createUser).to.be.calledWith('testuser', 'testpass');
                return _createUser().catch(function () {
                    expect(_done).to.be.calledWith(new Error('This fails terribly!'));
                });
            });
        });

        it('should fail properly if \"User.findOne()\" returns a User', function testUserFound() {
            _findOne.resolves(testExistingUser);
            UserAuthenticationSvc.createNewUser(_req, 'testuser', 'testpass', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'testuser'});
            return _findOne().then(function () {
                expect(_done).to.be.calledWith(null, false);
            });
        });

        it('should fail properly when \"User.findOne()\" errors out', function testUserFindError() {
            _findOne.rejects('This fails terribly!');
            UserAuthenticationSvc.createNewUser(_req, 'testuser', 'testpass', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'testuser'});
            return _findOne().catch(function () {
                expect(_done).to.be.calledWith(new Error('This fails terribly!'));
            });
        });

    });

    describe('#loginLocalUser', function () {

        beforeEach(function () {
            _findOne = sinon.stub(User, 'findOne');
            _validatePassword = sinon.stub(User, 'validatePassword');
            _sign = sinon.stub(jwt, 'sign').returns('testtoken');
            _save = sinon.stub();
            testLoginUser.save = _save;
            testLoggedInUser.save = _save;
            _done = sinon.spy();
        });

        afterEach(function () {
            User.findOne.restore();
            User.validatePassword.restore();
            jwt.sign.restore();
        });

        it('should properly return a user and create a token when one is found and the password is correct', function testUserLogin() {
            _findOne.resolves(testLoginUser);
            _save.resolves(testLoggedInUser);
            _validatePassword.withArgs(testLoginUser, 'atestpassword').returns(true);
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'atestpassword', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().then(function () {
                expect(_validatePassword).to.be.calledWith(testLoginUser, 'atestpassword');
                expect(_sign).to.be.calledWith(testLoginUser, process.env.TOKEN_SECRET);
                return _save().then(function () {
                    expect(_done).to.be.calledWith(null, testLoggedInUser);
                });
            });
        });

        it('should fail in an expected way when the save() to create a new token', function testFailedTokenSaveSetting() {
            _findOne.resolves(testLoginUser);
            _save.rejects('This is a problem!');
            _validatePassword.withArgs(testLoginUser, 'atestpassword').returns(true);
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'atestpassword', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().then(function () {
                expect(_validatePassword).to.be.calledWith(testLoginUser, 'atestpassword');
                expect(_sign).to.be.calledWith(testLoginUser, process.env.TOKEN_SECRET);
                return _save().catch(function () {
                    expect(_done).to.be.calledWith(new Error('This is a problem!'));
                });
            });
        });

        it('should call the expected method when \"User.findOne()\" fails', function testUserFindOneFails() {
            _findOne.rejects('This totally fails!');
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'atestpassword', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().catch(function () {
                expect(_done).to.be.calledWith(new Error('This totally fails!'));
            });
        });

        it('should fail properly if \"User.findOne()\" does not find a user', function testUserNotFound() {
            _findOne.resolves(null);
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'atestpassword', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().then(function () {
                expect(_done).to.be.calledWith(null, false);
            });
        });

        it('should fail properly if \"User.validatePassword()\" returns false', function testUserInvalidPassword() {
            _findOne.resolves(testLoginUser);
            _validatePassword.withArgs(testLoginUser, 'FAKE PASSWORD').returns(false);
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'FAKE PASSWORD', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().then(function () {
                expect(_validatePassword).to.be.calledWith(testLoginUser, 'FAKE PASSWORD');
                expect(_done).to.be.calledWith(null, false);
            });
        });
    });

    describe('#logoutLocalUser', function () {

        beforeEach(function () {
            _findOne = sinon.stub(User, 'findOne');
            _save = sinon.stub();
            testLoggedInUser.save = _save;
            testLoggedOutUser.save = _save;
            _done = sinon.spy();
        });

        afterEach(function () {
            User.findOne.restore();
            testLoggedInUser.local.token = 'test';
        });

        it('should logout properly when the correct credentials are applied and the user has an existing token', function testProperLogout() {
            _findOne.resolves(testLoggedInUser);
            _save.resolves(testLoggedOutUser);
            UserAuthenticationSvc.logoutLocalUser('test', _done);
            expect(_findOne).to.be.calledWith({'local.token': 'test'});
            return _findOne().then(function () {
                return _save().then(function () {
                    expect(_done).to.be.calledWith(null, true);
                });
            });
        });

        it('should fail properly when user does not have a token when attempting to logout', function testUnableToLogout() {
            _findOne.resolves(testLoggedOutUser);
            UserAuthenticationSvc.logoutLocalUser('test', _done);
            expect(_findOne).to.be.calledWith({'local.token': 'test'});
            return _findOne().then(function () {
                expect(_done).to.be.calledWith(null, false);
            });
        });

        it('should return what we expect when \"User.findOne()\" fails', function testUnableToFindByToken() {
            _findOne.rejects('There was an error!');
            UserAuthenticationSvc.logoutLocalUser('test', _done);
            expect(_findOne).to.be.calledWith({'local.token': 'test'});
            return _findOne().catch(function () {
                expect(_done).to.be.calledWith(new Error('There was an error!'));
            });
        });
    });

    describe('#authenticateUser', function () {

        beforeEach(function () {
            _findOne = sinon.stub(User, 'findOne');
            _save = sinon.stub();
            _done = sinon.spy();
            testLoggedInUser.save = _save;
        });

        afterEach(function () {
            User.findOne.restore();
        });

        it('returns the user correctly when passed in the proper token', function testUserReturnedCorrectlyOnAuth() {
            _findOne.resolves(testLoggedInUser);
            UserAuthenticationSvc.authenticateUser('test', _done);
            expect(_findOne).to.be.calledWith({'local.token': 'test'});
            return _findOne().then(function () {
                expect(_done).to.be.calledWith(null, testLoggedInUser);
            });
        });

        it('fails as expected if user cannot be found by provided token', function testUserNeedsToken() {
            _findOne.rejects('Could not find the correct token');
            UserAuthenticationSvc.authenticateUser('test', _done);
            expect(_findOne).to.be.calledWith({'local.token': 'test'});
            return _findOne().catch(function () {
                expect(_done).to.be.calledWith(new Error('Could not find the correct token'));
            });
        });

    });
});
