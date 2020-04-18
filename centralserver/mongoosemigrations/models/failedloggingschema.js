const mongoose = require('mongoose');

const failedLoggingSchema = mongoose.Schema({
    TicketNumber: {type: Number},
    Department: { type: String, required: true },
    ClientEmail: { type: String, required: true },
    TypeOfCommunication: { type: String, required:true , enum: ['Chat', 'Audio', 'Video']},
    Problem: { type: String },
    AttendedTo: {type: Boolean, required:true, default:false},
    TimeofLog: { type: Date },
    UpdatedAt: { type: Date, default: Date.now() },
}, {collection: 'Logging'});

// Update the updated_at field on save
failedLoggingSchema.pre('save', (next) => {
    this.UpdatedAt = Date.now();
    next();
});

module.exports = LogSessions = mongoose.model('Failed Log Sessions', failedLoggingSchema);
