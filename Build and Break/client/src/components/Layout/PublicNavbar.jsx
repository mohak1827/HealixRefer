import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, LogOut, User, MapPin } from 'lucide-react';
import { mockHospitalsData } from '../../data/mockRuralData';

const PublicNavbar = ({ selectedLocation }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLocMenu, setShowLocMenu] = useState(false);

    // Dynamic locations list based on mock data keys
    const locations = Object.keys(mockHospitalsData);

    const handleLocationSelect = (loc) => {
        localStorage.setItem('healixLocation', loc);
        setShowLocMenu(false);
        // Force reload page so local page states grab the new localStorage value
        window.location.reload();
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
        window.location.reload();
    };

    return (
        <nav className="fixed left-0 right-0 top-0 z-[100] transition-all duration-300 py-4 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { window.scrollTo(0, 0); navigate('/'); }}>
                    <div className="w-9 h-9 bg-gradient-to-br from-healix-blue to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">H</div>
                    <span className="text-xl font-bold tracking-tight text-medical-dark">Healix<span className="font-light text-healix-teal">Refer</span></span>
                </div>

                {/* Center: Location Dropdown */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <button
                            onClick={() => setShowLocMenu(!showLocMenu)}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border backdrop-blur-sm transition-colors border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm"
                        >
                            <MapPin size={16} className="text-healix-teal" />
                            <span className="text-sm font-semibold">{selectedLocation ? selectedLocation : "Select Location"}</span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showLocMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showLocMenu && (
                            <div className="absolute top-full right-0 left-0 mt-2 w-full min-w-[160px] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                {locations.map(loc => (
                                    <button
                                        key={loc}
                                        onClick={() => handleLocationSelect(loc)}
                                        className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${selectedLocation === loc ? 'text-healix-teal bg-teal-50' : 'text-gray-600 hover:bg-gray-50 hover:text-medical-dark'}`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <button onClick={() => navigate('/hospitals')} className="text-sm font-bold transition-colors text-gray-600 hover:text-healix-teal">
                        Hospitals
                    </button>
                    <button onClick={() => navigate('/labs')} className="text-sm font-bold transition-colors text-gray-600 hover:text-healix-teal">
                        Lab Tests
                    </button>
                    <button onClick={() => navigate('/history')} className="text-sm font-bold transition-colors text-gray-600 hover:text-healix-teal">
                        History
                    </button>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-medical-dark py-2 px-4 rounded-full transition-all duration-300 text-sm font-bold shadow-sm"
                            >
                                <div className="w-6 h-6 rounded-full bg-teal-100 text-healix-teal flex items-center justify-center text-xs">
                                    <User size={14} />
                                </div>
                                <span className="max-w-[100px] truncate">{user.name || 'User'}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-slate-50">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user.role}</p>
                                        <p className="text-sm font-black text-medical-dark truncate">{user.email}</p>
                                    </div>
                                    {user.role !== 'User' && (
                                        <button
                                            onClick={() => { setShowUserMenu(false); navigate('/dashboard'); }}
                                            className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-healix-teal transition-colors flex items-center gap-3"
                                        >
                                            <User size={16} /> My Dashboard
                                        </button>
                                    )}
                                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="bg-healix-teal hover:bg-teal-600 text-white py-2.5 px-6 rounded-full shadow-medical transition-all duration-300 text-sm font-bold tracking-wide">
                            Portal Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
