// module imports
const rainbowMotherload = require('./rainbowShake');
const swaggyDatabase = require('./mongoclient');
// external libraries to keep things moving
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

// for REST API routings
const agentRoutingRoutesAPI = require('./api-routes/agentrouting');
const superadminAPI = require('./api-routes/superadmin');
const extrasAPI = require('./api-routes/extras');


let optionsForSSL = {
    key: fs.readFileSync('./certifications/key.pem'),
    cert: fs.readFileSync('./certifications/cert.pem')
};

const app = express();

// Initialises add-ons that app is using
app.use(cors());
app.use(express.json());
// Declares all the routing for REST API
app.use('/routing', agentRoutingRoutesAPI);
app.use('/superadmin', superadminAPI);
app.use('/extras', extrasAPI);


// does a check to see if motherload SDK is ready, proceeds to handle app requests
rainbowMotherload.overlord.events.on('rainbow_onready',async function(){
    // Proceeds to launch the server with SSL enabled @ port: 3000
    let server = https.createServer(optionsForSSL, app);
    server.listen(3000, () => {
        console.log('Server is running on port 3000');
    });

});
