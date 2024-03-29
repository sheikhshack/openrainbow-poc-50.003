/*
The following file describes all api endpoints pertaining to queue/routing mechanisms
 */
const rainbowMotherload = require('../rainbowShake');
const swaggyDatabase = require('../mongoclient');
const express = require('express');
const router = express.Router();

router.get('/createguest', async (req, res) => {
  try {
    let loginCreds = await rainbowMotherload.createGuests(10800);

    return res.send({
        guestID : loginCreds.loginID,
        guestPass: loginCreds.loginPass
    });
  } catch (e) {
      return res.status(400).json({
          message: "Unable to create guest.."
      })}
});


router.get('/createguestdynamic', async (req, res) => {
    let ticketSerialized;
    let nameIntended = req.query.name;
    try {
        let ticketNumber = await swaggyDatabase.getAndSetTicketNumber();
        if (ticketNumber.toString().length < 8){
            ticketSerialized = String("00000000" + ticketNumber.toString()).slice(-8);
        }
        else{
            ticketSerialized = ticketNumber.toString()
        }
         // returns 00123
      let loginCreds = await rainbowMotherload.createGuestWithName(nameIntended, "Ticket #" + ticketSerialized);
      return res.send({
          guestID : loginCreds.loginID,
          guestPass: loginCreds.loginPass,
          ticketNumber: ticketNumber
      });
    } catch (e) {
        return res.status(400).json({
            message: "Unable to create dynamic guests.."
        })}
});


router.post('/getRequiredCSA', async(req, res) => {

    let name = req.body.client;
    let department = req.body.department;
    let communication = req.body.communication;
    let problem = req.body.problem;
    let queueDropped = req.body.queueDropped;
    let clientEmail = req.body.email;
    let ticketNumber = req.body.ticketNumber;


    let allAgentsOffline = false;

    // Attaching Interceptor to intercept for bot policy
    let botPolicy = await swaggyDatabase.retrieveBotPolicy();
    if (botPolicy.activeAll === true){
        return res.send({
            queueNumber: -1,
            jid: botPolicy.jid,
            queueStatus: "botActive"
        })
    }

    // Continues routing as intended
    try{

      let queueNumber = await swaggyDatabase.getAndSetDepartmentLatestActiveRequestNumber(department);

      if (queueNumber == null)
      {
          return res.status(400).send('Current department does not exist');
      }
      // by the end of this line, you should get a listofagents that meet the request, balance algo incoporated
      let listOfAgents = await swaggyDatabase.checkRequestedAgents(department, communication);

      let currentlyInRtc;
      // by the end of this sequence, you should get a listofagents that are online and not overloaded
      for (var i = listOfAgents.length-1; i >= 0; i--){
          let onlineStatus = await rainbowMotherload.checkOnlineStatus(listOfAgents[i].jid);
          if (!onlineStatus) {
            allAgentsOffline = true;
          }

          let overLoadedStatus = await swaggyDatabase.checkAgentSession(listOfAgents[i].jid);
          currentlyInRtc = await swaggyDatabase.currentlyInRtc(listOfAgents[i].jid);
          if (communication == "Chat" && currentlyInRtc && overLoadedStatus && onlineStatus){}
          else if (!onlineStatus || !overLoadedStatus || currentlyInRtc){
            listOfAgents.splice(i, 1);
          }
      }

      if (allAgentsOffline)
      {
        await swaggyDatabase.logFailedRequest(department, clientEmail, communication, problem, ticketNumber);
        await swaggyDatabase.incrementFailedRequests(department);
        await swaggyDatabase.decDepartmentLatestActiveRequestNumber(department);
        let botPolicy = await swaggyDatabase.retrieveBotPolicy();
        return res.status(200).json({
                message: "Unable to getRequiredCSA. ALL CSAs are offline",
                jid: botPolicy.jid
            })
      }
      else {
        // Load Balancing....
        // check here if servicedToday field is the same for all agents in the current listofAgents
        var servicedTodayArr = [];
        for (var i = 0; i< listOfAgents.length; i++) {
            servicedTodayArr.push(listOfAgents[i].servicedToday)
        }

        var count = 0;

        // enter this if there are more than 1 agent available.
        if (listOfAgents.length > 1) {
            for (var i = 0; i < listOfAgents.length; i++) {
                if (i != listOfAgents.length-1) {
                    // check for the case when ServicedToday is all the same
                    if (servicedTodayArr[i] == servicedTodayArr[i+1]) {
                        count ++
                    }
                }
            }

            if (count == servicedTodayArr.length-1){
                var assignedAgentIndex = (queueNumber) % listOfAgents.length;
                // check clientReq communication & update agent currentlyInRtc status iif the selected client request is audio / video.
                if (communication == "Video" || communication == "Audio") {
                  await swaggyDatabase.updateAgentcurrentlyInRtcStatus(department, listOfAgents[assignedAgentIndex].jid, currentlyInRtc);
                }

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
            // check clientReq communication & update agent currentlyInRtc status iif the selected client request is audio / video.
            if (communication == "Video" || communication == "Audio") {
              currentlyInRtc = await swaggyDatabase.currentlyInRtc(listOfAgents[0].jid);
              await swaggyDatabase.updateAgentcurrentlyInRtcStatus(department, listOfAgents[0].jid, currentlyInRtc);
            }

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
            await swaggyDatabase.addToWaitQ(name, department, communication, problem,queueNumber,queueDropped);
            let currentlyServing = await swaggyDatabase.getDepartmentCurrentQueueNumber(department);
            return res.send({
                queueNumber: queueNumber,
                jid: null,
                queueStatus: "enqueued",
                position: queueNumber - currentlyServing + 1
            });
        }
      }
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            message: "Some Issues With Getting Required CSA. Please try again.."
        })
    }
});


router.post('/checkQueueStatus', async(req, res) => {
    // using the "Main Queue"
    let department = req.body.department;
    let communication = req.body.communication;
    let queueNumber = req.body.queueNumber;

    let alreadyServed = false;
    let currentlyInRtc;

    try {
      let currentlyServing = await swaggyDatabase.getDepartmentCurrentQueueNumber(department);
      let myturn = queueNumber < currentlyServing;
      let handlingDropQ = false;

      let DropQEventHandler = await swaggyDatabase.getCurrentQ(department, "DropQEventHandler");
      if (DropQEventHandler.length != 0) {
      if (queueNumber == currentlyServing && DropQEventHandler[0].Qno == (queueNumber - 1) && DropQEventHandler[0].DroppedQHandled == false)
        {
          // increase Dpt. Current Q Number.
          await swaggyDatabase.incrementDepartmentCurrentQueueNumber(department);
          handlingDropQ = true;
        }
      }

      // updates the DropQEventHandler
      if (handlingDropQ)
      { // check the queue
        await swaggyDatabase.updateDropQHandler(department);
      }

      // get updated instance of Dpt Q No
      currentlyServing = await swaggyDatabase.getDepartmentCurrentQueueNumber(department);
      if (myturn) // Single Queue System.
      {
          let listOfAgents = await swaggyDatabase.checkRequestedAgents(department, communication);

          // by the end of this sequence, you should get a listofagents that are online and not overloaded
          for (var i = listOfAgents.length-1; i >= 0; i--){
              let onlineStatus = await rainbowMotherload.checkOnlineStatus(listOfAgents[i].jid);
              let overLoadedStatus = await swaggyDatabase.checkAgentSession(listOfAgents[i].jid);
              currentlyInRtc = await swaggyDatabase.currentlyInRtc(listOfAgents[i].jid)
              if (communication == "Chat" && currentlyInRtc && overLoadedStatus && onlineStatus){}
              else if (!onlineStatus || !overLoadedStatus || currentlyInRtc){
                  listOfAgents.splice(i, 1);
              }
          }

          // final check that the right agent is online and return it to client for immediate connection
          if (listOfAgents.length != 0 && await rainbowMotherload.checkOnlineStatus(listOfAgents[0].jid)){
              if (communication == "Video" || communication == "Audio") {
                await swaggyDatabase.updateAgentcurrentlyInRtcStatus(department, listOfAgents[0].jid, currentlyInRtc);
              }
              await swaggyDatabase.incrementDepartmentCurrentQueueNumber(department);
              await swaggyDatabase.incrementAgentSession(listOfAgents[0].jid);
              await swaggyDatabase.updateWaitQ(department, 0);
              await swaggyDatabase.updateOtherQ(department);
              await swaggyDatabase.updateChatQ(department);
              // sends the JID, queueNumber also sent for Debugging
              return res.send({
                  queueNumber: queueNumber,
                  jid: listOfAgents[0].jid,
                  queueStatus : "successful"
              });
          }

          else if (listOfAgents.length == 0) { // enter this if client is the head of the wait Q and !chat.
            let clientQno = await swaggyDatabase.getQueueNumber(department, queueNumber);
            return res.send({
              queueNumber: queueNumber,
              jid: null,
              position: clientQno,
              queueStatus : "enqueued"
            })
          }
        }

        else if (queueNumber == currentlyServing)  // next in line.
          {
            await swaggyDatabase.splitWaitQ(department);
            let currentQ = await swaggyDatabase.getCurrentQ(department, "Main Queue");
            let ChatQ = await swaggyDatabase.getCurrentQ(department, "ChatQ");
            let OtherQ = await swaggyDatabase.getCurrentQ(department, "OtherQ");
            let selectedClient = await swaggyDatabase.clientPicker(department); // picks chat for every 2 Chat served

            let agentList = await swaggyDatabase.checkRequestedAgents(selectedClient.Department, selectedClient.Communication);
            for (var i = agentList.length-1; i >= 0; i--){
                let onlineStatus = await rainbowMotherload.checkOnlineStatus(agentList[i].jid);
                let overLoadedStatus = await swaggyDatabase.checkAgentSession(agentList[i].jid);
                currentlyInRtc = await swaggyDatabase.currentlyInRtc(agentList[i].jid)
                if (selectedClient.Communication == "Chat" && currentlyInRtc && overLoadedStatus && onlineStatus){}
                else if (!onlineStatus || !overLoadedStatus || currentlyInRtc){
                    agentList.splice(i, 1);
                }
            }

            if (agentList.length == 0) {
              let clientQno = await swaggyDatabase.getQueueNumber(department, queueNumber);
              return res.send({
                  queueNumber: queueNumber,
                  jid: null,
                  position: clientQno,
                  queueStatus : "enqueued"
              })
            }

            else if (agentList.length!=0 && await rainbowMotherload.checkOnlineStatus(agentList[0].jid)) {
              if (selectedClient.Communication == "Chat") {
                await swaggyDatabase.updateChatQ(ChatQ[0].Department);
                await swaggyDatabase.updateWaitQ(currentQ[1].Department,1);
                await swaggyDatabase.incChatQServed(selectedClient.Department);
              }
              else if (selectedClient.Communication == "Video" || selectedClient.Communication == "Audio") {
                currentlyInRtc = await swaggyDatabase.currentlyInRtc(listOfAgents[i].jid)
                await swaggyDatabase.updateOtherQ(OtherQ[0].Department);
                await swaggyDatabase.updateWaitQ(currentQ[0].Department,1);
                await swaggyDatabase.updateAgentcurrentlyInRtcStatus(department, agentList[0].jid, currentlyInRtc);
              }
              await swaggyDatabase.incrementDepartmentCurrentQueueNumber(department);
              await swaggyDatabase.incrementAgentSession(agentList[0].jid);

              return res.send({
                queueNumber : selectedClient.Qno,
                jid : agentList[0].jid,
                queueStatus : "successful"
              })
            }
        }


      else { // not my turn.
        let clientQno = await swaggyDatabase.getQueueNumber(department, queueNumber);
        return res.send({
            queueNumber: queueNumber,
            jid: null,
            position: clientQno,
            queueStatus : "enqueued"
        })
      }

    } catch (e)
    {
      console.log(e);
        return res.status(400).json({
            message: "Unable to check current Queue Status. Please check your connection.."

        })
    }
  });

router.post('/endChatInstance', async(req, res) => {
    let department = req.body.department;
    let communication = req.body.communication;
    let queueNumber = req.body.queueNumber;
    let jidOfAgent = req.body.jid;
    let convoHistory = req.body.convoHistory;
    let clientEmail = req.body.clientEmail;
    let queueDropped = req.body.queueDropped;
    let ticketNumber = req.body.ticketNumber;

    try {
      if (queueDropped)
      {
         // Update Department Queues.
         await swaggyDatabase.handleQueueDrop(department, queueNumber, "Main Queue");
         await swaggyDatabase.handleQueueDrop(department, queueNumber, "ChatQ");
         await swaggyDatabase.handleQueueDrop(department, queueNumber, "OtherQ");
         await swaggyDatabase.decDepartmentLatestActiveRequestNumber(department);
         await swaggyDatabase.addDroppQEvent(department, queueNumber);
         return res.send({
           status : "queueDropped"
         })
       }
      let resultOk = await swaggyDatabase.completedARequest(jidOfAgent, department, convoHistory, clientEmail, communication, ticketNumber);
      let currentlyInRtc = await swaggyDatabase.currentlyInRtc(jidOfAgent);

      if (communication != "Chat") {
        await swaggyDatabase.updateAgentcurrentlyInRtcStatus(department, jidOfAgent, currentlyInRtc);
      }
      if (!resultOk) {throw "Failed"}


        return res.send({
          status: "Success"
      });
    }
    catch (e) {
      return res.status(400).json({
          message: "Failed to end Chat properly.."
      })}
});

module.exports = router;
