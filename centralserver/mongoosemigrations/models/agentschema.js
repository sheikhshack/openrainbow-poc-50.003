const mongoose = require('mongoose');

const agentSchema = mongoose.Schema({
    _id: { type: String, required: true },
    jid: { type: String, required: true },
    Department_id: { type: String, required: true },
    name: { type: String },
    availability: { type: Boolean },
    typeOfComm: { type: Array, required: true},
    currentActiveSessions: { type: Number },
    reserve: { type: Number },
    servicedToday: { type: Number },

}, {collection: 'Agent'});

// Update the updated_at field on save


module.exports = Agent = mongoose.model('Agent', agentSchema);
