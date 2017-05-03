/*jslint node: true */
/*jslint todo: true */
/*jslint unparam: true*/
'use strict';

// Update the AWS Region once in the beginning
var AWS = require('aws-sdk'),
    Config = require('./config/lambda-config.js');
AWS.config.update({region: Config.region});


var Alexa = require('./vendor/alexa-app'),
    Text = require('./lib/helper/text'),
    Something = require('./lib/helper/something');

// Define an alexa-app
var askGrandmomApp = new Alexa.app('askGrandmom');

askGrandmomApp.launch(function (request, response) {
    response
        .say(Text.setupPrompt)
        .shouldEndSession(false, Text.simpleHelp);
});

// Ensure it is our intended application sending the requests
askGrandmomApp.pre = function (request, response, type) {
    if (request.sessionDetails.application.applicationId !== Config.applicationId) {
        //console.log('The applicationIds don\'t match : ' + request.sessionDetails.application.applicationId + ' and ' +
        //    Config.applicationId);

        // Fail ungracefully
        throw 'Invalid applicationId: ' + request.sessionDetails.application.applicationId;
    }
};

function askGrandmomHelper(request, response, articlePresent) {
    function allGood(response) {
        response.send();
    }

    function oops(response) {
        response
            .clear()
            .say('Grandmom could not understand what I shared with her. Please try again later when her hearing is better. Goodbye.')
            .shouldEndSession(true);
    }

    Something.handleAskGrandmomIntent(request, response, articlePresent)
        .then(function () { allGood(response); })
        .catch(function () { oops(response); });
}

askGrandmomApp.intent('AskGrandmomIntentWithArticle',
    {
        'slots': {
            'SomethingSingular': 'LIST_OF_SOMETHINGS_SINGULAR'
        },
        'slot_types': [
            {
                'name': 'SomethingSingular',
                'values': ['hug', 'boat', 'dog', 'money']
            }
        ],
        'utterances': [
            '(a|an|the) {SomethingSingular}',
            '(may|can) I (get|have) (a|an|the) {SomethingSingular}',
            'I can (get|have) (a|an|the) {SomethingSingular}',
            'what about (a|an|the) {SomethingSingular}',
            '(I|I would|I\'d) (want|need|like) (a|an|the) {SomethingSingular}',
            'give me (a|an|the) {SomethingSingular}'
        ]
    },
    function (request, response) {
        askGrandmomHelper(request, response, true);  // article is present

        return false;   // so that caller does not perform response.send()
    });

//TODO: Add back |{Amount} -- it always resolves to Monies for now
askGrandmomApp.intent('AskGrandmomIntentWithoutArticle',
    {
        'slots': {
            //'Amount': 'AMAZON.NUMBER',
            'SomethingPlural': 'LIST_OF_SOMETHINGS_PLURAL'
        },
        'slot_types': [
            {
                'name': 'SomethingPlural',
                'values': ['love', 'candy', 'food', 'money']
            }
        ],
        'utterances': [
            '{SomethingPlural}',
            '(some|those) {SomethingPlural}',
            '(may|can) I (get|have) (some|those) {SomethingPlural}',
            'I can (get|have) (some|those) {SomethingPlural}',
            'what about (some|those) {SomethingPlural}',
            '(I|I would|I\'d) (want|need|like) (some|those) {SomethingPlural}',
            'give me (some|those) {SomethingPlural}'
        ]
    },
    function (request, response) {
        askGrandmomHelper(request, response, false); // article is not present

        return false;   // so that caller does not perform response.send()
    });

askGrandmomApp.intent('AskForMoneyIntent',
    {
        'slots': {
            'Amount': 'AMAZON.NUMBER',
            'Monies': 'LIST_OF_MONIES'
        },
        'slot_types': [
            {
                'name': 'Monies',
                'values': ['buck', 'bucks', 'dollar', 'dollars', 'quarter', 'quarters', 'dime', 'dimes', 'nickel', 'nickels', 'penny', 'pennies', 'half dollar', 'half dollars', 'silver dollar', 'silver dollars']

            }
        ],
        'utterances': [
            '(|may|can) I (get|have|want|need) (|a|an|the|some|those) {Amount} {Monies}',
            'I can (get|have) (a|an|the|some|those) {Amount} {Monies}',
            '(how|what) about (a|an|the|some|those) {Amount} {Monies}',
            '(I|I would|I\'d) (want|need|like) {Amount} {Monies}',
            'give me {Amount} {Monies}'
            //'{Amount} {Monies}'
        ]
    },
    function (request, response) {
        var amount = request.slot('Amount'),
            monies = request.slot('Monies');

        Something.handleAskForMoneyIntent(amount, monies, response);
    });

askGrandmomApp.intent('AMAZON.HelpIntent',
    function (request, response) {
        response
            .say(Text.setupPrompt)
            .shouldEndSession(false, Text.simpleHelp);
    });

askGrandmomApp.intent('AMAZON.StopIntent',
    function (request, response) {
        response
            .say(Text.goodbye)
            .shouldEndSession(true);
    });

askGrandmomApp.intent('AMAZON.CancelIntent',
    function (request, response) {
        response
            .say(Text.goodbye)
            .shouldEndSession(true);
    });

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;
module.exports = askGrandmomApp;
