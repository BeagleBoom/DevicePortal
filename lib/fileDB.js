const fs = require('fs');
const path = require('path');

let datastore = {};
let memoryDatastore = {};

module.exports = (dbPath) => {
    if (!fs.existsSync(dbPath)) {
        console.log("Directory " + dbPath + " does not exist, creating it now");
        fs.mkdirSync(dbPath);
    }

    console.log("Loading Database");

    try {
        fs.readdirSync(dbPath).forEach(function (file) {
            datastore = Object.assign(datastore, require(path.join(dbPath, file)));
        });
        console.log("Database successfully loaded");
    } catch(err) {
        console.log("Database can not be loaded! | Err: " + err);
    }
    
    let that = {
        getConfigById: (id) => {
            let bbconfig = datastore[id];
            if(bbconfig === undefined) return {};
            if(bbconfig.web_token !== undefined && memoryDatastore[bbconfig.web_token] === undefined) {
                memoryDatastore[bbconfig.web_token] = id;
            }  
            return datastore[id];
        },
        getConfigByWebtoken: (web_token, shouldDelte) => {
            let bbid = memoryDatastore[web_token];
            if(bbid === undefined) {
                return {};
            } else {
                delete memoryDatastore[web_token];
                let bbconfig = that.getConfigById(bbid);
                if(bbconfig === undefined) {
                    return {};
                } else {
                    return Object.assign(bbconfig, {bbid : bbid});
                }
            }
        },
        updateConfigById: (id, config) => {
            let data = { [id]: config };
            fs.writeFile(path.join(dbPath, id + ".json.tmp"), JSON.stringify(data, null, 3), function (err) {
                if (err) {
                    console.log("Error on writing Config for id=" + id + " | Err: " + err);
                } else {
                    fs.renameSync(path.join(dbPath, id + ".json.tmp"), path.join(dbPath, id + ".json"));
                }
            });
            datastore = Object.assign(datastore, data);

            let web_token_data = { [datastore[id].web_token]: id };
            memoryDatastore = Object.assign(memoryDatastore,web_token_data);

            return datastore[id];
        }

    };
    return that;
};