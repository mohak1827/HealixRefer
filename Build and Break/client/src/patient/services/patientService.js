import axios from 'axios';

const API_URL = '/api/patient';

const patientService = {
    // Risk Score & Summary (Custom logic based on profile and history)
    getHealthSummary: async () => {
        const profile = await axios.get(`${API_URL}/profile`);
        const timeline = await axios.get(`${API_URL}/timeline`);
        // Simple logic to calculate a risk score if not provided by backend
        const riskScore = timeline.data.some(e => e.metadata?.analysis?.severity === 'High') ? 85 :
            timeline.data.some(e => e.metadata?.analysis?.severity === 'Medium') ? 45 : 25;
        return { profile: profile.data, riskScore, timeline: timeline.data };
    },

    // AI Analysis
    analyzeSymptoms: async (symptoms) => {
        const res = await axios.post(`${API_URL}/analyze`, { symptoms });
        return res.data;
    },

    // Referrals
    getHospitals: async () => {
        const res = await axios.get(`${API_URL}/hospitals`);
        return res.data;
    },
    createReferral: async (data) => {
        const res = await axios.post(`${API_URL}/referral`, data);
        return res.data;
    },
    getMyReferrals: async () => {
        const res = await axios.get(`${API_URL}/my-referrals`);
        return res.data;
    },
    updateProfile: async (data) => {
        const res = await axios.put(`${API_URL}/profile`, data);
        return res.data;
    },

    // Medical Vault
    getVaultFiles: async () => {
        const res = await axios.get(`${API_URL}/vault`);
        return res.data;
    },
    uploadFile: async (formData) => {
        const res = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
    deleteFile: async (id) => {
        const res = await axios.delete(`${API_URL}/vault/${id}`);
        return res.data;
    },

    // Timeline
    getTimeline: async () => {
        const res = await axios.get(`${API_URL}/timeline`);
        return res.data;
    },
    deleteTimelineEvent: async (id) => {
        const res = await axios.delete(`${API_URL}/timeline/${id}`);
        return res.data;
    },

    // Appointments
    getAppointments: async () => {
        const res = await axios.get(`${API_URL}/appointments`);
        return res.data;
    },
    bookAppointment: async (data) => {
        const res = await axios.post(`${API_URL}/appointment`, data);
        return res.data;
    },
    updateAppointment: async (id, data) => {
        const res = await axios.put(`${API_URL}/appointment/${id}`, data);
        return res.data;
    },
    deleteAppointment: async (id) => {
        const res = await axios.delete(`${API_URL}/appointment/${id}`);
        return res.data;
    }
};

export default patientService;
