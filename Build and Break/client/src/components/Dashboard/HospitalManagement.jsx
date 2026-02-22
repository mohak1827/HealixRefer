import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Activity, Bed, Clock, Bell, Search, Filter,
    MoreVertical, XCircle, Edit, Trash2, Calendar, Phone, Mail,
    Stethoscope, User, Shield, AlertTriangle, Heart, UserPlus,
    ChevronRight, CheckCircle2, Plus, Zap, Droplets
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
        ],
        complianceItems: [
            { id: 'C1', label: 'Sanitization Cycle', status: 'Completed', detail: '14m ago', statusType: 'success' },
            { id: 'C2', label: 'Emergency Power', status: 'Optimal', detail: '100%', statusType: 'success' },
            { id: 'C3', label: 'O2 Reserve', status: 'Critical', detail: 'High Load', statusType: 'error' }
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
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [doctorToDelete, setDoctorToDelete] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        diagnosis: '',
        status: 'Admitted',
        doctorName: ''
    });
    const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
    const [editingComplianceItem, setEditingComplianceItem] = useState(null);
    const [complianceFormData, setComplianceFormData] = useState({
        label: '',
        status: '',
        detail: '',
        statusType: 'success'
    });
    const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
    const [editingWard, setEditingWard] = useState(null);
    const [wardFormData, setWardFormData] = useState({
        name: '',
        occupied: 0,
        total: 100
    });
    const [doctorFormData, setDoctorFormData] = useState({
        name: '',
        specialization: '',
        workload: 0
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


    const handleUpdateAvailability = (doctorId, newStatus) => {
        try {
            const allDoctors = JSON.parse(localStorage.getItem('healix_doctors') || '[]');
            const updatedDoctors = allDoctors.map(d =>
                (d.id === doctorId || d._id === doctorId) ? { ...d, availability: newStatus } : d
            );
            localStorage.setItem('healix_doctors', JSON.stringify(updatedDoctors));
            setDoctors(updatedDoctors);
            notify(`Staff status updated to ${newStatus} `, 'success');
        } catch (err) {
            notify('Failed to update status', 'error');
        }
    };

    const handleAddDoctor = (e) => {
        e.preventDefault();
        const newDoctor = {
            id: 'D' + Math.random().toString(36).substr(2, 9),
            ...doctorFormData,
            availability: 'Available'
        };

        const updatedDoctors = [...doctors, newDoctor];
        localStorage.setItem('healix_doctors', JSON.stringify(updatedDoctors));
        setDoctors(updatedDoctors);

        // Update stats
        const updatedStats = { ...stats, activeDoctors: stats.activeDoctors + 1 };
        localStorage.setItem('healix_hospital_stats', JSON.stringify(updatedStats));
        setStats(updatedStats);

        setIsDoctorModalOpen(false);
        setDoctorFormData({ name: '', specialization: '', workload: 0 });
        notify('New physician added successfully', 'success');
    };

    const handleEditDoctor = (e) => {
        e.preventDefault();
        const updatedDoctors = doctors.map(d =>
            (d.id === editingDoctor.id || d._id === editingDoctor._id) ? { ...d, ...doctorFormData } : d
        );
        localStorage.setItem('healix_doctors', JSON.stringify(updatedDoctors));
        setDoctors(updatedDoctors);
        setIsDoctorModalOpen(false);
        setEditingDoctor(null);
        setDoctorFormData({ name: '', specialization: '', workload: 0 });
        notify('Physician details updated', 'success');
    };

    const handleDeleteDoctor = () => {
        const updatedDoctors = doctors.filter(d => d.id !== doctorToDelete.id && d._id !== doctorToDelete._id);
        localStorage.setItem('healix_doctors', JSON.stringify(updatedDoctors));
        setDoctors(updatedDoctors);

        // Update stats
        const updatedStats = { ...stats, activeDoctors: Math.max(0, stats.activeDoctors - 1) };
        localStorage.setItem('healix_hospital_stats', JSON.stringify(updatedStats));
        setStats(updatedStats);

        setIsDeleteModalOpen(false);
        setDoctorToDelete(null);
        notify('Physician record removed', 'success');
    };

    const handleEditWard = (e) => {
        e.preventDefault();
        try {
            const updatedStats = { ...stats };
            updatedStats.wardCapacity = updatedStats.wardCapacity.map(ward =>
                ward.name === editingWard.name ? {
                    ...ward,
                    occupied: parseInt(wardFormData.occupied),
                    total: parseInt(wardFormData.total)
                } : ward
            );

            // Re-calculate total available beds if needed or just save
            localStorage.setItem('healix_hospital_stats', JSON.stringify(updatedStats));
            setStats(updatedStats);
            setIsCapacityModalOpen(false);
            setEditingWard(null);
            notify('Ward capacity updated successfully', 'success');
        } catch (err) {
            notify('Failed to update capacity', 'error');
        }
    };

    const handleEditCompliance = (e) => {
        e.preventDefault();
        try {
            const updatedStats = { ...stats };
            updatedStats.complianceItems = updatedStats.complianceItems.map(item =>
                item.id === editingComplianceItem.id ? { ...complianceFormData, id: item.id } : item
            );
            localStorage.setItem('healix_hospital_stats', JSON.stringify(updatedStats));
            setStats(updatedStats);
            setIsComplianceModalOpen(false);
            setEditingComplianceItem(null);
            notify('Compliance metric updated', 'success');
        } catch (err) {
            notify('Failed to update metric', 'error');
        }
    };

    const handleAddPatient = (e) => {
        e.preventDefault();
        try {
            const newPatient = {
                id: `P${Date.now()} `,
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
        setDoctorFormData({ name: '', specialization: '', workload: 0 });
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

            {/* Stats Grid - Only on Hospital Overview */}
            {activeView === 'dashboard' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
                        <div className={`w - 12 h - 12 ${stat.bg} ${stat.color} rounded - 2xl flex items - center justify - center mb - 4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-healix-navy mb-1">{stat.value}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
            </div>}

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
                                                <span className={`px - 4 py - 1.5 rounded - full text - [10px] font - black uppercase tracking - widest ${p.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                                    p.status === 'Discharged' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-medical-green/10 text-medical-green'
                                                    } `}>
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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-healix-navy tracking-tight">Clinical Staff</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Manage hospital physicians and availability</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingDoctor(null);
                                    setDoctorFormData({ name: '', specialization: '' });
                                    setIsDoctorModalOpen(true);
                                }}
                                className="bg-healix-blue text-white px-6 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                <UserPlus className="w-4 h-4" /> ADD PHYSICIAN
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map(doctor => (
                                <motion.div
                                    key={doctor._id || doctor.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="medical-card p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-healix-blue rounded-2xl flex items-center justify-center text-white shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform">
                                                <User className="w-8 h-8 relative z-10" />
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-healix-navy truncate max-w-[140px]">{doctor.name}</h3>
                                                <p className="text-xs font-bold text-medical-teal uppercase tracking-widest">{doctor.specialization || 'Resident Specialist'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px - 3 py - 1 rounded - full text - [9px] font - black uppercase tracking - widest ${doctor.availability === 'Available' ? 'bg-medical-green text-white shadow-[0_0_10px_rgba(22,163,74,0.3)]' :
                                                doctor.availability === 'Busy' ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-gray-400 text-white shadow-[0_0_10px_rgba(156,163,175,0.3)]'
                                                } `}>
                                                {doctor.availability}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingDoctor(doctor);
                                                        setDoctorFormData({
                                                            name: doctor.name,
                                                            specialization: doctor.specialization,
                                                            workload: doctor.workload || 0
                                                        });
                                                        setIsDoctorModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-healix-blue hover:bg-healix-blue/5 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDoctorToDelete(doctor);
                                                        setIsDeleteModalOpen(true); // Reusing delete modal logic
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-healix-blue/5 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                            <span>Manual Status Control</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {['Available', 'Busy', 'Off Duty'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateAvailability(doctor._id || doctor.id, status)}
                                                    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${doctor.availability === status
                                                        ? status === 'Available' ? 'bg-medical-green text-white shadow-md' :
                                                            status === 'Busy' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-400 text-white shadow-md'
                                                        : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    {status.split(' ')[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-healix-blue/10 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-healix-blue/40" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned to {Math.floor(Math.random() * 5) + 1} Patients</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {currentView === 'capacity' && (
                    <div className="max-w-2xl">
                        <div className="medical-card p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-xl font-black text-healix-navy mb-8 flex items-center gap-3">
                                <Bed className="w-6 h-6 text-healix-blue" />
                                Resource Occupancy
                            </h3>
                            <div className="space-y-10">
                                {stats?.wardCapacity?.map(ward => (
                                    <div key={ward.name} className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-lg font-black text-healix-navy tracking-tight">{ward.name}</div>
                                                    <button
                                                        onClick={() => {
                                                            setEditingWard(ward);
                                                            setWardFormData({
                                                                name: ward.name,
                                                                occupied: ward.occupied,
                                                                total: ward.total
                                                            });
                                                            setIsCapacityModalOpen(true);
                                                        }}
                                                        className="p-1 hover:bg-healix-blue/10 rounded-lg text-healix-blue/40 hover:text-healix-blue transition-all"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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
                                                className={`h-full rounded-full ${(ward.occupied / ward.total) > 0.8 ? 'bg-red-500' : 'bg-healix-blue'} shadow-lg`}
                                            />
                                        </div>
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

            {/* Doctor Modal Overlay */}
            <AnimatePresence>
                {isDoctorModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDoctorModalOpen(false)}
                            className="absolute inset-0 bg-healix-navy/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-healix-teal/5">
                                <div>
                                    <h2 className="text-xl font-black text-healix-navy tracking-tight">
                                        {editingDoctor ? 'Update Physician' : 'Add New Physician'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        Clinical Lead Credentials
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDoctorModalOpen(false)}
                                    className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={editingDoctor ? handleEditDoctor : handleAddDoctor} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="text"
                                                value={doctorFormData.name}
                                                onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                                                placeholder="Dr. Name"
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-teal/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization</label>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                required
                                                value={doctorFormData.specialization}
                                                onChange={(e) => setDoctorFormData({ ...doctorFormData, specialization: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-10 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-teal/20 outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select Department</option>
                                                <option value="Cardiology">Cardiology</option>
                                                <option value="Neurology">Neurology</option>
                                                <option value="Orthopedics">Orthopedics</option>
                                                <option value="Emergency Medicine">Emergency Medicine</option>
                                                <option value="General Surgery">General Surgery</option>
                                                <option value="Pediatrics">Pediatrics</option>
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-healix-navy text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg hover:bg-healix-teal hover:shadow-healix-teal/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {editingDoctor ? 'UPDATE STAFF RECORD' : 'CONFIRM ADDITION'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ward Capacity Modal */}
            <AnimatePresence>
                {isCapacityModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCapacityModalOpen(false)}
                            className="absolute inset-0 bg-healix-navy/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-healix-blue/5">
                                <div>
                                    <h2 className="text-xl font-black text-healix-navy tracking-tight">Manage Ward</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{wardFormData.name}</p>
                                </div>
                                <button
                                    onClick={() => setIsCapacityModalOpen(false)}
                                    className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEditWard} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Occupied Beds</label>
                                        <div className="relative">
                                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                value={wardFormData.occupied}
                                                onChange={(e) => setWardFormData({ ...wardFormData, occupied: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Capacity</label>
                                        <div className="relative">
                                            <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                value={wardFormData.total}
                                                onChange={(e) => setWardFormData({ ...wardFormData, total: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-healix-navy text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg hover:bg-healix-blue transition-all"
                                >
                                    UPDATE CAPACITY
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Compliance Management Modal */}
            <AnimatePresence>
                {isComplianceModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsComplianceModalOpen(false)}
                            className="absolute inset-0 bg-healix-navy/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-healix-navy text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-medical-teal/20 to-transparent" />
                                <div className="relative z-10">
                                    <h2 className="text-xl font-black tracking-tight">System Compliance</h2>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Infrastructure Maintenance</p>
                                </div>
                                <button
                                    onClick={() => setIsComplianceModalOpen(false)}
                                    className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-red-400 transition-all relative z-10"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEditCompliance} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Label</label>
                                            <div className="relative">
                                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={complianceFormData.label}
                                                    onChange={(e) => setComplianceFormData({ ...complianceFormData, label: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Metric Value</label>
                                            <div className="relative">
                                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={complianceFormData.detail}
                                                    onChange={(e) => setComplianceFormData({ ...complianceFormData, detail: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                                        <div className="relative">
                                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="text"
                                                value={complianceFormData.status}
                                                onChange={(e) => setComplianceFormData({ ...complianceFormData, status: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-healix-navy focus:ring-2 focus:ring-healix-blue/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Risk Assessment</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['success', 'error'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setComplianceFormData({ ...complianceFormData, statusType: type })}
                                                    className={`py - 3 rounded - 2xl text - [10px] font - black uppercase tracking - widest transition - all border - 2 ${complianceFormData.statusType === type
                                                        ? type === 'success' ? 'bg-medical-teal/10 border-medical-teal text-medical-teal' : 'bg-red-50/50 border-red-500 text-red-500'
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                        } `}
                                                >
                                                    {type === 'success' ? 'Optimal' : 'Critical'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-healix-navy text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg hover:shadow-healix-navy/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                                    SYNC INFRASTRUCTURE
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-healix-navy/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-10 h-10 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-black text-healix-navy mb-2">Are you sure?</h2>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed px-4">
                                    You are about to permanently remove
                                    <span className="font-bold text-healix-navy mx-1">
                                        {patientToDelete?.name || doctorToDelete?.name}
                                    </span>
                                    from the system. This action cannot be undone.
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setPatientToDelete(null);
                                        setDoctorToDelete(null);
                                    }}
                                    className="flex-1 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeletePatient}
                                    className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl text-[10px] font-black hover:bg-red-600 transition-all uppercase tracking-widest shadow-lg shadow-red-200"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HospitalManagement;
