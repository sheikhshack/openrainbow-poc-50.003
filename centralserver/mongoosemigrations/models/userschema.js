const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar_url: { type: String },
    bio: { type: String },

    created_at: { type: Date, default: Date.now() },
    updated_at: { type: Date, default: Date.now() },
});

// Update the updated_at field on save
userSchema.pre('save', (next) => {
    this.updated_at = Date.now();
    next();
});

module.exports = User = mongoose.model('User', userSchema);
