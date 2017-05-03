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
var askGrandmaApp = new Alexa.app('ask-grandma');

function askGrandmaHelper(request, response, articlePresent) {
    function allGood(response) {
        response.send();
    }

    function oops(response) {
        response
            .clear()
            .say('Grandma could not understand what I shared with her. Please try again later when her hearing is better. Goodbye.')
            .shouldEndSession(true);
    }

    Something.handleAskGrandmaIntent(request, response, articlePresent)
        .then(function () { allGood(response); })
        .catch(function () { oops(response); });
}

askGrandmaApp.intent('AskGrandmaIntentWithArticle',
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
        askGrandmaHelper(request, response, true);  // article is present

        return false;   // so that caller does not perform response.send()
    });

//TODO: Add back |{Amount} -- it always resolves to Monies for now
askGrandmaApp.intent('AskGrandmaIntentWithoutArticle',
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
        askGrandmaHelper(request, response, false); // article is not present

        return false;   // so that caller does not perform response.send()
    });

askGrandmaApp.intent('AMAZON.HelpIntent',
    function (request, response) {
        response
            .say(Text.setupPrompt)
            .shouldEndSession(false, Text.simpleHelp);
    });

askGrandmaApp.intent('AMAZON.StopIntent',
    function (request, response) {
        response
            .say(Text.goodbye)
            .shouldEndSession(true);
    });

askGrandmaApp.intent('AMAZON.CancelIntent',
    function (request, response) {
        response
            .say(Text.goodbye)
            .shouldEndSession(true);
    });

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;
module.exports = askGrandmaApp;
