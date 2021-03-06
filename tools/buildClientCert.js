const fs = require("fs");
const path = require("path");
const pem = require("pem");

const certDirectory = path.join(__dirname, "../clientCerts/");
const settingsFilePath = path.join(__dirname, "../settings.json");

if (process.argv.length < 3) throw new Error("Missing BeagleBoom ID Parameter, you have to pass a Client BeagleBoom ID, e.g. node buildClientCert MyBeagleBoomID");
let bbid = process.argv[2];

if (!fs.existsSync(settingsFilePath)) { throw new Error('Settings file does no t exist! (' + settingsFilePath + ")"); }
var settings = require(settingsFilePath);

createClientCert(bbid);

function createClientCert(id) {

    pem.createCertificate({
        serviceKey: settings.key,
        serviceCertificate: settings.cert,
        serial: id
    }, function (err, keys) {
        let tokenData = { ca: settings.cert };
        tokenData.key = keys.clientKey;
        tokenData.cert = keys.certificate;

        console.log("Client Key:\n", tokenData.key);
        console.log("Client Cert:\n", tokenData.cert);

        if (!fs.existsSync(certDirectory)) {
            fs.mkdirSync(certDirectory);
        }

        fs.writeFile(path.join(certDirectory, id + ".json"), JSON.stringify({freesound: {baseUrl: "https://" + settings.hostname + ":" + settings.apiPort , certificate: tokenData }}, null, 2), () => {});
    });
}