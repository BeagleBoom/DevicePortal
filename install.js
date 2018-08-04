const pem = require("pem");
const fs = require("fs");
let defaultSettings = {
    "webBaseURL": "https://beagleboom.kathke-research.de",
    "hostname": "beagleboom.kathke-research.de",
    "webPort": 9000,
    "apiPort": 8080
};

//Generate a new Server Certificate and add it into the settings.json file
pem.createCertificate({ days: 365, selfSigned: true, organization: "FH Kiel", commonName: defaultSettings.hostname, altNames: defaultSettings.hostname }, function (err, keys) {
    if (err) {
        throw err;
    }

    try {
        defaultSettings = require("./settings.json");
    } catch(err) {
        throw err;
        console.log("No Settings File has been found, creating a new one!");
    }
    

    defaultSettings.key = keys.serviceKey;
    defaultSettings.cert = keys.certificate;
    fs.writeFile("settings.json", JSON.stringify(defaultSettings, null, 2), () => {});
    
    console.log("New certificate has been created!");
    console.log("You can now start using buildClientCert to create a new client certificate ;)");
});
