const mongoose = require("mongoose");

// Get the Schema constructor
var Schema = mongoose.Schema

// Using Schema constructor, create a ProductSchema
var DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  agents: [{
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  }]
})

// Create model from the schema
var Department = mongoose.model("Department", DepartmentSchema)

// Export model
module.exports = Department
