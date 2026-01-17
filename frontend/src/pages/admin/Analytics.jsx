import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { account } from '../../lib/appwrite';

const Analytics = () => {
    const [weeklyData, setWeeklyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await account.get();
                const userId = user.$id;
                const headers = { 'user-id': userId };

                const [weeklyRes, monthlyRes] = await Promise.all([
                    axios.get('http://localhost:5000/admin/analytics/weekly', { headers }),
                    axios.get('http://localhost:5000/admin/analytics/monthly', { headers })
                ]);

                setWeeklyData(weeklyRes.data);
                setMonthlyData(monthlyRes.data);
            } catch (error) {
                console.error('Error fetching analytics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading User Data...</div>;

    const StatCard = ({ title, value }) => (
        <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            flex: 1
        }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>{value}</h3>
        </div>
    );

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Platform Analytics</h2>

            {/* Weekly Section */}
            <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Weekly Overview</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <StatCard title="Total Submissions" value={weeklyData?.totalSubmissions || 0} />
                    <StatCard title="Problems Solved" value={weeklyData?.totalSolved || 0} />
                    <StatCard title="Avg AI Score" value={`${weeklyData?.avgAiScore || 0}%`} />
                </div>
            </section>

            {/* Monthly Section */}
            <section>
                <h3 style={{ marginBottom: '1rem' }}>Monthly Overview</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <StatCard title="Total Submissions" value={monthlyData?.totalSubmissions || 0} />
                    <StatCard title="Active Students" value={monthlyData?.activeStudents || 0} />
                </div>
                
                <div className="card">
                    <h4>Daily Trends (Last 30 Days)</h4>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Submissions</th>
                                    <th>Avg Exec Time</th>
                                    <th>Avg AI Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData?.trends?.map((day) => (
                                    <tr key={day.date}>
                                        <td>{day.date}</td>
                                        <td>{day.submissions}</td>
                                        <td>{day.avgExecutionTime}s</td>
                                        <td>
                                            <span style={{ 
                                                color: parseFloat(day.avgAiScore) > 50 ? 'var(--danger)' : 'var(--success)' 
                                            }}>
                                                {day.avgAiScore}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Analytics;
