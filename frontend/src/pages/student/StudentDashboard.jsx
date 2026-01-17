import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [userName, setUserName] = useState('Student');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await account.get();
                setUserName(user.name || 'Student');
            } catch (e) {
                console.error(e);
            }
        };
        fetchUser();
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '1rem' }}>Welcome, {userName}!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Ready to solve some coding challenges today?
            </p>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="card" style={{ flex: 1 }}>
                    <h3>Start Coding</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
                        Browse our collection of problems and test your skills.
                    </p>
                    <Link to="/student/problems" className="btn">View Problems</Link>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <h3>Your Progress</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
                        Track your submissions and performance.
                    </p>
                    {/* Placeholder for future features */}
                    <button className="btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
