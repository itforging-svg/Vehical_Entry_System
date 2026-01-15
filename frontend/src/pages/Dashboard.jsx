import React, { useState, useEffect } from 'react';
import {
    LogOut, CheckCircle, XCircle, Printer, DoorOpen,
    Users, Clock, Search, Edit2, Trash2,
    Calendar, Car, User, FileText, Info, Save
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPhoto, setShowPhoto] = useState(null);

    const username = localStorage.getItem('username');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isSuperAdmin = roles.includes('superadmin');

    const fetchLogs = async (date = selectedDate) => {
        try {
            setLoading(true);
            const res = await api.get(`/entry/bydate?date=${date}`);
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(selectedDate);
    }, [selectedDate]);

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit', hour12: false,
            timeZone: 'Asia/Kolkata'
        }).format(new Date(dateStr));
    };

    const handleAction = async (id, action, additionalData = {}) => {
        try {
            if (action === 'delete') {
                if (!window.confirm("Are you sure you want to delete this record? it will be moved to history.")) return;
                await api.delete(`/entry/${id}`);
            } else {
                await api.put(`/entry/${id}/${action}`, additionalData);
            }
            fetchLogs(selectedDate);
        } catch (err) {
            alert(`Failed to ${action} entry`);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/entry/${id}`, editData);
            setEditMode(null);
            fetchLogs(selectedDate);
        } catch (err) {
            alert("Failed to update entry");
        }
    };

    const handleExit = async (id) => {
        if (!window.confirm("Confirm vehicle exit?")) return;
        try {
            await api.put(`/entry/${id}/exit`);
            fetchLogs(selectedDate);
        } catch (err) {
            alert("Failed to register exit");
        }
    };

    const getPhotoThumbnail = (photoJson) => {
        try {
            if (!photoJson) return null;
            const photos = JSON.parse(photoJson);
            return Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
        } catch (e) {
            return null;
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return log.vehicle_reg?.toLowerCase().includes(query) ||
            log.driver_name?.toLowerCase().includes(query) ||
            log.gate_pass_no?.toLowerCase().includes(query);
    });

    const stats = {
        today: logs.length,
        pending: logs.filter(l => l.approval_status === 'Pending').length,
        inside: logs.filter(l => l.status === 'In' && l.approval_status !== 'Rejected').length
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-[#0e2a63] text-white p-4 sticky top-0 z-50 shadow-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Car className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-wide">CHANDAN STEEL LTD</h1>
                            <div className="text-xs text-slate-400 uppercase tracking-widest">
                                {isSuperAdmin ? 'Super Admin Dashboard' : 'Plant Admin Portal'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <div className="text-sm font-semibold">{format(new Date(), 'EEEE, d MMM')}</div>
                            <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                System Active
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <span className="text-sm font-medium text-slate-300">👤 {username}</span>
                            <button onClick={handleLogout} className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/20 transition-all flex items-center gap-2 uppercase tracking-wide">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-8 animate-fade-in">
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Users size={64} /></div>
                        <div className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Today's Total</div>
                        <div className="text-4xl font-black">{stats.today}</div>
                        <div className="text-[10px] text-blue-100 mt-2 bg-white/20 inline-block px-2 py-0.5 rounded uppercase font-bold">Entries Found</div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Clock size={64} /></div>
                        <div className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</div>
                        <div className="text-4xl font-black">{stats.pending}</div>
                        <div className="text-[10px] text-amber-100 mt-2 bg-white/20 inline-block px-2 py-0.5 rounded uppercase font-bold">Action Required</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DoorOpen size={64} /></div>
                        <div className="text-green-100 text-xs font-bold uppercase tracking-wider mb-1">Inside Premise</div>
                        <div className="text-4xl font-black">{stats.inside}</div>
                        <div className="text-[10px] text-green-100 mt-2 bg-white/20 inline-block px-2 py-0.5 rounded uppercase font-bold">Currently In</div>
                    </div>
                </div>

                {/* Main Table Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden glass">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Vehicle Logs</h2>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by vehicle, driver or pass ID..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="p-4 pl-8">Batch / Photo</th>
                                    <th className="p-4">Vehicle Details</th>
                                    <th className="p-4">Context</th>
                                    <th className="p-4">Timing</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center pr-8">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-400 bg-white">
                                        <div className="flex flex-col items-center gap-2 animate-pulse">
                                            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Loading Logs...</span>
                                        </div>
                                    </td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan="6" className="p-20 text-center text-slate-300 bg-white">
                                        <div className="flex flex-col items-center gap-4">
                                            <FileText size={48} className="opacity-10" />
                                            <span className="text-sm font-medium">No records found for this date.</span>
                                        </div>
                                    </td></tr>
                                ) : filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="p-4 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in group-hover:border-amber-200 transition-all shadow-sm"
                                                    onClick={() => setShowPhoto(getPhotoThumbnail(log.photo_url))}
                                                >
                                                    {getPhotoThumbnail(log.photo_url) ? (
                                                        <img src={getPhotoThumbnail(log.photo_url)} alt="Vehicle" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl font-bold">🚗</div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Gate Pass</span>
                                                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{log.gate_pass_no}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {editMode === log.id ? (
                                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
                                                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                                            <div>
                                                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit Entry Details</h3>
                                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Update record information</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setEditMode(null)}
                                                                className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </div>

                                                        <div className="p-6 overflow-y-auto custom-scrollbar">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Name</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Driver Name" value={editData.driver_name} onChange={e => setEditData({ ...editData, driver_name: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Reg</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all uppercase" placeholder="Vehicle Reg" value={editData.vehicle_reg} onChange={e => setEditData({ ...editData, vehicle_reg: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transporter</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Transporter" value={editData.transporter || ''} onChange={e => setEditData({ ...editData, transporter: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License No</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="License No" value={editData.license_no || ''} onChange={e => setEditData({ ...editData, license_no: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Type</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Vehicle Type" value={editData.vehicle_type || ''} onChange={e => setEditData({ ...editData, vehicle_type: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PUC Validity</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" type="date" value={editData.puc_validity ? editData.puc_validity.split('T')[0] : ''} onChange={e => setEditData({ ...editData, puc_validity: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insurance Validity</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" type="date" value={editData.insurance_validity ? editData.insurance_validity.split('T')[0] : ''} onChange={e => setEditData({ ...editData, insurance_validity: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chassis (Last 5)</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Chassis Last 5" value={editData.chassis_last_5 || ''} onChange={e => setEditData({ ...editData, chassis_last_5: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine (Last 5)</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Engine Last 5" value={editData.engine_last_5 || ''} onChange={e => setEditData({ ...editData, engine_last_5: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material Details</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Material" value={editData.material_details || ''} onChange={e => setEditData({ ...editData, material_details: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1 md:col-span-2">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose</label>
                                                                    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Purpose" value={editData.purpose} onChange={e => setEditData({ ...editData, purpose: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1 md:col-span-2">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plant / Division</label>
                                                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer" value={editData.plant || ''} onChange={e => setEditData({ ...editData, plant: e.target.value })}>
                                                                        {['Seamless Division', 'Forging Division', 'Main Plant', 'Bright Bar', 'Flat Bar', 'Wire Plant', 'Main Plant 2 ( SMS 2 )', '40"Inch Mill'].map(p => (
                                                                            <option key={p} value={p}>{p}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                                            <button
                                                                onClick={() => setEditMode(null)}
                                                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdate(log.id)}
                                                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                                                            >
                                                                <Save size={16} /> Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User size={12} className="text-slate-400" />
                                                        <div className="font-bold text-slate-900 text-sm">{log.driver_name}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Car size={12} className="text-slate-400" />
                                                        <div className="font-mono text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase">{log.vehicle_reg}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                                    <Info size={12} className="text-blue-400" />
                                                    {log.purpose}
                                                </div>
                                                <div className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                                    Plant: {log.plant}
                                                </div>
                                                {log.material_details && (
                                                    <div className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-bold inline-block w-fit">
                                                        MAT: {log.material_details}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[9px] font-black text-slate-400 w-5">IN</div>
                                                    <div className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{formatTime(log.entry_time)}</div>
                                                </div>
                                                {log.exit_time && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[9px] font-black text-slate-300 w-5">OUT</div>
                                                        <div className="font-mono text-xs font-medium text-slate-400">{formatTime(log.exit_time)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                    ${log.status === 'In' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                    <span className={`w-1 h-1 rounded-full ${log.status === 'In' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                    {log.status === 'In' ? 'INSIDE' : 'EXITED'}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border w-fit
                                                    ${log.approval_status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        log.approval_status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-red-50 text-red-700 border-red-100'}`}>
                                                    {log.approval_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-8">
                                            <div className="flex justify-center gap-2">
                                                {editMode === log.id ? (
                                                    <>
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                            onClick={() => handleUpdate(log.id)}
                                                            title="Save Change"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                                                            onClick={() => setEditMode(null)}
                                                            title="Cancel"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-center gap-2">
                                                        {(isSuperAdmin || log.approval_status === 'Pending') && (
                                                            <button
                                                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                                onClick={() => handleAction(log.id, 'approve')}
                                                                title="Approve Entrance"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        {log.status !== 'Out' && log.approval_status !== 'Rejected' && (
                                                            <button
                                                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                                                                onClick={() => {
                                                                    const reason = window.prompt("Rejection reason:");
                                                                    if (reason) handleAction(log.id, 'reject', { reason });
                                                                }}
                                                                title="Reject Entrance"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-blue-100"
                                                            onClick={() => {
                                                                setEditMode(log.id);
                                                                setEditData({ ...log });
                                                            }}
                                                            title="Edit Log"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {isSuperAdmin && (
                                                            <button
                                                                className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-md group/del"
                                                                onClick={() => handleAction(log.id, 'delete')}
                                                                title="Soft Delete (Super Admin Only)"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                        {log.status === 'In' && log.approval_status === 'Approved' && (
                                                            <button
                                                                className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-100"
                                                                onClick={() => handleExit(log.id)}
                                                                title="Register Exit"
                                                            >
                                                                <DoorOpen size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200"
                                                            title="Print Voucher"
                                                            onClick={() => window.open(`/print/${log.id}`, '_blank')}
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Photo Modal */}
                {
                    showPhoto && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={() => setShowPhoto(null)}>
                            <div className="relative max-w-4xl w-full bg-white rounded-3xl p-2 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                                <img src={showPhoto} alt="Vehicle Full View" className="w-full h-auto rounded-2xl border border-slate-100" />
                                <button
                                    className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-all font-bold border border-slate-100"
                                    onClick={() => setShowPhoto(null)}
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
};

export default Dashboard;
