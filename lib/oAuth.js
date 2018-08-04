// Initialize the OAuth2 Library
let oAuthConfig = {
    auth: {
        tokenHost: 'https://freesound.org/',
        authorizePath: '/apiv2/oauth2/authorize/',
        tokenPath: '/apiv2/oauth2/access_token/'
    }
};


module.exports = (client_id, client_secret, redirect_uri) => {
    redirect_uri += "/link/granted";
    
    oAuthConfig = Object.assign(oAuthConfig, {
        client: {
            id: client_id,
            secret: client_secret
        }
    });
    const oauth2 = require('simple-oauth2').create(oAuthConfig);


    return {
        "authorize": (id) => {
            if (id) {
                return oauth2.authorizationCode.authorizeURL({
                    redirect_uri: redirect_uri,
                    // scope: '', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
                    state: id
                });
            } else {
                return false;
            }
        },
        "refreshAccessToken": async (id, accessTokenData) => {
            let accessToken = oauth2.accessToken.create(accessTokenData);
            try {
                accessToken = await accessToken.refresh();
                return accessToken;
            } catch (error) {
                console.log('Error refreshing access token (' + id + '): ', error.message);
                return false;
            }
        },
        "getAccessToken": async (code) => {
            const tokenConfig = {
                code: code,
                //scope: '<scope>', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
                client_id: oAuthConfig.client.id,
                client_secret: oAuthConfig.client.secret
            };

            // Gets the access token
            try {
                let result = await (oauth2.authorizationCode.getToken(tokenConfig));
                const accessToken = oauth2.accessToken.create(result);
                return accessToken;
            } catch (error) {
                console.log('Access Token Error', error.message);
                return null;
            }
        }
    }
}