#!/usr/bin/env node

var docopt = require('docopt').docopt;

var doc='\
Usage:\n\
    hflowc run \<wf_file.json\>\n\
';

var opts = docopt(doc);

var proxyLocation = process.env.X509_USER_PROXY;
var proxyLocation = process.env.ATMOSPHERE_URL;

var atmoClientFactory = require('../lib/atmosphere_client');

atmoClient = atmoClientFactory.createClient('http://localhost', 'ASCASVCAS=');

atmoClient.createVm(98, {});