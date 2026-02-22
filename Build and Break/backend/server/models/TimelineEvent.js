const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    patientId: String,
    type: { type: String, enum: ['Referral', 'Analysis', 'Appointment', 'File Upload'] },
    title: String,
    description: String,
    date: { type: Date, default: Date.now },
    metadata: Object
}, { timestamps: true });

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
