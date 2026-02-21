import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Star, Bed, Activity, ArrowRight, Building2, CheckCircle2, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import patientService from './services/patientService';
import { useNotification } from '../context/NotificationContext';

const Referrals = () => {
    const { addNotification: notify } = useNotification();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralData, setReferralData] = useState({ symptoms: '', urgency: 'Medium', specialist: 'General physician' });

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const data = await patientService.getHospitals();
            setHospitals(data);
        } catch (err) {
            console.error('Error fetching hospitals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReferral = async (e) => {
        e.preventDefault();
        if (!selectedHospital || referralLoading) return;

        setReferralLoading(true);
        try {
            await patientService.createReferral({
                hospitalId: selectedHospital.id,
                symptoms: referralData.symptoms,
                urgency: referralData.urgency,
                specialistNeeded: referralData.specialist
            });
            notify('Referral mission initiated successfully', 'success');
            setSelectedHospital(null);
            setReferralData({ symptoms: '', urgency: 'Medium', specialist: 'General physician' });
        } catch (err) {
            notify('Failed to create referral mission', 'error');
            console.error(err);
        } finally {
            setReferralLoading(false);
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="w-12 h-12 bg-medical-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Navigation className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark">Find Specialist Care</h1>
                        <p className="text-sm text-gray-400">Discover and connect with top-rated medical facilities in the network.</p>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by hospital or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-medical-gray focus:ring-4 focus:ring-medical-blue/5 focus:border-medical-blue outline-none transition-all text-sm font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {filteredHospitals.map((hospital, idx) => (
                    <motion.div
                        key={hospital.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="medical-card group hover:scale-[1.02]"
                    >
                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-medical-blue group-hover:bg-medical-blue group-hover:text-white transition-colors duration-300">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-amber-700 uppercase">4.8</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-medical-dark text-lg group-hover:text-medical-blue transition-colors line-clamp-1">{hospital.name}</h3>
                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {hospital.city} • {hospital.distance}km away
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-medical-gray/30 rounded-xl border border-medical-gray/50">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Available Beds</div>
                                    <div className="flex items-center gap-2">
                                        <Bed className="w-4 h-4 text-medical-green" />
                                        <span className="text-sm font-bold text-medical-dark">{hospital.availableBeds - hospital.reservedBeds}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-medical-gray/30 rounded-xl border border-medical-gray/50">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ambulance ETA</div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-bold text-medical-dark">{hospital.ambulanceETA}m</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedHospital(hospital)}
                                className="w-full py-4 bg-medical-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-medical-blue transition-all active:scale-95 group/btn"
                            >
                                Initiate Referral <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Referral Modal */}
            <AnimatePresence>
                {selectedHospital && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedHospital(null)} className="absolute inset-0 bg-medical-dark/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="bg-medical-blue p-8 text-white relative">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldCheck className="w-6 h-6 text-white/80" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Clinical Referral Entry</span>
                                </div>
                                <h2 className="text-2xl font-bold">Referral for {selectedHospital.name}</h2>
                                <p className="text-blue-100 text-sm font-medium mt-1">Submit your details to reserve medical resources.</p>
                            </div>

                            <form onSubmit={handleCreateReferral} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Symptoms & Condition</label>
                                    <textarea
                                        required
                                        value={referralData.symptoms}
                                        onChange={e => setReferralData({ ...referralData, symptoms: e.target.value })}
                                        placeholder="Briefly describe your current condition..."
                                        className="w-full px-5 py-4 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none transition-all h-32 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Urgency</label>
                                        <select
                                            value={referralData.urgency}
                                            onChange={e => setReferralData({ ...referralData, urgency: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none bg-white"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Specialist</label>
                                        <select
                                            value={referralData.specialist}
                                            onChange={e => setReferralData({ ...referralData, specialist: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-2xl border border-medical-gray text-sm font-medium focus:ring-2 focus:ring-medical-blue outline-none bg-white"
                                        >
                                            <option value="General physician">General Physician</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Orthopedic">Orthopedic</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedHospital(null)}
                                        className="flex-1 py-4 border border-medical-gray rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={referralLoading}
                                        className="flex-[2] py-4 bg-medical-blue text-white rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {referralLoading ? <Activity className="w-5 h-5 animate-spin" /> : 'Confirm Mission'}
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

export default Referrals;
