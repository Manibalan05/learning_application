import React, { useState } from 'react';
import { account } from '../lib/appwrite';
import { useNavigate, Link } from 'react-router-dom';
import { ID } from 'appwrite';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // student or admin
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create Account
            const userId = ID.unique();
            await account.create(userId, email, password, name);

            // 2. Create Session (Login)
            await account.createEmailPasswordSession(email, password);

            // 3. Assign Role (IMPORTANT: Client-side role setting is insecure for production)
            // In a real app, you would use an Admin Function or backend webhook to assign labels.
            // But since this is a demo/hackathon project, we rely on the Backend to check labels later.
            // WARNING: We cannot set labels from client-side SDK directly.
            // For this MVP, we will ASSUME the user IS what they say they are by context,
            // OR - we must create a backend endpoint to "init" the user. 
            // BUT: Appwrite Client SDK cannot "updateLabels".
            
            // WORKAROUND FOR DEMO:
            // Validating "admin" role usually requires manual entry in Console for security.
            // We will tell the user this.
            
            // For "student", we don't strictly enforce a label check in backend for *viewing* problems,
            // but we do for submitting.
            // Actually, we can just proceed. If they are admin, they need to be manually tagged in Console.
            
            if (role === 'admin') {
                alert("Account created! NOTE: To be an Admin, you must manually add the 'admin' label to this user in the Appwrite Console. Redirecting to Admin Dashboard (access might be restricted until you do that).");
                navigate('/admin');
            } else {
                navigate('/student');
            }

        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-primary)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--success)' }}>Create Account</h2>
                
                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="email@example.com"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Min 8 characters"
                            minLength={8}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>I am a...</label>
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin (Requires manual approval)</option>
                        </select>
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
                        style={{ width: '100%', background: 'var(--success)', color: 'black', fontWeight: 'bold' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
