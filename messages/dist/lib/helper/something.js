////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2015-2016 Rick Wargo. All Rights Reserved.
//
// Licensed under the MIT License (the "License"). You may not use this file
// except in compliance with the License. A copy of the License is located at
// http://opensource.org/licenses/MIT or in the "LICENSE" file accompanying
// this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
////////////////////////////////////////////////////////////////////////////////

/*jslint node: true */
/*jslint todo: true */
'use strict';

var promise = require('bluebird'),
    YesResponses = require('./yes_phrases').responses(),
    Article = require('./article'),
    Somethings = require('./something_storage');

if (!process.env.SERVER || process.env.SERVER !== 'Local') {    // Provide long stack traces when running locally (in active development mode)
    promise.longStackTraces();
}

/**
 * Gets a fun way to say yes to send feedback to the user.
 */

function handleOfCourseYouCan(something, response, articlePresent) {
    var yesIndex = Math.floor(Math.random() * YesResponses.length),
        yes = YesResponses[yesIndex];

    // make something 'that' if something is falsey
    something = something || 'that';

    function finishUp(something) {
        // Create speech output
        var speechOutput = yes.replace('{Something}', something);

        response.say(speechOutput);

        if (something !== 'that') {
            if (something.match(/^an? /)) {
                something = something.substr(something.indexOf(' ') + 1);
            }
            response.card(something, speechOutput);
        }

        response.shouldEndSession(true);
    }

    return Article.addIfNecessary(something, articlePresent)
        .then(finishUp);
}

var somethingFuncs = {
    handleAskGrandmomIntent: function (request, response, articlePresent) {
        var slot = articlePresent ? 'SomethingSingular' : 'SomethingPlural',
            something = request.slot(slot, 'that') || 'that';

        something = something.toLowerCase();

        function log() {
            Somethings.save(something);
            Somethings.log(something, request.userId);
        }

        function sendMoneyResponse() {
            response
                .say('How much would you like to ask Grandmom for?')
                .shouldEndSession(false, 'You can ask for some amount of dollars.');

            return promise.resolve();
        }

        function cannedResponse(desireResponse) {
            if (something === 'that') { // no card if could not understand the response
                response
                    .say(desireResponse)
                    .shouldEndSession(true);
            } else {
                response
                    .say(desireResponse)
                    .card(something, desireResponse)
                    .shouldEndSession(true);
            }

            return promise.resolve();
        }

        function sendSomethingResponse(desireResponse) {
            return (desireResponse
                    ? cannedResponse(desireResponse)
                    : handleOfCourseYouCan(something, response, articlePresent));
        }

        function getSomethingResponse() {
            return Somethings.find(something);
        }

        return (something.indexOf('money') > -1
                ? sendMoneyResponse()
                : getSomethingResponse()
                    .then(sendSomethingResponse))
            .then(log);
    },

    handleAskForMoneyIntent: function (amountStr, monies, response) {
        var speechText,
            amount = parseFloat(amountStr);

        if (isNaN(amount)) {
            response
                .say('Sorry, I did not hear how much you wanted, please say that again.')
                .shouldEndSession(false, 'Please say the amount again.');
            return;
        }

        switch (monies) {
        case 'buck':
        case 'bucks':
        case 'dollar':
        case 'dollars':
        case 'silver dollar':
        case 'silver dollars':
            break;
        case 'half dollar':
        case 'half dollars':
            amount = amount * 0.50;
            break;
        case 'quarter':
        case 'quarters':
            amount = amount * 0.25;
            break;
        case 'dime':
        case 'dimes':
            amount = amount * 0.10;
            break;
        case 'nickel':
        case 'nickels':
            amount = amount * 0.05;
            break;
        case 'penny':
        case 'pennies':
            amount = amount * 0.01;
            break;
        default:
            return handleOfCourseYouCan(amountStr + ' ' + monies, response);
        }

        if (amount <= 100.00) {
            speechText = 'Grandmom said she would love to give you ' + amount.toString() + ' dollar' + (amount === 1 ? '' : 's') + '. She said to buy something fun with it.';
            response
                .say(speechText)// TODO: Should not expand $5 to $five
                .card('Money', speechText)
                .shouldEndSession(true);
        } else {
            response
                .say('Grandmom said she does not have that amount of money to give you. How much would you like to ask Grandmom for?')
                .shouldEndSession(false, 'How much would you like to ask Grandmom for?');
        }
    }
};

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;
module.exports = somethingFuncs;
