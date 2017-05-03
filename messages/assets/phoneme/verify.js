'use strict';

var DICT = './cmudict-0.7b.json';

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(DICT)
});

var lineCount = 0;
var avg = 0;

lineReader.on('line', function (line) {
    lineCount++;
    var rec = JSON.parse(line);
    if (lineCount==761) console.log(rec);
    avg += rec.Phonemes.l.length;
    if (lineCount % 1000 == 0)
        console.log(lineCount, rec.Word, avg / lineCount);
});
