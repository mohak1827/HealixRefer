const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    patientId: String,
    patientName: String,
    patientAge: Number,
    patientVillage: String,
    patientContact: String,
    symptoms: String,
    urgency: String,
    doctorId: String,
    doctorName: String,
    hospitalId: Number,
    hospitalName: String,
    specialistNeeded: String,
    needsICU: Boolean,
    status: { type: String, default: 'Pending' },
    aiReason: String,
    delayRisk: {
        level: String,
        score: Number,
        reason: String,
        factors: {
            distance: Number,
            icuOccupancy: Number,
            hospitalLoad: Number,
            travelTime: Number
        }
    },
    severity: {
        level: String,
        score: Number,
        color: String,
        reasons: [String]
    },
    notes: String,
    medicalReport: String,
    escalationDeadline: Date,
    escalationHistory: [{
        hospitalId: Number,
        hospitalName: String,
        reason: String,
        time: Date
    }],
    reservationId: String
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
