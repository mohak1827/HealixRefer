const Patient = require('../models/Patient');
const Referral = require('../models/Referral');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const TimelineEvent = require('../models/TimelineEvent');
const MedicalFile = require('../models/MedicalFile');
const Notification = require('../models/Notification');
const Reservation = require('../models/Reservation');
const dbStore = require('../dbStore');

// Advanced Clinical Triage Logic
const triageAI = (symptoms, age) => {
    const input = (symptoms || '').toLowerCase();

    // 1. Red Flags Definition (Critical Scenarios)
    const redFlags = [
        { keywords: ['chest pain', 'heart pain', 'angina', 'myocardial', 'pressure in chest'], system: 'Cardiovascular', weight: 75 },
        { keywords: ['breathing difficulty', 'shortness of breath', 'dyspnea', 'suffocating', 'gasping'], system: 'Respiratory', weight: 75 },
        { keywords: ['numbness', 'paralysis', 'slurred speech', 'facial drooping', 'stroke', 'hemiplegia'], system: 'Neurological', weight: 75 },
        { keywords: ['severe bleeding', 'uncontrolled hemorrhage', 'vomiting blood', 'blood in stool'], system: 'Vascular', weight: 70 },
        { keywords: ['unconscious', 'fainted', 'passed out', 'non responsive'], system: 'General', weight: 70 },
        { keywords: ['seizure', 'convulsion', 'fitting'], system: 'Neurological', weight: 70 },
        { keywords: ['severe abdominal pain', 'stomach stabbing', 'guarding'], system: 'Gastrointestinal', weight: 70 },
        { keywords: ['suicidal', 'harm myself', 'self harm'], system: 'Psychological', weight: 70 },
        { keywords: ['sudden severe headache', 'worst headache', 'thunderclap'], system: 'Neurological', weight: 70 },
        { keywords: ['anaphylaxis', 'severe allergic', 'throat closing', 'tongue swelling'], system: 'Immune', weight: 70 }
    ];

    // 2. Body System Detection (Symptom Clusters)
    const systems = {
        'Cardiovascular': ['palpitations', 'racing heart', 'irregular pulse', 'lightheaded'],
        'Respiratory': ['coughing', 'wheezing', 'chest tightness', 'phlegm'],
        'Neurological': ['dizziness', 'confusion', 'vision loss', 'blurred vision', 'tremor'],
        'Gastrointestinal': ['vomiting', 'nausea', 'diarrhea', 'bloating', 'cramp'],
        'Musculoskeletal': ['joint pain', 'muscle ache', 'back pain', 'stiffness'],
        'General': ['fever', 'fatigue', 'weakness', 'chills', 'weight loss']
    };

    let baseScore = 0;
    let affectedSystems = new Set();
    let redFlagCount = 0;

    // Check Red Flags
    redFlags.forEach(flag => {
        if (flag.keywords.some(k => input.includes(k))) {
            baseScore = Math.max(baseScore, flag.weight);
            affectedSystems.add(flag.system);
            redFlagCount++;
        }
    });

    // Body System Logic
    Object.entries(systems).forEach(([name, keywords]) => {
        if (keywords.some(k => input.includes(k))) {
            affectedSystems.add(name);
            if (baseScore < 30) baseScore += 15;
            else if (baseScore < 60) baseScore += 5;
        }
    });

    // 3. Clinical Multipliers
    if (redFlagCount > 1) {
        baseScore = 85 + (redFlagCount * 3);
    } else if (affectedSystems.size > 2) {
        baseScore += (affectedSystems.size * 5);
    }

    // 4. Demographic Risk Adjustment
    if (age > 65 || age < 5) baseScore += 10;
    if (age > 80) baseScore += 5;

    // 5. Hard Safety Overrides (Never Low)
    const isCriticalSystem = input.includes('heart') || input.includes('chest') || input.includes('breath') || input.includes('stroke') || input.includes('head injury');
    if (isCriticalSystem) {
        baseScore = Math.max(baseScore, 45);
    }

    // Handle Vague but Alarming terms
    if (baseScore < 30 && (input.includes('severe') || input.includes('intense') || input.includes('sudden') || input.includes('agony'))) {
        baseScore = 35;
    }

    // Risk Caps & Floors
    const score = Math.min(100, Math.max(10, baseScore));

    // Final Risk Classification (User Scale)
    let severity = 'Low';
    if (score > 85) severity = 'Critical';
    else if (score > 60) severity = 'High';
    else if (score > 25) severity = 'Moderate';

    // Specialist Mapping
    let suggestedSpecialist = 'General Physician';
    if (affectedSystems.has('Cardiovascular')) suggestedSpecialist = 'Cardiologist';
    else if (affectedSystems.has('Neurological')) suggestedSpecialist = 'Neurologist';
    else if (affectedSystems.has('Respiratory')) suggestedSpecialist = 'Pulmonologist';
    else if (affectedSystems.has('Gastrointestinal')) suggestedSpecialist = 'Gastroenterologist';
    else if (affectedSystems.has('Psychological')) suggestedSpecialist = 'Psychiatrist';

    if (severity === 'Critical' || severity === 'High') {
        suggestedSpecialist = `Emergency / ${suggestedSpecialist}`;
    }

    return { severity, score, suggestedSpecialist, system: Array.from(affectedSystems).join(', ') };
};

const createTimelineEvent = async (patientId, type, title, description, metadata = {}) => {
    try {
        const eventData = {
            id: `EVT${Date.now()}`,
            patientId,
            type,
            title,
            description,
            metadata,
            date: new Date()
        };

        if (dbStore.isDbConnected) {
            const count = await TimelineEvent.countDocuments();
            const event = new TimelineEvent({ ...eventData, id: `EVT${String(count + 1).padStart(4, '0')}` });
            await event.save();
        } else {
            dbStore.memTimelineEvents.push(eventData);
        }
    } catch (err) {
        console.error('Timeline error:', err);
    }
};

exports.analyzeSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body;
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }
        const age = patient ? patient.age : (req.user.age || 30);

        const analysis = triageAI(symptoms, age);

        let recommendation = 'Symptoms appear mild. Monitor and rest.';
        if (analysis.severity === 'Critical') {
            recommendation = '⚠️ EMERGENCY: Life-threatening symptoms detected. Please head to the nearest emergency department immediately.';
        } else if (analysis.severity === 'High') {
            recommendation = 'Urgent clinical attention required. Please schedule a priority consultation.';
        } else if (analysis.severity === 'Moderate') {
            recommendation = 'Non-emergency but requires evaluation. Consider booking an appointment with a specialist.';
        }

        await createTimelineEvent(patient?.id || req.user.id, 'Analysis', 'Advanced Triage Analysis', `AI analyzed symptoms: ${symptoms.substring(0, 50)}...`, { analysis });

        res.json({
            severity: analysis.severity,
            recommendation,
            specialist: analysis.suggestedSpecialist,
            riskScore: analysis.score,
            affectedSystem: analysis.system
        });
    } catch (err) {
        res.status(500).json({ message: 'AI Analysis failed', error: err.message });
    }
};

exports.getHospitals = async (req, res) => {
    try {
        let hospitals;
        if (dbStore.isDbConnected) {
            hospitals = await Hospital.find({ approved: true });
        } else {
            hospitals = dbStore.memHospitals.filter(h => h.approved !== false);
        }
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch hospitals' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        let patient;
        console.log('👤 GetProfile for:', req.user.id, 'DB connected:', dbStore.isDbConnected);
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
            console.log('👤 Found in mem:', !!patient);
        }
        res.json(patient || null);
    } catch (err) {
        console.error('❌ GetProfile Error:', err.message);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, age, village, contact } = req.body;
        console.log('📝 UpdateProfile hit for:', req.user.id, 'Data:', { name, age, village, contact });
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }

        if (patient) {
            console.log('📝 Updating existing patient object');
            patient.name = name || patient.name;
            patient.age = age || patient.age;
            patient.village = village || patient.village;
            patient.contact = contact || patient.contact;
            if (dbStore.isDbConnected) await patient.save();
        } else {
            console.log('📝 Creating new patient object');
            const patientData = {
                id: `PAT${Date.now()}`,
                userId: req.user.id,
                name, age, village, contact
            };
            if (dbStore.isDbConnected) {
                const count = await Patient.countDocuments();
                patient = new Patient({ ...patientData, id: `PAT${String(count + 1).padStart(3, '0')}` });
                await patient.save();
            } else {
                patient = patientData;
                dbStore.memPatients.push(patient);
            }
        }

        // Also update the User record for consistency
        if (dbStore.isDbConnected) {
            await User.findOneAndUpdate(
                { $or: [{ id: req.user.id }, { _id: req.user.id }] },
                { name, age, village, contact }
            );
        } else {
            const user = dbStore.memUsers.find(u => u.id === req.user.id);
            if (user) {
                user.name = name || user.name;
                user.age = age || user.age;
                user.village = village || user.village;
                user.contact = contact || user.contact;
            }
        }

        console.log('✅ Update successful');
        res.json({ success: true, patient });
    } catch (err) {
        console.error('❌ UpdateProfile Error:', err.message);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

exports.getMyReferrals = async (req, res) => {
    try {
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }
        if (!patient) return res.json({ referrals: [], activeReferral: null });

        let referrals;
        if (dbStore.isDbConnected) {
            referrals = await Referral.find({
                $or: [{ patientId: patient.id }, { patientName: patient.name }]
            }).sort({ createdAt: -1 });
        } else {
            referrals = dbStore.memReferrals.filter(r => r.patientId === patient.id || r.patientName === patient.name)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const activeReferral = referrals.find(r => r.status !== 'Completed' && r.status !== 'Admitted') || referrals[0] || null;

        res.json({ referrals, activeReferral });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching referrals' });
    }
};

exports.createReferral = async (req, res) => {
    try {
        const { hospitalId, symptoms, specialistNeeded, urgency } = req.body;
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }
        if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

        let hospital;
        if (dbStore.isDbConnected) {
            hospital = await Hospital.findOne({ id: hospitalId });
        } else {
            hospital = dbStore.memHospitals.find(h => h.id === hospitalId);
        }
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

        const referralData = {
            id: `REF${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            patientAge: patient.age,
            patientVillage: patient.village,
            patientContact: patient.contact,
            symptoms,
            urgency,
            hospitalId,
            hospitalName: hospital.name,
            specialistNeeded,
            status: 'Pending',
            createdAt: new Date()
        };

        let referral;
        if (dbStore.isDbConnected) {
            const refCount = await Referral.countDocuments();
            referral = new Referral({ ...referralData, id: `REF${String(refCount + 1).padStart(3, '0')}` });
            await referral.save();
        } else {
            referral = referralData;
            dbStore.memReferrals.push(referral);
        }

        // Auto-reserve bed if available
        if (hospital.availableBeds > hospital.reservedBeds) {
            hospital.reservedBeds += 1;
            if (dbStore.isDbConnected) await hospital.save();

            const resData = {
                id: `RES${Date.now()}`,
                referralId: referral.id,
                hospitalId,
                hospitalName: hospital.name,
                patientName: patient.name,
                bedReserved: true,
                status: 'Reserved'
            };

            if (dbStore.isDbConnected) {
                const resCount = await Reservation.countDocuments();
                const reservation = new Reservation({ ...resData, id: `RES${String(resCount + 1).padStart(3, '0')}` });
                await reservation.save();
            } else {
                dbStore.memReservations.push(resData);
            }
        }

        await createTimelineEvent(patient.id, 'Referral', 'Referral Created', `Sent referral to ${hospital.name}`, { referralId: referral.id });

        res.json({ success: true, referral });
    } catch (err) {
        res.status(500).json({ message: 'Referral creation failed', error: err.message });
    }
};

exports.uploadMedicalFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }

        const fileInfo = {
            id: `FILE${Date.now()}`,
            patientId: patient?.id || req.user.id,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            filePath: req.file.path,
            createdAt: new Date()
        };

        let medicalFile;
        if (dbStore.isDbConnected) {
            const fileCount = await MedicalFile.countDocuments();
            medicalFile = new MedicalFile({ ...fileInfo, id: `FILE${String(fileCount + 1).padStart(4, '0')}` });
            await medicalFile.save();
        } else {
            medicalFile = fileInfo;
            dbStore.memMedicalFiles.push(medicalFile);
        }

        await createTimelineEvent(patient?.id || req.user.id, 'File Upload', 'Medical Document Uploaded', `Uploaded ${req.file.originalname}`);

        res.json({ success: true, file: medicalFile });
    } catch (err) {
        res.status(500).json({ message: 'File upload failed', error: err.message });
    }
};

exports.getMedicalFiles = async (req, res) => {
    try {
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }

        let files;
        if (dbStore.isDbConnected) {
            files = await MedicalFile.find({ patientId: patient?.id || req.user.id }).sort({ createdAt: -1 });
        } else {
            files = dbStore.memMedicalFiles.filter(f => f.patientId === (patient?.id || req.user.id))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.json(files);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch files' });
    }
};

exports.deleteMedicalFile = async (req, res) => {
    try {
        const { id } = req.params;
        if (dbStore.isDbConnected) {
            await MedicalFile.findOneAndDelete({ id });
        } else {
            dbStore.memMedicalFiles = dbStore.memMedicalFiles.filter(f => f.id !== id);
        }
        res.json({ success: true, message: 'File deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete file' });
    }
};

exports.downloadMedicalFile = async (req, res) => {
    try {
        const { id } = req.params;
        let file;
        if (dbStore.isDbConnected) {
            file = await MedicalFile.findOne({ id });
        } else {
            file = dbStore.memMedicalFiles.find(f => f.id === id);
        }
        if (!file) return res.status(404).json({ message: 'File not found' });

        const path = require('path');
        const fs = require('fs');
        const absolutePath = path.resolve(file.filePath);

        if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'Physical file not found' });

        res.download(absolutePath, file.originalName);
    } catch (err) {
        res.status(500).json({ message: 'Download failed', error: err.message });
    }
};

exports.getTimeline = async (req, res) => {
    try {
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }

        let timeline;
        if (dbStore.isDbConnected) {
            timeline = await TimelineEvent.find({ patientId: patient?.id || req.user.id }).sort({ date: -1 });
        } else {
            timeline = dbStore.memTimelineEvents.filter(e => e.patientId === (patient?.id || req.user.id))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        res.json(timeline);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch timeline' });
    }
};

exports.deleteTimelineEvent = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DeleteTimelineEvent hit for:', id, 'DB connected:', dbStore.isDbConnected);
        if (dbStore.isDbConnected) {
            await TimelineEvent.findOneAndDelete({ id });
        } else {
            dbStore.memTimelineEvents = dbStore.memTimelineEvents.filter(e => e.id !== id);
        }
        res.json({ success: true, message: 'Timeline event deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete timeline event' });
    }
};

exports.bookAppointment = async (req, res) => {
    try {
        const { hospitalId, hospitalName, date, time, type } = req.body;
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }

        const apptData = {
            id: `APT${Date.now()}`,
            patientId: patient?.id || req.user.id,
            patientName: patient?.name || req.user.name,
            hospitalId,
            hospitalName,
            date,
            time,
            type,
            createdAt: new Date()
        };

        let appointment;
        if (dbStore.isDbConnected) {
            const apptCount = await Appointment.countDocuments();
            appointment = new Appointment({ ...apptData, id: `APT${String(apptCount + 1).padStart(4, '0')}` });
            await appointment.save();
        } else {
            appointment = apptData;
            dbStore.memAppointments.push(appointment);
        }

        await createTimelineEvent(patient?.id || req.user.id, 'Appointment', 'Appointment Booked', `Scheduled ${type} at ${hospitalName} on ${new Date(date).toLocaleDateString()}`);

        res.json({ success: true, appointment });
    } catch (err) {
        res.status(500).json({ message: 'Failed to book appointment', error: err.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        let patient;
        if (dbStore.isDbConnected) {
            patient = await Patient.findOne({ userId: req.user.id });
        } else {
            patient = dbStore.memPatients.find(p => p.userId === req.user.id);
        }

        let appointments;
        if (dbStore.isDbConnected) {
            appointments = await Appointment.find({ patientId: patient?.id || req.user.id }).sort({ date: 1 });
        } else {
            appointments = dbStore.memAppointments.filter(a => a.patientId === (patient?.id || req.user.id))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DeleteAppointment hit for:', id, 'DB connected:', dbStore.isDbConnected);
        let appointment;

        if (dbStore.isDbConnected) {
            appointment = await Appointment.findOneAndDelete({ id });
        } else {
            const index = dbStore.memAppointments.findIndex(a => a.id === id);
            if (index !== -1) {
                appointment = dbStore.memAppointments[index];
                dbStore.memAppointments.splice(index, 1);
            }
        }

        if (!appointment) {
            console.warn('⚠️ Appointment not found for deletion:', id);
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await createTimelineEvent(appointment.patientId, 'Appointment', 'Appointment Cancelled', `Cancelled ${appointment.type} at ${appointment.hospitalName}`);
        console.log('✅ Appointment deleted successfully');
        res.json({ success: true, message: 'Appointment deleted' });
    } catch (err) {
        console.error('❌ DeleteAppointment Error:', err.message);
        res.status(500).json({ message: 'Failed to delete appointment', error: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, type, hospitalId, hospitalName } = req.body;
        console.log('📝 UpdateAppointment hit for:', id, 'Data:', { date, time, type, hospitalId, hospitalName });
        let appointment;

        if (dbStore.isDbConnected) {
            appointment = await Appointment.findOne({ id });
        } else {
            appointment = dbStore.memAppointments.find(a => a.id === id);
        }

        if (!appointment) {
            console.warn('⚠️ Appointment not found for update:', id);
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const oldDate = appointment.date;
        appointment.date = date || appointment.date;
        appointment.time = time || appointment.time;
        appointment.type = type || appointment.type;
        appointment.hospitalId = hospitalId || appointment.hospitalId;
        appointment.hospitalName = hospitalName || appointment.hospitalName;

        if (dbStore.isDbConnected) {
            await appointment.save();
        }

        await createTimelineEvent(appointment.patientId, 'Appointment', 'Appointment Rescheduled', `Rescheduled ${appointment.type} at ${appointment.hospitalName} from ${new Date(oldDate).toLocaleDateString()} to ${new Date(appointment.date).toLocaleDateString()}`);
        console.log('✅ Appointment updated successfully');
        res.json({ success: true, appointment });
    } catch (err) {
        console.error('❌ UpdateAppointment Error:', err.message);
        res.status(500).json({ message: 'Failed to update appointment', error: err.message });
    }
};
