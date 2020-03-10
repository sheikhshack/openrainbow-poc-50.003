
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

                    //toggleAvail("3006bf0f41a74dedb0c8e4da79b10be8@sandbox-all-in-one-rbx-prod-1.rainbow.sbg")
              
               
                    
               
               

                    // checkAvail("Graduate Office","Chat")

});

/*
Checks availability of ALL agents of a specific department
------------------------------------
checkAvail("Graduate Office","Chat")
 */
 async function checkAvail(departmentID, communication) {
                  // Get the Departments collection
                  let result = await client.db(dbName).collection('Agent').find({
                      'availability': true,
                      'Department_id' : departmentID,
                      'typeOfComm' : communication
                  }).toArray();
                  console.log(result[0]);
                  return result[0];

             }

/*
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
                                                    console.log("Document inserted")
                                                    })
}

/*
 Modify 1 CSA Agent propertie(s) identifiable by JID
 let newProperties = {'currentActiveSessions' : 1 , 'availability' : false}
 newProperties is a JSON object
 ---------------------------------------------------------
 modifyCommAndDept(['Audio', 'Chat'], '001', newProperties)
 */
async function modifyCommAndDept(typeOfComm, Department_id, newProperties) {
    let oldProperties = {'typeOfComm' : typeOfComm , 'Department_id' : Department_id}
    await client.db(dbName).collection('Agent').updateOne(
                                                          oldProperties,
                                                          {$set: newProperties},
                                                          function(err, res) {
                                                          if (err) throw err;
                                                          console.log("Update Compelete.")
                                                          })
}


             



/*
 Given CSA's JID, Increment no of sessions
 --------------------------------
 IncrementAgentSession("testJID")
 */


async function IncrementAgentSession(jid) {
    // returns a document that supports JSON format.
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
                                                              {'jid' : jid},
                                                              {projection : {
                                                                             'currentActiveSessions' : 1 ,
                                                                             'reserve' : 1
                                                                      }})
    if (JSONObj == null) {
        console.log("Wrong JID input")
        return}
    if (JSONObj.currentActiveSessions < JSONObj.reserve ) {
        // increment by currentActiveSessions by 1
        let newActiveSession = JSONObj.currentActiveSessions +=1
        console.log(newActiveSession)
        
        
        await client.db(dbName).collection('Agent').updateOne(
                                                              {'jid' : jid},
                                                              {$set: {'currentActiveSessions' : newActiveSession}},
                                                              function(err, res) {
                                                              if (err) throw err;
                                                                console.log("Number of Session has been incremented.")
                                                              })
    }
    else {
        console.log("Please wait. Current CSA is working at maximum capacity")
    }
    
}

/**
 Create a function that listens for engage/disengage
 --------------------------------
 toggleAvail("TestJID")
 */

async function toggleAvail(jid) {
    // First check the availability of the CSA
    let JSONObj = await client.db(dbName).collection('Agent').findOne(
                                                                      {'jid' : jid},
                                                                      {projection : {'availability' : 1 }})
    if (JSONObj == null) {
        console.log("Wrong JID input")
        return
    }
    console.log(JSONObj.availability)
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
    








module.exports = {
    checkAvail: checkAvail,
    addAgent: addAgent,
    modifyAgentProp: modifyAgentProp,
    IncrementAgentSession : IncrementAgentSession,
    toggleAvail : toggleAvail
};
