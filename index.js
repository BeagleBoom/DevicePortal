const path = require('path');
const settings = require("./settings.json");

const oAuth = require('./lib/oAuth')("xloux1Rh5El9wKfBCU2V", "LaSzAOIygKpCRNPXOIAoteGmejJ7JfUvQMi06fFs",   settings.webBaseURL);
const database = require("./lib/fileDB")(path.join(__dirname, "/db/"));

const webserver = require("./lib/webserver")(oAuth, database, settings.webPort);
const secureWebserver = require("./lib/secureWebserver")(path.join(__dirname, "settings.json"),database, settings.apiPort, settings.webBaseURL, settings.hostname);

