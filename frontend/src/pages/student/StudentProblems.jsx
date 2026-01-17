import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';
import { Link } from 'react-router-dom';

const StudentProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
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
            <h2 style={{ marginBottom: '2rem' }}>Available Problems</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {problems.length === 0 ? (
                    <p>No problems found yet.</p>
                ) : (
                    problems.map(prob => (
                        <div key={prob.problemId} className="card" style={{ marginBottom: '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{prob.title}</h3>
                                    <span style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '1rem', 
                                        background: 'var(--bg-primary)',
                                        color: prob.difficulty === 'hard' ? 'var(--danger)' : prob.difficulty === 'medium' ? 'orange' : 'var(--success)',
                                        fontSize: '0.8rem',
                                        border: '1px solid var(--border)',
                                        marginRight: '1rem'
                                    }}>
                                        {prob.difficulty.toUpperCase()}
                                    </span>
                                </div>
                                
                                <Link 
                                    to={`/student/problem/${prob.problemId}`} 
                                    state={{ problem: prob }}
                                    className="btn"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Solve Challenge
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentProblems;
