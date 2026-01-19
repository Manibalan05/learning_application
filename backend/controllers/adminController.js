const { databases, users } = require('../config/appwrite');
const { ID, Query } = require('node-appwrite');

const addProblem = async (req, res) => {
    try {
        // 1. Get User ID from headers (for verification) and Data from body
        const userId = req.headers['user-id']; // Expecting user ID in headers
        const { title, description, difficulty, testCases } = req.body;

        console.log('addProblem called with body:', req.body);
        console.log('testCases type:', typeof testCases, 'isArray:', Array.isArray(testCases));


        // 2. Validate Input
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Missing User ID' });
        }
        if (!title || !description || !difficulty || !testCases) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // 3. Verify User Role (Security Step)
        // Fetch user details from Appwrite to check labels
        const user = await users.get(userId);
        
        // Check if "admin" label exists
        const isAdmin = user.labels && user.labels.includes('admin');
        
        if (!isAdmin) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // 4. Create Problem in Database
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = 'problems'; // Ensure this matches your Appwrite Collection ID

        // Prepare data matching the user's schema:
        // title (string)
        // description (string)
        // difficulty (enum: easy, medium, hard) - frontend sends lowercase
        // testCases (string) - we must valid JSON string 

        
        const data = {
            title,
            description,
            difficulty, 
            testCases: testCases, // Store array/object directly
            
        };

        const newProblem = await databases.createDocument(
            databaseId, 
            collectionId, 
            ID.unique(), 
            data
        );

        // 5. Success Response
        return res.status(201).json({
            message: 'Problem added successfully',
            problem: newProblem
        });

    } catch (error) {
        console.error('Error adding problem:', error); // Log full error

        // Handle specific Appwrite errors better
        if (error.code === 404) {
             return res.status(404).json({ error: 'Resource not found (User or Collection)' });
        }
        if (error.code === 400) {
            // Likely schema mismatch
            return res.status(400).json({ error: 'Bad Request: ' + error.message });
        }

        return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
};



const getAllSubmissions = async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        
        // 1. Basic Admin Check
        const adminUser = await users.get(userId);
        if (!adminUser.labels || !adminUser.labels.includes('admin')) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = 'submissions';

        // 2. Fetch Latest Submissions
        const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [
                Query.limit(100),
                Query.orderDesc('createdAt')
            ]
        );

        // 3. Enhance with User Info (Name/Email)
        // We collect unique User IDs to minimize API calls
        const uniqueUserIds = [...new Set(response.documents.map(doc => doc.userId))];
        const userMap = {};

        await Promise.all(uniqueUserIds.map(async (uid) => {
            try {
                const u = await users.get(uid);
                userMap[uid] = { name: u.name, email: u.email };
            } catch (e) {
                userMap[uid] = { name: 'Unknown', email: 'N/A' };
            }
        }));

        // 4. Enhance with Problem Title (Optional, but good for UI)
        // For now, we will rely on frontend having problem list or just ID
        // But let's try to fetch problems if we can, or just send raw data.
        // User requested "Problem title".
        // Let's fetch all problems (assuming < 100 for now) to map titles.
        let problemMap = {};
        try {
            const probRes = await databases.listDocuments(databaseId, 'problems', [Query.limit(100)]);
            probRes.documents.forEach(p => {
                problemMap[p.$id] = p.title;
            });
        } catch (e) {
            console.warn('Could not fetch problems for mapping');
        }

        const submissions = response.documents.map(doc => ({
            id: doc.$id,
            userId: doc.userId,
            userName: userMap[doc.userId]?.name || 'Student',
            userEmail: userMap[doc.userId]?.email || '',
            problemId: doc.problemId,
            problemTitle: problemMap[doc.problemId] || 'Unknown Problem',
            language: doc.language,
            status: doc.status,
            executionTime: doc.executionTime,
            aiScore: doc.aiScore,
            createdAt: doc.createdAt,
            code: doc.code,
            output: doc.output
        }));

        res.json({ submissions });

    } catch (error) {
        console.error('Get All Submissions Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { addProblem, getAllSubmissions };
