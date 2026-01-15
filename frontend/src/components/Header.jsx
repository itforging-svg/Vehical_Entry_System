import React from 'react';
import logo from '../assets/logo.png';
import { ShieldCheck } from 'lucide-react';

const Header = ({ title = "Vehicle Entry System", showBadge = true, rightContent = null }) => {
    return (
        <header className="bg-[#0e2a63] text-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-[100] shadow-2xl border-b-2 border-amber-500">
            <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-white/10 p-2 rounded-xl border border-white/10 hidden sm:block">
                    <img src={logo} alt="CSL Logo" className="h-10 w-auto filter drop-shadow-md" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-sm md:text-lg font-black text-amber-500 tracking-wider uppercase leading-none">{title}</h1>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">CHANDAN STEEL LTD</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {rightContent ? rightContent : (
                    showBadge && (
                        <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
                            <ShieldCheck size={14} />
                            Standalone Entry Portal
                        </div>
                    )
                )}
            </div>
        </header>
    );
};

export default Header;
