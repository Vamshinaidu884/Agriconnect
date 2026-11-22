/* ============================================================
   MongoDB Connection
   Falls back to an in-memory MongoDB instance for local dev so
   the backend can start without a cloud Atlas connection.
   ============================================================ */
const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Fix for Node.js 18+ DNS resolution issues on local machine with MongoDB Atlas SRV
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is required in production');
      }
      const dbPath = path.join(__dirname, '..', '.data', 'mongodb');
      fs.mkdirSync(dbPath, { recursive: true });
      const memoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
      mongoUri = memoryServer.getUri();
      process.env.MONGODB_URI = mongoUri;
      console.log(`✅ Using persistent local MongoDB for development (${dbPath})`);
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error(
      `MongoDB connection failed (${error.name || 'Error'}). Check MONGODB_URI and Atlas network access.`
    );
    process.exit(1);
  }
};

module.exports = connectDB;
