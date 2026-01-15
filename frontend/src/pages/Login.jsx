import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
            // Updated to port 5001 to match current backend
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
        <div className="login-split-container">
            <div className="login-left-panel">
                <div className="branding-container">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22C16.6 20.9 20 16.1 20 11V5L12 2Z" fill="#F39C12" />
                                <path d="M9 12L11 14L15 10" stroke="#1A202C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="company-name">CHANDAN STEEL LTD</span>
                    </div>
                    <h1>Secure <span className="highlight">Vehicle</span><br />Entry Management.</h1>
                    <p className="branding-subtitle">
                        Enterprise-grade security and tracking for industrial facilities.
                        monitor entries, exits, and approvals in real-time.
                    </p>
                </div>
            </div>

            <div className="login-right-panel">
                <div className="login-card">
                    <div className="login-card-header">
                        <h2>Admin Portal</h2>
                        <p>Authenticate to access system controls.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>USERNAME</label>
                            <div className="input-with-icon">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    name="identifier"
                                    value={credentials.identifier}
                                    onChange={handleChange}
                                    placeholder="Enter ID"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>PASSWORD</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'AUTHENTICATING...' : 'LOG IN'}
                        </button>
                    </form>

                    <p className="copyright-text">Protected by Antigravity Systems v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
