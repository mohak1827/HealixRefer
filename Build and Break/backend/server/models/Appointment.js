const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    patientId: String,
    patientName: String,
    hospitalId: Number,
    hospitalName: String,
    date: Date,
    time: String,
    type: String,
    status: { type: String, default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
