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

describe('#UserAuthenticationSvc', function () {
    describe('#createNewUser', function () {

        let _findOne,
            _createUser,
            _done;

        let testNewUser = {
            username: 'testuser',
            password: 'testpass'
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
});
