//default service locations
var proxyLocation = process.env.X509_USER_PROXY ? process.env.X509_USER_PROXY : 'user-proxy.pem';
var atmoLocation = process.env.ATMOSPHERE_URL ? process.env.ATMOSPHERE_URL : 'cloud.plgrid.pl';

//default ids of vms
var wfMainId = process.env.WF_MAIN_ID ? process.env.WF_MAIN_ID : 34;
var wfWorkerId = process.env.WF_WORDKER_ID ? process.env.WF_WORDKER_ID : 35;

var wfApplianceSetName = 'hfworkflow';

//default location of user stored config for hflowc
var configLocations = [
    '~/.hflow.config.json'
];


module.exports.default_config = {
    proxyLocation: proxyLocation,
    atmoLocation: atmoLocation,
    wfMainId: wfMainId,
    wfWorkerId: wfWorkerId,
    wfApplianceSetName: wfApplianceSetName
};

module.exports.configLocations = configLocations;