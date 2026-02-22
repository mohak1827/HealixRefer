import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building2, ChevronDown, CheckCircle2, Stethoscope, PhoneCall, Sparkles, Navigation, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../Layout/PublicNavbar';
import { useAuth } from '../../context/AuthContext';
import { punjabRuralLocations, mockHospitalsData } from '../../data/mockRuralData';
import { getAccurateDistance, calculateDistance } from '../../utils/distanceCalculator';

const specialtyKeywords = {
    "heart": "Cardiology",
    "chest": "Cardiology",
    "pain": "General Medicine",
    "fever": "General Medicine",
    "cold": "General Medicine",
    "head": "Neurology",
    "brain": "Neurology",
    "bone": "Orthopedics",
    "fracture": "Orthopedics",
    "back": "Orthopedics",
    "baby": "Pediatrics",
    "child": "Pediatrics",
    "pregnant": "Maternity",
    "delivery": "Maternity",
    "tooth": "Dentistry",
    "teeth": "Dentistry",
    "accident": "Trauma Care",
    "cut": "Emergency",
    "bleed": "Emergency",
    "surgery": "General Surgery",
    "stomach": "General Medicine",
    "breathing": "Emergency"
};



const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(''); // Force empty on load to show locating UI

    // AI Disease States
    const [diseaseInput, setDiseaseInput] = useState('');
    const [suggestedHospital, setSuggestedHospital] = useState(null);
    const [matchedSpecialty, setMatchedSpecialty] = useState('');
    const [userLocationCoords, setUserLocationCoords] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Initialize from localStorage if available, else wait for user selection
        if (!selectedLocation && localStorage.getItem('healixLocation')) {
            setSelectedLocation(localStorage.getItem('healixLocation'));
        } else if (!selectedLocation) {
            // Default to Samrala to avoid undefined state
            setSelectedLocation("Samrala");
            localStorage.setItem('healixLocation', "Samrala");
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled, selectedLocation]);

    const currentHospitals = selectedLocation ? mockHospitalsData[selectedLocation] || [] : [];

    const handleDiseaseAnalyze = () => {
        if (!user) {
            alert("Please log in to use the Healix AI Analyzer.");
            navigate('/login');
            return;
        }
        if (!diseaseInput || currentHospitals.length === 0) return;

        const words = diseaseInput.toLowerCase().split(/[\s,.-]+/);
        let foundSpecialty = "General Medicine"; // Default

        for (const word of words) {
            if (specialtyKeywords[word]) {
                foundSpecialty = specialtyKeywords[word];
                break;
            }
        }

        setMatchedSpecialty(foundSpecialty);

        let bestMatch = null;
        let alternatives = [];

        // GATHER COMPREHENSIVE GLOBAL DATASET
        let allHospitalsGlobally = [];
        Object.keys(mockHospitalsData).forEach(loc => {
            const hospAtLoc = mockHospitalsData[loc].map(h => ({ ...h, originalLocation: loc }));
            allHospitalsGlobally.push(...hospAtLoc);
        });

        // Calculate True Driving Distances for ALL hospitals globally using the active User Region
        if (selectedLocation) {
            allHospitalsGlobally = allHospitalsGlobally.map(h => {
                const accurateDistanceString = getAccurateDistance(selectedLocation, h);
                // Parse the numerical portion of the string ('52.4 km' -> 52.4) to allow for sorting
                const numericDistance = parseFloat(accurateDistanceString.replace(/[^\d.-]/g, ''));

                let score = numericDistance;

                // Penalty for no beds (massive, but keeps it on the map as an alternative)
                if (h.bedsAvailable === 0) {
                    score += 100;
                }

                // Bonus for specialty match
                if (h.specialties.includes(foundSpecialty)) {
                    score -= 30; // Willing to drive up to 30km extra for the exact specialty
                }

                // Ultimate importance for Emergency
                if ((foundSpecialty === "Emergency" || foundSpecialty === "Trauma Care") && h.specialties.includes("Emergency")) {
                    score -= 40;
                }

                return {
                    ...h,
                    calculatedDistance: numericDistance,
                    distance: accurateDistanceString, // Overwrite the mock distance with the highly accurate driving map distance
                    recommendationScore: score
                };
            }).sort((a, b) => a.recommendationScore - b.recommendationScore);
        } else {
            allHospitalsGlobally = allHospitalsGlobally.sort((a, b) => b.rating - a.rating);
        }

        // 3. Extract Best Match and Top 10 Alternatives
        bestMatch = allHospitalsGlobally[0];
        // Ensure we don't try to slice more than what exists, but try for exactly 10
        alternatives = allHospitalsGlobally.slice(1, 11);

        navigate('/recommendation', {
            state: {
                bestMatch: bestMatch,
                alternatives: alternatives,
                matchedSpecialty: foundSpecialty,
                selectedLocation: bestMatch?.originalLocation || selectedLocation || "Samrala"
            }
        });
    };

    return (
        <div className="bg-white min-h-screen font-sans overflow-x-hidden">
            {/* Navigation */}
            <PublicNavbar selectedLocation={selectedLocation} />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0 bg-[#0c5a61]">
                    <img
                        src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
                        alt="Medical Background"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f766e]/40 via-[#0e7490]/60 to-[#0c4a6e]/90" />
                    <div className="absolute inset-0 bg-[#065f46]/30 mix-blend-multiply" />
                </div>

                <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center mt-16 md:mt-24">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold tracking-[0.2em] uppercase mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14b8a6] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14b8a6]"></span>
                        </span>
                        Rural Healthcare Redefined
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mb-8"
                    >
                        <h1 className="text-[3.5rem] md:text-[5rem] font-extrabold text-white leading-[1.1] tracking-tight">
                            The Best <br /> Healthcare <br />
                            <span className="text-[#34d399] drop-shadow-lg">
                                in {selectedLocation || "Khanna"}
                            </span>
                        </h1>
                    </motion.div>

                    {/* Subtext */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="text-lg md:text-xl text-white/90 mb-12 leading-relaxed max-w-2xl font-medium mx-auto text-shadow-sm">
                            Discover top-rated hospitals instantly. Tell us your symptoms below for an AI-powered smart hospital recommendation, or book diagnostic lab tests with ease.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-full max-w-xl bg-white p-2 rounded-full shadow-2xl flex items-center pr-2 pl-6 relative mx-auto"
                    >
                        <input
                            type="text"
                            placeholder="E.g., Chest pain, fever, fracture..."
                            value={diseaseInput}
                            onChange={(e) => setDiseaseInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDiseaseAnalyze()}
                            className="flex-1 outline-none py-4 bg-transparent text-gray-800 placeholder:text-gray-400 text-lg w-full font-medium"
                        />
                        <button
                            onClick={handleDiseaseAnalyze}
                            className="bg-healix-teal hover:bg-teal-600 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-colors whitespace-nowrap tracking-wide"
                        >
                            <Sparkles size={18} /> ANALYZE
                        </button>
                    </motion.div>
                </div>

                {/* Bottom Left Watermark */}
                <div className="absolute bottom-12 left-12 md:flex items-center gap-4 text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase z-10 hidden">
                    <div className="w-16 h-[1px] bg-white/40"></div>
                    Smart Referral Infrastructure
                </div>
            </section>

            <AnimatePresence>
                {selectedLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-20"
                    >



                    </motion.div>
                )}
            </AnimatePresence>

            {/* Why Choose Us... */}
            <section className="py-24 bg-white text-medical-dark relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black mb-6">Why Choose HealixRefer?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Providing advanced, technology-driven healthcare solutions tailored for rural environments.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: '🏥', title: 'Specialized Care', desc: 'Direct access to multi-specialty and super-specialty hospitals without the city hassle.' },
                            { icon: '💊', title: 'Affordable Tests', desc: 'Find local diagnostic centers with transparent pricing right on the portal.' },
                            { icon: '🚑', title: 'Emergency Dispatch', desc: 'Seamless integration with local ambulance drivers for rapid patient transport.' },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-white shadow-soft p-10 rounded-[32px] border border-gray-100 hover:border-healix-teal hover:shadow-medical transition-all group"
                            >
                                <div className="text-5xl mb-6 bg-teal-50 w-20 h-20 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">{f.icon}</div>
                                <h3 className="text-2xl font-bold text-medical-dark mb-4">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Removed AI Modal - now redirects to /recommendation route */}

        </div>
    );
};

export default LandingPage;
