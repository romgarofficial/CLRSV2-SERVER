// server.js or app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

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
    // allow non-browser requests or whitelisted origins
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

// Apply CORS middleware globally
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
    message: 'CLRS Backend Server is running!',
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
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded at /api/auth');
} catch (err) {
  console.error('❌ Auth routes failed:', err.message);
}

try {
  const laboratoryRoutes = require('./routes/laboratoryRoutes');
  app.use('/api/laboratories', laboratoryRoutes);
  console.log('✅ Laboratory routes loaded at /api/laboratories');
} catch (err) {
  console.error('❌ Laboratory routes failed:', err.message);
}

try {
  const newsRoutes = require('./routes/newsRoutes');
  app.use('/api/news', newsRoutes);
  console.log('✅ News routes loaded at /api/news');
} catch (err) {
  console.error('❌ News routes failed:', err.message);
}

try {
  const reportRoutes = require('./routes/reportRoutes');
  app.use('/api/reports', reportRoutes);
  console.log('✅ Report routes loaded at /api/reports');
} catch (err) {
  console.error('❌ Report routes failed:', err.message);
}

try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded at /api/notifications');
} catch (err) {
  console.error('❌ Notification routes failed:', err.message);
}

try {
  const analyticsRoutes = require('./routes/analyticsRoutes');
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Analytics routes loaded at /api/analytics');
} catch (err) {
  console.error('❌ Analytics routes failed:', err.message);
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded at /api/users');
} catch (err) {
  console.error('❌ User routes failed:', err.message);
}

// --------------------
// ERROR HANDLING
// --------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

module.exports = app;
