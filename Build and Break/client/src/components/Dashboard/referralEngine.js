// ═══════════════════════════════════════════════════════════════════════════
// Smart Referral Engine — Client-Side AI Hospital Recommendation
// ═══════════════════════════════════════════════════════════════════════════
// Works entirely in the browser using localStorage-seeded hospital data.
// Scores hospitals by: location proximity, bed availability, ICU capacity,
// doctor/specialist availability, equipment, and delay risk.

// ─── MP Location Coordinates ────────────────────────────────────────────────
const LOCATIONS = {
    'Sehore': { lat: 23.2000, lng: 77.0860 },
    'Bhopal': { lat: 23.2599, lng: 77.4126 },
    'Indore': { lat: 22.7196, lng: 75.8577 },
    'Raisen': { lat: 23.3300, lng: 77.7900 },
    'Vidisha': { lat: 23.5251, lng: 77.8081 },
    'Hoshangabad': { lat: 22.7467, lng: 77.7259 },
    'Ashta': { lat: 23.0140, lng: 76.7260 },
    'Budhni': { lat: 22.7925, lng: 77.6667 },
    'Nasrullaganj': { lat: 22.9900, lng: 77.2700 },
    'Ichhawar': { lat: 23.0085, lng: 77.0380 },
    'Dewas': { lat: 22.9676, lng: 76.0534 },
    'Ujjain': { lat: 23.1793, lng: 75.7849 },
    'Jabalpur': { lat: 23.1815, lng: 79.9864 },
    'Gwalior': { lat: 26.2183, lng: 78.1828 },
    'Satna': { lat: 24.5804, lng: 80.8322 },
    'Rewa': { lat: 24.5373, lng: 81.2989 },
    'Shahdol': { lat: 23.2977, lng: 81.3570 },
    'Mandla': { lat: 22.5980, lng: 80.3718 },
    'Chhindwara': { lat: 22.0574, lng: 78.9382 },
    'Betul': { lat: 21.9064, lng: 77.9022 },
};

export const LOCATION_LIST = Object.keys(LOCATIONS).sort();

// ─── Hospital Seed Data ─────────────────────────────────────────────────────
const HOSPITALS = [
    { id: 1, name: "City General Hospital", city: "Bhopal", lat: 23.2599, lng: 77.4126, totalBeds: 60, icuBeds: 8, availableBeds: 45, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "Neurologist", "Orthopedic"], specialistSlots: { Cardiologist: 3, Neurologist: 2, Orthopedic: 2 }, ambulanceETA: 18, equipment: ["Ventilator", "ECG", "CT Scan", "MRI"], contact: "0755-2345678" },
    { id: 2, name: "District Medical Center", city: "Indore", lat: 22.7196, lng: 75.8577, totalBeds: 40, icuBeds: 3, availableBeds: 30, reservedBeds: 0, reservedICU: 0, specialists: ["Orthopedic", "General Surgeon"], specialistSlots: { Orthopedic: 2, "General Surgeon": 1 }, ambulanceETA: 32, equipment: ["X-Ray", "ECG", "Ultrasound"], contact: "0731-9876543" },
    { id: 3, name: "Rural Health Institute", city: "Sehore", lat: 23.2000, lng: 77.0860, totalBeds: 20, icuBeds: 2, availableBeds: 15, reservedBeds: 0, reservedICU: 0, specialists: ["General"], specialistSlots: { General: 3 }, ambulanceETA: 14, equipment: ["Basic", "X-Ray"], contact: "07562-234567" },
    { id: 4, name: "St. Mary's Specialty Hospital", city: "Bhopal", lat: 23.2800, lng: 77.4350, totalBeds: 80, icuBeds: 12, availableBeds: 60, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "Neurologist", "Orthopedic", "Pulmonologist"], specialistSlots: { Cardiologist: 4, Neurologist: 3, Orthopedic: 3, Pulmonologist: 2 }, ambulanceETA: 45, equipment: ["Ventilator", "MRI", "CT Scan", "ECG", "Dialysis"], contact: "0755-8765432" },
    { id: 5, name: "Community Care Hospital", city: "Raisen", lat: 23.3300, lng: 77.7900, totalBeds: 35, icuBeds: 5, availableBeds: 25, reservedBeds: 0, reservedICU: 0, specialists: ["General", "Neurologist"], specialistSlots: { General: 2, Neurologist: 1 }, ambulanceETA: 27, equipment: ["ECG", "X-Ray", "Ventilator"], contact: "07482-345678" },
    { id: 6, name: "Apollo Rural Clinic", city: "Vidisha", lat: 23.5251, lng: 77.8081, totalBeds: 50, icuBeds: 6, availableBeds: 38, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "General Surgeon", "Pediatrician"], specialistSlots: { Cardiologist: 2, "General Surgeon": 2, Pediatrician: 3 }, ambulanceETA: 35, equipment: ["Ventilator", "ECG", "CT Scan", "Ultrasound"], contact: "07592-456789" },
    { id: 7, name: "Lifeline Trauma Center", city: "Hoshangabad", lat: 22.7467, lng: 77.7259, totalBeds: 70, icuBeds: 10, availableBeds: 50, reservedBeds: 0, reservedICU: 0, specialists: ["Orthopedic", "Neurologist", "General Surgeon", "Anesthesiologist"], specialistSlots: { Orthopedic: 3, Neurologist: 2, "General Surgeon": 2, Anesthesiologist: 2 }, ambulanceETA: 50, equipment: ["Ventilator", "MRI", "CT Scan", "ECG", "X-Ray", "Dialysis"], contact: "07574-567890" },
    { id: 8, name: "MP Institute of Medical Sciences", city: "Bhopal", lat: 23.2100, lng: 77.3900, totalBeds: 100, icuBeds: 15, availableBeds: 72, reservedBeds: 0, reservedICU: 0, specialists: ["Cardiologist", "Neurologist", "Orthopedic", "Pulmonologist", "Oncologist", "Nephrologist"], specialistSlots: { Cardiologist: 5, Neurologist: 4, Orthopedic: 3, Pulmonologist: 3, Oncologist: 2, Nephrologist: 2 }, ambulanceETA: 20, equipment: ["Ventilator", "MRI", "CT Scan", "ECG", "Dialysis", "ECMO", "Cathlab"], contact: "0755-1234567" },
];

// ─── Haversine Distance (km) ────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Severity Classifier ────────────────────────────────────────────────────
export function classifySeverity(symptoms, urgency, needsICU, specialistNeeded) {
    const lower = (symptoms || '').toLowerCase();
    let score = 0;
    const reasons = [];

    const critical = ['cardiac arrest', 'heart attack', 'stroke', 'severe bleeding', 'unconscious', 'not breathing', 'anaphylaxis', 'multi-organ', 'trauma', 'sepsis', 'respiratory failure'];
    const high = ['chest pain', 'difficulty breathing', 'seizure', 'fracture', 'severe pain', 'high fever', 'head injury', 'burns', 'poisoning', 'hemorrhage', 'paralysis'];
    const moderate = ['infection', 'fever', 'vomiting', 'diarrhea', 'abdominal pain', 'cough', 'weakness', 'dehydration', 'wound', 'swelling', 'rash'];

    critical.forEach(k => { if (lower.includes(k)) { score += 40; reasons.push(`Critical symptom: ${k}`); } });
    high.forEach(k => { if (lower.includes(k)) { score += 25; reasons.push(`High-priority symptom: ${k}`); } });
    moderate.forEach(k => { if (lower.includes(k)) { score += 10; reasons.push(`Moderate symptom: ${k}`); } });

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

// ─── Delay Risk Calculator ──────────────────────────────────────────────────
function calculateDelayRisk(hospital, urgency, distKm) {
    const distance = distKm ?? hospital.distance ?? 20;
    const travelTime = Math.round(distance * 1.4);     // ~1.4 min/km on rural roads
    const icuTotal = hospital.icuBeds + hospital.reservedICU;
    const icuUsed = icuTotal > 0 ? ((icuTotal - hospital.icuBeds) / icuTotal) * 100 : 0;
    const hospitalLoad = ((hospital.totalBeds - hospital.availableBeds + hospital.reservedBeds) / hospital.totalBeds) * 100;

    let riskScore = 0;
    const reasons = [];

    if (distance > 35) { riskScore += 35; reasons.push(`Long distance: ${Math.round(distance)} km`); }
    else if (distance > 20) { riskScore += 20; reasons.push(`Moderate distance: ${Math.round(distance)} km`); }
    else { riskScore += 5; }

    if (icuUsed > 80) { riskScore += 30; reasons.push(`High ICU occupancy: ${Math.round(icuUsed)}%`); }
    else if (icuUsed > 60) { riskScore += 15; reasons.push(`Moderate ICU occupancy: ${Math.round(icuUsed)}%`); }

    if (hospitalLoad > 85) { riskScore += 25; reasons.push(`Hospital overloaded: ${Math.round(hospitalLoad)}% capacity`); }
    else if (hospitalLoad > 65) { riskScore += 10; reasons.push(`Hospital busy: ${Math.round(hospitalLoad)}% capacity`); }

    if (travelTime > 40) { riskScore += 20; reasons.push(`Long travel time: ${travelTime} min`); }
    else if (travelTime > 25) { riskScore += 10; reasons.push(`Moderate travel time: ${travelTime} min`); }

    if (urgency === 'Emergency') riskScore = Math.round(riskScore * 1.3);

    let level;
    if (riskScore >= 60) level = 'High';
    else if (riskScore >= 30) level = 'Medium';
    else level = 'Low';

    return {
        level,
        score: Math.min(100, riskScore),
        reason: reasons.length > 0 ? reasons.join(' | ') : 'All parameters within safe limits',
        factors: { distance: Math.round(distance), icuOccupancy: Math.round(icuUsed), hospitalLoad: Math.round(hospitalLoad), travelTime }
    };
}

// ─── Survival Chance ────────────────────────────────────────────────────────
function calculateSurvival(urgency, eta) {
    let base = urgency === 'Emergency' ? 85 : 95;
    base -= Math.min(20, eta * 0.3);
    return Math.max(60, Math.round(base + Math.random() * 5));
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — Suggest Hospitals (location-aware)
// ═══════════════════════════════════════════════════════════════════════════
export function suggestHospitals({ symptoms, urgency, specialistNeeded, needsICU, patientLocation }) {
    const patientCoord = LOCATIONS[patientLocation] || LOCATIONS['Sehore'];

    const results = HOSPITALS
        .filter(h => (h.availableBeds - h.reservedBeds) > 0)
        .map(h => {
            let score = 100;
            const reasons = [];
            const effectiveBeds = h.availableBeds - h.reservedBeds;
            const effectiveICU = h.icuBeds - h.reservedICU;

            // Compute real distance from patient
            const distKm = haversineKm(patientCoord.lat, patientCoord.lng, h.lat, h.lng);
            const roundedDist = Math.round(distKm);
            const travelTime = Math.round(distKm * 1.4);

            // Distance scoring (heavier weight for emergencies)
            if (urgency === 'Emergency') {
                score -= distKm * 1.8;
                if (distKm <= 15) reasons.push(`Only ${roundedDist} km away`);
            } else {
                score -= distKm * 1.0;
                if (distKm <= 25) reasons.push(`${roundedDist} km away`);
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
                const slots = h.specialistSlots?.[specialistNeeded] || 0;
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
            if (bedRatio > 0.5) { score += 15; reasons.push(`${effectiveBeds} beds available`); }
            else if (bedRatio > 0.2) { score += 5; reasons.push(`${effectiveBeds} beds available`); }
            else { score -= 10; reasons.push(`Low bed availability (${effectiveBeds})`); }

            // Equipment bonus
            if (h.equipment.includes('Ventilator') && urgency === 'Emergency') {
                score += 10;
                reasons.push('Ventilator available');
            }

            // ETA bonus
            if (travelTime <= 20) { score += 10; reasons.push(`ETA: ${travelTime} min`); }

            const delayRisk = calculateDelayRisk(h, urgency, distKm);
            const survivalChance = calculateSurvival(urgency, travelTime);
            const reasonString = reasons.length > 0
                ? `Selected because: ${reasons.join(' + ')}`
                : 'General availability match';

            return {
                ...h,
                distance: roundedDist,
                travelTime,
                effectiveBeds,
                effectiveICU,
                score: Math.max(0, Math.round(score)),
                survivalChance,
                reasons,
                reasonString,
                delayRisk,
                ambulanceETA: travelTime,
            };
        })
        .sort((a, b) => b.score - a.score);

    return { suggestions: results, bestMatch: results[0] || null };
}

// ═══════════════════════════════════════════════════════════════════════════
// Referral Storage (localStorage)
// ═══════════════════════════════════════════════════════════════════════════
const REFERRAL_KEY = 'healix_referrals';

function loadReferrals() {
    try { return JSON.parse(localStorage.getItem(REFERRAL_KEY)) || []; }
    catch { return []; }
}

function saveReferrals(refs) {
    localStorage.setItem(REFERRAL_KEY, JSON.stringify(refs));
}

export function getReferrals() {
    return loadReferrals().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function createReferral({ form, hospital, severity, doctorName }) {
    const refs = loadReferrals();
    const id = `REF${String(refs.length + 1).padStart(3, '0')}`;

    const effectiveICU = hospital.icuBeds - hospital.reservedICU;
    const bedNumber = `B-${Math.floor(Math.random() * 90 + 10)}`;
    const needsICU = form.needsICU || form.urgency === 'Emergency';

    const referral = {
        id,
        patientName: form.patientName,
        patientAge: form.patientAge,
        patientVillage: form.patientVillage,
        patientContact: form.patientContact,
        symptoms: form.symptoms,
        urgency: form.urgency,
        doctorName,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        specialistNeeded: form.specialistNeeded,
        needsICU,
        status: 'Pending',
        aiReason: hospital.reasonString,
        delayRisk: hospital.delayRisk,
        severity,
        notes: form.notes,
        medicalReport: form.medicalReport,
        createdAt: new Date().toISOString(),
    };

    const reservationId = `RES${String(refs.length + 1).padStart(3, '0')}`;
    const reservation = {
        id: reservationId,
        referralId: id,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        patientName: form.patientName,
        bedReserved: true,
        bedNumber,
        icuReserved: needsICU && effectiveICU > 0,
        specialistReserved: form.specialistNeeded || null,
        createdAt: new Date().toISOString(),
    };

    referral.reservationId = reservationId;
    refs.push(referral);
    saveReferrals(refs);

    return { referral, reservation };
}
