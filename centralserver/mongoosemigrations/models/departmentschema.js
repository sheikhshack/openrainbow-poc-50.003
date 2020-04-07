const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    _id: { type: String, required: true },
    number_of_agents: { type: Number, required: true },
    currentQueueNumber: { type: Number },
    totalActiveRequests: { type: Number, default: 3 },
    servicedRequests: { type: Number },
    failedRequests: { type: Number, default: 0 },
    servicedToday: { type: Object }

}, {collection: 'Department'});

// Update the updated_at field on save


module.exports = Departments = mongoose.model('Departments', departmentSchema);
