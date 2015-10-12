var https = require('https');
var url = require('url');

function HyperFlowClient(location, basedProxy) {
    this.hyperFlowUrl = url.parse(location);
    this.basedProxy = basedProxy;
    this.hyperFlowPath = '/apps';
}


HyperFlowClient.prototype.runWorkflow = function (workflow, cb) {
    //console.log(postData);

    request = https.request({
        hostname: this.hyperFlowUrl.hostname,
        port: this.hyperFlowUrl.port,
        path: this.hyperFlowPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': workflow.length,
            'PROXY': this.basedProxy
        },
        rejectUnauthorized: false
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 201) {
            //console.log(res);
            cb(new Error('error running wf:' + res.statusCode + ', ' + res.statusMessage));
            return;
        }
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            cb(null, res.headers.location);
        });
    });

    request.on('error', function (e) {
        //console.log("Problem running wf:", e);
        cb(e);
    });

    request.write(workflow);
    request.end();
};

function createClient(hfLocation, basedProxy) {
    return new HyperFlowClient(hfLocation, basedProxy);
}

module.exports.createClient = createClient;