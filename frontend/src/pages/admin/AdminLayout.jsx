import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            localStorage.clear(); // Ensure all local data is cleared
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            localStorage.clear();
            navigate('/login');
        }
    };

    // Auth check is now handled by ProtectedRoute wrapper in App.jsx

    const linkStyle = {
        display: 'block',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ 
                width: '260px', 
                background: 'var(--bg-secondary)', 
                padding: '2rem', 
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--accent)' }}>Admin Panel</h2>
                <nav style={{ flex: 1 }}>
                    <ul>
                        <li><Link to="/admin" style={linkStyle}>Dashboard</Link></li>
                        <li><Link to="/admin/submissions" style={linkStyle}>Submissions</Link></li>
                        <li><Link to="/admin/add-problem" style={linkStyle}>Add Problem</Link></li>
                        <li><Link to="/admin/analytics" style={linkStyle}>Analytics</Link></li>
                    </ul>
                </nav>
                <div>
                    <button onClick={handleLogout} className="btn" style={{ background: 'var(--danger)', color: 'white', width: '100%' }}>
                        Logout
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
