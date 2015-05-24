#!/usr/bin/env node

var docopt = require('docopt').docopt,
    atmoClientFactory = require('../lib/atmosphere_client'),
    fs = require('fs');

var doc = '\
Usage:\n\
    hflowc run \<wf_file.json\>\n\
';

function readProxy(proxyLocation, cb) {
    fs.readFile(proxyLocation, function (err, proxyContents) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, proxyContents);
    });
}

var opts = docopt(doc);

var proxyLocation = process.env.X509_USER_PROXY ? process.env.X509_USER_PROXY : 'proxy.pem';
var atmoLocation = process.env.ATMOSPHERE_URL ? process.env.ATMOSPHERE_URL : 'https://cloud-dev.plgrid.pl/api/v1';

if (opts.run) {
    readProxy(proxyLocation, function (err, proxy) {
        if (err) {
            console.log('Error reading proxy! forgot to do a voms-proxy-init?');
            return;
        }

        var atmoClient = atmoClientFactory.createClient(atmoLocation, proxy);

        atmoClient.createVm(98, {});
        //TODO: orchestrate rest of wf
    });
}

