const mongoose = require('mongoose');

const medicalFileSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    patientId: String,
    fileName: String,
    originalName: String,
    fileType: String,
    fileSize: Number,
    filePath: String,
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MedicalFile', medicalFileSchema);
