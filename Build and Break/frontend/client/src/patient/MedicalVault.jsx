import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileBox, Download, Trash2, FileText, Activity, AlertCircle, CheckCircle2, MoreVertical, Search, Filter } from 'lucide-react';
import patientService from './services/patientService';
import { useNotification } from '../context/NotificationContext';

const MedicalVault = () => {
    const { addNotification: notify } = useNotification();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const data = await patientService.getVaultFiles();
            setFiles(data);
        } catch (err) {
            console.error('Error fetching files:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteFile = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file permanently?')) return;
        try {
            await patientService.deleteFile(id);
            notify('Document permanently removed', 'success');
            fetchFiles();
        } catch (err) {
            notify('Failed to delete document', 'error');
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const mt = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + mt[i];
    };

    const filteredFiles = files.filter(f =>
        f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
        >
            {/* Desktop Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 shadow-medical ring-4 ring-emerald-600/5">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark tracking-tight">Medical Vault</h1>
                        <p className="text-gray-400 font-medium text-sm">Secure, encrypted storage for your clinical reports</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find clinical documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-medical-gray focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all text-sm font-medium bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">

                <div className="space-y-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Recent Documents</p>
                    {filteredFiles.length === 0 ? (
                        <div className="medical-card p-20 text-center border-2 border-dashed border-medical-gray">
                            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-medical-dark mb-2">The Vault is Empty</h3>
                            <p className="text-gray-400 font-medium">Contact your healthcare provider if you expect documents here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredFiles.map((file, idx) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="medical-card p-5 group"
                                >
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-medical-dark text-sm truncate" title={file.originalName}>
                                                {file.originalName}
                                            </h4>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                                                <span>{formatSize(file.fileSize)}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <a
                                                href={`/api/patient/download/${file.id}`}
                                                download
                                                className="p-2.5 text-emerald-600 bg-emerald-50 rounded-xl active:bg-emerald-600 active:text-white transition-all shadow-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-2.5 text-red-500 bg-red-50 rounded-xl active:bg-red-500 active:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MedicalVault;
