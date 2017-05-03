/*jslint node: true */
/*jslint todo: true */
/*global describe */
/*global it */

'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    should = require('chai').should(),
    request = require('./helper/request.js');

chai.use(chaiAsPromised);

describe('starting up', function () {

// TODO: Get this test working correctly
    it('should fail if an unknown application id is provided', function () {
        var result = request.badAppId();

        return result.should.eventually.be.rejected;
    });

    it('should respond what to ask for', function () {
        var result = request.launchRequest();
        return result.should.eventually.equal('<speak>You can ask me to ask Grandmom for anything.</speak>');
    });

});

describe('asking for known plural somethings', function () {

    it('should respond with a expected response for love', function () {
        var result = request.askForSomething(false, 'love');
        return result.should.eventually.equal('<speak>Grandmom says she loves you every day and always.</speak>');
    });

    it('should respond with a expected response for candy', function () {
        var result = request.askForSomething(false, 'candy');
        return result.should.eventually.equal('<speak>Grandmom said she especially likes to give you candy because you do not get enough of it at home.</speak>');
    });

});

describe('asking for known singular somethings', function () {

    it('should respond with a expected response for a hug', function () {
        var result = request.askForSomething(true, 'hug');
        return result.should.eventually.equal('<speak>Grandmom says she would love to give you a hug because you are so nice.</speak>');
    });

    it('should respond with a expected response for a dog', function () {
        var result = request.askForSomething(true, 'dog');
        return result.should.eventually.equal('<speak>Grandmom said she would love to get you a dog, but she is afraid your parents may not want her to do so.</speak>');
    });

});

describe('ask for something not correctly deciphered', function () {

    it('should respond with a generic approval message', function () {
        var result = request.askForSomething(true, '');
        return result.should.eventually.match(/\bthat\b/);
    });

});

describe('asking for money', function () {

    it('should respond with yes when asked for $10', function () {
        var result = request.askForMoney(10, 'dollars');
        return result.should.eventually.equal('<speak>Grandmom said she would love to give you ten dollars. She said to buy something fun with it.</speak>');
    });

    it('should respond with yes to $25 when asked for 100 quarters', function () {
        var result = request.askForMoney(100, 'quarters');
        return result.should.eventually.equal('<speak>Grandmom said she would love to give you twenty five dollars. She said to buy something fun with it.</speak>');
    });

    it('should respond with yes to $7.50 when asked for 75 dimes', function () {
        var result = request.askForMoney(75, 'dimes');
        return result.should.eventually.equal('<speak>Grandmom said she would love to give you seven point five dollars. She said to buy something fun with it.</speak>');
    });

});