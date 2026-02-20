const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    referralId: String,
    hospitalId: Number,
    hospitalName: String,
    patientName: String,
    bedReserved: Boolean,
    icuReserved: Boolean,
    specialistReserved: String,
    bedNumber: String,
    icuSlot: String,
    specialistSlotTime: String,
    status: { type: String, default: 'Reserved' },
    expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
