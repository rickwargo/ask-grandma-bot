/*jslint node: true */
'use strict';

//var promise = require('bluebird');
var Somethings = require('./helper/something_storage');

function good() {
    console.log('found it');
}

function bad() {
    console.log('nope');
}

Somethings
    .find('toy')
    .then(good, bad);