import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Shield, Bell, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: Shield, label: 'Insurance & Privacy', color: 'text-medical-blue', bg: 'bg-blue-50' },
        { icon: Bell, label: 'Notifications', color: 'text-amber-500', bg: 'bg-amber-50' },
        { icon: Settings, label: 'App Settings', color: 'text-gray-500', bg: 'bg-gray-100' },
    ];

    return (
        <div className="space-y-8 pb-24 page-transition">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <h1 className="text-2xl font-bold text-medical-dark">My Profile</h1>
                <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </div>

            {/* Profile Card */}
            <div className="medical-card p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-healix-blue/10 rounded-full flex items-center justify-center text-healix-blue text-3xl font-bold border-4 border-white shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-medical-dark">{user?.name}</h2>
                    <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-medical-blue/10 text-medical-blue rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Verified Patient
                    </span>
                </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="medical-card p-4 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Age</p>
                    <p className="text-lg font-bold text-medical-dark">{user?.age || '--'}</p>
                </div>
                <div className="medical-card p-4 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Village</p>
                    <p className="text-lg font-bold text-medical-dark truncate px-2">{user?.village || '--'}</p>
                </div>
            </div>

            {/* Settings List */}
            <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Account Settings</p>
                {menuItems.map((item, idx) => (
                    <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-medical-gray hover:bg-gray-50 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-medical-dark">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-medical-blue transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Profile;
