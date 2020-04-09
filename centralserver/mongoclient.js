// Setup Express web application
const bodyParser = require("body-parser");
// const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://tinkit:Happymon10!@sutdproject-gymhx.gcp.mongodb.net/test?retryWrites=true&w=majority';
// DataBase Name
const dbName = "sutdproject";

// Create a new MongoClient
const client = new MongoClient(url,  {useUnifiedTopology: true});

// const INTERVAL_MS = 1000
// const EXECUTION_TIME_MS = 500
// const EXAMPLE_DURATION_SEC = 10

// Use connect method to connect to the Server
client.connect( function(err, client) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    const db = client.db(dbName);

                    //toggleAvail("testesting")
                    //dateFromObjectId("5e6861395e3ea10db6e2fa51")
                    //addPendingRequest("request1", "tinkitwong@gmail.com", "Finance Office")
                    // checkAvail("Graduate Office","Chat")
                    reset();
                    // updateClientQ("Graduate Office", "Chat", "add", "tinkit", 0);
                    // updateClientQ("Graduate Office", "Chat", "add", "wingkit", 1);
                    // updateClientQ("Graduate Office", "Chat", "add", "dad", 2);
                    // updateClientQ("Graduate Office", "Chat", "remove", "tinkit", 0);
                    console.log("About to run the setIntervalAsync method")
                    // $setInterval(checkClientQ("Graduate Office"),3000);
                    // setIntervalAsync(
                    //   async () => {
                    //     console.log('Start checkClientQ function')
                    //     await checkClientQ("Graduate Office");
                    //     console.log('End of checkClientQ function.')
                    //   },
                    //   INTERVAL_MS
                    // )


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


async function populateDataBaseWithLogs(departmentID, loggingObject, agentJID)
{

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
 */
async function completedARequest(jid, departmentID){
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
        {'jid' : jid},
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
            {'jid' : jid},
            {$inc: {'currentActiveSessions' : -1, 'servicedToday': 1}});
    }

    else { // means that <= 0
        console.log("ERROR : Current Active Session is = 0");

    }


    await client.db(dbName).collection('Department').updateOne(
        {'_id' : departmentID},
        {$inc: {'currentQueueNumber' : 1, 'servicedToday': 1}},
        function(err, res) {
            if (err) throw err;
        });
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
    {projection: {'Chat' : 1, 'Audio' : 1, 'Video' : 1 }});
    console.log("Inside the checkQ Function!");
    if (queue == "Chat") {
      ChatQ = JSONObj.Chat;
    }
    else if (queue == "Audio") {
      AudioQ = JSONObj.Audio;
    }
    else {
      VideoQ = JSONObj.Video;
    }

    // add operators
    if (updateOperator == "add") {
      if (queue == "Chat") {
        ChatQ.push({name : user, queueNumber : queueNumber, department: Department});
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'Chat' : ChatQ}})}
      else if (queue == "Audio"){
        AudioQ.push({name : user, queueNumber : queueNumber, department: Department});
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'Chat' : AudioQ}})}
      else {
        VideoQ.push({name : user, queueNumber : queueNumber, department: Department});
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'Chat' : VideoQ}})}
    }

      // remove operators
    else if (updateOperator == "remove"){
      if (queue == "Chat") {
        ChatQ.splice(0,1);   // we remove the first user that enters the queue
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'Chat' : ChatQ}})
      }
      else if (queue == "Audio"){
        ChatQ.splice(0,1);
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'Chat' : AudioQ}})}
      else {
        ChatQ.splice(0,1);
        await client.db(dbName).collection('Queues').updateOne(
          {'Department' : Department},
          {$set: {'Chat' : VideoQ}})}
    }
    else { // if updateOperator = null
       console.log("Please enter a valid updateOperator: 'add' or 'remove'");
    }
}

async function checkClientQ(Department){
  console.log("Inside the checkClienQ method!")
  let ChatQ, AudioQ, VideoQ;
  let JSONObj = await client.db(dbName).collection('Queues').findOne(
    {'Department' : Department},
    {projection: {'Chat' : 1, 'Audio' : 1, 'Video' : 1 }});
    console.log(JSONObj);
  return JSONObj;
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
                'servicedToday' : 0
            }})
    await client.db(dbName).collection('Queues').updateMany({},
        {$set: {
                'Chat' : [],
                'Audio' : [],
                'Video' : []
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
    reset : reset
};
