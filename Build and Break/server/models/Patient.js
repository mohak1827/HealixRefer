const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userId: String,
    name: { type: String, required: true },
    age: Number,
    village: String,
    contact: String
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
