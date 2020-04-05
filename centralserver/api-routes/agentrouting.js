/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/createguest', async (req, res) => {
    let loginCreds = await rainbowMotherload.createGuests(10800);
    return res.send({
        guestID : loginCreds.loginID,
        guestPass: loginCreds.loginPass

    });
});

router.get('/createguestdynamic', async (req, res) => {
    let nameIntended = req.query.name;
    let loginCreds = await rainbowMotherload.createGuestWithName(nameIntended, "Ticket #00001");
    return res.send({
        guestID : loginCreds.loginID,
        guestPass: loginCreds.loginPass

    });
});

router.post('/getRequiredCSA', async(req, res) => {
    let department = req.body.department;
    let communication = req.body.communication;
    let queueNumber = await swaggyDatabase.getAndSetDepartmentLatestActiveRequestNumber(department);
    if (queueNumber == null)
    {
        return res.status(400).send('Current department does not exist');
    }

    // by the end of this line, you should get a listofagents that meet the request, balance algo incoporated
    let listOfAgents = await swaggyDatabase.checkRequestedAgents(department, communication);
    console.log("Testing this list of agents for 1 agent online");
    console.log(listOfAgents);
    // by the end of this sequence, you should get a listofagents that are online and not overloaded
    for (var i = listOfAgents.length-1; i >= 0; i--){
        let onlineStatus = await rainbowMotherload.checkOnlineStatus(listOfAgents[i].jid);
        console.log("Checking Online Status");
        console.log(listOfAgents[i].name);
        console.log(onlineStatus);
        let overLoadedStatus = await swaggyDatabase.checkAgentSession(listOfAgents[i].jid);
        console.log("Checking overLoadedStatus");
        console.log(listOfAgents[i].name);
        console.log(overLoadedStatus);
        if (!onlineStatus || !overLoadedStatus){
            // if not online, they are removed from the array
            listOfAgents.splice(i, 1);
        }
    }
    console.log("printing list of agents");
    console.log(listOfAgents);


    // check here if servicedToday field is the same for all agents in the current listofAgents
    var servicedTodayArr = [];
    for (var i = 0; i< listOfAgents.length; i++) {
        servicedTodayArr.push(listOfAgents[i].servicedToday)
    }
    console.log("sadfasdf");
    console.log(servicedTodayArr);
    var count = 0;
    if (listOfAgents.length > 1) {
        console.log("listOfAgents.length > 1");
        for (var i = 0; i < listOfAgents.length; i++) {
            if (i != listOfAgents.length-1) {
                // check for the case when ServicedToday is all the same
                if (servicedTodayArr[i] == servicedTodayArr[i+1]) {
                    count ++
                }
            }

        }
        console.log("This is the count");
        console.log(count);
        if (count == servicedTodayArr.length-1){

            var assignedAgentIndex = (queueNumber) % listOfAgents.length;

            console.log("sdayfgakhsjdfksd");
            console.log(assignedAgentIndex);
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
    console.log("This is where im at ");
    console.log(listOfAgents[0]);

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

});

router.post('/checkQueueStatus', async(req, res) => {
    // basically only need queueNumber if this actually goes well but ofc it doesnt
    let department = req.body.department;
    let communication = req.body.communication;
    let queueNumber = req.body.queueNumber;

    console.log("This is my Department");
    //console.log(department);
    console.log("This is my queue Number : ", queueNumber);
    //console.log(queueNumber);

    let currentlyServing = await swaggyDatabase.getDepartmentCurrentQueueNumber(department);
    console.log("The department is now currently serving :", currentlyServing);

//            console.log(currentlyServing);
    // checks the queueNumber to see if its ready for servicing
    if (queueNumber < currentlyServing)
    {
        console.log(queueNumber);
        console.log(currentlyServing);
        let listOfAgents = await swaggyDatabase.checkRequestedAgents(department, communication);
        console.log(listOfAgents);
        console.log("asdjfygaisdyfg,askfhkuaysdfkauysdf");

        // by the end of this sequence, you should get a listofagents that are online and not overloaded
        for (var i = listOfAgents.length-1; i >= 0; i--){
            let onlineStatus = await rainbowMotherload.checkOnlineStatus(listOfAgents[i].jid);
            let overLoadedStatus = await swaggyDatabase.checkAgentSession(listOfAgents[i].jid);
            console.log(onlineStatus);
            console.log(overLoadedStatus);
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
        console.log("asldkfhasduyfgasdkufglasdifhalsudyfgblsdi");
        // queue number still not ready, continue asking to retry by sending back same shit
        return res.send({
            queueNumber: queueNumber,
            jid: null,
            position: queueNumber - currentlyServing
        })
    }
});

router.post('/endChatInstance', async(req, res) => {
    // requires these 3 params
    console.log("Entered this method");
    let department = req.body.department;
    let communication = req.body.communication;
    let queueNumber = req.body.queueNumber;
    let jidOfAgent = req.body.jid;
    let conversationID = req.body.convoID;
    let convoHistory = req.body.convoHistory;

    // ok so first step is to update agent details
    let resultOk = await swaggyDatabase.completedARequest(jidOfAgent, department);
    let endedConvo = await rainbowMotherload.getConversationDetails(conversationID);
    console.log("ended convo is: ..... ");
    console.log(endedConvo);

    // thats it if it works
    return res.send({
        status: "Success",
    });
});

module.exports = router;
