/*jslint node: true */
/*jslint todo: true */
'use strict';

var requestPromise = require('request-promise'),
    Server = require('../../../../server'),
    invokeLocalHelper = {};

invokeLocalHelper.invoke = function (payload) {
    var call = requestPromise({
        method: 'POST',
        uri: 'http://localhost:8003/alexa/askGrandmom',
        json: payload
    });

    return call
        .then(function (data) {
            if (data.response && data.response.outputSpeech) {
                return data.response.outputSpeech.ssml;
            }
            throw 'bad response';   // TODO: Uncertain what to do here
        })
        .catch(function (err) {
            throw err;
        });
};

module.exports = invokeLocalHelper;
