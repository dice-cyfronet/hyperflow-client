var http = require('http');
var querystring = require('querystring');

function AtmoClient(atmoLocation, proxy) {
    //TODO: proper handling of atmo URL, https:// etc...
    this.atmoLocation = atmoLocation;
    this.atmoPath = '/api/v1';
    this.basedProxy = new Buffer(proxy).toString('base64');
}

AtmoClient.prototype.newApplianceSet = function (appliances, cb) {
    console.log(this.basedProxy);
    var data = {
        optimization_policy: 'manual',
        appliances: []
    };

    appliances.forEach(function (appliance) {
        data.appliances.push(
            {
                configuration_template_id: appliance.applianceId,
                params: appliance.params,
                vms: appliance.vms
            }
        )
    });

    var postData = querystring.stringify(data);

    var request = http.request({
        hostname: this.atmoLocation,
        path: this.atmoPath + '/appliance_sets',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'PROXY': this.basedProxy
        }
    }, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });

    request.on('error', function(e) {
        console.log("Problem with creating appliance set:", e);
        cb(e);
    });

    request.write(postData);
    request.end();

    //console.log(JSON.stringify(data));
};


function createClient(atmoLocation, basedProxy) {
    return new AtmoClient(atmoLocation, basedProxy);
}

module.exports.createClient = createClient;