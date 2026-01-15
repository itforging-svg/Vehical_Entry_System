import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Landing.css';

const Landing = () => {
    const [selectedSystem, setSelectedSystem] = useState('');
    const navigate = useNavigate();

    const handleProceed = () => {
        if (selectedSystem === 'vehicle') {
            navigate('/entry');
        } else if (selectedSystem === 'visitor') {
            window.location.href = 'https://192.168.0.22:3000/';
        }
    };

    return (
        <div className="landing-page-container">
            <Header showBadge={false} />
            <main className="landing-main">
                <div className="landing-card">
                    <div className="landing-card-accent"></div>
                    <h2>Welcome to Entry Management</h2>

                    <div className="selection-group">
                        <label>SELECT SYSTEM TO ACCESS</label>
                        <select
                            className="system-dropdown"
                            value={selectedSystem}
                            onChange={(e) => setSelectedSystem(e.target.value)}
                        >
                            <option value="">-- Choose System --</option>
                            <option value="vehicle">Vehicle Entry System</option>
                            <option value="visitor">Visitor Management System</option>
                        </select>
                    </div>

                    <button
                        className="btn-proceed"
                        onClick={handleProceed}
                        disabled={!selectedSystem}
                    >
                        PROCEED TO ACCESS
                    </button>
                </div>
            </main>
            <footer className="page-footer">
                <p>&copy; 2026 Chandan Steel Ltd. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
