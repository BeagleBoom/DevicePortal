const https = require('https');
const fs = require('fs');
const hat = require('hat');
const qr = require('qr-image');
const url = require('url');
const path = require("path");

let bb_authorize_url = "";
let database = {};

const pages = {
    "/poll": async (req, res, url, certificate) => {

        let bbid = certificate.serialNumber;

        if (bbid === undefined) {
            res.write(JSON.stringify({
                code: 400,
                message: "BBID is missing!"
            }));
            return true;
        }

        let config = database.getConfigById(bbid);
       
        if (config === undefined || Object.keys(config).length < 1) {
            res.write(JSON.stringify({
                code: 204,
                message: "BeagleBoom is not registered"
            }));
            return true;
        }

        let currentTime = new Date();
        if ((typeof config.expires_at) == "string") {
            config.expires_at = new Date(config.expires_at);
        }

        // Has Access Token been expired?
        if (config.expires_at <= currentTime) {
            // Refresh Token
            let newAccessToken = await oAuth.refreshAccessToken(bbid, config);

            if (newAccessToken && newAccessToken.token) { //Saving and Sending new Access Token        
                database.updateConfigById(bbid, newAccessToken.token);
                //res.writeHead(201);
                res.write(JSON.stringify(
                    {
                        code: 201,
                        access_token: newAccessToken.token.access_token
                    }
                ));
            } else { // On Error:
                //res.writeHead(407);
                res.write(JSON.stringify(
                    {
                        code: 407,
                        message: "You need to reauthorize with FreeSound"
                    }
                ));
            }
        } else {
            //res.writeHead(200);
            res.write(JSON.stringify(
                {
                    code: 200,
                    access_token: config.access_token,
                    expires_at: config.expires_at
                }
            ));
        }
        return true;
    },
    "/getauthurl": (req, res, url2, certificate) => {
        let bbid = certificate.serialNumber;

        if(bbid === undefined)  {
            res.writeHead(400);
            res.write("BeagleBoom not recognized");
            res.end();
            return;
        }
        
        let config = database.getConfigById(bbid);
        if(config === undefined || config.web_token === undefined) {
            let web_token = hat();
            config = database.updateConfigById(bbid, {web_token: web_token});
            config.web_token = web_token;
        }

        let authURL = bb_authorize_url + config.web_token;
        //console.log(certificate);

        //var qr_svg = qr.image(url, { type: 'svg' });
        //qr_svg.pipe(require(‘fs’).createWriteStream(‘i_love_qr.svg’));

        let svg_string = qr.imageSync(authURL, { type: 'svg' });
        res.write(JSON.stringify({ code: 200, image: svg_string, url: authURL }));
        res.end();
        console.log(svg_string);


    },
}

function serveFile(pathname, res) {
    const toServe = path.join(__dirname, "..", "static", pathname === "/" ? "index.html" : pathname);

    if (fs.existsSync(toServe)) {
        let fileInfo = fs.statSync(toServe);
        if (fileInfo) {
            res.writeHead(200, {
                'Content-Length': fileInfo.size
            });
            fs.createReadStream(toServe).pipe(res);
            return;
        }
    }
    res.writeHead(404);
    res.end();
}

module.exports = (settingsFilePath, db, serverPort = 443, webBaseURL, hostname) => {
    let settings = require(settingsFilePath);
    database = db;
    bb_authorize_url = webBaseURL + "/authorize?web_token=";

    console.log(settingsFilePath);
    if (!fs.existsSync(settingsFilePath)) { throw new Error('SecureWebserver: Settings file does not exist! (' + settingsFilePath + ")"); }

    let options = {
        key: settings.key,
        cert: settings.cert,
        ca: settings.cert,
        requestCert: true, 
        rejectUnauthorized: true,
        hostname: hostname
    };

    https.createServer(options, async (req, res) => {
        //res.writeHead(200);
        //res.end('I am Running\n');

        let url_parts = url.parse(req.url, true);
        let pathname = url_parts.pathname;
        let query = url_parts.query;
        let certificate = req.socket.getPeerCertificate();

        if (Object.keys(certificate).length < 1) {
            res.writeHead(400);
            res.write("No Peer Certificate sent.");
            res.end();
            return;
        } else {
            if (pages[pathname.toLowerCase()] != undefined) {
                let response = await (pages[pathname](req, res, url_parts, certificate));
                if (response) {
                    res.end();
                }
            } else {
                serveFile(pathname, res);
            }
        }

    }).listen(serverPort, hostname);

    return {};
}