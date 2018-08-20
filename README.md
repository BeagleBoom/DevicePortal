# ![alt text](static/img/logo2.png "BeagleBoom Device Portal")

The BeagleBoom Device Portal is a webserver/webservice that handles the oAuth authentification process (for mobile devices) by using TLS certificate authentification and oAuth access token redirection.

# Overview
## Authentification Process Scheme
The following scheme shows an overview of the authentification process:
![Authentication Process Scheme](docs/auth_process.png "Authentication Process Scheme")


## TLS Authentification
The BBDP (BeagleBoom Device Portal) uses for it's BeagleBoom API communication a secure tls connection with client authentification.
When the BeagleBoom connects to the device Portal, the portal sends it's certificate to the device. The BeagleBoom verifies it (it's deposited into it's config file)
and sends it's own certificate (which is signed by the Device Protal certificate) to the device Portal. The BeagleBoom's certificate also contains a serial number.
This serial number is used to assign it with your oAuth registration data.

You can read more about nodejs client authentification on https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2

# Requirements
* vServer/Root Server with
    * Node.js (v.10+)
    * An internet domain
        * (Optional) a valid domain-certificate for the **User Device Portal**
    * An unused tcp port for the **BeagleBoom Device authentification** (a reverse proxy for the device authentification is not supported)
    * An unused tcp port or a reverse proxy (like nginx) for the **User Device Portal**
        * The Device Portal uses HTTP, if you you want to use HTTPS you need a reverse proxy

# Dependencies
BeagleBoom Device Portal is using the following dependencies:
* hat (0.0.3)
* oauth (^0.9.15)
* pem (^1.12.5)
* qr-image (^3.2.0")
* simple-oauth2 

# Installation
## Step 1 - Install the dependencies
```
npm install
```
## Step 2 - Configuration
### Insert your settings

Open the **install.js** file and insert your
* webBaseURL (Base URI with protocol, to reach the User Portal)
* hostname (Your hostname for the BeagleBoom Device API, TLS Authentification)
* webPort (Port for the User Portal)
* apiPort (Port for the BeagleBoom Device API)
* freesound_app_id (Your Freesound App ID)
* freesound_app_secret (Your Freesound App Secret)

An Example:
```javascript
let defaultSettings = {
    "webBaseURL": "https://beagleboom.kathke-research.de",
    "hostname": "beagleboom.kathke-research.de",
    "webPort": 9000,
    "apiPort": 8080,
    "freesound_app_id": "MyAPPId",
    "freesound_app_secret" : "MyAPPSecret"
};
```

### **Build your settings.json** and server certificate:
After editing the settings, you have to generate the settingsfile with the BeagleBoom Device API certificate.
For that, just type in your terminal:
```bash
node install.js
```
The settings.json will be generated in the root directory.

## Step 3 - Generating our BeagleBoom Device Certificates
For each BeagleBoom Device we have to generate an own client certificate. This will be used to authenticate on our Device API.
Each BeagleBoom Device needs to have an unique certificate serial/ID (The serial is being used to assign your oAuth Access Token with your BeagleBoom Device)

You can generate a new BeagleBoom Device certificate by using our certificate builder (replace **1337** with an unique number):
```bash
cd tools
node buildClientCert.js 1337
```

The certificate will be stored in a json file (e.g. /clientCerts/1337.json)

## Step 4 - Insert your Device Certificate into your BeagleBoom
To store the generated certificate on your BeagleBoom and enter the Device API URL,
you have to edit the setting.json file in the application directory of the **Menu** project.

Copy your certificate data (from /clientCerts/xxx.json):
```json
{
  "freesound": {
    "baseUrl": "https://beagleboom.kathke-research.de:8080",
    "certificate": {
        "ca": "-----BEGIN CERTIFICATE-----\r\nMIIC8DCCAdgCCQDLR...",
        "key": "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpAIBAAKCAQ...",
        "cert": "-----BEGIN CERTIFICATE-----\r\nMIICwzCCAasCAhM3M..."
    }
}
```
to the **menu's** settings.json file:

```json
{
  "freesound": {
    "baseUrl": "https://beagleboom.kathke-research.de:8080",
    "certificate": {
      "ca": "-----BEGIN CERTIFICATE-----\r\nMIIC8DCCAdgCCQDLR...",
        "key": "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpAIBAAKCAQ...",
        "cert": "-----BEGIN CERTIFICATE-----\r\nMIICwzCCAasCAhM3M..."
    }
  },
  "tmpDownloadFile": "./files/tmp/downloaded.mp3",
  "defaultAudioFile": "./files/tmp/output.wave",
  "midi_device": "MIDIPLUS61U"
}
```

# Start the Device Portal
To start the Device Portal, you just have to run the node.js application with:
```bash
    node .
```

Make sure your configured ports are available. 
To check, if the Device Portal is running, just open http://localhost:9000/ (9000 is your configured webPort)

# BeagleBoom Device Portal API Endpoints
| Endpoint    	| Description                           	| Example Output                                                                         	| Example Description                                          	|
|-------------	|---------------------------------------	|----------------------------------------------------------------------------------------	|--------------------------------------------------------------	|
| /poll       	| Gets the FreeSound Access Token       	| {    code: 200,    access_token: "XYZ...",    expires_at: "2018-08-20T07:43:16.952Z" } 	| Gets the Access Token from oAuth registration                   	|
| /poll       	|                                       	| {    code: 201,    access_token: "XYZ..." }                                            	| Renewed Access Token (old one has been expired)              	|
| /poll       	|                                       	| {    code: 204,    message: "BeagleBoom is not registered" }                           	| No oAuth registration occurred on this BeagleBoom                     	|
| /poll       	|                                       	| {    code: 407,    message: "You need to reauthorize with FreeSound" }                 	| Can not get a new Access Token from FreeSound                	|
| /getauthurl 	| Gets the oAuth User Regristration URL 	| {    code: 200,    image: "SVG_IMAGE_DATA",    url: "http://...RegistrationURL" }      	| Ok, gets generated QR Code as SVG Image and Registration URL 	|
| /getauthurl 	|                                       	| HTTP-Code: 400 Content: BeagleBoom not recognized                                      	| BeagleBoom Cetificate has no valid serialNumber              	|
