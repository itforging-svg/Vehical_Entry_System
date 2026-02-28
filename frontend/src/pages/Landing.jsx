import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Car, Users, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import './Landing.css';

const Landing = () => {
    const [selectedSystem, setSelectedSystem] = useState('');
    const navigate = useNavigate();

    const handleProceed = () => {
        if (selectedSystem === 'vehicle') {
            navigate('/entry');
        } else if (selectedSystem === 'visitor') {
            window.location.href = 'https://vms-antigravity.pages.dev/';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Header showBadge={false} />

            <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden glass animate-fade-in">
                    <div className="h-2 bg-amber-500 w-full"></div>

                    <div className="p-10 md:p-14 text-center">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100 shadow-inner">
                            <ShieldCheck size={32} />
                        </div>

                        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Security Gateway</h2>
                        <p className="text-slate-500 mb-10 font-medium">Please select the portal you wish to access</p>

                        <div className="space-y-4 mb-10">
                            <button
                                onClick={() => setSelectedSystem('vehicle')}
                                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${selectedSystem === 'vehicle' ? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/10' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedSystem === 'vehicle' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                    <Car size={24} />
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold text-lg ${selectedSystem === 'vehicle' ? 'text-slate-900' : 'text-slate-700'}`}>Vehicle Entry System</div>
                                    <div className="text-xs text-slate-400 font-medium">Contractors & Logistic Vehicles</div>
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedSystem('visitor')}
                                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${selectedSystem === 'visitor' ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedSystem === 'visitor' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                    <Users size={24} />
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold text-lg ${selectedSystem === 'visitor' ? 'text-slate-900' : 'text-slate-700'}`}>Visitor Management</div>
                                    <div className="text-xs text-slate-400 font-medium">Guest & Personal Entrance</div>
                                </div>
                            </button>
                        </div>

                        <button
                            className="btn-primary w-full py-5 text-lg"
                            onClick={handleProceed}
                            disabled={!selectedSystem}
                        >
                            PROCEED TO ACCESS <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center bg-white border-t border-slate-100 text-slate-400 text-sm font-medium">
                &copy; {new Date().getFullYear()} Chandan Steel Ltd. All rights reserved.
            </footer>
        </div>
    );
};

export default Landing;
