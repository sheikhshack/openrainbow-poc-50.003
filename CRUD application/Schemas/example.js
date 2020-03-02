// TODO#1 : Change this schema to reflect the CSA agents attributes
var mongoose = require("mongoose")

var Department = new mongoose.Schema({
  name : String,
  date : Date,
  availability : Boolean
  

});


// Export function
module.exports = mongoose.model("kitten", kittySchema)
