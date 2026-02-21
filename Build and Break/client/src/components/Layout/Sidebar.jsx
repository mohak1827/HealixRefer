import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, FileText, Plus, Building2, Bed, AlertTriangle,
    Truck, MapPin, Settings, LogOut, Heart, Stethoscope, User,
    Activity, History, BarChart3, CheckCircle2, Globe, Shield, Cpu, TrendingUp, Radio,
    Brain, Calendar, FileBox, Clock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENU_CONFIG = {
    'Patient': [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/patient/dashboard' },
        { id: 'ai-analysis', label: 'AI Health Analysis', icon: Brain, path: '/patient/ai-analysis' },
        { id: 'referrals', label: 'My Referrals', icon: Activity, path: '/patient/referrals' },
        { id: 'medical-vault', label: 'Medical Vault', icon: FileBox, path: '/patient/medical-vault' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
        { id: 'timeline', label: 'History Timeline', icon: Clock, path: '/patient/timeline' },
    ],
    'Doctor': [
        { id: 'dashboard', label: 'New Referral', icon: Plus },
        { id: 'history', label: 'Referral History', icon: History },
    ],
    'Hospital Admin': [
        { id: 'dashboard', label: 'Hospital Overview', icon: LayoutDashboard },
    ],
    'Ambulance': [
        { id: 'dashboard', label: 'Control Center', icon: Truck },
        { id: 'active', label: 'Active Missions', icon: Radio },
        { id: 'history', label: 'Transport History', icon: History },
    ],
    'Super Admin': [
        { id: 'dashboard', label: 'System Analytics', icon: BarChart3 },
    ],
};

const ROLE_STYLES = {
    'Patient': { color: 'text-healix-teal', bg: 'bg-teal-50', icon: Heart, label: 'Patient Portal' },
    'Doctor': { color: 'text-healix-blue', bg: 'bg-blue-50', icon: Stethoscope, label: 'Doctor Panel' },
    'Hospital Admin': { color: 'text-healix-teal', bg: 'bg-teal-50', icon: Building2, label: 'Hospital Admin' },
    'Ambulance': { color: 'text-healix-blue', bg: 'bg-blue-50', icon: Truck, label: 'Ambulance Control' },
    'Super Admin': { color: 'text-healix-navy', bg: 'bg-slate-100', icon: Shield, label: 'Health Ministry' },
};

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const menuItems = MENU_CONFIG[user?.role] || [];
    const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.Patient;
    const RoleIcon = roleStyle.icon;

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-72 fixed left-0 top-0 h-full bg-white border-r border-medical-gray flex flex-col z-50 shadow-soft"
        >
            {/* Brand */}
            <div className="p-7 border-b border-medical-gray">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-healix-navy rounded-xl flex items-center justify-center text-white font-black text-xl">
                        H
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-healix-navy">
                        Healix<span className="text-healix-teal">Refer</span>
                    </span>
                </div>
                {/* Role badge */}
                <div className={`flex items-center gap-2 px-3 py-2 ${roleStyle.bg} rounded-medical`}>
                    <RoleIcon className={`w-4 h-4 ${roleStyle.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${roleStyle.color}`}>{roleStyle.label}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-5 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Main Navigation</p>
                {menuItems.map(item => {
                    const isActive = user?.role === 'Patient' ? location.pathname === item.path : activeTab === item.id;
                    const content = (
                        <>
                            <item.icon className={`w-[20px] h-[20px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-healix-blue'} transition-colors`} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                            )}
                        </>
                    );

                    const className = `w-full flex items-center gap-3 px-4 py-3 rounded-medical text-sm font-semibold transition-all group relative ${isActive
                        ? 'bg-healix-navy text-white shadow-soft'
                        : 'text-gray-500 hover:text-healix-blue hover:bg-slate-50'
                        }`;

                    if (user?.role === 'Patient' && item.path) {
                        return (
                            <Link key={item.id} to={item.path} className={className}>
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={className}
                        >
                            {content}
                        </button>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-5 border-t border-medical-gray">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-healix-navy text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-healix-navy truncate">{user?.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
                    </div>
                </div>
                <button onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-medical text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
                    <LogOut className="w-4 h-4" /> Log Out
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
