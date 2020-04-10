/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();
// c  onst { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic')


const INTERVAL_MS = 1000
const EXECUTION_TIME_MS = 500
const EXAMPLE_DURATION_SEC = 10


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

router.get('/getClientReq', async(req,res) => {
  let updateOperator = 'add';
  let client =  req.body.name;
  let department = req.body.department;
  let communication = req.body.communication;
  let problem = req.body.problem;
  let queueNumber = await swaggyDatabase.getAndSetDepartmentLatestActiveRequestNumber(department);
  // populate the relevant queues accordingly
  await swaggyDatabase.updateClientQ(department, communication, updateOperator, client, queueNumber);
  return res.send({
    queueNumber : queueNumber
  })
});

router.post('/selectClient', async(req, res) => {
  let department = req.body.department;
  await swaggyDatabase.clientPicker(department);
  let selectedClient = await swaggyDatabase.getSelectedClient(department);
  res.send({selectedClient : selectedClient})
})

// The queue array only updates when a updateClientQ is made.
// so in theory, we can create a get method to checks for the status of the Q
// after each updateClientQ method call
// everytime client requests for a agent, we check add him to the Queue.
// and we check if for the next client to be chosen.

// what if every time the array changes : we run the code?
// which means that updateClientQ is made.

// router.post('/monitorClientQ' , async(req, res) => { // put this as a function.
//   var videoRdy = true, audioRdy = true;
//   var chatCount = 0, audioCount = 0, videoCount = 0;
//   var audioRdyCount = 0 , videoRdyCount = 0;
//   var chatQ, audioQ, videoQ; // This will be the Chat.length.
//   var selectedClient;
//   var updateOperator = "remove";
//
//   setIntervalAsync(
//     async () => {
//       console.log('Start checkClientQ function')
//       var clientQ = await swaggyDatabase.checkClientQ("Graduate Office");
//       chatQ = clientQ.Chat;
//       audioQ = clientQ.Audio;
//       videoQ = clientQ.Video;
//
//       if (chatQ.length!= 0 && chatCount !=0) {
//         // assign video request
//         if (videoQ.length != 0 && videoRdy) {
//           if (chatCount % 3 == 0) {
//             videoCount ++;
//             videoRdy = false; // reset after 3 chats req have been served.
//             // select index 0 of the Qtypes.
//             // then update the Q
//             selectedClient = videoQ.splice(0,1);
//             await swaggyDatabase.updateClientQ(selectedClient.department, "Video", updateOperator, selectedClient.name, selectedClient.queueNumber);
//             res.send + {} // i have the selected client
//           }
//         }
//
//         // assign audio request
//         if (audioQ.length != 0) {
//           if (chatCount % 2 == 0 && audioRdy) {
//             audioCount ++;
//             audioRdy = false; // reset after 2 chats req have been served.
//             selectedClient = audioQ.splice(0,1);
//             await swaggyDatabase.updateClientQ(selectedClient.department, "Audio", updateOperator, selectedClient.name, selectedClient.queueNumber);
//           }
//         }
//       }
//       // assign chat request
//       if (chatQ.length != 0) {
//         chatCount ++;
//         selectedClient = chatQ.splice(0,1);
//         await swaggyDatabase.updateClientQ(selectedClient.department, "Chat", updateOperator, selectedClient.name, selectedClient.queueNumber);
//         if (audioCount > 0) {
//           audioRdyCount ++;
//         }
//         if (videoCount > 0) {
//           videoRdyCount ++;
//         }
//
//         if (!audioRdy && audioRdyCount == 2) {
//           audioRdy = true;
//           audioRdyCount = 0;
//         }
//
//         if (!videoRdy && videoRdyCount == 3) {
//           videoRdy = true;
//           videoRdyCount = 0;
//         }
//       }
//       console.log("This is the selected client!")
//       console.log(selectedClient);
//       console.log('End of checkClientQ router method.')
//
//     },
//     INTERVAL_MS
//   )
// })



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
    console.log(servicedTodayArr);
    var count = 0;

    // enter this if there are more than 1 agent available.
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


    // enter this if there is only 1 agent available
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
