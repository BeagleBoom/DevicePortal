# DevicePortal
The BeagleBoom Device Portal is a webserver/webservice that handels the oAuth authentification process (for mobile devices) by using a TLS certificate authentification and oAuth access token redirection.

# Overview
## Authentification Process
## Software Architecture
## Network Architecture

# Requirements
* vServer/Root Server with
    * Node.js (v.10+)
    * An internet domain
        * (Optional) a valid domain-certificate for the **User Device Portal**
    * An unsed tcp port for the **BeagleBoom Device authentification** (a reverse proxy for the device authentification is not supported)
    * An unsed tcp port or a reverse proxy (like nginx) for the **User Device Portal**
        * The Device Portal uses HTTP, if you you want to use HTTPS you need an reverse proxy

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

# BeagleBoom Authentification Process
## TLS Handshake
