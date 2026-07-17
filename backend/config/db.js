/* ============================================================
   MongoDB Atlas Connection
   ============================================================ */
const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js 18+ DNS resolution issues on local machine with MongoDB Atlas SRV
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("========== FULL MONGODB ERROR ==========");
    console.error(error);
    console.error("========================================");
    process.exit(1);
  }
};

module.exports = connectDB;
