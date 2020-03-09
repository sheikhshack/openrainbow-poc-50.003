// Setup Express web application
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var mongoose = require("mongoose");

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

function checkAvail(db, callback) {
                  // Get the Departments collection
                  const collection = db.collection('Agent');
                  // Perform the find function
                  collection.find({
                    'availability': true
                  }).toArray(function(err, docs) {
                  assert.equal(err, null);
                  console.log("Found the following records");
                  console.log(docs);
                  return callback(docs);
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




