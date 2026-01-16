import React, { useState, useEffect } from 'react';
import {
    LogOut, CheckCircle, XCircle, Printer, DoorOpen,
    Users, Clock, Search, Edit2, Trash2,
    Calendar, Car, User, FileText, Info, Save,
    ShieldAlert, ShieldCheck, Plus, AlertTriangle
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
    const [showPhoto, setShowPhoto] = useState(null); // { photos: [], index: 0 }
    const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'blacklist'
    const [blacklist, setBlacklist] = useState([]);
    const [blacklistLoading, setBlacklistLoading] = useState(false);
    const [newBlacklist, setNewBlacklist] = useState({ vehicle_no: '', reason: '' });

    const username = localStorage.getItem('username');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isSuperAdmin = roles.includes('cslsuperadmin') || roles.includes('superadmin');

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

    const fetchBlacklist = async () => {
        try {
            setBlacklistLoading(true);
            const res = await api.get('/blacklist');
            setBlacklist(res.data);
        } catch (err) {
            console.error("Failed to fetch blacklist:", err);
        } finally {
            setBlacklistLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        if (activeTab === 'blacklist' && isSuperAdmin) {
            fetchBlacklist();
        }
    }, [activeTab]);

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            // Force UTC interpretation if no timezone info is present
            let date;
            if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
                date = new Date(dateStr + 'Z');
            } else {
                date = new Date(dateStr);
            }

            // Use toLocaleTimeString for robust timezone conversion
            return date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Kolkata'
            });
        } catch (e) {
            console.error("Date formatting error:", e);
            return 'Invalid';
        }
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

    const handleAddBlacklist = async (e) => {
        e.preventDefault();
        try {
            await api.post('/blacklist', newBlacklist);
            setNewBlacklist({ vehicle_no: '', reason: '' });
            fetchBlacklist();
            alert("Vehicle blacklisted successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add to blacklist");
        }
    };

    const handleRemoveBlacklist = async (id) => {
        if (!window.confirm("Remove this vehicle from blacklist?")) return;
        try {
            await api.delete(`/blacklist/${id}`);
            fetchBlacklist();
        } catch (err) {
            alert("Failed to remove from blacklist");
        }
    };

    const handleBlacklistFromLog = async (log) => {
        const reason = window.prompt(`Blacklist vehicle ${log.vehicle_reg}?\nEnter Reason:`);
        if (!reason) return;
        try {
            await api.post('/blacklist', { vehicle_no: log.vehicle_reg, reason });
            alert(`${log.vehicle_reg} has been blacklisted.`);
            if (activeTab === 'blacklist') fetchBlacklist();
        } catch (err) {
            console.error("Blacklist Shortcut Error:", err);
            console.error("Error Response:", err.response?.data);
            alert(err.response?.data?.message || "Failed to blacklist vehicle");
        }
    };

    const getAllPhotos = (photoJson) => {
        try {
            if (!photoJson) return [];
            const photos = JSON.parse(photoJson);
            return Array.isArray(photos) ? photos : [];
        } catch (e) {
            return [];
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
        inside: logs.filter(l => l.status === 'In' && l.approval_status === 'Approved').length
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

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-[#0e2a63] text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                    >
                        <FileText size={16} /> Vehicle Logs
                    </button>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('blacklist')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'blacklist' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                        >
                            <ShieldAlert size={16} /> Blacklist
                        </button>
                    )}
                </div>

                {activeTab === 'logs' ? (
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
                                        <tr key={log.id} className={`hover:bg-slate-50/80 transition-all group ${log.is_blacklisted ? 'bg-red-50/50' : ''}`}>
                                            <td className="p-4 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in group-hover:border-amber-200 transition-all shadow-sm relative"
                                                        onClick={() => {
                                                            const photos = getAllPhotos(log.photo_url);
                                                            if (photos.length > 0) setShowPhoto({ photos, index: 0 });
                                                        }}
                                                    >
                                                        {getAllPhotos(log.photo_url).length > 0 ? (
                                                            <>
                                                                <img src={getAllPhotos(log.photo_url)[0]} alt="Vehicle" className="w-full h-full object-cover" />
                                                                {getAllPhotos(log.photo_url).length > 1 && (
                                                                    <div className="absolute bottom-0 right-0 bg-amber-500 text-[8px] font-black text-white px-1 rounded-tl-md">
                                                                        +{getAllPhotos(log.photo_url).length - 1}
                                                                    </div>
                                                                )}
                                                            </>
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
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User size={12} className="text-slate-400" />
                                                        <div className="font-bold text-slate-900 text-sm">{log.driver_name}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Car size={12} className="text-slate-400" />
                                                        <div className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded uppercase flex items-center gap-1.5 ${log.is_blacklisted ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-white text-slate-500 border-slate-200 border'}`}>
                                                            {log.is_blacklisted && <ShieldAlert size={10} className="animate-pulse" />}
                                                            {log.vehicle_reg}
                                                        </div>
                                                    </div>
                                                    {log.is_blacklisted && (
                                                        <div className="mt-1 text-[9px] font-black text-red-600 uppercase tracking-tighter flex items-center gap-1">
                                                            <AlertTriangle size={8} /> BLACKLISTED: {log.blacklist_reason || 'NO REASON'}
                                                        </div>
                                                    )}
                                                </div>
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
                                                    ${(log.status === 'In' && log.approval_status === 'Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : (log.status === 'In' && log.approval_status === 'Pending') ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                        <span className={`w-1 h-1 rounded-full ${(log.status === 'In' && log.approval_status === 'Approved') ? 'bg-emerald-500 animate-pulse' : (log.status === 'In' && log.approval_status === 'Pending') ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                                                        {log.status === 'In' ? (log.approval_status === 'Approved' ? 'INSIDE' : 'WAITING ENTRY') : 'EXITED'}
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
                                                            className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-md border-2 border-orange-300"
                                                            onClick={() => {
                                                                setEditMode(log.id);
                                                                setEditData({ ...log });
                                                            }}
                                                            title="Edit Log"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {isSuperAdmin && (
                                                            <>
                                                                <button
                                                                    className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-md group/del"
                                                                    onClick={() => handleAction(log.id, 'delete')}
                                                                    title="Soft Delete (Super Admin Only)"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                <button
                                                                    className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-md border border-white/10"
                                                                    onClick={() => handleBlacklistFromLog(log)}
                                                                    title="Blacklist Vehicle (Super Admin Only)"
                                                                >
                                                                    <ShieldAlert size={16} />
                                                                </button>
                                                            </>
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
                                                            onClick={() => window.open(`/print/${log.gate_pass_no || log.id}`, '_blank')}
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Blacklist Management */}
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                                <ShieldAlert className="text-red-500" size={24} />
                                Blacklist Management
                            </h2>

                            <form onSubmit={handleAddBlacklist} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-8 bg-red-50/50 p-6 rounded-2xl border border-red-100">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Vehicle Number</label>
                                    <input
                                        className="w-full p-3 bg-white border border-red-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase"
                                        placeholder="e.g. GJ01AB1234"
                                        required
                                        value={newBlacklist.vehicle_no}
                                        onChange={e => setNewBlacklist({ ...newBlacklist, vehicle_no: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Reason for Blacklisting</label>
                                    <input
                                        className="w-full p-3 bg-white border border-red-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        placeholder="Reason"
                                        required
                                        value={newBlacklist.reason}
                                        onChange={e => setNewBlacklist({ ...newBlacklist, reason: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="bg-red-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2">
                                    <Plus size={18} /> Blacklist Vehicle
                                </button>
                            </form>

                            <div className="overflow-hidden border border-slate-100 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="p-4 pl-6">Vehicle No</th>
                                            <th className="p-4">Reason</th>
                                            <th className="p-4">Added By</th>
                                            <th className="p-4 text-center pr-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {blacklistLoading ? (
                                            <tr><td colSpan="4" className="p-12 text-center text-slate-400">Loading...</td></tr>
                                        ) : blacklist.length === 0 ? (
                                            <tr><td colSpan="4" className="p-12 text-center text-slate-300">No vehicles blacklisted.</td></tr>
                                        ) : blacklist.map(item => (
                                            <tr key={item.id} className="hover:bg-red-50/30 transition-all">
                                                <td className="p-4 pl-6">
                                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-black uppercase">{item.vehicle_no}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                                        <AlertTriangle size={14} className="text-amber-500" />
                                                        {item.reason}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-slate-500">{item.created_by}</div>
                                                    <div className="text-[10px] text-slate-400">{format(new Date(item.created_at), 'd MMM yyyy, HH:mm')}</div>
                                                </td>
                                                <td className="p-4 text-center pr-6">
                                                    <button
                                                        onClick={() => handleRemoveBlacklist(item.id)}
                                                        className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Photo Modal */}
                {showPhoto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in" onClick={() => setShowPhoto(null)}>
                        <div className="relative max-w-4xl w-full bg-white rounded-3xl p-2 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden">
                                <img src={showPhoto.photos[showPhoto.index]} alt="Vehicle View" className="w-full h-full object-contain" />

                                {showPhoto.photos.length > 1 && (
                                    <>
                                        <button
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all"
                                            onClick={() => setShowPhoto({ ...showPhoto, index: (showPhoto.index - 1 + showPhoto.photos.length) % showPhoto.photos.length })}
                                        >
                                            <Search size={24} className="rotate-180" /> {/* Using search as a placeholder for arrow if needed, but I'll use text */}
                                            <span className="text-2xl font-bold">‹</span>
                                        </button>
                                        <button
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all"
                                            onClick={() => setShowPhoto({ ...showPhoto, index: (showPhoto.index + 1) % showPhoto.photos.length })}
                                        >
                                            <span className="text-2xl font-bold">›</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="p-4 flex justify-between items-center">
                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Sample {showPhoto.index + 1} of {showPhoto.photos.length}
                                </div>
                                <div className="flex gap-2">
                                    {showPhoto.photos.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === showPhoto.index ? 'bg-amber-500 w-6' : 'bg-slate-200'}`}
                                            onClick={() => setShowPhoto({ ...showPhoto, index: idx })}
                                        ></div>
                                    ))}
                                </div>
                                <button
                                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                    onClick={() => setShowPhoto(null)}
                                >
                                    Close Viewer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Redesigned Edit Modal - Top Level */}
            {editMode && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-slate-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                        <Edit2 size={24} />
                                    </div>
                                    Edit Entry Record
                                </h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Official Gate Pass Modification</p>
                            </div>
                            <button
                                onClick={() => setEditMode(null)}
                                className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Driver Details */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <User size={14} className="text-amber-500" /> Driver Information
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Driver Full Name</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.driver_name}
                                            onChange={e => setEditData({ ...editData, driver_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Licence Number</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.license_no || ''}
                                            onChange={e => setEditData({ ...editData, license_no: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Car size={14} className="text-amber-500" /> Vehicle Identification
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Registration Number</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all uppercase font-mono tracking-widest"
                                            value={editData.vehicle_reg}
                                            onChange={e => setEditData({ ...editData, vehicle_reg: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Vehicle Classification</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                                            value={editData.vehicle_type || ''}
                                            onChange={e => setEditData({ ...editData, vehicle_type: e.target.value })}
                                        >
                                            <option value="">Select Type</option>
                                            <optgroup label="LV (Light Vehicles)">
                                                <option value="LV - Sedan/SUV">LMV (Sedan/SUV)</option>
                                                <option value="LV - Pickup">LMV (Pickup)</option>
                                                <option value="LV - Tempo">LMV (Tempo)</option>
                                            </optgroup>
                                            <optgroup label="HV (Heavy Vehicles)">
                                                <option value="HV - Truck">HV (Truck)</option>
                                                <option value="HV - Hydra">HV (Hydra)</option>
                                                <option value="HV - JCB">HV (JCB)</option>
                                                <option value="HV - Dumper">HV (Dumper)</option>
                                                <option value="HV - Trailer">HV (Trailer)</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>

                                {/* Logistics Details */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Plant / Division</label>
                                        <select
                                            className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                                            value={editData.plant || ''}
                                            onChange={e => setEditData({ ...editData, plant: e.target.value })}
                                        >
                                            {['Seamless Division', 'Forging Division', 'Main Plant', 'Bright Bar', 'Flat Bar', 'Wire Plant', 'Main Plant 2 ( SMS 2 )', '40"Inch Mill'].map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Transporter / Party Name</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.transporter || ''}
                                            onChange={e => setEditData({ ...editData, transporter: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Technical Validity */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">PUC Validity</label>
                                        <input
                                            type="date"
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.puc_validity ? editData.puc_validity.split('T')[0] : ''}
                                            onChange={e => setEditData({ ...editData, puc_validity: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Insurance Validity</label>
                                        <input
                                            type="date"
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.insurance_validity ? editData.insurance_validity.split('T')[0] : ''}
                                            onChange={e => setEditData({ ...editData, insurance_validity: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Chassis (Last 5)</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.chassis_last_5 || ''}
                                            onChange={e => setEditData({ ...editData, chassis_last_5: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Engine (Last 5)</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.engine_last_5 || ''}
                                            onChange={e => setEditData({ ...editData, engine_last_5: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Entry Context */}
                                <div className="md:col-span-2 space-y-6 pt-4 border-t border-slate-50">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Purpose of Entry</label>
                                        <input
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            value={editData.purpose}
                                            onChange={e => setEditData({ ...editData, purpose: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Material Load Details</label>
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[100px]"
                                            value={editData.material_details || ''}
                                            onChange={e => setEditData({ ...editData, material_details: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 shadow-inner">
                            <button
                                onClick={() => setEditMode(null)}
                                className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200"
                            >
                                Discard Changes
                            </button>
                            <button
                                onClick={() => handleUpdate(editMode)}
                                className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                            >
                                <Save size={18} /> Sync & Update Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Dashboard;
