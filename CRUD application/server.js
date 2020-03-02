// Setup Express web application
const express = require("express")
const bodyParser = require("body-parser")
const assert = require("assert")
const app = express()
var mongoose = require("mongoose")

// Set up default mongoose connection into sutdproject database
var mongoDB = "mongodb://127.0.0.1/sutdproject"
mongoose.connect(mongoDB, {useNewUrlParser: true,  useUnifiedTopology: true })

// Get default connection
var db = mongoose.connection

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.listen(3000,function(){
           console.log("listening on 3000")
           })

app.use(bodyParser.urlencoded({extended: true}))

/* Handles CRUD Read Operations from Express Server
 * Loads HTML file from directory
 */
app.get('/', (req, res) => {
        res.sendFile(__dirname + "/index.html")
        })

// Handles CRUD Create operation
// This is triggered by HTML <form> element in ./index.html
app.post('/csa', (req,res) => {
         console.log("Handling POST Requests")
         console.log(req.body)
         db.collection("csa").save(req.body), (err, result) =>
         {
            if (err) return console.log(err)
         
            console.log("saved to database")
            res.redirect("/")
         }
         })

// Connection channel is open : Do what you want here
db.once("open", function() {
        
        /**
         This example pulls the schema from another file | 1 Schema 1 File
         Here we save the schema as a document onto MongoDB.
         We can use MongoCompass GUI to interact with the databse more efficiently
         
         NOTE: .save() is depreciated. Need to swap it out with the appropriate functions
                1. saveall()
                2. insertMany(), etc
         */
        var Kitten = require("./Schemas/example.js")

        var silence = new Kitten({ name: 'Silence' })
        console.log(silence.name) // 'Silence'
        silence.save(function (err, silence) {
                     if (err) return console.error(err)
                     console.log(silence.name)
                     console.log(silence.date)
                     })

        })








console.log("Test")
