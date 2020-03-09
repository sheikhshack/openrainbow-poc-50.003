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
client.connect(function(err, client) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    const db = client.db(dbName);
                    checkAvail(db, function() {
                                  })
               
               
                    
});

async function checkAvail(departmentID, communication) {
                  // Get the Departments collection
                  const collection = client.db(dbName).collection('Agent');
                  // Perform the find function
                  await collection.find({
                    'availability': true,
                     'Department_id': departmentID,
                      'typeofComm' : communication
                  }).toArray(function(err, docs) {
                  console.log("Found the following records");
                  console.log(docs);
                  return docs;
             });
}


const updateavail = function(db, callback) {
                  // Get the documents collection
                  const collection = db.collection('Agents');
                  // Update document where a is 2, set b equal to 1
                  collection.updateOne() ;
};

module.exports = {
    checkAvail: checkAvail,

};




