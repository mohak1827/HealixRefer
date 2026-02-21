import React from 'react';
import { User, MapPin, Phone, Heart } from 'lucide-react';

const SummaryCard = ({ user, onEdit }) => {
    return (
        <div className="medical-card p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-medical-blue/5 -mr-8 -mt-8 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-sm font-bold text-medical-dark uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-medical-blue" /> Patient Profile
                </h3>
                <button
                    onClick={() => onEdit && onEdit()}
                    className="text-[10px] font-black uppercase tracking-widest text-medical-blue hover:underline"
                >
                    Edit
                </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-medical-gray/30 rounded-2xl border border-medical-gray/50 mb-6">
                <div className="w-14 h-14 bg-white rounded-xl shadow-soft flex items-center justify-center text-medical-blue font-bold text-xl">
                    {user?.name?.[0] || 'P'}
                </div>
                <div>
                    <div className="text-lg font-bold text-medical-dark">{user?.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Health ID: HX-{(user?.id || '000').slice(-4)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                    { icon: Heart, label: 'Age', value: `${user?.age || '--'} Years` },
                    { icon: MapPin, label: 'Village', value: user?.village || 'Not specified' },
                    { icon: Phone, label: 'Contact', value: user?.contact || 'Not linked' }
                ].map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-medical-gray rounded-xl hover:border-medical-blue/20 transition-all group">
                        <div className="flex items-center gap-3">
                            <f.icon className="w-4 h-4 text-gray-300 group-hover:text-medical-blue transition-colors" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{f.label}</span>
                        </div>
                        <span className="text-xs font-bold text-medical-dark">{f.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SummaryCard;
