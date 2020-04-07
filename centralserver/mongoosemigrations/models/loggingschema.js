const mongoose = require('mongoose');

const loggingSchema = mongoose.Schema({
    Department: { type: String, required: true },
    ClientEmail: { type: String, required: true },
    AgentJID: { type: String, required: true },
    Status: { type: String },
    TimeofLog: { type: Date },
    TypeOfCommunication: { type: String, result:true },
    ChatHistory: { type: Object },
    UpdatedAt: { type: Date, default: Date.now() },
}, {collection: 'Logging'});

// Update the updated_at field on save
loggingSchema.pre('save', (next) => {
    this.UpdatedAt = Date.now();
    next();
});

module.exports = LogSessions = mongoose.model('Log Sessions', loggingSchema);