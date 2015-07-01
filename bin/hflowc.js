#!/usr/bin/env node

var docopt = require('docopt').docopt,
    atmoClientFactory = require('../lib/atmosphere_client'),
    hyperflowClientFactory = require('../lib/hyperflow_client'),
    fs = require('fs'),
    defaultConfig = require('../lib/hflowc.config.js');

var doc = '\
Usage:\n\
    hflowc setup [-p <proxy_location>]\n\
    hflowc runwf \<hf_location\> \<workflow.json\>\n\
    hflowc teardown [-p <proxy_location>]\n\
    \n\
Options:\n\
    -p <proxy_location> --proxy=<proxy_location>  Location of proxy, defaults to env[X509_USER_PROXY]\n\
    \n\
';

var wfMainId = defaultConfig.wfMainId;
var wfWorkerId = defaultConfig.wfWorkerId;

var proxyLocation = defaultConfig.proxyLocation;
var atmoLocation = defaultConfig.atmoLocation;

function readFile(fileLocation, cb) {
    fs.readFile(fileLocation, {encoding: 'utf8'}, function (err, fileContents) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, fileContents);
    });
}

var opts = docopt(doc);

if (opts.setup) {
    readFile(proxyLocation, function (err, proxy) {
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
                    console.log('hfmain active!');
                    cb(null, virtualMachine);
                    return;
                }
                console.log('hfmain inactive...');
                setTimeout(function () {
                    waitForVirtualMachine(vmId, cb)
                }, 2000);
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
                console.log('WfMain created successfully!');

                var vmId = appliance.virtual_machine_ids[0];
                atmoClient.getVirtualMachine(vmId, function (err, virtualMachine) {
                    if (err) {
                        console.log('Error getting vm!', err);
                        return;
                    }
                    waitForVirtualMachine(vmId, function (err, virtualMachine) {

                        atmoClient.getPortMappings(function (err, portMappings) {
                            var hfIp, hfPort;
                            //console.log(JSON.stringify(portMappings));
                            if (err) {
                                console.log('Error getting port mappings!', err);
                                return;
                            }
                            portMappings.forEach(function (portMapping) {
                                if (portMapping.virtual_machine_id == vmId) {
                                    //found our vm!
                                    hfIp = portMapping.public_ip;
                                    hfPort = portMapping.source_port;
                                    console.log('Found port mapping, hfmain endoint: http://' + hfIp + ':' + hfPort);
                                }
                            });
                        });

                        var internalIp = virtualMachine.ip;
                        var rabbitUrl = 'amqp://' + virtualMachine.ip;
                        var basedProxy = new Buffer(proxy).toString('base64');

                        //start a worker
                        atmoClient.newAppliance(
                            {
                                setId: 53,
                                name: 'wfworker',
                                templateId: wfWorkerId,
                                params: {
                                    rabbitmq_location: rabbitUrl,
                                    proxy: basedProxy
                                }
                            }, function (err, appliance) {
                                if (err) {
                                    console.log('Error creating appliance!', err);
                                    return;
                                }
                                console.log('starting workers...');
                                //timeout possibly?
                                //call hyperflow, start workflow
                            }
                        )
                    });
                });
            }
        );
        //}
        //);
    });
} else if (opts.runwf) {
    var hyperFlowClient = hyperflowClientFactory.createClient(opts['<hf_location>']);

    readFile(opts['<workflow.json>'], function (err, workflow) {
        if (err) {
            console.log('Error reading wf:', err);
            return;
        }

        hyperFlowClient.runWorkflow(workflow, function (err, workflowLocation) {
            if (err) {
                console.log('Error running wf:', err);
                return;
            }
            console.log('workflow started: ', opts['<hf_location>'] + workflowLocation);
        });
    });

} else if (opts.teardown) {
}
