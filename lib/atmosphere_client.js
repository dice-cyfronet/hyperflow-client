var https = require('https');
var querystring = require('querystring');

function AtmoClient(atmoLocation, proxy) {
    //TODO: proper handling of atmo URL, https:// etc...
    this.atmoLocation = atmoLocation;
    this.atmoPath = '/api/v1';
    this.basedProxy = new Buffer(proxy).toString('base64');
}

AtmoClient.prototype.newApplianceSet = function (appliances, cb) {
    var data = {
        appliance_set: {
            name: 'workflow',
            optimization_policy: 'manual',
            appliances: []
        }
    };

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

    var postData = JSON.stringify(data);

    //console.log(postData);

    var request = https.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/appliance_sets',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            //'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'PROXY': this.basedProxy
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 201) {
            cb(new Error('error creating appliance set:' + res.toString()));
            //console.log(res);
            return;
        }
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var resData = JSON.parse(chunk);
            //console.log(chunk);
            cb(null, resData.appliance_set.id);
        });
    });

    request.on('error', function (e) {
        console.log("Problem with creating appliance set:", e);
        cb(e);
    });

    request.write(postData);
    request.end();
};


function createClient(atmoLocation, basedProxy) {
    return new AtmoClient(atmoLocation, basedProxy);
}

module.exports.createClient = createClient;