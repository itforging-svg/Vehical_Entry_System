import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VehicleEntry from './pages/VehicleEntry';
import './index.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<VehicleEntry />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
