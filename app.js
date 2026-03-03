// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// ===== CORS setup =====
const allowedOrigins = [
  'http://localhost:3000',
  'https://clrsv2-q7mwo3jup-romgarofficials-projects.vercel.app',
  'https://clrsv2.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server requests
    callback(allowedOrigins.includes(origin) ? null : new Error('Not allowed by CORS'), true);
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ===== Basic routes =====
app.get('/', (req, res) => {
  res.json({
    message: 'CLRS Backend Server is running successfully!',
    version: '1.0.0'
  });
});

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
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// ===== Export for serverless =====
module.exports = app;
