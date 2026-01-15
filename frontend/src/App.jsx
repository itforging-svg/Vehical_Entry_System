import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VehicleEntry from './pages/VehicleEntry';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrintSlip from './pages/PrintSlip';
import './index.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/entry" element={<VehicleEntry />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/entry/dashboard" element={<Dashboard />} />
                    <Route path="/pool/dashboard" element={<Dashboard />} />
                    <Route path="/print/:id" element={<PrintSlip />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
