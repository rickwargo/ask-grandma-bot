/*jslint node: true */
/*jslint todo: true */
/*jslint unparam: true*/
'use strict';

// Update the AWS Region once in the beginning
var AWS = require('aws-sdk'),
    Config = require('./config/lambda-config.js');
AWS.config.update({region: Config.region});

var Text = require('./lib/helper/text'),
    Alexa = require('./vendor/alexa-app'),
    Something = require('./lib/helper/something');

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env['LuisAppId'];
var luisAPIKey = process.env['LuisAPIKey'];
var luisAPIHostName = process.env['LuisAPIHostName'] || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

intents
    .onDefault(function(session) {
        var msg = 'Sorry, I did not understand \'' + session.message.text + '\'.';
        session.say(msg, msg);
    })
    .onBegin(function (session, args, next) {
        session.say(Text.setupPrompt, Text.setupPrompt);
    });

intents.matches('AMAZON-HelpIntent', [
    function (session, args, next) {
        session.say(Text.simpleHelp, Text.simpleHelp);
    }
]);

intents.matches('AMAZON-StopIntent', [
    function (session, args, next) {
        session.say(Text.goodbye, Text.goodbye);
    }
]);

intents.matches('AMAZON-CancelIntent', [
    function (session, args, next) {
        session.say(Text.goodbye, Text.goodbye);
    }
]);

intents.matches('AskGrandmaIntentWithArticle', [
    function (session, args, next) {
        askGrandmaHelper(session, true);  // article is present

        return false;   // so that caller does not perform response.send()
    }
]);

intents.matches('AskGrandmaIntentWithoutArticle', [
    function (session, args, next) {
        askGrandmaHelper(session, false);  // article is present

        return false;   // so that caller does not perform response.send()
    }
]);

function askGrandmaHelper(session, articlePresent) {
    function allGood(session) {
        session.send();
    }

    function oops(session) {
        session
            .clear()
            .say('Grandma could not understand what I shared with her. Please try again later when her hearing is better. Goodbye.')
            .shouldEndSession(true);
    }

    session.say('hi there', 'hi there');

    // Something.handleAskGrandmaIntent(session, articlePresent)
    //     .then(function () { allGood(session); })
    //     .catch(function () { oops(session); });
}

bot.dialog('/', intents);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpoint at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
