const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    city: String,
    lat: Number,
    lng: Number,
    distance: Number,
    totalBeds: Number,
    icuBeds: Number,
    availableBeds: Number,
    reservedBeds: { type: Number, default: 0 },
    reservedICU: { type: Number, default: 0 },
    specialists: [String],
    specialistSlots: { type: Map, of: Number },
    ambulanceETA: Number,
    equipment: [String],
    approved: { type: Boolean, default: true },
    contact: String
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
