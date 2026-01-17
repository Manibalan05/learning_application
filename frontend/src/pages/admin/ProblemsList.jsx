import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';

const ProblemsList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                // Admin can use the student endpoint to view all problems
                const user = await account.get();
                const headers = { 'user-id': user.$id };
                const res = await axios.get('http://localhost:5000/student/problems', { headers });
                setProblems(res.data.problems);
            } catch (error) {
                console.error('Error fetching problems:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    if (loading) return <div>Loading Problems...</div>;

    return (
        <div>
            <h2>All Problems</h2>
            <div style={{ marginTop: '1rem' }}>
                {problems.length === 0 ? (
                    <p>No problems found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {problems.map(prob => (
                            <div key={prob.problemId} className="card" style={{ marginBottom: '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3>{prob.title}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {prob.description.substring(0, 100)}...
                                        </p>
                                    </div>
                                    <span style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '1rem', 
                                        background: 'var(--bg-primary)',
                                        color: prob.difficulty === 'hard' ? 'var(--danger)' : prob.difficulty === 'medium' ? 'orange' : 'var(--success)',
                                        fontSize: '0.8rem',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {prob.difficulty.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemsList;
