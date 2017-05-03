/*jslint node: true */
/*jslint todo: true */
'use strict';

var AWS = require('aws-sdk'),
    Config = require('../../config/lambda-config.js'),
    promise = require('bluebird'),
    invokeLambdaHelper = {};

AWS.config.update({region:  Config.region});

var lambda = new AWS.Lambda();
promise.promisifyAll(Object.getPrototypeOf(lambda), {suffix: '_Async'});

invokeLambdaHelper.invoke = function (payload) {
    var call,
        params = {
            FunctionName: Config.functionName, /* required */
            //ClientContext: 'STRING_VALUE',
            //InvocationType: 'Event | RequestResponse | DryRun',
            //LogType: 'None | Tail',
            Payload: JSON.stringify(payload, null, 2)
            //Qualifier: 'STRING_VALUE'
        };

    call = lambda.invoke_Async(params);
    return call
        .then(function (data) {
            return (JSON.parse(data.Payload));
        })
        .then(function (data) {
            if (data.response && data.response.outputSpeech) {
                return (data.response.outputSpeech.ssml);
            }

            throw 'bad response';   // TODO: Uncertain what to do here
        })
        .catch(function (err) {
            throw err;
        });
};

module.exports = invokeLambdaHelper;
