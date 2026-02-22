import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, CheckCircle2, PhoneCall, Star, Clock, Beaker, Plus, X, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../Layout/PublicNavbar';
import { mockLabsData } from '../../data/mockRuralData';
import { getAccurateDistance } from '../../utils/distanceCalculator';
import { useAuth } from '../../context/AuthContext';

const LabDirectory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('healixLocation') || 'Samrala');
    const locations = Object.keys(mockLabsData);

    // AI Lab Planner State
    const [selectedTests, setSelectedTests] = useState([]);
    const [searchedTests, setSearchedTests] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const localLabs = mockLabsData[selectedLocation] || [];

    // Process distances
    const labs = useMemo(() => {
        return localLabs.map(l => {
            const accurateDistanceString = getAccurateDistance(selectedLocation, l);
            const numericDistance = parseFloat(accurateDistanceString.replace(/[^\d.-]/g, ''));
            return {
                ...l,
                calculatedDistance: numericDistance,
                distance: accurateDistanceString
            };
        }).sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }, [localLabs, selectedLocation]);

    // Extract unique tests available in this region for the multi-select
    const availableTests = useMemo(() => {
        const testsSet = new Set();
        labs.forEach(lab => {
            if (lab.tests) {
                lab.tests.forEach(t => testsSet.add(t.name));
            }
        });
        return Array.from(testsSet);
    }, [labs]);

    const toggleTest = (testName) => {
        if (selectedTests.includes(testName)) {
            setSelectedTests(selectedTests.filter(t => t !== testName));
        } else {
            setSelectedTests([...selectedTests, testName]);
        }
    };

    // Calculate AI Recommendation based on searched tests
    const recommendedLab = useMemo(() => {
        if (searchedTests.length === 0) return null;

        let bestLab = null;
        let bestScore = Infinity;

        labs.forEach(lab => {
            let providedTestsCount = 0;
            let totalPrice = 0;

            searchedTests.forEach(desiredTest => {
                const testObj = lab.tests?.find(t => t.name === desiredTest);
                if (testObj) {
                    providedTestsCount++;
                    // convert '₹350' to 350
                    const price = parseFloat(testObj.price.replace(/[^\d.-]/g, ''));
                    totalPrice += price;
                }
            });

            // If lab provides at least one requested test
            if (providedTestsCount > 0) {
                // Score metric: Lower is better. 
                // We penalize missing tests heavily.
                // We balance Price (40%), Distance (20%), and Rating (40%).
                const missingTestsPenalty = (searchedTests.length - providedTestsCount) * 50000;

                // Weights and normalization
                const priceScore = totalPrice * 0.4;
                const distanceScore = (lab.calculatedDistance * 10) * 0.2;
                const ratingBonus = (lab.rating * 100) * 0.4; // Subtracting bonus because lower is better

                const score = priceScore + distanceScore + missingTestsPenalty - ratingBonus;

                if (score < bestScore) {
                    bestScore = score;
                    bestLab = {
                        ...lab,
                        totalEstimatedPrice: totalPrice,
                        providedTestsCount: providedTestsCount
                    };
                }
            }
        });

        return bestLab;
    }, [selectedTests, labs]);

    return (
        <div className="min-h-screen bg-medical-gray flex flex-col items-center">
            <PublicNavbar selectedLocation={selectedLocation} />

            <main className="w-full max-w-5xl px-6 pt-40 pb-12 flex-1">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-healix-navy mb-4">Diagnostic Labs</h1>
                    <p className="text-gray-500">Book certified pathology and radiology tests near you.</p>
                </div>

                {/* AI Test Planner Card */}
                {availableTests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-healix-teal/20 mb-12 relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mx-10 -my-10 opacity-50 pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-6 relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-healix-blue to-teal-400 flex items-center justify-center text-white shadow-md">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-healix-navy">AI Smart Lab Planner</h2>
                                <p className="text-sm text-gray-500">Select multiple tests to find the most cost-effective lab.</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
                            <div className="relative w-full md:w-1/2">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center justify-between px-5 py-3 bg-white border border-gray-200 rounded-xl text-left font-bold text-healix-navy shadow-sm hover:border-healix-teal transition-all"
                                    title="Select the lab tests you need"
                                >
                                    <span className="truncate">
                                        {selectedTests.length > 0
                                            ? `${selectedTests.length} Test${selectedTests.length > 1 ? 's' : ''} Selected`
                                            : 'Select Tests...'}
                                    </span>
                                    <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="absolute z-20 top-auto bottom-full w-full mb-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                                        >
                                            <div className="p-2 flex flex-col gap-1">
                                                {availableTests.map((test) => {
                                                    const isSelected = selectedTests.includes(test);
                                                    return (
                                                        <button
                                                            key={test}
                                                            onClick={() => toggleTest(test)}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-left transition-colors ${isSelected ? 'bg-teal-50 text-healix-teal' : 'hover:bg-gray-50 text-gray-700'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-healix-teal border-healix-teal text-white' : 'border-gray-300'}`}>
                                                                {isSelected && <CheckCircle2 size={14} />}
                                                            </div>
                                                            <span className="flex-1">{test}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => {
                                    setSearchedTests([...selectedTests]);
                                    setIsDropdownOpen(false);
                                }}
                                disabled={selectedTests.length === 0}
                                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 flex-shrink-0 md:w-auto w-full ${selectedTests.length > 0
                                    ? 'bg-medical-dark text-white hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-0.5'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <Brain size={18} />
                                Find Best Lab
                            </button>
                        </div>

                        <AnimatePresence>
                            {searchedTests.length > 0 && recommendedLab && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: 10, height: 0 }}
                                    className="bg-teal-50 rounded-2xl p-5 border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-6 mt-4"
                                >
                                    <div>
                                        <div className="text-xs font-black tracking-widest text-teal-600 uppercase mb-1 flex items-center gap-1">
                                            <SparklesIcon /> AI Top Recommendation
                                        </div>
                                        <h3 className="text-xl font-bold text-medical-dark">{recommendedLab.name}</h3>
                                        <div className="text-sm text-gray-600 mt-1 font-medium">
                                            Offers {recommendedLab.providedTestsCount} of {searchedTests.length} searched test{searchedTests.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="text-right flex-1 md:flex-none">
                                            <div className="text-xs text-gray-500 font-bold uppercase">Estimated Cost</div>
                                            <div className="text-2xl font-black text-healix-teal">₹{recommendedLab.totalEstimatedPrice}</div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/lab/${recommendedLab.id}`)}
                                            className="bg-medical-dark hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md flex-shrink-0"
                                        >
                                            View Lab
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Lab Grid */}
                <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">All Affiliated Labs ({labs.length})</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {labs.map(lab => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={lab.id}
                            className={`bg-white rounded-[24px] p-6 shadow-soft hover:shadow-xl transition-shadow border cursor-pointer ${recommendedLab?.id === lab.id ? 'border-healix-teal ring-2 ring-teal-50' : 'border-gray-100'
                                }`}
                            onClick={() => navigate(`/lab/${lab.id}`)}
                        >
                            <div className="flex gap-4">
                                <img src={lab.image} alt={lab.name} className="w-24 h-24 object-cover rounded-[16px]" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-healix-navy">{lab.name}</h3>
                                    <div className="text-xs text-gray-400 font-bold mb-2 flex items-center gap-1"><MapPin size={12} /> {lab.distance} away</div>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold mb-3">
                                        <Star fill="currentColor" size={14} /> {lab.rating}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                        <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md flex items-center gap-1"><Clock size={12} /> {lab.hours}</span>
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md flex items-center gap-1"><Beaker size={12} /> {lab.tests ? lab.tests.length : 0} Tests Configured</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

export default LabDirectory;
