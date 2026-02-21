const mongoose = require('mongoose');

const dbStore = {
    isDbConnected: false,
    memUsers: [],
    memHospitals: [],
    memReferrals: [],
    memReservations: [],
    memNotifications: [],
    memEscalationLogs: [],
    memAmbulanceAssignments: [],
    memPatients: [],
    memAppointments: [],
    memTimelineEvents: [],
    memMedicalFiles: []
};

module.exports = dbStore;
