var fs = require('fs');

function readFile(fileLocation, cb) {
    fs.readFile(fileLocation, {encoding: 'utf8'}, function (err, fileContents) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, fileContents);
    });
}

module.exports.readFile = readFile;