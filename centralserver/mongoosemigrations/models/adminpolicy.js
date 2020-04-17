const mongoose = require('mongoose');

const adminPolicySchema = mongoose.Schema({
    _id: { type: String, required: true },
    activeMode: { type: Boolean, required: true },
    activeAll: { type: Boolean, required: true },
    activePolicy: { type: Number },
    departmentsActive: { type: Array },
    jid: { type: String },
    currentRequests: { type: Number },

}, {collection: 'AdminPolicy'});

// Update the updated_at field on save


module.exports = Agent = mongoose.model('AdminPolicy', adminPolicySchema);
