const express = require('express');
const multer = require('multer');
const path = require('path');
const patientController = require('../controllers/patientController');
const jwt = require('jsonwebtoken');

// ─── Middleware ─────────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'healix_secret_2026');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. Requires: ${roles.join(' or ')}` });
    }
    next();
};

const router = express.Router();
router.use(authenticate);
router.use(requireRole('Patient'));

// Multer Configuration for Medical Vault
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/medical-vault/');
    },
    filename: (req, file, cb) => {
        cb(null, `vault-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Profile
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// AI Analysis
router.post('/analyze', patientController.analyzeSymptoms);

// Referrals
router.get('/hospitals', patientController.getHospitals);
router.post('/referral', patientController.createReferral);
router.get('/my-referrals', patientController.getMyReferrals);

// Medical Vault
router.post('/upload', upload.single('file'), patientController.uploadMedicalFile);
router.get('/vault', patientController.getMedicalFiles);
router.delete('/vault/:id', patientController.deleteMedicalFile);
router.get('/download/:id', patientController.downloadMedicalFile);

// Timeline
router.get('/timeline', patientController.getTimeline);

// Appointments
router.post('/appointment', patientController.bookAppointment);
router.get('/appointments', patientController.getAppointments);
router.put('/appointment/:id', patientController.updateAppointment);
router.delete('/appointment/:id', patientController.deleteAppointment);

module.exports = router;
