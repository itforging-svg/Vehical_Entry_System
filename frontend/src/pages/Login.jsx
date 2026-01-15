import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import './Login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/auth/signin', credentials);
            const { accessToken, roles, username, id } = res.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('roles', JSON.stringify(roles));
            localStorage.setItem('username', username);
            localStorage.setItem('userId', id);

            if (roles.includes('superadmin') || roles.includes('admin') || roles.includes('Admin')) {
                navigate('/admin/dashboard');
            } else if (roles.includes('security') || roles.includes('Security')) {
                navigate('/entry/dashboard');
            } else {
                navigate('/pool/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
            {/* Branding Panel */}
            <div className="md:w-1/2 bg-[#0e2a63] text-white p-12 md:p-20 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <ShieldCheck size={24} className="text-[#0e2a63]" />
                        </div>
                        <span className="text-xl font-black tracking-widest">CHANDAN STEEL LTD</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                        Secure <span className="text-amber-500 underline decoration-4 underline-offset-8">Vehicle</span><br />
                        Entry Management.
                    </h1>

                    <p className="text-xl text-slate-300 leading-relaxed max-w-md font-medium">
                        Enterprise-grade security and tracking for industrial facilities.
                        Monitor entries, exits, and approvals in real-time.
                    </p>

                    <div className="mt-16 flex gap-8">
                        <div>
                            <div className="text-3xl font-black text-amber-500">24/7</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring</div>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div>
                            <div className="text-3xl font-black text-amber-500">Live</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tracking</div>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div>
                            <div className="text-3xl font-black text-amber-500">100%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Encrypted</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Panel */}
            <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center items-center bg-slate-50">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Admin Portal</h2>
                        <p className="text-slate-500 font-medium italic">"Security starts with authentication"</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username / ID</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="identifier"
                                    value={credentials.identifier}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-semibold"
                                    placeholder="Enter your ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-semibold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 text-lg group"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" size={20} /> AUTHENTICATING...</>
                            ) : (
                                <><span className="mr-2">INITIALIZE SESSION</span> <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-20 pt-10 border-t border-slate-200 text-center md:text-left">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">&copy; 2026 Chandan Steel Ltd. System Version 24.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
