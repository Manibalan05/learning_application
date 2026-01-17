require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { client } = require('./config/appwrite');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route
app.get('/', (req, res) => {
  res.send('AI-Free Coding Platform Backend is Running!');
});

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Use Routes
app.use('/admin', adminRoutes);
// Mount analytics under admin path
app.use('/admin/analytics', analyticsRoutes); 
app.use('/student', studentRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Simple check to confirm env vars are loaded
  if (process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY) {
      console.log('Appwrite Client initialized successfully');
  } else {
      console.error('WARNING: Appwrite credentials missing in .env file');
  }
});
