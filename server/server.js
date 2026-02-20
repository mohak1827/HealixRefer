const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'healix_secret_2026';

// ─── Data Persistence ──────────────────────────────────────────────────────
const USERS_FILE = path.join(__dirname, 'users.json');
let users = [];
try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
} catch (err) {
    console.warn("Users file not found, starting with empty list");
}

const saveUsers = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Seed demo accounts if they don't exist
const seedDemoAccounts = async () => {
    const demos = [
        { name: 'Dr. Arjun Sharma', email: 'doctor@healix.ai', password: 'password123', role: 'Doctor', hospitalId: null },
        { name: 'Admin Priya Singh', email: 'admin@healix.ai', password: 'password123', role: 'Hospital Admin', hospitalId: 1 },
        { name: 'Ravi Kumar (Driver)', email: 'ambulance@healix.ai', password: 'password123', role: 'Ambulance', hospitalId: null },
        { name: 'Super Admin', email: 'superadmin@healix.ai', password: 'password123', role: 'Super Admin', hospitalId: null },
    ];

    for (const demo of demos) {
        if (!users.find(u => u.email === demo.email)) {
            const hashedPassword = await bcrypt.hash(demo.password, 10);
            users.push({ id: `demo_${demo.role.replace(/ /g, '_')}`, ...demo, password: hashedPassword });
        }
    }
    saveUsers();
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
    const { name, email, password, role, hospitalId } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });
    if (users.find(u => u.email === email)) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: `u${Date.now()}`, name, email, password: hashedPassword, role, hospitalId: hospitalId || null };
    users.push(newUser);
    saveUsers();
    res.json({ success: true, message: "Registration successful. You can now log in." });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, hospitalId: user.hospitalId },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, hospitalId: user.hospitalId } });
});

app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));

// ─── Hospital Data ──────────────────────────────────────────────────────────
let hospitals = [
    { id: 1, name: "City General Hospital", city: "Bhopal", distance: 12, icuBeds: 8, generalBeds: 45, oxygenBeds: 12, specialists: ["Cardiologist", "Neurologist"], ambulanceETA: 18, bedAvailability: true, equipment: ["Ventilator", "ECG", "CT Scan"], approved: true },
    { id: 2, name: "District Medical Center", city: "Indore", distance: 25, icuBeds: 3, generalBeds: 30, oxygenBeds: 8, specialists: ["Orthopedic"], ambulanceETA: 32, bedAvailability: true, equipment: ["X-Ray", "ECG"], approved: true },
    { id: 3, name: "Rural Health Institute", city: "Sehore", distance: 8, icuBeds: 0, generalBeds: 15, oxygenBeds: 4, specialists: ["General"], ambulanceETA: 14, bedAvailability: true, equipment: ["Basic"], approved: true },
    { id: 4, name: "St. Mary's Specialty Hospital", city: "Bhopal", distance: 38, icuBeds: 12, generalBeds: 60, oxygenBeds: 20, specialists: ["Cardiologist", "Neurologist", "Orthopedic"], ambulanceETA: 45, bedAvailability: false, equipment: ["Ventilator", "MRI", "CT Scan", "ECG"], approved: true },
    { id: 5, name: "Community Care Hospital", city: "Raisen", distance: 19, icuBeds: 5, generalBeds: 25, oxygenBeds: 10, specialists: ["General", "Neurologist"], ambulanceETA: 27, bedAvailability: true, equipment: ["ECG", "X-Ray"], approved: true },
    { id: 6, name: "Green Valley Clinic", city: "Vidisha", distance: 42, icuBeds: 2, generalBeds: 20, oxygenBeds: 5, specialists: ["General"], ambulanceETA: 55, bedAvailability: true, equipment: ["Basic", "ECG"], approved: false },
];

// ─── Referral Data ──────────────────────────────────────────────────────────
let referrals = [
    { id: 'REF001', patientName: 'Ramesh Kumar', age: 65, severity: 'Critical', doctorId: 'demo_Doctor', doctorName: 'Dr. Arjun Sharma', hospitalId: 1, hospitalName: 'City General Hospital', status: 'Pending', symptoms: 'Chest pain, breathlessness', specialistNeeded: 'Cardiologist', createdAt: new Date(Date.now() - 3600000).toISOString(), notes: '' },
    { id: 'REF002', patientName: 'Sunita Devi', age: 45, severity: 'Moderate', doctorId: 'demo_Doctor', doctorName: 'Dr. Arjun Sharma', hospitalId: 1, hospitalName: 'City General Hospital', status: 'Accepted', symptoms: 'Fracture right arm', specialistNeeded: 'Orthopedic', createdAt: new Date(Date.now() - 7200000).toISOString(), notes: 'Bed allocated in Ward 3' },
];

let nextReferralNum = 3;

// ─── Ambulance Data ─────────────────────────────────────────────────────────
let ambulanceJobs = [
    { id: 'JOB001', referralId: 'REF002', driverId: 'demo_Ambulance', driverName: 'Ravi Kumar', status: 'On the way', patientName: 'Sunita Devi', hospital: 'City General Hospital', createdAt: new Date(Date.now() - 3600000).toISOString() }
];

let ambulanceDrivers = [
    { id: 'demo_Ambulance', name: 'Ravi Kumar', available: true, currentJob: 'JOB001' }
];

// ─── AI Scoring ─────────────────────────────────────────────────────────────
function scoreHospital(hospital, urgency, needsICU, specialistType) {
    let score = 100;
    const eta = hospital.ambulanceETA;
    if (urgency === "Critical") {
        if (needsICU && hospital.icuBeds === 0) score -= 60;
        score -= eta * 1.5;
        score -= hospital.distance * 0.5;
    } else if (urgency === "Moderate") {
        if (needsICU && hospital.icuBeds === 0) score -= 40;
        score -= eta * 1.0;
        score -= hospital.distance * 1.0;
    } else {
        score -= hospital.distance * 2.0;
        score -= eta * 0.3;
    }
    if (specialistType && !hospital.specialists.includes(specialistType)) score -= 30;
    if (!hospital.bedAvailability) score -= 50;
    if (hospital.icuBeds > 5) score += 10;
    const survivalChance = calculateSurvival(urgency, eta);
    return { score: Math.max(0, Math.round(score)), survivalChance };
}

function calculateSurvival(urgency, eta) {
    if (urgency === "Stable") return Math.round((98 + Math.random()) * 10) / 10;
    const base = urgency === "Critical" ? 95 : 97;
    const decay = urgency === "Critical" ? 0.05 : 0.02;
    const thresh = urgency === "Critical" ? 30 : 50;
    const chance = base * (1 / (1 + Math.exp(decay * (eta - thresh))));
    return Math.max(5, Math.round(chance * 10) / 10);
}

// Background simulation
setInterval(() => {
    hospitals.forEach(h => {
        h.icuBeds = Math.max(0, h.icuBeds + Math.floor(Math.random() * 3) - 1);
        h.generalBeds = Math.max(0, h.generalBeds + Math.floor(Math.random() * 5) - 2);
        h.ambulanceETA = Math.max(5, h.ambulanceETA + Math.floor(Math.random() * 7) - 3);
        if (Math.random() > 0.97) h.bedAvailability = !h.bedAvailability;
    });
}, 10000);

// ─── Hospital Routes ─────────────────────────────────────────────────────────
app.get('/api/hospitals', authenticate, (req, res) => {
    res.json(hospitals.filter(h => h.approved));
});

app.post('/api/score', authenticate, (req, res) => {
    const { urgency, needsICU, specialistType } = req.body;
    const results = hospitals
        .filter(h => h.approved)
        .map(h => {
            const { score, survivalChance } = scoreHospital(h, urgency, needsICU, specialistType);
            return { ...h, score, survivalChance };
        })
        .sort((a, b) => b.score - a.score);
    res.json(results);
});

app.post('/api/reserve', authenticate, (req, res) => {
    const { hospitalId } = req.body;
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital && hospital.icuBeds > 0) {
        hospital.icuBeds -= 1;
        res.json({ success: true, reservationId: Math.floor(Math.random() * 900000) + 100000 });
    } else {
        res.status(400).json({ success: false, message: "No beds available" });
    }
});

// ─── Referral Routes ─────────────────────────────────────────────────────────
app.post('/api/referrals', authenticate, requireRole('Doctor'), (req, res) => {
    const { patientName, age, severity, hospitalId, symptoms, specialistNeeded, notes } = req.body;
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const id = `REF${String(nextReferralNum++).padStart(3, '0')}`;
    const referral = {
        id,
        patientName,
        age,
        severity,
        doctorId: req.user.id,
        doctorName: req.user.name,
        hospitalId,
        hospitalName: hospital.name,
        status: 'Pending',
        symptoms,
        specialistNeeded,
        createdAt: new Date().toISOString(),
        notes: notes || ''
    };
    referrals.push(referral);
    res.json({ success: true, referral });
});

app.get('/api/referrals', authenticate, (req, res) => {
    if (req.user.role === 'Doctor') {
        return res.json(referrals.filter(r => r.doctorId === req.user.id));
    }
    if (req.user.role === 'Hospital Admin') {
        return res.json(referrals.filter(r => r.hospitalId === req.user.hospitalId));
    }
    if (req.user.role === 'Ambulance') {
        return res.json(referrals.filter(r => r.status === 'Accepted'));
    }
    // Super Admin sees all
    return res.json(referrals);
});

app.put('/api/referrals/:id/accept', authenticate, requireRole('Hospital Admin'), (req, res) => {
    const ref = referrals.find(r => r.id === req.params.id);
    if (!ref) return res.status(404).json({ message: "Referral not found" });
    ref.status = 'Accepted';
    ref.notes = req.body.notes || ref.notes;
    ref.acceptedAt = new Date().toISOString();
    res.json({ success: true, referral: ref });
});

app.put('/api/referrals/:id/reject', authenticate, requireRole('Hospital Admin'), (req, res) => {
    const ref = referrals.find(r => r.id === req.params.id);
    if (!ref) return res.status(404).json({ message: "Referral not found" });
    ref.status = 'Rejected';
    ref.rejectionReason = req.body.reason || 'Hospital capacity full';
    res.json({ success: true, referral: ref });
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
app.put('/api/admin/hospital', authenticate, requireRole('Hospital Admin'), (req, res) => {
    const { hospitalId, updates } = req.body;
    const index = hospitals.findIndex(h => h.id === hospitalId);
    if (index !== -1) {
        hospitals[index] = { ...hospitals[index], ...updates };
        res.json({ success: true, hospital: hospitals[index] });
    } else {
        res.status(404).json({ message: "Hospital not found" });
    }
});

app.get('/api/admin/stats', authenticate, requireRole('Hospital Admin', 'Super Admin'), (req, res) => {
    const totalBeds = hospitals.reduce((sum, h) => sum + h.icuBeds + h.generalBeds, 0);
    const myHospitalId = req.user.hospitalId;
    const myReferrals = req.user.role === 'Hospital Admin'
        ? referrals.filter(r => r.hospitalId === myHospitalId)
        : referrals;
    res.json({
        totalReferrals: myReferrals.length,
        pendingReferrals: myReferrals.filter(r => r.status === 'Pending').length,
        acceptedReferrals: myReferrals.filter(r => r.status === 'Accepted').length,
        rejectedReferrals: myReferrals.filter(r => r.status === 'Rejected').length,
        icuUtilization: "68%",
        avgTransportTime: "24m",
        hospitalsCount: hospitals.length,
        totalBeds
    });
});

// ─── Ambulance Routes ─────────────────────────────────────────────────────────
app.get('/api/ambulance/jobs', authenticate, requireRole('Ambulance'), (req, res) => {
    const myJobs = ambulanceJobs.filter(j => j.driverId === req.user.id);
    const pendingReferrals = referrals.filter(r => r.status === 'Accepted');
    res.json({ jobs: myJobs, pendingReferrals });
});

app.post('/api/ambulance/jobs', authenticate, requireRole('Ambulance'), (req, res) => {
    const { referralId } = req.body;
    const existingJob = ambulanceJobs.find(j => j.referralId === referralId);
    if (existingJob) return res.status(400).json({ message: "Job already taken" });

    const ref = referrals.find(r => r.id === referralId);
    if (!ref) return res.status(404).json({ message: "Referral not found" });

    const job = {
        id: `JOB${String(ambulanceJobs.length + 1).padStart(3, '0')}`,
        referralId,
        driverId: req.user.id,
        driverName: req.user.name,
        status: 'On the way',
        patientName: ref.patientName,
        hospital: ref.hospitalName,
        createdAt: new Date().toISOString()
    };
    ambulanceJobs.push(job);
    res.json({ success: true, job });
});

app.put('/api/ambulance/jobs/:id', authenticate, requireRole('Ambulance'), (req, res) => {
    const job = ambulanceJobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.status = req.body.status;
    if (req.body.status === 'Reached hospital') {
        job.completedAt = new Date().toISOString();
    }
    res.json({ success: true, job });
});

app.put('/api/ambulance/availability', authenticate, requireRole('Ambulance'), (req, res) => {
    let driver = ambulanceDrivers.find(d => d.id === req.user.id);
    if (!driver) {
        driver = { id: req.user.id, name: req.user.name, available: req.body.available, currentJob: null };
        ambulanceDrivers.push(driver);
    } else {
        driver.available = req.body.available;
    }
    res.json({ success: true, driver });
});

app.get('/api/ambulance/availability', authenticate, (req, res) => {
    const driver = ambulanceDrivers.find(d => d.id === req.user.id);
    res.json(driver || { available: true });
});

// ─── Super Admin Routes ───────────────────────────────────────────────────────
app.get('/api/superadmin/hospitals', authenticate, requireRole('Super Admin'), (req, res) => {
    res.json(hospitals);
});

app.put('/api/superadmin/hospitals/:id/approve', authenticate, requireRole('Super Admin'), (req, res) => {
    const hospital = hospitals.find(h => h.id === parseInt(req.params.id));
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    hospital.approved = req.body.approved;
    res.json({ success: true, hospital });
});

app.get('/api/superadmin/stats', authenticate, requireRole('Super Admin'), (req, res) => {
    const total = referrals.length;
    const accepted = referrals.filter(r => r.status === 'Accepted').length;
    const rejected = referrals.filter(r => r.status === 'Rejected').length;
    const pending = referrals.filter(r => r.status === 'Pending').length;
    const critical = referrals.filter(r => r.severity === 'Critical').length;
    const moderate = referrals.filter(r => r.severity === 'Moderate').length;
    const stable = referrals.filter(r => r.severity === 'Stable').length;

    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        referrals: Math.floor(Math.random() * 30) + 10,
        accepted: Math.floor(Math.random() * 20) + 5,
    }));

    res.json({
        totalReferrals: total,
        acceptedReferrals: accepted,
        rejectedReferrals: rejected,
        pendingReferrals: pending,
        successRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
        avgTransportTime: '24m',
        criticalCases: critical,
        moderateCases: moderate,
        stableCases: stable,
        totalHospitals: hospitals.length,
        approvedHospitals: hospitals.filter(h => h.approved).length,
        totalUsers: users.length,
        weeklyData,
        allReferrals: referrals,
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Healix Server running on http://localhost:${PORT}`);
    console.log('Demo accounts: doctor@healix.ai | admin@healix.ai | ambulance@healix.ai | superadmin@healix.ai');
    console.log('Password: password123');
});
