var https = require('https');
var querystring = require('querystring');

var rejectUnauthorized = true;

function AtmoClient(atmoLocation, proxy) {
    //TODO: proper handling of atmo URL, https:// etc...
    this.atmoLocation = atmoLocation;
    this.atmoPath = '/api/v1';
    this.basedProxy = new Buffer(proxy).toString('base64');
    this.proxy = new Buffer(proxy).toString();
}

AtmoClient.prototype.getPortMappings = function (cb) {
    request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/port_mappings/',
        method: 'GET',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 200) {
            cb(new Error('error getting port mappings: ' + res.statusCode + ', ' + res.statusMessage));
            //console.log(res);
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            //console.log('end of response', data);
            var resData = JSON.parse(data);
            cb(null, resData.port_mappings);
        });
    });

    request.on('error', function (e) {
        console.log('Problem with getting port mappings:', e);
        cb(e);
    });

    request.end();
};

AtmoClient.prototype.getPortMappingTemplate = function (portMappingTemplateId, cb) {
    request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/port_mapping_templates/' + portMappingTemplateId,
        method: 'GET',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 200) {
            cb(new Error('error getting port mapping template: ' + res.statusCode + ', ' + res.statusMessage));
            //console.log(res);
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            //console.log('end of response', data);
            var resData = JSON.parse(data);
            cb(null, resData.port_mapping_template);
        });
    });

    request.on('error', function (e) {
        console.log('Problem with getting port mapping template:', e);
        cb(e);
    });

    request.end();
};

AtmoClient.prototype.getVirtualMachine = function (id, cb) {
    request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/virtual_machines/' + id,
        method: 'GET',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 200) {
            cb(new Error('error getting vm: ' + res.statusCode + ', ' + res.statusMessage));
            //console.log(res);
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            //console.log('end of response', data);
            var resData = JSON.parse(data);
            cb(null, resData.virtual_machine);
        });
    });

    request.on('error', function (e) {
        console.log('Problem with getting vm:', e);
        cb(e);
    });

    request.end();
};


AtmoClient.prototype.newAppliance = function (appliance, cb) {
    var data = {
        appliance: {
            appliance_set_id: appliance.setId,
            name: appliance.name,
            configuration_template_id: appliance.templateId,
            params: appliance.params ? appliance.params : []
        }
    };

    var postData = JSON.stringify(data);

    //console.log(postData);

    request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/appliances',
        method: 'POST',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 201) {
            //console.log(res);
            cb(new Error('error creating appliance: ' + res.statusCode + ', ' + res.statusMessage));
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            //console.log('end of response', data);
            var resData = JSON.parse(data);
            cb(null, resData.appliance);
        });
    });

    request.on('error', function (e) {
        console.log('Problem with creating appliance:', e);
        cb(e);
    });

    request.write(postData);
    request.end();
};

AtmoClient.prototype.newApplianceSet = function (name, appliances, cb) {
    var data = {
        appliance_set: {
            name: name,
            //optimization_policy: 'default',
            appliances: []
        }
    };

    if (appliances) {
        appliances.forEach(function (appliance) {
            //data.appliances.push(
            data.appliance_set.appliances.push(
                {
                    configuration_template_id: appliance.applianceId,
                    params: appliance.params,
                    vms: appliance.vms
                }
            )
        });
    }

    var postData = JSON.stringify(data);

    //console.log(postData);

    var request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/appliance_sets',
        method: 'POST',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 201) {
            cb(new Error('error creating appliance set: ' + res.statusCode + ', ' + res.statusMessage));
            //console.log(res);
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            //console.log('end of response', data);
            var resData = JSON.parse(data);
            cb(null, resData.appliance_set);
        });
    });

    request.on('error', function (e) {
        console.log('Problem with creating appliance set:', e);
        cb(e);
    });

    request.write(postData);
    request.end();
};

AtmoClient.prototype.getApplianceSets = function (cb) {
    var request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/appliance_sets',
        method: 'GET',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 200) {
            cb(new Error('error getting appliance sets: ' + res.statusCode + ', ' + res.statusMessage));
            //console.log(res);
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            //console.log('end of response', data);
            var resData = JSON.parse(data);
            cb(null, resData.appliance_sets);
        });
    });

    request.on('error', function (e) {
        console.log('Problem with getting appliance sets:', e);
        cb(e);
    });

    request.end();
};

AtmoClient.prototype.deleteApplianceSet = function (applianceSetId, cb) {
    var request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/appliance_sets/' + applianceSetId,
        method: 'DELETE',
        rejectUnauthorized: rejectUnauthorized,
        cert: this.proxy,
        key: this.proxy,
        headers: {
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 200) {
            cb(new Error('error deleting appliance sets: ' + res.statusCode + ', ' + res.statusMessage));
            //console.log(res);
            return;
        }
        cb(null);
    });

    request.on('error', function (e) {
        console.log('Problem with deleting appliance sets:', e);
        cb(e);
    });

    request.end();
};


function createClient(atmoLocation, basedProxy) {
    return new AtmoClient(atmoLocation, basedProxy);
}

module.exports.createClient = createClient;