import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import logo from '../assets/logo.png';
import {
    Printer, ArrowLeft, ShieldCheck,
    Calendar, Clock, User, Car,
    MapPin, AlertOctagon, CheckCircle2, Camera
} from 'lucide-react';
import { format } from 'date-fns';

const PrintSlip = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/entry/${id}`);
                setLog(res.data);

                // Parse Photos logic
                if (res.data.photo_url) {
                    try {
                        // Check if it's already an array or needs parsing
                        const rawPhotos = res.data.photo_url;
                        const parsedPhotos = typeof rawPhotos === 'string' ? JSON.parse(rawPhotos) : rawPhotos;
                        setPhotos(Array.isArray(parsedPhotos) ? parsedPhotos : []);
                    } catch (e) {
                        console.error("Failed to parse photos:", e);
                        setPhotos([]);
                    }
                }
            } catch (err) {
                console.error("Error loading gate pass:", err);
                const msg = err.response?.data?.message || err.message;
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchLog();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing Secure Voucher...</p>
            </div>
        </div>
    );

    if (error || !log) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 max-w-md w-full animate-slide-up">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertOctagon size={40} />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2 leading-tight uppercase tracking-tight">Access Denied</h1>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                    {error ? error : "The requested gate pass record could not be found or has been revoked."}
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Back to Security Terminal
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] print:bg-white p-4 md:p-8 flex flex-col items-center">
            {/* Action Bar (Hidden in Print) */}
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-8 print:hidden animate-fade-in">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Dashboard
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-500 hover:text-slate-900 active:scale-95 transition-all"
                >
                    <Printer size={18} /> Initialize Print
                </button>
            </div>

            {/* Main Voucher Container - ENFORCED A4 DIMENSIONS */}
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-none md:rounded-[48px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full flex flex-col relative box-border">

                {/* Brand Header Section */}
                <div className="bg-[#0e2a63] p-8 flex justify-between items-center relative overflow-hidden border-b-8 border-amber-500 print:p-6 !print:bg-[#0e2a63] !print:text-white">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <ShieldCheck size={280} className="text-white" />
                    </div>

                    <div className="flex items-center gap-6 relative z-10 font-sans">
                        <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                            <img src={logo} alt="CSL Logo" className="h-16 w-auto" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none italic">
                                Gate <span className="text-amber-500">Pass</span>
                            </h1>
                            <p className="text-blue-300/60 text-[10px] font-black tracking-[0.5em] uppercase">Chandan Steel Limited</p>
                        </div>
                    </div>

                    <div className="text-right relative z-10 leading-none">
                        <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.3em] mb-2">Voucher Serial No.</p>
                        <p className="text-3xl font-black text-white font-mono tracking-tighter underline decoration-amber-500 underline-offset-8">
                            {log.gate_pass_no}
                        </p>
                    </div>
                </div>

                {/* Main Content Body */}
                <div className="p-8 print:p-6 space-y-8 flex-grow">

                    {/* Identification Grid */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User size={12} className="text-amber-500" /> Authorized Carrier
                            </label>
                            <p className="text-lg font-black text-slate-800 tracking-tight capitalize">{log.driver_name}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Car size={13} className="text-amber-500" /> Vehicle Plate
                            </label>
                            <div className="inline-block bg-slate-900 px-3 py-1 rounded-lg print:border print:border-slate-900 print:bg-transparent">
                                <p className="text-lg font-black text-white print:text-slate-900 font-mono tracking-widest uppercase">{log.vehicle_reg}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin size={12} className="text-amber-500" /> Destination Unit
                            </label>
                            <p className="text-lg font-black text-amber-600 tracking-tight underline decoration-amber-500/20 underline-offset-4">{log.plant}</p>
                        </div>
                    </div>

                    {/* Technical & Compliance Details */}
                    <div className="grid grid-cols-4 gap-4 py-6 border-y border-slate-100">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">License/ID</label>
                            <p className="text-xs font-bold text-slate-700">{log.license_no || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</label>
                            <p className="text-xs font-bold text-slate-700">{log.vehicle_type || "Commercial"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated On</label>
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <Calendar size={12} className="text-slate-300" />
                                {format(new Date(log.entry_time), 'dd MMM yyyy')}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Arrival Mark</label>
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <Clock size={12} className="text-slate-300" />
                                {format(new Date(log.entry_time), 'HH:mm:ss')}
                            </p>
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center print:bg-white print:border-slate-200">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Official Purpose</label>
                            <div className="flex gap-3">
                                <div className="mt-1"><ShieldCheck size={20} className="text-amber-500 opacity-50" /></div>
                                <p className="text-base font-black text-slate-800 leading-tight italic">"{log.purpose}"</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center print:bg-white print:border-slate-200">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Material Declaration</label>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wider">
                                {log.material_details || "No significant payload declared during entry."}
                            </p>
                        </div>
                    </div>

                    {/* CAPTURED VISUALS SECTION */}
                    {photos.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Camera size={16} className="text-amber-500" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Digital Surveillance Capture</h3>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {photos.map((photo, idx) => (
                                    <div key={idx} className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm print:border-slate-300">
                                        <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security Compliance Section */}
                    {/* Conditionally hide if we are tight on space, but try to keep it */}
                    <div className="bg-[#111827] rounded-[32px] p-6 text-white relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-black mt-auto">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-amber-500 rounded-xl text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)] print:bg-black print:text-white print:shadow-none">
                                    <ShieldCheck size={16} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.1em]">EHS Mandatory Guidelines</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {[
                                    "PPE (Helmet, Shoes) is mandatory.",
                                    "Walk only on yellow paths.",
                                    "No cameras in production.",
                                    "Stay clear of cranes/loads.",
                                    "No Smoking on premises.",
                                    "Report unsafe acts immediately.",
                                    "Validate voucher on exit.",
                                    "Park in designated zones."
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-start group">
                                        <div className="w-3 h-3 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:bg-amber-500 transition-colors print:bg-black print:text-white">
                                            <p className="text-[6px] font-black text-white">{idx + 1}</p>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 leading-tight group-hover:text-slate-200 transition-colors italic print:text-black">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compact Footer in Compliance Box */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center print:border-black/20">
                            <div className="flex items-center gap-2">
                                <AlertOctagon size={10} className="text-amber-500 print:text-black" />
                                <span className="text-[7px] text-slate-400 uppercase tracking-widest print:text-black">Emergency? Proceed to Assembly Point Alpha</span>
                            </div>
                            <p className="text-[7px] text-slate-500 uppercase tracking-[0.2em] print:text-black">Authorized Gate Control</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Tag (Hidden in Print) */}
            <p className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] print:hidden">
                Generated via CSL-VMS Automated Intelligence Terminal &copy; {new Date().getFullYear()}
            </p>

            <style type="text/css" media="print">
                {`
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        background-color: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                `}
            </style>
        </div>
    );
};

export default PrintSlip;
