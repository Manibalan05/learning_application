import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';
import Editor from '@monaco-editor/react';

const SubmissionHistory = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const user = await account.get();
                const headers = { 'user-id': user.$id };
                const res = await axios.get('http://localhost:5000/student/submissions', { headers });
                setSubmissions(res.data.submissions);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    if (loading) return <div>Loading History...</div>;

    const getAiColor = (score) => {
        if (score < 30) return 'var(--success)';
        if (score < 70) return 'orange';
        return 'var(--danger)';
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
            
            {/* List Panel */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Your Submissions</h2>
                
                {submissions.length === 0 ? (
                    <p>No submissions yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {submissions.map(sub => (
                            <div 
                                key={sub.id} 
                                onClick={() => setSelectedSubmission(sub)}
                                className="card" 
                                style={{ 
                                    marginBottom: '0', 
                                    cursor: 'pointer',
                                    border: selectedSubmission?.id === sub.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    transition: 'all 0.2s',
                                    background: selectedSubmission?.id === sub.id ? 'var(--bg-primary)' : 'var(--bg-secondary)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}</strong>
                                    <span style={{ 
                                        color: sub.status === 'Accepted' ? 'var(--success)' : 'orange'
                                    }}>
                                        {sub.status || 'Completed'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span>Lang: {sub.language}</span>
                                    {/* <span>Problem ID: {sub.problemId.substring(0,6)}...</span> */}
                                </div>
                                <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                                    <span>Time: {sub.executionTime}s</span>
                                    <span style={{ color: getAiColor(sub.aiScore) }}>
                                        AI Probability: {sub.aiScore}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Panel */}
            <div style={{ 
                flex: 1.5, 
                background: 'var(--bg-primary)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {selectedSubmission ? (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>Submission Details</h3>
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Status: </span>
                                <span style={{ color: selectedSubmission.status === 'Accepted' ? 'var(--success)' : 'orange' }}>
                                    {selectedSubmission.status}
                                </span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>AI Score: </span>
                                <span style={{ color: getAiColor(selectedSubmission.aiScore), fontWeight: 'bold' }}>
                                    {selectedSubmission.aiScore}%
                                </span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Time: </span>
                                {selectedSubmission.executionTime}s
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem', flex: 1, border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                           <Editor
                                height="100%"
                                theme="vs-dark"
                                language={selectedSubmission.language === 'c' ? 'cpp' : selectedSubmission.language}
                                value={selectedSubmission.code}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    scrollBeyondLastLine: false
                                }}
                            />
                        </div>

                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Output:</p>
                            <pre style={{ 
                                background: '#0f172a', 
                                padding: '1rem', 
                                borderRadius: '4px', 
                                fontSize: '0.9rem',
                                border: '1px solid var(--border)' 
                            }}>
                                {selectedSubmission.output || 'No output captured.'}
                            </pre>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                        Select a submission to view details
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionHistory;
