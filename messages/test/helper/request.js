/*jslint node: true */
/*jslint todo: true */
'use strict';

var AlexaSkill = (process.env.SERVER && process.env.SERVER === 'Local') ? require('./invokeLocal') : require('./invokeLambda');

var Config = require('../../config/lambda-config.js'),
    JSONtemplate = require('../inputs/request.json'),
    requestHelper = {};

function requestJSON(intent) {
    var json = JSON.parse(JSON.stringify(JSONtemplate));

    json.session.application.applicationId = Config.applicationId;
    json.session.application.timestamp = new Date().toISOString();
    json.request.timestamp = new Date().toISOString();
    if (intent) { json.request.intent = intent; }

    return json;
}

function launchJSON() {
    var json = requestJSON();

    json.request.type = 'LaunchRequest';
    json.session.new = true;
    return json;
}

// Generic unit test to see if it handles a bad application Id
requestHelper.badAppId = function () {
    var payload = launchJSON();

    payload.session.application.applicationId = 'amzn1.echo-sdk-ams.app.000000-d0ed-0000-ad00-000000d00ebe';

    return AlexaSkill.invoke(payload);
};

// Generic unit test to see if it handles capturing the text from starting up
requestHelper.launchRequest = function () {
    var payload = launchJSON();

    return AlexaSkill.invoke(payload);
};

// TODO: Need to find a clean method to abstract the top portion and easily add additional unit tests

function askForMoneyJSON(amount, monies) {
    var intent = {};

    intent.name = 'AskForMoneyIntent';
    intent.slots = {
        Amount: {
            value: amount,
            name: 'Amount'
        },
        Monies: {
            value: monies,
            name: 'Monies'
        }
    };

    return requestJSON(intent);
}

function askGrandmomJSON(articlePresent, value) {
    var intent = {};
    intent.slots = {};

    if (articlePresent) {
        intent.name = 'AskGrandmomIntentWithArticle';
        intent.slots.SomethingSingular = {};
        intent.slots.SomethingSingular.name = 'SomethingSingular';
        intent.slots.SomethingSingular.value = value;
    } else {
        intent.name = 'AskGrandmomIntentWithoutArticle';
        intent.slots.SomethingPlural = {};
        intent.slots.SomethingPlural.name = 'SomethingPlural';
        intent.slots.SomethingPlural.value = value;
    }

    return requestJSON(intent);
}

requestHelper.askForSomething = function (articlePresent, value) {
    var payload = askGrandmomJSON(articlePresent, value);

    return AlexaSkill.invoke(payload);
};

requestHelper.askForMoney = function (amount, monies) {
    var payload = askForMoneyJSON(amount, monies);

    return AlexaSkill.invoke(payload);
};


module.exports = requestHelper;