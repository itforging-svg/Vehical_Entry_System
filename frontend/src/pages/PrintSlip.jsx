import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import logo from '../assets/logo.png';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const PrintSlip = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const res = await api.get(`/entry/${id}`);
                setLog(res.data);
            } catch (err) {
                console.error("Error fetching log:", err);
                alert("Failed to load gate pass details.");
            } finally {
                setLoading(false);
            }
        };
        fetchLog();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Pass...</span>
        </div>
    </div>;

    if (!log) return <div className="p-20 text-center">Pass not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-10 flex flex-col items-center">
            {/* Control Bar (Hidden during print) */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                    <Printer size={18} /> Print Voucher
                </button>
            </div>

            {/* The Slip */}
            <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-[32px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:m-0 print:w-full">
                {/* Header Section */}
                <div className="bg-[#0e2a63] p-10 flex justify-between items-start border-b-4 border-amber-500">
                    <div className="flex items-center gap-6">
                        <div className="bg-white p-3 rounded-2xl shadow-inner">
                            <img src={logo} alt="CSL Logo" className="h-16 w-auto" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-amber-500 tracking-tight leading-none mb-1 uppercase">Gate Pass Voucher</h1>
                            <p className="text-slate-400 text-xs font-bold tracking-[0.3em]">CHANDAN STEEL LIMITED</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Pass Number</div>
                        <div className="text-2xl font-black text-white font-mono tracking-tighter">{log.gate_pass_no}</div>
                    </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Left Details Column */}
                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Driver Detail */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Full Name of Driver</label>
                            <div className="text-lg font-black text-slate-800 flex items-center gap-2">
                                {log.driver_name}
                            </div>
                        </div>

                        {/* Vehicle Detail */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Vehicle Registration</label>
                            <div className="text-lg font-black text-slate-800 font-mono tracking-wider uppercase bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg inline-block">
                                {log.vehicle_reg}
                            </div>
                        </div>

                        {/* Plant Detail */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Allocated Plant</label>
                            <div className="text-lg font-black text-amber-600">
                                {log.plant}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-12 h-px bg-slate-100"></div>

                    {/* Secondary Details */}
                    <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">License ID</label>
                            <div className="text-sm font-bold text-slate-600">{log.license_no}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Classification</label>
                            <div className="text-sm font-bold text-slate-600">{log.vehicle_type}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Entry Date</label>
                            <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Calendar size={14} className="text-slate-300" />
                                {format(new Date(log.entry_time), 'dd MMM yyyy')}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Arrival Time</label>
                            <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Clock size={14} className="text-slate-300" />
                                {format(new Date(log.entry_time), 'HH:mm')}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} className="text-amber-500" /> Stated Purpose
                            </label>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                "{log.purpose}"
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material In-Load</label>
                            <p className="text-sm font-medium text-slate-500 whitespace-pre-wrap">
                                {log.material_details || "No materials declared."}
                            </p>
                        </div>
                    </div>

                    {/* Guidelines Section */}
                    <div className="md:col-span-12 mt-4">
                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <ShieldCheck size={180} />
                            </div>

                            <h3 className="text-lg font-black text-amber-500 uppercase tracking-widest mb-6 border-l-4 border-amber-500 pl-4">EHS GUIDELINES FOR VISITORS</h3>

                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[10px] font-medium text-slate-400 leading-relaxed list-disc pl-5">
                                <li>Safety Helmet, Safety Shoes and Safety Goggles are mandatory in Production areas.</li>
                                <li>Use designated Walkway / Gangway marked in Yellow Line.</li>
                                <li>Personal Mobile phones and Cameras are prohibited inside the Plant.</li>
                                <li>Do not enter any "Restricted Areas" without escort.</li>
                                <li>Be aware of overhead crane movements. Do not walk under suspended loads.</li>
                                <li>Comply with "No Tobacco Policy" across the entire premises.</li>
                                <li>Inform CSL representative prior to entry and while exiting.</li>
                                <li>Return this pass at the Security gate before leaving the premises.</li>
                            </ul>

                            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-2 max-w-sm">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider">ENVIRONMENTAL EMERGENCY</h4>
                                    <p className="text-[9px] text-slate-500 leading-tight">
                                        In case of emergency, follow the continuous siren. Exit via the nearest route and proceed to the designated assembly point immediately.
                                    </p>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="w-32 h-px bg-white/20 mb-2"></div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Authorized Signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Integrated Logistics Control • System Generated Document</p>
                </div>
            </div>

            <p className="mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest print:hidden">
                Protected by Chandan Steel Security Systems &copy; {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default PrintSlip;
