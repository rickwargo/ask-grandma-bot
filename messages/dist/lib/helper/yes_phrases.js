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

var promise = require('bluebird');


var YesResponses = [];

function retrieveYesResponses() {
    var dynamodbDoc = new AWS.DynamoDB.DocumentClient();
    promise.promisifyAll(Object.getPrototypeOf(dynamodbDoc), {suffix: '_Async'});

    dynamodbDoc.scan_Async({
        TableName: Config.namespace + 'YesPhrases',
        FilterExpression: 'Who = :who',
        ExpressionAttributeValues: {':who' : 'Grandmom'}
    })
        .then(function (data) {
            data.Items.forEach(function (yes) {
                YesResponses.push(yes.ResponsePhrase);
            });
        }).catch(function (err) {
            console.log('DynamoDB Error on retrieveYesResponses: ' + err);
        });
}

exports.responses = function () {
    return YesResponses;
};

retrieveYesResponses();

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;
