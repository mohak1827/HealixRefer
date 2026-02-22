const mongoose = require('mongoose');

const escalationLogSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    referralId: String,
    fromHospitalId: Number,
    fromHospitalName: String,
    toHospitalId: Number,
    toHospitalName: String,
    reason: String,
    result: String
}, { timestamps: true });

module.exports = mongoose.model('EscalationLog', escalationLogSchema);
