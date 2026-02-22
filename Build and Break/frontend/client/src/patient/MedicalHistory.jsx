import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Activity, User, Building2, Pill, TrendingUp,
    Calendar, AlertCircle, Clock, ChevronDown, ChevronUp, MapPin,
    Phone, Mail, Award, GraduationCap, Briefcase
} from 'lucide-react';

const MedicalHistory = () => {
    const [expandedDoctor, setExpandedDoctor] = useState(false);

    // Structured Mock Data for Clinical History
    const historyData = {
        diagnosis: {
            condition: 'Chronic Hypertensive Heart Disease',
            date: 'October 12, 2023',
            severity: 'Moderate',
            severityColor: 'text-amber-600 bg-amber-50'
        },
        treatment: {
            type: 'Combination Therapy & Lifestyle Management',
            procedures: 'Electrocardiogram (ECG), Echocardiogram',
            duration: 'Ongoing (4 Months)',
            recoveryPercentage: 65,
            lastUpdate: 'February 15, 2024'
        },
        doctor: {
            name: 'Dr. Arjun Mehta',
            specialization: 'Senior Cardiologist',
            qualification: 'MBBS, MD (Cardiology), DM (Interventional Cardiology)',
            hospital: 'City Life Super Speciality Hospital',
            contact: '+91 98765 43210',
            email: 'arjun.mehta@citylife.com',
            experience: '15+ Years',
            fullBio: 'Specializes in interventional cardiology and chronic disease management. Recognized for excellence in patient care and cardiac rehabilitation.'
        },
        hospital: {
            name: 'City Life Super Speciality Hospital',
            location: 'Sector 42, Metro City, North Region',
            type: 'Private',
            department: 'Cardiac Sciences & Rehabilitation'
        },
        medications: [
            { id: 1, name: 'Amlodipine 5mg', dosage: '1 Tablet', duration: '90 Days', frequency: 'Once Daily (Night)', status: 'Ongoing' },
            { id: 2, name: 'Atorvastatin 20mg', dosage: '1 Tablet', duration: 'Ongoing', frequency: 'Once Daily (Night)', status: 'Ongoing' },
            { id: 3, name: 'Telmisartan 40mg', dosage: '1 Tablet', duration: '30 Days', frequency: 'Once Daily (Morning)', status: 'Completed' }
        ]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-6 pb-12"
        >
            {/* Page Header */}
            <div className="flex items-center gap-5 px-2">
                <div className="w-14 h-14 bg-healix-blue/10 rounded-2xl flex items-center justify-center text-healix-blue shadow-medical ring-4 ring-healix-blue/5">
                    <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Medical History</h1>
                    <p className="text-gray-400 font-medium text-sm">Comprehensive clinical records and recovery tracking</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Diagnosis Section */}
                <motion.section variants={cardVariants} className="medical-card p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest">Diagnosis Details</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Condition</p>
                            <p className="text-base font-bold text-medical-dark">{historyData.diagnosis.condition}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diagnosis Date</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-medical-dark">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {historyData.diagnosis.date}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Severity Level</p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${historyData.diagnosis.severityColor}`}>
                                    {historyData.diagnosis.severity}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 2. Treatment Details */}
                <motion.section variants={cardVariants} className="medical-card p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-healix-blue/5 rounded-xl flex items-center justify-center text-healix-blue">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest">Treatment Plan</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type of Treatment</p>
                            <p className="text-sm font-bold text-medical-dark">{historyData.treatment.type}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Procedures Done</p>
                            <p className="text-xs font-semibold text-gray-500 leading-relaxed">{historyData.treatment.procedures}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-medical-dark">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {historyData.treatment.duration}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 3. Doctor Information */}
                <motion.section variants={cardVariants} className="medical-card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest">Attending Specialist</h3>
                        </div>
                        <button
                            onClick={() => setExpandedDoctor(!expandedDoctor)}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                        >
                            {expandedDoctor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>
                    <div className="mt-4 flex flex-col md:flex-row gap-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                            <Award className="w-10 h-10" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-medical-dark">{historyData.doctor.name}</h4>
                                    <p className="text-sm font-semibold text-emerald-600">{historyData.doctor.specialization}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <a href={`tel:${historyData.doctor.contact}`} className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 text-gray-500 rounded-xl text-xs font-bold transition-all">
                                        <Phone className="w-3.5 h-3.5" /> Call
                                    </a>
                                    <a href={`mailto:${historyData.doctor.email}`} className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 rounded-xl text-xs font-bold transition-all">
                                        <Mail className="w-3.5 h-3.5" /> Email
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    <p className="text-xs font-semibold text-gray-500 truncate">{historyData.doctor.qualification}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    <p className="text-xs font-semibold text-gray-500">Exp: {historyData.doctor.experience}</p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedDoctor && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 border-t border-gray-50 mt-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hospital Affiliation</p>
                                            <p className="text-xs font-bold text-medical-dark mb-4">{historyData.doctor.hospital}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Professional Summary</p>
                                            <p className="text-xs font-medium text-gray-500 leading-relaxed italic">
                                                "{historyData.doctor.fullBio}"
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.section>

                {/* 4. Hospital Info */}
                <motion.section variants={cardVariants} className="medical-card p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest">Medical Facility</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-base font-bold text-medical-dark">{historyData.hospital.name}</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {historyData.hospital.location}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Facility Type</p>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {historyData.hospital.type}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                <p className="text-xs font-bold text-medical-dark">{historyData.hospital.department}</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 5. Medication Details */}
                <motion.section variants={cardVariants} className="medical-card p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <Pill className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest">Prescribed Medications</h3>
                    </div>
                    <div className="space-y-3">
                        {historyData.medications.map((med) => (
                            <div key={med.id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-bold text-medical-dark truncate">{med.name}</h5>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-bold">
                                        <span>{med.dosage}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>{med.frequency}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${med.status === 'Ongoing' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'}`}>
                                        {med.status}
                                    </span>
                                    <p className="text-[9px] font-bold text-gray-400 mt-1">{med.duration}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* 6. Recovery Tracking */}
                <motion.section variants={cardVariants} className="medical-card p-8 lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-medical-dark">Recovery Milestone</h3>
                                <p className="text-sm font-semibold text-gray-400">Current progress toward health goals</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 px-6 py-4 rounded-[24px] text-center border border-emerald-100 ring-8 ring-emerald-50/20">
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em] mb-1">Status</p>
                            <p className="text-2xl font-black text-emerald-900">{historyData.treatment.recoveryPercentage}%</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${historyData.treatment.recoveryPercentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-teal-400 via-emerald-500 to-healix-teal rounded-full relative"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_4s_ease-in-out_infinite]" />
                            </motion.div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Treatment Started</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Last Updated:</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{historyData.treatment.lastUpdate}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target 100%</span>
                        </div>
                    </div>
                </motion.section>

            </div>
        </motion.div>
    );
};

export default MedicalHistory;
