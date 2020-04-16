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
                    cleanUp("Logging");
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
        {projection: {'currentActiveSessions': 1,'reserve': 1}});

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
    console.log("Should i be here?")
    await client.db(dbName).collection('Agent').updateOne(
      {'jid' : agentJID},
      {$set : {'currentlyInRtc' : false}})
  }
  else if (!currentlyInRtc) {
    console.log("Am i even here?")
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

async function decDepartmentLatestActiveRequestNumber(department)
{
  await client.db(dbName).collection('Department').findOneAndUpdate(
    {'_id' : department},
    {$inc : {'totalActiveRequests' : -1}})
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

    await populateDataBaseWithLogs(department, jidOfAgent, clientEmail, communication, convoHistory)
    return true;
}


async function addToWaitQ(name, department, communication, problem, queueNumber, queueDropped)
{
  let thisRequest = {
      "Department": department,
      "Client": name,
      "Communication": communication,
      "Problem": problem,
      "Qno": queueNumber,
      "queueDropped" : queueDropped
    }

  // let JSONObj =  await client.db(dbName).collection('Queues').findOne(
  //   {"Department" : department},
  //   {projection: {'Queue' : 1}})
  let currentQ = await getCurrentQ(department, "Main Queue");
  currentQ.push(thisRequest);
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$set: {"Queue" : currentQ}})
}


async function getCurrentQ(department, queueType)
{
  if (queueType === "Main Queue") {
    let JSONObj = await client.db(dbName).collection('Queues').findOne(
      {"Department" : department},
      {$projection: {"Queue" : 1}})
    return JSONObj.Queue;
  }
  else if (queueType === "ChatQ") {
    let JSONObj = await client.db(dbName).collection('Queues').findOne(
      {"Department" : department},
      {$projection: {"ChatQ" : 1}})
    return JSONObj.ChatQ;
  }
  else if (queueType === "OtherQ") {
    let JSONObj = await client.db(dbName).collection('Queues').findOne(
      {"Department" : department},
      {$projection: {"OtherQ" : 1}})
    return JSONObj.OtherQ;
  }
  else if (queueType === "DropQEventHandler") {
    let JSONObj = await client.db(dbName).collection('Queues').findOne(
      {"Department" : department},
      {$projection: {"DropQEventHandler" : 1}})
    return JSONObj.DropQEventHandler;
  }
}

/*
This method updates the DropQEventHandler by remove the first element.
This happens when a DropQ has been handled.
*/
async function updateDropQHandler(department) {
  let currentQ = await getCurrentQ(department, "DropQEventHandler");
  currentQ.splice(0,1);
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$set: {"DropQEventHandler" : currentQ}})
}

async function updateWaitQ(department, index)
{
  let currentQ = await getCurrentQ(department, "Main Queue");
  console.log("CurrentQ is " , currentQ);
  currentQ.splice(index,1);
  console.log("updated currentQ is " , currentQ);
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$set: {"Queue" : currentQ}})
}



async function splitWaitQ(department)
{
  let currentQ = await getCurrentQ(department, "Main Queue");
  let ChatQ = []
  let OtherQ = []
  for (var i = 0;  i < currentQ.length; i++) {
    if (currentQ[i].Communication == "Chat") {
      ChatQ.push(currentQ[i])
    }
    else if (currentQ[i].Communication == "Audio" ||  currentQ[i].Communication == "Video") {
      OtherQ.push(currentQ[i])
    }
  }

  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$set : {"ChatQ" : ChatQ, "OtherQ" : OtherQ}})
  // console.log("Printing the ChatQ....", ChatQ);
  // console.log("Printing the OtherQ....", OtherQ);
}



async function updateChatQ(department) {
  let ChatQ = await getCurrentQ(department, "ChatQ")
  ChatQ.splice(0,1);
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$set: {"ChatQ" : ChatQ}})
}

async function updateOtherQ(department) {
  let OtherQ = await getCurrentQ(department, "OtherQ")
  OtherQ.splice(0,1);
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$set: {"OtherQ" : OtherQ}})
}

async function clientPicker(department)
{
  let JSONObj = await client.db(dbName).collection('Queues').findOne(
    {"Department" : department},
    {$projection: {"ChatQServed" : 1}})
  let ChatQServed = JSONObj.ChatQServed;
  let OtherQ = await getCurrentQ(department, "OtherQ");
  let ChatQ = await getCurrentQ(department, "ChatQ");
  let selectedClient;
  console.log("This is the current ChatQ served. ",ChatQServed)


  if (ChatQServed % 3 == 0 && ChatQServed != 0) {
    if (OtherQ.length == 0) {
      selectedClient = ChatQ[0];
      return selectedClient;
    }
    selectedClient = OtherQ[0];
  }

  else {
    if (ChatQ.length == 0) {
      selectedClient = OtherQ[0];
      return selectedClient;
    }
    selectedClient = ChatQ[0];
  }
  return selectedClient;
}

async function incChatQServed(department)
{
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" : department},
    {$inc: {"ChatQServed" : 1}})
}


/*
This method will update all Department Queues in the event of
Dropped Queue
*/
async function handleQueueDrop(department, Qno, QueueType)
{
  let index;
  let currentQ = await getCurrentQ(department, QueueType);
  for (var i = 0; i < currentQ.length; i++) {
    if (currentQ[i].Qno == Qno) {
      index = i;
    }
  }

  if (index != null) {
  currentQ.splice(index,1);
  }

  if (QueueType === "Main Queue") {
    await client.db(dbName).collection('Queues').findOneAndUpdate(
      {'Department' : department},
      {$set: {"Queue" : currentQ }})
  }
  else if (QueueType === "ChatQ") {
    await client.db(dbName).collection('Queues').findOneAndUpdate(
      {'Department' : department},
      {$set: {"ChatQ" : currentQ }})
  }
  else if (QueueType === "OtherQ") {
    await client.db(dbName).collection('Queues').findOneAndUpdate(
      {'Department' : department},
      {$set: {"OtherQ" : currentQ }
    })
  }
}

/*
This method adds to the DropQEventHandler in the event of a Queue Drop
*/
async function addDroppQEvent(department, Qno)
{
  let DropQClient =
  {
  "Qno" : Qno,
  "DropQHandled" : false
  }
  let DropQEventHandler = []
  DropQEventHandler.push(DropQClient)
  await client.db(dbName).collection('Queues').findOneAndUpdate(
    {"Department" :  department},
    {$set: {'DropQEventHandler' : DropQEventHandler}})
}




/**
 -----------------------------------------------------------------------------
 ------------------------- DB Maintenance ------------------------------------
 -----------------------------------------------------------------------------
 */

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
                'Queue' : [],
                'ChatQ' : [],
                'OtherQ': [],
                'ChatQServed' : 0,
                'DropQEventHandler' : []
            }})
}

/*
Deletes the entire Collection.
*/
async function cleanUp(collection){
  await client.db(dbName).collection(collection).deleteMany({})
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
    getCurrentQ : getCurrentQ,
    updateWaitQ : updateWaitQ,
    splitWaitQ : splitWaitQ,
    currentlyInRtc : currentlyInRtc,
    updateAgentcurrentlyInRtcStatus : updateAgentcurrentlyInRtcStatus,
    addToWaitQ: addToWaitQ,
    updateChatQ : updateChatQ,
    updateOtherQ : updateOtherQ,
    clientPicker : clientPicker,
    incChatQServed : incChatQServed,
    handleQueueDrop : handleQueueDrop,
    decDepartmentLatestActiveRequestNumber : decDepartmentLatestActiveRequestNumber,
    addDroppQEvent : addDroppQEvent,
    updateDropQHandler : updateDropQHandler,
    cleanUp : cleanUp,
    reset : reset
};
