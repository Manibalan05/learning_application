import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';

import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

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
    const [isSubmitted, setIsSubmitted] = useState(false); // New: Track if accepted/submitted
    const [executionResult, setExecutionResult] = useState(null);
    const [aiResult, setAiResult] = useState(null); // New: Store AI score
    const [terminalOutput, setTerminalOutput] = useState([]); // New: Terminal Lines
    const [isInteractive, setIsInteractive] = useState(false); // Mode
    const terminalEndRef = useRef(null);

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

    // --- EFFECT: Socket Listeners ---
    useEffect(() => {
        socket.on('output', (data) => {
            setTerminalOutput(prev => [...prev, data]);
        });
        return () => {
            socket.off('output');
        };
    }, []);

    // Scroll to bottom of terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalOutput]);

    const handleEditorChange = (value) => setCode(value);



    // --- RUN CODE HANDLER (Test Only) ---
    // --- RUN CODE HANDLER (Interactive) ---
    const handleRun = () => {
        if (isSubmitted) return;
        
        setIsSubmitting(true);
        setStatus('Interactive Terminal Started');
        setTerminalOutput([]); // Clear previous run
        setIsInteractive(true);
        
        // Emit run event
        socket.emit('run-interactive', { code, language });
        
        // We don't verify score in interactive mode
        setAiResult(null);
        setExecutionResult(null);
        
        // Reset submitting state after a delay or let it stay 'Running'
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    const handleTerminalInput = (e) => {
        if (e.key === 'Enter') {
            const input = e.target.value;
            socket.emit('input', input);
            setTerminalOutput(prev => [...prev, input + '\n']); // Echo input
            e.target.value = '';
        }
    };

    // --- FINAL SUBMISSION HANDLER ---
    const handleSubmit = async () => {
        if (isSubmitted) return;

        setIsSubmitting(true);
        setStatus('Submitting logic & analyzing...');
        setExecutionResult(null);
        setAiResult(null);

        try {
            const user = await account.get();
            const timeSpentMs = Date.now() - startTimeRef.current;

            // Use 'submit' endpoint (maps to submitProblem) to get execution + AI results for final save
            const payload = {
                problemId: problem.problemId,
                language,
                code,
                // userInput: customInput, // Removed: Not needed for final submission (uses DB tests)
                pasteCount: pasteCountRef.current,
                timeSpentMs,
                totalKeyPresses: keyPressesRef.current,
                isFinalSubmission: true // IMPORTANT: Triggers save to DB
            };

            const response = await axios.post('http://localhost:5000/student/submit', payload, {
                headers: { 'user-id': user.$id }
            });

            const data = response.data;
            setExecutionResult(data.executionResult);
            setAiResult(data.aiAnalysis); // Capture AI score
            
            // Success state
            setStatus('Submitted Successfully!');
            setIsSubmitted(true);

        } catch (error) {
            console.error('Submission error:', error);
            const msg = error.response?.data?.message || error.response?.data?.error || error.message;
            const details = error.response?.data?.details ? ` (${error.response.data.details})` : '';
            setStatus('Error: ' + msg + details);
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

    const getAiBadgeColor = (score) => {
        if (score < 30) return 'var(--success)'; // Green
        if (score < 70) return 'orange';         // Yellow
        return 'var(--danger)';                  // Red
    };

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
                            if (isSubmitted) return;
                            setLanguage(e.target.value);
                            if (code.startsWith('// Write') || code.startsWith('class Main')) {
                                setCode(e.target.value === 'java' ? 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}' : '// Write your code here...');
                            }
                        }}
                        disabled={isSubmitted}
                        style={{ width: '200px', marginBottom: 0, opacity: isSubmitted ? 0.5 : 1 }}
                    >
                        {languageOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    
                    <button 
                        onClick={handleRun} 
                        disabled={isSubmitting || isSubmitted} 
                        className="btn" 
                        style={{ 
                            background: 'var(--accent)', 
                            color: '#000',
                            minWidth: '120px',
                            opacity: (isSubmitting || isSubmitted) ? 0.5 : 1,
                            cursor: (isSubmitting || isSubmitted) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting && !isSubmitted ? '...' : 'Run Code'}
                    </button>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || isSubmitted} 
                        className="btn" 
                        style={{ 
                            background: isSubmitted ? 'var(--success)' : (isSubmitting ? 'var(--text-secondary)' : '#2563eb'), 
                            color: 'white',
                            minWidth: '140px',
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: (isSubmitting || isSubmitted) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : (isSubmitted ? 'Submitted' : 'Submit Solution')}
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
                    {(executionResult || status.includes('Error') || isSubmitted) && (
                        <div style={{ 
                            background: 'var(--bg-secondary)', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            border: `1px solid ${executionResult?.passed ? 'var(--success)' : (status.includes('Error') ? 'var(--danger)' : 'var(--border)')}`,
                            maxHeight: '40%',
                            overflowY: 'auto'
                        }}>
                             <h4 style={{ marginBottom: '0.5rem', color: executionResult?.passed ? 'var(--success)' : 'var(--accent)' }}>
                                 {isSubmitted ? 'Final Submission Result' : 'Execution Result'}
                             </h4>
                             
                             {status.includes('Error') ? (
                                 <p style={{ color: 'var(--danger)' }}>{status}</p>
                             ) : (
                                 <>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                                        {executionResult && (
                                            <>
                                                <span>Status: <strong style={{ color: executionResult.passed ? 'var(--success)' : 'orange' }}>{executionResult.status}</strong></span>
                                                <span>Time: {executionResult.time}s</span>
                                            </>
                                        )}
                                        {aiResult && (
                                            <span style={{ 
                                                background: getAiBadgeColor(aiResult.score), 
                                                color: '#000', 
                                                padding: '0.1rem 0.4rem', 
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem'
                                            }}>
                                                AI Probability: {aiResult.score}%
                                            </span>
                                        )}
                                    </div>

                                    {executionResult && executionResult.stdout && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Output:</span>
                                            <pre style={{ 
                                                background: '#0f172a', 
                                                padding: '0.5rem', 
                                                borderRadius: '4px', 
                                                overflowX: 'auto',
                                                marginTop: '0.2rem',
                                                border: '1px solid var(--border)',
                                                color: '#eee'
                                            }}>{executionResult.stdout}</pre>
                                        </div>
                                    )}

                                    {executionResult && (executionResult.stderr || executionResult.compileOutput) && (
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

                {/* Right Panel: Code Editor & Input */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div 
                        style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '300px' }}
                    >
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={(editor) => {
                            editor.onDidPaste(() => {
                                pasteCountRef.current += 1;
                                console.log('Paste detected via Monaco');
                            });
                            editor.onKeyDown(() => {
                                keyPressesRef.current += 1;
                            });
                        }}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Custom Input (Right Panel) */}
                {/* Interactive Terminal (Right Panel) */}
                <div style={{ 
                    height: '250px', 
                    background: '#0f172a', 
                    borderRadius: '8px', 
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '0.5rem',
                        color: '#e2e8f0',
                        whiteSpace: 'pre-wrap'
                    }}>
                        <div style={{color: '#64748b', marginBottom: '0.5rem'}}>
                            --- Interactive Terminal (Python Supported) ---
                        </div>
                        {terminalOutput.map((line, i) => (
                            <span key={i}>{line}</span>
                        ))}
                        <div ref={terminalEndRef} />
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        borderTop: '1px solid #334155',
                        paddingTop: '0.5rem'
                    }}>
                        <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>&gt;&gt;&gt;</span>
                        <input
                            type="text"
                            onKeyDown={handleTerminalInput}
                            placeholder="Type input here..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                outline: 'none',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default ProblemSolve;
