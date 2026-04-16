const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const cors = require("cors");
const app = express();

app.use(cors({
  origin: "https://your-frontend.vercel.app",
  credentials: true
}));

const connectDB = require('./config/db');

(async () => {
  await connectDB();
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Simple Request Logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/chats', require('./routes/chatRoutes'));

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

  // Keep-alive loop to prevent process exit in some environments
  setInterval(() => {}, 1000);
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
