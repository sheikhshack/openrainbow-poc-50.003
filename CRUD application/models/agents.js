var mongoose = require("mongoose")

// Get the Schema constructor
var Schema = mongoose.Schema

// Using Schema constructor, create a ProductSchema
var AgentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  avail: {
    type: Boolean,
    required: true
  },
  skills: [{
  type: String,
  required: true
  }]
})

// Create model from the schema
var Agent = mongoose.model("Agent", AgentSchema)

// Export model
module.exports = Agent
