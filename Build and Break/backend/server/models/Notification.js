const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userId: String,
    role: String,
    title: String,
    message: String,
    type: { type: String, default: 'info' },
    referralId: String,
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
