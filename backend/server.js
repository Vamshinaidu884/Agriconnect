/* ============================================================
   AgriMatch Backend — Entry Point
   ============================================================ */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();
console.log("Mongo URI Loaded:", process.env.MONGODB_URI ? "YES" : "NO");

// Connect to MongoDB
connectDB();

const app = express();

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://agrimatch.vercel.app',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')))) {
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

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgriMatch API is running 🌾' });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ AgriMatch API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
