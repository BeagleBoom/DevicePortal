# DevicePortal
The BeagleBoom Device Portal is a webserver/webservice that handels the oAuth authentification process (for mobile devices) by using TLS certificate authentification and oAuth access token redirection.

# Architecture
## Network Architecture
## Software Architecture

# BeagleBoom Authentification Process
# Requirements
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

### **Build the settings.json** and server certificate:
After editing the settings, you have to generate the settingsfile with the BeagleBoom Device API certificate.
For that, just type in your terminal:
```bash
node install.js
```
The settings.json will be now generated in our root directory.

## Step 3 - Generating our BeagleBoom Device Certificates


# TLS Handshake

