import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPhoto, setShowPhoto] = useState(null);

    const username = localStorage.getItem('username');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isSuperAdmin = roles.includes('superadmin');

    const fetchLogs = async (date = selectedDate) => {
        try {
            const res = await api.get(`/entry/bydate?date=${date}`);
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(selectedDate);
    }, [selectedDate]);

    // Simplified time formatting - browser automatically handles local timezone (IST)
    const formatTimeIST = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDateIST = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB').replace(/\//g, '-');
    };

    const getPhotoThumbnail = (photoJson) => {
        try {
            if (!photoJson) return null;
            const photos = JSON.parse(photoJson);
            return Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
        } catch (e) {
            return null;
        }
    };

    const handleAction = async (id, action, additionalData = {}) => {
        try {
            if (action === 'delete') {
                if (!window.confirm("Are you sure you want to delete this record? It will be moved to history/soft-deleted.")) return;
                await api.delete(`/entry/${id}`);
            } else {
                await api.put(`/entry/${id}/${action}`, additionalData);
            }
            fetchLogs(selectedDate);
        } catch (err) {
            alert(`Failed to ${action} entry`);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await api.put(`/entry/${id}`, editData);
            setEditMode(null);
            fetchLogs(selectedDate);
        } catch (err) {
            alert("Failed to update entry");
        }
    };

    const handleExit = async (id) => {
        if (!window.confirm("Confirm vehicle exit?")) return;
        try {
            await api.put(`/entry/${id}/exit`);
            fetchLogs(selectedDate);
        } catch (err) {
            alert("Failed to register exit");
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return log.vehicle_reg?.toLowerCase().includes(query) ||
            log.driver_name?.toLowerCase().includes(query) ||
            log.gate_pass_no?.toLowerCase().includes(query);
    });

    const todayCount = logs.length;
    const pendingCount = logs.filter(l => l.approval_status === 'Pending').length;
    const insideCount = logs.filter(l => l.status === 'In').length;

    return (
        <div className="dashboard-container">
            <Header title="Admin Dashboard" rightContent={
                <div className="user-info">
                    <span className="date-display">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}</span>
                    <span className="username-display">👤 {username}</span>
                    <button className="logout-btn btn-primary" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Logout</button>
                </div>
            } />

            <main className="dashboard-main">
                <div className="stats-strip">
                    <div className="stat-card blue-card glass">
                        <h3>TODAY'S COUNT</h3>
                        <p className="stat-value">{todayCount}</p>
                    </div>
                    <div className="stat-card orange-card glass">
                        <h3>PENDING APPROVAL</h3>
                        <p className="stat-value">{pendingCount}</p>
                        <span className="stat-label">Action Required</span>
                    </div>
                    <div className="stat-card green-card glass">
                        <h3>INSIDE PREMISE</h3>
                        <p className="stat-value">{insideCount}</p>
                        <span className="stat-label">Checked In</span>
                    </div>
                </div>

                <div className="table-card glass">
                    <div className="table-controls">
                        <div className="left-controls">
                            <h2 className="table-title">Vehicle Logs</h2>
                            <input
                                type="date"
                                className="date-picker"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Search by name, vehicle, pass no..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>BATCH / PHOTO</th>
                                    <th>VEHICLE DETAILS</th>
                                    <th>CONTEXT</th>
                                    <th>TIMING</th>
                                    <th>STATUS</th>
                                    <th>CONTROLS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading logs...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">No logs found</td></tr>
                                ) : filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className="batch-info">
                                                <div className="photo-thumbnail" onClick={() => setShowPhoto(getPhotoThumbnail(log.photo_url))}>
                                                    {getPhotoThumbnail(log.photo_url) ? (
                                                        <img src={getPhotoThumbnail(log.photo_url)} alt="Vehicle" />
                                                    ) : (
                                                        <div className="photo-placeholder">🚗</div>
                                                    )}
                                                </div>
                                                <span className="batch-no">{log.gate_pass_no}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {editMode === log.id ? (
                                                <div className="edit-fields">
                                                    <input value={editData.vehicle_reg} onChange={e => setEditData({ ...editData, vehicle_reg: e.target.value })} />
                                                    <input value={editData.driver_name} onChange={e => setEditData({ ...editData, driver_name: e.target.value })} />
                                                </div>
                                            ) : (
                                                <div className="vehicle-details">
                                                    <div className="vehicle-name">{log.driver_name}</div>
                                                    <div className="vehicle-reg">{log.vehicle_reg}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="context-info">
                                                <div className="purpose-text">{log.purpose || 'Na'}</div>
                                                <div className="plant-name">Plant: {log.plant}</div>
                                                {log.material_details && <div className="material-badge">{log.material_details}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="timing-info">
                                                <div className="time-row">
                                                    <span className="time-label">IN</span>
                                                    <span className="time-value">{formatTimeIST(log.entry_time)}</span>
                                                </div>
                                                <div className="time-row">
                                                    <span className="time-label">OUT</span>
                                                    <span className="time-value">{log.exit_time ? formatTimeIST(log.exit_time) : '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="status-group">
                                                <span className={`status-badge ${log.status.toLowerCase()}`}>
                                                    ● {log.status === 'In' ? 'INSIDE' : 'EXITED'}
                                                </span>
                                                <span className={`approval-badge ${log.approval_status.toLowerCase()}`}>
                                                    {log.approval_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="controls-cell">
                                            {editMode === log.id ? (
                                                <div className="btn-group">
                                                    <button className="icon-btn save" onClick={() => handleUpdate(log.id)} title="Save">💾</button>
                                                    <button className="icon-btn cancel" onClick={() => setEditMode(null)} title="Cancel">✖</button>
                                                </div>
                                            ) : (
                                                <div className="btn-group">
                                                    {(isSuperAdmin || log.approval_status === 'Pending') && (
                                                        <>
                                                            <button className="icon-btn approve" onClick={() => handleAction(log.id, 'approve')} title="Approve">✓</button>
                                                            <button className="icon-btn reject" onClick={() => {
                                                                const reason = window.prompt("Rejection reason:");
                                                                if (reason) handleAction(log.id, 'reject', { reason });
                                                            }} title="Reject">✖</button>
                                                            <button className="icon-btn edit" onClick={() => {
                                                                setEditMode(log.id);
                                                                setEditData({ vehicle_reg: log.vehicle_reg, driver_name: log.driver_name, purpose: log.purpose });
                                                            }} title="Edit">✎</button>
                                                        </>
                                                    )}
                                                    {isSuperAdmin && (
                                                        <button className="icon-btn delete" onClick={() => handleAction(log.id, 'delete')} title="Delete (Soft)">🗑</button>
                                                    )}
                                                    {log.status === 'In' && log.approval_status === 'Approved' && (
                                                        <button className="icon-btn exit" onClick={() => handleExit(log.id)} title="Register Exit">⏏</button>
                                                    )}
                                                    <button className="icon-btn print" title="Print">🖨</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showPhoto && (
                    <div className="photo-modal" onClick={() => setShowPhoto(null)}>
                        <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
                            <img src={showPhoto} alt="Full vehicle" />
                            <button className="close-modal" onClick={() => setShowPhoto(null)}>✖</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
