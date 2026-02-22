// ═══════════════════════════════════════════════════════════════════════════
// Smart Referral Engine — Client-Side AI Hospital Recommendation
// ═══════════════════════════════════════════════════════════════════════════
// Works entirely in the browser using localStorage-seeded hospital data.
// Scores hospitals by: location proximity, bed availability, ICU capacity,
// doctor/specialist availability, equipment, and delay risk.

import { mockHospitalsData } from '../../data/mockRuralData';

// ─── Location Coordinates (Approximated for Punjab rural areas based on mockRuralData)
const LOCATIONS = {
    "Samrala": { lat: 30.8385, lng: 76.1895 },
    "Jagraon": { lat: 30.7812, lng: 75.4780 },
    "Nabha": { lat: 30.3700, lng: 76.1480 },
    "Rajpura": { lat: 30.4850, lng: 76.5950 },
    "Khamano": { lat: 30.8250, lng: 76.3250 },
    "Khanna": { lat: 30.7050, lng: 76.2250 },
    "Doraha": { lat: 30.7980, lng: 76.0350 },
    "Machiwara": { lat: 30.9180, lng: 76.2050 }
};

export const LOCATION_LIST = Object.keys(LOCATIONS).sort();

const HOSPITALS_KEY = 'healix_hospitals_v3';

export function getHospitals() {
    let storedHospitals = null;
    try {
        const stored = localStorage.getItem(HOSPITALS_KEY);
        if (stored) {
            storedHospitals = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error reading hospitals from local storage", e);
    }

    if (!storedHospitals || storedHospitals.length === 0) {
        storedHospitals = [];
        Object.keys(mockHospitalsData).forEach(location => {
            const hotelsInLoc = mockHospitalsData[location].map(h => ({
                ...h,
                location: location,
                availableBeds: h.bedsAvailable || 0,
                totalBeds: (h.bedsAvailable || 0) + 10,
                reservedBeds: 0,
                icuBeds: 5,
                reservedICU: 0
            }));
            storedHospitals = [...storedHospitals, ...hotelsInLoc];
        });

        try {
            localStorage.setItem(HOSPITALS_KEY, JSON.stringify(storedHospitals));
        } catch (e) {
            console.error("Error saving initial hospitals to local storage", e);
        }
    }

    // DEVELOPMENT OVERRIDE: Force Nabha beds to 0 for testing AI failovers
    storedHospitals = storedHospitals.map(h => {
        if (h.location === 'Nabha' || h.name.toLowerCase().includes('nabha') || h.name.toLowerCase().includes('sood') || h.name.toLowerCase().includes('singla')) {
            return { ...h, bedsAvailable: 0, availableBeds: 0, icuBeds: 0 };
        }
        return h;
    });

    return storedHospitals;
}

export function updateHospitalBeds(hospitalId, needsICU) {
    const hospitals = getHospitals();
    const index = hospitals.findIndex(h => h.id === hospitalId);
    if (index !== -1) {
        if (hospitals[index].availableBeds > 0) {
            hospitals[index].availableBeds -= 1;
        }
        if (needsICU && hospitals[index].icuBeds > 0) {
            hospitals[index].icuBeds -= 1;
        }
        localStorage.setItem(HOSPITALS_KEY, JSON.stringify(hospitals));
    }
}


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
export async function suggestHospitals({ symptoms, urgency, specialistNeeded, needsICU, patientLocation }) {
    const patientCoord = LOCATIONS[patientLocation] || LOCATIONS['Samrala'];
    const HOSPITALS = getHospitals();

    // Local preprocessing (distance, delay risk)
    const localProcessed = HOSPITALS
        .filter(h => (h.availableBeds - h.reservedBeds) > 0)
        .map(h => {
            const effectiveBeds = h.availableBeds - h.reservedBeds;
            const effectiveICU = h.icuBeds - h.reservedICU;
            const distKm = haversineKm(patientCoord.lat, patientCoord.lng, h.lat, h.lng);
            const roundedDist = Math.round(distKm);
            const travelTime = Math.round(distKm * 1.4);

            const delayRisk = calculateDelayRisk(h, urgency, distKm);
            const survivalChance = calculateSurvival(urgency, travelTime);

            return {
                ...h,
                distance: roundedDist,
                travelTime,
                ambulanceETA: travelTime,
                effectiveBeds,
                effectiveICU,
                delayRisk,
                survivalChance
            };
        });

    // Send payload to backend for Groq AI processing
    try {
        const payload = {
            patient: { symptoms, urgency, specialistNeeded, needsICU },
            hospitals: localProcessed
        };

        const response = await fetch('http://localhost:5000/api/ai/suggest-hospitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("AI Backend returned error");
        const data = await response.json();

        // Data format: { suggestions: [...], bestMatch: object }
        // Let's ensure delayRisk and survivalChance (added in preprocessing) are maintained
        const finalSuggestions = data.suggestions.map(aiSugg => {
            const original = localProcessed.find(l => l.id === aiSugg.id) || {};
            return {
                ...original,
                ...aiSugg
            };
        });

        return { suggestions: finalSuggestions, bestMatch: finalSuggestions[0] || null };

    } catch (error) {
        console.error("AI Suggestion Error:", error);
        // Fallback to purely local heuristic if AI fails
        console.warn("Falling back to local heuristic due to API error.");

        const fallbackResults = localProcessed.map(h => {
            let score = 100;
            if (urgency === 'Emergency') score -= h.distance * 1.8;
            else score -= h.distance * 1.0;

            if (needsICU && h.effectiveICU <= 0) score -= 40;
            else if (h.effectiveICU > 0) score += 20;

            if (specialistNeeded && h.specialists?.some(s => typeof s === 'string' ? s === specialistNeeded : s.role === specialistNeeded)) score += 30;

            return { ...h, score: Math.round(score), reasonString: "Local heuristic fallback" };
        }).sort((a, b) => b.score - a.score);

        return { suggestions: fallbackResults, bestMatch: fallbackResults[0] || null };
    }
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

    // Persist bed changes to local storage
    updateHospitalBeds(hospital.id, needsICU);

    return { referral, reservation };
}
