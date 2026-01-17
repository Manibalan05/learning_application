const { databases, users } = require('../config/appwrite');
const { Query } = require('node-appwrite');

// Helper to check admin
const verifyAdmin = async (userId) => {
    if (!userId) return false;
    try {
        const user = await users.get(userId);
        return user.labels && user.labels.includes('admin');
    } catch {
        return false;
    }
};

const getWeeklyAnalytics = async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!await verifyAdmin(userId)) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch submissions from last 7 days
        // Note: Production apps should handle pagination for large datasets
        const response = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            'submissions',
            [
                Query.greaterThan('createdAt', sevenDaysAgo.toISOString()),
                Query.limit(100) // Limit to 100 recent submissions for demo
            ]
        );

        const submissions = response.documents;
        
        // 1. Problems Solved per Student
        const userStats = {};
        const languageStats = {};
        let totalExecTime = 0;
        let totalAiScore = 0;
        let solvedCount = 0;

        submissions.forEach(sub => {
            // Count per user
            if (!userStats[sub.userId]) {
                userStats[sub.userId] = { solved: 0, submissions: 0 };
            }
            userStats[sub.userId].submissions++;
            
            // Check if accepted (Assuming 'Accepted' is the success status string)
            if (sub.status === 'Accepted') {
                userStats[sub.userId].solved++;
                solvedCount++;
            }

            // Language Stats
            languageStats[sub.language] = (languageStats[sub.language] || 0) + 1;

            // Averages
            totalExecTime += sub.executionTime || 0;
            totalAiScore += sub.aiScore || 0;
        });

        const totalSubmissions = submissions.length;
        
        const analytics = {
            totalSubmissions,
            totalSolved: solvedCount,
            avgExecutionTime: totalSubmissions > 0 ? (totalExecTime / totalSubmissions).toFixed(4) : 0,
            avgAiScore: totalSubmissions > 0 ? (totalAiScore / totalSubmissions).toFixed(2) : 0,
            languageDistribution: languageStats,
            studentPerformance: userStats
        };

        return res.status(200).json({ range: 'Weekly', ...analytics });

    } catch (error) {
        console.error('Weekly analytics error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getMonthlyAnalytics = async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!await verifyAdmin(userId)) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const response = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            'submissions',
            [
                Query.greaterThan('createdAt', thirtyDaysAgo.toISOString()),
                Query.limit(500) // Higher limit for monthly
            ]
        );

        const submissions = response.documents;

        // 1. Unique Active Students
        const uniqueStudents = new Set(submissions.map(s => s.userId));

        // 2. Improvement & AI Trends (Grouped by Day)
        const dailyTrends = {};

        submissions.forEach(sub => {
            const date = sub.createdAt.split('T')[0]; // YYYY-MM-DD
            if (!dailyTrends[date]) {
                dailyTrends[date] = { 
                    count: 0, 
                    totalExecTime: 0, 
                    totalAiScore: 0 
                };
            }
            dailyTrends[date].count++;
            dailyTrends[date].totalExecTime += sub.executionTime || 0;
            dailyTrends[date].totalAiScore += sub.aiScore || 0;
        });

        // Format trends for frontend graph
        const trends = Object.keys(dailyTrends).sort().map(date => ({
            date,
            avgExecutionTime: (dailyTrends[date].totalExecTime / dailyTrends[date].count).toFixed(4),
            avgAiScore: (dailyTrends[date].totalAiScore / dailyTrends[date].count).toFixed(2),
            submissions: dailyTrends[date].count
        }));

        return res.status(200).json({
            range: 'Monthly',
            totalSubmissions: submissions.length,
            activeStudents: uniqueStudents.size,
            trends
        });

    } catch (error) {
        console.error('Monthly analytics error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getWeeklyAnalytics, getMonthlyAnalytics };
