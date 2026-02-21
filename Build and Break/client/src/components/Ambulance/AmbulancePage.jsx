import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Activity, TrendingUp, Clock, AlertTriangle, Shield, Users, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AmbulanceRequests from './AmbulanceRequests';
import AmbulanceFleet from './AmbulanceFleet';
import AmbulanceHistory from './AmbulanceHistory';
import ActiveMissions from './ActiveMissions';
import { findBestAmbulance, getTravelTime } from './locationEngine';

const AMBULANCE_DATA_KEY = 'healix_ambulance_data';

// ───── Real-time Seed Data Builder ───────────────────────────────────────────

function fmt(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function buildSeedData() {
    const now = new Date();

    // AMB-002: departed 15 min ago, ETA 18 min remaining, free in ~28 min
    const dep2 = new Date(now.getTime() - 15 * 60000);
    const free2 = new Date(now.getTime() + 18 * 60000);

    // AMB-004: departed 25 min ago, ETA 32 min remaining, free in ~42 min
    const dep4 = new Date(now.getTime() - 25 * 60000);
    const free4 = new Date(now.getTime() + 32 * 60000);

    // AMB-005: off duty, available in ~90 min
    const free5 = new Date(now.getTime() + 90 * 60000);

    const fleet = [
        { id: 'AMB-001', driverName: 'Ravi Kumar', vehicleNo: 'MP-04-AB-1234', contact: '9876543210', location: 'Sehore PHC', status: 'Available', estimatedFreeAt: 'Now' },
        { id: 'AMB-002', driverName: 'Suresh Yadav', vehicleNo: 'MP-04-CD-5678', contact: '9876543211', location: 'Bhopal Station', status: 'On Mission', estimatedFreeAt: fmt(free2), etaMinutes: 18, departedAt: fmt(dep2), progress: 55, missionPickup: 'Raisen Community Center', missionDrop: 'District Medical Center, Indore' },
        { id: 'AMB-003', driverName: 'Mohammed Ali', vehicleNo: 'MP-04-EF-9012', contact: '9876543212', location: 'Raisen Hub', status: 'Available', estimatedFreeAt: 'Now' },
        { id: 'AMB-004', driverName: 'Anil Verma', vehicleNo: 'MP-04-GH-3456', contact: '9876543213', location: 'Vidisha Depot', status: 'On Mission', estimatedFreeAt: fmt(free4), etaMinutes: 32, departedAt: fmt(dep4), progress: 35, missionPickup: 'Vidisha Bus Stand', missionDrop: 'Apollo Rural Clinic, Vidisha' },
        { id: 'AMB-005', driverName: 'Prakash Singh', vehicleNo: 'MP-04-IJ-7890', contact: '9876543214', location: 'Hoshangabad Base', status: 'Off Duty', estimatedFreeAt: fmt(free5) },
    ];

    const requests = [
        { id: 'REQ-001', patientName: 'Ramesh Kumar', patientContact: '9988776655', symptoms: 'Chest pain and difficulty breathing, needs urgent care', urgency: 'Emergency', pickupLocation: 'Sehore Village PHC', dropLocation: 'City General Hospital, Bhopal', status: 'Pending', createdAt: new Date(now.getTime() - 30 * 60000).toISOString() },
        { id: 'REQ-002', patientName: 'Sunita Devi', patientContact: '9988776633', symptoms: 'Fracture in right leg from fall, moderate pain', urgency: 'Urgent', pickupLocation: 'Raisen Community Center', dropLocation: 'District Medical Center, Indore', status: 'Accepted', assignedVehicle: 'MP-04-CD-5678', createdAt: new Date(now.getTime() - 20 * 60000).toISOString() },
        { id: 'REQ-003', patientName: 'Ajay Sharma', patientContact: '9988776622', symptoms: 'High fever and vomiting for 3 days, dehydration signs', urgency: 'Normal', pickupLocation: 'Vidisha PHC', dropLocation: 'Rural Health Institute, Sehore', status: 'Pending', createdAt: new Date(now.getTime() - 10 * 60000).toISOString() },
        { id: 'REQ-004', patientName: 'Dinesh Tiwari', patientContact: '9988776611', symptoms: 'Post-surgery patient transfer for follow-up', urgency: 'Normal', pickupLocation: 'Vidisha Bus Stand', dropLocation: 'Apollo Rural Clinic, Vidisha', status: 'Accepted', assignedVehicle: 'MP-04-GH-3456', createdAt: new Date(now.getTime() - 25 * 60000).toISOString() },
    ];

    const today = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const yesterday = new Date(now.getTime() - 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const history = [
        { id: 'HIST-001', patientName: 'Meera Patel', pickupLocation: 'Sehore PHC', dropLocation: 'City General Hospital, Bhopal', date: today, duration: '28 min', driverName: 'Ravi Kumar', vehicleNo: 'MP-04-AB-1234' },
        { id: 'HIST-002', patientName: 'Ankit Joshi', pickupLocation: 'Raisen Village', dropLocation: 'Community Care Hospital, Raisen', date: today, duration: '18 min', driverName: 'Suresh Yadav', vehicleNo: 'MP-04-CD-5678' },
        { id: 'HIST-003', patientName: 'Lakshmi Bai', pickupLocation: 'Hoshangabad Road', dropLocation: 'Lifeline Trauma Center', date: yesterday, duration: '42 min', driverName: 'Mohammed Ali', vehicleNo: 'MP-04-EF-9012' },
        { id: 'HIST-004', patientName: 'Dinesh Tiwari', pickupLocation: 'Vidisha Bus Stand', dropLocation: 'Apollo Rural Clinic, Vidisha', date: yesterday, duration: '15 min', driverName: 'Prakash Singh', vehicleNo: 'MP-04-IJ-7890' },
        { id: 'HIST-005', patientName: 'Kavita Sharma', pickupLocation: 'Sehore Market', dropLocation: 'MP Institute of Medical Sciences', date: twoDaysAgo, duration: '22 min', driverName: 'Ravi Kumar', vehicleNo: 'MP-04-AB-1234' },
        { id: 'HIST-006', patientName: 'Brijesh Mishra', pickupLocation: 'Ashta Town', dropLocation: 'District Medical Center, Indore', date: twoDaysAgo, duration: '55 min', driverName: 'Anil Verma', vehicleNo: 'MP-04-GH-3456' },
    ];

    return { fleet, requests, history };
}

// ───── Helpers ───────────────────────────────────────────────────────────────

function getAmbulanceData() {
    try {
        const raw = localStorage.getItem(AMBULANCE_DATA_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveAmbulanceData(data) {
    localStorage.setItem(AMBULANCE_DATA_KEY, JSON.stringify(data));
}

function seedIfNeeded() {
    // Always re-seed to ensure real-time timestamps
    const data = buildSeedData();
    saveAmbulanceData(data);
    return data;
}

// ───── Main Page ─────────────────────────────────────────────────────────────

const AmbulancePage = ({ activeView = 'dashboard' }) => {
    const { user } = useAuth();
    const [data, setData] = useState({ fleet: [], requests: [], history: [] });

    useEffect(() => {
        const loaded = seedIfNeeded();
        setData(loaded);
    }, []);

    const handleAcceptRequest = (requestId) => {
        const updated = { ...data };
        const reqIndex = updated.requests.findIndex(r => r.id === requestId);
        if (reqIndex === -1) return;

        const req = updated.requests[reqIndex];

        // Smart dispatch: pick closest available ambulance
        const best = findBestAmbulance(updated.fleet, req.pickupLocation);
        if (!best) return; // No ambulance available
        const availableAmb = best.ambulance;
        const arrivalTime = best.travelTime;

        // ETA = travel time to pickup + ~15 min on-scene + travel to drop
        const etaMin = arrivalTime + 15;
        const now = new Date();
        const freeAt = new Date(now.getTime() + (etaMin + 10) * 60000);
        const freeAtStr = freeAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const departedStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        const historyEntry = {
            id: `HIST-${Date.now()}`,
            patientName: req.patientName,
            pickupLocation: req.pickupLocation,
            dropLocation: req.dropLocation,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            duration: `${etaMin} min`,
            driverName: availableAmb.driverName,
            vehicleNo: availableAmb.vehicleNo,
        };

        // Update ambulance to on mission with ETA
        const ambIndex = updated.fleet.findIndex(a => a.id === availableAmb.id);
        updated.fleet[ambIndex] = {
            ...availableAmb,
            status: 'On Mission',
            etaMinutes: etaMin,
            estimatedFreeAt: freeAtStr,
            departedAt: departedStr,
            progress: 10,
            missionPickup: req.pickupLocation,
            missionDrop: req.dropLocation,
        };

        updated.requests[reqIndex] = { ...req, status: 'Accepted', assignedVehicle: availableAmb.vehicleNo };
        updated.history = [historyEntry, ...updated.history];

        saveAmbulanceData(updated);
        setData({ ...updated });
    };

    const pendingCount = data.requests.filter(r => r.status === 'Pending').length;
    const availableCount = data.fleet.filter(a => a.status === 'Available').length;
    const onMissionCount = data.fleet.filter(a => a.status === 'On Mission').length;

    // ─── ACTIVE MISSIONS VIEW ────────────────────────────────────────────
    if (activeView === 'active') {
        return <ActiveMissions fleet={data.fleet} requests={data.requests} />;
    }

    // ─── HISTORY VIEW ────────────────────────────────────────────────────
    if (activeView === 'history') {
        return (
            <div className="max-w-7xl mx-auto pb-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-healix-teal to-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-healix-navy leading-tight">Transport History</h1>
                        <p className="text-sm font-medium text-slate-400">Complete log of all ambulance transports</p>
                    </div>
                </div>
                <AmbulanceHistory history={data.history} />
            </div>
        );
    }

    // ─── DASHBOARD / CONTROL CENTER VIEW ─────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-healix-navy to-healix-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Truck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-healix-navy leading-tight">Ambulance Control Center</h1>
                        <p className="text-sm font-medium text-slate-400">Manage fleet, dispatch, and transport requests</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-soft flex items-center gap-3">
                        <div className="w-2 h-2 bg-healix-teal rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-healix-navy tracking-tight uppercase">System Online</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Pending Requests', value: pendingCount, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'Fleet Available', value: `${availableCount}/${data.fleet.length}`, icon: Truck, color: 'text-healix-blue', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'On Mission', value: onMissionCount, icon: MapPin, color: 'text-healix-teal', bg: 'bg-teal-50', border: 'border-teal-100' },
                    { label: 'Total Transports', value: data.history.length, icon: Activity, color: 'text-healix-navy', bg: 'bg-slate-50', border: 'border-slate-200' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`${stat.bg} border ${stat.border} rounded-2xl p-5 shadow-sm`}
                    >
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                        <div className="text-2xl font-black text-healix-navy">{stat.value}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AmbulanceRequests requests={data.requests} fleet={data.fleet} onAccept={handleAcceptRequest} />
                </div>

                <div className="space-y-6">
                    <AmbulanceFleet fleet={data.fleet} />

                    {/* Support Card */}
                    <div className="bg-gradient-to-br from-healix-navy to-healix-blue rounded-2xl p-6 text-white shadow-lg">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Emergency Support</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-medium opacity-80">Command Center</div>
                                <div className="text-lg font-bold text-white">1800-419-8666</div>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-bold transition-all border border-white/20">
                            Emergency Protocols
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmbulancePage;
