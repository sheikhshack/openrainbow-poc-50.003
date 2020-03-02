
// this script attempts to emulate the behavior of a webApp. Once WebApp is ready we can deploy the same flow :)

let rainbowMotherload = require('./rainbowShake');
var express = require('express');
const clientSDK = require('rainbow-node-sdk');
const clientProperties = require('./clientCredentials');

const app = express();

// does a check to see if motherload SDK is ready, proceeds to handle app requests
rainbowMotherload.overlord.events.on('rainbow_onready',async function(){

    // define basic app params
    app.listen(3000, () =>
        app.get('/createguest', async (req, res) => {
            let loginCreds = await rainbowMotherload.createGuests(10800);
            return res.send({
                guestID : loginCreds.loginID,
                guestPass: loginCreds.loginPass

            });
        })

    );

    app.listen(3001, () =>
        app.get('/createguestdynamic', async (req, res) => {
            let nameIntended = req.query.name;
            let loginCreds = await rainbowMotherload.createGuestWithName(nameIntended, "Ticket #00001");
            return res.send({
                guestID : loginCreds.loginID,
                guestPass: loginCreds.loginPass

            });
        })

    );
    app.listen(3002, () =>
        app.get('/createguestwithtoken', async (req, res) => {

            let token = await rainbowMotherload.createGuestWithTokenization();
            return res.send({
                token : token
            });
        })

    );



    // client first requests for access via guest login
    // let loginCreds = await rainbowMotherload.createGuests(360000);
    // // proceeds to adjust clientCredentials with newly loaded creds
    // console.log("Client Auth - loginCreds are : " + loginCreds.loginID + loginCreds.loginPass);
    // clientProperties.credentials.login = loginCreds.loginID;
    // clientProperties.credentials.password = loginCreds.loginPass;





    // Express Layers:


    // proceeds to check queryStatus and only connects to SDK if given that the CSA in online
    // let querystatus = await rainbowMotherload.queryAgentStatus("bot1@.sutd.edu.sg");
    //
    // console.log(querystatus);

    //checks if CSA is online
    // if (querystatus.presence === "offline") {
    //     console.log("Error");
        // attempts to establish client connection


        // myClientSDK.events.on('rainbow_onready', function () {
        //     //commence sending of message to myself from guest
        //     // This part will never work because we are using nodeSDK and not webSDK
        //     console.log("Client instance is now Online");
        //     // Some apis dont work for guests
        //     // await myClientSDK.im.sendMessageToContact("Hey there", querystatus);
        //     // await myClientSDK.im.sendMessageToJid("Hey there. Seems to be working", querystatus.jid, "en");
        //
        //     // Due to shit documentation of APIs, forced to use conversations instead.
        //     myClientSDK.contacts.openConversationForContact(querystatus).then(convo =>{
        //         myClientSDK.im.sendMessageToConversation(convo, "This is a test message")
        //     });
        //
        // });
    // }


});
