const path = require('path');
const settings = require("./settings.json");

const oAuth = require('./lib/oAuth')(settings.freesound_app_id, settings.freesound_app_secret,   settings.webBaseURL);
const database = require("./lib/fileDB")(path.join(__dirname, "/db/"));

const webserver = require("./lib/webserver")(oAuth, database, settings.webPort);
const secureWebserver = require("./lib/secureWebserver")(path.join(__dirname, "settings.json"),database, settings.apiPort, settings.webBaseURL, settings.hostname);

