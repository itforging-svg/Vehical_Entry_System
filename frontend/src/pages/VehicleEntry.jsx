import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import Webcam from 'react-webcam';
import Header from '../components/Header';
import { Camera, CameraOff, Save, X, Trash2, Zap, Monitor, ClipboardList, Info, LogIn, ChevronDown, Search, Loader2 } from 'lucide-react';

const VehicleEntry = () => {
    const [entryTime, setEntryTime] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const webcamRef = useRef(null);

    const [formData, setFormData] = useState({
        plant: 'Seamless Division',
        driver_name: '',
        license_no: '',
        vehicle_type: 'LV - Sedan/SUV',
        vehicle_reg: '',
        puc_validity: '',
        chassis_last_5: '',
        engine_last_5: '',
        insurance_validity: '',
        purpose: '',
        material_details: '',
        entry_time: '',
        transporter: '',
        aadhar_no: '',
        driver_mobile: '',
        challan_no: '',
        security_person_name: ''
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const istDateStr = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                timeZone: 'Asia/Kolkata'
            }).format(now).replace(/\//g, '-');

            const istTimeStr = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit', minute: '2-digit', hour12: false,
                timeZone: 'Asia/Kolkata'
            }).format(now);

            setEntryTime(`${istDateStr} ${istTimeStr}`);
            setFormData(prev => ({
                ...prev,
                entry_time: now.toISOString()
            }));
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'chassis_last_5' || name === 'engine_last_5') && value.length > 5) return;

        // Validation for Mobile (10 digits only)
        if (name === 'driver_mobile') {
            if (!/^\d*$/.test(value)) return; // Only numbers
            if (value.length > 10) return;     // Max 10 digits
        }

        // Validation for Aadhar (12 digits only)
        if (name === 'aadhar_no') {
            if (!/^\d*$/.test(value)) return; // Only numbers
            if (value.length > 12) return;     // Max 12 digits
        }

        let finalValue = value;
        if (name === 'vehicle_reg') {
            finalValue = value.toUpperCase();
        }

        setFormData({ ...formData, [name]: finalValue });
    };

    const checkBlacklist = async () => {
        if (!formData.vehicle_reg) return;
        try {
            const res = await api.get(`/blacklist/check/${formData.vehicle_reg}`);
            if (res.data.blacklisted) {
                alert(`⚠️ BLACKLISTED VEHICLE DETECTED ⚠️\n\nVehicle: ${formData.vehicle_reg}\nReason: ${res.data.reason || 'No reason provided'}\n\nEntry will be blocked.`);
            }
        } catch (err) {
            console.error("Blacklist check error:", err);
        }
    };

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setPhotos(prev => [...prev, imageSrc]);
        }
    }, [webcamRef]);

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleHistorySearch = async (rawIdentifier) => {
        const identifier = rawIdentifier ? rawIdentifier.trim() : '';
        if (!identifier) {
            alert("Please enter Mobile No or Aadhar No to search");
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get(`/entry/history/${identifier}`);
            if (res.data) {
                const data = res.data;
                setFormData(prev => ({
                    ...prev,
                    driver_name: data.driver_name || prev.driver_name,
                    license_no: data.license_no || prev.license_no,
                    driver_mobile: data.driver_mobile || prev.driver_mobile,
                    aadhar_no: data.aadhar_no || prev.aadhar_no,
                }));

                // If there's a photo, add it to photos array if it's not already there
                if (data.photo_url) {
                    try {
                        const historyPhotos = JSON.parse(data.photo_url);
                        if (Array.isArray(historyPhotos) && historyPhotos.length > 0) {
                            // Merge with existing photos, avoiding duplicates if possible (best effort)
                            setPhotos(prev => {
                                const newPhotos = [...prev];
                                historyPhotos.forEach(p => {
                                    if (!newPhotos.includes(p)) {
                                        newPhotos.push(p);
                                    }
                                });
                                return newPhotos;
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing history photos:", e);
                    }
                }
                alert("Driver details retrieved and autofilled!");
            }
        } catch (err) {
            console.error("Search error:", err);
            const msg = err.response?.status === 404
                ? `No previous records found for: ${identifier}`
                : "Error searching history. Please check your connection.";
            alert(msg);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Exclude entry_time, backend will set it to Realtime IST
            const { entry_time, ...submitData } = formData;
            const res = await api.post('/entry', {
                ...submitData,
                photos: photos
            });
            alert(`Entry Registered Successfully!\nGate Pass No: ${res.data.gate_pass_no}`);
            window.location.reload();
        } catch (err) {
            console.error("Submission error:", err);
            const msg = err.response?.data?.message || "Network error. Please check backend connection.";
            alert(msg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Header
                title="Vehicle Entry Gateway"
                rightContent={
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10"
                    >
                        <LogIn size={16} /> Admin Login
                    </button>
                }
            />

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">

                {/* Visual Verification Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-900 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isCameraOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Feed</span>
                            </div>
                            <Monitor size={16} className="text-slate-600" />
                        </div>

                        <div className="aspect-video bg-slate-800 relative flex items-center justify-center overflow-hidden">
                            {!isCameraOpen ? (
                                <div className="text-center group">
                                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500 group-hover:bg-slate-700 group-hover:text-amber-500 transition-all cursor-pointer" onClick={() => setIsCameraOpen(true)}>
                                        <Camera size={40} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCameraOpen(true)}
                                        className="text-white text-xs font-black uppercase tracking-widest hover:text-amber-500 transition-colors"
                                    >
                                        Activate Scanner
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                        videoConstraints={{ facingMode: "environment" }}
                                    />
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                                        <button
                                            type="button"
                                            onClick={capturePhoto}
                                            className="bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Zap size={20} fill="currentColor" /> Snap Photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsCameraOpen(false)}
                                            className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20"
                                        >
                                            <CameraOff size={20} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50/50">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Session Start</label>
                                <div className="text-sm font-bold text-slate-700 font-mono tracking-tighter">{entryTime}</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Verification Samples</label>
                                <div className="text-sm font-bold text-slate-700 font-mono tracking-tighter">{photos.length} Frames</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <ClipboardList size={14} className="text-amber-500" /> Evidence Logs
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {photos.length === 0 ? (
                                <div className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 text-xs font-bold italic">
                                    No photos captured in this session
                                </div>
                            ) : (
                                photos.map((src, idx) => (
                                    <div key={idx} className="w-20 h-20 rounded-xl relative overflow-hidden group border border-slate-100 shadow-sm">
                                        <img src={src} alt="Sample" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(idx)}
                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden glass">
                        <div className="relative h-2 w-full bg-slate-100">
                            <div className="absolute top-0 left-0 h-full bg-amber-500 w-1/3"></div>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="mb-10 text-center sm:text-left">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Gate Pass Registration</h2>
                                <p className="text-slate-400 text-sm font-medium">Verify driver documents and vehicle health before issuing pass</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Driver Full Name</label>
                                        <input
                                            type="text"
                                            name="driver_name"
                                            value={formData.driver_name}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            placeholder="Enter from License"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Licence Number</label>
                                        <input
                                            type="text"
                                            name="license_no"
                                            value={formData.license_no}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            placeholder="DL Valid ID"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Driver Mobile No</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="driver_mobile"
                                                value={formData.driver_mobile}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all pr-12"
                                                placeholder="10 Digit Mobile No"
                                                maxLength={10}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleHistorySearch(formData.driver_mobile)}
                                                disabled={isSearching}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors disabled:opacity-50"
                                                title="Search History"
                                            >
                                                {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Aadhar Card No</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="aadhar_no"
                                                value={formData.aadhar_no}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono pr-12"
                                                placeholder="12 Digit Aadhar No"
                                                maxLength={12}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleHistorySearch(formData.aadhar_no)}
                                                disabled={isSearching}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors disabled:opacity-50"
                                                title="Search History"
                                            >
                                                {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Vehicle Classification</label>
                                        <select
                                            name="vehicle_type"
                                            value={formData.vehicle_type}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                                        >
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

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Registration Number</label>
                                        <input
                                            type="text"
                                            name="vehicle_reg"
                                            value={formData.vehicle_reg}
                                            onChange={handleChange}
                                            onBlur={checkBlacklist}
                                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-mono uppercase tracking-widest text-center"
                                            placeholder="GJ 05 AB 1234"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Challan No</label>
                                        <input
                                            type="text"
                                            name="challan_no"
                                            value={formData.challan_no}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            placeholder="Enter Challan No"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">PUC Validity</label>
                                        <input
                                            type="date"
                                            name="puc_validity"
                                            value={formData.puc_validity}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Insurance Validity</label>
                                        <input
                                            type="date"
                                            name="insurance_validity"
                                            value={formData.insurance_validity}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Chassis (Last 5)</label>
                                        <input
                                            type="text"
                                            name="chassis_last_5"
                                            value={formData.chassis_last_5}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-slate-300"
                                            placeholder="Digits"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Engine (Last 5)</label>
                                        <input
                                            type="text"
                                            name="engine_last_5"
                                            value={formData.engine_last_5}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-slate-300"
                                            placeholder="Digits"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Transporter / Party Name</label>
                                        <input
                                            type="text"
                                            name="transporter"
                                            value={formData.transporter}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            placeholder="Enter Transporter Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Plant / Division</label>
                                        <div className="relative">
                                            <select
                                                name="plant"
                                                value={formData.plant}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer pr-10"
                                                required
                                            >
                                                {['Seamless Division', 'Forging Division', 'Main Plant', 'Bright Bar', 'Flat Bar', 'Wire Plant', 'Main Plant 2 ( SMS 2 )', '40"Inch Mill'].map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Purpose of Entry</label>
                                        <div className="relative">
                                            <Info size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                name="purpose"
                                                value={formData.purpose}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                placeholder="e.g. Loading Scrap, Raw Material Delivery..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Material Load Details</label>
                                        <textarea
                                            name="material_details"
                                            value={formData.material_details}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[80px]"
                                            placeholder="Itemized list of materials..."
                                            rows="2"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Security Person Name</label>
                                        <input
                                            type="text"
                                            name="security_person_name"
                                            value={formData.security_person_name}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            placeholder="Enter Security Person Name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="btn-primary w-full py-6 text-xl shadow-xl shadow-amber-500/20 group uppercase"
                                    >
                                        <Save size={24} className="group-hover:rotate-12 transition-transform" />
                                        Confirm Entry & Issue Pass
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border-t border-slate-100 bg-white">
                Chandan Steel Limited | Integrated Logistics Control v24.1
            </footer>
        </div>
    );
};

export default VehicleEntry;
