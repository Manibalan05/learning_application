import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';
import Editor from '@monaco-editor/react';

const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Filters
    const [filterName, setFilterName] = useState('');
    const [filterAi, setFilterAi] = useState('all'); // all, high, medium, low

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const user = await account.get();
                const headers = { 'user-id': user.$id };
                
                // Fetch all student submissions
                const res = await axios.get('http://localhost:5000/admin/submissions', { headers });
                
                // DATA NORMALIZATION: Handle aiScore vs aiscore mismatch
                const normalizedSubmissions = res.data.submissions.map(sub => ({
                    ...sub,
                    aiScore: sub.aiScore !== undefined ? sub.aiScore : (sub.aiscore !== undefined ? sub.aiscore : 0)
                }));

                setSubmissions(normalizedSubmissions);
                setFilteredSubmissions(normalizedSubmissions);

            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    // Apply Filters
    useEffect(() => {
        let result = submissions;

        if (filterName) {
            result = result.filter(sub => 
                sub.userName.toLowerCase().includes(filterName.toLowerCase()) ||
                sub.userEmail.toLowerCase().includes(filterName.toLowerCase())
            );
        }

        if (filterAi !== 'all') {
            if (filterAi === 'high') result = result.filter(sub => sub.aiScore > 60);
            if (filterAi === 'medium') result = result.filter(sub => sub.aiScore >= 30 && sub.aiScore <= 60);
            if (filterAi === 'low') result = result.filter(sub => sub.aiScore < 30);
        }

        setFilteredSubmissions(result);
    }, [filterName, filterAi, submissions]);

    const getAiColor = (score) => {
        if (score < 30) return 'var(--success)';
        if (score < 70) return 'orange';
        return 'var(--danger)';
    };

    if (loading) return <div>Loading Submissions...</div>;

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Student Submissions</h2>
            
            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <input 
                    type="text" 
                    placeholder="Search Student Name/Email..." 
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }}
                />
                <select 
                    value={filterAi} 
                    onChange={(e) => setFilterAi(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }}
                >
                    <option value="all">All AI Scores</option>
                    <option value="high">High Risk ({'>'} 60%)</option>
                    <option value="medium">Medium Risk (30-60%)</option>
                    <option value="low">Low Risk ({'<'} 30%)</option>
                </select>
            </div>

            {/* Submissions Table */}
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1rem' }}>Student</th>
                            <th style={{ padding: '1rem' }}>Problem</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>AI Score</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.length === 0 ? (
                             <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No submissions found.</td></tr>
                        ) : (
                            filteredSubmissions.map(sub => (
                                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)', background: sub.aiScore > 70 ? 'rgba(220, 38, 38, 0.1)' : 'transparent' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div>{sub.userName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.userEmail}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{sub.problemTitle}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: sub.status === 'Accepted' ? 'var(--success)' : 'orange' }}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            padding: '0.2rem 0.5rem', 
                                            borderRadius: '4px',
                                            background: getAiColor(sub.aiScore), // Use color as background for badge effect
                                            color: '#000',
                                            fontSize: '0.8rem'
                                        }}>
                                            {sub.aiScore}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button 
                                            onClick={() => setSelectedSubmission(sub)}
                                            style={{ 
                                                background: 'transparent', 
                                                border: '1px solid var(--text-secondary)', 
                                                color: 'var(--text-secondary)',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            {selectedSubmission && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '80%', height: '85%', background: 'var(--bg-primary)', 
                        padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2>Review Submission</h2>
                            <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <div><strong>Student:</strong> {selectedSubmission.userName}</div>
                            <div><strong>Problem:</strong> {selectedSubmission.problemTitle}</div>
                            <div><strong>AI Score:</strong> <span style={{ color: getAiColor(selectedSubmission.aiScore) }}>{selectedSubmission.aiScore}%</span></div>
                            <div><strong>Time:</strong> {selectedSubmission.executionTime}s</div>
                        </div>

                        <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                             <Editor
                                height="100%"
                                theme="vs-dark"
                                language={selectedSubmission.language === 'c' ? 'cpp' : selectedSubmission.language}
                                value={selectedSubmission.code}
                                options={{ readOnly: true, minimap: { enabled: false } }}
                            />
                        </div>

                        <div style={{ height: '150px', overflowY: 'auto' }}>
                             <strong>Output:</strong>
                             <pre style={{ background: '#0f172a', padding: '1rem', marginTop: '0.5rem', borderRadius: '4px' }}>
                                 {selectedSubmission.output || 'No output captured.'}
                             </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubmissions;
