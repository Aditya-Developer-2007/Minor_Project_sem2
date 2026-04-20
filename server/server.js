const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require("cors");
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Robust CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
const normalizedOrigin = allowedOrigin.startsWith('http') ? allowedOrigin : `https://${allowedOrigin}`;

app.use(cors({
  origin: [normalizedOrigin, "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl || req.url}`);
  next();
});

// Test Route (Always active)
app.get('/api/test', (req, res) => res.json({ status: "alive" }));

// Route Registration (Synchronous)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));

// Database Connection (Asynchronous)
connectDB().catch(err => console.error("Database connection failed:", err));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NYAI Server running on port ${PORT}`);
  if (global.isMockDB) console.log('🚀 MEMORY MODE ACTIVE - Testing Only');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
