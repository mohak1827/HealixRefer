import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileText, Calendar, Clock, CheckCircle2, FlaskConical, Stethoscope, ChevronRight } from 'lucide-react';
import PublicNavbar from '../Layout/PublicNavbar';

const mockHistory = {
    referrals: [
        { id: 1, date: 'Oct 12, 2025', to: 'City Heart Institute', doctor: 'Dr. Arjun Sharma', status: 'Completed', reason: 'Cardiac Evaluation' },
        { id: 2, date: 'Nov 05, 2025', to: 'Apex Orthopedics', doctor: 'Dr. Neha Verma', status: 'Pending', reason: 'Knee Joint Pain' }
    ],
    tests: [
        { id: 101, date: 'Oct 14, 2025', lab: 'Dr. Lal PathLabs', test: 'Lipid Profile', status: 'Report Available' },
        { id: 102, date: 'Nov 07, 2025', lab: 'SRL Diagnostics', test: 'X-Ray Right Knee', status: 'Scheduled' }
    ]
};

const PublicHistory = () => {
    const [selectedLocation] = useState(localStorage.getItem('healixLocation') || 'Samrala');

    return (
        <div className="min-h-screen bg-medical-gray flex flex-col">
            <PublicNavbar selectedLocation={selectedLocation} />

            <main className="w-full max-w-5xl mx-auto px-6 pt-40 pb-12 flex-1">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-black text-healix-navy mb-4">My Medical History</h1>
                    <p className="text-gray-500 text-lg">Track your past hospital referrals and booked diagnostic tests seamlessly.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Referrals Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-healix-navy">
                            <Stethoscope className="text-healix-teal" /> Hospital Referrals
                        </div>
                        <div className="space-y-4">
                            {mockHistory.referrals.map((ref, idx) => (
                                <motion.div
                                    key={ref.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-healix-navy">{ref.to}</h3>
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${ref.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {ref.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">Reason: <span className="font-medium text-gray-500">{ref.reason}</span></p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-1"><Calendar size={14} /> {ref.date}</div>
                                        <div className="flex items-center gap-1 text-healix-teal cursor-pointer hover:underline">View Details <ChevronRight size={14} /></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Lab Tests Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-healix-navy">
                            <FlaskConical className="text-healix-blue" /> Diagnostic Bookings
                        </div>
                        <div className="space-y-4">
                            {mockHistory.tests.map((test, idx) => (
                                <motion.div
                                    key={test.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-healix-navy">{test.test}</h3>
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${test.status === 'Report Available' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {test.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">Lab: <span className="font-medium text-gray-500">{test.lab}</span></p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-1"><Clock size={14} /> {test.date}</div>
                                        {test.status === 'Report Available' ? (
                                            <div className="flex items-center gap-1 text-healix-blue cursor-pointer hover:underline"><FileText size={14} /> Download Report</div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-gray-400">Awaiting Results</div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublicHistory;
