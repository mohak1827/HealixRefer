const mongoose = require('mongoose');

const ambulanceAssignmentSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    referralId: { type: String, required: true },
    driverId: String,
    driverName: String,
    vehicleNo: String,
    status: { type: String, default: 'Dispatched' },
    dispatchedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    gpsData: {
        lat: Number,
        lng: Number,
        heading: Number,
        speed: Number,
        etaMinutes: Number,
        progress: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('AmbulanceAssignment', ambulanceAssignmentSchema);
