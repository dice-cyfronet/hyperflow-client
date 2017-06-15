var atmoClientFactory = require('../lib/atmosphere_client'),
    crypto = require('crypto'),
    async = require('async');

function AtmoProvider(configuration) {
    this.configuration = configuration;
}

AtmoProvider.prototype.createInfrastructure = function () {
    var config = this.configuration;

    var atmoLocation = config.provider.url;
    var proxy = config.provider.proxy;
    var workerCount = config.resources.Worker.count;
    var wfApplianceSetName = config.provider.setname;
    var typeMapping = config.provider.typeMappings;

    var atmoClient = atmoClientFactory.createClient(atmoLocation, proxy);
    var basedProxy = new Buffer(proxy).toString();
    var applianceSetId;
    var shasum = crypto.createHash('sha512');
    shasum.update(proxy);
    var shaProxy = shasum.digest('hex');

    var wfMainTypeId = typeMapping[config.resources.HyperFlow.type];
    var wfWorkerTypeId = typeMapping[config.resources.Worker.type];

    //create appliance set
    atmoClient.newApplianceSet(wfApplianceSetName, null, function (err, applianceSet) {
        if (err) {
            console.log('Error creating appliance set!', err);
            return;
        }
        console.log('Appliance set ' + applianceSet['name'] + ' created successfully!');
        applianceSetId = applianceSet.id;


        function waitForVirtualMachine(vmId, cbWait, cb) {
            atmoClient.getVirtualMachine(vmId, function (err, virtualMachine) {
                if (err) {
                    cb(err);
                    return;
                }
                if (virtualMachine.state == 'active') {
                    cb(null, virtualMachine);
                    return;
                }
                cbWait();
                setTimeout(function () {
                    waitForVirtualMachine(vmId, cbWait, cb)
                }, 2000);
            });
        }

        function waitForAppliance(applianceId, cbWait, cb) {
            atmoClient.getAppliance(applianceId, function (err, appliance) {
                if (err) {
                    cb(err);
                    return;
                }
                if (appliance.virtual_machine_ids.length > 0) {
                    cb(null, appliance);
                    return;
                }
                cbWait();
                setTimeout(function () {
                    waitForAppliance(applianceId, cbWait, cb)
                }, 500);
            });
        }

        //create wfMain vm
        atmoClient.newAppliance(
            {
                setId: applianceSetId,
                name: 'wfmain',
                templateId: wfMainTypeId,
                params: {
                    proxy: basedProxy
                }
            }, function (err, appliance) {
                if (err) {
                    console.log('Error creating appliance!', err);
                    return;
                }
                console.log('WfMain created successfully!');

                //wait for wfMain to become active

                var applianceId = appliance.id;
                //var vmId = appliance.virtual_machine_ids[0];

                waitForAppliance(applianceId, function () {
                    process.stdout.write('.');
                }, function (err, appliance) {
                    if (err) {
                        console.log('Error getting appliance info!', err);
                        return;
                    }
                    console.log('wfMain has vmId!');
                    var vmId = appliance.virtual_machine_ids[0];
                    atmoClient.getVirtualMachine(vmId, function (err, virtualMachine) {
                        if (err) {
                            console.log('Error getting vm!', err);
                            return;
                        }
                        process.stdout.write('waiting for wfMain to start');
                        waitForVirtualMachine(vmId, function () {
                            process.stdout.write('.');
                        }, function (err, virtualMachine) {
                            if (err) {
                                console.log('Error waiting for vm!', err);
                                return;
                            }

                            console.log('wfMain is active!');
                            //get and print hf location
                            atmoClient.getPortMappings(function (err, portMappings) {
                                var hfIp,
                                    hfPort,
                                    portMappingTemplateId;
                                if (err) {
                                    console.log('Error getting port mappings!', err);
                                    return;
                                }
                                portMappings.forEach(function (portMapping) {
                                    if (portMapping.virtual_machine_id == vmId) {
                                        //found our vm!
                                        hfIp = portMapping.public_ip;
                                        hfPort = portMapping.source_port;
                                        portMappingTemplateId = portMapping.port_mapping_template_id;
                                        atmoClient.getPortMappingTemplate(portMappingTemplateId, function (err, portMappingTemplate) {
                                            if (err) {
                                                console.log('Error getting port mapping template!', err);
                                                return;
                                            }
                                            var targetPort = portMappingTemplate.target_port;
                                            if (targetPort == 443) {
                                                console.log('Found port mapping ' + hfPort + '->' + targetPort + ', hfmain endoint: http://' + hfIp + ':' + hfPort);
                                            }
                                        });
                                    }
                                });
                            });

                            var rabbitUrl = 'amqp://hf:' + shaProxy + '@' + virtualMachine.ip + "/%2f";

                            //start workers

                            async.times(workerCount, function (n, cb) {
                                var workerName = 'wfworker_' + n;
                                atmoClient.newAppliance(
                                    {
                                        setId: applianceSetId,
                                        name: workerName,
                                        templateId: wfWorkerTypeId,
                                        params: {
                                            rabbitmq_location: rabbitUrl,
                                            proxy: basedProxy
                                        }
                                    }, function (err, appliance) {
                                        if (err) {
                                            console.log('Error creating worker!', err);
                                            cb(err);
                                            return;
                                        }
                                        console.log('starting ' + workerName);
                                        cb(null);
                                    }
                                )
                            }, function (err, results) {
                                if (err) {
                                    console.log('Error creating workers!', err);
                                    return;
                                }
                                console.log('Workers created');
                            });
                        });
                    });
                });
            }
        );
    });
};

AtmoProvider.prototype.destroyInfrastructure = function () {
    var atmoClient = atmoClientFactory.createClient(this.configuration.provider.url, this.configuration.provider.proxy);
    var that = this;

    atmoClient.getApplianceSets(function (err, applianceSets) {
        if (err) {
            console.log('Error getting appliance sets!', err);
            return;
        }
        var setsToRemove = {};
        applianceSets.forEach(function (applianceSet) {
            if (applianceSet['name'] == that.configuration.provider.setname) {
                setsToRemove[applianceSet.id] = applianceSet['name'];
            }
        });

        //let's remove appliance sets
        if (Object.keys(setsToRemove).length != 0) {
            async.map(Object.keys(setsToRemove), function (applianceSetId, cb) {
                console.log('Removing appliance set: ' + setsToRemove[applianceSetId]);
                atmoClient.deleteApplianceSet(applianceSetId, function (err) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb();
                });
            }, function (err, result) {
                if (err) {
                    console.log('Error deleting appliance set!', err);
                    return;
                }
                console.log('Done.');
            });
        } else {
            console.log('Nothing to do.');
        }
    });
};

function createProvider(configuration) {
    return new AtmoProvider(configuration);
}

module.exports.createProvider = createProvider;