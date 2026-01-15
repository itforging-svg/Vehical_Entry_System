import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import Header from '../components/Header';
import './VehicleEntry.css';

const VehicleEntry = () => {
    const [entryTime, setEntryTime] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
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
        entry_time: ''
    });

    useEffect(() => {
        const now = new Date();
        const date = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM
        setEntryTime(`${date} ${time}`);
        setFormData(prev => ({
            ...prev,
            entry_time: now.toISOString()
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'chassis_last_5' || name === 'engine_last_5') && value.length > 5) return;

        let finalValue = value;
        if (name === 'vehicle_reg') {
            finalValue = value.toUpperCase();
        }

        setFormData({ ...formData, [name]: finalValue });
    };

    const startCamera = () => setIsCameraOpen(true);
    const stopCamera = () => setIsCameraOpen(false);

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setPhotos(prev => [...prev, imageSrc]);
        }
    }, [webcamRef]);

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/entry', {
                ...formData,
                photos: photos
            });
            alert(`Entry Registered Successfully!\nGate Pass No: ${res.data.gate_pass_no}`);
            // Reset form or handle success
            window.location.reload();
        } catch (err) {
            console.error("Submission error:", err);
            const msg = err.response?.data?.message || "Network error. Please check backend connection.";
            alert(msg);
        }
    };

    return (
        <div className="vehicle-entry-standalone">
            <Header title="Vehicle Entry System" />

            <main className="entry-main">
                <div className="entry-layout">
                    {/* Left Column: Camera Feed */}
                    <div className="layout-left">
                        <div className="camera-card">
                            <div className="camera-card-header">
                                <h3>Live Feed</h3>
                                <div className={`status-dot ${isCameraOpen ? 'active' : ''}`}></div>
                            </div>

                            <div className="camera-viewport">
                                {!isCameraOpen ? (
                                    <div className="camera-placeholder">
                                        <div className="placeholder-icon">📷</div>
                                        <button type="button" className="camera-toggle-btn" onClick={startCamera}>
                                            Activate Camera
                                        </button>
                                    </div>
                                ) : (
                                    <div className="camera-view-active">
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className="webcam-source"
                                            videoConstraints={{ facingMode: "environment" }}
                                        />
                                        <div className="camera-overlay-controls">
                                            <button type="button" className="action-btn capture" onClick={capturePhoto}>
                                                <span>📸</span> Capture
                                            </button>
                                            <button type="button" className="action-btn stop" onClick={stopCamera}>
                                                <span>⏹</span> Stop
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="entry-meta-info">
                                <div className="meta-item">
                                    <label>Initial Entry Time</label>
                                    <p>{entryTime}</p>
                                </div>
                                <div className="meta-item">
                                    <label>Photos Captured</label>
                                    <p>{photos.length} Frames</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form & Photos */}
                    <div className="layout-right">
                        <div className="form-card">
                            <div className="form-card-header">
                                <h2>Vehicle Entry Registration</h2>
                                <p>Fill in the details for security clearance</p>
                            </div>

                            <form onSubmit={handleSubmit} className="premium-form">
                                <div className="form-grid">
                                    <div className="field-group">
                                        <label>Plant / Division</label>
                                        <select name="plant" value={formData.plant} onChange={handleChange} required>
                                            <option value="Seamless Division">Seamless Division</option>
                                            <option value="Forging Division">Forging Division</option>
                                            <option value="Main Plant">Main Plant</option>
                                            <option value="Bright Bar">Bright Bar</option>
                                            <option value="Flat Bar">Flat Bar</option>
                                            <option value="Wire Plant">Wire Plant</option>
                                            <option value="Main Plant 2 ( SMS 2 )">Main Plant 2 ( SMS 2 )</option>
                                            <option value="40&quot;Inch Mill">40"Inch Mill</option>
                                        </select>
                                    </div>

                                    <div className="field-group">
                                        <label>Driver Name</label>
                                        <input type="text" name="driver_name" value={formData.driver_name} onChange={handleChange} required placeholder="Full Name" />
                                    </div>

                                    <div className="field-group">
                                        <label>Licence No</label>
                                        <input type="text" name="license_no" value={formData.license_no} onChange={handleChange} required placeholder="DL Number" />
                                    </div>

                                    <div className="field-group">
                                        <label>Vehicle Type</label>
                                        <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange}>
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

                                    <div className="field-group">
                                        <label>Registration Number</label>
                                        <input
                                            type="text"
                                            name="vehicle_reg"
                                            value={formData.vehicle_reg}
                                            onChange={handleChange}
                                            required
                                            placeholder="AB 00 CD 1234"
                                            className="uppercase"
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label>PUC Validity</label>
                                        <input type="date" name="puc_validity" value={formData.puc_validity} onChange={handleChange} required />
                                    </div>

                                    <div className="field-group">
                                        <label>RC (Last 5 Digits)</label>
                                        <div className="rc-split">
                                            <input type="text" name="chassis_last_5" value={formData.chassis_last_5} onChange={handleChange} placeholder="Chassis" required />
                                            <input type="text" name="engine_last_5" value={formData.engine_last_5} onChange={handleChange} placeholder="Engine" required />
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>Insurance Validity</label>
                                        <input type="date" name="insurance_validity" value={formData.insurance_validity} onChange={handleChange} required />
                                    </div>

                                    <div className="field-group full">
                                        <label>Purpose of Entry</label>
                                        <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} required placeholder="Reason for entering..." />
                                    </div>

                                    <div className="field-group full">
                                        <label>Material Details</label>
                                        <textarea name="material_details" value={formData.material_details} onChange={handleChange} placeholder="List items..." rows="2" />
                                    </div>
                                </div>

                                <div className="photos-preview-section">
                                    <label>Photos Captured</label>
                                    <div className="gallery-strip">
                                        {photos.length === 0 ? (
                                            <div className="gallery-empty">No photos captured yet</div>
                                        ) : (
                                            photos.map((src, idx) => (
                                                <div key={idx} className="preview-thumb">
                                                    <img src={src} alt="Captured" />
                                                    <button type="button" onClick={() => removePhoto(idx)}>&times;</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="submit-container">
                                    <button type="submit" className="mega-submit-btn">
                                        Register Entry & Generate Pass
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="page-footer">
                <p>&copy; 2026 Chandan Steel Limited | Standalone System v1.0</p>
            </footer>
        </div>
    );
};

export default VehicleEntry;
