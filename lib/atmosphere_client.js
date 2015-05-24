function AtmoClient(atmoLocation, basedProxy) {
    this.atmoLocation = atmoLocation;
    this.proxy = basedProxy;
}

AtmoClient.prototype.createVm = function (applianceId, configParams) {
    //call atmo and do things...
};

AtmoClient.prototype.destroyVm = function (instanceId) {
    //call atmo and do things...
};

function createClient(atmoLocation, basedProxy) {
    return new AtmoClient(atmoLocation, basedProxy);
}

module.exports.createClient = createClient;