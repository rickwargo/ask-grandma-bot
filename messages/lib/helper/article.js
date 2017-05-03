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

var AWS = require('aws-sdk'),
    Config = require('../../config/lambda-config');
AWS.config.update({ region: Config.region });

var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
var promise = require('bluebird');

promise.promisifyAll(Object.getPrototypeOf(dynamodbDoc), {suffix: '_Async'});

var Article = {};

Article.addIfNecessary = function (word, articlePresent) {
    // Does the word sound like it starts with a vowel?
    function startsWithVowelSound(phoneme) {
        return (['A', 'E', 'I', 'O', 'U'].indexOf(phoneme[0]) > -1);
    }

    return dynamodbDoc.get_Async({
        TableName: 'CMUdict',
        Key: {
            Word: word.toUpperCase()
        },
        ProjectionExpression: 'Phonemes[0]'
    }).then(function (data) {
        if (word.toLowerCase() === 'that') { return word; }
        if (!articlePresent) { return word; }
        if (startsWithVowelSound(data.Item.Phonemes[0])) { return 'an ' + word; }

        return 'a ' + word;
    });
};

function test() {
    var i,
        words = ['honor', 'universal', 'hay', 'one'],
        wordsLength = words.length;

    for (i = 0; i < wordsLength; i += 1) {
        Article.addIfNecessary(words[i])
            .then(console.log);
    }
}

module.exports = Article;