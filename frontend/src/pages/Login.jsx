import React, { useState, useEffect } from 'react';
import { account } from '../lib/appwrite';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const user = await account.get();
                if (user) {
                    if (user.labels && user.labels.includes('admin')) navigate('/admin');
                    else navigate('/student');
                } else {
                    setCheckingSession(false);
                }
            } catch (error) {
                // No active session
                setCheckingSession(false);
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create Session
            try {
                await account.createEmailPasswordSession(email, password);
            } catch (sessionError) {
                // If session is already active, ignore error and proceed to redirect
                if (!sessionError.message.includes('prohibited') && sessionError.code !== 401) {
                    throw sessionError; 
                }
            }

            // 2. Fetch User Details to Determine Role
            const user = await account.get();
            
            // 3. Check Labels & Redirect
            if (user.labels && user.labels.includes('admin')) {
                navigate('/admin');
            } else {
                navigate('/student');
            }

        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-primary)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent)' }}>Welcome Back</h2>
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn"
                        style={{ width: '100%', background: 'var(--accent)', color: 'black', fontWeight: 'bold' }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <p>Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign Up</Link></p>
                    <p style={{marginTop: '1rem'}}>Demo Accounts:</p>
                    <p>Admin: admin@test.com / 12345678</p>
                    <p>Student: student@test.com / 12345678</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
