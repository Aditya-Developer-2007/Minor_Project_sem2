const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Environment Validation
const REQUIRED_ENV = ['GROQ_API_KEY', 'JWT_SECRET'];
REQUIRED_ENV.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ CRITICAL: ${env} is missing in .env file`);
    process.exit(1);
  }
});

const app = express();

// 1. Robust CORS configuration (Must be first to handle OPTIONS preflight)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://nyai-tau.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      // Direct match
      if (origin === allowed) return true;
      // Vercel subdomain match
      if (origin.endsWith('.vercel.app') && allowed.includes('vercel.app')) return true;
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Security Middleware
app.use(helmet());
app.use(express.json());

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/", limiter);

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
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong" 
  });
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

