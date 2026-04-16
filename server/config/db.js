const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected: NYAI Cluster Active');
  } catch (error) {
    console.warn(`⚠️  Database connection failed: ${error.message}`);
    console.warn('NYAI is running in limited mode (MEMORY DB ACTIVE).');
    global.isMockDB = true;
    // We don't exit to allow the frontend to still be tested/viewed.
  }
};

module.exports = connectDB;