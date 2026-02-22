const mongoose = require('mongoose');

const LabBookingSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    labId: { type: String, required: true },
    labName: { type: String, required: true },
    tests: [{
        name: { type: String, required: true },
        price: { type: String, required: true }
    }],
    totalCost: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'SCHEDULED' }
}, { timestamps: true });

module.exports = mongoose.models.LabBooking || mongoose.model('LabBooking', LabBookingSchema);
