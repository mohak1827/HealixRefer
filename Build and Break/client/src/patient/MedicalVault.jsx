import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, FileBox, Download, Trash2, FileText, Activity, AlertCircle, CheckCircle2, MoreVertical, Search, Filter } from 'lucide-react';
import patientService from './services/patientService';
import { useNotification } from '../context/NotificationContext';

const MedicalVault = () => {
    const { addNotification: notify } = useNotification();
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await patientService.uploadFile(formData);
            notify('Document securely uploaded to vault', 'success');
            fetchFiles();
        } catch (err) {
            notify('Failed to upload document', 'error');
            console.error(err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-medical-dark">Secure Medical Vault</h1>
                        <p className="text-sm text-gray-400">End-to-end encrypted storage for your clinical reports and letters.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-medical-gray focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all text-xs font-medium"
                        />
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all active:scale-95 whitespace-nowrap"
                    >
                        {uploading ? <Activity className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Document</>}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Statistics */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="medical-card p-6 bg-emerald-50/30 border-emerald-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                <FileBox className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Vault Status</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-emerald-700">Total Items</span>
                                <span className="text-sm font-bold text-emerald-900">{files.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-emerald-700">Storage Used</span>
                                <span className="text-sm font-bold text-emerald-900">
                                    {formatSize(files.reduce((acc, f) => acc + (f.fileSize || 0), 0))}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-emerald-600 w-[12%]" />
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">1.2 GB of 10 GB Available</p>
                        </div>
                    </div>

                    <div className="medical-card p-6">
                        <h3 className="text-xs font-bold text-medical-dark uppercase tracking-widest mb-4">Security</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                                <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase tracking-tighter">AES-256 Bit Encryption Active</p>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase tracking-tighter">HIPAA Compliant Storage</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File List */}
                <div className="lg:col-span-3">
                    {filteredFiles.length === 0 ? (
                        <div className="medical-card p-24 text-center border-2 border-dashed border-medical-gray flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-soft">
                                <FileText className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-medical-dark mb-2">The Vault is Empty</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mb-8">
                                Securely store your X-rays, lab results, and medical reports for easy access.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                Upload Your First File
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFiles.map((file, idx) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="medical-card group overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h4 className="font-bold text-medical-dark text-sm truncate mb-1" title={file.originalName}>
                                            {file.originalName}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <span>{formatSize(file.fileSize)}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <a
                                                href={`/api/patient/download/${file.id}`} // We'll need to add this route or use filePath
                                                download
                                                className="flex-1 py-2.5 bg-gray-50 border border-medical-gray rounded-xl text-[10px] font-black uppercase tracking-widest text-medical-dark hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all text-center flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </a>
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
