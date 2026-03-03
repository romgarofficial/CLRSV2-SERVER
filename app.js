// server.js / app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// --------------------
// CORS CONFIGURATION
// --------------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://clrsv2-q7mwo3jup-romgarofficials-projects.vercel.app',
  'https://clrsv2.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests (e.g., Postman) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// --------------------
// MIDDLEWARE
// --------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// --------------------
// BASIC ROUTES
// --------------------
app.get('/', (req, res) => {
  res.json({
    message: 'CLRS Backend Server is running successfully!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// --------------------
// API ROUTES
// --------------------
console.log('🔗 Loading API routes...');

// Debug middleware to log API requests
app.use('/api', (req, res, next) => {
  console.log(`🔍 API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Auth routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded and mounted at /api/auth');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// Laboratory routes
try {
  const laboratoryRoutes = require('./routes/laboratoryRoutes');
  app.use('/api/laboratories', laboratoryRoutes);
  console.log('✅ Laboratory routes loaded and mounted at /api/laboratories');
} catch (error) {
  console.error('❌ Error loading laboratory routes:', error.message);
}

// News routes
try {
  const newsRoutes = require('./routes/newsRoutes');
  app.use('/api/news', newsRoutes);
  console.log('✅ News routes loaded and mounted at /api/news');
} catch (error) {
  console.error('❌ Error loading news routes:', error.message);
}

// Report routes
try {
  const reportRoutes = require('./routes/reportRoutes');
  app.use('/api/reports', reportRoutes);
  console.log('✅ Report routes loaded and mounted at /api/reports');
} catch (error) {
  console.error('❌ Error loading report routes:', error.message);
}

// Notification routes
try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded and mounted at /api/notifications');
} catch (error) {
  console.error('❌ Error loading notification routes:', error.message);
}

// Analytics routes
try {
  const analyticsRoutes = require('./routes/analyticsRoutes');
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Analytics routes loaded and mounted at /api/analytics');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
}

// User routes
try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded and mounted at /api/users');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
}

// --------------------
// ERROR HANDLING
// --------------------

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;
