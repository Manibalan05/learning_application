import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';

const StudentLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            navigate('/login');
        }
    };

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
                <h2 style={{ marginBottom: '2rem', color: 'var(--success)' }}>Student Portal</h2>
                <nav style={{ flex: 1 }}>
                    <ul>
                        <li><Link to="/student" style={linkStyle}>Dashboard</Link></li>
                        <li><Link to="/student/problems" style={linkStyle}>Problems</Link></li>
                        <li><Link to="/student/history" style={linkStyle}>My Submissions</Link></li>
                    </ul>
                </nav>
                <div>
                    <button onClick={handleLogout} className="btn" style={{ 
                        background: 'var(--bg-primary)', 
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        width: '100%' 
                    }}>
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

export default StudentLayout;
