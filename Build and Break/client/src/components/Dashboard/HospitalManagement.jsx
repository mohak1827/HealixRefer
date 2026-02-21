import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Activity, Bed, Clock, Bell, Search, Filter,
    MoreVertical, Edit, Trash2, CheckCircle, XCircle,
    UserPlus, User, Heart, Shield, Stethoscope, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const INITIAL_HOSPITAL_DATA = {
    stats: {
        totalPatients: 12,
        activeDoctors: 4,
        availableBeds: 45,
        icuBeds: 8,
        wardCapacity: [
            { name: 'General Ward', occupied: 15, total: 60 },
            { name: 'ICU / Critical Care', occupied: 4, total: 8 },
            { name: 'Pediatric Wing', occupied: 8, total: 20 }
        ]
    },
    patients: [
        { id: 'P1', name: 'Aarav Mehta', age: 42, gender: 'Male', diagnosis: 'Acute Appendicitis', status: 'Admitted', assignedDoctor: { name: 'Dr. Arjun Sharma' } },
        { id: 'P2', name: 'Ishani Gupta', age: 29, gender: 'Female', diagnosis: 'Post-Op Recovery', status: 'Stable', assignedDoctor: { name: 'Dr. Priya Singh' } },
        { id: 'P3', name: 'Karan Malhotra', age: 65, gender: 'Male', diagnosis: 'Cardiac Observation', status: 'Critical', assignedDoctor: { name: 'Dr. Arjun Sharma' } }
    ],
    doctors: [
        { id: 'D1', name: 'Arjun Sharma', specialization: 'Cardiology', availability: 'Available' },
        { id: 'D2', name: 'Priya Singh', specialization: 'General Surgery', availability: 'Busy' },
        { id: 'D3', name: 'Meera Patel', specialization: 'Pediatrics', availability: 'Off Duty' }
    ],
    referrals: []
};

const HospitalManagement = ({ activeView, setActiveTab }) => {
    const { user } = useAuth();
    const { addNotification: notify } = useNotification();
    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        diagnosis: '',
        status: 'Admitted',
        doctorName: ''
    });

    // Default to 'patients' view when on the main 'dashboard' tab
    const currentView = activeView === 'dashboard' ? 'patients' : activeView;

    useEffect(() => {
        // Initialize localStorage if empty
        if (!localStorage.getItem('healix_hospital_stats')) {
            localStorage.setItem('healix_hospital_stats', JSON.stringify(INITIAL_HOSPITAL_DATA.stats));
            localStorage.setItem('healix_patients', JSON.stringify(INITIAL_HOSPITAL_DATA.patients));
            localStorage.setItem('healix_doctors', JSON.stringify(INITIAL_HOSPITAL_DATA.doctors));
            localStorage.setItem('healix_referrals', JSON.stringify(INITIAL_HOSPITAL_DATA.referrals));
        }

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = () => {
        try {
            const cachedStats = localStorage.getItem('healix_hospital_stats');
            const cachedPatients = localStorage.getItem('healix_patients');
            const cachedDoctors = localStorage.getItem('healix_doctors');
            const cachedReferrals = localStorage.getItem('healix_referrals');

            if (cachedStats) setStats(JSON.parse(cachedStats));
            if (cachedPatients) setPatients(JSON.parse(cachedPatients));
            if (cachedDoctors) setDoctors(JSON.parse(cachedDoctors));
            if (cachedReferrals) setReferrals(JSON.parse(cachedReferrals).filter(r => r.status === 'Accepted'));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvailability = (newStatus) => {
        try {
            const allDoctors = JSON.parse(localStorage.getItem('healix_doctors') || '[]');
            const updatedDoctors = allDoctors.map(d =>
                (d.id === user.id || d.name.includes(user.name)) ? { ...d, availability: newStatus } : d
            );
            localStorage.setItem('healix_doctors', JSON.stringify(updatedDoctors));
            setDoctors(updatedDoctors);
            notify(`Availability updated to ${newStatus}`, 'success');
        } catch (err) {
            notify('Failed to update availability', 'error');
        }
    };

    const handleAddPatient = (e) => {
        e.preventDefault();
        try {
            const newPatient = {
                id: `P${Date.now()}`,
                name: formData.name,
                age: parseInt(formData.age),
                gender: formData.gender,
                diagnosis: formData.diagnosis,
                status: formData.status,
                assignedDoctor: { name: formData.doctorName || 'Unassigned' }
            };

            const updatedPatients = [newPatient, ...patients];
            localStorage.setItem('healix_patients', JSON.stringify(updatedPatients));
            setPatients(updatedPatients);

            // Update stats
            const currentStats = JSON.parse(localStorage.getItem('healix_hospital_stats'));
            currentStats.totalPatients += 1;
            localStorage.setItem('healix_hospital_stats', JSON.stringify(currentStats));
            setStats(currentStats);

            setIsModalOpen(false);
            resetForm();
            notify('Patient record created successfully', 'success');
        } catch (err) {
            notify('Failed to add patient', 'error');
        }
    };

    const handleEditPatient = (e) => {
        e.preventDefault();
        try {
            const updatedPatients = patients.map(p =>
                p.id === editingPatient.id ? {
                    ...p,
                    ...formData,
                    age: parseInt(formData.age),
                    assignedDoctor: { name: formData.doctorName }
                } : p
            );
            localStorage.setItem('healix_patients', JSON.stringify(updatedPatients));
            setPatients(updatedPatients);
            setIsModalOpen(false);
            setEditingPatient(null);
            resetForm();
            notify('Patient record updated', 'success');
        } catch (err) {
            notify('Failed to update record', 'error');
        }
    };

    const handleDeleteClick = (patient) => {
        setPatientToDelete(patient);
        setIsDeleteModalOpen(true);
    };

    const confirmDeletePatient = () => {
        if (!patientToDelete) return;
        try {
            const patientId = patientToDelete.id || patientToDelete._id;
            const updatedPatients = patients.filter(p => (p.id !== patientId && p._id !== patientId));
            localStorage.setItem('healix_patients', JSON.stringify(updatedPatients));
            setPatients(updatedPatients);

            // Update stats
            const cachedStats = localStorage.getItem('healix_hospital_stats');
            if (cachedStats) {
                const currentStats = JSON.parse(cachedStats);
                currentStats.totalPatients = Math.max(0, currentStats.totalPatients - 1);
                localStorage.setItem('healix_hospital_stats', JSON.stringify(currentStats));
                setStats(currentStats);
            }

            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
            notify('Patient record deleted', 'success');
        } catch (err) {
            console.error('Delete error:', err);
            notify('Failed to delete record', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            age: '',
            gender: 'Male',
            diagnosis: '',
            status: 'Admitted',
            doctorName: ''
        });
    };

    const openAddModal = () => {
        setModalMode('add');
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (patient) => {
        setModalMode('edit');
        setEditingPatient(patient);
        setFormData({
            name: patient.name,
            age: patient.age,
            gender: patient.gender || 'Male',
            diagnosis: patient.diagnosis,
            status: patient.status,
            doctorName: patient.assignedDoctor?.name || ''
        });
        setIsModalOpen(true);
    };

    const filteredPatients = patients.filter(p =>
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'All' || p.status === statusFilter)
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-healix-navy tracking-tight mb-2">Hospital Management</h1>
                    <p className="text-gray-400 font-medium">Real-time oversight of beds, patients, and clinical staff</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-[24px] border border-healix-blue/10 shadow-soft flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</div>
                            <div className="text-xs font-bold text-medical-green uppercase tracking-wider">Operational</div>
                        </div>
                        <div className="w-3 h-3 bg-medical-green rounded-full animate-pulse shadow-[0_0_10px_rgba(22,163,74,0.4)]" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Patient Census', value: stats?.totalPatients || 0, icon: Users, color: 'text-healix-blue', bg: 'bg-healix-blue/10' },
                    { label: 'Active Doctors', value: doctors.filter(d => d.availability === 'Available').length, icon: Stethoscope, color: 'text-medical-teal', bg: 'bg-medical-teal/10' },
                    { label: 'General Beds', value: stats?.availableBeds || 0, icon: Bed, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'ICU Capacity', value: stats?.icuBeds || 0, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="medical-card p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-healix-navy mb-1">{stat.value}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Approved Referrals Notification */}
            <AnimatePresence>
                {referrals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-8 p-5 rounded-[24px] border-2 border-healix-blue/10 bg-healix-blue/[0.03] flex items-center gap-6"
                    >
                        <div className="w-12 h-12 bg-healix-blue text-white rounded-2xl flex items-center justify-center shadow-lg">
                            <Bell className="w-6 h-6 animate-bounce" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-black text-healix-navy uppercase tracking-widest mb-1">Incoming Patients</div>
                            <div className="text-gray-500 font-medium">You have {referrals.length} approved referrals en route to your facility.</div>
                        </div>
                        <button
                            onClick={() => setActiveTab('referrals')}
                            className="px-6 py-2.5 bg-healix-navy text-white text-xs font-bold rounded-full hover:scale-105 transition-all shadow-md"
                        >
                            View Queue
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
                {currentView === 'patients' && (
                    <div className="medical-card p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients or diagnosis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-healix-blue/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-white border border-healix-blue/10 rounded-2xl px-4 py-2 text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-healix-blue/20"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Admitted">Admitted</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Discharged">Discharged</option>
                                </select>
                                <button
                                    onClick={openAddModal}
                                    className="bg-healix-blue text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-md"
                                >
                                    <UserPlus className="w-4 h-4" /> ADD PATIENT
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 text-left">Patient Details</th>
                                        <th className="px-6 text-left">Diagnosis</th>
                                        <th className="px-6 text-left">Clinical Lead</th>
                                        <th className="px-6 text-left">Status</th>
                                        <th className="px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map(p => (
                                        <tr key={p._id || p.id} className="group hover:scale-[1.01] transition-all">
                                            <td className="bg-healix-blue/5 rounded-l-2xl px-6 py-4 border-l-4 border-transparent group-hover:border-healix-blue group-hover:bg-healix-blue/10 transition-all">
                                                <div className="font-bold text-healix-navy">{p.name}</div>
                                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">{p.age}y • {p.gender || 'N/A'}</div>
                                            </td>
                                            <td className="bg-healix-blue/5 px-6 py-4 group-hover:bg-healix-blue/10 transition-all">
                                                <div className="text-sm font-medium text-gray-600">{p.diagnosis || 'General Observation'}</div>
                                            </td>
                                            <td className="bg-healix-blue/5 px-6 py-4 group-hover:bg-healix-blue/10 transition-all">
                                                <div className="flex items-center gap-2 text-sm font-bold text-healix-navy">
                                                    <div className="w-8 h-8 bg-medical-teal/10 rounded-full flex items-center justify-center text-medical-teal">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    Dr. {p.assignedDoctor?.name || 'Unassigned'}
                                                </div>
                                            </td>
                                            <td className="bg-healix-blue/5 px-6 py-4 group-hover:bg-healix-blue/10 transition-all">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                                    p.status === 'Discharged' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-medical-green/10 text-medical-green'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="bg-healix-blue/5 rounded-r-2xl px-6 py-4 group-hover:bg-healix-blue/10 transition-all text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(p)}
                                                        className="p-2 text-gray-400 hover:text-healix-blue transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(p)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPatients.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching records found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'doctors' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doctor => (
                            <motion.div
                                key={doctor._id || doctor.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="medical-card p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-healix-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-healix-navy">{doctor.name}</h3>
                                            <p className="text-xs font-bold text-medical-teal uppercase tracking-widest">{doctor.specialization || 'Resident Specialist'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${doctor.availability === 'Available' ? 'bg-medical-green text-white shadow-[0_0_10px_rgba(22,163,74,0.3)]' :
                                        doctor.availability === 'Busy' ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white'
                                        }`}>
                                        {doctor.availability}
                                    </div>
                                </div>

                                <div className="bg-healix-blue/5 rounded-2xl p-4 mb-6">
                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                        <span>Current Workload</span>
                                        <span className="text-healix-navy">75% Capacity</span>
                                    </div>
                                    <div className="h-2 bg-white rounded-full overflow-hidden">
                                        <div className="h-full bg-healix-blue rounded-full w-[75%]" />
                                    </div>
                                </div>

                                {user?.id === doctor.id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateAvailability('Available')}
                                            className="flex-1 px-4 py-2 rounded-xl bg-medical-green text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                                        >
                                            Available
                                        </button>
                                        <button
                                            onClick={() => handleUpdateAvailability('Busy')}
                                            className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                                        >
                                            Busy
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {currentView === 'capacity' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="medical-card p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-xl font-black text-healix-navy mb-8 flex items-center gap-3">
                                <Bed className="w-6 h-6 text-healix-blue" />
                                Resource Occupancy
                            </h3>
                            <div className="space-y-10">
                                {stats?.wardCapacity.map(ward => (
                                    <div key={ward.name} className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-lg font-black text-healix-navy tracking-tight">{ward.name}</div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ward.total - ward.occupied} Units Available</div>
                                            </div>
                                            <div className="text-3xl font-black text-healix-navy">
                                                {Math.round((ward.occupied / ward.total) * 100)}%
                                            </div>
                                        </div>
                                        <div className="h-4 bg-healix-blue/5 rounded-full overflow-hidden p-1 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(ward.occupied / ward.total) * 100}%` }}
                                                className={`h-full rounded-full ${(ward.occupied / ward.total) > 0.8 ? 'bg-red-500' : 'bg-healix-blue'
                                                    } shadow-lg`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="medical-card p-8 bg-healix-navy text-white border-none shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-healix-blue/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                                <Shield className="w-6 h-6 text-medical-teal" />
                                Compliance & Safety
                            </h3>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: 'Sanitization Cycle', status: 'Completed', time: '14m ago' },
                                    { label: 'Emergency Power', status: 'Optimal', time: '100%' },
                                    { label: 'O2 Reserve', status: 'Critical', time: 'High Load' },
                                ].map(item => (
                                    <div key={item.label} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/10">
                                        <div>
                                            <div className="text-sm font-bold opacity-60 uppercase tracking-widest">{item.label}</div>
                                            <div className="text-xs font-black text-medical-teal mt-1">{item.status}</div>
                                        </div>
                                        <div className="text-[10px] font-bold opacity-40 uppercase">{item.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'referrals' && (
                    <div className="medical-card p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="text-xl font-black text-healix-navy mb-8 flex items-center gap-3">
                            <Bell className="w-6 h-6 text-healix-blue" />
                            Incoming Referral Queue
                        </h3>
                        <div className="space-y-4">
                            {referrals.map(ref => (
                                <div key={ref.id} className="p-4 bg-healix-blue/5 rounded-2xl border border-healix-blue/10 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-healix-navy">{ref.patientName}</div>
                                        <div className="text-xs text-gray-500">{ref.symptoms}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ref.urgency === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-healix-blue/20 text-healix-blue'}`}>
                                            {ref.urgency}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {referrals.length === 0 && (
                                <div className="py-10 text-center text-gray-400 font-bold">No active incoming referrals</div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-healix-navy/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-healix-blue/5">
                                <div>
                                    <h2 className="text-xl font-black text-healix-navy tracking-tight">
                                        {modalMode === 'add' ? 'New Patient Record' : 'Edit Patient Record'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        Fill in the clinical details below
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={modalMode === 'add' ? handleAddPatient : handleEditPatient} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                            placeholder="Aarav Mehta"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                            placeholder="42"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                        >
                                            <option value="Admitted">Admitted</option>
                                            <option value="Stable">Stable</option>
                                            <option value="Critical">Critical</option>
                                            <option value="Discharged">Discharged</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Diagnosis</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                        placeholder="Enter clinical diagnosis..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Doctor</label>
                                    <select
                                        value={formData.doctorName}
                                        onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.name}>{d.name} ({d.specialization})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-healix-navy text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-healix-blue transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        {modalMode === 'add' ? <UserPlus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                                        {modalMode === 'add' ? 'Create Record' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-healix-navy/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-black text-healix-navy mb-2">Delete Record?</h2>
                                <p className="text-sm text-gray-400 font-medium mb-8">
                                    Are you sure you want to delete <span className="text-healix-navy font-bold">{patientToDelete?.name}</span>? This action cannot be undone.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-6 py-3 rounded-2xl bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeletePatient}
                                        className="px-6 py-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 focus:outline-none"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HospitalManagement;
