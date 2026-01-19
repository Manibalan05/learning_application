import React, { useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';

const AddProblem = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        testCases: '' // User inputs JSON string or we parse simplistic format
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Submitting...');

        try {
            // Get current user ID (Admin)
            const user = await account.get();
            const userId = user.$id;

            // Prepare Request
            // Note: We expect testCases to be a JSON string like [{"input": "...", "output": "..."}]
            // Ideally we validate JSON here.
            let parsedTestCases;
            try {
                parsedTestCases = JSON.parse(formData.testCases);
            } catch (err) {
                setStatus('Error: Test Cases must be valid JSON');
                return;
            }

            const payload = {
                ...formData,
                testCases: JSON.stringify(parsedTestCases)
            };

            const response = await axios.post('http://localhost:5000/admin/add-problem', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId
                }
            });

            setStatus('Problem Added Successfully!');
            setFormData({ title: '', description: '', difficulty: 'easy', testCases: '' });

        } catch (error) {
            console.error(error);
            setStatus('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Problem</h2>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <label>Title</label>
                    <input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        placeholder="e.g. Two Sum" 
                        required 
                    />

                    <label>Description</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        placeholder="Problem description..." 
                        rows={5}
                        required 
                    />

                    <label>Difficulty</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    <label>Test Cases (JSON Format)</label>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                        Example: {'[{"input": "1 2", "output": "3"}]'}
                    </p>
                    <textarea 
                        name="testCases" 
                        value={formData.testCases} 
                        onChange={handleChange} 
                        placeholder='[{"input": "...", "output": "..."}]' 
                        rows={5}
                        required 
                    />

                    <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
                        Add Problem
                    </button>

                    {status && (
                        <p style={{ 
                            marginTop: '1rem', 
                            color: status.includes('Error') ? 'var(--danger)' : 'var(--success)' 
                        }}>
                            {status}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddProblem;
