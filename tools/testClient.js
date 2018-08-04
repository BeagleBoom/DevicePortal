let fs = require('fs'); 
let https = require('https'); 
let clientConfig = require("../clientCerts/1.json");

let options = { 
    hostname: 'beagleboom.kathke-research.de', 
    port: 3000, 
    path: '/getauthurl', 
    method: 'GET', 
    key: clientConfig.client_key,
    cert: clientConfig.client_cert,
    ca: clientConfig.server_cert
}; 

//console.log(JSON.stringify(options, null, 3));

let req = https.request(options, function(res) { 
    res.on('data', function(data) { 
        let json = JSON.parse(data);
        
        console.log(json.url);
        //process.stdout.write(data); 
    }); 
}); 

req.end(); 
req.on('error', function(e) { 
    console.error(e); 
});