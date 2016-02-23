'use strict';

/* EXTERNAL DEPENDENCIES */
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const Bluebird = require('bluebird');
require('sinon-as-promised')(Bluebird);
const mongoose = require('mongoose');

/* INTERNAL DEPENDENCIES */
const UserAuthenticationSvc = require('./UserAuthenticationSvc');
const User = require('./User').User;
const jwt = require('jsonwebtoken');

describe('#UserAuthenticationSvc', function () {
    describe('#createNewUser', function () {

        let _findOne,
            _createUser,
            _save,
            _sign,
            _done;

        let testNewUser = {
            local: {
                username: 'testuser',
                password: 'testpass',
            },
            save: null
        };

        let testTokenedUser = {
            local: {
                username: 'testuser',
                password: 'testpass',
                token: 'testtoken'
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

        let _req = {
            flash: function () {}
        };

        beforeEach(function () {
            _findOne = sinon.stub(User, 'findOne');
            _createUser = sinon.stub(User, 'createUser');
            _sign = sinon.stub(jwt, 'sign').returns('testtoken');
            _save = sinon.stub();
            _done = sinon.spy();
            testNewUser.save = _save;
            testTokenedUser.save = _save;
        });

        afterEach(function () {
            User.findOne.restore();
            User.createUser.restore();
            jwt.sign.restore();
        });

        it('should create a new user if none are found by \"User.findOne()\"', function testUserCreation() {
            _findOne.resolves(null);
            _createUser.resolves(testNewUser);
            _save.resolves(testTokenedUser);
            UserAuthenticationSvc.createNewUser(_req, 'testuser', 'testpass', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'testuser'});
            return _findOne().then(function () {
                expect(_createUser).to.be.calledWith('testuser', 'testpass');
                return _createUser().then(function () {
                    expect(_sign).to.be.calledWith(testNewUser, 'supersecretsecret');
                    expect(_save).to.be.called;
                    return _save().then(function () {
                        expect(_done).to.be.calledWith(null, testTokenedUser);
                    });
                });
            });
        });

        it('should fail properly if the second \"user.save()\"', function testPostCreationFailure() {
            _findOne.resolves(null);
            _createUser.resolves(testNewUser);
            _save.rejects('Error error error');
            UserAuthenticationSvc.createNewUser(_req, 'testuser', 'testpass', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'testuser'});
            return _findOne().then(function () {
                expect(_createUser).to.be.calledWith('testuser', 'testpass');
                return _createUser().then(function () {
                    expect(_sign).to.be.calledWith(testNewUser, 'supersecretsecret');
                    expect(_save).to.be.called;
                    return _save().catch(function () {
                        expect(_done).to.be.calledWith(new Error('Error error error'));
                    });
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
                expect(_done).to.be.calledWith(null, false, _req.flash('signupMessage', 'That username is already taken.'));
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

        let _findOne,
            _validatePassword,
            _done = null;

        let testLoginUser = {
            local: {
                username: 'atestname',
                password: 'atestpassword'
            }
        };

        let _req = {
            flash: function () {}
        };

        beforeEach(function () {
            _findOne = sinon.stub(User, 'findOne');
            _validatePassword = sinon.stub(User, 'validatePassword');
            _done = sinon.spy();
        });

        afterEach(function () {
            User.findOne.restore();
            User.validatePassword.restore();
        });

        it('should properly return a user when one is found and the password is correct', function testUserLogin() {
            _findOne.resolves(testLoginUser);
            _validatePassword.withArgs(testLoginUser, 'atestpassword').returns(true);
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'atestpassword', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().then(function () {
                expect(_validatePassword).to.be.calledWith(testLoginUser, 'atestpassword');
                expect(_done).to.be.calledWith(null, testLoginUser);
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
                expect(_done).to.be.calledWith(null, false, _req.flash('loginMessage', 'Invalid user or password'));
            });
        });

        it('should fail properly if \"User.validatePassword()\" returns false', function testUserInvalidPassword() {
            _findOne.resolves(testLoginUser);
            _validatePassword.withArgs(testLoginUser, 'FAKE PASSWORD').returns(false);
            UserAuthenticationSvc.loginLocalUser(_req, 'atestname', 'FAKE PASSWORD', _done);
            expect(_findOne).to.be.calledWith({'local.username': 'atestname'});
            return _findOne().then(function () {
                expect(_validatePassword).to.be.calledWith(testLoginUser, 'FAKE PASSWORD');
                expect(_done).to.be.calledWith(null, false, _req.flash('loginMessage', 'Invalid user or password'));
            });
        });
    });
});
