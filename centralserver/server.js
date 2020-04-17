// local module imports
// const rainbowMotherload = require('./rainbowShake');
// const swaggyDatabase = require('./mongoclient');

// external libraries to keep things moving
const express = require('express');
const cors = require('cors');
const https = require('https');

const fs = require('fs');
const mongoose = require('mongoose');
const admin = require('./admin');
//for REST API routings
const agentRoutingRoutesAPI = require('./api-routes/agentrouting');
const superadminAPI = require('./api-routes/superadmin');
const extrasAPI = require('./api-routes/extras');
// For secure HTTPS protocol
let optionsForSSL = {
    key: fs.readFileSync('./certifications/key.pem'),
    cert: fs.readFileSync('./certifications/cert.pem')
};

const app = express();

// Initialises add-ons that app is using
app.use(cors());
app.use(express.json());
app.use('/admin', admin);
app.use('/admin', require('./admin'));
//Declares all the routing for REST API
app.use('/routing', agentRoutingRoutesAPI);
app.use('/superadmin', superadminAPI);
app.use('/extras', extrasAPI);


// redirecting index page to new polished admin page
app.get('/', function (req,res) {
     res.redirect('/admin');
});





// Error handling for invalid paths
app.use((req,res,next) =>{
    const error = new Error("Path Not Found - Refer to our API Documentation");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.send({
        error:{
            message: error.message
        }
    })
});

// runs mongoose async

mongoose.connect("mongodb+srv://tinkit:Happymon10!@sutdproject-gymhx.gcp.mongodb.net/sutdproject?authSource=admin&replicaSet=sutdproject-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", { useNewUrlParser: true })
    .then(() => {
        console.log('🔥Mongoose Connected...');

        // uncomment for heroku
        // let port = process.env.PORT || 8080;
        // app.listen(port, () => {
        //  console.log('Server is running on port ' + port);
        //   });

        let server = https.createServer(optionsForSSL, app);
        server.listen( '3000', () => {
            console.log('Server is running on port 3000');
        });


    })
    .catch(err => console.log(err));






