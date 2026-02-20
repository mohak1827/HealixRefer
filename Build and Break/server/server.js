const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Import Models
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Referral = require('./models/Referral');
const Reservation = require('./models/Reservation');
const Notification = require('./models/Notification');
const AmbulanceAssignment = require('./models/AmbulanceAssignment');
const EscalationLog = require('./models/EscalationLog');
const Patient = require('./models/Patient');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'healix_secret_2026';

// ─── MongoDB Connection ───────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healix';
let isDbConnected = false;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        isDbConnected = true;
    })
    .catch(err => {
        console.error('⚠️ MongoDB Connection Failed:', err.message);
        console.warn('🚀 Starting in SIMULATION MODE (In-Memory Fallback Active)');
        isDbConnected = false;
    });

// Fallback In-Memory Stores
const memUsers = [];
const memHospitals = [];
const memReferrals = [];
const memReservations = [];
const memNotifications = [];
const memEscalationLogs = [];
const memAmbulanceAssignments = [];
const memPatients = [];

// ─── Seed Demo Accounts ────────────────────────────────────────────────────
const seedDemoAccounts = async () => {
    try {
        const demoUsers = [
            { id: 'demo_Patient', name: 'Ramesh Kumar', email: 'patient@healix.ai', password: 'password123', role: 'Patient', village: 'Sehore', age: 45, contact: '9876543210' },
            { id: 'demo_Doctor', name: 'Dr. Arjun Sharma', email: 'doctor@healix.ai', password: 'password123', role: 'Doctor', phcName: 'Sehore PHC' },
            { id: 'demo_Hospital_Admin', name: 'Admin Priya Singh', email: 'admin@healix.ai', password: 'password123', role: 'Hospital Admin', hospitalId: 1 },
            { id: 'demo_Ambulance', name: 'Ravi Kumar', email: 'ambulance@healix.ai', password: 'password123', role: 'Ambulance', vehicleNo: 'MP-04-AB-1234' },
            { id: 'demo_Super_Admin', name: 'Dr. Meera Patel', email: 'superadmin@healix.ai', password: 'password123', role: 'Super Admin', district: 'Sehore' },
        ];

        for (const demo of demoUsers) {
            memUsers.push(demo);
            if (isDbConnected) {
                const exists = await User.findOne({ email: demo.email });
                if (!exists) {
                    const hashedPassword = await bcrypt.hash(demo.password, 10);
                    await new User({ ...demo, password: hashedPassword }).save();
                    console.log(`✅ Seeded demo user: ${demo.role}`);
                }
            }
        }

        const initialHospitals = [
            { id: 1, name: "City General Hospital", city: "Bhopal", lat: 23.2599, lng: 77.4126, distance: 12, totalBeds: 60, icuBeds: 8, availableBeds: 45, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "Neurologist", "Orthopedic"], specialistSlots: { Cardiologist: 3, Neurologist: 2, Orthopedic: 2 }, ambulanceETA: 18, equipment: ["Ventilator", "ECG", "CT Scan", "MRI"], approved: true, contact: "0755-2345678" },
            { id: 2, name: "District Medical Center", city: "Indore", lat: 22.7196, lng: 75.8577, distance: 25, totalBeds: 40, icuBeds: 3, availableBeds: 30, reservedBeds: 0, reservedICU: 0, specialists: ["Orthopedic", "General Surgeon"], specialistSlots: { Orthopedic: 2, "General Surgeon": 1 }, ambulanceETA: 32, equipment: ["X-Ray", "ECG", "Ultrasound"], approved: true, contact: "0731-9876543" },
            { id: 3, name: "Rural Health Institute", city: "Sehore", lat: 23.2000, lng: 77.0860, distance: 8, totalBeds: 20, icuBeds: 2, availableBeds: 15, reservedBeds: 0, reservedICU: 0, specialists: ["General"], specialistSlots: { General: 3 }, ambulanceETA: 14, equipment: ["Basic", "X-Ray"], approved: true, contact: "07562-234567" },
            { id: 4, name: "St. Mary's Specialty Hospital", city: "Bhopal", lat: 23.2800, lng: 77.4350, distance: 38, totalBeds: 80, icuBeds: 12, availableBeds: 60, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "Neurologist", "Orthopedic", "Pulmonologist"], specialistSlots: { Cardiologist: 4, Neurologist: 3, Orthopedic: 3, Pulmonologist: 2 }, ambulanceETA: 45, equipment: ["Ventilator", "MRI", "CT Scan", "ECG", "Dialysis"], approved: true, contact: "0755-8765432" },
            { id: 5, name: "Community Care Hospital", city: "Raisen", lat: 23.3300, lng: 77.7900, distance: 19, totalBeds: 35, icuBeds: 5, availableBeds: 25, reservedBeds: 0, reservedICU: 0, specialists: ["General", "Neurologist"], specialistSlots: { General: 2, Neurologist: 1 }, ambulanceETA: 27, equipment: ["ECG", "X-Ray", "Ventilator"], approved: true, contact: "07482-345678" },
            { id: 6, name: "Apollo Rural Clinic", city: "Vidisha", lat: 23.5251, lng: 77.8081, distance: 32, totalBeds: 50, icuBeds: 6, availableBeds: 38, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "General Surgeon", "Pediatrician"], specialistSlots: { Cardiologist: 2, "General Surgeon": 2, Pediatrician: 3 }, ambulanceETA: 35, equipment: ["Ventilator", "ECG", "CT Scan", "Ultrasound"], approved: true, contact: "07592-456789" },
            { id: 7, name: "Lifeline Trauma Center", city: "Hoshangabad", lat: 22.7467, lng: 77.7259, distance: 45, totalBeds: 70, icuBeds: 10, availableBeds: 50, reservedBeds: 0, reservedICU: 0, specialists: ["Orthopedic", "Neurologist", "General Surgeon", "Anesthesiologist"], specialistSlots: { Orthopedic: 3, Neurologist: 2, "General Surgeon": 2, Anesthesiologist: 2 }, ambulanceETA: 50, equipment: ["Ventilator", "MRI", "CT Scan", "ECG", "X-Ray", "Dialysis"], approved: true, contact: "07574-567890" },
            { id: 8, name: "Madhya Pradesh Institute of Medical Sciences", city: "Bhopal", lat: 23.2100, lng: 77.3900, distance: 15, totalBeds: 100, icuBeds: 15, availableBeds: 72, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "Neurologist", "Orthopedic", "Pulmonologist", "Oncologist", "Nephrologist"], specialistSlots: { Cardiologist: 5, Neurologist: 4, Orthopedic: 3, Pulmonologist: 3, Oncologist: 2, Nephrologist: 2 }, ambulanceETA: 20, equipment: ["Ventilator", "MRI", "CT Scan", "ECG", "Dialysis", "ECMO", "Cathlab"], approved: true, contact: "0755-1234567" },
        ];

        for (const hosp of initialHospitals) {
            memHospitals.push(hosp);
            if (isDbConnected) {
                const exists = await Hospital.findOne({ id: hosp.id });
                if (!exists) {
                    await new Hospital(hosp).save();
                    console.log(`✅ Seeded hospital: ${hosp.name}`);
                }
            }
        }
    } catch (err) {
        console.error('❌ Error seeding data:', err.message);
    }
};
seedDemoAccounts();

// ─── Auth Middleware ────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
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

// ─── Auth Routes ────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    console.log('📝 POST /api/auth/register hit with:', req.body.email);
    try {
        const { name, email, password, role, village, age, contact, phcName, hospitalId, vehicleNo } = req.body;
        if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

        const existing = await User.findOne({ email });
        if (existing) {
            console.warn('⚠️ Register failed: User already exists');
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            id: `u${Date.now()}`, name, email, password: hashedPassword, role,
            village: village || null, age: age || null, contact: contact || null,
            phcName: phcName || null, hospitalId: hospitalId ? parseInt(hospitalId) : null, vehicleNo: vehicleNo || null
        });
        await newUser.save();
        console.log('✅ User registered successfully:', email);
        res.json({ success: true, message: "Registration successful. You can now log in." });
    } catch (err) {
        console.error('❌ Registration Error:', err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    console.log('🔑 POST /api/auth/login hit for:', req.body.email);
    try {
        const { email, password } = req.body;
        let user;
        if (isDbConnected) {
            user = await User.findOne({ email });
        } else {
            user = memUsers.find(u => u.email === email);
        }

        if (!user || (isDbConnected ? !(await bcrypt.compare(password, user.password)) : password !== 'password123')) {
            console.warn('⚠️ Login failed: Invalid credentials for', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user.id || user._id, email: user.email, role: user.role, name: user.name, hospitalId: user.hospitalId, village: user.village, age: user.age, contact: user.contact, phcName: user.phcName, vehicleNo: user.vehicleNo },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        console.log('✅ Login successful for:', email);
        res.json({
            token,
            user: {
                id: user.id || user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                hospitalId: user.hospitalId,
                village: user.village,
                age: user.age,
                contact: user.contact,
                phcName: user.phcName,
                vehicleNo: user.vehicleNo
            }
        });
    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ message: "Server error during login" });
    }
});

// ─── Session Recovery ───────────────────────────────────────────────────────
app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        let user;
        if (isDbConnected) {
            user = await User.findById(req.user.id).select('-password');
            if (!user) {
                // Fallback: return decoded token data
                return res.json({
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    hospitalId: req.user.hospitalId,
                    village: req.user.village,
                    age: req.user.age,
                    contact: req.user.contact,
                    phcName: req.user.phcName,
                    vehicleNo: req.user.vehicleNo
                });
            }
            res.json(user);
        } else {
            // In simulation mode, return token-decoded user data
            res.json({
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                hospitalId: req.user.hospitalId,
                village: req.user.village,
                age: req.user.age,
                contact: req.user.contact,
                phcName: req.user.phcName,
                vehicleNo: req.user.vehicleNo
            });
        }
    } catch (err) {
        console.error('❌ Auth/me Error:', err.message);
        res.status(500).json({ message: "Session recovery failed" });
    }
});


// Remove legacy in-memory stores
// const users = [];
// const patients = [];
// const referrals = [];
// const hospitals = [];
// const reservations = [];
// const ambulanceAssignments = [];
// const notifications = [];
// const escalationLogs = [];
// const ambulanceGPS = {};
// let nextReferralNum = 1;

// PHC location (doctor's origin)
const PHC_LOCATION = { lat: 23.2000, lng: 77.0860, name: 'Sehore PHC' };

// ═══════════════════════════════════════════════════════════════════════════
// AI ENGINES
// ═══════════════════════════════════════════════════════════════════════════

// ─── AI Emergency Severity Classifier ───────────────────────────────────────
function classifySeverity(symptoms, urgency, needsICU, specialistNeeded) {
    const symptomsLower = (symptoms || '').toLowerCase();
    let score = 0;
    let reasons = [];

    const criticalKeywords = ['cardiac arrest', 'heart attack', 'stroke', 'severe bleeding', 'unconscious', 'not breathing', 'anaphylaxis', 'multi-organ', 'trauma', 'sepsis', 'respiratory failure'];
    const highKeywords = ['chest pain', 'difficulty breathing', 'seizure', 'fracture', 'severe pain', 'high fever', 'head injury', 'burns', 'poisoning', 'hemorrhage', 'paralysis'];
    const moderateKeywords = ['infection', 'fever', 'vomiting', 'diarrhea', 'abdominal pain', 'cough', 'weakness', 'dehydration', 'wound', 'swelling', 'rash'];

    criticalKeywords.forEach(k => { if (symptomsLower.includes(k)) { score += 40; reasons.push(`Critical symptom: ${k}`); } });
    highKeywords.forEach(k => { if (symptomsLower.includes(k)) { score += 25; reasons.push(`High-priority symptom: ${k}`); } });
    moderateKeywords.forEach(k => { if (symptomsLower.includes(k)) { score += 10; reasons.push(`Moderate symptom: ${k}`); } });

    if (urgency === 'Emergency') { score += 30; reasons.push('Emergency urgency selected'); }
    if (needsICU) { score += 20; reasons.push('ICU required'); }
    if (specialistNeeded && specialistNeeded !== 'General') { score += 10; reasons.push(`Specialist needed: ${specialistNeeded}`); }

    let level, color;
    if (score >= 60) { level = 'Critical'; color = '#DC2626'; }
    else if (score >= 40) { level = 'High Priority'; color = '#F59E0B'; }
    else if (score >= 20) { level = 'Moderate'; color = '#3B82F6'; }
    else { level = 'Stable'; color = '#10B981'; }

    return { level, score: Math.min(100, score), color, reasons: reasons.slice(0, 5) };
}

// ─── AI Delay Risk Predictor ────────────────────────────────────────────────
function calculateDelayRisk(hospital, urgency) {
    const distance = hospital.distance;
    const icuTotal = hospital.icuBeds + hospital.reservedICU;
    const icuUsed = (hospital.icuBeds > 0) ? ((icuTotal - hospital.icuBeds) / icuTotal) * 100 : 0;
    const hospitalLoad = ((hospital.totalBeds - hospital.availableBeds + hospital.reservedBeds) / hospital.totalBeds) * 100;
    const travelTime = hospital.ambulanceETA;

    let riskScore = 0;
    let reasons = [];

    // Distance factor
    if (distance > 35) { riskScore += 35; reasons.push(`Long distance: ${distance} km`); }
    else if (distance > 20) { riskScore += 20; reasons.push(`Moderate distance: ${distance} km`); }
    else { riskScore += 5; }

    // ICU occupancy factor
    if (icuUsed > 80) { riskScore += 30; reasons.push(`High ICU occupancy: ${Math.round(icuUsed)}%`); }
    else if (icuUsed > 60) { riskScore += 15; reasons.push(`Moderate ICU occupancy: ${Math.round(icuUsed)}%`); }

    // Hospital load factor
    if (hospitalLoad > 85) { riskScore += 25; reasons.push(`Hospital overloaded: ${Math.round(hospitalLoad)}% capacity`); }
    else if (hospitalLoad > 65) { riskScore += 10; reasons.push(`Hospital busy: ${Math.round(hospitalLoad)}% capacity`); }

    // Travel time factor
    if (travelTime > 40) { riskScore += 20; reasons.push(`Long travel time: ${travelTime} min`); }
    else if (travelTime > 25) { riskScore += 10; reasons.push(`Moderate travel time: ${travelTime} min`); }

    // Emergency urgency multiplier
    if (urgency === 'Emergency') { riskScore = Math.round(riskScore * 1.3); }

    let level;
    if (riskScore >= 60) level = 'High';
    else if (riskScore >= 30) level = 'Medium';
    else level = 'Low';

    return {
        level,
        score: Math.min(100, riskScore),
        reason: reasons.length > 0 ? reasons.join(' | ') : 'All parameters within safe limits',
        factors: {
            distance,
            icuOccupancy: Math.round(icuUsed),
            hospitalLoad: Math.round(hospitalLoad),
            travelTime
        }
    };
}

// ─── AI Hospital Scoring Engine ─────────────────────────────────────────────
async function aiSuggestHospital(symptoms, urgency, specialistNeeded, needsICU) {
    console.log('🤖 AI Scoring Engine started for:', { symptoms: symptoms?.substring(0, 20), urgency, specialistNeeded, needsICU });

    let allHospitals;
    if (isDbConnected) {
        allHospitals = await Hospital.find({ approved: true });
    } else {
        allHospitals = memHospitals.filter(h => h.approved);
    }

    console.log(`🏥 Found ${allHospitals.length} hospitals`);

    const results = allHospitals
        .filter(h => (h.availableBeds - h.reservedBeds) > 0)
        .map(h => {
            let score = 100;
            let reasons = [];
            const effectiveBeds = h.availableBeds - h.reservedBeds;
            const effectiveICU = h.icuBeds - h.reservedICU;

            // Distance scoring
            if (urgency === 'Emergency') {
                score -= h.distance * 1.5;
                if (h.distance <= 15) reasons.push(`Only ${h.distance} km away`);
            } else {
                score -= h.distance * 0.8;
                if (h.distance <= 20) reasons.push(`${h.distance} km away`);
            }

            // ICU scoring
            if (needsICU || urgency === 'Emergency') {
                if (effectiveICU > 0) {
                    score += 25;
                    reasons.push(`ICU available (${effectiveICU} slots)`);
                } else {
                    score -= 40;
                }
            }

            // Specialist scoring
            if (specialistNeeded && h.specialists.includes(specialistNeeded)) {
                const slots = (h.specialistSlots instanceof Map) ? (h.specialistSlots.get(specialistNeeded) || 0) : (h.specialistSlots?.[specialistNeeded] || 0);
                if (slots > 0) {
                    score += 30;
                    reasons.push(`${specialistNeeded} available (${slots} slots)`);
                } else {
                    score += 10;
                    reasons.push(`${specialistNeeded} on staff`);
                }
            } else if (specialistNeeded) {
                score -= 25;
            }

            // Bed availability
            const bedRatio = effectiveBeds / h.totalBeds;
            if (bedRatio > 0.5) {
                score += 15;
                reasons.push(`${effectiveBeds} beds available`);
            } else if (bedRatio > 0.2) {
                score += 5;
                reasons.push(`${effectiveBeds} beds available`);
            } else {
                score -= 10;
            }

            // Equipment bonus
            if (h.equipment.includes('Ventilator') && urgency === 'Emergency') {
                score += 10;
                reasons.push('Ventilator available');
            }

            // ETA
            if (h.ambulanceETA <= 20) {
                score += 10;
                reasons.push(`ETA: ${h.ambulanceETA} min`);
            }

            // Delay risk
            const delayRisk = calculateDelayRisk(h, urgency);

            const survivalChance = calculateSurvival(urgency, h.ambulanceETA);
            const reasonString = reasons.length > 0
                ? `Selected because: ${reasons.join(' + ')}`
                : 'General availability match';

            const base = (typeof h.toObject === 'function') ? h.toObject() : { ...h };
            return {
                ...base,
                effectiveBeds,
                effectiveICU,
                score: Math.max(0, Math.round(score)),
                survivalChance,
                reasons,
                reasonString,
                delayRisk
            };
        })
        .sort((a, b) => b.score - a.score);

    return results;
}

function calculateSurvival(urgency, eta) {
    if (urgency === "Normal") return Math.round((97 + Math.random() * 2) * 10) / 10;
    const base = urgency === "Emergency" ? 95 : 97;
    const decay = urgency === "Emergency" ? 0.05 : 0.02;
    const thresh = urgency === "Emergency" ? 30 : 50;
    const chance = base * (1 / (1 + Math.exp(decay * (eta - thresh))));
    return Math.max(5, Math.round(chance * 10) / 10);
}

// ─── Notification Helper ────────────────────────────────────────────────────
async function addNotification(userId, role, title, message, type = 'info', referralId = null) {
    console.log(`🔔 Sending notification to ${role}: ${title}`);
    try {
        const count = isDbConnected ? await Notification.countDocuments() : memNotifications.length;
        const notifData = {
            id: `NOTIF${String(count + 1).padStart(4, '0')}`,
            userId,
            role,
            title,
            message,
            type,
            referralId,
            read: false,
            createdAt: new Date()
        };

        if (isDbConnected) {
            const notif = new Notification(notifData);
            await notif.save();
            return notif;
        } else {
            memNotifications.push(notifData);
            return notifData;
        }
    } catch (err) {
        console.error('❌ Notification Error:', err.message);
    }
}

// ─── GPS Simulation Helper ──────────────────────────────────────────────────
function startGPSSimulation(assignmentId, fromLat, fromLng, toLat, toLng) {
    let progress = 0;
    const interval = setInterval(async () => {
        progress += 0.05;

        // Helper to get the assignment
        const getAssignment = async () => {
            if (isDbConnected) return await AmbulanceAssignment.findOne({ id: assignmentId });
            return memAmbulanceAssignments.find(a => a.id === assignmentId);
        };

        const assignment = await getAssignment();
        if (!assignment) { clearInterval(interval); return; }

        if (progress >= 1) {
            clearInterval(interval);
            assignment.status = 'Delivered';
            assignment.deliveredAt = new Date();
            assignment.gpsData.progress = 100;
            assignment.gpsData.etaMinutes = 0;
            assignment.gpsData.lat = toLat;
            assignment.gpsData.lng = toLng;
            assignment.gpsData.updatedAt = new Date().toISOString();
            if (isDbConnected) await assignment.save();
            return;
        }

        const currentLat = fromLat + (toLat - fromLat) * progress;
        const currentLng = fromLng + (toLng - fromLng) * progress;

        assignment.gpsData.lat = currentLat;
        assignment.gpsData.lng = currentLng;
        assignment.gpsData.progress = Math.round(progress * 100);
        assignment.gpsData.etaMinutes = Math.round(20 * (1 - progress));
        assignment.gpsData.speed = 40 + Math.random() * 25;
        assignment.gpsData.updatedAt = new Date().toISOString();
        if (isDbConnected) await assignment.save();
    }, 5000);
}


// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ─── Patient Routes ─────────────────────────────────────────────────────────
app.post('/api/patients/register', authenticate, requireRole('Patient'), async (req, res) => {
    console.log('👤 /api/patients/register hit for user:', req.user.id);
    try {
        const { name, age, village, contact } = req.body;
        if (!name || !age || !village || !contact) return res.status(400).json({ message: "All fields required" });

        let patient = await Patient.findOne({ userId: req.user.id });
        if (patient) {
            patient.name = name;
            patient.age = age;
            patient.village = village;
            patient.contact = contact;
            await patient.save();
            console.log('✅ Patient profile updated:', name);
            return res.json({ success: true, patient, message: "Profile updated" });
        }

        const count = await Patient.countDocuments();
        patient = new Patient({
            id: `PAT${String(count + 1).padStart(3, '0')}`,
            userId: req.user.id,
            name, age, village, contact
        });
        await patient.save();
        console.log('✅ New patient registered:', name);
        res.json({ success: true, patient });
    } catch (err) {
        console.error('❌ Patient Register Error:', err.message);
        res.status(500).json({ message: "Error saving patient profile" });
    }
});

app.get('/api/patients/profile', authenticate, requireRole('Patient'), async (req, res) => {
    try {
        const patient = isDbConnected ? await Patient.findOne({ userId: req.user.id }) : memPatients.find(p => p.userId === req.user.id);
        res.json(patient || null);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

app.get('/api/patients/my-referral', authenticate, requireRole('Patient'), async (req, res) => {
    try {
        const patient = isDbConnected ? await Patient.findOne({ userId: req.user.id }) : memPatients.find(p => p.userId === req.user.id);
        if (!patient) return res.json({ referrals: [], ambulance: null });

        let myReferrals;
        if (isDbConnected) {
            myReferrals = await Referral.find({ $or: [{ patientId: patient.id }, { patientName: patient.name }] }).sort({ createdAt: -1 });
        } else {
            myReferrals = memReferrals.filter(r => r.patientId === patient.id || r.patientName === patient.name).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        const activeReferral = myReferrals.find(r => r.status !== 'Completed' && r.status !== 'Admitted') || myReferrals[0];

        let ambulance = null;
        let reservation = null;
        let hospital = null;

        if (activeReferral) {
            if (isDbConnected) {
                ambulance = await AmbulanceAssignment.findOne({ referralId: activeReferral.id });
                reservation = await Reservation.findOne({ referralId: activeReferral.id });
                hospital = await Hospital.findOne({ id: activeReferral.hospitalId });
            } else {
                ambulance = memAmbulanceAssignments.find(a => a.referralId === activeReferral.id);
                reservation = memReservations.find(r => r.referralId === activeReferral.id);
                hospital = memHospitals.find(h => h.id === activeReferral.hospitalId);
            }
        }

        res.json({ referrals: myReferrals, activeReferral, ambulance, hospital, reservation });
    } catch (err) {
        console.error('❌ Patient My-Referral Error:', err.message);
        res.status(500).json({ message: "Error fetching patient referrals" });
    }
});


// ─── Doctor Routes ──────────────────────────────────────────────────────────
app.post('/api/ai/suggest-hospital', authenticate, requireRole('Doctor'), async (req, res) => {
    console.log('🤖 POST /api/ai/suggest-hospital hit by:', req.user.email);
    try {
        const { symptoms, urgency, specialistNeeded, needsICU } = req.body;
        console.log('📦 Body:', { symptoms: symptoms?.substring(0, 20), urgency, specialistNeeded, needsICU });
        const results = await aiSuggestHospital(symptoms, urgency, specialistNeeded, needsICU);
        console.log(`✅ AI Suggestion Complete: ${results.length} options found`);
        res.json({ suggestions: results, bestMatch: results[0] || null });
    } catch (err) {
        console.error('❌ AI Suggestion Error Stack:', err.stack);
        res.status(500).json({ message: "AI processing failed", error: err.message });
    }
});

app.post('/api/referrals', authenticate, requireRole('Doctor'), async (req, res) => {
    console.log('📋 POST /api/referrals hit with patient:', req.body.patientName);
    try {
        const { patientName, patientAge, patientVillage, patientContact, symptoms, urgency, hospitalId, specialistNeeded, notes, aiReason, medicalReport, needsICU } = req.body;

        let hospital;
        if (isDbConnected) {
            hospital = await Hospital.findOne({ id: hospitalId });
        } else {
            hospital = memHospitals.find(h => h.id === hospitalId);
        }
        if (!hospital) {
            console.error('❌ Referral failed: Hospital not found:', hospitalId);
            return res.status(404).json({ message: "Hospital not found" });
        }

        // Find or create patient record
        let patient;
        if (isDbConnected) {
            patient = await Patient.findOne({ name: patientName });
            if (!patient) {
                const pCount = await Patient.countDocuments();
                patient = new Patient({
                    id: `PAT${String(pCount + 1).padStart(3, '0')}`,
                    name: patientName,
                    age: patientAge || null,
                    village: patientVillage || null,
                    contact: patientContact || null
                });
                await patient.save();
                console.log('✅ Created new patient record:', patient.id);
            }
        } else {
            patient = memPatients.find(p => p.name === patientName);
            if (!patient) {
                patient = {
                    id: `PAT${String(memPatients.length + 1).padStart(3, '0')}`,
                    name: patientName,
                    age: patientAge || null,
                    village: patientVillage || null,
                    contact: patientContact || null
                };
                memPatients.push(patient);
                console.log('✅ Created in-memory patient record:', patient.id);
            }
        }

        const refCount = isDbConnected ? await Referral.countDocuments() : memReferrals.length;
        const id = `REF${String(refCount + 1).padStart(3, '0')}`;
        const delayRisk = calculateDelayRisk(hospital, urgency);

        const referralData = {
            id,
            patientId: patient.id,
            patientName,
            patientAge: patientAge || patient.age,
            patientVillage: patientVillage || patient.village,
            patientContact: patientContact || patient.contact,
            symptoms,
            urgency,
            doctorId: req.user.id,
            doctorName: req.user.name,
            hospitalId,
            hospitalName: hospital.name,
            specialistNeeded,
            needsICU: needsICU || urgency === 'Emergency',
            status: 'Pending',
            aiReason: aiReason || '',
            delayRisk,
            severity: classifySeverity(symptoms, urgency, needsICU, specialistNeeded),
            notes: notes || '',
            medicalReport: medicalReport || null,
            escalationDeadline: new Date(Date.now() + (urgency === 'Emergency' ? 5 * 60000 : 15 * 60000)),
            createdAt: new Date()
        };

        const referral = isDbConnected ? new Referral(referralData) : referralData;

        // ─── AUTO RESOURCE RESERVATION ──────────────────────────────
        const resCount = isDbConnected ? await Reservation.countDocuments() : memReservations.length;
        const reservation = new (isDbConnected ? Reservation : class { constructor(obj) { Object.assign(this, obj); this.id = obj.id; } save() { memReservations.push(this); return this; } })({
            id: `RES${String(resCount + 1).padStart(3, '0')}`,
            referralId: id,
            hospitalId,
            hospitalName: hospital.name,
            patientName,
            bedReserved: true,
            icuReserved: needsICU || urgency === 'Emergency',
            specialistReserved: specialistNeeded || null,
            status: 'Reserved',
            expiresAt: new Date(Date.now() + 60 * 60000), // 1 hour reservation
        });

        // Update hospital resources
        const availableBeds = isDbConnected ? hospital.availableBeds : hospital.availableBeds;
        const reservedBeds = isDbConnected ? hospital.reservedBeds : hospital.reservedBeds;

        if (availableBeds > reservedBeds) {
            if (isDbConnected) {
                hospital.reservedBeds += 1;
            } else {
                hospital.reservedBeds += 1;
            }
            reservation.bedNumber = `B-${hospital.totalBeds - hospital.availableBeds + hospital.reservedBeds}`;
        }

        if (reservation.icuReserved && (isDbConnected ? hospital.icuBeds > hospital.reservedICU : hospital.icuBeds > (hospital.reservedICU || 0))) {
            if (isDbConnected) {
                hospital.reservedICU += 1;
            } else {
                hospital.reservedICU = (hospital.reservedICU || 0) + 1;
            }
            reservation.icuSlot = `ICU-${isDbConnected ? hospital.reservedICU : hospital.reservedICU}`;
        }

        if (reservation.specialistReserved) {
            const slots = isDbConnected ? hospital.specialistSlots?.get(specialistNeeded) : (hospital.specialistSlots && hospital.specialistSlots[specialistNeeded]);
            if (slots > 0) {
                if (isDbConnected) {
                    hospital.specialistSlots.set(specialistNeeded, slots - 1);
                } else {
                    hospital.specialistSlots[specialistNeeded] = slots - 1;
                }
                reservation.specialistSlotTime = `${10 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`;
            }
        }

        if (isDbConnected) {
            await hospital.save();
            await reservation.save();
            referral.reservationId = reservation.id;
            await referral.save();
        } else {
            memReservations.push(reservation);
            referral.reservationId = reservation.id;
            memReferrals.push(referral);
        }

        console.log('✅ Referral and Reservation saved successfully:', id);

        // Notify hospital admin
        await addNotification(null, 'Hospital Admin', '🏥 New Referral Incoming',
            `${urgency} referral for ${patientName}: ${symptoms}. Resources auto-reserved.`,
            urgency === 'Emergency' ? 'warning' : 'info', id);

        // Notify patient
        await addNotification(null, 'Patient', '📋 Referral Created',
            `Your referral to ${hospital.name} has been created. Bed and resources reserved.`,
            'success', id);

        res.json({ success: true, referral, reservation });
    } catch (err) {
        console.error('❌ Referral Creation Error:', err.message);
        res.status(500).json({ message: "Error creating referral" });
    }
});

app.get('/api/referrals', authenticate, async (req, res) => {
    try {
        let results;
        if (isDbConnected) {
            let query = {};
            if (req.user.role === 'Doctor') {
                query = { doctorId: req.user.id };
            } else if (req.user.role === 'Hospital Admin') {
                query = { hospitalId: req.user.hospitalId };
            } else if (req.user.role === 'Ambulance') {
                query = { status: { $in: ['Accepted', 'In Transit'] } };
            } else if (req.user.role === 'Patient') {
                const patient = await Patient.findOne({ userId: req.user.id });
                if (!patient) return res.json([]);
                query = { $or: [{ patientId: patient.id }, { patientName: patient.name }] };
            }
            results = await Referral.find(query).sort({ createdAt: -1 });
        } else {
            results = memReferrals.filter(r => {
                if (req.user.role === 'Doctor') return r.doctorId === req.user.id;
                if (req.user.role === 'Hospital Admin') return r.hospitalId === req.user.hospitalId;
                if (req.user.role === 'Ambulance') return ['Accepted', 'In Transit'].includes(r.status);
                if (req.user.role === 'Patient') return r.patientName === req.user.name; // Simpler check for mem
                return true;
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Error fetching referrals" });
    }
});

// ─── Reservation Routes ─────────────────────────────────────────────────────
app.get('/api/reservations', authenticate, async (req, res) => {
    try {
        let results;
        if (isDbConnected) {
            let query = {};
            if (req.user.role === 'Hospital Admin') {
                query = { hospitalId: req.user.hospitalId };
            } else if (req.user.role === 'Doctor') {
                const doctorReferralIds = (await Referral.find({ doctorId: req.user.id })).map(r => r.id);
                query = { referralId: { $in: doctorReferralIds } };
            }
            results = await Reservation.find(query).sort({ createdAt: -1 });
        } else {
            results = memReservations.filter(r => {
                if (req.user.role === 'Hospital Admin') return r.hospitalId === req.user.hospitalId;
                if (req.user.role === 'Doctor') {
                    const doctorRefIds = memReferrals.filter(ref => ref.doctorId === req.user.id).map(ref => ref.id);
                    return doctorRefIds.includes(r.referralId);
                }
                return true;
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Error fetching reservations" });
    }
});


app.get('/api/reservations/:referralId', authenticate, async (req, res) => {
    try {
        const reservation = await Reservation.findOne({ referralId: req.params.referralId });
        res.json(reservation || null);
    } catch (err) {
        res.status(500).json({ message: "Error fetching reservation" });
    }
});

// ─── Hospital Admin Routes ──────────────────────────────────────────────────
app.get('/api/hospitals', authenticate, async (req, res) => {
    try {
        const results = isDbConnected ? await Hospital.find({ approved: true }) : memHospitals.filter(h => h.approved);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Error fetching hospitals" });
    }
});

app.get('/api/hospitals/mine', authenticate, requireRole('Hospital Admin'), async (req, res) => {
    try {
        let hospital;
        if (isDbConnected) {
            hospital = await Hospital.findOne({ id: req.user.hospitalId });
        } else {
            hospital = memHospitals.find(h => h.id === req.user.hospitalId);
        }
        res.json(hospital || null);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your hospital" });
    }
});

app.put('/api/hospitals/:id/update', authenticate, requireRole('Hospital Admin'), async (req, res) => {
    console.log('🏥 Updating hospital:', req.params.id);
    try {
        const hospitalId = parseInt(req.params.id);
        const updates = req.body;
        const hospital = await Hospital.findOneAndUpdate({ id: hospitalId }, updates, { new: true });
        if (!hospital) return res.status(404).json({ message: "Hospital not found" });
        console.log('✅ Hospital updated:', hospital.name);
        res.json({ success: true, hospital });
    } catch (err) {
        res.status(500).json({ message: "Error updating hospital" });
    }
});

app.put('/api/referrals/:id/accept', authenticate, requireRole('Hospital Admin'), async (req, res) => {
    console.log('✅ Acceptance attempt for referral:', req.params.id);
    try {
        const ref = isDbConnected ? await Referral.findOne({ id: req.params.id }) : memReferrals.find(r => r.id === req.params.id);
        if (!ref) return res.status(404).json({ message: "Referral not found" });

        ref.status = 'Accepted';
        ref.notes = req.body.notes || ref.notes;
        ref.acceptedAt = new Date();

        // Convert reserved resources to confirmed
        const reservation = isDbConnected
            ? await Reservation.findOne({ referralId: ref.id, status: 'Reserved' })
            : memReservations.find(r => r.referralId === ref.id && r.status === 'Reserved');
        if (reservation) {
            reservation.status = 'Confirmed';
            if (isDbConnected) await reservation.save();
        }

        // Reduce available bed count
        const hospital = isDbConnected ? await Hospital.findOne({ id: ref.hospitalId }) : memHospitals.find(h => h.id === ref.hospitalId);
        if (hospital) {
            if (hospital.availableBeds > 0) hospital.availableBeds -= 1;
            if (hospital.reservedBeds > 0) hospital.reservedBeds -= 1;
            if (ref.needsICU && hospital.reservedICU > 0) {
                hospital.icuBeds -= 1;
                hospital.reservedICU -= 1;
            }
            if (isDbConnected) await hospital.save();
        }

        if (isDbConnected) await ref.save();
        console.log('✅ Referral Accepted and Resources Confirmed:', ref.id);

        await addNotification(ref.doctorId, 'Doctor', '✅ Referral Accepted',
            `${ref.hospitalName} accepted referral for ${ref.patientName}.`,
            'success', ref.id);
        await addNotification(null, 'Patient', '🎉 Referral Accepted!',
            `${ref.hospitalName} has accepted you. Bed reserved: ${reservation?.bedNumber || 'Assigned'}.`,
            'success', ref.id);

        res.json({ success: true, referral: ref });
    } catch (err) {
        console.error('❌ Accept Error:', err.message);
        res.status(500).json({ message: "Error accepting referral" });
    }
});

app.put('/api/referrals/:id/reject', authenticate, requireRole('Hospital Admin'), async (req, res) => {
    console.log('❌ Rejection attempt for referral:', req.params.id);
    try {
        const ref = isDbConnected ? await Referral.findOne({ id: req.params.id }) : memReferrals.find(r => r.id === req.params.id);
        if (!ref) return res.status(404).json({ message: "Referral not found" });

        ref.status = 'Rejected';
        const rejectionReason = req.body.reason || 'Hospital capacity full';
        ref.notes = `Rejected: ${rejectionReason}. ${ref.notes || ''}`;

        // Release reserved resources
        const reservation = isDbConnected
            ? await Reservation.findOne({ referralId: ref.id, status: 'Reserved' })
            : memReservations.find(r => r.referralId === ref.id && r.status === 'Reserved');
        if (reservation) {
            reservation.status = 'Released';
            const hospital = isDbConnected ? await Hospital.findOne({ id: ref.hospitalId }) : memHospitals.find(h => h.id === ref.hospitalId);
            if (hospital) {
                if (hospital.reservedBeds > 0) hospital.reservedBeds -= 1;
                if (reservation.icuReserved && hospital.reservedICU > 0) hospital.reservedICU -= 1;
                if (reservation.specialistReserved) {
                    const slots = (hospital.specialistSlots instanceof Map) ? hospital.specialistSlots.get(reservation.specialistReserved) : hospital.specialistSlots?.[reservation.specialistReserved];
                    if (slots !== undefined) {
                        if (hospital.specialistSlots instanceof Map) hospital.specialistSlots.set(reservation.specialistReserved, slots + 1);
                        else hospital.specialistSlots[reservation.specialistReserved] = slots + 1;
                    }
                }
                if (isDbConnected) await hospital.save();
            }
            if (isDbConnected) await reservation.save();
        }

        if (isDbConnected) await ref.save();
        console.log('⚠️ Referral Rejected by Hospital. Triggering escalation...');
        await triggerEscalation(ref, `Rejected by hospital: ${rejectionReason}`);

        res.json({ success: true, referral: ref });
    } catch (err) {
        console.error('❌ Rejection Error:', err.message);
        res.status(500).json({ message: "Error rejecting referral" });
    }
});

app.put('/api/referrals/:id/admit', authenticate, requireRole('Hospital Admin'), async (req, res) => {
    try {
        const ref = isDbConnected ? await Referral.findOne({ id: req.params.id }) : memReferrals.find(r => r.id === req.params.id);
        if (!ref) return res.status(404).json({ message: "Referral not found" });

        ref.status = 'Admitted';
        ref.admittedAt = new Date();
        ref.ward = req.body.ward || 'General';

        const reservation = isDbConnected
            ? await Reservation.findOne({ referralId: ref.id, status: 'Confirmed' })
            : memReservations.find(r => r.referralId === ref.id && r.status === 'Confirmed');
        if (reservation) {
            reservation.status = 'Utilized';
            if (isDbConnected) await reservation.save();
        }

        if (isDbConnected) await ref.save();

        await addNotification(null, 'Patient', '🏥 You have been admitted',
            `Admitted to ${ref.hospitalName} - Ward: ${ref.ward}`,
            'success', ref.id);
        await addNotification(ref.doctorId, 'Doctor', '🏥 Patient Admitted',
            `${ref.patientName} admitted to ${ref.hospitalName}.`,
            'info', ref.id);

        res.json({ success: true, referral: ref });
    } catch (err) {
        res.status(500).json({ message: "Error admitting patient" });
    }
});

// ─── Smart Escalation Mechanism ─────────────────────────────────────────────
async function triggerEscalation(referral, reason) {
    console.log(`🔄 Triggering escalation for ${referral.id} due to: ${reason}`);
    try {
        const excludeIds = [referral.hospitalId, ...(referral.escalationHistory || []).map(e => e.hospitalId)];
        let alternatives;
        if (isDbConnected) {
            alternatives = await Hospital.find({ approved: true, id: { $nin: excludeIds } });
        } else {
            alternatives = memHospitals.filter(h => h.approved && !excludeIds.includes(h.id));
        }

        const availableAlternatives = alternatives
            .filter(h => (h.availableBeds - h.reservedBeds) > 0)
            .sort((a, b) => a.distance - b.distance);

        const nextHospital = availableAlternatives[0];
        if (!nextHospital) {
            const eCount = isDbConnected ? await EscalationLog.countDocuments() : memEscalationLogs.length;
            const logData = {
                id: `ESC${String(eCount + 1).padStart(3, '0')}`,
                referralId: referral.id,
                fromHospitalId: referral.hospitalId,
                fromHospitalName: referral.hospitalName,
                toHospitalName: 'No available hospital',
                reason,
                result: 'Failed - No alternatives available',
                createdAt: new Date()
            };
            if (isDbConnected) { const log = new EscalationLog(logData); await log.save(); }
            else { memEscalationLogs.push(logData); }

            await addNotification(referral.doctorId, 'Doctor', '⚠️ Escalation Failed',
                `No alternative hospitals available for ${referral.patientName}.`,
                'error', referral.id);
            return;
        }

        // Release resources from old hospital
        let oldReservation;
        if (isDbConnected) {
            oldReservation = await Reservation.findOne({ referralId: referral.id, status: 'Reserved' });
        } else {
            oldReservation = memReservations.find(r => r.referralId === referral.id && r.status === 'Reserved');
        }
        if (oldReservation) {
            oldReservation.status = 'Escalated';
            let oldHospital;
            if (isDbConnected) {
                oldHospital = await Hospital.findOne({ id: referral.hospitalId });
            } else {
                oldHospital = memHospitals.find(h => h.id === referral.hospitalId);
            }
            if (oldHospital) {
                if (oldHospital.reservedBeds > 0) oldHospital.reservedBeds -= 1;
                if (oldReservation.icuReserved && oldHospital.reservedICU > 0) oldHospital.reservedICU -= 1;
                if (isDbConnected) await oldHospital.save();
            }
            if (isDbConnected) await oldReservation.save();
        }

        // Log escalation
        const eCount = isDbConnected ? await EscalationLog.countDocuments() : memEscalationLogs.length;
        const logData = {
            id: `ESC${String(eCount + 1).padStart(3, '0')}`,
            referralId: referral.id,
            fromHospitalId: referral.hospitalId,
            fromHospitalName: referral.hospitalName,
            toHospitalId: nextHospital.id,
            toHospitalName: nextHospital.name,
            reason,
            result: 'Auto-escalated to next best hospital',
            createdAt: new Date()
        };
        if (isDbConnected) { const log = new EscalationLog(logData); await log.save(); }
        else { memEscalationLogs.push(logData); }

        // Update referral
        if (!referral.escalationHistory) referral.escalationHistory = [];
        referral.escalationHistory.push({
            hospitalId: referral.hospitalId,
            hospitalName: referral.hospitalName,
            reason,
            time: new Date()
        });
        referral.hospitalId = nextHospital.id;
        referral.hospitalName = nextHospital.name;
        referral.status = 'Pending';
        referral.escalationDeadline = new Date(Date.now() + (referral.urgency === 'Emergency' ? 5 * 60000 : 15 * 60000));

        // Create new reservation at the new hospital
        const resCount = isDbConnected ? await Reservation.countDocuments() : memReservations.length;
        const newResData = {
            id: `RES${String(resCount + 1).padStart(3, '0')}`,
            referralId: referral.id,
            hospitalId: nextHospital.id,
            hospitalName: nextHospital.name,
            patientName: referral.patientName,
            bedReserved: true,
            icuReserved: referral.needsICU,
            specialistReserved: referral.specialistNeeded || null,
            status: 'Reserved',
            expiresAt: new Date(Date.now() + 60 * 60000),
            createdAt: new Date()
        };

        if (nextHospital.availableBeds > nextHospital.reservedBeds) {
            nextHospital.reservedBeds += 1;
            newResData.bedNumber = `B-${nextHospital.totalBeds - nextHospital.availableBeds + nextHospital.reservedBeds}`;
        }
        if (newResData.icuReserved && nextHospital.icuBeds > (nextHospital.reservedICU || 0)) {
            nextHospital.reservedICU = (nextHospital.reservedICU || 0) + 1;
            newResData.icuSlot = `ICU-${nextHospital.reservedICU}`;
        }

        if (isDbConnected) {
            await nextHospital.save();
            const newReservation = new Reservation(newResData);
            await newReservation.save();
        } else {
            memReservations.push(newResData);
        }
        referral.reservationId = newResData.id;
        if (isDbConnected) await referral.save();

        console.log(`✅ Escalation successful: ${logData.id}`);

        // Notify
        await addNotification(referral.doctorId, 'Doctor', '🔄 Referral Escalated',
            `${referral.patientName} escalated from ${logData.fromHospitalName} → ${nextHospital.name}. Reason: ${reason}`,
            'warning', referral.id);

        await addNotification(null, 'Hospital Admin', '🆘 Escalated Referral Incoming',
            `${referral.urgency} referral for ${referral.patientName} escalated to your hospital.`,
            'warning', referral.id);

        await addNotification(null, 'Patient', '🔄 Referral Updated',
            `Your referral has been redirected to ${nextHospital.name}.`,
            'info', referral.id);
    } catch (err) {
        console.error('❌ Escalation Error:', err.message);
    }
}


// Auto-check escalation every 30 seconds
setInterval(async () => {
    try {
        let overdueReferrals;
        if (isDbConnected) {
            overdueReferrals = await Referral.find({ status: 'Pending', escalationDeadline: { $lt: new Date() } });
        } else {
            const now = new Date();
            overdueReferrals = memReferrals.filter(r => r.status === 'Pending' && r.escalationDeadline && new Date(r.escalationDeadline) < now);
        }
        for (const ref of overdueReferrals) {
            await triggerEscalation(ref, 'Escalation deadline exceeded (Auto)');
        }
    } catch (err) {
        console.error('❌ Check Escalation Error:', err.message);
    }
}, 30000);

// Manual escalation check endpoint
app.post('/api/escalation/run', authenticate, async (req, res) => {
    try {
        let escalatedCount = 0;
        let overdueReferrals;
        if (isDbConnected) {
            overdueReferrals = await Referral.find({ status: 'Pending', escalationDeadline: { $lt: new Date() } });
        } else {
            const now = new Date();
            overdueReferrals = memReferrals.filter(r => r.status === 'Pending' && r.escalationDeadline && new Date(r.escalationDeadline) < now);
        }
        for (const ref of overdueReferrals) {
            await triggerEscalation(ref, `No response within ${ref.urgency === 'Emergency' ? '5' : '15'} minutes`);
            escalatedCount++;
        }
        res.json({ escalated: escalatedCount, message: `Checked all pending referrals. ${escalatedCount} escalated.` });
    } catch (err) {
        console.error('❌ Manual Escalation Run Error:', err.message);
        res.status(500).json({ message: "Error running manual escalation check" });
    }
});

app.get('/api/escalation-logs', authenticate, async (req, res) => {
    try {
        let logs;
        if (isDbConnected) {
            let query = {};
            if (req.user.role === 'Hospital Admin') {
                query = { $or: [{ fromHospitalId: req.user.hospitalId }, { toHospitalId: req.user.hospitalId }] };
            }
            if (req.user.role === 'Doctor') {
                const doctorReferralIds = (await Referral.find({ doctorId: req.user.id })).map(r => r.id);
                query = { referralId: { $in: doctorReferralIds } };
            }
            logs = await EscalationLog.find(query).sort({ createdAt: -1 });
        } else {
            logs = memEscalationLogs.filter(log => {
                if (req.user.role === 'Hospital Admin') return log.fromHospitalId === req.user.hospitalId || log.toHospitalId === req.user.hospitalId;
                if (req.user.role === 'Doctor') {
                    const doctorRefIds = memReferrals.filter(r => r.doctorId === req.user.id).map(r => r.id);
                    return doctorRefIds.includes(log.referralId);
                }
                return true;
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.json(logs);

    } catch (err) {
        console.error('❌ Fetch Escalation Logs Error:', err.message);
        res.status(500).json({ message: "Error fetching escalation logs" });
    }
});

// ─── Ambulance Routes ───────────────────────────────────────────────────────
app.get('/api/ambulance/assignments', authenticate, requireRole('Ambulance'), async (req, res) => {
    try {
        let myAssignments, acceptedReferrals;
        if (isDbConnected) {
            myAssignments = await AmbulanceAssignment.find({ driverId: req.user.id }).sort({ createdAt: -1 });
            const assignedReferralIds = myAssignments.map(a => a.referralId);
            acceptedReferrals = await Referral.find({ status: 'Accepted', id: { $nin: assignedReferralIds } });
        } else {
            myAssignments = memAmbulanceAssignments.filter(a => a.driverId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const assignedReferralIds = myAssignments.map(a => a.referralId);
            acceptedReferrals = memReferrals.filter(r => r.status === 'Accepted' && !assignedReferralIds.includes(r.id));
        }
        res.json({ assignments: myAssignments, availableReferrals: acceptedReferrals });
    } catch (err) {
        console.error('❌ Fetch Ambulance Assignments Error:', err.message);
        res.status(500).json({ message: "Error fetching ambulance assignments" });
    }
});

app.post('/api/ambulance/assign', authenticate, requireRole('Ambulance'), async (req, res) => {
    try {
        const { referralId } = req.body;
        const existing = isDbConnected
            ? await AmbulanceAssignment.findOne({ referralId })
            : memAmbulanceAssignments.find(a => a.referralId === referralId);
        if (existing) return res.status(400).json({ message: "Already assigned" });

        const ref = isDbConnected ? await Referral.findOne({ id: referralId }) : memReferrals.find(r => r.id === referralId);
        if (!ref) return res.status(404).json({ message: "Referral not found" });

        const hospital = isDbConnected ? await Hospital.findOne({ id: ref.hospitalId }) : memHospitals.find(h => h.id === ref.hospitalId);
        if (!hospital) return res.status(404).json({ message: "Destination hospital not found" });

        const count = isDbConnected ? await AmbulanceAssignment.countDocuments() : memAmbulanceAssignments.length;
        const assignmentData = {
            id: `AMB${String(count + 1).padStart(3, '0')}`,
            referralId,
            driverId: req.user.id,
            driverName: req.user.name,
            vehicleNo: req.user.vehicleNo || 'MP-04-AB-1234',
            patientName: ref.patientName,
            patientVillage: ref.patientVillage || 'N/A',
            hospitalName: ref.hospitalName,
            hospitalCity: hospital?.city || 'N/A',
            status: 'Assigned',
            pickupLocation: ref.patientVillage || 'PHC Sehore',
            hospitalLocation: hospital?.city || 'Bhopal',
            gpsData: {
                lat: PHC_LOCATION.lat,
                lng: PHC_LOCATION.lng,
                heading: 0,
                speed: 0,
                progress: 0,
                etaMinutes: hospital.ambulanceETA,
                updatedAt: new Date().toISOString()
            },
            statusHistory: [{ status: 'Assigned', time: new Date() }],
            createdAt: new Date()
        };

        let assignment;
        if (isDbConnected) {
            assignment = new AmbulanceAssignment(assignmentData);
            await assignment.save();
        } else {
            assignment = assignmentData;
            memAmbulanceAssignments.push(assignment);
        }

        ref.status = 'In Transit';
        ref.ambulanceId = assignment.id;
        if (isDbConnected) await ref.save();

        // Start GPS Simulation
        startGPSSimulation(assignment.id, PHC_LOCATION.lat, PHC_LOCATION.lng, hospital.lat, hospital.lng);

        await addNotification(null, 'Patient', '🚑 Ambulance Dispatched',
            `Ambulance ${assignment.vehicleNo} is on the way! Driver: ${assignment.driverName}`,
            'info', referralId);
        await addNotification(ref.doctorId, 'Doctor', '🚑 Ambulance Assigned',
            `${assignment.vehicleNo} dispatched for ${ref.patientName} → ${ref.hospitalName}`,
            'info', referralId);

        res.json({ success: true, assignment });
    } catch (err) {
        console.error('❌ Ambulance Assignment Error:', err.message);
        res.status(500).json({ message: "Error assigning ambulance" });
    }
});

app.put('/api/ambulance/status/:id', authenticate, requireRole('Ambulance'), async (req, res) => {
    try {
        const assignment = isDbConnected
            ? await AmbulanceAssignment.findOne({ id: req.params.id })
            : memAmbulanceAssignments.find(a => a.id === req.params.id);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        assignment.status = req.body.status;
        if (!assignment.statusHistory) assignment.statusHistory = [];
        assignment.statusHistory.push({ status: req.body.status, time: new Date() });

        if (req.body.status === 'Completed') {
            assignment.completedAt = new Date();
            const ref = isDbConnected ? await Referral.findOne({ id: assignment.referralId }) : memReferrals.find(r => r.id === assignment.referralId);
            if (ref) {
                ref.status = 'Completed';
                if (isDbConnected) await ref.save();
            }
            await addNotification(null, 'Patient', '✅ Transfer Complete',
                `You have arrived at ${assignment.hospitalName}. Transfer complete.`,
                'success', assignment.referralId);
        }

        if (req.body.status === 'Reached') {
            const ref = isDbConnected ? await Referral.findOne({ id: assignment.referralId }) : memReferrals.find(r => r.id === assignment.referralId);
            if (ref) {
                ref.status = 'Reached Hospital';
                if (isDbConnected) await ref.save();
            }
            const hospital = isDbConnected ? await Hospital.findOne({ id: ref?.hospitalId }) : memHospitals.find(h => h.id === ref?.hospitalId);
            if (hospital) {
                assignment.gpsData.lat = hospital.lat;
                assignment.gpsData.lng = hospital.lng;
                assignment.gpsData.progress = 100;
                assignment.gpsData.etaMinutes = 0;
                assignment.gpsData.updatedAt = new Date().toISOString();
            }
            await addNotification(null, 'Hospital Admin', '🚑 Ambulance Arrived',
                `Ambulance ${assignment.vehicleNo} has reached with patient ${assignment.patientName}.`,
                'success', assignment.referralId);
        }

        if (req.body.status === 'On the Way') {
            await addNotification(null, 'Patient', '🚑 Ambulance En Route',
                `Ambulance ${assignment.vehicleNo} is now on the way to ${assignment.hospitalName}.`,
                'info', assignment.referralId);
        }

        if (isDbConnected) await assignment.save();
        res.json({ success: true, assignment });
    } catch (err) {
        console.error('❌ Ambulance Status Update Error:', err.message);
        res.status(500).json({ message: "Error updating ambulance status" });
    }
});

// ─── GPS Tracking Routes ────────────────────────────────────────────────────
app.get('/api/ambulance/gps/:assignmentId', authenticate, async (req, res) => {
    try {
        const assignment = isDbConnected
            ? await AmbulanceAssignment.findOne({ id: req.params.assignmentId })
            : memAmbulanceAssignments.find(a => a.id === req.params.assignmentId);
        if (!assignment || !assignment.gpsData) return res.json(null);
        res.json({
            lat: assignment.gpsData.lat,
            lng: assignment.gpsData.lng,
            speed: Math.round(assignment.gpsData.speed || 0),
            heading: assignment.gpsData.heading || 0,
            progress: assignment.gpsData.progress || 0,
            etaMinutes: assignment.gpsData.etaMinutes || 0,
            updatedAt: assignment.gpsData.updatedAt,
        });
    } catch (err) {
        console.error('❌ Fetch GPS Data Error:', err.message);
        res.status(500).json({ message: "Error fetching GPS data" });
    }
});

app.post('/api/ambulance/gps-update/:assignmentId', authenticate, requireRole('Ambulance'), async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const assignment = isDbConnected
            ? await AmbulanceAssignment.findOne({ id: req.params.assignmentId })
            : memAmbulanceAssignments.find(a => a.id === req.params.assignmentId);
        if (assignment) {
            assignment.gpsData.lat = lat;
            assignment.gpsData.lng = lng;
            assignment.gpsData.updatedAt = new Date().toISOString();
            if (isDbConnected) await assignment.save();
        }
        res.json({ success: true });
    } catch (err) {
        console.error('❌ GPS Update Error:', err.message);
        res.status(500).json({ message: "Error updating GPS data" });
    }
});

app.get('/api/ambulance/my-assignments', authenticate, requireRole('Ambulance'), async (req, res) => {
    try {
        let results;
        if (isDbConnected) {
            results = await AmbulanceAssignment.find({ driverId: req.user.id }).sort({ createdAt: -1 });
        } else {
            results = memAmbulanceAssignments.filter(a => a.driverId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Error fetching assignments" });
    }
});


// ─── Notification Routes ────────────────────────────────────────────────────
app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        let results;
        if (isDbConnected) {
            const query = {
                $or: [
                    { userId: req.user.id },
                    { role: req.user.role, userId: { $exists: false } }
                ]
            };
            results = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
        } else {
            results = memNotifications.filter(n =>
                n.userId === req.user.id || (n.role === req.user.role && !n.userId)
            ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
        }
        res.json(results);
    } catch (err) {
        console.error('❌ Fetch Notifications Error:', err.message);
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
    try {
        if (isDbConnected) {
            await Notification.findByIdAndUpdate(req.params.id, { read: true });
        } else {
            const notif = memNotifications.find(n => n.id === req.params.id);
            if (notif) notif.read = true;
        }
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Mark Notification Read Error:', err.message);
        res.status(500).json({ message: "Error marking notification as read" });
    }
});

app.put('/api/notifications/read-all', authenticate, async (req, res) => {
    try {
        if (isDbConnected) {
            const query = { $or: [{ userId: req.user.id }, { role: req.user.role, userId: { $exists: false } }] };
            await Notification.updateMany(query, { read: true });
        } else {
            memNotifications.forEach(n => {
                if (n.userId === req.user.id || (n.role === req.user.role && !n.userId)) n.read = true;
            });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Mark All Notifications Read Error:', err.message);
        res.status(500).json({ message: "Error marking all notifications as read" });
    }
});

// ─── Analytics Route ────────────────────────────────────────────────────────
app.get('/api/analytics', authenticate, requireRole('Super Admin'), async (req, res) => {
    try {
        const refs = isDbConnected ? null : memReferrals;
        const countRefs = (filter) => {
            if (isDbConnected) return Referral.countDocuments(filter);
            if (!filter || Object.keys(filter).length === 0) return refs.length;
            return refs.filter(r => Object.entries(filter).every(([k, v]) => {
                if (k === 'severity.level') return r.severity?.level === v;
                if (typeof v === 'object' && v.$in) return v.$in.includes(r[k]);
                if (typeof v === 'object' && v.$nin) return !v.$nin.includes(r[k]);
                return r[k] === v;
            })).length;
        };

        const totalReferrals = await countRefs({});
        const pendingCount = await countRefs({ status: 'Pending' });
        const acceptedCount = await countRefs({ status: 'Accepted' });
        const rejectedCount = await countRefs({ status: 'Rejected' });
        const admittedCount = await countRefs({ status: 'Admitted' });
        const inTransitCount = await countRefs({ status: 'In Transit' });
        const completedCount = await countRefs({ status: 'Completed' });

        const hospitals = isDbConnected ? await Hospital.find() : memHospitals;

        // Severity distribution
        const severityDist = {
            Critical: await countRefs({ 'severity.level': 'Critical' }),
            'High Priority': await countRefs({ 'severity.level': 'High Priority' }),
            Moderate: await countRefs({ 'severity.level': 'Moderate' }),
            Stable: await countRefs({ 'severity.level': 'Stable' })
        };

        // Hospital performance
        const hospitalPerformance = await Promise.all(hospitals.map(async h => {
            const accepted = await countRefs({ hospitalId: h.id, status: { $in: ['Accepted', 'In Transit', 'Admitted', 'Completed', 'Reached Hospital'] } });
            const rejected = await countRefs({ hospitalId: h.id, status: 'Rejected' });
            const totalHospReferrals = accepted + rejected + await countRefs({ hospitalId: h.id, status: 'Pending' });
            const load = h.totalBeds > 0 ? Math.round(((h.totalBeds - h.availableBeds + (h.reservedBeds || 0)) / h.totalBeds) * 100) : 0;
            return {
                id: h.id, name: h.name, city: h.city,
                totalReferrals: totalHospReferrals,
                accepted, rejected, load,
                availableBeds: h.availableBeds - (h.reservedBeds || 0),
                icuAvailable: h.icuBeds - (h.reservedICU || 0),
                score: Math.max(0, 100 - load - rejected * 5),
                lat: h.lat, lng: h.lng
            };
        }));

        // Referral timeline (last 7 days simulation)
        const timeline = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            // Timeline counts - simplified for in-memory
            const dayReferrals = isDbConnected ? await Referral.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }) :
                memReferrals.filter(r => r.createdAt && new Date(r.createdAt) >= date && new Date(r.createdAt) < nextDate).length;
            const dayEmergencies = isDbConnected ? await Referral.countDocuments({ createdAt: { $gte: date, $lt: nextDate }, urgency: 'Emergency' }) :
                memReferrals.filter(r => r.urgency === 'Emergency' && r.createdAt && new Date(r.createdAt) >= date && new Date(r.createdAt) < nextDate).length;
            const dayCompleted = isDbConnected ? await Referral.countDocuments({ createdAt: { $gte: date, $lt: nextDate }, status: 'Completed' }) :
                memReferrals.filter(r => r.status === 'Completed' && r.createdAt && new Date(r.createdAt) >= date && new Date(r.createdAt) < nextDate).length;

            timeline.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                referrals: dayReferrals,
                emergencies: dayEmergencies,
                completed: dayCompleted,
            });
        }

        // Predictive analytics
        const avgLoad = hospitals.reduce((sum, h) => sum + ((h.totalBeds - h.availableBeds) / h.totalBeds) * 100, 0) / hospitals.length;
        const predictions = {
            bedShortageRisk: avgLoad > 70 ? 'High' : avgLoad > 50 ? 'Medium' : 'Low',
            predictedEmergencies24h: Math.floor(Math.random() * 5) + 2, // Placeholder
            peakHourPrediction: '10:00 AM - 2:00 PM', // Placeholder
            icuCrunchIn48h: hospitals.filter(h => (h.icuBeds - h.reservedICU) <= 1).length > 0,
            avgResponseTime: `${Math.floor(Math.random() * 10) + 8} min`, // Placeholder
            avgTransferTime: `${Math.floor(Math.random() * 15) + 20} min`, // Placeholder
        };

        // Regional data for heatmap (simplified)
        const regions = [
            { name: 'Sehore', lat: 23.2, lng: 77.08, emergencies: await countRefs({ patientVillage: 'Sehore', urgency: 'Emergency' }), referrals: await countRefs({ patientVillage: 'Sehore' }) },
            { name: 'Bhopal', lat: 23.26, lng: 77.41, emergencies: 7, referrals: 15 }, // Placeholder
            { name: 'Indore', lat: 22.72, lng: 75.86, emergencies: 5, referrals: 12 }, // Placeholder
        ];

        // Ambulance stats
        const ambs = isDbConnected ? null : memAmbulanceAssignments;
        const ambulanceStats = {
            total: isDbConnected ? await AmbulanceAssignment.countDocuments() : ambs.length,
            active: isDbConnected ? await AmbulanceAssignment.countDocuments({ status: { $nin: ['Completed', 'Delivered'] } }) : ambs.filter(a => !['Completed', 'Delivered'].includes(a.status)).length,
            completed: isDbConnected ? await AmbulanceAssignment.countDocuments({ status: { $in: ['Completed', 'Delivered'] } }) : ambs.filter(a => ['Completed', 'Delivered'].includes(a.status)).length,
            avgETA: 25,
        };

        res.json({
            totalPatients: isDbConnected ? await Patient.countDocuments() : memPatients.length,
            totalReferrals,
            totalHospitals: hospitals.length,
            totalEscalations: isDbConnected ? await EscalationLog.countDocuments() : memEscalationLogs.length,
            activeReservations: isDbConnected ? await Reservation.countDocuments({ status: { $in: ['Reserved', 'Confirmed'] } }) : memReservations.filter(r => ['Reserved', 'Confirmed'].includes(r.status)).length,
            totalBeds: hospitals.reduce((sum, h) => sum + h.totalBeds, 0),
            availableBeds: hospitals.reduce((sum, h) => sum + Math.max(0, h.availableBeds - h.reservedBeds), 0),
            totalICU: hospitals.reduce((sum, h) => sum + h.icuBeds, 0),
            availableICU: hospitals.reduce((sum, h) => sum + Math.max(0, h.icuBeds - h.reservedICU), 0),
            statusCounts: {
                Pending: pendingCount,
                Accepted: acceptedCount,
                Rejected: rejectedCount,
                'In Transit': inTransitCount,
                'Reached Hospital': await countRefs({ status: 'Reached Hospital' }),
                Admitted: admittedCount,
                Completed: completedCount
            },
            severityCounts: severityDist,
            hospitalPerformance,
            timeline,
            predictions,
            regions,
            ambulanceStats,
            recentReferrals: isDbConnected ? await Referral.find().sort({ createdAt: -1 }).limit(10) : memReferrals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
            escalationLogs: isDbConnected ? await EscalationLog.find().sort({ createdAt: -1 }).limit(10) : memEscalationLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
        });
    } catch (err) {
        console.error('❌ Analytics Error:', err.message);
        res.status(500).json({ message: "Error fetching analytics" });
    }
});

// ─── Super Admin Routes ─────────────────────────────────────────────────────
app.get('/api/admin/hospitals', authenticate, requireRole('Super Admin'), async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals.map(h => ({
            ...h.toObject(),
            load: h.totalBeds > 0 ? Math.round(((h.totalBeds - h.availableBeds + h.reservedBeds) / h.totalBeds) * 100) : 0,
            effectiveBeds: Math.max(0, h.availableBeds - h.reservedBeds),
            effectiveICU: Math.max(0, h.icuBeds - h.reservedICU),
        })));
    } catch (err) {
        console.error('❌ Admin Hospitals Error:', err.message);
        res.status(500).json({ message: "Error fetching hospitals" });
    }
});

app.get('/api/admin/referrals', authenticate, requireRole('Super Admin'), async (req, res) => {
    try {
        const referrals = await Referral.find().sort({ createdAt: -1 });
        res.json(referrals);
    } catch (err) {
        console.error('❌ Admin Referrals Error:', err.message);
        res.status(500).json({ message: "Error fetching referrals" });
    }
});

app.get('/api/admin/users', authenticate, requireRole('Super Admin'), async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        console.error('❌ Admin Users Error:', err.message);
        res.status(500).json({ message: "Error fetching users" });
    }
});

// ─── Severity Classification Endpoint ───────────────────────────────────────
app.post('/api/ai/classify-severity', authenticate, (req, res) => {
    console.log('🚑 POST /api/ai/classify-severity hit by:', req.user.email);
    try {
        const { symptoms, urgency, needsICU, specialistNeeded } = req.body;
        const result = classifySeverity(symptoms, urgency, needsICU, specialistNeeded);
        console.log('✅ Severity Classification:', result.level);
        res.json(result);
    } catch (err) {
        console.error('❌ Severity Classification Error:', err.stack);
        res.status(500).json({ message: "Severity classification failed", error: err.message });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Healix Server running on http://localhost:${PORT}`);
    console.log('Demo accounts:');
    console.log('  Patient:        patient@healix.ai / password123');
    console.log('  Doctor:         doctor@healix.ai / password123');
    console.log('  Hospital Admin: admin@healix.ai / password123');
    console.log('  Ambulance:      ambulance@healix.ai / password123');
    console.log('  Super Admin:    superadmin@healix.ai / password123');
});
