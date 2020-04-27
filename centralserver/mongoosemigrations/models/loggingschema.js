
const mongoose = require('mongoose');

const loggingSchema = mongoose.Schema({
    TicketNumber:{type: Number},
    Department: { type: String, required: true },
    ClientEmail: { type: String, required: true , validate: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
    AgentJID: { type: String, required: true, validate: /@sandbox-all-in-one-rbx-prod-1.rainbow.sbg/ },
    TimeOfLog: { type: Date },
    TypeOfCommunication: { type: String, required:true , enum: ['Chat', 'Audio', 'Video']},
    UpdatedAt: { type: Date, default: Date.now() },
    ChatHistory: {type: String},




}, {collection: 'Logging'});

// Update the updated_at field on save
loggingSchema.pre('save', (next) => {
    this.UpdatedAt = Date.now();
    next();
});

module.exports = LogSessions = mongoose.model('Log Sessions', loggingSchema);
