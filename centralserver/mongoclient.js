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
                    checkAvail("Graduate Office","Chat")
});


// console log works to push json
// return function cant be called in the connect block :Pending Promise
async function checkAvail(departmentID, communication) {
                  // Get the Departments collection
                  const collection = await client.db(dbName).collection('Agent');
                  // Perform the find function
<<<<<<< Updated upstream
                  collection.find({
                     'availability': true,
                     'Department_id' : departmentID,
                     'typeOfComm' : communication
                     
                  }).toArray(function(err, docs) {
                  console.log("Found the following records");
                  console.log(JSON.stringify(docs));
                  return JSON.stringify(docs);
             });
=======
                  let data = await collection.find({
                    'availability': true,
                     'Department_id': departmentID,
                      'typeofComm' : communication
                  });
                  console.log("Found the following records");
                  console.log(data);
                  return data;
>>>>>>> Stashed changes
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
