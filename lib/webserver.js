module.exports = (oAuth, database, serverPort = 8080) => {
    const http = require('http');
    const url = require('url');
    const path = require("path");
    const fs = require("fs");
	const qr = require('qr-image');

    function serveFile(pathname, res) {
        const toServe = path.join(__dirname, "..", "static", pathname === "/" ? "index.html" : pathname);

        if (fs.existsSync(toServe)) {
            let fileInfo = fs.statSync(toServe);
            if (fileInfo) {
                let mimetype = toServe.indexOf(".htm") > 0 ? 'text/html' : '';

                res.writeHead(200, {
                    'Content-Length': fileInfo.size,
                    'Content-Type' : mimetype
                });
                fs.createReadStream(toServe).pipe(res);
                return;
            }
        }
        res.writeHead(404);
        res.end();
    }

    let pages = {
        "/poll": async (req, res, url) => {
            let bbid = url.query["bbid"];
            if (bbid === undefined) {
                //res.writeHead(400);
                res.write(JSON.stringify({
                    code: 400,
                    message: "Parameter bbid is missing!",
					authed : false
                }));
                return true;
            }

            let config = database.getConfigById(bbid);
            if (config === undefined) {
                //res.writeHead(204);
                res.write(JSON.stringify({
                    code: 204,
                    message: "BeagleBoom is not registered",
					authed : false
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
                            access_token: newAccessToken.token.access_token,
							authed : true
                        }
                    ));
                } else { // On Error:
                    //res.writeHead(407);
                    res.write(JSON.stringify(
                        {
                            code: 407,
                            message: "You need to reauthorize with FreeSound",
							authed : false
                        }
                    ));
                }
            } else {
                //res.writeHead(200);
                res.write(JSON.stringify(
                    {
                        code: 200,
                        access_token: config.access_token,
						authed : true
                    }
                ));
            }

            return true;

        },

        "/authorize": (req, res, url) => {
            let web_token = url.query["web_token"];

            let bbconfig = database.getConfigByWebtoken(web_token);
            if(Object.keys(bbconfig).length < 1 || bbconfig.bbid === undefined) {
                res.writeHead(400);
                res.write("web_token invalid")
                res.end();
            } 

            let redirectURL = oAuth.authorize(bbconfig.bbid);
            if (redirectURL) {
                res.writeHead(302, {
                    'Location': redirectURL
                });
                return true;
            } else {
                return false;
            }
        },
        "/link": (req, res, url) => {
            serveFile("/link.html", res);
            return false;
        },
        "/link/granted": async (req, res, url) => {
            let code = url.query["code"];
            let bbid = url.query["state"];

            if (code == undefined) return false;
            const result = await (oAuth.getAccessToken(code));
            if (result && result.token && bbid) {
                database.updateConfigById(bbid, result.token);

                res.writeHead(302, {
                    'Location': "/link/success"
                });
                return true;
            }
        },
        "/link/success": (req, res, url) => {
            serveFile("/successfull.html", res);
            return false;
        },
		"/getauthurl": (req,res,url2) => {
			
			let url = "http://beagleboom.kathke-research.de/authorize?bbid=1";
			
			

			//var qr_svg = qr.image(url, { type: 'svg' });
			//qr_svg.pipe(require(‘fs’).createWriteStream(‘i_love_qr.svg’));

			let svg_string = qr.imageSync(url, { type: 'svg' });
			res.write(JSON.stringify({code: 200, image: svg_string, url: url}));
			res.end();
			console.log(svg_string);
			
		
		},
		"/isauthed": (req, res, url) => {
            res.write(JSON.stringify({ authed : true}));
			res.end();
            return false;
        },

    }

    const server = http.createServer(async function (req, res) {
        let url_parts = url.parse(req.url, true);
        let pathname = url_parts.pathname;
        let query = url_parts.query;

        if (pages[pathname.toLowerCase()] != undefined) {
            let response = await (pages[pathname](req, res, url_parts));
            if (response) {
                res.end();
            }
        } else {
            serveFile(pathname, res);
        }

    });

    server.listen(serverPort,  function () {
        console.log((new Date()) + " Server is listening on port " + serverPort);
    });
};