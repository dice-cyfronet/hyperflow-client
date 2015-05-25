#!/usr/bin/env node

var docopt = require('docopt').docopt,
    atmoClientFactory = require('../lib/atmosphere_client'),
    fs = require('fs');

var doc = '\
Usage:\n\
    hflowc run \<wf_file.json\>\n\
';

var wfMainId = 19;
var wfWorkerId = 19;

function readProxy(proxyLocation, cb) {
    fs.readFile(proxyLocation, {encoding: 'utf8'}, function (err, proxyContents) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, proxyContents);
    });
}

var opts = docopt(doc);

var proxyLocation = process.env.X509_USER_PROXY ? process.env.X509_USER_PROXY : 'proxy.pem';
var atmoLocation = process.env.ATMOSPHERE_URL ? process.env.ATMOSPHERE_URL : 'cloud-dev.plgrid.pl';

if (opts.run) {
    readProxy(proxyLocation, function (err, proxy) {
        if (err) {
            console.log('Error reading proxy! forgot to do a voms-proxy-init?', err);
            return;
        }

        var atmoClient = atmoClientFactory.createClient(atmoLocation, proxy);

        //atmoClient.newApplianceSet(
        //    [
        //{
        //    applianceId: wfMainId,
        //    params: null,
        //    vms: [{cpu: 1, mem: 512}]
        //}
        //], function (err, applianceSetId) {
        //    if (err) {
        //        console.log('Error creating appliance set!', err);
        //        return;
        //    }
        //    console.log('Appliance set id: ' + applianceSetId + ' created successfully!')
        //
        atmoClient.newAppliance(
            {
                //setId: applianceSetId,
                setId: 53,
                name: 'wfmain',
                templateId: wfMainId
            }, function (err, applianceId) {
                if (err) {
                    console.log('Error creating appliance!', err);
                    return;
                }
                console.log('Appliance id: ' + applianceId + ' created successfully!')
            }
        );
        //}
        //);
    });
}

