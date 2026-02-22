// Replaced axios with localStorage for offline/no-backend usage
const getLocalItem = (key, defaultVal) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const setLocalItem = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Initial mock data
const INITIAL_PROFILE = {
    name: "Aaditya Sharma",
    age: 45,
    gender: "Male",
    bloodGroup: "A+",
    contact: "+91-9876543210",
    email: "patient@healix.com",
    village: "Pune Central",
    address: "123 Main Street, Sector 4, Pune",
    doctor: {
        name: "Dr. Ananya Desai",
        phone: "+91-9876543211"
    }
};

const INITIAL_TIMELINE = [
    {
        id: "ev1",
        date: new Date(Date.now() - 86400000).toISOString(),
        title: "Initial Checkup",
        description: "Patient presented with mild fever and fatigue.",
        metadata: { analysis: { severity: "Low" } }
    }
];

const patientService = {
    getHealthSummary: async () => {
        let profile = getLocalItem('healix_patient_profile', null);
        if (!profile) {
            profile = INITIAL_PROFILE;
            setLocalItem('healix_patient_profile', profile);
        }

        let timeline = getLocalItem('healix_patient_timeline', null);
        if (!timeline) {
            timeline = INITIAL_TIMELINE;
            setLocalItem('healix_patient_timeline', timeline);
        }

        let riskScore = getLocalItem('healix_patient_riskScore', null);
        if (!riskScore) {
            riskScore = timeline.some(e => e.metadata?.analysis?.severity === 'High') ? 85 :
                timeline.some(e => e.metadata?.analysis?.severity === 'Medium') ? 45 : 25;
            setLocalItem('healix_patient_riskScore', riskScore);
        }

        return { profile, riskScore, timeline };
    },

    analyzeSymptoms: async (symptoms) => {
        return {
            severity: "Medium",
            recommendation: "Please schedule an appointment with a general physician within 2 days.",
            suggestedAction: "Rest and hydration"
        };
    },

    getHospitals: async () => {
        return getLocalItem('healix_hospitals', []);
    },

    createReferral: async (data) => {
        const referrals = getLocalItem('healix_patient_referrals', []);
        const newReferral = { ...data, id: "REF" + Date.now(), createdAt: new Date().toISOString(), status: "Pending" };
        referrals.push(newReferral);
        setLocalItem('healix_patient_referrals', referrals);
        return { success: true, referral: newReferral };
    },

    getMyReferrals: async () => {
        const referrals = getLocalItem('healix_patient_referrals', []);
        const activeReferral = referrals.find(r => r.status === 'Pending' || r.status === 'Accepted');
        return { referrals, activeReferral };
    },

    updateProfile: async (data) => {
        let profile = getLocalItem('healix_patient_profile', INITIAL_PROFILE);
        profile = { ...profile, ...data };
        setLocalItem('healix_patient_profile', profile);
        return { success: true, profile };
    },

    getVaultFiles: async () => {
        return getLocalItem('healix_patient_vault', [
            { id: "v1", name: "Blood_Test_Report.pdf", date: new Date().toISOString(), type: "Document", size: "1.2 MB" }
        ]);
    },

    uploadFile: async (formData) => {
        const files = getLocalItem('healix_patient_vault', []);
        // Mock the file response since formData contents can't be easily read directly here synchronously
        const newFile = { id: "v" + Date.now(), name: "Uploaded_Document_" + Date.now() + ".pdf", date: new Date().toISOString(), type: "Document", size: "Unknown" };
        files.push(newFile);
        setLocalItem('healix_patient_vault', files);
        return { success: true, file: newFile };
    },

    deleteFile: async (id) => {
        let files = getLocalItem('healix_patient_vault', []);
        files = files.filter(f => f.id !== id);
        setLocalItem('healix_patient_vault', files);
        return { success: true };
    },

    getTimeline: async () => {
        return getLocalItem('healix_patient_timeline', INITIAL_TIMELINE);
    },

    deleteTimelineEvent: async (id) => {
        let timeline = getLocalItem('healix_patient_timeline', []);
        timeline = timeline.filter(t => t.id !== id);
        setLocalItem('healix_patient_timeline', timeline);
        return { success: true };
    },

    getAppointments: async () => {
        return getLocalItem('healix_patient_appointments', [
            { id: "app1", date: new Date(Date.now() + 86400000).toISOString(), doctor: "Dr. Ananya Desai", status: "Scheduled", type: "Follow-up" }
        ]);
    },

    bookAppointment: async (data) => {
        const appointments = getLocalItem('healix_patient_appointments', []);
        const newAppointment = { ...data, id: "app" + Date.now(), status: "Scheduled" };
        appointments.push(newAppointment);
        setLocalItem('healix_patient_appointments', appointments);
        return { success: true, appointment: newAppointment };
    },

    updateAppointment: async (id, data) => {
        let appointments = getLocalItem('healix_patient_appointments', []);
        appointments = appointments.map(a => a.id === id ? { ...a, ...data } : a);
        setLocalItem('healix_patient_appointments', appointments);
        return { success: true };
    },

    deleteAppointment: async (id) => {
        let appointments = getLocalItem('healix_patient_appointments', []);
        appointments = appointments.filter(a => a.id !== id);
        setLocalItem('healix_patient_appointments', appointments);
        return { success: true };
    }
};

export default patientService;
