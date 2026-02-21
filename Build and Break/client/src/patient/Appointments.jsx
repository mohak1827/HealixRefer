import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, User, CheckCircle2, MoreVertical, X, Sparkles, Building2, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import patientService from './services/patientService';

const Appointments = () => {
    const { addNotification: notify } = useNotification();
    const [appointments, setAppointments] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAppt, setEditingAppt] = useState(null);
    const [formData, setFormData] = useState({ hospitalId: '', hospitalName: '', date: '', time: '', type: 'Consultation' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [apptData, hospData] = await Promise.all([
                patientService.getAppointments(),
                patientService.getHospitals()
            ]);
            setAppointments(apptData);
            setHospitals(hospData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedHosp = hospitals.find(h => h.id === Number(formData.hospitalId));
            const data = {
                ...formData,
                hospitalName: selectedHosp?.name || 'Unknown Hospital'
            };

            if (editingAppt) {
                await patientService.updateAppointment(editingAppt.id, data);
                notify('Appointment updated successfully', 'success');
            } else {
                await patientService.bookAppointment(data);
                notify('Appointment successfully scheduled', 'success');
            }

            setShowModal(false);
            setEditingAppt(null);
            setFormData({ hospitalId: '', hospitalName: '', date: '', time: '', type: 'Consultation' });
            fetchData();
        } catch (err) {
            notify(`Failed to ${editingAppt ? 'update' : 'schedule'} appointment`, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await patientService.deleteAppointment(id);
            notify('Appointment cancelled', 'success');
            fetchData();
        } catch (err) {
            notify('Failed to cancel appointment', 'error');
        }
    };

    const handleEdit = (appt) => {
        setEditingAppt(appt);
        setFormData({
            hospitalId: appt.hospitalId,
            hospitalName: appt.hospitalName,
            date: appt.date,
            time: appt.time,
            type: appt.type
        });
        setShowModal(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <CalendarIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark">Clinical Appointments</h1>
                        <p className="text-sm text-gray-400">Manage your upcoming visits and clinical consultations.</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingAppt(null);
                        setFormData({ hospitalId: '', hospitalName: '', date: '', time: '', type: 'Consultation' });
                        setShowModal(true);
                    }}
                    className="px-8 py-3.5 bg-purple-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-purple-700 transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" /> Schedule New
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar View (Simplified for UI) */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
                    <div className="medical-card p-6 bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 -mr-16 -mt-16 rounded-full blur-2xl" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest">February 2026</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-4 relative z-10">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-gray-300 py-2">{d}</div>
                            ))}
                            {Array.from({ length: 28 }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = day === 21;
                                const hasAppt = appointments.some(a => new Date(a.date).getDate() === day);
                                return (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setEditingAppt(null);
                                            setFormData({ ...formData, date: `2026-02-${String(day).padStart(2, '0')}`, hospitalId: '', hospitalName: '', time: '', type: 'Consultation' });
                                            setShowModal(true);
                                        }}
                                        className={`h-10 flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative ${isSelected ? 'bg-purple-600 text-white shadow-lg scale-110 z-10' : 'text-medical-dark hover:bg-purple-50 hover:text-purple-600 cursor-pointer'}`}
                                    >
                                        {day}
                                        {hasAppt && !isSelected && (
                                            <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-6 border-t border-medical-gray flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-600 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Scheduled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Vacant</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointment List */}
                <div className="lg:col-span-8 space-y-6">
                    {appointments.length === 0 ? (
                        <div className="medical-card p-24 text-center border-2 border-dashed border-medical-gray flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-soft">
                                <Activity className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-medical-dark mb-2">No Scheduled Visits</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mb-8">
                                Stay ahead of your health. Schedule regular checkups and follow-ups with our specialists.
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-8 py-3.5 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-purple-700 transition-all active:scale-95"
                            >
                                Schedule Now
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {appointments.map((appt, idx) => (
                                <motion.div
                                    key={appt.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="medical-card group overflow-hidden"
                                >
                                    <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl text-purple-600 border border-purple-100">
                                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">
                                                    {new Date(appt.date).toLocaleDateString([], { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black leading-none">
                                                    {new Date(appt.date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-medical-dark text-lg group-hover:text-purple-600 transition-colors uppercase tracking-tight">{appt.type}</h4>
                                                    <div className="px-2 py-0.5 bg-green-50 text-medical-green text-[9px] font-black uppercase rounded-lg border border-green-100">
                                                        Confirmed
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                                        <Building2 className="w-3.5 h-3.5" /> {appt.hospitalName}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                                        <Clock className="w-3.5 h-3.5" /> {appt.time}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(appt)}
                                                className="flex-1 md:flex-none px-6 py-2.5 bg-gray-50 border border-medical-gray rounded-xl text-[10px] font-black uppercase tracking-widest text-medical-dark hover:bg-purple-600 hover:text-white hover:border-transparent transition-all"
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                onClick={() => handleDelete(appt.id)}
                                                className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-medical-dark/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="bg-purple-600 p-8 text-white relative">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-6 h-6 text-white/80" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Clinical Scheduler</span>
                                </div>
                                <h2 className="text-2xl font-bold">New Appointment</h2>
                                <p className="text-purple-100 text-sm font-medium mt-1">
                                    {editingAppt ? 'Modify your existing visit details.' : 'Select facility and time for your visit.'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Healthcare Facility</label>
                                        <select
                                            required
                                            value={formData.hospitalId}
                                            onChange={e => setFormData({ ...formData, hospitalId: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                        >
                                            <option value="">Select Hospital</option>
                                            {hospitals.map(h => (
                                                <option key={h.id} value={h.id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Preferred Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Time Slot</label>
                                            <select
                                                required
                                                value={formData.time}
                                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                            >
                                                <option value="">Select Time</option>
                                                <option value="09:00 AM">09:00 AM</option>
                                                <option value="10:30 AM">10:30 AM</option>
                                                <option value="01:00 PM">01:00 PM</option>
                                                <option value="03:30 PM">03:30 PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Visit Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Consultation', 'Follow-up', 'Diagnostic', 'Emergency'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type })}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.type === type ? 'bg-purple-600 text-white border-transparent shadow-md' : 'bg-white text-gray-400 border-medical-gray hover:border-purple-200'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingAppt(null);
                                        }}
                                        className="flex-1 py-4 border border-medical-gray rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {editingAppt ? 'Update Appointment' : 'Schedule Mission'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Appointments;
