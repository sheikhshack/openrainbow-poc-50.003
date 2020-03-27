
// this script attempts to emulate the behavior of a webApp. Once WebApp is ready we can deploy the same flow :)

let rainbowMotherload = require('./rainbowShake');
let swaggyDatabase = require('./mongoclient');
var express = require('express');
const clientSDK = require('rainbow-node-sdk');
const clientProperties = require('./clientCredentials');
const cors = require('cors');
const app = express();
// Initialises cors policy for app
app.use(cors());
app.use(express.json());

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

    app.listen(3003, () =>
        app.get('/queryAdminContacts', async(req, res) => {
            let email = req.query.email;
            let listOfContacts = await rainbowMotherload.queryAgentStatus(email);
            let status = await rainbowMotherload.checkOnlineStatus(listOfContacts.jid);
            console.log(status);
            return res.send({
                listOfContacts
            });

        })

    );

    app.listen(3004, () =>
        app.post('/getRequiredCSA', async(req, res) => {
            let department = req.body.department;
            let communication = req.body.communication;
            let problem = req.body.problem;

            //debugging

            console.log("Department requested is " + department);
            console.log("Comms requested is " + communication);

            let queueNumber;
            let jid;
            // proceeds to query DB for matching CSA
            let data = await swaggyDatabase.checkRequestedAgents(department, communication)[0];
            let onlineStatus = await rainbowMotherload.checkOnlineStatus(data.jid);
            console.log("Online status: " + onlineStatus);
            if (onlineStatus)
            {
                queueNumber = 0;
                jid = data.jid;
            }
            else{
                queueNumber = 100;
                jid = null;
            }
            console.log(data.jid);
            // console.log(req.data.name);
            return res.send({
                queueNumber: queueNumber,
                jid: jid
            });
        })
    );

    // The following is an attempt at full routing + handling mechanisms

    app.listen(3005, () =>
        app.post('/getRequiredCSAbeta', async(req, res) => {
            let department = req.body.department;
            let communication = req.body.communication;
            let queueNumber = await swaggyDatabase.getAndSetDepartmentLatestActiveRequestNumber(department);
            if (queueNumber == null)
            {
                return res.status(400).send('Current department does not exist');
            }

            // by the end of this line, you should get a listofagents that meet the request, balance algo incoporated
            let listOfAgents = await swaggyDatabase.checkRequestedAgents(department, communication);

            // by the end of this sequence, you should get a listofagents that are online and not overloaded
            for (var i = listOfAgents.length-1; i >= 0; i--){
                let onlineStatus = await rainbowMotherload.checkOnlineStatus(listOfAgents[i].jid);
                 console.log("Checking Online Status")
                 console.log(listOfAgents[i].name)
                 console.log(onlineStatus)
                let overLoadedStatus = await swaggyDatabase.checkAgentSession(listOfAgents[i].jid);
                 console.log("Checking overLoadedStatus")
                 console.log(listOfAgents[i].name)
                 console.log(overLoadedStatus)
                if (!onlineStatus || !overLoadedStatus){
                    // if not online, they are removed from the array
                    listOfAgents.splice(i, 1);
                }
            }
            console.log("printing list of agents")
            console.log(listOfAgents)
            
           
            
                 
            // check here if servicedToday field is the same for all agents in the current listofAgents
             var servicedTodayArr = []
             for (var i = 0; i< listOfAgents.length; i++) {
                servicedTodayArr.push(listOfAgents[i].servicedToday)
             }
             console.log("sadfasdf")
             console.log(servicedTodayArr);
             var count = 0;
             if (listOfAgents.length > 1) {createguest
                 console.log("listOfAgents.length > 1");
                 for (var i = 0; i < listOfAgents.length; i++) {
                    if (i != listOfAgents.length-1) {
                        // check for the case when ServicedToday is all the same
                        if (servicedTodayArr[i] == servicedTodayArr[i+1]) {
                            count ++
                        }
                    }
                    
                 }
                 console.log("This is the count")
                 console.log(count)
                 if (count == servicedTodayArr.length-1){
                    var assignedAgentIndex = (queueNumber) % listOfAgents.length
                    console.log("sdayfgakhsjdfksd")
                    console.log(assignedAgentIndex)
                     if (await rainbowMotherload.checkOnlineStatus(listOfAgents[assignedAgentIndex].jid)) {
                        await swaggyDatabase.incrementDepartmentCurrentQueueNumber(department);
                        await swaggyDatabase.incrementAgentSession(listOfAgents[assignedAgentIndex].jid);
                        return res.send({
                                     queueNumber: queueNumber,
                                     jid: listOfAgents[assignedAgentIndex].jid,
                                     queueStatus: "ready"
                                     })
                     }
                 }
             }
                 
                 
                 
            // final check that the right agent is online and return it to client for immediate connection
            if (listOfAgents.length != 0 && await rainbowMotherload.checkOnlineStatus(listOfAgents[0].jid)){
                // update all the agent stuff first
                
                await swaggyDatabase.incrementDepartmentCurrentQueueNumber(department);
                await swaggyDatabase.incrementAgentSession(listOfAgents[0].jid);
                // sends the JID, queueNumber also sent for Debugging
                return res.send({
                    queueNumber: queueNumber,
                    jid: listOfAgents[0].jid,
                    queueStatus: "ready"
                });
            }
            // this suggests that all candidate agents are busy or not available for this scenario. In this case,
            // we commence v1.0 of the queueing algo
            else
            {
                // since all agents are full, we now proceed to give the client a queueNumber. This queueNumber will be
                // requested by reposted under a new method that employs a loop of some sort (every 3s)
                return res.send({
                    queueNumber: queueNumber,
                    jid: null,
                    queueStatus: "enqueued"
                });

            }

        })
    );

    app.listen(3006, () =>
        app.post('/checkQueueStatusbeta', async(req, res) => {
            // basically only need queueNumber if this actually goes well but ofc it doesnt
            let department = req.body.department;
            let communication = req.body.communication;
            let queueNumber = req.body.queueNumber;
                 
             console.log("This is my Department");
             console.log(department);
            console.log("This is my queue Number");
            console.log(queueNumber);

            let currentlyServing = await swaggyDatabase.getDepartmentCurrentQueueNumber(department);
            console.log("The department is now currently serving");
                 
            console.log(currentlyServing);
            // checks the queueNumber to see if its ready for servicing
            if (queueNumber < currentlyServing)
            {
                console.log(queueNumber);
                 console.log(currentlyServing);
                let listOfAgents = await swaggyDatabase.checkRequestedAgents(department, communication);

                // by the end of this sequence, you should get a listofagents that are online and not overloaded
                for (var i = listOfAgents.length-1; i >= 0; i--){
                    let onlineStatus = await rainbowMotherload.checkOnlineStatus(listOfAgents[i].jid);
                    let overLoadedStatus = await swaggyDatabase.checkAgentSession(listOfAgents[i].jid);
                    console.log(onlineStatus)
                    console.log(overLoadedStatus)
                    if (!onlineStatus || !overLoadedStatus){
                        // if not online, they are removed from the array
                        listOfAgents.splice(i, 1);
                        console.log(listOfAgents);
                    }
                }

                // final check that the right agent is online and return it to client for immediate connection
                if (listOfAgents.length != 0 && await rainbowMotherload.checkOnlineStatus(listOfAgents[0].jid)){
                    // update all the agent stuff first
                    await swaggyDatabase.incrementAgentSession(listOfAgents[0].jid);
                    // sends the JID, queueNumber also sent for Debugging
                    return res.send({
                        queueNumber: queueNumber,
                        jid: listOfAgents[0].jid

                    });
                }

                else
                {
                    return res.send({
                        queueNumber: queueNumber,
                        jid: null,
                        position: queueNumber - currentlyServing
                    })
                }
            }
            else{
                // queue number still not ready, continue asking to retry by sending back same shit
                return res.send({
                    queueNumber: queueNumber,
                    jid: null,
                    position: queueNumber - currentlyServing
                })
            }

        })
    );

    app.listen(3007, () =>
        app.post('/endChatInstance', async(req, res) => {
            // requires these 3 params
            console.log("Entered this method");
            let department = req.body.department;
            let communication = req.body.communication;
            let queueNumber = req.body.queueNumber;
            let jidOfAgent = req.body.jid;

            // ok so first step is to update agent details
            let resultOk = await swaggyDatabase.completedARequest(jidOfAgent, department);
            // thats it if it works
            return res.send({
                    status: "Success",
                });



        }));

    app.listen(3008, () =>
        app.get('/superuserresetdatabase', async (req, res) => {
            console.log("reset initiated");
            await swaggyDatabase.reset();
        }))







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
