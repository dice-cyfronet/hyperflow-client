function AtmoClient(atmoLocation, basedProxy) {
    this.atmoLocation = atmoLocation;
    this.proxy = basedProxy;
}

AtmoClient.prototype.newApplianceSet = function (appliances, cb) {
    var data = {
        optimization_policy: 'manual',
        appliances: []
    };
    appliances.forEach(function(appliance) {
        data.appliances.push(
            {
                configuration_template_id: appliance.applianceId,
                params: appliance.params,
                vms: appliance.vms
            }
        )
    });

    //console.log(JSON.stringify(data));
};


function createClient(atmoLocation, basedProxy) {
    return new AtmoClient(atmoLocation, basedProxy);
}

module.exports.createClient = createClient;