import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, ArrowLeft, CheckCircle2, ShieldCheck, Beaker, Plus, Minus, CreditCard } from 'lucide-react';
import PublicNavbar from '../Layout/PublicNavbar';
import { mockLabsData } from '../../data/mockRuralData';

const LabDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find the lab across all locations
    const lab = useMemo(() => {
        for (const location in mockLabsData) {
            const found = mockLabsData[location].find(l => l.id === id);
            if (found) return { ...found, locationName: location };
        }
        return null;
    }, [id]);

    // Cart state for selected tests
    const [selectedTests, setSelectedTests] = useState([]);

    if (!lab) {
        return (
            <div className="min-h-screen bg-medical-gray flex flex-col items-center justify-center">
                <PublicNavbar />
                <div className="text-center mt-20">
                    <h2 className="text-2xl font-bold text-healix-navy mb-4">Lab Not Found</h2>
                    <p className="text-gray-500 mb-8">The diagnostic center you are looking for does not exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/labs')}
                        className="bg-healix-teal text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Back to Directory
                    </button>
                </div>
            </div>
        );
    }

    const toggleTest = (test) => {
        if (selectedTests.find(t => t.name === test.name)) {
            setSelectedTests(selectedTests.filter(t => t.name !== test.name));
        } else {
            setSelectedTests([...selectedTests, test]);
        }
    };

    const totalPrice = selectedTests.reduce((sum, test) => {
        const price = parseFloat(test.price.replace(/[^\d.-]/g, ''));
        return sum + price;
    }, 0);

    const isTestSelected = (testName) => {
        return selectedTests.some(t => t.name === testName);
    };

    return (
        <div className="min-h-screen bg-medical-gray pb-32">
            <PublicNavbar />

            {/* Header / Hero Section */}
            <div className="bg-white border-b border-gray-100 pt-32 pb-10 px-6">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate('/labs')}
                        className="flex items-center gap-2 text-gray-500 hover:text-healix-navy transition-colors font-bold text-sm mb-6"
                    >
                        <ArrowLeft size={16} /> Back to Labs
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <img
                            src={lab.image}
                            alt={lab.name}
                            className="w-full md:w-64 h-64 object-cover rounded-3xl shadow-lg border-4 border-white"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-teal-50 text-healix-teal px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-teal-100 flex items-center gap-1">
                                    <ShieldCheck size={14} /> Certified Lab
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-healix-navy mb-4">{lab.name}</h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                    <MapPin size={18} className="text-gray-400" />
                                    {lab.locationName} ({lab.distance} away)
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                    <Clock size={18} className="text-gray-400" />
                                    {lab.hours}
                                </div>
                                <div className="flex items-center gap-2 text-yellow-500 font-bold">
                                    <Star fill="currentColor" size={18} />
                                    {lab.rating} Rating
                                </div>
                            </div>

                            <p className="text-gray-500 leading-relaxed max-w-2xl">
                                Fully equipped diagnostic center offering advanced pathology, radiology, and imaging services with highly accurate results and certified technicians.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tests Section */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-healix-navy flex items-center gap-3">
                            <Beaker className="text-healix-teal" /> Available Tests
                        </h2>
                        <p className="text-gray-500 mt-1">Select the tests you want to book at this lab.</p>
                    </div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        {lab.tests?.length || 0} Tests
                    </div>
                </div>

                <div className="grid gap-4">
                    {lab.tests?.map((test, index) => {
                        const selected = isTestSelected(test.name);
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={index}
                                onClick={() => toggleTest(test)}
                                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md ${selected ? 'border-healix-teal ring-1 ring-healix-teal bg-teal-50/30' : 'border-gray-200 hover:border-healix-teal/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${selected ? 'bg-healix-teal border-healix-teal text-white' : 'border-gray-300 bg-gray-50'
                                        }`}>
                                        {selected && <CheckCircle2 size={14} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${selected ? 'text-healix-navy' : 'text-gray-800'}`}>
                                            {test.name}
                                        </h3>
                                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <span>Home collection available</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>Reports in 24 hrs</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-xl font-black text-healix-teal">{test.price}</div>
                                    <button
                                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${selected
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-teal-50 text-healix-teal hover:bg-teal-100'
                                            }`}
                                    >
                                        {selected ? <><Minus size={12} /> Remove</> : <><Plus size={12} /> Add Test</>}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* Sticky Bottom Bar for Booking */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: selectedTests.length > 0 ? 0 : 100 }}
                className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 p-4 md:p-6"
            >
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-12 h-12 bg-teal-50 text-healix-teal rounded-xl flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-healix-navy">₹{totalPrice}</span>
                                <span className="text-sm font-medium text-gray-500">for {selectedTests.length} tests</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full md:w-auto bg-medical-dark hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                        onClick={() => alert(`Booking flow will initialize for ₹${totalPrice}`)}
                    >
                        Book Lab Tests <ArrowLeft size={18} className="rotate-180" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LabDetails;
