import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import logo from '../assets/logo.png';
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

                if (res.data.photo_url) {
                    try {
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
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-xl font-bold">Loading Voucher...</div>
        </div>
    );

    if (error || !log) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-red-600 font-bold">
            {error || "Record not found"}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center print:bg-white print:p-0">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-8 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-bold"
                >
                    Back
                </button>
                <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 font-bold"
                >
                    Print Voucher
                </button>
            </div>

            {/* Slip Container - Extreme Compact Layout (Reduced Height to ~72mm) */}
            <div className="w-[150mm] min-h-[72mm] bg-white border border-black p-3 print:w-[150mm] print:border print:border-black print:p-3 print:mt-4 text-black font-sans mx-auto shadow-sm">

                {/* Header - Extremely Compact */}
                <div className="flex justify-between items-center border-b border-black pb-0.5 mb-1.5">
                    <div className="w-1/3">
                        <img src={logo} alt="CSL Logo" className="h-10 object-contain" />
                    </div>
                    <div className="w-2/3 text-right">
                        <h1 className="text-lg font-bold uppercase tracking-wide text-slate-800">CHANDAN STEEL LTD</h1>
                        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">VEHICLE ENTRY PASS</p>
                    </div>
                </div>

                {/* Main Identity Section - Compact */}
                <div className="flex flex-col gap-2 mb-2">
                    {/* Photos Row (Up to 3) */}
                    <div className="flex gap-2">
                        {photos.length > 0 ? (
                            photos.slice(0, 3).map((photo, idx) => (
                                <div key={idx} className="w-20 h-20 border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 rounded-sm">
                                    <img src={photo} alt={`Driver/Vehicle ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))
                        ) : (
                            <div className="w-20 h-20 border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 rounded-sm">
                                <span className="text-[9px] text-gray-400 text-center px-2 uppercase font-black">Photo</span>
                            </div>
                        )}
                        {/* Fill remaining slots if needed or just let them flow? User asked for "entry page and same should be visible in print slip". 
                            If strict 3 boxes are needed, we can pad. For now, showing available photos is better. */}
                    </div>

                    {/* Details Table - Row & Column Format */}
                    <div className="w-full border border-slate-400 bg-white text-[9px]">
                        {/* Row 1 */}
                        <div className="grid grid-cols-2 border-b border-slate-300">
                            <div className="p-1 border-r border-slate-300">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">FULL NAME</span>
                                <span className="font-bold text-slate-900 uppercase">{log.driver_name}</span>
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">LICENSE NO</span>
                                <span className="font-bold text-slate-900 uppercase">{log.license_no || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 border-b border-slate-300">
                            <div className="p-1 border-r border-slate-300">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">AADHAR CARD NO</span>
                                <span className="font-bold text-slate-900 font-mono tracking-wide">{log.aadhar_no || 'N/A'}</span>
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">COMPANY / TRANSPORTER</span>
                                <span className="font-bold text-slate-900 uppercase">{log.transporter || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 border-b border-slate-300">
                            <div className="p-1 border-r border-slate-300">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">MOBILE</span>
                                <span className="font-bold text-slate-900">{log.driver_mobile || 'N/A'}</span>
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">VEHICAL NO</span>
                                <span className="font-bold text-slate-900 uppercase">{log.vehicle_reg}</span>
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-2 border-b border-slate-300">
                            <div className="p-1 border-r border-slate-300">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">VISITING</span>
                                <span className="font-bold text-slate-900 uppercase">{log.plant}</span>
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">BATCH NO</span>
                                <span className="font-bold text-slate-900">{log.gate_pass_no}</span>
                            </div>
                        </div>

                        {/* Row 5 */}
                        <div className="grid grid-cols-2 border-b border-slate-300">
                            <div className="p-0.5 px-1 border-r border-slate-300">
                                <span className="font-bold text-slate-500 uppercase block text-[6px]">DATE</span>
                                <span className="font-bold text-slate-900">{format(new Date(log.entry_time), 'dd-MM-yyyy')}</span>
                            </div>
                            <div className="p-0.5 px-1">
                                <span className="font-bold text-slate-500 uppercase block text-[6px]">TIME</span>
                                <span className="font-bold text-slate-900">{format(new Date(log.entry_time), 'HH:mm')}</span>
                            </div>
                        </div>

                        {/* Row 6 - New: Purpose & Material */}
                        <div className="grid grid-cols-2">
                            <div className="p-1 border-r border-slate-300">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">PURPOSE</span>
                                <span className="font-bold text-slate-900 uppercase">{log.purpose}</span>
                            </div>
                            <div className="p-1">
                                <span className="font-bold text-slate-500 uppercase block text-[7px]">MATERIAL LOAD</span>
                                <span className="font-bold text-slate-900 uppercase">{log.material_details || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* (Removed Old Info Strip & Context) */}


                {/* EHS Guidelines - Extremely Compact */}
                <div className="mb-1.5 px-1">
                    <div className="text-center border-b border-dashed border-black pb-0.5 mb-1">
                        <h3 className="text-[7.5px] font-black uppercase underline">EHS GUIDELINES FOR VISITORS</h3>
                    </div>
                    <ol className="list-decimal pl-3 space-y-0.5 text-[8px] text-slate-700 leading-tight">
                        <li>Safety Helmet, Safety Shoes and Safety Goggles are mandatory in Production areas.</li>
                        <li>First Aid Boxes are available in all shops/ areas.</li>
                        <li>Use designated Walkway / Gangway marked in Yellow Line/Epoxy Paint.</li>
                        <li>Use of personal Mobile phone, Camera and other electronic devices are strictly prohibited.</li>
                        <li>Do not enter any "Restricted Areas".</li>
                        <li>Be aware of overhead crane movements. Do not walk under the suspended loads.</li>
                        <li>Comply with "No Tobacco Policy". Consumption of any form of tobacco products are strictly prohibited.</li>
                        <li>Keep inform to the concern CSL representative about the area, you are visiting.</li>
                        <li>Prior to leaving the premises, return the pass at the Security gate.</li>
                    </ol>
                </div>

                {/* Emergency Action - Compact */}
                {/* Emergency Action & Footer - Combined */}
                <div className="grid grid-cols-2 gap-2 mb-1.5 px-1 border-t border-gray-100 pt-1">
                    <div>
                        <h3 className="text-[7px] font-black uppercase underline mb-0.5">EMERGENCY ACTION</h3>
                        <p className="text-[7px] text-slate-700 italic leading-tight">Follow siren. Exit building immediately.</p>
                    </div>
                    <div className="text-right flex items-end justify-end">
                        <p className="text-[6px] text-slate-500 italic">Declaration: Briefing watched and understood guidelines.</p>
                    </div>
                </div>

                {/* Signatures - Extremely Compact */}
                <div className="flex justify-between px-2 gap-8">
                    <div className="text-center w-24 border-t border-black pt-0.5">
                        <p className="text-[7px] font-black uppercase italic text-slate-400 mb-0.5">Authorization</p>
                        <p className="text-[8px] font-bold uppercase">{log.approved_by || '___________'}</p>
                        <p className="text-[7px] font-black uppercase">APPROVED BY</p>
                    </div>
                    <div className="text-center w-20 border-t border-black pt-0.5">
                        <p className="text-[7px] font-black uppercase italic text-slate-400 mb-0.5">Verification</p>
                        <p className="text-[7px] font-black uppercase mt-1">SECURITY</p>
                    </div>
                </div>

            </div>

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
                    @media print {
                        .print-hidden {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default PrintSlip;
