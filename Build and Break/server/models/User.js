const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Patient', 'Doctor', 'Hospital Admin', 'Ambulance', 'Super Admin'] },
    village: String,
    age: Number,
    contact: String,
    phcName: String,
    hospitalId: Number,
    vehicleNo: String,
    district: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
