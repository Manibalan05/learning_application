const { databases, users } = require('../config/appwrite');
const { Query } = require('node-appwrite');

// Helper to check admin
const verifyAdmin = async (userId) => {
    if (!userId) return false;
    try {
        const user = await users.get(userId);
        // Allow if label exists OR if it's the specific demo admin email
        if (user.email === 'admin@test.com' || user.email === 'admin@admin.com') return true;
        
        return user.labels && user.labels.includes('admin');
    } catch {
        return false;
    }
};

const getWeeklyAnalytics = async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        
        // Log to debug authentication issues
        console.log(`Weekly Stats Request - UserID: ${userId}`);
        
        if (!await verifyAdmin(userId)) {
            console.warn('Admin verification failed for:', userId);
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
                Query.greaterThan('$createdAt', sevenDaysAgo.toISOString()), // FIXED: Added $ prefix
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
            // Handle lowercase attribute from DB
            const score = sub.aiScore !== undefined ? sub.aiScore : (sub.aiscore || 0);
            totalAiScore += score;
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
                Query.greaterThan('$createdAt', thirtyDaysAgo.toISOString()), // FIXED: Added $ prefix
                Query.limit(500) // Higher limit for monthly
            ]
        );

        const submissions = response.documents;

        // 1. Unique Active Students
        const uniqueStudents = new Set(submissions.map(s => s.userId));

        // 2. Improvement & AI Trends (Grouped by Day)
        const dailyTrends = {};

        submissions.forEach(sub => {
            // Handle both system attribute $createdAt and custom createdAt if exists.
            // But usually we want the system creation time.
            const dateStr = sub.$createdAt || sub.createdAt; 
            const date = dateStr ? dateStr.split('T')[0] : new Date().toISOString().split('T')[0];

            if (!dailyTrends[date]) {
                dailyTrends[date] = { 
                    count: 0, 
                    totalExecTime: 0, 
                    totalAiScore: 0 
                };
            }
            
            const score = sub.aiScore !== undefined ? sub.aiScore : (sub.aiscore || 0);

            dailyTrends[date].count++;
            dailyTrends[date].totalExecTime += sub.executionTime || 0;
            dailyTrends[date].totalAiScore += score;
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
