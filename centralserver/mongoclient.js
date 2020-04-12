// Setup Express web application
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://tinkit:Happymon10!@sutdproject-gymhx.gcp.mongodb.net/test?retryWrites=true&w=majority';
// DataBase Name
const dbName = "sutdproject";

// Create a new MongoClient
const client = new MongoClient(url,  {useUnifiedTopology: true});

// Use connect method to connect to the Server
client.connect( function(err, client) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    const db = client.db(dbName);

                    console.log("Starting reset...")
                    reset();
                    // resetQ();
                    console.log("System Wide reset has been compeleted")
});

// please ignore this 2 functions. I will keep this as reference.
async function dateFRomObjectId(date) {
    return Math.floor( date.getTime() / 1000).toString(16) + "0000000000000000"
}

async function dateFromObjectId(objectId) {
                      let x = await new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
                      console.log(x)
                      }

/**
-----------------------------------------------------------------------------
-------------------------- Agent Collection ---------------------------------
------------------------ Department Collection ------------------------------
-----------------------------------------------------------------------------
*/

/**
Checks availability of ALL agents of a specific department
------------------------------------
checkAvail("Graduate Office","Chat")
*/
// Function tested for CATA testing
async function checkRequestedAgents(departmentID, communication) {
                  // Get the Departments collection
                  let result = await client.db(dbName).collection('Agent').find({
                      'availability': true,
                      'Department_id' : departmentID,
                      'typeOfComm' : communication
                  }).sort({ servicedToday: 1}).toArray();
                  //console.log("This is the requested Agents")
                //console.log(result)
                  return result;
             }


/**
Adds new Agent as a new document in collection "Agent"
Other fields will be given a default value
------------------------------------------------------------------------------
addAgent("AAF","testjid", "tinkitishere", ["Chat", "Audio"], "Tin Kit Office")
*/
async function addAgent(_id, jid, name, typeOfComm, departmentID){
    await client.db(dbName).collection('Agent').insertOne({
                                                    '_id' : _id,
        'jid' : jid,
        'Department_id' : departmentID,
        'name' : name,
        'availability' : true,
        'typeOfComm' : typeOfComm,
        'currentActiveSessions' : 0,
        'resrve' : 0
    }, function(err, res) {
        if (err) throw err;
        console.log("Document inserted");
    })
}

/**
Modify 1 CSA Agent propertie(s) identifiable by JID
let newProperties = {'currentActiveSessions' : 1 , 'availability' : false}
newProperties is a JSON object
---------------------------------------------------------
modifyCommAndDept(['Audio', 'Chat'], '001', newProperties)
*/
async function modifyCommAndDept(jid, newProperties) {
    await client.db(dbName).collection('Agent').updateOne(
        {'jid' : jid},
        {$set: newProperties},
        function(err, res) {
            if (err) throw err;
            console.log("Update Compelete.");
        })
}


/*
Given CSA's JID, Increment no of sessions
--------------------------------
IncrementAgentSession("testJID")
*/
/**
 * @return {boolean}
 */
async function incrementAgentSession(jid) {
    // returns a document that supports JSON format.
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
        {'jid' : jid},
        {projection : {
                'currentActiveSessions' : 1 ,
                'reserve' : 1
            }});
    if (JSONObj == null) {
        console.log("Wrong JID input");
        return false;

    }
    if (JSONObj.currentActiveSessions < JSONObj.reserve ) {
        // increment by currentActiveSessions by 1
        let newActiveSession = JSONObj.currentActiveSessions +=1;
        console.log(newActiveSession);


        await client.db(dbName).collection('Agent').updateOne(
            {'jid' : jid},
            {$set: {'currentActiveSessions' : newActiveSession}},
            function(err, res) {
                if (err) throw err;
                console.log("Number of Session has been incremented.");
                return true;
            })
    }
    else {
        console.log("Please wait. Current CSA is working at maximum capacity");
        return false;
    }
}

async function checkAgentSession(jid) {
    // returns a document that supports JSON format.
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
        {'jid': jid},
        {
            projection: {
                'currentActiveSessions': 1,
                'reserve': 1
            }
        });


    if (JSONObj.currentActiveSessions < JSONObj.reserve) {
        return true;
    } else {
        console.log("Please wait. Current CSA is working at maximum capacity");
        return false;
    }

}



/**
 Create a function that listens for engage/disengage
 ----------------------
 toggleAvail("TestJID")
 */

async function toggleAvail(jid) {
    // First check the availability of the CSA
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
        {'jid' : jid},
        {projection : {'availability' : 1 ,
                '_id' : 1
            }
        });
    //console.log(JSONObj.getTimeStamp())
    if (JSONObj == null) {
        console.log("Wrong JID input");
        return
    }
    console.log(JSONObj.availability);
    if (JSONObj.availability == false) {
        console.log("CSA agent is still unavailable. Please wait a while more")
    }
    await client.db(dbName).collection('Agent').updateOne(
        {'jid' : jid},
        {$set: {'availability' : false}},
        function(err, res) {
            if (err) throw err;
            console.log("CSA is now available")
        })
}

/*
This method checks whether a selected can accept a new chat type.
*/
async function currentlyInRtc(agentJID){
  let currentlyInRtc = await client.db(dbName).collection('Agent').findOne(
    {'jid' : agentJID},
    {projection: {'currentlyInRtc' : 1}})
  return currentlyInRtc.currentlyInRtc
}

async function updateAgentcurrentlyInRtcStatus(Department, agentJID, currentlyInRtc){
  if (currentlyInRtc) {
    await client.db(dbName).collection('Agent').updateOne(
      {'jid' : agentJID},
      {$set : {'currentlyInRtc' : false}})
  }
  else if (!currentlyInRtc) {
    await client.db(dbName).collection('Agent').updateOne(
      {'jid' : agentJID},
      {$set : {'currentlyInRtc' : true}})
  }
}



/**
 -----------------------------------------------------------------------------
 ---------------------- PendingRequests Collection ---------------------------
 -----------------------------------------------------------------------------
 */

/**
 Adds Pending Request to PendingRequests Database
 addPendingRequest("tinkitwong@gmail.com", "Graduate Office", "Enquiry")


 */

async function addPendingRequest(userEmail, departmentID, Enquiry){
    await client.db(dbName).collection('PendingRequests').insertOne({
        //'ticketNo' : ticketNo,
        'userEmail' : userEmail,
        'Department_id' : departmentID,
        'Enquiry' : Enquiry,
        'TimeStamp' : String(new Date())

    }, function(err, res) {
        if (err) throw err;
        console.log("Document inserted")
    })

}


/**
 -----------------------------------------------------------------------------
 --------------------------- Loggings Collection -----------------------------
 -----------------------------------------------------------------------------
 */


/*
Given a JSON Chat History (from front end)
Return repackaged JSON Object for Logging Collection
*/
function parseLogs(conversation) {
  let value;
  let finalObj = {};
  for (var i = 0; i< conversation.length; i++) {
    value = conversation[i].data
    if (conversation[i].side == "R") {
      finalObj[i] = {"user" : value}
    }
    else if (conversation[i].side == "L") {
      finalObj[i] = {"agent" : value}
    }
  }
  return finalObj
}

/*
Creates a Logging Document
*/
async function populateDataBaseWithLogs(department, jidOfAgent, clientEmail, communication, conversation)
{
  let finalObj = parseLogs(conversation);
  await client.db(dbName).collection('Logging').insertOne({
      "Department": department,
      "ClientEmail": clientEmail,
      "AgentJID": jidOfAgent,
      "Status": true,
      "TimeofLog": String(new Date()),
      "TypeOfCommunication": communication,
      "ChatHistory": finalObj,
      "UpdatedAt": new Date(Date.now()) })
}


/**
 -----------------------------------------------------------------------------
 ---------------------- Queue Management -------------------------------------
 -----------------------------------------------------------------------------
 */
// The following set of functions are for queue management for picking the
// correct agent


/**
 Given DepartmentID, returns Department Current Queue Number
 */
async function getDepartmentCurrentQueueNumber(departmentID){
    let result = await client.db(dbName).collection('Department').findOne({
        '_id' : departmentID
    });
    console.log(result);
    console.log(result.currentQueueNumber);

    return result.currentQueueNumber;
}


/**
 Given DepartmentID, increase that department's current queue number
 */
async function incrementDepartmentCurrentQueueNumber(departmentID){
    await client.db(dbName).collection('Department').updateOne(
        {'_id' : departmentID},
        {$inc: {'servicedRequests' : 1, 'currentQueueNumber': 1}},
        function(err, res) {
            if (err) throw err;
        })
}

/**
 Given DepartmentID,
 updates the department's current active session
 return user's current queue number
 */
async function getAndSetDepartmentLatestActiveRequestNumber(departmentID){
    let result = await client.db(dbName).collection('Department').findOneAndUpdate(
        {'_id': departmentID },
        {$inc: {'totalActiveRequests' : 1}
        });
    //console.log(result);
    // if (result.value == null){
    //     return null;
    // }

    return result.value.totalActiveRequests;
}


/**
 Given Agent JID and DepartmentID
 updates the fieldset for department and Agent to indicate queue availability and Logging
 Agent :
 1. currentActiveSession -1
 2. servicedToday +1
 Department :
 1. currentQueueNumber +1
 2. servicedToday +1
 Logging :
 1. Add ticket.

 */

 // add loggin ticket.
async function completedARequest(jidOfAgent, department, convoHistory, clientEmail, communication){
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
        {'jid' : jidOfAgent},
        {projection : {
                'currentActiveSessions' : 1
            }});
    if (JSONObj == null) {
        console.log("Wrong JID input");
        return false;
    }
    if (JSONObj.currentActiveSessions > 0) {
        // decrement currentActiveSessions by 1
        // increment servicedToday by 1
        await client.db(dbName).collection('Agent').updateOne(
            {'jid' : jidOfAgent},
            {$inc: {'currentActiveSessions' : -1, 'servicedToday': 1}});
    }

    else { // means that <= 0
        console.log("ERROR : Current Active Session is = 0");

    }

    await client.db(dbName).collection('Department').updateOne(
        {'_id' : department},
        {$inc: {'currentQueueNumber' : 1, 'servicedToday': 1}},
        function(err, res) {
            if (err) throw err;
        });
    console.log("Inside the /endChatInstance")
    console.log(convoHistory);
    await populateDataBaseWithLogs(department, jidOfAgent, clientEmail, communication, convoHistory)
    return true;
}

// The following set of functions are for queue management for picking the
// correct agent

/*
Query the department queues that clients are queued into
and updates the Client Queues dependeding on the updateOperator

UpdateOperator : 'add' || 'remove'

NOTE :
CURRENTLY THE REMOVE METHOD REMOVES THE FIRST CLIENT THAT WAS ADDDED INTO THE Q.
THIS MAKES SENSE BECAUSE FIFO POLICY.
*/
async function updateClientQ(Department, queue, updateOperator, user, queueNumber){
  let ChatQ, AudioQ, VideoQ;


  let JSONObj = await client.db(dbName).collection('Queues').findOne(
    {'Department' : Department},
    {projection: {'ChatQ' : 1, 'AudioQ' : 1, 'VideoQ' : 1 }});
    console.log("Inside the updateClientQ Function!");
    if (queue == "Chat") {
      ChatQ = JSONObj.ChatQ;
    }
    if (queue == "Audio") {
      AudioQ = JSONObj.AudioQ;
    }
    if (queue == "Video"){
      VideoQ = JSONObj.VideoQ;
    }
    // if (queue != "Chat" || queue != "Audio" || queue != "Video") {
    //   console.log("Please enter the correct Queue Type : Chat | Audio | Video")
    // }
    console.log("This is the updateClientQ method's JSONObj")
    console.log(JSONObj)
    console.log(ChatQ)
    // add operators
    if (updateOperator == "add") {
      console.log("updaterOperator = add!")
      if (queue == "Chat") {
        ChatQ.push({name : user, queueNumber : queueNumber, department: Department});
        console.log("This is the new ChatQ!")
        console.log(ChatQ);
        console.log("Pushing the new ChatQ to DB")
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'ChatQ' : ChatQ}})
        console.log("Updating chatCount and chatQLength!")
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$inc: {'chatQLength' : 1}})
        }
      else if (queue == "Audio"){
        AudioQ.push({name : user, queueNumber : queueNumber, department: Department});
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'AudioQ' : AudioQ}})
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$inc: {'audioQLength' : 1}})
        }
      else {
        VideoQ.push({name : user, queueNumber : queueNumber, department: Department});
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'VideoQ' : VideoQ}})
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$inc: {'videoQLength' : 1}})
        }
        console.log("Finished Adding!")
    }


      // remove operators
    else if (updateOperator == "remove"){
      console.log("Inside the remove method!")
      if (queue == "Chat") {
        ChatQ.splice(0,1);   // we remove the first user that enters the queue
        console.log(ChatQ)
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'ChatQ' : ChatQ}})
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$inc: {'chatQLength' : -1}})}
      if (queue == "Audio"){
        AudioQ.splice(0,1);
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'AudioQ' : AudioQ}})
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$inc: {'audioQLength' : -1}})}
     if (queue == "Video") {
       console.log("Is my error here?")
        VideoQ.splice(0,1);
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'VideoQ' : VideoQ}})
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$inc: {'videoQLength' : -1}})}
    }
    else { // if updateOperator = null
       console.log("Please enter a valid updateOperator: 'add' or 'remove'");
    }
}

/*
Given a Department :
Returns the current instance of
Chat/Audio/Video Queues JSON Object.
*/
async function checkClientQ(Department){
  console.log("Inside the checkClientQ method!")
  let ChatQ, AudioQ, VideoQ;
  let JSONObj = await client.db(dbName).collection('Queues').findOne(
    {'Department' : Department},
    {projection: {'ChatQ' : 1, 'AudioQ' : 1, 'VideoQ' : 1 }});
    console.log(JSONObj);
  return JSONObj;
}

/*

Pre-requisite : Queue must have at least one person

Given Department
Pick a Client from the different Queues.

This will first update the Queue Count, set the boolean as false after
updateClienQ called to remove the selectedClient (which is the first index of each Q)
update the selectedClient field
*/

async function clientPicker(Department) { // introduce another parem that specifies the Qtype
  // how to incorporate qNo. with
  console.log("Inside Client Picker!")
  let thisDpt = await client.db(dbName).collection('Queues').findOne(
    {"Department" : Department});
  console.log("This is the current instance of thisDpt")
  console.log(thisDpt)
  if (thisDpt.videoQLength == thisDpt.audioQLength) {
    if (thisDpt.videoCount > thisDpt.audioCount && thisDpt.videoRdy) {
      await client.db(dbName).collection('Queues').updateOne(
        {"Department" : Department},
        {$set: {'videoCount' : 1}})
      await client.db(dbName).collection('Queues').updateOne(
        {"Department" : Department},
        {$set : {'videoRdy' : false}})
      selectedClient = thisDpt.VideoQ[0]
      await updateSelectedClient(Department, selectedClient);
    }
    else if (thisDpt.audioCount < thisDpt.videoCount && thisDpt.audioRdy) {
      await client.db(dbName).collection('Queues').updateOne(
        {"Department" : Department},
        {$inc : {'audioCount' : 1}})
      await client.db(dbName).collection('Queues').updateOne(
        {"Department" : Department},
        {$set : {'audioRdy' : false}})
      selectedClient = thisDpt.AudioQ[0]
      await updateSelectedClient(Department, selectedClient);
    }
  }

  // assign video request
  if (thisDpt.chatCount % 3 == 0 && thisDpt.videoRdy && thisDpt.chatCount!=0){
    await client.db(dbName).collection('Queues').updateOne(
      {"Department" : Department},
      {$inc : {'videoCount' : 1}})
    await client.db(dbName).collection('Queues').updateOne(
      {"Department" : Department},
      {$set : {'videoRdy' : false}})
    selectedClient = thisDpt.VideoQ[0]
    await updateSelectedClient(Department, selectedClient);
    await updateClientQ(selectedClient.department, "Video", "remove", selectedClient.name, selectedClient.queueNumber);
  }
    // assign audio request
  else if (thisDpt.chatCount % 2 == 0 && thisDpt.audioRdy && thisDpt.chatCount !=0) {
    await client.db(dbName).collection('Queues').updateOne(
      {"Department" : Department},
      {$inc : {'audioCount' : 1}})
    await client.db(dbName).collection('Queues').updateOne(
      {"Department" : Department},
      {$set : {'audioRdy' : false}})
    selectedClient = thisDpt.AudioQ[0]
    console.log("This is the selected Client inside the audio request if loop")
    console.log(selectedClient);
    await updateSelectedClient(Department, selectedClient);
    await updateClientQ(selectedClient.department, "Audio", "remove", selectedClient.name, selectedClient.queueNumber);
  }

  // assign chat request
  else if (thisDpt.chatQLength != 0) {
    await client.db(dbName).collection('Queues').updateOne(
      {"Department" : Department},
      {$inc : {'chatCount' : 1}})
    selectedClient = thisDpt.ChatQ[0]
    console.log("This is the selected Client. It should be : ClientName")
    console.log(selectedClient)
    await updateClientQ(selectedClient.department, "Chat", "remove", selectedClient.name, selectedClient.queueNumber);
    console.log("Finished Updating the ClientQ!")
    console.log(selectedClient)
    await updateSelectedClient(Department, selectedClient);
  }
}


async function updateSelectedClient(Department, selectedClient) {
  console.log("Updating Selected Client field")
  console.log("This is the selected Client in this method!")
  console.log(selectedClient);
  // { name: 'Client 212', queueNumber: 0, department: 'Graduate Office' }
  console.log(selectedClient.name)
  console.log(selectedClient.queueNumber)
  await client.db(dbName).collection('Queues').updateOne(
    {'Department' : Department},
    {$set: {'selectedClient' : selectedClient}}
  )
  console.log("Finished updating Selected Client field")
}

async function getSelectedClient(Department) {
  let selectedClient =  client.db(dbName).collection('Queues').findOne(
    {'Department' : Department},
    {projection: {'selectedClient' : 1}})
  return selectedClient
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}



// hard resets all department fields.
async function reset(){
    await client.db(dbName).collection('Department').updateMany({},
        {$set: {
                'currentQueueNumber' : 0,
                'totalActiveRequests' : 0,
                'servicedRequests' : 0,
                'failedRequests' : 0,
                'servicedToday' : 0
            }})
    await client.db(dbName).collection('Agent').updateMany({},
        {$set: {
                'currentActiveSessions' : 0,
                'servicedToday' : 0,
                'currentlyInRtc' : false
            }})
    await client.db(dbName).collection('Queues').updateMany({},
        {$set: {
                'ChatQ' : [],
                'AudioQ' : [],
                'VideoQ' : [],
                'chatQLength' : 0,
                'audioQLength' : 0,
                'videoQLength' : 0,
                'chatCount' : 0,
                'audioCount' : 0,
                'videoCount' : 0,
                'audioRdyCount' : 0,
                'videoRdyCount' : 0,
                'videoRdy' : true,
                'audioRdy' : true,
                'selectedClient' : {}
            }})
}





module.exports = {
    checkRequestedAgents: checkRequestedAgents,
    getDepartmentCurrentQueueNumber: getDepartmentCurrentQueueNumber,
    incrementDepartmentCurrentQueueNumber: incrementDepartmentCurrentQueueNumber,
    getAndSetDepartmentLatestActiveRequestNumber: getAndSetDepartmentLatestActiveRequestNumber,
    addAgent: addAgent,
    modifyCommAndDept: modifyCommAndDept,
    checkAgentSession: checkAgentSession,
    incrementAgentSession : incrementAgentSession,
    completedARequest: completedARequest,
    toggleAvail : toggleAvail,
    addPendingRequest : addPendingRequest,
    updateClientQ : updateClientQ,
    checkClientQ : checkClientQ,
    updateSelectedClient : updateSelectedClient,
    clientPicker : clientPicker,
    getSelectedClient : getSelectedClient,
    currentlyInRtc : currentlyInRtc,
    updateAgentcurrentlyInRtcStatus : updateAgentcurrentlyInRtcStatus,
    reset : reset
};
