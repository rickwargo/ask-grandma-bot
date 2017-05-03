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
    promise = require('bluebird'),
    Uuid = require('node-uuid'),
    Config = require('../../config/lambda-config');

var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
promise.promisifyAll(Object.getPrototypeOf(dynamodbDoc), {suffix: '_Async'});

var somethingStorageHelper = {
    log: function (something, userId) {
        if (!something) {
            console.log('trying to log nothing.');
            return;
        }

        dynamodbDoc.put_Async({
            TableName: Config.namespace + 'ActivityLog',
            Item: {
                Key: Uuid.v4(),
                Who: 'Grandmom',
                Name: something.toLowerCase(),
                WhenAsked: new Date().getTime(),
                WhenString: new Date().toLocaleString(),
                ByWhom: userId
            }
        }).catch(function (err) {
            console.log('DynamoDB Error on logging: ' + err.message);
        });
    },

    find: function (something) {
        if (!something) {
            console.log('trying to read nothing.');
            return;
        }

        return dynamodbDoc.get_Async({
            TableName: Config.namespace + 'Somethings',
            Key: {
                Name: something.toLowerCase(),
                Who: 'Grandmom'
            },
            ProjectionExpression: 'ResponsePhrase'
        }).then(function (data) {
            var phrase = (data.Item !== undefined) ? data.Item.ResponsePhrase : null;

            if (phrase === 'that') { return null; }
            if (phrase === 'UPDATE') { return null; }
            return phrase;
        });
    },
    save: function (something) {
        if (!something) {
            console.log('trying to save nothing.');
            return;
        }
        // This update will only be successful if the Instances counter exists (and increments it)
        dynamodbDoc.update_Async({
            TableName: Config.namespace + 'Somethings',
            Key: {
                Name: something.toLowerCase(),
                Who: 'Grandmom'
            },
            ResponsePhrase: 'UPDATE',
            UpdateExpression: 'ADD Instances :incr SET ResponsePhrase = if_not_exists(ResponsePhrase, :phrase)',
            ExpressionAttributeValues: {
                ':incr': 1,
                ':phrase': 'UPDATE'
            }
        }).catch(function (err) {
            console.error('Unable to add/update item. Error JSON:', JSON.stringify(err, null, 2));
        });
    }
};

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;
module.exports = somethingStorageHelper;
