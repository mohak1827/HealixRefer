import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, AlertCircle, CheckCircle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeNotification(id), 5000);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-10 right-10 z-[200] space-y-4 w-96 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <div className={`p-5 rounded-[24px] shadow-2xl border flex items-start gap-4 backdrop-blur-xl ${n.type === 'error' ? 'bg-urgent-red/10 border-urgent-red/20 text-urgent-red' :
                                    n.type === 'success' ? 'bg-med-green/10 border-med-green/20 text-med-green' :
                                        'bg-white/80 border-primary-blue/10 text-primary-blue'
                                }`}>
                                <div className="mt-1">
                                    {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
                                    {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                    {n.type === 'info' && <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold leading-tight">{n.message}</p>
                                    <p className="text-[10px] opacity-50 font-black uppercase tracking-widest mt-1">System Alert • Just Now</p>
                                </div>
                                <button onClick={() => removeNotification(n.id)} className="text-current opacity-30 hover:opacity-100 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
