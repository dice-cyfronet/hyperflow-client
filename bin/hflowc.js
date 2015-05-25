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

        function waitForVirtualMachine(vmId, cb) {
            atmoClient.getVirtualMachine(vmId, function (err, virtualMachine) {
                if (err) {
                    console.log('Error getting vm!', err);
                    return;
                }
                if (virtualMachine.state == 'active') {
                    console.log('vm active');
                    cb(null, virtualMachine);
                    return;
                }
                console.log('vm inactive');
                setTimeout(function () {
                    waitForVirtualMachine(vmId, cb)
                }, 1000);
            });
        }

        atmoClient.newAppliance(
            {
                //setId: applianceSetId,
                setId: 53,
                name: 'wfmain',
                templateId: wfMainId
            }, function (err, appliance) {
                if (err) {
                    console.log('Error creating appliance!', err);
                    return;
                }
                console.log('Appliance: ' + appliance.id + ' created successfully!');

                var vmId = appliance.virtual_machine_ids[0];
                atmoClient.getVirtualMachine(vmId, function (err, virtualMachine) {
                    if (err) {
                        console.log('Error getting vm!', err);
                        return;
                    }
                    var hfIp, hfPort;
                    atmoClient.getPortMappings(function (err, portMappings) {
                        if (err) {
                            console.log('Error getting port mappings!', err);
                            return;
                        }
                        portMappings.forEach(function (portMapping) {
                            if (portMapping.virtual_machine_id == vmId) {
                                //found our vm!
                                hfIp = portMapping.public_ip;
                                hfPort = portMapping.source_port;
                                console.log('Found port mapping', hpIp, hfPort);
                            }
                        });
                    });
                    waitForVirtualMachine(vmId, function(err, virtualMachine) {
                        var internalIp = virtualMachine.ip;
                        //launch workers and workflow
                    });
                });
            }
        );
        //}
        //);
    });
}

