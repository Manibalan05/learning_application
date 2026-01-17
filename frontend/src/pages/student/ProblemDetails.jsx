import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';

const ProblemDetails = () => {
    const { state } = useLocation();
    const { id } = useParams();
    
    // Fallback if accessed directly (Data persistence is not robust here without ID fetch, 
    // but works for the task constraints)
    const problem = state?.problem;

    if (!problem) {
        return (
            <div>
                <h2>Problem Not Found</h2>
                <p>Please go back to the problems list.</p>
                <Link to="/student/problems" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Back to Problems
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <Link to="/student/problems" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    &larr; Back to List
                </Link>
                <h1 style={{ marginTop: '1rem' }}>{problem.title}</h1>
                <div style={{ marginTop: '1rem' }}>
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        background: 'var(--bg-secondary)',
                        color: problem.difficulty === 'hard' ? 'var(--danger)' : problem.difficulty === 'medium' ? 'orange' : 'var(--success)',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border)'
                    }}>
                        {problem.difficulty.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="card">
                <h3>Description</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {problem.description}
                </p>
            </div>

            {/* Placeholder for Code Editor & Submission (Next Steps) */}
            <div className="card" style={{ opacity: 0.7 }}>
                <h3>Code Editor</h3>
                <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                    Code editor and submission will be implemented in the next step.
                </p>
                <button className="btn" disabled style={{ background: 'var(--border)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>
                    Submit Code (Coming Soon)
                </button>
            </div>
        </div>
    );
};

export default ProblemDetails;
