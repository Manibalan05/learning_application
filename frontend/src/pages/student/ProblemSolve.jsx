import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';

const ProblemSolve = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Problem Data
    const problem = state?.problem;
    
    // Core State
    const [code, setCode] = useState('// Write your code here...');
    const [language, setLanguage] = useState('python');
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [executionResult, setExecutionResult] = useState(null);

    // AI Detection State (Basic Logic)
    const startTimeRef = useRef(Date.now());
    const pasteCountRef = useRef(0);
    const keyPressesRef = useRef(0);

    // --- EFFECT: Verify Access & Initialize ---
    useEffect(() => {
        if (!problem) {
            navigate('/student/problems');
        }
        startTimeRef.current = Date.now();
    }, [problem, navigate]);

    const handleEditorChange = (value) => setCode(value);
    const handleKeyDown = () => keyPressesRef.current += 1;
    const handlePaste = () => {
        pasteCountRef.current += 1;
        console.warn('Paste event detected');
    };


    // --- RUN CODE HANDLER (Test Only) ---
    const handleRun = async () => {
        setIsSubmitting(true);
        setStatus('Executing...');
        setExecutionResult(null);

        try {
            const user = await account.get();
            const timeSpentMs = Date.now() - startTimeRef.current;

            const payload = {
                problemId: problem.problemId,
                language,
                code,
                pasteCount: pasteCountRef.current,
                timeSpentMs,
                totalKeyPresses: keyPressesRef.current,
                isFinalSubmission: false  // Test run only
            };

            const response = await axios.post('http://localhost:5000/student/submit', payload, {
                headers: { 'user-id': user.$id }
            });

            const result = response.data.executionResult;
            setExecutionResult(result);
            setStatus(result.passed ? 'Test Passed - Ready to Submit!' : 'Test Failed');

        } catch (error) {
            console.error('Run error:', error);
            setStatus('Error: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- FINAL SUBMISSION HANDLER ---
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setStatus('Submitting your solution...');

        try {
            const user = await account.get();

            const payload = {
                problemId: problem.problemId,
                language,
                code
            };

            const response = await axios.post('http://localhost:5000/student/submit-code', payload, {
                headers: { 'user-id': user.$id }
            });

            setStatus('✅ Code submitted successfully!');
            setTimeout(() => {
                navigate('/student/submissions');
            }, 2000);

        } catch (error) {
            console.error('Submission error:', error);
            setStatus('Error: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!problem) return null;

    const languageOptions = [
        { value: 'python', label: 'Python (3.8.1)' },
        { value: 'java', label: 'Java (OpenJDK 13)' },
        { value: 'c', label: 'C (GCC 9.2)' },
        { value: 'cpp', label: 'C++ (GCC 9.2)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
            {/* Header */}
            <div style={{ 
                marginBottom: '1rem', 
                background: 'var(--bg-secondary)', 
                padding: '1rem', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <Link to="/student/problems" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        &larr; Back
                    </Link>
                    <h2 style={{ marginTop: '0.5rem' }}>{problem.title}</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={language} 
                        onChange={(e) => {
                            setLanguage(e.target.value);
                            if (code.startsWith('// Write') || code.startsWith('class Main')) {
                                setCode(e.target.value === 'java' ? 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}' : '// Write your code here...');
                            }
                        }}
                        style={{ width: '200px', marginBottom: 0 }}
                    >
                        {languageOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    
                    <button 
                        onClick={handleRun} 
                        disabled={isSubmitting} 
                        className="btn" 
                        style={{ 
                            background: isSubmitting ? 'var(--text-secondary)' : 'var(--accent)', 
                            color: '#000',
                            minWidth: '120px'
                        }}
                    >
                        {isSubmitting ? 'Running...' : 'Run Code'}
                    </button>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting} 
                        className="btn" 
                        style={{ 
                            background: isSubmitting ? 'var(--text-secondary)' : 'var(--success)', 
                            color: '#000',
                            minWidth: '120px'
                        }}
                    >
                        Submit Solution
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden' }}>
                {/* Left Panel: Description & Results */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        flex: 1,
                        overflowY: 'auto', 
                        background: 'var(--bg-secondary)', 
                        padding: '1.5rem', 
                        borderRadius: '8px' 
                    }}>
                        <h3 style={{ marginBottom: '1rem' }}>Description</h3>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            {problem.description}
                        </p>
                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <strong>Difficulty: </strong>
                            <span style={{ 
                                color: problem.difficulty === 'hard' ? 'var(--danger)' : problem.difficulty === 'medium' ? 'orange' : 'var(--success)' 
                            }}>
                                {problem.difficulty.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Execution Results Panel */}
                    {(executionResult || status.includes('Error')) && (
                        <div style={{ 
                            background: 'var(--bg-secondary)', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            border: `1px solid ${executionResult?.passed ? 'var(--success)' : 'var(--border)'}`,
                            maxHeight: '40%',
                            overflowY: 'auto'
                        }}>
                             <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>Execution Result</h4>
                             
                             {status.includes('Error') ? (
                                 <p style={{ color: 'var(--danger)' }}>{status}</p>
                             ) : (
                                 <>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span>Status: <strong style={{ color: executionResult.passed ? 'var(--success)' : 'orange' }}>{executionResult.status}</strong></span>
                                        <span>Time: {executionResult.time}s</span>
                                    </div>

                                    {executionResult.stdout && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Output:</span>
                                            <pre style={{ 
                                                background: '#0f172a', 
                                                padding: '0.5rem', 
                                                borderRadius: '4px', 
                                                overflowX: 'auto',
                                                marginTop: '0.2rem',
                                                border: '1px solid var(--border)'
                                            }}>{executionResult.stdout}</pre>
                                        </div>
                                    )}

                                    {(executionResult.stderr || executionResult.compileOutput) && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Error:</span>
                                            <pre style={{ 
                                                background: '#2d0a0a', 
                                                padding: '0.5rem', 
                                                borderRadius: '4px', 
                                                color: '#f87171',
                                                whiteSpace: 'pre-wrap',
                                                marginTop: '0.2rem'
                                            }}>{executionResult.stderr || executionResult.compileOutput}</pre>
                                        </div>
                                    )}
                                 </>
                             )}
                        </div>
                    )}
                </div>

                {/* Right Panel: Code Editor */}
                <div 
                    style={{ flex: 2, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste} 
                >
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                        value={code}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProblemSolve;
