import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building2, ChevronDown, CheckCircle2, PhoneCall, Star, Heart, Bed, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../Layout/PublicNavbar';
import { mockHospitalsData } from '../../data/mockRuralData';
import { getAccurateDistance } from '../../utils/distanceCalculator';

const HospitalDirectory = () => {
    const navigate = useNavigate();
    const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('healixLocation') || 'Samrala');
    const locations = Object.keys(mockHospitalsData);

    // Fetch only the hospitals for the selected region
    const localHospitals = mockHospitalsData[selectedLocation] || [];

    // Ensure they still get the accurate distance formatting relative to the selected region
    const hospitals = localHospitals.map(h => {
        const accurateDistanceString = getAccurateDistance(selectedLocation, h);
        const numericDistance = parseFloat(accurateDistanceString.replace(/[^\d.-]/g, ''));
        return {
            ...h,
            calculatedDistance: numericDistance,
            distance: accurateDistanceString
        };
    }).sort((a, b) => a.calculatedDistance - b.calculatedDistance);

    return (
        <div className="min-h-screen bg-medical-gray flex flex-col items-center">
            <PublicNavbar selectedLocation={selectedLocation} />

            <main className="w-full max-w-5xl px-6 pt-40 pb-12 flex-1">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-healix-navy mb-4">Affiliated Hospitals</h1>
                    <p className="text-gray-500">Find the best healthcare facilities near you in rural Punjab.</p>
                </div>

                {/* Location Filter Dropdown */}
                <div className="flex justify-center mb-10">
                    <div className="relative w-full max-w-xs">
                        <select
                            value={selectedLocation}
                            onChange={(e) => {
                                setSelectedLocation(e.target.value);
                                localStorage.setItem('healixLocation', e.target.value);
                            }}
                            className="w-full appearance-none bg-white border border-gray-200 text-healix-navy font-bold py-3 px-5 pr-10 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-healix-teal/50 transition-all cursor-pointer"
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc} className="font-medium text-gray-700">
                                    {loc}, Punjab
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-healix-teal">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {hospitals.map(h => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={h.id}
                            className="bg-white rounded-[24px] p-6 shadow-soft hover:shadow-xl transition-shadow border border-gray-100"
                        >
                            <div className="flex gap-4">
                                <img src={h.image} alt={h.name} className="w-24 h-24 object-cover rounded-[16px]" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-healix-navy">{h.name}</h3>
                                    <div className="text-xs text-gray-400 font-bold mb-2 flex items-center gap-1"><MapPin size={12} /> {h.distance} away • {h.type}</div>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold mb-3">
                                        <Star fill="currentColor" size={14} /> {h.rating}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md flex items-center gap-1"><Bed size={12} /> {h.bedsAvailable} Beds</span>
                                        <span className="bg-teal-50 text-teal-600 px-2 py-1 rounded-md flex items-center gap-1"><Users size={12} /> {h.totalDoctors} Docs</span>
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

export default HospitalDirectory;
