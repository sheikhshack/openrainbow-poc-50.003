// Setup Express web application
const express = require("express")
const bodyParser = require("body-parser")

const app = express()
var mongoose = require("mongoose")

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost';

// Use connect method to connect to the Server
MongoClient.connect(url,  {useUnifiedTopology: true }, function(err, client) {
                    assert.equal(null, err);
                    const db = client.db("sutdproject");
                    
                    var cursor = db.collection('Department').find({
                                                                  agentList: {"availability" : true}
                                                                  
                                                                  });

                    function iterateFunc(doc) {
                       console.log(JSON.stringify(doc, null, 4));
                    }

                    function errorFunc(error) {
                       console.log(error);
                    }

                    cursor.forEach(iterateFunc, errorFunc);
                    
                    
});



