var http = require('http');
var url = require('url');

function HyperFlowClient(location) {
    this.hyperFlowUrl = url.parse(location);
    this.hyperFlowPath = '/apps';
}


HyperFlowClient.prototype.runWorkflow = function (workflow, cb) {
    //console.log(postData);

    request = http.request({
        hostname: this.hyperFlowUrl.hostname,
        port: this.hyperFlowUrl.port,
        path: this.hyperFlowPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': workflow.length,
        }
    }, function (res) {
        //console.log(res.statusCode);
        if (res.statusCode != 201) {
            cb(new Error('error running wf:' + res.toString()));
            //console.log(res);
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

function createClient(atmoLocation, basedProxy) {
    return new HyperFlowClient(atmoLocation, basedProxy);
}

module.exports.createClient = createClient;