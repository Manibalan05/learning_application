import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    // Fetch simplified stats similar to analytics or just a welcome message
    useEffect(() => {
        // Ideally fetch a dashboard summary endpoint
    }, []);

    return (
        <div>
            <h1>Welcome, Admin</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Manage problems, view student performance, and monitor AI integrity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card">
                    <h3>Quick Actions</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <a href="/admin/add-problem" className="btn">Add New Problem</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
