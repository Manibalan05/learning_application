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
// Start Server
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const io = new Server(server, {
    cors: {
        origin: "*", // Allow frontend to connect
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let process = null;

    socket.on('run-interactive', ({ code, language }) => {
        if (process) {
            process.kill();
        }

        // Create a temp file
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        
        const timestamp = Date.now();
        const ext = language === 'python' ? '.py' : (language === 'cpp' ? '.cpp' : '.txt');
        const filename = path.join(tempDir, `script_${timestamp}${ext}`);
        
        fs.writeFileSync(filename, code);

        // Interactive Execution
        if (language === 'python') {
            // Unbuffered python output using -u
            process = spawn('python', ['-u', filename]);
        } else {
             // Basic support for others can be added
             socket.emit('output', 'Interactive mode currently supports Python only.\n');
             return;
        }

        process.stdout.on('data', (data) => {
            socket.emit('output', data.toString());
        });

        process.stderr.on('data', (data) => {
            socket.emit('output', data.toString()); // Treat stderr as output for terminal
        });

        process.on('close', (code) => {
             socket.emit('output', `\n[Program finished with exit code ${code}]`);
             process = null;
             // Cleanup
             try { fs.unlinkSync(filename); } catch(e){}
        });

        process.on('error', (err) => {
             socket.emit('output', `\nError: ${err.message}`);
        });
    });

    socket.on('input', (inputData) => {
        if (process && process.stdin) {
            try {
                process.stdin.write(inputData + '\n');
            } catch (err) {
                 console.error('Input write error:', err);
            }
        }
    });

    socket.on('disconnect', () => {
        if (process) process.kill();
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Simple check to confirm env vars are loaded
  if (process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY) {
      console.log('Appwrite Client initialized successfully');
  } else {
      console.error('WARNING: Appwrite credentials missing in .env file');
  }
});
