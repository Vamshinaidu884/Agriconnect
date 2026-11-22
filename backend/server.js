/* ============================================================
   Agri Connect Backend — Entry Point
   ============================================================ */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  process.env.JWT_SECRET = 'agri_connect_local_dev_secret_2026';
}
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production');
}
console.log("Mongo URI Loaded:", process.env.MONGODB_URI ? "YES" : "NO");
console.log("JWT Secret Loaded:", process.env.JWT_SECRET ? "YES" : "NO");

const seedDefaultUser = async () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const email = 'siva_test@gmail.com';
    const existing = await User.findOne({ email });

    if (!existing) {
      await User.create({
        name: 'Siva Test',
        email,
        phone: '9876543210',
        password: 'password123',
        roles: ['farmer'],
        state: 'Andhra Pradesh',
        district: 'Guntur',
        village: 'Mangalagiri',
        pincode: '522503',
      });
      console.log('✅ Seeded default demo user: siva_test@gmail.com / password123');
    } else {
      console.log('✅ Demo user already exists');
    }
  } catch (error) {
    console.error('Seed user failed:', error.message);
  }
};

const app = express();

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://agrimatch.vercel.app',
  'https://agriconnect-eosin.vercel.app',
];
app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigins = (process.env.CLIENT_URL || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const allAllowedOrigins = [
        ...allowedOrigins,
        ...configuredOrigins,
      ];
      if (
        !origin ||
        allAllowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ─── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaultUser();

  app.listen(PORT, () => {
    console.log(`✅ Agri Connect API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();

module.exports = app;
