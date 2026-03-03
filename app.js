// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// ===== CORS setup =====
// For serverless, allow all origins safely
app.use(cors()); // allows all origins, no credentials
// If you need cookies/auth headers, uncomment below instead:
// app.use(cors({ origin: (origin, callback) => callback(null, origin), credentials: true }));

// ===== Middleware =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ===== Temporary folder for serverless uploads =====
const uploadPath = path.join('/tmp', 'uploads', 'reports');
fs.mkdirSync(uploadPath, { recursive: true });

// ===== Basic routes =====
app.get('/', (req, res) => {
  res.json({
    message: 'CLRS Backend Server is running!',
    version: '1.0.0',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// ===== API routes =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/laboratories', require('./routes/laboratoryRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// ===== 404 handler =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

// ===== Serverless export for Vercel =====
module.exports = app;
