//default service locations
var proxyLocation = process.env.X509_USER_PROXY ? process.env.X509_USER_PROXY : 'user-proxy.pem';
var atmoLocation = process.env.ATMOSPHERE_URL ? process.env.ATMOSPHERE_URL : 'cloud.plgrid.pl';

//default ids of vms
var wfMainId = process.env.WF_MAIN_ID? process.env.WF_MAIN_ID : 19;
var wfWorkerId = process.env.WF_WORDKER_ID ? process.env.WF_WORDKER_ID : 25;


module.exports.proxyLocation = proxyLocation;
module.exports.atmoLocation = atmoLocation;

module.exports.wfMainId = wfMainId;
module.exports.wfWorkerId = wfWorkerId;
