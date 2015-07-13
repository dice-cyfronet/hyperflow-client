var fs = require('fs'),
    expandHomeDir = require('expand-home-dir'),
    async = require('async')
    ;

function readFile(fileLocation, cb) {
    fs.readFile(fileLocation, {encoding: 'utf8'}, function (err, fileContents) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, fileContents);
    });
}

function loadConfigs(configLocations, cb) {
    async.map(configLocations, function (configLocation, cb) {
        var absoluteConfigLocation = expandHomeDir(configLocation);
        fs.exists(absoluteConfigLocation, function (exists) {
            if (exists) {
                readFile(absoluteConfigLocation, function (err, rawConfig) {
                    if (err) {
                        console.log("Unable to read config from: ", absoluteConfigLocation);
                        cb(null, {});
                        return;
                    }
                    try {
                        cb(null, JSON.parse(rawConfig));
                    } catch (err) {
                        console.log("Unable to parse config from: ", absoluteConfigLocation);
                    }
                });
            } else {
                cb(null, {});
            }
        });
    }, function (err, results) {
        cb(results);
    });
}

module.exports.readFile = readFile;
module.exports.loadConfigs = loadConfigs;