import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(null); // ID of record being edited
    const [editData, setEditData] = useState({});

    const username = localStorage.getItem('username');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isSuperAdmin = roles.includes('superadmin');

    const fetchLogs = async () => {
        try {
            const res = await api.get('/entry/today');
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        const date = d.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
        const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM
        return `${date} ${time}`;
    };

    const handleAction = async (id, action, additionalData = {}) => {
        try {
            await api.put(`/entry/${id}/${action}`, additionalData);
            fetchLogs();
        } catch (err) {
            alert(`Failed to ${action} entry`);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/entry/${id}`, editData);
            setEditMode(null);
            fetchLogs();
        } catch (err) {
            alert("Failed to update entry");
        }
    };

    const handleExit = async (id) => {
        if (!window.confirm("Confirm vehicle exit?")) return;
        try {
            await api.put(`/entry/${id}/exit`);
            fetchLogs();
        } catch (err) {
            alert("Failed to register exit");
        }
    };

    return (
        <div className="dashboard-container">
            <Header title="Admin Dashboard" rightContent={
                <div className="user-info">
                    <span>👤 {username}</span>
                    <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Logout</button>
                </div>
            } />

            <main className="dashboard-main">
                <div className="stats-strip">
                    <div className="stat-card">
                        <h3>Today's Entries</h3>
                        <p className="stat-value">{logs.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Inside Plant</h3>
                        <p className="stat-value">{logs.filter(l => l.status === 'In').length}</p>
                    </div>
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <h2>Vehicle Logs - {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</h2>
                        <button className="refresh-btn" onClick={fetchLogs}>Refresh Data</button>
                    </div>

                    <div className="table-responsive">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Pass No</th>
                                    <th>Vehicle/Driver</th>
                                    <th>Plant</th>
                                    <th>In Time</th>
                                    <th>Status</th>
                                    <th>Approval</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center">Loading logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center">No logs found for today</td></tr>
                                ) : logs.map(log => (
                                    <tr key={log.id}>
                                        <td><strong>{log.gate_pass_no}</strong></td>
                                        <td>
                                            {editMode === log.id ? (
                                                <div className="edit-fields">
                                                    <input value={editData.vehicle_reg} onChange={e => setEditData({ ...editData, vehicle_reg: e.target.value })} />
                                                    <input value={editData.driver_name} onChange={e => setEditData({ ...editData, driver_name: e.target.value })} />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="reg-no">{log.vehicle_reg}</div>
                                                    <div className="driver-name">{log.driver_name}</div>
                                                </>
                                            )}
                                        </td>
                                        <td>{log.plant}</td>
                                        <td>{formatDate(log.entry_time)}</td>
                                        <td><span className={`status-pill ${log.status.toLowerCase()}`}>{log.status}</span></td>
                                        <td>
                                            <span className={`approval-pill ${log.approval_status.toLowerCase()}`}>
                                                {log.approval_status}
                                            </span>
                                            {log.rejection_reason && <div className="reason-text">({log.rejection_reason})</div>}
                                        </td>
                                        <td className="actions-cell">
                                            {editMode === log.id ? (
                                                <div className="btn-group">
                                                    <button className="save-btn" onClick={() => handleUpdate(log.id)}>Save</button>
                                                    <button className="cancel-btn" onClick={() => setEditMode(null)}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="btn-group">
                                                    {log.approval_status === 'Pending' && !isSuperAdmin && (
                                                        <>
                                                            <button className="approve-btn" onClick={() => handleAction(log.id, 'approve')}>Approve</button>
                                                            <button className="reject-btn" onClick={() => {
                                                                const reason = window.prompt("Rejection reason:");
                                                                if (reason) handleAction(log.id, 'reject', { reason });
                                                            }}>Reject</button>
                                                            <button className="edit-btn" onClick={() => {
                                                                setEditMode(log.id);
                                                                setEditData({ vehicle_reg: log.vehicle_reg, driver_name: log.driver_name, purpose: log.purpose });
                                                            }}>Edit</button>
                                                        </>
                                                    )}
                                                    {log.status === 'In' && log.approval_status === 'Approved' && (
                                                        <button className="exit-btn" onClick={() => handleExit(log.id)}>Exit</button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
