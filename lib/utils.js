var fs = require('fs'),
    expandHomeDir = require('expand-home-dir'),
    async = require('async');

function readFile(fileLocation, opts, cb) {
    fs.stat(fileLocation, function (err, stats) {
        if (err) {
            cb(new Error(err));
            return;
        }
        if (opts != null && opts.strict) {
            if (stats.mode.toString(8).substring(3, 6) != "600" || stats.uid != process.getuid()) {
                cb(new Error("File has wrong permissions (600 is required) or is not owned by the current user!"));
                return;
            }
        }
        if (stats.size > Math.pow(1024, 2) || !stats.isFile()) {
            cb(new Error('File ' + fileLocation + ' too large or not an ordinary file!'));
        } else {
            fs.readFile(fileLocation, {encoding: 'utf8'}, function (err, fileContents) {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null, fileContents);
            });
        }
    });
}

function loadConfigs(configLocations, cb) {
    async.map(configLocations, function (configLocation, cb) {
        var absoluteConfigLocation = expandHomeDir(configLocation);
        fs.exists(absoluteConfigLocation, function (exists) {
            if (exists) {
                readFile(absoluteConfigLocation, function (err, rawConfig) {
                    if (err) {
                        console.log("Unable to read config from: ", absoluteConfigLocation);
                        cb(null, {});
                        return;
                    }
                    try {
                        cb(null, JSON.parse(rawConfig));
                    } catch (err) {
                        console.log("Unable to parse config from: ", absoluteConfigLocation);
                    }
                });
            } else {
                cb(null, {});
            }
        });
    }, function (err, results) {
        cb(results);
    });
}

var CAs = [
    "-----BEGIN CERTIFICATE-----\n\
MIIF+TCCA+GgAwIBAgIRALD/zzodgkSYFWKdZIhqQWUwDQYJKoZIhvcNAQEMBQAw\n\
gYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpOZXcgSmVyc2V5MRQwEgYDVQQHEwtK\n\
ZXJzZXkgQ2l0eTEeMBwGA1UEChMVVGhlIFVTRVJUUlVTVCBOZXR3b3JrMS4wLAYD\n\
VQQDEyVVU0VSVHJ1c3QgUlNBIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4XDTE0\n\
MTAwOTAwMDAwMFoXDTI0MTAwODIzNTk1OVowZDELMAkGA1UEBhMCTkwxFjAUBgNV\n\
BAgTDU5vb3JkLUhvbGxhbmQxEjAQBgNVBAcTCUFtc3RlcmRhbTEPMA0GA1UEChMG\n\
VEVSRU5BMRgwFgYDVQQDEw9URVJFTkEgU1NMIENBIDIwggEiMA0GCSqGSIb3DQEB\n\
AQUAA4IBDwAwggEKAoIBAQCwOm1/qbgAnvOFOghkLPlEDCC0sxVNBi2m8JPJSL73\n\
ZK2kjhWzMYEUF/xu4osZdYs2Es8HbXZ4Jl4nvywWukL73R5Qj2SvdZsKOoKpMSVR\n\
jn/EQt0fXJORu5T6cFf65/24uGjKm2oZJFQ3/jJhifciwY9j1dFpfklNvNfQ20zW\n\
9g+9wYhCk9aR+Z+WmRHqbnLngCFs8U6O7GO4Pa9lOdCFkip5Og7W6K2bJYmi1C5y\n\
a3Oh0uLfzlhw/8BUAXdd+XadL0PaoibdHUKaTTixVv46tMtrbPJqnz+zrjun0BU+\n\
rCd/G/RZYFBWfp11JZ4/xna//5nM2PGpaolf3ucHzY2LAgMBAAGjggF/MIIBezAf\n\
BgNVHSMEGDAWgBRTeb9aqitKz1SA4dibwJ3ysgNmyzAdBgNVHQ4EFgQUW9CKHJoy\n\
W+C13ZZUG+GGKLD9tr0wDgYDVR0PAQH/BAQDAgGGMBIGA1UdEwEB/wQIMAYBAf8C\n\
AQAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMCwGA1UdIAQlMCMwDQYL\n\
KwYBBAGyMQECAh0wCAYGZ4EMAQIBMAgGBmeBDAECAjBQBgNVHR8ESTBHMEWgQ6BB\n\
hj9odHRwOi8vY3JsLnVzZXJ0cnVzdC5jb20vVVNFUlRydXN0UlNBQ2VydGlmaWNh\n\
dGlvbkF1dGhvcml0eS5jcmwwdgYIKwYBBQUHAQEEajBoMD8GCCsGAQUFBzAChjNo\n\
dHRwOi8vY3J0LnVzZXJ0cnVzdC5jb20vVVNFUlRydXN0UlNBQWRkVHJ1c3RDQS5j\n\
cnQwJQYIKwYBBQUHMAGGGWh0dHA6Ly9vY3NwLnVzZXJ0cnVzdC5jb20wDQYJKoZI\n\
hvcNAQEMBQADggIBAH2QaWZWVBxrPK5/JQgT6btkbPVniC+9wVEKrtNj9i3bcDEJ\n\
AH4di9rkMyGY4CGT28COJY5VBswqZeMD6FlyJ643mph8wvQTWhJxLW2r3zJpgacG\n\
oosgHaiQ0iiqYdT2/6W/hoCOZ5EqIn4dlC0aYbsgIZCJ6NUKEQr2CLpeG8tsKIU+\n\
xRYPZf230bFhwaYl2Ia/Dvqb+tH1IqdnuBUu+Qitt3UCOfQpYfm/wKoX60LeJo+d\n\
ZWQyB95sPTLTA+xH1XRpIDp+uHDvqaIqnFVCtuM+i9j/Jlr7fCZsiIWG15M+UPhE\n\
h9RQ0R1DMDK60rqNIQjK9+7Gbs6SWQgcU3N0j5z4160avk1G7qzEuYHrp1DMHWb8\n\
Dg1+Bh24DtN+u5qHrgu2m4QEzsGgexbfArIYQ62ruSYJq6oEHVA37iq9IkGKALXc\n\
n8MF1OaCTGfaKwL1ZaxZKbt6DE5Ut9I7fQM7IGTGxehQKpKwX6BHl3JYX8EKb5/1\n\
PQnV5whodZLi1biej76NGztDjPNO1VSrdu3MUH8ume20tUn643V9ixFoDdU6+l1Q\n\
sCuBA3gstNuPv0xAW5KjohoKQV2sV/puV070B1XrYwgykwAkSl2dwsFSKJPByCQa\n\
ppP7zX0/pnO8z2ideWMu5yUrQjg2sQtWwopf965KMdnfagbNL6OYCbwFgBPH\n\
-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n\
MIIFhjCCA26gAwIBAgIIV39Xlts+63QwDQYJKoZIhvcNAQEFBQAwMzELMAkGA1UE\n\
BhMCUEwxEDAOBgNVBAoTB1BMLUdyaWQxEjAQBgNVBAMTCVNpbXBsZSBDQTAeFw0x\n\
MDA0MDIxNDA0MjFaFw0zMDA0MDIxNDA0MjFaMDMxCzAJBgNVBAYTAlBMMRAwDgYD\n\
VQQKEwdQTC1HcmlkMRIwEAYDVQQDEwlTaW1wbGUgQ0EwggIiMA0GCSqGSIb3DQEB\n\
AQUAA4ICDwAwggIKAoICAQDE0NE7HS6BfXAkwXJbxdKQ/7/urjWyw49IpxXno4SN\n\
WDa7mFfqDu5pJeY5mw/mAfpirOjshrHouqf34vLRe8en6HTCYADXN23vVICM73QH\n\
PmvSOJoPNQPQImsVYTOSlwyQA8DgRmOUoQ94wZw+yqwwCTJOQJ9ncuLAYJ9myvYG\n\
VqPTN6lznFz6o/YUIPECsZ6JtJIc0ubXtt55thVkhzgce8GNusB0jREQ+KMkQlKx\n\
0xBQLkPJ+GW0cVyJIVW8EC3YHZJnWpmU5CdJn6MTBc76HwTN7IEGELJ3hoPd2lYw\n\
rLol8AWK1kxNCnOXioDrJNialwA1kTb5pE+PTswBnH3z0UEoxISTjbJzwc418TBt\n\
9MKOLSqPMXAjIvTkM1ZFj/fCxUgm/aT/4+19m9tDnnQIO6br4An8qMAsmZRmIWQ/\n\
s2FDVYvhxInJkjtfccFOCYKUMEePl3OCTUgz1K2Aonrg3Iu4dHVWwLZbyersOe32\n\
NBxEH/q2Xy8XYg+cxwokjlyQwrIohkxwIquwFWr/CXLhtGKIBoHnn/+Tt4Vz5eQb\n\
2/Z+Xc1hpXPCYXKyYKKu9d+gBrb2mJ9al/SRzJ+DVRfphcuN6bNsIakb+B8cUwP2\n\
vkh6JNJl7/BmmP9fvZ0adfaI/EQLjo4Angm3dxskzKMNX/PWY0SRInAKxE5MIiEz\n\
vwIDAQABo4GdMIGaMB0GA1UdDgQWBBSpE1FZa0RLf5yh9znM2AH8VFVALTAPBgNV\n\
HRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFKkTUVlrREt/nKH3OczYAfxUVUAtMDcG\n\
A1UdHwQwMC4wLKAqoCiGJmh0dHA6Ly9wbGdyaWQtc2NhLndjc3Mud3JvYy5wbC9j\n\
cmwuZGVyMA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQUFAAOCAgEAi13PWttc\n\
ReDFS9LOX91dhySRQcixT07AJWtys5VDwwy1DjPMwPF+Avanq9JZ5EII3yAvtZ0G\n\
ikSE5OrYB4PC5mnJFwBGDIU/S2RBgwxEJUTAttRXrubyYPk3KBbJoCCQ2JdSY52P\n\
Krde43ykQswHpKls9V3bhwpRZIoJt0e76qBNOuiRf4CUupj5BhRto072qDlWWBfY\n\
BWg6YANwYXJc/+OvwUemEJGmYLT50zQBce7eIE4KcT44NqN5KG5tLMLH4tHfuVPe\n\
n1eabXUu6W//RtlgxgNKjGKrPF7nz36HPLxcOqzEHcD7h2MEWo9vICbipWPmrfyW\n\
5OQ8UrCbXRmRnLodzhJrfXzA69PiZqCYERnu0RsvXLNWFRlQsbNfB5Ju3PJo9jtb\n\
Mi6chpDMOgeogtPJNBw+XtgPha/MMPumOfl2uo1UIoeA1hF1uTGyLG2lDSA1kx+B\n\
XJIJmDdsy/CBItl7zBM5oI9J+UeZp+H3jbRsmBXX6hmcNq3154nMpKV7n/ZfUbFG\n\
Dk6eeapZA7/uqmXGcUAzcs5cPYW2FT02dcf2neU43bP5Z4+H7TpOU+LLVhs6Wdvr\n\
rXaHEPmM8y+Zc9przAguYFseftKKtXwG5s8WC/brfRr5SUrnlYSQnd4LnO4VbDBo\n\
rdb1YMm3y1JWoXT/Ckvtl9xnumA2r8pyg7g=\n\
-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n\
MIIEmTCCA4GgAwIBAgIRAOvwbOH8fkKuoU165IrLxmEwDQYJKoZIhvcNAQELBQAw\n\
ZDELMAkGA1UEBhMCTkwxFjAUBgNVBAgTDU5vb3JkLUhvbGxhbmQxEjAQBgNVBAcT\n\
CUFtc3RlcmRhbTEPMA0GA1UEChMGVEVSRU5BMRgwFgYDVQQDEw9URVJFTkEgU1NM\n\
IENBIDIwHhcNMTQxMTI4MDAwMDAwWhcNMTcxMTI3MjM1OTU5WjA9MSEwHwYDVQQL\n\
ExhEb21haW4gQ29udHJvbCBWYWxpZGF0ZWQxGDAWBgNVBAMTD2Nsb3VkLnBsZ3Jp\n\
ZC5wbDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL282jlSDpKZnlE4\n\
SQUZHW2ppXfR1+/UJs79ur7onOxJ6NWbLKOHECIurqhvhzlLc6/aYkTfck0zxzPd\n\
EVRLxu8+iAclkmH79MtL9QJ5jjjtV58w3ewOpMzX2om1DBG/6ehWbfNt8/kcvTRc\n\
CMhsNzXlBj62QCKGXdZWruzvuaIC0zB3KexO0pGmQIYPLmUUJyfO1PBCTbu1tpc7\n\
UKCvOW40jlMT+NuN3n34AnBxvh52mtiJYMEOlIw94Cu91VsWRiOeTGxFFw19xgau\n\
NXF9Dt7PX3ZnZi5i/L7aXXbHX7uR3+x75M+9rd3rUNRyqeoFRIDbGQypJFokcwvK\n\
0kz0qa0CAwEAAaOCAWswggFnMB8GA1UdIwQYMBaAFFvQihyaMlvgtd2WVBvhhiiw\n\
/ba9MB0GA1UdDgQWBBTTa51i1xU9E2Bsj2F+cFA7EokPtzAOBgNVHQ8BAf8EBAMC\n\
BaAwDAYDVR0TAQH/BAIwADAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIw\n\
IgYDVR0gBBswGTANBgsrBgEEAbIxAQICHTAIBgZngQwBAgEwOgYDVR0fBDMwMTAv\n\
oC2gK4YpaHR0cDovL2NybC51c2VydHJ1c3QuY29tL1RFUkVOQVNTTENBMi5jcmww\n\
bAYIKwYBBQUHAQEEYDBeMDUGCCsGAQUFBzAChilodHRwOi8vY3J0LnVzZXJ0cnVz\n\
dC5jb20vVEVSRU5BU1NMQ0EyLmNydDAlBggrBgEFBQcwAYYZaHR0cDovL29jc3Au\n\
dXNlcnRydXN0LmNvbTAaBgNVHREEEzARgg9jbG91ZC5wbGdyaWQucGwwDQYJKoZI\n\
hvcNAQELBQADggEBAIZ2N/Esz8tGJDtd2OIafc6Kusk0s25f0dpbTr5zrbDKGOWd\n\
zu/FkQMSyXjn0w2uODurF4cLLwcN/n4i6YaSvBABhYonR6uSQyBkAEh3EixQ7bKt\n\
foVwaccmTDD3FSKMdl5om7DeHuJkvScO/jPgEhLVF3rE0WlG+pT8dgLOaiqUJN2H\n\
VHqzJf9v0SPXFHAd4bIOao4KmtSi7we2YizWsREBpwiN9kWRiMBL7faQ/ZcCze0D\n\
m1OgDiFpsyNHDog+2pOT6iBPQ9k16U8CFCqaPDVCKLDyAxmD1QsVcn4UKu/dkwIv\n\
o6ahR3vlZE8/Y5BHiMCb6Ti6mPEORHzo+gvCKrM=\n\
-----END CERTIFICATE-----\n"
];

function getCAs() {
    return CAs;
}

module.exports.readFile = readFile;
module.exports.loadConfigs = loadConfigs;
module.exports.getCAs = getCAs;